import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const maxDuration = 30;

// ---- Pattern libraries ----
const CONSENT_PATTERNS = [
  /cookie[\s-]?consent/i, /consent[\s-]?banner/i, /cookiebot/i, /onetrust/i,
  /usercentrics/i, /trustarc/i, /we use cookies/i, /this site uses cookies/i,
  /accept.*cookies/i, /cookie preferences/i, /manage cookies/i,
  /consent.*management/i, /data.*consent/i, /consentmanager/i,
  /didomi/i, /quantcast.*choice/i, /cookie.*notice/i,
];
const WITHDRAWAL_PATTERNS = [
  /withdraw.*consent/i, /revoke.*consent/i, /opt[\s-]?out/i, /unsubscribe/i,
  /manage.*preference/i, /consent.*setting/i, /cookie.*setting/i,
  /change.*consent/i, /update.*preference/i,
];
const PRIVACY_LINK_PATTERNS = [
  /privacy[\s-]?polic/i, /privacy[\s-]?notice/i, /data[\s-]?protection[\s-]?polic/i,
  /data[\s-]?privacy/i,
];
const PURPOSE_PATTERNS = [
  /purpose.*processing/i, /purpose.*collect/i, /we collect.*data.*for/i,
  /use.*information.*for/i, /why we collect/i, /data.*used.*for/i,
  /processing.*purpose/i, /legal.*basis/i, /lawful.*basis/i,
];
const DATA_CATEGORY_PATTERNS = [
  /personal.*data/i, /sensitive.*data/i, /categories.*data/i,
  /types.*information/i, /information.*collect/i,
];
const GRIEVANCE_PATTERNS = [
  /grievance[\s-]?officer/i, /grievance[\s-]?redressal/i, /grievance[\s-]?mechanism/i,
  /complaint[\s-]?officer/i, /nodal[\s-]?officer/i,
];
const COMPLAINT_PATTERNS = [
  /file.*complaint/i, /submit.*complaint/i, /raise.*complaint/i,
  /complaint.*process/i, /complaint.*mechanism/i, /grievance.*form/i,
  /raise.*grievance/i, /grievance.*portal/i, /lodge.*complaint/i,
];
const RIGHTS_MENTION_PATTERNS = [
  /right to access/i, /right to correct/i, /right to erasure/i, /right to portabilit/i,
  /data.*principal.*right/i, /your.*rights/i, /exercise.*right/i,
  /access.*personal.*data/i, /correct.*personal.*data/i, /delete.*personal.*data/i,
  /data.*subject.*right/i, /right.*withdraw/i,
];
const RIGHTS_MECHANISM_PATTERNS = [
  /request.*form/i, /data.*request/i, /submit.*request/i, /privacy.*request/i,
  /rights.*request/i, /access.*request/i, /deletion.*request/i,
  /data@/i, /privacy@/i, /dpo@/i,
];
const DPO_PATTERNS = [
  /data[\s-]?protection[\s-]?officer/i, /\bDPO\b/,
  /chief[\s-]?privacy[\s-]?officer/i, /data[\s-]?protection[\s-]?manager/i,
  /privacy[\s-]?officer/i,
];
const CONTACT_PATTERNS = [
  /privacy@/i, /dpo@/i, /dataprotection@/i, /data\.protection@/i,
  /contact.*privacy/i, /privacy.*contact/i,
];
const RETENTION_PATTERNS = [
  /data[\s-]?retention/i, /retention[\s-]?period/i, /how long.*keep/i,
  /storage[\s-]?period/i, /retain.*data/i, /delete.*after/i, /purge.*after/i,
];
const CHILDREN_PATTERNS = [
  /child(ren)?['s]?\s+data/i, /\bminor\b/i, /parental[\s-]?consent/i,
  /age[\s-]?verif/i, /under[\s-]?18/i, /under[\s-]?13/i, /children[\s-]?polic/i,
  /guardian.*consent/i,
];
const CROSS_BORDER_PATTERNS = [
  /cross[\s-]?border/i, /international[\s-]?transfer/i, /transfer.*outside.*india/i,
  /transfer.*abroad/i, /overseas.*transfer/i, /section[\s-]?16/i,
];

// ---- Types ----
export interface CheckResult {
  label: string;
  found: boolean;
  points: number;
  detail: string;
  /**
   * true = scanner could not verify this control due to scan limitations
   * (bot protection, dynamic rendering, login-gated content).
   * This is NOT a confirmed gap — the control may be fully compliant
   * via internal systems, application layers, or backend mechanisms.
   */
  cannotVerify?: boolean;
}

export interface CategoryResult {
  id: string;
  name: string;
  dpdpSection: string;
  description: string;
  maxScore: number;
  score: number;
  /** Max score from checks that could actually be verified (used for fair scoring) */
  verifiableMax: number;
  isBonus: boolean;
  status: 'pass' | 'partial' | 'fail' | 'unverified';
  checks: CheckResult[];
}

export interface GapItem {
  category: string;
  gap: string;
  severity: 'Critical' | 'High' | 'Medium' | 'Low';
  dpdpSection: string;
  recommendation: string;
  /**
   * true = this gap could not be confirmed via public scan.
   * The organisation may already be compliant via internal controls.
   * Requires manual verification or stakeholder interview to determine.
   */
  cannotVerify?: boolean;
}

export interface InterviewItem {
  label: string;
  dpdpSection: string;
  description: string;
  artifactsNeeded: string;
}

export interface SecurityHeader {
  header: string;
  present: boolean;
  value: string;
  description: string;
}

export type ScanMethod = 'full' | 'partial' | 'limited';

export interface ScanResult {
  url: string;
  domain: string;
  scanTime: string;
  durationMs: number;
  overallScore: number;
  maxBaseScore: number;
  bonusScore: number;
  complianceLevel: 'Critical' | 'Needs Improvement' | 'Moderate' | 'Good' | 'Excellent';
  categories: CategoryResult[];
  gaps: GapItem[];
  securityHeaders: SecurityHeader[];
  fetchError?: string;
  scanMethod: ScanMethod;
  limitedScanReason?: string;
  pagesScanned: string[];
  /** Controls that require stakeholder interview — cannot be assessed via public scan */
  interviewItems: InterviewItem[];
  /** Number of checks that could not be verified due to scan limitations */
  unverifiedChecksCount: number;
}

// ---- Interview items: always required regardless of scan quality ----
const INTERVIEW_ITEMS: InterviewItem[] = [
  {
    label: 'Data Processing Agreements (DPAs) with all processors & sub-processors',
    dpdpSection: 'Section 8(2)',
    description: 'All third-party vendors and processors must be bound by a DPA ensuring DPDP-compliant data handling, sub-processing restrictions, and breach notification obligations.',
    artifactsNeeded: 'Vendor contracts, DPA templates, processor register, sub-processor list',
  },
  {
    label: 'Record of Processing Activities (ROPA) maintained and updated',
    dpdpSection: 'DPDP Rules',
    description: 'A comprehensive, current inventory of all personal data processing activities, data flows, purposes, and retention schedules across the organisation.',
    artifactsNeeded: 'ROPA spreadsheet or GRC tool export, data flow diagrams, processing register',
  },
  {
    label: 'Data Protection Impact Assessment (DPIA) for high-risk processing activities',
    dpdpSection: 'DPDP Rules',
    description: 'DPIA must be conducted before initiating processing activities that are likely to result in high risk to data principals (e.g., profiling, large-scale sensitive data, new technologies).',
    artifactsNeeded: 'DPIA reports, risk assessment documentation, DPO sign-off records, mitigation evidence',
  },
  {
    label: 'Employee and staff DPDP Act awareness training completed',
    dpdpSection: 'DPDP Rules',
    description: 'All employees who handle personal data should have completed formal DPDP Act training. Role-based training for HR, IT, legal, and customer-facing teams is expected.',
    artifactsNeeded: 'Training completion records, course materials, awareness program documentation',
  },
  {
    label: 'Data breach notification and incident response procedure documented and tested',
    dpdpSection: 'Section 8(6)',
    description: 'A documented, tested procedure for detecting, containing, investigating, and notifying the Data Protection Board and affected data principals within the prescribed timeline.',
    artifactsNeeded: 'Incident response runbook, breach notification templates, tabletop exercise records, escalation matrix',
  },
  {
    label: 'Consent records with timestamps and audit trail maintained',
    dpdpSection: 'Section 6',
    description: 'Demonstrable evidence that valid consent was obtained before processing commenced, with the ability to produce consent records to the Data Protection Board on demand.',
    artifactsNeeded: 'Consent management system (CMP) records, consent logs, withdrawal audit trails, consent version history',
  },
  {
    label: 'Data retention enforcement — automated deletion or anonymisation workflows',
    dpdpSection: 'Section 8(7)',
    description: 'Technical implementation of data deletion or anonymisation once the processing purpose is fulfilled. A written policy alone is insufficient — enforcement mechanisms must be verified.',
    artifactsNeeded: 'Data lifecycle management documentation, scheduled deletion job logs, anonymisation procedure evidence',
  },
  {
    label: 'Significant Data Fiduciary (SDF) determination and additional obligations assessment',
    dpdpSection: 'Section 10 / DPDP Rules',
    description: 'Assessment of whether the organisation qualifies as an SDF based on data volume, sensitivity, national security, and public order considerations — with compliance against additional SDF requirements.',
    artifactsNeeded: 'SDF assessment report, data volume analysis, DPO appointment letter, annual DPDP audit report',
  },
];

// ---- Helpers ----
function matchesAny(text: string, patterns: RegExp[]): boolean {
  return patterns.some(p => p.test(text));
}

const USER_AGENTS = [
  'Mozilla/5.0 (compatible; DPDPGapX/2.0; +https://dpdpone.in)',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Safari/605.1.15',
  'Googlebot/2.1 (+http://www.google.com/bot.html)',
];

async function tryFetch(url: string, userAgent: string, timeoutMs = 10000): Promise<{ response: Response | null; html: string; headers: Record<string, string> }> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        'User-Agent': userAgent,
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-IN,en;q=0.9',
        'Cache-Control': 'no-cache',
      },
      redirect: 'follow',
    });
    const headers: Record<string, string> = {};
    response.headers.forEach((v, k) => { headers[k.toLowerCase()] = v; });
    const html = await response.text();
    return { response, html, headers };
  } catch {
    return { response: null, html: '', headers: {} };
  } finally {
    clearTimeout(timer);
  }
}

