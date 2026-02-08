import { Link, useLocation } from "react-router-dom";
import { 
  ChefHat, 
  Package, 
  Menu,
  MoreHorizontal,
  Mic,
  MicOff
} from "lucide-react";
import { cn } from "@/lib/utils";
import chefOSLogo from "@/assets/chefos-logo.png";
import { useVoiceCommands } from "@/contexts/VoiceCommandContext";
import { useAppSettings } from "@/hooks/useAppSettings";

interface BottomNavProps {
  className?: string;
}

const navItems = [
  { path: "/dashboard", icon: null, label: "Home", isLogo: true },
  { path: "/recipes", icon: ChefHat, label: "Recipes" },
  { path: "/inventory", icon: Package, label: "Inventory" },
  { path: "/menu-engineering", icon: Menu, label: "Menu" },
  { path: "/more", icon: MoreHorizontal, label: "More" },
];

const BottomNav = ({ className }: BottomNavProps) => {
  const location = useLocation();
  const { settings } = useAppSettings();
  const { isListening, toggleListening, isSupported } = useVoiceCommands();

  const showVoice = settings.aiVoiceEnabled && isSupported;

  return (
    <nav className={cn("bottom-nav", className)}>
      <div className="flex items-center justify-around">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path || 
            (item.path !== "/" && location.pathname.startsWith(item.path));
          
          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn("bottom-nav-item", isActive && "active")}
            >
              {item.isLogo ? (
                <img src={chefOSLogo} alt="Home" className="w-6 h-6 rounded" />
              ) : (
                item.icon && <item.icon className="w-5 h-5" />
              )}
              <span className="text-xs font-medium">{item.label}</span>
            </Link>
          );
        })}
        
        {/* Voice toggle button */}
        {showVoice && (
          <button
            onClick={toggleListening}
            className={cn(
              "bottom-nav-item",
              isListening && "text-primary"
            )}
          >
            {isListening ? (
              <Mic className="w-5 h-5 text-primary animate-pulse" />
            ) : (
              <MicOff className="w-5 h-5" />
            )}
            <span className="text-xs font-medium">Voice</span>
          </button>
        )}
      </div>
    </nav>
  );
};

export default BottomNav;
