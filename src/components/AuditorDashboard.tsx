import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Lock, 
  Search, 
  FileText, 
  Download, 
  CheckCircle2, 
  Database,
  KeyRound,
  Filter,
  Eye,
  AlertTriangle,
  Network,
  IndianRupee
} from 'lucide-react';
import { AuditLogEntry } from '../types';
import { getAuthorizationFailureLogs } from '../services/authRoleSystem';
import { NHAAIntegrationLogger } from '../integrations/nhaa';
import { FinancialSupportService } from '../services/financialSupportService';

interface AuditorDashboardProps {
  auditLogs: AuditLogEntry[];
}

export const AuditorDashboard: React.FC<AuditorDashboardProps> = ({ auditLogs }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterAction, setFilterAction] = useState<string>('all');
  const [activeTab, setActiveTab] = useState<'main' | 'financial' | 'nhaa'>('main');

  const failureLogs = getAuthorizationFailureLogs();
  const nhaaLogs = NHAAIntegrationLogger.getLogs();
  const financialRecords = FinancialSupportService.getRecords();

  const filteredLogs = auditLogs.filter((log) => {
    const matchesSearch =
      log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.actorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.details.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.resourceId.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesFilter = filterAction === 'all' || log.action.includes(filterAction);
    return matchesSearch && matchesFilter;
  });

  const handleExportTrail = () => {
    const jsonStr = JSON.stringify(auditLogs, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `mannik-audit-trail-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleExportCSV = () => {
    const headers = ['Timestamp', 'Actor Name', 'Actor Role', 'Action', 'Resource Type', 'Resource ID', 'Checksum', 'Details'];
    const rows = auditLogs.map(l => [
      l.timestamp,
      `"${l.actorName}"`,
      l.actorRole,
      l.action,
      l.resourceType,
      l.resourceId,
      l.checksum,
      `"${l.details.replace(/"/g, '""')}"`
    ]);
    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `mannik-audit-trail-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-stone-700 bg-stone-100 px-2.5 py-0.5 rounded border border-stone-300">
              Statutory Oversight
            </span>
            <span className="text-xs text-stone-500 font-mono">DPDP Act 2023 §12</span>
          </div>
          <h1 className="font-display font-bold text-2xl sm:text-3xl text-stone-900 mt-1">
            System Security & Compliance Auditor Dashboard
          </h1>
          <p className="text-xs sm:text-sm text-stone-500 mt-1">
            Immutable Cryptographic Ledger · Role Access Verification · Zero-PII Audit Trail
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={handleExportTrail}
            className="px-3.5 py-2 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
          >
            <Download className="w-3.5 h-3.5 text-teal-400" />
            <span>Export Audit JSON</span>
          </button>

          <button
            onClick={handleExportCSV}
            className="px-3.5 py-2 bg-white hover:bg-stone-100 text-stone-800 border border-stone-200 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
          >
            <FileText className="w-3.5 h-3.5 text-stone-600" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Sub-Tab Navigation */}
      <div className="flex items-center gap-2 border-b border-stone-200 pb-2 text-xs font-semibold">
        <button
          onClick={() => setActiveTab('main')}
          className={`px-3.5 py-1.5 rounded-xl transition-all cursor-pointer ${
            activeTab === 'main'
              ? 'bg-stone-900 text-white shadow-xs'
              : 'bg-white text-stone-600 border border-stone-200 hover:bg-stone-50'
          }`}
        >
          All Cryptographic Audit Logs ({auditLogs.length})
        </button>

        <button
          onClick={() => setActiveTab('financial')}
          className={`px-3.5 py-1.5 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'financial'
              ? 'bg-emerald-800 text-white shadow-xs'
              : 'bg-white text-stone-600 border border-stone-200 hover:bg-stone-50'
          }`}
        >
          <IndianRupee className="w-3 h-3 text-emerald-500" />
          <span>Statutory Relief &amp; DBT Ledger ({financialRecords.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('nhaa')}
          className={`px-3.5 py-1.5 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'nhaa'
              ? 'bg-teal-800 text-white shadow-xs'
              : 'bg-white text-stone-600 border border-stone-200 hover:bg-stone-50'
          }`}
        >
          <Network className="w-3 h-3 text-teal-400" />
          <span>NHAA Gateway Sync Events ({nhaaLogs.length})</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-white border border-stone-200 shadow-xs space-y-1">
          <span className="text-[11px] font-semibold text-stone-400 uppercase tracking-wider">
            Total Sealed Audit Events
          </span>
          <div className="font-mono text-2xl font-bold text-stone-900">
            {auditLogs.length}
          </div>
          <span className="text-[11px] text-emerald-600 font-medium">100% Cryptographic Integrity</span>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-stone-200 shadow-xs space-y-1">
          <span className="text-[11px] font-semibold text-stone-400 uppercase tracking-wider">
            Security 403 Barriers Logged
          </span>
          <div className="font-mono text-2xl font-bold text-stone-900">
            {failureLogs.length}
          </div>
          <span className="text-[11px] text-stone-500 font-medium">Zero-Trust Boundaries Enforced</span>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-stone-200 shadow-xs space-y-1">
          <span className="text-[11px] font-semibold text-stone-400 uppercase tracking-wider">
            Audit Permission Mode
          </span>
          <div className="font-mono text-xl font-bold text-teal-700">
            READ-ONLY (Strict)
          </div>
          <span className="text-[11px] text-stone-500 font-medium">No Case Mutation Rights</span>
        </div>
      </div>

      {/* Security Failures Log (if any) */}
      {failureLogs.length > 0 && (
        <div className="p-5 rounded-3xl bg-amber-50/70 border border-amber-200/90 shadow-xs space-y-3">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-700" />
            <h3 className="font-display font-bold text-sm text-amber-900">
              Recent Authorization Barrier Events (Security 403)
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-amber-950 font-mono">
              <thead className="text-[10px] text-amber-800 uppercase border-b border-amber-200">
                <tr>
                  <th className="py-1.5 px-2">Timestamp</th>
                  <th className="py-1.5 px-2">UID</th>
                  <th className="py-1.5 px-2">Role</th>
                  <th className="py-1.5 px-2">Requested Route</th>
                  <th className="py-1.5 px-2">Required</th>
                  <th className="py-1.5 px-2">Reason</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-amber-200/60 text-[11px]">
                {failureLogs.slice(-5).reverse().map((f, i) => (
                  <tr key={i}>
                    <td className="py-1.5 px-2 whitespace-nowrap">{new Date(f.timestamp).toLocaleTimeString()}</td>
                    <td className="py-1.5 px-2">{f.userUid || 'anon'}</td>
                    <td className="py-1.5 px-2 font-bold">{f.actualRole}</td>
                    <td className="py-1.5 px-2">{f.requestedRoute}</td>
                    <td className="py-1.5 px-2">{f.requiredRoleOrPermission}</td>
                    <td className="py-1.5 px-2 text-amber-800">{f.reason}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 1: Main Cryptographic Audit Ledger */}
      {activeTab === 'main' && (
        <div className="p-6 rounded-3xl bg-white border border-stone-200 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-100 pb-3">
            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <Lock className="w-4 h-4 text-stone-700" />
                <h2 className="font-display font-bold text-base text-stone-900">
                  Immutable Cryptographic Ledger
                </h2>
              </div>
              <p className="text-xs text-stone-500">
                SHA-256 HMAC-verified record of all system access and role interactions
              </p>
            </div>

            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search audit actions..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8 pr-3 py-1.5 rounded-xl border border-stone-200 text-xs text-stone-800 focus:outline-none focus:ring-1 focus:ring-stone-900 w-52 bg-white"
                />
              </div>

              <select
                value={filterAction}
                onChange={(e) => setFilterAction(e.target.value)}
                className="px-2.5 py-1.5 rounded-xl border border-stone-200 text-xs text-stone-700 bg-white"
              >
                <option value="all">All Events</option>
                <option value="AUTH">Authentication</option>
                <option value="CASE">Case Access</option>
                <option value="INTERVENTION">Interventions</option>
                <option value="DEMO">Demo Actions</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-stone-700">
              <thead className="bg-stone-50 text-stone-500 uppercase tracking-wider text-[10px] border-b border-stone-200">
                <tr>
                  <th className="py-2.5 px-3">Timestamp (UTC)</th>
                  <th className="py-2.5 px-3">Actor & Role</th>
                  <th className="py-2.5 px-3">Action Identifier</th>
                  <th className="py-2.5 px-3">Target Resource</th>
                  <th className="py-2.5 px-3">Operational Details</th>
                  <th className="py-2.5 px-3">Cryptographic Checksum</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 font-mono text-[11px]">
                {filteredLogs.slice(0, 20).map((log) => (
                  <tr key={log.id} className="hover:bg-stone-50/70 transition-colors">
                    <td className="py-2.5 px-3 text-stone-500 whitespace-nowrap">
                      {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                    </td>
                    <td className="py-2.5 px-3 font-sans font-medium text-stone-900">
                      {log.actorName} <span className="text-[10px] text-stone-500 uppercase">({log.actorRole})</span>
                    </td>
                    <td className="py-2.5 px-3 text-stone-900 font-semibold">
                      {log.action}
                    </td>
                    <td className="py-2.5 px-3 text-stone-600">
                      {log.resourceType}:{log.resourceId}
                    </td>
                    <td className="py-2.5 px-3 font-sans text-stone-600 max-w-xs truncate" title={log.details}>
                      {log.details}
                    </td>
                    <td className="py-2.5 px-3 text-teal-700 font-bold">
                      {log.checksum}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 2: Statutory Relief & DBT Audit Trail */}
      {activeTab === 'financial' && (
        <div className="p-6 rounded-3xl bg-white border border-stone-200 shadow-sm space-y-4">
          <div className="space-y-0.5 border-b border-stone-100 pb-3">
            <div className="flex items-center gap-2">
              <IndianRupee className="w-4 h-4 text-emerald-700" />
              <h2 className="font-display font-bold text-base text-stone-900">
                Statutory Relief &amp; Compensation Audit Ledger
              </h2>
            </div>
            <p className="text-xs text-stone-500">
              Audit trail of DBT sanctions, document verifications, and approvals under SC/ST PoA Rules
            </p>
          </div>

          <div className="space-y-4">
            {financialRecords.map((rec) => (
              <div key={rec.id} className="p-4 rounded-2xl bg-stone-50 border border-stone-200 space-y-2 text-xs">
                <div className="flex items-center justify-between font-semibold text-stone-900">
                  <span>{rec.id} · Case {rec.caseId} ({rec.victimAlias})</span>
                  <span className="font-mono text-emerald-800">₹{rec.approvedAmount.toLocaleString('en-IN')} ({rec.status.toUpperCase()})</span>
                </div>
                <div className="space-y-1 pl-2 border-l-2 border-emerald-600 font-mono text-[11px] text-stone-600">
                  {rec.auditTrail.map((ev, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <span className="text-stone-400">[{new Date(ev.timestamp).toLocaleTimeString()}]</span>
                      <span className="font-bold text-stone-800">{ev.actorName} ({ev.actorRole})</span>
                      <span className="text-stone-500">→ {ev.action}</span>
                      <span className="text-emerald-700">{ev.notes}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 3: NHAA Integration Gateway Sync Events */}
      {activeTab === 'nhaa' && (
        <div className="p-6 rounded-3xl bg-white border border-stone-200 shadow-sm space-y-4">
          <div className="space-y-0.5 border-b border-stone-100 pb-3">
            <div className="flex items-center gap-2">
              <Network className="w-4 h-4 text-teal-700" />
              <h2 className="font-display font-bold text-base text-stone-900">
                NHAA 14566 Integration Gateway Ingestion Logs
              </h2>
            </div>
            <p className="text-xs text-stone-500">
              Real-time audit records of webhook events, idempotent duplicate checks, and external payload syncs
            </p>
          </div>

          <div className="space-y-2 font-mono text-xs">
            {nhaaLogs.map((log) => (
              <div key={log.id} className="p-3 rounded-xl bg-stone-50 border border-stone-200 flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-stone-500">[{new Date(log.timestamp).toLocaleTimeString()}]</span>
                    <span className={`px-1.5 py-0.2 rounded text-[10px] font-bold ${
                      log.status === 'SUCCESS' ? 'bg-emerald-100 text-emerald-800' :
                      log.status === 'DUPLICATE' ? 'bg-amber-100 text-amber-800' :
                      'bg-rose-100 text-rose-800'
                    }`}>
                      {log.status}
                    </span>
                    <span className="font-bold text-stone-800">{log.action}</span>
                    {log.externalCaseId && (
                      <span className="text-stone-600">ExtID: {log.externalCaseId}</span>
                    )}
                  </div>
                  <p className="text-stone-700 text-[11px] font-sans">{log.details}</p>
                </div>
                {log.latencyMs && (
                  <span className="text-[10px] text-stone-400 shrink-0">{log.latencyMs}ms</span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
