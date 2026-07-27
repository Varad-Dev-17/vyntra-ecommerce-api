/**
 * ============================================================
 * Vyntra - useParallax Custom Hook
 * ============================================================
 *
 * A React hook that creates smooth parallax scrolling effects.
 * The background image moves at a different speed than the scroll,
 * creating depth and visual interest.
 *
 * HOW PARALLAX WORKS:
 * - As you scroll down, the image moves UP slower than the page
 * - This creates the illusion that the image is "far away"
 * - The speed factor controls how much slower it moves
 *
 * HOW TO USE:
 *
 *   import { useParallax } from "../animations/useParallax";
 *
 *   function HeroSection() {
 *     const { ref, y } = useParallax({ speed: 0.5 });
 *
 *     return (
 *       <div ref={ref} className="relative h-[500px] overflow-hidden">
 *         <motion.img
 *           style={{ y }}
 *           src="/hero.jpg"
 *           className="absolute inset-0 w-full h-[120%] object-cover"
 *         />
 *       </div>
 *     );
 *   }
 *
 * OPTIONS:
 *   speed: 0.3 = slow (subtle), 0.5 = medium, 0.8 = fast (dramatic)
 *   offset: Additional pixel offset for fine-tuning starting position
 */

import { useRef } from "react";
import { useScroll, useTransform, useSpring } from "framer-motion";

/**
 * useParallax Hook
 * @param {Object} options
 * @param {number} options.speed - Parallax speed (0.1 to 1.0). Lower = slower movement = more depth
 * @param {number} options.offset - Starting Y offset in pixels
 * @param {number} options.springStiffness - How "stiff" the spring animation is (default: 100)
 * @param {number} options.springDamping - How much the spring bounces (default: 30)
 * @returns {Object} { ref, y } - ref goes on container, y goes on the moving element
 */
export function useParallax({
  speed = 0.5,
  offset = 0,
  springStiffness = 100,
  springDamping = 30,
} = {}) {
  const ref = useRef(null);

  // Track scroll progress of the container relative to viewport
  // "start start" = when top of container hits top of viewport
  // "end start" = when bottom of container hits top of viewport
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });

  // Convert scroll progress (0 to 1) to pixel movement
  // speed controls how much the image moves:
  // - speed 0.5: image moves 50% as fast as scroll (most common)
  // - speed 0.3: image moves 30% as fast (more dramatic depth)
  // - speed 0.8: image moves 80% as fast (subtle)
  const rawY = useTransform(
    scrollYProgress,
    [0, 1],
    [offset, offset - 200 * speed]
  );

  // Apply spring physics for buttery-smooth movement
  // Without spring, the movement can feel jittery on fast scrolls
  const y = useSpring(rawY, {
    stiffness: springStiffness,
    damping: springDamping,
    restDelta: 0.001,
  });

  return { ref, y };
}

