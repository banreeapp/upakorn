import React, { useState } from 'react';
import { LoanRecord, AppUser } from '../types';
import {
  formatThaiDate,
  formatThaiDateTime,
  maskIdCard,
  formatIdCard,
  maskPhone,
  formatPhone,
  getDaysRemaining,
} from '../utils/pdpa';
import {
  X,
  Printer,
  CheckCircle2,
  AlertCircle,
  Clock,
  HeartHandshake,
  User,
  MapPin,
  Calendar,
  FileCheck,
  Eye,
  EyeOff,
  PenTool,
  RotateCcw,
  Sparkles,
} from 'lucide-react';
import {
  approveLoan,
  rejectLoan,
  deliverEquipment,
  returnEquipment,
} from '../services/dbService';
import { SignaturePad } from './SignaturePad';
import confetti from 'canvas-confetti';

interface LoanDetailModalProps {
  loan: LoanRecord;
  onClose: () => void;
  onOpenPrint: (loan: LoanRecord) => void;
  currentUser: AppUser;
}

export const LoanDetailModal: React.FC<LoanDetailModalProps> = ({
  loan,
  onClose,
  onOpenPrint,
  currentUser,
}) => {
  // PDPA view toggle for authorized staff
  const [showFullPDPA, setShowFullPDPA] = useState(false);

  // Workflow action dialogs
  const [showApproveDialog, setShowApproveDialog] = useState(false);
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [showDeliverDialog, setShowDeliverDialog] = useState(false);
  const [showSignaturePad, setShowSignaturePad] = useState(false);
  const [showReturnDialog, setShowReturnDialog] = useState(false);

  // Form states for actions
  const [approverName, setApproverName] = useState(currentUser.name || 'พว. นฤมล ศรีสวัสดิ์');
  const [approvalNotes, setApprovalNotes] = useState('ผู้ป่วยติดเตียงจำเป็นต้องใช้เพื่อฟื้นฟูสมรรถภาพ');
  const [rejectionReason, setRejectionReason] = useState('');

  // Delivery states
  const [delivererName, setDelivererName] = useState(currentUser.name || 'เจ้าหน้าที่ รพ.ดอนพุด');
  const [recipientName, setRecipientName] = useState(loan.caregiverName);
  const [deliveryConditionNotes, setDeliveryConditionNotes] = useState(
    'อุปกรณ์สะอาด ผ่านการตรวจเช็คสภาพพร้อมใช้งาน'
  );
  const [signatureDataUrl, setSignatureDataUrl] = useState(loan.signatureDataUrl || '');

  // Return states
  const [returnerName, setReturnerName] = useState(loan.caregiverName);
  const [returnReceiverName, setReturnReceiverName] = useState(currentUser.name || 'เจ้าหน้าที่คลัง อ.ดอนพุด');
  const [returnCondition, setReturnCondition] = useState<
    'สมบูรณ์ดี' | 'ต้องทำความสะอาด/ฆ่าเชื้อ' | 'ชำรุดเสียหาย'
  >('สมบูรณ์ดี');
  const [returnNotes, setReturnNotes] = useState('ผู้ป่วยอาการดีขึ้น/พ้นความจำเป็น ส่งคืนในสภาพเรียบร้อย');

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const daysCheck = getDaysRemaining(loan.expectedReturnDate);

  // Action Handlers
  const handleApprove = async () => {
    setIsLoading(true);
    setErrorMessage('');
    try {
      await approveLoan(loan.id, loan.equipmentId, approverName, approvalNotes);
      setShowApproveDialog(false);
      try {
        confetti({ particleCount: 50, spread: 60, origin: { y: 0.7 } });
      } catch {}
      onClose();
    } catch (err) {
      setErrorMessage('ไม่สามารถอนุมัติได้: ' + (err instanceof Error ? err.message : String(err)));
    } finally {
      setIsLoading(false);
    }
  };

  const handleReject = async () => {
    if (!rejectionReason.trim()) {
      alert('กรุณาระบุเหตุผลในการไม่อนุมัติ');
      return;
    }
    setIsLoading(true);
    setErrorMessage('');
    try {
      await rejectLoan(loan.id, loan.equipmentId, currentUser.name, rejectionReason);
      setShowRejectDialog(false);
      onClose();
    } catch (err) {
      setErrorMessage('เกิดข้อผิดพลาด: ' + (err instanceof Error ? err.message : String(err)));
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeliver = async () => {
    setIsLoading(true);
    setErrorMessage('');
    try {
      await deliverEquipment(
        loan.id,
        loan.equipmentId,
        delivererName,
        recipientName,
        deliveryConditionNotes,
        signatureDataUrl
      );
      setShowDeliverDialog(false);
      try {
        confetti({ particleCount: 60, spread: 70, origin: { y: 0.6 } });
      } catch {}
      onClose();
    } catch (err) {
      setErrorMessage('เกิดข้อผิดพลาด: ' + (err instanceof Error ? err.message : String(err)));
    } finally {
      setIsLoading(false);
    }
  };

  const handleReturn = async () => {
    setIsLoading(true);
    setErrorMessage('');
    try {
      await returnEquipment(
        loan.id,
        loan.equipmentId,
        returnerName,
        returnReceiverName,
        returnCondition,
        returnNotes
      );
      setShowReturnDialog(false);
      try {
        confetti({ particleCount: 70, spread: 80, origin: { y: 0.7 } });
      } catch {}
      onClose();
    } catch (err) {
      setErrorMessage('เกิดข้อผิดพลาด: ' + (err instanceof Error ? err.message : String(err)));
    } finally {
      setIsLoading(false);
    }
  };

  // Step tracker active index
  const getStepIndex = (status: LoanRecord['status']) => {
    switch (status) {
      case 'pending_approval':
        return 1;
      case 'approved':
        return 2;
      case 'delivered':
        return 3;
      case 'returned':
        return 4;
      case 'rejected':
        return 0;
      default:
        return 1;
    }
  };

  const currentStep = getStepIndex(loan.status);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 p-3 sm:p-6 backdrop-blur-xs flex justify-center items-start">
      <div className="w-full max-w-4xl rounded-2xl bg-white shadow-2xl overflow-hidden my-3 border border-slate-200">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4 bg-slate-50">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-bold text-teal-700 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                {loan.requestNo}
              </span>
              <h2 className="text-base sm:text-lg font-bold text-slate-800 font-['Prompt']">
                รายละเอียดการยืมอุปกรณ์การแพทย์
              </h2>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              ผู้ป่วย: {loan.patientName} (ต.{loan.subdistrict} อ.ดอนพุด)
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onOpenPrint(loan)}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 shadow-2xs hover:bg-slate-50 transition"
              title="พิมพ์ใบยืมและส่งมอบอุปกรณ์"
            >
              <Printer className="w-4 h-4 text-slate-600" />
              <span className="hidden sm:inline">พิมพ์สัญญา</span>
            </button>
            <button
              onClick={onClose}
              className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-200 hover:text-slate-600 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
          {errorMessage && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* 4-Step Lifecycle Bar */}
          <div className="bg-slate-50/80 p-4 rounded-xl border border-slate-200">
            <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
              <span className="font-semibold text-slate-700">วงจรการยืม-คืน ๔ ขั้นตอน</span>
              <span>สถานะ: <strong className="text-teal-700">{getStatusText(loan.status)}</strong></span>
            </div>

            <div className="grid grid-cols-4 gap-2 text-center text-[11px]">
              {/* Step 1 */}
              <div
                className={`p-2 rounded-lg border transition ${
                  currentStep >= 1 && loan.status !== 'rejected'
                    ? 'bg-teal-50 border-teal-300 text-teal-800 font-semibold'
                    : 'bg-white border-slate-200 text-slate-400'
                }`}
              >
                <div className="flex items-center justify-center gap-1">
                  <FileCheck className="w-3.5 h-3.5" />
                  <span>๑. ยื่นคำขอ</span>
                </div>
                <div className="text-[10px] text-slate-500 mt-0.5">
                  {formatThaiDate(loan.requestDate)}
                </div>
              </div>

              {/* Step 2 */}
              <div
                className={`p-2 rounded-lg border transition ${
                  currentStep >= 2 && loan.status !== 'rejected'
                    ? 'bg-teal-50 border-teal-300 text-teal-800 font-semibold'
                    : 'bg-white border-slate-200 text-slate-400'
                }`}
              >
                <div className="flex items-center justify-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>๒. อนุมัติ</span>
                </div>
                <div className="text-[10px] text-slate-500 mt-0.5">
                  {loan.approvalDate ? formatThaiDate(loan.approvalDate) : 'รออนุมัติ'}
                </div>
              </div>

              {/* Step 3 */}
              <div
                className={`p-2 rounded-lg border transition ${
                  currentStep >= 3 && loan.status !== 'rejected'
                    ? 'bg-teal-50 border-teal-300 text-teal-800 font-semibold'
                    : 'bg-white border-slate-200 text-slate-400'
                }`}
              >
                <div className="flex items-center justify-center gap-1">
                  <HeartHandshake className="w-3.5 h-3.5" />
                  <span>๓. ส่งมอบ</span>
                </div>
                <div className="text-[10px] text-slate-500 mt-0.5">
                  {loan.deliveryDate ? formatThaiDate(loan.deliveryDate) : 'รอส่งมอบ'}
                </div>
              </div>

              {/* Step 4 */}
              <div
                className={`p-2 rounded-lg border transition ${
                  currentStep >= 4 && loan.status !== 'rejected'
                    ? 'bg-emerald-50 border-emerald-300 text-emerald-800 font-semibold'
                    : 'bg-white border-slate-200 text-slate-400'
                }`}
              >
                <div className="flex items-center justify-center gap-1">
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>๔. รับคืน</span>
                </div>
                <div className="text-[10px] text-slate-500 mt-0.5">
                  {loan.returnDate ? formatThaiDate(loan.returnDate) : 'ยังไม่ส่งคืน'}
                </div>
              </div>
            </div>

            {loan.status === 'rejected' && (
              <div className="mt-3 p-2.5 bg-rose-50 border border-rose-200 rounded-lg text-rose-800 text-xs">
                <strong>ไม่อนุมัติ:</strong> {loan.rejectionReason || 'ไม่ผ่านเกณฑ์ความจำเป็น'}
              </div>
            )}
          </div>

          {/* Equipment Details Card */}
          <div className="rounded-xl border border-slate-200 p-4 bg-white shadow-2xs">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-teal-600" />
              อุปกรณ์ที่ยืม
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="bg-slate-50 p-3 rounded-lg">
                <span className="text-slate-400 block text-[11px]">ชื่ออุปกรณ์</span>
                <span className="font-semibold text-slate-800 text-sm">{loan.equipmentName}</span>
              </div>
              <div className="bg-slate-50 p-3 rounded-lg">
                <span className="text-slate-400 block text-[11px]">รหัสครุภัณฑ์</span>
                <span className="font-mono font-bold text-teal-700 text-sm">{loan.equipmentCode}</span>
              </div>
              <div className="bg-slate-50 p-3 rounded-lg">
                <span className="text-slate-400 block text-[11px]">หมวดหมู่</span>
                <span className="font-medium text-slate-700">{loan.category}</span>
              </div>
            </div>

            <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-xs bg-teal-50/50 p-2.5 rounded-lg border border-teal-100">
              <div className="flex items-center gap-1.5 text-teal-900">
                <Calendar className="w-4 h-4 text-teal-600" />
                <span>กำหนดส่งคืน: <strong>{formatThaiDate(loan.expectedReturnDate)}</strong></span>
              </div>
              {loan.status === 'delivered' && (
                <span
                  className={`px-2.5 py-0.5 rounded-full font-semibold ${
                    daysCheck.isOverdue
                      ? 'bg-rose-100 text-rose-800 border border-rose-200'
                      : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                  }`}
                >
                  {daysCheck.label}
                </span>
              )}
            </div>
          </div>

          {/* Patient and Caregiver Details with PDPA Safeguard */}
          <div className="rounded-xl border border-slate-200 p-4 bg-white shadow-2xs">
            <div className="flex items-center justify-between mb-3 border-b border-slate-100 pb-2">
              <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <User className="w-4 h-4 text-teal-600" />
                ข้อมูลผู้ป่วยและผู้ยืม (คุ้มครองตาม PDPA)
              </h3>
              <button
                type="button"
                onClick={() => setShowFullPDPA(!showFullPDPA)}
                className="inline-flex items-center gap-1 text-[11px] font-medium text-teal-700 hover:text-teal-900 bg-teal-50 px-2.5 py-1 rounded-lg border border-teal-200 transition"
              >
                {showFullPDPA ? (
                  <>
                    <EyeOff className="w-3.5 h-3.5" />
                    <span>ซ่อนข้อมูลส่วนบุคคล</span>
                  </>
                ) : (
                  <>
                    <Eye className="w-3.5 h-3.5" />
                    <span>แสดงเลขบัตร/เบอร์โทรเต็ม</span>
                  </>
                )}
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              {/* Patient info */}
              <div className="space-y-2 border-r-0 md:border-r border-slate-100 pr-0 md:pr-4">
                <h4 className="font-semibold text-slate-800 text-xs bg-slate-50 p-1.5 rounded">
                  ข้อมูลผู้ป่วย
                </h4>
                <div className="grid grid-cols-3 gap-1">
                  <span className="text-slate-400">ชื่อ-นามสกุล:</span>
                  <span className="col-span-2 font-semibold text-slate-800">
                    {loan.patientName} ({loan.patientGender}, {loan.patientAge} ปี)
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-1">
                  <span className="text-slate-400">เลขบัตร ปชช.:</span>
                  <span className="col-span-2 font-mono font-medium">
                    {showFullPDPA ? formatIdCard(loan.patientIdCard) : maskIdCard(loan.patientIdCard)}
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-1">
                  <span className="text-slate-400">การวินิจฉัย/กลุ่มโรค:</span>
                  <span className="col-span-2 text-slate-800 font-medium">
                    {loan.patientDiagnosis || '-'}
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-1">
                  <span className="text-slate-400">ที่อยู่ใน อ.ดอนพุด:</span>
                  <span className="col-span-2 text-slate-800">
                    <MapPin className="w-3 h-3 text-teal-600 inline mr-1" />
                    {loan.patientAddress} ต.{loan.subdistrict} อ.ดอนพุด จ.สระบุรี
                    {loan.landmark ? ` (${loan.landmark})` : ''}
                  </span>
                </div>
              </div>

              {/* Caregiver/Borrower info */}
              <div className="space-y-2">
                <h4 className="font-semibold text-slate-800 text-xs bg-slate-50 p-1.5 rounded">
                  ข้อมูลผู้ยืม / ญาติผู้ดูแล
                </h4>
                <div className="grid grid-cols-3 gap-1">
                  <span className="text-slate-400">ชื่อผู้ยืม:</span>
                  <span className="col-span-2 font-semibold text-slate-800">
                    {loan.caregiverName}
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-1">
                  <span className="text-slate-400">ความสัมพันธ์:</span>
                  <span className="col-span-2 text-slate-800">
                    {loan.caregiverRelation}
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-1">
                  <span className="text-slate-400">เลขบัตร ปชช.:</span>
                  <span className="col-span-2 font-mono">
                    {showFullPDPA ? formatIdCard(loan.caregiverIdCard) : maskIdCard(loan.caregiverIdCard)}
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-1">
                  <span className="text-slate-400">เบอร์โทรศัพท์:</span>
                  <span className="col-span-2 font-medium text-teal-800">
                    {showFullPDPA ? formatPhone(loan.caregiverPhone) : maskPhone(loan.caregiverPhone)}
                  </span>
                </div>
                {loan.purposeNotes && (
                  <div className="grid grid-cols-3 gap-1 pt-1">
                    <span className="text-slate-400">วัตถุประสงค์:</span>
                    <span className="col-span-2 text-slate-600 italic">
                      {loan.purposeNotes}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Delivery & Signature Section (if delivered or has signature) */}
          {loan.deliveryDate && (
            <div className="rounded-xl border border-slate-200 p-4 bg-slate-50 text-xs space-y-2">
              <h4 className="font-semibold text-slate-800 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-teal-600" />
                บันทึกการส่งมอบอุปกรณ์
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <span className="text-slate-400 block text-[11px]">วันที่ส่งมอบ</span>
                  <span className="font-medium text-slate-800">{formatThaiDateTime(loan.deliveryDate)}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">ผู้ส่งมอบ</span>
                  <span className="font-medium text-slate-800">{loan.deliveredBy || '-'}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">ผู้รับมอบ</span>
                  <span className="font-medium text-slate-800">{loan.receivedBy || '-'}</span>
                </div>
              </div>
              {loan.deliveryConditionNotes && (
                <p className="text-slate-600">
                  <strong>สภาพอุปกรณ์ตอนส่งมอบ:</strong> {loan.deliveryConditionNotes}
                </p>
              )}
              {loan.signatureDataUrl && (
                <div className="pt-2">
                  <span className="text-slate-500 block text-[11px] mb-1">ลายมือชื่อผู้รับมอบ:</span>
                  <div className="bg-white p-2 rounded-lg border border-slate-200 inline-block">
                    <img
                      src={loan.signatureDataUrl}
                      alt="ลายมือชื่อผู้รับมอบ"
                      className="max-h-16 object-contain"
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Return Record Section (if returned) */}
          {loan.returnDate && (
            <div className="rounded-xl border border-emerald-200 bg-emerald-50/60 p-4 text-xs space-y-2">
              <h4 className="font-semibold text-emerald-900 flex items-center gap-1.5">
                <RotateCcw className="w-4 h-4 text-emerald-700" />
                บันทึกการรับคืนอุปกรณ์
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <span className="text-slate-500 block text-[11px]">วันที่รับคืน</span>
                  <span className="font-medium text-slate-800">{formatThaiDateTime(loan.returnDate)}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[11px]">ผู้ส่งคืน</span>
                  <span className="font-medium text-slate-800">{loan.returnedBy}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[11px]">ผู้ตรวจรับคืน</span>
                  <span className="font-medium text-slate-800">{loan.receivedReturnBy}</span>
                </div>
              </div>
              <div className="flex items-center gap-2 pt-1">
                <span className="text-slate-500">สภาพเมื่อรับคืน:</span>
                <span className="font-semibold text-emerald-900 bg-white px-2 py-0.5 rounded border border-emerald-200">
                  {loan.returnCondition}
                </span>
                {loan.returnNotes && (
                  <span className="text-slate-600 italic">({loan.returnNotes})</span>
                )}
              </div>
            </div>
          )}

          {/* Action Trigger Bars (Interactive Workflows) */}
          <div className="border-t border-slate-200 pt-4">
            <h4 className="text-xs font-bold text-slate-600 mb-3 uppercase tracking-wider">
              การดำเนินการตามสถานะ (Workflow Actions)
            </h4>

            {loan.status === 'pending_approval' && (
              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() => setShowApproveDialog(true)}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 text-xs font-semibold shadow-xs transition"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  อนุมัติคำขอยืม (Step ๒)
                </button>
                <button
                  type="button"
                  onClick={() => setShowRejectDialog(true)}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-rose-300 bg-white text-rose-700 hover:bg-rose-50 px-4 py-2 text-xs font-semibold shadow-xs transition"
                >
                  <X className="w-4 h-4" />
                  ไม่อนุมัติคำขอ
                </button>
              </div>
            )}

            {loan.status === 'approved' && (
              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() => setShowDeliverDialog(true)}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 text-xs font-semibold shadow-xs transition"
                >
                  <HeartHandshake className="w-4 h-4" />
                  บันทึกการส่งมอบ & ลงลายเซ็น (Step ๓)
                </button>
              </div>
            )}

            {loan.status === 'delivered' && (
              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() => setShowReturnDialog(true)}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 text-xs font-semibold shadow-xs transition"
                >
                  <RotateCcw className="w-4 h-4" />
                  บันทึกการรับคืนอุปกรณ์ (Step ๔)
                </button>
                <button
                  type="button"
                  onClick={() => onOpenPrint(loan)}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 px-4 py-2 text-xs font-semibold shadow-xs transition"
                >
                  <Printer className="w-4 h-4 text-slate-600" />
                  พิมพ์ใบยืม-ส่งมอบ
                </button>
              </div>
            )}

            {loan.status === 'returned' && (
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span className="flex items-center gap-1.5 text-emerald-700 font-medium">
                  <CheckCircle2 className="w-4 h-4" />
                  การยืมสิ้นสุดสมบูรณ์และนำอุปกรณ์กลับเข้าคลังแล้ว
                </span>
                <button
                  type="button"
                  onClick={() => onOpenPrint(loan)}
                  className="inline-flex items-center gap-1 text-teal-700 font-medium underline"
                >
                  <Printer className="w-3.5 h-3.5" />
                  พิมพ์ประวัติสัญญายืม
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-end gap-2 border-t border-slate-200 bg-slate-50 px-6 py-3">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100 transition"
          >
            ปิดหน้าต่าง
          </button>
        </div>
      </div>

      {/* Approve Dialog */}
      {showApproveDialog && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl border border-slate-200">
            <h3 className="text-base font-bold text-slate-800 font-['Prompt'] mb-1">
              ยืนยันการอนุมัติคำขอยืม
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              ใบคำขอ {loan.requestNo} ({loan.equipmentName})
            </p>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-medium text-slate-700 block mb-1">
                  ชื่อเจ้าหน้าที่ผู้อนุมัติ:
                </label>
                <input
                  type="text"
                  value={approverName}
                  onChange={(e) => setApproverName(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs focus:border-teal-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="font-medium text-slate-700 block mb-1">
                  บันทึกเหตุผลความจำเป็น / หมายเหตุ:
                </label>
                <textarea
                  rows={3}
                  value={approvalNotes}
                  onChange={(e) => setApprovalNotes(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs focus:border-teal-500 focus:outline-hidden"
                />
              </div>
            </div>

            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowApproveDialog(false)}
                className="px-4 py-2 text-xs font-medium text-slate-700 border border-slate-300 rounded-lg hover:bg-slate-100"
              >
                ยกเลิก
              </button>
              <button
                type="button"
                disabled={isLoading}
                onClick={handleApprove}
                className="px-4 py-2 text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-lg shadow-xs disabled:opacity-50"
              >
                {isLoading ? 'กำลังบันทึก...' : 'ยืนยันอนุมัติ'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reject Dialog */}
      {showRejectDialog && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl border border-slate-200">
            <h3 className="text-base font-bold text-rose-700 font-['Prompt'] mb-1">
              ไม่อนุมัติคำขอยืมอุปกรณ์
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              ใบคำขอ {loan.requestNo}
            </p>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-medium text-slate-700 block mb-1">
                  กรุณาระบุเหตุผลที่ไม่อนุมัติ:
                </label>
                <textarea
                  rows={3}
                  placeholder="เช่น ผู้ป่วยมีอุปกรณ์ประเภทเดียวกันแล้ว หรือไม่ตรงตามข้อบ่งชี้ทางการแพทย์..."
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs focus:border-rose-500 focus:outline-hidden"
                />
              </div>
            </div>

            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowRejectDialog(false)}
                className="px-4 py-2 text-xs font-medium text-slate-700 border border-slate-300 rounded-lg hover:bg-slate-100"
              >
                ยกเลิก
              </button>
              <button
                type="button"
                disabled={isLoading}
                onClick={handleReject}
                className="px-4 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-lg shadow-xs disabled:opacity-50"
              >
                {isLoading ? 'กำลังบันทึก...' : 'ยืนยันปฏิเสธ'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Deliver Dialog */}
      {showDeliverDialog && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl border border-slate-200">
            <h3 className="text-base font-bold text-slate-800 font-['Prompt'] mb-1">
              บันทึกการส่งมอบอุปกรณ์การแพทย์
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              ส่งมอบ {loan.equipmentName} ({loan.equipmentCode}) ให้ผู้ป่วยในชุมชน
            </p>

            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-medium text-slate-700 block mb-1">
                    เจ้าหน้าที่ผู้ส่งมอบ:
                  </label>
                  <input
                    type="text"
                    value={delivererName}
                    onChange={(e) => setDelivererName(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs focus:border-teal-500 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="font-medium text-slate-700 block mb-1">
                    ชื่อผู้รับมอบ/ญาติ:
                  </label>
                  <input
                    type="text"
                    value={recipientName}
                    onChange={(e) => setRecipientName(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs focus:border-teal-500 focus:outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="font-medium text-slate-700 block mb-1">
                  สภาพอุปกรณ์ ณ วันส่งมอบ:
                </label>
                <input
                  type="text"
                  value={deliveryConditionNotes}
                  onChange={(e) => setDeliveryConditionNotes(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs focus:border-teal-500 focus:outline-hidden"
                />
              </div>

              {/* Digital signature trigger */}
              <div className="pt-2 border-t border-slate-200">
                <div className="flex items-center justify-between mb-2">
                  <label className="font-medium text-slate-700">
                    ลายมือชื่อผู้รับมอบ (ลายเซ็นดิจิทัล):
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowSignaturePad(true)}
                    className="inline-flex items-center gap-1 text-xs text-teal-700 font-medium hover:underline bg-teal-50 px-2 py-1 rounded"
                  >
                    <PenTool className="w-3.5 h-3.5" />
                    {signatureDataUrl ? 'เซ็นชื่อใหม่' : 'กดเพื่อเซ็นชื่อบนหน้าจอ'}
                  </button>
                </div>

                {signatureDataUrl ? (
                  <div className="bg-slate-50 p-2 rounded-lg border border-slate-200 text-center">
                    <img
                      src={signatureDataUrl}
                      alt="ลายเซ็น"
                      className="max-h-20 mx-auto object-contain"
                    />
                    <span className="text-[10px] text-emerald-700 font-medium">✓ บันทึกลายเซ็นเรียบร้อย</span>
                  </div>
                ) : (
                  <div
                    onClick={() => setShowSignaturePad(true)}
                    className="cursor-pointer border-2 border-dashed border-slate-300 rounded-lg p-4 text-center hover:border-teal-400 bg-slate-50"
                  >
                    <PenTool className="w-5 h-5 text-slate-400 mx-auto mb-1" />
                    <span className="text-slate-500">แตะที่นี่เพื่อให้ผู้รับมอบลงลายมือชื่อ</span>
                  </div>
                )}
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowDeliverDialog(false)}
                className="px-4 py-2 text-xs font-medium text-slate-700 border border-slate-300 rounded-lg hover:bg-slate-100"
              >
                ยกเลิก
              </button>
              <button
                type="button"
                disabled={isLoading}
                onClick={handleDeliver}
                className="px-4 py-2 text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-lg shadow-xs disabled:opacity-50"
              >
                {isLoading ? 'กำลังบันทึก...' : 'ยืนยันการส่งมอบ'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Signature Pad Overlay */}
      {showSignaturePad && (
        <SignaturePad
          recipientName={recipientName}
          onSave={(dataUrl) => {
            setSignatureDataUrl(dataUrl);
            setShowSignaturePad(false);
          }}
          onCancel={() => setShowSignaturePad(false)}
        />
      )}

      {/* Return Dialog */}
      {showReturnDialog && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl border border-slate-200">
            <h3 className="text-base font-bold text-slate-800 font-['Prompt'] mb-1">
              บันทึกการรับคืนอุปกรณ์การแพทย์
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              รับคืน {loan.equipmentName} ({loan.equipmentCode}) กลับเข้าคลัง
            </p>

            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-medium text-slate-700 block mb-1">
                    ชื่อผู้ส่งคืน:
                  </label>
                  <input
                    type="text"
                    value={returnerName}
                    onChange={(e) => setReturnerName(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs focus:border-emerald-500 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="font-medium text-slate-700 block mb-1">
                    เจ้าหน้าที่ผู้ตรวจรับคืน:
                  </label>
                  <input
                    type="text"
                    value={returnReceiverName}
                    onChange={(e) => setReturnReceiverName(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs focus:border-emerald-500 focus:outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="font-medium text-slate-700 block mb-1">
                  สภาพอุปกรณ์หลังตรวจรับคืน:
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(['สมบูรณ์ดี', 'ต้องทำความสะอาด/ฆ่าเชื้อ', 'ชำรุดเสียหาย'] as const).map(
                    (cond) => (
                      <button
                        key={cond}
                        type="button"
                        onClick={() => setReturnCondition(cond)}
                        className={`p-2 rounded-lg border text-center transition text-xs font-medium ${
                          returnCondition === cond
                            ? 'bg-emerald-50 border-emerald-500 text-emerald-800 font-bold'
                            : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        {cond}
                      </button>
                    )
                  )}
                </div>
              </div>

              <div>
                <label className="font-medium text-slate-700 block mb-1">
                  หมายเหตุการรับคืน / ผลการตรวจเช็ค:
                </label>
                <textarea
                  rows={2}
                  value={returnNotes}
                  onChange={(e) => setReturnNotes(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs focus:border-emerald-500 focus:outline-hidden"
                />
              </div>

              <div className="bg-amber-50 p-3 rounded-lg border border-amber-200 text-[11px] text-amber-800">
                💡 เมื่อบันทึกรับคืนแล้ว สถานะอุปกรณ์จะถูกปรับเป็น{' '}
                <strong>
                  {returnCondition === 'ชำรุดเสียหาย'
                    ? 'ชำรุด/ซ่อมบำรุง (Maintenance)'
                    : 'พร้อมให้ยืม (Available)'}
                </strong>{' '}
                ในระบบอัตโนมัติ
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowReturnDialog(false)}
                className="px-4 py-2 text-xs font-medium text-slate-700 border border-slate-300 rounded-lg hover:bg-slate-100"
              >
                ยกเลิก
              </button>
              <button
                type="button"
                disabled={isLoading}
                onClick={handleReturn}
                className="px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-xs disabled:opacity-50"
              >
                {isLoading ? 'กำลังบันทึก...' : 'ยืนยันรับคืนอุปกรณ์'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

function getStatusText(status: LoanRecord['status']): string {
  switch (status) {
    case 'pending_approval':
      return 'รอพิจารณาอนุมัติ';
    case 'approved':
      return 'อนุมัติแล้ว - รอส่งมอบ';
    case 'delivered':
      return 'ส่งมอบแล้ว - อยู่ระหว่างยืม';
    case 'returned':
      return 'รับคืนเข้าคลังเรียบร้อย';
    case 'rejected':
      return 'ไม่อนุมัติ';
    default:
      return status;
  }
}
