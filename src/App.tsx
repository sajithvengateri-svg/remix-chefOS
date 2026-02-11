import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { OrgProvider } from "@/contexts/OrgContext";
import { VoiceCommandProvider } from "@/contexts/VoiceCommandContext";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import ChefAIChat from "@/components/ai/ChefAIChat";

 
 // Chef Portal Pages
import Dashboard from "./pages/Dashboard";
import Recipes from "./pages/Recipes";
import RecipeDetail from "./pages/RecipeDetail";
import RecipeEdit from "./pages/RecipeEdit";
import Ingredients from "./pages/Ingredients";
import Inventory from "./pages/Inventory";
import PrepLists from "./pages/PrepLists";
import Production from "./pages/Production";
import MenuEngineering from "./pages/MenuEngineering";
import Roster from "./pages/Roster";
import AllergenDashboard from "./pages/AllergenDashboard";
import FoodSafety from "./pages/FoodSafety";
import Training from "./pages/Training";
import Invoices from "./pages/Invoices";
import CookingCheatsheets from "./pages/CookingCheatsheets";
import OperationsCalendar from "./pages/OperationsCalendar";
import Equipment from "./pages/Equipment";
import More from "./pages/More";
import NotFound from "./pages/NotFound";
import Auth from "./pages/Auth";
import PortalSelect from "./pages/PortalSelect";
import Team from "./pages/Team";
import Marketplace from "./pages/Marketplace";
import KitchenSections from "./pages/KitchenSections";
import Settings from "./pages/Settings";
 
 // Vendor Portal
 import VendorLayout from "./portals/vendor/VendorLayout";
 import VendorAuth from "./portals/vendor/pages/VendorAuth";
 import VendorDashboard from "./portals/vendor/pages/VendorDashboard";
 import VendorInsights from "./portals/vendor/pages/VendorInsights";
 import VendorPricing from "./portals/vendor/pages/VendorPricing";
 import VendorOrders from "./portals/vendor/pages/VendorOrders";
 import VendorDeals from "./portals/vendor/pages/VendorDeals";
 import VendorMessages from "./portals/vendor/pages/VendorMessages";
 import VendorSettings from "./portals/vendor/pages/VendorSettings";
 
