import React from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  Legend
} from 'recharts';
import { 
  TrendingUp, 
  Award, 
  Clock, 
  ShieldCheck,
  Bot
} from 'lucide-react';
import { StaggerList, StaggerItem } from '../components/Animations';

export default function AnalyticsPage() {
  
  // Charts Data
  const leadSourcesData = [
    { name: 'AI Chatbot', value: 65, color: '#00E5FF' },
    { name: 'Form Submissions', value: 15, color: '#007BFF' },
    { name: 'API Integrations', value: 12, color: '#FF007F' },
    { name: 'Manual Inputs', value: 8, color: '#00E676' },
  ];

  const conversionFunnelData = [
    { step: 'Captured Leads', count: 254 },
    { step: 'Contacted Leads', count: 185 },
    { step: 'Qualified Deals', count: 120 },
    { step: 'Active Accounts', count: 84 },
  ];

  const ticketCategoryData = [
    { category: 'Database Errors', count: 28 },
    { category: 'API Inquiries', count: 42 },
    { category: 'Billing Requests', count: 18 },
    { category: 'Security Auth', count: 22 },
    { category: 'General Help', count: 35 },
  ];

  const revenueVelocityData = [
    { name: 'Jan', Revenue: 18000 },
    { name: 'Feb', Revenue: 34000 },
    { name: 'Mar', Revenue: 56000 },
    { name: 'Apr', Revenue: 89000 },
    { name: 'May', Revenue: 135000 },
    { name: 'Jun', Revenue: 189000 },
  ];

  const metrics = [
    { label: "Overall Lead-to-Won Ratio", val: "33.1%", desc: "Competes with standard HubSpot metrics", icon: <Award className="w-5 h-5" style={{ color: '#00E5FF' }} /> },
    { label: "Avg SLA Response Speed", val: "48 sec", desc: "Powered by instant Gemini routing", icon: <Clock className="w-5 h-5" style={{ color: '#FF007F' }} /> },
    { label: "AI Routing Accuracy", val: "99.2%", desc: "High confidence NLP intent parsing", icon: <ShieldCheck className="w-5 h-5" style={{ color: '#00E676' }} /> }
  ];

  return (
    <div className="space-y-8 text-white">
      
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight">Business Intelligence</h1>
        <p className="text-textSecondary text-sm font-light mt-1">
          Perform drill-down reviews of funnel conversions, AI routing configurations, and revenue trends.
        </p>
      </div>

      {/* KPI Stats cards */}
      <StaggerList className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        {metrics.map((m, i) => (
          <StaggerItem key={i}>
            <div 
              className="glass-card rounded-2xl p-6 border border-[rgba(255,255,255,0.05)] hover:border-[rgba(0,229,255,0.4)] flex items-center justify-between transition-all duration-300 hover:shadow-[0_0_20px_rgba(0,229,255,0.15)]"
              style={{ background: 'rgba(36, 37, 61, 0.4)' }}
            >
              <div className="text-left space-y-2">
                <span className="text-[10px] text-textSecondary uppercase font-bold tracking-wider">{m.label}</span>
                <div className="text-3xl font-extrabold text-white">{m.val}</div>
                <div className="text-[10px] text-slate-500 font-light">{m.desc}</div>
              </div>
              <div className="w-10 h-10 rounded-xl bg-[rgba(11,12,16,0.5)] border border-[rgba(255,255,255,0.1)] flex items-center justify-center">
                {m.icon}
              </div>
            </div>
          </StaggerItem>
        ))}
      </StaggerList>

      {/* Primary Graphs Row */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Conversion Funnel */}
        <div className="lg:col-span-7 glass-card border border-borderColor rounded-2xl p-6">
          <h3 className="text-md font-bold text-white mb-6 text-left">Pipeline Conversion Funnel</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={conversionFunnelData} layout="vertical" margin={{ top: 10, right: 20, left: 10, bottom: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" horizontal={false} />
                <XAxis type="number" stroke="#A8A9C8" fontSize={11} tickLine={false} />
                <YAxis dataKey="step" type="category" stroke="#A8A9C8" fontSize={11} tickLine={false} />
                <Tooltip contentStyle={{ backgroundColor: '#1A1B2F', borderColor: '#24253D', borderRadius: '12px' }} />
                <Bar dataKey="count" fill="#00E5FF" radius={[0, 4, 4, 0]} barSize={25} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Lead Sources pie */}
        <div className="lg:col-span-5 glass-card border border-borderColor rounded-2xl p-6">
          <h3 className="text-md font-bold text-white mb-6 text-left">Lead Acquisition Channels</h3>
          <div className="h-72 flex flex-col justify-between">
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={leadSourcesData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {leadSourcesData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: '#1A1B2F', borderColor: '#24253D', borderRadius: '12px' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            
            <div className="flex justify-center flex-wrap gap-4 text-[10px] text-textSecondary font-light">
              {leadSourcesData.map((item, idx) => (
                <div key={idx} className="flex items-center space-x-1.5">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                  <span>{item.name} ({item.value}%)</span>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>

      {/* Secondary Graphs Row */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Incident tickets categories distribution */}
        <div className="lg:col-span-6 glass-card border border-borderColor rounded-2xl p-6">
          <h3 className="text-md font-bold text-white mb-6 text-left">Incident Distribution</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={ticketCategoryData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis dataKey="category" stroke="#A8A9C8" fontSize={10} tickLine={false} />
                <YAxis stroke="#A8A9C8" fontSize={10} tickLine={false} />
                <Tooltip contentStyle={{ backgroundColor: '#1A1B2F', borderColor: '#24253D', borderRadius: '12px' }} />
                <Bar dataKey="count" fill="#FF007F" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Revenue Growth Over time */}
        <div className="lg:col-span-6 glass-card border border-borderColor rounded-2xl p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-md font-bold text-white text-left">MRR Growth Speed</h3>
            <div className="inline-flex items-center space-x-1 px-2.5 py-1 rounded bg-slate-800 text-[10px] text-accent font-semibold">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>Scale Target: $200k</span>
            </div>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueVelocityData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#00E5FF" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#00E5FF" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis dataKey="name" stroke="#A8A9C8" fontSize={10} tickLine={false} />
                <YAxis stroke="#A8A9C8" fontSize={10} tickLine={false} />
                <Tooltip contentStyle={{ backgroundColor: '#1A1B2F', borderColor: '#24253D', borderRadius: '12px' }} />
                <Area type="monotone" dataKey="Revenue" stroke="#00E5FF" strokeWidth={2.5} fillOpacity={1} fill="url(#colorRev)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

    </div>
  );
}
