import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Link, useLocation } from "react-router-dom";
import { GripVertical, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface SortableNavItemProps {
  id: string;
  path: string;
  icon: LucideIcon;
  label: string;
  isEditMode: boolean;
}

const SortableNavItem = ({ id, path, icon: Icon, label, isEditMode }: SortableNavItemProps) => {
  const location = useLocation();
  const isActive = location.pathname === path || 
    (path !== "/" && location.pathname.startsWith(path));

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id, disabled: !isEditMode });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  if (isEditMode) {
    return (
      <div
        ref={setNodeRef}
        style={style}
        className={cn(
          "nav-item cursor-grab active:cursor-grabbing",
          isActive && "active",
          isDragging && "opacity-50 bg-muted/50 shadow-lg z-50"
        )}
        {...attributes}
        {...listeners}
      >
        <GripVertical className="w-4 h-4 text-muted-foreground mr-1" />
        <Icon className="w-5 h-5" />
        <span>{label}</span>
      </div>
    );
  }

  return (
    <Link
      to={path}
      className={cn("nav-item", isActive && "active")}
    >
      <Icon className="w-5 h-5" />
      <span>{label}</span>
    </Link>
  );
};

export default SortableNavItem;
