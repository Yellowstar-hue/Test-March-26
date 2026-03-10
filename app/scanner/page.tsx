'use client';

import { useState, useRef } from 'react';
import {
  Search, Shield, FileText, Scale, Lock, Users, User, Clock,
  Baby, Globe, CheckCircle, XCircle, AlertCircle, ChevronDown,
  ChevronUp, Info, AlertTriangle, ExternalLink, Loader2,
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
    case 'Excellent':   return { bg: 'bg-green-50',  text: 'text-green-700',  border: 'border-green-200',  badge: 'bg-green-100 text-green-700',  hex: '#16a34a' };
    case 'Good':        return { bg: 'bg-blue-50',   text: 'text-blue-700',   border: 'border-blue-200',   badge: 'bg-blue-100 text-blue-700',    hex: '#2563eb' };
    case 'Moderate':    return { bg: 'bg-amber-50',  text: 'text-amber-700',  border: 'border-amber-200',  badge: 'bg-amber-100 text-amber-700',  hex: '#d97706' };
    case 'Needs Improvement': return { bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-200', badge: 'bg-orange-100 text-orange-700', hex: '#ea580c' };
    default:            return { bg: 'bg-red-50',    text: 'text-red-700',    border: 'border-red-200',    badge: 'bg-red-100 text-red-700',      hex: '#dc2626' };
  }
}

function severityConfig(s: string) {
  switch (s) {
    case 'Critical': return { bg: 'bg-red-50', text: 'text-red-700', badge: 'bg-red-100 text-red-700', dot: 'bg-red-500' };
    case 'High':     return { bg: 'bg-orange-50', text: 'text-orange-700', badge: 'bg-orange-100 text-orange-700', dot: 'bg-orange-500' };
    case 'Medium':   return { bg: 'bg-amber-50', text: 'text-amber-700', badge: 'bg-amber-100 text-amber-700', dot: 'bg-amber-500' };
    default:         return { bg: 'bg-blue-50', text: 'text-blue-700', badge: 'bg-blue-100 text-blue-700', dot: 'bg-blue-400' };
  }
}

