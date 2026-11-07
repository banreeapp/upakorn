export type EquipmentStatus = 'available' | 'borrowed' | 'maintenance' | 'reserved';

export type EquipmentCategory =
  | 'เตียงผู้ป่วย'
  | 'อุปกรณ์ออกซิเจน'
  | 'ที่นอนลมป้องกันแผลกดทับ'
  | 'รถเข็นผู้ป่วย (Wheelchair)'
  | 'เครื่องดูดเสมหะ'
  | 'อุปกรณ์ช่วยเดิน/พยุงตัว'
  | 'สุขภัณฑ์และเก้าอี้นั่งถ่าย'
  | 'อุปกรณ์อื่นๆ';

export interface MedicalEquipment {
  id: string;
  code: string;
  name: string;
  category: EquipmentCategory;
  status: EquipmentStatus;
  serialNumber?: string;
  condition: string;
  location: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export type LoanStatus = 'pending_approval' | 'approved' | 'delivered' | 'returned' | 'rejected';

export type Subdistrict = 'ดอนพุด' | 'ดงน้อย' | 'บ้านหลวง' | 'ไผ่หลิ่ว';

export interface LoanRecord {
  id: string;
  requestNo: string;
  equipmentId: string;
  equipmentName: string;
  equipmentCode: string;
  category: string;
  status: LoanStatus;

  // Patient Info (PDPA Protected)
  patientName: string;
  patientIdCard: string;
  patientAge: number;
  patientGender: 'ชาย' | 'หญิง';
  patientDiagnosis: string;
  patientAddress: string;
  subdistrict: Subdistrict;
  landmark?: string;

  // Borrower / Caregiver Info
  caregiverName: string;
  caregiverRelation: string;
  caregiverPhone: string;
  caregiverIdCard: string;

  // Dates & Purpose
  requestDate: string;
  expectedReturnDate: string;
  purposeNotes?: string;

  // Step 2: Approval
  approvedBy?: string;
  approvalDate?: string;
  approvalNotes?: string;
  rejectionReason?: string;

  // Step 3: Delivery
  deliveredBy?: string;
  deliveryDate?: string;
  receivedBy?: string;
  deliveryConditionNotes?: string;
  signatureDataUrl?: string;

  // Step 4: Return
  returnDate?: string;
  returnedBy?: string;
  receivedReturnBy?: string;
  returnCondition?: 'สมบูรณ์ดี' | 'ต้องทำความสะอาด/ฆ่าเชื้อ' | 'ชำรุดเสียหาย';
  returnNotes?: string;

  createdAt: string;
  updatedAt: string;
}

export interface AuditLog {
  id: string;
  action: string;
  details: string;
  actorName: string;
  loanId?: string;
  timestamp: string;
}

export interface AppUser {
  role: 'admin' | 'staff' | 'public';
  name: string;
  department: string;
}
