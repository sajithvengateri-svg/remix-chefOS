import { ReactNode } from "react";
import { useLocation } from "react-router-dom";
import { MapPin } from "lucide-react";
import BottomNav from "./BottomNav";
import Sidebar from "./Sidebar";
import PullToRefresh from "./PullToRefresh";
import { useOrg } from "@/contexts/OrgContext";

interface AppLayoutProps {
  children: ReactNode;
}

const OrgBanner = () => {
  const { currentOrg, venues } = useOrg();
  const activeVenue = venues?.[0];

  return (
    <div className="sticky top-0 z-40 bg-primary text-primary-foreground px-4 py-2 flex items-center justify-between shadow-md">
      <div className="flex items-center gap-3 min-w-0">
        <span className="text-sm font-bold tracking-wide uppercase truncate">
          {currentOrg?.name || "My Kitchen"}
        </span>
        {activeVenue && (
          <>
            <span className="text-primary-foreground/40">|</span>
            <span className="flex items-center gap-1 text-xs text-primary-foreground/80 truncate">
              <MapPin className="w-3 h-3 shrink-0" />
              {activeVenue.name}
            </span>
          </>
        )}
      </div>
    </div>
  );
};

const AppLayout = ({ children }: AppLayoutProps) => {
  const location = useLocation();

  return (
    <div className="min-h-screen bg-background">
      {/* Desktop Sidebar */}
      <Sidebar className="hidden lg:flex" />
      
      {/* Main Content */}
      <main className="lg:pl-64 pb-20 lg:pb-0 min-h-screen">
        {/* Sticky Org Banner */}
        <OrgBanner />

        {/* Mobile with Pull to Refresh */}
        <div className="lg:hidden min-h-screen">
          <PullToRefresh>
            <div className="safe-top px-4 py-6 pb-24">
              {children}
            </div>
          </PullToRefresh>
        </div>
        {/* Desktop */}
        <div className="hidden lg:block safe-top px-8 py-6">
          {children}
        </div>
      </main>

      {/* Mobile Bottom Navigation */}
      <BottomNav className="lg:hidden" />
    </div>
  );
};

export default AppLayout;
