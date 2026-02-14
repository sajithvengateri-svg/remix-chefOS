import { useState, useEffect } from "react";
import { FileText, Loader2, CheckCircle2, XCircle, Clock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface InvoiceScan {
  id: string;
  file_name: string | null;
  items_extracted: number;
  items_matched: number;
  prices_updated: number;
  status: string;
  created_at: string;
}

const RecentScans = () => {
  const [scans, setScans] = useState<InvoiceScan[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchScans = async () => {
      const { data, error } = await supabase
        .from("invoice_scans")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(10);

      if (!error) {
        setScans(data || []);
      }
      setLoading(false);
    };

    fetchScans();
  }, []);

  const statusConfig: Record<string, { icon: typeof CheckCircle2; className: string; label: string }> = {
    completed: { icon: CheckCircle2, className: "text-success", label: "Completed" },
    failed: { icon: XCircle, className: "text-destructive", label: "Failed" },
    processing: { icon: Clock, className: "text-warning", label: "Processing" },
  };

  if (loading) {
    return (
      <div className="card-elevated p-6">
        <div className="flex items-center justify-center py-6">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </div>
      </div>
    );
  }

  if (scans.length === 0) return null;

  return (
    <div className="card-elevated p-6">
      <h3 className="font-semibold mb-4">Recent Scans</h3>
      <div className="space-y-3">
        {scans.map((scan) => {
          const config = statusConfig[scan.status] || statusConfig.processing;
          const StatusIcon = config.icon;

          return (
            <div key={scan.id} className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
              <div className="p-2 rounded-lg bg-background">
                <FileText className="w-4 h-4 text-muted-foreground" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">
                  {scan.file_name || "Untitled scan"}
                </p>
                <p className="text-xs text-muted-foreground">
                  {format(new Date(scan.created_at), "dd MMM yyyy, HH:mm")} · {scan.items_extracted} items extracted · {scan.items_matched} matched
                </p>
              </div>
              <div className={cn("flex items-center gap-1 text-xs font-medium", config.className)}>
                <StatusIcon className="w-3.5 h-3.5" />
                {config.label}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default RecentScans;
