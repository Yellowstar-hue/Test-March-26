type Variant = 'green' | 'red' | 'yellow' | 'blue' | 'gray' | 'orange' | 'purple';

const variants: Record<Variant, string> = {
  green: 'bg-green-100 text-green-700',
  red: 'bg-red-100 text-red-700',
  yellow: 'bg-amber-100 text-amber-700',
  blue: 'bg-blue-100 text-blue-700',
  gray: 'bg-slate-100 text-slate-600',
  orange: 'bg-orange-100 text-orange-700',
  purple: 'bg-purple-100 text-purple-700',
};

interface StatusBadgeProps {
  label: string;
  variant: Variant;
}

export default function StatusBadge({ label, variant }: StatusBadgeProps) {
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${variants[variant]}`}>
      {label}
    </span>
  );
}

export function getConsentStatusBadge(status: string) {
  const map: Record<string, { label: string; variant: Variant }> = {
    active: { label: 'Active', variant: 'green' },
    withdrawn: { label: 'Withdrawn', variant: 'red' },
    expired: { label: 'Expired', variant: 'gray' },
    pending: { label: 'Pending', variant: 'yellow' },
  };
  return map[status] || { label: status, variant: 'gray' };
}

export function getRequestStatusBadge(status: string) {
  const map: Record<string, { label: string; variant: Variant }> = {
    pending: { label: 'Pending', variant: 'yellow' },
    in_review: { label: 'In Review', variant: 'blue' },
    completed: { label: 'Completed', variant: 'green' },
    rejected: { label: 'Rejected', variant: 'red' },
  };
  return map[status] || { label: status, variant: 'gray' };
}

export function getBreachSeverityBadge(severity: string) {
  const map: Record<string, { label: string; variant: Variant }> = {
    low: { label: 'Low', variant: 'green' },
    medium: { label: 'Medium', variant: 'yellow' },
    high: { label: 'High', variant: 'orange' },
    critical: { label: 'Critical', variant: 'red' },
  };
  return map[severity] || { label: severity, variant: 'gray' };
}

export function getBreachStatusBadge(status: string) {
  const map: Record<string, { label: string; variant: Variant }> = {
    detected: { label: 'Detected', variant: 'red' },
    investigating: { label: 'Investigating', variant: 'orange' },
    contained: { label: 'Contained', variant: 'yellow' },
    notified: { label: 'Notified', variant: 'blue' },
    closed: { label: 'Closed', variant: 'green' },
  };
  return map[status] || { label: status, variant: 'gray' };
}

export function getComplianceBadge(status: string) {
  const map: Record<string, { label: string; variant: Variant }> = {
    compliant: { label: 'Compliant', variant: 'green' },
    partial: { label: 'Partial', variant: 'yellow' },
    non_compliant: { label: 'Non-Compliant', variant: 'red' },
    not_assessed: { label: 'Not Assessed', variant: 'gray' },
  };
  return map[status] || { label: status, variant: 'gray' };
}

export function getRequestTypeBadge(type: string) {
  const map: Record<string, { label: string; variant: Variant }> = {
    access: { label: 'Data Access', variant: 'blue' },
    correction: { label: 'Correction', variant: 'purple' },
    erasure: { label: 'Erasure', variant: 'red' },
    nomination: { label: 'Nomination', variant: 'green' },
    grievance: { label: 'Grievance', variant: 'orange' },
    withdrawal: { label: 'Withdrawal', variant: 'gray' },
  };
  return map[type] || { label: type, variant: 'gray' };
}
