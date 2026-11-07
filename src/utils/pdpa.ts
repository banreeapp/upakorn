/**
 * PDPA Privacy & Thai Formatting Helpers for Don Phut District Medical Equipment System
 */

export function maskIdCard(id: string | undefined): string {
  if (!id) return '-';
  const clean = id.replace(/\D/g, '');
  if (clean.length !== 13) {
    if (clean.length > 6) {
      return clean.slice(0, 3) + 'xxxx' + clean.slice(-2);
    }
    return clean;
  }
  // Formatted: 1-1901-000xx-xx-x
  return `${clean[0]}-${clean.slice(1, 3)}xx-xxxx${clean.slice(7, 9)}-${clean.slice(9, 11)}-${clean[12]}`;
}

export function formatIdCard(id: string | undefined): string {
  if (!id) return '-';
  const clean = id.replace(/\D/g, '');
  if (clean.length === 13) {
    return `${clean[0]}-${clean.slice(1, 5)}-${clean.slice(5, 10)}-${clean.slice(10, 12)}-${clean[12]}`;
  }
  return id;
}

export function maskPhone(phone: string | undefined): string {
  if (!phone) return '-';
  const clean = phone.replace(/\D/g, '');
  if (clean.length === 10) {
    return `${clean.slice(0, 3)}-xxx-${clean.slice(6)}`;
  }
  if (clean.length === 9) {
    return `${clean.slice(0, 2)}-xxx-${clean.slice(5)}`;
  }
  return phone;
}

export function formatPhone(phone: string | undefined): string {
  if (!phone) return '-';
  const clean = phone.replace(/\D/g, '');
  if (clean.length === 10) {
    return `${clean.slice(0, 3)}-${clean.slice(3, 6)}-${clean.slice(6)}`;
  }
  if (clean.length === 9) {
    return `${clean.slice(0, 2)}-${clean.slice(2, 5)}-${clean.slice(5)}`;
  }
  return phone;
}

export function formatThaiDate(dateStr: string | undefined): string {
  if (!dateStr) return '-';
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    const day = d.getDate();
    const months = [
      'ม.ค.',
      'ก.พ.',
      'มี.ค.',
      'เม.ย.',
      'พ.ค.',
      'มิ.ย.',
      'ก.ค.',
      'ส.ค.',
      'ก.ย.',
      'ต.ค.',
      'พ.ย.',
      'ธ.ค.',
    ];
    const month = months[d.getMonth()];
    const thaiYear = d.getFullYear() + 543;
    return `${day} ${month} ${thaiYear}`;
  } catch {
    return dateStr;
  }
}

export function formatThaiDateTime(dateStr: string | undefined): string {
  if (!dateStr) return '-';
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    const dateFormatted = formatThaiDate(dateStr);
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    return `${dateFormatted} เวลา ${hours}:${minutes} น.`;
  } catch {
    return dateStr;
  }
}

export function getDaysRemaining(targetDateStr: string | undefined): {
  days: number;
  isOverdue: boolean;
  label: string;
} {
  if (!targetDateStr) return { days: 0, isOverdue: false, label: '-' };
  try {
    const target = new Date(targetDateStr);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    target.setHours(0, 0, 0, 0);

    const diffMs = target.getTime() - today.getTime();
    const days = Math.round(diffMs / (1000 * 60 * 60 * 24));

    if (days < 0) {
      return {
        days: Math.abs(days),
        isOverdue: true,
        label: `เกินกำหนด ${Math.abs(days)} วัน`,
      };
    } else if (days === 0) {
      return { days: 0, isOverdue: false, label: 'ครบกำหนดวันนี้' };
    } else {
      return { days, isOverdue: false, label: `เหลืออีก ${days} วัน` };
    }
  } catch {
    return { days: 0, isOverdue: false, label: '-' };
  }
}
