import { useState } from "react";
import { motion } from "framer-motion";
import { 
  Thermometer,
  Flame,
  Clock,
  Droplets,
  ChefHat,
  Search
} from "lucide-react";
import AppLayout from "@/components/layout/AppLayout";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface TempChart {
  item: string;
  temp: string;
  time: string;
  notes?: string;
}

const sousVideCharts: TempChart[] = [
  { item: "Beef Steak (Rare)", temp: "52°C / 126°F", time: "1-2 hrs", notes: "Tender, ruby red center" },
  { item: "Beef Steak (Medium-Rare)", temp: "54°C / 130°F", time: "1-2 hrs", notes: "Most popular doneness" },
  { item: "Beef Steak (Medium)", temp: "57°C / 135°F", time: "1-2 hrs", notes: "Pink center" },
  { item: "Beef Steak (Medium-Well)", temp: "62°C / 144°F", time: "1-2 hrs", notes: "Slight pink" },
  { item: "Beef Short Ribs", temp: "57°C / 135°F", time: "48-72 hrs", notes: "Steak-like texture" },
  { item: "Pork Chops", temp: "58°C / 136°F", time: "1-2 hrs", notes: "Juicy and tender" },
  { item: "Pork Belly", temp: "77°C / 170°F", time: "8-10 hrs", notes: "Melt-in-mouth" },
  { item: "Chicken Breast", temp: "63°C / 146°F", time: "1-2 hrs", notes: "Juicy, not rubbery" },
  { item: "Chicken Thighs", temp: "74°C / 165°F", time: "2-4 hrs", notes: "Fall-off-bone" },
  { item: "Duck Breast", temp: "54°C / 130°F", time: "2-3 hrs", notes: "Medium-rare, sear skin" },
  { item: "Salmon", temp: "52°C / 126°F", time: "30-45 min", notes: "Silky texture" },
  { item: "Lobster Tail", temp: "60°C / 140°F", time: "45 min", notes: "Tender, not chewy" },
  { item: "Eggs (Soft)", temp: "63°C / 145°F", time: "45-60 min", notes: "Runny yolk, set white" },
  { item: "Eggs (Medium)", temp: "65°C / 149°F", time: "45-60 min", notes: "Jammy yolk" },
  { item: "Carrots", temp: "85°C / 185°F", time: "1-2 hrs", notes: "Tender-crisp" },
  { item: "Potatoes", temp: "85°C / 185°F", time: "1-2 hrs", notes: "Creamy texture" },
];

const ovenCharts: TempChart[] = [
  { item: "Prime Rib Roast", temp: "120°C / 250°F", time: "3-4 hrs", notes: "Low and slow, rest 30 min" },
  { item: "Beef Brisket", temp: "135°C / 275°F", time: "6-8 hrs", notes: "Until 93°C internal" },
  { item: "Pork Shoulder (Pulled)", temp: "120°C / 250°F", time: "8-10 hrs", notes: "Until 95°C internal" },
  { item: "Whole Chicken", temp: "180°C / 350°F", time: "1-1.5 hrs", notes: "Until 74°C internal" },
  { item: "Roast Chicken (High Heat)", temp: "220°C / 425°F", time: "45-60 min", notes: "Crispy skin method" },
  { item: "Duck Confit Legs", temp: "140°C / 285°F", time: "2-3 hrs", notes: "Submerged in fat" },
  { item: "Lamb Leg", temp: "160°C / 325°F", time: "2-3 hrs", notes: "Medium: 63°C internal" },
  { item: "Lamb Shoulder", temp: "150°C / 300°F", time: "4-5 hrs", notes: "Until fork tender" },
  { item: "Pork Belly (Crackling)", temp: "220°C / 425°F", time: "30 min + 90 min at 160°C", notes: "Start high for skin" },
  { item: "Beef Cheeks", temp: "150°C / 300°F", time: "3-4 hrs", notes: "Braised, covered" },
  { item: "Osso Buco", temp: "160°C / 325°F", time: "2.5-3 hrs", notes: "Braised in liquid" },
  { item: "Whole Fish", temp: "200°C / 400°F", time: "20-25 min", notes: "Per 500g" },
  { item: "Roasted Vegetables", temp: "200°C / 400°F", time: "30-45 min", notes: "High heat for caramelization" },
  { item: "Bread (Artisan)", temp: "230°C / 450°F", time: "25-30 min", notes: "Steam first 10 min" },
];

