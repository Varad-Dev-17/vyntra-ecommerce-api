/**
 * ============================================================
 * Vyntra - Animation Variants & Custom Hooks
 * ============================================================
 *
 * This file contains all reusable Framer Motion animation variants
 * and custom hooks for scroll-based effects like parallax.
 *
 * HOW TO USE:
 * 1. Import the variants/hooks you need
 * 2. Spread them into the `variants` and `animate` props
 * 3. Use `custom` prop for stagger delays
 *
 * EXAMPLE:
 *   import { fadeInUp, staggerContainer } from "../animations/variants";
 *
 *   <motion.div variants={staggerContainer} initial="hidden" animate="visible">
 *     <motion.h1 variants={fadeInUp} custom={0}>Title</motion.h1>
 *     <motion.p variants={fadeInUp} custom={1}>Subtitle</motion.p>
 *   </motion.div>
 */


// ============================================================
// 8. SCROLL-REVEAL ANIMATIONS (whileInView)
// ============================================================

/**
 * scrollRevealUp - Element fades in and slides up when scrolling into view
 * Use with: whileInView="visible" initial="hidden" viewport={{ once: true, amount: 0.3 }}
 */
export const scrollRevealUp = {
  hidden: { opacity: 0, y: 60 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.8,
      ease: [0.25, 0.46, 0.45, 0.94],
    },
  },
};


/**
 * scrollStaggerContainer - Container that staggers children on scroll reveal
 */
export const scrollStaggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.1,
    },
  },
};

/**
 * scrollStaggerItem - Individual item for staggered scroll reveal
 */
export const scrollStaggerItem = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: [0.25, 0.46, 0.45, 0.94],
    },
  },
};

