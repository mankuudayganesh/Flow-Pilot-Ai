import React, { useEffect, useRef } from 'react';
import { useTheme } from '../context/ThemeContext';

/**
 * Custom glowing cursor that follows the mouse with a ~80ms delay.
 * Changes size + color when hovering over interactive elements.
 */
export default function CustomCursor() {
  const cursorRef  = useRef(null);
  const dotRef     = useRef(null);
  const { isDark } = useTheme();

  useEffect(() => {
    const cursor  = cursorRef.current;
    const dot     = dotRef.current;
    if (!cursor || !dot) return;

    let mouseX = window.innerWidth / 2;
    let mouseY = window.innerHeight / 2;
    let curX   = mouseX;
    let curY   = mouseY;
    let raf;

    const lerp = (a, b, t) => a + (b - a) * t;

    const animate = () => {
      curX = lerp(curX, mouseX, 0.12);
      curY = lerp(curY, mouseY, 0.12);
      cursor.style.transform = `translate(${curX - 20}px, ${curY - 20}px)`;
      dot.style.transform    = `translate(${mouseX - 3}px, ${mouseY - 3}px)`;
      raf = requestAnimationFrame(animate);
    };
    raf = requestAnimationFrame(animate);

    const onMove = (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
    };

    const onEnter = () => {
      cursor.style.width   = '56px';
      cursor.style.height  = '56px';
      cursor.style.opacity = '1';
      cursor.style.background = isDark
        ? 'rgba(0,229,255,0.12)'
        : 'rgba(109,40,217,0.10)';
      cursor.style.borderColor = isDark ? '#00E5FF' : '#7C3AED';
    };

    const onLeave = () => {
      cursor.style.width   = '40px';
      cursor.style.height  = '40px';
      cursor.style.background = 'transparent';
      cursor.style.borderColor = isDark ? 'rgba(0,229,255,0.5)' : 'rgba(124,58,237,0.5)';
    };

    const interactives = document.querySelectorAll('a,button,input,textarea,[data-cursor]');
    interactives.forEach(el => {
      el.addEventListener('mouseenter', onEnter);
      el.addEventListener('mouseleave', onLeave);
    });

    window.addEventListener('mousemove', onMove);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('mousemove', onMove);
      interactives.forEach(el => {
        el.removeEventListener('mouseenter', onEnter);
        el.removeEventListener('mouseleave', onLeave);
      });
    };
  }, [isDark]);

  const accentColor = isDark ? 'rgba(0,229,255,0.5)' : 'rgba(124,58,237,0.5)';
  const dotColor    = isDark ? '#00E5FF' : '#7C3AED';

  return (
    <>
      {/* Large trailing ring */}
      <div
        ref={cursorRef}
        className="fixed top-0 left-0 z-[9999] pointer-events-none rounded-full border-2 transition-[width,height,background] duration-200"
        style={{
          width: '40px',
          height: '40px',
          borderColor: accentColor,
          background: 'transparent',
          mixBlendMode: 'normal',
          willChange: 'transform',
        }}
      />
      {/* Instant dot */}
      <div
        ref={dotRef}
        className="fixed top-0 left-0 z-[9999] pointer-events-none rounded-full"
        style={{
          width: '6px',
          height: '6px',
          background: dotColor,
          boxShadow: `0 0 8px 3px ${dotColor}`,
          willChange: 'transform',
        }}
      />
    </>
  );
}
