import React, { createContext, useContext, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle, AlertTriangle, Info, XCircle } from 'lucide-react';

/* ─── Context ──────────────────────────────────────────────────────────────── */
const ToastContext = createContext(null);

let toastId = 0;

const ICONS = {
  success: <CheckCircle className="w-4 h-4 text-[#00E676]" />,
  warning: <AlertTriangle className="w-4 h-4 text-[#FF9100]" />,
  error:   <XCircle className="w-4 h-4 text-[#FF1744]" />,
  info:    <Info className="w-4 h-4 text-[#00E5FF]" />,
};

const COLORS = {
  success: { bar: '#00E676', border: 'rgba(0,230,118,0.25)', bg: 'rgba(0,230,118,0.08)' },
  warning: { bar: '#FF9100', border: 'rgba(255,145,0,0.25)',  bg: 'rgba(255,145,0,0.08)'  },
  error:   { bar: '#FF1744', border: 'rgba(255,23,68,0.25)',  bg: 'rgba(255,23,68,0.08)'  },
  info:    { bar: '#00E5FF', border: 'rgba(0,229,255,0.25)',  bg: 'rgba(0,229,255,0.08)'  },
};

/* ─── Single Toast ─────────────────────────────────────────────────────────── */
function Toast({ id, type = 'info', title, message, duration = 4000, onRemove }) {
  const { bar, border, bg } = COLORS[type] || COLORS.info;
  const [width, setWidth] = React.useState(100);

  React.useEffect(() => {
    const start = Date.now();
    const interval = setInterval(() => {
      const elapsed = Date.now() - start;
      const pct = Math.max(0, 100 - (elapsed / duration) * 100);
      setWidth(pct);
      if (pct <= 0) {
        clearInterval(interval);
        onRemove(id);
      }
    }, 30);
    return () => clearInterval(interval);
  }, [id, duration, onRemove]);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: 80, scale: 0.92 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 80, scale: 0.9, transition: { duration: 0.2 } }}
      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
      className="relative w-80 rounded-xl overflow-hidden shadow-2xl"
      style={{ background: '#1A1B2F', border: `1px solid ${border}` }}
    >
      {/* Colored left strip */}
      <div className="absolute left-0 top-0 bottom-0 w-1 rounded-l-xl" style={{ background: bar }} />

      <div className="flex items-start gap-3 px-4 py-3 pl-5">
        <div className="mt-0.5 flex-shrink-0" style={{ filter: 'drop-shadow(0 0 6px currentColor)' }}>
          {ICONS[type]}
        </div>
        <div className="flex-1 min-w-0">
          {title && <p className="text-xs font-bold text-[#EAEAFF] mb-0.5">{title}</p>}
          {message && <p className="text-[11px] text-[#A8A9C8] leading-relaxed">{message}</p>}
        </div>
        <button onClick={() => onRemove(id)} className="text-[#A8A9C8] hover:text-[#EAEAFF] transition-colors flex-shrink-0 mt-0.5">
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Progress bar */}
      <div className="h-0.5 transition-none" style={{ background: `${bar}30` }}>
        <div className="h-full transition-none" style={{ width: `${width}%`, background: bar, boxShadow: `0 0 8px ${bar}` }} />
      </div>
    </motion.div>
  );
}

/* ─── Provider ─────────────────────────────────────────────────────────────── */
export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const remove = useCallback((id) => {
    setToasts(t => t.filter(x => x.id !== id));
  }, []);

  const toast = useCallback((opts) => {
    const id = ++toastId;
    setToasts(t => [...t, { id, ...opts }]);
    return id;
  }, []);

  // Shorthand helpers
  toast.success = (title, message, opts) => toast({ type: 'success', title, message, ...opts });
  toast.error   = (title, message, opts) => toast({ type: 'error', title, message, ...opts });
  toast.warning = (title, message, opts) => toast({ type: 'warning', title, message, ...opts });
  toast.info    = (title, message, opts) => toast({ type: 'info', title, message, ...opts });

  return (
    <ToastContext.Provider value={toast}>
      {children}
      {/* Toast container — top-right */}
      <div className="fixed top-6 right-6 z-[10000] flex flex-col gap-3 pointer-events-none">
        <AnimatePresence mode="popLayout">
          {toasts.map(t => (
            <div key={t.id} className="pointer-events-auto">
              <Toast {...t} onRemove={remove} />
            </div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

export const useToast = () => useContext(ToastContext);
