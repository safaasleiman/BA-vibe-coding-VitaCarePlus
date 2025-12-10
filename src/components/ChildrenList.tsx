import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { format, differenceInYears, differenceInMonths } from "date-fns";
import { de } from "date-fns/locale";
import { Baby, Trash2, Pencil } from "lucide-react";
import { toast } from "sonner";
import { EditChildDialog } from "./EditChildDialog";

interface Child {
  id: string;
  first_name: string;
  last_name: string;
  date_of_birth: string;
}

interface ChildrenListProps {
  onChildSelect: (childId: string) => void;
  selectedChildId?: string;
  refreshTrigger: number;
  highlightedChildId?: string; // The child to highlight based on filter
}

export function ChildrenList({ onChildSelect, selectedChildId, refreshTrigger, highlightedChildId }: ChildrenListProps) {
  const [children, setChildren] = useState<Child[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingChild, setEditingChild] = useState<Child | null>(null);

  const fetchChildren = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("children")
        .select("*")
        .eq("user_id", user.id)
        .order("date_of_birth", { ascending: false });

      if (error) throw error;
      setChildren(data || []);
      
      // Auto-select first child if none selected
      if (data && data.length > 0 && !selectedChildId) {
        onChildSelect(data[0].id);
      }
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchChildren();
  }, [refreshTrigger]);

  const handleDelete = async (childId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (!confirm("Möchten Sie dieses Kind wirklich löschen? Alle U-Untersuchungen werden ebenfalls gelöscht.")) {
      return;
    }

    try {
      const { error } = await supabase
        .from("children")
        .delete()
        .eq("id", childId);

      if (error) throw error;
      
      toast.success("Kind gelöscht");
      fetchChildren();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const getAge = (dateOfBirth: string) => {
    const birthDate = new Date(dateOfBirth);
    const years = differenceInYears(new Date(), birthDate);
    const months = differenceInMonths(new Date(), birthDate) % 12;
    
    if (years === 0) {
      return `${months} ${months === 1 ? 'Monat' : 'Monate'}`;
    }
    if (months === 0) {
      return `${years} ${years === 1 ? 'Jahr' : 'Jahre'}`;
    }
    return `${years} ${years === 1 ? 'Jahr' : 'Jahre'}, ${months} ${months === 1 ? 'Monat' : 'Monate'}`;
  };

  if (loading) {
    return <div className="text-muted-foreground">Lädt...</div>;
  }

  if (children.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center text-muted-foreground">
            <Baby className="mx-auto h-12 w-12 mb-2 opacity-50" />
            <p>Noch keine Kinder angelegt</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <div className="space-y-3">
        {children.map((child) => {
          const isHighlighted = !highlightedChildId || highlightedChildId === "all" || highlightedChildId === child.id;
          const isActiveHighlight = highlightedChildId && highlightedChildId !== "all" && highlightedChildId !== "self" && highlightedChildId === child.id;
          
          return (
            <Card
              key={child.id}
              className={cn(
                "cursor-pointer transition-all duration-300",
                isActiveHighlight 
                  ? "bg-emerald-50 dark:bg-emerald-900/20 ring-2 ring-emerald-300 dark:ring-emerald-700 shadow-md" 
                  : selectedChildId === child.id 
                    ? "ring-2 ring-primary hover:shadow-md"
                    : "hover:shadow-md",
                !isHighlighted && "opacity-40"
              )}
              onClick={() => onChildSelect(child.id)}
            >
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-lg">
                    {child.first_name} {child.last_name}
                  </CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">
                    {format(new Date(child.date_of_birth), "PPP", { locale: de })}
                  </p>
                  <p className="text-sm font-medium text-primary mt-1">
                    {getAge(child.date_of_birth)} alt
                  </p>
                </div>
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={(e) => {
                      e.stopPropagation();
                      setEditingChild(child);
                    }}
                    className="hover:text-primary"
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={(e) => handleDelete(child.id, e)}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
          </Card>
          );
        })}
      </div>
      
      {editingChild && (
        <EditChildDialog
          child={editingChild}
          open={!!editingChild}
          onOpenChange={(open) => !open && setEditingChild(null)}
          onChildUpdated={fetchChildren}
        />
      )}
    </>
  );
}

function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(" ");
}
