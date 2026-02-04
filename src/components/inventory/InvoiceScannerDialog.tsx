import { useState, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Checkbox } from "@/components/ui/checkbox";
import {
  FileText,
  Upload,
  Loader2,
  Check,
  AlertTriangle,
  Package,
  Camera,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface ExtractedItem {
  name: string;
  quantity: number;
  unit: string;
  price?: number;
  matched_ingredient_id?: string;
  matched_ingredient_name?: string;
  confidence: number;
  selected: boolean;
}

interface InvoiceScannerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onComplete?: () => void;
}

const InvoiceScannerDialog = ({
  open,
  onOpenChange,
  onComplete,
}: InvoiceScannerDialogProps) => {
  const { profile } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [step, setStep] = useState<"upload" | "processing" | "review" | "complete">("upload");
  const [loading, setLoading] = useState(false);
  const [extractedItems, setExtractedItems] = useState<ExtractedItem[]>([]);
  const [invoiceFile, setInvoiceFile] = useState<File | null>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setInvoiceFile(file);
    }
  };

  const processInvoice = async () => {
    if (!invoiceFile) return;
    
    setStep("processing");
    setLoading(true);

    try {
      // Convert file to base64
      const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          const result = reader.result as string;
          resolve(result.split(",")[1]);
        };
        reader.onerror = reject;
        reader.readAsDataURL(invoiceFile);
      });

      // Get existing ingredients for matching
      const { data: ingredients } = await supabase
        .from("ingredients")
        .select("id, name, unit");

      // Call the AI extraction function
      const { data, error } = await supabase.functions.invoke("extract-invoice", {
        body: {
          image_base64: base64,
          file_type: invoiceFile.type,
          existing_ingredients: ingredients || [],
        },
      });

      if (error) throw error;

      const items: ExtractedItem[] = (data.items || []).map((item: any) => ({
        ...item,
        selected: item.confidence > 0.7,
      }));

      setExtractedItems(items);
      setStep("review");
    } catch (error) {
      console.error("Failed to process invoice:", error);
      toast.error("Failed to process invoice. Please try again.");
      setStep("upload");
    } finally {
      setLoading(false);
    }
  };

  const toggleItem = (index: number) => {
    const updated = [...extractedItems];
    updated[index].selected = !updated[index].selected;
    setExtractedItems(updated);
  };

  const updateItemQuantity = (index: number, quantity: number) => {
    const updated = [...extractedItems];
    updated[index].quantity = quantity;
    setExtractedItems(updated);
  };

  const applyInventoryUpdates = async () => {
    setLoading(true);

    try {
      const selectedItems = extractedItems.filter((i) => i.selected);

      for (const item of selectedItems) {
        if (item.matched_ingredient_id) {
          // Get current stock
          const { data: ing } = await supabase
            .from("ingredients")
            .select("current_stock")
            .eq("id", item.matched_ingredient_id)
            .single();

          const currentStock = Number(ing?.current_stock) || 0;
          const newStock = currentStock + item.quantity;

          // Update ingredient stock
          await supabase
            .from("ingredients")
            .update({ current_stock: newStock })
            .eq("id", item.matched_ingredient_id);

          // Update inventory if exists
          await supabase
            .from("inventory")
            .update({ quantity: newStock })
            .eq("ingredient_id", item.matched_ingredient_id);

          // Create stock movement
          await supabase.from("stock_movements").insert({
            ingredient_id: item.matched_ingredient_id,
            movement_type: "received",
            quantity_change: item.quantity,
            quantity_before: currentStock,
            quantity_after: newStock,
            source: "invoice",
            notes: `Invoice scan: +${item.quantity} ${item.unit}`,
            recorded_by: profile?.user_id,
            recorded_by_name: profile?.full_name,
          });
        }
      }

      toast.success(`Updated ${selectedItems.length} inventory items`);
      setStep("complete");
      onComplete?.();
      
      setTimeout(() => {
        onOpenChange(false);
        resetDialog();
      }, 2000);
    } catch (error) {
      console.error("Failed to update inventory:", error);
      toast.error("Failed to update inventory");
    } finally {
      setLoading(false);
    }
  };

  const resetDialog = () => {
    setStep("upload");
    setInvoiceFile(null);
    setExtractedItems([]);
  };

  const selectedCount = extractedItems.filter((i) => i.selected).length;

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) resetDialog(); onOpenChange(o); }}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            {step === "upload" && "Scan Invoice"}
            {step === "processing" && "Processing Invoice..."}
            {step === "review" && "Review Extracted Items"}
            {step === "complete" && "Inventory Updated"}
          </DialogTitle>
          <DialogDescription>
            {step === "upload" && "Upload a supplier invoice to automatically update inventory"}
            {step === "processing" && "AI is extracting items from your invoice"}
            {step === "review" && `${extractedItems.length} items found - select items to add to inventory`}
            {step === "complete" && "Your inventory has been updated successfully"}
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          {/* Upload Step */}
          {step === "upload" && (
            <div className="space-y-4">
              <div
                onClick={() => fileInputRef.current?.click()}
                className={cn(
                  "border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors",
                  "hover:border-primary hover:bg-primary/5",
                  invoiceFile ? "border-success bg-success/5" : "border-border"
                )}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*,.pdf"
                  onChange={handleFileSelect}
                  className="hidden"
                />
                {invoiceFile ? (
                  <div className="space-y-2">
                    <Check className="w-12 h-12 text-success mx-auto" />
                    <p className="font-medium">{invoiceFile.name}</p>
                    <p className="text-sm text-muted-foreground">
                      Click to select a different file
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="flex justify-center gap-4 mb-4">
                      <div className="p-3 rounded-xl bg-primary/10">
                        <Upload className="w-8 h-8 text-primary" />
                      </div>
                      <div className="p-3 rounded-xl bg-primary/10">
                        <Camera className="w-8 h-8 text-primary" />
                      </div>
                    </div>
                    <p className="font-medium">Upload Invoice Image</p>
                    <p className="text-sm text-muted-foreground">
                      Drag and drop or click to select
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Supports: JPG, PNG, PDF
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Processing Step */}
          {step === "processing" && (
            <div className="text-center py-12 space-y-4">
              <Loader2 className="w-12 h-12 text-primary mx-auto animate-spin" />
              <p className="font-medium">Analyzing invoice...</p>
              <p className="text-sm text-muted-foreground">
                AI is extracting items and matching to your ingredients
              </p>
              <Progress value={66} className="max-w-xs mx-auto" />
            </div>
          )}

          {/* Review Step */}
          {step === "review" && (
            <div className="space-y-4">
              {extractedItems.length === 0 ? (
                <div className="text-center py-8">
                  <AlertTriangle className="w-12 h-12 text-warning mx-auto mb-2" />
                  <p className="font-medium">No items detected</p>
                  <p className="text-sm text-muted-foreground">
                    Try uploading a clearer image
                  </p>
                </div>
              ) : (
                <div className="space-y-2 max-h-[400px] overflow-y-auto">
                  {extractedItems.map((item, index) => (
                    <div
                      key={index}
                      className={cn(
                        "flex items-center gap-4 p-4 rounded-lg border transition-colors",
                        item.selected ? "bg-primary/5 border-primary" : "bg-muted/50"
                      )}
                    >
                      <Checkbox
                        checked={item.selected}
                        onCheckedChange={() => toggleItem(index)}
                      />
                      <div className="p-2 rounded-lg bg-muted">
                        <Package className="w-4 h-4 text-muted-foreground" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{item.name}</span>
                          {item.matched_ingredient_name && (
                            <Badge variant="secondary" className="text-xs">
                              → {item.matched_ingredient_name}
                            </Badge>
                          )}
                        </div>
                        {!item.matched_ingredient_id && (
                          <p className="text-xs text-warning flex items-center gap-1">
                            <AlertTriangle className="w-3 h-3" />
                            No matching ingredient found
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <Input
                          type="number"
                          min="0"
                          step="0.1"
                          value={item.quantity}
                          onChange={(e) => updateItemQuantity(index, parseFloat(e.target.value) || 0)}
                          className="w-20 h-8"
                        />
                        <span className="text-sm text-muted-foreground w-8">{item.unit}</span>
                      </div>
                      <Badge
                        variant={item.confidence > 0.8 ? "default" : item.confidence > 0.5 ? "secondary" : "outline"}
                      >
                        {Math.round(item.confidence * 100)}%
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Complete Step */}
          {step === "complete" && (
            <div className="text-center py-12">
              <div className="w-16 h-16 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-4">
                <Check className="w-8 h-8 text-success" />
              </div>
              <p className="font-medium text-success">Inventory Updated!</p>
              <p className="text-sm text-muted-foreground mt-1">
                {selectedCount} items have been added to your inventory
              </p>
            </div>
          )}
        </div>

        <DialogFooter>
          {step === "upload" && (
            <>
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button onClick={processInvoice} disabled={!invoiceFile || loading}>
                {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <FileText className="w-4 h-4 mr-2" />}
                Process Invoice
              </Button>
            </>
          )}

          {step === "review" && (
            <>
              <Button variant="outline" onClick={() => setStep("upload")}>
                Upload Different Invoice
              </Button>
              <Button onClick={applyInventoryUpdates} disabled={loading || selectedCount === 0}>
                {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Check className="w-4 h-4 mr-2" />}
                Update {selectedCount} Items
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default InvoiceScannerDialog;
