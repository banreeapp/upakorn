import {
  collection,
  doc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  onSnapshot,
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { MedicalEquipment, LoanRecord, AuditLog } from '../types';

const EQUIPMENT_COL = 'equipment';
const LOANS_COL = 'loans';
const LOGS_COL = 'auditLogs';

// Initial sample equipment for Don Phut District
export const DEFAULT_EQUIPMENT: Omit<MedicalEquipment, 'id'>[] = [
  {
    code: 'DP-BED-001',
    name: 'เตียงผู้ป่วย 3 ไกร์ มือหมุน พร้อมเบาะลม',
    category: 'เตียงผู้ป่วย',
    status: 'available',
    serialNumber: 'SN-BED-2024-001',
    condition: 'สมบูรณ์พร้อมใช้ ผ่านการฆ่าเชื้อ',
    location: 'คลังอุปกรณ์ รพ.ดอนพุด',
    notes: 'แถมเสาน้ำเกลือ ราวกั้นเตียงอลูมิเนียม',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    code: 'DP-BED-002',
    name: 'เตียงผู้ป่วยไฟฟ้า 3 ฟังก์ชัน พร้อมรีโมท',
    category: 'เตียงผู้ป่วย',
    status: 'available',
    serialNumber: 'SN-BED-2024-002',
    condition: 'สภาพดี ตรวจเช็คระบบไฟฟ้าแล้ว',
    location: 'รพ.สต.ดอนพุด',
    notes: 'สำหรับผู้ป่วยติดเตียงที่ต้องปรับระดับศีรษะบ่อย',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    code: 'DP-BED-003',
    name: 'เตียงผู้ป่วย 2 ไกร์ มือหมุน',
    category: 'เตียงผู้ป่วย',
    status: 'available',
    serialNumber: 'SN-BED-2023-014',
    condition: 'สภาพดี พร้อมใช้งาน',
    location: 'รพ.สต.บ้านหลวง',
    notes: 'ปรับระดับหัวและท้ายเตียงได้',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    code: 'DP-O2-001',
    name: 'เครื่องผลิตออกซิเจน 5 ลิตร/นาที',
    category: 'อุปกรณ์ออกซิเจน',
    status: 'available',
    serialNumber: 'SN-O2-5L-8821',
    condition: 'ความเข้มข้นออกซิเจน 93% เปลี่ยนไส้กรองแล้ว',
    location: 'คลังอุปกรณ์ รพ.ดอนพุด',
    notes: 'มีกระบอกทำความชื้นและสาย Cannula ใหม่',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    code: 'DP-O2-002',
    name: 'ถังออกซิเจนขนาด 1.5 คิว พร้อมเกจ์และรถเข็น',
    category: 'อุปกรณ์ออกซิเจน',
    status: 'available',
    serialNumber: 'SN-CYL-15-09',
    condition: 'แก๊สเต็มถัง ตรวจสภาพวาล์วเรียบร้อย',
    location: 'รพ.สต.ดงน้อย',
    notes: 'สำหรับใช้สำรองกรณีฉุกเฉินหรือเดินทาง',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    code: 'DP-AIR-001',
    name: 'ที่นอนลมป้องกันแผลกดทับ แบบลอน (Alternating Ripple)',
    category: 'ที่นอนลมป้องกันแผลกดทับ',
    status: 'available',
    serialNumber: 'SN-AIR-RPL-302',
    condition: 'มอเตอร์ทำงานเงียบ มีลอนสำรอง',
    location: 'รพ.สต.ไผ่หลิ่ว',
    notes: 'เหมาะสำหรับผู้ป่วยติดเตียงเสี่ยงแผลกดทับ',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    code: 'DP-AIR-002',
    name: 'ที่นอนลมแบบรังผึ้ง (Bubble Mattress)',
    category: 'ที่นอนลมป้องกันแผลกดทับ',
    status: 'available',
    serialNumber: 'SN-AIR-BBL-118',
    condition: 'ทำความสะอาดฆ่าเชื้อเรียบร้อย',
    location: 'คลังอุปกรณ์ รพ.ดอนพุด',
    notes: 'สำหรับผู้ป่วยเริ่มมีอาการแผลกดทับระดับ 1',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    code: 'DP-WC-001',
    name: 'รถเข็นนั่งมาตรฐาน พับได้ (Wheelchair ชุบโครเมียม)',
    category: 'รถเข็นผู้ป่วย (Wheelchair)',
    status: 'available',
    serialNumber: 'SN-WC-ST-05',
    condition: 'เบรกแน่น ยางตันสภาพดี',
    location: 'รพ.สต.บ้านหลวง',
    notes: 'เบาะหนังเทียมทำความสะอาดง่าย',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    code: 'DP-WC-002',
    name: 'รถเข็นปรับนอนได้ พร้อมที่รองศีรษะ (Reclining Wheelchair)',
    category: 'รถเข็นผู้ป่วย (Wheelchair)',
    status: 'available',
    serialNumber: 'SN-WC-RC-02',
    condition: 'ปรับเอนได้ราบเรียบ สภาพยอดเยี่ยม',
    location: 'คลังอุปกรณ์ รพ.ดอนพุด',
    notes: 'เหมาะสำหรับผู้ป่วยอัมพาตครึ่งซีก/กล้ามเนื้ออ่อนแรง',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    code: 'DP-SUC-001',
    name: 'เครื่องดูดเสมหะแบบพกพา (Suction Machine)',
    category: 'เครื่องดูดเสมหะ',
    status: 'available',
    serialNumber: 'SN-SUC-7A-04',
    condition: 'แรงดูดได้มาตรฐาน เปลี่ยนตัวกรองแบคทีเรียแล้ว',
    location: 'รพ.สต.ดอนพุด',
    notes: 'พร้อมโถเก็บเสมหะและสายต่อ',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    code: 'DP-WALK-001',
    name: 'วอล์กเกอร์ช่วยเดิน 4 ขา อลูมิเนียมพับได้',
    category: 'อุปกรณ์ช่วยเดิน/พยุงตัว',
    status: 'available',
    serialNumber: 'SN-WLK-019',
    condition: 'จุกยางกันลื่นเปลี่ยนใหม่ แข็งแรง',
    location: 'รพ.สต.ไผ่หลิ่ว',
    notes: 'น้ำหนักเบา ปรับความสูงได้ 8 ระดับ',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    code: 'DP-COMM-001',
    name: 'เก้าอี้นั่งถ่าย มีล้อ ล็อคได้ พร้อมถังรอง',
    category: 'สุขภัณฑ์และเก้าอี้นั่งถ่าย',
    status: 'available',
    serialNumber: 'SN-COM-011',
    condition: 'โครงสแตนเลสกันสนิม สะอาดพร้อมใช้',
    location: 'รพ.สต.ดงน้อย',
    notes: 'สามารถเข็นครอบโถส้วมชักโครกได้',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

// Helper to seed initial equipment if empty
export async function seedInitialEquipmentIfEmpty(): Promise<void> {
  try {
    const snap = await getDocs(collection(db, EQUIPMENT_COL));
    if (snap.empty) {
      console.log('Seeding initial equipment for Don Phut District...');
      for (const item of DEFAULT_EQUIPMENT) {
        const docRef = doc(collection(db, EQUIPMENT_COL));
        await setDoc(docRef, { ...item, id: docRef.id });
      }
      // Add initial audit log
      const logRef = doc(collection(db, LOGS_COL));
      await setDoc(logRef, {
        id: logRef.id,
        action: 'ติดตั้งระบบและนำเข้าอุปกรณ์เริ่มต้น',
        details: 'เริ่มต้นระบบทะเบียนครุภัณฑ์การแพทย์ อ.ดอนพุด 12 รายการ',
        actorName: 'ระบบส่วนกลาง อ.ดอนพุด',
        timestamp: new Date().toISOString(),
      });
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, EQUIPMENT_COL);
  }
}

// Subscribe to real-time equipment list
export function subscribeToEquipment(callback: (items: MedicalEquipment[]) => void) {
  const q = query(collection(db, EQUIPMENT_COL), orderBy('code', 'asc'));
  return onSnapshot(
    q,
    (snapshot) => {
      const items: MedicalEquipment[] = snapshot.docs.map((docSnap) => ({
        id: docSnap.id,
        ...(docSnap.data() as Omit<MedicalEquipment, 'id'>),
      }));
      callback(items);
    },
    (error) => {
      handleFirestoreError(error, OperationType.GET, EQUIPMENT_COL);
    }
  );
}

// Subscribe to real-time loans list
export function subscribeToLoans(callback: (loans: LoanRecord[]) => void) {
  const q = query(collection(db, LOANS_COL), orderBy('createdAt', 'desc'));
  return onSnapshot(
    q,
    (snapshot) => {
      const items: LoanRecord[] = snapshot.docs.map((docSnap) => ({
        id: docSnap.id,
        ...(docSnap.data() as Omit<LoanRecord, 'id'>),
      }));
      callback(items);
    },
    (error) => {
      handleFirestoreError(error, OperationType.GET, LOANS_COL);
    }
  );
}

// Subscribe to audit logs
export function subscribeToAuditLogs(callback: (logs: AuditLog[]) => void) {
  const q = query(collection(db, LOGS_COL), orderBy('timestamp', 'desc'));
  return onSnapshot(
    q,
    (snapshot) => {
      const items: AuditLog[] = snapshot.docs.map((docSnap) => ({
        id: docSnap.id,
        ...(docSnap.data() as Omit<AuditLog, 'id'>),
      }));
      callback(items);
    },
    (error) => {
      handleFirestoreError(error, OperationType.GET, LOGS_COL);
    }
  );
}

// Add an audit log entry
export async function addAuditLog(
  action: string,
  details: string,
  actorName: string,
  loanId?: string
) {
  try {
    const logRef = doc(collection(db, LOGS_COL));
    const logData: AuditLog = {
      id: logRef.id,
      action,
      details,
      actorName,
      loanId: loanId || '',
      timestamp: new Date().toISOString(),
    };
    await setDoc(logRef, logData);
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, LOGS_COL);
  }
}

// Add equipment
export async function addEquipment(
  data: Omit<MedicalEquipment, 'id' | 'createdAt' | 'updatedAt'>,
  actorName: string
) {
  try {
    const docRef = doc(collection(db, EQUIPMENT_COL));
    const now = new Date().toISOString();
    const item: MedicalEquipment = {
      ...data,
      id: docRef.id,
      createdAt: now,
      updatedAt: now,
    };
    await setDoc(docRef, item);
    await addAuditLog('เพิ่มอุปกรณ์ใหม่', `รหัส ${item.code} (${item.name}) สถานที่: ${item.location}`, actorName);
    return item;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, EQUIPMENT_COL);
  }
}

// Update equipment
export async function updateEquipment(
  id: string,
  updates: Partial<MedicalEquipment>,
  actorName: string
) {
  try {
    const docRef = doc(db, EQUIPMENT_COL, id);
    const now = new Date().toISOString();
    await updateDoc(docRef, { ...updates, updatedAt: now });
    await addAuditLog('แก้ไขข้อมูลอุปกรณ์', `อุปกรณ์ ID: ${id} อัปเดตข้อมูล`, actorName);
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `${EQUIPMENT_COL}/${id}`);
  }
}