async function tryHead(url: string, timeoutMs = 6000): Promise<{ ok: boolean; headers: Record<string, string>; isHttps: boolean }> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, {
      method: 'HEAD',
      signal: controller.signal,
      headers: { 'User-Agent': USER_AGENTS[0] },
      redirect: 'follow',
    });
    const headers: Record<string, string> = {};
    res.headers.forEach((v, k) => { headers[k.toLowerCase()] = v; });
    return { ok: res.ok || res.status < 400, headers, isHttps: res.url.startsWith('https://') };
  } catch {
    return { ok: false, headers: {}, isHttps: false };
  } finally {
    clearTimeout(timer);
  }
}

function extractLinks(html: string, baseUrl: string): string[] {
  const re = /href=["']([^"'#?]+)["']/gi;
  const links: string[] = [];
  let m;
  while ((m = re.exec(html)) !== null) {
    const href = m[1].trim();
    if (href.startsWith('http')) {
      links.push(href);
    } else if (href.startsWith('/')) {
      try {
        const base = new URL(baseUrl);
        links.push(`${base.protocol}//${base.host}${href}`);
      } catch { /* skip */ }
    }
  }
  return [...new Set(links)];
}

function findPrivacyUrl(html: string, baseUrl: string): string | null {
  const links = extractLinks(html, baseUrl);
  return links.find(l => PRIVACY_LINK_PATTERNS.some(p => p.test(l))) ?? null;
}

