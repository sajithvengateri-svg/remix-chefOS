import { ReactNode } from "react";
import { useLocation } from "react-router-dom";
import BottomNav from "./BottomNav";
import Sidebar from "./Sidebar";
import PullToRefresh from "./PullToRefresh";

interface AppLayoutProps {
  children: ReactNode;
}

const AppLayout = ({ children }: AppLayoutProps) => {
  const location = useLocation();

  return (
    <div className="min-h-screen bg-background">
      {/* Desktop Sidebar */}
      <Sidebar className="hidden lg:flex" />
      
      {/* Main Content with Pull to Refresh on mobile */}
      <main className="lg:pl-64 pb-20 lg:pb-0 min-h-screen">
        <div className="lg:hidden h-screen">
          <PullToRefresh>
            <div className="safe-top px-4 py-6">
              {children}
            </div>
          </PullToRefresh>
        </div>
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
