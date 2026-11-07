import React, { useState } from 'react';
import { AuditLog } from '../types';
import { formatThaiDateTime } from '../utils/pdpa';
import {
  ShieldCheck,
  Search,
  Activity,
  History,
  User,
  Clock,
  FileText,
  Lock,
} from 'lucide-react';

interface AuditLogViewProps {
  logs: AuditLog[];
}

export const AuditLogView: React.FC<AuditLogViewProps> = ({ logs }) => {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredLogs = logs.filter((log) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase().trim();
    return (
      log.action.toLowerCase().includes(q) ||
      log.details.toLowerCase().includes(q) ||
      log.actorName.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-600" />
            <h2 className="text-base sm:text-xl font-bold text-slate-800 font-['Prompt']">
              บันทึกกิจกรรมและความปลอดภัย (PDPA Audit Trail)
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            บันทึกประวัติการเข้าถึง อนุมัติ ส่งมอบ และแก้ไขข้อมูลตามมาตรฐาน พ.ร.บ. คุ้มครองข้อมูลส่วนบุคคล พ.ศ. ๒๕๖๒
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs text-emerald-800 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200">
          <Lock className="w-3.5 h-3.5 text-emerald-600" />
          <span>จัดเก็บบน Firebase Cloud: upakorn-b68e3</span>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="ค้นหากิจกรรม, ผู้ดำเนินการ, หรือรายละเอียดประวัติ..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-xl border border-slate-300 pl-9 pr-4 py-2 text-xs focus:border-teal-500 focus:outline-hidden"
          />
        </div>
      </div>

      {/* Timeline List */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
            <History className="w-4 h-4 text-teal-600" />
            ประวัติการทำรายการล่าสุด ({filteredLogs.length} รายการ)
          </h3>
        </div>

        {filteredLogs.length === 0 ? (
          <div className="text-center py-12 text-slate-400 text-xs">
            ยังไม่มีบันทึกกิจกรรมที่ตรงกับคำค้นหา
          </div>
        ) : (
          <div className="relative border-l-2 border-teal-200 ml-4 space-y-6 my-2">
            {filteredLogs.map((log) => (
              <div key={log.id} className="relative pl-6 group">
                {/* Timeline dot */}
                <div className="absolute -left-2 top-1 w-3.5 h-3.5 rounded-full bg-white border-2 border-teal-600 shadow-xs group-hover:scale-125 transition" />

                <div className="bg-slate-50/80 hover:bg-slate-50 p-3.5 rounded-xl border border-slate-200 transition">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-xs">
                    <span className="font-semibold text-slate-800 text-sm font-['Prompt']">
                      {log.action}
                    </span>
                    <span className="text-[11px] text-slate-500 flex items-center gap-1">
                      <Clock className="w-3 h-3 text-slate-400" />
                      {formatThaiDateTime(log.timestamp)}
                    </span>
                  </div>

                  <p className="mt-1.5 text-xs text-slate-600 leading-relaxed">
                    {log.details}
                  </p>

                  <div className="mt-2.5 pt-2 border-t border-slate-200/60 flex items-center justify-between text-[11px] text-slate-500">
                    <span className="flex items-center gap-1">
                      <User className="w-3 h-3 text-teal-600" />
                      ผู้ดำเนินการ: <strong className="text-slate-700">{log.actorName}</strong>
                    </span>
                    {log.loanId && (
                      <span className="font-mono text-[10px] text-slate-400">
                        Ref: {log.loanId.slice(0, 8)}...
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
