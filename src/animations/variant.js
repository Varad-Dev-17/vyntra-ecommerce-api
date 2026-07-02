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
// 1. BASIC FADE ANIMATIONS
// ============================================================

/**
 * fadeInUp - Elements fade in while sliding up from below
 * Use `custom` prop to control stagger delay (e.g., custom={0}, custom={1})
 */
export const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.08,
      duration: 0.5,
      ease: [0.4, 0, 0.2, 1], // cubic-bezier for smooth deceleration
    },
  }),
};

/**
 * fadeInDown - Elements fade in while sliding down from above
 */
export const fadeInDown = {
  hidden: { opacity: 0, y: -30 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.08,
      duration: 0.5,
      ease: [0.4, 0, 0.2, 1],
    },
  }),
};

/**
 * fadeInLeft - Elements fade in while sliding from the left
 */
export const fadeInLeft = {
  hidden: { opacity: 0, x: -40 },
  visible: (i = 0) => ({
    opacity: 1,
    x: 0,
    transition: {
      delay: i * 0.08,
      duration: 0.6,
      ease: [0.4, 0, 0.2, 1],
    },
  }),
};

/**
 * fadeInRight - Elements fade in while sliding from the right
 */
export const fadeInRight = {
  hidden: { opacity: 0, x: 40 },
  visible: (i = 0) => ({
    opacity: 1,
    x: 0,
    transition: {
      delay: i * 0.08,
      duration: 0.6,
      ease: [0.4, 0, 0.2, 1],
    },
  }),
};

/**
 * fadeInScale - Elements fade in while scaling up from 0.9
 */
export const fadeInScale = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: (i = 0) => ({
    opacity: 1,
    scale: 1,
    transition: {
      delay: i * 0.1,
      duration: 0.5,
      ease: [0.4, 0, 0.2, 1],
    },
  }),
};

/**
 * fadeIn - Simple opacity fade without movement
 */
export const fadeIn = {
  hidden: { opacity: 0 },
  visible: (i = 0) => ({
    opacity: 1,
    transition: {
      delay: i * 0.1,
      duration: 0.5,
      ease: "easeOut",
    },
  }),
};

// ============================================================
// 2. STAGGER CONTAINERS
// ============================================================

/**
 * staggerContainer - Parent wrapper that staggers children animations
 * Children must have `variants` prop set to one of the fade variants above
 */
export const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08, // Delay between each child
      delayChildren: 0.1, // Delay before first child starts
    },
  },
};

/**
 * staggerContainerFast - Faster stagger for quick reveals
 */
export const staggerContainerFast = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.05,
    },
  },
};

/**
 * staggerContainerSlow - Slower stagger for dramatic reveals
 */
export const staggerContainerSlow = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.2,
    },
  },
};

// ============================================================
// 3. PRODUCT CARD ANIMATIONS
// ============================================================

/**
 * productCard - Animation for product cards in grid
 */
export const productCard = {
  hidden: { opacity: 0, y: 40, scale: 0.95 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      delay: i * 0.08,
      duration: 0.5,
      ease: [0.4, 0, 0.2, 1],
    },
  }),
  exit: { opacity: 0, scale: 0.9 },
};

/**
 * productCardHover - Hover state for product cards
 * Use with `whileHover` prop
 */
export const productCardHover = {
  y: -8,
  boxShadow: "0 20px 40px -10px rgba(0,0,0,0.1)",
  transition: { duration: 0.3, ease: "easeOut" },
};

/**
 * imageZoom - Subtle zoom on image hover
 * Use with `whileHover` on the image element
 */
export const imageZoom = {
  scale: 1.08,
  transition: { duration: 0.6, ease: "easeOut" },
};

// ============================================================
// 4. HERO / BANNER ANIMATIONS
// ============================================================

/**
 * heroImageKenBurns - Slow zoom/pan effect for hero backgrounds
 * Use with `animate` prop on the image container
 */
export const heroImageKenBurns = {
  scale: [1, 1.15],
  transition: {
    duration: 8,
    ease: "linear",
    repeat: Infinity,
    repeatType: "reverse",
  },
};

