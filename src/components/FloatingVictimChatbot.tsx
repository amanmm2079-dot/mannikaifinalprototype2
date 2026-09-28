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
  ChevronDown,
  Minimize2,
  Maximize2,
  X,
  Volume2
} from 'lucide-react';
import { AtrocityCase, LanguageCode, User } from '../types';
import { SosService } from '../services/sosService';
import { t } from '../i18n';

interface ChatMessage {
  id: string;
  sender: 'assistant' | 'user';
  text: string;
  timestamp: string;
  isActionPrompt?: boolean;
  actionType?: 'request_human_support' | 'open_checkin' | 'view_financial';
  actionConfirmed?: boolean;
}

interface FloatingVictimChatbotProps {
  currentUser: User;
  caseItem?: AtrocityCase;
  language: LanguageCode;
  onOpenCheckIn?: () => void;
  onOpenFinancial?: () => void;
  onOpenCaseDetails?: () => void;
  isOpen?: boolean;
  onToggleOpen?: (open: boolean) => void;
}

export const FloatingVictimChatbot: React.FC<FloatingVictimChatbotProps> = ({
  currentUser,
  caseItem,
  language,
  onOpenCheckIn,
  onOpenFinancial,
  onOpenCaseDetails,
  isOpen: controlledIsOpen,
  onToggleOpen,
}) => {
  const [internalIsOpen, setInternalIsOpen] = useState(false);
  const isOpen = controlledIsOpen !== undefined ? controlledIsOpen : internalIsOpen;

  const setOpen = (open: boolean) => {
    if (onToggleOpen) {
      onToggleOpen(open);
    } else {
      setInternalIsOpen(open);
    }
  };

  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    const initialText = caseItem
      ? t(language, 'chatbot.welcome', { name: currentUser.name.split(' ')[0], caseId: caseItem.id })
      : t(language, 'chatbot.welcomeGeneric', { name: currentUser.name.split(' ')[0] });

    return [
      {
        id: 'msg-init',
        sender: 'assistant',
        text: initialText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ];
  });

  // Re-seed welcome message when language changes if no further chat has occurred
  useEffect(() => {
    setMessages(prev => {
      if (prev.length === 1 && prev[0].id === 'msg-init') {
        const welcomeText = caseItem
          ? t(language, 'chatbot.welcome', { name: currentUser.name.split(' ')[0], caseId: caseItem.id })
          : t(language, 'chatbot.welcomeGeneric', { name: currentUser.name.split(' ')[0] });
        return [{
          id: 'msg-init',
          sender: 'assistant',
          text: welcomeText,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        }];
      }
      return prev;
    });
  }, [language, caseItem?.id, currentUser.name]);

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
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isTyping, pendingActionConfirmation, isOpen]);

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
    }, 600);
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
    { label: t(language, 'chatbot.quickCase'), query: t(language, 'chatbot.quickCase') },
    { label: t(language, 'chatbot.quickCheckIn'), query: t(language, 'chatbot.quickCheckIn') },
    { label: t(language, 'chatbot.quickSupport'), query: t(language, 'chatbot.quickSupport') },
    { label: t(language, 'chatbot.quickFinancial'), query: t(language, 'chatbot.quickFinancial') },
    { label: t(language, 'chatbot.quickLegal'), query: t(language, 'chatbot.quickLegal') },
    { label: t(language, 'chatbot.quickHuman'), query: t(language, 'chatbot.quickHuman') },
  ];

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col items-end">
      {/* 1. EXPANDED FLOATING CHAT WINDOW */}
      {isOpen && (
        <div className="w-[92vw] sm:w-[420px] h-[550px] max-h-[85vh] bg-white rounded-3xl shadow-2xl border border-stone-200/90 flex flex-col overflow-hidden mb-3 animate-in slide-in-from-bottom-5 duration-200">
          {/* Header */}
          <div className="p-4 bg-linear-to-r from-teal-800 via-teal-700 to-emerald-800 text-white flex items-center justify-between shrink-0 shadow-xs">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-white/15 backdrop-blur-xs flex items-center justify-center text-white border border-white/20">
                <Bot className="w-5 h-5 text-emerald-200" />
              </div>
              <div className="space-y-0.5">
                <div className="flex items-center gap-1.5">
                  <h3 className="font-display font-bold text-sm text-white">
                    {t(language, 'chatbot.title')}
                  </h3>
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                </div>
                <p className="text-[11px] text-teal-100/90">
                  {caseItem ? t(language, 'chatbot.personalizedFor', { caseId: caseItem.id }) : t(language, 'chatbot.companionTitle')}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={() => setOpen(false)}
                className="p-1.5 text-white/80 hover:text-white hover:bg-white/10 rounded-xl transition-colors cursor-pointer"
                title="Minimize Chat"
              >
                <Minimize2 className="w-4 h-4" />
              </button>
              <button
                onClick={() => setOpen(false)}
                className="p-1.5 text-white/80 hover:text-white hover:bg-white/10 rounded-xl transition-colors cursor-pointer"
                title="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Quick Action Navigation Chips */}
          <div className="px-3 py-2 bg-stone-50 border-b border-stone-200/80 flex items-center gap-1.5 overflow-x-auto no-scrollbar shrink-0">
            {QUICK_ACTIONS.map((action, idx) => (
              <button
                key={idx}
                onClick={() => handleSend(action.query)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all whitespace-nowrap shrink-0 cursor-pointer ${
                  action.label === 'Talk to Human'
                    ? 'bg-rose-50 text-rose-800 border border-rose-200 hover:bg-rose-100'
                    : 'bg-white text-stone-700 border border-stone-200 hover:bg-stone-100'
                }`}
              >
                {action.label}
              </button>
            ))}
          </div>

          {/* Messages Body */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3.5 bg-[#FAF9F6] text-xs">
            {messages.map((msg) => {
              const isUser = msg.sender === 'user';
              return (
                <div
                  key={msg.id}
                  className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl p-3 leading-relaxed shadow-2xs ${
                      isUser
                        ? 'bg-teal-700 text-white rounded-br-xs'
                        : 'bg-white text-stone-800 border border-stone-200/80 rounded-bl-xs'
                    }`}
                  >
                    <p className="whitespace-pre-line">{msg.text}</p>

                    {/* Action buttons if prompt */}
                    {msg.isActionPrompt && msg.actionType && (
                      <div className="mt-2.5 pt-2 border-t border-stone-100">
                        {msg.actionType === 'request_human_support' && (
                          <button
                            onClick={() => handleActionConfirm('request_human_support')}
                            className="w-full py-1.5 px-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold text-[11px] flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                          >
                            <PhoneCall className="w-3.5 h-3.5" />
                            <span>{t(language, 'chatbot.confirmConnect')}</span>
                          </button>
                        )}
                        {msg.actionType === 'open_checkin' && (
                          <button
                            onClick={() => handleActionConfirm('open_checkin')}
                            className="w-full py-1.5 px-2.5 bg-teal-800 hover:bg-teal-900 text-white rounded-xl font-bold text-[11px] flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>{t(language, 'chatbot.openCheckInBtn')}</span>
                          </button>
                        )}
                        {msg.actionType === 'view_financial' && (
                          <button
                            onClick={() => handleActionConfirm('view_financial')}
                            className="w-full py-1.5 px-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl font-bold text-[11px] flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                          >
                            <ArrowRight className="w-3.5 h-3.5" />
                            <span>{t(language, 'chatbot.openReliefBtn')}</span>
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                  <span className="text-[10px] text-stone-400 mt-1 px-1">
                    {msg.timestamp}
                  </span>
                </div>
              );
            })}

            {/* Pending Action Confirmation Dialog */}
            {pendingActionConfirmation && (
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-2xl space-y-2 text-stone-800">
                <p className="font-semibold text-xs text-amber-900">
                  {pendingActionConfirmation.prompt}
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => pendingActionConfirmation.action()}
                    className="flex-1 py-1 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-lg text-xs cursor-pointer"
                  >
                    {t(language, 'chatbot.confirmYes')}
                  </button>
                  <button
                    onClick={() => setPendingActionConfirmation(null)}
                    className="px-3 py-1 bg-white hover:bg-stone-100 text-stone-700 border border-stone-200 font-medium rounded-lg text-xs cursor-pointer"
                  >
                    {t(language, 'chatbot.confirmCancel')}
                  </button>
                </div>
              </div>
            )}

            {/* Typing Indicator */}
            {isTyping && (
              <div className="flex items-center gap-1 p-2.5 bg-white border border-stone-200/80 rounded-2xl w-16 shadow-2xs">
                <span className="w-2 h-2 rounded-full bg-teal-600 animate-bounce" />
                <span className="w-2 h-2 rounded-full bg-teal-600 animate-bounce [animation-delay:0.15s]" />
                <span className="w-2 h-2 rounded-full bg-teal-600 animate-bounce [animation-delay:0.3s]" />
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input Footer */}
          <div className="p-3 bg-white border-t border-stone-200 shrink-0">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
              className="flex items-center gap-2"
            >
              <input
                type="text"
                value={inputVal}
                onChange={(e) => setInputVal(e.target.value)}
                placeholder={t(language, 'chatbot.inputPlaceholder')}
                className="flex-1 px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-1 focus:ring-teal-600"
              />
              <button
                type="submit"
                disabled={!inputVal.trim()}
                className="w-10 h-10 rounded-xl bg-teal-800 hover:bg-teal-900 disabled:opacity-40 text-white flex items-center justify-center shrink-0 transition-colors cursor-pointer shadow-xs"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>

            <p className="text-[10px] text-stone-400 text-center mt-2">
              {t(language, 'chatbot.disclaimer')}
            </p>
          </div>
        </div>
      )}

      {/* 2. PERMANENT FLOATING BUTTON IN RIGHT BOTTOM CORNER */}
      <button
        onClick={() => setOpen(!isOpen)}
        className="group px-4 py-3 bg-teal-800 hover:bg-teal-900 text-white rounded-full shadow-xl hover:shadow-2xl transition-all duration-200 flex items-center gap-3 border-2 border-white/80 cursor-pointer active:scale-95"
        title={t(language, 'common.supportAssistant')}
      >
        <div className="relative">
          <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-white">
            <MessageSquare className="w-4 h-4 text-emerald-200" />
          </div>
          <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-teal-800 animate-pulse" />
        </div>

        <div className="text-left hidden sm:block">
          <div className="flex items-center gap-1.5">
            <span className="font-display font-bold text-xs text-white">
              {t(language, 'common.supportAssistant')}
            </span>
            <span className="px-1.5 py-0.2 rounded-full bg-emerald-500/20 text-emerald-200 text-[9px] font-bold">
              {t(language, 'common.onlineBadge')}
            </span>
          </div>
          <span className="text-[10px] text-teal-100 block">
            {t(language, 'common.askAboutCase')}
          </span>
        </div>

        <div className="w-6 h-6 rounded-full bg-white/10 group-hover:bg-white/20 flex items-center justify-center text-white text-xs">
          {isOpen ? <ChevronDown className="w-3.5 h-3.5" /> : <Sparkles className="w-3.5 h-3.5 text-amber-300" />}
        </div>
      </button>
    </div>
  );
};
