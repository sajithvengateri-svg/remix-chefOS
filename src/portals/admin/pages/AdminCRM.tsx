import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Users, Building2, Search, ChefHat, UserPlus, Gift,
  Award, Trophy, Crown, Copy, Check, TrendingUp,
} from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";

const AdminCRM = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  // ---- Users ----
  const { data: users, isLoading: usersLoading } = useQuery({
    queryKey: ["admin-users"],
    queryFn: async () => {
      const { data: profiles } = await supabase
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: false });

      const { data: roles } = await supabase
        .from("user_roles")
        .select("user_id, role");

      return (profiles || []).map((profile) => {
        const userRole = roles?.find((r) => r.user_id === profile.user_id);
        return { ...profile, role: userRole?.role || "user" };
      });
    },
  });

  // ---- Vendors ----
  const { data: vendors, isLoading: vendorsLoading } = useQuery({
    queryKey: ["admin-vendors"],
    queryFn: async () => {
      const { data } = await supabase
        .from("vendor_profiles")
        .select("*")
        .order("created_at", { ascending: false });
      return data || [];
    },
  });

  // ---- Referral Stats ----
  const { data: referralStats } = useQuery({
    queryKey: ["admin-referral-stats"],
    queryFn: async () => {
      const { data: referrals } = await supabase
        .from("referrals")
        .select("referrer_id, status, referral_code");

      const { data: rewards } = await supabase
        .from("referral_rewards")
        .select("*")
        .order("min_referrals", { ascending: true });

      const { data: codes } = await supabase
        .from("referral_codes")
        .select("user_id, code");

      // Count referrals per user
      const referrerCounts: Record<string, number> = {};
      (referrals || []).forEach((r) => {
        referrerCounts[r.referrer_id] = (referrerCounts[r.referrer_id] || 0) + 1;
      });

      return {
        totalReferrals: referrals?.length || 0,
        completedReferrals: referrals?.filter((r) => r.status === "completed").length || 0,
        rewards: rewards || [],
        codes: codes || [],
        referrerCounts,
      };
    },
  });

  // ---- Signup Events ----
  const { data: signupEvents } = useQuery({
    queryKey: ["admin-signup-events"],
    queryFn: async () => {
      const { data } = await supabase
        .from("signup_events")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(50);
      return data || [];
    },
  });

  // ---- Realtime signup toast ----
  useEffect(() => {
    const channel = supabase
      .channel("admin-signups")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "signup_events" },
        (payload) => {
          const event = payload.new as any;
          toast.success(`🎉 New chef signed up!`, {
            description: `${event.user_name || event.user_email} just joined ChefOS`,
            duration: 8000,
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const filteredUsers = users?.filter(
    (user) =>
      user.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredVendors = vendors?.filter(
    (vendor: any) =>
      vendor.business_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vendor.contact_email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(`${window.location.origin}/auth?ref=${code}`);
    setCopiedCode(code);
    toast.success("Referral link copied!");
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const tierIcons: Record<string, React.ElementType> = {
    bronze: Award,
    silver: Trophy,
    gold: Crown,
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <Users className="w-8 h-8 text-primary" />
          CRM & Onboarding
        </h1>
        <p className="text-muted-foreground mt-1">
          Manage users, vendors, referrals, and track signups
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <ChefHat className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold">{users?.length || 0}</p>
              <p className="text-xs text-muted-foreground">Total Chefs</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center">
              <UserPlus className="w-5 h-5 text-emerald-500" />
            </div>
            <div>
              <p className="text-2xl font-bold">{signupEvents?.length || 0}</p>
              <p className="text-xs text-muted-foreground">Signups</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center">
              <Gift className="w-5 h-5 text-amber-500" />
            </div>
            <div>
              <p className="text-2xl font-bold">{referralStats?.totalReferrals || 0}</p>
              <p className="text-xs text-muted-foreground">Referrals</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
              <Building2 className="w-5 h-5 text-blue-500" />
            </div>
            <div>
              <p className="text-2xl font-bold">{vendors?.length || 0}</p>
              <p className="text-xs text-muted-foreground">Vendors</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search users or vendors..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      <Tabs defaultValue="users">
        <TabsList>
          <TabsTrigger value="users" className="gap-2">
            <ChefHat className="w-4 h-4" />
            Chefs ({users?.length || 0})
          </TabsTrigger>
          <TabsTrigger value="signups" className="gap-2">
            <UserPlus className="w-4 h-4" />
            Signups
          </TabsTrigger>
          <TabsTrigger value="referrals" className="gap-2">
            <Gift className="w-4 h-4" />
            Referrals
          </TabsTrigger>
          <TabsTrigger value="vendors" className="gap-2">
            <Building2 className="w-4 h-4" />
            Vendors ({vendors?.length || 0})
          </TabsTrigger>
        </TabsList>

        {/* Chefs Tab */}
        <TabsContent value="users">
          <Card>
            <CardHeader>
              <CardTitle>All Chefs</CardTitle>
            </CardHeader>
            <CardContent>
              {usersLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Role</TableHead>
                        <TableHead>Referral Code</TableHead>
                        <TableHead>Joined</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredUsers?.map((user) => {
                        const userCode = referralStats?.codes?.find(
                          (c) => c.user_id === user.user_id
                        );
                        const refCount = referralStats?.referrerCounts?.[user.user_id] || 0;
                        return (
                          <TableRow key={user.id}>
                            <TableCell className="font-medium">{user.full_name}</TableCell>
                            <TableCell>{user.email}</TableCell>
                            <TableCell>
                              <Badge variant="secondary">{user.role}</Badge>
                            </TableCell>
                            <TableCell>
                              {userCode ? (
                                <div className="flex items-center gap-2">
                                  <code className="text-xs bg-muted px-2 py-1 rounded">
                                    {userCode.code}
                                  </code>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-6 w-6"
                                    onClick={() => handleCopyCode(userCode.code)}
                                  >
                                    {copiedCode === userCode.code ? (
                                      <Check className="w-3 h-3 text-emerald-500" />
                                    ) : (
                                      <Copy className="w-3 h-3" />
                                    )}
                                  </Button>
                                  {refCount > 0 && (
                                    <Badge variant="outline" className="text-xs">
                                      {refCount} refs
                                    </Badge>
                                  )}
                                </div>
                              ) : (
                                <span className="text-xs text-muted-foreground">—</span>
                              )}
                            </TableCell>
                            <TableCell>
                              {format(new Date(user.created_at), "MMM d, yyyy")}
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Signups Tab */}
        <TabsContent value="signups">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-primary" />
                Recent Signups
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Onboarding</TableHead>
                      <TableHead>Welcome Email</TableHead>
                      <TableHead>Referral</TableHead>
                      <TableHead>Signed Up</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {signupEvents?.map((event: any) => (
                      <TableRow key={event.id}>
                        <TableCell className="font-medium">
                          {event.user_name || "—"}
                        </TableCell>
                        <TableCell>{event.user_email}</TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              event.onboarding_step === "first_recipe"
                                ? "default"
                                : "secondary"
                            }
                          >
                            {event.onboarding_step}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {event.welcome_email_sent ? (
                            <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20">
                              Sent
                            </Badge>
                          ) : (
                            <Badge variant="outline">Pending</Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          {event.referral_code ? (
                            <code className="text-xs bg-muted px-2 py-1 rounded">
                              {event.referral_code}
                            </code>
                          ) : (
                            <span className="text-xs text-muted-foreground">Organic</span>
                          )}
                        </TableCell>
                        <TableCell>
                          {format(new Date(event.created_at), "MMM d, yyyy HH:mm")}
                        </TableCell>
                      </TableRow>
                    ))}
                    {(!signupEvents || signupEvents.length === 0) && (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                          No signups yet
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Referrals Tab */}
        <TabsContent value="referrals">
          <div className="space-y-6">
            {/* Reward Tiers */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {referralStats?.rewards?.map((reward: any) => {
                const TierIcon = tierIcons[reward.tier] || Award;
                return (
                  <motion.div
                    key={reward.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <Card className="border-2" style={{ borderColor: `${reward.badge_color}40` }}>
                      <CardContent className="p-5 flex items-start gap-4">
                        <div
                          className="w-12 h-12 rounded-xl flex items-center justify-center"
                          style={{ backgroundColor: `${reward.badge_color}20` }}
                        >
                          <TierIcon className="w-6 h-6" style={{ color: reward.badge_color }} />
                        </div>
                        <div>
                          <h3 className="font-semibold capitalize">{reward.tier} Tier</h3>
                          <p className="text-sm text-muted-foreground mt-1">
                            {reward.min_referrals}+ referrals
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {reward.reward_description}
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </div>

            {/* Top Referrers */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-primary" />
                  Top Referrers
                </CardTitle>
              </CardHeader>
              <CardContent>
                {Object.keys(referralStats?.referrerCounts || {}).length > 0 ? (
                  <div className="space-y-3">
                    {Object.entries(referralStats?.referrerCounts || {})
                      .sort(([, a], [, b]) => (b as number) - (a as number))
                      .slice(0, 10)
                      .map(([userId, count]) => {
                        const user = users?.find((u) => u.user_id === userId);
                        return (
                          <div
                            key={userId}
                            className="flex items-center justify-between py-2 border-b last:border-0"
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                                <ChefHat className="w-4 h-4 text-primary" />
                              </div>
                              <span className="font-medium">
                                {user?.full_name || "Unknown"}
                              </span>
                            </div>
                            <Badge variant="secondary">{count as number} referrals</Badge>
                          </div>
                        );
                      })}
                  </div>
                ) : (
                  <p className="text-center text-muted-foreground py-8">
                    No referrals yet — share referral links to get started
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Vendors Tab */}
        <TabsContent value="vendors">
          <Card>
            <CardHeader>
              <CardTitle>All Vendors</CardTitle>
            </CardHeader>
            <CardContent>
              {vendorsLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Business Name</TableHead>
                        <TableHead>Contact</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Joined</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredVendors?.map((vendor: any) => (
                        <TableRow key={vendor.id}>
                          <TableCell className="font-medium">{vendor.business_name}</TableCell>
                          <TableCell>{vendor.contact_name}</TableCell>
                          <TableCell>{vendor.contact_email}</TableCell>
                          <TableCell>
                            <Badge variant={vendor.status === "approved" ? "default" : "secondary"}>
                              {vendor.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {format(new Date(vendor.created_at), "MMM d, yyyy")}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminCRM;
