import {
  ConsentRecord, DataAsset, RightsRequest, DataBreach,
  ChecklistItem, DashboardMetrics
} from './types';

export const sampleConsents: ConsentRecord[] = [
  {
    id: 'C001', dataSubject: 'Arjun Sharma', email: 'arjun.sharma@example.com',
    purposes: ['service_delivery', 'analytics'], dataCategories: ['identity', 'contact', 'behavioral'],
    consentDate: '2025-01-15', expiryDate: '2026-01-15', status: 'active',
    consentMethod: 'explicit', ipAddress: '192.168.1.100', notes: 'Onboarding consent'
  },
  {
    id: 'C002', dataSubject: 'Priya Patel', email: 'priya.patel@example.com',
    purposes: ['service_delivery', 'marketing'], dataCategories: ['identity', 'contact', 'financial'],
    consentDate: '2025-02-20', expiryDate: '2026-02-20', status: 'active',
    consentMethod: 'explicit', ipAddress: '10.0.0.45'
  },
  {
    id: 'C003', dataSubject: 'Rohit Kumar', email: 'rohit.kumar@example.com',
    purposes: ['service_delivery'], dataCategories: ['identity', 'contact'],
    consentDate: '2024-08-10', expiryDate: '2025-08-10', status: 'expired',
    consentMethod: 'explicit', ipAddress: '172.16.0.22'
  },
  {
    id: 'C004', dataSubject: 'Sneha Gupta', email: 'sneha.gupta@example.com',
    purposes: ['service_delivery', 'marketing', 'analytics'], dataCategories: ['identity', 'contact', 'behavioral'],
    consentDate: '2025-03-01', status: 'withdrawn', consentMethod: 'explicit',
    withdrawalDate: '2025-09-15', notes: 'User requested withdrawal via email'
  },
  {
    id: 'C005', dataSubject: 'Vikram Singh', email: 'vikram.singh@example.com',
    purposes: ['service_delivery'], dataCategories: ['identity', 'contact', 'health'],
    consentDate: '2025-11-05', expiryDate: '2026-11-05', status: 'active',
    consentMethod: 'explicit', ipAddress: '192.168.2.55'
  },
  {
    id: 'C006', dataSubject: 'Ananya Reddy', email: 'ananya.reddy@example.com',
    purposes: ['service_delivery', 'legal_compliance'], dataCategories: ['identity', 'financial'],
    consentDate: '2025-12-01', expiryDate: '2026-12-01', status: 'active',
    consentMethod: 'explicit', ipAddress: '10.1.1.88'
  },
];

export const sampleDataAssets: DataAsset[] = [
  {
    id: 'DA001', name: 'Customer Profiles Database', description: 'Core customer identity and contact information',
    category: 'identity', purposes: ['service_delivery'], retentionPeriod: '7 years after account closure',
    storageLocation: 'AWS Mumbai Region (ap-south-1)', thirdPartySharing: false,
    encryptionStatus: true, legalBasis: 'Consent (Section 6, DPDP Act 2023)',
    dataController: 'Your Organization', crossBorderTransfer: false,
    childrenData: false, sensitiveData: false, createdAt: '2024-01-01', updatedAt: '2025-12-01'
  },
  {
    id: 'DA002', name: 'Financial Transactions Log', description: 'Payment and transaction records',
    category: 'financial', purposes: ['service_delivery', 'legal_compliance'],
    retentionPeriod: '10 years (RBI mandate)', storageLocation: 'On-premises DB Server',
    thirdPartySharing: true, thirdParties: ['Payment Gateway Ltd', 'Banking Partner'],
    encryptionStatus: true, legalBasis: 'Legal Obligation & Consent',
    dataController: 'Your Organization', crossBorderTransfer: false,
    childrenData: false, sensitiveData: true, createdAt: '2024-01-01', updatedAt: '2025-11-15'
  },
  {
    id: 'DA003', name: 'Health Records System', description: 'Patient health and medical data',
    category: 'health', purposes: ['service_delivery'],
    retentionPeriod: '15 years', storageLocation: 'Azure India Central',
    thirdPartySharing: true, thirdParties: ['Insurance Provider XYZ'],
    encryptionStatus: true, legalBasis: 'Explicit Consent',
    dataController: 'Your Organization', crossBorderTransfer: false,
    childrenData: false, sensitiveData: true, createdAt: '2024-03-15', updatedAt: '2025-10-20'
  },
  {
    id: 'DA004', name: 'Marketing Analytics Platform', description: 'Behavioral and browsing data for targeted marketing',
    category: 'behavioral', purposes: ['marketing', 'analytics'],
    retentionPeriod: '2 years', storageLocation: 'Google Cloud Mumbai',
    thirdPartySharing: true, thirdParties: ['Analytics Partner Inc', 'Ad Network Co'],
    encryptionStatus: true, legalBasis: 'Consent',
    dataController: 'Your Organization', crossBorderTransfer: true, transferCountries: ['USA', 'Singapore'],
    childrenData: false, sensitiveData: false, createdAt: '2024-06-01', updatedAt: '2025-12-10'
  },
  {
    id: 'DA005', name: "Children's Education Portal", description: 'Data of minor users for educational services',
    category: 'children', purposes: ['service_delivery'],
    retentionPeriod: '3 years after 18th birthday', storageLocation: 'AWS Mumbai Region',
    thirdPartySharing: false, encryptionStatus: true,
    legalBasis: 'Verifiable Parental Consent (Section 9, DPDP Act 2023)',
    dataController: 'Your Organization', crossBorderTransfer: false,
    childrenData: true, sensitiveData: false, createdAt: '2024-09-01', updatedAt: '2025-09-30'
  },
];

