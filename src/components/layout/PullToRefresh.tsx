import { useState, useRef, useCallback, ReactNode } from "react";
import { motion, useAnimation } from "framer-motion";
import { RefreshCw } from "lucide-react";

interface PullToRefreshProps {
  children: ReactNode;
  onRefresh?: () => Promise<void>;
}

const PULL_THRESHOLD = 80;

const PullToRefresh = ({ children, onRefresh }: PullToRefreshProps) => {
  const [pullDistance, setPullDistance] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const startY = useRef(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const controls = useAnimation();

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    // Only activate if at top of scroll
    if (containerRef.current && containerRef.current.scrollTop === 0) {
      startY.current = e.touches[0].clientY;
    }
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (isRefreshing) return;
    if (containerRef.current && containerRef.current.scrollTop > 0) return;
    
    const currentY = e.touches[0].clientY;
    const diff = currentY - startY.current;
    
    if (diff > 0 && startY.current > 0) {
      // Apply resistance to pull
      const resistance = Math.min(diff * 0.4, PULL_THRESHOLD + 20);
      setPullDistance(resistance);
    }
  }, [isRefreshing]);

  const handleTouchEnd = useCallback(async () => {
    if (pullDistance >= PULL_THRESHOLD && !isRefreshing) {
      setIsRefreshing(true);
      
      // Trigger refresh
      if (onRefresh) {
        await onRefresh();
      } else {
        // Default: reload the page
        window.location.reload();
      }
      
      setIsRefreshing(false);
    }
    
    setPullDistance(0);
    startY.current = 0;
  }, [pullDistance, isRefreshing, onRefresh]);

  const progress = Math.min(pullDistance / PULL_THRESHOLD, 1);

  return (
    <div 
      ref={containerRef}
      className="h-full overflow-auto"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Pull indicator */}
      <motion.div
        className="flex items-center justify-center overflow-hidden"
        style={{ height: pullDistance }}
        animate={controls}
      >
        <motion.div
          className="flex items-center gap-2 text-primary"
          style={{ 
            opacity: progress,
            scale: 0.5 + progress * 0.5 
          }}
        >
          <RefreshCw 
            className={`h-5 w-5 ${isRefreshing ? 'animate-spin' : ''}`}
            style={{ 
              transform: isRefreshing ? undefined : `rotate(${progress * 180}deg)` 
            }}
          />
          <span className="text-sm font-medium">
            {isRefreshing 
              ? "Updating..." 
              : progress >= 1 
                ? "Release to refresh" 
                : "Pull to refresh"
            }
          </span>
        </motion.div>
      </motion.div>
      
      {children}
    </div>
  );
};

export default PullToRefresh;
