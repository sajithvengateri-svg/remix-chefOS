import { motion } from "framer-motion";
import { 
  Upload,
  Receipt,
  Clock,
  CheckCircle2,
  Eye,
  Download,
  Camera
} from "lucide-react";
import AppLayout from "@/components/layout/AppLayout";
import { cn } from "@/lib/utils";

interface Invoice {
  id: string;
  supplier: string;
  date: string;
  total: number;
  items: number;
  status: "pending" | "processed" | "verified";
}

const mockInvoices: Invoice[] = [
  { id: "1", supplier: "Sysco", date: "Today", total: 2456.78, items: 24, status: "verified" },
  { id: "2", supplier: "US Foods", date: "Today", total: 1823.45, items: 18, status: "processed" },
  { id: "3", supplier: "Local Farm Co", date: "Yesterday", total: 567.00, items: 8, status: "verified" },
  { id: "4", supplier: "Fish Market", date: "Yesterday", total: 890.50, items: 6, status: "pending" },
  { id: "5", supplier: "Wine Depot", date: "2 days ago", total: 1245.00, items: 12, status: "verified" },
];

const statusStyles = {
  pending: { bg: "bg-warning/10", text: "text-warning", label: "Pending Review" },
  processed: { bg: "bg-primary/10", text: "text-primary", label: "Processed" },
  verified: { bg: "bg-success/10", text: "text-success", label: "Verified" },
};

const Invoices = () => {
  return (
    <AppLayout>
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
        >
          <div>
            <h1 className="page-title font-display">Invoices</h1>
            <p className="page-subtitle">Scan and manage supplier invoices</p>
          </div>
        </motion.div>

        {/* Upload Section */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="card-elevated p-8"
        >
          <div className="border-2 border-dashed border-border rounded-xl p-8 text-center hover:border-primary/50 transition-colors cursor-pointer">
            <div className="flex flex-col items-center gap-4">
              <div className="p-4 rounded-full bg-primary/10">
                <Camera className="w-8 h-8 text-primary" />
              </div>
              <div>
                <p className="font-semibold text-foreground">Scan or Upload Invoice</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Take a photo or upload a PDF to automatically extract items and prices
                </p>
              </div>
              <div className="flex gap-3">
                <button className="btn-primary">
                  <Camera className="w-4 h-4 mr-2" />
                  Scan Invoice
                </button>
                <button className="flex items-center gap-2 px-4 py-2.5 rounded-lg border border-input bg-background hover:bg-muted transition-colors">
                  <Upload className="w-4 h-4" />
                  Upload File
                </button>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Recent Invoices */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h2 className="section-header">Recent Invoices</h2>
          <div className="card-elevated overflow-hidden">
            <div className="divide-y divide-border">
              {mockInvoices.map((invoice) => {
                const style = statusStyles[invoice.status];
                
                return (
                  <div 
                    key={invoice.id}
                    className="flex items-center gap-4 p-4 hover:bg-muted/30 transition-colors cursor-pointer"
                  >
                    <div className="p-3 rounded-xl bg-muted">
                      <Receipt className="w-5 h-5 text-muted-foreground" />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-foreground">{invoice.supplier}</p>
                      <p className="text-sm text-muted-foreground">
                        {invoice.items} items • {invoice.date}
                      </p>
                    </div>

                    <div className="text-right">
                      <p className="font-semibold text-foreground">${invoice.total.toFixed(2)}</p>
                      <span className={cn(
                        "text-xs px-2 py-0.5 rounded-full",
                        style.bg, style.text
                      )}>
                        {style.label}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button className="p-2 rounded-lg hover:bg-muted transition-colors">
                        <Eye className="w-4 h-4 text-muted-foreground" />
                      </button>
                      <button className="p-2 rounded-lg hover:bg-muted transition-colors">
                        <Download className="w-4 h-4 text-muted-foreground" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </motion.div>
      </div>
    </AppLayout>
  );
};

export default Invoices;
