import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Calculator, 
  DollarSign, 
  Percent, 
  Target,
  ArrowRight,
  TrendingUp,
  RefreshCw,
  X
} from "lucide-react";
import { calculateReverseCost, calculateSellPriceFromCost, calculateFoodCostPercent } from "@/stores/costingStore";
import { cn } from "@/lib/utils";

interface FoodCostCalculatorProps {
  isOpen: boolean;
  onClose: () => void;
  initialSellPrice?: number;
  initialTargetPercent?: number;
  initialCost?: number;
}

type CalculationMode = "reverse" | "forward" | "target";

const FoodCostCalculator = ({ 
  isOpen, 
  onClose,
  initialSellPrice = 0,
  initialTargetPercent = 30,
  initialCost = 0,
}: FoodCostCalculatorProps) => {
  const [mode, setMode] = useState<CalculationMode>("reverse");
  const [sellPrice, setSellPrice] = useState(initialSellPrice);
  const [targetPercent, setTargetPercent] = useState(initialTargetPercent);
  const [actualCost, setActualCost] = useState(initialCost);
  const [servings, setServings] = useState(1);

  useEffect(() => {
    if (isOpen) {
      setSellPrice(initialSellPrice);
      setTargetPercent(initialTargetPercent);
      setActualCost(initialCost);
    }
  }, [isOpen, initialSellPrice, initialTargetPercent, initialCost]);

  // Calculations based on mode
  const reverseResult = calculateReverseCost(sellPrice, targetPercent, servings);
  const forwardSellPrice = calculateSellPriceFromCost(actualCost, targetPercent);
  const actualFoodCostPercent = sellPrice > 0 ? calculateFoodCostPercent(actualCost, sellPrice) : 0;

  const isOverBudget = actualCost > reverseResult.maxAllowedCost && actualCost > 0;
  const costVariance = actualCost - reverseResult.maxAllowedCost;

  const modes = [
    { id: "reverse" as const, label: "Max Cost", icon: Target, description: "Set price & target % → Get max cost" },
    { id: "forward" as const, label: "Set Price", icon: DollarSign, description: "Set cost & target % → Get sell price" },
    { id: "target" as const, label: "Check %", icon: Percent, description: "Set cost & price → Get actual %" },
  ];

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/20 backdrop-blur-sm p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="bg-card rounded-2xl shadow-lg max-w-lg w-full max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-5 border-b border-border">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-primary/10">
                <Calculator className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h2 className="font-display text-lg font-semibold">Food Cost Calculator</h2>
                <p className="text-sm text-muted-foreground">Reverse engineer your pricing</p>
              </div>
            </div>
            <button 
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-muted transition-colors"
            >
              <X className="w-5 h-5 text-muted-foreground" />
            </button>
          </div>

          {/* Mode Selector */}
          <div className="p-5 border-b border-border">
            <div className="grid grid-cols-3 gap-2">
              {modes.map((m) => (
                <button
                  key={m.id}
                  onClick={() => setMode(m.id)}
                  className={cn(
                    "flex flex-col items-center gap-1 p-3 rounded-xl transition-all text-center",
                    mode === m.id
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted hover:bg-secondary text-muted-foreground"
                  )}
                >
                  <m.icon className="w-5 h-5" />
                  <span className="text-sm font-medium">{m.label}</span>
                </button>
              ))}
            </div>
            <p className="text-xs text-muted-foreground text-center mt-3">
              {modes.find(m => m.id === mode)?.description}
            </p>
          </div>

          {/* Inputs */}
          <div className="p-5 space-y-4">
            {/* Sell Price Input */}
            {(mode === "reverse" || mode === "target") && (
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Sell Price (per serving)
                </label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <input
                    type="number"
                    value={sellPrice || ""}
                    onChange={(e) => setSellPrice(parseFloat(e.target.value) || 0)}
                    placeholder="28.00"
                    className="input-field pl-10 text-lg font-semibold"
                    step="0.01"
                  />
                </div>
              </div>
            )}

            {/* Target Food Cost % */}
            {(mode === "reverse" || mode === "forward") && (
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Target Food Cost %
                </label>
                <div className="relative">
                  <Percent className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <input
                    type="number"
                    value={targetPercent || ""}
                    onChange={(e) => setTargetPercent(parseFloat(e.target.value) || 0)}
                    placeholder="30"
                    className="input-field pl-10 text-lg font-semibold"
                    min="1"
                    max="100"
                    step="0.5"
                  />
                </div>
                <div className="flex gap-2 mt-2">
                  {[22, 25, 28, 30, 32, 35].map((pct) => (
                    <button
                      key={pct}
                      onClick={() => setTargetPercent(pct)}
                      className={cn(
                        "px-3 py-1 rounded-full text-xs font-medium transition-all",
                        targetPercent === pct
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted text-muted-foreground hover:bg-secondary"
                      )}
                    >
                      {pct}%
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Actual Cost Input */}
            {(mode === "forward" || mode === "target") && (
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Actual Ingredient Cost
                </label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <input
                    type="number"
                    value={actualCost || ""}
                    onChange={(e) => setActualCost(parseFloat(e.target.value) || 0)}
                    placeholder="8.50"
                    className="input-field pl-10 text-lg font-semibold"
                    step="0.01"
                  />
                </div>
              </div>
            )}

            {/* Servings (for reverse mode) */}
            {mode === "reverse" && (
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Servings per Recipe
                </label>
                <input
                  type="number"
                  value={servings}
                  onChange={(e) => setServings(parseInt(e.target.value) || 1)}
                  min="1"
                  className="input-field text-lg font-semibold"
                />
              </div>
            )}
          </div>

          {/* Results */}
          <div className="p-5 bg-muted/30 border-t border-border space-y-4">
            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground mb-3">
              <RefreshCw className="w-4 h-4" />
              <span>Calculated Results</span>
            </div>

            {/* Reverse Mode Results */}
            {mode === "reverse" && sellPrice > 0 && (
              <>
                <div className="card-elevated p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-muted-foreground">Maximum Allowed Cost</span>
                    <Target className="w-4 h-4 text-primary" />
                  </div>
                  <p className="text-3xl font-bold text-primary">
                    ${reverseResult.maxAllowedCost.toFixed(2)}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    per serving to hit {targetPercent}% food cost
                  </p>
                </div>

                {servings > 1 && (
                  <div className="card-elevated p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-muted-foreground">Total Recipe Budget</span>
                    </div>
                    <p className="text-2xl font-bold text-foreground">
                      ${reverseResult.maxIngredientBudget.toFixed(2)}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      for {servings} servings
                    </p>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-3">
                  <div className="card-elevated p-3">
                    <p className="text-xs text-muted-foreground">Target Margin</p>
                    <p className="text-lg font-bold text-success">${reverseResult.targetMargin.toFixed(2)}</p>
                  </div>
                  <div className="card-elevated p-3">
                    <p className="text-xs text-muted-foreground">Margin %</p>
                    <p className="text-lg font-bold text-success">{reverseResult.targetMarginPercent.toFixed(1)}%</p>
                  </div>
                </div>
              </>
            )}

            {/* Forward Mode Results */}
            {mode === "forward" && actualCost > 0 && (
              <>
                <div className="card-elevated p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-muted-foreground">Recommended Sell Price</span>
                    <DollarSign className="w-4 h-4 text-primary" />
                  </div>
                  <p className="text-3xl font-bold text-primary">
                    ${forwardSellPrice.toFixed(2)}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    to achieve {targetPercent}% food cost
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="card-elevated p-3">
                    <p className="text-xs text-muted-foreground">Your Margin</p>
                    <p className="text-lg font-bold text-success">
                      ${(forwardSellPrice - actualCost).toFixed(2)}
                    </p>
                  </div>
                  <div className="card-elevated p-3">
                    <p className="text-xs text-muted-foreground">Margin %</p>
                    <p className="text-lg font-bold text-success">
                      {(100 - targetPercent).toFixed(1)}%
                    </p>
                  </div>
                </div>
              </>
            )}

            {/* Target Mode Results */}
            {mode === "target" && sellPrice > 0 && actualCost > 0 && (
              <>
                <div className={cn(
                  "card-elevated p-4 border-2",
                  isOverBudget ? "border-destructive" : "border-success"
                )}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-muted-foreground">Actual Food Cost %</span>
                    <Percent className={cn("w-4 h-4", isOverBudget ? "text-destructive" : "text-success")} />
                  </div>
                  <p className={cn(
                    "text-3xl font-bold",
                    isOverBudget ? "text-destructive" : "text-success"
                  )}>
                    {actualFoodCostPercent.toFixed(1)}%
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {isOverBudget ? "Over budget!" : "Within target range"}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="card-elevated p-3">
                    <p className="text-xs text-muted-foreground">Actual Margin</p>
                    <p className="text-lg font-bold text-foreground">
                      ${(sellPrice - actualCost).toFixed(2)}
                    </p>
                  </div>
                  <div className="card-elevated p-3">
                    <p className="text-xs text-muted-foreground">Margin %</p>
                    <p className="text-lg font-bold text-foreground">
                      {(100 - actualFoodCostPercent).toFixed(1)}%
                    </p>
                  </div>
                </div>

                {isOverBudget && (
                  <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20">
                    <p className="text-sm font-medium text-destructive">
                      Cost is ${Math.abs(costVariance).toFixed(2)} over target
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Reduce ingredients or increase sell price to ${calculateSellPriceFromCost(actualCost, targetPercent).toFixed(2)}
                    </p>
                  </div>
                )}
              </>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default FoodCostCalculator;
