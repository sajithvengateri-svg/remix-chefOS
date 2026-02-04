import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import Recipes from "./pages/Recipes";
import RecipeDetail from "./pages/RecipeDetail";
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
import More from "./pages/More";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/recipes" element={<Recipes />} />
          <Route path="/recipes/:id" element={<RecipeDetail />} />
          <Route path="/ingredients" element={<Ingredients />} />
          <Route path="/inventory" element={<Inventory />} />
          <Route path="/inventory/*" element={<Inventory />} />
          <Route path="/prep" element={<PrepLists />} />
          <Route path="/prep/*" element={<PrepLists />} />
          <Route path="/production" element={<Production />} />
          <Route path="/menu-engineering" element={<MenuEngineering />} />
          <Route path="/roster" element={<Roster />} />
          <Route path="/allergens" element={<AllergenDashboard />} />
          <Route path="/food-safety" element={<FoodSafety />} />
          <Route path="/training" element={<Training />} />
          <Route path="/invoices" element={<Invoices />} />
          <Route path="/invoices/*" element={<Invoices />} />
          <Route path="/cheatsheets" element={<CookingCheatsheets />} />
          <Route path="/more" element={<More />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