const steamCharts: TempChart[] = [
  { item: "Asparagus (Thin)", temp: "100°C / 212°F", time: "2-3 min", notes: "Bright green, tender-crisp" },
  { item: "Asparagus (Thick)", temp: "100°C / 212°F", time: "4-5 min", notes: "Test with knife" },
  { item: "Broccoli Florets", temp: "100°C / 212°F", time: "3-4 min", notes: "Vibrant color" },
  { item: "Green Beans", temp: "100°C / 212°F", time: "4-5 min", notes: "Snap when bent" },
  { item: "Carrots (Sliced)", temp: "100°C / 212°F", time: "4-5 min", notes: "Tender but firm" },
  { item: "Carrots (Whole Baby)", temp: "100°C / 212°F", time: "8-10 min", notes: "Fork tender" },
  { item: "Cauliflower Florets", temp: "100°C / 212°F", time: "5-6 min", notes: "Tender, not mushy" },
  { item: "Corn on Cob", temp: "100°C / 212°F", time: "4-6 min", notes: "Kernels tender" },
  { item: "Potatoes (Cubed)", temp: "100°C / 212°F", time: "10-12 min", notes: "Fork tender" },
  { item: "Snow Peas", temp: "100°C / 212°F", time: "2-3 min", notes: "Bright and crisp" },
  { item: "Spinach", temp: "100°C / 212°F", time: "1-2 min", notes: "Just wilted" },
  { item: "Bok Choy", temp: "100°C / 212°F", time: "2-3 min", notes: "Stems slightly crisp" },
  { item: "Fish Fillet (1 inch)", temp: "100°C / 212°F", time: "6-8 min", notes: "Flakes easily" },
  { item: "Mussels", temp: "100°C / 212°F", time: "3-5 min", notes: "Until shells open" },
  { item: "Dim Sum / Dumplings", temp: "100°C / 212°F", time: "8-12 min", notes: "Wrapper translucent" },
  { item: "Eggs (Steamed)", temp: "100°C / 212°F", time: "10-12 min", notes: "Hard cooked" },
];

const CookingCheatsheets = () => {
  const [searchQuery, setSearchQuery] = useState("");

  const filterCharts = (charts: TempChart[]) => {
    if (!searchQuery) return charts;
    return charts.filter(c => 
      c.item.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.notes?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  };

  const ChartTable = ({ data, icon: Icon, color }: { data: TempChart[]; icon: typeof Thermometer; color: string }) => {
    const filtered = filterCharts(data);
    
    return (
      <div className="card-elevated overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted/50">
              <tr className="text-left text-xs text-muted-foreground uppercase tracking-wider">
                <th className="px-4 py-3 font-medium">Item</th>
                <th className="px-4 py-3 font-medium">Temperature</th>
                <th className="px-4 py-3 font-medium">Time</th>
                <th className="px-4 py-3 font-medium">Notes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map((row, idx) => (
                <tr key={idx} className="hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Icon className={cn("w-4 h-4", color)} />
                      <span className="font-medium">{row.item}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 font-mono text-sm">{row.temp}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-muted-foreground" />
                      <span>{row.time}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground text-sm">{row.notes}</td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-4 py-8 text-center text-muted-foreground">
                    No items match your search
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  return (
    <AppLayout>
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
        >
          <div>
            <h1 className="page-title font-display">Cooking Cheatsheets</h1>
            <p className="page-subtitle">Quick reference for temperatures and cooking times</p>
          </div>
        </motion.div>

        {/* Search */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="relative"
        >
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input
            placeholder="Search items..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </motion.div>

        {/* Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
        >
          <Tabs defaultValue="sous-vide" className="space-y-4">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="sous-vide" className="flex items-center gap-2">
                <Droplets className="w-4 h-4" />
                <span className="hidden sm:inline">Sous Vide</span>
              </TabsTrigger>
              <TabsTrigger value="oven" className="flex items-center gap-2">
                <Flame className="w-4 h-4" />
                <span className="hidden sm:inline">Oven / Roasting</span>
              </TabsTrigger>
              <TabsTrigger value="steam" className="flex items-center gap-2">
                <Thermometer className="w-4 h-4" />
                <span className="hidden sm:inline">Steam Times</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="sous-vide">
              <div className="space-y-4">
                <div className="card-elevated p-4 border-l-4 border-l-primary">
                  <div className="flex items-center gap-3">
                    <Droplets className="w-5 h-5 text-primary" />
                    <div>
                      <p className="font-semibold">Sous Vide Temperature Guide</p>
                      <p className="text-sm text-muted-foreground">
                        Precision water bath cooking temperatures and times
                      </p>
                    </div>
                  </div>
                </div>
                <ChartTable data={sousVideCharts} icon={Droplets} color="text-primary" />
              </div>
            </TabsContent>

            <TabsContent value="oven">
              <div className="space-y-4">
                <div className="card-elevated p-4 border-l-4 border-l-warning">
                  <div className="flex items-center gap-3">
                    <Flame className="w-5 h-5 text-warning" />
                    <div>
                      <p className="font-semibold">Oven & Slow Cooking Guide</p>
                      <p className="text-sm text-muted-foreground">
                        Roasting, braising, and slow cooking temperatures
                      </p>
                    </div>
                  </div>
                </div>
                <ChartTable data={ovenCharts} icon={Flame} color="text-warning" />
              </div>
            </TabsContent>

            <TabsContent value="steam">
              <div className="space-y-4">
                <div className="card-elevated p-4 border-l-4 border-l-success">
                  <div className="flex items-center gap-3">
                    <Thermometer className="w-5 h-5 text-success" />
                    <div>
                      <p className="font-semibold">Steam Times Guide</p>
                      <p className="text-sm text-muted-foreground">
                        Steaming times for vegetables, seafood, and more
                      </p>
                    </div>
                  </div>
                </div>
                <ChartTable data={steamCharts} icon={Thermometer} color="text-success" />
              </div>
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>
    </AppLayout>
  );
};

export default CookingCheatsheets;
