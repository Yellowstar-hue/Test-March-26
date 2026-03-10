'use client';
import { useState } from 'react';
import { categoryLabels, purposeLabels } from '@/lib/data';
import { FileText, Download, Eye, Info, Globe } from 'lucide-react';

interface NoticeConfig {
  entityName: string;
  contactEmail: string;
  contactPhone: string;
  dpoName: string;
  dpoEmail: string;
  dataCategories: string[];
  purposes: string[];
  retentionPolicy: string;
  thirdParties: string;
  crossBorderTransfers: boolean;
  transferSafeguards: string;
  childrenData: boolean;
  grievanceOfficer: string;
  grievanceEmail: string;
  lastUpdated: string;
  language: 'en' | 'hi' | 'both';
}

const defaultConfig: NoticeConfig = {
  entityName: 'Your Company Pvt. Ltd.',
  contactEmail: 'privacy@yourcompany.com',
  contactPhone: '+91-11-XXXXXXXX',
  dpoName: 'Data Protection Officer',
  dpoEmail: 'dpo@yourcompany.com',
  dataCategories: ['identity', 'contact'],
  purposes: ['service_delivery'],
  retentionPolicy: 'Personal data is retained for the period necessary to fulfill the stated purpose or as required by applicable law.',
  thirdParties: '',
  crossBorderTransfers: false,
  transferSafeguards: '',
  childrenData: false,
  grievanceOfficer: 'Grievance Officer',
  grievanceEmail: 'grievance@yourcompany.com',
  lastUpdated: new Date().toISOString().split('T')[0],
  language: 'en',
};

function generateNoticeText(config: NoticeConfig): string {
  const selectedCategories = config.dataCategories.map(c => categoryLabels[c]).join(', ');
  const selectedPurposes = config.purposes.map(p => purposeLabels[p]).join(', ');
  const thirdPartiesList = config.thirdParties ? config.thirdParties.split('\n').filter(Boolean) : [];

  return `PRIVACY NOTICE
${config.entityName}
Last Updated: ${config.lastUpdated}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

This Privacy Notice is issued in accordance with the Digital Personal Data Protection Act, 2023 (DPDP Act) and explains how ${config.entityName} ("We", "Us", "Our") collects, uses, stores, and processes your Personal Data.

1. WHO WE ARE
${config.entityName} is the Data Fiduciary responsible for processing your personal data. You may contact us at:
  Email: ${config.contactEmail}
  Phone: ${config.contactPhone}

2. DATA PROTECTION OFFICER (DPO)
We have appointed a Data Protection Officer who can be contacted for privacy-related queries:
  Name: ${config.dpoName}
  Email: ${config.dpoEmail}

3. WHAT PERSONAL DATA WE COLLECT
We collect the following categories of personal data from you:
  ${selectedCategories}
${config.childrenData ? '\n  We also process personal data of children below the age of 18 years, for which we obtain verifiable consent from a parent or lawful guardian.' : ''}

4. WHY WE COLLECT YOUR DATA (PURPOSES)
We process your personal data for the following purposes:
  ${selectedPurposes}

5. LEGAL BASIS FOR PROCESSING
We process your personal data on the basis of your freely given, specific, informed, and unambiguous Consent as required under Section 6 of the DPDP Act, 2023. You have the right to withdraw your consent at any time.

6. DATA RETENTION
${config.retentionPolicy}

7. SHARING OF DATA WITH THIRD PARTIES
${thirdPartiesList.length > 0
  ? `We share your personal data with the following data processors/third parties who have entered into valid Data Processing Agreements:\n  ${thirdPartiesList.map(tp => `• ${tp}`).join('\n  ')}`
  : 'We do not share your personal data with any third parties except as required by law.'}

8. CROSS-BORDER DATA TRANSFERS
${config.crossBorderTransfers
  ? `We may transfer your personal data outside India. Such transfers are made in accordance with applicable law and with appropriate safeguards: ${config.transferSafeguards}`
  : 'We do not transfer your personal data outside India.'}

9. YOUR RIGHTS AS A DATA PRINCIPAL
Under the DPDP Act, 2023, you have the following rights:
  (a) Right of Access (Section 11) — You may request a summary of your personal data we hold and the processing activities carried out.
  (b) Right to Correction & Completeness (Section 12) — You may request correction, completion, or updating of your personal data.
  (c) Right to Erasure (Section 12) — You may request erasure of your personal data where it is no longer necessary for the stated purpose.
  (d) Right of Nomination (Section 14) — You may nominate any individual to exercise your rights in the event of your death or incapacity.
  (e) Right to Withdraw Consent (Section 6) — You may withdraw consent at any time. Withdrawal will not affect lawfulness of processing prior to withdrawal.

10. GRIEVANCE REDRESSAL
If you have any grievances regarding the processing of your personal data, you may approach our Grievance Officer:
  Name: ${config.grievanceOfficer}
  Email: ${config.grievanceEmail}

  We will endeavor to resolve your grievance within the timelines prescribed under the DPDP Act and rules.

  If your grievance is not resolved to your satisfaction, you may file a complaint with the Data Protection Board of India.

11. SECURITY OF YOUR DATA
We implement appropriate technical and organisational security measures to protect your personal data from unauthorized access, disclosure, alteration, or destruction, as required under Section 8(5) of the DPDP Act, 2023.

12. CHANGES TO THIS NOTICE
We may update this Privacy Notice from time to time. We will notify you of any material changes through appropriate channels.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
© ${new Date().getFullYear()} ${config.entityName}. All rights reserved.
This Privacy Notice is in compliance with the Digital Personal Data Protection Act, 2023.`;
}

