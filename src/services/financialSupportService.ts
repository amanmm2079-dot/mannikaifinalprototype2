import { FinancialCaseRecord, FinancialSupportType, FinancialWorkflowStatus } from '../types';

export interface FinancialSchemeRule {
  id: string;
  name: string;
  supportType: FinancialSupportType;
  legalProvision: string;
  standardAmount: number;
  installmentsTotal: number;
  triggerStage: 'FIR_LODGED' | 'CHARGESHEET_FILED' | 'SPECIAL_COURT_CONVICTION' | 'IMMEDIATE_TRAUMA_DISCHARGE';
  requiredDocuments: string[];
}

export const STATUTORY_FINANCIAL_SCHEMES: FinancialSchemeRule[] = [
  {
    id: 'SCHEME-POA-RELIEF-STAGE-1',
    name: 'Immediate First-Stage Relief Grant',
    supportType: 'immediate_relief',
    legalProvision: 'Rule 12(4) of SC/ST (Prevention of Atrocities) Rules, 1995',
    standardAmount: 100000,
    installmentsTotal: 1,
    triggerStage: 'FIR_LODGED',
    requiredDocuments: ['Copy of FIR Registered', 'Aadhaar Card / Protected Alias UID', 'Bank Account Verification Details', 'Caste Certificate Verification'],
  },
  {
    id: 'SCHEME-POA-CHARGESHEET-STAGE-2',
    name: 'Investigation Completion & Chargesheet Relief',
    supportType: 'statutory_compensation',
    legalProvision: 'Annexure-I Serial 1-12 of SC/ST (PoA) Amendment Rules, 2016',
    standardAmount: 200000,
    installmentsTotal: 2,
    triggerStage: 'CHARGESHEET_FILED',
    requiredDocuments: ['Police Investigation Final Report / Chargesheet Copy', 'Medico-Legal Examination Certificate', 'District Nodal Officer Forwarding Letter'],
  },
  {
    id: 'SCHEME-POA-REHAB-GRANT',
    name: 'Comprehensive Social Rehabilitation & Livelihood Grant',
    supportType: 'rehabilitation_grant',
    legalProvision: 'Section 15A(6)(d) of SC/ST PoA Act & State Social Justice Fund',
    standardAmount: 150000,
    installmentsTotal: 1,
    triggerStage: 'IMMEDIATE_TRAUMA_DISCHARGE',
    requiredDocuments: ['Rehabilitation Recommendation from District Welfare Committee', 'Safe Residence / Vocational Plan', 'Proof of Residency / Relocation'],
  },
  {
    id: 'SCHEME-POA-MEDICAL-GRANT',
    name: 'Emergency Medical & Trauma Hospitalization Grant',
    supportType: 'medical_assistance',
    legalProvision: 'State Victim Compensation Scheme 2024 & DMHP Care Fund',
    standardAmount: 50000,
    installmentsTotal: 1,
    triggerStage: 'FIR_LODGED',
    requiredDocuments: ['Hospital Discharge Summary', 'Prescription & Pharmacy Receipts', 'Medical Officer Attestation'],
  },
  {
    id: 'SCHEME-POA-TRAVEL-MAINTENANCE',
    name: 'Witness Protection Daily Maintenance & Travel Allowance',
    supportType: 'travel_maintenance',
    legalProvision: 'Rule 11 of SC/ST (Prevention of Atrocities) Rules, 1995',
    standardAmount: 15000,
    installmentsTotal: 1,
    triggerStage: 'CHARGESHEET_FILED',
    requiredDocuments: ['Court Summons Attendance Certificate', 'Travel Slips / Ticket Verification'],
  },
];

