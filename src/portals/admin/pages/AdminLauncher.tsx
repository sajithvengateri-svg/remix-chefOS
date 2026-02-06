import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useNavigate } from "react-router-dom";
import {
  Rocket,
  CheckCircle2,
  Circle,
  ArrowRight,
  ChefHat,
  Building2,
  Shield,
  Package,
  Users,
  FileText,
  Zap,
  ExternalLink,
} from "lucide-react";

interface LaunchItem {
  id: string;
  title: string;
  description: string;
  icon: React.ElementType;
  status: "complete" | "in-progress" | "pending";
  link?: string;
}

const AdminLauncher = () => {
  const navigate = useNavigate();

  const launchChecklist: LaunchItem[] = [
    {
      id: "database",
      title: "Database Setup",
      description: "Tables, RLS policies, and functions configured",
      icon: Package,
      status: "complete",
    },
    {
      id: "auth",
      title: "Authentication",
      description: "User signup, login, and role management",
      icon: Shield,
      status: "complete",
    },
    {
      id: "chef-portal",
      title: "Chef Portal",
      description: "Recipe management, inventory, and prep lists",
      icon: ChefHat,
      status: "complete",
      link: "/dashboard",
    },
    {
      id: "vendor-portal",
      title: "Vendor Portal",
      description: "Vendor onboarding, pricing, and orders",
      icon: Building2,
      status: "complete",
      link: "/vendor/dashboard",
    },
    {
      id: "admin-portal",
      title: "Admin Portal",
      description: "CRM, analytics, and system management",
      icon: Users,
      status: "complete",
      link: "/admin",
    },
    {
      id: "edge-functions",
      title: "Edge Functions",
      description: "AI features and external integrations",
      icon: Zap,
      status: "complete",
    },
    {
      id: "documentation",
      title: "Documentation",
      description: "User guides and API documentation",
      icon: FileText,
      status: "pending",
    },
    {
      id: "production",
      title: "Production Deployment",
      description: "Final review and go-live",
      icon: Rocket,
      status: "pending",
    },
  ];

  const completedCount = launchChecklist.filter((item) => item.status === "complete").length;
  const progress = (completedCount / launchChecklist.length) * 100;

  const quickLinks = [
    { label: "Chef Portal", path: "/dashboard", icon: ChefHat },
    { label: "Vendor Portal", path: "/vendor/dashboard", icon: Building2 },
    { label: "Run Tests", path: "/admin/testing", icon: Zap },
    { label: "Seed Data", path: "/admin/seed", icon: Package },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <Rocket className="w-8 h-8 text-primary" />
          Launch Control
        </h1>
        <p className="text-muted-foreground mt-1">
          Track progress and prepare for production deployment
        </p>
      </div>

      {/* Progress Overview */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Launch Progress</CardTitle>
              <CardDescription>
                {completedCount} of {launchChecklist.length} items complete
              </CardDescription>
            </div>
            <Badge
              variant={progress === 100 ? "default" : "secondary"}
              className={progress === 100 ? "bg-green-500" : ""}
            >
              {progress.toFixed(0)}%
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <Progress value={progress} className="h-3" />
        </CardContent>
      </Card>

      {/* Quick Links */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {quickLinks.map((link) => (
          <motion.div
            key={link.path}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ scale: 1.02 }}
          >
            <Card
              className="cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => navigate(link.path)}
            >
              <CardContent className="p-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <link.icon className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1">
                  <p className="font-medium">{link.label}</p>
                </div>
                <ExternalLink className="w-4 h-4 text-muted-foreground" />
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Launch Checklist */}
      <Card>
        <CardHeader>
          <CardTitle>Launch Checklist</CardTitle>
          <CardDescription>
            Complete all items before going to production
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {launchChecklist.map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="flex items-center justify-between p-4 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
              >
                <div className="flex items-center gap-4">
                  {item.status === "complete" ? (
                    <CheckCircle2 className="w-6 h-6 text-green-500" />
                  ) : item.status === "in-progress" ? (
                    <div className="w-6 h-6 rounded-full border-2 border-yellow-500 border-t-transparent animate-spin" />
                  ) : (
                    <Circle className="w-6 h-6 text-muted-foreground" />
                  )}
                  <div className="w-10 h-10 rounded-lg bg-background flex items-center justify-center">
                    <item.icon className="w-5 h-5 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="font-medium">{item.title}</p>
                    <p className="text-sm text-muted-foreground">
                      {item.description}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge
                    variant={
                      item.status === "complete"
                        ? "default"
                        : item.status === "in-progress"
                        ? "secondary"
                        : "outline"
                    }
                    className={item.status === "complete" ? "bg-green-500" : ""}
                  >
                    {item.status === "complete"
                      ? "Complete"
                      : item.status === "in-progress"
                      ? "In Progress"
                      : "Pending"}
                  </Badge>
                  {item.link && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => navigate(item.link!)}
                    >
                      <ArrowRight className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Ready to Launch */}
      {progress >= 75 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <Card className="border-primary/50 bg-primary/5">
            <CardContent className="p-6 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                  <Rocket className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="font-bold text-lg">Ready for Launch?</p>
                  <p className="text-muted-foreground">
                    Complete the remaining items and deploy to production
                  </p>
                </div>
              </div>
              <Button disabled={progress < 100}>
                <Rocket className="w-4 h-4 mr-2" />
                Deploy to Production
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  );
};

export default AdminLauncher;
