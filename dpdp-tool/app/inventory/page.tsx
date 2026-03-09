'use client';
import { useState } from 'react';
import { sampleDataAssets, categoryLabels, purposeLabels } from '@/lib/data';
import { DataAsset } from '@/lib/types';
import { Database, Search, Plus, Shield, Globe, Users, AlertCircle, CheckCircle, XCircle, Info } from 'lucide-react';

export default function InventoryPage() {
  const [assets] = useState<DataAsset[]>(sampleDataAssets);
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<DataAsset | null>(null);

  const filtered = assets.filter(a =>
    a.name.toLowerCase().includes(search.toLowerCase()) ||
    a.description.toLowerCase().includes(search.toLowerCase()) ||
    categoryLabels[a.category]?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Data Inventory</h1>
          <p className="text-slate-500 text-sm mt-1">Personal Data Register — Article 30 equivalent under DPDP Act 2023</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm hover:bg-indigo-700">
          <Plus className="w-4 h-4" /> Add Data Asset
        </button>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Total Assets', value: assets.length, icon: Database, bg: 'bg-indigo-50', ic: 'text-indigo-600' },
          { label: 'Sensitive Data', value: assets.filter(a => a.sensitiveData).length, icon: AlertCircle, bg: 'bg-red-50', ic: 'text-red-600' },
          { label: "Children's Data", value: assets.filter(a => a.childrenData).length, icon: Users, bg: 'bg-amber-50', ic: 'text-amber-600' },
          { label: 'Cross-border Transfers', value: assets.filter(a => a.crossBorderTransfer).length, icon: Globe, bg: 'bg-blue-50', ic: 'text-blue-600' },
        ].map(({ label, value, icon: Icon, bg, ic }) => (
          <div key={label} className={`rounded-xl border border-slate-200 p-4 bg-white`}>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-slate-500">{label}</div>
                <div className="text-2xl font-bold text-slate-800 mt-1">{value}</div>
              </div>
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${bg}`}>
                <Icon className={`w-5 h-5 ${ic}`} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Legal Info */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 flex gap-3">
        <Info className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
        <div className="text-sm text-blue-800">
          <span className="font-semibold">DPDP Act 2023 — Section 8:</span> Data Fiduciaries must maintain a complete inventory of all personal data processed, including purpose, retention period, third-party sharing, and cross-border transfer details.
        </div>
      </div>

      {/* Search */}
      <div className="relative mb-4">
        <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
        <input
          type="text" placeholder="Search data assets..."
          value={search} onChange={e => setSearch(e.target.value)}
          className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
        />
      </div>

      {/* Asset Cards */}
      <div className="grid grid-cols-1 gap-4">
        {filtered.map(asset => (
          <div key={asset.id} className="bg-white rounded-xl border border-slate-200 p-5 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-semibold text-slate-800">{asset.name}</h3>
                  {asset.sensitiveData && (
                    <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full font-medium">Sensitive</span>
                  )}
                  {asset.childrenData && (
                    <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-medium">Children&apos;s Data</span>
                  )}
                </div>
                <p className="text-sm text-slate-500 mb-3">{asset.description}</p>
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <div className="text-xs text-slate-400 mb-1">Category</div>
                    <span className="text-xs bg-indigo-50 text-indigo-700 px-2 py-1 rounded-full">{categoryLabels[asset.category]}</span>
                  </div>
                  <div>
                    <div className="text-xs text-slate-400 mb-1">Legal Basis</div>
                    <div className="text-xs text-slate-700">{asset.legalBasis}</div>
                  </div>
                  <div>
                    <div className="text-xs text-slate-400 mb-1">Retention</div>
                    <div className="text-xs text-slate-700">{asset.retentionPeriod}</div>
                  </div>
                </div>
              </div>
              <div className="flex flex-col gap-2 flex-shrink-0">
                <div className="flex flex-col gap-1.5">
                  <div className="flex items-center gap-2 text-xs">
                    <Shield className={`w-3.5 h-3.5 ${asset.encryptionStatus ? 'text-green-500' : 'text-red-500'}`} />
                    <span className={asset.encryptionStatus ? 'text-green-700' : 'text-red-700'}>
                      {asset.encryptionStatus ? 'Encrypted' : 'Not Encrypted'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    <Globe className={`w-3.5 h-3.5 ${asset.crossBorderTransfer ? 'text-amber-500' : 'text-green-500'}`} />
                    <span className={asset.crossBorderTransfer ? 'text-amber-700' : 'text-green-700'}>
                      {asset.crossBorderTransfer ? `Cross-border (${asset.transferCountries?.join(', ')})` : 'No transfer'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    {asset.thirdPartySharing
                      ? <><CheckCircle className="w-3.5 h-3.5 text-blue-500" /><span className="text-blue-700">3rd party sharing</span></>
                      : <><XCircle className="w-3.5 h-3.5 text-green-500" /><span className="text-green-700">No 3rd party</span></>
                    }
                  </div>
                </div>
                <button onClick={() => setSelected(asset)}
                  className="text-xs text-indigo-600 border border-indigo-200 rounded-lg px-3 py-1.5 hover:bg-indigo-50 mt-1">
                  View Details
                </button>
              </div>
            </div>
            {asset.thirdParties && asset.thirdParties.length > 0 && (
              <div className="mt-3 pt-3 border-t border-slate-100">
                <div className="text-xs text-slate-400 mb-1.5">Third Parties</div>
                <div className="flex flex-wrap gap-2">
                  {asset.thirdParties.map(tp => (
                    <span key={tp} className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">{tp}</span>
                  ))}
                </div>
              </div>
            )}
            <div className="mt-3 pt-3 border-t border-slate-100 flex gap-2 flex-wrap">
              {asset.purposes.map(p => (
                <span key={p} className="text-xs bg-slate-50 text-slate-600 border border-slate-200 px-2 py-0.5 rounded-full">{purposeLabels[p]}</span>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Detail Modal */}
      {selected && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full p-6 max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-slate-800">{selected.name}</h2>
              <button onClick={() => setSelected(null)} className="text-slate-400 hover:text-slate-600 text-xl">&times;</button>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {[
                { label: 'Asset ID', value: selected.id },
                { label: 'Category', value: categoryLabels[selected.category] },
                { label: 'Data Controller', value: selected.dataController },
                { label: 'Legal Basis', value: selected.legalBasis },
                { label: 'Storage Location', value: selected.storageLocation },
                { label: 'Retention Period', value: selected.retentionPeriod },
                { label: 'Encryption', value: selected.encryptionStatus ? 'Yes (Encrypted)' : 'No' },
                { label: 'Sensitive Data', value: selected.sensitiveData ? 'Yes' : 'No' },
                { label: "Children's Data", value: selected.childrenData ? 'Yes' : 'No' },
                { label: 'Third-party Sharing', value: selected.thirdPartySharing ? 'Yes' : 'No' },
                { label: 'Cross-border Transfer', value: selected.crossBorderTransfer ? `Yes - ${selected.transferCountries?.join(', ')}` : 'No' },
                { label: 'Last Updated', value: selected.updatedAt },
              ].map(({ label, value }) => (
                <div key={label} className="py-2 border-b border-slate-100">
                  <div className="text-xs text-slate-400">{label}</div>
                  <div className="text-sm font-medium text-slate-800 mt-0.5">{value}</div>
                </div>
              ))}
            </div>
            {selected.thirdParties && (
              <div className="mt-4">
                <div className="text-xs text-slate-400 mb-2">Third Parties</div>
                <div className="flex flex-wrap gap-2">
                  {selected.thirdParties.map(tp => <span key={tp} className="text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded-full">{tp}</span>)}
                </div>
              </div>
            )}
            <div className="mt-4">
              <div className="text-xs text-slate-400 mb-2">Processing Purposes</div>
              <div className="flex flex-wrap gap-2">
                {selected.purposes.map(p => <span key={p} className="text-xs bg-indigo-50 text-indigo-700 px-2 py-1 rounded-full">{purposeLabels[p]}</span>)}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
