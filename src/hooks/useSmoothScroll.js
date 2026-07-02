import { useEffect, useRef } from "react";
import Lenis from "lenis";

/**
 * useSmoothScroll - Ultra smooth, slow scrolling for premium feel
 *
 * lerp: 0.05 = very slow, heavy, luxurious scroll (feels like 0.5x speed)
 * lerp: 0.1 = slow but responsive
 * lerp: 0.2 = subtle smoothness
 *
 * For Vyntra's premium fashion vibe, we use 0.06 — very slow and elegant
 */
const useSmoothScroll = () => {
  const lenisRef = useRef(null);

  useEffect(() => {
    const lenis = new Lenis({
      lerp: 0.06, // Very slow interpolation (0.06 = ~40% perceived speed)
      duration: 2.5, // Longer scroll duration
      smoothWheel: true, // Smooth out mouse wheel
      wheelMultiplier: 0.6, // Reduce wheel sensitivity (slower)
      touchMultiplier: 1.2, // Touch can be slightly faster for usability
    });

    lenisRef.current = lenis;

    // Animation frame loop
    function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);

    // Connect Lenis to GSAP ScrollTrigger if you use it later
    // lenis.on("scroll", ScrollTrigger.update);

    return () => {
      lenis.destroy();
    };
  }, []);

  return lenisRef;
};

export default useSmoothScroll;
