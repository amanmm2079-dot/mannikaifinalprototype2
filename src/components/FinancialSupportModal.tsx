import React, { useState, useEffect } from 'react';
import { 
  IndianRupee, 
  CheckCircle2, 
  Clock, 
  FileText, 
  ShieldCheck, 
  AlertTriangle, 
  ArrowRight, 
  X,
  Send,
  Building,
  Calendar,
  Lock
} from 'lucide-react';
import { AtrocityCase, User, UserRole, FinancialCaseRecord, FinancialWorkflowStatus } from '../types';
import { FinancialSupportService, STATUTORY_FINANCIAL_SCHEMES } from '../services/financialSupportService';

interface FinancialSupportModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User;
  caseItem?: AtrocityCase;
}

export const FinancialSupportModal: React.FC<FinancialSupportModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  caseItem,
}) => {
  const [records, setRecords] = useState<FinancialCaseRecord[]>([]);
  const [selectedSchemeId, setSelectedSchemeId] = useState<string>(STATUTORY_FINANCIAL_SCHEMES[0].id);
  const [isApplying, setIsApplying] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>('all');

  useEffect(() => {
    const update = () => {
      if (currentUser.role === 'victim' && caseItem) {
        setRecords(FinancialSupportService.getRecordsForCase(caseItem.id));
      } else if (currentUser.role === 'district_officer') {
        setRecords(FinancialSupportService.getRecordsForDistrict(currentUser.districtId || 'pune'));
      } else if (currentUser.role === 'state_admin') {
        setRecords(FinancialSupportService.getRecordsForState(currentUser.stateId || 'maharashtra'));
      } else {
        setRecords(FinancialSupportService.getRecords());
      }
    };

    update();
    const unsub = FinancialSupportService.subscribe(update);
    return () => unsub();
  }, [currentUser, caseItem]);

  if (!isOpen) return null;

  const canApprove = currentUser.role === 'district_officer' || currentUser.role === 'state_admin' || currentUser.role === 'national_admin';

  const handleApply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!caseItem) return;

    FinancialSupportService.createApplication(
      caseItem.id,
      caseItem.victimAlias,
      selectedSchemeId,
      caseItem.district || 'Pune',
      caseItem.state || 'Maharashtra',
      currentUser.name,
      currentUser.role
    );
    setIsApplying(false);
  };

  const handleAdvanceStatus = (recordId: string, nextStatus: FinancialWorkflowStatus) => {
    FinancialSupportService.updateRecordStatus(
      recordId,
      nextStatus,
      currentUser.name,
      currentUser.role,
      `Official statutory progress transition to ${nextStatus.toUpperCase()}`
    );
  };

  // Aggregated totals
  const totalApproved = records.reduce((sum, r) => sum + r.approvedAmount, 0);
  const totalDisbursed = records.reduce((sum, r) => sum + r.disbursedAmount, 0);
  const totalPending = records.reduce((sum, r) => sum + r.pendingAmount, 0);

  const filteredRecords = records.filter(
    (r) => filterStatus === 'all' || r.status === filterStatus
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-4xl w-full border border-stone-200 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 my-8">
        {/* Header */}
        <div className="bg-stone-900 text-white p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-600/30 border border-emerald-500/40 flex items-center justify-center text-emerald-300">
              <IndianRupee className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-display font-bold text-lg text-white">
                  Statutory Relief &amp; Compensation Support Portal
                </h3>
                <span className="text-[10px] uppercase font-bold tracking-wider text-emerald-300 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-700/60">
                  SC/ST PoA Act Rules
                </span>
              </div>
              <p className="text-xs text-stone-400 mt-0.5">
                Direct Benefit Transfer (DBT) · Multi-Stage Compensation Tracking · Institutional Accountability
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

        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto text-stone-800">
          {/* Top Aggregation Summary */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-2xl bg-white border border-stone-200 shadow-xs">
              <span className="text-[11px] font-semibold text-stone-500 uppercase tracking-wider block">
                Total Relief Sanctioned
              </span>
              <span className="font-mono text-2xl font-bold text-stone-900 block mt-1">
                ₹{totalApproved.toLocaleString('en-IN')}
              </span>
              <span className="text-[11px] text-stone-500 block mt-0.5">Statutory Entitlements</span>
            </div>

            <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200/90 shadow-xs">
              <span className="text-[11px] font-semibold text-emerald-800 uppercase tracking-wider block">
                Disbursed to Bank (DBT)
              </span>
              <span className="font-mono text-2xl font-bold text-emerald-900 block mt-1">
                ₹{totalDisbursed.toLocaleString('en-IN')}
              </span>
              <span className="text-[11px] text-emerald-700 block mt-0.5">Direct Account Credit</span>
            </div>

            <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200/90 shadow-xs">
              <span className="text-[11px] font-semibold text-amber-800 uppercase tracking-wider block">
                Pending Verification/Release
              </span>
              <span className="font-mono text-2xl font-bold text-amber-900 block mt-1">
                ₹{totalPending.toLocaleString('en-IN')}
              </span>
              <span className="text-[11px] text-amber-700 block mt-0.5">In Official Pipeline</span>
            </div>
          </div>

          {/* Action Row */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-200 pb-4">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-stone-600">Filter Status:</span>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-2.5 py-1.5 rounded-xl border border-stone-200 text-xs text-stone-800 bg-white"
              >
                <option value="all">All Records ({records.length})</option>
                <option value="application_submitted">Application Submitted</option>
                <option value="document_verification">Document Verification</option>
                <option value="authorized_approval">Authorized Approval</option>
                <option value="sanctioned">Sanctioned</option>
                <option value="disbursed">Disbursed (DBT)</option>
              </select>
            </div>

            {/* Application Button for Victim/Officer */}
            {caseItem && (
              <button
                onClick={() => setIsApplying(!isApplying)}
                className="px-4 py-2 bg-teal-700 hover:bg-teal-800 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Initiate Relief Grant Application</span>
              </button>
            )}
          </div>

          {/* New Application Form if Open */}
          {isApplying && caseItem && (
            <form onSubmit={handleApply} className="p-5 rounded-2xl bg-stone-50 border border-stone-200 space-y-4">
              <h4 className="font-display font-bold text-sm text-stone-900">
                Initiate Relief Claim for Case {caseItem.id} ({caseItem.victimAlias})
              </h4>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-stone-700 block">Select Statutory Scheme / Rule:</label>
                <select
                  value={selectedSchemeId}
                  onChange={(e) => setSelectedSchemeId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-stone-200 text-xs bg-white text-stone-900 focus:outline-none focus:ring-1 focus:ring-teal-700"
                >
                  {STATUTORY_FINANCIAL_SCHEMES.map((scheme) => (
                    <option key={scheme.id} value={scheme.id}>
                      {scheme.name} - ₹{scheme.standardAmount.toLocaleString('en-IN')} ({scheme.legalProvision})
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsApplying(false)}
                  className="px-3.5 py-1.5 rounded-xl border border-stone-200 text-xs font-semibold text-stone-600 hover:bg-stone-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-xl bg-teal-700 text-white text-xs font-semibold hover:bg-teal-800"
                >
                  Submit Application
                </button>
              </div>
            </form>
          )}

          {/* Records List */}
          <div className="space-y-4">
            {filteredRecords.length === 0 ? (
              <div className="text-center py-8 text-stone-400 text-xs">
                No financial assistance records found matching filter.
              </div>
            ) : (
              filteredRecords.map((record) => (
                <div
                  key={record.id}
                  className="p-5 rounded-2xl bg-white border border-stone-200 shadow-2xs space-y-3"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-stone-100 pb-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-stone-900">{record.id}</span>
                        <span className="text-xs text-stone-500">· Case {record.caseId} ({record.victimAlias})</span>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-stone-100 text-stone-700">
                          {record.districtId.toUpperCase()}, {record.stateId.toUpperCase()}
                        </span>
                      </div>
                      <h4 className="font-display font-bold text-sm text-stone-900 mt-1">
                        {record.schemeName}
                      </h4>
                      <p className="text-[11px] text-stone-500">{record.provisionReference}</p>
                    </div>

                    <div className="text-right">
                      <span className="font-mono text-base font-bold text-stone-900 block">
                        ₹{record.approvedAmount.toLocaleString('en-IN')}
                      </span>
                      <span className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full inline-block mt-0.5 ${
                        record.status === 'disbursed' ? 'bg-emerald-100 text-emerald-800' :
                        record.status === 'sanctioned' ? 'bg-teal-100 text-teal-800' :
                        record.status === 'authorized_approval' ? 'bg-indigo-100 text-indigo-800' :
                        'bg-amber-100 text-amber-800'
                      }`}>
                        {record.status.replace(/_/g, ' ')}
                      </span>
                    </div>
                  </div>

                  {/* Details Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs text-stone-600 bg-stone-50 p-3 rounded-xl">
                    <div>
                      <span className="text-[10px] text-stone-400 block uppercase">Responsible Authority</span>
                      <span className="font-semibold text-stone-800">{record.responsibleAuthority}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-stone-400 block uppercase">Disbursement Status</span>
                      <span className="font-semibold text-stone-800">
                        {record.disbursedAmount > 0 ? `₹${record.disbursedAmount.toLocaleString('en-IN')} Disbursed` : 'Pending Disbursement'}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-stone-400 block uppercase">Payment Reference / UTR</span>
                      <span className="font-mono text-stone-800 text-[11px]">{record.paymentReference || 'Pending PFMS Generation'}</span>
                    </div>
                  </div>

                  {/* Required Documents Checklist */}
                  <div className="space-y-1">
                    <span className="text-[11px] font-semibold text-stone-500 uppercase tracking-wider block">
                      Required Statutory Verifications:
                    </span>
                    <div className="flex flex-wrap gap-2 text-xs">
                      {record.requiredDocuments.map((docName, idx) => (
                        <span
                          key={idx}
                          className="px-2.5 py-1 rounded-lg bg-stone-100 text-stone-700 text-[11px] flex items-center gap-1.5"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          <span>{docName}</span>
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Officer Approval Actions */}
                  {canApprove && record.status !== 'disbursed' && (
                    <div className="flex items-center justify-between pt-2 border-t border-stone-100">
                      <span className="text-[11px] text-stone-500 italic">
                        Official Action Required under DPDP and PoA Rules
                      </span>
                      <div className="flex items-center gap-2">
                        {record.status === 'application_submitted' && (
                          <button
                            onClick={() => handleAdvanceStatus(record.id, 'document_verification')}
                            className="px-3 py-1 bg-stone-800 text-white rounded-lg text-xs font-semibold hover:bg-stone-900 cursor-pointer"
                          >
                            Verify Documents
                          </button>
                        )}
                        {record.status === 'document_verification' && (
                          <button
                            onClick={() => handleAdvanceStatus(record.id, 'authorized_approval')}
                            className="px-3 py-1 bg-indigo-700 text-white rounded-lg text-xs font-semibold hover:bg-indigo-800 cursor-pointer"
                          >
                            Authorize Official Approval
                          </button>
                        )}
                        {record.status === 'authorized_approval' && (
                          <button
                            onClick={() => handleAdvanceStatus(record.id, 'sanctioned')}
                            className="px-3 py-1 bg-teal-700 text-white rounded-lg text-xs font-semibold hover:bg-teal-800 cursor-pointer"
                          >
                            Sanction Relief Grant
                          </button>
                        )}
                        {record.status === 'sanctioned' && (
                          <button
                            onClick={() => handleAdvanceStatus(record.id, 'disbursed')}
                            className="px-3 py-1 bg-emerald-700 text-white rounded-lg text-xs font-semibold hover:bg-emerald-800 cursor-pointer"
                          >
                            Confirm DBT Electronic Credit
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
