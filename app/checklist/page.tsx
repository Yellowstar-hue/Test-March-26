'use client';
import { useState } from 'react';
import { dpdpChecklist } from '@/lib/data';
import { ChecklistItem, ComplianceLevel } from '@/lib/types';
import StatusBadge, { getComplianceBadge } from '@/components/StatusBadge';
import { CheckSquare, Filter, Info, BookOpen, ChevronDown, ChevronUp } from 'lucide-react';

const sections = [...new Set(dpdpChecklist.map(i => i.section))];

export default function ChecklistPage() {
  const [items, setItems] = useState<ChecklistItem[]>(dpdpChecklist);
  const [filterSection, setFilterSection] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [expandedSection, setExpandedSection] = useState<string | null>(null);

  const filtered = items.filter(i => {
    const matchSection = filterSection === 'all' || i.section === filterSection;
    const matchStatus = filterStatus === 'all' || i.status === filterStatus;
    return matchSection && matchStatus;
  });

  const grouped = sections.reduce((acc, section) => {
    acc[section] = filtered.filter(i => i.section === section);
    return acc;
  }, {} as Record<string, ChecklistItem[]>);

  const stats = {
    total: items.length,
    compliant: items.filter(i => i.status === 'compliant').length,
    partial: items.filter(i => i.status === 'partial').length,
    nonCompliant: items.filter(i => i.status === 'non_compliant').length,
    notAssessed: items.filter(i => i.status === 'not_assessed').length,
  };

  const score = Math.round(((stats.compliant + stats.partial * 0.5) / stats.total) * 100);

  function updateStatus(id: string, status: ComplianceLevel) {
    setItems(prev => prev.map(i => i.id === id ? { ...i, status } : i));
  }

  function getSectionScore(section: string) {
    const sItems = items.filter(i => i.section === section);
    const s = sItems.reduce((acc, i) => {
      if (i.status === 'compliant') return acc + 1;
      if (i.status === 'partial') return acc + 0.5;
      return acc;
    }, 0);
    return Math.round((s / sItems.length) * 100);
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Compliance Checklist</h1>
          <p className="text-slate-500 text-sm mt-1">DPDP Act 2023 — Full Compliance Assessment</p>
        </div>
        <div className="flex gap-2">
          <button className="flex items-center gap-2 px-4 py-2 border border-slate-200 rounded-lg text-sm text-slate-600 hover:bg-slate-50">
            <BookOpen className="w-4 h-4" /> Export Report
          </button>
        </div>
      </div>

      {/* Score Overview */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 mb-6">
        <div className="flex items-center gap-8">
          <div className="text-center">
            <div className="text-5xl font-bold text-indigo-600">{score}%</div>
            <div className="text-sm text-slate-500 mt-1">Compliance Score</div>
          </div>
          <div className="flex-1">
            <div className="h-4 bg-slate-100 rounded-full overflow-hidden mb-2">
              <div className="h-full bg-indigo-600 rounded-full" style={{ width: `${score}%` }} />
            </div>
            <div className="grid grid-cols-4 gap-4 mt-4">
              {[
                { label: 'Compliant', count: stats.compliant, color: 'text-green-600', bg: 'bg-green-100' },
                { label: 'Partial', count: stats.partial, color: 'text-amber-600', bg: 'bg-amber-100' },
                { label: 'Non-Compliant', count: stats.nonCompliant, color: 'text-red-600', bg: 'bg-red-100' },
                { label: 'Not Assessed', count: stats.notAssessed, color: 'text-slate-600', bg: 'bg-slate-100' },
              ].map(({ label, count, color, bg }) => (
                <div key={label} className={`text-center p-3 rounded-lg ${bg}`}>
                  <div className={`text-xl font-bold ${color}`}>{count}</div>
                  <div className="text-xs text-slate-600">{label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-3 mb-6">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-400" />
          <select value={filterSection} onChange={e => setFilterSection(e.target.value)}
            className="border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none">
            <option value="all">All Sections</option>
            {sections.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
          className="border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none">
          <option value="all">All Status</option>
          <option value="compliant">Compliant</option>
          <option value="partial">Partial</option>
          <option value="non_compliant">Non-Compliant</option>
          <option value="not_assessed">Not Assessed</option>
        </select>
      </div>

      {/* Section Groups */}
      <div className="space-y-4">
        {sections.map(section => {
          const sectionItems = grouped[section];
          if (!sectionItems || sectionItems.length === 0) return null;
          const sectionScore = getSectionScore(section);
          const isExpanded = expandedSection === section || filterSection !== 'all' || filterStatus !== 'all';

          return (
            <div key={section} className="bg-white rounded-xl border border-slate-200 overflow-hidden">
              <button
                onClick={() => setExpandedSection(isExpanded && expandedSection === section ? null : section)}
                className="w-full flex items-center justify-between p-4 hover:bg-slate-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div>
                    <h3 className="font-semibold text-slate-800 text-left">{section}</h3>
                    <div className="text-xs text-slate-500 text-left">{sectionItems.length} requirements</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-32 h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full ${sectionScore >= 80 ? 'bg-green-500' : sectionScore >= 50 ? 'bg-amber-500' : 'bg-red-500'}`}
                      style={{ width: `${sectionScore}%` }} />
                  </div>
                  <span className={`text-sm font-semibold w-10 text-right ${sectionScore >= 80 ? 'text-green-600' : sectionScore >= 50 ? 'text-amber-600' : 'text-red-600'}`}>
                    {sectionScore}%
                  </span>
                  {isExpanded && expandedSection === section
                    ? <ChevronUp className="w-4 h-4 text-slate-400" />
                    : <ChevronDown className="w-4 h-4 text-slate-400" />
                  }
                </div>
              </button>

              {(isExpanded || expandedSection === section) && (
                <div className="border-t border-slate-100">
                  {sectionItems.map((item, idx) => {
                    const badge = getComplianceBadge(item.status);
                    return (
                      <div key={item.id} className={`p-4 ${idx > 0 ? 'border-t border-slate-100' : ''} hover:bg-slate-50/50`}>
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-xs font-mono text-slate-400">{item.reference}</span>
                            </div>
                            <h4 className="text-sm font-semibold text-slate-800 mb-1">{item.requirement}</h4>
                            <p className="text-xs text-slate-500 mb-2">{item.description}</p>
                            {item.evidence && (
                              <div className="text-xs text-green-700 bg-green-50 px-2 py-1 rounded mb-1">
                                ✓ Evidence: {item.evidence}
                              </div>
                            )}
                            {item.notes && (
                              <div className="text-xs text-amber-700 bg-amber-50 px-2 py-1 rounded mb-1">
                                ⚠ Notes: {item.notes}
                              </div>
                            )}
                            {item.assignedTo && (
                              <div className="text-xs text-slate-400">Assigned to: {item.assignedTo}
                                {item.dueDate && ` • Due: ${item.dueDate}`}
                              </div>
                            )}
                          </div>
                          <div className="flex flex-col items-end gap-2 flex-shrink-0">
                            <StatusBadge label={badge.label} variant={badge.variant} />
                            <select
                              value={item.status}
                              onChange={e => updateStatus(item.id, e.target.value as ComplianceLevel)}
                              className="text-xs border border-slate-200 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-indigo-300 bg-white"
                            >
                              <option value="compliant">Mark Compliant</option>
                              <option value="partial">Mark Partial</option>
                              <option value="non_compliant">Mark Non-Compliant</option>
                              <option value="not_assessed">Not Assessed</option>
                            </select>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Action Items */}
      <div className="mt-6 bg-amber-50 border border-amber-200 rounded-xl p-5">
        <div className="flex items-center gap-2 mb-3">
          <Info className="w-4 h-4 text-amber-600" />
          <h3 className="font-semibold text-amber-800">Priority Action Items</h3>
        </div>
        <div className="space-y-2">
          {items.filter(i => i.status === 'non_compliant').map(i => (
            <div key={i.id} className="flex items-start gap-2 text-sm">
              <span className="text-red-500 font-bold mt-0.5">●</span>
              <span className="text-amber-800"><span className="font-medium">{i.requirement}</span> — {i.reference}</span>
            </div>
          ))}
          {items.filter(i => i.status === 'partial' && i.dueDate).map(i => (
            <div key={i.id} className="flex items-start gap-2 text-sm">
              <span className="text-amber-500 font-bold mt-0.5">●</span>
              <span className="text-amber-800"><span className="font-medium">{i.requirement}</span> — Due: {i.dueDate}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