export const sampleRightsRequests: RightsRequest[] = [
  {
    id: 'RR001', requestType: 'access', dataSubject: 'Meera Joshi', email: 'meera.joshi@example.com',
    phone: '+91-9876543210', description: 'Requesting a complete copy of all personal data held',
    submittedAt: '2026-02-28', dueDate: '2026-03-30', status: 'in_review',
    assignedTo: 'DPO Team'
  },
  {
    id: 'RR002', requestType: 'erasure', dataSubject: 'Karan Mehta', email: 'karan.mehta@example.com',
    description: 'Request to delete all personal data - account no longer needed',
    submittedAt: '2026-02-20', dueDate: '2026-03-22', status: 'pending',
    assignedTo: 'Data Management Team'
  },
  {
    id: 'RR003', requestType: 'correction', dataSubject: 'Deepika Nair', email: 'deepika.nair@example.com',
    description: 'Incorrect date of birth and address on file - requesting correction',
    submittedAt: '2026-02-15', dueDate: '2026-03-17', status: 'completed',
    assignedTo: 'Customer Support', resolution: 'Updated DOB and address as requested',
    resolvedAt: '2026-03-05'
  },
  {
    id: 'RR004', requestType: 'grievance', dataSubject: 'Suresh Verma', email: 'suresh.verma@example.com',
    description: 'Complaint about unauthorized use of data for marketing without consent',
    submittedAt: '2026-03-01', dueDate: '2026-03-31', status: 'in_review',
    assignedTo: 'DPO Team'
  },
  {
    id: 'RR005', requestType: 'withdrawal', dataSubject: 'Asha Pillai', email: 'asha.pillai@example.com',
    description: 'Withdrawal of consent for marketing communications',
    submittedAt: '2026-03-05', dueDate: '2026-04-04', status: 'completed',
    assignedTo: 'Marketing Team', resolution: 'Consent withdrawn, removed from all marketing lists',
    resolvedAt: '2026-03-07'
  },
];

export const sampleBreaches: DataBreach[] = [
  {
    id: 'B001', title: 'Unauthorized API Access - Customer Data', description: 'Third-party API integration exposed customer contact details due to misconfigured authentication',
    discoveredAt: '2026-02-10', occurredAt: '2026-02-08', affectedRecords: 1250,
    affectedDataTypes: ['identity', 'contact'], severity: 'high', status: 'notified',
    containmentMeasures: 'API access revoked, authentication patched',
    notifiedDPB: true, dpbNotificationDate: '2026-02-12',
    notifiedDataPrincipals: true, principalsNotificationDate: '2026-02-14',
    rootCause: 'Misconfigured OAuth token permissions in third-party integration',
    remediation: 'Implemented token rotation, added API gateway rate limiting',
    reportedBy: 'Security Team'
  },
  {
    id: 'B002', title: 'Database Backup Exposure', description: 'Unencrypted database backup found on publicly accessible S3 bucket',
    discoveredAt: '2026-03-01', occurredAt: '2026-02-15', affectedRecords: 3400,
    affectedDataTypes: ['identity', 'contact', 'financial'], severity: 'critical', status: 'investigating',
    containmentMeasures: 'S3 bucket access revoked immediately',
    notifiedDPB: false, notifiedDataPrincipals: false,
    rootCause: 'Misconfigured S3 bucket permissions during infrastructure migration',
    reportedBy: 'Cloud Security Audit'
  },
  {
    id: 'B003', title: 'Phishing Attack - Employee Credentials', description: 'Employee fell victim to phishing, potential unauthorized access to HR systems',
    discoveredAt: '2026-01-20', affectedRecords: 89,
    affectedDataTypes: ['identity', 'financial'], severity: 'medium', status: 'closed',
    containmentMeasures: 'Account suspended, all sessions terminated, password reset',
    notifiedDPB: true, dpbNotificationDate: '2026-01-22',
    notifiedDataPrincipals: false,
    rootCause: 'Successful spear phishing email targeting finance department',
    remediation: 'MFA enforcement, security awareness training conducted',
    reportedBy: 'IT Security'
  },
];

