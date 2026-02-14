import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";
import { Rocket, Wrench, Plus, Calendar, FileText } from "lucide-react";

interface FeatureRelease {
  id: string;
  module_slug: string;
  module_name: string;
  description: string | null;
  status: string;
  release_type: string;
  target_release: string | null;
  release_notes: string | null;
  sort_order: number;
  released_at: string | null;
  created_at: string;
  updated_at: string;
}

const statusColors: Record<string, string> = {
  development: "bg-muted text-muted-foreground",
  beta: "bg-yellow-500/20 text-yellow-700 dark:text-yellow-400",
  released: "bg-green-500/20 text-green-700 dark:text-green-400",
};

const AdminUpdates = () => {
  const [releases, setReleases] = useState<FeatureRelease[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newImprovement, setNewImprovement] = useState({
    module_slug: "",
    module_name: "",
    description: "",
    target_release: "",
  });

  const fetchReleases = async () => {
    const { data, error } = await supabase
      .from("feature_releases")
      .select("*")
      .order("sort_order", { ascending: true });

    if (error) {
      toast({ title: "Error loading releases", description: error.message, variant: "destructive" });
    } else {
      setReleases(data || []);
    }
    setLoading(false);
  };

  useEffect(() => { fetchReleases(); }, []);

  const updateRelease = async (id: string, updates: Partial<FeatureRelease>) => {
    if (updates.status === "released") {
      updates.released_at = new Date().toISOString();
    }
    const { error } = await supabase
      .from("feature_releases")
      .update(updates)
      .eq("id", id);

    if (error) {
      toast({ title: "Update failed", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Updated successfully" });
      fetchReleases();
    }
  };

  const addImprovement = async () => {
    if (!newImprovement.module_slug || !newImprovement.description) return;
    const { error } = await supabase.from("feature_releases").insert({
      module_slug: newImprovement.module_slug,
      module_name: newImprovement.module_name || newImprovement.module_slug,
      description: newImprovement.description,
      target_release: newImprovement.target_release || null,
      release_type: "improvement",
      sort_order: releases.length + 1,
    });

    if (error) {
      toast({ title: "Failed to add", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Improvement added" });
      setShowAddForm(false);
      setNewImprovement({ module_slug: "", module_name: "", description: "", target_release: "" });
      fetchReleases();
    }
  };

  const newModules = releases.filter(r => r.release_type === "new");
  const improvements = releases.filter(r => r.release_type === "improvement");

  const nextStatus = (current: string) => {
    if (current === "development") return "beta";
    if (current === "beta") return "released";
    return current;
  };

  if (loading) return <div className="p-6 text-muted-foreground">Loading...</div>;

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Feature Updates</h1>
        <p className="text-muted-foreground">Track new modules and improvements to existing features</p>
      </div>

      <Tabs defaultValue="modules">
        <TabsList>
          <TabsTrigger value="modules" className="gap-2">
            <Rocket className="w-4 h-4" /> New Modules
          </TabsTrigger>
          <TabsTrigger value="improvements" className="gap-2">
            <Wrench className="w-4 h-4" /> Improvements
          </TabsTrigger>
        </TabsList>

        <TabsContent value="modules">
          <div className="grid gap-4 md:grid-cols-2">
            {newModules.map((mod) => (
              <Card key={mod.id}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{mod.module_name}</CardTitle>
                    <Badge className={statusColors[mod.status]}>{mod.status}</Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-sm text-muted-foreground">{mod.description}</p>

                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                    <Input
                      placeholder="e.g. March 2026"
                      value={mod.target_release || ""}
                      onChange={(e) => updateRelease(mod.id, { target_release: e.target.value })}
                      className="h-8 text-sm"
                    />
                  </div>

                  <div className="flex items-start gap-2">
                    <FileText className="w-4 h-4 text-muted-foreground mt-2" />
                    <Textarea
                      placeholder="Release notes..."
                      value={mod.release_notes || ""}
                      onChange={(e) => updateRelease(mod.id, { release_notes: e.target.value })}
                      className="text-sm min-h-[60px]"
                    />
                  </div>

                  {mod.status !== "released" && (
                    <Button
                      size="sm"
                      onClick={() => updateRelease(mod.id, { status: nextStatus(mod.status) })}
                    >
                      Move to {nextStatus(mod.status)}
                    </Button>
                  )}
                  {mod.released_at && (
                    <p className="text-xs text-muted-foreground">
                      Released: {new Date(mod.released_at).toLocaleDateString()}
                    </p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="improvements">
          <div className="space-y-4">
            <Button variant="outline" size="sm" onClick={() => setShowAddForm(!showAddForm)} className="gap-2">
              <Plus className="w-4 h-4" /> Add Improvement
            </Button>

            {showAddForm && (
              <Card>
                <CardContent className="pt-4 space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <Input
                      placeholder="Module slug (e.g. recipes)"
                      value={newImprovement.module_slug}
                      onChange={(e) => setNewImprovement(p => ({ ...p, module_slug: e.target.value }))}
                    />
                    <Input
                      placeholder="Display name (e.g. Recipes)"
                      value={newImprovement.module_name}
                      onChange={(e) => setNewImprovement(p => ({ ...p, module_name: e.target.value }))}
                    />
                  </div>
                  <Input
                    placeholder="Description"
                    value={newImprovement.description}
                    onChange={(e) => setNewImprovement(p => ({ ...p, description: e.target.value }))}
                  />
                  <Input
                    placeholder="Target release (e.g. April 2026)"
                    value={newImprovement.target_release}
                    onChange={(e) => setNewImprovement(p => ({ ...p, target_release: e.target.value }))}
                  />
                  <Button size="sm" onClick={addImprovement}>Save</Button>
                </CardContent>
              </Card>
            )}

            {improvements.length === 0 && !showAddForm && (
              <p className="text-muted-foreground text-sm">No improvements tracked yet.</p>
            )}

            {improvements.map((imp) => (
              <Card key={imp.id}>
                <CardContent className="pt-4">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <span className="font-medium text-foreground">{imp.module_name}</span>
                      <span className="text-muted-foreground text-sm ml-2">({imp.module_slug})</span>
                    </div>
                    <Badge className={statusColors[imp.status]}>{imp.status}</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">{imp.description}</p>
                  <div className="flex items-center gap-3">
                    {imp.target_release && (
                      <span className="text-xs text-muted-foreground">Target: {imp.target_release}</span>
                    )}
                    {imp.status !== "released" && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => updateRelease(imp.id, { status: nextStatus(imp.status) })}
                      >
                        → {nextStatus(imp.status)}
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminUpdates;
