import React, { useState } from 'react';
import { 
  Sliders, 
  ShieldCheck, 
  Activity, 
  Phone, 
  MessageSquare, 
  Server, 
  Database, 
  Key, 
  Lock, 
  CheckCircle2, 
  RefreshCw, 
  Search, 
  SlidersHorizontal,
  ExternalLink,
  Code2
} from 'lucide-react';
import { AuditLogEntry, SystemIntegrationStatus, ThresholdConfig } from '../types';
import { AppStore, INITIAL_INTEGRATION_STATUS } from '../services/storage';

interface AdminPanelProps {
  thresholds: ThresholdConfig;
  auditLogs: AuditLogEntry[];
}

export const AdminPanel: React.FC<AdminPanelProps> = ({
  thresholds,
  auditLogs,
}) => {
  const [currentThresholds, setCurrentThresholds] = useState<ThresholdConfig>(thresholds);
  const [integrations, setIntegrations] = useState<SystemIntegrationStatus>(INITIAL_INTEGRATION_STATUS);
  const [auditSearch, setAuditSearch] = useState('');
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [webhookTesting, setWebhookTesting] = useState(false);
  const [webhookLog, setWebhookLog] = useState<string | null>(null);

  const handleSaveThresholds = () => {
    AppStore.updateThresholds(currentThresholds);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const handleSimulateWebhook = (type: 'ivrs' | 'sms' | 'nhaa') => {
    setWebhookTesting(true);
    setWebhookLog(`Dispatching test webhook payload to /api/webhooks/${type}...`);

    setTimeout(() => {
      setWebhookTesting(false);
      if (type === 'ivrs') {
        setWebhookLog('HTTP 200 OK: IVRS call completed (Duration: 182s). Voice payload derived.');
        setIntegrations(prev => ({
          ...prev,
          ivrsGateway: { ...prev.ivrsGateway, completedCalls24h: prev.ivrsGateway.completedCalls24h + 1 }
        }));
      } else if (type === 'nhaa') {
        setWebhookLog('HTTP 200 OK: Synced 3 cases from National Atrocity Portal (NHAA/PoA).');
        setIntegrations(prev => ({
          ...prev,
          nhaaPortalSync: { ...prev.nhaaPortalSync, totalSyncedCases: prev.nhaaPortalSync.totalSyncedCases + 3, lastSync: 'Just now' }
        }));
      } else {
        setWebhookLog('HTTP 200 OK: SMS check-in invitation delivered to carrier gateway.');
      }
    }, 700);
  };

  const filteredLogs = auditLogs.filter(log => 
    log.action.toLowerCase().includes(auditSearch.toLowerCase()) ||
    log.actorName.toLowerCase().includes(auditSearch.toLowerCase()) ||
    log.resourceId.toLowerCase().includes(auditSearch.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="font-display font-bold text-2xl sm:text-3xl text-stone-900">
            System Administration & Security Console
          </h1>
          <p className="text-xs sm:text-sm text-stone-500 mt-1">
            Dynamic Threshold Calibration, Gateway Adapters & Cryptographic Audit Ledger
          </p>
        </div>

        {savedSuccess && (
          <div className="px-3.5 py-1.5 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-semibold flex items-center gap-1.5 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Thresholds persisted and active</span>
          </div>
        )}
      </div>

      {/* Grid: Thresholds Configuration & Gateway Integration Monitors */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Dynamic Threshold Calibration (6 cols) */}
        <div className="lg:col-span-6 p-6 rounded-3xl bg-white border border-stone-200/90 shadow-sm space-y-5">
          <div className="flex items-center justify-between border-b border-stone-100 pb-3">
            <div className="flex items-center gap-2">
              <SlidersHorizontal className="w-5 h-5 text-stone-700" />
              <h2 className="font-display font-bold text-base text-stone-900">
                Dynamic Distress Score Threshold Bands
              </h2>
            </div>
            <button
              onClick={handleSaveThresholds}
              className="px-3.5 py-1.5 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-xs font-semibold transition-colors cursor-pointer"
            >
              Save Configuration
            </button>
          </div>

          <div className="space-y-4 text-xs">
            {/* Urgent Min Slider */}
            <div className="space-y-1.5">
              <div className="flex justify-between font-medium">
                <span className="text-rose-700 font-semibold">Urgent Human Review Floor (Score 0-10):</span>
                <span className="font-mono font-bold text-rose-700 text-sm">{currentThresholds.urgentBandMin}</span>
              </div>
              <input
                type="range"
                min="7.0"
                max="9.5"
                step="0.1"
                value={currentThresholds.urgentBandMin}
                onChange={(e) => setCurrentThresholds({ ...currentThresholds, urgentBandMin: parseFloat(e.target.value) })}
                className="w-full accent-rose-600 cursor-pointer"
              />
              <span className="text-[10px] text-stone-400 block">
                Any check-in at or above this score immediately triggers prioritized alerts to certified counsellors.
              </span>
            </div>

            {/* High Band Max */}
            <div className="space-y-1.5">
              <div className="flex justify-between font-medium">
                <span className="text-amber-700 font-semibold">High Concern Ceiling:</span>
                <span className="font-mono font-bold text-amber-700 text-sm">{currentThresholds.highBandMax}</span>
              </div>
              <input
                type="range"
                min="5.0"
                max="8.5"
                step="0.1"
                value={currentThresholds.highBandMax}
                onChange={(e) => setCurrentThresholds({ ...currentThresholds, highBandMax: parseFloat(e.target.value) })}
                className="w-full accent-amber-600 cursor-pointer"
              />
            </div>

            {/* Escalation Delta Threshold */}
            <div className="space-y-1.5">
              <div className="flex justify-between font-medium">
                <span className="text-stone-700 font-semibold">Rapid Escalation Delta Trigger (+ points):</span>
                <span className="font-mono font-bold text-stone-900 text-sm">+{currentThresholds.escalationDeltaWarning}</span>
              </div>
              <input
                type="range"
                min="1.0"
                max="3.0"
                step="0.1"
                value={currentThresholds.escalationDeltaWarning}
                onChange={(e) => setCurrentThresholds({ ...currentThresholds, escalationDeltaWarning: parseFloat(e.target.value) })}
                className="w-full accent-stone-900 cursor-pointer"
              />
              <span className="text-[10px] text-stone-400 block">
                Triggers acute spike alert if score rises by this delta within 48h, even if absolute score is below Urgent.
              </span>
            </div>

            {/* Missed Check-ins Count */}
            <div className="space-y-1.5">
              <div className="flex justify-between font-medium">
                <span className="text-stone-700 font-semibold">Consecutive Missed Check-Ins Alert Count:</span>
                <span className="font-mono font-bold text-stone-900 text-sm">{currentThresholds.missedCheckInsEscalationCount} missed</span>
              </div>
              <input
                type="range"
                min="1"
                max="5"
                step="1"
                value={currentThresholds.missedCheckInsEscalationCount}
                onChange={(e) => setCurrentThresholds({ ...currentThresholds, missedCheckInsEscalationCount: parseInt(e.target.value) })}
                className="w-full accent-stone-900 cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* Integration Status & Webhook Simulator (6 cols) */}
        <div className="lg:col-span-6 p-6 rounded-3xl bg-white border border-stone-200/90 shadow-sm space-y-5">
          <div className="flex items-center justify-between border-b border-stone-100 pb-3">
            <div className="flex items-center gap-2">
              <Server className="w-5 h-5 text-stone-700" />
              <h2 className="font-display font-bold text-base text-stone-900">
                Government & Telco Integration Adapters
              </h2>
            </div>
            <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
              All Adapters Online
            </span>
          </div>

          <div className="space-y-3 text-xs">
            {/* NHAA Portal */}
            <div className="p-3 bg-stone-50 rounded-2xl border border-stone-200 flex items-center justify-between">
              <div>
                <span className="font-semibold text-stone-900 block">National Atrocity Portal (NHAA/PoA)</span>
                <span className="text-stone-500 text-[11px]">Last Sync: {integrations.nhaaPortalSync.lastSync} · {integrations.nhaaPortalSync.totalSyncedCases} cases</span>
              </div>
              <button
                onClick={() => handleSimulateWebhook('nhaa')}
                disabled={webhookTesting}
                className="px-2.5 py-1 bg-white border border-stone-300 rounded-lg text-stone-700 hover:bg-stone-100 font-medium transition-colors"
              >
                Sync Now
              </button>
            </div>

            {/* IVRS Telephony Gateway */}
            <div className="p-3 bg-stone-50 rounded-2xl border border-stone-200 flex items-center justify-between">
              <div>
                <span className="font-semibold text-stone-900 block">IVRS Outbound Call Gateway</span>
                <span className="text-stone-500 text-[11px]">Trunks: {integrations.ivrsGateway.activeTrunks} active · {integrations.ivrsGateway.completedCalls24h} calls completed</span>
              </div>
              <button
                onClick={() => handleSimulateWebhook('ivrs')}
                disabled={webhookTesting}
                className="px-2.5 py-1 bg-white border border-stone-300 rounded-lg text-stone-700 hover:bg-stone-100 font-medium transition-colors"
              >
                Test IVRS Webhook
              </button>
            </div>

            {/* SMS Gateway */}
            <div className="p-3 bg-stone-50 rounded-2xl border border-stone-200 flex items-center justify-between">
              <div>
                <span className="font-semibold text-stone-900 block">NIC / Telco SMS Gateway</span>
                <span className="text-stone-500 text-[11px]">Delivery: {integrations.smsGateway.deliveryRatePercent}% · Queue: 0</span>
              </div>
              <button
                onClick={() => handleSimulateWebhook('sms')}
                disabled={webhookTesting}
                className="px-2.5 py-1 bg-white border border-stone-300 rounded-lg text-stone-700 hover:bg-stone-100 font-medium transition-colors"
              >
                Test SMS Event
              </button>
            </div>

            {webhookLog && (
              <div className="p-2.5 rounded-xl bg-stone-900 text-teal-300 font-mono text-[10px] space-y-0.5">
                <span className="text-stone-400 block">// Webhook Execution Log:</span>
                <p>{webhookLog}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Cryptographic Immutable Audit Log Ledger */}
      <div className="p-6 rounded-3xl bg-white border border-stone-200/90 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-100 pb-3">
          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <Lock className="w-4 h-4 text-stone-700" />
              <h2 className="font-display font-bold text-base text-stone-900">
                Immutable Cryptographic Audit Ledger
              </h2>
            </div>
            <p className="text-xs text-stone-500">
              Every sensitive case view, risk computation, alert resolution, and intervention dispatch is tamper-sealed
            </p>
          </div>

          <div className="relative">
            <Search className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search audit actions..."
              value={auditSearch}
              onChange={(e) => setAuditSearch(e.target.value)}
              className="pl-8 pr-3 py-1.5 rounded-xl border border-stone-200 text-xs text-stone-800 focus:outline-none focus:ring-1 focus:ring-stone-900 w-52"
            />
          </div>
        </div>

        {/* Audit Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-stone-700">
            <thead className="bg-stone-50 text-stone-500 uppercase tracking-wider text-[10px] border-b border-stone-200">
              <tr>
                <th className="py-2.5 px-3">Timestamp (UTC)</th>
                <th className="py-2.5 px-3">Actor</th>
                <th className="py-2.5 px-3">Action Identifier</th>
                <th className="py-2.5 px-3">Resource Target</th>
                <th className="py-2.5 px-3">Details</th>
                <th className="py-2.5 px-3">Cryptographic Checksum</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 font-mono text-[11px]">
              {filteredLogs.slice(0, 15).map(log => (
                <tr key={log.id} className="hover:bg-stone-50/70 transition-colors">
                  <td className="py-2.5 px-3 text-stone-500 whitespace-nowrap">
                    {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                  </td>
                  <td className="py-2.5 px-3 font-sans font-medium text-stone-900">
                    {log.actorName} ({log.actorRole})
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
    </div>
  );
};
