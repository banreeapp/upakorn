/**
 * ระบบยืมคืนอุปกรณ์ อ.ดอนพุด
 * ระบบบริหารจัดการการยืม การอนุมัติ การส่งมอบ และการรับคืนอุปกรณ์การแพทย์สำหรับผู้ป่วย
 * อำเภอดอนพุด จังหวัดสระบุรี
 * ฐานข้อมูล: Firebase Firestore (Project: upakorn-b68e3)
 * ผู้ดูแลระบบสูงสุด (Super Admin): UID qhn0gWsCoAoQkCjfTGEA
 */

import React, { useState, useEffect } from 'react';
import {
  MedicalEquipment,
  LoanRecord,
  AuditLog,
  AdminRecord,
  AppUser,
} from './types';
import {
  subscribeToEquipment,
  subscribeToLoans,
  subscribeToAuditLogs,
  subscribeToAdmins,
  seedInitialEquipmentIfEmpty,
  SUPER_ADMIN_UID,
} from './services/dbService';
import { testConnection } from './firebase';
import { Header } from './components/Header';
import { DashboardView } from './components/DashboardView';
import { LoanManagement } from './components/LoanManagement';
import { EquipmentManagement } from './components/EquipmentManagement';
import { AuditLogView } from './components/AuditLogView';
import { AdminManagement } from './components/AdminManagement';
import { LoanDetailModal } from './components/LoanDetailModal';
import { LoanAgreementPrint } from './components/LoanAgreementPrint';
import { NewLoanModal } from './components/NewLoanModal';
import {
  Layers,
  FileText,
  Package,
  Activity,
  PlusCircle,
  Database,
  ShieldCheck,
  Crown,
  Phone,
} from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<
    'overview' | 'loans' | 'equipment' | 'new_loan' | 'audit' | 'admin'
  >('overview');

  const [equipment, setEquipment] = useState<MedicalEquipment[]>([]);
  const [loans, setLoans] = useState<LoanRecord[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [admins, setAdmins] = useState<AdminRecord[]>([]);

  // Current session user initialized with Super Administrator credentials
  const [currentUser, setCurrentUser] = useState<AppUser>({
    uid: SUPER_ADMIN_UID,
    role: 'super_admin',
    name: 'ผู้ดูแลระบบ อ.ดอนพุด (Super Admin)',
    department: 'ศูนย์ประสานงานเทคโนโลยีสารสนเทศ อ.ดอนพุด',
    isSuperAdmin: true,
  });

  // Modal states
  const [selectedLoan, setSelectedLoan] = useState<LoanRecord | null>(null);
  const [printLoan, setPrintLoan] = useState<LoanRecord | null>(null);
  const [showNewLoanModal, setShowNewLoanModal] = useState(false);
  const [preselectedEquipId, setPreselectedEquipId] = useState<string | undefined>();

  // Initialize and subscribe
  useEffect(() => {
    // 1. Test server connection
    testConnection();

    // 2. Seed initial equipment and super admin in Firestore
    seedInitialEquipmentIfEmpty();

    // 3. Real-time subscriptions
    const unsubEquip = subscribeToEquipment((items) => setEquipment(items));
    const unsubLoans = subscribeToLoans((items) => setLoans(items));
    const unsubLogs = subscribeToAuditLogs((items) => setAuditLogs(items));
    const unsubAdmins = subscribeToAdmins((items) => setAdmins(items));

    return () => {
      unsubEquip();
      unsubLoans();
      unsubLogs();
      unsubAdmins();
    };
  }, []);

  const pendingLoansCount = loans.filter((l) => l.status === 'pending_approval').length;

  const handleOpenBorrowItem = (equipId: string) => {
    setPreselectedEquipId(equipId);
    setShowNewLoanModal(true);
  };

  const handleOpenNewLoanGeneral = () => {
    setPreselectedEquipId(undefined);
    setShowNewLoanModal(true);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col text-slate-800">
      {/* Top Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        currentUser={currentUser}
        setCurrentUser={setCurrentUser}
        pendingCount={pendingLoansCount}
        onOpenNewLoan={handleOpenNewLoanGeneral}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 py-6 pb-24 lg:pb-12">
        {activeTab === 'overview' && (
          <DashboardView
            equipment={equipment}
            loans={loans}
            onSelectLoan={(loan) => setSelectedLoan(loan)}
            onNavigateTab={(tab) => setActiveTab(tab)}
            onOpenNewLoan={handleOpenNewLoanGeneral}
            currentUser={currentUser}
          />
        )}

        {activeTab === 'loans' && (
          <LoanManagement
            loans={loans}
            onSelectLoan={(loan) => setSelectedLoan(loan)}
            onOpenNewLoan={handleOpenNewLoanGeneral}
            onOpenPrint={(loan) => setPrintLoan(loan)}
            currentUser={currentUser}
          />
        )}

        {activeTab === 'equipment' && (
          <EquipmentManagement
            equipment={equipment}
            onBorrowItem={handleOpenBorrowItem}
            currentUser={currentUser}
          />
        )}

        {activeTab === 'audit' && <AuditLogView logs={auditLogs} />}

        {activeTab === 'admin' && (
          <AdminManagement
            admins={admins}
            currentUser={currentUser}
            onSetCurrentUser={setCurrentUser}
            equipment={equipment}
            loans={loans}
          />
        )}
      </main>

      {/* Mobile Bottom Navigation Bar */}
      <nav className="no-print lg:hidden fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-slate-200 px-2 py-1.5 z-40 shadow-lg">
        <div className="flex items-center justify-around">
          <button
            onClick={() => setActiveTab('overview')}
            className={`flex flex-col items-center py-1 px-2 text-[10px] font-medium transition ${
              activeTab === 'overview'
                ? 'text-teal-700 font-semibold'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Layers className="w-5 h-5 mb-0.5" />
            <span>ภาพรวม</span>
          </button>

          <button
            onClick={() => setActiveTab('loans')}
            className={`relative flex flex-col items-center py-1 px-2 text-[10px] font-medium transition ${
              activeTab === 'loans'
                ? 'text-teal-700 font-semibold'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <FileText className="w-5 h-5 mb-0.5" />
            <span>ยืม-คืน</span>
            {pendingLoansCount > 0 && (
              <span className="absolute top-0 right-1 w-2 h-2 rounded-full bg-rose-500" />
            )}
          </button>

          {/* Quick Floating Center Button */}
          <button
            onClick={handleOpenNewLoanGeneral}
            className="flex flex-col items-center -mt-5 bg-teal-600 text-white rounded-full p-2.5 shadow-md shadow-teal-600/30 active:scale-95 transition"
          >
            <PlusCircle className="w-6 h-6" />
          </button>

          <button
            onClick={() => setActiveTab('equipment')}
            className={`flex flex-col items-center py-1 px-2 text-[10px] font-medium transition ${
              activeTab === 'equipment'
                ? 'text-teal-700 font-semibold'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Package className="w-5 h-5 mb-0.5" />
            <span>คลังอุปกรณ์</span>
          </button>

          <button
            onClick={() => setActiveTab('admin')}
            className={`flex flex-col items-center py-1 px-2 text-[10px] font-medium transition ${
              activeTab === 'admin'
                ? 'text-amber-700 font-bold'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Crown className="w-5 h-5 mb-0.5 text-amber-500" />
            <span>แอดมิน</span>
          </button>
        </div>
      </nav>

      {/* Footer */}
      <footer className="no-print bg-white border-t border-slate-200 py-6 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
          <div>
            <p className="font-semibold text-slate-800 font-['Prompt']">
              ระบบยืมคืนอุปกรณ์การแพทย์ อำเภอดอนพุด จังหวัดสระบุรี
            </p>
            <p className="text-[11px] text-slate-400 mt-0.5">
              ศูนย์บริการเพื่อการฟื้นฟูสมรรถภาพในชุมชน • รพ.ดอนพุด ร่วมกับ สำนักงานสาธารณสุขอำเภอดอนพุด และ รพ.สต. ๔ ตำบล
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4 text-[11px]">
            <span className="inline-flex items-center gap-1 text-teal-700 font-medium">
              <Database className="w-3.5 h-3.5" />
              Firebase Project: upakorn-b68e3
            </span>
            <span className="inline-flex items-center gap-1 text-amber-700 font-medium bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
              <Crown className="w-3 h-3 text-amber-600" />
              Admin UID: {SUPER_ADMIN_UID}
            </span>
            <span className="inline-flex items-center gap-1 text-emerald-700 font-medium">
              <ShieldCheck className="w-3.5 h-3.5" />
              มาตรฐาน PDPA ๒๕๖๒
            </span>
            <span className="inline-flex items-center gap-1 text-slate-600">
              <Phone className="w-3 h-3 text-slate-400" />
              โทร 036-395-xxx
            </span>
          </div>
        </div>
      </footer>

      {/* Loan Detail Modal */}
      {selectedLoan && (
        <LoanDetailModal
          loan={selectedLoan}
          onClose={() => setSelectedLoan(null)}
          onOpenPrint={(loan) => {
            setSelectedLoan(null);
            setPrintLoan(loan);
          }}
          currentUser={currentUser}
        />
      )}

      {/* Printable Loan Agreement Modal */}
      {printLoan && (
        <LoanAgreementPrint
          loan={printLoan}
          onClose={() => setPrintLoan(null)}
        />
      )}

      {/* New Loan Request Modal */}
      {showNewLoanModal && (
        <NewLoanModal
          equipment={equipment}
          preselectedEquipmentId={preselectedEquipId}
          onClose={() => {
            setShowNewLoanModal(false);
            setPreselectedEquipId(undefined);
          }}
          currentUser={currentUser}
        />
      )}
    </div>
  );
}
