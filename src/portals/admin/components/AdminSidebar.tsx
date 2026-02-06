 import { useLocation, useNavigate } from "react-router-dom";
 import { motion } from "framer-motion";
import {
  LayoutDashboard,
  Users,
  BarChart3,
  Megaphone,
  Settings,
  LogOut,
  Shield,
  TestTube,
  Rocket,
  Database,
  Tag,
} from "lucide-react";
 import { cn } from "@/lib/utils";
 import { useAdminAuth } from "@/hooks/useAdminAuth";
 import { Button } from "@/components/ui/button";
 import { useState } from "react";
 
const navItems = [
  { title: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { title: "Vendor Deals", href: "/admin/vendor-deals", icon: Tag },
  { title: "CRM", href: "/admin/crm", icon: Users },
  { title: "Analytics", href: "/admin/analytics", icon: BarChart3 },
  { title: "Marketing", href: "/admin/marketing", icon: Megaphone },
  { title: "Testing", href: "/admin/testing", icon: TestTube },
  { title: "Seed Data", href: "/admin/seed", icon: Database },
  { title: "Launcher", href: "/admin/launcher", icon: Rocket },
];
 
 const AdminSidebar = () => {
   const location = useLocation();
   const navigate = useNavigate();
   const { signOut } = useAdminAuth();
   const [collapsed, setCollapsed] = useState(false);
 
   const handleSignOut = async () => {
     await signOut();
     navigate("/admin/auth");
   };
 
   return (
     <motion.aside
       initial={{ x: -20, opacity: 0 }}
       animate={{ x: 0, opacity: 1 }}
       className={cn(
         "fixed top-0 left-0 h-screen bg-sidebar border-r border-sidebar-border flex flex-col transition-all duration-300 z-40",
         collapsed ? "w-[72px]" : "w-[240px]"
       )}
     >
       {/* Header */}
       <div className="p-4 border-b border-sidebar-border">
         <div className="flex items-center gap-2">
           <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center">
             <Shield className="w-6 h-6 text-primary-foreground" />
           </div>
           {!collapsed && (
             <div>
               <span className="font-bold text-sidebar-foreground">Control</span>
               <span className="text-primary font-bold"> Center</span>
             </div>
           )}
         </div>
       </div>
 
       {/* Navigation */}
       <nav className="flex-1 p-2 space-y-1 overflow-y-auto">
         {navItems.map((item) => {
           const isActive = location.pathname === item.href || 
             (item.href !== "/admin" && location.pathname.startsWith(item.href));
           return (
             <Button
               key={item.href}
               variant="ghost"
               onClick={() => navigate(item.href)}
               className={cn(
                 "w-full justify-start gap-3 text-sidebar-foreground hover:bg-sidebar-accent",
                 isActive && "bg-sidebar-accent text-sidebar-accent-foreground",
                 collapsed && "justify-center px-2"
               )}
             >
               <item.icon className="w-5 h-5 flex-shrink-0" />
               {!collapsed && <span>{item.title}</span>}
             </Button>
           );
         })}
       </nav>
 
       {/* Footer */}
       <div className="p-2 border-t border-sidebar-border space-y-1">
         <Button
           variant="ghost"
           onClick={() => navigate("/admin/settings")}
           className={cn(
             "w-full justify-start gap-3 text-sidebar-foreground hover:bg-sidebar-accent",
             collapsed && "justify-center px-2"
           )}
         >
           <Settings className="w-5 h-5" />
           {!collapsed && <span>Settings</span>}
         </Button>
         <Button
           variant="ghost"
           onClick={handleSignOut}
           className={cn(
             "w-full justify-start gap-3 text-destructive hover:bg-destructive/10",
             collapsed && "justify-center px-2"
           )}
         >
           <LogOut className="w-5 h-5" />
           {!collapsed && <span>Sign Out</span>}
         </Button>
       </div>
     </motion.aside>
   );
 };
 
 export default AdminSidebar;