// Try fetching common privacy/terms pages directly
const COMMON_PAGES = [
  '/privacy', '/privacy-policy', '/privacy_policy', '/privacypolicy',
  '/terms', '/terms-of-service', '/legal', '/data-protection',
  '/en/privacy', '/en/privacy-policy', '/pages/privacy-policy',
];

async function fetchCommonPages(baseUrl: string): Promise<string> {
  const base = new URL(baseUrl);
  const origin = `${base.protocol}//${base.host}`;
  const texts: string[] = [];
  for (const path of COMMON_PAGES.slice(0, 5)) {
    const { html } = await tryFetch(`${origin}${path}`, USER_AGENTS[0], 5000);
    if (html && html.length > 500) {
      texts.push(html);
      break; // stop on first successful page
    }
  }
  return texts.join(' ');
}

// ---- Core scan logic (runs on any combined HTML) ----
function runAnalysis(combined: string, homeHtml: string, homeHeaders: Record<string, string>, httpsActive: boolean) {
  const SECURITY_HEADER_NAMES = [
    'strict-transport-security', 'content-security-policy', 'x-frame-options',
    'x-content-type-options', 'referrer-policy', 'permissions-policy',
  ];
  const presentSecHeaders = SECURITY_HEADER_NAMES.filter(h => homeHeaders[h]);
  const secHeaderScore = presentSecHeaders.length >= 4 ? 7 : presentSecHeaders.length >= 2 ? 5 : presentSecHeaders.length >= 1 ? 3 : 0;

  const consentBannerFound = matchesAny(combined, CONSENT_PATTERNS);
  const withdrawalFound = matchesAny(combined, WITHDRAWAL_PATTERNS);
  const privacyLinked = matchesAny(homeHtml, PRIVACY_LINK_PATTERNS) || !!findPrivacyUrl(homeHtml, '');
  const purposeFound = matchesAny(combined, PURPOSE_PATTERNS);
  const dataCategoryFound = matchesAny(combined, DATA_CATEGORY_PATTERNS);
  const grievanceFound = matchesAny(combined, GRIEVANCE_PATTERNS);
  const complaintMechFound = matchesAny(combined, COMPLAINT_PATTERNS);
  const rightsMentioned = matchesAny(combined, RIGHTS_MENTION_PATTERNS);
  const rightsMechanism = matchesAny(combined, RIGHTS_MECHANISM_PATTERNS);
  const dpoFound = matchesAny(combined, DPO_PATTERNS);
  const contactFound = matchesAny(combined, CONTACT_PATTERNS);
  const retentionFound = matchesAny(combined, RETENTION_PATTERNS);
  const childrenFound = matchesAny(combined, CHILDREN_PATTERNS);
  const crossBorderFound = matchesAny(combined, CROSS_BORDER_PATTERNS);

  const consentScore = (consentBannerFound ? 18 : 0) + (withdrawalFound ? 7 : 0);
  const privacyScore = (privacyLinked ? 8 : 0) + (purposeFound ? 6 : 0) + (dataCategoryFound ? 6 : 0);
  const grievanceScore = (grievanceFound ? 8 : 0) + (complaintMechFound ? 7 : 0);
  const securityScore = (httpsActive ? 8 : 0) + secHeaderScore;
  const rightsScore = (rightsMentioned ? 5 : 0) + (rightsMechanism ? 5 : 0);
  const dpoScore = (dpoFound ? 7 : 0) + (contactFound ? 3 : 0);
  const retentionScore = retentionFound ? 5 : 0;
  const childrenScore = childrenFound ? 10 : 0;
  const crossBorderScore = crossBorderFound ? 5 : 0;

  return {
    consentBannerFound, withdrawalFound, privacyLinked, purposeFound, dataCategoryFound,
    grievanceFound, complaintMechFound, rightsMentioned, rightsMechanism, dpoFound, contactFound,
    retentionFound, childrenFound, crossBorderFound, presentSecHeaders,
    consentScore, privacyScore, grievanceScore, securityScore, rightsScore,
    dpoScore, retentionScore, childrenScore, crossBorderScore,
  };
}

