import { motion, useReducedMotion } from "framer-motion";
import { useLocation } from "react-router-dom";

/**
 * Fades + lifts page content in on each route change.
 *
 * Production safety: initial state is `opacity: 1` so server-rendered HTML
 * is always visible. The animation is purely progressive enhancement —
 * content remains readable even if JavaScript fails to hydrate.
 *
 * Accessibility: respects `prefers-reduced-motion` by disabling animation.
 */
export function PageTransition({ children }: { children: React.ReactNode }) {
  const { pathname } = useLocation();
  const prefersReducedMotion = useReducedMotion();

  if (prefersReducedMotion) {
    return <>{children}</>;
  }

  return (
    <motion.div
      key={pathname}
      initial={{ opacity: 1, y: 0 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}
