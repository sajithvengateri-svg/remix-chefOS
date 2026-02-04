import { ChefHat, Package, ClipboardList, Receipt, Plus } from "lucide-react";
import { Link } from "react-router-dom";

const actions = [
  { icon: ChefHat, label: "New Recipe", path: "/recipes/new", color: "bg-primary" },
  { icon: Package, label: "Log Inventory", path: "/inventory/log", color: "bg-accent" },
  { icon: ClipboardList, label: "Create Prep List", path: "/prep/new", color: "bg-sage" },
  { icon: Receipt, label: "Scan Invoice", path: "/invoices/scan", color: "bg-copper" },
];

const QuickActions = () => {
  return (
    <div className="card-elevated p-5">
      <h2 className="section-header">Quick Actions</h2>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {actions.map((action) => (
          <Link
            key={action.label}
            to={action.path}
            className="flex flex-col items-center gap-2 p-4 rounded-xl bg-muted/50 hover:bg-muted transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <div className={`p-3 rounded-xl ${action.color} text-primary-foreground`}>
              <action.icon className="w-5 h-5" />
            </div>
            <span className="text-sm font-medium text-center">{action.label}</span>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default QuickActions;
