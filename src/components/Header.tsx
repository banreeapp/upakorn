import React from 'react';
import {
  ShieldCheck,
  Database,
  UserCheck,
  PlusCircle,
  Package,
  Layers,
  FileText,
  Activity,
  Menu,
  X,
  Stethoscope,
} from 'lucide-react';
import { AppUser } from '../types';

interface HeaderProps {
  activeTab: 'overview' | 'loans' | 'equipment' | 'new_loan' | 'audit';
  setActiveTab: (tab: 'overview' | 'loans' | 'equipment' | 'new_loan' | 'audit') => void;
  currentUser: AppUser;
  setCurrentUser: React.Dispatch<React.SetStateAction<AppUser>>;
  pendingCount: number;
  onOpenNewLoan: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  currentUser,
  setCurrentUser,
  pendingCount,
  onOpenNewLoan,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  const toggleRole = () => {
    if (currentUser.role === 'staff') {
      setCurrentUser({
        role: 'public',
        name: 'ประชาชน / ญาติผู้ป่วย',
        department: 'ประชาชนทั่วไปใน อ.ดอนพุด',
      });
    } else {
      setCurrentUser({
        role: 'staff',
        name: 'พว. นฤมล ศรีสวัสดิ์',
        department: 'งานบริการปฐมภูมิ รพ.ดอนพุด',
      });
    }
  };

  interface NavItem {
    id: 'overview' | 'loans' | 'equipment' | 'audit';
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    badge?: number;
  }

  const navItems: NavItem[] = [
    { id: 'overview', label: 'ภาพรวม & สถิติ', icon: Layers },
    {
      id: 'loans',
      label: 'รายการยืม-คืน',
      icon: FileText,
      badge: pendingCount > 0 ? pendingCount : undefined,
    },
    { id: 'equipment', label: 'คลังอุปกรณ์การแพทย์', icon: Package },
    { id: 'audit', label: 'บันทึก PDPA & กิจกรรม', icon: Activity },
  ];

  return (
    <header className="no-print bg-white border-b border-slate-200 sticky top-0 z-40 shadow-xs">
      {/* Top Banner with District & Firebase Sync Info */}
      <div className="bg-gradient-to-r from-teal-800 via-teal-700 to-emerald-800 text-white px-4 py-1.5 text-xs">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 bg-teal-900/60 px-2 py-0.5 rounded-full text-[11px] font-medium border border-teal-500/30">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              ศูนย์บริการยืม-คืนอุปกรณ์การแพทย์
            </span>
            <span className="hidden sm:inline text-teal-100/90 text-[11px]">
              อ.ดอนพุด จ.สระบุรี (รพ.ดอนพุด • รพ.สต.ดอนพุด • รพ.สต.ดงน้อย • รพ.สต.บ้านหลวง • รพ.สต.ไผ่หลิ่ว)
            </span>
          </div>

          <div className="flex items-center gap-3 text-[11px] text-teal-100">
            <span className="inline-flex items-center gap-1 bg-emerald-950/40 px-2 py-0.5 rounded-full border border-emerald-400/20">
              <Database className="w-3 h-3 text-emerald-300" />
              <span>Firebase: <strong>upakorn-b68e3</strong></span>
            </span>
            <span className="inline-flex items-center gap-1 text-teal-200">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-300" />
              <span>PDPA Protected</span>
            </span>
          </div>
        </div>
      </div>

      {/* Main Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3.5">
        <div className="flex items-center justify-between gap-4">
          {/* Logo & Title */}
          <div
            className="flex items-center gap-3 cursor-pointer select-none"
            onClick={() => setActiveTab('overview')}
          >
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-teal-500 to-emerald-600 flex items-center justify-center text-white shadow-md shadow-teal-600/20">
              <Stethoscope className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg sm:text-xl font-bold text-slate-800 tracking-tight font-['Prompt']">
                  ระบบยืมคืนอุปกรณ์ อ.ดอนพุด
                </h1>
                <span className="hidden md:inline-block bg-teal-100 text-teal-800 text-[10px] font-semibold px-2 py-0.5 rounded-full">
                  v2.0 Realtime
                </span>
              </div>
              <p className="text-xs text-slate-500 font-normal hidden sm:block">
                บริหารจัดการการยืม การอนุมัติ การส่งมอบ และการรับคืนอุปกรณ์การแพทย์
              </p>
            </div>
          </div>

          {/* Desktop Nav Items */}
          <div className="hidden lg:flex items-center gap-1 bg-slate-100/80 p-1 rounded-xl border border-slate-200">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`relative flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                    isActive
                      ? 'bg-white text-teal-700 shadow-xs font-semibold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-teal-600' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                  {item.badge !== undefined && (
                    <span className="bg-rose-500 text-white text-[10px] font-bold px-1.5 py-0.2 rounded-full min-w-4 text-center">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Right Action: Quick Loan Request & Role Switcher */}
          <div className="flex items-center gap-2">
            <button
              onClick={onOpenNewLoan}
              className="inline-flex items-center gap-1.5 bg-teal-600 hover:bg-teal-700 text-white text-xs font-medium px-3.5 py-2 rounded-xl shadow-xs transition transform active:scale-95"
            >
              <PlusCircle className="w-4 h-4" />
              <span className="font-medium font-['Prompt']">ยื่นขอยืมอุปกรณ์</span>
            </button>

            {/* Role switch toggle */}
            <div className="hidden sm:flex items-center border border-slate-200 rounded-xl p-1 bg-slate-50">
              <button
                onClick={toggleRole}
                className="flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-lg text-slate-700 hover:bg-white hover:shadow-xs transition"
                title="คลิกเพื่อสลับบทบาท"
              >
                <UserCheck className="w-3.5 h-3.5 text-teal-600" />
                <span className="text-[11px] font-medium max-w-[120px] truncate">
                  {currentUser.role === 'staff' ? 'จนท. รพ./รพ.สต.' : 'ประชาชน'}
                </span>
                <span className="text-[9px] bg-slate-200 text-slate-600 px-1 rounded">
                  สลับ
                </span>
              </button>
            </div>

            {/* Mobile Hamburger */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100 border border-slate-200"
              aria-label="เปิดเมนู"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Navigation */}
        {mobileMenuOpen && (
          <div className="lg:hidden mt-3 pt-3 border-t border-slate-200 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-medium transition ${
                    isActive
                      ? 'bg-teal-50 text-teal-800 font-semibold border border-teal-200'
                      : 'text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Icon className="w-4 h-4 text-teal-600" />
                    <span>{item.label}</span>
                  </div>
                  {item.badge !== undefined && (
                    <span className="bg-rose-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                      {item.badge} รออนุมัติ
                    </span>
                  )}
                </button>
              );
            })}

            <div className="pt-2 mt-2 border-t border-slate-100 flex items-center justify-between px-2 text-xs text-slate-500">
              <span>บทบาทปัจจุบัน:</span>
              <button
                onClick={toggleRole}
                className="font-medium text-teal-700 underline text-xs"
              >
                {currentUser.role === 'staff' ? 'เจ้าหน้าที่ (คลิกเพื่อสลับ)' : 'ประชาชน (คลิกเพื่อสลับ)'}
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};