// Delete equipment
export async function deleteEquipment(id: string, code: string, actorName: string) {
  try {
    const docRef = doc(db, EQUIPMENT_COL, id);
    await deleteDoc(docRef);
    await addAuditLog('ลบอุปกรณ์ออกจากระบบ', `รหัสอุปกรณ์ ${code} ถูกลบ`, actorName);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `${EQUIPMENT_COL}/${id}`);
  }
}

// Generate human-friendly Request Number e.g. DP-202611-001
export function generateRequestNumber(): string {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const random = Math.floor(100 + Math.random() * 900);
  return `DP-${year}${month}-${random}`;
}

// Create new loan request
export async function createLoanRequest(
  data: Omit<LoanRecord, 'id' | 'requestNo' | 'status' | 'createdAt' | 'updatedAt'>,
  actorName: string
): Promise<LoanRecord | undefined> {
  try {
    const docRef = doc(collection(db, LOANS_COL));
    const now = new Date().toISOString();
    const requestNo = generateRequestNumber();

    const newLoan: LoanRecord = {
      ...data,
      id: docRef.id,
      requestNo,
      status: 'pending_approval',
      createdAt: now,
      updatedAt: now,
    };

    await setDoc(docRef, newLoan);

    // Update equipment status to reserved pending approval/handover
    const equipRef = doc(db, EQUIPMENT_COL, data.equipmentId);
    await updateDoc(equipRef, { status: 'reserved', updatedAt: now });

    await addAuditLog(
      'ยื่นคำขอยืมอุปกรณ์',
      `ใบคำขอเลขที่ ${requestNo} ยืม ${data.equipmentName} ให้ผู้ป่วย ${data.patientName} (ต.${data.subdistrict})`,
      actorName,
      docRef.id
    );

    return newLoan;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, LOANS_COL);
  }
}

