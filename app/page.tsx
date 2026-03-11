'use client';

import { useState, useRef, useCallback } from 'react';
import {
  Shield, Search, CheckCircle2, XCircle, ChevronDown, ChevronUp,
  Loader2, Zap, Lock, Users, FileText, Scale, Baby, Globe,
  Building2, Clock, RotateCcw, Info, ArrowRight, AlertCircle, Activity,
  HelpCircle, MessageSquare, ExternalLink,
} from 'lucide-react';
import type { ScanResult, CategoryResult, InterviewItem } from './api/scan/route';

// ─── helpers ──────────────────────────────────────────────────────────────────

function pct(score: number, max: number) {
  return max === 0 ? 0 : Math.min(100, Math.round((score / max) * 100));
}

function scoreColor(p: number) {
  if (p >= 80) return '#22d3a5';
  if (p >= 60) return '#f59e0b';
  if (p >= 35) return '#f97316';
  return '#ef4444';
}

function complianceCfg(level: string) {
  const m: Record<string, { c: string; bg: string; border: string; label: string; cta: string; ctaUrgency: 'low' | 'medium' | 'high' | 'critical' | null }> = {
    'Excellent':                   { c: '#22d3a5', bg: 'rgba(34,211,165,0.1)',  border: 'rgba(34,211,165,0.3)',  label: '✦ Excellent',                    cta: '',                                            ctaUrgency: null     },
    'Attention Required':          { c: '#818cf8', bg: 'rgba(129,140,248,0.1)', border: 'rgba(129,140,248,0.3)', label: '⚠ Attention Required',            cta: 'Schedule a DPDP Compliance Review',           ctaUrgency: 'low'    },
    'Needs Immediate Improvement': { c: '#f59e0b', bg: 'rgba(245,158,11,0.1)',  border: 'rgba(245,158,11,0.3)',  label: '⚡ Needs Immediate Improvement',   cta: 'Get a Detailed Gap Analysis Now',             ctaUrgency: 'medium' },
    'High Risk':                   { c: '#f97316', bg: 'rgba(249,115,22,0.1)',  border: 'rgba(249,115,22,0.3)',  label: '🚨 High Non-Compliance Risk',      cta: 'Speak to a DPDP Specialist Urgently',         ctaUrgency: 'high'   },
    'Critical':                    { c: '#ef4444', bg: 'rgba(239,68,68,0.1)',   border: 'rgba(239,68,68,0.3)',   label: '✕ Critical Non-Compliance',        cta: 'Get Immediate Expert Intervention',           ctaUrgency: 'critical' },
  };
  return m[level] ?? m['Critical'];
}

function sevCfg(sev: string) {
  const m: Record<string, { c: string; bg: string; border: string }> = {
    'Critical': { c: '#ef4444', bg: 'rgba(239,68,68,0.07)',   border: 'rgba(239,68,68,0.2)'  },
    'High':     { c: '#f97316', bg: 'rgba(249,115,22,0.07)',  border: 'rgba(249,115,22,0.2)' },
    'Medium':   { c: '#eab308', bg: 'rgba(234,179,8,0.07)',   border: 'rgba(234,179,8,0.2)'  },
    'Low':      { c: '#22d3a5', bg: 'rgba(34,211,165,0.07)',  border: 'rgba(34,211,165,0.2)' },
  };
  return m[sev] ?? m['High'];
}

const CAT_ICON: Record<string, React.ElementType> = {
  consent: Shield, privacy: FileText, grievance: Scale,
  security: Lock, rights: Users, dpo: Building2,
  retention: Clock, children: Baby, crossborder: Globe,
};

const WHY_MATTERS: Record<string, string> = {
  consent:     'Processing personal data without a valid consent notice is a direct violation of DPDP Section 6. The Data Protection Board can levy penalties up to ₹250 crore for consent failures — typically the first thing auditors check.',
  privacy:     'Section 5 mandates a clear, accessible privacy notice before data collection begins. Without it, informed consent is legally impossible — making all downstream data processing potentially unlawful.',
  grievance:   'Section 13 requires a designated Grievance Officer with published contact details and a structured complaint timeline. Its absence is one of the most common, directly-verifiable DPDP violations.',
  security:    'Section 8 requires "reasonable security safeguards." HTTPS and security headers are the bare minimum. Inadequate security is a primary trigger for breach investigations and regulatory action.',
  rights:      'Sections 11–14 give data principals the right to access, correct, erase their data, and nominate a representative. You must communicate these rights clearly AND provide a practical mechanism to exercise them.',
  dpo:         'Significant Data Fiduciaries must appoint a DPO with published contact details. All fiduciaries should provide accessible privacy contact channels — it signals accountability and is expected under DPDP Rules.',
  retention:   'Section 8(7) requires personal data to be erased or anonymised once the purpose is fulfilled. Open-ended retention without defined periods is non-compliant and a liability.',
  children:    "Section 9 imposes strict restrictions on processing children's data (under 18), including verifiable parental consent. This carries the highest penalty tier — don't overlook it.",
  crossborder: 'Section 16 empowers the government to restrict transfers to certain countries. You must disclose international data transfers and apply appropriate safeguards.',
};

const WHAT_TO_DO: Record<string, string> = {
  consent:     'Deploy a Consent Management Platform (CMP) or build a consent notice that presents clear, purpose-specific requests before any personal data processing. Ensure withdrawal is as easy as giving consent.',
  privacy:     'Publish a comprehensive Privacy Notice linked from every page footer. Cover: what data you collect, why, how long you keep it, who you share it with, and how users can exercise their rights.',
  grievance:   'Designate a Grievance Officer (named individual or role), publish their name and email on your website, and define a complaint response timeline. Aim for 30 days or less.',
  security:    'Enable HTTPS sitewide and enforce it via HSTS. Add Content-Security-Policy, X-Frame-Options, X-Content-Type-Options, and Referrer-Policy headers. Use SecurityHeaders.com to verify.',
  rights:      'Add a "Your Data Rights" section to your Privacy Notice listing all 6 rights. Create a dedicated form, email alias (privacy@, dpo@), or self-serve portal for submitting access, correction, and erasure requests.',
  dpo:         'Designate a Data Protection Officer or Privacy Officer, publish their contact details on your Privacy Notice and footer. For Significant Data Fiduciaries, this is mandatory under DPDP Rules.',
  retention:   'Define retention periods for each data category and publish them in your Privacy Notice. Implement automated deletion or anonymisation workflows once the purpose is fulfilled.',
  children:    'Implement age verification before collecting data. Require verifiable parental consent for users under 18. Do not serve behavioural ads or track children without explicit consent.',
  crossborder: 'Audit all third-party services and cloud providers for international data transfers. Add a cross-border transfer section to your Privacy Notice and ensure adequate safeguards are documented.',
};

