import { AtrocityCase, FirestoreCase, CaseLifecycleStatus, IntakeChannel } from '../../types';
import { NHAAExternalCase } from './types';

export class NHAADataMapper {
  /**
   * Generates a deterministic idempotency key for an external case
   */
  static generateIdempotencyKey(externalCase: NHAAExternalCase): string {
    return `IDEMP-${externalCase.externalCaseId.trim().toUpperCase()}-${externalCase.sourceChannel.replace(/\s+/g, '_').toUpperCase()}`;
  }

  /**
   * Converts external source channel to internal IntakeChannel type
   */
  static mapSourceChannel(channel: string): IntakeChannel {
    const norm = channel.toLowerCase();
    if (norm.includes('14566')) return 'nhaa_14566';
    if (norm.includes('portal') || norm.includes('web')) return 'nhaa_portal';
    if (norm.includes('chat')) return 'chatbot';
    if (norm.includes('mobile')) return 'mobile_app';
    if (norm.includes('ivr')) return 'ivrs';
    if (norm.includes('officer')) return 'officer_entry';
    return 'other_channel';
  }

  /**
   * Maps an external NHAA case to an internal FirestoreCase
   */
  static toFirestoreCase(external: NHAAExternalCase, assignedOwnerUid: string): FirestoreCase {
    const mannikCaseId = `CASE-${external.state.substring(0, 2).toUpperCase()}-2026-${Math.floor(100 + Math.random() * 900)}`;

    return {
      caseId: mannikCaseId,
      ownerUid: assignedOwnerUid,
      externalSource: 'NHAA',
      externalCaseId: external.externalCaseId,
      intakeChannel: this.mapSourceChannel(external.sourceChannel),
      victimAlias: external.complainantReference || 'Complainant (Protected)',
      location: {
        districtId: external.district.toLowerCase(),
        stateId: external.state.toLowerCase(),
      },
      category: external.caseCategory || 'SC/ST Prevention of Atrocities',
      status: 'INTAKE_VALIDATION',
      priority: 'normal',
      distressScore: 3.5, // Initial baseline score
      previousDistressScore: 3.5,
      trajectory: 'STABLE',
      flaggedFactors: ['Initial Intake from NHAA'],
      incidentType: external.incidentBrief || 'Official complaint registered via NHAA 14566',
      createdAt: external.registrationDate || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: 'NHAA_INTEGRATION_GATEWAY',
      updatedBy: 'NHAA_INTEGRATION_GATEWAY',
      financialStatus: 'need_identified',
      reliefSanctionedAmount: 0,
      reliefDisbursedAmount: 0,
      rehabilitationStatus: 'Intake Assessment Pending',
      legalStatus: external.firNumber ? `FIR No. ${external.firNumber} (${external.policeStation || 'Local PS'})` : 'FIR Registration Under Review',
    };
  }

  /**
   * Maps an external NHAA case to local store AtrocityCase
   */
  static toAtrocityCase(external: NHAAExternalCase, mannikId?: string): AtrocityCase {
    const caseId = mannikId || `CASE-${external.state.substring(0, 2).toUpperCase()}-2026-${Math.floor(100 + Math.random() * 900)}`;

    return {
      id: caseId,
      victimAlias: external.complainantReference || 'Protected Survivor',
      registrationChannel: 'nhaa',
      district: external.district,
      state: external.state,
      incidentType: external.incidentBrief || 'SC/ST PoA Atrocity Complaint via NHAA 14566',
      preferredLanguage: external.preferredLanguage || 'hi',
      assignedCounsellorId: 'usr-counsellor-01',
      assignedCounsellorName: 'Dr. Ananya Sen (Lead Counsellor)',
      assignedCaseworkerId: 'usr-caseworker-01',
      assignedCaseworkerName: 'Rajesh Deshmukh (District Officer)',
      currentDistressScore: 3.5,
      previousDistressScore: 3.5,
      scoreChange: 0.0,
      riskState: 'low',
      trajectory: 'STABLE',
      consecutiveMissedCheckIns: 0,
      lastCheckInDate: external.registrationDate || new Date().toISOString().split('T')[0],
      nextScheduledCheckIn: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      status: 'active_monitoring',
      consentGiven: true,
      historyCheckIns: [],
      recentAssessments: [],
      activeAlerts: [],
      interventions: [],
      isSyntheticDemo: true,
      scoringVersion: '1.0.0',
    };
  }
}