// Step 2: Approve Loan
export async function approveLoan(
  loanId: string,
  equipmentId: string,
  approvedBy: string,
  approvalNotes: string
) {
  try {
    const now = new Date().toISOString();
    const loanRef = doc(db, LOANS_COL, loanId);
    await updateDoc(loanRef, {
      status: 'approved',
      approvedBy,
      approvalDate: now,
      approvalNotes,
      updatedAt: now,
    });

    const equipRef = doc(db, EQUIPMENT_COL, equipmentId);
    await updateDoc(equipRef, { status: 'reserved', updatedAt: now });

    await addAuditLog(
      'อนุมัติคำขอยืมอุปกรณ์',
      `อนุมัติโดย ${approvedBy} หมายเหตุ: ${approvalNotes || 'ผ่านเกณฑ์ความจำเป็น'}`,
      approvedBy,
      loanId
    );
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `${LOANS_COL}/${loanId}`);
  }
}

// Reject Loan
export async function rejectLoan(
  loanId: string,
  equipmentId: string,
  rejectedBy: string,
  rejectionReason: string
) {
  try {
    const now = new Date().toISOString();
    const loanRef = doc(db, LOANS_COL, loanId);
    await updateDoc(loanRef, {
      status: 'rejected',
      rejectionReason,
      updatedAt: now,
    });

    // Release equipment back to available
    const equipRef = doc(db, EQUIPMENT_COL, equipmentId);
    await updateDoc(equipRef, { status: 'available', updatedAt: now });

    await addAuditLog(
      'ปฏิเสธคำขอยืมอุปกรณ์',
      `ผู้ดำเนินการ ${rejectedBy} เหตุผล: ${rejectionReason}`,
      rejectedBy,
      loanId
    );
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `${LOANS_COL}/${loanId}`);
  }
}

