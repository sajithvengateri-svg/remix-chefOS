 import { useState } from "react";
 import { motion } from "framer-motion";
 import { useQuery } from "@tanstack/react-query";
 import { supabase } from "@/integrations/supabase/client";
 import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
 import { Badge } from "@/components/ui/badge";
 import { Button } from "@/components/ui/button";
 import { Input } from "@/components/ui/input";
 import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
 import {
   Table,
   TableBody,
   TableCell,
   TableHead,
   TableHeader,
   TableRow,
 } from "@/components/ui/table";
 import { Users, Building2, Search, ChefHat } from "lucide-react";
 import { format } from "date-fns";
 
 const AdminCRM = () => {
   const [searchTerm, setSearchTerm] = useState("");
 
  const { data: users, isLoading: usersLoading } = useQuery({
    queryKey: ["admin-users"],
    queryFn: async () => {
      // Fetch profiles and roles separately since there's no FK relationship
      const { data: profiles } = await supabase
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: false });

      const { data: roles } = await supabase
        .from("user_roles")
        .select("user_id, role");

      // Merge roles into profiles
      const profilesWithRoles = (profiles || []).map((profile) => {
        const userRole = roles?.find((r) => r.user_id === profile.user_id);
        return { ...profile, role: userRole?.role || "user" };
      });

      return profilesWithRoles;
    },
  });
 
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
 
   const filteredUsers = users?.filter(
     (user) =>
       user.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
       user.email?.toLowerCase().includes(searchTerm.toLowerCase())
   );
 
   const filteredVendors = vendors?.filter(
     (vendor) =>
       vendor.business_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
       vendor.contact_email?.toLowerCase().includes(searchTerm.toLowerCase())
   );
 
   return (
     <div className="space-y-6">
       <div>
         <h1 className="text-3xl font-bold flex items-center gap-3">
           <Users className="w-8 h-8 text-primary" />
           CRM
         </h1>
         <p className="text-muted-foreground mt-1">
           Manage users and vendors across the platform
         </p>
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
           <TabsTrigger value="vendors" className="gap-2">
             <Building2 className="w-4 h-4" />
             Vendors ({vendors?.length || 0})
           </TabsTrigger>
         </TabsList>
 
         <TabsContent value="users">
           <Card>
             <CardHeader>
               <CardTitle>All Users</CardTitle>
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
                         <TableHead>Position</TableHead>
                         <TableHead>Joined</TableHead>
                       </TableRow>
                     </TableHeader>
                     <TableBody>
                       {filteredUsers?.map((user) => (
                         <TableRow key={user.id}>
                           <TableCell className="font-medium">
                             {user.full_name}
                           </TableCell>
                           <TableCell>{user.email}</TableCell>
                            <TableCell>
                              <Badge variant="secondary">
                                {user.role}
                              </Badge>
                            </TableCell>
                           <TableCell>{user.position || "—"}</TableCell>
                           <TableCell>
                             {format(new Date(user.created_at), "MMM d, yyyy")}
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
                       {filteredVendors?.map((vendor) => (
                         <TableRow key={vendor.id}>
                           <TableCell className="font-medium">
                             {vendor.business_name}
                           </TableCell>
                           <TableCell>{vendor.contact_name}</TableCell>
                           <TableCell>{vendor.contact_email}</TableCell>
                           <TableCell>
                             <Badge
                               variant={
                                 vendor.status === "approved"
                                   ? "default"
                                   : "secondary"
                               }
                             >
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