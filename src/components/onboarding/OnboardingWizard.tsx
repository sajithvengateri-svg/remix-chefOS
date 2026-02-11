import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Building2, MapPin, Users, GitBranch, ChefHat, 
  ArrowRight, ArrowLeft, Check, Plus, Trash2 
} from "lucide-react";
import { DEV_MODE } from "@/lib/devMode";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useOrg } from "@/contexts/OrgContext";
import { toast } from "sonner";

interface VenueInput {
  name: string;
  postcode: string;
}

interface OnboardingWizardProps {
  open: boolean;
  onComplete: () => void;
}

const STEPS = [
  { id: "welcome", title: "Welcome to ChefOS", icon: ChefHat },
  { id: "venues", title: "Your Venues", icon: MapPin },
  { id: "team", title: "Team Size", icon: Users },
  { id: "structure", title: "Kitchen Hierarchy", icon: GitBranch },
];

const OnboardingWizard = ({ open, onComplete }: OnboardingWizardProps) => {
  const { currentOrg, refreshOrg } = useOrg();
  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);

  // Step data
  const [orgName, setOrgName] = useState(currentOrg?.name || "");
  const [venues, setVenues] = useState<VenueInput[]>([{ name: "Main Kitchen", postcode: "" }]);
  const [teamSize, setTeamSize] = useState<number>(1);
  const [roleStructure, setRoleStructure] = useState<string>("flat");

  const addVenue = () => setVenues([...venues, { name: "", postcode: "" }]);
  const removeVenue = (i: number) => setVenues(venues.filter((_, idx) => idx !== i));
  const updateVenue = (i: number, field: keyof VenueInput, value: string) => {
    const updated = [...venues];
    updated[i][field] = value;
    setVenues(updated);
  };

  const handleFinish = async () => {
    if (!currentOrg) return;
    setSaving(true);
    try {
      if (DEV_MODE) {
        // In dev mode, just close the wizard
        toast.success("Kitchen setup complete! 🎉");
        onComplete();
        return;
      }

      // Update org with onboarding data
      const { error: orgError } = await supabase
        .from("organizations")
        .update({
          name: orgName || currentOrg.name,
          onboarding_completed: true,
          onboarding_completed_at: new Date().toISOString(),
          team_size_estimate: teamSize,
          role_structure: roleStructure,
        } as any)
        .eq("id", currentOrg.id);

      if (orgError) throw orgError;

      // Update existing first venue and add new ones
      const existingVenues = await supabase
        .from("org_venues")
        .select("id")
        .eq("org_id", currentOrg.id);

      const existingIds = existingVenues.data?.map(v => v.id) || [];

      // Update first venue
      if (existingIds.length > 0 && venues[0]) {
        await supabase
          .from("org_venues")
          .update({ name: venues[0].name, postcode: venues[0].postcode || null })
          .eq("id", existingIds[0]);
      }

      // Add additional venues
      const newVenues = venues.slice(existingIds.length > 0 ? 1 : 0).filter(v => v.name.trim());
      if (newVenues.length > 0) {
        await supabase.from("org_venues").insert(
          newVenues.map(v => ({
            org_id: currentOrg.id,
            name: v.name,
            postcode: v.postcode || null,
          }))
        );
      }

      await refreshOrg();
      toast.success("Kitchen setup complete! 🎉");
      onComplete();
    } catch (err) {
      console.error("Onboarding error:", err);
      toast.error("Failed to save setup. Please ensure you're logged in.");
    } finally {
      setSaving(false);
    }
  };

  const canProceed = () => {
    switch (step) {
      case 0: return orgName.trim().length > 0;
      case 1: return venues.some(v => v.name.trim().length > 0);
      case 2: return teamSize >= 1;
      case 3: return true;
      default: return true;
    }
  };

  const renderStep = () => {
    switch (step) {
      case 0:
        return (
          <div className="space-y-6 text-center">
            <div className="w-20 h-20 mx-auto rounded-2xl bg-primary/10 flex items-center justify-center">
              <ChefHat className="w-10 h-10 text-primary" />
            </div>
            <div>
              <h2 className="text-2xl font-bold">Welcome, Chef!</h2>
              <p className="text-muted-foreground mt-2">
                Let's set up your kitchen in under a minute. This helps us tailor ChefOS to your operation.
              </p>
            </div>
            <div className="max-w-sm mx-auto">
              <Label htmlFor="org-name">Organisation Name</Label>
              <Input
                id="org-name"
                value={orgName}
                onChange={(e) => setOrgName(e.target.value)}
                placeholder="e.g. Marco's Bistro Group"
                className="mt-2 text-center text-lg"
                autoFocus
              />
            </div>
          </div>
        );

      case 1:
        return (
          <div className="space-y-5">
            <div className="text-center">
              <h2 className="text-xl font-bold">How many venues do you operate?</h2>
              <p className="text-sm text-muted-foreground mt-1">
                Add each kitchen location. You can always add more later.
              </p>
            </div>
            <div className="space-y-3 max-h-[300px] overflow-y-auto">
              {venues.map((venue, i) => (
                <div key={i} className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <MapPin className="w-4 h-4 text-primary" />
                  </div>
                  <Input
                    value={venue.name}
                    onChange={(e) => updateVenue(i, "name", e.target.value)}
                    placeholder="Venue name"
                    className="flex-1"
                  />
                  <Input
                    value={venue.postcode}
                    onChange={(e) => updateVenue(i, "postcode", e.target.value)}
                    placeholder="Postcode"
                    className="w-24"
                  />
                  {venues.length > 1 && (
                    <Button variant="ghost" size="icon" onClick={() => removeVenue(i)} className="flex-shrink-0">
                      <Trash2 className="w-4 h-4 text-muted-foreground" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
            <Button variant="outline" size="sm" onClick={addVenue} className="w-full">
              <Plus className="w-4 h-4 mr-2" /> Add Another Venue
            </Button>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6 text-center">
            <div>
              <h2 className="text-xl font-bold">How big is your team?</h2>
              <p className="text-sm text-muted-foreground mt-1">
                Approximate number of chefs across all venues
              </p>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-md mx-auto">
              {[
                { label: "Just me", value: 1 },
                { label: "2–5", value: 5 },
                { label: "6–15", value: 15 },
                { label: "16+", value: 20 },
              ].map((opt) => (
                <Card
                  key={opt.value}
                  className={`cursor-pointer transition-all ${
                    teamSize === opt.value
                      ? "border-primary bg-primary/5 ring-2 ring-primary/20"
                      : "hover:border-primary/30"
                  }`}
                  onClick={() => setTeamSize(opt.value)}
                >
                  <CardContent className="p-4 text-center">
                    <Users className="w-6 h-6 mx-auto mb-2 text-muted-foreground" />
                    <p className="text-sm font-medium">{opt.label}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6 text-center">
            <div>
              <h2 className="text-xl font-bold">Kitchen Hierarchy</h2>
              <p className="text-sm text-muted-foreground mt-1">
                How is your kitchen organised?
              </p>
            </div>
            <div className="grid gap-3 max-w-md mx-auto">
              {[
                {
                  value: "flat",
                  label: "Flat — Everyone's equal",
                  desc: "Small team, everyone does everything",
                  icon: "👨‍🍳",
                },
                {
                  value: "sections",
                  label: "Section-based",
                  desc: "Larder, Grill, Pastry — with section leaders",
                  icon: "🏗️",
                },
                {
                  value: "brigade",
                  label: "Full Brigade",
                  desc: "Executive Chef → Sous → CDP → Commis",
                  icon: "⭐",
                },
              ].map((opt) => (
                <Card
                  key={opt.value}
                  className={`cursor-pointer transition-all text-left ${
                    roleStructure === opt.value
                      ? "border-primary bg-primary/5 ring-2 ring-primary/20"
                      : "hover:border-primary/30"
                  }`}
                  onClick={() => setRoleStructure(opt.value)}
                >
                  <CardContent className="p-4 flex items-center gap-4">
                    <span className="text-2xl">{opt.icon}</span>
                    <div>
                      <p className="font-medium">{opt.label}</p>
                      <p className="text-xs text-muted-foreground">{opt.desc}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent className="sm:max-w-lg p-0 gap-0 overflow-hidden [&>button]:hidden">
        {/* Progress bar */}
        <div className="flex gap-1 p-4 pb-0">
          {STEPS.map((_, i) => (
            <div
              key={i}
              className={`h-1.5 flex-1 rounded-full transition-colors ${
                i <= step ? "bg-primary" : "bg-muted"
              }`}
            />
          ))}
        </div>

        {/* Step content */}
        <div className="p-6 min-h-[350px] flex flex-col justify-center">
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
            >
              {renderStep()}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between p-4 border-t bg-muted/30">
          <div>
            {step > 0 && (
              <Button variant="ghost" onClick={() => setStep(step - 1)}>
                <ArrowLeft className="w-4 h-4 mr-2" /> Back
              </Button>
            )}
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">
              {step + 1} of {STEPS.length}
            </span>
            {step < STEPS.length - 1 ? (
              <Button onClick={() => setStep(step + 1)} disabled={!canProceed()}>
                Next <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            ) : (
              <Button onClick={handleFinish} disabled={saving}>
                {saving ? "Saving…" : (
                  <>
                    <Check className="w-4 h-4 mr-2" /> Finish Setup
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default OnboardingWizard;
