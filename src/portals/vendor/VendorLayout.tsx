 import { ReactNode, useEffect } from "react";
 import { useNavigate, Outlet } from "react-router-dom";
 import { Loader2 } from "lucide-react";
 import { useVendorAuth } from "@/hooks/useVendorAuth";
 import VendorSidebar from "./components/VendorSidebar";
 
 interface VendorLayoutProps {
   children?: ReactNode;
 }
 
 const VendorLayout = ({ children }: VendorLayoutProps) => {
   const { user, loading, isVendor } = useVendorAuth();
   const navigate = useNavigate();
 
   useEffect(() => {
     if (!loading && !user) {
       navigate("/vendor/auth");
     }
     if (!loading && user && !isVendor) {
       navigate("/vendor/auth");
     }
   }, [user, loading, isVendor, navigate]);
 
   if (loading) {
     return (
       <div className="min-h-screen flex items-center justify-center bg-background">
         <Loader2 className="w-8 h-8 text-primary animate-spin" />
       </div>
     );
   }
 
   if (!user || !isVendor) return null;
 
   return (
     <div className="min-h-screen flex w-full bg-background">
       <VendorSidebar />
       <main className="flex-1 overflow-auto">
         {children || <Outlet />}
       </main>
     </div>
   );
 };
 
 export default VendorLayout;