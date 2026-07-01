import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Filter, 
  ChevronDown, 
  ChevronUp, 
  Plus, 
  TrendingUp, 
  ArrowUpDown,
  Sparkles,
  Edit,
  Trash2,
  X,
  FileText
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import MagneticButton from '../components/MagneticButton';
import { modalVariants, backdropVariants } from '../components/Animations';

export default function LeadsPage() {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [priorityFilter, setPriorityFilter] = useState('All');
  const [sortField, setSortField] = useState('score');
  const [sortDirection, setSortDirection] = useState('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newLead, setNewLead] = useState({
    name: '',
    service: 'Ecommerce Website',
    budget: '',
    priority: 'Medium',
    score: 80,
    status: 'New',
    source: 'Manual Input'
  });

  useEffect(() => {
    fetchLeads();
  }, []);

  const fetchLeads = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/leads', {
        headers: token ? { 'Authorization': `Bearer ${token}` } : {}
      });
      const data = await response.json();
      if (response.ok) {
        setLeads(data);
      } else {
        throw new Error(data.detail);
      }
    } catch (e) {
      console.warn("Backend unavailable. Seeding local mock lead records.");
      setLeads([
        { id: 1, name: "Acme Corp Ltd", service: "Enterprise SaaS Integration", budget: 35000, priority: "High", score: 96, status: "Active", source: "AI Chatbot" },
        { id: 2, name: "Global Retail Inc", service: "Ecommerce Solution", budget: 25000, priority: "High", score: 92, status: "New", source: "AI Chatbot" },
        { id: 3, name: "Synergy Labs", service: "Database Support Automation", budget: 12000, priority: "Medium", score: 78, status: "Contacted", source: "AI Chatbot" },
        { id: 4, name: "Beta App Corp", service: "API Workflow Integration", budget: 50000, priority: "High", score: 94, status: "New", source: "AI Chatbot" },
        { id: 5, name: "Apex Solutions", service: "Cloud Consulting Operations", budget: 8000, priority: "Low", score: 54, status: "Lost", source: "Form Submission" },
        { id: 6, name: "Vortex Gaming", service: "Custom Mobile App Development", budget: 15000, priority: "Medium", score: 82, status: "New", source: "Manual Input" },
        { id: 7, name: "Stripe Integrator", service: "Payment API Implementation", budget: 22000, priority: "High", score: 89, status: "Contacted", source: "AI Chatbot" },
        { id: 8, name: "Hedge Mutual Fund", service: "Cybersecurity Compliance Audit", budget: 75000, priority: "High", score: 98, status: "Active", source: "AI Chatbot" },
        { id: 9, name: "Nova Logistics", service: "Logistics Routing Algorithm", budget: 45000, priority: "High", score: 91, status: "New", source: "AI Chatbot" }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateLead = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const payload = {
        ...newLead,
        budget: parseFloat(newLead.budget) || 0
      };

      const response = await fetch('/api/leads', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify(payload)
      });
      const data = await response.json();
      if (response.ok) {
        setLeads(prev => [data, ...prev]);
        setIsModalOpen(false);
      } else {
        throw new Error(data.detail);
      }
    } catch (err) {
      console.warn("Backend offline. Simulating local lead creation.");
      const mockLead = {
        id: Date.now(),
        ...newLead,
        budget: parseFloat(newLead.budget) || 0
      };
      setLeads(prev => [mockLead, ...prev]);
      setIsModalOpen(false);
    }
  };

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  // Filter & Sort Computation
  const filteredLeads = leads
    .filter(lead => {
      const matchesSearch = lead.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            lead.service.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === 'All' || lead.status === statusFilter;
      const matchesPriority = priorityFilter === 'All' || lead.priority === priorityFilter;
      return matchesSearch && matchesStatus && matchesPriority;
    })
    .sort((a, b) => {
      let aVal = a[sortField];
      let bVal = b[sortField];

      if (typeof aVal === 'string') {
        aVal = aVal.toLowerCase();
        bVal = bVal.toLowerCase();
      }

      if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

  // Pagination Computation
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentLeads = filteredLeads.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredLeads.length / itemsPerPage);

  const getPriorityStyle = (priority) => {
    switch (priority) {
      case 'High': return 'bg-danger/20 text-danger border border-danger/30';
      case 'Medium': return 'bg-warning/20 text-warning border border-warning/30';
      default: return 'bg-slate-800 text-slate-400 border border-slate-700/50';
    }
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case 'Active': return 'bg-success/15 text-success border border-success/30';
      case 'New': return 'bg-accent/15 text-accent border border-accent/30';
      case 'Contacted': return 'bg-primary/15 text-primary border border-primary/30';
      default: return 'bg-slate-800 text-slate-400 border border-slate-700';
    }
  };

  return (
    <div className="space-y-8 text-white">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Leads & Opportunities</h1>
          <p className="text-textSecondary text-sm font-light mt-1">
            Browse and manage prospect metrics captured from chatbot entries or logged manually.
          </p>
        </div>
        <MagneticButton 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center space-x-2 px-5 py-3 rounded-xl font-semibold text-xs transition-all text-[#0B0C10] aurora-glow"
          style={{ background: '#00E5FF' }}
        >
          <Plus className="w-4 h-4 text-[#0B0C10]" />
          <span>Capture Manual Lead</span>
        </MagneticButton>
      </div>

      {/* Filter and Search Bar controls */}
      <div className="glass-card rounded-2xl p-4 border border-borderColor flex flex-col md:flex-row gap-4 items-center justify-between">
        
        {/* Search */}
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-500" />
          <input
            type="text"
            placeholder="Search leads, services..."
            value={searchQuery}
            onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
            className="w-full bg-slate-900 border border-borderColor rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-all"
          />
        </div>

        {/* Dropdown Filters */}
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <div className="flex items-center space-x-2 w-full sm:w-auto">
            <span className="text-xs text-textSecondary whitespace-nowrap">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
              className="bg-slate-900 border border-borderColor rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
            >
              <option value="All">All Statuses</option>
              <option value="New">New</option>
              <option value="Contacted">Contacted</option>
              <option value="Active">Active</option>
              <option value="Lost">Lost</option>
            </select>
          </div>

          <div className="flex items-center space-x-2 w-full sm:w-auto">
            <span className="text-xs text-textSecondary whitespace-nowrap">Priority:</span>
            <select
              value={priorityFilter}
              onChange={(e) => { setPriorityFilter(e.target.value); setCurrentPage(1); }}
              className="bg-slate-900 border border-borderColor rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
            >
              <option value="All">All Priorities</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>
          </div>
        </div>

      </div>

      {/* Main Table Grid */}
      <div className="glass-card rounded-2xl border border-borderColor overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-borderColor bg-slate-900/40 text-slate-400 font-medium">
                <th onClick={() => handleSort('name')} className="p-4 cursor-pointer hover:text-white transition-colors">
                  <div className="flex items-center space-x-1.5">
                    <span>Lead Name</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-500" />
                  </div>
                </th>
                <th onClick={() => handleSort('service')} className="p-4 cursor-pointer hover:text-white transition-colors">
                  <div className="flex items-center space-x-1.5">
                    <span>Service Requirement</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-500" />
                  </div>
                </th>
                <th onClick={() => handleSort('budget')} className="p-4 cursor-pointer hover:text-white transition-colors">
                  <div className="flex items-center space-x-1.5">
                    <span>Budget Limit</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-500" />
                  </div>
                </th>
                <th onClick={() => handleSort('priority')} className="p-4 cursor-pointer hover:text-white transition-colors">
                  <div className="flex items-center space-x-1.5">
                    <span>Priority</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-500" />
                  </div>
                </th>
                <th onClick={() => handleSort('score')} className="p-4 cursor-pointer hover:text-white transition-colors">
                  <div className="flex items-center space-x-1.5">
                    <span>Score Match</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-500" />
                  </div>
                </th>
                <th onClick={() => handleSort('status')} className="p-4 cursor-pointer hover:text-white transition-colors">
                  <div className="flex items-center space-x-1.5">
                    <span>Status</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-500" />
                  </div>
                </th>
                <th className="p-4 text-right">Actions</th>
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
                  <td colSpan="7" className="p-8 text-center text-slate-500 font-light">Loading leads data...</td>
                </tr>
              ) : currentLeads.length === 0 ? (
                <tr>
                  <td colSpan="7" className="p-8 text-center text-slate-500 font-light">No matching lead profiles found.</td>
                </tr>
              ) : (
                currentLeads.map((lead, idx) => (
                  <motion.tr 
                    key={lead.id || idx} 
                    variants={{ hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0 } }}
                    className="hover:bg-[rgba(255,255,255,0.02)] transition-colors"
                  >
                    <td className="p-4 font-semibold text-white">
                      <div>{lead.name}</div>
                      <div className="text-[9px] text-slate-500 font-light mt-0.5">Source: {lead.source || 'AI Agent'}</div>
                    </td>
                    <td className="p-4 text-textSecondary">{lead.service}</td>
                    <td className="p-4 text-white font-mono font-semibold">${lead.budget.toLocaleString()}</td>
                    <td className="p-4">
                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${getPriorityStyle(lead.priority)}`}>
                        {lead.priority}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center space-x-2">
                        <TrendingUp className="w-3.5 h-3.5" style={{ color: '#00E5FF' }} />
                        <span className="font-bold text-white">{lead.score}%</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${getStatusStyle(lead.status)}`}>
                        {lead.status}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <button className="p-1 rounded text-slate-400 hover:text-[#00E5FF] hover:bg-[rgba(0,229,255,0.1)] mr-2 transition-colors">
                        <Edit className="w-4 h-4" />
                      </button>
                      <button className="p-1 rounded text-slate-500 hover:text-danger hover:bg-danger/10 transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </motion.tr>
                ))
              )}
            </motion.tbody>
          </table>
        </div>

        {/* Pagination Toolbar */}
        {totalPages > 1 && (
          <div className="px-6 py-4 border-t border-borderColor bg-slate-900/30 flex items-center justify-between">
            <span className="text-[10px] text-textSecondary">
              Showing {indexOfFirstItem + 1}-{Math.min(indexOfLastItem, filteredLeads.length)} of {filteredLeads.length} leads
            </span>
            <div className="flex space-x-1.5">
              <button 
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="px-3 py-1.5 rounded-lg border border-borderColor text-[10px] hover:bg-slate-800 disabled:opacity-40 transition-colors"
              >
                Previous
              </button>
              <button 
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="px-3 py-1.5 rounded-lg border border-borderColor text-[10px] hover:bg-slate-800 disabled:opacity-40 transition-colors"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Manual Opportunity Drawer/Modal Pop-up */}
      <AnimatePresence>
        {isModalOpen && (
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
                <div className="flex items-center space-x-2">
                  <Sparkles className="w-5 h-5 animate-pulse" style={{ color: '#00E5FF' }} />
                  <h3 className="text-md font-bold text-white">Log CRM Lead Opportunity</h3>
                </div>
                <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>

            {/* Form */}
            <form onSubmit={handleCreateLead} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-textSecondary uppercase tracking-wider">Prospect / Business Name</label>
                <input
                  type="text"
                  required
                  value={newLead.name}
                  onChange={(e) => setNewLead(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Acme Corp"
                  className="w-full bg-slate-900 border border-borderColor rounded-xl px-4 py-3 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-accent transition-all"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-textSecondary uppercase tracking-wider">Service Required</label>
                  <select
                    value={newLead.service}
                    onChange={(e) => setNewLead(prev => ({ ...prev, service: e.target.value }))}
                    className="w-full bg-slate-900 border border-borderColor rounded-xl px-3 py-3 text-xs text-white focus:outline-none"
                  >
                    <option value="Ecommerce Website">Ecommerce Website</option>
                    <option value="Web Application">Web Application</option>
                    <option value="CRM Integration">CRM Integration</option>
                    <option value="Marketing Operations">Marketing Operations</option>
                    <option value="Support SLA Automation">Support SLA Automation</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-textSecondary uppercase tracking-wider">Target Budget ($)</label>
                  <input
                    type="number"
                    required
                    value={newLead.budget}
                    onChange={(e) => setNewLead(prev => ({ ...prev, budget: e.target.value }))}
                    placeholder="50000"
                    className="w-full bg-slate-900 border border-borderColor rounded-xl px-4 py-3 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-accent transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-textSecondary uppercase tracking-wider">Priority Urgency</label>
                  <select
                    value={newLead.priority}
                    onChange={(e) => setNewLead(prev => ({ ...prev, priority: e.target.value }))}
                    className="w-full bg-slate-900 border border-borderColor rounded-xl px-3 py-3 text-xs text-white focus:outline-none"
                  >
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-textSecondary uppercase tracking-wider">Lead Score (%)</label>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    required
                    value={newLead.score}
                    onChange={(e) => setNewLead(prev => ({ ...prev, score: parseInt(e.target.value) || 80 }))}
                    placeholder="85"
                    className="w-full bg-slate-900 border border-borderColor rounded-xl px-4 py-3 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-accent transition-all"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-borderColor flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-borderColor text-xs hover:bg-slate-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl font-semibold text-xs text-[#0B0C10] transition-all hover:opacity-95"
                  style={{ background: 'linear-gradient(135deg, #00E5FF, #007BFF)' }}
                >
                  Record Lead
                </button>
              </div>

            </form>

          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>


    </div>
  );
}
