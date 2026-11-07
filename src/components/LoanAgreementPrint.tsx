import React from 'react';
import { LoanRecord } from '../types';
import { formatThaiDate, formatIdCard, formatPhone } from '../utils/pdpa';
import { Printer, X } from 'lucide-react';

interface LoanAgreementPrintProps {
  loan: LoanRecord;
  onClose: () => void;
}

export const LoanAgreementPrint: React.FC<LoanAgreementPrintProps> = ({
  loan,
  onClose,
}) => {
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 p-4 sm:p-6 backdrop-blur-xs flex justify-center items-start">
      <div className="w-full max-w-3xl rounded-2xl bg-white shadow-2xl overflow-hidden my-4">
        {/* Modal Toolbar (hidden when printing) */}
        <div className="no-print flex items-center justify-between border-b border-slate-200 px-6 py-4 bg-slate-50">
          <div className="flex items-center gap-2">
            <span className="inline-block w-2.5 h-2.5 rounded-full bg-teal-600" />
            <h3 className="font-semibold text-slate-800 text-base">
              ตัวอย่างเอกสารสัญญายืมและส่งมอบอุปกรณ์การแพทย์
            </h3>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-2 rounded-lg bg-teal-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-teal-700 transition"
            >
              <Printer className="w-4 h-4" />
              พิมพ์เอกสาร / PDF
            </button>
            <button
              onClick={onClose}
              className="rounded-lg p-2 text-slate-400 hover:bg-slate-200 hover:text-slate-600 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Paper Document */}
        <div className="p-8 sm:p-12 text-slate-900 leading-relaxed text-sm bg-white print:p-0">
          {/* Header */}
          <div className="text-center border-b pb-4 mb-6">
            <h1 className="text-xl font-bold text-slate-900 tracking-wide mb-1 font-['Prompt']">
              สัญญายืมและใบส่งมอบอุปกรณ์การแพทย์เพื่อการฟื้นฟูสมรรถภาพ
            </h1>
            <h2 className="text-sm font-medium text-slate-700">
              ศูนย์บริการยืม-คืนอุปกรณ์การแพทย์ อำเภอดอนพุด จังหวัดสระบุรี
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              (โรงพยาบาลดอนพุด ร่วมกับ สำนักงานสาธารณสุขอำเภอดอนพุด และ รพ.สต. ในพื้นที่)
            </p>
          </div>

          <div className="flex justify-between items-center text-xs text-slate-600 mb-6 bg-slate-50 p-3 rounded-lg border border-slate-200 print:bg-white print:border-slate-300">
            <div>
              <strong>เลขที่คำขอ:</strong> {loan.requestNo}
            </div>
            <div>
              <strong>วันที่ทำสัญญา:</strong> {formatThaiDate(loan.deliveryDate || loan.requestDate)}
            </div>
          </div>

          {/* Section 1: Borrower & Patient info */}
          <div className="space-y-4 mb-6">
            <h3 className="font-bold text-sm text-slate-800 border-l-4 border-teal-600 pl-2">
              ๑. ข้อมูลผู้ยืมและผู้ป่วย
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <span className="text-slate-500">ชื่อผู้ยืม (ผู้รับผิดชอบ):</span>{' '}
                <span className="font-semibold">{loan.caregiverName}</span>
              </div>
              <div>
                <span className="text-slate-500">ความสัมพันธ์กับผู้ป่วย:</span>{' '}
                <span>{loan.caregiverRelation}</span>
              </div>
              <div>
                <span className="text-slate-500">เลขประจำตัวประชาชนผู้ยืม:</span>{' '}
                <span className="font-mono">{formatIdCard(loan.caregiverIdCard)}</span>
              </div>
              <div>
                <span className="text-slate-500">เบอร์โทรศัพท์ติดต่อ:</span>{' '}
                <span>{formatPhone(loan.caregiverPhone)}</span>
              </div>
              <div className="sm:col-span-2 pt-2 border-t border-slate-100">
                <span className="text-slate-500">ขอยืมเพื่อผู้ป่วยชื่อ:</span>{' '}
                <span className="font-semibold text-slate-900">{loan.patientName}</span>
                {' '}(อายุ {loan.patientAge} ปี เพศ {loan.patientGender})
              </div>
              <div>
                <span className="text-slate-500">เลขประจำตัวประชาชนผู้ป่วย:</span>{' '}
                <span className="font-mono">{formatIdCard(loan.patientIdCard)}</span>
              </div>
              <div>
                <span className="text-slate-500">การวินิจฉัย/กลุ่มอาการ:</span>{' '}
                <span>{loan.patientDiagnosis || '-'}</span>
              </div>
              <div className="sm:col-span-2">
                <span className="text-slate-500">ที่อยู่ผู้ป่วย:</span>{' '}
                <span>
                  {loan.patientAddress} ต.{loan.subdistrict} อ.ดอนพุด จ.สระบุรี
                  {loan.landmark ? ` (จุดสังเกต: ${loan.landmark})` : ''}
                </span>
              </div>
            </div>
          </div>

          {/* Section 2: Equipment Info */}
          <div className="space-y-3 mb-6">
            <h3 className="font-bold text-sm text-slate-800 border-l-4 border-teal-600 pl-2">
              ๒. รายละเอียดอุปกรณ์การแพทย์ที่ยืม
            </h3>
            <table className="w-full text-xs border border-slate-300">
              <thead className="bg-slate-100 print:bg-slate-200">
                <tr>
                  <th className="border border-slate-300 p-2 text-left">รหัสอุปกรณ์</th>
                  <th className="border border-slate-300 p-2 text-left">รายการอุปกรณ์</th>
                  <th className="border border-slate-300 p-2 text-left">หมวดหมู่</th>
                  <th className="border border-slate-300 p-2 text-left">กำหนดส่งคืน</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border border-slate-300 p-2 font-mono font-medium">{loan.equipmentCode}</td>
                  <td className="border border-slate-300 p-2 font-semibold">{loan.equipmentName}</td>
                  <td className="border border-slate-300 p-2">{loan.category}</td>
                  <td className="border border-slate-300 p-2 text-teal-800 font-medium">
                    {formatThaiDate(loan.expectedReturnDate)}
                  </td>
                </tr>
              </tbody>
            </table>
            {loan.deliveryConditionNotes && (
              <p className="text-xs text-slate-600 italic">
                * สภาพอุปกรณ์ ณ วันส่งมอบ: {loan.deliveryConditionNotes}
              </p>
            )}
          </div>

          {/* Section 3: Terms & Agreement */}
          <div className="mb-6 bg-slate-50 p-4 rounded-lg border border-slate-200 text-xs text-slate-700 space-y-2 print:bg-white print:border-slate-300">
            <h3 className="font-bold text-slate-800">๓. ข้อตกลงและเงื่อนไขการยืมอุปกรณ์</h3>
            <ol className="list-decimal pl-4 space-y-1">
              <li>ผู้ยืมจะดูแลรักษาอุปกรณ์การแพทย์ให้อยู่ในสภาพดี สะอาด และใช้งานอย่างถูกวิธีตามคำแนะนำของเจ้าหน้าที่สาธารณสุข</li>
              <li>ห้ามนำอุปกรณ์ไปจำหน่าย จ่าย โอน หรือให้ผู้อื่นที่มิใช่ผู้ป่วยรายนี้ใช้งานโดยเด็ดขาด</li>
              <li>หากผู้ป่วยพ้นความจำเป็นในการใช้งาน (เช่น ฟื้นตัว หรือเสียชีวิต) หรือครบกำหนดเวลา ให้แจ้งเจ้าหน้าที่เพื่อรับคืนทันทีภายใน ๗ วัน</li>
              <li>ข้อมูลส่วนบุคคลทั้งหมดจัดเก็บและคุ้มครองตาม พ.ร.บ. คุ้มครองข้อมูลส่วนบุคคล พ.ศ. ๒๕๖๒ เพื่อประโยชน์ในการบริการสาธารณสุข</li>
            </ol>
          </div>

          {/* Section 4: Signatures */}
          <div className="pt-6 border-t border-slate-300 grid grid-cols-2 gap-8 text-center text-xs">
            <div className="space-y-2">
              <div className="h-20 flex items-center justify-center">
                {loan.signatureDataUrl ? (
                  <img
                    src={loan.signatureDataUrl}
                    alt="ลายมือชื่อผู้ยืม"
                    className="max-h-16 max-w-[180px] object-contain border-b border-slate-400"
                  />
                ) : (
                  <div className="w-48 border-b border-dashed border-slate-400" />
                )}
              </div>
              <p className="font-medium">ลงชื่อ ..................................................... ผู้ยืม/ผู้รับมอบ</p>
              <p className="text-slate-500">({loan.caregiverName})</p>
            </div>

            <div className="space-y-2">
              <div className="h-20 flex items-center justify-center">
                <div className="w-48 border-b border-dashed border-slate-400" />
              </div>
              <p className="font-medium">ลงชื่อ ..................................................... เจ้าหน้าที่ผู้ส่งมอบ</p>
              <p className="text-slate-500">
                ({loan.deliveredBy || loan.approvedBy || 'เจ้าหน้าที่สาธารณสุข อ.ดอนพุด'})
              </p>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-8 text-center text-[10px] text-slate-400 border-t border-slate-200 pt-2">
            ระบบยืมคืนอุปกรณ์ อ.ดอนพุด • บันทึกผ่านระบบคลาวด์ Firebase (Project: upakorn-b68e3)
          </div>
        </div>
      </div>
    </div>
  );
};
