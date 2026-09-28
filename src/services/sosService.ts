import { SOSAlertRecord, SupportRequest } from '../types';
import { AppStore } from './storage';

export interface SupportPointLocation {
  id: string;
  name: string;
  department: string;
  district: string;
  state: string;
  phone: string;
  latitude: number;
  longitude: number;
  isDesignatedAtrocityNodalPoint: boolean;
  operatingHours: string;
}

// Authorized emergency support points (Demo Registry)
export const AUTHORIZED_SUPPORT_POINTS: SupportPointLocation[] = [
  {
    id: 'NODE-PUNE-SP-01',
    name: 'District Special Cell (SC/ST PoA) - SP Office',
    department: 'Maharashtra State Police / District Welfare Office',
    district: 'Pune',
    state: 'Maharashtra',
    phone: '020-25651234 / Toll-Free 181',
    latitude: 18.5204,
    longitude: 73.8567,
    isDesignatedAtrocityNodalPoint: true,
    operatingHours: '24x7 Dedicated Nodal Desk',
  },
  {
    id: 'NODE-PUNE-DMHP-02',
    name: 'District Mental Health Programme (DMHP) Trauma Cell',
    department: 'Aundh Civil Hospital & Social Welfare',
    district: 'Pune',
    state: 'Maharashtra',
    phone: '020-27278900',
    latitude: 18.5789,
    longitude: 73.8078,
    isDesignatedAtrocityNodalPoint: true,
    operatingHours: '24x7 Emergency Crisis Line',
  },
  {
    id: 'NODE-MUMBAI-CR-01',
    name: 'State Social Justice Directorate Emergency Cell',
    department: 'Department of Social Justice & Special Assistance',
    district: 'Mumbai',
    state: 'Maharashtra',
    phone: '022-22024567 / 112',
    latitude: 18.9220,
    longitude: 72.8347,
    isDesignatedAtrocityNodalPoint: true,
    operatingHours: '24x7 State Operations Centre',
  },
  {
    id: 'NODE-NAGPUR-01',
    name: 'Vidarbha Division Protection Cell',
    department: 'Divisional Commissionerate SC/ST Protection',
    district: 'Nagpur',
    state: 'Maharashtra',
    phone: '0712-2567890',
    latitude: 21.1458,
    longitude: 79.0882,
    isDesignatedAtrocityNodalPoint: true,
    operatingHours: '24x7 Emergency Support Desk',
  },
];

/**
 * Calculates Great-Circle distance between two points in km (Haversine formula)
 */
export function calculateHaversineDistanceKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Number((R * c).toFixed(1));
}

/**
 * Finds the nearest authorized support point
 */
export function findNearestSupportPoint(
  lat?: number,
  lon?: number,
  districtHint?: string
): { point: SupportPointLocation; distanceKm: number } {
  // If coordinates provided, compute distance to all registered points
  if (typeof lat === 'number' && typeof lon === 'number') {
    let nearest = AUTHORIZED_SUPPORT_POINTS[0];
    let minDistance = Infinity;

    for (const point of AUTHORIZED_SUPPORT_POINTS) {
      const dist = calculateHaversineDistanceKm(lat, lon, point.latitude, point.longitude);
      if (dist < minDistance) {
        minDistance = dist;
        nearest = point;
      }
    }
    return { point: nearest, distanceKm: minDistance };
  }

  // Fallback by district hint
  const matched = AUTHORIZED_SUPPORT_POINTS.find(
    (p) => p.district.toLowerCase() === (districtHint || '').toLowerCase()
  );
  if (matched) {
    return { point: matched, distanceKm: 4.2 }; // Approximate urban radius
  }

  return { point: AUTHORIZED_SUPPORT_POINTS[0], distanceKm: 5.0 };
}

const SOS_STORAGE_KEY = 'mannik_sos_alerts_v2';
const SUPPORT_REQUESTS_KEY = 'mannik_support_requests_v2';

// In-memory fallback for testing / SSR environments
let inMemorySosAlerts: SOSAlertRecord[] = [];
let inMemorySupportRequests: SupportRequest[] = [];

