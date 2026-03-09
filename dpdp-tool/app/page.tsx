import { dashboardMetrics, sampleConsents, sampleRightsRequests, sampleBreaches, dpdpChecklist } from '@/lib/data';
import {
  Shield, Database, Users, AlertTriangle, CheckCircle,
  Clock, XCircle, FileText, ArrowRight
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

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-800">Compliance Dashboard</h1>
        <p className="text-slate-500 text-sm mt-1">DPDP Act 2023 — Overview &amp; Key Metrics • Last updated: {m.lastAssessmentDate}</p>
      </div>

      {/* Compliance Score Banner */}
      <div className="bg-gradient-to-r from-indigo-600 to-indigo-700 rounded-xl p-6 mb-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm font-medium text-indigo-200 mb-1">Overall Compliance Score</div>
            <div className="text-5xl font-bold">{m.complianceScore}%</div>
            <div className="text-indigo-200 text-sm mt-1">Based on {dpdpChecklist.length} DPDP Act requirements</div>
          </div>
          <div className="flex flex-col items-end gap-2">
            {[
              { label: 'Compliant', val: dpdpChecklist.filter(i => i.status === 'compliant').length },
              { label: 'Partial', val: dpdpChecklist.filter(i => i.status === 'partial').length },
              { label: 'Non-Compliant', val: dpdpChecklist.filter(i => i.status === 'non_compliant').length },
            ].map(({ label, val }) => (
              <div key={label} className="bg-white/10 rounded-lg px-4 py-1.5 text-center">
                <div className="text-xl font-bold">{val}</div>
                <div className="text-xs text-indigo-200">{label}</div>
              </div>
            ))}
          </div>
        </div>
        <div className="mt-4 bg-white/10 rounded-full h-2.5 overflow-hidden">
          <div className="bg-white rounded-full h-full" style={{ width: `${m.complianceScore}%` }} />
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Active Consents', value: m.activeConsents, sub: `of ${m.totalConsents} total`, icon: Shield, bg: 'bg-indigo-50', ic: 'text-indigo-600', link: '/consent' },
          { label: 'Pending Requests', value: m.pendingRightsRequests, sub: `${m.overdueRequests} overdue`, icon: Users, bg: 'bg-amber-50', ic: 'text-amber-600', link: '/rights' },
          { label: 'Open Breaches', value: m.openBreaches, sub: `${m.criticalBreaches} critical`, icon: AlertTriangle, bg: 'bg-red-50', ic: 'text-red-600', link: '/breaches' },
          { label: 'Data Assets', value: m.dataAssets, sub: 'In inventory', icon: Database, bg: 'bg-green-50', ic: 'text-green-600', link: '/inventory' },
        ].map(({ label, value, sub, icon: Icon, bg, ic, link }) => (
          <Link key={label} href={link} className="bg-white rounded-xl border border-slate-200 p-5 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between">
              <div>
                <div className="text-sm text-slate-500 mb-1">{label}</div>
                <div className="text-3xl font-bold text-slate-800">{value}</div>
                <div className="text-xs text-slate-400 mt-1">{sub}</div>
              </div>
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${bg}`}>
                <Icon className={`w-5 h-5 ${ic}`} />
              </div>
            </div>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-6 mb-6">
        {/* Section Compliance */}
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-slate-800">Section-wise Compliance</h2>
            <Link href="/checklist" className="text-xs text-indigo-600 hover:underline flex items-center gap-1">
              View all <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="space-y-3">
            {sectionScores.map(({ section, score }) => (
              <div key={section}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-slate-600">{section}</span>
                  <span className={`font-semibold ${score >= 80 ? 'text-green-600' : score >= 50 ? 'text-amber-600' : 'text-red-600'}`}>{score}%</span>
                </div>
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div className={`h-full rounded-full ${score >= 80 ? 'bg-green-500' : score >= 50 ? 'bg-amber-500' : 'bg-red-500'}`} style={{ width: `${score}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Consent Breakdown */}
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-slate-800">Consent Status Breakdown</h2>
            <Link href="/consent" className="text-xs text-indigo-600 hover:underline flex items-center gap-1">
              Manage <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="space-y-3">
            {[
              { label: 'Active', count: sampleConsents.filter(c => c.status === 'active').length, dot: 'bg-green-500', bg: 'bg-green-50', txt: 'text-green-700' },
              { label: 'Withdrawn', count: sampleConsents.filter(c => c.status === 'withdrawn').length, dot: 'bg-red-500', bg: 'bg-red-50', txt: 'text-red-700' },
              { label: 'Expired', count: sampleConsents.filter(c => c.status === 'expired').length, dot: 'bg-slate-400', bg: 'bg-slate-50', txt: 'text-slate-600' },
              { label: 'Pending', count: sampleConsents.filter(c => c.status === 'pending').length, dot: 'bg-amber-500', bg: 'bg-amber-50', txt: 'text-amber-700' },
            ].map(({ label, count, dot, bg, txt }) => (
              <div key={label} className={`flex items-center justify-between p-3 rounded-lg ${bg}`}>
                <div className="flex items-center gap-2">
                  <div className={`w-2.5 h-2.5 rounded-full ${dot}`} />
                  <span className="text-sm text-slate-700">{label}</span>
                </div>
                <span className={`text-sm font-bold ${txt}`}>{count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6 mb-6">
        {/* Pending Rights Requests */}
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-slate-800">Pending Rights Requests</h2>
            <Link href="/rights" className="text-xs text-indigo-600 hover:underline flex items-center gap-1">
              View all <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="space-y-3">
            {pendingRequests.map(req => (
              <div key={req.id} className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg">
                <Clock className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-slate-800 truncate">{req.dataSubject}</div>
                  <div className="text-xs text-slate-500">{req.requestType.replace('_', ' ').toUpperCase()} • Due: {req.dueDate}</div>
                </div>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${req.status === 'in_review' ? 'bg-blue-100 text-blue-700' : 'bg-amber-100 text-amber-700'}`}>
                  {req.status === 'in_review' ? 'In Review' : 'Pending'}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Active Breaches */}
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-slate-800">Active Breaches</h2>
            <Link href="/breaches" className="text-xs text-indigo-600 hover:underline flex items-center gap-1">
              View all <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="space-y-3">
            {recentBreaches.map(breach => (
              <div key={breach.id} className="p-3 bg-slate-50 rounded-lg">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-slate-800 truncate">{breach.title}</div>
                    <div className="text-xs text-slate-500">{breach.affectedRecords.toLocaleString()} records • {breach.discoveredAt}</div>
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium flex-shrink-0 ${
                    breach.severity === 'critical' ? 'bg-red-100 text-red-700' : 'bg-orange-100 text-orange-700'
                  }`}>{breach.severity.toUpperCase()}</span>
                </div>
                <div className="mt-2">
                  {breach.notifiedDPB
                    ? <span className="text-xs text-green-600 flex items-center gap-1"><CheckCircle className="w-3 h-3" />DPB Notified</span>
                    : <span className="text-xs text-red-600 flex items-center gap-1"><XCircle className="w-3 h-3" />DPB Notification Pending</span>
                  }
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl border border-slate-200 p-5">
        <h2 className="font-semibold text-slate-800 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-4 gap-3">
          {[
            { label: 'Log New Consent', href: '/consent', icon: Shield, bg: 'bg-indigo-100', ic: 'text-indigo-600' },
            { label: 'Handle Rights Request', href: '/rights', icon: Users, bg: 'bg-blue-100', ic: 'text-blue-600' },
            { label: 'Report a Breach', href: '/breaches', icon: AlertTriangle, bg: 'bg-red-100', ic: 'text-red-600' },
            { label: 'Generate Privacy Notice', href: '/privacy-notice', icon: FileText, bg: 'bg-green-100', ic: 'text-green-600' },
          ].map(({ label, href, icon: Icon, bg, ic }) => (
            <Link key={label} href={href}
              className="flex flex-col items-center gap-2 p-4 rounded-lg border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50 transition-colors text-center group"
            >
              <div className={`w-10 h-10 rounded-lg ${bg} flex items-center justify-center`}>
                <Icon className={`w-5 h-5 ${ic}`} />
              </div>
              <span className="text-xs font-medium text-slate-600 group-hover:text-indigo-700">{label}</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
