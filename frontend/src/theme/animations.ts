export const slideTransitions = {
  forward: {
    initial: { x: 100, opacity: 0 },
    animate: { x: 0, opacity: 1 },
    exit: { x: -100, opacity: 0 },
  },
  backward: {
    initial: { x: -100, opacity: 0 },
    animate: { x: 0, opacity: 1 },
    exit: { x: 100, opacity: 0 },
  },
}

export const stagger = {
  container: {
    animate: { transition: { staggerChildren: 0.08 } },
  },
  item: {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  },
}

export const fadeIn = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { duration: 0.6 } },
}

export const scaleIn = {
  initial: { opacity: 0, scale: 0.9 },
  animate: { opacity: 1, scale: 1, transition: { duration: 0.5 } },
}

export const slideUp = {
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.6 } },
}

// Matrix-style glitch entrance
export const glitchIn = {
  initial: { opacity: 0, x: -5, filter: 'blur(4px)' },
  animate: {
    opacity: 1,
    x: 0,
    filter: 'blur(0px)',
    transition: { duration: 0.4, ease: 'easeOut' },
  },
}

// Cyber card entrance with neon border flash
export const cyberCardIn = {
  initial: { opacity: 0, y: 20, scale: 0.95 },
  animate: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] },
  },
}

// Terminal typing effect for staggered text
export const terminalStagger = {
  container: {
    animate: { transition: { staggerChildren: 0.04 } },
  },
  char: {
    initial: { opacity: 0 },
    animate: { opacity: 1, transition: { duration: 0.05 } },
  },
}

// Neon pulse for icons/badges
export const neonPulse = {
  animate: {
    boxShadow: [
      '0 0 5px rgba(0,240,255,0.3)',
      '0 0 20px rgba(0,240,255,0.6)',
      '0 0 5px rgba(0,240,255,0.3)',
    ],
    transition: { duration: 2, repeat: Infinity, ease: 'easeInOut' },
  },
}

// Data flow particle path animation
export const dataFlowPath = {
  initial: { pathLength: 0, opacity: 0 },
  animate: {
    pathLength: 1,
    opacity: 1,
    transition: { duration: 1.5, ease: 'easeInOut' },
  },
}
