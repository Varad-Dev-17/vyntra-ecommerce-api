import { useEffect, useRef } from "react";
import Lenis from "lenis";

const SmoothScrollProvider = ({ children }) => {
  const lenisRef = useRef(null);

  useEffect(() => {
    const lenis = new Lenis({
      lerp: 0.05, // Ultra slow, luxurious feel
      duration: 3, // Very long duration
      smoothWheel: true,
      wheelMultiplier: 0.5, // Half speed on mouse wheel
      touchMultiplier: 1,
      infinite: false,
    });

    lenisRef.current = lenis;

    // Sync with Framer Motion's scroll animations
    lenis.on("scroll", (e) => {
      // Optional: Handle scroll events here without recursive dispatch
    });

    function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);

    // Force recalculate scroll height when DOM changes (e.g. async products loading)
    const resizeObserver = new ResizeObserver(() => {
      lenis.resize();
    });
    resizeObserver.observe(document.body);

    return () => {
      resizeObserver.disconnect();
      lenis.destroy();
    };
  }, []);

  return <>{children}</>;
};

export default SmoothScrollProvider;
