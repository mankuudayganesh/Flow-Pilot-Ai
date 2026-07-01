import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
  Legend
} from 'recharts';
import { 
  Layers, 
  Users, 
  Ticket, 
  DollarSign, 
  ArrowUpRight, 
  TrendingUp, 
  Zap,
  Activity,
  Bot
} from 'lucide-react';
import MagneticButton from '../components/MagneticButton';
import { StaggerList, StaggerItem, ScrollReveal } from '../components/Animations';

// Animated Counter Utility
function AnimatedCounter({ end, duration = 1000, prefix = "", suffix = "" }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let startTimestamp = null;
    const step = (timestamp) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      setCount(Math.floor(progress * end));
      if (progress < 1) {
        window.requestAnimationFrame(step);
      }
    };
    window.requestAnimationFrame(step);
  }, [end, duration]);

  return <span>{prefix}{count.toLocaleString()}{suffix}</span>;
}

export default function DashboardPage() {
  const navigate = useNavigate();
  const [metrics, setMetrics] = useState({
    totalLeads: 0,
    activeCustomers: 0,
    openTickets: 0,
    revenuePotential: 0
  });
  const [recentLeads, setRecentLeads] = useState([]);
  const [loading, setLoading] = useState(true);

  // Mock data fallbacks for hackathon charts
  const leadGrowthData = [
    { name: 'Jan', Leads: 45, Potential: 15000 },
    { name: 'Feb', Leads: 62, Potential: 22000 },
    { name: 'Mar', Leads: 95, Potential: 45000 },
    { name: 'Apr', Leads: 120, Potential: 68000 },
    { name: 'May', Leads: 185, Potential: 110000 },
    { name: 'Jun', Leads: 254, Potential: 189000 },
  ];

  const ticketTrendData = [
    { name: 'Mon', Open: 12, Resolved: 18 },
    { name: 'Tue', Open: 15, Resolved: 22 },
    { name: 'Wed', Open: 8, Resolved: 14 },
    { name: 'Thu', Open: 20, Resolved: 16 },
    { name: 'Fri', Open: 14, Resolved: 25 },
    { name: 'Sat', Open: 5, Resolved: 8 },
    { name: 'Sun', Open: 3, Resolved: 6 },
  ];

  const customerGrowthData = [
    { name: 'Jan', Customers: 12, Revenue: 8000 },
    { name: 'Feb', Customers: 18, Revenue: 14000 },
    { name: 'Mar', Customers: 28, Revenue: 26000 },
    { name: 'Apr', Customers: 42, Revenue: 44000 },
    { name: 'May', Customers: 56, Revenue: 72000 },
    { name: 'Jun', Customers: 84, Revenue: 124000 },
  ];

  useEffect(() => {
    async function fetchDashboardData() {
      try {
        const token = localStorage.getItem('token');
        const headers = token ? { 'Authorization': `Bearer ${token}` } : {};

        // Fetch leads
        const leadsRes = await fetch('/api/leads', { headers });
        const leads = leadsRes.ok ? await leadsRes.json() : [];

        // Fetch tickets
        const ticketsRes = await fetch('/api/tickets', { headers });
        const tickets = ticketsRes.ok ? await ticketsRes.json() : [];

        // Fetch customers
        const customersRes = await fetch('/api/customers', { headers });
        const customers = customersRes.ok ? await customersRes.json() : [];

        // Calculate metrics
        const totalLeads = leads.length || 254;
        const activeCustomers = customers.length || 84;
        const openTickets = tickets.filter(t => t.status !== 'Closed').length || 14;
        const revenuePotential = leads.reduce((acc, l) => acc + (l.budget || 0), 0) || 189000;

        setMetrics({
          totalLeads,
          activeCustomers,
          openTickets,
          revenuePotential
        });

        // Set recent activities
        const sortedLeads = leads.slice(0, 4);
        setRecentLeads(sortedLeads.length ? sortedLeads : [
          { name: "Acme Corp", service: "Enterprise SaaS Integration", budget: 35000, score: 96, status: "Active" },
          { name: "Global Retail Inc", service: "Ecommerce Solution", budget: 25000, score: 92, status: "New" },
          { name: "Synergy Labs", service: "Database Support Automation", budget: 12000, score: 78, status: "Contacted" },
          { name: "Beta App Corp", service: "API Workflow Integration", budget: 50000, score: 94, status: "New" }
        ]);

      } catch (e) {
        console.error("Error fetching dashboard data:", e);
        // Set hardcoded seeds for hackathon demonstration if backend is down
        setMetrics({
          totalLeads: 254,
          activeCustomers: 84,
          openTickets: 14,
          revenuePotential: 189000
        });
        setRecentLeads([
          { name: "Acme Corp", service: "Enterprise SaaS Integration", budget: 35000, score: 96, status: "Active" },
          { name: "Global Retail Inc", service: "Ecommerce Solution", budget: 25000, score: 92, status: "New" },
          { name: "Synergy Labs", service: "Database Support Automation", budget: 12000, score: 78, status: "Contacted" },
          { name: "Beta App Corp", service: "API Workflow Integration", budget: 50000, score: 94, status: "New" }
        ]);
      } finally {
        setLoading(false);
      }
    }

    fetchDashboardData();
  }, []);

  const kpis = [
    {
      icon: <Layers className="w-5 h-5" style={{ color: '#00E5FF' }} />,
      label: "Total Leads Captured",
      value: metrics.totalLeads,
      prefix: "",
      suffix: "",
      borderStyle: "1px solid rgba(0,229,255,0.2)",
      glowStyle: "0 0 20px rgba(0,229,255,0.15)"
    },
    {
      icon: <Users className="w-5 h-5" style={{ color: '#007BFF' }} />,
      label: "Active CRM Customers",
      value: metrics.activeCustomers,
      prefix: "",
      suffix: "",
      borderStyle: "1px solid rgba(0,123,255,0.2)",
      glowStyle: "0 0 20px rgba(0,123,255,0.15)"
    },
    {
      icon: <Ticket className="w-5 h-5" style={{ color: '#FF007F' }} />,
      label: "Open Support Tickets",
      value: metrics.openTickets,
      prefix: "",
      suffix: "",
      borderStyle: "1px solid rgba(255,0,127,0.2)",
      glowStyle: "0 0 20px rgba(255,0,127,0.15)"
    },
    {
      icon: <DollarSign className="w-5 h-5" style={{ color: '#00E676' }} />,
      label: "Revenue Potential",
      value: metrics.revenuePotential,
      prefix: "$",
      suffix: "",
      borderStyle: "1px solid rgba(0,230,118,0.2)",
      glowStyle: "0 0 20px rgba(0,230,118,0.15)"
    }
  ];

  return (
    <div className="space-y-8">
      
      {/* Header title */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-white aurora-text">Ops Control Center</h1>
          <p className="text-textSecondary text-sm font-light mt-1">
            Real-time status of captured leads, support tickets, and automation throughput.
          </p>
        </div>
        <MagneticButton 
          onClick={() => navigate('/dashboard/ai-agent')}
          className="flex items-center space-x-2 px-5 py-3 rounded-xl font-semibold text-xs text-white transition-all aurora-glow"
          style={{ background: 'linear-gradient(135deg, #00E5FF, #007BFF)' }}
        >
          <Bot className="w-4 h-4 text-white" />
          <span>Launch AI Agent Workspace</span>
        </MagneticButton>
      </div>

      {/* KPI Cards Grid */}
      <StaggerList className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpis.map((kpi, i) => (
          <StaggerItem key={i}>
            <div 
              className="glass-card rounded-2xl p-6 relative overflow-hidden transition-all duration-300"
              style={{ border: kpi.borderStyle, background: 'rgba(36, 37, 61, 0.4)' }}
              onMouseEnter={e => e.currentTarget.style.boxShadow = kpi.glowStyle}
              onMouseLeave={e => e.currentTarget.style.boxShadow = 'none'}
            >
              <div className="flex justify-between items-start mb-4">
                <span className="text-xs font-bold text-textSecondary uppercase tracking-wider">{kpi.label}</span>
                <div className="w-8 h-8 rounded-lg bg-slate-900 flex items-center justify-center"
                  style={{ border: '1px solid rgba(255,255,255,0.1)' }}>
                  {kpi.icon}
                </div>
              </div>
              
              <div className="text-3xl font-extrabold text-white">
                {loading ? (
                  <span>0</span>
                ) : (
                  <AnimatedCounter end={kpi.value} prefix={kpi.prefix} suffix={kpi.suffix} />
                )}
              </div>
              
              {/* Soft decorative light */}
              <div className="absolute -bottom-10 -right-10 w-24 h-24 bg-gradient-to-tr from-white/5 to-transparent rounded-full pointer-events-none" />
            </div>
          </StaggerItem>
        ))}
      </StaggerList>

      {/* Chart Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Lead Growth Chart */}
        <div className="lg:col-span-8 glass-card border border-borderColor rounded-2xl p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-md font-bold text-white">Lead and Deal Velocity</h2>
              <p className="text-[10px] text-textSecondary">Active pipeline value and conversion targets</p>
            </div>
            <div className="inline-flex items-center space-x-1 px-2.5 py-1 rounded bg-slate-800 text-[10px] text-accent font-semibold">
              <TrendingUp className="w-3 h-3 text-accent" />
              <span>Up 24.8% m/m</span>
            </div>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={leadGrowthData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorLeads" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#00E5FF" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#00E5FF" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorPotential" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#FF007F" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#FF007F" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis dataKey="name" stroke="#A8A9C8" fontSize={11} tickLine={false} />
                <YAxis stroke="#A8A9C8" fontSize={11} tickLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1A1B2F', borderColor: '#24253D', borderRadius: '12px' }}
                  labelStyle={{ color: '#EAEAFF', fontWeight: 'bold' }}
                />
                <Area type="monotone" dataKey="Leads" stroke="#00E5FF" strokeWidth={2} fillOpacity={1} fill="url(#colorLeads)" />
                <Area type="monotone" dataKey="Potential" stroke="#FF007F" strokeWidth={2} fillOpacity={1} fill="url(#colorPotential)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Ticket Trend Chart */}
        <div className="lg:col-span-4 glass-card border border-borderColor rounded-2xl p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-md font-bold text-white">SLA Support Trend</h2>
              <p className="text-[10px] text-textSecondary">Resolved vs. open support requests</p>
            </div>
            <div className="w-2 h-2 rounded-full bg-success" />
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={ticketTrendData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis dataKey="name" stroke="#A8A9C8" fontSize={10} tickLine={false} />
                <YAxis stroke="#A8A9C8" fontSize={10} tickLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1A1B2F', borderColor: '#24253D', borderRadius: '12px' }}
                />
                <Legend iconSize={8} iconType="circle" wrapperStyle={{ fontSize: '10px', paddingTop: '10px' }} />
                <Bar dataKey="Open" fill="#FF1744" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Resolved" fill="#00E676" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* Customer Growth & Activity Feed Split */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Customer Growth line */}
        <div className="lg:col-span-6 glass-card border border-borderColor rounded-2xl p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-md font-bold text-white">Active Accounts Cohort</h2>
              <p className="text-[10px] text-textSecondary">Growth of active customer database records</p>
            </div>
            <Activity className="w-5 h-5 text-secondary" />
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={customerGrowthData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis dataKey="name" stroke="#A8A9C8" fontSize={11} tickLine={false} />
                <YAxis stroke="#A8A9C8" fontSize={11} tickLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1A1B2F', borderColor: '#24253D', borderRadius: '12px' }}
                />
                <Line type="monotone" dataKey="Customers" stroke="#007BFF" strokeWidth={3} dot={{ fill: '#00E5FF', strokeWidth: 2 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Qualified Leads Table */}
        <div className="lg:col-span-6 glass-card border border-borderColor rounded-2xl p-6">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-md font-bold text-white">Latest AI Opportunities</h2>
              <p className="text-[10px] text-textSecondary">High-scoring opportunities captured recently</p>
            </div>
            <button 
              onClick={() => navigate('/dashboard/leads')}
              className="text-[10px] text-accent hover:underline font-semibold"
            >
              View Lead Pipeline
            </button>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-borderColor text-slate-400 font-medium">
                  <th className="pb-3">Prospect</th>
                  <th className="pb-3">Inquired Service</th>
                  <th className="pb-3">Budget</th>
                  <th className="pb-3 text-right">Match Score</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {recentLeads.map((lead, idx) => (
                  <tr key={idx} className="hover:bg-slate-800/10 transition-colors">
                    <td className="py-3 font-semibold text-white">{lead.name}</td>
                    <td className="py-3 text-textSecondary">{lead.service}</td>
                    <td className="py-3 text-white font-mono">${lead.budget.toLocaleString()}</td>
                    <td className="py-3 text-right">
                      <span className={`px-2 py-0.5 rounded-full font-bold text-[9px] ${
                        lead.score >= 90 
                          ? 'bg-success/20 text-success' 
                          : 'bg-warning/20 text-warning'
                      }`}>
                        {lead.score}% Match
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>

    </div>
  );
}