/**
 * heroTextReveal - Text lines reveal with stagger
 */
export const heroTextReveal = {
  hidden: { opacity: 0, y: 50 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: 0.3 + i * 0.15,
      duration: 0.7,
      ease: [0.25, 0.46, 0.45, 0.94],
    },
  }),
};

/**
 * heroOverlay - Fade in for dark overlay
 */
export const heroOverlay = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0.8, ease: "easeOut" },
  },
};

// ============================================================
// 5. MODAL / OVERLAY ANIMATIONS
// ============================================================

export const modalBackdrop = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.3 } },
  exit: { opacity: 0, transition: { duration: 0.2 } },
};

export const modalContent = {
  hidden: { opacity: 0, scale: 0.95, y: 20 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { duration: 0.3, ease: [0.4, 0, 0.2, 1] },
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    y: 20,
    transition: { duration: 0.2 },
  },
};

// ============================================================
// 6. PAGE TRANSITIONS
// ============================================================

export const pageTransition = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: [0.4, 0, 0.2, 1] },
  },
  exit: { opacity: 0, y: -20, transition: { duration: 0.3 } },
};

// ============================================================
// 7. UTILITY ANIMATIONS
// ============================================================

/**
 * pulse - Subtle pulsing for loading or attention states
 */
export const pulse = {
  scale: [1, 1.02, 1],
  transition: {
    duration: 2,
    repeat: Infinity,
    ease: "easeInOut",
  },
};

/**
 * slideInFromBottom - For elements that slide up on scroll
 */
export const slideInFromBottom = {
  hidden: { opacity: 0, y: 60 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: [0.4, 0, 0.2, 1] },
  },
};

/**
 * blurIn - Fade in with blur effect (requires CSS filter support)
 */
export const blurIn = {
  hidden: { opacity: 0, filter: "blur(10px)" },
  visible: {
    opacity: 1,
    filter: "blur(0px)",
    transition: { duration: 0.6, ease: "easeOut" },
  },
};

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
 * scrollRevealLeft - Element fades in from left when scrolling into view
 */
export const scrollRevealLeft = {
  hidden: { opacity: 0, x: -80 },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.8,
      ease: [0.25, 0.46, 0.45, 0.94],
    },
  },
};

/**
 * scrollRevealRight - Element fades in from right when scrolling into view
 */
export const scrollRevealRight = {
  hidden: { opacity: 0, x: 80 },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.8,
      ease: [0.25, 0.46, 0.45, 0.94],
    },
  },
};

/**
 * scrollRevealScale - Element fades in and scales up when scrolling into view
 */
export const scrollRevealScale = {
  hidden: { opacity: 0, scale: 0.85 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.7,
      ease: [0.25, 0.46, 0.45, 0.94],
    },
  },
};

/**
 * scrollRevealBlur - Element fades in with blur removal when scrolling into view
 */
export const scrollRevealBlur = {
  hidden: { opacity: 0, filter: "blur(12px)" },
  visible: {
    opacity: 1,
    filter: "blur(0px)",
    transition: {
      duration: 0.9,
      ease: "easeOut",
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

// ============================================================
// 9. VIDEO HERO ANIMATIONS
// ============================================================

/**
 * videoTextReveal - Text that appears after video reaches a certain point
 * Use with delay to sync with video timing
 */
export const videoTextReveal = {
  hidden: { opacity: 0, y: 30, filter: "blur(8px)" },
  visible: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: {
      duration: 1.1,
      ease: [0.25, 0.46, 0.45, 0.94],
    },
  },
};

/**
 * videoOverlayFade - Dark overlay that fades in/out with video
 */
export const videoOverlayFade = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0.8, ease: "easeOut" },
  },
};

/**
 * slowParallaxSection - For sections that move slowly on scroll
 * Use with useScroll + useTransform for custom parallax
 */
export const slowParallaxSection = {
  hidden: { opacity: 0, y: 100 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 1,
      ease: [0.25, 0.46, 0.45, 0.94],
    },
  },
};