// Step 3: Deliver Equipment (ส่งมอบอุปกรณ์)
export async function deliverEquipment(
  loanId: string,
  equipmentId: string,
  deliveredBy: string,
  receivedBy: string,
  deliveryConditionNotes: string,
  signatureDataUrl?: string
) {
  try {
    const now = new Date().toISOString();
    const loanRef = doc(db, LOANS_COL, loanId);
    await updateDoc(loanRef, {
      status: 'delivered',
      deliveredBy,
      deliveryDate: now,
      receivedBy,
      deliveryConditionNotes,
      signatureDataUrl: signatureDataUrl || '',
      updatedAt: now,
    });

    // Mark equipment as borrowed
    const equipRef = doc(db, EQUIPMENT_COL, equipmentId);
    await updateDoc(equipRef, { status: 'borrowed', updatedAt: now });

    await addAuditLog(
      'ส่งมอบอุปกรณ์เรียบร้อย',
      `ผู้ส่งมอบ: ${deliveredBy}, ผู้รับมอบ: ${receivedBy}`,
      deliveredBy,
      loanId
    );
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `${LOANS_COL}/${loanId}`);
  }
}

// Step 4: Return Equipment (รับคืนอุปกรณ์)
export async function returnEquipment(
  loanId: string,
  equipmentId: string,
  returnedBy: string,
  receivedReturnBy: string,
  returnCondition: 'สมบูรณ์ดี' | 'ต้องทำความสะอาด/ฆ่าเชื้อ' | 'ชำรุดเสียหาย',
  returnNotes: string
) {
  try {
    const now = new Date().toISOString();
    const loanRef = doc(db, LOANS_COL, loanId);
    await updateDoc(loanRef, {
      status: 'returned',
      returnedBy,
      returnDate: now,
      receivedReturnBy,
      returnCondition,
      returnNotes,
      updatedAt: now,
    });

    // Determine equipment status based on return condition
    const newEquipStatus =
      returnCondition === 'ชำรุดเสียหาย' ? 'maintenance' : 'available';

    const equipRef = doc(db, EQUIPMENT_COL, equipmentId);
    await updateDoc(equipRef, {
      status: newEquipStatus,
      condition: `รับคืนสภาพ: ${returnCondition} (${returnNotes || 'ผ่านการตรวจรับ'})`,
      updatedAt: now,
    });

    await addAuditLog(
      'รับคืนอุปกรณ์เรียบร้อย',
      `รับคืนโดย: ${receivedReturnBy}, ผู้ส่งคืน: ${returnedBy}, สภาพ: ${returnCondition}`,
      receivedReturnBy,
      loanId
    );
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `${LOANS_COL}/${loanId}`);
  }
}
