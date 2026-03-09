// DPDP Compliance Tool Types

export type ConsentStatus = 'active' | 'withdrawn' | 'expired' | 'pending';
export type DataCategory = 'identity' | 'contact' | 'financial' | 'health' | 'biometric' | 'behavioral' | 'children' | 'sensitive' | 'other';
export type ProcessingPurpose = 'service_delivery' | 'marketing' | 'analytics' | 'legal_compliance' | 'research' | 'security' | 'other';
export type RightsRequestType = 'access' | 'correction' | 'erasure' | 'nomination' | 'grievance' | 'withdrawal';
export type RequestStatus = 'pending' | 'in_review' | 'completed' | 'rejected';
export type BreachSeverity = 'low' | 'medium' | 'high' | 'critical';
export type BreachStatus = 'detected' | 'investigating' | 'contained' | 'notified' | 'closed';
export type ComplianceLevel = 'compliant' | 'partial' | 'non_compliant' | 'not_assessed';

export interface ConsentRecord {
  id: string;
  dataSubject: string;
  email: string;
  purposes: ProcessingPurpose[];
  dataCategories: DataCategory[];
  consentDate: string;
  expiryDate?: string;
  status: ConsentStatus;
  consentMethod: 'explicit' | 'implied';
  ipAddress?: string;
  withdrawalDate?: string;
  notes?: string;
}

export interface DataAsset {
  id: string;
  name: string;
  description: string;
  category: DataCategory;
  purposes: ProcessingPurpose[];
  retentionPeriod: string;
  storageLocation: string;
  thirdPartySharing: boolean;
  thirdParties?: string[];
  encryptionStatus: boolean;
  legalBasis: string;
  dataController: string;
  crossBorderTransfer: boolean;
  transferCountries?: string[];
  childrenData: boolean;
  sensitiveData: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface RightsRequest {
  id: string;
  requestType: RightsRequestType;
  dataSubject: string;
  email: string;
  phone?: string;
  description: string;
  submittedAt: string;
  dueDate: string;
  status: RequestStatus;
  assignedTo?: string;
  resolution?: string;
  resolvedAt?: string;
  documents?: string[];
}

export interface DataBreach {
  id: string;
  title: string;
  description: string;
  discoveredAt: string;
  occurredAt?: string;
  affectedRecords: number;
  affectedDataTypes: DataCategory[];
  severity: BreachSeverity;
  status: BreachStatus;
  containmentMeasures?: string;
  notifiedDPB: boolean;
  dpbNotificationDate?: string;
  notifiedDataPrincipals: boolean;
  principalsNotificationDate?: string;
  rootCause?: string;
  remediation?: string;
  reportedBy: string;
}

export interface PrivacyNotice {
  id: string;
  title: string;
  entityName: string;
  contactEmail: string;
  contactPhone?: string;
  dpoName?: string;
  dpoEmail?: string;
  dataCategories: DataCategory[];
  purposes: ProcessingPurpose[];
  retentionPolicy: string;
  thirdParties: string[];
  dataSubjectRights: string[];
  crossBorderTransfers: boolean;
  transferSafeguards?: string;
  childrenData: boolean;
  lastUpdated: string;
  version: string;
  language: 'en' | 'hi' | 'both';
}

export interface ChecklistItem {
  id: string;
  section: string;
  requirement: string;
  description: string;
  status: ComplianceLevel;
  evidence?: string;
  dueDate?: string;
  assignedTo?: string;
  notes?: string;
  reference: string; // DPDP Act section reference
}

export interface ComplianceStats {
  totalItems: number;
  compliant: number;
  partial: number;
  nonCompliant: number;
  notAssessed: number;
  score: number;
}

export interface DashboardMetrics {
  totalConsents: number;
  activeConsents: number;
  withdrawnConsents: number;
  pendingRightsRequests: number;
  overdueRequests: number;
  openBreaches: number;
  criticalBreaches: number;
  complianceScore: number;
  dataAssets: number;
  lastAssessmentDate: string;
}
