import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
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
import Team from "./pages/Team";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/auth" element={<Auth />} />
            <Route path="/" element={<ProtectedRoute module="dashboard"><Dashboard /></ProtectedRoute>} />
            <Route path="/recipes" element={<ProtectedRoute module="recipes"><Recipes /></ProtectedRoute>} />
            <Route path="/recipes/:id" element={<ProtectedRoute module="recipes"><RecipeDetail /></ProtectedRoute>} />
            <Route path="/recipes/:id/edit" element={<ProtectedRoute module="recipes"><RecipeEdit /></ProtectedRoute>} />
            <Route path="/ingredients" element={<ProtectedRoute module="ingredients"><Ingredients /></ProtectedRoute>} />
            <Route path="/inventory" element={<ProtectedRoute module="inventory"><Inventory /></ProtectedRoute>} />
            <Route path="/inventory/*" element={<ProtectedRoute module="inventory"><Inventory /></ProtectedRoute>} />
            <Route path="/prep" element={<ProtectedRoute module="prep"><PrepLists /></ProtectedRoute>} />
            <Route path="/prep/*" element={<ProtectedRoute module="prep"><PrepLists /></ProtectedRoute>} />
            <Route path="/production" element={<ProtectedRoute module="production"><Production /></ProtectedRoute>} />
            <Route path="/menu-engineering" element={<ProtectedRoute module="menu-engineering"><MenuEngineering /></ProtectedRoute>} />
            <Route path="/roster" element={<ProtectedRoute module="roster"><Roster /></ProtectedRoute>} />
            <Route path="/allergens" element={<ProtectedRoute module="allergens"><AllergenDashboard /></ProtectedRoute>} />
            <Route path="/food-safety" element={<ProtectedRoute module="food-safety"><FoodSafety /></ProtectedRoute>} />
            <Route path="/training" element={<ProtectedRoute module="training"><Training /></ProtectedRoute>} />
            <Route path="/invoices" element={<ProtectedRoute module="invoices"><Invoices /></ProtectedRoute>} />
            <Route path="/invoices/*" element={<ProtectedRoute module="invoices"><Invoices /></ProtectedRoute>} />
            <Route path="/cheatsheets" element={<ProtectedRoute module="cheatsheets"><CookingCheatsheets /></ProtectedRoute>} />
            <Route path="/calendar" element={<ProtectedRoute module="calendar"><OperationsCalendar /></ProtectedRoute>} />
            <Route path="/equipment" element={<ProtectedRoute module="equipment"><Equipment /></ProtectedRoute>} />
            <Route path="/team" element={<ProtectedRoute module="team"><Team /></ProtectedRoute>} />
            <Route path="/more" element={<ProtectedRoute><More /></ProtectedRoute>} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
