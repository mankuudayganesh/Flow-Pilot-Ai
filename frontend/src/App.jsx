import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { ThemeProvider } from './context/ThemeContext';
import { ToastProvider } from './components/Toast';
import { AnimatedPage } from './components/Animations';

import LandingPage    from './pages/LandingPage';
import AuthPages      from './pages/AuthPages';
import DashboardLayout from './components/DashboardLayout';
import DashboardPage  from './pages/DashboardPage';
import AIAgentPage    from './pages/AIAgentPage';
import LeadsPage      from './pages/LeadsPage';
import SupportPage    from './pages/SupportPage';
import CustomersPage  from './pages/CustomersPage';
import AnalyticsPage  from './pages/AnalyticsPage';
import SettingsPage   from './pages/SettingsPage';

function RequireAuth({ children }) {
  const token = localStorage.getItem('token');
  if (!token) return <Navigate to="/login" replace />;
  return children;
}

/* Animated route wrapper that uses the current path as the key */
function AnimatedRoutes() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait" initial={false}>
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<AnimatedPage><LandingPage /></AnimatedPage>} />
        <Route path="/login"    element={<AnimatedPage><AuthPages /></AnimatedPage>} />
        <Route path="/register" element={<AnimatedPage><AuthPages /></AnimatedPage>} />

        <Route path="/dashboard" element={
          <RequireAuth>
            <AnimatedPage>
              <DashboardLayout><DashboardPage /></DashboardLayout>
            </AnimatedPage>
          </RequireAuth>
        } />
        <Route path="/dashboard/ai-agent" element={
          <RequireAuth>
            <AnimatedPage>
              <DashboardLayout><AIAgentPage /></DashboardLayout>
            </AnimatedPage>
          </RequireAuth>
        } />
        <Route path="/dashboard/leads" element={
          <RequireAuth>
            <AnimatedPage>
              <DashboardLayout><LeadsPage /></DashboardLayout>
            </AnimatedPage>
          </RequireAuth>
        } />
        <Route path="/dashboard/tickets" element={
          <RequireAuth>
            <AnimatedPage>
              <DashboardLayout><SupportPage /></DashboardLayout>
            </AnimatedPage>
          </RequireAuth>
        } />
        <Route path="/dashboard/customers" element={
          <RequireAuth>
            <AnimatedPage>
              <DashboardLayout><CustomersPage /></DashboardLayout>
            </AnimatedPage>
          </RequireAuth>
        } />
        <Route path="/dashboard/analytics" element={
          <RequireAuth>
            <AnimatedPage>
              <DashboardLayout><AnalyticsPage /></DashboardLayout>
            </AnimatedPage>
          </RequireAuth>
        } />
        <Route path="/dashboard/settings" element={
          <RequireAuth>
            <AnimatedPage>
              <DashboardLayout><SettingsPage /></DashboardLayout>
            </AnimatedPage>
          </RequireAuth>
        } />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AnimatePresence>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <ToastProvider>
        <BrowserRouter>
          <AnimatedRoutes />
        </BrowserRouter>
      </ToastProvider>
    </ThemeProvider>
  );
}
