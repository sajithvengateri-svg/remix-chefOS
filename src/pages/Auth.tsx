import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ChefHat, Mail, Lock, User, Gift, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

const Auth = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { signIn, signUp } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [referralCode, setReferralCode] = useState<string | null>(null);
  const [referrerName, setReferrerName] = useState<string | null>(null);

  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [signupEmail, setSignupEmail] = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  const [signupName, setSignupName] = useState("");
  const [signupOrgName, setSignupOrgName] = useState("");

  // Check for referral code in URL
  useEffect(() => {
    const ref = searchParams.get("ref");
    if (ref) {
      setReferralCode(ref);
      // Look up referrer name
      supabase
        .from("referral_codes")
        .select("user_id")
        .eq("code", ref)
        .eq("is_active", true)
        .maybeSingle()
        .then(({ data }) => {
          if (data?.user_id) {
            supabase
              .from("profiles")
              .select("full_name")
              .eq("user_id", data.user_id)
              .maybeSingle()
              .then(({ data: profile }) => {
                if (profile) setReferrerName(profile.full_name);
              });
          }
        });
    }
  }, [searchParams]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await signIn(loginEmail, loginPassword);
      navigate("/dashboard");
    } catch (error) {
      // Error handled in context
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await signUp(signupEmail, signupPassword, signupName, signupOrgName);
      // If referred, track the referral after signup
      if (referralCode) {
        // The referral will be tracked by a database function or we store it in signup_events
        // Update signup_events with the referral code
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          await supabase
            .from("signup_events")
            .update({ referral_code: referralCode })
            .eq("user_id", user.id);

          // Create referral record
          const { data: codeData } = await supabase
            .from("referral_codes")
            .select("user_id")
            .eq("code", referralCode)
            .maybeSingle();

          if (codeData) {
            await supabase.from("referrals").insert({
              referrer_id: codeData.user_id,
              referred_user_id: user.id,
              referral_code: referralCode,
              status: "completed",
              completed_at: new Date().toISOString(),
            });
          }
        }
      }
    } catch (error) {
      // Error handled in context
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 rounded-2xl bg-primary flex items-center justify-center">
              <ChefHat className="w-10 h-10 text-primary-foreground" />
            </div>
          </div>
          <CardTitle className="text-2xl font-display">ChefOS</CardTitle>
          <CardDescription>Kitchen Management System</CardDescription>
          {referralCode && (
            <div className="mt-3">
              <Badge variant="secondary" className="gap-1.5 px-3 py-1">
                <Gift className="w-3.5 h-3.5" />
                {referrerName
                  ? `Invited by ${referrerName}`
                  : `Referral: ${referralCode}`}
              </Badge>
            </div>
          )}
        </CardHeader>
        <CardContent>
          <Tabs defaultValue={referralCode ? "signup" : "login"} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">Login</TabsTrigger>
              <TabsTrigger value="signup">Sign Up</TabsTrigger>
            </TabsList>

            <TabsContent value="login">
              <form onSubmit={handleLogin} className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label htmlFor="login-email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input id="login-email" type="email" placeholder="chef@kitchen.com" className="pl-10" value={loginEmail} onChange={(e) => setLoginEmail(e.target.value)} required />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="login-password">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input id="login-password" type="password" placeholder="••••••••" className="pl-10" value={loginPassword} onChange={(e) => setLoginPassword(e.target.value)} required />
                  </div>
                </div>
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? "Signing in..." : "Sign In"}
                </Button>
                <button
                  type="button"
                  onClick={() => navigate("/reset-password")}
                  className="text-xs text-primary hover:underline w-full text-center mt-2"
                >
                  Forgot password?
                </button>
              </form>
            </TabsContent>

            <TabsContent value="signup">
              <form onSubmit={handleSignup} className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label htmlFor="signup-org">Kitchen / Restaurant Name</Label>
                  <div className="relative">
                    <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input id="signup-org" type="text" placeholder="Ramsay's Kitchen" className="pl-10" value={signupOrgName} onChange={(e) => setSignupOrgName(e.target.value)} required />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-name">Your Full Name</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input id="signup-name" type="text" placeholder="Gordon Ramsay" className="pl-10" value={signupName} onChange={(e) => setSignupName(e.target.value)} required />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input id="signup-email" type="email" placeholder="chef@kitchen.com" className="pl-10" value={signupEmail} onChange={(e) => setSignupEmail(e.target.value)} required />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-password">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input id="signup-password" type="password" placeholder="••••••••" className="pl-10" value={signupPassword} onChange={(e) => setSignupPassword(e.target.value)} required minLength={6} />
                  </div>
                </div>
                {referralCode && (
                  <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/50 border">
                    <Gift className="w-4 h-4 text-primary" />
                    <span className="text-sm text-muted-foreground">
                      Referral code: <strong>{referralCode}</strong>
                    </span>
                  </div>
                )}
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? "Creating account..." : "Create Account"}
                </Button>
                <p className="text-xs text-muted-foreground text-center">
                  You'll be set up as Owner & Head Chef of your organisation
                </p>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default Auth;
