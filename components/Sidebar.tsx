'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard, Shield, Database, Users, AlertTriangle,
  FileText, CheckSquare, BarChart3, Scale, ChevronRight, ScanSearch
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
  { href: '/scanner', label: 'DPDP GAP Scanner', icon: ScanSearch },
];

export default function Sidebar() {
  const pathname = usePathname();
  return (
    <div className="w-64 bg-white border-r border-slate-200 flex flex-col min-h-screen fixed left-0 top-0">
      {/* Logo */}
      <div className="px-6 py-5 border-b border-slate-200">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
            <Scale className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="font-bold text-slate-800 text-sm leading-tight">DPDP Comply</div>
            <div className="text-xs text-slate-500">Data Protection Tool</div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider px-3 mb-2">Main</div>
        {navItems.map(({ href, label, icon: Icon }) => {
          const isActive = pathname === href;
          return (
            <Link key={href} href={href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                isActive
                  ? 'bg-indigo-50 text-indigo-700'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <Icon className={`w-4 h-4 flex-shrink-0 ${isActive ? 'text-indigo-600' : 'text-slate-400'}`} />
              <span className="flex-1">{label}</span>
              {isActive && <ChevronRight className="w-3.5 h-3.5 text-indigo-400" />}
            </Link>
          );
        })}

        <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider px-3 mt-4 mb-2 pt-3 border-t border-slate-100">Tools</div>
        {toolItems.map(({ href, label, icon: Icon }) => {
          const isActive = pathname === href;
          return (
            <Link key={href} href={href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                isActive
                  ? 'bg-indigo-50 text-indigo-700'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <Icon className={`w-4 h-4 flex-shrink-0 ${isActive ? 'text-indigo-600' : 'text-slate-400'}`} />
              <span className="flex-1">{label}</span>
              {isActive
                ? <ChevronRight className="w-3.5 h-3.5 text-indigo-400" />
                : <span className="text-xs bg-indigo-100 text-indigo-600 font-semibold px-1.5 py-0.5 rounded-full">Free</span>
              }
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="px-4 py-4 border-t border-slate-200">
        <div className="bg-indigo-50 rounded-lg p-3">
          <div className="text-xs font-semibold text-indigo-700 mb-1">DPDP Act 2023</div>
          <div className="text-xs text-indigo-600">India&apos;s Digital Personal Data Protection Act compliance framework</div>
        </div>
      </div>
    </div>
  );
}
