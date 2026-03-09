'use client';
import { useState } from 'react';
import { sampleBreaches } from '@/lib/data';
import { DataBreach } from '@/lib/types';
import StatusBadge, { getBreachSeverityBadge, getBreachStatusBadge } from '@/components/StatusBadge';
import { AlertTriangle, Plus, CheckCircle, XCircle, Clock, Info, Shield } from 'lucide-react';
import { categoryLabels } from '@/lib/data';

export default function BreachesPage() {
  const [breaches, setBreaches] = useState<DataBreach[]>(sampleBreaches);
  const [selected, setSelected] = useState<DataBreach | null>(null);
  const [showForm, setShowForm] = useState(false);

  const stats = {
    total: breaches.length,
    open: breaches.filter(b => b.status !== 'closed').length,
    critical: breaches.filter(b => b.severity === 'critical').length,
    notifiedDPB: breaches.filter(b => b.notifiedDPB).length,
    pendingNotification: breaches.filter(b => !b.notifiedDPB && b.status !== 'closed').length,
  };

  function markNotified(id: string) {
    const today = new Date().toISOString().split('T')[0];
    setBreaches(prev => prev.map(b => b.id === id
      ? { ...b, notifiedDPB: true, dpbNotificationDate: today, status: 'notified' }
      : b
    ));
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Breach Register</h1>
          <p className="text-slate-500 text-sm mt-1">Personal Data Breach Management — DPDP Act Section 8(6)</p>
        </div>
        <button onClick={() => setShowForm(true)} className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700">
          <Plus className="w-4 h-4" /> Report Breach
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-5 gap-4 mb-6">
        {[
          { label: 'Total Breaches', value: stats.total, bg: 'bg-slate-50', color: 'text-slate-800' },
          { label: 'Open', value: stats.open, bg: 'bg-orange-50', color: 'text-orange-700' },
          { label: 'Critical', value: stats.critical, bg: 'bg-red-50', color: 'text-red-700' },
          { label: 'DPB Notified', value: stats.notifiedDPB, bg: 'bg-green-50', color: 'text-green-700' },
          { label: 'Notification Pending', value: stats.pendingNotification, bg: 'bg-amber-50', color: 'text-amber-700' },
        ].map(({ label, value, bg, color }) => (
          <div key={label} className={`rounded-xl border border-slate-200 p-4 ${bg}`}>
            <div className="text-sm text-slate-500">{label}</div>
            <div className={`text-2xl font-bold ${color}`}>{value}</div>
          </div>
        ))}
      </div>

      {/* DPB Notification Alert */}
      {stats.pendingNotification > 0 && (
        <div className="bg-red-50 border border-red-300 rounded-lg p-4 mb-6 flex gap-3">
          <AlertTriangle className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
          <div className="text-sm text-red-800">
            <span className="font-bold">Action Required:</span> {stats.pendingNotification} breach(es) require Data Protection Board (DPB) notification.
            Under Section 8(6) of DPDP Act 2023, breaches must be reported to the DPB without delay. Failure to notify may attract penalties up to ₹250 crore.
          </div>
        </div>
      )}

      {/* Legal Reference */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 flex gap-3">
        <Info className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
        <div className="text-sm text-blue-800">
          <span className="font-semibold">DPDP Act 2023 — Section 8(6):</span> In the event of a personal data breach, notify the Data Protection Board and each affected Data Principal in such manner and form as may be prescribed.
          Notification must be made <span className="font-medium">without delay</span> (government to prescribe timelines).
        </div>
      </div>

      {/* Breach Cards */}
      <div className="space-y-4">
        {breaches.map(breach => {
          const severityBadge = getBreachSeverityBadge(breach.severity);
          const statusBadge = getBreachStatusBadge(breach.status);
          return (
            <div key={breach.id} className={`bg-white rounded-xl border p-5 ${
              breach.severity === 'critical' ? 'border-red-200' :
              breach.severity === 'high' ? 'border-orange-200' : 'border-slate-200'
            }`}>
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-slate-800">{breach.title}</h3>
                    <StatusBadge label={severityBadge.label} variant={severityBadge.variant} />
                    <StatusBadge label={statusBadge.label} variant={statusBadge.variant} />
                  </div>
                  <p className="text-sm text-slate-500 mb-3">{breach.description}</p>
                  <div className="grid grid-cols-4 gap-4 text-sm">
                    <div>
                      <div className="text-xs text-slate-400">Discovered</div>
                      <div className="font-medium text-slate-700">{breach.discoveredAt}</div>
                    </div>
                    <div>
                      <div className="text-xs text-slate-400">Affected Records</div>
                      <div className="font-medium text-slate-700">{breach.affectedRecords.toLocaleString()}</div>
                    </div>
                    <div>
                      <div className="text-xs text-slate-400">Reported By</div>
                      <div className="font-medium text-slate-700">{breach.reportedBy}</div>
                    </div>
                    <div>
                      <div className="text-xs text-slate-400">Data Types</div>
                      <div className="flex flex-wrap gap-1 mt-0.5">
                        {breach.affectedDataTypes.slice(0, 2).map(dt => (
                          <span key={dt} className="text-xs bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded">{categoryLabels[dt]}</span>
                        ))}
                        {breach.affectedDataTypes.length > 2 && <span className="text-xs text-slate-500">+{breach.affectedDataTypes.length - 2}</span>}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col gap-2 flex-shrink-0 min-w-[140px]">
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      {breach.notifiedDPB
                        ? <CheckCircle className="w-4 h-4 text-green-500" />
                        : <XCircle className="w-4 h-4 text-red-500" />}
                      <span className={`text-xs ${breach.notifiedDPB ? 'text-green-700' : 'text-red-700 font-medium'}`}>
                        DPB {breach.notifiedDPB ? `Notified ${breach.dpbNotificationDate}` : 'Not Notified'}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      {breach.notifiedDataPrincipals
                        ? <CheckCircle className="w-4 h-4 text-green-500" />
                        : <Clock className="w-4 h-4 text-amber-500" />}
                      <span className={`text-xs ${breach.notifiedDataPrincipals ? 'text-green-700' : 'text-amber-700'}`}>
                        Principals {breach.notifiedDataPrincipals ? 'Notified' : 'Pending'}
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-col gap-1.5 mt-2">
                    <button onClick={() => setSelected(breach)} className="text-xs text-indigo-600 border border-indigo-200 rounded-lg px-3 py-1.5 hover:bg-indigo-50">
                      View Details
                    </button>
                    {!breach.notifiedDPB && breach.status !== 'closed' && (
                      <button onClick={() => markNotified(breach.id)} className="text-xs text-white bg-red-600 rounded-lg px-3 py-1.5 hover:bg-red-700">
                        Mark DPB Notified
                      </button>
                    )}
                  </div>
                </div>
              </div>
              {breach.containmentMeasures && (
                <div className="mt-3 pt-3 border-t border-slate-100">
                  <span className="text-xs text-slate-400">Containment: </span>
                  <span className="text-xs text-slate-600">{breach.containmentMeasures}</span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Detail Modal */}
      {selected && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full p-6 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-slate-800">{selected.title}</h2>
              <button onClick={() => setSelected(null)} className="text-slate-400 hover:text-slate-600 text-xl">&times;</button>
            </div>
            <div className="grid grid-cols-2 gap-4 mb-4">
              {[
                { label: 'Breach ID', value: selected.id },
                { label: 'Severity', value: selected.severity.toUpperCase() },
                { label: 'Status', value: selected.status.replace('_', ' ').toUpperCase() },
                { label: 'Discovered', value: selected.discoveredAt },
                { label: 'Occurred', value: selected.occurredAt || 'Unknown' },
                { label: 'Affected Records', value: selected.affectedRecords.toLocaleString() },
                { label: 'Reported By', value: selected.reportedBy },
                { label: 'DPB Notified', value: selected.notifiedDPB ? `Yes — ${selected.dpbNotificationDate}` : 'No' },
                { label: 'Principals Notified', value: selected.notifiedDataPrincipals ? `Yes — ${selected.principalsNotificationDate}` : 'No' },
              ].map(({ label, value }) => (
                <div key={label} className="py-2 border-b border-slate-100">
                  <div className="text-xs text-slate-400">{label}</div>
                  <div className="text-sm font-medium text-slate-800 mt-0.5">{value}</div>
                </div>
              ))}
            </div>
            {[
              { label: 'Description', value: selected.description },
              { label: 'Root Cause', value: selected.rootCause },
              { label: 'Containment Measures', value: selected.containmentMeasures },
              { label: 'Remediation', value: selected.remediation },
            ].map(({ label, value }) => value ? (
              <div key={label} className="mb-3">
                <div className="text-xs text-slate-400 mb-1">{label}</div>
                <div className="text-sm text-slate-700 bg-slate-50 p-3 rounded-lg">{value}</div>
              </div>
            ) : null)}
            <div className="mt-2">
              <div className="text-xs text-slate-400 mb-2">Affected Data Types</div>
              <div className="flex flex-wrap gap-2">
                {selected.affectedDataTypes.map(dt => (
                  <span key={dt} className="text-xs bg-red-50 text-red-700 px-2 py-1 rounded-full">{categoryLabels[dt]}</span>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Report Breach Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-lg w-full p-6 max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-red-600" />
                <h2 className="text-lg font-bold text-slate-800">Report Data Breach</h2>
              </div>
              <button onClick={() => setShowForm(false)} className="text-slate-400 hover:text-slate-600 text-xl">&times;</button>
            </div>
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4 text-xs text-red-800">
              Under DPDP Act 2023, breaches must be reported to the Data Protection Board without delay.
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Breach Title *</label>
                <input type="text" className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-300" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Description *</label>
                <textarea rows={3} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-300" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Severity *</label>
                  <select className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm">
                    <option>Low</option><option>Medium</option><option>High</option><option>Critical</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Affected Records *</label>
                  <input type="number" className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-300" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Reported By *</label>
                <input type="text" className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-300" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Containment Measures Taken</label>
                <textarea rows={2} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none" />
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button onClick={() => setShowForm(false)} className="px-4 py-2 border border-slate-200 rounded-lg text-sm text-slate-600">Cancel</button>
              <button onClick={() => setShowForm(false)} className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700">Report Breach</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
