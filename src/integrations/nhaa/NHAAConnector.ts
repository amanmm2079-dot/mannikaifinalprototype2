import { NHAAConfig, NHAAExternalCase, NHAAIngestionResult } from './types';
import { NHAADataMapper } from './NHAADataMapper';
import { NHAAIntegrationLogger } from './NHAAIntegrationLogger';
import { AppStore } from '../../services/storage';

const DEFAULT_CONFIG: NHAAConfig = {
  environment: 'SANDBOX',
  apiEndpoint: 'https://api.sandbox.nhaa.gov.in/v1/cases/sync',
  apiVersion: '2026.01',
  apiKeyMasked: 'nhaa_sbx_••••••••9941',
  enableAutomaticSync: true,
  syncIntervalMinutes: 15,
  maxRetries: 3,
  lastSyncTimestamp: new Date().toISOString(),
  lastSyncStatus: 'SUCCESS',
};

// Sandbox mock cases representing multi-channel intake
export const SANDBOX_PRESET_CASES: NHAAExternalCase[] = [
  {
    externalCaseId: 'NHAA-2026-MH-4401',
    complainantReference: 'Meera K. (Protected)',
    registrationDate: new Date(Date.now() - 3600000 * 4).toISOString(),
    district: 'Pune',
    state: 'Maharashtra',
    caseCategory: 'SC/ST Prevention of Atrocities §3(1)(r)',
    sourceChannel: 'NHAA 14566',
    status: 'REGISTERED_VERIFIED',
    preferredLanguage: 'mr',
    contactNumberMasked: '+91 98•••• 1204',
    incidentBrief: 'Social boycott and obstruction of public drinking water well access in Shirur taluka.',
    intakeNotes: 'Complainant called 14566 helpline in distress. Local SDPO notified for verification.',
    firNumber: '118/2026',
    policeStation: 'Shirur Rural Police Station',
  },
  {
    externalCaseId: 'NHAA-2026-RJ-8812',
    complainantReference: 'Devendra M. (Protected)',
    registrationDate: new Date(Date.now() - 3600000 * 8).toISOString(),
    district: 'Jaipur',
    state: 'Rajasthan',
    caseCategory: 'SC/ST PoA & Physical Intimidation',
    sourceChannel: 'NHAA Web Portal',
    status: 'UNDER_INQUIRY',
    preferredLanguage: 'hi',
    contactNumberMasked: '+91 94•••• 5592',
    incidentBrief: 'Physical assault and threats post village council nomination filing.',
    intakeNotes: 'Online grievance lodged with medical report attachment. Urgent protection requested.',
    firNumber: '042/2026',
    policeStation: 'Amber Police Station',
  },
  {
    externalCaseId: 'NHAA-2026-KA-2190',
    complainantReference: 'Basavaraj T. (Protected)',
    registrationDate: new Date(Date.now() - 3600000 * 12).toISOString(),
    district: 'Belagavi',
    state: 'Karnataka',
    caseCategory: 'Economic Boycott & Forced Eviction',
    sourceChannel: 'IVRS',
    status: 'INSPECTION_PENDING',
    preferredLanguage: 'kn',
    contactNumberMasked: '+91 97•••• 3311',
    incidentBrief: 'Automated IVR call recorded reporting agricultural land boundary destruction and threats.',
    intakeNotes: 'Voice recording verified by district social welfare officer. Telephonic pulse checks scheduled.',
    firNumber: '089/2026',
    policeStation: 'Chikodi Police Station',
  },
  {
    externalCaseId: 'NHAA-2026-TN-6731',
    complainantReference: 'Selvam P. (Protected)',
    registrationDate: new Date(Date.now() - 3600000 * 24).toISOString(),
    district: 'Madurai',
    state: 'Tamil Nadu',
    caseCategory: 'Workplace Discrimination & Humiliation',
    sourceChannel: 'Chatbot',
    status: 'CHARGESHEET_FILED',
    preferredLanguage: 'ta',
    contactNumberMasked: '+91 93•••• 7701',
    incidentBrief: 'Intake initiated via WhatsApp AI Chatbot Assistant. Formal complaint lodged.',
    intakeNotes: 'DLSA free legal advocate assigned. First relief installment under verification.',
    firNumber: '211/2026',
    policeStation: 'Madurai Central PS',
  },
  {
    externalCaseId: 'NHAA-2026-UP-5519',
    complainantReference: 'Asha Devi (Protected)',
    registrationDate: new Date(Date.now() - 3600000 * 48).toISOString(),
    district: 'Varanasi',
    state: 'Uttar Pradesh',
    caseCategory: 'SC/ST PoA & Verbal Abuse',
    sourceChannel: 'Mobile App',
    status: 'TRIAL_UNDERWAY',
    preferredLanguage: 'hi',
    contactNumberMasked: '+91 99•••• 8820',
    incidentBrief: 'Citizen mobile application complaint regarding verbal public abuse.',
    intakeNotes: 'Chargesheet filed in Special Court. Second relief installment sanctioned.',
    firNumber: '155/2026',
    policeStation: 'Cantt Police Station',
  },
];

