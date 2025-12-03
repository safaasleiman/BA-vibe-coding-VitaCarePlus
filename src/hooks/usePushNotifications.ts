import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

const VAPID_PUBLIC_KEY = 'BEgPkaNZ2Z7vcjALzBecadzOGnUELE4_KVlhjvOlb0JOOQK-optxWAWb2kRJVgltW3IytPIdLQWN3sKGzWCy3Zs';

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export function usePushNotifications() {
  const [isSupported, setIsSupported] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const supported = 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window;
    setIsSupported(supported);
    
    if (supported) {
      setPermission(Notification.permission);
      checkExistingSubscription();
    }
  }, []);

  const checkExistingSubscription = async () => {
    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();
      setIsSubscribed(!!subscription);
    } catch (error) {
      console.error('Error checking subscription:', error);
    }
  };

  const registerServiceWorker = async (): Promise<ServiceWorkerRegistration> => {
    const registration = await navigator.serviceWorker.register('/sw.js');
    await navigator.serviceWorker.ready;
    return registration;
  };

  const subscribe = useCallback(async () => {
    if (!isSupported) {
      toast({
        title: 'Nicht unterstützt',
        description: 'Push-Benachrichtigungen werden von Ihrem Browser nicht unterstützt.',
        variant: 'destructive',
      });
      return false;
    }

    setLoading(true);

    try {
      // Request permission
      const permissionResult = await Notification.requestPermission();
      setPermission(permissionResult);

      if (permissionResult !== 'granted') {
        toast({
          title: 'Berechtigung verweigert',
          description: 'Bitte erlauben Sie Benachrichtigungen in Ihren Browsereinstellungen.',
          variant: 'destructive',
        });
        return false;
      }

      // Register service worker
      const registration = await registerServiceWorker();

      // Subscribe to push
      const applicationServerKey = urlBase64ToUint8Array(VAPID_PUBLIC_KEY);
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: applicationServerKey.buffer as ArrayBuffer,
      });

      // Get subscription details
      const subscriptionJson = subscription.toJSON();
      const { endpoint, keys } = subscriptionJson;

      if (!endpoint || !keys?.p256dh || !keys?.auth) {
        throw new Error('Invalid subscription data');
      }

      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      // Save to database
      const { error } = await supabase.from('push_subscriptions').upsert({
        user_id: user.id,
        endpoint,
        p256dh: keys.p256dh,
        auth: keys.auth,
      }, {
        onConflict: 'user_id,endpoint',
      });

      if (error) throw error;

      setIsSubscribed(true);
      toast({
        title: 'Push-Benachrichtigungen aktiviert',
        description: 'Sie werden über fällige Termine benachrichtigt.',
      });

      return true;
    } catch (error: any) {
      console.error('Error subscribing:', error);
      toast({
        title: 'Fehler',
        description: error.message || 'Konnte Push-Benachrichtigungen nicht aktivieren.',
        variant: 'destructive',
      });
      return false;
    } finally {
      setLoading(false);
    }
  }, [isSupported, toast]);

  const unsubscribe = useCallback(async () => {
    setLoading(true);

    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();

      if (subscription) {
        await subscription.unsubscribe();

        // Remove from database
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          await supabase
            .from('push_subscriptions')
            .delete()
            .eq('user_id', user.id)
            .eq('endpoint', subscription.endpoint);
        }
      }

      setIsSubscribed(false);
      toast({
        title: 'Push-Benachrichtigungen deaktiviert',
        description: 'Sie erhalten keine Push-Benachrichtigungen mehr.',
      });

      return true;
    } catch (error: any) {
      console.error('Error unsubscribing:', error);
      toast({
        title: 'Fehler',
        description: error.message || 'Konnte Push-Benachrichtigungen nicht deaktivieren.',
        variant: 'destructive',
      });
      return false;
    } finally {
      setLoading(false);
    }
  }, [toast]);

  return {
    isSupported,
    isSubscribed,
    permission,
    loading,
    subscribe,
    unsubscribe,
  };
}
