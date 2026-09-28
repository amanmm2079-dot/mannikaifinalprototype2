import { LanguageCode } from '../../types';

export type NHAAEnvironment = 'SANDBOX' | 'PRODUCTION' | 'NOT_CONFIGURED';

export interface NHAAConfig {
  environment: NHAAEnvironment;
  apiEndpoint: string;
  apiVersion: string;
  apiKeyMasked?: string;
  enableAutomaticSync: boolean;
  syncIntervalMinutes: number;
  maxRetries: number;
  lastSyncTimestamp?: string;
  lastSyncStatus?: 'SUCCESS' | 'FAILED' | 'IDLE';
}

export interface NHAAExternalCase {
  externalCaseId: string; // e.g. "NHAA-2026-MH-9941"
  complainantReference: string; // e.g. "CMP-2026-14566-081"
  registrationDate: string;
  district: string;
  state: string;
  caseCategory: string; // e.g. "SC_ST_POA_ATROCITY", "PREVENTION_OF_ATROCITIES"
  sourceChannel: 'NHAA 14566' | 'NHAA Web Portal' | 'IVRS' | 'Chatbot' | 'Mobile App' | 'Officer Manual';
  status: string;
  preferredLanguage?: LanguageCode;
  contactNumberMasked?: string;
  incidentBrief?: string;
  intakeNotes?: string;
  firNumber?: string;
  policeStation?: string;
}

export interface NHAAIngestionResult {
  success: boolean;
  isDuplicate: boolean;
  mannikCaseId: string;
  externalCaseId: string;
  idempotencyKey: string;
  message: string;
  timestamp: string;
}

export interface NHAAIntegrationLog {
  id: string;
  timestamp: string;
  direction: 'INBOUND' | 'OUTBOUND';
  action: 'CASE_SYNC' | 'STATUS_PUSH' | 'WEBHOOK_EVENT' | 'RETRY_ATTEMPT' | 'MANUAL_IMPORT';
  status: 'SUCCESS' | 'DUPLICATE' | 'ERROR' | 'RETRY_QUEUED';
  externalCaseId?: string;
  mannikCaseId?: string;
  details: string;
  latencyMs?: number;
}
