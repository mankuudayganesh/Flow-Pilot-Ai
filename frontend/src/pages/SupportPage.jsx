import React, { useState, useEffect } from 'react';
import { 
  Ticket, 
  Search, 
  MessageSquare, 
  Send, 
  X, 
  ShieldAlert, 
  CheckCircle,
  HelpCircle,
  Clock,
  Sparkles,
  Bot
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import MagneticButton from '../components/MagneticButton';

export default function SupportPage() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [replyMessage, setReplyMessage] = useState('');

  useEffect(() => {
    fetchTickets();
  }, []);

  const fetchTickets = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/tickets', {
        headers: token ? { 'Authorization': `Bearer ${token}` } : {}
      });
      const data = await response.json();
      if (response.ok) {
        setTickets(data);
      } else {
        throw new Error(data.detail);
      }
    } catch (e) {
      console.warn("Backend offline. Seeding local mock tickets.");
      setTickets([
        { id: "FP-4982", customer_name: "Jane Doe", issue: "Database crash on production server - site down!", priority: "High", status: "Open", category: "Database Error", created_at: "10 min ago" },
        { id: "FP-2384", customer_name: "John Smith", issue: "Requesting custom API integration docs for Stripe", priority: "Medium", status: "In Progress", category: "API Guidance", created_at: "1 hour ago" },
        { id: "FP-8921", customer_name: "Alice Johnson", issue: "Billing discrepancy on invoice #INV-92839", priority: "Low", status: "Resolved", category: "Billing Request", created_at: "1 day ago" },
        { id: "FP-1209", customer_name: "Robert Lee", issue: "Error console logs during oauth authorization", priority: "High", status: "Open", category: "Security Auth", created_at: "2 hours ago" },
        { id: "FP-5481", customer_name: "Emily Davis", issue: "Where can I configure webhook events in settings?", priority: "Low", status: "Resolved", category: "General Question", created_at: "3 days ago" }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (ticketId, newStatus) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/tickets/${ticketId}/status?status=${newStatus}`, {
        method: 'PUT',
        headers: token ? { 'Authorization': `Bearer ${token}` } : {}
      });
      if (response.ok) {
        setTickets(prev => prev.map(t => t.id === ticketId ? { ...t, status: newStatus } : t));
        if (selectedTicket && selectedTicket.id === ticketId) {
          setSelectedTicket(prev => ({ ...prev, status: newStatus }));
        }
      } else {
        throw new Error();
      }
    } catch (e) {
      // Local fallback edit
      setTickets(prev => prev.map(t => t.id === ticketId ? { ...t, status: newStatus } : t));
      if (selectedTicket && selectedTicket.id === ticketId) {
        setSelectedTicket(prev => ({ ...prev, status: newStatus }));
      }
    }
  };

  const handleSendReply = (e) => {
    e.preventDefault();
    if (!replyMessage.trim()) return;

    // Simulate reply logging
    alert(`Reply sent to ${selectedTicket.customer_name}: "${replyMessage}"`);
    setReplyMessage('');
    handleUpdateStatus(selectedTicket.id, "Resolved");
    setSelectedTicket(null);
  };

  const handleGenerateAIDraft = () => {
    if (!selectedTicket) return;
    const customer = selectedTicket.customer_name;
    const cat = selectedTicket.category;

    if (cat === "Database Error") {
      setReplyMessage(`Hi ${customer},\n\nI understand your production database crashed. Our site reliability team has been notified of ticket #${selectedTicket.id}. We are currently investigating server logs and will restore connectivity immediately. We expect an update within 15 minutes.\n\nBest regards,\nFlowPilot Operations`);
    } else if (cat === "Billing Request") {
      setReplyMessage(`Hi ${customer},\n\nThank you for reaching out. I've reviewed your billing discrepancy ticket #${selectedTicket.id}. Our accounts team is verifying invoice details. We will adjust any surplus balances shortly.\n\nBest,\nFlowPilot Billing`);
    } else {
      setReplyMessage(`Hi ${customer},\n\nThis is an automated response to ticket #${selectedTicket.id} regarding "${selectedTicket.issue}". Our technical agents are looking into this topic and will reach out with guidelines soon.\n\nBest regards,\nFlowPilot Support`);
    }
  };

  const getPriorityStyle = (priority) => {
    switch (priority) {
      case 'High': return 'bg-danger/20 text-danger border border-danger/30';
      case 'Medium': return 'bg-warning/20 text-warning border border-warning/30';
      default: return 'bg-slate-800 text-slate-400 border border-slate-700/50';
    }
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case 'Resolved': return 'bg-success/15 text-success border border-success/30';
      case 'In Progress': return 'bg-primary/15 text-primary border border-primary/30';
      default: return 'bg-danger/15 text-danger border border-danger/30';
    }
  };

  const filteredTickets = tickets.filter(ticket => 
    ticket.customer_name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    ticket.issue.toLowerCase().includes(searchQuery.toLowerCase()) ||
    ticket.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-8 text-white relative">
      
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight">Support Ticket Center</h1>
        <p className="text-textSecondary text-sm font-light mt-1">
          Review, resolve, and classify support queries submitted by client chats.
        </p>
      </div>

      {/* Main search card */}
      <div className="glass-card rounded-2xl p-4 border border-borderColor flex gap-4 items-center justify-between">
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-500" />
          <input
            type="text"
            placeholder="Search tickets, customers, issues..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-900 border border-borderColor rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-accent transition-all"
          />
        </div>
        <div className="inline-flex items-center space-x-2 text-[10px] text-textSecondary bg-slate-900 border border-borderColor px-3 py-2.5 rounded-xl">
          <Bot className="w-3.5 h-3.5 text-accent" />
          <span>Gemini classifications active</span>
        </div>
      </div>

      {/* Grid Content: Left Table, Right Detail panel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Tickets Table (8 cols if detail open, 12 cols if closed) */}
        <div className={`${selectedTicket ? 'lg:col-span-8' : 'lg:col-span-12'} glass-card rounded-2xl border border-borderColor overflow-hidden transition-all duration-300`}>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-borderColor bg-slate-900/40 text-slate-400 font-medium">
                  <th className="p-4">Ticket ID</th>
                  <th className="p-4">Customer</th>
                  <th className="p-4">Reported Issue</th>
                  <th className="p-4">Classification</th>
                  <th className="p-4">Priority</th>
                  <th className="p-4">Status</th>
                </tr>
              </thead>
              <motion.tbody 
                className="divide-y divide-[rgba(255,255,255,0.05)]"
                initial="hidden" animate="show" variants={{
                  hidden: {},
                  show: { transition: { staggerChildren: 0.05 } }
                }}
              >
                {loading ? (
                  <tr>
                    <td colSpan="6" className="p-8 text-center text-slate-500 font-light">Loading support tickets...</td>
                  </tr>
                ) : filteredTickets.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="p-8 text-center text-slate-500 font-light">No support tickets match query.</td>
                  </tr>
                ) : (
                  filteredTickets.map((t, idx) => (
                    <motion.tr 
                      key={t.id || idx} 
                      onClick={() => setSelectedTicket(t)}
                      variants={{ hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0 } }}
                      className={`hover:bg-[rgba(255,255,255,0.02)] cursor-pointer transition-colors ${selectedTicket?.id === t.id ? 'bg-[rgba(0,229,255,0.05)]' : ''}`}
                    >
                      <td className="p-4 font-mono font-bold" style={{ color: '#00E5FF' }}>{t.id}</td>
                      <td className="p-4 font-semibold text-white">{t.customer_name}</td>
                      <td className="p-4 text-textSecondary truncate max-w-[200px]">{t.issue}</td>
                      <td className="p-4">
                        <span className="bg-[rgba(11,12,16,0.5)] border border-[rgba(255,255,255,0.1)] px-2 py-0.5 rounded text-[9px] text-slate-300 font-medium">
                          {t.category}
                        </span>
                      </td>
                      <td className="p-4">
                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${getPriorityStyle(t.priority)}`}>
                          {t.priority}
                        </span>
                      </td>
                      <td className="p-4">
                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${getStatusStyle(t.status)}`}>
                          {t.status}
                        </span>
                      </td>
                    </motion.tr>
                  ))
                )}
              </motion.tbody>
            </table>
          </div>
        </div>

        {/* Support Drawer / Response Inspector panel (4 cols) */}
        <AnimatePresence>
          {selectedTicket && (
            <motion.div 
              initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}
              transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              className="lg:col-span-4 glass-card border border-[rgba(0,229,255,0.1)] rounded-2xl p-6 flex flex-col space-y-6 bg-[#1A1B2F]"
            >
            
            {/* Header info */}
            <div className="flex justify-between items-start border-b border-borderColor pb-4">
              <div className="text-left">
                <span className="font-mono text-xs font-bold text-accent">{selectedTicket.id}</span>
                <h3 className="text-sm font-bold text-white mt-1">Ticket Details</h3>
              </div>
              <button 
                onClick={() => setSelectedTicket(null)}
                className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Ticket parameters */}
            <div className="text-left space-y-3.5 text-xs">
              <div>
                <label className="text-[9px] font-bold text-textSecondary uppercase tracking-wider">Customer</label>
                <div className="text-white font-semibold mt-1">{selectedTicket.customer_name}</div>
              </div>

              <div>
                <label className="text-[9px] font-bold text-textSecondary uppercase tracking-wider">Issue Description</label>
                <div className="text-slate-300 font-light mt-1 bg-slate-900 border border-borderColor p-3 rounded-xl leading-relaxed">
                  {selectedTicket.issue}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[9px] font-bold text-textSecondary uppercase tracking-wider">AI Classification</label>
                  <div className="font-semibold text-accent mt-1">{selectedTicket.category}</div>
                </div>
                <div>
                  <label className="text-[9px] font-bold text-textSecondary uppercase tracking-wider">Priority Status</label>
                  <div className="mt-1">
                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${getPriorityStyle(selectedTicket.priority)}`}>
                      {selectedTicket.priority}
                    </span>
                  </div>
                </div>
              </div>

              {/* Status Selector */}
              <div>
                <label className="text-[9px] font-bold text-textSecondary uppercase tracking-wider">Set Status</label>
                <div className="flex space-x-2 mt-1.5">
                  {['Open', 'In Progress', 'Resolved'].map((st) => (
                    <button
                      key={st}
                      onClick={() => handleUpdateStatus(selectedTicket.id, st)}
                      className={`px-3 py-1.5 rounded-lg border text-[10px] font-semibold transition-all ${
                        selectedTicket.status === st 
                          ? 'bg-primary text-white border-primary glow-primary' 
                          : 'border-borderColor hover:bg-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      {st}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* AI Assistant draft generator */}
            <div className="border-t border-borderColor pt-4 text-left space-y-3">
              <div className="flex justify-between items-center">
                <label className="text-[9px] font-bold text-textSecondary uppercase tracking-wider">Quick Response Compose</label>
                <button
                  type="button"
                  onClick={handleGenerateAIDraft}
                  className="flex items-center space-x-1 px-2.5 py-1 rounded bg-accent/15 hover:bg-accent/25 border border-accent/20 text-[9px] text-accent font-semibold transition-all"
                >
                  <Sparkles className="w-3 h-3 text-accent animate-pulse" />
                  <span>Draft with AI</span>
                </button>
              </div>

              <form onSubmit={handleSendReply} className="space-y-3">
                <textarea
                  rows="4"
                  value={replyMessage}
                  onChange={(e) => setReplyMessage(e.target.value)}
                  placeholder="Draft your reply..."
                  className="w-full bg-slate-900 border border-borderColor rounded-xl p-3 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-accent transition-all"
                />
                <MagneticButton
                  type="submit"
                  className="w-full py-2.5 rounded-xl font-semibold text-xs flex items-center justify-center space-x-2 text-[#0B0C10] transition-all aurora-glow"
                  style={{ background: 'linear-gradient(135deg, #00E5FF, #007BFF)' }}
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Submit Resolution & Resolve Ticket</span>
                </MagneticButton>
              </form>
            </div>

          </motion.div>
        )}
      </AnimatePresence>

      </div>

    </div>
  );
}
