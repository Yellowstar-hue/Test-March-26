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
}

export interface CategoryResult {
  id: string;
  name: string;
  dpdpSection: string;
  description: string;
  maxScore: number;
  score: number;
  isBonus: boolean;
  status: 'pass' | 'partial' | 'fail';
  checks: CheckResult[];
}

export interface GapItem {
  category: string;
  gap: string;
  severity: 'Critical' | 'High' | 'Medium' | 'Low';
  dpdpSection: string;
  recommendation: string;
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
}

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

function buildCategories(a: ReturnType<typeof runAnalysis>): CategoryResult[] {
  return [
    {
      id: 'consent', name: 'Consent Notice & Mechanism', dpdpSection: 'Section 6 & 7',
      description: 'Freely given, specific, informed consent before processing — with an equally easy withdrawal option',
      maxScore: 25, score: a.consentScore, isBonus: false,
      status: a.consentScore >= 20 ? 'pass' : a.consentScore >= 10 ? 'partial' : 'fail',
      checks: [
        { label: 'Consent notice / CMP detected on page', found: a.consentBannerFound, points: 18, detail: a.consentBannerFound ? 'Consent management mechanism or notice detected' : 'No consent notice or CMP detected — processing may occur without valid consent' },
        { label: 'Consent withdrawal mechanism present', found: a.withdrawalFound, points: 7, detail: a.withdrawalFound ? 'Opt-out or withdrawal mechanism found' : 'No clear withdrawal/opt-out mechanism found — required under DPDP Section 6(4)' },
      ],
    },
    {
      id: 'privacy', name: 'Privacy Notice', dpdpSection: 'Section 5',
      description: 'Accessible notice detailing categories of data collected, processing purposes, and data principal rights',
      maxScore: 20, score: a.privacyScore, isBonus: false,
      status: a.privacyScore >= 16 ? 'pass' : a.privacyScore >= 8 ? 'partial' : 'fail',
      checks: [
        { label: 'Privacy notice / policy page linked', found: a.privacyLinked, points: 8, detail: a.privacyLinked ? 'Privacy policy or notice page accessible' : 'No privacy policy link detected on homepage' },
        { label: 'Data processing purposes documented', found: a.purposeFound, points: 6, detail: a.purposeFound ? 'Purpose(s) of data collection described in policy' : 'Processing purposes not clearly stated' },
        { label: 'Data categories identified', found: a.dataCategoryFound, points: 6, detail: a.dataCategoryFound ? 'Categories of personal data collected are identified' : 'No data category documentation found in policy' },
      ],
    },
    {
      id: 'grievance', name: 'Grievance Redressal', dpdpSection: 'Section 13',
      description: 'Designated grievance officer with an accessible complaint mechanism for data principals',
      maxScore: 15, score: a.grievanceScore, isBonus: false,
      status: a.grievanceScore >= 12 ? 'pass' : a.grievanceScore >= 7 ? 'partial' : 'fail',
      checks: [
        { label: 'Grievance officer / nodal officer designated', found: a.grievanceFound, points: 8, detail: a.grievanceFound ? 'Grievance officer or nodal officer reference found' : 'No grievance officer found — mandatory under DPDP Section 13' },
        { label: 'Complaint mechanism accessible', found: a.complaintMechFound, points: 7, detail: a.complaintMechFound ? 'Complaint process or form identified' : 'No accessible complaint mechanism found' },
      ],
    },
    {
      id: 'security', name: 'Data Security Measures', dpdpSection: 'Section 8',
      description: 'Technical safeguards including transport encryption and HTTP security headers to protect personal data',
      maxScore: 15, score: a.securityScore, isBonus: false,
      status: a.securityScore >= 12 ? 'pass' : a.securityScore >= 7 ? 'partial' : 'fail',
      checks: [
        { label: 'HTTPS / TLS transport encryption active', found: a.securityScore >= 8, points: 8, detail: a.securityScore >= 8 ? 'Site served over HTTPS — data in transit is encrypted' : 'Site not served over HTTPS — personal data exposed to interception' },
        { label: `HTTP security headers present (${a.presentSecHeaders.length}/6)`, found: a.presentSecHeaders.length >= 2, points: 7, detail: a.presentSecHeaders.length > 0 ? `Detected: ${a.presentSecHeaders.join(', ')}` : 'No security headers detected' },
      ],
    },
    {
      id: 'rights', name: 'Data Principal Rights', dpdpSection: 'Section 11–14',
      description: 'Mechanisms enabling data principals to exercise rights of access, correction, erasure, and portability',
      maxScore: 10, score: a.rightsScore, isBonus: false,
      status: a.rightsScore >= 8 ? 'pass' : a.rightsScore >= 4 ? 'partial' : 'fail',
      checks: [
        { label: 'Rights (access, correct, erase, nominate) communicated', found: a.rightsMentioned, points: 5, detail: a.rightsMentioned ? 'Data principal rights referenced in policy or pages' : 'No mention of data principal rights' },
        { label: 'Rights request mechanism available', found: a.rightsMechanism, points: 5, detail: a.rightsMechanism ? 'Request form, email, or portal for exercising rights found' : 'No mechanism found for data principals to submit rights requests' },
      ],
    },
    {
      id: 'dpo', name: 'Data Fiduciary Contact / DPO', dpdpSection: 'DPDP Rules',
      description: 'Designated Data Protection Officer with published contact details',
      maxScore: 10, score: a.dpoScore, isBonus: false,
      status: a.dpoScore >= 8 ? 'pass' : a.dpoScore >= 4 ? 'partial' : 'fail',
      checks: [
        { label: 'Data Protection Officer (DPO) designated', found: a.dpoFound, points: 7, detail: a.dpoFound ? 'DPO or privacy officer reference found on site' : 'No DPO or privacy officer found' },
        { label: 'Privacy contact details published', found: a.contactFound, points: 3, detail: a.contactFound ? 'Dedicated privacy contact email or details available' : 'No dedicated privacy contact email found (e.g., privacy@, dpo@)' },
      ],
    },
    {
      id: 'retention', name: 'Data Retention Policy', dpdpSection: 'Section 8(7)',
      description: 'Defined retention periods — personal data must be erased once the processing purpose is fulfilled',
      maxScore: 5, score: a.retentionScore, isBonus: false,
      status: a.retentionScore === 5 ? 'pass' : 'fail',
      checks: [
        { label: 'Data retention periods or storage duration stated', found: a.retentionFound, points: 5, detail: a.retentionFound ? 'Retention period or data storage duration mentioned in policy' : 'No data retention policy found — required under Section 8(7)' },
      ],
    },
    {
      id: 'children', name: "Children's Data Protection", dpdpSection: 'Section 9',
      description: 'Verifiable parental consent and age-appropriate safeguards for processing data of minors',
      maxScore: 10, score: a.childrenScore, isBonus: true,
      status: a.childrenScore >= 5 ? 'pass' : 'fail',
      checks: [
        { label: "Children's data provisions / parental consent referenced", found: a.childrenFound, points: 10, detail: a.childrenFound ? 'Children data protection provisions found on site' : 'No provisions for children data protection detected' },
      ],
    },
    {
      id: 'crossborder', name: 'Cross-border Data Transfer', dpdpSection: 'Section 16',
      description: 'Notice and applicable safeguards when personal data is transferred outside India',
      maxScore: 5, score: a.crossBorderScore, isBonus: true,
      status: a.crossBorderScore >= 5 ? 'pass' : 'fail',
      checks: [
        { label: 'Cross-border / international transfer provisions mentioned', found: a.crossBorderFound, points: 5, detail: a.crossBorderFound ? 'International data transfer provisions referenced' : 'No cross-border transfer disclosure found' },
      ],
    },
  ];
}

