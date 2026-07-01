import React, { useRef, useState } from 'react';
import { motion } from 'framer-motion';

/**
 * MagneticButton — button that moves toward the cursor on hover (magnetic effect)
 * + 3D tilt effect based on mouse position within the button
 * + Ripple effect on click
 */
export default function MagneticButton({
  children,
  className = '',
  style = {},
  onClick,
  strength = 0.35,
  ...props
}) {
  const ref = useRef(null);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const [tilt, setTilt] = useState({ rotateX: 0, rotateY: 0 });
  const [ripples, setRipples] = useState([]);

  const handleMouseMove = (e) => {
    const rect = ref.current.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const dx = e.clientX - cx;
    const dy = e.clientY - cy;
    setPos({ x: dx * strength, y: dy * strength });
    // 3D tilt
    const rx = -(dy / (rect.height / 2)) * 8;
    const ry =  (dx / (rect.width  / 2)) * 8;
    setTilt({ rotateX: rx, rotateY: ry });
  };

  const handleMouseLeave = () => {
    setPos({ x: 0, y: 0 });
    setTilt({ rotateX: 0, rotateY: 0 });
  };

  const handleClick = (e) => {
    const rect = ref.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const id = Date.now();
    setRipples(r => [...r, { id, x, y }]);
    setTimeout(() => setRipples(r => r.filter(rp => rp.id !== id)), 700);
    onClick?.(e);
  };

  return (
    <motion.button
      ref={ref}
      animate={{ x: pos.x, y: pos.y, rotateX: tilt.rotateX, rotateY: tilt.rotateY }}
      transition={{ type: 'spring', stiffness: 300, damping: 20, mass: 0.5 }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={handleClick}
      className={`relative overflow-hidden ${className}`}
      style={{ transformStyle: 'preserve-3d', perspective: '600px', ...style }}
      whileTap={{ scale: 0.97 }}
      {...props}
    >
      {children}
      {/* Ripple effects */}
      {ripples.map(r => (
        <span
          key={r.id}
          className="absolute rounded-full animate-ping pointer-events-none"
          style={{
            left: r.x - 60,
            top:  r.y - 60,
            width: 120,
            height: 120,
            background: 'rgba(255,255,255,0.25)',
            animationDuration: '0.7s',
            animationTimingFunction: 'ease-out',
            animationIterationCount: 1,
          }}
        />
      ))}
    </motion.button>
  );
}
