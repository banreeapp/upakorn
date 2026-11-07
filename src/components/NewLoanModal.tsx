import React, { useState } from 'react';
import { MedicalEquipment, Subdistrict, AppUser } from '../types';
import { createLoanRequest } from '../services/dbService';
import {
  X,
  PlusCircle,
  AlertCircle,
  Bed,
  User,
  HeartHandshake,
  MapPin,
  Calendar,
  ShieldCheck,
  Check,
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface NewLoanModalProps {
  equipment: MedicalEquipment[];
  preselectedEquipmentId?: string;
  onClose: () => void;
  currentUser: AppUser;
}

export const NewLoanModal: React.FC<NewLoanModalProps> = ({
  equipment,
  preselectedEquipmentId,
  onClose,
  currentUser,
}) => {
  // Available equipment list
  const availableEquipment = equipment.filter(
    (e) => e.status === 'available' || e.id === preselectedEquipmentId
  );

  // Form State
  const [selectedEquipId, setSelectedEquipId] = useState(
    preselectedEquipmentId || (availableEquipment[0]?.id ?? '')
  );

  // Patient Info
  const [patientName, setPatientName] = useState('');
  const [patientIdCard, setPatientIdCard] = useState('');
  const [patientAge, setPatientAge] = useState<number | ''>(68);
  const [patientGender, setPatientGender] = useState<'ชาย' | 'หญิง'>('ชาย');
  const [patientDiagnosis, setPatientDiagnosis] = useState('ผู้ป่วยติดเตียง หลอดเลือดสมอง (Stroke) แขนขาอ่อนแรง');
  const [patientAddress, setPatientAddress] = useState('12 หมู่ 2');
  const [subdistrict, setSubdistrict] = useState<Subdistrict>('ดอนพุด');
  const [landmark, setLandmark] = useState('ใกล้ รพ.สต.ดอนพุด เข้าซอยตรงข้ามวัด');

  // Caregiver / Borrower Info
  const [caregiverName, setCaregiverName] = useState('');
  const [caregiverRelation, setCaregiverRelation] = useState('บุตร');
  const [caregiverPhone, setCaregiverPhone] = useState('');
  const [caregiverIdCard, setCaregiverIdCard] = useState('');

  // Dates
  const today = new Date().toISOString().split('T')[0];
  const defaultReturn = new Date();
  defaultReturn.setMonth(defaultReturn.getMonth() + 3);
  const defaultReturnStr = defaultReturn.toISOString().split('T')[0];

  const [requestDate, setRequestDate] = useState(today);
  const [expectedReturnDate, setExpectedReturnDate] = useState(defaultReturnStr);
  const [purposeNotes, setPurposeNotes] = useState('ใช้ในการฟื้นฟูสมรรถภาพผู้ป่วยที่บ้านและป้องกันภาวะแทรกซ้อน');
  const [pdpaAccepted, setPdpaAccepted] = useState(true);

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const selectedItem = equipment.find((e) => e.id === selectedEquipId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!selectedItem) {
      setErrorMessage('กรุณาเลือกอุปกรณ์การแพทย์ที่ต้องการยืม');
      return;
    }
    if (!patientName.trim()) {
      setErrorMessage('กรุณาระบุชื่อ-นามสกุลของผู้ป่วย');
      return;
    }
    const cleanId = patientIdCard.replace(/\D/g, '');
    if (cleanId.length !== 13) {
      setErrorMessage('เลขประจำตัวประชาชนผู้ป่วยต้องมี 13 หลัก');
      return;
    }
    if (!caregiverName.trim()) {
      setErrorMessage('กรุณาระบุชื่อ-นามสกุลของผู้ยืม (ญาติ/ผู้ดูแล)');
      return;
    }
    if (!caregiverPhone.trim()) {
      setErrorMessage('กรุณาระบุเบอร์โทรศัพท์ที่ติดต่อได้');
      return;
    }
    if (!pdpaAccepted) {
      setErrorMessage('กรุณากดยินยอมการคุ้มครองข้อมูลส่วนบุคคล (PDPA) ก่อนดำเนินการ');
      return;
    }

    setIsLoading(true);
    try {
      await createLoanRequest(
        {
          equipmentId: selectedItem.id,
          equipmentName: selectedItem.name,
          equipmentCode: selectedItem.code,
          category: selectedItem.category,
          patientName: patientName.trim(),
          patientIdCard: cleanId,
          patientAge: Number(patientAge) || 60,
          patientGender,
          patientDiagnosis: patientDiagnosis.trim(),
          patientAddress: patientAddress.trim(),
          subdistrict,
          landmark: landmark.trim(),
          caregiverName: caregiverName.trim(),
          caregiverRelation: caregiverRelation.trim(),
          caregiverPhone: caregiverPhone.trim(),
          caregiverIdCard: caregiverIdCard.replace(/\D/g, ''),
          requestDate,
          expectedReturnDate,
          purposeNotes: purposeNotes.trim(),
        },
        currentUser.name || 'เจ้าหน้าที่/ผู้ยืม อ.ดอนพุด'
      );

      try {
        confetti({ particleCount: 60, spread: 70, origin: { y: 0.6 } });
      } catch {}

      onClose();
    } catch (err) {
      setErrorMessage(
        'ไม่สามารถบันทึกคำขอได้: ' + (err instanceof Error ? err.message : String(err))
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 p-3 sm:p-6 backdrop-blur-xs flex justify-center items-start">
      <div className="w-full max-w-3xl rounded-2xl bg-white shadow-2xl overflow-hidden my-3 border border-slate-200">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4 bg-slate-50">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-teal-600 text-white flex items-center justify-center">
              <PlusCircle className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-800 font-['Prompt']">
                แบบฟอร์มยื่นขอยืมอุปกรณ์การแพทย์
              </h2>
              <p className="text-xs text-slate-500">
                เครือข่ายบริการสุขภาพ อำเภอดอนพุด จังหวัดสระบุรี
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-200 hover:text-slate-600 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[82vh] overflow-y-auto">
          {errorMessage && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Section 1: Equipment Selection */}
          <div className="rounded-xl border border-slate-200 p-4 bg-slate-50/50 space-y-3">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              <Bed className="w-4 h-4 text-teal-600" />
              ๑. เลือกอุปกรณ์การแพทย์ที่ต้องการยืม
            </h3>

            {availableEquipment.length === 0 ? (
              <div className="p-3 bg-amber-50 rounded-lg border border-amber-200 text-amber-800 text-xs">
                ขณะนี้ไม่มีอุปกรณ์ที่พร้อมให้ยืมในระบบ กรุณาติดต่อเจ้าหน้าที่ รพ.ดอนพุด
              </div>
            ) : (
              <div>
                <select
                  value={selectedEquipId}
                  onChange={(e) => setSelectedEquipId(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 p-2.5 text-xs focus:border-teal-500 focus:outline-hidden bg-white text-slate-800 font-medium"
                >
                  {availableEquipment.map((eq) => (
                    <option key={eq.id} value={eq.id}>
                      [{eq.code}] {eq.name} ({eq.category}) - ที่เก็บ: {eq.location}
                    </option>
                  ))}
                </select>
                {selectedItem && (
                  <div className="mt-2 text-[11px] text-slate-500 flex items-center justify-between bg-white p-2 rounded-lg border border-slate-200">
                    <span>
                      สภาพ: <strong>{selectedItem.condition}</strong>
                    </span>
                    <span className="text-teal-700 font-mono">
                      {selectedItem.serialNumber ? `S/N: ${selectedItem.serialNumber}` : ''}
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Section 2: Patient Info */}
          <div className="rounded-xl border border-slate-200 p-4 bg-white space-y-3 shadow-2xs">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              <User className="w-4 h-4 text-teal-600" />
              ๒. ข้อมูลผู้ป่วย (ผู้ใช้งานอุปกรณ์)
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 text-xs">
              <div className="sm:col-span-6">
                <label className="font-medium text-slate-700 block mb-1">
                  ชื่อ-นามสกุล ผู้ป่วย: <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="เช่น นายสมชาย ดอนพุด"
                  value={patientName}
                  onChange={(e) => setPatientName(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs focus:border-teal-500 focus:outline-hidden"
                />
              </div>

              <div className="sm:col-span-6">
                <label className="font-medium text-slate-700 block mb-1">
                  เลขบัตรประจำตัวประชาชน (13 หลัก): <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  maxLength={17}
                  placeholder="เช่น 1190100012345"
                  value={patientIdCard}
                  onChange={(e) => setPatientIdCard(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs font-mono focus:border-teal-500 focus:outline-hidden"
                />
              </div>

              <div className="sm:col-span-3">
                <label className="font-medium text-slate-700 block mb-1">อายุ (ปี):</label>
                <input
                  type="number"
                  value={patientAge}
                  onChange={(e) => setPatientAge(e.target.value ? Number(e.target.value) : '')}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs focus:border-teal-500 focus:outline-hidden"
                />
              </div>

              <div className="sm:col-span-3">
                <label className="font-medium text-slate-700 block mb-1">เพศ:</label>
                <select
                  value={patientGender}
                  onChange={(e) => setPatientGender(e.target.value as 'ชาย' | 'หญิง')}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs focus:border-teal-500 focus:outline-hidden bg-white"
                >
                  <option value="ชาย">ชาย</option>
                  <option value="หญิง">หญิง</option>
                </select>
              </div>

              <div className="sm:col-span-6">
                <label className="font-medium text-slate-700 block mb-1">
                  ตำบลที่อยู่อาศัยใน อ.ดอนพุด: <span className="text-rose-500">*</span>
                </label>
                <select
                  value={subdistrict}
                  onChange={(e) => setSubdistrict(e.target.value as Subdistrict)}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs focus:border-teal-500 focus:outline-hidden bg-white font-medium text-slate-800"
                >
                  <option value="ดอนพุด">ตำบลดอนพุด</option>
                  <option value="ดงน้อย">ตำบลดงน้อย</option>
                  <option value="บ้านหลวง">ตำบลบ้านหลวง</option>
                  <option value="ไผ่หลิ่ว">ตำบลไผ่หลิ่ว</option>
                </select>
              </div>

              <div className="sm:col-span-6">
                <label className="font-medium text-slate-700 block mb-1">
                  ที่อยู่ (บ้านเลขที่ / หมู่):
                </label>
                <input
                  type="text"
                  placeholder="เช่น 45/1 ม.3"
                  value={patientAddress}
                  onChange={(e) => setPatientAddress(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs focus:border-teal-500 focus:outline-hidden"
                />
              </div>

              <div className="sm:col-span-6">
                <label className="font-medium text-slate-700 block mb-1">
                  จุดสังเกต / สถานที่ใกล้เคียงบ้าน:
                </label>
                <input
                  type="text"
                  placeholder="เช่น ใกล้วัด, ตรงข้ามร้านชำ, ซอยอบต."
                  value={landmark}
                  onChange={(e) => setLandmark(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs focus:border-teal-500 focus:outline-hidden"
                />
              </div>

              <div className="sm:col-span-12">
                <label className="font-medium text-slate-700 block mb-1">
                  การวินิจฉัยโรค / สภาพผู้ป่วย / ความจำเป็นในการใช้อุปกรณ์:
                </label>
                <textarea
                  rows={2}
                  placeholder="เช่น ผู้ป่วยติดเตียงมีแผลกดทับระดับ 2, ฟื้นฟูหลังผ่าตัดกระดูกสะโพก..."
                  value={patientDiagnosis}
                  onChange={(e) => setPatientDiagnosis(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs focus:border-teal-500 focus:outline-hidden"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Caregiver / Borrower Info */}
          <div className="rounded-xl border border-slate-200 p-4 bg-white space-y-3 shadow-2xs">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              <HeartHandshake className="w-4 h-4 text-teal-600" />
              ๓. ข้อมูลผู้ยืม (ญาติ / ผู้ดูแลที่รับผิดชอบ)
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 text-xs">
              <div className="sm:col-span-6">
                <label className="font-medium text-slate-700 block mb-1">
                  ชื่อ-นามสกุล ผู้ยืม: <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="เช่น นางสาวปราณี ดอนพุด"
                  value={caregiverName}
                  onChange={(e) => setCaregiverName(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs focus:border-teal-500 focus:outline-hidden"
                />
              </div>

              <div className="sm:col-span-6">
                <label className="font-medium text-slate-700 block mb-1">
                  ความสัมพันธ์กับผู้ป่วย:
                </label>
                <input
                  type="text"
                  placeholder="เช่น บุตร, คู่สมรส, ญาติ, อสม."
                  value={caregiverRelation}
                  onChange={(e) => setCaregiverRelation(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs focus:border-teal-500 focus:outline-hidden"
                />
              </div>

              <div className="sm:col-span-6">
                <label className="font-medium text-slate-700 block mb-1">
                  เบอร์โทรศัพท์ที่ติดต่อได้: <span className="text-rose-500">*</span>
                </label>
                <input
                  type="tel"
                  required
                  placeholder="เช่น 081-234-5678"
                  value={caregiverPhone}
                  onChange={(e) => setCaregiverPhone(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs focus:border-teal-500 focus:outline-hidden"
                />
              </div>

              <div className="sm:col-span-6">
                <label className="font-medium text-slate-700 block mb-1">
                  เลขบัตรประจำตัวประชาชนผู้ยืม:
                </label>
                <input
                  type="text"
                  maxLength={17}
                  placeholder="13 หลัก"
                  value={caregiverIdCard}
                  onChange={(e) => setCaregiverIdCard(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs font-mono focus:border-teal-500 focus:outline-hidden"
                />
              </div>
            </div>
          </div>

          {/* Section 4: Dates & Purpose */}
          <div className="rounded-xl border border-slate-200 p-4 bg-white space-y-3 shadow-2xs">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-teal-600" />
              ๔. กำหนดระยะเวลายืม
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <label className="font-medium text-slate-700 block mb-1">
                  วันที่ต้องการรับอุปกรณ์:
                </label>
                <input
                  type="date"
                  value={requestDate}
                  onChange={(e) => setRequestDate(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs focus:border-teal-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="font-medium text-slate-700 block mb-1">
                  วันที่คาดว่าจะส่งคืน:
                </label>
                <input
                  type="date"
                  value={expectedReturnDate}
                  onChange={(e) => setExpectedReturnDate(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs focus:border-teal-500 focus:outline-hidden"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="font-medium text-slate-700 block mb-1">
                  วัตถุประสงค์ / หมายเหตุเพิ่มเติม:
                </label>
                <input
                  type="text"
                  value={purposeNotes}
                  onChange={(e) => setPurposeNotes(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs focus:border-teal-500 focus:outline-hidden"
                />
              </div>
            </div>
          </div>

          {/* PDPA Consent Notice */}
          <div className="rounded-xl border border-teal-200 bg-teal-50/70 p-4 text-xs">
            <label className="flex items-start gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={pdpaAccepted}
                onChange={(e) => setPdpaAccepted(e.target.checked)}
                className="mt-0.5 rounded text-teal-600 focus:ring-teal-500"
              />
              <span className="text-slate-700 leading-relaxed">
                <strong className="text-teal-900 flex items-center gap-1 inline">
                  <ShieldCheck className="w-3.5 h-3.5 inline text-teal-700" />
                  ยินยอมให้ประมวลผลข้อมูลตาม พ.ร.บ. คุ้มครองข้อมูลส่วนบุคคล (PDPA):
                </strong>{' '}
                ข้าพเจ้ายินยอมให้เครือข่ายบริการสุขภาพอำเภอดอนพุด (รพ.ดอนพุด, สสอ.ดอนพุด และ
                รพ.สต. ทั้ง ๔ ตำบล) จัดเก็บและใช้ข้อมูลส่วนบุคคลนี้
                เพื่อประโยชน์ในการดูแลรักษาพยาบาลและการบริหารจัดการยืม-คืนอุปกรณ์การแพทย์อย่างถูกต้อง
              </span>
            </label>
          </div>

          {/* Buttons */}
          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-slate-300 px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100 transition"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              disabled={isLoading || availableEquipment.length === 0}
              className="inline-flex items-center gap-1.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white px-5 py-2 text-xs font-semibold shadow-xs disabled:opacity-50 transition transform active:scale-95"
            >
              <Check className="w-4 h-4" />
              <span>{isLoading ? 'กำลังส่งข้อมูล...' : 'ส่งคำขอยืมอุปกรณ์'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
