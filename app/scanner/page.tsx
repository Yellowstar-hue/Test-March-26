'use client';

import { useState, useRef } from 'react';
import {
  Search, Shield, FileText, Scale, Lock, Users, User, Clock,
  Baby, Globe, CheckCircle, XCircle, AlertCircle, ChevronDown,
  ChevronUp, AlertTriangle, ExternalLink, Loader2, Zap,
  Target, Activity, TrendingUp, Info,
} from 'lucide-react';
import type { ScanResult, CategoryResult, GapItem, SecurityHeader } from '../api/scan/route';

// ---- Scoring colour helpers ----
function scoreColor(score: number, max: number) {
  const pct = (score / max) * 100;
  if (pct >= 80) return '#22c55e';
  if (pct >= 60) return '#f59e0b';
  if (pct >= 35) return '#f97316';
  return '#ef4444';
}

function levelConfig(level: string) {
  switch (level) {
    case 'Excellent':         return { color: '#22c55e', bg: 'rgba(34,197,94,0.1)',   border: 'rgba(34,197,94,0.25)',   hex: '#22c55e' };
    case 'Good':              return { color: '#0ea5e9', bg: 'rgba(14,165,233,0.1)',  border: 'rgba(14,165,233,0.25)',  hex: '#0ea5e9' };
    case 'Moderate':          return { color: '#f59e0b', bg: 'rgba(245,158,11,0.1)', border: 'rgba(245,158,11,0.25)', hex: '#f59e0b' };
    case 'Needs Improvement': return { color: '#f97316', bg: 'rgba(249,115,22,0.1)', border: 'rgba(249,115,22,0.25)', hex: '#f97316' };
    default:                  return { color: '#ef4444', bg: 'rgba(239,68,68,0.1)',  border: 'rgba(239,68,68,0.25)',  hex: '#ef4444' };
  }
}

function severityConfig(s: string) {
  switch (s) {
    case 'Critical': return { bg: 'rgba(239,68,68,0.08)',   text: '#ef4444', badge: 'rgba(239,68,68,0.1)',   badgeText: '#ef4444',   badgeBorder: 'rgba(239,68,68,0.2)',   dot: '#ef4444' };
    case 'High':     return { bg: 'rgba(249,115,22,0.08)',  text: '#f97316', badge: 'rgba(249,115,22,0.1)',  badgeText: '#f97316',   badgeBorder: 'rgba(249,115,22,0.2)',  dot: '#f97316' };
    case 'Medium':   return { bg: 'rgba(245,158,11,0.08)',  text: '#f59e0b', badge: 'rgba(245,158,11,0.1)',  badgeText: '#f59e0b',   badgeBorder: 'rgba(245,158,11,0.2)',  dot: '#f59e0b' };
    default:         return { bg: 'rgba(14,165,233,0.08)',  text: '#0ea5e9', badge: 'rgba(14,165,233,0.1)',  badgeText: '#0ea5e9',   badgeBorder: 'rgba(14,165,233,0.2)',  dot: '#0ea5e9' };
  }
}

