import { LegalMilestoneRecord, RehabilitationRecord } from '../types';

const INITIAL_LEGAL_MILESTONES: LegalMilestoneRecord[] = [
  {
    id: 'LEG-MH-01',
    caseId: 'CASE-MH-2026-109',
    stage: 'fir_registered',
    title: 'Zero FIR Registered & Transferred',
    date: '2026-09-02',
    referenceNumber: 'FIR No. 118/2026',
    courtDistrict: 'Pune District & Sessions Special Court',
    appointedCounsel: 'Adv. S. M. Kulkarni (DLSA Legal Aid Panel)',
    notes: 'Sections 3(1)(r), 3(1)(s), and 3(2)(va) of SC/ST (PoA) Act invoked.',
  },
  {
    id: 'LEG-MH-02',
    caseId: 'CASE-MH-2026-109',
    stage: 'chargesheet_filed',
    title: 'Investigation Completed & Chargesheet Submitted',
    date: '2026-09-20',
    referenceNumber: 'CS No. 44/2026',
    courtDistrict: 'Special Court under SC/ST Act, Pune',
    appointedCounsel: 'Adv. S. M. Kulkarni (DLSA Legal Aid Panel)',
    notes: 'DySP investigation completed within mandatory 60 days statutory period.',
  },
  {
    id: 'LEG-MH-03',
    caseId: 'CASE-MH-2026-109',
    stage: 'trial_in_progress',
    title: 'Trial Commenced & Witness Summons Issued',
    date: '2026-09-25',
    referenceNumber: 'Sessions Case 204/2026',
    courtDistrict: 'Special Court under SC/ST Act, Pune',
    appointedCounsel: 'Adv. S. M. Kulkarni (DLSA Legal Aid Panel)',
    notes: 'Special Public Prosecutor appointed. Victim protection officers deployed.',
  },
  {
    id: 'LEG-RJ-01',
    caseId: 'CASE-RJ-2026-088',
    stage: 'investigation_active',
    title: 'Investigation In Progress under ACP Jaipur Rural',
    date: '2026-09-10',
    referenceNumber: 'FIR No. 209/2026',
    courtDistrict: 'Jaipur Special Court',
    appointedCounsel: 'Adv. R. C. Meena (DLSA Legal Aid)',
    notes: 'Spot panchnama conducted; supplementary statement recording scheduled.',
  },
];

const INITIAL_REHAB_RECORDS: RehabilitationRecord[] = [
  {
    id: 'REHAB-MH-01',
    caseId: 'CASE-MH-2026-109',
    category: 'relocation',
    title: 'Temporary Safe Shelter & Transit Housing',
    status: 'completed',
    assignedAgency: 'District Social Welfare Office & DMHP Pune',
    targetDate: '2026-09-10',
    details: 'Victim and family relocated to government secure transit accommodation away from intimidation area.',
  },
  {
    id: 'REHAB-MH-02',
    caseId: 'CASE-MH-2026-109',
    category: 'education',
    title: 'Children School Transfer & Tuition Grant',
    status: 'in_progress',
    assignedAgency: 'Block Education Officer Haveli',
    targetDate: '2026-10-05',
    details: 'Free admission and mid-day meal continuity arranged at Zilla Parishad Model School.',
  },
  {
    id: 'REHAB-MH-03',
    caseId: 'CASE-MH-2026-109',
    category: 'livelihood',
    title: 'Vocational Training & Micro-Enterprise Grant',
    status: 'planned',
    assignedAgency: 'Maharashtra State Rural Livelihoods Mission (MSRLM)',
    targetDate: '2026-10-15',
    details: 'Skill development in food processing and provision of seed capital grant.',
  },
  {
    id: 'REHAB-RJ-01',
    caseId: 'CASE-RJ-2026-088',
    category: 'medical_support',
    title: 'Trauma Counseling & Telehealth Follow-up',
    status: 'in_progress',
    assignedAgency: 'DMHP Jaipur & Tele-MANAS Center',
    targetDate: '2026-10-01',
    details: 'Weekly psychological stabilization sessions with certified clinical psychologist.',
  },
];

class LegalRehabManager {
  private legalRecords: LegalMilestoneRecord[] = [...INITIAL_LEGAL_MILESTONES];
  private rehabRecords: RehabilitationRecord[] = [...INITIAL_REHAB_RECORDS];
  private listeners: Array<() => void> = [];

  getLegalMilestones(caseId: string): LegalMilestoneRecord[] {
    return this.legalRecords.filter((l) => l.caseId === caseId);
  }

  getRehabilitationRecords(caseId: string): RehabilitationRecord[] {
    return this.rehabRecords.filter((r) => r.caseId === caseId);
  }

  getAllRehabilitationRecords(): RehabilitationRecord[] {
    return [...this.rehabRecords];
  }

  addLegalMilestone(milestone: LegalMilestoneRecord) {
    this.legalRecords.push(milestone);
    this.notify();
  }

  addRehabilitationRecord(record: RehabilitationRecord) {
    this.rehabRecords.push(record);
    this.notify();
  }

  updateRehabStatus(id: string, status: 'planned' | 'in_progress' | 'completed') {
    const rec = this.rehabRecords.find((r) => r.id === id);
    if (rec) {
      rec.status = status;
      this.notify();
    }
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

export const LegalRehabService = new LegalRehabManager();
