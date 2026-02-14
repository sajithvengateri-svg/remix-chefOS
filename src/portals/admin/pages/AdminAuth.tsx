 import { useState, useEffect } from "react";
 import { useNavigate } from "react-router-dom";
 import { motion } from "framer-motion";
 import { Button } from "@/components/ui/button";
 import { Input } from "@/components/ui/input";
 import { Label } from "@/components/ui/label";
 import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
 import { useAdminAuth } from "@/hooks/useAdminAuth";
 import { Loader2, Shield, Mail, Lock } from "lucide-react";
 
 const AdminAuth = () => {
   const navigate = useNavigate();
   const { user, isAdmin, signIn, loading } = useAdminAuth();
   const [isSubmitting, setIsSubmitting] = useState(false);
   const [email, setEmail] = useState("");
   const [password, setPassword] = useState("");
 
   useEffect(() => {
     if (!loading && user && isAdmin) {
       navigate("/admin");
     }
   }, [user, isAdmin, loading, navigate]);
 
   const handleLogin = async (e: React.FormEvent) => {
     e.preventDefault();
     setIsSubmitting(true);
     try {
       await signIn(email, password);
      // Navigation happens in the effect once isAdmin is set
     } catch (error) {
       // Error handled in hook
     } finally {
       setIsSubmitting(false);
     }
   };
 
   if (loading) {
     return (
       <div className="min-h-screen flex items-center justify-center bg-background">
         <Loader2 className="w-8 h-8 animate-spin text-primary" />
       </div>
     );
   }
 
   return (
     <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/10 flex items-center justify-center p-4">
       <motion.div
         initial={{ opacity: 0, y: 20 }}
         animate={{ opacity: 1, y: 0 }}
         transition={{ duration: 0.5 }}
       >
         <Card className="w-full max-w-md border-border/50 shadow-2xl">
           <CardHeader className="text-center pb-2">
             <div className="flex justify-center mb-4">
               <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center">
                 <Shield className="w-10 h-10 text-primary-foreground" />
               </div>
             </div>
             <CardTitle className="text-2xl font-bold">Control Center</CardTitle>
             <CardDescription>Administrator Access Only</CardDescription>
           </CardHeader>
           <CardContent>
             <form onSubmit={handleLogin} className="space-y-4">
               <div className="space-y-2">
                 <Label htmlFor="email">Email</Label>
                 <div className="relative">
                   <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                   <Input
                     id="email"
                     type="email"
                     placeholder="admin@chefos.app"
                     className="pl-10"
                     value={email}
                     onChange={(e) => setEmail(e.target.value)}
                     required
                   />
                 </div>
               </div>
               <div className="space-y-2">
                 <Label htmlFor="password">Password</Label>
                 <div className="relative">
                   <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                   <Input
                     id="password"
                     type="password"
                     placeholder="••••••••"
                     className="pl-10"
                     value={password}
                     onChange={(e) => setPassword(e.target.value)}
                     required
                   />
                 </div>
               </div>
                <Button type="submit" className="w-full" disabled={isSubmitting}>
                  {isSubmitting ? "Authenticating..." : "Access Control Center"}
                </Button>
                <button
                  type="button"
                  onClick={() => navigate("/reset-password?portal=admin")}
                  className="text-xs text-primary hover:underline w-full text-center mt-2"
                >
                  Forgot password?
                </button>
                <p className="text-xs text-muted-foreground text-center">
                  Restricted access. Admin credentials required.
                </p>
             </form>
           </CardContent>
         </Card>
       </motion.div>
     </div>
   );
 };
 
 export default AdminAuth;