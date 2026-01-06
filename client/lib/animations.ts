/**
 * GLOBAL ANIMATION CONFIGURATION
 * Reusable Framer Motion variants for Neo-Fintech aesthetic
 */

import { Variants } from 'framer-motion';

/**
 * Fade in from bottom with upward motion
 * Perfect for cards entering the viewport
 */
export const fadeInUp: Variants = {
  hidden: {
    opacity: 0,
    y: 30,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: 'spring',
      stiffness: 100,
      damping: 15,
      duration: 0.6,
    },
  },
};

/**
 * Stagger container for lists/grids
 * Children animate one by one with delay
 */
export const staggerContainer: Variants = {
  hidden: {
    opacity: 0,
  },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.1,
    },
  },
};

/**
 * Scale on hover for interactive elements
 * Buttons, cards, and clickable items
 */
export const scaleOnHover = {
  scale: 1.02,
  transition: {
    type: 'spring',
    stiffness: 400,
    damping: 17,
  },
};

/**
 * Slide in from left
 * Perfect for sidebar navigation
 */
export const slideInLeft: Variants = {
  hidden: {
    x: -20,
    opacity: 0,
  },
  visible: {
    x: 0,
    opacity: 1,
    transition: {
      type: 'spring',
      stiffness: 100,
      damping: 20,
      duration: 0.5,
    },
  },
};

/**
 * Slide in from right
 * For elements entering from the right side
 */
export const slideInRight: Variants = {
  hidden: {
    x: 20,
    opacity: 0,
  },
  visible: {
    x: 0,
    opacity: 1,
    transition: {
      type: 'spring',
      stiffness: 100,
      damping: 20,
      duration: 0.5,
    },
  },
};

/**
 * Fade in with scale
 * For modals and overlays
 */
export const fadeInScale: Variants = {
  hidden: {
    opacity: 0,
    scale: 0.95,
  },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      type: 'spring',
      stiffness: 200,
      damping: 25,
      duration: 0.4,
    },
  },
};

/**
 * Cross-fade transition
 * For switching between forms or content
 */
export const crossFade: Variants = {
  hidden: {
    opacity: 0,
    y: 10,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.3,
      ease: 'easeInOut',
    },
  },
  exit: {
    opacity: 0,
    y: -10,
    transition: {
      duration: 0.2,
      ease: 'easeInOut',
    },
  },
};

/**
 * Float animation for cards
 * Subtle up and down motion
 */
export const floatAnimation = {
  y: [0, -8, 0],
  transition: {
    duration: 3,
    repeat: Infinity,
    ease: 'easeInOut',
  },
};

/**
 * Glow pulse animation
 * For buttons and important elements
 */
export const glowPulse = {
  boxShadow: [
    '0 0 20px rgba(139, 92, 246, 0.4)',
    '0 0 40px rgba(139, 92, 246, 0.6)',
    '0 0 20px rgba(139, 92, 246, 0.4)',
  ],
  transition: {
    duration: 2,
    repeat: Infinity,
    ease: 'easeInOut',
  },
};

/**
 * Slide and fade for sidebar active indicator
 * The "glowing pill" effect
 */
export const slidingPill: Variants = {
  hidden: {
    opacity: 0,
    scale: 0.8,
  },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      type: 'spring',
      stiffness: 300,
      damping: 20,
      duration: 0.4,
    },
  },
};

/**
 * Number counting animation
 * For animated counters
 */
export const countUp = {
  initial: { opacity: 0, scale: 0.5 },
  animate: { 
    opacity: 1, 
    scale: 1,
    transition: {
      type: 'spring',
      stiffness: 200,
      damping: 15,
    },
  },
};

/**
 * Aurora background animation
 * For hero sections with animated gradients
 */
export const auroraBackground = {
  backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
  transition: {
    duration: 20,
    repeat: Infinity,
    ease: 'linear',
  },
};

