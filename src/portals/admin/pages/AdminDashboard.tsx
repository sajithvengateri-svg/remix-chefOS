 import { motion } from "framer-motion";
 import { useQuery } from "@tanstack/react-query";
 import { supabase } from "@/integrations/supabase/client";
 import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
 import { Badge } from "@/components/ui/badge";
 import {
   Users,
   DollarSign,
   ShoppingCart,
   TrendingUp,
   Building2,
   ChefHat,
   Activity,
 } from "lucide-react";
 
 const StatsCard = ({
   title,
   value,
   change,
   icon: Icon,
   variant = "default",
   delay = 0,
 }: {
   title: string;
   value: string | number;
   change?: number;
   icon: React.ElementType;
   variant?: "default" | "primary" | "success" | "warning";
   delay?: number;
 }) => {
   const variantStyles = {
     default: "from-gray-500/20 to-gray-600/20",
     primary: "from-primary/20 to-primary/10",
     success: "from-green-500/20 to-green-600/10",
     warning: "from-yellow-500/20 to-yellow-600/10",
   };
 
   return (
     <motion.div
       initial={{ opacity: 0, y: 20 }}
       animate={{ opacity: 1, y: 0 }}
       transition={{ delay }}
     >
       <Card className="hover:shadow-lg transition-shadow">
         <CardContent className="p-6">
           <div className="flex items-start justify-between">
             <div>
               <p className="text-sm text-muted-foreground">{title}</p>
               <p className="text-3xl font-bold mt-2">{value}</p>
               {change !== undefined && (
                 <div className="flex items-center gap-1 mt-2">
                   <TrendingUp className={`w-4 h-4 ${change >= 0 ? "text-green-500" : "text-red-500"}`} />
                   <span className={`text-sm ${change >= 0 ? "text-green-500" : "text-red-500"}`}>
                     {change >= 0 ? "+" : ""}{change}%
                   </span>
                   <span className="text-xs text-muted-foreground">vs last week</span>
                 </div>
               )}
             </div>
             <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${variantStyles[variant]} flex items-center justify-center`}>
               <Icon className="w-6 h-6 text-foreground" />
             </div>
           </div>
         </CardContent>
       </Card>
     </motion.div>
   );
 };
 
 const AdminDashboard = () => {
   const { data: stats } = useQuery({
     queryKey: ["admin-stats"],
     queryFn: async () => {
       const [
         { count: totalUsers },
         { count: totalVendors },
         { count: totalRecipes },
         { count: totalOrders },
       ] = await Promise.all([
         supabase.from("profiles").select("*", { count: "exact", head: true }),
         supabase.from("vendor_profiles").select("*", { count: "exact", head: true }),
         supabase.from("recipes").select("*", { count: "exact", head: true }),
         supabase.from("vendor_orders").select("*", { count: "exact", head: true }),
       ]);
 
       return {
         totalUsers: totalUsers || 0,
         totalVendors: totalVendors || 0,
         totalRecipes: totalRecipes || 0,
         totalOrders: totalOrders || 0,
       };
     },
   });
 
   const { data: recentActivity } = useQuery({
     queryKey: ["admin-recent-activity"],
     queryFn: async () => {
       const { data } = await supabase
         .from("profiles")
         .select("full_name, created_at")
         .order("created_at", { ascending: false })
         .limit(5);
       return data || [];
     },
   });
 
   return (
     <div className="space-y-8">
       {/* Header */}
       <div>
         <h1 className="text-3xl font-bold tracking-tight">
           Command <span className="text-primary">Dashboard</span>
         </h1>
         <p className="text-muted-foreground mt-1">
           Real-time overview of the ChefOS ecosystem
         </p>
       </div>
 
       {/* Stats Grid */}
       <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
         <StatsCard
           title="Active Users"
           value={stats?.totalUsers || 0}
           change={12.5}
           icon={Users}
           variant="primary"
           delay={0}
         />
         <StatsCard
           title="Vendors"
           value={stats?.totalVendors || 0}
           change={8.2}
           icon={Building2}
           variant="success"
           delay={0.05}
         />
         <StatsCard
           title="Total Orders"
           value={stats?.totalOrders || 0}
           change={-2.4}
           icon={ShoppingCart}
           variant="warning"
           delay={0.1}
         />
         <StatsCard
           title="Recipes"
           value={stats?.totalRecipes || 0}
           change={5.1}
           icon={ChefHat}
           variant="default"
           delay={0.15}
         />
       </div>
 
       {/* Activity and Status */}
       <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
         <motion.div
           initial={{ opacity: 0, x: -20 }}
           animate={{ opacity: 1, x: 0 }}
           transition={{ delay: 0.2 }}
         >
           <Card>
             <CardHeader>
               <CardTitle className="flex items-center gap-2">
                 <Activity className="w-5 h-5 text-primary" />
                 Recent Signups
               </CardTitle>
             </CardHeader>
             <CardContent>
               <div className="space-y-3">
                 {recentActivity?.map((user, index) => (
                   <div
                     key={index}
                     className="flex items-center justify-between py-2 border-b last:border-0"
                   >
                     <div className="flex items-center gap-3">
                       <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                         <Users className="w-4 h-4 text-primary" />
                       </div>
                       <span className="font-medium">{user.full_name}</span>
                     </div>
                     <span className="text-xs text-muted-foreground">
                       {new Date(user.created_at).toLocaleDateString()}
                     </span>
                   </div>
                 ))}
                 {(!recentActivity || recentActivity.length === 0) && (
                   <p className="text-muted-foreground text-center py-4">
                     No recent activity
                   </p>
                 )}
               </div>
             </CardContent>
           </Card>
         </motion.div>
 
         <motion.div
           initial={{ opacity: 0, x: 20 }}
           animate={{ opacity: 1, x: 0 }}
           transition={{ delay: 0.25 }}
         >
           <Card>
             <CardHeader>
               <CardTitle>System Status</CardTitle>
             </CardHeader>
             <CardContent>
               <div className="space-y-4">
                 <div className="flex items-center justify-between">
                   <span>Database</span>
                   <Badge className="bg-green-500">Operational</Badge>
                 </div>
                 <div className="flex items-center justify-between">
                   <span>Authentication</span>
                   <Badge className="bg-green-500">Operational</Badge>
                 </div>
                 <div className="flex items-center justify-between">
                   <span>Edge Functions</span>
                   <Badge className="bg-green-500">Operational</Badge>
                 </div>
                 <div className="flex items-center justify-between">
                   <span>Storage</span>
                   <Badge className="bg-green-500">Operational</Badge>
                 </div>
               </div>
             </CardContent>
           </Card>
         </motion.div>
       </div>
     </div>
   );
 };
 
 export default AdminDashboard;