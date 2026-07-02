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
    lenis.on("scroll", () => {
      // This ensures framer-motion scroll triggers still work
      window.dispatchEvent(new Event("scroll"));
    });

    function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);

    return () => lenis.destroy();
  }, []);

  return <>{children}</>;
};

export default SmoothScrollProvider;
