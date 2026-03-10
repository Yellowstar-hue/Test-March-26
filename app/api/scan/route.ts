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
}

// ---- Helpers ----
function matchesAny(text: string, patterns: RegExp[]): boolean {
  return patterns.some(p => p.test(text));
}

async function fetchWithTimeout(url: string, timeoutMs = 10000): Promise<Response | null> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; DPDPReadinessScanner/1.0; +https://dpdpcomply.in)',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-IN,en;q=0.9',
      },
      redirect: 'follow',
    });
  } catch {
    return null;
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
  return (
    links.find(l => PRIVACY_LINK_PATTERNS.some(p => p.test(l))) ?? null
  );
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
    try {
      domain = new URL(url).hostname;
    } catch {
      return NextResponse.json({ error: 'Invalid URL' }, { status: 400 });
    }

    // --- Fetch homepage ---
    let homeResponse = await fetchWithTimeout(url);
    // If HTTPS fails, try HTTP (but flag it)
    if (!homeResponse) {
      homeResponse = await fetchWithTimeout(url.replace('https://', 'http://'));
    }

    let homeHtml = '';
    const homeHeaders: Record<string, string> = {};
    let httpsWorking = false;
    let fetchError: string | undefined;

    if (homeResponse) {
      try {
        homeHtml = await homeResponse.text();
        homeResponse.headers.forEach((v, k) => { homeHeaders[k.toLowerCase()] = v; });
        httpsWorking = homeResponse.url.startsWith('https://');
      } catch {
        fetchError = 'Could not read response body';
      }
    } else {
      fetchError = 'Website could not be reached or blocked the scanner';
    }

    // --- Fetch privacy policy ---
    let privacyHtml = '';
    if (homeHtml) {
      const privUrl = findPrivacyUrl(homeHtml, url);
      if (privUrl) {
        const pr = await fetchWithTimeout(privUrl, 8000);
        if (pr) {
          try { privacyHtml = await pr.text(); } catch { /* skip */ }
        }
      }
    }

    const combined = `${homeHtml} ${privacyHtml}`;

    // ---- Run Checks ----
    const consentBannerFound = matchesAny(combined, CONSENT_PATTERNS);
    const withdrawalFound = matchesAny(combined, WITHDRAWAL_PATTERNS);

    const privacyLinked = matchesAny(homeHtml, PRIVACY_LINK_PATTERNS) || !!findPrivacyUrl(homeHtml, url);
    const purposeFound = matchesAny(combined, PURPOSE_PATTERNS);
    const dataCategoryFound = matchesAny(combined, DATA_CATEGORY_PATTERNS);

    const grievanceFound = matchesAny(combined, GRIEVANCE_PATTERNS);
    const complaintMechFound = matchesAny(combined, COMPLAINT_PATTERNS);

    const SECURITY_HEADER_NAMES = [
      'strict-transport-security',
      'content-security-policy',
      'x-frame-options',
      'x-content-type-options',
      'referrer-policy',
      'permissions-policy',
    ];
    const presentSecHeaders = SECURITY_HEADER_NAMES.filter(h => homeHeaders[h]);
    const secHeaderScore = presentSecHeaders.length >= 4 ? 7 : presentSecHeaders.length >= 2 ? 5 : presentSecHeaders.length >= 1 ? 3 : 0;

    const rightsMentioned = matchesAny(combined, RIGHTS_MENTION_PATTERNS);
    const rightsMechanism = matchesAny(combined, RIGHTS_MECHANISM_PATTERNS);

    const dpoFound = matchesAny(combined, DPO_PATTERNS);
    const contactFound = matchesAny(combined, CONTACT_PATTERNS);

    const retentionFound = matchesAny(combined, RETENTION_PATTERNS);
    const childrenFound = matchesAny(combined, CHILDREN_PATTERNS);
    const crossBorderFound = matchesAny(combined, CROSS_BORDER_PATTERNS);

    // ---- Score calculation ----
    const consentScore = (consentBannerFound ? 18 : 0) + (withdrawalFound ? 7 : 0);
    const privacyScore = (privacyLinked ? 8 : 0) + (purposeFound ? 6 : 0) + (dataCategoryFound ? 6 : 0);
    const grievanceScore = (grievanceFound ? 8 : 0) + (complaintMechFound ? 7 : 0);
    const securityScore = (httpsWorking ? 8 : 0) + secHeaderScore;
    const rightsScore = (rightsMentioned ? 5 : 0) + (rightsMechanism ? 5 : 0);
    const dpoScore = (dpoFound ? 7 : 0) + (contactFound ? 3 : 0);
    const retentionScore = retentionFound ? 5 : 0;
    const childrenScore = childrenFound ? 10 : 0;
    const crossBorderScore = crossBorderFound ? 5 : 0;

    // ---- Build categories ----
    const categories: CategoryResult[] = [
      {
        id: 'consent',
        name: 'Consent Notice & Mechanism',
        dpdpSection: 'Section 6 & 7',
        description: 'Freely given, specific, informed consent before processing — with an equally easy withdrawal option',
        maxScore: 25,
        score: consentScore,
        isBonus: false,
        status: consentScore >= 20 ? 'pass' : consentScore >= 10 ? 'partial' : 'fail',
        checks: [
          {
            label: 'Consent notice / CMP detected on page',
            found: consentBannerFound,
            points: 18,
            detail: consentBannerFound
              ? 'Consent management mechanism or notice detected'
              : 'No consent notice or CMP detected — processing may occur without valid consent',
          },
          {
            label: 'Consent withdrawal mechanism present',
            found: withdrawalFound,
            points: 7,
            detail: withdrawalFound
              ? 'Opt-out or withdrawal mechanism found'
              : 'No clear withdrawal/opt-out mechanism found — required under DPDP Section 6(4)',
          },
        ],
      },
      {
        id: 'privacy',
        name: 'Privacy Notice',
        dpdpSection: 'Section 5',
        description: 'Accessible notice detailing categories of data collected, processing purposes, and data principal rights',
        maxScore: 20,
        score: privacyScore,
        isBonus: false,
        status: privacyScore >= 16 ? 'pass' : privacyScore >= 8 ? 'partial' : 'fail',
        checks: [
          {
            label: 'Privacy notice / policy page linked',
            found: privacyLinked,
            points: 8,
            detail: privacyLinked
              ? 'Privacy policy or notice page accessible from homepage'
              : 'No privacy policy link detected on homepage',
          },
          {
            label: 'Data processing purposes documented',
            found: purposeFound,
            points: 6,
            detail: purposeFound
              ? 'Purpose(s) of data collection described in policy'
              : 'Processing purposes not clearly stated — generic descriptions do not meet DPDP requirements',
          },
          {
            label: 'Data categories identified',
            found: dataCategoryFound,
            points: 6,
            detail: dataCategoryFound
              ? 'Categories of personal data collected are identified'
              : 'No data category documentation found in policy',
          },
        ],
      },
      {
        id: 'grievance',
        name: 'Grievance Redressal',
        dpdpSection: 'Section 13',
        description: 'Designated grievance officer with an accessible complaint mechanism for data principals',
        maxScore: 15,
        score: grievanceScore,
        isBonus: false,
        status: grievanceScore >= 12 ? 'pass' : grievanceScore >= 7 ? 'partial' : 'fail',
        checks: [
          {
            label: 'Grievance officer / nodal officer designated',
            found: grievanceFound,
            points: 8,
            detail: grievanceFound
              ? 'Grievance officer or nodal officer reference found'
              : 'No grievance officer found — mandatory under DPDP Section 13',
          },
          {
            label: 'Complaint mechanism accessible',
            found: complaintMechFound,
            points: 7,
            detail: complaintMechFound
              ? 'Complaint process or form identified'
              : 'No accessible complaint mechanism found — data principals must be able to raise grievances',
          },
        ],
      },
      {
        id: 'security',
        name: 'Data Security Measures',
        dpdpSection: 'Section 8',
        description: 'Technical safeguards including transport encryption and HTTP security headers to protect personal data',
        maxScore: 15,
        score: securityScore,
        isBonus: false,
        status: securityScore >= 12 ? 'pass' : securityScore >= 7 ? 'partial' : 'fail',
        checks: [
          {
            label: 'HTTPS / TLS transport encryption active',
            found: httpsWorking,
            points: 8,
            detail: httpsWorking
              ? 'Site served over HTTPS — data in transit is encrypted'
              : 'Site not served over HTTPS — personal data exposed to interception',
          },
          {
            label: `HTTP security headers present (${presentSecHeaders.length}/${SECURITY_HEADER_NAMES.length})`,
            found: presentSecHeaders.length >= 2,
            points: 7,
            detail: presentSecHeaders.length > 0
              ? `Detected: ${presentSecHeaders.join(', ')}`
              : 'No security headers detected — HSTS, CSP, X-Frame-Options etc. are missing',
          },
        ],
      },
      {
        id: 'rights',
        name: 'Data Principal Rights',
        dpdpSection: 'Section 11–14',
        description: 'Mechanisms enabling data principals to exercise rights of access, correction, erasure, and portability',
        maxScore: 10,
        score: rightsScore,
        isBonus: false,
        status: rightsScore >= 8 ? 'pass' : rightsScore >= 4 ? 'partial' : 'fail',
        checks: [
          {
            label: 'Rights (access, correct, erase, nominate) communicated',
            found: rightsMentioned,
            points: 5,
            detail: rightsMentioned
              ? 'Data principal rights referenced in policy or pages'
              : 'No mention of data principal rights — required to be communicated under DPDP',
          },
          {
            label: 'Rights request mechanism available',
            found: rightsMechanism,
            points: 5,
            detail: rightsMechanism
              ? 'Request form, email, or portal for exercising rights found'
              : 'No mechanism found for data principals to submit rights requests',
          },
        ],
      },
      {
        id: 'dpo',
        name: 'Data Fiduciary Contact / DPO',
        dpdpSection: 'DPDP Rules',
        description: 'Designated Data Protection Officer with published contact details for privacy-related queries',
        maxScore: 10,
        score: dpoScore,
        isBonus: false,
        status: dpoScore >= 8 ? 'pass' : dpoScore >= 4 ? 'partial' : 'fail',
        checks: [
          {
            label: 'Data Protection Officer (DPO) designated',
            found: dpoFound,
            points: 7,
            detail: dpoFound
              ? 'DPO or privacy officer reference found on site'
              : 'No DPO or privacy officer found — Significant Data Fiduciaries must appoint a DPO',
          },
          {
            label: 'Privacy contact details published',
            found: contactFound,
            points: 3,
            detail: contactFound
              ? 'Dedicated privacy contact email or details available'
              : 'No dedicated privacy contact email found (e.g., privacy@, dpo@)',
          },
        ],
      },
      {
        id: 'retention',
        name: 'Data Retention Policy',
        dpdpSection: 'Section 8(7)',
        description: 'Defined retention periods — personal data must be erased once the processing purpose is fulfilled',
        maxScore: 5,
        score: retentionScore,
        isBonus: false,
        status: retentionScore === 5 ? 'pass' : 'fail',
        checks: [
          {
            label: 'Data retention periods or storage duration stated',
            found: retentionFound,
            points: 5,
            detail: retentionFound
              ? 'Retention period or data storage duration mentioned in policy'
              : 'No data retention policy found — required under Section 8(7)',
          },
        ],
      },
      {
        id: 'children',
        name: "Children's Data Protection",
        dpdpSection: 'Section 9',
        description: 'Verifiable parental consent and age-appropriate safeguards for processing data of minors',
        maxScore: 10,
        score: childrenScore,
        isBonus: true,
        status: childrenScore >= 5 ? 'pass' : 'fail',
        checks: [
          {
            label: "Children's data provisions / parental consent referenced",
            found: childrenFound,
            points: 10,
            detail: childrenFound
              ? 'Children data protection provisions found on site'
              : 'No provisions for children data protection detected',
          },
        ],
      },
      {
        id: 'crossborder',
        name: 'Cross-border Data Transfer',
        dpdpSection: 'Section 16',
        description: 'Notice and applicable safeguards when personal data is transferred outside the territory of India',
        maxScore: 5,
        score: crossBorderScore,
        isBonus: true,
        status: crossBorderScore >= 5 ? 'pass' : 'fail',
        checks: [
          {
            label: 'Cross-border / international transfer provisions mentioned',
            found: crossBorderFound,
            points: 5,
            detail: crossBorderFound
              ? 'International data transfer provisions referenced'
              : 'No cross-border transfer disclosure found',
          },
        ],
      },
    ];

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

    // ---- GAP Analysis ----
    const gaps: GapItem[] = [];

    if (!consentBannerFound)
      gaps.push({
        category: 'Consent Notice & Mechanism',
        gap: 'No consent notice or CMP detected on homepage',
        severity: 'Critical',
        dpdpSection: 'Section 6, 7',
        recommendation:
          'Implement a Consent Management Platform (CMP) or a consent notice that presents specific, purpose-based consent requests before any personal data processing begins',
      });

    if (!withdrawalFound)
      gaps.push({
        category: 'Consent Notice & Mechanism',
        gap: 'No consent withdrawal mechanism found',
        severity: 'High',
        dpdpSection: 'Section 6(4)',
        recommendation:
          'Provide an equally easy mechanism for data principals to withdraw consent — add a preference centre, cookie settings, or opt-out link',
      });

    if (!privacyLinked)
      gaps.push({
        category: 'Privacy Notice',
        gap: 'No privacy notice or policy page linked from homepage',
        severity: 'Critical',
        dpdpSection: 'Section 5',
        recommendation:
          'Publish a comprehensive Privacy Notice prominently linked from the footer, covering data categories, processing purposes, retention periods, and data principal rights',
      });

    if (!purposeFound)
      gaps.push({
        category: 'Privacy Notice',
        gap: 'Specific data processing purposes not documented',
        severity: 'High',
        dpdpSection: 'Section 5(1)(b)',
        recommendation:
          'Clearly state the specific purpose(s) for which personal data is collected and processed — vague purposes ("improve services") are insufficient under DPDP',
      });

    if (!dataCategoryFound)
      gaps.push({
        category: 'Privacy Notice',
        gap: 'Categories of personal data not identified',
        severity: 'Medium',
        dpdpSection: 'Section 5',
        recommendation:
          'List the categories of personal data collected (e.g., contact information, financial data, usage data) in your Privacy Notice',
      });

    if (!grievanceFound)
      gaps.push({
        category: 'Grievance Redressal',
        gap: 'No grievance officer designation published',
        severity: 'Critical',
        dpdpSection: 'Section 13',
        recommendation:
          'Designate a Grievance Officer and publish their name and contact details on your website — data principals have a right to raise grievances within the prescribed timeline',
      });

    if (!complaintMechFound)
      gaps.push({
        category: 'Grievance Redressal',
        gap: 'No accessible complaint process or form found',
        severity: 'High',
        dpdpSection: 'Section 13',
        recommendation:
          'Provide a clear, accessible process for data principals to file complaints — include a dedicated form, email address, or grievance portal link',
      });

    if (!httpsWorking)
      gaps.push({
        category: 'Data Security Measures',
        gap: 'HTTPS not active — personal data transmitted in plaintext',
        severity: 'Critical',
        dpdpSection: 'Section 8',
        recommendation:
          'Enable SSL/TLS immediately and enforce HTTPS via HTTP Strict Transport Security (HSTS) — transmitting personal data over HTTP violates the security obligation under Section 8',
      });

    if (presentSecHeaders.length < 2)
      gaps.push({
        category: 'Data Security Measures',
        gap: `HTTP security headers absent or insufficient (${presentSecHeaders.length} of 6 found)`,
        severity: 'Medium',
        dpdpSection: 'Section 8',
        recommendation:
          'Implement HTTP security headers: Strict-Transport-Security (HSTS), Content-Security-Policy (CSP), X-Frame-Options, X-Content-Type-Options, and Referrer-Policy to reduce attack surface',
      });

    if (!rightsMentioned)
      gaps.push({
        category: 'Data Principal Rights',
        gap: 'Data principal rights not communicated on site',
        severity: 'High',
        dpdpSection: 'Section 11–14',
        recommendation:
          'Explicitly communicate rights of data principals: right to access, correction, erasure, portability, grievance, and nomination — these must appear in the Privacy Notice',
      });

    if (!rightsMechanism)
      gaps.push({
        category: 'Data Principal Rights',
        gap: 'No mechanism available to exercise data rights',
        severity: 'High',
        dpdpSection: 'Section 11–14',
        recommendation:
          'Provide a clear, accessible mechanism (form, email, portal) for data principals to submit requests to exercise their rights under the DPDP Act',
      });

    if (!dpoFound)
      gaps.push({
        category: 'Data Fiduciary Contact / DPO',
        gap: 'No Data Protection Officer or privacy contact published',
        severity: 'High',
        dpdpSection: 'DPDP Rules',
        recommendation:
          'Designate a Data Protection Officer (required for Significant Data Fiduciaries) or a privacy contact, and publish their details — enables data principals to reach your organisation for privacy matters',
      });

    if (!retentionFound)
      gaps.push({
        category: 'Data Retention Policy',
        gap: 'No data retention periods specified in policy',
        severity: 'Medium',
        dpdpSection: 'Section 8(7)',
        recommendation:
          'Define and publish data retention periods for each category of personal data — data must be erased or anonymised once the purpose is fulfilled',
      });

    // ---- Security Headers Detail ----
    const securityHeaders: SecurityHeader[] = [
      {
        header: 'Strict-Transport-Security',
        present: !!homeHeaders['strict-transport-security'],
        value: homeHeaders['strict-transport-security'] || '',
        description: 'Forces HTTPS connections and prevents downgrade attacks',
      },
      {
        header: 'Content-Security-Policy',
        present: !!homeHeaders['content-security-policy'],
        value: homeHeaders['content-security-policy'] ? 'Present' : '',
        description: 'Mitigates XSS and data injection attacks',
      },
      {
        header: 'X-Frame-Options',
        present: !!homeHeaders['x-frame-options'],
        value: homeHeaders['x-frame-options'] || '',
        description: 'Prevents clickjacking by controlling iframe embedding',
      },
      {
        header: 'X-Content-Type-Options',
        present: !!homeHeaders['x-content-type-options'],
        value: homeHeaders['x-content-type-options'] || '',
        description: 'Prevents MIME-type sniffing attacks',
      },
      {
        header: 'Referrer-Policy',
        present: !!homeHeaders['referrer-policy'],
        value: homeHeaders['referrer-policy'] || '',
        description: 'Controls referrer information sent with requests — limits data leakage',
      },
      {
        header: 'Permissions-Policy',
        present: !!homeHeaders['permissions-policy'],
        value: homeHeaders['permissions-policy'] ? 'Present' : '',
        description: 'Controls access to browser features (camera, microphone, geolocation)',
      },
    ];

    const result: ScanResult = {
      url,
      domain,
      scanTime: new Date().toISOString(),
      durationMs: Date.now() - startTime,
      overallScore,
      maxBaseScore,
      bonusScore,
      complianceLevel,
      categories,
      gaps,
      securityHeaders,
      fetchError,
    };

    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      { error: 'Scan failed: ' + (error instanceof Error ? error.message : 'Unknown error') },
      { status: 500 },
    );
  }
}
