import { useMemo } from "react";
import { motion } from "framer-motion";
import { MenuItem } from "@/types/menu";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface MenuMatrixChartProps {
  items: MenuItem[];
  onItemClick?: (item: MenuItem) => void;
}

const profitabilityColors = {
  star: "bg-warning text-warning-foreground",
  "plow-horse": "bg-primary text-primary-foreground",
  puzzle: "bg-success text-success-foreground",
  dog: "bg-destructive text-destructive-foreground",
};

const MenuMatrixChart = ({ items, onItemClick }: MenuMatrixChartProps) => {
  // Calculate axis ranges and bubble positions
  const chartData = useMemo(() => {
    if (items.length === 0) return { bubbles: [], avgPopularity: 0, avgMargin: 0 };

    const maxPopularity = Math.max(...items.map((i) => i.popularity), 1);
    const maxMargin = Math.max(...items.map((i) => i.contributionMargin), 1);
    const totalPopularity = items.reduce((sum, i) => sum + i.popularity, 0);
    const totalMargin = items.reduce((sum, i) => sum + i.contributionMargin, 0);
    const avgPopularity = totalPopularity / items.length;
    const avgMargin = totalMargin / items.length;

    // Calculate percentage of total sales for bubble sizing
    const bubbles = items.map((item) => {
      const popularityPercent = (item.popularity / maxPopularity) * 100;
      const marginPercent = (item.contributionMargin / maxMargin) * 100;
      const sizePercent = (item.popularity / totalPopularity) * 100;
      
      // Bubble size based on % of total sales (min 24px, max 64px)
      const size = Math.max(24, Math.min(64, 24 + sizePercent * 4));

      return {
        item,
        x: marginPercent,
        y: popularityPercent,
        size,
        sizePercent,
      };
    });

    return {
      bubbles,
      avgPopularity: (avgPopularity / maxPopularity) * 100,
      avgMargin: (avgMargin / maxMargin) * 100,
    };
  }, [items]);

  if (items.length === 0) {
    return (
      <div className="h-[400px] flex items-center justify-center text-muted-foreground">
        <p>Add menu items to see the matrix visualization</p>
      </div>
    );
  }

  return (
    <TooltipProvider>
      <div className="relative h-[400px] w-full">
        {/* Axis Labels */}
        <div className="absolute -left-6 top-1/2 -translate-y-1/2 -rotate-90 text-xs text-muted-foreground font-medium whitespace-nowrap">
          ← Low Popularity — High Popularity →
        </div>
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 text-xs text-muted-foreground font-medium">
          ← Low Margin — High Margin →
        </div>

        {/* Chart Area */}
        <div className="absolute inset-8 border border-border rounded-lg overflow-hidden">
          {/* Quadrant backgrounds */}
          <div className="absolute inset-0 grid grid-cols-2 grid-rows-2">
            {/* Top-left: Plow Horse (high popularity, low margin) */}
            <div className="bg-primary/5 border-r border-b border-border/50 flex items-start justify-start p-2">
              <span className="text-[10px] text-primary font-medium opacity-60">Plow Horse</span>
            </div>
            {/* Top-right: Star (high popularity, high margin) */}
            <div className="bg-warning/5 border-b border-border/50 flex items-start justify-end p-2">
              <span className="text-[10px] text-warning font-medium opacity-60">Star</span>
            </div>
            {/* Bottom-left: Dog (low popularity, low margin) */}
            <div className="bg-destructive/5 border-r border-border/50 flex items-end justify-start p-2">
              <span className="text-[10px] text-destructive font-medium opacity-60">Dog</span>
            </div>
            {/* Bottom-right: Puzzle (low popularity, high margin) */}
            <div className="bg-success/5 flex items-end justify-end p-2">
              <span className="text-[10px] text-success font-medium opacity-60">Puzzle</span>
            </div>
          </div>

          {/* Average lines */}
          <div
            className="absolute w-full h-px bg-muted-foreground/30"
            style={{ bottom: `${chartData.avgPopularity}%` }}
          />
          <div
            className="absolute h-full w-px bg-muted-foreground/30"
            style={{ left: `${chartData.avgMargin}%` }}
          />

          {/* Bubbles */}
          {chartData.bubbles.map(({ item, x, y, size, sizePercent }, idx) => (
            <Tooltip key={item.id}>
              <TooltipTrigger asChild>
                <motion.button
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: idx * 0.05, type: "spring" }}
                  onClick={() => onItemClick?.(item)}
                  className={cn(
                    "absolute rounded-full flex items-center justify-center shadow-md hover:shadow-lg hover:scale-110 transition-all cursor-pointer border-2 border-background",
                    profitabilityColors[item.profitability]
                  )}
                  style={{
                    width: size,
                    height: size,
                    left: `calc(${x}% - ${size / 2}px)`,
                    bottom: `calc(${y}% - ${size / 2}px)`,
                  }}
                >
                  <span className="text-[8px] font-bold truncate max-w-[90%] px-0.5">
                    {item.name.split(" ")[0]}
                  </span>
                </motion.button>
              </TooltipTrigger>
              <TooltipContent side="top" className="max-w-xs">
                <div className="space-y-1">
                  <p className="font-semibold">{item.name}</p>
                  <div className="grid grid-cols-2 gap-x-4 gap-y-0.5 text-xs">
                    <span className="text-muted-foreground">Sell Price:</span>
                    <span className="font-medium">${item.sellPrice.toFixed(2)}</span>
                    <span className="text-muted-foreground">Food Cost:</span>
                    <span className="font-medium">${item.foodCost.toFixed(2)} ({item.foodCostPercent.toFixed(1)}%)</span>
                    <span className="text-muted-foreground">Margin:</span>
                    <span className="font-medium text-success">${item.contributionMargin.toFixed(2)}</span>
                    <span className="text-muted-foreground">Sales:</span>
                    <span className="font-medium">{item.popularity} ({sizePercent.toFixed(1)}%)</span>
                  </div>
                  <p className="text-xs text-muted-foreground pt-1">Click to edit</p>
                </div>
              </TooltipContent>
            </Tooltip>
          ))}
        </div>

        {/* Legend */}
        <div className="absolute top-2 right-2 flex flex-wrap gap-2 text-xs">
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-full bg-warning" />
            <span>Star</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-full bg-primary" />
            <span>Plow Horse</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-full bg-success" />
            <span>Puzzle</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-full bg-destructive" />
            <span>Dog</span>
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
};

export default MenuMatrixChart;