// Seed realistic demo financial records
const INITIAL_FINANCIAL_RECORDS: FinancialCaseRecord[] = [
  {
    id: 'FIN-MH-2026-001',
    caseId: 'CASE-MH-2026-109',
    victimAlias: 'Sunita D. (Protected)',
    supportType: 'immediate_relief',
    schemeName: 'Immediate First-Stage Relief Grant',
    provisionReference: 'Rule 12(4) of SC/ST (PoA) Rules, 1995',
    status: 'disbursed',
    requestedAmount: 100000,
    approvedAmount: 100000,
    disbursedAmount: 100000,
    pendingAmount: 0,
    installmentNumber: 1,
    sanctionDate: '2026-09-15',
    disbursementDate: '2026-09-18',
    paymentReference: 'PFMS-RBI-20260918-77192',
    responsibleAuthority: 'District Collector & DMHP Pune',
    districtId: 'pune',
    stateId: 'maharashtra',
    documentsVerified: true,
    requiredDocuments: ['FIR Copy', 'Aadhaar (Masked)', 'Bank Account Verification', 'Caste Certificate'],
    notes: 'Immediate DBT relief disbursed directly to verified bank account post FIR registration.',
    auditTrail: [
      {
        timestamp: '2026-09-14T10:00:00Z',
        actorName: 'Rajesh Deshmukh',
        actorRole: 'district_officer',
        action: 'APPLICATION_INITIATED',
        fromStatus: 'need_identified',
        toStatus: 'application_submitted',
        notes: 'FIR registered; relief application triggered automatically by system.',
      },
      {
        timestamp: '2026-09-15T14:30:00Z',
        actorName: 'Vikramaditya Patil',
        actorRole: 'state_admin',
        action: 'SANCTION_APPROVED',
        fromStatus: 'document_verification',
        toStatus: 'sanctioned',
        notes: 'Statutory mandate verified; ₹1,00,000 sanctioned for DBT dispatch.',
      },
      {
        timestamp: '2026-09-18T09:15:00Z',
        actorName: 'PFMS Electronic Gateway',
        actorRole: 'system',
        action: 'DISBURSEMENT_CONFIRMED',
        fromStatus: 'sanctioned',
        toStatus: 'disbursed',
        notes: 'Credit confirmation UTR PFMS-RBI-20260918-77192 received.',
      },
    ],
  },
  {
    id: 'FIN-MH-2026-002',
    caseId: 'CASE-MH-2026-109',
    victimAlias: 'Sunita D. (Protected)',
    supportType: 'statutory_compensation',
    schemeName: 'Investigation Completion & Chargesheet Relief',
    provisionReference: 'Annexure-I Serial 1-12 of SC/ST (PoA) Rules',
    status: 'authorized_approval',
    requestedAmount: 200000,
    approvedAmount: 200000,
    disbursedAmount: 0,
    pendingAmount: 200000,
    installmentNumber: 2,
    sanctionDate: '2026-09-24',
    responsibleAuthority: 'District Welfare Officer Rajesh Deshmukh',
    districtId: 'pune',
    stateId: 'maharashtra',
    documentsVerified: true,
    requiredDocuments: ['Chargesheet Copy (Special Court Pune)', 'Medico-Legal Report'],
    notes: 'Chargesheet filed by DSP Pune Rural. Recommended for release by District Magistrate.',
    auditTrail: [
      {
        timestamp: '2026-09-22T11:00:00Z',
        actorName: 'Dr. Ananya Sen',
        actorRole: 'counsellor',
        action: 'NEED_ESCALATION_FLAGGED',
        fromStatus: 'need_identified',
        toStatus: 'document_verification',
        notes: 'Victim expressed severe anxiety regarding eviction & legal costs.',
      },
      {
        timestamp: '2026-09-24T16:00:00Z',
        actorName: 'Rajesh Deshmukh',
        actorRole: 'district_officer',
        action: 'APPROVAL_RECORDED',
        fromStatus: 'document_verification',
        toStatus: 'authorized_approval',
        notes: 'Verification complete. Awaiting state disbursement release token.',
      },
    ],
  },
  {
    id: 'FIN-RJ-2026-003',
    caseId: 'CASE-RJ-2026-088',
    victimAlias: 'Vikram S. (Protected)',
    supportType: 'rehabilitation_grant',
    schemeName: 'Comprehensive Social Rehabilitation & Livelihood Grant',
    provisionReference: 'Section 15A(6)(d) of SC/ST PoA Act',
    status: 'document_verification',
    requestedAmount: 150000,
    approvedAmount: 150000,
    disbursedAmount: 0,
    pendingAmount: 150000,
    installmentNumber: 1,
    responsibleAuthority: 'Social Justice Directorate Jaipur',
    districtId: 'jaipur',
    stateId: 'rajasthan',
    documentsVerified: false,
    requiredDocuments: ['District Welfare Committee Recommendation', 'Vocational Livelihood Proposal'],
    notes: 'Self-employment dairy micro-enterprise grant proposal under review.',
    auditTrail: [
      {
        timestamp: '2026-09-20T10:00:00Z',
        actorName: 'Rajesh Deshmukh',
        actorRole: 'district_officer',
        action: 'APPLICATION_INITIATED',
        fromStatus: 'need_identified',
        toStatus: 'document_verification',
        notes: 'Victim livelihood displaced; rehabilitation proposal forwarded.',
      },
    ],
  },
];