class NHAAConnectorService {
  private config: NHAAConfig = { ...DEFAULT_CONFIG };
  private ingestedIdempotencyKeys = new Set<string>();
  private listeners: Array<() => void> = [];

  constructor() {
    // Pre-populate with existing system cases to avoid re-duplicating
    this.ingestedIdempotencyKeys.add('IDEMP-CASE-MH-2026-109-NHAA_14566');
    this.ingestedIdempotencyKeys.add('IDEMP-CASE-MH-2026-042-NHAA_WEB_PORTAL');
  }

  getConfig(): NHAAConfig {
    return { ...this.config };
  }

  updateConfig(updates: Partial<NHAAConfig>) {
    this.config = { ...this.config, ...updates };
    NHAAIntegrationLogger.log({
      direction: 'OUTBOUND',
      action: 'CASE_SYNC',
      status: 'SUCCESS',
      details: `Configuration updated: Environment=${this.config.environment}, SyncInterval=${this.config.syncIntervalMinutes}m`,
    });
    this.notify();
  }

  /**
   * Ingest an external NHAA case into Mannik AI Care Core
   * Enforces Idempotency & Duplicate Prevention
   */
  ingestCase(externalCase: NHAAExternalCase): NHAAIngestionResult {
    const startMs = Date.now();
    const idempotencyKey = NHAADataMapper.generateIdempotencyKey(externalCase);

    // 1. Idempotency Check
    if (this.ingestedIdempotencyKeys.has(idempotencyKey)) {
      NHAAIntegrationLogger.log({
        direction: 'INBOUND',
        action: 'CASE_SYNC',
        status: 'DUPLICATE',
        externalCaseId: externalCase.externalCaseId,
        details: `Duplicate payload rejected by idempotency key: ${idempotencyKey}. No redundant record created.`,
        latencyMs: Date.now() - startMs,
      });

      return {
        success: true,
        isDuplicate: true,
        mannikCaseId: 'EXISTING',
        externalCaseId: externalCase.externalCaseId,
        idempotencyKey,
        message: `Case ${externalCase.externalCaseId} already synchronized. Idempotency check prevented duplicate insertion.`,
        timestamp: new Date().toISOString(),
      };
    }

    // 2. Map and Ingest into Mannik Store
    const atrocityCase = NHAADataMapper.toAtrocityCase(externalCase);
    AppStore.addCase(atrocityCase);

    // Record idempotency key
    this.ingestedIdempotencyKeys.add(idempotencyKey);

    NHAAIntegrationLogger.log({
      direction: 'INBOUND',
      action: 'CASE_SYNC',
      status: 'SUCCESS',
      externalCaseId: externalCase.externalCaseId,
      mannikCaseId: atrocityCase.id,
      details: `Successfully ingested from ${externalCase.sourceChannel} into monitoring pipeline. Assigned ID: ${atrocityCase.id}`,
      latencyMs: Date.now() - startMs,
    });

    this.notify();

    return {
      success: true,
      isDuplicate: false,
      mannikCaseId: atrocityCase.id,
      externalCaseId: externalCase.externalCaseId,
      idempotencyKey,
      message: `Ingestion successful. Case mapped to internal ID ${atrocityCase.id} with baseline score 3.5.`,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Sync all sandbox preset cases
   */
  syncAllSandboxCases(): { ingestedCount: number; duplicateCount: number } {
    let ingestedCount = 0;
    let duplicateCount = 0;

    for (const sc of SANDBOX_PRESET_CASES) {
      const res = this.ingestCase(sc);
      if (res.isDuplicate) {
        duplicateCount++;
      } else {
        ingestedCount++;
      }
    }

    this.config.lastSyncTimestamp = new Date().toISOString();
    this.config.lastSyncStatus = 'SUCCESS';
    this.notify();

    return { ingestedCount, duplicateCount };
  }

  /**
   * Export cases in structured JSON format
   */
  exportCasesJSON(): string {
    const cases = AppStore.getCases();
    return JSON.stringify(cases, null, 2);
  }

  /**
   * Export cases in CSV format
   */
  exportCasesCSV(): string {
    const cases = AppStore.getCases();
    const headers = ['Case ID', 'Victim Alias', 'Channel', 'District', 'State', 'Distress Score', 'Risk State', 'Status', 'Last Check-In'];
    const rows = cases.map((c) => [
      c.id,
      `"${c.victimAlias}"`,
      c.registrationChannel,
      c.district,
      c.state,
      c.currentDistressScore.toFixed(1),
      c.riskState,
      c.status,
      c.lastCheckInDate,
    ]);

    return [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
  }

  subscribe(listener: () => void) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  private notify() {
    this.listeners.forEach((l) => l());
  }
}

export const NHAAConnector = new NHAAConnectorService();
