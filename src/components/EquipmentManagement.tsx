import React, { useState, useMemo } from 'react';
import {
  MedicalEquipment,
  EquipmentCategory,
  EquipmentStatus,
  AppUser,
} from '../types';
import {
  PlusCircle,
  Search,
  Filter,
  Bed,
  MapPin,
  Sparkles,
  CheckCircle2,
  Clock,
  Wrench,
  HeartHandshake,
  Edit2,
  Trash2,
  AlertCircle,
  Package,
} from 'lucide-react';
import {
  addEquipment,
  updateEquipment,
  deleteEquipment,
} from '../services/dbService';

interface EquipmentManagementProps {
  equipment: MedicalEquipment[];
  onBorrowItem: (equipId: string) => void;
  currentUser: AppUser;
}

export const EquipmentManagement: React.FC<EquipmentManagementProps> = ({
  equipment,
  onBorrowItem,
  currentUser,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedLocation, setSelectedLocation] = useState<string>('all');

  // Modal states
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingItem, setEditingItem] = useState<MedicalEquipment | null>(null);

  const categories: EquipmentCategory[] = [
    'เตียงผู้ป่วย',
    'อุปกรณ์ออกซิเจน',
    'ที่นอนลมป้องกันแผลกดทับ',
    'รถเข็นผู้ป่วย (Wheelchair)',
    'เครื่องดูดเสมหะ',
    'อุปกรณ์ช่วยเดิน/พยุงตัว',
    'สุขภัณฑ์และเก้าอี้นั่งถ่าย',
    'อุปกรณ์อื่นๆ',
  ];

  const locations = [
    'คลังอุปกรณ์ รพ.ดอนพุด',
    'รพ.สต.ดอนพุด',
    'รพ.สต.ดงน้อย',
    'รพ.สต.บ้านหลวง',
    'รพ.สต.ไผ่หลิ่ว',
  ];

  const filteredEquipment = useMemo(() => {
    return equipment.filter((item) => {
      if (selectedCategory !== 'all' && item.category !== selectedCategory) {
        return false;
      }
      if (selectedStatus !== 'all' && item.status !== selectedStatus) {
        return false;
      }
      if (selectedLocation !== 'all' && item.location !== selectedLocation) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        return (
          item.name.toLowerCase().includes(q) ||
          item.code.toLowerCase().includes(q) ||
          (item.serialNumber && item.serialNumber.toLowerCase().includes(q)) ||
          item.location.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [equipment, selectedCategory, selectedStatus, selectedLocation, searchQuery]);

  return (
    <div className="space-y-5">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h2 className="text-base sm:text-xl font-bold text-slate-800 font-['Prompt']">
            ทะเบียนคลังอุปกรณ์การแพทย์ อ.ดอนพุด
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            ครุภัณฑ์และอุปกรณ์เพื่อการฟื้นฟูสมรรถภาพผู้ป่วย รพ.ดอนพุด และ รพ.สต. ทุกแห่ง
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowAddModal(true)}
          className="inline-flex items-center gap-1.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 text-xs font-semibold shadow-xs transition transform active:scale-95 self-start sm:self-auto"
        >
          <PlusCircle className="w-4 h-4" />
          <span>เพิ่มอุปกรณ์ใหม่</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
          {/* Search */}
          <div className="sm:col-span-4 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="ค้นหารหัสครุภัณฑ์, ชื่ออุปกรณ์, S/N..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-xl border border-slate-300 pl-9 pr-4 py-2 text-xs focus:border-teal-500 focus:outline-hidden"
            />
          </div>

          {/* Category Filter */}
          <div className="sm:col-span-3">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs focus:border-teal-500 focus:outline-hidden bg-white text-slate-700"
            >
              <option value="all">ทุกหมวดหมู่อุปกรณ์</option>
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div className="sm:col-span-2">
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs focus:border-teal-500 focus:outline-hidden bg-white text-slate-700"
            >
              <option value="all">ทุกสถานะ</option>
              <option value="available">พร้อมให้ยืม (Available)</option>
              <option value="borrowed">กำลังถูกยืม (Borrowed)</option>
              <option value="reserved">จองแล้ว/รอส่งมอบ</option>
              <option value="maintenance">ซ่อมบำรุง (Maintenance)</option>
            </select>
          </div>

          {/* Location Filter */}
          <div className="sm:col-span-3">
            <select
              value={selectedLocation}
              onChange={(e) => setSelectedLocation(e.target.value)}
              className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs focus:border-teal-500 focus:outline-hidden bg-white text-slate-700"
            >
              <option value="all">ทุกสถานที่จัดเก็บใน อ.ดอนพุด</option>
              {locations.map((loc) => (
                <option key={loc} value={loc}>
                  {loc}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Equipment Grid */}
      {filteredEquipment.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-slate-200">
          <Package className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-sm font-semibold text-slate-700">ไม่พบอุปกรณ์ที่ตรงกับเงื่อนไข</h3>
          <p className="text-xs text-slate-400 mt-1">
            ลองปรับเปลี่ยนคำค้นหา หรือเพิ่มอุปกรณ์ใหม่เข้าสู่ระบบ
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredEquipment.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-2xl p-5 border border-slate-200 hover:border-teal-300 shadow-xs hover:shadow-md transition flex flex-col justify-between"
            >
              <div className="space-y-3">
                {/* Header row: Code & Status */}
                <div className="flex items-start justify-between gap-2">
                  <span className="font-mono text-xs font-bold text-teal-800 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                    {item.code}
                  </span>
                  <EquipmentStatusBadge status={item.status} />
                </div>

                {/* Name & Category */}
                <div>
                  <h3 className="font-bold text-slate-800 text-sm font-['Prompt'] line-clamp-2">
                    {item.name}
                  </h3>
                  <span className="text-[11px] text-teal-700 font-medium">
                    หมวด: {item.category}
                  </span>
                </div>

                {/* Condition & S/N */}
                <div className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-100 space-y-1">
                  <div>
                    <span className="text-slate-400">สภาพ: </span>
                    <span className="font-medium text-slate-700">{item.condition}</span>
                  </div>
                  {item.serialNumber && (
                    <div className="font-mono text-[11px] text-slate-500">
                      S/N: {item.serialNumber}
                    </div>
                  )}
                  <div className="flex items-center gap-1 text-[11px] text-slate-600 pt-0.5">
                    <MapPin className="w-3 h-3 text-teal-600 shrink-0" />
                    <span>{item.location}</span>
                  </div>
                </div>

                {item.notes && (
                  <p className="text-[11px] text-slate-500 italic">
                    หมายเหตุ: {item.notes}
                  </p>
                )}
              </div>

              {/* Actions */}
              <div className="pt-4 mt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => setEditingItem(item)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
                    title="แก้ไขข้อมูล"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (confirm(`ยืนยันการลบอุปกรณ์ ${item.code} (${item.name}) หรือไม่?`)) {
                        deleteEquipment(item.id, item.code, currentUser.name);
                      }
                    }}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition"
                    title="ลบอุปกรณ์"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                {item.status === 'available' ? (
                  <button
                    type="button"
                    onClick={() => onBorrowItem(item.id)}
                    className="inline-flex items-center gap-1 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold px-3 py-1.5 shadow-xs transition"
                  >
                    <HeartHandshake className="w-3.5 h-3.5" />
                    <span>ขอยืมชิ้นนี้</span>
                  </button>
                ) : (
                  <span className="text-[11px] font-medium text-slate-400">
                    {item.status === 'borrowed'
                      ? 'อยู่ระหว่างถูกยืม'
                      : item.status === 'maintenance'
                      ? 'กำลังซ่อมบำรุง'
                      : 'ถูกจองแล้ว'}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Equipment Modal */}
      {showAddModal && (
        <EquipmentFormModal
          title="ลงทะเบียนอุปกรณ์การแพทย์ใหม่"
          onClose={() => setShowAddModal(false)}
          onSubmit={async (data) => {
            await addEquipment(data, currentUser.name);
            setShowAddModal(false);
          }}
          categories={categories}
          locations={locations}
        />
      )}

      {/* Edit Equipment Modal */}
      {editingItem && (
        <EquipmentFormModal
          title={`แก้ไขข้อมูลอุปกรณ์: ${editingItem.code}`}
          initialData={editingItem}
          onClose={() => setEditingItem(null)}
          onSubmit={async (data) => {
            await updateEquipment(editingItem.id, data, currentUser.name);
            setEditingItem(null);
          }}
          categories={categories}
          locations={locations}
        />
      )}
    </div>
  );
};

export const EquipmentStatusBadge: React.FC<{ status: EquipmentStatus }> = ({ status }) => {
  switch (status) {
    case 'available':
      return (
        <span className="inline-flex items-center gap-1 bg-emerald-100 text-emerald-800 text-[11px] font-semibold px-2 py-0.5 rounded-full border border-emerald-200">
          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
          พร้อมให้ยืม
        </span>
      );
    case 'borrowed':
      return (
        <span className="inline-flex items-center gap-1 bg-teal-100 text-teal-800 text-[11px] font-semibold px-2 py-0.5 rounded-full border border-teal-200">
          <HeartHandshake className="w-3 h-3 text-teal-600" />
          กำลังถูกยืม
        </span>
      );
    case 'reserved':
      return (
        <span className="inline-flex items-center gap-1 bg-sky-100 text-sky-800 text-[11px] font-semibold px-2 py-0.5 rounded-full border border-sky-200">
          <Clock className="w-3 h-3 text-sky-600" />
          รอส่งมอบ
        </span>
      );
    case 'maintenance':
      return (
        <span className="inline-flex items-center gap-1 bg-amber-100 text-amber-800 text-[11px] font-semibold px-2 py-0.5 rounded-full border border-amber-200">
          <Wrench className="w-3 h-3 text-amber-600" />
          ซ่อมบำรุง
        </span>
      );
    default:
      return null;
  }
};

interface EquipmentFormModalProps {
  title: string;
  initialData?: MedicalEquipment;
  onClose: () => void;
  onSubmit: (data: Omit<MedicalEquipment, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  categories: EquipmentCategory[];
  locations: string[];
}

const EquipmentFormModal: React.FC<EquipmentFormModalProps> = ({
  title,
  initialData,
  onClose,
  onSubmit,
  categories,
  locations,
}) => {
  const [code, setCode] = useState(initialData?.code || 'DP-BED-004');
  const [name, setName] = useState(initialData?.name || '');
  const [category, setCategory] = useState<EquipmentCategory>(
    initialData?.category || 'เตียงผู้ป่วย'
  );
  const [status, setStatus] = useState<EquipmentStatus>(
    initialData?.status || 'available'
  );
  const [serialNumber, setSerialNumber] = useState(initialData?.serialNumber || '');
  const [condition, setCondition] = useState(initialData?.condition || 'สมบูรณ์พร้อมใช้ ผ่านการฆ่าเชื้อ');
  const [location, setLocation] = useState(initialData?.location || 'คลังอุปกรณ์ รพ.ดอนพุด');
  const [notes, setNotes] = useState(initialData?.notes || '');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim() || !name.trim()) {
      alert('กรุณากรอกรหัสและชื่ออุปกรณ์');
      return;
    }
    setIsLoading(true);
    try {
      await onSubmit({
        code: code.trim(),
        name: name.trim(),
        category,
        status,
        serialNumber: serialNumber.trim(),
        condition: condition.trim(),
        location: location.trim(),
        notes: notes.trim(),
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
      <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl border border-slate-200">
        <div className="flex items-center justify-between border-b border-slate-200 pb-3 mb-4">
          <h3 className="text-base font-bold text-slate-800 font-['Prompt']">{title}</h3>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-medium text-slate-700 block mb-1">
                รหัสครุภัณฑ์ (Asset Code): <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="เช่น DP-BED-004"
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs font-mono uppercase focus:border-teal-500 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="font-medium text-slate-700 block mb-1">สถานะปัจจุบัน:</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as EquipmentStatus)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs focus:border-teal-500 focus:outline-hidden bg-white"
              >
                <option value="available">พร้อมให้ยืม (Available)</option>
                <option value="borrowed">กำลังถูกยืม (Borrowed)</option>
                <option value="reserved">จองแล้ว/รอส่งมอบ</option>
                <option value="maintenance">ซ่อมบำรุง/ตรวจสอบ</option>
              </select>
            </div>
          </div>

          <div>
            <label className="font-medium text-slate-700 block mb-1">
              ชื่ออุปกรณ์ / รุ่น: <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="เช่น เตียงผู้ป่วยไฟฟ้า 3 ฟังก์ชัน พร้อมรีโมท"
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs focus:border-teal-500 focus:outline-hidden"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-medium text-slate-700 block mb-1">หมวดหมู่อุปกรณ์:</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as EquipmentCategory)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs focus:border-teal-500 focus:outline-hidden bg-white"
              >
                {categories.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="font-medium text-slate-700 block mb-1">
                หมายเลขซีเรียล (S/N):
              </label>
              <input
                type="text"
                value={serialNumber}
                onChange={(e) => setSerialNumber(e.target.value)}
                placeholder="เช่น SN-2024-889"
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs font-mono focus:border-teal-500 focus:outline-hidden"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-medium text-slate-700 block mb-1">สถานที่จัดเก็บ:</label>
              <select
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs focus:border-teal-500 focus:outline-hidden bg-white"
              >
                {locations.map((loc) => (
                  <option key={loc} value={loc}>
                    {loc}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="font-medium text-slate-700 block mb-1">สภาพอุปกรณ์:</label>
              <input
                type="text"
                value={condition}
                onChange={(e) => setCondition(e.target.value)}
                placeholder="เช่น ผ่านการฆ่าเชื้อ, สภาพดีมาก"
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs focus:border-teal-500 focus:outline-hidden"
              />
            </div>
          </div>

          <div>
            <label className="font-medium text-slate-700 block mb-1">
              หมายเหตุ / รายละเอียดอุปกรณ์เพิ่มเติม:
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="อุปกรณ์เสริม, ข้อควรระวัง..."
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs focus:border-teal-500 focus:outline-hidden"
            />
          </div>

          <div className="mt-5 flex justify-end gap-2 pt-2 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-700 border border-slate-300 rounded-lg hover:bg-slate-100"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-4 py-2 text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-lg shadow-xs disabled:opacity-50"
            >
              {isLoading ? 'กำลังบันทึก...' : 'บันทึกข้อมูล'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
