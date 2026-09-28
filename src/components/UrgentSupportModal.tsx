import React, { useState } from 'react';
import { 
  X, 
  AlertTriangle, 
  PhoneCall, 
  ShieldAlert, 
  CheckCircle2, 
  Clock, 
  MapPin, 
  ShieldCheck, 
  AlertOctagon,
  ArrowRight,
  RotateCcw
} from 'lucide-react';
import { AtrocityCase, User } from '../types';
import { SOSAlertRecord } from '../types/questionnaire';
import { SosService } from '../services/sosService';

interface UrgentSupportModalProps {
  isOpen: boolean;
  onClose: () => void;
  caseItem: AtrocityCase;
  currentUser: User;
  onAlertCreated?: (record: SOSAlertRecord) => void;
}

export const UrgentSupportModal: React.FC<UrgentSupportModalProps> = ({
  isOpen,
  onClose,
  caseItem,
  currentUser,
  onAlertCreated,
}) => {
  const [stage, setStage] = useState<'confirm' | 'sent'>('confirm');
  const [isProcessing, setIsProcessing] = useState(false);
  const [activeSos, setActiveSos] = useState<SOSAlertRecord | null>(null);
  const [isResolving, setIsResolving] = useState(false);

  if (!isOpen) return null;

  const handleConfirmSos = () => {
    setIsProcessing(true);

    // Attempt browser geolocation or fallback to district centroid
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          triggerRecord(pos.coords.latitude, pos.coords.longitude, 'browser_gps');
        },
        () => {
          triggerRecord(undefined, undefined, 'approximate_district');
        },
        { timeout: 3000 }
      );
    } else {
      triggerRecord(undefined, undefined, 'approximate_district');
    }
  };

  const triggerRecord = (
    lat?: number,
    lon?: number,
    locStatus: 'approximate_district' | 'browser_gps' | 'sandbox_demo' = 'approximate_district'
  ) => {
    const record = SosService.triggerSosAlert({
      caseId: caseItem.id,
      userId: currentUser.id,
      userAlias: caseItem.victimAlias,
      district: caseItem.district,
      state: caseItem.state,
      latitude: lat,
      longitude: lon,
      locationStatus: locStatus,
      notes: 'Urgent SOS button activated from survivor care portal.',
    });

    setActiveSos(record);
    setIsProcessing(false);
    setStage('sent');
    if (onAlertCreated) onAlertCreated(record);
  };

  const handleCancelSos = () => {
    if (!activeSos) return;
    setIsResolving(true);
    SosService.updateSosStatus(activeSos.sosId, 'CANCELLED', 'Cancelled by user safely from portal.');
    setTimeout(() => {
      setIsResolving(false);
      onClose();
    }, 400);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/70 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-rose-200 overflow-hidden my-4">
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-rose-900 via-rose-800 to-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-rose-500/20 border border-rose-400/40 flex items-center justify-center text-rose-300">
              <ShieldAlert className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-display font-bold text-base text-white">
                Urgent Support Request
              </h2>
              <p className="text-[11px] text-rose-200/80">
                24x7 Emergency Human Protection &amp; Immediate Triage
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-white/10 text-white/80 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5 text-slate-800">
          {stage === 'confirm' ? (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-xs text-rose-950 space-y-2">
                <div className="flex items-center gap-2 font-bold text-sm text-rose-900">
                  <AlertOctagon className="w-4 h-4 text-rose-700" />
                  <span>Are you in immediate physical or psychological distress?</span>
                </div>
                <p className="leading-relaxed">
                  Activating this request will immediately dispatch an alert to your assigned welfare officer (<strong>{caseItem.assignedCaseworkerName}</strong>) and route an emergency notification to the nearest designated nodal protection cell.
                </p>
              </div>

              {/* What will happen steps */}
              <div className="space-y-2 text-xs">
                <span className="font-bold text-slate-900 block">What will happen next:</span>
                <div className="space-y-2 text-slate-600">
                  <div className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-teal-100 text-teal-800 font-bold flex items-center justify-center text-[10px] shrink-0 mt-0.5">
                      1
                    </span>
                    <span>An urgent alert record will be logged with cryptographic audit protection.</span>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-teal-100 text-teal-800 font-bold flex items-center justify-center text-[10px] shrink-0 mt-0.5">
                      2
                    </span>
                    <span>The nearest authorized support point will be notified for intervention.</span>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-teal-100 text-teal-800 font-bold flex items-center justify-center text-[10px] shrink-0 mt-0.5">
                      3
                    </span>
                    <span>You can immediately call the 24x7 statutory helpline (181 / 112) for direct voice assistance.</span>
                  </div>
                </div>
              </div>

              {/* Demo Mode Notice */}
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-[11px] text-slate-500 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-teal-600 shrink-0" />
                <span>
                  Demo Mode: Alerts route to sandbox nodal response units without false police dispatch.
                </span>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2.5 bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 rounded-xl text-xs font-semibold cursor-pointer"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={handleConfirmSos}
                  disabled={isProcessing}
                  className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md disabled:opacity-50"
                >
                  {isProcessing ? (
                    <span>Routing to Nearest Responder...</span>
                  ) : (
                    <>
                      <PhoneCall className="w-4 h-4" />
                      <span>Confirm Urgent SOS Request</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          ) : (
            /* STAGE 2: SENT CONFIRMATION */
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-950 space-y-1.5 text-center">
                <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto mb-2">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <h3 className="font-display font-bold text-base text-emerald-950">
                  Your urgent support request has been sent.
                </h3>
                <p className="text-emerald-800 text-[11px] leading-relaxed max-w-sm mx-auto">
                  The alert is actively queued with high priority in the caseworker review queue and routed to the nodal protection desk.
                </p>
              </div>

              {/* Details Card */}
              {activeSos && (
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-2 text-xs">
                  <div className="flex justify-between items-center pb-2 border-b border-slate-200">
                    <span className="text-slate-500">Alert Reference ID:</span>
                    <span className="font-mono font-bold text-rose-700">{activeSos.sosId}</span>
                  </div>
                  <div className="flex justify-between items-center pb-2 border-b border-slate-200">
                    <span className="text-slate-500">Timestamp:</span>
                    <span className="font-mono text-slate-800">
                      {new Date(activeSos.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                    </span>
                  </div>
                  <div className="flex justify-between items-center pb-2 border-b border-slate-200">
                    <span className="text-slate-500">Current Status:</span>
                    <span className="font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200 uppercase text-[10px]">
                      {activeSos.alertStatus}
                    </span>
                  </div>
                  <div className="flex justify-between items-start pb-2 border-b border-slate-200">
                    <span className="text-slate-500">Assigned Support Point:</span>
                    <span className="font-semibold text-slate-900 text-right max-w-[200px]">
                      {activeSos.responderName}
                      <span className="block text-[10px] text-teal-700 font-normal">
                        Nearest Authorized Support Point (Demo · ~{activeSos.responderDistanceKm || 4.2} km)
                      </span>
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500">Audit Checksum:</span>
                    <span className="font-mono text-slate-400 text-[10px]">{activeSos.auditReference}</span>
                  </div>
                </div>
              )}

              {/* Direct Voice Helpline Contact */}
              <div className="p-4 rounded-2xl bg-rose-600 text-white flex items-center justify-between gap-3 shadow-md">
                <div className="space-y-0.5">
                  <span className="text-xs font-bold block">Need direct voice contact right now?</span>
                  <span className="text-[11px] text-rose-100">National 24x7 Helpline (Toll-Free 181 / 112)</span>
                </div>
                <a
                  href="tel:181"
                  className="px-4 py-2 bg-white text-rose-700 hover:bg-rose-50 rounded-xl font-bold text-xs flex items-center gap-1.5 shrink-0 cursor-pointer shadow-xs"
                >
                  <PhoneCall className="w-3.5 h-3.5 fill-current" />
                  <span>Call 181</span>
                </a>
              </div>

              {/* Cancel / Resolve where safe */}
              <div className="flex items-center justify-between pt-2">
                <button
                  type="button"
                  onClick={handleCancelSos}
                  disabled={isResolving}
                  className="text-xs font-semibold text-slate-500 hover:text-slate-700 flex items-center gap-1 cursor-pointer"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Cancel / Mark Safe</span>
                </button>

                <button
                  type="button"
                  onClick={onClose}
                  className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold cursor-pointer"
                >
                  Close Window
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
