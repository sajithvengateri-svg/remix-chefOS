import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Link } from "react-router-dom";

interface StatCardProps {
  icon: LucideIcon;
  label: string;
  value: string;
  subValue?: string;
  trend?: string;
  color?: "primary" | "accent" | "warning" | "success";
  href?: string;
}

const colorStyles = {
  primary: "bg-primary/10 text-primary",
  accent: "bg-accent/10 text-accent",
  warning: "bg-warning/10 text-warning",
  success: "bg-success/10 text-success",
};

const StatCard = ({ icon: Icon, label, value, subValue, trend, color = "primary", href }: StatCardProps) => {
  const content = (
    <div className={cn("stat-card", href && "cursor-pointer hover:shadow-md transition-shadow")}>
      <div className="flex items-center justify-between">
        <div className={cn("p-2 rounded-lg", colorStyles[color])}>
          <Icon className="w-5 h-5" />
        </div>
        {trend && (
          <span className={cn(
            "text-xs font-medium",
            trend === "urgent" ? "text-warning" : "text-muted-foreground"
          )}>
            {trend}
          </span>
        )}
      </div>
      <div>
        <p className="stat-value">{value}</p>
        <p className="stat-label">{label}</p>
        {subValue && (
          <p className="text-xs text-muted-foreground mt-0.5">{subValue}</p>
        )}
      </div>
    </div>
  );

  if (href) {
    return <Link to={href}>{content}</Link>;
  }

  return content;
};

export default StatCard;
