import React from 'react';
import { useTheme } from '../context/ThemeContext';
import { Sun, Moon } from 'lucide-react';

export default function ThemeToggle({ className = '' }) {
  const { isDark, toggle } = useTheme();

  return (
    <button
      onClick={toggle}
      aria-label="Toggle theme"
      className={`relative w-14 h-7 rounded-full transition-all duration-500 focus:outline-none group ${
        isDark
          ? 'bg-gradient-to-r from-violet-900/80 to-indigo-900/80 border border-violet-700/40'
          : 'bg-gradient-to-r from-amber-100 to-yellow-50 border border-amber-200'
      } ${className}`}
    >
      {/* Track glow */}
      <span className={`absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 ${
        isDark ? 'bg-violet-500/10' : 'bg-amber-400/10'
      }`} />

      {/* Sliding knob */}
      <span className={`absolute top-0.5 w-6 h-6 rounded-full shadow-md flex items-center justify-center transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] ${
        isDark
          ? 'translate-x-0.5 bg-gradient-to-br from-violet-400 to-indigo-500 shadow-violet-500/30'
          : 'translate-x-7 bg-gradient-to-br from-amber-400 to-orange-400 shadow-amber-400/40'
      }`}>
        {isDark
          ? <Moon className="w-3 h-3 text-white" />
          : <Sun className="w-3 h-3 text-white" />
        }
      </span>
    </button>
  );
}