// ---- Circular score gauge ----
function ScoreGauge({ score, max, level }: { score: number; max: number; level: string }) {
  const cfg = levelConfig(level);
  const radius = 72;
  const stroke = 10;
  const circ = 2 * Math.PI * radius;
  const pct = Math.min(score / max, 1);
  const dash = circ * pct;
  const size = (radius + stroke + 4) * 2;

  return (
    <div className="flex flex-col items-center">
      <div className="relative">
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          {/* Track */}
          <circle
            cx={size / 2} cy={size / 2} r={radius}
            fill="none" stroke="rgba(15,23,42,0.08)" strokeWidth={stroke}
          />
          {/* Glow layer */}
          <circle
            cx={size / 2} cy={size / 2} r={radius}
            fill="none" stroke={cfg.hex} strokeWidth={stroke}
            strokeDasharray={`${dash} ${circ}`}
            strokeLinecap="round"
            transform={`rotate(-90 ${size / 2} ${size / 2})`}
            style={{ filter: `drop-shadow(0 0 6px ${cfg.hex}66)`, transition: 'stroke-dasharray 0.8s cubic-bezier(0.4,0,0.2,1)' }}
          />
          {/* Score text */}
          <text x={size / 2} y={size / 2 - 8} textAnchor="middle" fontSize="40" fontWeight="800" fill="#0f172a">{score}</text>
          <text x={size / 2} y={size / 2 + 12} textAnchor="middle" fontSize="12" fill="#94a3b8" fontWeight="500">/ {max} pts</text>
        </svg>
      </div>
      <span className="mt-3 text-xs font-bold px-3 py-1.5 rounded-full"
        style={{ background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.border}` }}>
        {level}
      </span>
    </div>
  );
}

// ---- Category icon map ----
function CategoryIcon({ id, className }: { id: string; className?: string }) {
  const cls = className ?? 'w-5 h-5';
  switch (id) {
    case 'consent':    return <Shield className={cls} />;
    case 'privacy':    return <FileText className={cls} />;
    case 'grievance':  return <Scale className={cls} />;
    case 'security':   return <Lock className={cls} />;
    case 'rights':     return <Users className={cls} />;
    case 'dpo':        return <User className={cls} />;
    case 'retention':  return <Clock className={cls} />;
    case 'children':   return <Baby className={cls} />;
    case 'crossborder':return <Globe className={cls} />;
    default:           return <Info className={cls} />;
  }
}

// ---- "What We Assess" card data ----
const ASSESS_ITEMS = [
  { id: 'consent',    name: 'Consent Notice & Mechanism', section: 'Section 6 & 7', desc: 'Freely given, specific, informed consent before processing with withdrawal option', pts: 25, bonus: false },
  { id: 'privacy',    name: 'Privacy Notice',             section: 'Section 5',     desc: 'Accessible notice covering data categories, purposes, and data principal rights', pts: 20, bonus: false },
  { id: 'grievance',  name: 'Grievance Redressal',        section: 'Section 13',    desc: 'Designated grievance officer and an accessible complaint mechanism', pts: 15, bonus: false },
  { id: 'security',   name: 'Data Security Measures',     section: 'Section 8',     desc: 'HTTPS encryption and HTTP security headers protecting personal data in transit', pts: 15, bonus: false },
  { id: 'rights',     name: 'Data Principal Rights',      section: 'Section 11–14', desc: 'Access, correction, erasure, portability — communicated and actionable', pts: 10, bonus: false },
  { id: 'dpo',        name: 'Data Fiduciary Contact / DPO', section: 'DPDP Rules', desc: 'Designated DPO with published contact details for privacy queries', pts: 10, bonus: false },
  { id: 'retention',  name: 'Data Retention Policy',      section: 'Section 8(7)',  desc: 'Defined retention periods — data erased once purpose is fulfilled', pts: 5, bonus: false },
  { id: 'children',   name: "Children's Data Protection", section: 'Section 9',     desc: 'Verifiable parental consent and age-appropriate safeguards for minors', pts: 10, bonus: true },
  { id: 'crossborder',name: 'Cross-border Data Transfer', section: 'Section 16',   desc: 'Notice and safeguards for personal data transferred outside India', pts: 5, bonus: true },
];

// ---- Collapsible category card in results ----
function CategoryCard({ cat }: { cat: CategoryResult }) {
  const [open, setOpen] = useState(false);
  const color = scoreColor(cat.score, cat.maxScore);
  const pct = Math.round((cat.score / cat.maxScore) * 100);

  return (
    <div className="rounded-xl overflow-hidden transition-all"
      style={{ border: '1px solid rgba(15,23,42,0.08)', background: '#fff' }}>
      <button
        className="w-full flex items-center gap-4 px-5 py-4 text-left transition-colors"
        style={{ cursor: 'pointer' }}
        onClick={() => setOpen(v => !v)}
        onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = '#f8fafc'}
        onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = open ? '#f8fafc' : '#fff'}
      >
        <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background: 'rgba(14,165,233,0.08)' }}>
          <CategoryIcon id={cat.id} className="w-4.5 h-4.5" style={{ color: '#0ea5e9' } as React.CSSProperties} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-semibold text-slate-800 text-sm">{cat.name}</span>
            {cat.isBonus && (
              <span className="text-xs px-2 py-0.5 rounded-full font-semibold"
                style={{ background: 'rgba(139,92,246,0.1)', color: '#8b5cf6', border: '1px solid rgba(139,92,246,0.2)' }}>
                Bonus
              </span>
            )}
            <span className="text-xs font-mono" style={{ color: '#94a3b8' }}>{cat.dpdpSection}</span>
          </div>
          <div className="mt-2 flex items-center gap-3">
            <div className="flex-1 h-1.5 rounded-full overflow-hidden max-w-48"
              style={{ background: 'rgba(15,23,42,0.06)' }}>
              <div className="h-full rounded-full transition-all duration-500"
                style={{ width: `${pct}%`, background: color, boxShadow: `0 0 6px ${color}44` }} />
            </div>
            <span className="text-xs font-bold" style={{ color }}>{cat.score}/{cat.maxScore}</span>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          {cat.status === 'pass' && <CheckCircle className="w-4 h-4" style={{ color: '#22c55e' }} />}
          {cat.status === 'partial' && <AlertCircle className="w-4 h-4" style={{ color: '#f59e0b' }} />}
          {cat.status === 'fail' && <XCircle className="w-4 h-4" style={{ color: '#ef4444' }} />}
          {open
            ? <ChevronUp className="w-4 h-4 text-slate-400" />
            : <ChevronDown className="w-4 h-4 text-slate-400" />}
        </div>
      </button>

      {open && (
        <div className="px-5 pb-5 pt-3" style={{ borderTop: '1px solid rgba(15,23,42,0.06)', background: '#fafafa' }}>
          <p className="text-xs text-slate-500 mb-3 leading-relaxed">{cat.description}</p>
          <div className="space-y-2">
            {cat.checks.map((chk, i) => (
              <div key={i} className="flex items-start gap-3 p-3 rounded-lg"
                style={{
                  background: chk.found ? 'rgba(34,197,94,0.06)' : 'rgba(239,68,68,0.06)',
                  border: chk.found ? '1px solid rgba(34,197,94,0.12)' : '1px solid rgba(239,68,68,0.12)',
                }}>
                {chk.found
                  ? <CheckCircle className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: '#22c55e' }} />
                  : <XCircle className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: '#ef4444' }} />}
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-semibold text-slate-700">{chk.label}</div>
                  <div className="text-xs mt-0.5" style={{ color: chk.found ? '#16a34a' : '#dc2626' }}>{chk.detail}</div>
                </div>
                <span className="text-xs font-bold flex-shrink-0"
                  style={{ color: chk.found ? '#16a34a' : '#94a3b8' }}>
                  {chk.found ? `+${chk.points}` : `0/${chk.points}`}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ---- Gap row ----
function GapRow({ gap, index }: { gap: GapItem; index: number }) {
  const [open, setOpen] = useState(false);
  const cfg = severityConfig(gap.severity);

  return (
    <>
      <tr
        className="transition-colors cursor-pointer"
        style={{ borderBottom: '1px solid rgba(15,23,42,0.05)' }}
        onClick={() => setOpen(v => !v)}
        onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = '#f8fafc'}
        onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = open ? 'rgba(245,158,11,0.03)' : 'transparent'}
      >
        <td className="px-4 py-3 text-xs text-slate-400 font-mono">{String(index + 1).padStart(2, '0')}</td>
        <td className="px-4 py-3">
          <span className="inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full"
            style={{ background: cfg.badge, color: cfg.badgeText, border: `1px solid ${cfg.badgeBorder}` }}>
            <span className="w-1.5 h-1.5 rounded-full flex-shrink-0"
              style={{ background: cfg.dot, boxShadow: `0 0 4px ${cfg.dot}` }} />
            {gap.severity}
          </span>
        </td>
        <td className="px-4 py-3 text-sm font-medium text-slate-700">{gap.gap}</td>
        <td className="px-4 py-3 text-xs text-slate-400">{gap.category}</td>
        <td className="px-4 py-3">
          <span className="text-xs font-mono font-semibold px-2 py-1 rounded-lg"
            style={{ background: 'rgba(14,165,233,0.08)', color: '#0ea5e9' }}>
            {gap.dpdpSection}
          </span>
        </td>
        <td className="px-4 py-3">
          {open
            ? <ChevronUp className="w-4 h-4 text-slate-400" />
            : <ChevronDown className="w-4 h-4 text-slate-400" />}
        </td>
      </tr>
      {open && (
        <tr style={{ background: 'rgba(245,158,11,0.04)' }}>
          <td colSpan={6} className="px-4 py-3">
            <div className="flex gap-3 items-start">
              <div className="w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"
                style={{ background: 'rgba(245,158,11,0.15)' }}>
                <AlertTriangle className="w-3.5 h-3.5" style={{ color: '#f59e0b' }} />
              </div>
              <div>
                <div className="text-xs font-bold mb-1" style={{ color: '#92400e' }}>Recommended Action</div>
                <div className="text-sm text-slate-700 leading-relaxed">{gap.recommendation}</div>
              </div>
            </div>
          </td>
        </tr>
      )}
    </>
  );
}

// ---- Main page ----
export default function ScannerPage() {
  const [domain, setDomain] = useState('');
  const [email, setEmail] = useState('');
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState<ScanResult | null>(null);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<'categories' | 'gaps' | 'headers'>('categories');
  const resultRef = useRef<HTMLDivElement>(null);

  async function handleScan(e: React.FormEvent) {
    e.preventDefault();
    if (!domain.trim()) return;
    setScanning(true);
    setError('');
    setResult(null);
    try {
      const res = await fetch('/api/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: domain.trim(), email: email.trim() || undefined }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? 'Scan failed. Please try again.');
      } else {
        setResult(data as ScanResult);
        setTimeout(() => resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100);
      }
    } catch {
      setError('Network error — please check your connection and try again.');
    } finally {
      setScanning(false);
    }
  }

  const cfg = result ? levelConfig(result.complianceLevel) : null;
  const criticalGaps = result?.gaps.filter(g => g.severity === 'Critical').length ?? 0;
  const highGaps = result?.gaps.filter(g => g.severity === 'High').length ?? 0;

  const scanSteps = ['Fetching homepage', 'Locating privacy notice', 'Checking consent mechanisms', 'Analysing security headers', 'Generating GAP report'];

  return (
    <div className="max-w-5xl mx-auto">

      {/* ---- Hero ---- */}
      <div className="text-center mb-10">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 mb-5 text-xs font-bold px-4 py-2 rounded-full"
          style={{ background: 'rgba(14,165,233,0.1)', color: '#0ea5e9', border: '1px solid rgba(14,165,233,0.2)' }}>
          <Zap className="w-3.5 h-3.5" />
          Free DPDP Readiness Tool
          <span className="w-1 h-1 rounded-full bg-sky-400/60" />
          <Activity className="w-3 h-3 opacity-60" />
          Live Scanner
        </div>

        <h1 className="text-4xl font-black text-slate-900 mb-4 tracking-tight leading-tight">
          DPDP Compliance{' '}
          <span style={{
            background: 'linear-gradient(135deg, #0ea5e9, #38bdf8)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}>
            GAP Assessment
          </span>
        </h1>
        <p className="text-slate-500 max-w-2xl mx-auto text-base leading-relaxed">
          Instantly analyse your website against India&apos;s{' '}
          <span className="font-semibold text-slate-700">Digital Personal Data Protection Act 2023</span>.
          Get a readiness score, identify compliance gaps, and receive actionable remediation guidance.
        </p>
      </div>

      {/* ---- Scan form ---- */}
      <div className="rounded-2xl p-6 mb-10"
        style={{
          background: '#fff',
          border: '1px solid rgba(15,23,42,0.08)',
          boxShadow: '0 4px 24px rgba(14,165,233,0.08), 0 1px 3px rgba(15,23,42,0.06)',
        }}>
        {/* Form header */}
        <div className="flex items-center gap-3 mb-5">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #0ea5e9, #0284c7)' }}>
            <Target className="w-4.5 h-4.5 text-white" />
          </div>
          <div>
            <div className="font-bold text-slate-900 text-sm">Website Scanner</div>
            <div className="text-xs text-slate-400">Automated DPDP compliance analysis</div>
          </div>
        </div>

        <form onSubmit={handleScan} className="space-y-3">
          <div className="flex gap-3">
            <div className="flex-1 relative">
              <Globe className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: '#94a3b8' }} />
              <input
                type="text"
                value={domain}
                onChange={e => setDomain(e.target.value)}
                placeholder="Enter website URL (e.g., example.com or https://example.com)"
                className="w-full pl-10 pr-4 py-3 text-sm rounded-xl transition-all outline-none"
                style={{
                  border: '1.5px solid rgba(15,23,42,0.1)',
                  background: '#f8fafc',
                  color: '#0f172a',
                }}
                onFocus={e => {
                  (e.target as HTMLElement).style.borderColor = '#0ea5e9';
                  (e.target as HTMLElement).style.boxShadow = '0 0 0 3px rgba(14,165,233,0.1)';
                  (e.target as HTMLElement).style.background = '#fff';
                }}
                onBlur={e => {
                  (e.target as HTMLElement).style.borderColor = 'rgba(15,23,42,0.1)';
                  (e.target as HTMLElement).style.boxShadow = 'none';
                  (e.target as HTMLElement).style.background = '#f8fafc';
                }}
                disabled={scanning}
              />
            </div>
            <button
              type="submit"
              disabled={scanning || !domain.trim()}
              className="flex items-center gap-2 text-sm font-bold px-6 py-3 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              style={{
                background: 'linear-gradient(135deg, #0ea5e9, #0284c7)',
                color: '#fff',
                boxShadow: '0 2px 8px rgba(14,165,233,0.35)',
              }}
            >
              {scanning ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Analysing…</>
              ) : (
                <><Search className="w-4 h-4" /> Run Assessment</>
              )}
            </button>
          </div>
          <div className="relative">
            <svg className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2" fill="none" stroke="#94a3b8" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="Email address (optional — receive a copy of your report)"
              className="w-full pl-10 pr-4 py-3 text-sm rounded-xl transition-all outline-none"
              style={{ border: '1.5px solid rgba(15,23,42,0.1)', background: '#f8fafc', color: '#0f172a' }}
              onFocus={e => {
                (e.target as HTMLElement).style.borderColor = '#0ea5e9';
                (e.target as HTMLElement).style.boxShadow = '0 0 0 3px rgba(14,165,233,0.1)';
                (e.target as HTMLElement).style.background = '#fff';
              }}
              onBlur={e => {
                (e.target as HTMLElement).style.borderColor = 'rgba(15,23,42,0.1)';
                (e.target as HTMLElement).style.boxShadow = 'none';
                (e.target as HTMLElement).style.background = '#f8fafc';
              }}
              disabled={scanning}
            />
          </div>
        </form>

        {error && (
          <div className="mt-4 flex items-start gap-2.5 text-sm rounded-xl p-3.5"
            style={{ background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.2)', color: '#dc2626' }}>
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            {error}
          </div>
        )}

        {scanning && (
          <div className="mt-5">
            <div className="flex items-center justify-between text-xs mb-2" style={{ color: '#94a3b8' }}>
              <span className="font-medium" style={{ color: '#0ea5e9' }}>Scanning in progress…</span>
              <span>Please wait up to 30s</span>
            </div>
            {/* Animated progress bar */}
            <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(14,165,233,0.1)' }}>
              <div className="h-full rounded-full"
                style={{
                  width: '65%',
                  background: 'linear-gradient(90deg, #0ea5e9, #38bdf8, #0ea5e9)',
                  backgroundSize: '200% 100%',
                  animation: 'shimmer 1.5s infinite',
                }} />
            </div>
            {/* Step indicators */}
            <div className="grid grid-cols-5 gap-2 mt-4">
              {scanSteps.map((s, i) => (
                <div key={i} className="flex flex-col items-center gap-1.5 text-center">
                  <div className="w-6 h-6 rounded-full flex items-center justify-center"
                    style={{ background: 'rgba(14,165,233,0.1)', border: '1px solid rgba(14,165,233,0.2)' }}>
                    <Loader2 className="w-3 h-3 animate-spin" style={{ color: '#0ea5e9' }} />
                  </div>
                  <span className="text-xs leading-tight" style={{ color: '#94a3b8' }}>{s}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ---- What We Assess ---- */}
      {!result && (
        <div className="mb-10">
          <div className="text-center mb-6">
            <h2 className="text-xl font-bold text-slate-900 mb-2">What We Assess</h2>
            <p className="text-sm text-slate-400">7 scored categories (100 pts) + 2 bonus checks — aligned to DPDP Act 2023 obligations</p>
          </div>
          <div className="grid grid-cols-3 gap-4">
            {ASSESS_ITEMS.map(item => (
              <div key={item.id}
                className="rounded-xl p-4 transition-all group"
                style={{
                  background: '#fff',
                  border: '1px solid rgba(15,23,42,0.08)',
                  boxShadow: '0 1px 3px rgba(15,23,42,0.04)',
                }}
                onMouseEnter={e => (e.currentTarget as HTMLElement).style.boxShadow = '0 4px 16px rgba(14,165,233,0.1), 0 1px 3px rgba(15,23,42,0.06)'}
                onMouseLeave={e => (e.currentTarget as HTMLElement).style.boxShadow = '0 1px 3px rgba(15,23,42,0.04)'}
              >
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: item.bonus ? 'rgba(139,92,246,0.08)' : 'rgba(14,165,233,0.08)' }}>
                    <CategoryIcon id={item.id} className="w-4.5 h-4.5"
                      style={{ color: item.bonus ? '#8b5cf6' : '#0ea5e9' } as React.CSSProperties} />
                  </div>
                  {item.bonus
                    ? <span className="text-xs font-bold px-2 py-0.5 rounded-full"
                        style={{ background: 'rgba(139,92,246,0.1)', color: '#8b5cf6', border: '1px solid rgba(139,92,246,0.2)' }}>
                        Bonus +{item.pts}
                      </span>
                    : <span className="text-xs font-bold px-2 py-0.5 rounded-full"
                        style={{ background: 'rgba(15,23,42,0.05)', color: '#64748b' }}>
                        {item.pts} pts
                      </span>
                  }
                </div>
                <h3 className="text-sm font-bold text-slate-800 mb-1.5 leading-tight">{item.name}</h3>
                <p className="text-xs text-slate-400 leading-relaxed mb-3">{item.desc}</p>
                <span className="text-xs font-semibold" style={{ color: '#0ea5e9' }}>{item.section}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ---- Results ---- */}
      {result && cfg && (
        <div ref={resultRef} className="space-y-5">

          {/* Partial scan warning */}
          {result.fetchError && (
            <div className="flex items-start gap-3 text-sm rounded-xl p-4"
              style={{ background: 'rgba(245,158,11,0.06)', border: '1px solid rgba(245,158,11,0.2)' }}>
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: '#f59e0b' }} />
              <div style={{ color: '#92400e' }}>
                <span className="font-semibold">Partial scan: </span>
                {result.fetchError} — results may be incomplete. Some websites block automated scanners.
              </div>
            </div>
          )}

          {/* Score overview */}
          <div className="rounded-2xl p-6 overflow-hidden relative"
            style={{ background: '#fff', border: `1px solid ${cfg.border}`, boxShadow: `0 4px 24px ${cfg.color}15` }}>
            {/* Background accent */}
            <div className="absolute top-0 right-0 w-48 h-48 rounded-full opacity-5 pointer-events-none"
              style={{ background: `radial-gradient(circle, ${cfg.hex} 0%, transparent 70%)`, transform: 'translate(20%, -20%)' }} />

            <div className="relative flex flex-col sm:flex-row items-center gap-8">
              <ScoreGauge score={result.overallScore} max={result.maxBaseScore} level={result.complianceLevel} />

              <div className="flex-1">
                <h2 className="text-xl font-black text-slate-900 mb-1">Readiness Assessment Complete</h2>
                <div className="flex items-center gap-2 mb-5">
                  <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
                  <a href={result.url} target="_blank" rel="noopener noreferrer"
                    className="text-sm font-semibold hover:underline" style={{ color: '#0ea5e9' }}>
                    {result.domain}
                  </a>
                  <span className="text-slate-200">•</span>
                  <span className="text-xs text-slate-400">Scanned in {(result.durationMs / 1000).toFixed(1)}s</span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {[
                    { label: 'Base Score', value: result.overallScore, sub: `of ${result.maxBaseScore}`, color: cfg.color, bg: cfg.bg },
                    { label: 'Bonus Points', value: `+${result.bonusScore}`, sub: 'of 15', color: '#8b5cf6', bg: 'rgba(139,92,246,0.08)' },
                    { label: 'Critical Gaps', value: criticalGaps, sub: 'immediate action', color: '#ef4444', bg: 'rgba(239,68,68,0.08)' },
                    { label: 'High Gaps', value: highGaps, sub: 'priority action', color: '#f97316', bg: 'rgba(249,115,22,0.08)' },
                  ].map(({ label, value, sub, color, bg }) => (
                    <div key={label} className="rounded-xl p-3 text-center"
                      style={{ background: bg, border: `1px solid ${color}22` }}>
                      <div className="text-2xl font-black" style={{ color }}>{value}</div>
                      <div className="text-xs font-semibold text-slate-600 mt-0.5">{label}</div>
                      <div className="text-xs text-slate-400">{sub}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="rounded-2xl overflow-hidden"
            style={{ background: '#fff', border: '1px solid rgba(15,23,42,0.08)', boxShadow: '0 1px 3px rgba(15,23,42,0.04)' }}>
            {/* Tab bar */}
            <div className="flex" style={{ borderBottom: '1px solid rgba(15,23,42,0.08)' }}>
              {([
                { key: 'categories', label: 'Category Breakdown', icon: TrendingUp, count: result.categories.length },
                { key: 'gaps', label: 'GAP Analysis', icon: AlertTriangle, count: result.gaps.length },
                { key: 'headers', label: 'Security Headers', icon: Lock, count: result.securityHeaders.length },
              ] as const).map(tab => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className="flex-1 py-3.5 text-sm font-semibold flex items-center justify-center gap-2 transition-all"
                  style={{
                    color: activeTab === tab.key ? '#0ea5e9' : '#94a3b8',
                    borderBottom: activeTab === tab.key ? '2px solid #0ea5e9' : '2px solid transparent',
                    background: activeTab === tab.key ? 'rgba(14,165,233,0.03)' : 'transparent',
                  }}
                >
                  <tab.icon className="w-3.5 h-3.5" />
                  {tab.label}
                  <span className="text-xs px-1.5 py-0.5 rounded-full font-bold"
                    style={{
                      background: activeTab === tab.key ? 'rgba(14,165,233,0.12)' : 'rgba(15,23,42,0.05)',
                      color: activeTab === tab.key ? '#0ea5e9' : '#94a3b8',
                    }}>
                    {tab.count}
                  </span>
                </button>
              ))}
            </div>

            {/* Category Breakdown */}
            {activeTab === 'categories' && (
              <div className="p-5 space-y-3">
                <div className="flex items-center gap-4 text-xs mb-4">
                  {[
                    { label: 'Pass', count: result.categories.filter(c => c.status === 'pass').length, color: '#22c55e' },
                    { label: 'Partial', count: result.categories.filter(c => c.status === 'partial').length, color: '#f59e0b' },
                    { label: 'Fail', count: result.categories.filter(c => c.status === 'fail').length, color: '#ef4444' },
                  ].map(s => (
                    <span key={s.label} className="flex items-center gap-1.5 font-semibold" style={{ color: s.color }}>
                      <span className="w-2 h-2 rounded-full" style={{ background: s.color }} />
                      {s.label}: {s.count}
                    </span>
                  ))}
                  <span className="text-slate-300">·</span>
                  <span className="text-slate-400">Click any category to expand checks</span>
                </div>
                {result.categories.map(cat => <CategoryCard key={cat.id} cat={cat} />)}
              </div>
            )}

            {/* GAP Analysis */}
            {activeTab === 'gaps' && (
              <div className="p-5">
                {result.gaps.length === 0 ? (
                  <div className="text-center py-14">
                    <div className="w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center"
                      style={{ background: 'rgba(34,197,94,0.1)' }}>
                      <CheckCircle className="w-8 h-8" style={{ color: '#22c55e' }} />
                    </div>
                    <div className="text-lg font-bold text-slate-900">No gaps detected</div>
                    <div className="text-sm text-slate-400 mt-1">Your website passed all assessed DPDP compliance checks</div>
                  </div>
                ) : (
                  <>
                    <div className="flex items-center justify-between mb-4">
                      <p className="text-sm text-slate-500">
                        <span className="font-bold text-slate-800">{result.gaps.length} compliance gaps</span> identified — click any row to see recommended remediation
                      </p>
                      <div className="flex gap-2">
                        {(['Critical', 'High', 'Medium', 'Low'] as const).map(s => {
                          const n = result.gaps.filter(g => g.severity === s).length;
                          if (!n) return null;
                          const c = severityConfig(s);
                          return (
                            <span key={s} className="text-xs px-2.5 py-1 rounded-full font-bold"
                              style={{ background: c.badge, color: c.badgeText, border: `1px solid ${c.badgeBorder}` }}>
                              {n} {s}
                            </span>
                          );
                        })}
                      </div>
                    </div>
                    <div className="overflow-x-auto rounded-xl" style={{ border: '1px solid rgba(15,23,42,0.08)' }}>
                      <table className="w-full text-sm">
                        <thead>
                          <tr style={{ background: '#f8fafc', borderBottom: '1px solid rgba(15,23,42,0.08)' }}>
                            <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-slate-400 w-10">#</th>
                            <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-slate-400 w-28">Severity</th>
                            <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-slate-400">Gap Identified</th>
                            <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-slate-400">Category</th>
                            <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-slate-400">Reference</th>
                            <th className="px-4 py-3 w-8" />
                          </tr>
                        </thead>
                        <tbody>
                          {result.gaps.map((gap, i) => <GapRow key={i} gap={gap} index={i} />)}
                        </tbody>
                      </table>
                    </div>
                  </>
                )}
              </div>
            )}

            {/* Security Headers */}
            {activeTab === 'headers' && (
              <div className="p-5">
                <p className="text-sm text-slate-500 mb-5">
                  HTTP response headers detected on <span className="font-semibold text-slate-700">{result.domain}</span>. These headers form part of technical security measures required under <span className="font-semibold text-slate-700">DPDP Section 8</span>.
                </p>
                <div className="space-y-2">
                  {result.securityHeaders.map((h: SecurityHeader) => (
                    <div key={h.header}
                      className="flex items-start gap-4 p-3.5 rounded-xl"
                      style={{
                        border: h.present ? '1px solid rgba(34,197,94,0.2)' : '1px solid rgba(239,68,68,0.12)',
                        background: h.present ? 'rgba(34,197,94,0.04)' : 'rgba(239,68,68,0.04)',
                      }}>
                      {h.present
                        ? <CheckCircle className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: '#22c55e' }} />
                        : <XCircle className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: '#ef4444' }} />}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-mono text-sm font-bold text-slate-800">{h.header}</span>
                          {h.present && h.value && (
                            <span className="font-mono text-xs text-slate-400 truncate max-w-xs">{h.value}</span>
                          )}
                        </div>
                        <div className="text-xs text-slate-400 mt-0.5">{h.description}</div>
                      </div>
                      <span className="text-xs font-bold px-2 py-0.5 rounded-full flex-shrink-0"
                        style={{
                          background: h.present ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)',
                          color: h.present ? '#16a34a' : '#dc2626',
                          border: h.present ? '1px solid rgba(34,197,94,0.2)' : '1px solid rgba(239,68,68,0.2)',
                        }}>
                        {h.present ? 'Present' : 'Missing'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* CTA */}
          <div className="rounded-2xl p-6 relative overflow-hidden"
            style={{ background: 'linear-gradient(135deg, #0c1322 0%, #1a2744 60%, #0c1f3f 100%)' }}>
            {/* Glow */}
            <div className="absolute top-0 right-0 w-48 h-48 opacity-10 pointer-events-none"
              style={{ background: 'radial-gradient(circle, #0ea5e9 0%, transparent 70%)', transform: 'translate(20%, -20%)' }} />
            <div className="relative flex items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Zap className="w-4 h-4" style={{ color: '#38bdf8' }} />
                  <span className="font-black text-white text-lg">Need help closing these gaps?</span>
                </div>
                <div className="text-sm" style={{ color: 'rgba(148,163,184,0.8)' }}>
                  Use the DPDP Comply platform to manage consents, rights requests, breach incidents, and your full compliance programme.
                </div>
              </div>
              <div className="flex gap-3 flex-shrink-0">
                <button
                  onClick={() => { setResult(null); setDomain(''); setEmail(''); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                  className="text-sm font-semibold px-4 py-2.5 rounded-xl transition-all"
                  style={{ background: 'rgba(255,255,255,0.08)', color: '#fff', border: '1px solid rgba(255,255,255,0.12)' }}
                >
                  Scan Another
                </button>
              </div>
            </div>
          </div>

          {/* Disclaimer */}
          <p className="text-xs text-slate-400 text-center pb-4 leading-relaxed">
            This automated assessment provides indicative readiness signals based on publicly accessible content and HTTP headers.
            It does not constitute legal advice. A full DPDP compliance programme requires legal review, internal audits, and implementation of technical &amp; organisational measures.
          </p>
        </div>
      )}
    </div>
  );
}
