'use client'

import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion'
import { useRef, type MouseEvent } from 'react'

const ease = [0.22, 1, 0.36, 1] as const

interface Props {
  children: React.ReactNode
  delay?:   number
  className?: string
}

export function FadeUp({ children, delay = 0, className }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 36 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-72px' }}
      transition={{ duration: 0.65, ease, delay }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

export function FadeIn({ children, delay = 0, className }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true, margin: '-72px' }}
      transition={{ duration: 0.7, ease, delay }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

export function SlideLeft({ children, delay = 0, className }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -40 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true, margin: '-72px' }}
      transition={{ duration: 0.65, ease, delay }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

export function SlideRight({ children, delay = 0, className }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 40 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true, margin: '-72px' }}
      transition={{ duration: 0.65, ease, delay }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

interface StaggerProps {
  children:  React.ReactNode
  className?: string
  style?:     React.CSSProperties
  stagger?:   number
  delay?:     number
}

export function StaggerGrid({ children, className, style, stagger = 0.1, delay = 0 }: StaggerProps) {
  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-72px' }}
      variants={{
        hidden:  {},
        visible: { transition: { staggerChildren: stagger, delayChildren: delay } },
      }}
      className={className}
      style={style}
    >
      {children}
    </motion.div>
  )
}

// StaggerItem uses a 3D entrance — fades in with depth (rotateX + scale) for card-flip feel
export function StaggerItem({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <motion.div
      variants={{
        hidden:  { opacity: 0, y: 32, rotateX: 14, scale: 0.95 },
        visible: { opacity: 1, y: 0,  rotateX: 0,  scale: 1,
                   transition: { duration: 0.6, ease } },
      }}
      style={{ transformStyle: 'preserve-3d' }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

// ── Card3D — mouse-tracking perspective tilt with spring physics ───────────────
const SPRING_CFG = { stiffness: 260, damping: 22, mass: 0.4 } as const

export function Card3D({ children, className }: { children: React.ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null)
  const mx  = useMotionValue(0)
  const my  = useMotionValue(0)

  const rotX = useSpring(useTransform(my, [-0.5, 0.5], [10, -10]), SPRING_CFG)
  const rotY = useSpring(useTransform(mx, [-0.5, 0.5], [-10, 10]), SPRING_CFG)
  const scl  = useSpring(1, SPRING_CFG)

  function onMove(e: MouseEvent<HTMLDivElement>) {
    if (!ref.current) return
    const { left, top, width, height } = ref.current.getBoundingClientRect()
    mx.set((e.clientX - left) / width  - 0.5)
    my.set((e.clientY - top)  / height - 0.5)
    scl.set(1.045)
  }

  function onLeave() {
    mx.set(0)
    my.set(0)
    scl.set(1)
  }

  return (
    <motion.div
      ref={ref}
      style={{ rotateX: rotX, rotateY: rotY, scale: scl, transformStyle: 'preserve-3d' }}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      className={className}
    >
      {children}
    </motion.div>
  )
}

// ── FloatUp — infinite slow vertical oscillation (hero image, feature photos) ─
export function FloatUp({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <motion.div
      animate={{ y: [0, -14, 0] }}
      transition={{ duration: 6.5, ease: 'easeInOut', repeat: Infinity }}
      className={className}
    >
      {children}
    </motion.div>
  )
}
