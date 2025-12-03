import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface PushSubscription {
  user_id: string;
  endpoint: string;
  p256dh: string;
  auth: string;
}

interface DueItem {
  type: 'examination' | 'vaccination';
  name: string;
  due_date: string;
  child_name?: string;
}

async function sendPushNotification(
  subscription: PushSubscription,
  payload: object,
  vapidPublicKey: string,
  vapidPrivateKey: string
): Promise<boolean> {
  try {
    // Import web-push library for Deno
    const webPush = await import("https://esm.sh/web-push@3.6.7");
    
    webPush.setVapidDetails(
      'mailto:noreply@vitacare.app',
      vapidPublicKey,
      vapidPrivateKey
    );

    const pushSubscription = {
      endpoint: subscription.endpoint,
      keys: {
        p256dh: subscription.p256dh,
        auth: subscription.auth,
      },
    };

    await webPush.sendNotification(pushSubscription, JSON.stringify(payload));
    console.log(`Push sent to ${subscription.endpoint.substring(0, 50)}...`);
    return true;
  } catch (error) {
    console.error('Error sending push:', error);
    return false;
  }
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const vapidPublicKey = Deno.env.get('VAPID_PUBLIC_KEY')!;
    const vapidPrivateKey = Deno.env.get('VAPID_PRIVATE_KEY')!;

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get all users with push subscriptions
    const { data: subscriptions, error: subError } = await supabase
      .from('push_subscriptions')
      .select('*');

    if (subError) {
      throw subError;
    }

    if (!subscriptions || subscriptions.length === 0) {
      console.log('No push subscriptions found');
      return new Response(
        JSON.stringify({ message: 'No subscriptions to notify' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Group subscriptions by user
    const userSubscriptions = new Map<string, PushSubscription[]>();
    for (const sub of subscriptions) {
      const existing = userSubscriptions.get(sub.user_id) || [];
      existing.push(sub);
      userSubscriptions.set(sub.user_id, existing);
    }

    const today = new Date();
    const thirtyDaysFromNow = new Date(today);
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

    let notificationsSent = 0;

    // Process each user
    for (const [userId, subs] of userSubscriptions) {
      const dueItems: DueItem[] = [];

      // Get due U-examinations
      const { data: examinations } = await supabase
        .from('u_examinations')
        .select(`
          examination_type,
          due_date,
          actual_date,
          child_id,
          children:child_id (first_name)
        `)
        .eq('user_id', userId)
        .is('actual_date', null)
        .lte('due_date', thirtyDaysFromNow.toISOString().split('T')[0]);

      if (examinations) {
        for (const exam of examinations) {
          dueItems.push({
            type: 'examination',
            name: exam.examination_type,
            due_date: exam.due_date,
            child_name: (exam as any).children?.first_name,
          });
        }
      }

      // Get due vaccinations
      const { data: vaccinations } = await supabase
        .from('vaccinations')
        .select('vaccine_name, next_due_date')
        .eq('user_id', userId)
        .not('next_due_date', 'is', null)
        .lte('next_due_date', thirtyDaysFromNow.toISOString().split('T')[0]);

      if (vaccinations) {
        for (const vax of vaccinations) {
          if (vax.next_due_date) {
            dueItems.push({
              type: 'vaccination',
              name: vax.vaccine_name,
              due_date: vax.next_due_date,
            });
          }
        }
      }

      // Send notification if there are due items
      if (dueItems.length > 0) {
        const overdueCount = dueItems.filter(
          item => new Date(item.due_date) < today
        ).length;
        
        const urgentCount = dueItems.filter(item => {
          const dueDate = new Date(item.due_date);
          const daysUntilDue = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
          return daysUntilDue >= 0 && daysUntilDue <= 7;
        }).length;

        let title = 'VitaCare+ Erinnerung';
        let body = '';

        if (overdueCount > 0) {
          title = '⚠️ Überfällige Termine';
          body = `Sie haben ${overdueCount} überfällige${urgentCount > 0 ? ` und ${urgentCount} dringende` : ''} Termine.`;
        } else if (urgentCount > 0) {
          title = '📅 Dringende Termine';
          body = `Sie haben ${urgentCount} Termine in den nächsten 7 Tagen.`;
        } else {
          title = '📋 Anstehende Termine';
          body = `Sie haben ${dueItems.length} Termine in den nächsten 30 Tagen.`;
        }

        const payload = {
          title,
          body,
          url: '/dashboard',
        };

        // Send to all user's subscriptions
        for (const sub of subs) {
          const success = await sendPushNotification(sub, payload, vapidPublicKey, vapidPrivateKey);
          if (success) notificationsSent++;
        }
      }
    }

    console.log(`Sent ${notificationsSent} push notifications`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        notificationsSent,
        subscriptionsProcessed: subscriptions.length 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: unknown) {
    console.error('Error in send-push-notifications:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
