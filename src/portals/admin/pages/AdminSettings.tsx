 import { motion } from "framer-motion";
 import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
 import { Settings, Shield, Database, Bell } from "lucide-react";
 
 const AdminSettings = () => {
   return (
     <div className="space-y-6">
       <div>
         <h1 className="text-3xl font-bold flex items-center gap-3">
           <Settings className="w-8 h-8 text-primary" />
           Settings
         </h1>
         <p className="text-muted-foreground mt-1">
           Configure system settings and preferences
         </p>
       </div>
 
       <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl">
         <motion.div
           initial={{ opacity: 0, y: 20 }}
           animate={{ opacity: 1, y: 0 }}
         >
           <Card>
             <CardHeader>
               <CardTitle className="flex items-center gap-2">
                 <Shield className="w-5 h-5" />
                 Security
               </CardTitle>
             </CardHeader>
             <CardContent>
               <p className="text-muted-foreground">
                 Manage security settings, API keys, and access controls.
               </p>
             </CardContent>
           </Card>
         </motion.div>
 
         <motion.div
           initial={{ opacity: 0, y: 20 }}
           animate={{ opacity: 1, y: 0 }}
           transition={{ delay: 0.05 }}
         >
           <Card>
             <CardHeader>
               <CardTitle className="flex items-center gap-2">
                 <Database className="w-5 h-5" />
                 Database
               </CardTitle>
             </CardHeader>
             <CardContent>
               <p className="text-muted-foreground">
                 Database configuration and backup settings.
               </p>
             </CardContent>
           </Card>
         </motion.div>
 
         <motion.div
           initial={{ opacity: 0, y: 20 }}
           animate={{ opacity: 1, y: 0 }}
           transition={{ delay: 0.1 }}
         >
           <Card>
             <CardHeader>
               <CardTitle className="flex items-center gap-2">
                 <Bell className="w-5 h-5" />
                 Notifications
               </CardTitle>
             </CardHeader>
             <CardContent>
               <p className="text-muted-foreground">
                 Configure system notification preferences.
               </p>
             </CardContent>
           </Card>
         </motion.div>
       </div>
     </div>
   );
 };
 
 export default AdminSettings;