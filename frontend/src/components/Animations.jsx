import React from 'react';
import { motion } from 'framer-motion';

/* ─── Page Wrapper — Fade + Scale ─────────────────────────────────────────── */
export function AnimatedPage({ children }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.97, y: 12 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.96, y: -8 }}
      transition={{ duration: 0.35, ease: [0.0, 0.0, 0.2, 1] }}
      style={{ willChange: 'transform, opacity' }}
    >
      {children}
    </motion.div>
  );
}

/* ─── Staggered container — children fade in one-by-one ────────────────────── */
export const staggerContainer = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.05,
    },
  },
};

export const fadeUpItem = {
  hidden: { opacity: 0, y: 28 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.0, 0.0, 0.2, 1] } },
};

export function StaggerList({ children, className = '' }) {
  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount: 0.15 }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export function StaggerItem({ children, className = '' }) {
  return (
    <motion.div variants={fadeUpItem} className={className}>
      {children}
    </motion.div>
  );
}

/* ─── Single scroll-reveal element ─────────────────────────────────────────── */
export function ScrollReveal({ children, delay = 0, direction = 'up', className = '' }) {
  const yStart = direction === 'up' ? 40 : direction === 'down' ? -40 : 0;
  const xStart = direction === 'left' ? 40 : direction === 'right' ? -40 : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: yStart, x: xStart }}
      whileInView={{ opacity: 1, y: 0, x: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.6, delay, ease: [0.0, 0.0, 0.2, 1] }}
      className={className}
      style={{ willChange: 'transform, opacity' }}
    >
      {children}
    </motion.div>
  );
}

/* ─── Shimmer skeleton loader ───────────────────────────────────────────────── */
export function SkeletonCard({ rows = 3, className = '' }) {
  return (
    <div className={`rounded-2xl p-5 ${className}`}
      style={{ background: '#1A1B2F', border: '1px solid rgba(0,229,255,0.08)' }}>
      <div className="shimmer h-4 rounded-full w-3/4 mb-4" />
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="shimmer h-3 rounded-full mb-2"
          style={{ width: `${65 + Math.random() * 30}%` }} />
      ))}
      <div className="shimmer h-7 rounded-xl w-1/3 mt-4" />
    </div>
  );
}

/* ─── Scale bounce modal variant ───────────────────────────────────────────── */
export const modalVariants = {
  hidden: { opacity: 0, scale: 0.88, y: 20 },
  show: {
    opacity: 1, scale: 1, y: 0,
    transition: { type: 'spring', stiffness: 380, damping: 28 }
  },
  exit: {
    opacity: 0, scale: 0.92, y: 16,
    transition: { duration: 0.18, ease: [0.4, 0, 1, 1] }
  },
};

export const backdropVariants = {
  hidden: { opacity: 0 },
  show:   { opacity: 1, transition: { duration: 0.2 } },
  exit:   { opacity: 0, transition: { duration: 0.15 } },
};

/* ─── Floating label input ─────────────────────────────────────────────────── */
export function FloatingInput({ id, label, type = 'text', value, onChange, error, success, icon, ...rest }) {
  const hasValue  = value && value.length > 0;
  const accentCol = error ? '#FF1744' : success ? '#00E676' : '#00E5FF';

  return (
    <div className="relative w-full">
      {icon && (
        <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: accentCol }}>
          {icon}
        </div>
      )}
      <input
        id={id}
        type={type}
        value={value}
        onChange={onChange}
        placeholder=" "
        className="peer w-full bg-transparent rounded-xl px-4 py-4 text-sm outline-none transition-all duration-200"
        style={{
          paddingLeft: icon ? '2.8rem' : '1rem',
          color: '#EAEAFF',
          background: '#0B0C10',
          border: `1.5px solid ${error ? '#FF1744' : '#24253D'}`,
          boxShadow: hasValue ? `0 0 0 1px ${accentCol}22` : 'none',
        }}
        onFocus={e => { e.target.style.border = `1.5px solid ${accentCol}`; e.target.style.boxShadow = `0 0 0 3px ${accentCol}22`; }}
        onBlur={e => { e.target.style.border = `1.5px solid ${error ? '#FF1744' : '#24253D'}`; e.target.style.boxShadow = 'none'; }}
        {...rest}
      />
      {/* Floating label */}
      <label
        htmlFor={id}
        className="absolute text-xs font-medium pointer-events-none transition-all duration-200 ease-out"
        style={{
          left: icon ? '2.8rem' : '1rem',
          top: hasValue ? '-0.55rem' : '1rem',
          fontSize: hasValue ? '0.65rem' : '0.8rem',
          color: hasValue ? accentCol : '#A8A9C8',
          background: hasValue ? '#0B0C10' : 'transparent',
          paddingInline: hasValue ? '4px' : '0',
          borderRadius: '3px',
        }}
      >
        {label}
      </label>
      {/* Underline bar */}
      <motion.div
        initial={{ scaleX: 0 }}
        animate={{ scaleX: hasValue ? 1 : 0 }}
        transition={{ duration: 0.3 }}
        className="absolute bottom-0 left-0 right-0 h-0.5 rounded-b-xl origin-left"
        style={{ background: accentCol, boxShadow: `0 0 8px ${accentCol}` }}
      />
      {/* Error / Success message */}
      {error && (
        <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }}
          className="text-[10px] mt-1 ml-1" style={{ color: '#FF1744' }}>
          {error}
        </motion.p>
      )}
    </div>
  );
}
