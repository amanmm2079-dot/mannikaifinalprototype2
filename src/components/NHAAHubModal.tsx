import React, { useState, useEffect } from 'react';
import { 
  Network, 
  RefreshCw, 
  Download, 
  Upload, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  ArrowRight, 
  FileText, 
  X, 
  ShieldCheck, 
  Copy,
  Layers,
  PhoneCall,
  Smartphone
} from 'lucide-react';
import { 
  NHAAConnector, 
  NHAAIntegrationLogger, 
  SANDBOX_PRESET_CASES, 
  NHAAExternalCase 
} from '../integrations/nhaa';
import { AppStore } from '../services/storage';

interface NHAAHubModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCasesUpdated: () => void;
}

export const NHAAHubModal: React.FC<NHAAHubModalProps> = ({
  isOpen,
  onClose,
  onCasesUpdated,
}) => {
  const [config, setConfig] = useState(NHAAConnector.getConfig());
  const [logs, setLogs] = useState(NHAAIntegrationLogger.getLogs());
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncFeedback, setSyncFeedback] = useState<string | null>(null);

  useEffect(() => {
    const unsubLog = NHAAIntegrationLogger.subscribe(() => {
      setLogs(NHAAIntegrationLogger.getLogs());
    });
    const unsubConn = NHAAConnector.subscribe(() => {
      setConfig(NHAAConnector.getConfig());
    });

    return () => {
      unsubLog();
      unsubConn();
    };
  }, []);

  if (!isOpen) return null;

  const handleIngestSingle = (externalCase: NHAAExternalCase) => {
    setIsSyncing(true);
    setSyncFeedback(null);
    setTimeout(() => {
      const res = NHAAConnector.ingestCase(externalCase);
      setIsSyncing(false);
      if (res.isDuplicate) {
        setSyncFeedback(`Idempotency Protection: Case ${res.externalCaseId} already exists in database. Duplicate prevented!`);
      } else {
        setSyncFeedback(`Successfully ingested ${res.externalCaseId} into Mannik Care Core as ${res.mannikCaseId}.`);
      }
      onCasesUpdated();
    }, 400);
  };

  const handleSyncAll = () => {
    setIsSyncing(true);
    setSyncFeedback(null);
    setTimeout(() => {
      const { ingestedCount, duplicateCount } = NHAAConnector.syncAllSandboxCases();
      setIsSyncing(false);
      setSyncFeedback(`Batch Sync Complete: ${ingestedCount} new cases ingested, ${duplicateCount} duplicate records skipped via idempotency.`);
      onCasesUpdated();
    }, 600);
  };

  const handleExportJSON = () => {
    const jsonStr = NHAAConnector.exportCasesJSON();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `mannik-cases-nhaa-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleExportCSV = () => {
    const csvStr = NHAAConnector.exportCasesCSV();
    const blob = new Blob([csvStr], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `mannik-cases-nhaa-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-4xl w-full border border-stone-200 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 my-8">
        {/* Header */}
        <div className="bg-stone-900 text-white p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-teal-600/30 border border-teal-500/40 flex items-center justify-center text-teal-300">
              <Network className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-display font-bold text-lg text-white">
                  NHAA 14566 Integration Gateway &amp; Ingestion Adapter
                </h3>
                <span className="text-[10px] uppercase font-bold tracking-wider text-amber-300 bg-amber-950/80 px-2 py-0.5 rounded border border-amber-700/60">
                  Sandbox / Demo Mode
                </span>
              </div>
              <p className="text-xs text-stone-400 mt-0.5">
                Ready for official Ministry of Social Justice NHAA API binding · Idempotent Ingestion · Multi-Channel Sync
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-stone-400 hover:text-white hover:bg-stone-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Feedback Alert if present */}
        {syncFeedback && (
          <div className="bg-teal-50 border-b border-teal-200 px-6 py-3 flex items-center justify-between text-xs text-teal-900">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-teal-700 shrink-0" />
              <span className="font-medium">{syncFeedback}</span>
            </div>
            <button
              onClick={() => setSyncFeedback(null)}
              className="text-teal-700 hover:text-teal-900 font-bold"
            >
              Dismiss
            </button>
          </div>
        )}

        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto text-stone-800">
          {/* Top KPI & Connection Banner */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200">
              <span className="text-[11px] font-semibold text-stone-500 uppercase tracking-wider block">
                Integration Status
              </span>
              <div className="flex items-center gap-1.5 mt-1 font-bold text-emerald-700 text-sm">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>SANDBOX ACTIVE</span>
              </div>
              <span className="text-[10px] text-stone-400 block mt-0.5">Endpoint Mock Verified</span>
            </div>

            <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200">
              <span className="text-[11px] font-semibold text-stone-500 uppercase tracking-wider block">
                Source System
              </span>
              <span className="font-bold text-stone-900 text-sm block mt-1">
                NHAA Toll-Free 14566
              </span>
              <span className="text-[10px] text-stone-400 block mt-0.5">Govt of India Helpline</span>
            </div>

            <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200">
              <span className="text-[11px] font-semibold text-stone-500 uppercase tracking-wider block">
                Idempotency Gate
              </span>
              <span className="font-bold text-teal-700 text-sm block mt-1">
                ENABLED (SHA-256)
              </span>
              <span className="text-[10px] text-stone-400 block mt-0.5">Zero Redundant Duplicates</span>
            </div>

            <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200">
              <span className="text-[11px] font-semibold text-stone-500 uppercase tracking-wider block">
                Last Synchronized
              </span>
              <span className="font-bold text-stone-900 text-xs block mt-1">
                {new Date(config.lastSyncTimestamp || Date.now()).toLocaleTimeString()}
              </span>
              <span className="text-[10px] text-stone-400 block mt-0.5">Auto-polling: 15 min</span>
            </div>
          </div>

          {/* Preset Ingestion Simulator */}
          <div className="p-5 rounded-3xl bg-white border border-stone-200 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h4 className="font-display font-bold text-base text-stone-900">
                  Multi-Channel Case Ingestion Pipeline
                </h4>
                <p className="text-xs text-stone-500">
                  Simulate external grievance intake from NHAA 14566, Web Portal, IVRS, Chatbot, and Mobile App
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleSyncAll}
                  disabled={isSyncing}
                  className="px-4 py-2 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer shadow-xs disabled:opacity-50"
                >
                  <RefreshCw className={`w-3.5 h-3.5 text-teal-400 ${isSyncing ? 'animate-spin' : ''}`} />
                  <span>Sync All Intake Cases</span>
                </button>
              </div>
            </div>

            {/* Presets Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-stone-700">
                <thead className="bg-stone-50 text-stone-500 uppercase tracking-wider text-[10px] border-b border-stone-200">
                  <tr>
                    <th className="py-2.5 px-3">External ID</th>
                    <th className="py-2.5 px-3">Channel</th>
                    <th className="py-2.5 px-3">Complainant / Jurisdiction</th>
                    <th className="py-2.5 px-3">Incident Brief</th>
                    <th className="py-2.5 px-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100 text-[11px]">
                  {SANDBOX_PRESET_CASES.map((sc) => (
                    <tr key={sc.externalCaseId} className="hover:bg-stone-50/70 transition-colors">
                      <td className="py-2.5 px-3 font-mono font-bold text-stone-900">
                        {sc.externalCaseId}
                      </td>
                      <td className="py-2.5 px-3">
                        <span className="px-2 py-0.5 rounded-md font-semibold text-[10px] bg-teal-50 text-teal-800 border border-teal-200">
                          {sc.sourceChannel}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 font-sans">
                        <span className="font-semibold text-stone-900 block">{sc.complainantReference}</span>
                        <span className="text-[10px] text-stone-500">{sc.district}, {sc.state}</span>
                      </td>
                      <td className="py-2.5 px-3 text-stone-600 max-w-xs truncate" title={sc.incidentBrief}>
                        {sc.incidentBrief}
                      </td>
                      <td className="py-2.5 px-3 text-right">
                        <button
                          onClick={() => handleIngestSingle(sc)}
                          disabled={isSyncing}
                          className="px-3 py-1.5 rounded-lg bg-teal-700 hover:bg-teal-800 text-white font-semibold text-[11px] transition-colors cursor-pointer disabled:opacity-50"
                        >
                          Ingest Case
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Import / Export Utilities */}
          <div className="p-5 rounded-3xl bg-stone-50 border border-stone-200/90 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="space-y-0.5">
              <h5 className="font-display font-bold text-sm text-stone-900">
                Data Interoperability &amp; Backup Gateway
              </h5>
              <p className="text-xs text-stone-500">
                Export normalized case records for offline audit reporting or import external spreadsheets
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleExportJSON}
                className="px-3.5 py-2 bg-white hover:bg-stone-100 text-stone-800 border border-stone-200 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
              >
                <Download className="w-3.5 h-3.5 text-stone-600" />
                <span>Export JSON</span>
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

          {/* Integration Logs */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h5 className="font-display font-bold text-sm text-stone-900 flex items-center gap-2">
                <Clock className="w-4 h-4 text-stone-500" />
                <span>Real-Time Integration Logs ({logs.length})</span>
              </h5>
              <span className="text-[11px] text-stone-400 font-mono">Zero-loss audit logging</span>
            </div>

            <div className="bg-stone-950 text-stone-300 font-mono text-[11px] rounded-2xl p-4 max-h-52 overflow-y-auto space-y-1.5 border border-stone-800">
              {logs.map((log) => (
                <div key={log.id} className="flex items-start gap-2 leading-relaxed">
                  <span className="text-stone-500 shrink-0">
                    [{new Date(log.timestamp).toLocaleTimeString()}]
                  </span>
                  <span className={`px-1 py-0.2 rounded text-[9px] font-bold shrink-0 ${
                    log.status === 'SUCCESS' ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' :
                    log.status === 'DUPLICATE' ? 'bg-amber-950 text-amber-400 border border-amber-800' :
                    'bg-rose-950 text-rose-400 border border-rose-800'
                  }`}>
                    {log.status}
                  </span>
                  <span className="text-stone-400 shrink-0">[{log.action}]</span>
                  <span className="text-stone-200">{log.details}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