// ─── Score Ring ────────────────────────────────────────────────────────────────

function ScoreRing({ score, max }: { score: number; max: number }) {
  const p = pct(score, max);
  const color = scoreColor(p);
  const r = 54, circ = 2 * Math.PI * r;
  const dash = (p / 100) * circ;
  return (
    <svg width={136} height={136} viewBox="0 0 136 136">
      <circle cx={68} cy={68} r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={10} />
      <circle cx={68} cy={68} r={r} fill="none" stroke={color} strokeWidth={10}
        strokeDasharray={`${dash} ${circ - dash}`} strokeDashoffset={circ * 0.25}
        strokeLinecap="round" style={{ filter: `drop-shadow(0 0 10px ${color}90)` }} />
      <text x={68} y={63} textAnchor="middle" fill="white" fontSize={28} fontWeight="900"
        fontFamily="system-ui,-apple-system,sans-serif">{p}</text>
      <text x={68} y={80} textAnchor="middle" fill="rgba(255,255,255,0.35)" fontSize={11}
        fontFamily="system-ui,-apple-system,sans-serif">out of 100</text>
    </svg>
  );
}

// ─── Category Card ─────────────────────────────────────────────────────────────

function CategoryCard({ cat, expanded, onToggle }: {
  cat: CategoryResult; expanded: boolean; onToggle: () => void;
}) {
  const Icon = CAT_ICON[cat.id] ?? Shield;
  const p = pct(cat.score, cat.verifiableMax || cat.maxScore);
  const color = cat.status === 'unverified' ? '#818cf8' : scoreColor(p);
  const stMap = {
    pass:       { label: 'Compliant',      c: '#22d3a5', bg: 'rgba(34,211,165,0.1)',  border: 'rgba(34,211,165,0.2)'  },
    partial:    { label: 'Partial',        c: '#f59e0b', bg: 'rgba(245,158,11,0.1)', border: 'rgba(245,158,11,0.2)' },
    fail:       { label: 'Gap Found',      c: '#ef4444', bg: 'rgba(239,68,68,0.1)',   border: 'rgba(239,68,68,0.2)'  },
    unverified: { label: 'Cannot Verify',  c: '#818cf8', bg: 'rgba(129,140,248,0.1)', border: 'rgba(129,140,248,0.2)' },
  };
  const st = stMap[cat.status];
  const borderColor = cat.status === 'fail' ? 'rgba(239,68,68,0.22)'
    : cat.status === 'pass' ? 'rgba(34,211,165,0.15)'
    : cat.status === 'unverified' ? 'rgba(129,140,248,0.2)'
    : 'rgba(124,58,237,0.18)';

  return (
    <div style={{
      background: 'rgba(11,9,26,0.85)', backdropFilter: 'blur(12px)',
      border: `1px solid ${borderColor}`,
      borderRadius: 14, overflow: 'hidden',
    }}>
      <button onClick={onToggle} style={{
        width: '100%', padding: '18px 20px', textAlign: 'left',
        background: 'transparent', border: 'none', cursor: 'pointer', display: 'block',
      }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
          <div style={{
            width: 38, height: 38, borderRadius: 10, flexShrink: 0, marginTop: 1,
            background: 'rgba(124,58,237,0.12)', border: '1px solid rgba(124,58,237,0.22)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Icon size={16} color="#a78bfa" />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 3, flexWrap: 'wrap' as const }}>
              <span style={{ fontSize: 13, fontWeight: 700, color: '#e2e8f0', letterSpacing: '-0.01em' }}>{cat.name}</span>
              {cat.isBonus && <span style={{ fontSize: 9, padding: '2px 6px', borderRadius: 4, background: 'rgba(124,58,237,0.18)', color: '#c4b5fd', fontWeight: 700, letterSpacing: '0.06em' }}>BONUS</span>}
            </div>
            <div style={{ fontSize: 11, color: '#7070a0', fontWeight: 500, marginBottom: 10 }}>{cat.dpdpSection}</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ flex: 1, height: 3, borderRadius: 2, background: 'rgba(255,255,255,0.06)' }}>
                <div style={{ width: `${cat.status === 'unverified' ? 0 : p}%`, height: '100%', borderRadius: 2, background: color, boxShadow: `0 0 8px ${color}50` }} />
              </div>
              {cat.status === 'unverified'
                ? <span style={{ fontSize: 10, fontWeight: 600, color: '#818cf8', flexShrink: 0 }}>—/—</span>
                : <span style={{ fontSize: 11, fontWeight: 700, color, flexShrink: 0 }}>{cat.score}/{cat.verifiableMax || cat.maxScore}</span>
              }
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 8, flexShrink: 0 }}>
            <span style={{ fontSize: 10, fontWeight: 700, padding: '3px 9px', borderRadius: 20, background: st.bg, border: `1px solid ${st.border}`, color: st.c }}>
              {st.label}
            </span>
            {expanded ? <ChevronUp size={13} color="#5050a0" /> : <ChevronDown size={13} color="#5050a0" />}
          </div>
        </div>
      </button>

      {expanded && (
        <div style={{ padding: '0 20px 20px', borderTop: '1px solid rgba(255,255,255,0.04)' }}>
          <p style={{ fontSize: 12, color: '#9494bb', lineHeight: 1.75, margin: '14px 0 14px' }}>{cat.description}</p>

          {/* Unverified category notice */}
          {cat.status === 'unverified' && (
            <div style={{ padding: '12px 14px', borderRadius: 10, background: 'rgba(129,140,248,0.06)', border: '1px solid rgba(129,140,248,0.18)', marginBottom: 12 }}>
              <div style={{ fontSize: 10, fontWeight: 800, color: '#818cf8', marginBottom: 5, letterSpacing: '0.08em' }}>WHY THIS COULD NOT BE VERIFIED</div>
              <div style={{ fontSize: 12, color: '#a0a0cc', lineHeight: 1.75 }}>
                This website blocked automated page fetching (bot protection / WAF / dynamic rendering). The controls in this category may be fully implemented via the application layer, backend systems, or internal processes — this is common for enterprise platforms.
                <br /><strong style={{ color: '#c4b5fd' }}>This is not a confirmed gap.</strong> Manual verification or a stakeholder interview is required to assess actual compliance.
              </div>
            </div>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 14 }}>
            {cat.checks.map((ck, i) => {
              const isUnverified = ck.cannotVerify;
              const bgColor = isUnverified ? 'rgba(129,140,248,0.04)' : ck.found ? 'rgba(34,211,165,0.04)' : 'rgba(239,68,68,0.04)';
              const borderC  = isUnverified ? 'rgba(129,140,248,0.15)' : ck.found ? 'rgba(34,211,165,0.12)' : 'rgba(239,68,68,0.12)';
              const textC    = isUnverified ? '#818cf8' : ck.found ? '#22d3a5' : '#ef4444';
              return (
                <div key={i} style={{
                  display: 'flex', alignItems: 'flex-start', gap: 9, padding: '11px 13px', borderRadius: 9,
                  background: bgColor, border: `1px solid ${borderC}`,
                }}>
                  <div style={{ marginTop: 1, flexShrink: 0 }}>
                    {isUnverified
                      ? <HelpCircle size={13} color="#818cf8" />
                      : ck.found
                        ? <CheckCircle2 size={13} color="#22d3a5" />
                        : <XCircle size={13} color="#ef4444" />
                    }
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 11, fontWeight: 600, color: textC, marginBottom: 3 }}>
                      {ck.label}
                      {isUnverified && <span style={{ fontSize: 9, fontWeight: 700, marginLeft: 7, padding: '1px 6px', borderRadius: 4, background: 'rgba(129,140,248,0.15)', color: '#818cf8' }}>CANNOT VERIFY</span>}
                    </div>
                    <div style={{ fontSize: 11, color: '#9090b8', lineHeight: 1.6 }}>{ck.detail}</div>
                  </div>
                  <span style={{ fontSize: 10, color: isUnverified ? '#5050a0' : '#6060a0', flexShrink: 0, fontWeight: 500 }}>+{ck.points}pt</span>
                </div>
              );
            })}
          </div>
          {cat.status !== 'pass' && cat.status !== 'unverified' && WHY_MATTERS[cat.id] && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <div style={{ padding: '12px 14px', borderRadius: 10, background: 'rgba(239,68,68,0.04)', border: '1px solid rgba(239,68,68,0.1)' }}>
                <div style={{ fontSize: 9, fontWeight: 800, color: '#ef4444', marginBottom: 6, letterSpacing: '0.1em' }}>WHY THIS MATTERS</div>
                <div style={{ fontSize: 12, color: '#9090b8', lineHeight: 1.75 }}>{WHY_MATTERS[cat.id]}</div>
              </div>
              {WHAT_TO_DO[cat.id] && (
                <div style={{ padding: '12px 14px', borderRadius: 10, background: 'rgba(124,58,237,0.05)', border: '1px solid rgba(124,58,237,0.12)' }}>
                  <div style={{ fontSize: 9, fontWeight: 800, color: '#a78bfa', marginBottom: 6, letterSpacing: '0.1em' }}>WHAT TO DO</div>
                  <div style={{ fontSize: 12, color: '#9090b8', lineHeight: 1.75 }}>{WHAT_TO_DO[cat.id]}</div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Interview Items Section ──────────────────────────────────────────────────

function InterviewSection({ items }: { items: InterviewItem[] }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ marginBottom: 32 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
        <MessageSquare size={14} color="#818cf8" />
        <span style={{ fontSize: 11, fontWeight: 800, color: '#818cf8', letterSpacing: '0.1em', textTransform: 'uppercase' as const }}>Requires Stakeholder Interview & Documentation Review</span>
      </div>

      {/* Intro box */}
      <div style={{ padding: '16px 20px', borderRadius: 14, background: 'rgba(129,140,248,0.05)', border: '1px solid rgba(129,140,248,0.18)', marginBottom: 10 }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
          <div style={{ width: 36, height: 36, borderRadius: 9, flexShrink: 0, background: 'rgba(129,140,248,0.12)', border: '1px solid rgba(129,140,248,0.22)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <MessageSquare size={15} color="#818cf8" />
          </div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#c4b5fd', marginBottom: 6, lineHeight: 1.3 }}>
              {items.length} controls cannot be assessed via any public website scan
            </div>
            <div style={{ fontSize: 12, color: '#9090b8', lineHeight: 1.75 }}>
              These compliance obligations exist at the organisational, contractual, and technical implementation level.
              A qualified DPDP auditor will assess them through stakeholder interviews, document requests, and system demonstrations.
              Regardless of what this scan found, <strong style={{ color: '#c4b5fd' }}>every organisation must address these items</strong> to be fully DPDP compliant.
            </div>
          </div>
        </div>
        <button
          onClick={() => setOpen(!open)}
          style={{ marginTop: 14, display: 'flex', alignItems: 'center', gap: 6, padding: '7px 14px', borderRadius: 7, background: 'rgba(129,140,248,0.1)', border: '1px solid rgba(129,140,248,0.22)', color: '#a78bfa', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}
        >
          {open ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
          {open ? 'Hide details' : `View all ${items.length} items requiring interview`}
        </button>
      </div>

      {open && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {items.map((item, i) => (
            <div key={i} style={{ padding: '15px 18px', borderRadius: 11, background: 'rgba(11,9,26,0.7)', border: '1px solid rgba(129,140,248,0.12)' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                <div style={{ width: 22, height: 22, borderRadius: 6, flexShrink: 0, background: 'rgba(129,140,248,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: 1 }}>
                  <span style={{ fontSize: 10, fontWeight: 800, color: '#818cf8' }}>{i + 1}</span>
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 5, flexWrap: 'wrap' as const }}>
                    <span style={{ fontSize: 12, fontWeight: 700, color: '#d8d4f0', lineHeight: 1.4 }}>{item.label}</span>
                    <span style={{ fontSize: 10, color: '#7070a0', padding: '1px 7px', borderRadius: 4, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>{item.dpdpSection}</span>
                  </div>
                  <div style={{ fontSize: 12, color: '#9090b8', lineHeight: 1.7, marginBottom: 8 }}>{item.description}</div>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 6 }}>
                    <span style={{ fontSize: 10, fontWeight: 700, color: '#818cf8', flexShrink: 0, marginTop: 1 }}>ARTIFACTS:</span>
                    <span style={{ fontSize: 11, color: '#7878aa', lineHeight: 1.5 }}>{item.artifactsNeeded}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── CTA Banner ───────────────────────────────────────────────────────────────

function CTABanner() {
  return (
    <div style={{
      marginBottom: 28,
      padding: '28px 32px',
      borderRadius: 18,
      background: 'linear-gradient(135deg, rgba(124,58,237,0.12) 0%, rgba(129,140,248,0.08) 50%, rgba(124,58,237,0.12) 100%)',
      border: '1px solid rgba(124,58,237,0.3)',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Glow */}
      <div style={{ position: 'absolute', top: -60, right: -60, width: 200, height: 200, borderRadius: '50%', background: 'radial-gradient(circle, rgba(124,58,237,0.18) 0%, transparent 70%)', pointerEvents: 'none' }} />

      <div style={{ position: 'relative' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
          <div style={{ width: 28, height: 28, borderRadius: 7, background: 'linear-gradient(135deg,#7c3aed,#a78bfa)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 15px rgba(124,58,237,0.5)' }}>
            <Zap size={13} color="white" />
          </div>
          <span style={{ fontSize: 11, fontWeight: 800, color: '#a78bfa', letterSpacing: '0.1em', textTransform: 'uppercase' as const }}>Ready for a Comprehensive Audit?</span>
        </div>

        <div style={{ fontSize: 20, fontWeight: 800, color: '#f0eeff', letterSpacing: '-0.02em', lineHeight: 1.3, marginBottom: 10 }}>
          Let&apos;s do a deep-dive Gap Analysis<br />
          <span style={{ background: 'linear-gradient(135deg,#7c3aed,#a78bfa,#c4b5fd)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
            and make you DPDP compliant.
          </span>
        </div>

        <div style={{ fontSize: 13, color: '#9090b8', lineHeight: 1.75, maxWidth: 560, marginBottom: 22 }}>
          <strong style={{ color: '#c4b5fd' }}>This scan is based on publicly available information only.</strong> A proper DPDP Gap Analysis covers internal systems, data flows, vendor contracts, consent records, employee training, DPIA, incident response, and the 8 interview items listed above — areas this automated scan cannot reach.
        </div>

        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' as const }}>
          <a
            href="https://dpdpone.in/contact"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              padding: '13px 24px', borderRadius: 11, textDecoration: 'none',
              background: 'linear-gradient(135deg,#7c3aed 0%,#9f5ef5 60%,#7c3aed 100%)',
              color: 'white', fontSize: 13, fontWeight: 700,
              boxShadow: '0 4px 24px rgba(124,58,237,0.45)',
              border: 'none', cursor: 'pointer',
            }}
          >
            <Zap size={13} />
            Fill this form — Get a Full DPDP Gap Analysis
            <ExternalLink size={11} style={{ opacity: 0.7 }} />
          </a>
        </div>

        <div style={{ marginTop: 14, fontSize: 11, color: '#5050a0', lineHeight: 1.5 }}>
          Conducted by certified data protection professionals · Covers all controls this scan cannot reach · Legally defensible output
        </div>
      </div>
    </div>
  );
}

// ─── Scan steps ────────────────────────────────────────────────────────────────

const SCAN_STEPS = [
  'Resolving domain & probing endpoints...',
  'Fetching homepage content...',
  'Detecting consent management mechanisms...',
  'Reading privacy notice content...',
  'Checking HTTP security headers...',
  'Evaluating data principal rights provisions...',
  'Inspecting grievance redressal mechanisms...',
  "Assessing children's data & cross-border provisions...",
  'Computing DPDP Act 2023 compliance scores...',
];

// ─── Main ──────────────────────────────────────────────────────────────────────

export default function DPDPGapX() {
  const [url, setUrl] = useState('');
  const [scanning, setScanning] = useState(false);
  const [scanStep, setScanStep] = useState(0);
  const [result, setResult] = useState<ScanResult | null>(null);
  const [error, setError] = useState('');
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [gapFilter, setGapFilter] = useState('all');
  const inputRef = useRef<HTMLInputElement>(null);
  const stepRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const toggle = (id: string) => setExpanded(p => ({ ...p, [id]: !p[id] }));

  const doScan = useCallback(async () => {
    const trimmed = url.trim();
    if (!trimmed) return;
    setScanning(true); setResult(null); setError('');
    setScanStep(0); setExpanded({}); setGapFilter('all');

    let step = 0;
    stepRef.current = setInterval(() => {
      step++;
      if (step < SCAN_STEPS.length) setScanStep(step);
    }, 950);

    try {
      const res = await fetch('/api/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: trimmed }),
      });
      if (!res.ok) { const e = await res.json(); throw new Error(e.error ?? 'Scan failed'); }
      setResult(await res.json());
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Something went wrong. Please try again.');
    } finally {
      if (stepRef.current) clearInterval(stepRef.current);
      setScanning(false); setScanStep(0);
    }
  }, [url]);

  const reset = () => { setResult(null); setError(''); setUrl(''); setTimeout(() => inputRef.current?.focus(), 80); };

  // ── RESULTS ──────────────────────────────────────────────────────────────────
  if (result) {
    const p = pct(result.overallScore, result.maxBaseScore);
    const cc = complianceCfg(result.complianceLevel);
    const gaps = result.gaps;
    const filtered = gapFilter === 'all' ? gaps : gaps.filter(g => g.severity === gapFilter);
    const crit   = gaps.filter(g => g.severity === 'Critical').length;
    const high   = gaps.filter(g => g.severity === 'High').length;
    const med    = gaps.filter(g => g.severity === 'Medium').length;
    const passed = result.categories.filter(c => c.status === 'pass' && !c.isBonus).length;
    const unverifiedCats = result.categories.filter(c => c.status === 'unverified' && !c.isBonus).length;

    return (
      <div style={{ maxWidth: 860, margin: '0 auto', padding: '36px 24px 100px' }}>

        {/* Top bar */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 34, height: 34, borderRadius: 9, background: 'linear-gradient(135deg,#7c3aed,#a78bfa)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 20px rgba(124,58,237,0.5)' }}>
              <Zap size={16} color="white" />
            </div>
            <div>
              <div style={{ fontSize: 14, fontWeight: 800, color: '#e2e8f0', letterSpacing: '-0.02em', lineHeight: 1 }}>DPDP GapX</div>
              <div style={{ fontSize: 9, color: '#6060a0', marginTop: 1, letterSpacing: '0.04em' }}>DPDP ACT 2023 · GAP ANALYSIS</div>
            </div>
          </div>
          <button onClick={reset} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px', borderRadius: 8, background: 'rgba(124,58,237,0.1)', border: '1px solid rgba(124,58,237,0.22)', color: '#a78bfa', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
            <RotateCcw size={12} /> Scan another site
          </button>
        </div>

        {/* ── IMPORTANT DISCLAIMER at top ── */}
        <div style={{ padding: '14px 18px', borderRadius: 12, marginBottom: 20, background: 'rgba(245,158,11,0.05)', border: '1px solid rgba(245,158,11,0.22)', display: 'flex', alignItems: 'flex-start', gap: 10 }}>
          <Info size={15} color="#f59e0b" style={{ flexShrink: 0, marginTop: 1 }} />
          <div>
            <div style={{ fontSize: 11, fontWeight: 800, color: '#f59e0b', marginBottom: 5, letterSpacing: '0.06em' }}>
              IMPORTANT — READ BEFORE ACTING ON THIS REPORT
            </div>
            <div style={{ fontSize: 12, color: '#b0a080', lineHeight: 1.75 }}>
              This is an <strong style={{ color: '#d4b060' }}>automated scan of publicly accessible information only.</strong>{' '}
              It uses pattern-matching on public pages and HTTP headers — it <strong style={{ color: '#d4b060' }}>cannot audit</strong> server-side data handling, internal processes, backend systems, login-gated content, vendor contracts, or actual data flows.
              {' '}<strong style={{ color: '#d4b060' }}>Absence of a detected element does not mean non-compliance</strong> — controls may be implemented via internal mechanisms, application layers, or backend systems.
              {' '}Results may contain errors. For a legally defensible assessment, engage a qualified data protection professional.
            </div>
          </div>
        </div>

        {/* Score hero */}
        <div style={{ background: 'linear-gradient(135deg,#08061a 0%,#110a2e 50%,#08061a 100%)', border: '1px solid rgba(124,58,237,0.22)', borderRadius: 20, padding: '30px 32px', marginBottom: 18, position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: -80, right: -80, width: 280, height: 280, borderRadius: '50%', background: `radial-gradient(circle,${cc.c}15 0%,transparent 70%)`, pointerEvents: 'none' }} />
          <div style={{ display: 'flex', alignItems: 'center', gap: 28, position: 'relative' }}>
            <div style={{ flexShrink: 0 }}><ScoreRing score={result.overallScore} max={result.maxBaseScore} /></div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' as const, marginBottom: 10 }}>
                <span style={{ fontSize: 21, fontWeight: 800, color: '#eee8ff', letterSpacing: '-0.03em', wordBreak: 'break-all' as const }}>{result.domain}</span>
                <span style={{ fontSize: 12, fontWeight: 700, padding: '4px 13px', borderRadius: 20, background: cc.bg, border: `1px solid ${cc.border}`, color: cc.c }}>{cc.label}</span>
              </div>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' as const, marginBottom: 14 }}>
                {crit  > 0 && <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 5, background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.25)', color: '#ef4444' }}>{crit} Critical</span>}
                {high  > 0 && <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 5, background: 'rgba(249,115,22,0.12)', border: '1px solid rgba(249,115,22,0.25)', color: '#f97316' }}>{high} High</span>}
                {med   > 0 && <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 5, background: 'rgba(234,179,8,0.12)',  border: '1px solid rgba(234,179,8,0.25)',  color: '#eab308' }}>{med} Medium</span>}
                {passed > 0 && <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 5, background: 'rgba(34,211,165,0.12)', border: '1px solid rgba(34,211,165,0.25)', color: '#22d3a5' }}>{passed} Passed</span>}
                {unverifiedCats > 0 && <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 5, background: 'rgba(129,140,248,0.12)', border: '1px solid rgba(129,140,248,0.25)', color: '#818cf8' }}>{unverifiedCats} Cannot Verify</span>}
                {result.bonusScore > 0 && <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 5, background: 'rgba(124,58,237,0.12)', border: '1px solid rgba(124,58,237,0.25)', color: '#a78bfa' }}>+{result.bonusScore} Bonus pts</span>}
              </div>
              {/* Urgency CTA — shown for any non-Excellent result */}
              {cc.cta && (
                <div style={{ marginBottom: 14 }}>
                  <a
                    href="https://dpdpone.in/contact"
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      display: 'inline-flex', alignItems: 'center', gap: 8,
                      padding: cc.ctaUrgency === 'critical' || cc.ctaUrgency === 'high' ? '11px 20px' : '9px 18px',
                      borderRadius: 10, textDecoration: 'none', fontSize: 13, fontWeight: 700,
                      background: cc.ctaUrgency === 'critical'
                        ? 'linear-gradient(135deg,#ef4444,#dc2626)'
                        : cc.ctaUrgency === 'high'
                        ? 'linear-gradient(135deg,#f97316,#ea6a0a)'
                        : cc.ctaUrgency === 'medium'
                        ? 'linear-gradient(135deg,#f59e0b,#d97706)'
                        : 'linear-gradient(135deg,#7c3aed,#9f5ef5)',
                      color: 'white',
                      boxShadow: cc.ctaUrgency === 'critical'
                        ? '0 4px 20px rgba(239,68,68,0.45)'
                        : cc.ctaUrgency === 'high'
                        ? '0 4px 20px rgba(249,115,22,0.45)'
                        : cc.ctaUrgency === 'medium'
                        ? '0 4px 20px rgba(245,158,11,0.4)'
                        : '0 4px 20px rgba(124,58,237,0.4)',
                    }}
                  >
                    <Zap size={13} />
                    {cc.cta}
                    <ExternalLink size={11} style={{ opacity: 0.75 }} />
                  </a>
                  {(cc.ctaUrgency === 'critical' || cc.ctaUrgency === 'high') && (
                    <div style={{ marginTop: 7, fontSize: 11, color: cc.c, fontWeight: 600 }}>
                      Organisations at this compliance level face significant penalty exposure under DPDP Act 2023.
                    </div>
                  )}
                </div>
              )}

              <div style={{ display: 'flex', gap: 18, fontSize: 11, color: '#7070a0', flexWrap: 'wrap' as const }}>
                <span>⏱ {(result.durationMs / 1000).toFixed(1)}s scan</span>
                <span>📄 {result.pagesScanned.length} page{result.pagesScanned.length !== 1 ? 's' : ''} analysed</span>
                <span>📅 {new Date(result.scanTime).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                <span style={{ textTransform: 'capitalize' }}>🔍 {result.scanMethod} scan</span>
              </div>
              {/* Score note for limited scans */}
              {result.unverifiedChecksCount > 0 && (
                <div style={{ marginTop: 10, fontSize: 11, color: '#818cf8', lineHeight: 1.5 }}>
                  ⚠ Score based on {result.maxBaseScore} verifiable points — {result.unverifiedChecksCount} check{result.unverifiedChecksCount !== 1 ? 's' : ''} could not be verified via public scan and may be compliant
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Scan limitation banner */}
        {result.fetchError && (
          <div style={{ padding: '13px 16px', borderRadius: 12, marginBottom: 18, background: 'rgba(249,115,22,0.05)', border: '1px solid rgba(249,115,22,0.2)', display: 'flex', alignItems: 'flex-start', gap: 10 }}>
            <AlertCircle size={14} color="#f97316" style={{ flexShrink: 0, marginTop: 1 }} />
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#f97316', marginBottom: 4 }}>Scan Limitation Detected</div>
              <div style={{ fontSize: 12, color: '#b08050', lineHeight: 1.7 }}>{result.fetchError}</div>
              {result.limitedScanReason && <div style={{ fontSize: 12, color: '#9090b8', marginTop: 6, lineHeight: 1.7 }}>{result.limitedScanReason}</div>}
              <div style={{ fontSize: 12, color: '#7070a0', marginTop: 6, lineHeight: 1.7, fontStyle: 'italic' }}>
                For websites that restrict automated access, a manual audit by a qualified compliance professional is strongly recommended.
              </div>
            </div>
          </div>
        )}

        {/* Section Analysis */}
        <div style={{ marginBottom: 32 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
            <Activity size={14} color="#7c3aed" />
            <span style={{ fontSize: 11, fontWeight: 800, color: '#7c3aed', letterSpacing: '0.1em', textTransform: 'uppercase' as const }}>DPDP Section-by-Section Analysis</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
            {result.categories.map(cat => (
              <CategoryCard key={cat.id} cat={cat} expanded={!!expanded[cat.id]} onToggle={() => toggle(cat.id)} />
            ))}
          </div>
        </div>

        {/* Gap Remediation Roadmap */}
        {gaps.length > 0 && (
          <div style={{ marginBottom: 32 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
              <AlertCircle size={14} color="#f97316" />
              <span style={{ fontSize: 11, fontWeight: 800, color: '#f97316', letterSpacing: '0.1em', textTransform: 'uppercase' as const }}>Gap Remediation Roadmap</span>
              <span style={{ fontSize: 11, color: '#7070a0', marginLeft: 4 }}>— prioritised by severity</span>
            </div>
            <div style={{ fontSize: 12, color: '#8080a8', lineHeight: 1.7, marginBottom: 12, padding: '10px 14px', borderRadius: 9, background: 'rgba(249,115,22,0.04)', border: '1px solid rgba(249,115,22,0.1)' }}>
              These are gaps confirmed in publicly accessible content. Controls may be implemented differently in your internal systems — indicate which are already addressed via your organisation&apos;s processes when engaging with a DPDP auditor.
            </div>
            <div style={{ display: 'flex', gap: 5, marginBottom: 14, flexWrap: 'wrap' as const }}>
              {(['all', 'Critical', 'High', 'Medium'] as const).map(sev => {
                const count = sev === 'all' ? gaps.length : gaps.filter(g => g.severity === sev).length;
                if (count === 0 && sev !== 'all') return null;
                const active = gapFilter === sev;
                const c = sev === 'all' ? '#64748b' : sevCfg(sev).c;
                return (
                  <button key={sev} onClick={() => setGapFilter(sev)} style={{ padding: '5px 13px', borderRadius: 6, fontSize: 11, fontWeight: 600, cursor: 'pointer', border: `1px solid ${active ? c + '55' : 'rgba(255,255,255,0.06)'}`, background: active ? `${c}15` : 'transparent', color: active ? c : '#8080a8' }}>
                    {sev === 'all' ? 'All gaps' : sev} ({count})
                  </button>
                );
              })}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
              {filtered.map((gap, i) => {
                const sc = sevCfg(gap.severity);
                return (
                  <div key={i} style={{ padding: '15px 18px', borderRadius: 11, background: sc.bg, border: `1px solid ${sc.border}` }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                      <div style={{ width: 7, height: 7, borderRadius: '50%', background: sc.c, flexShrink: 0, marginTop: 5, boxShadow: `0 0 8px ${sc.c}80` }} />
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 6, flexWrap: 'wrap' as const }}>
                          <span style={{ fontSize: 11, fontWeight: 800, color: sc.c }}>{gap.severity}</span>
                          <span style={{ fontSize: 10, color: '#8080a8', padding: '1px 7px', borderRadius: 4, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>{gap.dpdpSection}</span>
                          <span style={{ fontSize: 10, color: '#7070a0' }}>{gap.category}</span>
                        </div>
                        <div style={{ fontSize: 13, fontWeight: 600, color: '#d0ccee', marginBottom: 8, lineHeight: 1.45 }}>{gap.gap}</div>
                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 7 }}>
                          <ArrowRight size={11} color="#7c3aed" style={{ flexShrink: 0, marginTop: 3 }} />
                          <div style={{ fontSize: 12, color: '#9090b8', lineHeight: 1.7 }}>{gap.recommendation}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Security Headers */}
        <div style={{ marginBottom: 32 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
            <Lock size={14} color="#7c3aed" />
            <span style={{ fontSize: 11, fontWeight: 800, color: '#a78bfa', letterSpacing: '0.1em', textTransform: 'uppercase' as const }}>HTTP Security Headers</span>
            <span style={{ fontSize: 11, color: '#7070a0' }}>DPDP Section 8 — Technical Safeguards</span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(255px, 1fr))', gap: 7 }}>
            {result.securityHeaders.map(h => (
              <div key={h.header} style={{ padding: '13px 15px', borderRadius: 10, background: h.present ? 'rgba(34,211,165,0.04)' : 'rgba(239,68,68,0.03)', border: `1px solid ${h.present ? 'rgba(34,211,165,0.14)' : 'rgba(239,68,68,0.14)'}` }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 5 }}>
                  {h.present ? <CheckCircle2 size={12} color="#22d3a5" /> : <XCircle size={12} color="#ef4444" />}
                  <span style={{ fontSize: 10, fontWeight: 700, color: h.present ? '#22d3a5' : '#ef4444', fontFamily: 'monospace' }}>{h.header}</span>
                </div>
                <div style={{ fontSize: 11, color: '#8080a8', lineHeight: 1.6 }}>{h.description}</div>
                {h.present && h.value && <div style={{ marginTop: 5, fontSize: 9, color: '#6060a0', fontFamily: 'monospace', wordBreak: 'break-all' as const }}>{h.value.substring(0, 50)}{h.value.length > 50 ? '…' : ''}</div>}
              </div>
            ))}
          </div>
        </div>

        {/* Interview items section */}
        {result.interviewItems && result.interviewItems.length > 0 && (
          <InterviewSection items={result.interviewItems} />
        )}

        {/* CTA banner */}
        <CTABanner />

        {/* Full Disclaimer at bottom */}
        <div style={{ padding: '20px 24px', borderRadius: 14, background: 'rgba(124,58,237,0.04)', border: '1px solid rgba(124,58,237,0.12)' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
            <Info size={14} color="#7c3aed" style={{ flexShrink: 0, marginTop: 1 }} />
            <div>
              <div style={{ fontSize: 10, fontWeight: 800, color: '#7c3aed', marginBottom: 8, letterSpacing: '0.08em' }}>FULL DISCLAIMER</div>
              <div style={{ fontSize: 12, color: '#9090b8', lineHeight: 1.85 }}>
                This is a <strong style={{ color: '#b0b0d8' }}>basic, automated gap analysis</strong> based solely on publicly accessible information from your website. This tool uses pattern-matching on publicly available pages and HTTP response headers — it <strong style={{ color: '#b0b0d8' }}>cannot audit</strong> server-side data handling, internal processes, backend systems, vendor contracts, consent records, or actual data flows.
                <br /><br />
                Scores reflect only what is detectable from public-facing content at the time of scanning. The absence of a detected element does not guarantee non-compliance — many controls are implemented via internal systems, application layers, or backend mechanisms that are not visible to automated scanners. Enterprise platforms often implement compliance controls in ways that are not detectable from a public homepage scan. <strong style={{ color: '#b0b0d8' }}>Results may contain errors. Actual compliance may significantly differ.</strong>
                <br /><br />
                If we were unable to scan your website (due to bot protection, WAF rules, or access restrictions), scores reflect only what could be technically verified — treat them as indicative, not definitive. Score is calculated based on verifiable checks only and does not penalise for controls that could not be assessed.
                <br /><br />
                For a <strong style={{ color: '#a78bfa' }}>comprehensive, legally defensible DPDP compliance assessment</strong> — covering internal policies, vendor contracts, data flow mapping, consent records, DPIA processes, employee training, and full technical audits — engage a qualified data protection professional.
                <br /><br />
                <span style={{ color: '#7070a0' }}>This report does not constitute legal advice. Results are based on public information as of {new Date(result.scanTime).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}.</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── SCANNING ──────────────────────────────────────────────────────────────────
  if (scanning) {
    const domain = url.replace(/^https?:\/\//, '').split('/')[0];
    return (
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px 24px' }}>
        <div style={{ maxWidth: 520, width: '100%' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, marginBottom: 48 }}>
            <div style={{ width: 34, height: 34, borderRadius: 9, background: 'linear-gradient(135deg,#7c3aed,#a78bfa)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 20px rgba(124,58,237,0.5)' }}>
              <Zap size={16} color="white" />
            </div>
            <span style={{ fontSize: 15, fontWeight: 800, color: '#e2e8f0', letterSpacing: '-0.02em' }}>DPDP GapX</span>
          </div>
          <div style={{ textAlign: 'center', marginBottom: 36 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#7c3aed', letterSpacing: '0.12em', marginBottom: 8, textTransform: 'uppercase' as const }}>Scanning</div>
            <div style={{ fontSize: 24, fontWeight: 800, color: '#eee8ff', letterSpacing: '-0.03em' }}>{domain}</div>
          </div>
          <div style={{ height: 2, width: '100%', background: 'rgba(124,58,237,0.08)', borderRadius: 1, marginBottom: 36, position: 'relative', overflow: 'hidden' }}>
            <div className="scanner-beam" />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
            {SCAN_STEPS.map((step, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, opacity: i <= scanStep ? 1 : 0.18, transition: 'opacity 0.5s ease' }}>
                <div style={{ flexShrink: 0, width: 14, height: 14, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {i < scanStep
                    ? <CheckCircle2 size={13} color="#22d3a5" />
                    : i === scanStep
                    ? <Loader2 size={13} color="#7c3aed" className="spin" />
                    : <div style={{ width: 5, height: 5, borderRadius: '50%', background: 'rgba(255,255,255,0.1)', margin: '4px auto' }} />}
                </div>
                <span style={{ fontSize: 12, color: i < scanStep ? '#22d3a5' : i === scanStep ? '#a78bfa' : '#3a3a6a' }}>{step}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // ── LANDING ───────────────────────────────────────────────────────────────────
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '48px 24px 80px', position: 'relative', overflow: 'hidden' }}>
      {/* Ambient blobs */}
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0 }}>
        <div style={{ position: 'absolute', top: '10%', left: '50%', transform: 'translateX(-50%)', width: 700, height: 350, borderRadius: '50%', background: 'radial-gradient(ellipse,rgba(124,58,237,0.07) 0%,transparent 70%)' }} />
        <div style={{ position: 'absolute', bottom: '15%', left: '20%', width: 400, height: 250, borderRadius: '50%', background: 'radial-gradient(ellipse,rgba(167,139,250,0.04) 0%,transparent 70%)' }} />
      </div>

      <div style={{ maxWidth: 620, width: '100%', textAlign: 'center', position: 'relative', zIndex: 1 }}>

        {/* Logo */}
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 10, marginBottom: 32, padding: '7px 16px 7px 10px', borderRadius: 14, background: 'rgba(124,58,237,0.08)', border: '1px solid rgba(124,58,237,0.22)', backdropFilter: 'blur(8px)' }}>
          <div style={{ width: 30, height: 30, borderRadius: 8, background: 'linear-gradient(135deg,#7c3aed,#a78bfa)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 15px rgba(124,58,237,0.5)' }}>
            <Zap size={14} color="white" />
          </div>
          <span style={{ fontSize: 14, fontWeight: 800, color: '#e2e8f0', letterSpacing: '-0.02em' }}>DPDP GapX</span>
          <span style={{ fontSize: 9, fontWeight: 800, color: '#7c3aed', letterSpacing: '0.1em', background: 'rgba(124,58,237,0.15)', padding: '2px 7px', borderRadius: 4 }}>BETA</span>
        </div>

        {/* Headline */}
        <h1 style={{ fontSize: 'clamp(36px,6vw,52px)', fontWeight: 900, lineHeight: 1.08, letterSpacing: '-0.04em', color: '#f0eeff', marginBottom: 18 }}>
          Is your website<br />
          <span style={{ background: 'linear-gradient(135deg,#7c3aed 0%,#a78bfa 40%,#c4b5fd 80%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
            DPDP compliant?
          </span>
        </h1>

        <p style={{ fontSize: 15, color: '#8080a8', lineHeight: 1.75, maxWidth: 480, margin: '0 auto 28px' }}>
          Instant, automated gap analysis against India&apos;s{' '}
          <span style={{ color: '#7c3aed', fontWeight: 600 }}>Digital Personal Data Protection Act 2023</span>.
          Enter any website URL — we&apos;ll check 9 critical compliance areas and tell you exactly where the gaps are.
        </p>

        {/* Scan scope notice on landing */}
        <div style={{ padding: '12px 16px', borderRadius: 10, marginBottom: 20, background: 'rgba(245,158,11,0.05)', border: '1px solid rgba(245,158,11,0.18)', textAlign: 'left', display: 'flex', gap: 9, alignItems: 'flex-start', backdropFilter: 'blur(8px)' }}>
          <Info size={13} color="#f59e0b" style={{ flexShrink: 0, marginTop: 1 }} />
          <div style={{ fontSize: 12, color: '#a09060', lineHeight: 1.7 }}>
            <span style={{ color: '#c0a860', fontWeight: 700 }}>Public-information scan only.</span>
            {' '}This tool analyses publicly accessible pages. Controls implemented via internal systems, application layers, or backend processes cannot be detected — their absence in this report does not mean non-compliance. Results may contain errors and are not a substitute for a professional DPDP audit.
          </div>
        </div>

        {/* URL input */}
        <div style={{ position: 'relative', marginBottom: 12 }}>
          <div style={{ position: 'absolute', left: 17, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}>
            <Search size={16} color="#5050a0" />
          </div>
          <input
            ref={inputRef} type="url" value={url} autoFocus
            onChange={e => setUrl(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && doScan()}
            placeholder="https://yourwebsite.com"
            style={{
              width: '100%', padding: '17px 17px 17px 46px', borderRadius: 13, fontSize: 15,
              background: 'rgba(8,6,26,0.9)', border: error ? '1px solid rgba(239,68,68,0.45)' : '1px solid rgba(124,58,237,0.25)',
              color: '#e2e8f0', outline: 'none', backdropFilter: 'blur(12px)',
              boxShadow: '0 0 0 1px rgba(124,58,237,0.04) inset, 0 4px 24px rgba(0,0,0,0.4)',
            }}
          />
        </div>

        {/* Error */}
        {error && (
          <div style={{ padding: '10px 14px', borderRadius: 9, marginBottom: 12, background: 'rgba(239,68,68,0.07)', border: '1px solid rgba(239,68,68,0.2)', display: 'flex', gap: 8, alignItems: 'flex-start', textAlign: 'left' }}>
            <XCircle size={13} color="#ef4444" style={{ flexShrink: 0, marginTop: 1 }} />
            <span style={{ fontSize: 12, color: '#ef4444', lineHeight: 1.5 }}>{error}</span>
          </div>
        )}

        {/* CTA */}
        <button onClick={doScan} disabled={!url.trim()} style={{
          width: '100%', padding: '16px', borderRadius: 13, border: 'none', fontSize: 14, fontWeight: 700,
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 32,
          cursor: url.trim() ? 'pointer' : 'not-allowed',
          background: url.trim() ? 'linear-gradient(135deg,#7c3aed 0%,#9f5ef5 60%,#7c3aed 100%)' : 'rgba(124,58,237,0.12)',
          color: url.trim() ? 'white' : '#4040a0',
          boxShadow: url.trim() ? '0 4px 24px rgba(124,58,237,0.4)' : 'none',
        }}>
          <Zap size={15} />
          Run DPDP Gap Analysis
        </button>

        {/* Checks grid */}
        <div style={{ marginBottom: 28 }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: '#5050a0', letterSpacing: '0.1em', marginBottom: 12, textTransform: 'uppercase' as const }}>
            9 DPDP Act 2023 areas checked
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 7 }}>
            {[
              { Icon: Shield,    label: 'Consent Mechanism',     sec: 'Section 6 & 7' },
              { Icon: FileText,  label: 'Privacy Notice',        sec: 'Section 5' },
              { Icon: Scale,     label: 'Grievance Redressal',   sec: 'Section 13' },
              { Icon: Lock,      label: 'Data Security',         sec: 'Section 8' },
              { Icon: Users,     label: 'Data Principal Rights', sec: 'Section 11–14' },
              { Icon: Building2, label: 'DPO & Contact',         sec: 'DPDP Rules' },
              { Icon: Clock,     label: 'Data Retention',        sec: 'Section 8(7)' },
              { Icon: Baby,      label: "Children's Data",       sec: 'Section 9' },
              { Icon: Globe,     label: 'Cross-border Transfer', sec: 'Section 16' },
            ].map(({ Icon, label, sec }) => (
              <div key={label} style={{ padding: '12px 13px', borderRadius: 10, textAlign: 'left', background: 'rgba(8,6,26,0.6)', border: '1px solid rgba(124,58,237,0.1)', display: 'flex', alignItems: 'flex-start', gap: 9, backdropFilter: 'blur(8px)' }}>
                <Icon size={13} color="#7c3aed" style={{ flexShrink: 0, marginTop: 1 }} />
                <div>
                  <div style={{ fontSize: 11, fontWeight: 600, color: '#9090c0', lineHeight: 1.3 }}>{label}</div>
                  <div style={{ fontSize: 9, color: '#5050a0', marginTop: 2 }}>{sec}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
