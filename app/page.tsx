import { dashboardMetrics, sampleConsents, sampleRightsRequests, sampleBreaches, dpdpChecklist } from '@/lib/data';
import {
  Shield, Database, Users, AlertTriangle, CheckCircle,
  Clock, XCircle, FileText, ArrowRight, TrendingUp,
  Activity, Zap, ArrowUpRight
} from 'lucide-react';
import Link from 'next/link';

export default function Dashboard() {
  const m = dashboardMetrics;

  const complianceSections = ['Consent Framework', 'Data Fiduciary Obligations', "Children's Data", 'Data Principal Rights'];
  const sectionScores = complianceSections.map(section => {
    const items = dpdpChecklist.filter(i => i.section === section);
    const score = items.reduce((acc, i) => {
      if (i.status === 'compliant') return acc + 1;
      if (i.status === 'partial') return acc + 0.5;
      return acc;
    }, 0);
    return { section, score: Math.round((score / items.length) * 100) };
  });

  const recentBreaches = sampleBreaches.filter(b => b.status !== 'closed').slice(0, 2);
  const pendingRequests = sampleRightsRequests.filter(r => r.status === 'pending' || r.status === 'in_review').slice(0, 3);

  const compliantCount = dpdpChecklist.filter(i => i.status === 'compliant').length;
  const partialCount = dpdpChecklist.filter(i => i.status === 'partial').length;
  const nonCompliantCount = dpdpChecklist.filter(i => i.status === 'non_compliant').length;

  return (
    <div>
      {/* Page header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-semibold uppercase tracking-widest" style={{ color: '#0ea5e9' }}>DPDP Act 2023</span>
            <span className="w-1 h-1 rounded-full bg-slate-300" />
            <span className="text-xs text-slate-400">Last updated: {m.lastAssessmentDate}</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Compliance Dashboard</h1>
          <p className="text-slate-500 text-sm mt-1">Monitor your organisation&apos;s DPDP compliance posture in real time</p>
        </div>
        <Link href="/scanner"
          className="flex items-center gap-2 text-sm font-semibold px-4 py-2.5 rounded-xl transition-all"
          style={{ background: 'linear-gradient(135deg, #0ea5e9, #0284c7)', color: '#fff', boxShadow: '0 2px 8px rgba(14,165,233,0.3)' }}>
          <Zap className="w-4 h-4" />
          Run GAP Scan
        </Link>
      </div>

      {/* Compliance Score Banner */}
      <div className="rounded-2xl p-6 mb-6 overflow-hidden relative"
        style={{ background: 'linear-gradient(135deg, #0c1322 0%, #1a2744 60%, #0c1f3f 100%)' }}>
        {/* Background decorative circles */}
        <div className="absolute top-0 right-0 w-64 h-64 rounded-full opacity-5"
          style={{ background: 'radial-gradient(circle, #0ea5e9 0%, transparent 70%)', transform: 'translate(30%, -30%)' }} />
        <div className="absolute bottom-0 left-1/2 w-32 h-32 rounded-full opacity-5"
          style={{ background: 'radial-gradient(circle, #38bdf8 0%, transparent 70%)', transform: 'translate(-50%, 40%)' }} />

        <div className="relative flex items-center justify-between gap-8">
          {/* Score */}
          <div className="flex-1">
            <div className="text-sm font-medium mb-2" style={{ color: 'rgba(148,163,184,0.8)' }}>Overall Compliance Score</div>
            <div className="flex items-end gap-4 mb-4">
              <span className="text-6xl font-black text-white tracking-tight">{m.complianceScore}<span className="text-3xl" style={{ color: 'rgba(255,255,255,0.4)' }}>%</span></span>
              <div className="flex items-center gap-1.5 mb-2 px-2.5 py-1 rounded-lg"
                style={{ background: 'rgba(34,197,94,0.15)', border: '1px solid rgba(34,197,94,0.25)' }}>
                <TrendingUp className="w-3.5 h-3.5" style={{ color: '#4ade80' }} />
                <span className="text-xs font-semibold" style={{ color: '#4ade80' }}>+4% this month</span>
              </div>
            </div>
            {/* Progress bar */}
            <div className="h-2 rounded-full overflow-hidden mb-2" style={{ background: 'rgba(255,255,255,0.08)' }}>
              <div className="h-full rounded-full transition-all duration-700"
                style={{
                  width: `${m.complianceScore}%`,
                  background: 'linear-gradient(90deg, #0ea5e9, #38bdf8)'
                }} />
            </div>
            <div className="text-xs" style={{ color: 'rgba(148,163,184,0.6)' }}>Based on {dpdpChecklist.length} DPDP Act requirements</div>
          </div>

          {/* Stats pills */}
          <div className="flex flex-col gap-2.5">
            {[
              { label: 'Compliant', val: compliantCount, color: '#4ade80', bg: 'rgba(34,197,94,0.1)', border: 'rgba(34,197,94,0.2)' },
              { label: 'Partial', val: partialCount, color: '#fbbf24', bg: 'rgba(251,191,36,0.1)', border: 'rgba(251,191,36,0.2)' },
              { label: 'Non-Compliant', val: nonCompliantCount, color: '#f87171', bg: 'rgba(248,113,113,0.1)', border: 'rgba(248,113,113,0.2)' },
            ].map(({ label, val, color, bg, border }) => (
              <div key={label} className="flex items-center gap-3 px-4 py-2.5 rounded-xl"
                style={{ background: bg, border: `1px solid ${border}`, minWidth: '160px' }}>
                <span className="text-2xl font-bold" style={{ color }}>{val}</span>
                <span className="text-sm" style={{ color: 'rgba(148,163,184,0.7)' }}>{label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Active Consents', value: m.activeConsents, sub: `of ${m.totalConsents} total`, icon: Shield, color: '#0ea5e9', bg: 'rgba(14,165,233,0.08)', link: '/consent' },
          { label: 'Pending Requests', value: m.pendingRightsRequests, sub: `${m.overdueRequests} overdue`, icon: Users, color: '#f59e0b', bg: 'rgba(245,158,11,0.08)', link: '/rights' },
          { label: 'Open Breaches', value: m.openBreaches, sub: `${m.criticalBreaches} critical`, icon: AlertTriangle, color: '#ef4444', bg: 'rgba(239,68,68,0.08)', link: '/breaches' },
          { label: 'Data Assets', value: m.dataAssets, sub: 'In inventory', icon: Database, color: '#22c55e', bg: 'rgba(34,197,94,0.08)', link: '/inventory' },
        ].map(({ label, value, sub, icon: Icon, color, bg, link }) => (
          <Link key={label} href={link}
            className="group rounded-2xl p-5 transition-all hover:-translate-y-0.5"
            style={{
              background: 'var(--card-bg)',
              border: '1px solid var(--card-border)',
              boxShadow: 'var(--card-shadow)',
            }}
            onMouseEnter={e => (e.currentTarget as HTMLElement).style.boxShadow = 'var(--card-shadow-hover)'}
            onMouseLeave={e => (e.currentTarget as HTMLElement).style.boxShadow = 'var(--card-shadow)'}
          >
            <div className="flex items-start justify-between">
              <div>
                <div className="text-xs font-semibold uppercase tracking-wide mb-2" style={{ color: '#94a3b8' }}>{label}</div>
                <div className="text-3xl font-black mb-1" style={{ color: '#0f172a' }}>{value}</div>
                <div className="text-xs" style={{ color: '#94a3b8' }}>{sub}</div>
              </div>
              <div className="w-11 h-11 rounded-xl flex items-center justify-center"
                style={{ background: bg }}>
                <Icon className="w-5 h-5" style={{ color }} />
              </div>
            </div>
            {/* Hover arrow */}
            <div className="flex items-center gap-1 mt-4 text-xs font-semibold transition-all opacity-0 group-hover:opacity-100" style={{ color }}>
              View details <ArrowUpRight className="w-3.5 h-3.5" />
            </div>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-5 mb-5">
        {/* Section Compliance */}
        <div className="rounded-2xl p-5"
          style={{ background: 'var(--card-bg)', border: '1px solid var(--card-border)', boxShadow: 'var(--card-shadow)' }}>
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="font-bold text-slate-900 text-sm">Section-wise Compliance</h2>
              <p className="text-xs text-slate-400 mt-0.5">DPDP Act 2023 framework coverage</p>
            </div>
            <Link href="/checklist"
              className="flex items-center gap-1 text-xs font-semibold transition-colors hover:opacity-80"
              style={{ color: '#0ea5e9' }}>
              View all <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="space-y-4">
            {sectionScores.map(({ section, score }) => {
              const color = score >= 80 ? '#22c55e' : score >= 50 ? '#f59e0b' : '#ef4444';
              const bgColor = score >= 80 ? 'rgba(34,197,94,0.06)' : score >= 50 ? 'rgba(245,158,11,0.06)' : 'rgba(239,68,68,0.06)';
              return (
                <div key={section} className="p-3 rounded-xl" style={{ background: bgColor }}>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="font-medium text-slate-700 text-xs">{section}</span>
                    <span className="font-bold text-xs" style={{ color }}>{score}%</span>
                  </div>
                  <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(0,0,0,0.06)' }}>
                    <div className="h-full rounded-full transition-all duration-500"
                      style={{ width: `${score}%`, background: color }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Consent Breakdown */}
        <div className="rounded-2xl p-5"
          style={{ background: 'var(--card-bg)', border: '1px solid var(--card-border)', boxShadow: 'var(--card-shadow)' }}>
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="font-bold text-slate-900 text-sm">Consent Status Breakdown</h2>
              <p className="text-xs text-slate-400 mt-0.5">Current consent record distribution</p>
            </div>
            <Link href="/consent"
              className="flex items-center gap-1 text-xs font-semibold transition-colors hover:opacity-80"
              style={{ color: '#0ea5e9' }}>
              Manage <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="space-y-2.5">
            {[
              { label: 'Active', count: sampleConsents.filter(c => c.status === 'active').length, color: '#22c55e', bg: 'rgba(34,197,94,0.08)', border: 'rgba(34,197,94,0.15)' },
              { label: 'Withdrawn', count: sampleConsents.filter(c => c.status === 'withdrawn').length, color: '#ef4444', bg: 'rgba(239,68,68,0.08)', border: 'rgba(239,68,68,0.15)' },
              { label: 'Expired', count: sampleConsents.filter(c => c.status === 'expired').length, color: '#94a3b8', bg: 'rgba(148,163,184,0.08)', border: 'rgba(148,163,184,0.15)' },
              { label: 'Pending', count: sampleConsents.filter(c => c.status === 'pending').length, color: '#f59e0b', bg: 'rgba(245,158,11,0.08)', border: 'rgba(245,158,11,0.15)' },
            ].map(({ label, count, color, bg, border }) => (
              <div key={label} className="flex items-center justify-between p-3 rounded-xl"
                style={{ background: bg, border: `1px solid ${border}` }}>
                <div className="flex items-center gap-2.5">
                  <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: color, boxShadow: `0 0 4px ${color}` }} />
                  <span className="text-sm font-medium text-slate-700">{label}</span>
                </div>
                <span className="text-sm font-bold" style={{ color }}>{count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-5 mb-5">
        {/* Pending Rights Requests */}
        <div className="rounded-2xl p-5"
          style={{ background: 'var(--card-bg)', border: '1px solid var(--card-border)', boxShadow: 'var(--card-shadow)' }}>
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="font-bold text-slate-900 text-sm">Pending Rights Requests</h2>
              <p className="text-xs text-slate-400 mt-0.5">Action required</p>
            </div>
            <Link href="/rights"
              className="flex items-center gap-1 text-xs font-semibold hover:opacity-80"
              style={{ color: '#0ea5e9' }}>
              View all <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="space-y-2.5">
            {pendingRequests.map(req => (
              <div key={req.id} className="flex items-start gap-3 p-3.5 rounded-xl"
                style={{ background: '#f8fafc', border: '1px solid rgba(15,23,42,0.06)' }}>
                <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{ background: 'rgba(245,158,11,0.1)' }}>
                  <Clock className="w-4 h-4" style={{ color: '#f59e0b' }} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold text-slate-800 truncate">{req.dataSubject}</div>
                  <div className="text-xs text-slate-400 mt-0.5">{req.requestType.replace('_', ' ').toUpperCase()} · Due: {req.dueDate}</div>
                </div>
                <span className="text-xs px-2 py-0.5 rounded-full font-semibold flex-shrink-0"
                  style={{
                    background: req.status === 'in_review' ? 'rgba(14,165,233,0.1)' : 'rgba(245,158,11,0.1)',
                    color: req.status === 'in_review' ? '#0ea5e9' : '#f59e0b',
                    border: req.status === 'in_review' ? '1px solid rgba(14,165,233,0.2)' : '1px solid rgba(245,158,11,0.2)',
                  }}>
                  {req.status === 'in_review' ? 'In Review' : 'Pending'}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Active Breaches */}
        <div className="rounded-2xl p-5"
          style={{ background: 'var(--card-bg)', border: '1px solid var(--card-border)', boxShadow: 'var(--card-shadow)' }}>
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="font-bold text-slate-900 text-sm">Active Breaches</h2>
              <p className="text-xs text-slate-400 mt-0.5">Requires immediate attention</p>
            </div>
            <Link href="/breaches"
              className="flex items-center gap-1 text-xs font-semibold hover:opacity-80"
              style={{ color: '#0ea5e9' }}>
              View all <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="space-y-2.5">
            {recentBreaches.map(breach => (
              <div key={breach.id} className="p-3.5 rounded-xl"
                style={{ background: '#f8fafc', border: '1px solid rgba(15,23,42,0.06)' }}>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold text-slate-800 truncate">{breach.title}</div>
                    <div className="text-xs text-slate-400 mt-0.5">{breach.affectedRecords.toLocaleString()} records · {breach.discoveredAt}</div>
                  </div>
                  <span className="text-xs px-2 py-0.5 rounded-full font-bold flex-shrink-0"
                    style={{
                      background: breach.severity === 'critical' ? 'rgba(239,68,68,0.1)' : 'rgba(249,115,22,0.1)',
                      color: breach.severity === 'critical' ? '#ef4444' : '#f97316',
                      border: breach.severity === 'critical' ? '1px solid rgba(239,68,68,0.2)' : '1px solid rgba(249,115,22,0.2)',
                    }}>
                    {breach.severity.toUpperCase()}
                  </span>
                </div>
                <div>
                  {breach.notifiedDPB
                    ? <span className="text-xs flex items-center gap-1 font-medium" style={{ color: '#22c55e' }}>
                        <CheckCircle className="w-3 h-3" /> DPB Notified
                      </span>
                    : <span className="text-xs flex items-center gap-1 font-medium" style={{ color: '#ef4444' }}>
                        <XCircle className="w-3 h-3" /> DPB Notification Pending
                      </span>
                  }
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="rounded-2xl p-5"
        style={{ background: 'var(--card-bg)', border: '1px solid var(--card-border)', boxShadow: 'var(--card-shadow)' }}>
        <div className="mb-5">
          <h2 className="font-bold text-slate-900 text-sm">Quick Actions</h2>
          <p className="text-xs text-slate-400 mt-0.5">Common compliance tasks</p>
        </div>
        <div className="grid grid-cols-4 gap-3">
          {[
            { label: 'Log New Consent', href: '/consent', icon: Shield, color: '#0ea5e9', bg: 'rgba(14,165,233,0.08)', border: 'rgba(14,165,233,0.15)' },
            { label: 'Handle Rights Request', href: '/rights', icon: Users, color: '#8b5cf6', bg: 'rgba(139,92,246,0.08)', border: 'rgba(139,92,246,0.15)' },
            { label: 'Report a Breach', href: '/breaches', icon: AlertTriangle, color: '#ef4444', bg: 'rgba(239,68,68,0.08)', border: 'rgba(239,68,68,0.15)' },
            { label: 'Generate Privacy Notice', href: '/privacy-notice', icon: FileText, color: '#22c55e', bg: 'rgba(34,197,94,0.08)', border: 'rgba(34,197,94,0.15)' },
          ].map(({ label, href, icon: Icon, color, bg, border }) => (
            <Link key={label} href={href}
              className="flex flex-col items-center gap-3 p-4 rounded-xl transition-all group hover:-translate-y-0.5"
              style={{ background: bg, border: `1px solid ${border}` }}>
              <div className="w-11 h-11 rounded-xl flex items-center justify-center"
                style={{ background: 'white', boxShadow: '0 1px 3px rgba(15,23,42,0.08)' }}>
                <Icon className="w-5 h-5" style={{ color }} />
              </div>
              <span className="text-xs font-semibold text-center leading-tight text-slate-600 group-hover:text-slate-900 transition-colors">{label}</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
