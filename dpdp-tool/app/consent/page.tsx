'use client';
import { useState } from 'react';
import { sampleConsents, purposeLabels, categoryLabels } from '@/lib/data';
import { ConsentRecord } from '@/lib/types';
import StatusBadge, { getConsentStatusBadge } from '@/components/StatusBadge';
import { Shield, Search, Download, Plus, Filter, CheckCircle, XCircle, Clock, Info } from 'lucide-react';

export default function ConsentPage() {
  const [consents, setConsents] = useState<ConsentRecord[]>(sampleConsents);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [showForm, setShowForm] = useState(false);
  const [selectedConsent, setSelectedConsent] = useState<ConsentRecord | null>(null);

  const filtered = consents.filter(c => {
    const matchSearch = c.dataSubject.toLowerCase().includes(search.toLowerCase()) ||
      c.email.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === 'all' || c.status === filterStatus;
    return matchSearch && matchStatus;
  });

  const stats = {
    active: consents.filter(c => c.status === 'active').length,
    withdrawn: consents.filter(c => c.status === 'withdrawn').length,
    expired: consents.filter(c => c.status === 'expired').length,
    pending: consents.filter(c => c.status === 'pending').length,
  };

  function handleWithdraw(id: string) {
    setConsents(prev => prev.map(c =>
      c.id === id ? { ...c, status: 'withdrawn', withdrawalDate: new Date().toISOString().split('T')[0] } : c
    ));
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Consent Management</h1>
          <p className="text-slate-500 text-sm mt-1">Track and manage data principal consents — DPDP Act Section 6</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => {}} className="flex items-center gap-2 px-4 py-2 border border-slate-200 rounded-lg text-sm text-slate-600 hover:bg-slate-50">
            <Download className="w-4 h-4" /> Export
          </button>
          <button onClick={() => setShowForm(true)} className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm hover:bg-indigo-700">
            <Plus className="w-4 h-4" /> Record Consent
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Active', count: stats.active, color: 'text-green-600', bg: 'bg-green-50', icon: CheckCircle },
          { label: 'Withdrawn', count: stats.withdrawn, color: 'text-red-600', bg: 'bg-red-50', icon: XCircle },
          { label: 'Expired', count: stats.expired, color: 'text-slate-600', bg: 'bg-slate-50', icon: Clock },
          { label: 'Pending', count: stats.pending, color: 'text-amber-600', bg: 'bg-amber-50', icon: Info },
        ].map(({ label, count, color, bg, icon: Icon }) => (
          <div key={label} className={`rounded-xl border border-slate-200 p-4 ${bg}`}>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-slate-500">{label}</div>
                <div className={`text-2xl font-bold ${color}`}>{count}</div>
              </div>
              <Icon className={`w-6 h-6 ${color} opacity-60`} />
            </div>
          </div>
        ))}
      </div>

      {/* Legal Reference */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 flex gap-3">
        <Info className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
        <div className="text-sm text-blue-800">
          <span className="font-semibold">DPDP Act 2023 — Section 6:</span> Consent must be free, specific, informed, unconditional and unambiguous. Data principals have the right to withdraw consent at any time. Withdrawal must be as easy as giving consent.
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-3 mb-4">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text" placeholder="Search by name or email..."
            value={search} onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-400" />
          <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
            className="border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300">
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="withdrawn">Withdrawn</option>
            <option value="expired">Expired</option>
            <option value="pending">Pending</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200">
              <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-4 py-3">Data Subject</th>
              <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-4 py-3">Purposes</th>
              <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-4 py-3">Data Categories</th>
              <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-4 py-3">Consent Date</th>
              <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-4 py-3">Expiry</th>
              <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-4 py-3">Status</th>
              <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(consent => {
              const badge = getConsentStatusBadge(consent.status);
              return (
                <tr key={consent.id} className="border-t border-slate-100 hover:bg-slate-50">
                  <td className="px-4 py-3">
                    <div className="text-sm font-medium text-slate-800">{consent.dataSubject}</div>
                    <div className="text-xs text-slate-500">{consent.email}</div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1">
                      {consent.purposes.map(p => (
                        <span key={p} className="text-xs bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-full">
                          {purposeLabels[p]}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1">
                      {consent.dataCategories.slice(0, 2).map(c => (
                        <span key={c} className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">
                          {categoryLabels[c]}
                        </span>
                      ))}
                      {consent.dataCategories.length > 2 && (
                        <span className="text-xs bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full">+{consent.dataCategories.length - 2}</span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-600">{consent.consentDate}</td>
                  <td className="px-4 py-3 text-sm text-slate-600">{consent.expiryDate || '—'}</td>
                  <td className="px-4 py-3">
                    <StatusBadge label={badge.label} variant={badge.variant} />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button onClick={() => setSelectedConsent(consent)}
                        className="text-xs text-indigo-600 hover:underline">View</button>
                      {consent.status === 'active' && (
                        <button onClick={() => handleWithdraw(consent.id)}
                          className="text-xs text-red-600 hover:underline">Withdraw</button>
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
            <Shield className="w-8 h-8 mx-auto mb-2" />
            <div className="text-sm">No consent records found</div>
          </div>
        )}
      </div>

      {/* Consent Detail Modal */}
      {selectedConsent && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-lg w-full p-6 max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-slate-800">Consent Details</h2>
              <button onClick={() => setSelectedConsent(null)} className="text-slate-400 hover:text-slate-600 text-xl">&times;</button>
            </div>
            <div className="space-y-3">
              {[
                { label: 'Consent ID', value: selectedConsent.id },
                { label: 'Data Subject', value: selectedConsent.dataSubject },
                { label: 'Email', value: selectedConsent.email },
                { label: 'Consent Method', value: selectedConsent.consentMethod === 'explicit' ? 'Explicit (Affirmative Action)' : 'Implied' },
                { label: 'Consent Date', value: selectedConsent.consentDate },
                { label: 'Expiry Date', value: selectedConsent.expiryDate || 'Not set' },
                { label: 'Status', value: selectedConsent.status },
                { label: 'IP Address', value: selectedConsent.ipAddress || '—' },
                { label: 'Withdrawal Date', value: selectedConsent.withdrawalDate || '—' },
              ].map(({ label, value }) => (
                <div key={label} className="flex justify-between py-2 border-b border-slate-100">
                  <span className="text-sm text-slate-500">{label}</span>
                  <span className="text-sm font-medium text-slate-800">{value}</span>
                </div>
              ))}
              <div className="py-2">
                <div className="text-sm text-slate-500 mb-2">Purposes</div>
                <div className="flex flex-wrap gap-2">
                  {selectedConsent.purposes.map(p => (
                    <span key={p} className="text-xs bg-indigo-50 text-indigo-700 px-2 py-1 rounded-full">{purposeLabels[p]}</span>
                  ))}
                </div>
              </div>
              <div className="py-2">
                <div className="text-sm text-slate-500 mb-2">Data Categories</div>
                <div className="flex flex-wrap gap-2">
                  {selectedConsent.dataCategories.map(c => (
                    <span key={c} className="text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded-full">{categoryLabels[c]}</span>
                  ))}
                </div>
              </div>
              {selectedConsent.notes && (
                <div className="py-2 border-t border-slate-100">
                  <div className="text-sm text-slate-500 mb-1">Notes</div>
                  <div className="text-sm text-slate-700">{selectedConsent.notes}</div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Record Consent Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-lg w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-slate-800">Record New Consent</h2>
              <button onClick={() => setShowForm(false)} className="text-slate-400 hover:text-slate-600 text-xl">&times;</button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Data Subject Name *</label>
                <input type="text" className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300" placeholder="Full name" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Email Address *</label>
                <input type="email" className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300" placeholder="email@example.com" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Processing Purposes *</label>
                <div className="space-y-2">
                  {Object.entries(purposeLabels).map(([key, label]) => (
                    <label key={key} className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
                      <input type="checkbox" className="rounded border-slate-300 text-indigo-600" />
                      {label}
                    </label>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Consent Method *</label>
                <select className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300">
                  <option value="explicit">Explicit (Affirmative Action)</option>
                  <option value="implied">Implied</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Expiry Date</label>
                <input type="date" className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300" />
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button onClick={() => setShowForm(false)} className="px-4 py-2 border border-slate-200 rounded-lg text-sm text-slate-600 hover:bg-slate-50">Cancel</button>
              <button onClick={() => setShowForm(false)} className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm hover:bg-indigo-700">Record Consent</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
