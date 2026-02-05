import { useState } from "react";
import { useEffect } from "react";
import { motion } from "framer-motion";
import { 
  Store, 
  Search, 
  Filter, 
  TrendingUp, 
  Zap, 
  MessageSquare, 
  Star, 
  MapPin,
  Clock,
  DollarSign,
  BarChart3,
  Lock,
  Bell
} from "lucide-react";
import AppLayout from "@/components/layout/AppLayout";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import DemandInsightsPanel from "@/components/marketplace/DemandInsightsPanel";
import { supabase } from "@/integrations/supabase/client";

// Placeholder suppliers - will be populated from vendor_profiles
const placeholderSuppliers = [
  { 
    id: "1", 
    name: "Lorem Ipsum", 
    category: "Produce", 
    rating: 0, 
    location: "Consectetur",
    deliveryDays: ["Dies", "Lunae"],
    specialsCount: 0,
    verified: false
  },
  { 
    id: "2", 
    name: "Dolor Sit Amet", 
    category: "Seafood", 
    rating: 0, 
    location: "Adipiscing",
    deliveryDays: ["Martis"],
    specialsCount: 0,
    verified: false
  },
  { 
    id: "3", 
    name: "Consectetur Elit", 
    category: "Meat", 
    rating: 0, 
    location: "Tempor",
    deliveryDays: ["Mercurii"],
    specialsCount: 0,
    verified: false
  },
  { 
    id: "4", 
    name: "Sed Do Eiusmod", 
    category: "Dairy", 
    rating: 0, 
    location: "Incididunt",
    deliveryDays: ["Iovis"],
    specialsCount: 0,
    verified: false
  },
];

const placeholderSpecials: {
  id: string;
  supplier: string;
  item: string;
  originalPrice: number;
  specialPrice: number;
  unit: string;
  expiresIn: string;
  category: string;
}[] = [];

const placeholderPriceComparison: {
  ingredient: string;
  suppliers: { name: string; price: number; unit: string }[];
}[] = [];

