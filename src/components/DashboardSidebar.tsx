import { User, Baby, Filter } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import type { Database } from "@/integrations/supabase/types";

type Child = Database['public']['Tables']['children']['Row'];

interface DashboardSidebarProps {
  children: Child[];
  selectedFilter: string;
  onFilterChange: (filter: string) => void;
  userName?: string;
}

export const DashboardSidebar = ({
  children,
  selectedFilter,
  onFilterChange,
  userName = "Mich",
}: DashboardSidebarProps) => {
  return (
    <Card className="shadow-soft border-border/50">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm flex items-center gap-2">
          <Filter className="w-4 h-4 text-primary" />
          Filtern nach
        </CardTitle>
      </CardHeader>
      <CardContent>
        <RadioGroup
          value={selectedFilter}
          onValueChange={onFilterChange}
          className="space-y-2"
        >
          {/* All option */}
          <div 
            className={`flex items-center space-x-3 p-2 rounded-lg transition-all duration-300 ${
              selectedFilter === "all" 
                ? "bg-emerald-100 dark:bg-emerald-900/30" 
                : selectedFilter !== "all" && selectedFilter !== "self" 
                  ? "opacity-40" 
                  : "hover:bg-muted/50"
            }`}
          >
            <RadioGroupItem value="all" id="filter-all" />
            <Label 
              htmlFor="filter-all" 
              className="flex items-center gap-2 cursor-pointer flex-1"
            >
              <span className="text-sm font-medium">Alle anzeigen</span>
            </Label>
          </div>

          {/* User option */}
          <div 
            className={`flex items-center space-x-3 p-2 rounded-lg transition-all duration-300 ${
              selectedFilter === "self" 
                ? "bg-emerald-100 dark:bg-emerald-900/30" 
                : selectedFilter !== "all" && selectedFilter !== "self" 
                  ? "opacity-40" 
                  : "hover:bg-muted/50"
            }`}
          >
            <RadioGroupItem value="self" id="filter-self" />
            <Label 
              htmlFor="filter-self" 
              className="flex items-center gap-2 cursor-pointer flex-1"
            >
              <User className="w-4 h-4 text-primary" />
              <span className="text-sm">{userName}</span>
            </Label>
          </div>

          {/* Children options */}
          {children.map((child) => (
            <div 
              key={child.id} 
              className={`flex items-center space-x-3 p-2 rounded-lg transition-all duration-300 ${
                selectedFilter === child.id 
                  ? "bg-emerald-100 dark:bg-emerald-900/30" 
                  : selectedFilter !== "all" 
                    ? "opacity-40" 
                    : "hover:bg-muted/50"
              }`}
            >
              <RadioGroupItem value={child.id} id={`filter-${child.id}`} />
              <Label 
                htmlFor={`filter-${child.id}`} 
                className="flex items-center gap-2 cursor-pointer flex-1"
              >
                <Baby className="w-4 h-4 text-accent" />
                <span className="text-sm">{child.first_name} {child.last_name}</span>
              </Label>
            </div>
          ))}
        </RadioGroup>
      </CardContent>
    </Card>
  );
};
