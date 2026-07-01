import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Search, 
  Mail, 
  Phone, 
  DollarSign, 
  Calendar, 
  MessageSquare, 
  Activity, 
  X,
  Bot
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { StaggerList, StaggerItem, modalVariants, backdropVariants } from '../components/Animations';

export default function CustomersPage() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState(null);

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/customers', {
        headers: token ? { 'Authorization': `Bearer ${token}` } : {}
      });
      const data = await response.json();
      if (response.ok) {
        setCustomers(data);
      } else {
        throw new Error(data.detail);
      }
    } catch (e) {
      console.warn("Backend offline. Seeding local customer database.");
      setCustomers([
        { id: 1, name: "Acme Corp", email: "contact@acme.com", phone: "+1 (555) 019-2831", status: "Active", revenue: 35000, joined_at: "2 months ago", tickets: 1, logs: ["Account provisioned", "Captured lead via AI agent", "Contract verified"] },
        { id: 2, name: "Hedge Mutual Fund", email: "ops@hedgemutual.com", phone: "+1 (555) 024-9182", status: "Active", revenue: 75000, joined_at: "1 week ago", tickets: 0, logs: ["Captured lead via AI chatbot", "Onboarding completed"] },
        { id: 3, name: "Alice Johnson", email: "alice.j@retailshop.com", phone: "+1 (555) 089-1290", status: "Active", revenue: 25000, joined_at: "1 month ago", tickets: 1, logs: ["Billing discrepancy resolved", "Captured lead via chatbot"] },
        { id: 4, name: "Nova Logistics", email: "tech@novalogistics.com", phone: "+1 (555) 041-3982", status: "Prospect", revenue: 0, joined_at: "3 days ago", tickets: 2, logs: ["Captured lead via chatbot", "Tickets created automatically"] },
        { id: 5, name: "Global Retail Inc", email: "info@globalretail.com", phone: "+1 (555) 012-4821", status: "Active", revenue: 22000, joined_at: "3 weeks ago", tickets: 0, logs: ["Web App captured opportunity", "Payment integration synced"] }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const filteredCustomers = customers.filter(c => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    c.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-8 text-white">
      
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight">Customer Database</h1>
        <p className="text-textSecondary text-sm font-light mt-1">
          Monitor your customer portfolio, track lifetime contract values, and view engagement histories.
        </p>
      </div>

      {/* Control panel */}
      <div className="glass-card rounded-2xl p-4 border border-borderColor flex items-center justify-between">
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-500" />
          <input
            type="text"
            placeholder="Search customers, emails..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-900 border border-borderColor rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-accent transition-all"
          />
        </div>
        <div className="text-xs text-textSecondary hidden sm:block">
          Total Customers Listed: <span className="text-white font-bold">{filteredCustomers.length}</span>
        </div>
      </div>

      {/* Cards list */}
      <StaggerList className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full text-center text-slate-500 font-light py-8">Loading CRM Database...</div>
        ) : filteredCustomers.length === 0 ? (
          <div className="col-span-full text-center text-slate-500 font-light py-8">No customer logs found.</div>
        ) : (
          filteredCustomers.map((c) => (
            <StaggerItem key={c.id}>
              <div 
                onClick={() => setSelectedCustomer(c)}
                className="glass-card rounded-2xl p-6 text-left border border-[rgba(255,255,255,0.05)] hover:border-[rgba(0,229,255,0.4)] cursor-pointer flex flex-col justify-between transition-all duration-300 hover:shadow-[0_0_20px_rgba(0,229,255,0.15)]"
                style={{ background: 'rgba(36, 37, 61, 0.4)' }}
              >
                <div>
                  <div className="flex justify-between items-start mb-4">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-white"
                      style={{ background: 'linear-gradient(135deg, #00E5FF, #FF007F)' }}>
                      {c.name.charAt(0).toUpperCase()}
                    </div>
                  <span className={`px-2.5 py-1 rounded-full text-[9px] font-bold border ${
                    c.status === 'Active' 
                      ? 'bg-success/20 text-success border-success/30' 
                      : 'bg-warning/20 text-warning border-warning/30'
                  }`}>
                    {c.status}
                  </span>
                </div>

                <h3 className="text-md font-bold text-white mb-1.5">{c.name}</h3>
                
                <div className="space-y-2 text-xs text-textSecondary mb-6 font-light">
                  <div className="flex items-center space-x-2.5">
                    <Mail className="w-4 h-4 text-slate-500" />
                    <span className="truncate">{c.email}</span>
                  </div>
                  <div className="flex items-center space-x-2.5">
                    <Phone className="w-4 h-4 text-slate-500" />
                    <span>{c.phone}</span>
                  </div>
                </div>
              </div>

              {/* Card Footer metrics */}
              <div className="border-t border-slate-800/80 pt-4 flex justify-between items-center text-xs">
                <div>
                  <span className="text-[10px] text-slate-500 uppercase tracking-wider block">Contract Value</span>
                  <span className="text-white font-mono font-bold">${c.revenue.toLocaleString()}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 uppercase tracking-wider block text-right">Joined</span>
                  <span className="text-slate-300 font-medium">{c.joined_at}</span>
                </div>
              </div>

              </div>
            </StaggerItem>
          ))
        )}
      </StaggerList>

      {/* Customer Detail Profile Popup */}
      <AnimatePresence>
        {selectedCustomer && (
          <motion.div 
            className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-md"
            style={{ background: 'rgba(11, 12, 16, 0.7)' }}
            variants={backdropVariants} initial="hidden" animate="show" exit="exit"
          >
            <motion.div 
              className="w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden text-left p-6"
              style={{ background: '#1A1B2F', border: '1px solid rgba(0,229,255,0.15)' }}
              variants={modalVariants}
            >
              
              {/* Header */}
              <div className="flex justify-between items-center border-b border-[rgba(255,255,255,0.1)] pb-4 mb-5">
                <div className="flex items-center space-x-3">
                  <div className="w-9 h-9 rounded-lg flex items-center justify-center text-[#0B0C10] font-bold"
                    style={{ background: 'linear-gradient(135deg, #00E5FF, #007BFF)' }}>
                  {selectedCustomer.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">{selectedCustomer.name}</h3>
                  <span className="text-[10px] text-accent font-mono">Customer Profile</span>
                </div>
              </div>
              <button onClick={() => setSelectedCustomer(null)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Profile fields */}
            <div className="space-y-5 text-xs text-left">
              
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-900/60 p-3 rounded-xl border border-borderColor">
                  <span className="text-[9px] text-slate-500 uppercase block tracking-wider">Email Address</span>
                  <span className="text-white font-medium break-all">{selectedCustomer.email}</span>
                </div>
                <div className="bg-slate-900/60 p-3 rounded-xl border border-borderColor">
                  <span className="text-[9px] text-slate-500 uppercase block tracking-wider">Contact Phone</span>
                  <span className="text-white font-medium">{selectedCustomer.phone}</span>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="bg-slate-900/60 p-3 rounded-xl border border-borderColor text-center">
                  <span className="text-[9px] text-slate-500 uppercase block tracking-wider">Contract LTV</span>
                  <span className="text-white font-mono font-bold">${selectedCustomer.revenue.toLocaleString()}</span>
                </div>
                <div className="bg-slate-900/60 p-3 rounded-xl border border-borderColor text-center">
                  <span className="text-[9px] text-slate-500 uppercase block tracking-wider">Active Tickets</span>
                  <span className="text-danger font-bold">{selectedCustomer.tickets} Open</span>
                </div>
                <div className="bg-slate-900/60 p-3 rounded-xl border border-borderColor text-center">
                  <span className="text-[9px] text-slate-500 uppercase block tracking-wider">Record Status</span>
                  <span className="text-success font-semibold">{selectedCustomer.status}</span>
                </div>
              </div>

              {/* Activity audit log */}
              <div>
                <label className="text-[9px] font-bold text-textSecondary uppercase tracking-wider block mb-2">Platform Activity History</label>
                <div className="bg-slate-900 border border-borderColor rounded-xl p-4 space-y-3.5 max-h-40 overflow-y-auto">
                  {selectedCustomer.logs.map((log, idx) => (
                    <div key={idx} className="flex items-start space-x-3 text-[10px] text-slate-400">
                      <Activity className="w-4 h-4 text-slate-600 mt-0.5" />
                      <span>{log}</span>
                    </div>
                  ))}
                </div>
              </div>

            </div>

            {/* Modal action buttons */}
            <div className="pt-5 border-t border-borderColor mt-6 flex justify-end">
              <button
                onClick={() => setSelectedCustomer(null)}
                className="px-6 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs transition-colors"
              >
                Close Profile
              </button>
            </div>

          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>

    </div>
  );
}