const Marketplace = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("demand");
  const [vendorCount, setVendorCount] = useState(0);

  useEffect(() => {
    // Fetch approved vendor count
    const fetchVendorCount = async () => {
      const { count } = await supabase
        .from("vendor_profiles")
        .select("*", { count: "exact", head: true })
        .eq("status", "approved");
      setVendorCount(count || 0);
    };
    fetchVendorCount();
  }, []);

  return (
    <AppLayout>
      <div className="space-y-6 max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
        >
          <div>
            <h1 className="text-2xl font-display font-bold text-foreground">Marketplace</h1>
            <p className="text-muted-foreground">Connect with suppliers, compare prices, get deals</p>
          </div>
          <Badge variant="secondary" className="w-fit gap-2">
            <Lock className="w-3 h-3" />
            Recipe data protected
          </Badge>
        </motion.div>

        {/* Search & Filters */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex gap-3"
        >
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search suppliers, ingredients, or deals..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button variant="outline" size="icon">
            <Filter className="w-4 h-4" />
          </Button>
          <Button variant="outline" size="icon">
            <Bell className="w-4 h-4" />
          </Button>
        </motion.div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="demand" className="gap-2">
              <TrendingUp className="w-4 h-4" />
              <span className="hidden sm:inline">Demand</span>
            </TabsTrigger>
            <TabsTrigger value="suppliers" className="gap-2">
              <Store className="w-4 h-4" />
              <span className="hidden sm:inline">Suppliers</span>
            </TabsTrigger>
            <TabsTrigger value="specials" className="gap-2">
              <Zap className="w-4 h-4" />
              <span className="hidden sm:inline">Specials</span>
            </TabsTrigger>
            <TabsTrigger value="compare" className="gap-2">
              <BarChart3 className="w-4 h-4" />
              <span className="hidden sm:inline">Compare</span>
            </TabsTrigger>
            <TabsTrigger value="messages" className="gap-2">
              <MessageSquare className="w-4 h-4" />
              <span className="hidden sm:inline">Messages</span>
            </TabsTrigger>
          </TabsList>

          {/* Demand Insights Tab */}
          <TabsContent value="demand" className="space-y-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-primary" />
                  Live Ingredient Demand
                </CardTitle>
                <CardDescription>
                  See what ingredients chefs in your area are using most. Data is aggregated weekly.
                </CardDescription>
              </CardHeader>
            </Card>

            <DemandInsightsPanel maxItems={15} />
          </TabsContent>

          {/* Suppliers Tab */}
          <TabsContent value="suppliers" className="space-y-4">
            {placeholderSuppliers.length > 0 ? (
              <div className="grid gap-4 sm:grid-cols-2">
                {placeholderSuppliers.map((supplier) => (
                  <motion.div
                    key={supplier.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    whileHover={{ scale: 1.02 }}
                    className="card-elevated p-4 cursor-pointer opacity-60"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center">
                          <Store className="w-6 h-6 text-muted-foreground" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold text-muted-foreground">{supplier.name}</h3>
                          </div>
                          <p className="text-sm text-muted-foreground">{supplier.category}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <Star className="w-4 h-4" />
                        <span className="text-sm">—</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {supplier.location}
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {supplier.deliveryDays.join(", ")}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <Store className="w-12 h-12 mx-auto mb-4 opacity-30" />
                <p>No suppliers connected yet</p>
              </div>
            )}

            <div className="text-center py-8 text-muted-foreground">
              <p className="text-sm">
                {vendorCount > 0 
                  ? `${vendorCount} approved vendors in the marketplace` 
                  : "Supplier connections coming soon..."}
              </p>
              <p className="text-xs mt-1">Connect with local suppliers to get the best deals</p>
            </div>
          </TabsContent>

          {/* Specials Tab */}
          <TabsContent value="specials" className="space-y-4">
            <Card className="border-dashed">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-primary" />
                  Live Deals
                </CardTitle>
                <CardDescription>
                  Prices updated weekly to prevent market manipulation
                </CardDescription>
              </CardHeader>
            </Card>

            {placeholderSpecials.length > 0 ? (
              <div className="grid gap-4">
                {placeholderSpecials.map((special) => (
                  <motion.div
                    key={special.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="card-elevated p-4 flex items-center gap-4"
                  >
                    <div className="w-12 h-12 rounded-xl bg-success/10 flex items-center justify-center">
                      <DollarSign className="w-6 h-6 text-success" />
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold">{special.item}</h3>
                        <Badge variant="outline" className="text-xs">{special.category}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{special.supplier}</p>
                    </div>

                    <div className="text-right">
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground line-through">
                          ${special.originalPrice.toFixed(2)}
                        </span>
                        <span className="text-lg font-bold text-success">
                          ${special.specialPrice.toFixed(2)}
                        </span>
                        <span className="text-sm text-muted-foreground">/{special.unit}</span>
                      </div>
                      <p className="text-xs text-warning">Expires in {special.expiresIn}</p>
                    </div>

                    <Button variant="outline" size="sm">
                      <MessageSquare className="w-4 h-4 mr-2" />
                      Contact
                    </Button>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <Zap className="w-12 h-12 mx-auto mb-4 opacity-30" />
                <p>No active specials</p>
                <p className="text-sm mt-1">Deals will appear here when suppliers post them</p>
              </div>
            )}
          </TabsContent>

          {/* Compare Tab */}
          <TabsContent value="compare" className="space-y-4">
            <Card className="border-dashed">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-primary" />
                  Price Comparison
                </CardTitle>
                <CardDescription>
                  Compare prices across suppliers for your most-used ingredients
                </CardDescription>
              </CardHeader>
            </Card>

            {placeholderPriceComparison.length > 0 ? (
              <div className="space-y-4">
                {placeholderPriceComparison.map((item, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    className="card-elevated p-4"
                  >
                    <h3 className="font-semibold mb-3">{item.ingredient}</h3>
                    <div className="grid gap-2">
                      {item.suppliers
                        .sort((a, b) => a.price - b.price)
                        .map((supplier, sIdx) => (
                          <div 
                            key={sIdx}
                            className={cn(
                              "flex items-center justify-between p-2 rounded-lg",
                              sIdx === 0 && "bg-success/10"
                            )}
                          >
                            <span className={cn(
                              "text-sm",
                              sIdx === 0 ? "font-medium" : "text-muted-foreground"
                            )}>
                              {supplier.name}
                              {sIdx === 0 && (
                                <Badge variant="secondary" className="ml-2 text-xs">Best Price</Badge>
                              )}
                            </span>
                            <span className={cn(
                              "font-mono",
                              sIdx === 0 ? "font-bold text-success" : "text-muted-foreground"
                            )}>
                              ${supplier.price.toFixed(2)}/{supplier.unit}
                            </span>
                          </div>
                        ))}
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <BarChart3 className="w-12 h-12 mx-auto mb-4 opacity-30" />
                <p>No price data available</p>
                <p className="text-sm mt-1">Connect suppliers to compare prices</p>
              </div>
            )}
          </TabsContent>

          {/* Messages Tab */}
          <TabsContent value="messages" className="space-y-4">
            <Card className="border-dashed">
              <CardContent className="pt-6">
                <div className="text-center py-12">
                  <div className="w-16 h-16 rounded-full bg-muted mx-auto mb-4 flex items-center justify-center">
                    <MessageSquare className="w-8 h-8 text-muted-foreground" />
                  </div>
                  <h3 className="font-semibold mb-2">Direct Messaging Coming Soon</h3>
                  <p className="text-sm text-muted-foreground max-w-md mx-auto">
                    Connect directly with suppliers to negotiate deals, ask questions, 
                    and arrange orders. Messages are private and secure.
                  </p>
                  <Button className="mt-6" disabled>
                    <Bell className="w-4 h-4 mr-2" />
                    Notify Me When Available
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Data Privacy Notice */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="card-elevated p-4 bg-muted/30"
        >
          <div className="flex items-start gap-3">
            <Lock className="w-5 h-5 text-primary mt-0.5" />
            <div>
              <h4 className="font-medium text-sm">Your Data is Protected</h4>
              <p className="text-xs text-muted-foreground mt-1">
                Your recipes remain completely private. Only anonymized, aggregated ingredient 
                usage data (by suburb) may be shared with suppliers to help them understand 
                market demand. No chef or business information is ever disclosed.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </AppLayout>
  );
};

export default Marketplace;
