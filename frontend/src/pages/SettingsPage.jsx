import React, { useState, useEffect } from 'react';
import { 
  User, 
  Sliders, 
  Save, 
  Sparkles, 
  ShieldAlert,
  Bot,
  Activity,
  Cpu
} from 'lucide-react';
import MagneticButton from '../components/MagneticButton';
import { StaggerList, StaggerItem } from '../components/Animations';

export default function SettingsPage() {
  const [profile, setProfile] = useState({ name: 'Operator', email: 'operator@flowpilot.ai' });
  const [threshold, setThreshold] = useState(70);
  const [autoRoute, setAutoRoute] = useState(true);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    // Read profile
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        setProfile(JSON.parse(storedUser));
      } catch (e) {
        console.error(e);
      }
    }

    // Read thresholds
    const th = localStorage.getItem('score_threshold') || '70';
    setThreshold(parseInt(th));
  }, []);

  const handleSave = (e) => {
    e.preventDefault();
    
    // Save locally
    localStorage.setItem('user', JSON.stringify(profile));
    localStorage.setItem('score_threshold', threshold.toString());
    
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  return (
    <div className="space-y-8 text-white text-left max-w-4xl mx-auto">
      
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight">System Settings</h1>
        <p className="text-textSecondary text-sm font-light mt-1">
          Configure user accounts, AI engine parameters, and autonomous workflow threshold criteria.
        </p>
      </div>

      {saveSuccess && (
        <div className="flex items-center space-x-2.5 p-4 rounded-xl border text-sm font-semibold transition-all"
          style={{ background: 'rgba(0,230,118,0.1)', borderColor: 'rgba(0,230,118,0.3)', color: '#00E676' }}>
          <Sparkles className="w-5 h-5 flex-shrink-0 animate-pulse" />
          <span>System configurations updated and saved successfully!</span>
        </div>
      )}

      {/* Settings Grid */}
      <StaggerList>
      <form onSubmit={handleSave} className="space-y-6">
        
        {/* Profile Card */}
        <StaggerItem>
        <div className="glass-card rounded-2xl p-6 border border-[rgba(255,255,255,0.05)] space-y-4" style={{ background: 'rgba(36, 37, 61, 0.4)' }}>
          <h2 className="text-md font-bold text-white flex items-center space-x-2.5 border-b border-[rgba(255,255,255,0.1)] pb-3">
            <User className="w-5 h-5" style={{ color: '#00E5FF' }} />
            <span>Profile Identity</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-textSecondary uppercase tracking-wider">Full Operator Name</label>
              <input
                type="text"
                required
                value={profile.name}
                onChange={(e) => setProfile(prev => ({ ...prev, name: e.target.value }))}
                className="w-full bg-slate-900 border border-borderColor rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-accent transition-all"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-textSecondary uppercase tracking-wider">Operational Email</label>
              <input
                type="email"
                required
                value={profile.email}
                onChange={(e) => setProfile(prev => ({ ...prev, email: e.target.value }))}
                className="w-full bg-slate-900 border border-borderColor rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-accent transition-all"
              />
            </div>
          </div>
        </div>
        </StaggerItem>

        {/* Internal AI Model Status Card */}
        <StaggerItem>
        <div className="glass-card rounded-2xl p-6 border border-[rgba(255,255,255,0.05)] space-y-4" style={{ background: 'rgba(36, 37, 61, 0.4)' }}>
          <h2 className="text-md font-bold text-white flex items-center space-x-2.5 border-b border-[rgba(255,255,255,0.1)] pb-3">
            <Bot className="w-5 h-5" style={{ color: '#00E5FF' }} />
            <span>Internal AI Engine — FlowPilot-NLP v1.0</span>
          </h2>

          <div className="space-y-4">
            {/* Status banner */}
            <div className="flex items-start space-x-3 p-4 rounded-xl border"
              style={{ background: 'rgba(0,230,118,0.1)', borderColor: 'rgba(0,230,118,0.3)' }}>
              <Activity className="w-5 h-5 flex-shrink-0 mt-0.5 animate-pulse" style={{ color: '#00E676' }} />
              <div className="text-xs text-left space-y-1">
                <div className="font-bold" style={{ color: '#00E676' }}>On-Device Model — Active & Running</div>
                <div className="text-slate-400 font-light">
                  FlowPilot now uses a built-in machine learning model powered by 
                  <span className="font-semibold" style={{ color: '#00E5FF' }}> HuggingFace Transformers</span> running 
                  entirely on your local server. No external API keys or internet connection required for AI inference.
                </div>
              </div>
            </div>

            {/* Model specs grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-slate-900/60 p-4 rounded-xl border border-borderColor text-left space-y-1">
                <span className="text-[9px] text-slate-500 uppercase tracking-wider font-bold block">Model Architecture</span>
                <span className="text-white text-xs font-semibold">BART-Large-MNLI</span>
                <span className="text-[10px] text-slate-500 block">Zero-Shot Classifier</span>
              </div>
              <div className="bg-slate-900/60 p-4 rounded-xl border border-borderColor text-left space-y-1">
                <Cpu className="w-4 h-4 text-accent mb-1" />
                <span className="text-[9px] text-slate-500 uppercase tracking-wider font-bold block">Inference Runtime</span>
                <span className="text-white text-xs font-semibold">CPU (Local)</span>
                <span className="text-[10px] text-slate-500 block">No GPU required</span>
              </div>
              <div className="bg-slate-900/60 p-4 rounded-xl border border-borderColor text-left space-y-1">
                <span className="text-[9px] text-slate-500 uppercase tracking-wider font-bold block">Intents Supported</span>
                <span className="text-white text-xs font-semibold">4 Classes</span>
                <span className="text-[10px] text-slate-500 block">Sales · Support · Success · General</span>
              </div>
            </div>

            {/* Privacy note */}
            <div className="flex items-center space-x-2.5 p-3 rounded-xl bg-slate-900/50 border border-borderColor text-xs text-slate-400">
              <ShieldAlert className="w-5 h-5 text-accent flex-shrink-0" />
              <span>
                All AI inference runs <span className="text-white font-semibold">100% on your local machine</span>. 
                Customer messages are never sent to any external server. Model weights are cached locally 
                after the first download from HuggingFace Hub (~1.6 GB).
              </span>
            </div>
          </div>
        </div>
        </StaggerItem>

        {/* AI threshold sliders */}
        <StaggerItem>
        <div className="glass-card rounded-2xl p-6 border border-[rgba(255,255,255,0.05)] space-y-4" style={{ background: 'rgba(36, 37, 61, 0.4)' }}>
          <h2 className="text-md font-bold text-white flex items-center space-x-2.5 border-b border-[rgba(255,255,255,0.1)] pb-3">
            <Sliders className="w-5 h-5" style={{ color: '#007BFF' }} />
            <span>Workflow Threshold Criteria</span>
          </h2>

          <div className="space-y-6">
            
            {/* Range slider */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-[10px] text-textSecondary font-bold uppercase tracking-wider">
                <span>Minimum Lead Qualification Score</span>
                <span className="text-accent font-mono text-xs">{threshold}%</span>
              </div>
              <input
                type="range"
                min="30"
                max="95"
                value={threshold}
                onChange={(e) => setThreshold(parseInt(e.target.value))}
                className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-accent"
              />
              <span className="text-[9px] text-slate-500 block font-light">
                Leads categorized with scoring metrics below this limit will remain designated as standard Prospects and won't auto-convert.
              </span>
            </div>

            {/* Toggle switch */}
            <div className="flex items-center justify-between pt-2 border-t border-slate-800/80">
              <div className="text-left max-w-md">
                <span className="text-xs font-bold text-white block">Auto-Route Support Tickets</span>
                <span className="text-[10px] text-slate-500 font-light mt-0.5">
                  Allows FlowPilot agents to assign resolved SLA designations to incoming complaints automatically.
                </span>
              </div>
              <button
                type="button"
                onClick={() => setAutoRoute(!autoRoute)}
                className={`w-12 h-6 rounded-full p-1 transition-all duration-300 ${
                  autoRoute ? 'bg-primary' : 'bg-slate-800'
                }`}
              >
                <div className={`bg-white w-4 h-4 rounded-full shadow-md transition-all duration-300 ${
                  autoRoute ? 'translate-x-6' : 'translate-x-0'
                }`} />
              </button>
            </div>

          </div>
        </div>
        </StaggerItem>

        {/* Action save toolbar */}
        <StaggerItem>
        <div className="flex justify-end">
          <MagneticButton
            type="submit"
            className="flex items-center space-x-2 px-6 py-3 rounded-xl font-semibold text-xs text-[#0B0C10] transition-all aurora-glow"
            style={{ background: 'linear-gradient(135deg, #00E5FF, #007BFF)' }}
          >
            <Save className="w-4 h-4" />
            <span>Save System Configurations</span>
          </MagneticButton>
        </div>
        </StaggerItem>

      </form>
      </StaggerList>

    </div>
  );
}
