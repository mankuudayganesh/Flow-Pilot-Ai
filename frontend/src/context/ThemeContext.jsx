import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('fp_theme') || 'dark';
  });

  useEffect(() => {
    localStorage.setItem('fp_theme', theme);
    document.documentElement.setAttribute('data-theme', theme);
    // Update body background instantly
    document.body.style.backgroundColor = theme === 'dark' ? '#06060f' : '#f8f7ff';
  }, [theme]);

  const toggle = () => setTheme(t => t === 'dark' ? 'light' : 'dark');
  const isDark = theme === 'dark';

  return (
    <ThemeContext.Provider value={{ theme, toggle, isDark }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);
