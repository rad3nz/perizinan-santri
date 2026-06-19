import type { ReactNode } from "react";
import { useLocation } from "react-router-dom";

// Keys the wrapper by pathname so the subtree remounts and replays the entrance
// animation on every navigation. CSS handles the actual motion (and reduced-motion).
export function RouteTransition({ children }: { children: ReactNode }) {
  const { pathname } = useLocation();
  return (
    <div key={pathname} className="motion-page-enter">
      {children}
    </div>
  );
}
