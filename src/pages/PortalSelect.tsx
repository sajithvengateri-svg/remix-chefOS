import { useState } from "react";
import { motion } from "framer-motion";
import { ChefHat, Store, Shield, Loader2, Zap } from "lucide-react";
import { useNavigate } from "react-router-dom";
import chefOSLogo from "@/assets/chefos-logo-new.png";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

type Persona = "chef" | "vendor" | "admin";

const personas: { key: Persona; label: string; sublabel: string; icon: typeof ChefHat; gradient: string; redirect: string }[] = [
  { key: "chef", label: "Chef Portal", sublabel: "Kitchen operations", icon: ChefHat, gradient: "from-orange-500 to-amber-500", redirect: "/dashboard" },
  { key: "vendor", label: "Vendor Portal", sublabel: "Supplier tools", icon: Store, gradient: "from-blue-500 to-cyan-500", redirect: "/vendor/dashboard" },
  { key: "admin", label: "Control Center", sublabel: "Admin & CRM", icon: Shield, gradient: "from-slate-600 to-slate-800", redirect: "/admin" },
];

const PortalSelect = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState<Persona | null>(null);

  const quickLogin = async (persona: Persona) => {
    setLoading(persona);
    try {
      // First sign out any existing session
      await supabase.auth.signOut();

      const { data, error } = await supabase.functions.invoke("dev-login", {
        body: { persona },
      });

      if (error || data?.error) {
        toast.error(data?.error || error?.message || "Login failed");
        setLoading(null);
        return;
      }

      // Set the session from the returned tokens
      const { error: sessionError } = await supabase.auth.setSession({
        access_token: data.access_token,
        refresh_token: data.refresh_token,
      });

      if (sessionError) {
        toast.error(sessionError.message);
        setLoading(null);
        return;
      }

      const target = personas.find((p) => p.key === persona)!;
      toast.success(`Signed in as ${persona}`);
      navigate(target.redirect);
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="min-h-screen bg-background relative overflow-hidden flex items-center justify-center">
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-primary/10 rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-4 py-16 flex flex-col items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          <motion.img
            src={chefOSLogo}
            alt="ChefOS"
            className="w-32 h-32 mx-auto mb-6 rounded-3xl shadow-2xl object-contain"
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
          />

          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
            ChefOS <span className="text-primary">Dev Launcher</span>
          </h1>
          <p className="text-sm text-muted-foreground mb-2">
            Quick-login to any portal — no manual auth needed
          </p>
          <div className="flex items-center justify-center gap-2 mb-10">
            <Zap className="w-3 h-3 text-yellow-500" />
            <span className="text-xs text-muted-foreground">One-click sign in as test accounts</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 max-w-2xl mx-auto">
            {personas.map((p, i) => (
              <motion.button
                key={p.key}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + i * 0.1 }}
                onClick={() => quickLogin(p.key)}
                disabled={loading !== null}
                className="group flex flex-col items-center gap-3 p-6 rounded-2xl border border-border bg-card hover:border-primary/50 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 disabled:opacity-50 disabled:pointer-events-none"
              >
                <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${p.gradient} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                  {loading === p.key ? (
                    <Loader2 className="w-7 h-7 text-white animate-spin" />
                  ) : (
                    <p.icon className="w-7 h-7 text-white" />
                  )}
                </div>
                <span className="font-semibold text-foreground">{p.label}</span>
                <span className="text-xs text-muted-foreground">{p.sublabel}</span>
              </motion.button>
            ))}
          </div>

          <div className="mt-10 flex flex-col items-center gap-3">
            <p className="text-xs text-muted-foreground">Or sign in manually:</p>
            <div className="flex gap-3">
              <Button variant="outline" size="sm" onClick={() => navigate("/auth")}>
                Chef Login
              </Button>
              <Button variant="outline" size="sm" onClick={() => navigate("/vendor/auth")}>
                Vendor Login
              </Button>
              <Button variant="outline" size="sm" onClick={() => navigate("/admin/auth")}>
                Admin Login
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default PortalSelect;
