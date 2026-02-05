 import { motion } from "framer-motion";
 import { useQuery } from "@tanstack/react-query";
 import { supabase } from "@/integrations/supabase/client";
 import { useVendorAuth } from "@/hooks/useVendorAuth";
 import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
 import { Badge } from "@/components/ui/badge";
 import { TrendingUp, MapPin, Package } from "lucide-react";
 import { format, subWeeks } from "date-fns";
 
 const VendorInsights = () => {
   const { vendorProfile } = useVendorAuth();
 
   const { data: insights, isLoading } = useQuery({
     queryKey: ["demand-insights", vendorProfile?.postcode],
     queryFn: async () => {
       const fourWeeksAgo = format(subWeeks(new Date(), 4), "yyyy-MM-dd");
       const { data, error } = await supabase
         .from("demand_insights")
         .select("*")
         .gte("week_ending", fourWeeksAgo)
         .order("total_quantity", { ascending: false })
         .limit(20);
       
       if (error) throw error;
       return data || [];
     },
     enabled: !!vendorProfile,
   });
 
   return (
     <div className="p-6 lg:p-8 space-y-6">
       <motion.div
         initial={{ opacity: 0, y: -20 }}
         animate={{ opacity: 1, y: 0 }}
       >
         <h1 className="text-3xl font-bold flex items-center gap-3">
           <TrendingUp className="w-8 h-8 text-primary" />
           Demand Insights
         </h1>
         <p className="text-muted-foreground mt-1">
           See what ingredients chefs are looking for in your delivery areas
         </p>
       </motion.div>
 
       {vendorProfile?.delivery_areas && vendorProfile.delivery_areas.length > 0 && (
         <motion.div
           initial={{ opacity: 0 }}
           animate={{ opacity: 1 }}
           className="flex items-center gap-2 flex-wrap"
         >
           <MapPin className="w-4 h-4 text-muted-foreground" />
           <span className="text-sm text-muted-foreground">Your delivery areas:</span>
           {vendorProfile.delivery_areas.map((area) => (
             <Badge key={area} variant="secondary">{area}</Badge>
           ))}
         </motion.div>
       )}
 
       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
         {isLoading ? (
           Array.from({ length: 6 }).map((_, i) => (
             <Card key={i} className="animate-pulse">
               <CardContent className="p-6">
                 <div className="h-6 bg-muted rounded w-3/4 mb-2" />
                 <div className="h-4 bg-muted rounded w-1/2" />
               </CardContent>
             </Card>
           ))
         ) : insights && insights.length > 0 ? (
           insights.map((insight, index) => (
             <motion.div
               key={insight.id}
               initial={{ opacity: 0, y: 20 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ delay: index * 0.05 }}
             >
               <Card className="hover:shadow-md transition-shadow">
                 <CardHeader className="pb-2">
                   <CardTitle className="flex items-center justify-between text-lg">
                     <span>{insight.ingredient_category}</span>
                     <Package className="w-5 h-5 text-muted-foreground" />
                   </CardTitle>
                 </CardHeader>
                 <CardContent>
                   <div className="space-y-2">
                     <div className="flex items-center justify-between text-sm">
                       <span className="text-muted-foreground">Total Demand</span>
                       <span className="font-medium">
                         {insight.total_quantity?.toFixed(1)} {insight.unit}
                       </span>
                     </div>
                     <div className="flex items-center justify-between text-sm">
                       <span className="text-muted-foreground">Order Count</span>
                       <span className="font-medium">{insight.order_count}</span>
                     </div>
                     {insight.avg_price_paid && (
                       <div className="flex items-center justify-between text-sm">
                         <span className="text-muted-foreground">Avg Price</span>
                         <span className="font-medium">
                           ${insight.avg_price_paid?.toFixed(2)}/{insight.unit}
                         </span>
                       </div>
                     )}
                     <div className="flex items-center gap-2 pt-2">
                       <MapPin className="w-3 h-3 text-muted-foreground" />
                       <span className="text-xs text-muted-foreground">
                         Postcode: {insight.postcode}
                       </span>
                     </div>
                   </div>
                 </CardContent>
               </Card>
             </motion.div>
           ))
         ) : (
           <div className="col-span-full text-center py-12">
             <TrendingUp className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
             <p className="text-muted-foreground">No demand insights available yet</p>
           </div>
         )}
       </div>
     </div>
   );
 };
 
 export default VendorInsights;