function buildGaps(categories: CategoryResult[], a: ReturnType<typeof runAnalysis>): GapItem[] {
  const gaps: GapItem[] = [];
  if (!a.consentBannerFound) gaps.push({ category: 'Consent Notice & Mechanism', gap: 'No consent notice or CMP detected on homepage', severity: 'Critical', dpdpSection: 'Section 6, 7', recommendation: 'Implement a Consent Management Platform (CMP) or a consent notice that presents specific, purpose-based consent requests before any personal data processing begins' });
  if (!a.withdrawalFound) gaps.push({ category: 'Consent Notice & Mechanism', gap: 'No consent withdrawal mechanism found', severity: 'High', dpdpSection: 'Section 6(4)', recommendation: 'Provide an equally easy mechanism for data principals to withdraw consent — add a preference centre, cookie settings, or opt-out link' });
  if (!a.privacyLinked) gaps.push({ category: 'Privacy Notice', gap: 'No privacy notice or policy page linked from homepage', severity: 'Critical', dpdpSection: 'Section 5', recommendation: 'Publish a comprehensive Privacy Notice prominently linked from the footer, covering data categories, processing purposes, retention periods, and data principal rights' });
  if (!a.purposeFound) gaps.push({ category: 'Privacy Notice', gap: 'Specific data processing purposes not documented', severity: 'High', dpdpSection: 'Section 5(1)(b)', recommendation: 'Clearly state the specific purpose(s) for which personal data is collected and processed — vague purposes are insufficient under DPDP' });
  if (!a.dataCategoryFound) gaps.push({ category: 'Privacy Notice', gap: 'Categories of personal data not identified', severity: 'Medium', dpdpSection: 'Section 5', recommendation: 'List the categories of personal data collected (e.g., contact information, financial data, usage data) in your Privacy Notice' });
  if (!a.grievanceFound) gaps.push({ category: 'Grievance Redressal', gap: 'No grievance officer designation published', severity: 'Critical', dpdpSection: 'Section 13', recommendation: 'Designate a Grievance Officer and publish their name and contact details on your website' });
  if (!a.complaintMechFound) gaps.push({ category: 'Grievance Redressal', gap: 'No accessible complaint process or form found', severity: 'High', dpdpSection: 'Section 13', recommendation: 'Provide a clear, accessible process for data principals to file complaints — include a dedicated form, email address, or grievance portal link' });
  if (a.securityScore < 8) gaps.push({ category: 'Data Security Measures', gap: 'HTTPS not active — personal data transmitted in plaintext', severity: 'Critical', dpdpSection: 'Section 8', recommendation: 'Enable SSL/TLS immediately and enforce HTTPS via HTTP Strict Transport Security (HSTS)' });
  if (a.presentSecHeaders.length < 2) gaps.push({ category: 'Data Security Measures', gap: `HTTP security headers absent or insufficient (${a.presentSecHeaders.length} of 6 found)`, severity: 'Medium', dpdpSection: 'Section 8', recommendation: 'Implement HTTP security headers: Strict-Transport-Security (HSTS), Content-Security-Policy (CSP), X-Frame-Options, X-Content-Type-Options, and Referrer-Policy' });
  if (!a.rightsMentioned) gaps.push({ category: 'Data Principal Rights', gap: 'Data principal rights not communicated on site', severity: 'High', dpdpSection: 'Section 11–14', recommendation: 'Explicitly communicate rights of data principals: right to access, correction, erasure, portability, grievance, and nomination' });
  if (!a.rightsMechanism) gaps.push({ category: 'Data Principal Rights', gap: 'No mechanism available to exercise data rights', severity: 'High', dpdpSection: 'Section 11–14', recommendation: 'Provide a clear, accessible mechanism (form, email, portal) for data principals to submit requests to exercise their rights under the DPDP Act' });
  if (!a.dpoFound) gaps.push({ category: 'Data Fiduciary Contact / DPO', gap: 'No Data Protection Officer or privacy contact published', severity: 'High', dpdpSection: 'DPDP Rules', recommendation: 'Designate a Data Protection Officer (required for Significant Data Fiduciaries) or a privacy contact, and publish their details' });
  if (!a.retentionFound) gaps.push({ category: 'Data Retention Policy', gap: 'No data retention periods specified in policy', severity: 'Medium', dpdpSection: 'Section 8(7)', recommendation: 'Define and publish data retention periods for each category of personal data — data must be erased or anonymised once the purpose is fulfilled' });
  void categories;
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
        fetchError = 'Website blocked automated page fetching — conducting header-only & structure assessment';
        limitedScanReason = 'The website actively blocked our scanner (likely bot protection / WAF). We analysed HTTP response headers and attempted direct-path assessment of common privacy and legal pages.';
        pagesScanned.push(`${url} (HEAD only)`);
      } else {
        // Just trust the URL scheme for HTTPS check
        httpsWorking = url.startsWith('https://');
        scanMethod = 'limited';
        fetchError = 'Website unreachable — unable to establish connection';
        limitedScanReason = 'The website could not be reached (DNS failure, network block, or the site is down). Score reflects only what can be technically verified without page content.';
        pagesScanned.push(`${url} (connection failed)`);
      }
    }

    // ---- Strategy 4: Probe common privacy/legal pages ----
    let privacyHtml = '';
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
        limitedScanReason = 'Homepage could not be accessed. We directly probed common privacy and legal pages (/privacy, /privacy-policy, /terms, etc.) to conduct a partial assessment. Scores reflect content found on those pages.';
      }
    }

    const combined = `${homeHtml} ${privacyHtml}`;
    const a = runAnalysis(combined, homeHtml, homeHeaders, httpsWorking);

    // For limited scans: apply confidence dampening — marks uncertain checks as 0 rather than positive
    // (We already do this naturally since consentBanner etc. won't be found in empty HTML)
    // But for HTTPS, we CAN determine it from the URL / HEAD response
    const categories = buildCategories(a);
    const baseCategories = categories.filter(c => !c.isBonus);
    const overallScore = baseCategories.reduce((s, c) => s + c.score, 0);
    const maxBaseScore = baseCategories.reduce((s, c) => s + c.maxScore, 0);
    const bonusScore = categories.filter(c => c.isBonus).reduce((s, c) => s + c.score, 0);

    const pct = (overallScore / maxBaseScore) * 100;
    const complianceLevel =
      pct >= 85 ? 'Excellent'
      : pct >= 70 ? 'Good'
      : pct >= 50 ? 'Moderate'
      : pct >= 30 ? 'Needs Improvement'
      : 'Critical';

    const gaps = buildGaps(categories, a);

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
    };

    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({ error: 'Scan failed: ' + (error instanceof Error ? error.message : 'Unknown error') }, { status: 500 });
  }
}