export const dpdpChecklist: ChecklistItem[] = [
  // Chapter II - Obligations relating to processing of digital personal data
  {
    id: 'CL001', section: 'Consent Framework', requirement: 'Consent Notice Implementation',
    description: 'Data fiduciary provides notice before processing - itemised description of data, purpose, rights, and grievance mechanism',
    status: 'compliant', reference: 'Section 5, DPDP Act 2023',
    evidence: 'Privacy notice v2.1 deployed on all touchpoints', assignedTo: 'DPO'
  },
  {
    id: 'CL002', section: 'Consent Framework', requirement: 'Freely Given, Specific Consent',
    description: 'Consent is free, informed, unconditional, unambiguous with clear affirmative action. No bundled consent.',
    status: 'compliant', reference: 'Section 6, DPDP Act 2023',
    evidence: 'Consent flow redesigned - granular purpose-based consent', assignedTo: 'Product Team'
  },
  {
    id: 'CL003', section: 'Consent Framework', requirement: 'Consent Management Dashboard',
    description: 'Mechanism for data principal to view, manage, and withdraw consent easily',
    status: 'partial', reference: 'Section 6(4), DPDP Act 2023',
    notes: 'Withdrawal mechanism exists but not accessible from all platforms', assignedTo: 'Engineering'
  },
  {
    id: 'CL004', section: 'Consent Framework', requirement: 'Consent Withdrawal Mechanism',
    description: 'Withdrawal must be as easy as giving consent, processed promptly',
    status: 'partial', reference: 'Section 6(4), DPDP Act 2023',
    notes: 'Need to reduce withdrawal processing time to under 24 hours', assignedTo: 'Engineering'
  },
  {
    id: 'CL005', section: 'Data Fiduciary Obligations', requirement: 'Data Quality & Accuracy',
    description: 'Ensure personal data is complete, accurate and consistent for its intended purpose',
    status: 'compliant', reference: 'Section 8(3), DPDP Act 2023',
    evidence: 'Data quality checks implemented in ETL pipeline', assignedTo: 'Data Team'
  },
  {
    id: 'CL006', section: 'Data Fiduciary Obligations', requirement: 'Storage Limitation',
    description: 'Personal data not retained beyond the period necessary for stated purpose',
    status: 'partial', reference: 'Section 8(7), DPDP Act 2023',
    notes: 'Retention policy defined but automated deletion not yet implemented for all data categories', assignedTo: 'Data Team'
  },
  {
    id: 'CL007', section: 'Data Fiduciary Obligations', requirement: 'Data Security Safeguards',
    description: 'Reasonable security safeguards including encryption to prevent unauthorized processing',
    status: 'compliant', reference: 'Section 8(5), DPDP Act 2023',
    evidence: 'AES-256 encryption at rest, TLS 1.3 in transit, penetration testing conducted', assignedTo: 'Security Team'
  },
  {
    id: 'CL008', section: 'Data Fiduciary Obligations', requirement: 'Personal Data Breach Notification',
    description: 'Notify Data Protection Board and affected data principals of breaches without delay',
    status: 'compliant', reference: 'Section 8(6), DPDP Act 2023',
    evidence: 'Breach response plan v1.2, notifications sent within 72 hours', assignedTo: 'DPO'
  },
  {
    id: 'CL009', section: 'Children\'s Data', requirement: 'Age Verification Mechanism',
    description: 'Verifiable consent from parent/guardian before processing data of child under 18',
    status: 'partial', reference: 'Section 9, DPDP Act 2023',
    notes: 'Age verification implemented but parental consent verification needs strengthening', assignedTo: 'Product Team'
  },
  {
    id: 'CL010', section: 'Children\'s Data', requirement: 'No Tracking/Behavioural Targeting of Children',
    description: 'Prohibited from tracking, monitoring behavior, or targeting advertising to children',
    status: 'compliant', reference: 'Section 9(3), DPDP Act 2023',
    evidence: 'Children profiles excluded from all marketing and analytics systems', assignedTo: 'Marketing'
  },
  {
    id: 'CL011', section: 'Data Principal Rights', requirement: 'Right of Access Implementation',
    description: 'Mechanism for data principals to obtain summary of personal data and processing activities',
    status: 'compliant', reference: 'Section 11, DPDP Act 2023',
    evidence: 'Self-service data export portal available in user dashboard', assignedTo: 'Engineering'
  },
  {
    id: 'CL012', section: 'Data Principal Rights', requirement: 'Right to Correction & Erasure',
    description: 'Mechanism for data principals to request correction, completion, and erasure of data',
    status: 'compliant', reference: 'Section 12, DPDP Act 2023',
    evidence: 'Request portal with 30-day SLA, processed 45 requests in last quarter', assignedTo: 'Customer Support'
  },
  {
    id: 'CL013', section: 'Data Principal Rights', requirement: 'Grievance Redressal Mechanism',
    description: 'Grievance officer with published contact details, response within prescribed timelines',
    status: 'compliant', reference: 'Section 13, DPDP Act 2023',
    evidence: 'DPO appointed, email and portal available, average response 5 days', assignedTo: 'DPO'
  },
  {
    id: 'CL014', section: 'Data Principal Rights', requirement: 'Right of Nomination',
    description: 'Allow data principals to nominate a person to exercise rights in event of death/incapacity',
    status: 'non_compliant', reference: 'Section 14, DPDP Act 2023',
    notes: 'Nomination feature not yet built - high priority', assignedTo: 'Product Team',
    dueDate: '2026-06-30'
  },
  {
    id: 'CL015', section: 'Significant Data Fiduciary', requirement: 'SDF Assessment',
    description: 'Assess if organization qualifies as Significant Data Fiduciary based on volume, sensitivity, national security risk',
    status: 'not_assessed', reference: 'Section 10, DPDP Act 2023',
    notes: 'Assessment pending - needed if processing >X crore data principals', assignedTo: 'Legal Team',
    dueDate: '2026-04-30'
  },
  {
    id: 'CL016', section: 'Significant Data Fiduciary', requirement: 'Data Protection Impact Assessment',
    description: 'Conduct periodic DPIA for high-risk processing activities (required for SDFs)',
    status: 'not_assessed', reference: 'Section 10(2)(b), DPDP Act 2023',
    notes: 'DPIA framework to be established pending SDF assessment', assignedTo: 'DPO',
    dueDate: '2026-06-30'
  },
  {
    id: 'CL017', section: 'Data Processor Obligations', requirement: 'Data Processing Agreements',
    description: 'Valid contracts with all data processors specifying processing instructions and obligations',
    status: 'partial', reference: 'Section 8(1), DPDP Act 2023',
    notes: '12 of 18 vendors have updated DPAs. 6 pending renewal', assignedTo: 'Legal Team',
    dueDate: '2026-03-31'
  },
  {
    id: 'CL018', section: 'Data Processor Obligations', requirement: 'Third-party Vendor Audit',
    description: 'Periodic audits of data processors to ensure compliance',
    status: 'partial', reference: 'Section 8(1), DPDP Act 2023',
    notes: 'Annual audit cycle initiated, 3 of 8 critical vendors audited this year', assignedTo: 'Security Team',
    dueDate: '2026-05-30'
  },
  {
    id: 'CL019', section: 'Cross-Border Transfers', requirement: 'Transfer Mechanism Implementation',
    description: 'Data transfers only to countries notified by Central Government; appropriate safeguards',
    status: 'partial', reference: 'Section 16, DPDP Act 2023',
    notes: 'Awaiting government notification on permitted countries; SCCs executed with US partners', assignedTo: 'Legal Team'
  },
  {
    id: 'CL020', section: 'Records & Accountability', requirement: 'Processing Activity Records',
    description: 'Maintain records of all data processing activities as required',
    status: 'compliant', reference: 'Section 8, DPDP Act 2023',
    evidence: 'Data inventory maintained in DPDP compliance tool, last updated March 2026', assignedTo: 'DPO'
  },
];

export const dashboardMetrics: DashboardMetrics = {
  totalConsents: 6,
  activeConsents: 4,
  withdrawnConsents: 1,
  pendingRightsRequests: 3,
  overdueRequests: 1,
  openBreaches: 1,
  criticalBreaches: 1,
  complianceScore: 72,
  dataAssets: 5,
  lastAssessmentDate: '2026-03-09'
};

export const purposeLabels: Record<string, string> = {
  service_delivery: 'Service Delivery',
  marketing: 'Marketing',
  analytics: 'Analytics',
  legal_compliance: 'Legal Compliance',
  research: 'Research',
  security: 'Security',
  other: 'Other'
};

export const categoryLabels: Record<string, string> = {
  identity: 'Identity Data',
  contact: 'Contact Data',
  financial: 'Financial Data',
  health: 'Health Data',
  biometric: 'Biometric Data',
  behavioral: 'Behavioral Data',
  children: "Children's Data",
  sensitive: 'Sensitive Data',
  other: 'Other'
};
