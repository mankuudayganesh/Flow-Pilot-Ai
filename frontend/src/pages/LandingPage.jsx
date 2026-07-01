import React, { Suspense, useRef, useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Canvas, useFrame } from '@react-three/fiber';
import { Points, PointMaterial, Float, MeshDistortMaterial } from '@react-three/drei';
import { gsap } from 'gsap';
import { motion } from 'framer-motion';
import {
  Bot, MessageSquare, Zap, TrendingUp, Activity, ArrowRight,
  CheckCircle, Sparkles, ShieldCheck, Code, ChevronDown, Star
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import ThemeToggle from '../components/ThemeToggle';
import MagneticButton from '../components/MagneticButton';
import { StaggerList, StaggerItem, ScrollReveal } from '../components/Animations';

/* ─── THREE.JS SCENE (theme-aware colors passed as props) ────────────────── */
function StarField({ count = 4000, color = '#a78bfa' }) {
  const ref = useRef();
  const positions = React.useMemo(() => {
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      arr[i * 3]     = (Math.random() - 0.5) * 40;
      arr[i * 3 + 1] = (Math.random() - 0.5) * 40;
      arr[i * 3 + 2] = (Math.random() - 0.5) * 40;
    }
    return arr;
  }, [count]);
  useFrame((s) => {
    if (ref.current) {
      ref.current.rotation.y = s.clock.elapsedTime * 0.025;
      ref.current.rotation.x = s.clock.elapsedTime * 0.01;
    }
  });
  return (
    <Points ref={ref} positions={positions} stride={3} frustumCulled={false}>
      <PointMaterial transparent color={color} size={0.025} sizeAttenuation depthWrite={false} opacity={0.7} />
    </Points>
  );
}

function RotatingRing({ radius, tube = 0.015, color, speed, tilt }) {
  const ref = useRef();
  useFrame((s) => { if (ref.current) ref.current.rotation.z = s.clock.elapsedTime * speed; });
  return (
    <mesh ref={ref} rotation={tilt}>
      <torusGeometry args={[radius, tube, 8, 200]} />
      <meshBasicMaterial color={color} transparent opacity={0.4} />
    </mesh>
  );
}

function PulsingSphere({ sphereColor, emitColor }) {
  const mesh = useRef();
  useFrame((s) => {
    if (mesh.current) {
      mesh.current.rotation.y = s.clock.elapsedTime * 0.12;
      mesh.current.rotation.z = s.clock.elapsedTime * 0.06;
    }
  });
  return (
    <Float speed={1.5} rotationIntensity={0.3} floatIntensity={0.8}>
      <mesh ref={mesh} scale={2.2}>
        <icosahedronGeometry args={[1, 4]} />
        <MeshDistortMaterial
          color={sphereColor}
          emissive={emitColor}
          emissiveIntensity={0.4}
          distort={0.35}
          speed={1.5}
          roughness={0.2}
          metalness={0.8}
        />
      </mesh>
    </Float>
  );
}

function HeroScene({ isDark }) {
  const particleColor  = isDark ? '#a78bfa' : '#7C3AED';
  const ring1          = isDark ? '#4F46E5' : '#6D28D9';
  const ring2          = isDark ? '#7C3AED' : '#4F46E5';
  const ring3          = isDark ? '#06B6D4' : '#0891B2';
  const sphereColor    = isDark ? '#1e1b4b' : '#ede9fe';
  const emitColor      = isDark ? '#4F46E5' : '#7C3AED';

  return (
    <Canvas camera={{ position: [0, 0, 8], fov: 55 }} gl={{ antialias: true, alpha: true }}
      style={{ position: 'absolute', inset: 0, zIndex: 0, pointerEvents: 'none' }}>
      <ambientLight intensity={isDark ? 0.2 : 0.5} />
      <pointLight position={[6, 6, 6]}    color={ring1}  intensity={isDark ? 4 : 3} />
      <pointLight position={[-6, -4, -4]} color={ring3}  intensity={isDark ? 3 : 2} />
      <pointLight position={[0, 8, 0]}    color={ring2}  intensity={isDark ? 2 : 1.5} />
      <Suspense fallback={null}>
        <StarField color={particleColor} count={isDark ? 4000 : 2500} />
        <PulsingSphere sphereColor={sphereColor} emitColor={emitColor} />
        <RotatingRing radius={3.2} color={ring1} speed={0.15}  tilt={[1.1, 0.2, 0]} />
        <RotatingRing radius={3.8} color={ring3} speed={-0.1}  tilt={[0.6, 0.5, 0.3]} />
        <RotatingRing radius={4.5} color={ring2} speed={0.08}  tilt={[1.5, 0.1, 0.8]} />
      </Suspense>
    </Canvas>
  );
}

