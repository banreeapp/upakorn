import React from 'react';
import {
  MedicalEquipment,
  LoanRecord,
  Subdistrict,
  AppUser,
} from '../types';
import {
  Clock,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  MapPin,
  HeartHandshake,
  Calendar,
  Sparkles,
  Bed,
  ShieldCheck,
  Building2,
} from 'lucide-react';
import { formatThaiDate, getDaysRemaining, maskIdCard } from '../utils/pdpa';

interface DashboardViewProps {
  equipment: MedicalEquipment[];
  loans: LoanRecord[];
  onSelectLoan: (loan: LoanRecord) => void;
  onNavigateTab: (tab: 'overview' | 'loans' | 'equipment' | 'new_loan' | 'audit') => void;
  onOpenNewLoan: () => void;
  currentUser: AppUser;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  equipment,
  loans,
  onSelectLoan,
  onNavigateTab,
  onOpenNewLoan,
}) => {
  // Metric counts
  const totalEquip = equipment.length;
  const availableEquip = equipment.filter((e) => e.status === 'available').length;
  const borrowedEquip = equipment.filter((e) => e.status === 'borrowed').length;
  const maintenanceEquip = equipment.filter((e) => e.status === 'maintenance').length;

  const pendingLoans = loans.filter((l) => l.status === 'pending_approval');
  const approvedLoans = loans.filter((l) => l.status === 'approved');
  const activeLoans = loans.filter((l) => l.status === 'delivered');
  const returnedLoans = loans.filter((l) => l.status === 'returned');

  // Overdue check
  const overdueLoans = activeLoans.filter((l) => {
    const check = getDaysRemaining(l.expectedReturnDate);
    return check.isOverdue;
  });

  // Subdistrict distribution
  const subdistricts: Subdistrict[] = ['ดอนพุด', 'ดงน้อย', 'บ้านหลวง', 'ไผ่หลิ่ว'];
  const loansBySubdistrict = subdistricts.map((sub) => {
    const countActive = activeLoans.filter((l) => l.subdistrict === sub).length;
    const countTotal = loans.filter((l) => l.subdistrict === sub).length;
    return { name: sub, active: countActive, total: countTotal };
  });

  // Category counts
  const categorySummary: { [cat: string]: { total: number; available: number } } = {};
  equipment.forEach((item) => {
    if (!categorySummary[item.category]) {
      categorySummary[item.category] = { total: 0, available: 0 };
    }
    categorySummary[item.category].total += 1;
    if (item.status === 'available') {
      categorySummary[item.category].available += 1;
    }
  });

  return (
    <div className="space-y-6">
      {/* Hero Welcome & Quick Notice */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-teal-700 via-teal-800 to-emerald-900 p-6 sm:p-8 text-white shadow-lg">
        <div className="relative z-10 max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-medium backdrop-blur-xs">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>เครือข่ายบริการสุขภาพอำเภอดอนพุด จังหวัดสระบุรี</span>
          </div>

          <h2 className="text-xl sm:text-3xl font-bold tracking-tight font-['Prompt']">
            ระบบยืมคืนอุปกรณ์การแพทย์ อ.ดอนพุด
          </h2>

          <p className="text-xs sm:text-sm text-teal-100 leading-relaxed max-w-2xl">
            เพื่อการดูแลผู้ป่วยติดเตียง ผู้สูงอายุ และผู้ป่วยระยะฟื้นฟูในชุมชน
            ทั้ง ๔ ตำบล (ดอนพุด, ดงน้อย, บ้านหลวง, ไผ่หลิ่ว) ยืมง่าย รวดเร็ว ปลอดภัย
            และเป็นธรรมตามเกณฑ์ความจำเป็นทางการแพทย์
          </p>

          <div className="pt-2 flex flex-wrap gap-3">
            <button
              onClick={onOpenNewLoan}
              className="inline-flex items-center gap-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-900 font-semibold px-4 py-2 text-xs shadow-md transition transform active:scale-95"
            >
              <HeartHandshake className="w-4 h-4 text-slate-900" />
              <span>ยื่นขอยืมอุปกรณ์ทันที</span>
            </button>
            <button
              onClick={() => onNavigateTab('equipment')}
              className="inline-flex items-center gap-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-medium px-4 py-2 text-xs backdrop-blur-xs border border-white/20 transition"
            >
              <Bed className="w-4 h-4 text-teal-200" />
              <span>ดูคลังอุปกรณ์ที่ว่าง ({availableEquip} ชิ้น)</span>
            </button>
          </div>
        </div>

        {/* Decorative circle */}
        <div className="absolute -right-12 -bottom-16 w-64 h-64 rounded-full bg-teal-500/15 pointer-events-none blur-2xl" />
      </div>

      {/* Overdue Warning Alert if any */}
      {overdueLoans.length > 0 && (
        <div className="rounded-xl border border-amber-300 bg-amber-50 p-4 shadow-xs">
          <div className="flex items-start gap-3">
            <div className="rounded-lg bg-amber-100 p-2 text-amber-800">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <h4 className="font-semibold text-amber-900 text-sm">
                แจ้งเตือน: มีอุปกรณ์เกินกำหนดส่งคืน {overdueLoans.length} รายการ
              </h4>
              <p className="text-xs text-amber-700 mt-0.5">
                กรุณาประสานงานผู้ดูแลหรือ อสม. ประจำตำบลเพื่อติดตามการฟื้นตัวหรือประสานการรับคืน
              </p>
              <div className="mt-2 flex flex-wrap gap-2">
                {overdueLoans.slice(0, 3).map((l) => (
                  <button
                    key={l.id}
                    onClick={() => onSelectLoan(l)}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-white px-2.5 py-1 text-xs font-medium text-amber-900 border border-amber-200 shadow-xs hover:bg-amber-100/50"
                  >
                    <span>{l.patientName}</span>
                    <span className="text-rose-600 font-bold">
                      ({getDaysRemaining(l.expectedReturnDate).label})
                    </span>
                  </button>
                ))}
                {overdueLoans.length > 3 && (
                  <button
                    onClick={() => onNavigateTab('loans')}
                    className="text-xs font-semibold text-amber-800 underline self-center"
                  >
                    ดูทั้งหมด {overdueLoans.length} รายการ →
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 4 Core Workflow Status Counters */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Step 1: Pending */}
        <div
          onClick={() => onNavigateTab('loans')}
          className="cursor-pointer bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-xs hover:shadow-md hover:border-amber-300 transition group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">ขั้นที่ ๑ • รอพิจารณาอนุมัติ</span>
            <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-bold text-slate-800 font-['Prompt']">
              {pendingLoans.length}
            </span>
            <span className="text-xs text-slate-500">คำขอ</span>
          </div>
          <p className="mt-1 text-[11px] text-amber-700 font-medium">
            {pendingLoans.length > 0 ? 'รอเจ้าหน้าที่ตรวจสอบความจำเป็น' : 'ไม่มีคำขอค้างรอ'}
          </p>
        </div>

        {/* Step 2: Approved / Waiting Handover */}
        <div
          onClick={() => onNavigateTab('loans')}
          className="cursor-pointer bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-xs hover:shadow-md hover:border-sky-300 transition group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">ขั้นที่ ๒ • อนุมัติแล้ว รอส่งมอบ</span>
            <div className="w-8 h-8 rounded-lg bg-sky-100 text-sky-700 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-bold text-slate-800 font-['Prompt']">
              {approvedLoans.length}
            </span>
            <span className="text-xs text-slate-500">รายการ</span>
          </div>
          <p className="mt-1 text-[11px] text-sky-700 font-medium">
            เตรียมส่งมอบ / นัดหมายญาติ
          </p>
        </div>

        {/* Step 3: Active in Community */}
        <div
          onClick={() => onNavigateTab('loans')}
          className="cursor-pointer bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-xs hover:shadow-md hover:border-teal-300 transition group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">ขั้นที่ ๓ • อยู่ระหว่างยืมใช้</span>
            <div className="w-8 h-8 rounded-lg bg-teal-100 text-teal-700 flex items-center justify-center">
              <HeartHandshake className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-bold text-teal-700 font-['Prompt']">
              {activeLoans.length}
            </span>
            <span className="text-xs text-slate-500">ผู้ป่วยในชุมชน</span>
          </div>
          <p className="mt-1 text-[11px] text-teal-700 font-medium">
            ส่งมอบแล้ว ใช้งานในพื้นที่
          </p>
        </div>

        {/* Step 4: Returned / Available */}
        <div
          onClick={() => onNavigateTab('equipment')}
          className="cursor-pointer bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-xs hover:shadow-md hover:border-emerald-300 transition group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">อุปกรณ์พร้อมให้ยืม</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <Bed className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-bold text-emerald-700 font-['Prompt']">
              {availableEquip}
            </span>
            <span className="text-xs text-slate-500">/ ทั้งหมด {totalEquip} ชิ้น</span>
          </div>
          <p className="mt-1 text-[11px] text-emerald-700 font-medium">
            คืนแล้วสะสม {returnedLoans.length} ครั้ง (ซ่อม/เช็ค {maintenanceEquip})
          </p>
        </div>
      </div>

      {/* Grid: Don Phut Subdistricts & Equipment Category Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Subdistricts Distribution (4 ตำบลใน อ.ดอนพุด) */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Building2 className="w-4 h-4 text-teal-600" />
              <h3 className="font-semibold text-slate-800 text-sm font-['Prompt']">
                กระจายอุปกรณ์ตาม ๔ ตำบล อ.ดอนพุด
              </h3>
            </div>
            <span className="text-[11px] text-slate-400">จ.สระบุรี</span>
          </div>

          <div className="space-y-3">
            {loansBySubdistrict.map((sub) => {
              const percentage =
                activeLoans.length > 0
                  ? Math.round((sub.active / activeLoans.length) * 100)
                  : 0;
              return (
                <div key={sub.name} className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <span className="font-medium text-slate-800 flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-teal-600" />
                      ตำบล{sub.name}
                    </span>
                    <span className="text-slate-600">
                      <strong>{sub.active}</strong> รายที่กำลังยืม (รวม {sub.total})
                    </span>
                  </div>
                  <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-teal-600 h-full rounded-full transition-all duration-500"
                      style={{ width: `${Math.max(percentage, 5)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span className="flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              มาตรฐานบริการปฐมภูมิ
            </span>
            <span>ประสานงาน รพ.สต. ทุกแห่ง</span>
          </div>
        </div>

        {/* Equipment Categories */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Bed className="w-4 h-4 text-teal-600" />
              <h3 className="font-semibold text-slate-800 text-sm font-['Prompt']">
                สถานะอุปกรณ์แยกตามประเภท
              </h3>
            </div>
            <button
              onClick={() => onNavigateTab('equipment')}
              className="text-xs text-teal-700 font-medium hover:underline inline-flex items-center gap-1"
            >
              ดูทั้งหมด →
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {Object.entries(categorySummary).map(([category, stats]) => (
              <div
                key={category}
                className="p-3 rounded-xl border border-slate-200 hover:border-teal-300 transition bg-white shadow-2xs flex items-center justify-between"
              >
                <div>
                  <h4 className="text-xs font-semibold text-slate-800">{category}</h4>
                  <div className="mt-1 flex items-center gap-2 text-[11px] text-slate-500">
                    <span>ทั้งหมด {stats.total} ชิ้น</span>
                    <span>•</span>
                    <span className="text-slate-400">ยืมอยู่ {stats.total - stats.available}</span>
                  </div>
                </div>
                <div className="text-right">
                  <span
                    className={`inline-block px-2.5 py-1 rounded-full text-xs font-semibold ${
                      stats.available > 0
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-rose-100 text-rose-800'
                    }`}
                  >
                    ว่าง {stats.available}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Quick info note */}
          <div className="mt-4 bg-teal-50/70 p-3 rounded-xl border border-teal-100 text-xs text-teal-800 flex items-center justify-between">
            <span>
              ℹ️ อุปกรณ์ทุกชิ้นผ่านการทำความสะอาด ฆ่าเชื้อ และตรวจเช็คความปลอดภัยก่อนส่งมอบ
            </span>
            <button
              onClick={onOpenNewLoan}
              className="font-semibold underline shrink-0 ml-2"
            >
              ยื่นขอยืม →
            </button>
          </div>
        </div>
      </div>

      {/* Recent / Active Loans Table */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-semibold text-slate-800 text-sm font-['Prompt']">
              รายการคำขอและสถานะการยืมล่าสุด
            </h3>
            <p className="text-xs text-slate-500">
              ติดตามวงจร ๔ ขั้นตอน (ยื่นคำขอ → อนุมัติ → ส่งมอบ → รับคืน)
            </p>
          </div>
          <button
            onClick={() => onNavigateTab('loans')}
            className="text-xs font-medium text-teal-700 hover:underline inline-flex items-center gap-1"
          >
            ดูรายการทั้งหมด ({loans.length}) <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {loans.length === 0 ? (
          <div className="text-center py-10 bg-slate-50 rounded-xl border border-dashed border-slate-200">
            <HeartHandshake className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <p className="text-xs font-medium text-slate-600">ยังไม่มีประวัติคำขอยืมอุปกรณ์</p>
            <p className="text-[11px] text-slate-400 mt-1">
              คลิกปุ่ม "ยื่นขอยืมอุปกรณ์" เพื่อเริ่มบันทึกรายการแรก
            </p>
            <button
              onClick={onOpenNewLoan}
              className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-teal-600 text-white text-xs px-3 py-1.5 font-medium hover:bg-teal-700"
            >
              ยื่นคำขอยืม
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 text-slate-500 font-medium border-y border-slate-200">
                <tr>
                  <th className="py-2.5 px-3">เลขที่คำขอ</th>
                  <th className="py-2.5 px-3">ผู้ป่วย / ผู้ยืม</th>
                  <th className="py-2.5 px-3">ตำบล</th>
                  <th className="py-2.5 px-3">อุปกรณ์ที่ยืม</th>
                  <th className="py-2.5 px-3">กำหนดส่งคืน</th>
                  <th className="py-2.5 px-3 text-center">สถานะ</th>
                  <th className="py-2.5 px-3 text-right">ดำเนินการ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loans.slice(0, 6).map((loan) => {
                  const check = getDaysRemaining(loan.expectedReturnDate);
                  return (
                    <tr
                      key={loan.id}
                      className="hover:bg-slate-50/80 transition cursor-pointer"
                      onClick={() => onSelectLoan(loan)}
                    >
                      <td className="py-3 px-3 font-mono font-medium text-slate-800">
                        {loan.requestNo}
                      </td>
                      <td className="py-3 px-3">
                        <div className="font-semibold text-slate-800">
                          {loan.patientName}
                        </div>
                        <div className="text-[11px] text-slate-400">
                          บัตร ปชช. {maskIdCard(loan.patientIdCard)}
                        </div>
                      </td>
                      <td className="py-3 px-3">
                        <span className="inline-flex items-center gap-1 text-slate-700">
                          <MapPin className="w-3 h-3 text-teal-600" />
                          ต.{loan.subdistrict}
                        </span>
                      </td>
                      <td className="py-3 px-3">
                        <div className="font-medium text-slate-800">{loan.equipmentName}</div>
                        <div className="text-[10px] text-slate-400 font-mono">
                          {loan.equipmentCode}
                        </div>
                      </td>
                      <td className="py-3 px-3">
                        <div className="text-slate-700 flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-slate-400" />
                          {formatThaiDate(loan.expectedReturnDate)}
                        </div>
                        {loan.status === 'delivered' && (
                          <div
                            className={`text-[10px] font-semibold ${
                              check.isOverdue ? 'text-rose-600' : 'text-slate-500'
                            }`}
                          >
                            {check.label}
                          </div>
                        )}
                      </td>
                      <td className="py-3 px-3 text-center">
                        <StatusBadge status={loan.status} />
                      </td>
                      <td className="py-3 px-3 text-right">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelectLoan(loan);
                          }}
                          className="text-teal-700 hover:text-teal-900 font-medium text-xs hover:underline"
                        >
                          เปิดดู
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export const StatusBadge: React.FC<{ status: LoanRecord['status'] }> = ({ status }) => {
  switch (status) {
    case 'pending_approval':
      return (
        <span className="inline-flex items-center gap-1 bg-amber-100 text-amber-800 text-[11px] font-semibold px-2.5 py-0.5 rounded-full border border-amber-200">
          <Clock className="w-3 h-3 text-amber-600" />
          รออนุมัติ
        </span>
      );
    case 'approved':
      return (
        <span className="inline-flex items-center gap-1 bg-sky-100 text-sky-800 text-[11px] font-semibold px-2.5 py-0.5 rounded-full border border-sky-200">
          <CheckCircle2 className="w-3 h-3 text-sky-600" />
          อนุมัติ-รอส่งมอบ
        </span>
      );
    case 'delivered':
      return (
        <span className="inline-flex items-center gap-1 bg-teal-100 text-teal-800 text-[11px] font-semibold px-2.5 py-0.5 rounded-full border border-teal-200">
          <HeartHandshake className="w-3 h-3 text-teal-600" />
          กำลังใช้งาน
        </span>
      );
    case 'returned':
      return (
        <span className="inline-flex items-center gap-1 bg-slate-100 text-slate-700 text-[11px] font-semibold px-2.5 py-0.5 rounded-full border border-slate-200">
          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
          รับคืนแล้ว
        </span>
      );
    case 'rejected':
      return (
        <span className="inline-flex items-center gap-1 bg-rose-100 text-rose-800 text-[11px] font-semibold px-2.5 py-0.5 rounded-full border border-rose-200">
          ไม่อนุมัติ
        </span>
      );
    default:
      return null;
  }
};
