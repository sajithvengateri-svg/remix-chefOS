 import { useState, useEffect } from "react";
 import { User } from "@supabase/supabase-js";
 import { supabase } from "@/integrations/supabase/client";
 import { toast } from "sonner";
 
 export const useAdminAuth = () => {
   const [user, setUser] = useState<User | null>(null);
   const [loading, setLoading] = useState(true);
   const [isAdmin, setIsAdmin] = useState(false);
 
   const checkAdminRole = async (userId: string) => {
     try {
       const { data, error } = await supabase
         .from("user_roles")
         .select("role")
        .eq("user_id", userId);
 
       if (error) {
         console.error("Error checking admin role:", error);
         setIsAdmin(false);
         return;
       }
 
      // Check if any of the user's roles is 'admin'
      const roles = data?.map(r => r.role) || [];
      setIsAdmin(roles.includes("admin"));
     } catch (error) {
       console.error("Error in checkAdminRole:", error);
       setIsAdmin(false);
     }
   };
 
   useEffect(() => {
     const { data: { subscription } } = supabase.auth.onAuthStateChange(
       (event, session) => {
         setUser(session?.user ?? null);
         
         if (session?.user) {
           setTimeout(() => checkAdminRole(session.user.id), 0);
         } else {
           setIsAdmin(false);
         }
         setLoading(false);
       }
     );
 
     supabase.auth.getSession().then(({ data: { session } }) => {
       setUser(session?.user ?? null);
       if (session?.user) {
         checkAdminRole(session.user.id);
       }
       setLoading(false);
     });
 
     return () => subscription.unsubscribe();
   }, []);
 
   const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
       email,
       password,
     });
 
     if (error) {
       toast.error(error.message);
       throw error;
     }

    // Immediately hydrate admin role to avoid redirect flicker
    if (data.user) {
      setUser(data.user);
      await checkAdminRole(data.user.id);
    }
 
     toast.success("Welcome to Control Center!");
   };
 
   const signOut = async () => {
     const { error } = await supabase.auth.signOut();
     if (error) {
       toast.error(error.message);
       throw error;
     }
     setIsAdmin(false);
     toast.success("Signed out successfully");
   };
 
   return {
     user,
     loading,
     isAdmin,
     signIn,
     signOut,
   };
 };