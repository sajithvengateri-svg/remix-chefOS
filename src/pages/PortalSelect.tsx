 import { motion } from "framer-motion";
 import { ChefHat, Store, Shield } from "lucide-react";
 import { useNavigate } from "react-router-dom";
 import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
 
 const portals = [
   {
     id: "chef",
     title: "Chef Portal",
     description: "Recipe management, kitchen operations, inventory & prep lists",
     icon: ChefHat,
     path: "/auth",
     gradient: "from-orange-500 to-amber-600",
     bgGlow: "bg-orange-500/20",
   },
   {
     id: "vendor",
     title: "Vendor Portal",
     description: "Manage orders, pricing, deals & communicate with chefs",
     icon: Store,
     path: "/vendor/auth",
     gradient: "from-blue-500 to-indigo-600",
     bgGlow: "bg-blue-500/20",
   },
   {
     id: "admin",
     title: "Control Center",
     description: "Platform analytics, CRM, marketing & system settings",
     icon: Shield,
     path: "/admin/auth",
     gradient: "from-slate-600 to-slate-800",
     bgGlow: "bg-slate-500/20",
   },
 ];
 
 const PortalSelect = () => {
   const navigate = useNavigate();
 
   return (
     <div className="min-h-screen bg-background relative overflow-hidden">
       {/* Background effects */}
       <div className="absolute inset-0 -z-10">
         <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
         <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-primary/10 rounded-full blur-3xl" />
       </div>
 
       <div className="container mx-auto px-4 py-16 flex flex-col items-center justify-center min-h-screen">
         <motion.div
           initial={{ opacity: 0, y: -20 }}
           animate={{ opacity: 1, y: 0 }}
           transition={{ duration: 0.5 }}
           className="text-center mb-12"
         >
           <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
             Welcome to <span className="text-primary">ChefOS</span>
           </h1>
           <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
             The complete kitchen management ecosystem. Choose your portal to get started.
           </p>
         </motion.div>
 
         <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-5xl">
           {portals.map((portal, index) => (
             <motion.div
               key={portal.id}
               initial={{ opacity: 0, y: 20 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ duration: 0.5, delay: index * 0.1 }}
             >
               <Card
                 className="relative overflow-hidden cursor-pointer group transition-all duration-300 hover:shadow-xl hover:-translate-y-1 border-2 hover:border-primary/50"
                 onClick={() => navigate(portal.path)}
               >
                 {/* Glow effect */}
                 <div
                   className={`absolute inset-0 ${portal.bgGlow} opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-xl`}
                 />
 
                 <CardHeader className="relative text-center pb-2">
                   <div
                     className={`mx-auto w-16 h-16 rounded-2xl bg-gradient-to-br ${portal.gradient} flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform duration-300`}
                   >
                     <portal.icon className="w-8 h-8 text-white" />
                   </div>
                   <CardTitle className="text-xl">{portal.title}</CardTitle>
                 </CardHeader>
 
                 <CardContent className="relative text-center">
                   <CardDescription className="text-sm">
                     {portal.description}
                   </CardDescription>
                 </CardContent>
 
                 {/* Bottom gradient bar */}
                 <div
                   className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r ${portal.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300`}
                 />
               </Card>
             </motion.div>
           ))}
         </div>
 
         <motion.p
           initial={{ opacity: 0 }}
           animate={{ opacity: 1 }}
           transition={{ delay: 0.6 }}
           className="mt-12 text-sm text-muted-foreground"
         >
           Each portal requires separate authentication
         </motion.p>
       </div>
     </div>
   );
 };
 
 export default PortalSelect;