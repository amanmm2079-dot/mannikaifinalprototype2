import React, { useState, useEffect, useRef } from 'react';
import { 
  MessageSquare, 
  Send, 
  User as UserIcon, 
  Bot, 
  HelpCircle, 
  ShieldCheck, 
  PhoneCall, 
  ArrowRight, 
  CheckCircle2, 
  Clock, 
  AlertCircle,
  Sparkles,
  RefreshCw,
  X
} from 'lucide-react';
import { AtrocityCase, LanguageCode, User } from '../types';
import { SosService } from '../services/sosService';

interface ChatMessage {
  id: string;
  sender: 'assistant' | 'user';
  text: string;
  timestamp: string;
  isActionPrompt?: boolean;
  actionType?: 'request_human_support' | 'open_checkin' | 'view_financial';
  actionConfirmed?: boolean;
}

interface PersonalizedSupportChatbotProps {
  currentUser: User;
  caseItem?: AtrocityCase;
  language: LanguageCode;
  onOpenCheckIn?: () => void;
  onOpenFinancial?: () => void;
  onOpenCaseDetails?: () => void;
  className?: string;
  compactMode?: boolean;
}

export const PersonalizedSupportChatbot: React.FC<PersonalizedSupportChatbotProps> = ({
  currentUser,
  caseItem,
  language,
  onOpenCheckIn,
  onOpenFinancial,
  onOpenCaseDetails,
  className = '',
  compactMode = false,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    // Initial contextual welcome message
    const initialText = caseItem
      ? `Namaste ${currentUser.name.split(' ')[0]}. I am your Mannik AI Support Assistant, personalized for Case ${caseItem.id}. How may I support you today?`
      : `Hello ${currentUser.name}. I am your Mannik AI Support Assistant. How may I assist your work today?`;

    return [
      {
        id: 'msg-init',
        sender: 'assistant',
        text: initialText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ];
  });

  const [inputVal, setInputVal] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [pendingActionConfirmation, setPendingActionConfirmation] = useState<{
    prompt: string;
    action: () => void;
  } | null>(null);
  const [actionDoneMessage, setActionDoneMessage] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping, pendingActionConfirmation]);

  // Contextual personalized answer generator using strictly authorized user context
  const generatePersonalizedResponse = (query: string): {
    text: string;
    actionPrompt?: 'request_human_support' | 'open_checkin' | 'view_financial';
  } => {
    const q = query.toLowerCase();

    // 1. HUMAN SUPPORT / TALK TO HUMAN
    if (q.includes('human') || q.includes('counsellor') || q.includes('talk to') || q.includes('caseworker') || q.includes('madad')) {
      return {
        text: `Your assigned counsellor is ${caseItem?.assignedCounsellorName || 'Dr. Ananya Sen'} (Lead Clinical Counsellor) and your assigned Welfare Officer is ${caseItem?.assignedCaseworkerName || 'Rajesh Deshmukh'}. Would you like me to create an official request for your human support team to contact you directly?`,
        actionPrompt: 'request_human_support',
      };
    }

    // 2. MY CASE / CASE STATUS
    if (q.includes('case') || q.includes('status') || q.includes('karyavahi')) {
      if (!caseItem) {
        return { text: 'You currently have access to administrative dashboards. Specific case details are accessible under the assigned review section.' };
      }
      const statusLabel = caseItem.status === 'active_monitoring' ? 'Active Longitudinal Monitoring' : caseItem.status.replace('_', ' ');
      return {
        text: `Your case (${caseItem.id}) is currently under "${statusLabel}". The district is ${caseItem.district}, ${caseItem.state}. Your assigned support team is actively reviewing your check-in updates. Would you like to view the complete case timeline?`,
      };
    }

    // 3. MY CHECK-INS
    if (q.includes('check-in') || q.includes('checkin') || q.includes('survey') || q.includes('questionnaire') || q.includes('due')) {
      const lastDate = caseItem?.lastCheckInDate ? new Date(caseItem.lastCheckInDate).toLocaleDateString() : 'recently';
      const count = caseItem?.historyCheckIns?.length || 0;
      return {
        text: `You have completed ${count} wellness check-ins so far. Your last check-in was logged on ${lastDate}. Periodic check-ins help your support team understand how your situation is changing over time without requiring frequent travel. Would you like to start a check-in now?`,
        actionPrompt: 'open_checkin',
      };
    }

    // 4. FINANCIAL / RELIEF / DBT COMPENSATION
    if (q.includes('financial') || q.includes('money') || q.includes('relief') || q.includes('compensation') || q.includes('dbt') || q.includes('paisa')) {
      return {
        text: `Under the SC/ST (PoA) Act statutory DBT provisions, your compensation is tracked in 3 stages: Stage 1 (FIR Lodged) has been sanctioned and disbursed (₹1,00,000 credited). Stage 2 (Chargesheet Filed, ₹2,00,000) is currently approved and in banking queue. You can review detailed account disbursal receipts in the Relief section.`,
        actionPrompt: 'view_financial',
      };
    }

    // 5. LEGAL STATUS / COURT / DLSA
    if (q.includes('legal') || q.includes('court') || q.includes('lawyer') || q.includes('advocate') || q.includes('kanoon')) {
      return {
        text: `Under Section 15A of the Atrocity Act, you are entitled to free state-appointed legal defense through the District Legal Services Authority (DLSA). Your legal milestone status indicates the FIR was registered and chargesheet proceedings are scheduled in the Special Atrocity Court. Free witness travel allowances are also statutory rights.`,
      };
    }

    // 6. REHABILITATION & ACCOMMODATION
    if (q.includes('rehab') || q.includes('shelter') || q.includes('house') || q.includes('livelihood')) {
      return {
        text: `Your rehabilitation plan includes eligibility for state social welfare livelihood support and residential security. A nodal welfare officer assists in applying for self-employment grants under the Special Central Assistance (SCA) scheme.`,
      };
    }

    // 7. APPOINTMENTS / FOLLOW-UP
    if (q.includes('appointment') || q.includes('follow') || q.includes('tarikh') || q.includes('next')) {
      const nextDate = caseItem?.nextScheduledCheckIn ? new Date(caseItem.nextScheduledCheckIn).toLocaleDateString() : 'Scheduled by counsellor';
      return {
        text: `Your next scheduled follow-up pulse check-in is set for ${nextDate}. You do not need to wait until then if you experience heightened anxiety or distress — you can complete an unscheduled check-in or request immediate support at any time.`,
      };
    }

    // 8. NOTIFICATIONS
    if (q.includes('notification') || q.includes('alert') || q.includes('update')) {
      const pendingReqs = SosService.getSupportRequests().filter((r) => r.caseId === caseItem?.id);
      return {
        text: `You have ${pendingReqs.length} active support requests. Your assigned counsellor acknowledges check-in updates within 24 hours. Emergency distress alerts are monitored continuously.`,
      };
    }

    // Fallback response with required disclaimer
    return {
      text: `I can help with general information regarding your case, check-in history, legal rights, and relief status. However, I do not make medical diagnoses or legal decisions. A support professional can review your situation personally. Would you like me to connect you with your support team?`,
      actionPrompt: 'request_human_support',
    };
  };

  const handleSend = (textToSend?: string) => {
    const text = (textToSend || inputVal).trim();
    if (!text) return;

    const userMsg: ChatMessage = {
      id: `usr-${Date.now()}`,
      sender: 'user',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputVal('');
    setIsTyping(true);

    setTimeout(() => {
      const response = generatePersonalizedResponse(text);
      const assistantMsg: ChatMessage = {
        id: `ast-${Date.now()}`,
        sender: 'assistant',
        text: response.text,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isActionPrompt: !!response.actionPrompt,
        actionType: response.actionPrompt,
      };

      setMessages((prev) => [...prev, assistantMsg]);
      setIsTyping(false);
    }, 700);
  };

  const handleActionConfirm = (type: 'request_human_support' | 'open_checkin' | 'view_financial') => {
    if (type === 'request_human_support') {
      setPendingActionConfirmation({
        prompt: 'Would you like me to create an official request for your assigned counsellor to contact you?',
        action: () => {
          if (caseItem) {
            SosService.createSupportRequest({
              caseId: caseItem.id,
              userId: currentUser.id,
              userName: currentUser.name,
              type: 'counsellor',
              urgency: 'priority',
              notes: 'Victim requested personal human contact through the Support Assistant Chatbot.',
            });
          }
          setActionDoneMessage('Support request submitted. Your counsellor will reach out via your registered contact.');
          setPendingActionConfirmation(null);
          setMessages((prev) => [
            ...prev,
            {
              id: `sys-${Date.now()}`,
              sender: 'assistant',
              text: 'Your request for human support has been recorded in the caseworker queue. A member of your assigned support team will contact you shortly.',
              timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            },
          ]);
        },
      });
    } else if (type === 'open_checkin') {
      if (onOpenCheckIn) onOpenCheckIn();
    } else if (type === 'view_financial') {
      if (onOpenFinancial) onOpenFinancial();
    }
  };

  const QUICK_ACTIONS = [
    { label: 'My Case', query: 'What is the status of my case?' },
    { label: 'My Check-In', query: 'When is my next check-in due?' },
    { label: 'My Support', query: 'Who is my assigned counsellor?' },
    { label: 'Financial Status', query: 'Tell me about my DBT compensation status' },
    { label: 'Legal Information', query: 'What are my legal rights and court status?' },
    { label: 'Talk to Human', query: 'I want to talk to a human support professional' },
  ];

  return (
    <div
      className={`rounded-2xl bg-white border border-slate-200/90 shadow-xs flex flex-col overflow-hidden text-slate-800 ${className} ${
        compactMode ? 'h-96' : 'h-[500px]'
      }`}
    >
      {/* Chatbot Header */}
      <div className="px-5 py-3.5 bg-gradient-to-r from-teal-900 via-teal-800 to-slate-900 text-white flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-teal-500/20 border border-teal-400/30 flex items-center justify-center text-teal-300">
            <Bot className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-display font-bold text-sm text-white flex items-center gap-1.5">
              <span>Mannik AI Support Assistant</span>
              <span className="w-2 h-2 rounded-full bg-teal-400 animate-pulse" />
            </h3>
            <p className="text-[10px] text-teal-200/80">
              Personalized for your case · Authorized confidential session
            </p>
          </div>
        </div>

        <button
          onClick={() => handleSend('I want to talk to a human support professional')}
          className="px-2.5 py-1 bg-teal-700/80 hover:bg-teal-600 text-teal-100 rounded-lg text-[11px] font-semibold flex items-center gap-1 transition-colors cursor-pointer border border-teal-500/30"
        >
          <PhoneCall className="w-3 h-3 text-teal-300" />
          <span>Talk to Human</span>
        </button>
      </div>

      {/* Confirmation Banner for Critical Actions */}
      {pendingActionConfirmation && (
        <div className="bg-amber-50 p-3.5 border-b border-amber-200 text-xs text-amber-950 flex flex-col gap-2 animate-in slide-in-from-top-2">
          <div className="flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <span className="font-semibold">{pendingActionConfirmation.prompt}</span>
          </div>
          <div className="flex items-center gap-2 self-end">
            <button
              onClick={() => setPendingActionConfirmation(null)}
              className="px-3 py-1 bg-white border border-slate-300 rounded-lg text-slate-700 text-xs hover:bg-slate-100 cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={pendingActionConfirmation.action}
              className="px-3 py-1 bg-teal-800 text-white rounded-lg text-xs font-bold hover:bg-teal-900 cursor-pointer shadow-xs"
            >
              Yes, Request Support
            </button>
          </div>
        </div>
      )}

      {/* Action Done Toast */}
      {actionDoneMessage && (
        <div className="bg-emerald-50 px-4 py-2 border-b border-emerald-200 text-emerald-800 text-xs flex items-center justify-between">
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>{actionDoneMessage}</span>
          </span>
          <button onClick={() => setActionDoneMessage(null)} className="cursor-pointer text-slate-400 hover:text-slate-600">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Quick Action Chips */}
      <div className="px-4 py-2 bg-slate-50 border-b border-slate-200/80 flex items-center gap-1.5 overflow-x-auto no-scrollbar shrink-0">
        <span className="text-[10px] font-bold uppercase text-slate-400 shrink-0">
          Quick Ask:
        </span>
        {QUICK_ACTIONS.map((action, i) => (
          <button
            key={i}
            onClick={() => handleSend(action.query)}
            className="px-2.5 py-1 rounded-full bg-white hover:bg-teal-50 border border-slate-200 hover:border-teal-300 text-slate-700 hover:text-teal-900 text-[11px] font-medium transition-all shrink-0 cursor-pointer shadow-2xs"
          >
            {action.label}
          </button>
        ))}
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 p-4 overflow-y-auto space-y-3.5 text-xs">
        {messages.map((m) => (
          <div
            key={m.id}
            className={`flex items-start gap-2.5 ${m.sender === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
          >
            <div
              className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 text-xs font-bold ${
                m.sender === 'user'
                  ? 'bg-stone-900 text-white'
                  : 'bg-teal-100 text-teal-800 border border-teal-200'
              }`}
            >
              {m.sender === 'user' ? <UserIcon className="w-3.5 h-3.5" /> : <Bot className="w-3.5 h-3.5" />}
            </div>

            <div
              className={`max-w-[82%] rounded-2xl p-3.5 space-y-1.5 leading-relaxed ${
                m.sender === 'user'
                  ? 'bg-teal-800 text-white rounded-tr-none'
                  : 'bg-slate-100/90 text-slate-800 rounded-tl-none border border-slate-200/70'
              }`}
            >
              <p className="whitespace-pre-wrap">{m.text}</p>

              {/* Action buttons if assistant suggested an action */}
              {m.isActionPrompt && m.actionType && (
                <div className="pt-2 flex flex-wrap gap-2 border-t border-slate-200/60">
                  {m.actionType === 'request_human_support' && (
                    <button
                      onClick={() => handleActionConfirm('request_human_support')}
                      className="px-3 py-1 bg-teal-800 hover:bg-teal-900 text-white rounded-lg text-[11px] font-bold flex items-center gap-1 cursor-pointer transition-colors shadow-2xs"
                    >
                      <PhoneCall className="w-3 h-3" />
                      <span>Request Human Support</span>
                    </button>
                  )}
                  {m.actionType === 'open_checkin' && (
                    <button
                      onClick={() => handleActionConfirm('open_checkin')}
                      className="px-3 py-1 bg-teal-800 hover:bg-teal-900 text-white rounded-lg text-[11px] font-bold flex items-center gap-1 cursor-pointer transition-colors shadow-2xs"
                    >
                      <Sparkles className="w-3 h-3" />
                      <span>Start Check-In Now</span>
                    </button>
                  )}
                  {m.actionType === 'view_financial' && (
                    <button
                      onClick={() => handleActionConfirm('view_financial')}
                      className="px-3 py-1 bg-stone-900 hover:bg-stone-800 text-white rounded-lg text-[11px] font-bold flex items-center gap-1 cursor-pointer transition-colors shadow-2xs"
                    >
                      <span>View Full Relief Records</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  )}
                </div>
              )}

              <span
                className={`text-[9px] block text-right ${
                  m.sender === 'user' ? 'text-teal-200' : 'text-slate-400'
                }`}
              >
                {m.timestamp}
              </span>
            </div>
          </div>
        ))}

        {isTyping && (
          <div className="flex items-center gap-2 text-slate-400 text-xs">
            <div className="w-6 h-6 rounded-full bg-teal-50 border border-teal-200 text-teal-700 flex items-center justify-center">
              <Bot className="w-3 h-3" />
            </div>
            <span className="italic flex items-center gap-1">
              <span>Checking authorized case status</span>
              <span className="animate-pulse">...</span>
            </span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input area */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSend();
        }}
        className="p-3 bg-white border-t border-slate-200 flex items-center gap-2 shrink-0"
      >
        <input
          type="text"
          value={inputVal}
          onChange={(e) => setInputVal(e.target.value)}
          placeholder="Ask about your case, check-in, legal rights, or compensation..."
          className="flex-1 px-4 py-2.5 rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-teal-600 text-xs text-slate-800 placeholder:text-slate-400"
        />
        <button
          type="submit"
          disabled={!inputVal.trim() || isTyping}
          className="p-2.5 bg-teal-800 hover:bg-teal-900 text-white rounded-xl transition-colors cursor-pointer disabled:opacity-40"
          aria-label="Send message"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
};
