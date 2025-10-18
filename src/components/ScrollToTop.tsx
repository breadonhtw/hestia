import { useEffect } from "react";
import { useLocation } from "react-router-dom";

export const ScrollToTop = () => {
  const location = useLocation();
  const state = location.state as { backgroundLocation?: Location } | undefined;

  useEffect(() => {
    // Don't scroll to top if we're showing a modal overlay
    if (!state?.backgroundLocation) {
      window.scrollTo(0, 0);
    }
  }, [location.pathname, state?.backgroundLocation]);

  return null;
};