class FinancialSupportManager {
  private records: FinancialCaseRecord[] = [...INITIAL_FINANCIAL_RECORDS];
  private listeners: Array<() => void> = [];

  getRecords(): FinancialCaseRecord[] {
    return [...this.records];
  }

  getRecordsForCase(caseId: string): FinancialCaseRecord[] {
    return this.records.filter((r) => r.caseId === caseId);
  }

  getRecordsForDistrict(districtId: string): FinancialCaseRecord[] {
    return this.records.filter((r) => r.districtId.toLowerCase() === districtId.toLowerCase());
  }

  getRecordsForState(stateId: string): FinancialCaseRecord[] {
    return this.records.filter((r) => r.stateId.toLowerCase() === stateId.toLowerCase());
  }

  /**
   * Submits a new financial assistance application
   */
  createApplication(
    caseId: string,
    victimAlias: string,
    schemeId: string,
    districtId: string,
    stateId: string,
    actorName: string,
    actorRole: string
  ): FinancialCaseRecord {
    const scheme = STATUTORY_FINANCIAL_SCHEMES.find((s) => s.id === schemeId) || STATUTORY_FINANCIAL_SCHEMES[0];
    const newRecord: FinancialCaseRecord = {
      id: `FIN-${stateId.substring(0, 2).toUpperCase()}-2026-${Math.floor(100 + Math.random() * 900)}`,
      caseId,
      victimAlias,
      supportType: scheme.supportType,
      schemeName: scheme.name,
      provisionReference: scheme.legalProvision,
      status: 'application_submitted',
      requestedAmount: scheme.standardAmount,
      approvedAmount: scheme.standardAmount,
      disbursedAmount: 0,
      pendingAmount: scheme.standardAmount,
      installmentNumber: 1,
      responsibleAuthority: `${actorName} (${actorRole})`,
      districtId,
      stateId,
      documentsVerified: false,
      requiredDocuments: [...scheme.requiredDocuments],
      notes: `Application initiated under ${scheme.legalProvision}`,
      auditTrail: [
        {
          timestamp: new Date().toISOString(),
          actorName,
          actorRole,
          action: 'APPLICATION_SUBMITTED',
          fromStatus: 'need_identified',
          toStatus: 'application_submitted',
          notes: 'Formal application generated and queued for officer document verification.',
        },
      ],
    };

    this.records.unshift(newRecord);
    this.notify();
    return newRecord;
  }

  /**
   * Authorized Officer transitions status (Verification -> Approval -> Sanction -> Disbursement)
   */
  updateRecordStatus(
    recordId: string,
    newStatus: FinancialWorkflowStatus,
    actorName: string,
    actorRole: string,
    notes?: string
  ): FinancialCaseRecord | null {
    const record = this.records.find((r) => r.id === recordId);
    if (!record) return null;

    const oldStatus = record.status;
    record.status = newStatus;

    if (newStatus === 'sanctioned') {
      record.sanctionDate = new Date().toISOString().split('T')[0];
    } else if (newStatus === 'disbursed') {
      record.disbursementDate = new Date().toISOString().split('T')[0];
      record.disbursedAmount = record.approvedAmount;
      record.pendingAmount = 0;
      record.paymentReference = `PFMS-DBT-2026-${Math.floor(100000 + Math.random() * 900000)}`;
    } else if (newStatus === 'document_verification') {
      record.documentsVerified = true;
    }

    record.auditTrail.push({
      timestamp: new Date().toISOString(),
      actorName,
      actorRole,
      action: `STATUS_CHANGED_TO_${newStatus.toUpperCase()}`,
      fromStatus: oldStatus,
      toStatus: newStatus,
      notes: notes || `Status updated by authorized official ${actorName}`,
    });

    this.notify();
    return record;
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

export const FinancialSupportService = new FinancialSupportManager();