export default function PrivacyNoticePage() {
  const [config, setConfig] = useState<NoticeConfig>(defaultConfig);
  const [preview, setPreview] = useState(false);

  const noticeText = generateNoticeText(config);

  function toggleCategory(cat: string) {
    setConfig(prev => ({
      ...prev,
      dataCategories: prev.dataCategories.includes(cat)
        ? prev.dataCategories.filter(c => c !== cat)
        : [...prev.dataCategories, cat]
    }));
  }

  function togglePurpose(p: string) {
    setConfig(prev => ({
      ...prev,
      purposes: prev.purposes.includes(p)
        ? prev.purposes.filter(x => x !== p)
        : [...prev.purposes, p]
    }));
  }

  function downloadNotice() {
    const blob = new Blob([noticeText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `privacy-notice-${config.entityName.replace(/\s+/g, '-')}-${config.lastUpdated}.txt`;
    a.click();
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Privacy Notice Generator</h1>
          <p className="text-slate-500 text-sm mt-1">Generate DPDP Act 2023 compliant privacy notices — Section 5</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setPreview(!preview)}
            className="flex items-center gap-2 px-4 py-2 border border-slate-200 rounded-lg text-sm text-slate-600 hover:bg-slate-50">
            <Eye className="w-4 h-4" /> {preview ? 'Edit' : 'Preview'}
          </button>
          <button onClick={downloadNotice}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm hover:bg-indigo-700">
            <Download className="w-4 h-4" /> Download Notice
          </button>
        </div>
      </div>

      {/* Legal Context */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 flex gap-3">
        <Info className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
        <div className="text-sm text-blue-800">
          <span className="font-semibold">DPDP Act 2023 — Section 5:</span> Before or at the time of requesting consent, the Data Fiduciary must provide a Notice containing: itemised description of personal data sought, purpose, how rights can be exercised, and how grievance officer can be contacted. Notice must be in clear and plain language.
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        {/* Configuration Panel */}
        {!preview && (
          <div className="space-y-5">
            {/* Entity Info */}
            <div className="bg-white rounded-xl border border-slate-200 p-5">
              <h2 className="font-semibold text-slate-800 mb-4">Organization Details</h2>
              <div className="space-y-3">
                {[
                  { label: 'Entity Name', key: 'entityName', type: 'text' },
                  { label: 'Contact Email', key: 'contactEmail', type: 'email' },
                  { label: 'Contact Phone', key: 'contactPhone', type: 'text' },
                  { label: 'DPO Name', key: 'dpoName', type: 'text' },
                  { label: 'DPO Email', key: 'dpoEmail', type: 'email' },
                  { label: 'Grievance Officer Name', key: 'grievanceOfficer', type: 'text' },
                  { label: 'Grievance Email', key: 'grievanceEmail', type: 'email' },
                ].map(({ label, key, type }) => (
                  <div key={key}>
                    <label className="block text-xs font-medium text-slate-600 mb-1">{label}</label>
                    <input type={type} value={(config as unknown as Record<string, string>)[key]}
                      onChange={e => setConfig(prev => ({ ...prev, [key]: e.target.value }))}
                      className="w-full border border-slate-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300" />
                  </div>
                ))}
              </div>
            </div>

            {/* Data Categories */}
            <div className="bg-white rounded-xl border border-slate-200 p-5">
              <h2 className="font-semibold text-slate-800 mb-3">Data Categories Collected</h2>
              <div className="grid grid-cols-2 gap-2">
                {Object.entries(categoryLabels).map(([key, label]) => (
                  <label key={key} className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
                    <input type="checkbox" checked={config.dataCategories.includes(key)}
                      onChange={() => toggleCategory(key)}
                      className="rounded border-slate-300 text-indigo-600" />
                    {label}
                  </label>
                ))}
              </div>
            </div>

            {/* Purposes */}
            <div className="bg-white rounded-xl border border-slate-200 p-5">
              <h2 className="font-semibold text-slate-800 mb-3">Processing Purposes</h2>
              <div className="space-y-2">
                {Object.entries(purposeLabels).map(([key, label]) => (
                  <label key={key} className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
                    <input type="checkbox" checked={config.purposes.includes(key)}
                      onChange={() => togglePurpose(key)}
                      className="rounded border-slate-300 text-indigo-600" />
                    {label}
                  </label>
                ))}
              </div>
            </div>

            {/* Additional Settings */}
            <div className="bg-white rounded-xl border border-slate-200 p-5">
              <h2 className="font-semibold text-slate-800 mb-4">Additional Settings</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Retention Policy</label>
                  <textarea rows={3} value={config.retentionPolicy}
                    onChange={e => setConfig(prev => ({ ...prev, retentionPolicy: e.target.value }))}
                    className="w-full border border-slate-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Third Parties (one per line)</label>
                  <textarea rows={3} value={config.thirdParties}
                    onChange={e => setConfig(prev => ({ ...prev, thirdParties: e.target.value }))}
                    placeholder="Payment Gateway Ltd&#10;Analytics Provider Inc"
                    className="w-full border border-slate-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300" />
                </div>
                <div className="flex items-center gap-3">
                  <input type="checkbox" id="crossBorder" checked={config.crossBorderTransfers}
                    onChange={e => setConfig(prev => ({ ...prev, crossBorderTransfers: e.target.checked }))}
                    className="rounded border-slate-300 text-indigo-600" />
                  <label htmlFor="crossBorder" className="text-sm text-slate-700 flex items-center gap-1">
                    <Globe className="w-3.5 h-3.5" /> Cross-border data transfers
                  </label>
                </div>
                {config.crossBorderTransfers && (
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">Transfer Safeguards</label>
                    <input type="text" value={config.transferSafeguards}
                      onChange={e => setConfig(prev => ({ ...prev, transferSafeguards: e.target.value }))}
                      placeholder="Standard Contractual Clauses, etc."
                      className="w-full border border-slate-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300" />
                  </div>
                )}
                <div className="flex items-center gap-3">
                  <input type="checkbox" id="children" checked={config.childrenData}
                    onChange={e => setConfig(prev => ({ ...prev, childrenData: e.target.checked }))}
                    className="rounded border-slate-300 text-indigo-600" />
                  <label htmlFor="children" className="text-sm text-slate-700">Process children&apos;s data (under 18)</label>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Last Updated Date</label>
                  <input type="date" value={config.lastUpdated}
                    onChange={e => setConfig(prev => ({ ...prev, lastUpdated: e.target.value }))}
                    className="w-full border border-slate-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none" />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Preview Panel */}
        <div className={preview ? 'col-span-2' : ''}>
          <div className="bg-white rounded-xl border border-slate-200 p-5 sticky top-4">
            <div className="flex items-center gap-2 mb-4">
              <FileText className="w-4 h-4 text-slate-500" />
              <h2 className="font-semibold text-slate-800">Privacy Notice Preview</h2>
            </div>
            <pre className="text-xs text-slate-700 whitespace-pre-wrap font-mono bg-slate-50 rounded-lg p-4 max-h-[600px] overflow-y-auto leading-relaxed">
              {noticeText}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
}
