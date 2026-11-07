import React, { useState, useMemo } from 'react';
import { LoanRecord, Subdistrict, AppUser } from '../types';
import {
  Search,
  Filter,
  PlusCircle,
  Eye,
  EyeOff,
  Printer,
  Calendar,
  MapPin,
  Clock,
  CheckCircle2,
  HeartHandshake,
  RotateCcw,
  AlertTriangle,
  User,
  LayoutGrid,
  List,
} from 'lucide-react';
import {
  formatThaiDate,
  maskIdCard,
  formatIdCard,
  maskPhone,
  formatPhone,
  getDaysRemaining,
} from '../utils/pdpa';
import { StatusBadge } from './DashboardView';

interface LoanManagementProps {
  loans: LoanRecord[];
  onSelectLoan: (loan: LoanRecord) => void;
  onOpenNewLoan: () => void;
  onOpenPrint: (loan: LoanRecord) => void;
  currentUser: AppUser;
}

export const LoanManagement: React.FC<LoanManagementProps> = ({
  loans,
  onSelectLoan,
  onOpenNewLoan,
  onOpenPrint,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedSubdistrict, setSelectedSubdistrict] = useState<string>('all');
  const [showFullPDPA, setShowFullPDPA] = useState(false);
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('table');

  const subdistricts: Subdistrict[] = ['ดอนพุด', 'ดงน้อย', 'บ้านหลวง', 'ไผ่หลิ่ว'];

  // Status counts
  const pendingCount = loans.filter((l) => l.status === 'pending_approval').length;
  const approvedCount = loans.filter((l) => l.status === 'approved').length;
  const deliveredCount = loans.filter((l) => l.status === 'delivered').length;
  const returnedCount = loans.filter((l) => l.status === 'returned').length;

  const filteredLoans = useMemo(() => {
    return loans.filter((loan) => {
      // Status filter
      if (selectedStatus !== 'all' && loan.status !== selectedStatus) {
        return false;
      }
      // Subdistrict filter
      if (selectedSubdistrict !== 'all' && loan.subdistrict !== selectedSubdistrict) {
        return false;
      }
      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchName = loan.patientName.toLowerCase().includes(q);
        const matchIdCard = loan.patientIdCard.includes(q);
        const matchReq = loan.requestNo.toLowerCase().includes(q);
        const matchEquip = loan.equipmentName.toLowerCase().includes(q) || loan.equipmentCode.toLowerCase().includes(q);
        const matchCaregiver = loan.caregiverName.toLowerCase().includes(q) || loan.caregiverPhone.includes(q);
        return matchName || matchIdCard || matchReq || matchEquip || matchCaregiver;
      }
      return true;
    });
  }, [loans, selectedStatus, selectedSubdistrict, searchQuery]);

  return (
    <div className="space-y-5">
      {/* Top Header & Fast Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h2 className="text-base sm:text-xl font-bold text-slate-800 font-['Prompt']">
            จัดการรายการยืม-คืนอุปกรณ์การแพทย์
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            ติดตามและบริหารจัดการวงจรการยืมของผู้ป่วยใน ๔ ตำบล อ.ดอนพุด
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* PDPA Mask Toggle */}
          <button
            type="button"
            onClick={() => setShowFullPDPA(!showFullPDPA)}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-medium text-slate-700 shadow-2xs hover:bg-slate-50 transition"
            title="แสดง/ซ่อนเลขบัตรประชาชนและเบอร์โทรศัพท์ตามกฎหมาย PDPA"
          >
            {showFullPDPA ? (
              <>
                <EyeOff className="w-3.5 h-3.5 text-teal-700" />
                <span className="hidden md:inline">ซ่อนข้อมูล PDPA</span>
              </>
            ) : (
              <>
                <Eye className="w-3.5 h-3.5 text-slate-600" />
                <span className="hidden md:inline">เปิดดูข้อมูลส่วนบุคคล</span>
              </>
            )}
          </button>

          {/* New loan button */}
          <button
            type="button"
            onClick={onOpenNewLoan}
            className="inline-flex items-center gap-1.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 text-xs font-semibold shadow-xs transition transform active:scale-95"
          >
            <PlusCircle className="w-4 h-4" />
            <span>ยื่นขอยืมอุปกรณ์</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3">
        {/* Status Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs scrollbar-none">
          {[
            { id: 'all', label: 'ทั้งหมด', count: loans.length },
            { id: 'pending_approval', label: 'รออนุมัติ', count: pendingCount, isAlert: pendingCount > 0 },
            { id: 'approved', label: 'อนุมัติแล้ว-รอส่งมอบ', count: approvedCount },
            { id: 'delivered', label: 'กำลังใช้งานในชุมชน', count: deliveredCount },
            { id: 'returned', label: 'รับคืนแล้ว', count: returnedCount },
            { id: 'rejected', label: 'ไม่อนุมัติ', count: loans.filter((l) => l.status === 'rejected').length },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setSelectedStatus(tab.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-medium shrink-0 transition ${
                selectedStatus === tab.id
                  ? 'bg-teal-700 text-white shadow-xs font-semibold'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              <span>{tab.label}</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                  selectedStatus === tab.id
                    ? 'bg-teal-900/50 text-white'
                    : tab.isAlert
                    ? 'bg-rose-500 text-white'
                    : 'bg-slate-200 text-slate-700'
                }`}
              >
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* Subdistrict & Search Row */}
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 pt-1">
          {/* Search box */}
          <div className="sm:col-span-7 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="ค้นหาเลขคำขอ, ชื่อผู้ป่วย, เลขบัตร ปชช., ชื่ออุปกรณ์ หรือเบอร์ติดต่อ..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-xl border border-slate-300 pl-9 pr-4 py-2 text-xs focus:border-teal-500 focus:outline-hidden"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-2.5 text-xs text-slate-400 hover:text-slate-600"
              >
                ล้าง
              </button>
            )}
          </div>

          {/* Subdistrict Dropdown */}
          <div className="sm:col-span-3">
            <div className="relative">
              <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <select
                value={selectedSubdistrict}
                onChange={(e) => setSelectedSubdistrict(e.target.value)}
                className="w-full rounded-xl border border-slate-300 pl-9 pr-3 py-2 text-xs focus:border-teal-500 focus:outline-hidden bg-white text-slate-700 appearance-none"
              >
                <option value="all">ทุกตำบลใน อ.ดอนพุด (๔ ตำบล)</option>
                {subdistricts.map((sub) => (
                  <option key={sub} value={sub}>
                    ตำบล{sub}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* View Mode Toggle */}
          <div className="sm:col-span-2 flex items-center justify-end gap-1 border border-slate-200 rounded-xl p-1 bg-slate-50">
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-lg text-xs transition ${
                viewMode === 'table'
                  ? 'bg-white text-teal-700 shadow-2xs'
                  : 'text-slate-400 hover:text-slate-600'
              }`}
              title="มุมมองตาราง"
            >
              <List className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('cards')}
              className={`p-1.5 rounded-lg text-xs transition ${
                viewMode === 'cards'
                  ? 'bg-white text-teal-700 shadow-2xs'
                  : 'text-slate-400 hover:text-slate-600'
              }`}
              title="มุมมองการ์ด"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      {filteredLoans.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-slate-200">
          <HeartHandshake className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-sm font-semibold text-slate-700">ไม่พบรายการที่ตรงกับเงื่อนไข</h3>
          <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
            ลองปรับเปลี่ยนคำค้นหา หรือเปลี่ยนสถานะตัวกรอง หรือคลิกยื่นคำขอยืมอุปกรณ์ใหม่
          </p>
          <button
            onClick={onOpenNewLoan}
            className="mt-4 inline-flex items-center gap-1.5 rounded-xl bg-teal-600 text-white text-xs px-4 py-2 font-medium hover:bg-teal-700 shadow-xs"
          >
            <PlusCircle className="w-4 h-4" />
            ยื่นคำขอยืมใหม่
          </button>
        </div>
      ) : viewMode === 'table' ? (
        /* Table View */
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 text-slate-500 font-medium border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">เลขคำขอ</th>
                  <th className="py-3 px-4">ผู้ป่วย / ผู้ยืม</th>
                  <th className="py-3 px-4">ตำบล</th>
                  <th className="py-3 px-4">อุปกรณ์การแพทย์</th>
                  <th className="py-3 px-4">กำหนดส่งคืน</th>
                  <th className="py-3 px-4 text-center">สถานะ</th>
                  <th className="py-3 px-4 text-right">ดำเนินการ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredLoans.map((loan) => {
                  const check = getDaysRemaining(loan.expectedReturnDate);
                  return (
                    <tr
                      key={loan.id}
                      className="hover:bg-slate-50/80 transition cursor-pointer"
                      onClick={() => onSelectLoan(loan)}
                    >
                      <td className="py-3.5 px-4 font-mono font-medium text-slate-800">
                        {loan.requestNo}
                        <div className="text-[10px] text-slate-400 font-sans">
                          {formatThaiDate(loan.requestDate)}
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-slate-800 text-sm">
                          {loan.patientName}
                        </div>
                        <div className="text-[11px] text-slate-500 flex items-center gap-2">
                          <span>
                            บัตร ปชช.{' '}
                            <strong className="font-mono">
                              {showFullPDPA
                                ? formatIdCard(loan.patientIdCard)
                                : maskIdCard(loan.patientIdCard)}
                            </strong>
                          </span>
                          <span>•</span>
                          <span>{loan.patientAge} ปี</span>
                        </div>
                        <div className="text-[11px] text-slate-400">
                          ผู้ยืม: {loan.caregiverName} ({loan.caregiverRelation}) โทร{' '}
                          {showFullPDPA
                            ? formatPhone(loan.caregiverPhone)
                            : maskPhone(loan.caregiverPhone)}
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="inline-flex items-center gap-1 font-medium text-slate-700 bg-slate-100 px-2.5 py-1 rounded-lg">
                          <MapPin className="w-3 h-3 text-teal-600" />
                          ต.{loan.subdistrict}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-medium text-slate-800">{loan.equipmentName}</div>
                        <div className="text-[10px] font-mono text-teal-700">
                          {loan.equipmentCode} • {loan.category}
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="text-slate-700 flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          {formatThaiDate(loan.expectedReturnDate)}
                        </div>
                        {loan.status === 'delivered' && (
                          <div
                            className={`text-[10px] font-bold mt-0.5 ${
                              check.isOverdue ? 'text-rose-600' : 'text-slate-500'
                            }`}
                          >
                            {check.label}
                          </div>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <StatusBadge status={loan.status} />
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div
                          className="flex items-center justify-end gap-1.5"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <button
                            type="button"
                            onClick={() => onSelectLoan(loan)}
                            className="rounded-lg bg-teal-50 text-teal-700 hover:bg-teal-100 px-2.5 py-1 text-xs font-semibold"
                          >
                            จัดการ
                          </button>
                          <button
                            type="button"
                            onClick={() => onOpenPrint(loan)}
                            className="rounded-lg p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100"
                            title="พิมพ์เอกสาร"
                          >
                            <Printer className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Cards View (Mobile Optimized) */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredLoans.map((loan) => {
            const check = getDaysRemaining(loan.expectedReturnDate);
            return (
              <div
                key={loan.id}
                onClick={() => onSelectLoan(loan)}
                className="cursor-pointer bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 hover:border-teal-400 shadow-xs hover:shadow-md transition space-y-3"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="font-mono text-xs font-bold text-teal-800 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                      {loan.requestNo}
                    </span>
                    <span className="text-[11px] text-slate-400 ml-2">
                      {formatThaiDate(loan.requestDate)}
                    </span>
                  </div>
                  <StatusBadge status={loan.status} />
                </div>

                <div className="border-t border-slate-100 pt-2 space-y-1">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-slate-800 text-sm font-['Prompt']">
                      {loan.patientName}
                    </h3>
                    <span className="text-xs text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-teal-600" />
                      ต.{loan.subdistrict}
                    </span>
                  </div>

                  <p className="text-xs text-slate-500">
                    เลขบัตร ปชช.:{' '}
                    <span className="font-mono font-medium">
                      {showFullPDPA
                        ? formatIdCard(loan.patientIdCard)
                        : maskIdCard(loan.patientIdCard)}
                    </span>
                    {' '}(อายุ {loan.patientAge} ปี)
                  </p>

                  <p className="text-xs text-slate-600">
                    <strong>อุปกรณ์:</strong> {loan.equipmentName} ({loan.equipmentCode})
                  </p>
                </div>

                <div className="flex items-center justify-between text-xs bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                  <div className="flex items-center gap-1 text-slate-700">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    <span>คืน: {formatThaiDate(loan.expectedReturnDate)}</span>
                  </div>
                  {loan.status === 'delivered' && (
                    <span
                      className={`font-semibold text-[11px] ${
                        check.isOverdue ? 'text-rose-600 font-bold' : 'text-slate-500'
                      }`}
                    >
                      {check.label}
                    </span>
                  )}
                </div>

                <div
                  className="flex items-center justify-between pt-1 border-t border-slate-100 text-xs"
                  onClick={(e) => e.stopPropagation()}
                >
                  <span className="text-[11px] text-slate-400">
                    ผู้ยืม: {loan.caregiverName} ({loan.caregiverRelation})
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => onOpenPrint(loan)}
                      className="p-1 text-slate-400 hover:text-slate-700"
                      title="พิมพ์ใบสัญญา"
                    >
                      <Printer className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => onSelectLoan(loan)}
                      className="text-teal-700 font-semibold hover:underline"
                    >
                      ดูรายละเอียด →
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