// ---- Circular score gauge ----
function ScoreGauge({ score, max, level }: { score: number; max: number; level: string }) {
  const cfg = levelConfig(level);
  const radius = 70;
  const stroke = 14;
  const circ = 2 * Math.PI * radius;
  const pct = Math.min(score / max, 1);
  const dash = circ * pct;
  const size = (radius + stroke) * 2;

  return (
    <div className="flex flex-col items-center">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle
          cx={size / 2} cy={size / 2} r={radius}
          fill="none" stroke="#e2e8f0" strokeWidth={stroke}
        />
        <circle
          cx={size / 2} cy={size / 2} r={radius}
          fill="none" stroke={cfg.hex} strokeWidth={stroke}
          strokeDasharray={`${dash} ${circ}`}
          strokeLinecap="round"
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
          style={{ transition: 'stroke-dasharray 0.6s ease' }}
        />
        <text x={size / 2} y={size / 2 - 6} textAnchor="middle" fontSize="36" fontWeight="bold" fill="#1e293b">{score}</text>
        <text x={size / 2} y={size / 2 + 16} textAnchor="middle" fontSize="13" fill="#64748b">/ {max} pts</text>
      </svg>
      <span className={`mt-1 text-sm font-semibold px-3 py-1 rounded-full ${cfg.badge}`}>{level}</span>
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
  { id: 'grievance',  name: 'Grievance Redressal',        section: 'Section 13',    desc: 'Designated grievance officer and an accessible complaint mechanism for data principals', pts: 15, bonus: false },
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
    <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
      <button
        className="w-full flex items-center gap-4 px-5 py-4 text-left hover:bg-slate-50 transition-colors"
        onClick={() => setOpen(v => !v)}
      >
        <div className="w-10 h-10 rounded-lg bg-indigo-50 flex items-center justify-center flex-shrink-0">
          <CategoryIcon id={cat.id} className="w-5 h-5 text-indigo-600" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-semibold text-slate-800 text-sm">{cat.name}</span>
            {cat.isBonus && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-purple-100 text-purple-700 font-medium">Bonus</span>
            )}
            <span className="text-xs text-slate-400">{cat.dpdpSection}</span>
          </div>
          <div className="mt-1.5 flex items-center gap-3">
            <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden max-w-48">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{ width: `${pct}%`, backgroundColor: color }}
              />
            </div>
            <span className="text-xs font-bold" style={{ color }}>{cat.score}/{cat.maxScore}</span>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          {cat.status === 'pass' && <CheckCircle className="w-4 h-4 text-green-500" />}
          {cat.status === 'partial' && <AlertCircle className="w-4 h-4 text-amber-500" />}
          {cat.status === 'fail' && <XCircle className="w-4 h-4 text-red-500" />}
          {open ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
        </div>
      </button>

      {open && (
        <div className="px-5 pb-4 border-t border-slate-100 pt-3">
          <p className="text-sm text-slate-500 mb-3">{cat.description}</p>
          <div className="space-y-2">
            {cat.checks.map((chk, i) => (
              <div key={i} className={`flex items-start gap-3 p-3 rounded-lg ${chk.found ? 'bg-green-50' : 'bg-red-50'}`}>
                {chk.found
                  ? <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                  : <XCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />}
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-slate-700">{chk.label}</div>
                  <div className={`text-xs mt-0.5 ${chk.found ? 'text-green-600' : 'text-red-600'}`}>{chk.detail}</div>
                </div>
                <span className={`text-xs font-bold flex-shrink-0 ${chk.found ? 'text-green-600' : 'text-slate-400'}`}>
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
        className="border-b border-slate-100 hover:bg-slate-50 cursor-pointer transition-colors"
        onClick={() => setOpen(v => !v)}
      >
        <td className="px-4 py-3 text-sm text-slate-500 font-mono">{index + 1}</td>
        <td className="px-4 py-3">
          <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full ${cfg.badge}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
            {gap.severity}
          </span>
        </td>
        <td className="px-4 py-3 text-sm font-medium text-slate-700">{gap.gap}</td>
        <td className="px-4 py-3 text-xs text-slate-500">{gap.category}</td>
        <td className="px-4 py-3 text-xs font-mono text-indigo-600">{gap.dpdpSection}</td>
        <td className="px-4 py-3">
          {open ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
        </td>
      </tr>
      {open && (
        <tr className="bg-amber-50">
          <td colSpan={6} className="px-4 py-3">
            <div className="flex gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
              <div>
                <div className="text-xs font-semibold text-amber-700 mb-0.5">Recommended Action</div>
                <div className="text-sm text-amber-900">{gap.recommendation}</div>
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

  return (
    <div className="max-w-5xl mx-auto">

      {/* ---- Hero ---- */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 bg-indigo-50 text-indigo-700 text-xs font-semibold px-3 py-1.5 rounded-full mb-4 border border-indigo-100">
          <Shield className="w-3.5 h-3.5" />
          Free DPDP Readiness Tool
        </div>
        <h1 className="text-3xl font-bold text-slate-800 mb-3">
          DPDP Compliance <span className="text-indigo-600">GAP Assessment</span>
        </h1>
        <p className="text-slate-500 max-w-2xl mx-auto text-base leading-relaxed">
          Instantly analyse your website against India&apos;s{' '}
          <span className="font-semibold text-slate-700">Digital Personal Data Protection Act 2023</span>.
          Receive a readiness score, identify compliance gaps, and get actionable remediation guidance.
        </p>
      </div>

      {/* ---- Scan form ---- */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm mb-10">
        <form onSubmit={handleScan} className="space-y-3">
          <div className="flex gap-3">
            <div className="flex-1 relative">
              <Globe className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={domain}
                onChange={e => setDomain(e.target.value)}
                placeholder="Enter website URL (e.g., example.com or https://example.com)"
                className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-indigo-400 transition"
                disabled={scanning}
              />
            </div>
            <button
              type="submit"
              disabled={scanning || !domain.trim()}
              className="flex items-center gap-2 bg-indigo-600 text-white px-6 py-3 rounded-xl text-sm font-semibold hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {scanning ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Analysing…</>
              ) : (
                <><Search className="w-4 h-4" /> Run Assessment</>
              )}
            </button>
          </div>
          <div className="relative">
            <svg className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="Email address (optional — receive a copy of your report)"
              className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-indigo-400 transition"
              disabled={scanning}
            />
          </div>
        </form>

        {error && (
          <div className="mt-4 flex items-start gap-2 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl p-3">
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            {error}
          </div>
        )}

        {scanning && (
          <div className="mt-5">
            <div className="flex items-center justify-between text-xs text-slate-500 mb-1.5">
              <span>Fetching and analysing website…</span>
              <span>Please wait</span>
            </div>
            <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
              <div className="h-full bg-indigo-500 rounded-full animate-pulse" style={{ width: '70%' }} />
            </div>
            <div className="flex flex-wrap gap-x-6 gap-y-1 mt-3 text-xs text-slate-400">
              {['Fetching homepage', 'Locating privacy notice', 'Checking consent mechanisms', 'Analysing security headers', 'Generating GAP report'].map((s, i) => (
                <span key={i} className="flex items-center gap-1">
                  <Loader2 className="w-3 h-3 animate-spin" />
                  {s}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ---- What We Assess ---- */}
      {!result && (
        <div className="mb-10">
          <h2 className="text-xl font-bold text-slate-800 text-center mb-2">What We Assess</h2>
          <p className="text-slate-500 text-sm text-center mb-6">7 scored categories (100 pts) + 2 bonus checks — aligned to DPDP Act 2023 obligations</p>
          <div className="grid grid-cols-3 gap-4">
            {ASSESS_ITEMS.map(item => (
              <div key={item.id} className="bg-white border border-slate-200 rounded-xl p-4 hover:shadow-sm transition-shadow">
                <div className="w-10 h-10 bg-indigo-50 rounded-lg flex items-center justify-center mb-3">
                  <CategoryIcon id={item.id} className="w-5 h-5 text-indigo-600" />
                </div>
                <div className="flex items-start justify-between gap-1 mb-1">
                  <h3 className="text-sm font-semibold text-slate-800 leading-tight">{item.name}</h3>
                </div>
                <p className="text-xs text-slate-500 leading-relaxed mb-3">{item.desc}</p>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-indigo-600 font-medium">{item.section}</span>
                  {item.bonus
                    ? <span className="text-xs px-2 py-0.5 rounded-full bg-purple-100 text-purple-700 font-medium">Bonus +{item.pts}</span>
                    : <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-medium">{item.pts} pts</span>
                  }
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ---- Results ---- */}
      {result && cfg && (
        <div ref={resultRef} className="space-y-6">

          {/* Fetch warning */}
          {result.fetchError && (
            <div className="flex items-start gap-2 bg-amber-50 border border-amber-200 text-amber-800 text-sm rounded-xl p-4">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold">Partial scan: </span>
                {result.fetchError} — results may be incomplete. Some websites block automated scanners.
              </div>
            </div>
          )}

          {/* Score overview */}
          <div className={`bg-white border ${cfg.border} rounded-2xl p-6`}>
            <div className="flex flex-col sm:flex-row items-center gap-8">
              <ScoreGauge score={result.overallScore} max={result.maxBaseScore} level={result.complianceLevel} />

              <div className="flex-1">
                <div className="flex items-center gap-3 mb-1">
                  <h2 className="text-xl font-bold text-slate-800">Readiness Assessment Complete</h2>
                </div>
                <div className="flex items-center gap-2 mb-4">
                  <ExternalLink className="w-4 h-4 text-slate-400" />
                  <a href={result.url} target="_blank" rel="noopener noreferrer" className="text-indigo-600 text-sm hover:underline font-medium">{result.domain}</a>
                  <span className="text-slate-300">•</span>
                  <span className="text-xs text-slate-400">Scanned in {(result.durationMs / 1000).toFixed(1)}s</span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="bg-slate-50 rounded-xl p-3 text-center">
                    <div className="text-2xl font-bold text-slate-800">{result.overallScore}</div>
                    <div className="text-xs text-slate-500">Base Score</div>
                    <div className="text-xs text-slate-400">of {result.maxBaseScore}</div>
                  </div>
                  <div className="bg-purple-50 rounded-xl p-3 text-center">
                    <div className="text-2xl font-bold text-purple-700">+{result.bonusScore}</div>
                    <div className="text-xs text-slate-500">Bonus Points</div>
                    <div className="text-xs text-slate-400">of 15</div>
                  </div>
                  <div className="bg-red-50 rounded-xl p-3 text-center">
                    <div className="text-2xl font-bold text-red-600">{criticalGaps}</div>
                    <div className="text-xs text-slate-500">Critical Gaps</div>
                    <div className="text-xs text-slate-400">immediate action</div>
                  </div>
                  <div className="bg-orange-50 rounded-xl p-3 text-center">
                    <div className="text-2xl font-bold text-orange-600">{highGaps}</div>
                    <div className="text-xs text-slate-500">High Gaps</div>
                    <div className="text-xs text-slate-400">priority action</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
            <div className="flex border-b border-slate-200">
              {([
                { key: 'categories', label: `Category Breakdown`, count: result.categories.length },
                { key: 'gaps', label: 'GAP Analysis', count: result.gaps.length },
                { key: 'headers', label: 'Security Headers', count: result.securityHeaders.length },
              ] as const).map(tab => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`flex-1 py-3.5 text-sm font-medium transition-colors flex items-center justify-center gap-2 ${
                    activeTab === tab.key
                      ? 'text-indigo-700 border-b-2 border-indigo-600 bg-indigo-50/50'
                      : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  {tab.label}
                  <span className={`text-xs px-1.5 py-0.5 rounded-full font-semibold ${
                    activeTab === tab.key ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-100 text-slate-500'
                  }`}>{tab.count}</span>
                </button>
              ))}
            </div>

            {/* Category Breakdown */}
            {activeTab === 'categories' && (
              <div className="p-5 space-y-3">
                {/* Summary bar */}
                <div className="flex gap-4 text-xs text-slate-500 mb-4">
                  {[
                    { label: 'Pass', count: result.categories.filter(c => c.status === 'pass').length, cls: 'text-green-600' },
                    { label: 'Partial', count: result.categories.filter(c => c.status === 'partial').length, cls: 'text-amber-600' },
                    { label: 'Fail', count: result.categories.filter(c => c.status === 'fail').length, cls: 'text-red-600' },
                  ].map(s => (
                    <span key={s.label} className={`flex items-center gap-1 font-medium ${s.cls}`}>
                      {s.label}: {s.count}
                    </span>
                  ))}
                  <span className="text-slate-300">•</span>
                  <span>Click any category to expand checks</span>
                </div>
                {result.categories.map(cat => <CategoryCard key={cat.id} cat={cat} />)}
              </div>
            )}

            {/* GAP Analysis */}
            {activeTab === 'gaps' && (
              <div className="p-5">
                {result.gaps.length === 0 ? (
                  <div className="text-center py-12">
                    <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-3" />
                    <div className="text-lg font-semibold text-slate-800">No gaps detected</div>
                    <div className="text-slate-500 text-sm mt-1">Your website passed all assessed DPDP compliance checks</div>
                  </div>
                ) : (
                  <>
                    <div className="flex items-center justify-between mb-4">
                      <p className="text-sm text-slate-500">
                        <span className="font-semibold text-slate-700">{result.gaps.length} compliance gaps</span> identified — click any row to see recommended remediation
                      </p>
                      <div className="flex gap-2">
                        {(['Critical', 'High', 'Medium', 'Low'] as const).map(s => {
                          const n = result.gaps.filter(g => g.severity === s).length;
                          if (!n) return null;
                          const c = severityConfig(s);
                          return (
                            <span key={s} className={`text-xs px-2 py-0.5 rounded-full font-medium ${c.badge}`}>{n} {s}</span>
                          );
                        })}
                      </div>
                    </div>
                    <div className="overflow-x-auto rounded-xl border border-slate-200">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="bg-slate-50 text-xs text-slate-500 uppercase tracking-wide">
                            <th className="px-4 py-3 text-left font-semibold w-8">#</th>
                            <th className="px-4 py-3 text-left font-semibold w-28">Severity</th>
                            <th className="px-4 py-3 text-left font-semibold">Gap Identified</th>
                            <th className="px-4 py-3 text-left font-semibold">Category</th>
                            <th className="px-4 py-3 text-left font-semibold">DPDP Reference</th>
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
                <p className="text-sm text-slate-500 mb-4">
                  HTTP response headers detected on <span className="font-medium text-slate-700">{result.domain}</span>. These headers form part of the technical security measures required under <span className="font-medium">DPDP Section 8</span>.
                </p>
                <div className="space-y-2">
                  {result.securityHeaders.map((h: SecurityHeader) => (
                    <div key={h.header} className={`flex items-start gap-4 p-3.5 rounded-xl border ${h.present ? 'border-green-200 bg-green-50' : 'border-red-100 bg-red-50'}`}>
                      {h.present
                        ? <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                        : <XCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-mono text-sm font-semibold text-slate-700">{h.header}</span>
                          {h.present && h.value && (
                            <span className="font-mono text-xs text-slate-400 truncate max-w-xs">{h.value}</span>
                          )}
                        </div>
                        <div className="text-xs text-slate-500 mt-0.5">{h.description}</div>
                      </div>
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full flex-shrink-0 ${h.present ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>
                        {h.present ? 'Present' : 'Missing'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* CTA */}
          <div className="bg-gradient-to-r from-indigo-600 to-indigo-700 rounded-2xl p-6 text-white flex items-center justify-between gap-4">
            <div>
              <div className="font-bold text-lg mb-1">Need help closing these gaps?</div>
              <div className="text-indigo-200 text-sm">Use the DPDP Comply platform to manage consents, rights requests, breach incidents, and your full compliance programme.</div>
            </div>
            <div className="flex gap-3 flex-shrink-0">
              <button
                onClick={() => { setResult(null); setDomain(''); setEmail(''); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                className="bg-white/20 hover:bg-white/30 text-white text-sm font-medium px-4 py-2 rounded-lg transition"
              >
                Scan Another
              </button>
            </div>
          </div>

          {/* Disclaimer */}
          <p className="text-xs text-slate-400 text-center pb-4">
            This automated assessment provides indicative readiness signals based on publicly accessible content and HTTP headers.
            It does not constitute legal advice. A full DPDP compliance programme requires legal review, internal audits, and implementation of technical & organisational measures.
          </p>
        </div>
      )}
    </div>
  );
}