// Admin Portal
import AdminLayout from "./portals/admin/AdminLayout";
import AdminAuth from "./portals/admin/pages/AdminAuth";
import AdminDashboard from "./portals/admin/pages/AdminDashboard";
import AdminCRM from "./portals/admin/pages/AdminCRM";
import AdminAnalytics from "./portals/admin/pages/AdminAnalytics";
import AdminMarketing from "./portals/admin/pages/AdminMarketing";
import AdminSettings from "./portals/admin/pages/AdminSettings";
import AdminVendorDeals from "./portals/admin/pages/AdminVendorDeals";
import AdminTesting from "./portals/admin/pages/AdminTesting";
import AdminSeedData from "./portals/admin/pages/AdminSeedData";
import AdminLauncher from "./portals/admin/pages/AdminLauncher";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <OrgProvider>
          <VoiceCommandProvider>
            <Routes>
              {/* ========== PORTAL SELECTION ========== */}
              <Route path="/" element={<PortalSelect />} />

              {/* ========== CHEF PORTAL ========== */}
              <Route path="/auth" element={<Auth />} />
              <Route path="/dashboard" element={<ProtectedRoute module="dashboard"><Dashboard /></ProtectedRoute>} />
              <Route path="/recipes" element={<ProtectedRoute module="recipes"><Recipes /></ProtectedRoute>} />
              <Route path="/recipes/new" element={<ProtectedRoute module="recipes"><RecipeEdit /></ProtectedRoute>} />
              <Route path="/recipes/:id" element={<ProtectedRoute module="recipes"><RecipeDetail /></ProtectedRoute>} />
              <Route path="/recipes/:id/edit" element={<ProtectedRoute module="recipes"><RecipeEdit /></ProtectedRoute>} />
              <Route path="/ingredients" element={<ProtectedRoute module="ingredients"><Ingredients /></ProtectedRoute>} />
              <Route path="/inventory" element={<ProtectedRoute module="inventory"><Inventory /></ProtectedRoute>} />
              <Route path="/inventory/*" element={<ProtectedRoute module="inventory"><Inventory /></ProtectedRoute>} />
              <Route path="/prep" element={<ProtectedRoute module="prep"><PrepLists /></ProtectedRoute>} />
              <Route path="/prep/*" element={<ProtectedRoute module="prep"><PrepLists /></ProtectedRoute>} />
              <Route path="/production" element={<ProtectedRoute module="production"><Production /></ProtectedRoute>} />
              <Route path="/marketplace" element={<ProtectedRoute module="marketplace"><Marketplace /></ProtectedRoute>} />
              <Route path="/menu-engineering" element={<ProtectedRoute module="menu-engineering"><MenuEngineering /></ProtectedRoute>} />
              <Route path="/roster" element={<ProtectedRoute module="roster"><Roster /></ProtectedRoute>} />
              <Route path="/allergens" element={<ProtectedRoute module="allergens"><AllergenDashboard /></ProtectedRoute>} />
              <Route path="/food-safety" element={<ProtectedRoute module="food-safety"><FoodSafety /></ProtectedRoute>} />
              <Route path="/training" element={<ProtectedRoute module="training"><Training /></ProtectedRoute>} />
              <Route path="/invoices" element={<ProtectedRoute module="invoices"><Invoices /></ProtectedRoute>} />
              <Route path="/invoices/*" element={<ProtectedRoute module="invoices"><Invoices /></ProtectedRoute>} />
              <Route path="/cheatsheets" element={<ProtectedRoute module="cheatsheets"><CookingCheatsheets /></ProtectedRoute>} />
              <Route path="/calendar" element={<ProtectedRoute module="calendar"><OperationsCalendar /></ProtectedRoute>} />
              <Route path="/kitchen-sections" element={<ProtectedRoute module="calendar"><KitchenSections /></ProtectedRoute>} />
              <Route path="/equipment" element={<ProtectedRoute module="equipment"><Equipment /></ProtectedRoute>} />
              <Route path="/team" element={<ProtectedRoute module="team"><Team /></ProtectedRoute>} />
              <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
              <Route path="/more" element={<ProtectedRoute><More /></ProtectedRoute>} />

              {/* ========== VENDOR PORTAL ========== */}
              <Route path="/vendor/auth" element={<VendorAuth />} />
              <Route path="/vendor" element={<VendorLayout />}>
                <Route path="dashboard" element={<VendorDashboard />} />
                <Route path="insights" element={<VendorInsights />} />
                <Route path="pricing" element={<VendorPricing />} />
                <Route path="orders" element={<VendorOrders />} />
                <Route path="deals" element={<VendorDeals />} />
                <Route path="messages" element={<VendorMessages />} />
                <Route path="settings" element={<VendorSettings />} />
              </Route>

              {/* ========== ADMIN PORTAL ========== */}
              <Route path="/admin/auth" element={<AdminAuth />} />
              <Route path="/admin" element={<AdminLayout />}>
                <Route index element={<AdminDashboard />} />
                <Route path="vendor-deals" element={<AdminVendorDeals />} />
                <Route path="crm" element={<AdminCRM />} />
                <Route path="analytics" element={<AdminAnalytics />} />
                <Route path="marketing" element={<AdminMarketing />} />
                <Route path="testing" element={<AdminTesting />} />
                <Route path="seed" element={<AdminSeedData />} />
                <Route path="launcher" element={<AdminLauncher />} />
                <Route path="settings" element={<AdminSettings />} />
              </Route>

              {/* CATCH-ALL 404 */}
              <Route path="*" element={<NotFound />} />
            </Routes>
            <ChefAIChat />
            
          </VoiceCommandProvider>
          </OrgProvider>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
