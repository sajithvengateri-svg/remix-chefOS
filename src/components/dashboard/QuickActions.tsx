import { ChefHat, Package, ClipboardList, Receipt } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

const linkActions = [
  { icon: Package, label: "View Costing", path: "/ingredients", color: "bg-accent" },
  { icon: ClipboardList, label: "Create Prep List", path: "/prep", color: "bg-sage" },
  { icon: Receipt, label: "Scan Invoice", path: "/invoices", color: "bg-copper" },
];

const QuickActions = () => {
  const navigate = useNavigate();

  const handleNewRecipe = () => {
    navigate("/recipes/new");
  };

  return (
    <div className="card-elevated p-5">
      <h2 className="section-header">Quick Actions</h2>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {/* New Recipe - special handler */}
        <button
          onClick={handleNewRecipe}
          className="flex flex-col items-center gap-2 p-4 rounded-xl bg-muted/50 hover:bg-muted transition-all hover:scale-[1.02] active:scale-[0.98]"
        >
          <div className="p-3 rounded-xl bg-primary text-primary-foreground">
            <ChefHat className="w-5 h-5" />
          </div>
          <span className="text-sm font-medium text-center">New Recipe</span>
        </button>

        {/* Link-based actions */}
        {linkActions.map((action) => (
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
