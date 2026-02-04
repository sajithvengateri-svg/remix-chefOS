import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import Recipes from "./pages/Recipes";
import Ingredients from "./pages/Ingredients";
import Inventory from "./pages/Inventory";
import PrepLists from "./pages/PrepLists";
import FoodSafety from "./pages/FoodSafety";
import Training from "./pages/Training";
import Invoices from "./pages/Invoices";
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
          <Route path="/recipes/*" element={<Recipes />} />
          <Route path="/ingredients" element={<Ingredients />} />
          <Route path="/inventory" element={<Inventory />} />
          <Route path="/inventory/*" element={<Inventory />} />
          <Route path="/prep" element={<PrepLists />} />
          <Route path="/prep/*" element={<PrepLists />} />
          <Route path="/food-safety" element={<FoodSafety />} />
          <Route path="/training" element={<Training />} />
          <Route path="/invoices" element={<Invoices />} />
          <Route path="/invoices/*" element={<Invoices />} />
          <Route path="/more" element={<More />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
