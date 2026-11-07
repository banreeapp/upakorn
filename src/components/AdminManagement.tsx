import React, { useState } from 'react';
import { AdminRecord, AppUser, MedicalEquipment, LoanRecord } from '../types';
import { SUPER_ADMIN_UID, addAdminUser, removeAdminUser } from '../services/dbService';
import {
  ShieldCheck,
  Crown,
  UserCheck,
  UserPlus,
  Trash2,
  Key,
  Server,
  Database,
  Lock,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
} from 'lucide-react';
import { formatThaiDateTime } from '../utils/pdpa';

interface AdminManagementProps {
  admins: AdminRecord[];
  currentUser: AppUser;
  onSetCurrentUser: (user: AppUser) => void;
  equipment: MedicalEquipment[];
  loans: LoanRecord[];
}

export const AdminManagement: React.FC<AdminManagementProps> = ({
  admins,
  currentUser,
  onSetCurrentUser,
  equipment,
  loans,
}) => {
  const [newUid, setNewUid] = useState('');
  const [newName, setNewName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ text: string; isError?: boolean } | null>(null);
  const [copiedUid, setCopiedUid] = useState(false);

  const isSuperAdmin = currentUser.uid === SUPER_ADMIN_UID || currentUser.role === 'super_admin';

  const handleCopySuperAdminUid = () => {
    navigator.clipboard.writeText(SUPER_ADMIN_UID);
    setCopiedUid(true);
    setTimeout(() => setCopiedUid(false), 2000);
  };

  const handleSwitchToSuperAdmin = () => {
    onSetCurrentUser({
      uid: SUPER_ADMIN_UID,
      role: 'super_admin',
      name: 'ผู้ดูแลระบบ อ.ดอนพุด (Super Admin)',
      department: 'ศูนย์ประสานงานเทคโนโลยีสารสนเทศ อ.ดอนพุด',
      isSuperAdmin: true,
    });
    setMessage({ text: 'สลับเข้าสู่โหมดผู้ดูแลระบบสูงสุด (UID: ' + SUPER_ADMIN_UID + ') เรียบร้อยแล้ว' });
  };

  const handleAddAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUid.trim()) {
      setMessage({ text: 'กรุณากรอก UID ของผู้ใช้งาน', isError: true });
      return;
    }
    setIsLoading(true);
    setMessage(null);
    try {
      await addAdminUser(
        newUid.trim(),
        newName.trim() || 'เจ้าหน้าที่ผู้ดูแลระบบ',
        currentUser.name
      );
      setNewUid('');
      setNewName('');
      setMessage({ text: `เพิ่มผู้ดูแลระบบ UID: ${newUid.trim()} สำเร็จ` });
    } catch (err) {
      setMessage({
        text: 'เกิดข้อผิดพลาด: ' + (err instanceof Error ? err.message : String(err)),
        isError: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveAdmin = async (uid: string) => {
    if (uid === SUPER_ADMIN_UID) {
      alert('ไม่สามารถลบ Super Admin สูงสุดของระบบได้');
      return;
    }
    if (!confirm(`ต้องการยกเลิกสิทธิ์ผู้ดูแลระบบ UID: ${uid} หรือไม่?`)) return;

    try {
      await removeAdminUser(uid, currentUser.name);
      setMessage({ text: `ยกเลิกสิทธิ์ UID: ${uid} เรียบร้อยแล้ว` });
    } catch (err) {
      setMessage({
        text: 'เกิดข้อผิดพลาด: ' + (err instanceof Error ? err.message : String(err)),
        isError: true,
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Super Admin Highlight Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-teal-950 to-slate-900 p-6 sm:p-7 text-white shadow-xl border border-teal-500/30">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div className="space-y-2 max-w-xl">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-amber-400/20 px-3 py-1 text-xs font-semibold text-amber-300 border border-amber-400/30">
              <Crown className="w-3.5 h-3.5" />
              <span>ผู้ดูแลระบบสูงสุด (Super Administrator)</span>
            </div>

            <h2 className="text-xl sm:text-2xl font-bold font-['Prompt'] text-white">
              สิทธิ์ผู้ดูแลระบบ: อ.ดอนพุด
            </h2>

            <div className="flex items-center gap-2 pt-1">
              <span className="text-xs text-slate-300 font-medium">UID ผู้ดูแลระบบหลัก:</span>
              <div className="inline-flex items-center gap-2 bg-slate-800/80 px-3 py-1 rounded-lg border border-teal-400/30 text-teal-300 font-mono text-xs sm:text-sm font-bold">
                <Key className="w-3.5 h-3.5 text-amber-300" />
                <span>{SUPER_ADMIN_UID}</span>
                <button
                  onClick={handleCopySuperAdminUid}
                  className="p-1 hover:text-white transition ml-1"
                  title="คัดลอก UID"
                >
                  {copiedUid ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed pt-1">
              ได้รับการกำหนดสิทธิ์ใน Firebase Security Rules สำหรับโปรเจกต์{' '}
              <strong className="text-teal-300 font-mono">upakorn-b68e3</strong>{' '}
              สามารถควบคุมสิทธิ์ อนุมัติ ส่งมอบ ตรวจรับคืนอุปกรณ์ และจัดการข้อมูลระบบทั้งหมด
            </p>
          </div>

          <div className="flex flex-col gap-2 shrink-0">
            {isSuperAdmin ? (
              <div className="inline-flex items-center gap-2 bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 px-4 py-2.5 rounded-xl text-xs font-semibold">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>คุณกำลังใช้งานในฐานะ Super Admin</span>
              </div>
            ) : (
              <button
                type="button"
                onClick={handleSwitchToSuperAdmin}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold px-5 py-2.5 text-xs shadow-lg transition transform active:scale-95"
              >
                <Crown className="w-4 h-4 text-slate-950" />
                <span>สลับเป็น Super Admin (UID: {SUPER_ADMIN_UID})</span>
              </button>
            )}
          </div>
        </div>

        {/* Decorative blur */}
        <div className="absolute -right-16 -top-16 w-56 h-56 rounded-full bg-teal-500/10 pointer-events-none blur-3xl" />
      </div>

      {message && (
        <div
          className={`p-3.5 rounded-xl text-xs flex items-center gap-2 border ${
            message.isError
              ? 'bg-rose-50 text-rose-800 border-rose-200'
              : 'bg-emerald-50 text-emerald-800 border-emerald-200'
          }`}
        >
          {message.isError ? (
            <AlertCircle className="w-4 h-4 shrink-0" />
          ) : (
            <CheckCircle2 className="w-4 h-4 shrink-0" />
          )}
          <span>{message.text}</span>
        </div>
      )}

      {/* Grid: Admins List & Add Form */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Administrator List */}
        <div className="lg:col-span-7 bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-teal-600" />
              <h3 className="font-bold text-slate-800 text-sm font-['Prompt']">
                รายชื่อผู้ดูแลระบบในฐานข้อมูล (Admins)
              </h3>
            </div>
            <span className="text-xs bg-teal-50 text-teal-700 px-2.5 py-0.5 rounded-full font-semibold border border-teal-200">
              {admins.length} คน
            </span>
          </div>

          <div className="space-y-3">
            {/* Super Admin Card */}
            <div className="p-3.5 rounded-xl border-2 border-amber-300 bg-amber-50/40 flex items-start justify-between gap-3">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-xs">
                  <Crown className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900 text-xs sm:text-sm">
                      ผู้ดูแลระบบสูงสุด (Super Administrator)
                    </span>
                    <span className="bg-amber-400 text-slate-900 text-[10px] font-bold px-1.5 py-0.2 rounded">
                      หลัก
                    </span>
                  </div>
                  <div className="mt-1 font-mono text-[11px] text-slate-700 bg-white px-2 py-0.5 rounded border border-amber-200 inline-block">
                    UID: <strong>{SUPER_ADMIN_UID}</strong>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1">
                    สิทธิ์ระดับ Root ใน Firestore Security Rules
                  </p>
                </div>
              </div>
              <span className="text-[10px] text-amber-800 font-semibold bg-amber-100 px-2 py-1 rounded-md">
                ถาวร (Locked)
              </span>
            </div>

            {/* Other Admins from database */}
            {admins
              .filter((a) => a.uid !== SUPER_ADMIN_UID)
              .map((admin) => (
                <div
                  key={admin.uid}
                  className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 flex items-center justify-between gap-3 transition"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-teal-100 text-teal-700 flex items-center justify-center shrink-0 font-bold text-xs">
                      <UserCheck className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-semibold text-slate-800 text-xs">
                        {admin.name || 'เจ้าหน้าที่ผู้ดูแลระบบ'}
                      </div>
                      <div className="font-mono text-[10px] text-slate-500">
                        UID: {admin.uid}
                      </div>
                      {admin.assignedAt && (
                        <div className="text-[10px] text-slate-400">
                          แต่งตั้งเมื่อ: {formatThaiDateTime(admin.assignedAt)}
                        </div>
                      )}
                    </div>
                  </div>

                  {isSuperAdmin && (
                    <button
                      type="button"
                      onClick={() => handleRemoveAdmin(admin.uid)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition"
                      title="ยกเลิกสิทธิ์ผู้ดูแลระบบ"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
          </div>
        </div>

        {/* Add Admin Form & System Status */}
        <div className="lg:col-span-5 space-y-4">
          {/* Add Admin Box */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-3">
            <div className="flex items-center gap-2">
              <UserPlus className="w-4 h-4 text-teal-600" />
              <h3 className="font-bold text-slate-800 text-sm font-['Prompt']">
                แต่งตั้งผู้ดูแลระบบเพิ่ม
              </h3>
            </div>
            <p className="text-xs text-slate-500">
              กำหนดสิทธิ์ให้เจ้าหน้าที่ รพ.ดอนพุด หรือ สสอ.ดอนพุด โดยระบุ Firebase UID
            </p>

            <form onSubmit={handleAddAdmin} className="space-y-3 text-xs pt-1">
              <div>
                <label className="font-medium text-slate-700 block mb-1">
                  Firebase UID ผู้ใช้งาน: <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="เช่น b8XvK92l..."
                  value={newUid}
                  onChange={(e) => setNewUid(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs font-mono focus:border-teal-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="font-medium text-slate-700 block mb-1">
                  ชื่อ-นามสกุล หรือตำแหน่ง:
                </label>
                <input
                  type="text"
                  placeholder="เช่น เภสัชกร/พยาบาลวิชาชีพ รพ.ดอนพุด"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs focus:border-teal-500 focus:outline-hidden"
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full inline-flex items-center justify-center gap-1.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-medium py-2 text-xs shadow-xs transition"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>{isLoading ? 'กำลังบันทึก...' : 'บันทึกแต่งตั้งผู้ดูแลระบบ'}</span>
              </button>
            </form>
          </div>

          {/* System Health / Cloud Specs */}
          <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 text-xs space-y-2">
            <h4 className="font-bold text-slate-800 flex items-center gap-1.5">
              <Server className="w-3.5 h-3.5 text-teal-600" />
              ข้อมูลระบบคลาวด์และการสำรองข้อมูล
            </h4>
            <div className="space-y-1.5 text-slate-600 text-[11px]">
              <div className="flex justify-between">
                <span>Firebase Project:</span>
                <span className="font-mono font-bold text-teal-800">upakorn-b68e3</span>
              </div>
              <div className="flex justify-between">
                <span>Database ID:</span>
                <span className="font-mono text-slate-700">ai-studio-95eda797-...</span>
              </div>
              <div className="flex justify-between">
                <span>อุปกรณ์ทั้งหมด:</span>
                <span className="font-semibold text-slate-800">{equipment.length} ชิ้น</span>
              </div>
              <div className="flex justify-between">
                <span>รายการยืมสะสม:</span>
                <span className="font-semibold text-slate-800">{loans.length} รายการ</span>
              </div>
              <div className="flex justify-between">
                <span>การคุ้มครองข้อมูล:</span>
                <span className="text-emerald-700 font-medium">PDPA ๒๕๖๒ พร้อมใช้งาน</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
