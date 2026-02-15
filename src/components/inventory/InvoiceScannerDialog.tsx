import { useState, useRef } from "react";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  FileText, Upload, Loader2, Check, AlertTriangle, Package, Camera, Archive,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useOrg } from "@/contexts/OrgContext";
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

const INVOICE_TYPES = [
  { value: "food", label: "Food" },
  { value: "equipment", label: "Equipment" },
  { value: "cleaning", label: "Cleaning" },
  { value: "other", label: "Other" },
];

const InvoiceScannerDialog = ({ open, onOpenChange, onComplete }: InvoiceScannerDialogProps) => {
  const { profile } = useAuth();
  const { currentOrg } = useOrg();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [step, setStep] = useState<"upload" | "processing" | "review" | "complete">("upload");
  const [loading, setLoading] = useState(false);
  const [extractedItems, setExtractedItems] = useState<ExtractedItem[]>([]);
  const [invoiceFile, setInvoiceFile] = useState<File | null>(null);
  const [invoiceType, setInvoiceType] = useState("food");

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setInvoiceFile(file);
  };

  const uploadToStorage = async (file: File): Promise<string | null> => {
    if (!currentOrg?.id) return null;
    const path = `${currentOrg.id}/${Date.now()}_${file.name}`;
    const { error } = await supabase.storage.from("invoices").upload(path, file);
    if (error) { console.error("Upload error:", error); return null; }
    return path;
  };

  const saveOnly = async () => {
    if (!invoiceFile) return;
    setLoading(true);
    try {
      const fileUrl = await uploadToStorage(invoiceFile);
      await supabase.from("invoice_scans").insert({
        file_name: invoiceFile.name,
        file_url: fileUrl,
        invoice_type: invoiceType,
        status: "archived",
        org_id: currentOrg?.id,
        scanned_by: profile?.user_id,
        items_extracted: 0, items_matched: 0, prices_updated: 0,
      } as any);
      toast.success("Invoice archived");
      setStep("complete");
      onComplete?.();
      setTimeout(() => { onOpenChange(false); resetDialog(); }, 1500);
    } catch { toast.error("Failed to save"); }
    finally { setLoading(false); }
  };

  const processInvoice = async () => {
    if (!invoiceFile) return;
    setStep("processing");
    setLoading(true);

    try {
      // Upload file to storage
      const fileUrl = await uploadToStorage(invoiceFile);

      const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve((reader.result as string).split(",")[1]);
        reader.onerror = reject;
        reader.readAsDataURL(invoiceFile);
      });

      const { data: ingredients } = await supabase.from("ingredients").select("id, name, unit");

      const { data, error } = await supabase.functions.invoke("extract-invoice", {
        body: { image_base64: base64, file_type: invoiceFile.type, existing_ingredients: ingredients || [] },
      });
      if (error) throw error;

      // Create invoice_scans record with file_url
      await supabase.from("invoice_scans").insert({
        file_name: invoiceFile.name,
        file_url: fileUrl,
        invoice_type: invoiceType,
        status: "completed",
        org_id: currentOrg?.id,
        scanned_by: profile?.user_id,
        items_extracted: data.items?.length || 0,
        items_matched: data.items?.filter((i: any) => i.matched_ingredient_id).length || 0,
        prices_updated: 0,
      } as any);

      const items: ExtractedItem[] = (data.items || []).map((item: any) => ({
        ...item, selected: item.confidence > 0.7,
      }));
      setExtractedItems(items);
      setStep("review");
    } catch (error) {
      console.error("Failed to process invoice:", error);
      toast.error("Failed to process invoice. Please try again.");
      setStep("upload");
    } finally { setLoading(false); }
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
          const { data: ing } = await supabase.from("ingredients").select("current_stock").eq("id", item.matched_ingredient_id).single();
          const currentStock = Number(ing?.current_stock) || 0;
          const newStock = currentStock + item.quantity;
          await supabase.from("ingredients").update({ current_stock: newStock }).eq("id", item.matched_ingredient_id);
          await supabase.from("inventory").update({ quantity: newStock }).eq("ingredient_id", item.matched_ingredient_id);
        }
      }
      toast.success(`Updated ${selectedItems.length} inventory items`);
      setStep("complete");
      onComplete?.();
      setTimeout(() => { onOpenChange(false); resetDialog(); }, 2000);
    } catch { toast.error("Failed to update inventory"); }
    finally { setLoading(false); }
  };

  const resetDialog = () => { setStep("upload"); setInvoiceFile(null); setExtractedItems([]); setInvoiceType("food"); };
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
            {step === "complete" && "Done"}
          </DialogTitle>
          <DialogDescription>
            {step === "upload" && "Upload a supplier invoice — extract data or archive it"}
            {step === "processing" && "AI is extracting items from your invoice"}
            {step === "review" && `${extractedItems.length} items found`}
            {step === "complete" && "Invoice processed successfully"}
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          {step === "upload" && (
            <div className="space-y-4">
              {/* Invoice Type Selector */}
              <div className="space-y-2">
                <Label>Invoice Type</Label>
                <Select value={invoiceType} onValueChange={setInvoiceType}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {INVOICE_TYPES.map(t => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
                  </SelectContent>
                </Select>
                {invoiceType !== "food" && (
                  <p className="text-xs text-muted-foreground">Non-food invoices can be saved without extraction</p>
                )}
              </div>

              <div
                onClick={() => fileInputRef.current?.click()}
                className={cn(
                  "border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors",
                  "hover:border-primary hover:bg-primary/5",
                  invoiceFile ? "border-success bg-success/5" : "border-border"
                )}
              >
                <input ref={fileInputRef} type="file" accept="image/*,.pdf" onChange={handleFileSelect} className="hidden" />
                {invoiceFile ? (
                  <div className="space-y-2">
                    <Check className="w-12 h-12 text-success mx-auto" />
                    <p className="font-medium">{invoiceFile.name}</p>
                    <p className="text-sm text-muted-foreground">Click to change</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="flex justify-center gap-4 mb-4">
                      <div className="p-3 rounded-xl bg-primary/10"><Upload className="w-8 h-8 text-primary" /></div>
                      <div className="p-3 rounded-xl bg-primary/10"><Camera className="w-8 h-8 text-primary" /></div>
                    </div>
                    <p className="font-medium">Upload Invoice Image</p>
                    <p className="text-sm text-muted-foreground">Supports: JPG, PNG, PDF</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {step === "processing" && (
            <div className="text-center py-12 space-y-4">
              <Loader2 className="w-12 h-12 text-primary mx-auto animate-spin" />
              <p className="font-medium">Analyzing invoice...</p>
              <Progress value={66} className="max-w-xs mx-auto" />
            </div>
          )}

          {step === "review" && (
            <div className="space-y-4">
              {extractedItems.length === 0 ? (
                <div className="text-center py-8">
                  <AlertTriangle className="w-12 h-12 text-warning mx-auto mb-2" />
                  <p className="font-medium">No items detected</p>
                </div>
              ) : (
                <div className="space-y-2 max-h-[400px] overflow-y-auto">
                  {extractedItems.map((item, index) => (
                    <div key={index} className={cn("flex items-center gap-4 p-4 rounded-lg border transition-colors", item.selected ? "bg-primary/5 border-primary" : "bg-muted/50")}>
                      <Checkbox checked={item.selected} onCheckedChange={() => toggleItem(index)} />
                      <div className="p-2 rounded-lg bg-muted"><Package className="w-4 h-4 text-muted-foreground" /></div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{item.name}</span>
                          {item.matched_ingredient_name && <Badge variant="secondary" className="text-xs">→ {item.matched_ingredient_name}</Badge>}
                        </div>
                        {!item.matched_ingredient_id && (
                          <p className="text-xs text-warning flex items-center gap-1"><AlertTriangle className="w-3 h-3" />No match</p>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <Input type="number" min="0" step="0.1" value={item.quantity} onChange={(e) => updateItemQuantity(index, parseFloat(e.target.value) || 0)} className="w-20 h-8" />
                        <span className="text-sm text-muted-foreground w-8">{item.unit}</span>
                      </div>
                      <Badge variant={item.confidence > 0.8 ? "default" : "secondary"}>{Math.round(item.confidence * 100)}%</Badge>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {step === "complete" && (
            <div className="text-center py-12">
              <div className="w-16 h-16 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-4">
                <Check className="w-8 h-8 text-success" />
              </div>
              <p className="font-medium text-success">Done!</p>
            </div>
          )}
        </div>

        <DialogFooter>
          {step === "upload" && (
            <>
              <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
              <Button variant="outline" onClick={saveOnly} disabled={!invoiceFile || loading}>
                <Archive className="w-4 h-4 mr-2" />Save Only
              </Button>
              <Button onClick={processInvoice} disabled={!invoiceFile || loading}>
                {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <FileText className="w-4 h-4 mr-2" />}
                Extract & Process
              </Button>
            </>
          )}
          {step === "review" && (
            <>
              <Button variant="outline" onClick={() => setStep("upload")}>Back</Button>
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