/* ─── CURTAIN TRANSITION ─────────────────────────────────────────────────── */
function PageCurtain({ onDone, isDark }) {
  const ref = useRef();
  useEffect(() => {
    gsap.fromTo(ref.current,
      { scaleY: 1, transformOrigin: 'top' },
      { scaleY: 0, duration: 0.9, ease: 'power4.inOut', onComplete: onDone }
    );
  }, []);
  return (
    <div ref={ref} className="fixed inset-0 z-[999]"
      style={{ background: isDark
        ? 'linear-gradient(135deg,#0A0A14,#1a0533,#0d1117)'
        : 'linear-gradient(135deg,#f8f7ff,#ede9fe,#ddd6fe)' }} />
  );
}

/* ─── SCROLL INDICATOR ───────────────────────────────────────────────────── */
function ScrollIndicator({ isDark }) {
  return (
    <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-2 animate-bounce"
      style={{ opacity: 0.5 }}>
      <span className="text-[10px] uppercase tracking-[0.2em] font-light"
        style={{ color: isDark ? '#94a3b8' : '#6D28D9' }}>Scroll</span>
      <ChevronDown className="w-4 h-4" style={{ color: isDark ? '#94a3b8' : '#6D28D9' }} />
    </div>
  );
}

/* ─── WORD REVEAL TITLE ──────────────────────────────────────────────────── */
function SectionTitle({ children, isDark }) {
  const ref = useRef();
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        el.querySelectorAll('.word').forEach((w, i) => {
          gsap.fromTo(w, { y: 40, opacity: 0 }, { y: 0, opacity: 1, duration: 0.7, delay: i * 0.1, ease: 'power3.out' });
        });
        observer.disconnect();
      }
    }, { threshold: 0.3 });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const words = children.split(' ');
  return (
    <h2 ref={ref} className="text-4xl md:text-6xl font-black tracking-tight leading-tight"
      style={{ color: isDark ? '#f1f0ff' : '#0f0a2e' }}>
      {words.map((w, i) => (
        <span key={i} className="word inline-block mr-[0.25em] opacity-0"
          style={{ color: i >= words.length - 2 ? '#7C3AED' : (isDark ? '#f1f0ff' : '#0f0a2e') }}>
          {w}
        </span>
      ))}
    </h2>
  );
}