// ---- Build categories with verification awareness ----
function buildCategories(
  a: ReturnType<typeof runAnalysis>,
  hasHome: boolean,
  hasPrivacy: boolean,
): CategoryResult[] {
  // Determine verifiability per check type:
  // - Homepage-specific checks (consent banner, privacy link): need homepage
  // - Policy/privacy content checks (purposes, grievance, rights, DPO, retention): need any content
  // - Security checks (HTTPS, headers): always verifiable (from URL + HEAD response)
  const hasContent = hasHome || hasPrivacy;

  type CheckDef = {
    label: string; found: boolean; points: number; detail: string; cannotVerify?: boolean;
  };

  const makeCategory = (
    id: string, name: string, dpdpSection: string, description: string,
    maxScore: number, checks: CheckDef[], isBonus = false,
  ): CategoryResult => {
    const score = checks.reduce((s, c) => s + (c.found ? c.points : 0), 0);
    const verifiableChecks = checks.filter(c => !c.cannotVerify);
    const verifiableMax = verifiableChecks.reduce((s, c) => s + c.points, 0);
    const verifiedScore = verifiableChecks.reduce((s, c) => s + (c.found ? c.points : 0), 0);

    let status: 'pass' | 'partial' | 'fail' | 'unverified';
    if (verifiableMax === 0) {
      status = 'unverified';
    } else {
      const ratio = verifiedScore / verifiableMax;
      status = ratio >= 0.8 ? 'pass' : ratio >= 0.4 ? 'partial' : 'fail';
    }

    return { id, name, dpdpSection, description, maxScore, score, verifiableMax, isBonus, status, checks };
  };

  const cannotVerifyHomeOnly = !hasHome;        // Checks that strictly need homepage HTML
  const cannotVerifyContent  = !hasContent;     // Checks that need any page content

  const consentDetail = (found: boolean, cv: boolean) =>
    found ? 'Consent management mechanism or notice detected'
    : cv ? 'Could not verify via public scan — consent mechanisms are often implemented inside the application/portal (login-gated), via a CMP loaded by JavaScript, or enforced at the backend. This does not indicate non-compliance.'
    : 'No consent notice or CMP detected in publicly accessible page content — processing may occur without valid consent';

  const withdrawalDetail = (found: boolean, cv: boolean) =>
    found ? 'Opt-out or withdrawal mechanism found'
    : cv ? 'Could not verify via public scan — withdrawal options are typically available in account settings, cookie preference centres, or application dashboards which require authentication to access'
    : 'No clear withdrawal/opt-out mechanism found in publicly accessible content — required under DPDP Section 6(4)';

  const privacyLinkDetail = (found: boolean, cv: boolean) =>
    found ? 'Privacy policy or notice page accessible from homepage'
    : cv ? 'Could not verify from homepage — privacy policy may be accessible via the application, footer links rendered by JavaScript, or a dedicated legal/policy subdomain. Manual verification recommended.'
    : 'No privacy policy link detected on publicly accessible homepage';

  const contentDetail = (found: boolean, cv: boolean, positive: string, negative: string) =>
    found ? positive : cv ? 'Could not verify — page content was inaccessible to automated scanning. This control may be documented in the privacy policy or internal compliance documentation.' : negative;

  return [
    makeCategory('consent', 'Consent Notice & Mechanism', 'Section 6 & 7',
      'Freely given, specific, informed consent before processing — with an equally easy withdrawal option',
      25, [
        {
          label: 'Consent notice / CMP detected on page', found: a.consentBannerFound, points: 18,
          cannotVerify: cannotVerifyHomeOnly,
          detail: consentDetail(a.consentBannerFound, cannotVerifyHomeOnly),
        },
        {
          label: 'Consent withdrawal mechanism present', found: a.withdrawalFound, points: 7,
          cannotVerify: cannotVerifyContent,
          detail: withdrawalDetail(a.withdrawalFound, cannotVerifyContent),
        },
      ]
    ),
    makeCategory('privacy', 'Privacy Notice', 'Section 5',
      'Accessible notice detailing categories of data collected, processing purposes, and data principal rights',
      20, [
        {
          label: 'Privacy notice / policy page linked', found: a.privacyLinked, points: 8,
          cannotVerify: cannotVerifyHomeOnly,
          detail: privacyLinkDetail(a.privacyLinked, cannotVerifyHomeOnly),
        },
        {
          label: 'Data processing purposes documented', found: a.purposeFound, points: 6,
          cannotVerify: cannotVerifyContent,
          detail: contentDetail(a.purposeFound, cannotVerifyContent,
            'Purpose(s) of data collection described in accessible policy content',
            'Processing purposes not clearly stated in publicly accessible pages'),
        },
        {
          label: 'Data categories identified', found: a.dataCategoryFound, points: 6,
          cannotVerify: cannotVerifyContent,
          detail: contentDetail(a.dataCategoryFound, cannotVerifyContent,
            'Categories of personal data collected are identified',
            'No data category documentation found in accessible policy content'),
        },
      ]
    ),
    makeCategory('grievance', 'Grievance Redressal', 'Section 13',
      'Designated grievance officer with an accessible complaint mechanism for data principals',
      15, [
        {
          label: 'Grievance officer / nodal officer designated', found: a.grievanceFound, points: 8,
          cannotVerify: cannotVerifyContent,
          detail: contentDetail(a.grievanceFound, cannotVerifyContent,
            'Grievance officer or nodal officer reference found in accessible content',
            'No grievance officer found in publicly accessible pages — mandatory under DPDP Section 13'),
        },
        {
          label: 'Complaint mechanism accessible', found: a.complaintMechFound, points: 7,
          cannotVerify: cannotVerifyContent,
          detail: contentDetail(a.complaintMechFound, cannotVerifyContent,
            'Complaint process or form identified in accessible content',
            'No accessible complaint mechanism found in publicly available pages'),
        },
      ]
    ),
    makeCategory('security', 'Data Security Measures', 'Section 8',
      'Technical safeguards including transport encryption and HTTP security headers to protect personal data',
      15, [
        {
          // Security checks are ALWAYS verifiable (from URL scheme + HEAD response)
          label: 'HTTPS / TLS transport encryption active', found: a.securityScore >= 8, points: 8,
          cannotVerify: false,
          detail: a.securityScore >= 8
            ? 'Site served over HTTPS — data in transit is encrypted'
            : 'Site not served over HTTPS — personal data exposed to interception',
        },
        {
          label: `HTTP security headers present (${a.presentSecHeaders.length}/6)`,
          found: a.presentSecHeaders.length >= 2, points: 7,
          cannotVerify: false,
          detail: a.presentSecHeaders.length > 0
            ? `Detected: ${a.presentSecHeaders.join(', ')}`
            : 'No security headers detected',
        },
      ]
    ),
    makeCategory('rights', 'Data Principal Rights', 'Section 11–14',
      'Mechanisms enabling data principals to exercise rights of access, correction, erasure, and portability',
      10, [
        {
          label: 'Rights (access, correct, erase, nominate) communicated', found: a.rightsMentioned, points: 5,
          cannotVerify: cannotVerifyContent,
          detail: contentDetail(a.rightsMentioned, cannotVerifyContent,
            'Data principal rights referenced in accessible policy or pages',
            'No mention of data principal rights in publicly accessible content'),
        },
        {
          label: 'Rights request mechanism available', found: a.rightsMechanism, points: 5,
          cannotVerify: cannotVerifyContent,
          detail: contentDetail(a.rightsMechanism, cannotVerifyContent,
            'Request form, email, or portal for exercising rights found',
            'No mechanism found for data principals to submit rights requests'),
        },
      ]
    ),
    makeCategory('dpo', 'Data Fiduciary Contact / DPO', 'DPDP Rules',
      'Designated Data Protection Officer with published contact details',
      10, [
        {
          label: 'Data Protection Officer (DPO) designated', found: a.dpoFound, points: 7,
          cannotVerify: cannotVerifyContent,
          detail: contentDetail(a.dpoFound, cannotVerifyContent,
            'DPO or privacy officer reference found in accessible content',
            'No DPO or privacy officer found in publicly accessible pages'),
        },
        {
          label: 'Privacy contact details published', found: a.contactFound, points: 3,
          cannotVerify: cannotVerifyContent,
          detail: contentDetail(a.contactFound, cannotVerifyContent,
            'Dedicated privacy contact email or details available',
            'No dedicated privacy contact email found (e.g., privacy@, dpo@)'),
        },
      ]
    ),
    makeCategory('retention', 'Data Retention Policy', 'Section 8(7)',
      'Defined retention periods — personal data must be erased once the processing purpose is fulfilled',
      5, [
        {
          label: 'Data retention periods or storage duration stated', found: a.retentionFound, points: 5,
          cannotVerify: cannotVerifyContent,
          detail: contentDetail(a.retentionFound, cannotVerifyContent,
            'Retention period or data storage duration mentioned in accessible policy',
            'No data retention policy found in publicly accessible pages — required under Section 8(7)'),
        },
      ]
    ),
    makeCategory('children', "Children's Data Protection", 'Section 9',
      'Verifiable parental consent and age-appropriate safeguards for processing data of minors',
      10, [
        {
          label: "Children's data provisions / parental consent referenced", found: a.childrenFound, points: 10,
          cannotVerify: cannotVerifyContent,
          detail: contentDetail(a.childrenFound, cannotVerifyContent,
            "Children data protection provisions found in accessible content",
            "No provisions for children data protection detected in publicly accessible pages"),
        },
      ], true
    ),
    makeCategory('crossborder', 'Cross-border Data Transfer', 'Section 16',
      'Notice and applicable safeguards when personal data is transferred outside India',
      5, [
        {
          label: 'Cross-border / international transfer provisions mentioned', found: a.crossBorderFound, points: 5,
          cannotVerify: cannotVerifyContent,
          detail: contentDetail(a.crossBorderFound, cannotVerifyContent,
            'International data transfer provisions referenced in accessible content',
            'No cross-border transfer disclosure found in publicly accessible pages'),
        },
      ], true
    ),
  ];
}

