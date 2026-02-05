import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import {
  LayoutDashboard,
  ChefHat,
  Package,
  ClipboardList,
  Shield,
  GraduationCap,
  Receipt,
  Utensils,
  Factory,
  Menu,
  Users,
  AlertTriangle,
  BookOpen,
  Calendar,
  Wrench,
  Store,
  LayoutGrid,
  GripVertical,
  RotateCcw,
  Check
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { cn } from "@/lib/utils";
import { useNavOrder } from "@/hooks/useNavOrder";

const mainNavItems = [
  { path: "/dashboard", icon: LayoutDashboard, label: "Dashboard", module: "dashboard" },
  { path: "/recipes", icon: ChefHat, label: "Recipe Bank", module: "recipes" },
  { path: "/ingredients", icon: Utensils, label: "Ingredients", module: "ingredients" },
  { path: "/invoices", icon: Receipt, label: "Invoices", module: "invoices" },
  { path: "/inventory", icon: Package, label: "Inventory", module: "inventory" },
  { path: "/prep", icon: ClipboardList, label: "Prep Lists", module: "prep" },
  { path: "/production", icon: Factory, label: "Production", module: "production" },
  { path: "/marketplace", icon: Store, label: "Marketplace", module: "marketplace" },
  { path: "/allergens", icon: AlertTriangle, label: "Allergens", module: "allergens" },
];

const secondaryNavItems = [
  { path: "/menu-engineering", icon: Menu, label: "Menu Engineering", module: "menu-engineering" },
  { path: "/roster", icon: Users, label: "Roster", module: "roster" },
  { path: "/calendar", icon: Calendar, label: "Calendar", module: "calendar" },
  { path: "/kitchen-sections", icon: LayoutGrid, label: "Kitchen Sections", module: "calendar" },
  { path: "/equipment", icon: Wrench, label: "Equipment", module: "equipment" },
  { path: "/cheatsheets", icon: BookOpen, label: "Cheatsheets", module: "cheatsheets" },
  { path: "/food-safety", icon: Shield, label: "Food Safety", module: "food-safety" },
  { path: "/training", icon: GraduationCap, label: "Training", module: "training" },
  { path: "/team", icon: Users, label: "Team", module: "team" },
];

const defaultMainPaths = mainNavItems.map(item => item.path);
const defaultSecondaryPaths = secondaryNavItems.map(item => item.path);

interface SortableItemProps {
  id: string;
  icon: typeof LayoutDashboard;
  label: string;
}

const SortableItem = ({ id, icon: Icon, label }: SortableItemProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "flex items-center gap-3 p-3 bg-card border rounded-lg cursor-grab active:cursor-grabbing",
        isDragging && "opacity-50 shadow-lg z-50"
      )}
      {...attributes}
      {...listeners}
    >
      <GripVertical className="w-4 h-4 text-muted-foreground" />
      <Icon className="w-5 h-5" />
      <span className="font-medium">{label}</span>
    </div>
  );
};

const NavigationSettings = () => {
  const { canView } = useAuth();
  
  const {
    mainNavOrder,
    secondaryNavOrder,
    updateMainNavOrder,
    updateSecondaryNavOrder,
    resetToDefault
  } = useNavOrder(defaultMainPaths, defaultSecondaryPaths);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const sortedMainItems = useMemo(() => {
    return [...mainNavItems]
      .filter(item => canView(item.module))
      .sort((a, b) => {
        const indexA = mainNavOrder.indexOf(a.path);
        const indexB = mainNavOrder.indexOf(b.path);
        return indexA - indexB;
      });
  }, [mainNavOrder, canView]);

  const sortedSecondaryItems = useMemo(() => {
    return [...secondaryNavItems]
      .filter(item => canView(item.module))
      .sort((a, b) => {
        const indexA = secondaryNavOrder.indexOf(a.path);
        const indexB = secondaryNavOrder.indexOf(b.path);
        return indexA - indexB;
      });
  }, [secondaryNavOrder, canView]);

  const handleMainDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = mainNavOrder.indexOf(active.id as string);
      const newIndex = mainNavOrder.indexOf(over.id as string);
      updateMainNavOrder(arrayMove(mainNavOrder, oldIndex, newIndex));
      toast.success("Navigation order updated");
    }
  };

  const handleSecondaryDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = secondaryNavOrder.indexOf(active.id as string);
      const newIndex = secondaryNavOrder.indexOf(over.id as string);
      updateSecondaryNavOrder(arrayMove(secondaryNavOrder, oldIndex, newIndex));
      toast.success("Navigation order updated");
    }
  };

  const handleReset = () => {
    resetToDefault();
    toast.success("Navigation reset to default order");
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <LayoutGrid className="w-5 h-5" />
                Navigation Order
              </CardTitle>
              <CardDescription>Drag items to customize your sidebar order</CardDescription>
            </div>
            <Button variant="outline" size="sm" onClick={handleReset}>
              <RotateCcw className="w-4 h-4 mr-2" />
              Reset
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Main Nav Section */}
          <div>
            <h3 className="text-sm font-medium text-muted-foreground mb-3">Main Navigation</h3>
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleMainDragEnd}
            >
              <SortableContext
                items={sortedMainItems.map(item => item.path)}
                strategy={verticalListSortingStrategy}
              >
                <div className="space-y-2">
                  {sortedMainItems.map((item) => (
                    <SortableItem
                      key={item.path}
                      id={item.path}
                      icon={item.icon}
                      label={item.label}
                    />
                  ))}
                </div>
              </SortableContext>
            </DndContext>
          </div>

          {/* Secondary Nav Section */}
          <div>
            <h3 className="text-sm font-medium text-muted-foreground mb-3">Operations</h3>
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleSecondaryDragEnd}
            >
              <SortableContext
                items={sortedSecondaryItems.map(item => item.path)}
                strategy={verticalListSortingStrategy}
              >
                <div className="space-y-2">
                  {sortedSecondaryItems.map((item) => (
                    <SortableItem
                      key={item.path}
                      id={item.path}
                      icon={item.icon}
                      label={item.label}
                    />
                  ))}
                </div>
              </SortableContext>
            </DndContext>
          </div>
        </CardContent>
      </Card>

      <p className="text-sm text-muted-foreground text-center">
        Changes are saved automatically and synced to your sidebar
      </p>
    </motion.div>
  );
};

export default NavigationSettings;