/* ─── LIVE DEMO CHAT ─────────────────────────────────────────────────────── */
function LiveDemoChat({ isDark }) {
  const [messages, setMessages] = useState([
    { sender: 'user', text: "I need an enterprise CRM integration, budget $45,000." },
    { sender: 'ai', text: "High-priority Sales Inquiry captured! Scored at 94% — sales team notified.", badge: { label: 'Sales Inquiry', score: 94, priority: 'High' } }
  ]);
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);
  const endRef = useRef();

  const examples = [
    "My checkout is broken, customers can't pay!",
    "Looking for a mobile app dev team, budget $20k",
    "How do I cancel my subscription?",
  ];

  const sendMessage = (text) => {
    const msg = text || input;
    if (!msg.trim()) return;
    setMessages(p => [...p, { sender: 'user', text: msg }]);
    setInput('');
    setTyping(true);
    setTimeout(() => {
      const lower = msg.toLowerCase();
      let reply, badge;
      if (lower.includes('broken') || lower.includes('error') || lower.includes("can't")) {
        reply = "Support ticket created (High priority). Engineering team notified. ETA: 2 hours.";
        badge = { label: 'Support Request', score: 88, priority: 'High' };
      } else if (lower.includes('budget') || lower.includes('need') || lower.includes('looking')) {
        const b = (lower.match(/\$?([\d,]+)k?/) || [])[1];
        const budget = b ? parseInt(b.replace(',', '')) * (lower.includes('k') ? 1000 : 1) : 20000;
        reply = `Sales lead captured! Budget $${budget.toLocaleString()}. A rep will contact you within 1 hour.`;
        badge = { label: 'Sales Inquiry', score: 91, priority: 'High' };
      } else if (lower.includes('cancel') || lower.includes('refund')) {
        reply = "Customer Success case opened. Account manager will reach out in 24h.";
        badge = { label: 'Customer Success', score: 72, priority: 'Medium' };
      } else {
        reply = "General inquiry logged and routed to the appropriate team.";
        badge = { label: 'General', score: 55, priority: 'Low' };
      }
      setMessages(p => [...p, { sender: 'ai', text: reply, badge }]);
      setTyping(false);
    }, 1800);
  };

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages, typing]);

  const cardBg   = isDark ? 'rgba(10,10,20,0.8)'    : 'rgba(255,255,255,0.95)';
  const headerBg = isDark ? 'rgba(255,255,255,0.04)' : 'rgba(109,40,217,0.04)';
  const border   = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(109,40,217,0.12)';
  const userBubble = 'linear-gradient(135deg,#7C3AED,#4F46E5)';
  const aiBubble   = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(109,40,217,0.06)';
  const inputBg    = isDark ? 'rgba(255,255,255,0.05)' : 'rgba(109,40,217,0.05)';
  const labelBg    = isDark ? 'rgba(109,40,217,0.2)'   : 'rgba(109,40,217,0.1)';
  const textMain   = isDark ? '#f1f0ff' : '#0f0a2e';
  const textSub    = isDark ? '#94a3b8' : '#6D28D9';

  return (
    <div className="relative rounded-3xl overflow-hidden shadow-2xl"
      style={{ background: cardBg, backdropFilter: 'blur(24px)', border: `1px solid ${border}`, boxShadow: isDark ? '0 32px 80px rgba(124,58,237,0.25)' : '0 32px 80px rgba(109,40,217,0.12)' }}>
      {/* Terminal header */}
      <div className="flex items-center gap-2 px-5 py-3 border-b" style={{ background: headerBg, borderColor: border }}>
        <div className="w-3 h-3 rounded-full bg-red-400/80" />
        <div className="w-3 h-3 rounded-full bg-yellow-400/80" />
        <div className="w-3 h-3 rounded-full bg-green-400/80" />
        <span className="ml-3 text-xs font-mono" style={{ color: textSub }}>FlowPilot AI — Live Agent Terminal</span>
        <div className="ml-auto flex items-center gap-1.5 text-[10px] text-emerald-500">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse inline-block" />
          <span>NLP Active</span>
        </div>
      </div>

      {/* Messages */}
      <div className="h-72 overflow-y-auto p-4 space-y-4 scrollbar-hide">
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.sender === 'user' ? 'justify-end' : 'justify-start'} gap-2`}>
            {m.sender === 'ai' && (
              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                <Bot className="w-3.5 h-3.5 text-white" />
              </div>
            )}
            <div className="max-w-[75%] space-y-1.5">
              <div className="rounded-2xl px-4 py-2.5 text-xs leading-relaxed"
                style={{
                  background: m.sender === 'user' ? userBubble : aiBubble,
                  color: m.sender === 'user' ? '#fff' : textMain,
                  border: m.sender === 'ai' ? `1px solid ${border}` : 'none',
                  borderRadius: m.sender === 'user' ? '18px 18px 4px 18px' : '18px 18px 18px 4px'
                }}>
                {m.text}
              </div>
              {m.badge && (
                <div className="flex flex-wrap gap-1.5">
                  <span className="text-[9px] font-bold px-2 py-0.5 rounded-full" style={{ background: labelBg, color: '#7C3AED' }}>{m.badge.label}</span>
                  <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-600">Score: {m.badge.score}%</span>
                  <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                    m.badge.priority === 'High' ? 'bg-red-500/10 text-red-500' :
                    m.badge.priority === 'Medium' ? 'bg-amber-500/10 text-amber-600' :
                    'bg-slate-400/10 text-slate-400'
                  }`}>{m.badge.priority}</span>
                </div>
              )}
            </div>
          </div>
        ))}
        {typing && (
          <div className="flex gap-2 items-start">
            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center flex-shrink-0">
              <Bot className="w-3.5 h-3.5 text-white" />
            </div>
            <div className="rounded-2xl px-4 py-3" style={{ background: aiBubble, border: `1px solid ${border}` }}>
              <div className="flex gap-1.5 items-center h-4">
                {[0,1,2].map(i => (
                  <div key={i} className="w-1.5 h-1.5 bg-violet-500 rounded-full animate-bounce" style={{ animationDelay: `${i*0.15}s` }} />
                ))}
              </div>
            </div>
          </div>
        )}
        <div ref={endRef} />
      </div>

      {/* Quick examples */}
      <div className="px-4 pb-2 flex gap-2 flex-wrap">
        {examples.map((m, i) => (
          <button key={i} onClick={() => sendMessage(m)}
            className="text-[9px] px-2.5 py-1 rounded-full transition-all cursor-pointer"
            style={{ background: inputBg, border: `1px solid ${border}`, color: textSub }}>
            {m}
          </button>
        ))}
      </div>

      {/* Input */}
      <div className="p-3 border-t flex gap-2" style={{ borderColor: border }}>
        <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && sendMessage()}
          placeholder="Type a customer message..."
          className="flex-1 rounded-xl px-4 py-2.5 text-xs focus:outline-none transition-all"
          style={{ background: inputBg, border: `1px solid ${border}`, color: textMain }} />
        <button onClick={() => sendMessage()}
          className="px-4 py-2.5 rounded-xl text-xs font-semibold text-white transition-all hover:opacity-90"
          style={{ background: 'linear-gradient(135deg,#7C3AED,#4F46E5)' }}>
          Send
        </button>
      </div>
    </div>
  );
}