function buildGaps(categories: CategoryResult[], a: ReturnType<typeof runAnalysis>): GapItem[] {
  const gaps: GapItem[] = [];
  void categories;

  // ---- Confirmed gaps (content checked and not found) ----
  if (!a.consentBannerFound) gaps.push({
    category: 'Consent Notice & Mechanism', severity: 'Critical', dpdpSection: 'Section 6, 7',
    gap: 'No consent notice or CMP detected on publicly accessible homepage',
    recommendation: 'Implement a Consent Management Platform (CMP) or a consent notice that presents specific, purpose-based consent requests before any personal data processing begins',
    cannotVerify: false,
  });
  if (!a.withdrawalFound) gaps.push({
    category: 'Consent Notice & Mechanism', severity: 'High', dpdpSection: 'Section 6(4)',
    gap: 'No consent withdrawal mechanism found in publicly accessible content',
    recommendation: 'Provide an equally easy mechanism for data principals to withdraw consent — add a preference centre, cookie settings, or opt-out link',
    cannotVerify: false,
  });
  if (!a.privacyLinked) gaps.push({
    category: 'Privacy Notice', severity: 'Critical', dpdpSection: 'Section 5',
    gap: 'No privacy notice or policy page linked from publicly accessible homepage',
    recommendation: 'Publish a comprehensive Privacy Notice prominently linked from the footer, covering data categories, processing purposes, retention periods, and data principal rights',
    cannotVerify: false,
  });
  if (!a.purposeFound) gaps.push({
    category: 'Privacy Notice', severity: 'High', dpdpSection: 'Section 5(1)(b)',
    gap: 'Specific data processing purposes not documented in accessible content',
    recommendation: 'Clearly state the specific purpose(s) for which personal data is collected and processed — vague purposes are insufficient under DPDP',
    cannotVerify: false,
  });
  if (!a.dataCategoryFound) gaps.push({
    category: 'Privacy Notice', severity: 'Medium', dpdpSection: 'Section 5',
    gap: 'Categories of personal data not identified in publicly accessible content',
    recommendation: 'List the categories of personal data collected (e.g., contact information, financial data, usage data) in your Privacy Notice',
    cannotVerify: false,
  });
  if (!a.grievanceFound) gaps.push({
    category: 'Grievance Redressal', severity: 'Critical', dpdpSection: 'Section 13',
    gap: 'No grievance officer designation found in publicly accessible pages',
    recommendation: 'Designate a Grievance Officer and publish their name and contact details on your website',
    cannotVerify: false,
  });
  if (!a.complaintMechFound) gaps.push({
    category: 'Grievance Redressal', severity: 'High', dpdpSection: 'Section 13',
    gap: 'No accessible complaint process or form found in publicly accessible pages',
    recommendation: 'Provide a clear, accessible process for data principals to file complaints — include a dedicated form, email address, or grievance portal link',
    cannotVerify: false,
  });
  if (a.securityScore < 8) gaps.push({
    category: 'Data Security Measures', severity: 'Critical', dpdpSection: 'Section 8',
    gap: 'HTTPS not active — personal data transmitted in plaintext',
    recommendation: 'Enable SSL/TLS immediately and enforce HTTPS via HTTP Strict Transport Security (HSTS)',
    cannotVerify: false,
  });
  if (a.presentSecHeaders.length < 2) gaps.push({
    category: 'Data Security Measures', severity: 'Medium', dpdpSection: 'Section 8',
    gap: `HTTP security headers absent or insufficient (${a.presentSecHeaders.length} of 6 found)`,
    recommendation: 'Implement HTTP security headers: Strict-Transport-Security (HSTS), Content-Security-Policy (CSP), X-Frame-Options, X-Content-Type-Options, and Referrer-Policy',
    cannotVerify: false,
  });
  if (!a.rightsMentioned) gaps.push({
    category: 'Data Principal Rights', severity: 'High', dpdpSection: 'Section 11–14',
    gap: 'Data principal rights not communicated in publicly accessible content',
    recommendation: 'Explicitly communicate rights of data principals: right to access, correction, erasure, portability, grievance, and nomination',
    cannotVerify: false,
  });
  if (!a.rightsMechanism) gaps.push({
    category: 'Data Principal Rights', severity: 'High', dpdpSection: 'Section 11–14',
    gap: 'No mechanism available to exercise data rights in publicly accessible pages',
    recommendation: 'Provide a clear, accessible mechanism (form, email, portal) for data principals to submit requests to exercise their rights under the DPDP Act',
    cannotVerify: false,
  });
  if (!a.dpoFound) gaps.push({
    category: 'Data Fiduciary Contact / DPO', severity: 'High', dpdpSection: 'DPDP Rules',
    gap: 'No Data Protection Officer or privacy contact found in publicly accessible pages',
    recommendation: 'Designate a Data Protection Officer (required for Significant Data Fiduciaries) or a privacy contact, and publish their details',
    cannotVerify: false,
  });
  if (!a.retentionFound) gaps.push({
    category: 'Data Retention Policy', severity: 'Medium', dpdpSection: 'Section 8(7)',
    gap: 'No data retention periods specified in publicly accessible policy content',
    recommendation: 'Define and publish data retention periods for each category of personal data — data must be erased or anonymised once the purpose is fulfilled',
    cannotVerify: false,
  });

  return gaps;
}

