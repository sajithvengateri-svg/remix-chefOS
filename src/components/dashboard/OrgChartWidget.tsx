import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useOrg } from "@/contexts/OrgContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Crown, ChefHat, Shield, MapPin, GitBranch } from "lucide-react";

const OrgChartWidget = () => {
  const { currentOrg, venues } = useOrg();

  const { data: members } = useQuery({
    queryKey: ["org-chart-members", currentOrg?.id],
    enabled: !!currentOrg?.id,
    queryFn: async () => {
      const { data: memberships } = await supabase
        .from("org_memberships")
        .select("*")
        .eq("org_id", currentOrg!.id)
        .eq("is_active", true);

      if (!memberships?.length) return [];

      const userIds = memberships.map(m => m.user_id);
      const { data: profiles } = await supabase
        .from("profiles")
        .select("user_id, full_name, position, avatar_url")
        .in("user_id", userIds);

      return memberships.map(m => ({
        ...m,
        profile: profiles?.find(p => p.user_id === m.user_id),
      }));
    },
  });

  const roleIcon = (role: string) => {
    switch (role) {
      case "owner": return <Crown className="w-3.5 h-3.5 text-amber-500" />;
      case "head_chef": return <ChefHat className="w-3.5 h-3.5 text-primary" />;
      default: return <Shield className="w-3.5 h-3.5 text-muted-foreground" />;
    }
  };

  const roleLabel = (role: string) => {
    switch (role) {
      case "owner": return "Owner";
      case "head_chef": return "Head Chef";
      case "line_chef": return "Chef";
      default: return role;
    }
  };

  const rolePriority: Record<string, number> = { owner: 0, head_chef: 1, line_chef: 2 };
  const sorted = [...(members || [])].sort(
    (a, b) => (rolePriority[a.role] ?? 3) - (rolePriority[b.role] ?? 3)
  );

  const owners = sorted.filter(m => m.role === "owner");
  const headChefs = sorted.filter(m => m.role === "head_chef");
  const chefs = sorted.filter(m => m.role === "line_chef");

  if (!members?.length) return null;

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <GitBranch className="w-5 h-5" />
          Organisation Chart
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Owner tier */}
          {owners.length > 0 && (
            <div className="text-center">
              {owners.map(m => (
                <div key={m.id} className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border-2 border-amber-500/30 bg-amber-500/5">
                  <Crown className="w-4 h-4 text-amber-500" />
                  <span className="font-semibold text-sm">{m.profile?.full_name || "Owner"}</span>
                </div>
              ))}
              {(headChefs.length > 0 || chefs.length > 0) && (
                <div className="w-px h-6 bg-border mx-auto" />
              )}
            </div>
          )}

          {/* Head chefs tier */}
          {headChefs.length > 0 && (
            <div className="flex flex-wrap justify-center gap-2">
              {headChefs.map(m => (
                <div key={m.id} className="flex items-center gap-2 px-3 py-1.5 rounded-lg border bg-primary/5">
                  <ChefHat className="w-3.5 h-3.5 text-primary" />
                  <span className="text-sm font-medium">{m.profile?.full_name || "Head Chef"}</span>
                  {m.venue_id && (
                    <Badge variant="outline" className="text-[10px] px-1.5">
                      {venues.find(v => v.id === m.venue_id)?.name || "Venue"}
                    </Badge>
                  )}
                </div>
              ))}
              {chefs.length > 0 && (
                <div className="w-full flex justify-center">
                  <div className="w-px h-4 bg-border" />
                </div>
              )}
            </div>
          )}

          {/* Chefs tier */}
          {chefs.length > 0 && (
            <div className="flex flex-wrap justify-center gap-2">
              {chefs.map(m => (
                <div key={m.id} className="flex items-center gap-2 px-3 py-1.5 rounded-lg border bg-muted/50">
                  <Shield className="w-3 h-3 text-muted-foreground" />
                  <span className="text-xs">{m.profile?.full_name || "Chef"}</span>
                </div>
              ))}
            </div>
          )}

          {/* Venue breakdown */}
          {venues.length > 1 && (
            <div className="pt-3 border-t">
              <p className="text-xs text-muted-foreground mb-2 font-medium">Venues</p>
              <div className="flex flex-wrap gap-2">
                {venues.map(v => {
                  const count = members?.filter(m => m.venue_id === v.id).length || 0;
                  return (
                    <Badge key={v.id} variant="outline" className="gap-1">
                      <MapPin className="w-3 h-3" />
                      {v.name}
                      {count > 0 && <span className="text-muted-foreground">({count})</span>}
                    </Badge>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default OrgChartWidget;