/* ─── MAIN LANDING PAGE ──────────────────────────────────────────────────── */
export default function LandingPage() {
  const navigate = useNavigate();
  const { isDark } = useTheme();
  const [curtainDone, setCurtainDone] = useState(false);

  const bg     = isDark ? '#06060f'  : '#f8f7ff';
  const bg2    = isDark ? '#08080f'  : '#f0eeff';
  const text   = isDark ? '#f1f0ff'  : '#0f0a2e';
  const text2  = isDark ? '#94a3b8'  : '#4c4580';
  const border = isDark ? 'rgba(255,255,255,0.07)' : 'rgba(109,40,217,0.1)';
  const navBg  = isDark ? 'rgba(6,6,15,0.8)'       : 'rgba(248,247,255,0.9)';
  const cardBg = isDark ? 'rgba(255,255,255,0.03)'  : 'rgba(255,255,255,0.8)';

  const stats = [
    { val: '94%', label: 'Lead qualification accuracy' },
    { val: '3.2s', label: 'Avg. response time' },
    { val: '10x',  label: 'Faster ticket routing' },
    { val: '100%', label: 'On-device inference' },
  ];

  const features = [
    { icon: <MessageSquare className="w-5 h-5 text-white" />, title: 'Intelligent Classification', desc: 'Classifies every message into Sales, Support, Success, or General — in real time, on-device.', grad: 'from-violet-600 to-indigo-600' },
    { icon: <TrendingUp className="w-5 h-5 text-white" />,    title: 'Automated Lead Scoring', desc: 'Extracts budget, service type & urgency from natural language to rank and route leads automatically.', grad: 'from-cyan-500 to-blue-600' },
    { icon: <Zap className="w-5 h-5 text-white" />,           title: 'Instant Triage', desc: 'Critical P0 issues are detected instantly and escalated before a human reads them.', grad: 'from-amber-500 to-orange-600' },
    { icon: <Activity className="w-5 h-5 text-white" />,      title: 'Live Analytics', desc: 'Beautiful real-time charts: conversion rates, budget distribution, SLA performance.', grad: 'from-emerald-500 to-teal-600' },
    { icon: <ShieldCheck className="w-5 h-5 text-white" />,   title: '100% Private', desc: 'BART-MNLI runs locally. No customer data leaves your server. GDPR by design.', grad: 'from-rose-500 to-pink-600' },
    { icon: <Code className="w-5 h-5 text-white" />,          title: 'REST API & Webhooks', desc: 'Full OpenAPI schema, JWT auth, webhook streaming — integrate with any stack.', grad: 'from-indigo-500 to-purple-600' },
  ];

  return (
    <div className="min-h-screen overflow-x-hidden font-sans" style={{ background: bg, color: text, transition: 'background 0.4s ease, color 0.4s ease' }}>
      {!curtainDone && <PageCurtain onDone={() => setCurtainDone(true)} isDark={isDark} />}

      {/* ── NAV ── */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-8 py-4"
        style={{ background: navBg, backdropFilter: 'blur(20px)', borderBottom: `1px solid ${border}` }}>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center">
            <Bot className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold text-sm tracking-tight" style={{ color: text }}>FlowPilot AI</span>
        </div>
        <div className="hidden md:flex items-center gap-8 text-xs font-light" style={{ color: text2 }}>
          {['#features', '#demo', '#stats'].map((href, i) => (
            <a key={i} href={href}
              className="hover:opacity-100 transition-opacity"
              style={{ opacity: 0.7 }}>
              {['Features', 'Live Demo', 'Performance'][i]}
            </a>
          ))}
        </div>
        <div className="flex items-center gap-3">
          {/* Theme Toggle */}
          <ThemeToggle />
          <Link to="/login" className="text-xs font-light transition-all" style={{ color: text2 }}>Sign in</Link>
          <Link to="/register"
            className="text-xs px-4 py-2 rounded-full font-semibold transition-all hover:shadow-lg"
            style={{ background: isDark ? 'white' : '#6D28D9', color: isDark ? '#0f0a2e' : 'white', boxShadow: isDark ? '' : '0 4px 20px rgba(109,40,217,0.3)' }}>
            Get started →
          </Link>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        <HeroScene isDark={isDark} />
        {/* Vignette */}
        <div className="absolute inset-0 z-[1] pointer-events-none"
          style={{ background: isDark
            ? 'radial-gradient(ellipse 80% 60% at 50% 50%, transparent 0%, #06060f 100%)'
            : 'radial-gradient(ellipse 80% 60% at 50% 50%, transparent 0%, #f8f7ff 100%)' }} />

        {/* Content */}
        <div className="relative z-[2] text-center px-6 max-w-5xl mx-auto pt-24">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs mb-8"
            style={{ background: isDark ? 'rgba(124,58,237,0.12)' : 'rgba(109,40,217,0.08)', border: `1px solid ${isDark ? 'rgba(124,58,237,0.25)' : 'rgba(109,40,217,0.2)'}`, color: isDark ? '#c4b5fd' : '#6D28D9', backdropFilter: 'blur(8px)' }}>
            <Sparkles className="w-3.5 h-3.5" />
            <span>Internal NLP · No API Keys · 100% Private</span>
          </div>

          <h1 className="text-6xl md:text-8xl font-black tracking-tight leading-none mb-6">
            <span className="block" style={{ color: text }}>Autonomous</span>
            <span className="block bg-gradient-to-r from-violet-500 via-indigo-500 to-cyan-500 bg-clip-text text-transparent">
              Customer Intelligence
            </span>
          </h1>

          <p className="text-lg font-light max-w-2xl mx-auto leading-relaxed mb-10" style={{ color: text2 }}>
            FlowPilot classifies, scores, and routes every customer interaction in real time
            using an on-device AI model — no external API, no data leaks.
          </p>

          <div className="flex flex-col sm:flex-row items-center gap-4 justify-center">
            <Link to="/register">
              <MagneticButton
                className="flex items-center gap-2 px-8 py-4 rounded-full text-sm font-bold transition-all"
                style={{ background: isDark ? 'white' : 'linear-gradient(135deg,#00E5FF,#007BFF)', color: isDark ? '#0B0C10' : 'white', boxShadow: isDark ? '0 8px 32px rgba(0,229,255,0.2)' : '0 8px 32px rgba(0,229,255,0.3)' }}>
                Start for free <ArrowRight className="w-4 h-4" />
              </MagneticButton>
            </Link>
            <a href="#demo"
              className="flex items-center gap-2 px-8 py-4 rounded-full border text-sm font-light transition-all"
              style={{ borderColor: border, color: text2 }}>
              See it live
            </a>
          </div>

          <div className="mt-14 flex flex-wrap items-center justify-center gap-6 text-[10px] uppercase tracking-widest" style={{ color: text2, opacity: 0.7 }}>
            {['HuggingFace BART-MNLI', 'FastAPI Backend', 'React + Three.js', 'Zero Cloud Dependency'].map((t, i) => (
              <span key={i} className="flex items-center gap-1.5">
                <CheckCircle className="w-3 h-3 text-emerald-500" />{t}
              </span>
            ))}
          </div>
        </div>
        <ScrollIndicator isDark={isDark} />
      </section>

      {/* ── STATS ── */}
      <section id="stats" className="py-20 border-y" style={{ background: bg2, borderColor: border }}>
        <div className="max-w-6xl mx-auto px-8 grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((s, i) => (
            <div key={i} className="text-center group">
              <div className="text-5xl font-black bg-gradient-to-r from-violet-500 to-cyan-500 bg-clip-text text-transparent mb-2 group-hover:scale-105 transition-transform">
                {s.val}
              </div>
              <div className="text-xs font-light" style={{ color: text2 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── DEMO ── */}
      <section id="demo" className="py-28 px-8 relative overflow-hidden" style={{ background: bg }}>
        <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-96 h-96 rounded-full blur-3xl pointer-events-none"
          style={{ background: isDark ? 'rgba(124,58,237,0.08)' : 'rgba(109,40,217,0.06)' }} />
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-16 items-center">
          <div>
            <p className="text-[10px] uppercase tracking-[0.25em] font-semibold mb-4" style={{ color: '#7C3AED' }}>Try it live</p>
            <SectionTitle isDark={isDark}>See the AI work in real time</SectionTitle>
            <p className="font-light leading-relaxed text-sm mt-6 mb-8" style={{ color: text2 }}>
              Type any customer message. Watch FlowPilot's on-device NLP model classify, score, and route it instantly.
            </p>
            <ul className="space-y-3 text-sm">
              {[
                'Zero-shot classification with BART-MNLI',
                'Budget & entity extraction via regex pipeline',
                'Auto-scoring 0–100 based on intent signals',
                'Instant response generation — no LLM required',
              ].map((t, i) => (
                <li key={i} className="flex items-center gap-3 font-light" style={{ color: text }}>
                  <span className="w-1.5 h-1.5 rounded-full bg-violet-500 flex-shrink-0" />
                  {t}
                </li>
              ))}
            </ul>
          </div>
          <LiveDemoChat isDark={isDark} />
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section id="features" className="py-28 px-8 relative" style={{ background: bg2 }}>
        {/* Subtle grid */}
        <div className="absolute inset-0 pointer-events-none"
          style={{ backgroundImage: `linear-gradient(${isDark ? 'rgba(255,255,255,0.02)' : 'rgba(109,40,217,0.04)'} 1px,transparent 1px),linear-gradient(90deg,${isDark ? 'rgba(255,255,255,0.02)' : 'rgba(109,40,217,0.04)'} 1px,transparent 1px)`, backgroundSize: '48px 48px' }} />
        <div className="max-w-6xl mx-auto relative">
          <div className="text-center mb-20">
            <p className="text-[10px] uppercase tracking-[0.25em] font-semibold mb-4" style={{ color: '#7C3AED' }}>What we built</p>
            <SectionTitle isDark={isDark}>Everything to automate your pipeline</SectionTitle>
          </div>
          <StaggerList className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {features.map((f, i) => (
              <StaggerItem key={i}>
                <motion.div
                  className="group p-7 rounded-2xl transition-all duration-300 cursor-default"
                  style={{ background: cardBg, border: `1px solid ${border}`, backdropFilter: 'blur(12px)' }}
                  whileHover={{ y: -6, boxShadow: `0 20px 60px ${isDark ? 'rgba(0,229,255,0.12)' : 'rgba(0,110,204,0.12)'}` }}
                  transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                >
                  <div className={`inline-flex p-3 rounded-xl bg-gradient-to-br ${f.grad} mb-4 shadow-lg`}>
                    {f.icon}
                  </div>
                  <h3 className="font-bold text-sm mb-2" style={{ color: text }}>{f.title}</h3>
                  <p className="text-xs font-light leading-relaxed" style={{ color: text2 }}>{f.desc}</p>
                </motion.div>
              </StaggerItem>
            ))}
          </StaggerList>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-40 px-8 relative overflow-hidden" style={{ background: bg }}>
        <div className="absolute inset-0 z-0">
          <Canvas camera={{ position: [0, 0, 5], fov: 60 }} gl={{ antialias: true, alpha: true }}
            style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
            <ambientLight intensity={0.1} />
            <pointLight position={[0, 0, 3]} color="#7C3AED" intensity={3} />
            <Suspense fallback={null}>
              <StarField count={2000} color={isDark ? '#a78bfa' : '#7C3AED'} />
            </Suspense>
          </Canvas>
        </div>
        <div className="relative z-10 max-w-3xl mx-auto text-center">
          <p className="text-[10px] uppercase tracking-[0.25em] font-semibold mb-6" style={{ color: '#7C3AED' }}>Get started today</p>
          <h2 className="text-5xl md:text-7xl font-black tracking-tight mb-6 leading-tight" style={{ color: text }}>
            Build smarter<br />
            <span className="bg-gradient-to-r from-violet-500 to-cyan-500 bg-clip-text text-transparent">customer operations</span>
          </h2>
          <p className="font-light text-base mb-12 max-w-xl mx-auto leading-relaxed" style={{ color: text2 }}>
            Deploy FlowPilot in minutes. No external API keys. No vendor lock-in. Full ownership of your AI pipeline.
          </p>
          <div className="flex items-center gap-4 justify-center">
            <Link to="/register"
              className="group flex items-center gap-2 px-10 py-4 rounded-full text-white text-sm font-bold transition-all"
              style={{ background: 'linear-gradient(135deg,#7C3AED,#4F46E5)', boxShadow: '0 8px 40px rgba(124,58,237,0.4)' }}>
              Create your account
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link to="/login" className="text-xs font-light transition-colors hover:opacity-100" style={{ color: text2, opacity: 0.7 }}>
              Already have an account →
            </Link>
          </div>
          <div className="mt-10 flex items-center justify-center gap-1.5">
            {[0,1,2,3,4].map(i => <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />)}
            <span className="text-xs ml-2 font-light" style={{ color: text2 }}>Built for FlowZint AI Hackathon 2026</span>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="py-10 px-8 border-t flex flex-col md:flex-row items-center justify-between gap-4"
        style={{ borderColor: border, background: bg2 }}>
        <div className="flex items-center gap-2 text-xs" style={{ color: text2, opacity: 0.6 }}>
          <div className="w-5 h-5 rounded bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center">
            <Bot className="w-3 h-3 text-white" />
          </div>
          <span>FlowPilot AI © 2026</span>
        </div>
        <div className="flex items-center gap-4">
          {/* Footer theme toggle */}
          <ThemeToggle />
        </div>
        <div className="flex items-center gap-6 text-[10px] uppercase tracking-widest" style={{ color: text2, opacity: 0.5 }}>
          <span>HuggingFace</span><span>·</span><span>Three.js</span><span>·</span><span>FastAPI</span>
        </div>
      </footer>
    </div>
  );
}