// ---- Main Handler ----
export async function POST(request: NextRequest) {
  const startTime = Date.now();

  try {
    const body = await request.json();
    let { url } = body as { url: string };

    if (!url || typeof url !== 'string') {
      return NextResponse.json({ error: 'URL is required' }, { status: 400 });
    }
    url = url.trim();
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      url = `https://${url}`;
    }
    let domain: string;
    try { domain = new URL(url).hostname; }
    catch { return NextResponse.json({ error: 'Invalid URL' }, { status: 400 }); }

    const pagesScanned: string[] = [];
    let homeHtml = '';
    let privacyHtml = '';
    let homeHeaders: Record<string, string> = {};
    let httpsWorking = false;
    let fetchError: string | undefined;
    let scanMethod: ScanMethod = 'full';
    let limitedScanReason: string | undefined;

    // ---- Strategy 1: Standard HTTPS fetch ----
    for (const ua of USER_AGENTS.slice(0, 3)) {
      const result = await tryFetch(url, ua, 10000);
      if (result.html && result.html.length > 200) {
        homeHtml = result.html;
        homeHeaders = result.headers;
        httpsWorking = result.response?.url?.startsWith('https://') ?? url.startsWith('https://');
        pagesScanned.push(url);
        break;
      }
    }

    // ---- Strategy 2: Try HTTP if HTTPS failed ----
    if (!homeHtml && url.startsWith('https://')) {
      const httpUrl = url.replace('https://', 'http://');
      const result = await tryFetch(httpUrl, USER_AGENTS[0], 8000);
      if (result.html && result.html.length > 200) {
        homeHtml = result.html;
        homeHeaders = result.headers;
        httpsWorking = false;
        pagesScanned.push(httpUrl);
        scanMethod = 'partial';
        fetchError = 'HTTPS unavailable — scanned via HTTP (unencrypted)';
      }
    }

    // ---- Strategy 3: HEAD-only (for headers + HTTPS check) ----
    if (!homeHtml) {
      const headResult = await tryHead(url, 6000);
      if (headResult.ok) {
        homeHeaders = headResult.headers;
        httpsWorking = headResult.isHttps || url.startsWith('https://');
        scanMethod = 'limited';
        fetchError = 'Website uses bot protection / WAF — conducting header-only assessment. Page content could not be scanned.';
        limitedScanReason = 'This website actively blocked automated page fetching (likely bot protection, WAF, or dynamic rendering). HTTP response headers were analysed. Content-dependent controls (consent, privacy policy, grievance, rights, DPO, retention) could not be verified via public scan — they may be fully compliant via internal systems, application layers, or backend mechanisms.';
        pagesScanned.push(`${url} (HEAD only)`);
      } else {
        httpsWorking = url.startsWith('https://');
        scanMethod = 'limited';
        fetchError = 'Website unreachable — unable to establish connection';
        limitedScanReason = 'The website could not be reached (DNS failure, network block, or the site is down). Score reflects only what can be technically verified without page content.';
        pagesScanned.push(`${url} (connection failed)`);
      }
    }

    // ---- Strategy 4: Probe common privacy/legal pages ----
    if (homeHtml) {
      const privUrl = findPrivacyUrl(homeHtml, url);
      if (privUrl) {
        const pr = await tryFetch(privUrl, USER_AGENTS[0], 8000);
        if (pr.html) {
          privacyHtml = pr.html;
          pagesScanned.push(privUrl);
        }
      }
    } else if (scanMethod === 'limited') {
      // Try fetching common pages directly even without homepage
      privacyHtml = await fetchCommonPages(url);
      if (privacyHtml) {
        pagesScanned.push(`${url}/privacy (direct probe)`);
        scanMethod = 'partial';
        fetchError = 'Homepage blocked — partial assessment conducted using direct privacy/legal page probing';
        limitedScanReason = 'Homepage could not be accessed. We directly probed common privacy and legal pages (/privacy, /privacy-policy, /terms, etc.) to conduct a partial assessment. Consent-related checks still could not be verified as they typically require homepage access.';
      }
    }

    const combined = `${homeHtml} ${privacyHtml}`;
    const hasHome    = homeHtml.length > 200;
    const hasPrivacy = privacyHtml.length > 200;

    const a = runAnalysis(combined, homeHtml, homeHeaders, httpsWorking);
    const categories = buildCategories(a, hasHome, hasPrivacy);

    // Score calculation uses verifiableMax to avoid penalising scan-blocked sites unfairly.
    // Only checks that could actually be verified contribute to the denominator.
    const baseCategories = categories.filter(c => !c.isBonus);
    const overallScore   = baseCategories.reduce((s, c) => s + c.score, 0);
    const maxBaseScore   = Math.max(1, baseCategories.reduce((s, c) => s + c.verifiableMax, 0));
    const bonusScore     = categories.filter(c => c.isBonus).reduce((s, c) => s + c.score, 0);

    const unverifiedChecksCount = categories.flatMap(c => c.checks).filter(ck => ck.cannotVerify).length;

    const pct = (overallScore / maxBaseScore) * 100;
    const complianceLevel =
      pct >= 85 ? 'Excellent'
      : pct >= 70 ? 'Good'
      : pct >= 50 ? 'Moderate'
      : pct >= 30 ? 'Needs Improvement'
      : 'Critical';

    // Only include gaps that are actually confirmed (not cannotVerify)
    // cannotVerify checks are shown separately in the UI under "Could Not Verify"
    const allGaps = buildGaps(categories, a);

    // Filter: exclude gaps for checks that were cannotVerify in the category analysis
    const confirmedGaps = allGaps.filter(gap => {
      // Find which checks were cannotVerify for this category
      const cat = categories.find(c => c.name === gap.category);
      if (!cat) return true;
      // If ALL checks in this category are cannotVerify, suppress the gaps
      const allUnverified = cat.checks.every(ck => ck.cannotVerify);
      return !allUnverified;
    });

    // Mark individual gaps as cannotVerify if their corresponding check was flagged
    const gaps = confirmedGaps.map(gap => {
      const cat = categories.find(c => c.name === gap.category);
      if (!cat) return gap;
      // Check if the corresponding checks are partially unverifiable
      const someUnverified = cat.checks.some(ck => ck.cannotVerify && !ck.found);
      return someUnverified ? { ...gap, cannotVerify: true } : gap;
    });

    const securityHeaders: SecurityHeader[] = [
      { header: 'Strict-Transport-Security', present: !!homeHeaders['strict-transport-security'], value: homeHeaders['strict-transport-security'] || '', description: 'Forces HTTPS connections and prevents downgrade attacks' },
      { header: 'Content-Security-Policy', present: !!homeHeaders['content-security-policy'], value: homeHeaders['content-security-policy'] ? 'Present' : '', description: 'Mitigates XSS and data injection attacks' },
      { header: 'X-Frame-Options', present: !!homeHeaders['x-frame-options'], value: homeHeaders['x-frame-options'] || '', description: 'Prevents clickjacking by controlling iframe embedding' },
      { header: 'X-Content-Type-Options', present: !!homeHeaders['x-content-type-options'], value: homeHeaders['x-content-type-options'] || '', description: 'Prevents MIME-type sniffing attacks' },
      { header: 'Referrer-Policy', present: !!homeHeaders['referrer-policy'], value: homeHeaders['referrer-policy'] || '', description: 'Controls referrer information sent with requests — limits data leakage' },
      { header: 'Permissions-Policy', present: !!homeHeaders['permissions-policy'], value: homeHeaders['permissions-policy'] ? 'Present' : '', description: 'Controls access to browser features (camera, microphone, geolocation)' },
    ];

    const result: ScanResult = {
      url, domain,
      scanTime: new Date().toISOString(),
      durationMs: Date.now() - startTime,
      overallScore, maxBaseScore, bonusScore, complianceLevel,
      categories, gaps, securityHeaders,
      fetchError, scanMethod, limitedScanReason, pagesScanned,
      interviewItems: INTERVIEW_ITEMS,
      unverifiedChecksCount,
    };

    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({ error: 'Scan failed: ' + (error instanceof Error ? error.message : 'Unknown error') }, { status: 500 });
  }
}