export class SosService {
  /**
   * Triggers an urgent SOS alert with location-aware routing
   */
  static triggerSosAlert(params: {
    caseId: string;
    userId: string;
    userAlias: string;
    district: string;
    state: string;
    latitude?: number;
    longitude?: number;
    locationStatus: 'approximate_district' | 'browser_gps' | 'sandbox_demo';
    notes?: string;
  }): SOSAlertRecord {
    const { point, distanceKm } = findNearestSupportPoint(
      params.latitude,
      params.longitude,
      params.district
    );

    const sosId = `SOS-${Date.now().toString().slice(-6)}`;
    const timestamp = new Date().toISOString();
    const auditReference = `AUD-SOS-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

    const record: SOSAlertRecord = {
      sosId,
      caseId: params.caseId,
      userId: params.userId,
      userAlias: params.userAlias,
      timestamp,
      locationStatus: params.locationStatus,
      latitude: params.latitude,
      longitude: params.longitude,
      district: params.district,
      state: params.state,
      responderId: point.id,
      responderName: point.name,
      responderDistanceKm: distanceKm,
      alertStatus: 'SENT',
      source: 'web_sos_button',
      auditReference,
      notes: params.notes,
    };

    // Save to storage
    this.saveSosAlert(record);

    // Push into AppStore activeAlerts for case
    const cases = AppStore.getCases();
    const caseItem = cases.find((c) => c.id === params.caseId);
    if (caseItem) {
      caseItem.activeAlerts.unshift({
        id: `ALT-SOS-${sosId}`,
        caseId: params.caseId,
        victimAlias: params.userAlias,
        district: params.district,
        state: params.state,
        priority: 'urgent',
        status: 'new',
        currentDistressScore: 9.8,
        previousScore: caseItem.currentDistressScore,
        trajectory: 'acute_spike',
        reason: 'CRITICAL EMERGENCY: Survivor Activated Direct SOS Support Button',
        triggeringFactors: [
          'Direct SOS button triggered by survivor',
          `Routed to: ${point.name} (${distanceKm} km)`,
          'Immediate welfare officer & protection unit dispatch required',
        ],
        assignedCounsellorId: caseItem.assignedCounsellorId,
        assignedCaseworkerId: caseItem.assignedCaseworkerId,
        createdAt: timestamp,
      });
      caseItem.status = 'intervention_active';
      AppStore.saveCases(cases);
    }

    // Log tamper-evident audit record
    AppStore.logAudit({
      actorId: params.userId,
      actorName: params.userAlias,
      actorRole: 'victim',
      action: 'EMERGENCY_SOS_TRIGGERED',
      resourceType: 'alert',
      resourceId: sosId,
      details: `Urgent SOS activated. Routed to ${point.name} (Demo Support Point, ~${distanceKm}km). Audit ref: ${auditReference}`,
    });

    return record;
  }

  static getSosAlerts(): SOSAlertRecord[] {
    if (typeof window === 'undefined') return inMemorySosAlerts;
    const saved = localStorage.getItem(SOS_STORAGE_KEY);
    return saved ? JSON.parse(saved) : inMemorySosAlerts;
  }

  static saveSosAlert(alert: SOSAlertRecord) {
    inMemorySosAlerts.unshift(alert);
    if (typeof window !== 'undefined') {
      localStorage.setItem(SOS_STORAGE_KEY, JSON.stringify(inMemorySosAlerts.slice(0, 50)));
    }
  }

  static updateSosStatus(
    sosId: string,
    status: SOSAlertRecord['alertStatus'],
    notes?: string
  ): SOSAlertRecord | null {
    const list = this.getSosAlerts();
    const item = list.find((a) => a.sosId === sosId);
    if (!item) return null;

    item.alertStatus = status;
    if (status === 'ACKNOWLEDGED') item.acknowledgedAt = new Date().toISOString();
    if (status === 'RESPONSE_IN_PROGRESS') item.responseStartedAt = new Date().toISOString();
    if (status === 'RESOLVED' || status === 'CANCELLED') item.resolvedAt = new Date().toISOString();
    if (notes) item.notes = notes;

    if (typeof window !== 'undefined') {
      localStorage.setItem(SOS_STORAGE_KEY, JSON.stringify(list));
    }

    AppStore.logAudit({
      actorId: 'usr-counsellor-01',
      actorName: 'Emergency Response Desk',
      actorRole: 'counsellor',
      action: 'SOS_STATUS_UPDATED',
      resourceType: 'alert',
      resourceId: sosId,
      details: `SOS ${sosId} transitioned to ${status}. Notes: ${notes || 'None'}`,
    });

    return item;
  }

  // --- Human Support Requests ---
  static createSupportRequest(req: Omit<SupportRequest, 'id' | 'createdAt' | 'status'>): SupportRequest {
    const id = `REQ-${Date.now().toString().slice(-6)}`;
    const fullReq: SupportRequest = {
      ...req,
      id,
      status: 'pending',
      createdAt: new Date().toISOString(),
    };

    inMemorySupportRequests.unshift(fullReq);
    if (typeof window !== 'undefined') {
      localStorage.setItem(SUPPORT_REQUESTS_KEY, JSON.stringify(inMemorySupportRequests.slice(0, 50)));
    }

    // Also notify caseworker via audit
    AppStore.logAudit({
      actorId: req.userId,
      actorName: req.userName,
      actorRole: 'victim',
      action: 'HUMAN_SUPPORT_REQUESTED',
      resourceType: 'case',
      resourceId: req.caseId,
      details: `Victim created request for ${req.type} support (${req.urgency} priority). Notes: ${req.notes || 'None'}`,
    });

    return fullReq;
  }

  static getSupportRequests(): SupportRequest[] {
    if (typeof window === 'undefined') return inMemorySupportRequests;
    const saved = localStorage.getItem(SUPPORT_REQUESTS_KEY);
    return saved ? JSON.parse(saved) : inMemorySupportRequests;
  }

  static updateSupportRequestStatus(
    id: string,
    status: SupportRequest['status'],
    assignedTo?: string
  ): SupportRequest | null {
    const list = this.getSupportRequests();
    const req = list.find((r) => r.id === id);
    if (!req) return null;

    req.status = status;
    if (status === 'acknowledged') req.acknowledgedAt = new Date().toISOString();
    if (status === 'resolved') req.resolvedAt = new Date().toISOString();
    if (assignedTo) req.assignedTo = assignedTo;

    if (typeof window !== 'undefined') {
      localStorage.setItem(SUPPORT_REQUESTS_KEY, JSON.stringify(list));
    }
    return req;
  }
}
