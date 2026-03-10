'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard, Shield, Database, Users, AlertTriangle,
  FileText, CheckSquare, BarChart3, Scale, ScanSearch,
  ChevronRight, Zap, Activity
} from 'lucide-react';

const navItems = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/consent', label: 'Consent Management', icon: Shield },
  { href: '/inventory', label: 'Data Inventory', icon: Database },
  { href: '/rights', label: 'Rights Requests', icon: Users },
  { href: '/breaches', label: 'Breach Register', icon: AlertTriangle },
  { href: '/privacy-notice', label: 'Privacy Notice', icon: FileText },
  { href: '/checklist', label: 'Compliance Checklist', icon: CheckSquare },
  { href: '/reports', label: 'Reports', icon: BarChart3 },
];

const toolItems = [
  { href: '/scanner', label: 'DPDP GAP Scanner', icon: ScanSearch, badge: 'Free' },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <div
      className="w-64 flex flex-col min-h-screen fixed left-0 top-0 z-50"
      style={{ background: 'var(--sidebar-bg)' }}
    >
      {/* Logo / Brand */}
      <div className="px-5 py-5" style={{ borderBottom: '1px solid var(--sidebar-border)' }}>
        <div className="flex items-center gap-3">
          {/* Logo mark */}
          <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: 'linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%)' }}>
            <Scale className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="font-bold text-white text-sm tracking-tight leading-tight">DPDP Comply</div>
            <div className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.4)' }}>Data Protection Platform</div>
          </div>
        </div>

        {/* Live status pill */}
        <div className="mt-4 flex items-center gap-2 px-3 py-1.5 rounded-lg"
          style={{ background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.2)' }}>
          <span className="w-1.5 h-1.5 rounded-full bg-green-400 flex-shrink-0" style={{ boxShadow: '0 0 6px rgba(34,197,94,0.8)' }} />
          <span className="text-xs font-medium" style={{ color: 'rgba(134,239,172,0.9)' }}>Systems operational</span>
          <Activity className="w-3 h-3 ml-auto" style={{ color: 'rgba(134,239,172,0.6)' }} />
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto sidebar-nav">
        <div className="text-xs font-semibold uppercase tracking-widest px-3 mb-3"
          style={{ color: 'rgba(255,255,255,0.25)', letterSpacing: '0.1em' }}>
          Navigation
        </div>

        {navItems.map(({ href, label, icon: Icon }) => {
          const isActive = pathname === href;
          return (
            <Link key={href} href={href}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all group"
              style={{
                background: isActive ? 'var(--sidebar-active)' : 'transparent',
                color: isActive ? '#fff' : 'var(--sidebar-text)',
              }}
              onMouseEnter={e => {
                if (!isActive) (e.currentTarget as HTMLElement).style.background = 'var(--sidebar-hover)';
              }}
              onMouseLeave={e => {
                if (!isActive) (e.currentTarget as HTMLElement).style.background = 'transparent';
              }}
            >
              {/* Active indicator bar */}
              {isActive && (
                <span className="absolute left-0 w-0.5 h-8 rounded-r-full"
                  style={{ background: '#0ea5e9', boxShadow: '0 0 8px rgba(14,165,233,0.6)' }} />
              )}
              <Icon
                className="w-4 h-4 flex-shrink-0 transition-colors"
                style={{ color: isActive ? '#0ea5e9' : 'rgba(255,255,255,0.35)' }}
              />
              <span className="flex-1">{label}</span>
              {isActive && <ChevronRight className="w-3.5 h-3.5" style={{ color: 'rgba(14,165,233,0.6)' }} />}
            </Link>
          );
        })}

        {/* Tools section */}
        <div className="pt-4 pb-2">
          <div className="text-xs font-semibold uppercase tracking-widest px-3 mb-3"
            style={{ color: 'rgba(255,255,255,0.25)', letterSpacing: '0.1em', borderTop: '1px solid var(--sidebar-border)', paddingTop: '16px' }}>
            Tools
          </div>
          {toolItems.map(({ href, label, icon: Icon, badge }) => {
            const isActive = pathname === href;
            return (
              <Link key={href} href={href}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all relative"
                style={{
                  background: isActive ? 'var(--sidebar-active)' : 'transparent',
                  color: isActive ? '#fff' : 'var(--sidebar-text)',
                }}
                onMouseEnter={e => {
                  if (!isActive) (e.currentTarget as HTMLElement).style.background = 'var(--sidebar-hover)';
                }}
                onMouseLeave={e => {
                  if (!isActive) (e.currentTarget as HTMLElement).style.background = 'transparent';
                }}
              >
                {isActive && (
                  <span className="absolute left-0 w-0.5 h-8 rounded-r-full"
                    style={{ background: '#0ea5e9', boxShadow: '0 0 8px rgba(14,165,233,0.6)' }} />
                )}
                <Icon
                  className="w-4 h-4 flex-shrink-0"
                  style={{ color: isActive ? '#0ea5e9' : 'rgba(255,255,255,0.35)' }}
                />
                <span className="flex-1">{label}</span>
                {!isActive && badge && (
                  <span className="text-xs font-bold px-2 py-0.5 rounded-full"
                    style={{ background: 'rgba(14,165,233,0.15)', color: '#38bdf8', border: '1px solid rgba(14,165,233,0.25)' }}>
                    {badge}
                  </span>
                )}
                {isActive && <ChevronRight className="w-3.5 h-3.5" style={{ color: 'rgba(14,165,233,0.6)' }} />}
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Footer — DPDP Act callout */}
      <div className="px-4 py-4" style={{ borderTop: '1px solid var(--sidebar-border)' }}>
        <div className="rounded-xl p-3.5"
          style={{ background: 'linear-gradient(135deg, rgba(14,165,233,0.12) 0%, rgba(2,132,199,0.06) 100%)', border: '1px solid rgba(14,165,233,0.2)' }}>
          <div className="flex items-center gap-2 mb-1.5">
            <Zap className="w-3.5 h-3.5" style={{ color: '#38bdf8' }} />
            <span className="text-xs font-bold" style={{ color: '#38bdf8' }}>DPDP Act 2023</span>
          </div>
          <div className="text-xs leading-relaxed" style={{ color: 'rgba(255,255,255,0.4)' }}>
            India&apos;s Digital Personal Data Protection compliance framework
          </div>
        </div>
      </div>
    </div>
  );
}
