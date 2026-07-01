import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { 
  Bot, 
  LayoutDashboard, 
  MessageSquare, 
  Layers, 
  Ticket, 
  Users, 
  LineChart, 
  Settings, 
  Menu, 
  ChevronLeft, 
  ChevronRight,
  Search, 
  Bell, 
  User, 
  LogOut,
  ChevronDown,
  X
} from 'lucide-react';
import ThemeToggle from './ThemeToggle';
import { useTheme } from '../context/ThemeContext';

export default function DashboardLayout({ children }) {
  const navigate = useNavigate();
  const location = useLocation();
  
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  const [user, setUser] = useState({ name: 'Operator', email: 'operator@flowpilot.ai' });
  const [notifications, setNotifications] = useState([
    { id: 1, text: "High-score Lead captured from AI chat (98%)", read: false, time: "2 min ago" },
    { id: 2, text: "Support Ticket classified automatically (#FP-2983)", read: false, time: "15 min ago" },
    { id: 3, text: "Daily analytics pipeline synced successfully", read: true, time: "2 hours ago" }
  ]);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        console.error(e);
      }
    }
    
    // Auth guard
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
    }
  }, [navigate]);

  const navItems = [
    { label: 'Dashboard', path: '/dashboard', icon: <LayoutDashboard className="w-5 h-5" /> },
    { label: 'AI Agent', path: '/dashboard/ai-agent', icon: <Bot className="w-5 h-5" /> },
    { label: 'Leads', path: '/dashboard/leads', icon: <Layers className="w-5 h-5" /> },
    { label: 'Support Tickets', path: '/dashboard/tickets', icon: <Ticket className="w-5 h-5" /> },
    { label: 'Customers', path: '/dashboard/customers', icon: <Users className="w-5 h-5" /> },
    { label: 'Analytics', path: '/dashboard/analytics', icon: <LineChart className="w-5 h-5" /> },
    { label: 'Settings', path: '/dashboard/settings', icon: <Settings className="w-5 h-5" /> },
  ];

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const activeIndex = navItems.findIndex(item => item.path === location.pathname);

  const unreadNotificationsCount = notifications.filter(n => !n.read).length;

  const markAllNotificationsAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  return (
    <div className="min-h-screen bg-[#0F172A] text-textPrimary flex">
      
      {/* 1. SIDEBAR (Desktop) */}
      <aside 
        className={`hidden md:flex flex-col border-r border-borderColor bg-[#0A0F1D]/80 backdrop-blur-lg transition-all duration-300 relative z-20 ${
          collapsed ? 'w-20' : 'w-64'
        }`}
      >
        {/* Logo and Collapse Toggle */}
        <div className="h-20 flex items-center justify-between px-6 border-b border-borderColor">
          <div className="flex items-center space-x-3 overflow-hidden">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-tr from-primary to-secondary flex items-center justify-center flex-shrink-0">
              <Bot className="w-5 h-5 text-white" />
            </div>
            {!collapsed && (
              <span className="text-md font-bold tracking-tight text-white whitespace-nowrap bg-gradient-to-r from-white to-accent bg-clip-text text-transparent">
                FlowPilot AI
              </span>
            )}
          </div>
          <button 
            onClick={() => setCollapsed(!collapsed)}
            className="text-slate-400 hover:text-white p-1 rounded-md hover:bg-slate-800 transition-colors"
          >
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* Sidebar Nav Items */}
        <nav className="flex-1 px-4 py-6 space-y-2 relative">
          
          {/* Slide Indicator effect (Simplified clean rendering using conditional styles) */}
          {navItems.map((item, idx) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={idx}
                to={item.path}
                className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 group relative ${
                  isActive 
                    ? 'bg-gradient-to-r from-primary/20 to-secondary/10 border-l-4 border-primary text-white font-semibold' 
                    : 'text-textSecondary hover:text-white hover:bg-slate-800/40'
                }`}
              >
                <div className={`${isActive ? 'text-accent' : 'text-slate-400 group-hover:text-accent transition-colors'}`}>
                  {item.icon}
                </div>
                {!collapsed && (
                  <span className="text-sm font-medium transition-opacity duration-300">{item.label}</span>
                )}
                
                {/* Micro tooltip when collapsed */}
                {collapsed && (
                  <div className="absolute left-20 bg-slate-950 text-white text-xs font-semibold px-2 py-1.5 rounded-md border border-borderColor opacity-0 group-hover:opacity-100 transition-all pointer-events-none whitespace-nowrap z-50 shadow-xl">
                    {item.label}
                  </div>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Sidebar Operator Status Footer */}
        <div className="p-4 border-t border-borderColor">
          <div className="flex items-center space-x-3 overflow-hidden">
            <div className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center flex-shrink-0 text-accent font-bold">
              {user.name.charAt(0).toUpperCase()}
            </div>
            {!collapsed && (
              <div className="text-left overflow-hidden">
                <div className="text-xs font-bold text-white truncate">{user.name}</div>
                <div className="text-[10px] text-slate-500 truncate">{user.email}</div>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* 2. MOBILE DRAWER NAVIGATION */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden bg-bgPrimary/70 backdrop-blur-sm">
          <div className="w-64 bg-[#0A0F1D] border-r border-borderColor flex flex-col p-6 space-y-6 relative h-full">
            <button 
              onClick={() => setMobileOpen(false)}
              className="absolute right-4 top-4 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="flex items-center space-x-3">
              <div className="w-9 h-9 rounded-lg bg-gradient-to-tr from-primary to-secondary flex items-center justify-center">
                <Bot className="w-5 h-5 text-white" />
              </div>
              <span className="text-md font-bold text-white">FlowPilot AI</span>
            </div>
            
            <nav className="flex-1 space-y-1">
              {navItems.map((item, idx) => {
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={idx}
                    to={item.path}
                    onClick={() => setMobileOpen(false)}
                    className={`flex items-center space-x-3 px-4 py-3.5 rounded-xl transition-all duration-200 ${
                      isActive 
                        ? 'bg-gradient-to-r from-primary/20 to-secondary/10 border-l-4 border-primary text-white font-bold' 
                        : 'text-textSecondary hover:text-white hover:bg-slate-800/40'
                    }`}
                  >
                    <div className={isActive ? 'text-accent' : 'text-slate-400'}>{item.icon}</div>
                    <span className="text-sm font-medium">{item.label}</span>
                  </Link>
                );
              })}
            </nav>
            <button
              onClick={handleLogout}
              className="flex items-center space-x-3 px-4 py-3.5 rounded-xl text-danger hover:bg-danger/10 transition-colors w-full text-left font-medium text-sm"
            >
              <LogOut className="w-5 h-5" />
              <span>Log Out Workspace</span>
            </button>
          </div>
        </div>
      )}

      {/* 3. MAIN WORKSPACE */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* TOPBAR */}
        <header className="h-20 border-b border-borderColor bg-[#0F172A]/70 backdrop-blur-md flex items-center justify-between px-6 sm:px-8 relative z-10">
          
          {/* Mobile menu trigger / Title header */}
          <div className="flex items-center space-x-4">
            <button 
              onClick={() => setMobileOpen(true)}
              className="md:hidden text-slate-400 hover:text-white p-1 rounded-md hover:bg-slate-800"
            >
              <Menu className="w-6 h-6" />
            </button>
            
            {/* Search Input */}
            <div className="relative max-w-xs hidden sm:block">
              <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
              <input
                type="text"
                placeholder="Global command search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-60 bg-slate-900 border border-borderColor rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-all"
              />
            </div>
          </div>

          {/* Interactive controls */}
          <div className="flex items-center space-x-4 relative">
            
            {/* Theme Toggle */}
            <ThemeToggle />

            {/* Notifications Dropdown Panel */}
            <div className="relative">
              <button 
                onClick={() => {
                  setNotificationsOpen(!notificationsOpen);
                  setUserDropdownOpen(false);
                }}
                className="p-2.5 rounded-xl border border-borderColor bg-slate-900/60 hover:bg-slate-800 text-slate-300 hover:text-white transition-all relative"
              >
                <Bell className="w-4 h-4" />
                {unreadNotificationsCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-danger animate-pulse" />
                )}
              </button>

              {notificationsOpen && (
                <div className="absolute right-0 mt-3 w-80 rounded-2xl border border-borderColor bg-[#1E293B] shadow-2xl overflow-hidden animate-fade-in p-1">
                  <div className="px-4 py-3 border-b border-borderColor flex items-center justify-between bg-slate-900/50">
                    <span className="text-xs font-bold text-white uppercase tracking-wider">Notifications</span>
                    <button 
                      onClick={markAllNotificationsAsRead}
                      className="text-[10px] text-accent hover:underline font-semibold"
                    >
                      Mark all read
                    </button>
                  </div>
                  <div className="divide-y divide-slate-800 max-h-60 overflow-y-auto">
                    {notifications.map((n) => (
                      <div key={n.id} className={`p-4 text-xs hover:bg-slate-800/30 transition-colors ${!n.read ? 'bg-primary/5' : ''}`}>
                        <div className="flex justify-between items-start mb-1 text-slate-300">
                          <span className={`${!n.read ? 'font-semibold text-white' : 'font-light'}`}>{n.text}</span>
                        </div>
                        <span className="text-[10px] text-slate-500 font-light">{n.time}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Profile Dropdown Menu */}
            <div className="relative">
              <button 
                onClick={() => {
                  setUserDropdownOpen(!userDropdownOpen);
                  setNotificationsOpen(false);
                }}
                className="flex items-center space-x-2 px-3 py-2.5 rounded-xl border border-borderColor bg-slate-900/60 hover:bg-slate-800 transition-all"
              >
                <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-primary to-secondary text-white font-bold flex items-center justify-center text-xs">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <span className="text-xs font-medium text-slate-300 hidden md:block max-w-[100px] truncate">{user.name}</span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {userDropdownOpen && (
                <div className="absolute right-0 mt-3 w-56 rounded-2xl border border-borderColor bg-[#1E293B] shadow-2xl overflow-hidden animate-fade-in p-1">
                  <div className="px-4 py-3 border-b border-borderColor bg-slate-900/50">
                    <div className="text-xs font-bold text-white">{user.name}</div>
                    <div className="text-[10px] text-slate-500 truncate">{user.email}</div>
                  </div>
                  <div className="p-1">
                    <Link 
                      to="/dashboard/settings" 
                      onClick={() => setUserDropdownOpen(false)}
                      className="flex items-center space-x-2.5 px-3 py-2.5 rounded-lg text-xs hover:bg-slate-800 text-slate-300 hover:text-white transition-colors"
                    >
                      <Settings className="w-4 h-4 text-slate-500" />
                      <span>Account Settings</span>
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="flex items-center space-x-2.5 px-3 py-2.5 rounded-lg text-xs hover:bg-danger/10 text-danger transition-colors w-full text-left font-semibold"
                    >
                      <LogOut className="w-4 h-4 text-danger" />
                      <span>Log Out Workspace</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

          </div>

        </header>

        {/* PAGE CONTENT CONTAINER */}
        <main className="flex-1 overflow-y-auto p-6 sm:p-8 relative">
          <div className="max-w-7xl mx-auto space-y-8">
            {children}
          </div>
        </main>
      </div>

    </div>
  );
}
