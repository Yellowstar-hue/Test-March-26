'use client';
import { useState } from 'react';
import { sampleRightsRequests } from '@/lib/data';
import { RightsRequest } from '@/lib/types';
import StatusBadge, { getRequestStatusBadge, getRequestTypeBadge } from '@/components/StatusBadge';
import { Users, Search, Plus, Clock, CheckCircle, AlertCircle, Info } from 'lucide-react';

export default function RightsPage() {
  const [requests, setRequests] = useState<RightsRequest[]>(sampleRightsRequests);
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selected, setSelected] = useState<RightsRequest | null>(null);
  const [showForm, setShowForm] = useState(false);

  const today = new Date().toISOString().split('T')[0];

  const filtered = requests.filter(r => {
    const matchSearch = r.dataSubject.toLowerCase().includes(search.toLowerCase()) ||
      r.email.toLowerCase().includes(search.toLowerCase());
    const matchType = filterType === 'all' || r.requestType === filterType;
    const matchStatus = filterStatus === 'all' || r.status === filterStatus;
    return matchSearch && matchType && matchStatus;
  });

  const stats = {
    total: requests.length,
    pending: requests.filter(r => r.status === 'pending').length,
    inReview: requests.filter(r => r.status === 'in_review').length,
    completed: requests.filter(r => r.status === 'completed').length,
    overdue: requests.filter(r => (r.status === 'pending' || r.status === 'in_review') && r.dueDate < today).length,
  };

  function markComplete(id: string) {
    setRequests(prev => prev.map(r => r.id === id
      ? { ...r, status: 'completed', resolvedAt: today, resolution: 'Request processed and fulfilled' }
      : r
    ));
  }

  const daysLeft = (dueDate: string) => {
    const diff = Math.ceil((new Date(dueDate).getTime() - Date.now()) / 86400000);
    return diff;
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Rights Requests</h1>
          <p className="text-slate-500 text-sm mt-1">Data Principal Rights — DPDP Act Sections 11–14</p>
        </div>
        <button onClick={() => setShowForm(true)} className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm hover:bg-indigo-700">
          <Plus className="w-4 h-4" /> New Request
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-5 gap-4 mb-6">
        {[
          { label: 'Total', value: stats.total, color: 'text-slate-800', bg: 'bg-slate-50' },
          { label: 'Pending', value: stats.pending, color: 'text-amber-700', bg: 'bg-amber-50' },
          { label: 'In Review', value: stats.inReview, color: 'text-blue-700', bg: 'bg-blue-50' },
          { label: 'Completed', value: stats.completed, color: 'text-green-700', bg: 'bg-green-50' },
          { label: 'Overdue', value: stats.overdue, color: 'text-red-700', bg: 'bg-red-50' },
        ].map(({ label, value, color, bg }) => (
          <div key={label} className={`rounded-xl border border-slate-200 p-4 ${bg}`}>
            <div className="text-sm text-slate-500">{label}</div>
            <div className={`text-2xl font-bold ${color}`}>{value}</div>
          </div>
        ))}
      </div>

      {/* Rights Reference */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <div className="flex gap-3">
          <Info className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
          <div className="text-sm text-blue-800">
            <span className="font-semibold">Data Principal Rights under DPDP Act 2023:</span>{' '}
            <span className="font-medium">S.11</span> Right of Access &nbsp;|&nbsp;
            <span className="font-medium">S.12</span> Right to Correction &amp; Erasure &nbsp;|&nbsp;
            <span className="font-medium">S.13</span> Right to Grievance Redressal &nbsp;|&nbsp;
            <span className="font-medium">S.14</span> Right of Nomination &nbsp;|&nbsp;
            <span className="font-medium">S.6(4)</span> Right to Withdraw Consent
            <br /><span className="text-blue-700">Requests must be acknowledged within 48 hours and resolved within 30 days.</span>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-3 mb-4">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input type="text" placeholder="Search by name or email..." value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300" />
        </div>
        <select value={filterType} onChange={e => setFilterType(e.target.value)}
          className="border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none">
          <option value="all">All Types</option>
          <option value="access">Data Access</option>
          <option value="correction">Correction</option>
          <option value="erasure">Erasure</option>
          <option value="nomination">Nomination</option>
          <option value="grievance">Grievance</option>
          <option value="withdrawal">Withdrawal</option>
        </select>
        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
          className="border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none">
          <option value="all">All Status</option>
          <option value="pending">Pending</option>
          <option value="in_review">In Review</option>
          <option value="completed">Completed</option>
          <option value="rejected">Rejected</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200">
              {['Request ID', 'Data Subject', 'Type', 'Submitted', 'Due Date', 'Status', 'Actions'].map(h => (
                <th key={h} className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-4 py-3">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map(req => {
              const statusBadge = getRequestStatusBadge(req.status);
              const typeBadge = getRequestTypeBadge(req.requestType);
              const dl = daysLeft(req.dueDate);
              const isOverdue = dl < 0 && req.status !== 'completed' && req.status !== 'rejected';
              return (
                <tr key={req.id} className={`border-t border-slate-100 hover:bg-slate-50 ${isOverdue ? 'bg-red-50/30' : ''}`}>
                  <td className="px-4 py-3 text-sm font-mono text-slate-500">{req.id}</td>
                  <td className="px-4 py-3">
                    <div className="text-sm font-medium text-slate-800">{req.dataSubject}</div>
                    <div className="text-xs text-slate-500">{req.email}</div>
                  </td>
                  <td className="px-4 py-3"><StatusBadge label={typeBadge.label} variant={typeBadge.variant} /></td>
                  <td className="px-4 py-3 text-sm text-slate-600">{req.submittedAt}</td>
                  <td className="px-4 py-3">
                    <div className="text-sm text-slate-600">{req.dueDate}</div>
                    {req.status !== 'completed' && req.status !== 'rejected' && (
                      <div className={`text-xs ${isOverdue ? 'text-red-600 font-semibold' : dl <= 7 ? 'text-amber-600' : 'text-slate-400'}`}>
                        {isOverdue ? `${Math.abs(dl)} days overdue` : `${dl} days left`}
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3"><StatusBadge label={statusBadge.label} variant={statusBadge.variant} /></td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button onClick={() => setSelected(req)} className="text-xs text-indigo-600 hover:underline">View</button>
                      {(req.status === 'pending' || req.status === 'in_review') && (
                        <button onClick={() => markComplete(req.id)} className="text-xs text-green-600 hover:underline">Complete</button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div className="text-center py-10 text-slate-400">
            <Users className="w-8 h-8 mx-auto mb-2" />
            <div className="text-sm">No requests found</div>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {selected && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-lg w-full p-6 max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-slate-800">Request Details — {selected.id}</h2>
              <button onClick={() => setSelected(null)} className="text-slate-400 hover:text-slate-600 text-xl">&times;</button>
            </div>
            <div className="space-y-3">
              {[
                { label: 'Request Type', value: selected.requestType.replace('_', ' ').toUpperCase() },
                { label: 'Data Subject', value: selected.dataSubject },
                { label: 'Email', value: selected.email },
                { label: 'Phone', value: selected.phone || '—' },
                { label: 'Submitted', value: selected.submittedAt },
                { label: 'Due Date', value: selected.dueDate },
                { label: 'Status', value: selected.status.replace('_', ' ').toUpperCase() },
                { label: 'Assigned To', value: selected.assignedTo || '—' },
                { label: 'Resolved At', value: selected.resolvedAt || '—' },
              ].map(({ label, value }) => (
                <div key={label} className="flex justify-between py-2 border-b border-slate-100">
                  <span className="text-sm text-slate-500">{label}</span>
                  <span className="text-sm font-medium text-slate-800">{value}</span>
                </div>
              ))}
              <div className="py-2 border-b border-slate-100">
                <div className="text-sm text-slate-500 mb-1">Description</div>
                <div className="text-sm text-slate-700">{selected.description}</div>
              </div>
              {selected.resolution && (
                <div className="py-2">
                  <div className="text-sm text-slate-500 mb-1">Resolution</div>
                  <div className="text-sm text-slate-700 bg-green-50 p-3 rounded-lg">{selected.resolution}</div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* New Request Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-lg w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-slate-800">Log New Rights Request</h2>
              <button onClick={() => setShowForm(false)} className="text-slate-400 hover:text-slate-600 text-xl">&times;</button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Request Type *</label>
                <select className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300">
                  <option value="access">Right of Access (S.11)</option>
                  <option value="correction">Correction &amp; Erasure (S.12)</option>
                  <option value="erasure">Erasure (S.12)</option>
                  <option value="nomination">Nomination (S.14)</option>
                  <option value="grievance">Grievance Redressal (S.13)</option>
                  <option value="withdrawal">Consent Withdrawal (S.6)</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Full Name *</label>
                  <input type="text" className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Email *</label>
                  <input type="email" className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Description *</label>
                <textarea rows={3} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300" placeholder="Describe the request..." />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Assign To</label>
                <input type="text" className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300" placeholder="Team or person responsible" />
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button onClick={() => setShowForm(false)} className="px-4 py-2 border border-slate-200 rounded-lg text-sm text-slate-600 hover:bg-slate-50">Cancel</button>
              <button onClick={() => setShowForm(false)} className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm hover:bg-indigo-700">Log Request</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
