import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/db/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { X, Send, Minimize2, Maximize2, CalendarDays, Rocket, LayoutGrid, Briefcase, Phone, Users, Mic } from 'lucide-react';
import BookConsultationModal from '@/components/modals/BookConsultationModal';
import ProjectEnquiryModal from '@/components/modals/ProjectEnquiryModal';

// ─── Robot Avatar SVG ─────────────────────────────────────────────────────────
function RobotAvatar({ size = 28, className = '' }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none" className={className}>
      {/* Head */}
      <rect x="12" y="14" width="40" height="28" rx="8" fill="rgba(255,255,255,0.25)" stroke="rgba(255,255,255,0.6)" strokeWidth="1.5" />
      {/* Eyes */}
      <circle cx="23" cy="26" r="5" fill="rgba(255,255,255,0.9)" />
      <circle cx="41" cy="26" r="5" fill="rgba(255,255,255,0.9)" />
      <circle cx="24" cy="27" r="2.5" fill="#FF6B00" />
      <circle cx="42" cy="27" r="2.5" fill="#FF6B00" />
      <circle cx="25" cy="26" r="1" fill="white" />
      <circle cx="43" cy="26" r="1" fill="white" />
      {/* Mouth */}
      <rect x="20" y="34" width="24" height="3" rx="1.5" fill="rgba(255,255,255,0.5)" />
      <rect x="24" y="34" width="4" height="3" rx="1" fill="rgba(255,255,255,0.9)" />
      <rect x="30" y="34" width="4" height="3" rx="1" fill="rgba(255,255,255,0.9)" />
      <rect x="36" y="34" width="4" height="3" rx="1" fill="rgba(255,255,255,0.9)" />
      {/* Antenna */}
      <line x1="32" y1="14" x2="32" y2="7" stroke="rgba(255,255,255,0.7)" strokeWidth="2" strokeLinecap="round" />
      <circle cx="32" cy="5" r="3" fill="#FF6B00" />
      {/* Ear sensors */}
      <rect x="6" y="22" width="6" height="10" rx="3" fill="rgba(255,255,255,0.3)" />
      <rect x="52" y="22" width="6" height="10" rx="3" fill="rgba(255,255,255,0.3)" />
      {/* Body */}
      <rect x="16" y="44" width="32" height="14" rx="6" fill="rgba(255,255,255,0.15)" stroke="rgba(255,255,255,0.4)" strokeWidth="1.5" />
      <circle cx="24" cy="51" r="3" fill="rgba(255,255,255,0.5)" />
      <circle cx="32" cy="51" r="3" fill="#FF6B00" fillOpacity="0.8" />
      <circle cx="40" cy="51" r="3" fill="rgba(255,255,255,0.5)" />
    </svg>
  );
}

// ── Scripted AI responses ────────────────────────────────────────────────────

interface BotResponse {
  text: string;
  quickReplies?: string[];
}

function getBotResponse(input: string): BotResponse {
  const msg = input.toLowerCase();

  if (/hello|hi|hey|good morning|good evening/.test(msg)) return {
    text: "Hello! 👋 Welcome to CoreStack Technology. I'm your AI assistant. How can I help you today? I can answer questions about our services, guide you through our portfolio, help with job applications, or connect you with our team.",
    quickReplies: ['Services', 'Portfolio', 'Book Consultation', 'Careers'],
  };

  if (/service|what do you do|what can you build|offer|provide/.test(msg)) return {
    text: "CoreStack Technology offers 8 core service disciplines:\n\n🔷 **Custom Software Development** — Tailor-made web & desktop applications\n📱 **Mobile App Development** — iOS, Android & cross-platform\n☁️ **Cloud & DevOps** — AWS, Azure, GCP, CI/CD pipelines\n🤖 **AI & Machine Learning** — Predictive analytics, NLP, computer vision\n🏢 **ERP / CRM Solutions** — Enterprise systems & workflow automation\n🔒 **Cybersecurity** — Zero-trust architecture & compliance\n🎨 **UI/UX Design** — Research-driven design systems\n🚀 **Digital Transformation** — End-to-end modernization\n\nWould you like to book a free consultation to discuss your specific needs?",
    quickReplies: ['Book Consultation', 'Start a Project', 'Pricing', 'Portfolio'],
  };

  if (/end.to.end|technology service|full.cycle|full cycle/.test(msg)) return {
    text: "Our End-to-End Technology Services cover the complete software lifecycle — from discovery & strategy through architecture, agile development, QA, deployment, and ongoing optimization.\n\nKey highlights:\n✅ Average 12-week MVP delivery\n✅ 2-week agile sprints with demos\n✅ 99.9% SLA uptime guarantee\n✅ Dedicated project manager\n\nVisit our End-to-End Services page for detailed charts, workflow diagrams, and feature comparisons.",
    quickReplies: ['Book Consultation', 'Start a Project', 'View Portfolio'],
  };

  if (/price|pricing|cost|how much|budget|rate/.test(msg)) return {
    text: "Our pricing is tailored to each project's scope and complexity. Here's a general guide:\n\n💰 **Basic Projects** — Starting from ₹8,30,000\n💼 **Mid-Market** — ₹20,75,000–₹83,00,000\n🏢 **Enterprise** — ₹83,00,000–₹4,15,00,000+\n\nFactors that affect pricing include timeline, team size, technology stack, and ongoing maintenance requirements.\n\n📅 **Book a free consultation** to get a precise, no-obligation proposal tailored to your exact requirements.",
    quickReplies: ['Book Consultation', 'Start a Project', 'Contact Sales'],
  };

  if (/portfolio|case stud|project|work|client|example/.test(msg)) return {
    text: "We've delivered 500+ projects across diverse industries! Notable examples include:\n\n🏦 **FinEdge Banking Platform** — Real-time payments for 2M+ users\n🏥 **HealthSync AI Diagnostics** — 94% diagnostic accuracy improvement\n🚚 **LogiFlow Supply Chain** — 40% reduction in delivery times\n📚 **EduTech LMS** — 300K+ students on one platform\n\nVisit our Portfolio page to explore all case studies with detailed results and technology stacks.",
    quickReplies: ['Start a Project', 'Book Consultation'],
  };

  if (/ai|machine learning|ml|nlp|computer vision|artificial intelligence/.test(msg)) return {
    text: "Our AI & Machine Learning division specializes in:\n\n🧠 **Predictive Analytics** — Forecast demand, churn, fraud\n💬 **NLP & Chatbots** — Intelligent conversational systems\n👁️ **Computer Vision** — Image recognition & quality control\n🔄 **LLM Integration** — GPT, Gemini & custom model deployment\n📊 **MLOps** — Model training, deployment & monitoring pipelines\n\nWe've deployed AI in production for healthcare, fintech, logistics and retail clients. Ready to explore AI for your business?",
    quickReplies: ['Book Consultation', 'Start a Project'],
  };

  if (/cloud|aws|azure|gcp|devops|kubernetes|docker/.test(msg)) return {
    text: "Our Cloud & DevOps practice covers the full spectrum:\n\n☁️ **Multi-cloud architecture** — AWS, Azure, Google Cloud\n🔄 **CI/CD Pipelines** — GitHub Actions, Jenkins, ArgoCD\n🐳 **Containerization** — Docker & Kubernetes orchestration\n📈 **Auto-scaling** — Handle 10x traffic spikes seamlessly\n🔒 **Cloud Security** — Zero-trust, IAM, compliance frameworks\n📉 **Cost Optimization** — Average 35% infrastructure savings\n\nBook a free cloud assessment to see how we can optimize your infrastructure.",
    quickReplies: ['Book Consultation', 'Start a Project'],
  };

  if (/consult|meeting|book|schedule|call|talk|speak/.test(msg)) return {
    text: "Great! I'll open the consultation booking form for you.\n\nIn the form you can specify:\n• Your preferred meeting date & time\n• Online or offline meeting preference\n• Your project budget and timeline\n• Service requirements\n\nOur team confirms bookings within **2 business hours**. 📅",
    action: 'open-consultation',
    quickReplies: ['Start a Project', 'Contact Support'],
  } as BotResponse & { action: string };

  if (/project|start|build|create|develop|enquiry|enq/.test(msg)) return {
    text: "Excellent! Let's kick off your project. 🚀\n\nI'll open our Project Enquiry form where you can detail:\n• Project type & industry\n• Required technologies\n• Budget & timeline\n• Key features needed\n\nYou'll receive a unique **Project ID** and our team will respond with a tailored proposal within **24 hours**.",
    action: 'open-project',
    quickReplies: ['Book Consultation', 'Contact Support'],
  } as BotResponse & { action: string };

  if (/job|career|work at|position|vacancy|hiring|employ/.test(msg)) return {
    text: "We're always looking for exceptional talent! 🎯\n\nCurrent opportunities at CoreStack:\n• Senior Full-Stack Engineers\n• AI/ML Engineers\n• Cloud Architects\n• Product Designers\n• DevOps Engineers\n• Project Managers\n\n**Benefits:** Competitive salary, remote-friendly, $2K learning budget, equity options, health insurance.\n\nVisit our Careers page to see all open positions and apply directly.",
    quickReplies: ['Apply for a Job', 'Apply Internship', 'Talk to Sales'],
  };

  if (/intern|internship|graduate|student|fresh/.test(msg)) return {
    text: "Our internship program is designed to accelerate your career! 🎓\n\nInternship tracks available:\n• Software Development\n• AI/ML Research\n• UI/UX Design\n• Cloud Engineering\n• Product Management\n• Business Development\n\n**Duration:** 3–6 months | **Stipend:** Competitive | **Outcome:** Full-time offers for top performers.\n\nVisit our Internships page to apply today!",
    quickReplies: ['Apply Internship', 'Apply for a Job'],
  };

  if (/contact|support|help|email|phone|address|reach|location/.test(msg)) return {
    text: "Here's how to reach us:\n\n📧 **Email:** hello@corestacktech.com\n📞 **Phone:** +1 (555) 123-4567\n🏢 **HQ:** San Francisco, CA, USA\n🌍 **Also in:** Dubai, Singapore, London\n\n💬 Or book a direct consultation and we'll set up a call at your convenience.\n\n**Support hours:** Mon–Fri, 9AM–6PM PST (24/7 for enterprise clients)",
    quickReplies: ['Book Consultation', 'Start a Project'],
  };

  if (/technolog|stack|framework|react|node|python|java/.test(msg)) return {
    text: "We work across the modern technology stack:\n\n**Frontend:** React, Next.js, Vue.js, Angular, TypeScript\n**Backend:** Node.js, Python, Java, .NET, Go\n**Mobile:** React Native, Flutter, Swift, Kotlin\n**Data:** PostgreSQL, MongoDB, Redis, Elasticsearch\n**Cloud:** AWS, Azure, GCP, Vercel, Netlify\n**AI/ML:** TensorFlow, PyTorch, OpenAI, LangChain\n**DevOps:** Docker, Kubernetes, Terraform, CI/CD\n\nWe choose the right technology for your specific requirements — not the trendy one.",
    quickReplies: ['Book Consultation', 'Start a Project'],
  };

  if (/about|who are you|company|founded|history|team/.test(msg)) return {
    text: "CoreStack Technology was founded in 2018 by ex-FAANG engineers with a mission to democratize enterprise-grade technology.\n\n📊 **By the numbers:**\n• 200+ Enterprise clients\n• 500+ Projects delivered\n• 50+ Expert engineers\n• 12+ Countries served\n• 99.9% SLA uptime\n\nWe've grown from a 6-person studio to a global technology powerhouse serving clients across 12 countries — all while maintaining the quality and personal touch of a boutique firm.",
    quickReplies: ['Services', 'Book Consultation', 'Careers'],
  };

  // Default
  return {
    text: "I appreciate your message! I'm best at answering questions about CoreStack's services, pricing, portfolio, and careers. Here are some popular topics I can help with:",
    quickReplies: ['Services', 'Pricing', 'Portfolio', 'Book Consultation', 'Careers', 'Contact Support'],
  };
}

// ── Types ────────────────────────────────────────────────────────────────────

interface Message {
  id: string;
  role: 'user' | 'bot';
  text: string;
  time: Date;
  quickReplies?: string[];
  action?: string;
}

// ── Quick actions ────────────────────────────────────────────────────────────

const QUICK_ACTIONS = [
  { label: 'Book Consultation', icon: CalendarDays, action: 'open-consultation', color: 'text-primary' },
  { label: 'Start Project', icon: Rocket, action: 'open-project', color: 'text-orange-400' },
  { label: 'Our Services', icon: LayoutGrid, action: 'goto-services', color: 'text-blue-400' },
  { label: 'Portfolio', icon: Users, action: 'goto-portfolio', color: 'text-purple-400' },
  { label: 'Careers', icon: Briefcase, action: 'goto-careers', color: 'text-green-400' },
  { label: 'Contact', icon: Phone, action: 'goto-contact', color: 'text-cyan-400' },
  { label: 'Ask AI', icon: Mic, action: 'ask-ai', color: 'text-amber-400' },
];

// ── Component ────────────────────────────────────────────────────────────────

export default function FloatingAIAssistant() {
  const [open, setOpen] = useState(false);
  const [minimized, setMinimized] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '0',
      role: 'bot',
      text: "Hello! 👋 I'm CoreStack's AI Assistant. I can help you with services, pricing, portfolio, careers, and more. What would you like to know?",
      time: new Date(),
      quickReplies: ['Services', 'Pricing', 'Portfolio', 'Book Consultation'],
    },
  ]);
  const [typing, setTyping] = useState(false);
  const [consultOpen, setConsultOpen] = useState(false);
  const [projectOpen, setProjectOpen] = useState(false);
  const [sessionId] = useState(() => `session-${Date.now()}`);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, typing]);

  useEffect(() => {
    if (open && !minimized) inputRef.current?.focus();
  }, [open, minimized]);

  const navigate = useNavigate();

  const addMessage = (msg: Omit<Message, 'id' | 'time'>) => {
    setMessages(prev => [...prev, { ...msg, id: Date.now().toString(), time: new Date() }]);
  };

  const handleAction = (action: string) => {
    if (action === 'open-consultation') {
      setConsultOpen(true);
    } else if (action === 'open-project') {
      setProjectOpen(true);
    } else if (action === 'careers-jobs') {
      navigate('/careers/jobs');
    } else if (action === 'careers-intern') {
      navigate('/careers/internships');
    } else if (action === 'goto-services') {
      navigate('/services');
      setOpen(false);
    } else if (action === 'goto-portfolio') {
      navigate('/portfolio');
      setOpen(false);
    } else if (action === 'goto-careers') {
      navigate('/careers');
      setOpen(false);
    } else if (action === 'goto-contact') {
      navigate('/contact');
      setOpen(false);
    } else if (action === 'ask-ai') {
      addMessage({ role: 'bot', text: '🤖 I\'m ready! Ask me anything about CoreStack — our services, technology stack, pricing, process, team, or how we can help your business. What\'s on your mind?', quickReplies: ['Services', 'Pricing', 'Portfolio', 'Book Consultation'] });
    } else if (action === 'talk-sales') {
      addMessage({ role: 'bot', text: 'Connecting you to our sales team! You can reach us at:\n\n📧 sales@corestacktech.com\n📞 +1 (555) 123-4567\n\nOr book a direct consultation and we\'ll call you back.', quickReplies: ['Book Consultation'] });
    }
  };

  const sendMessage = async (text: string) => {
    if (!text.trim()) return;
    const userMsg: Message = { id: Date.now().toString(), role: 'user', text: text.trim(), time: new Date() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setTyping(true);

    // Simulate typing delay
    await new Promise(r => setTimeout(r, 800 + Math.random() * 600));

    const response = getBotResponse(text);
    setTyping(false);
    const botMsg: Message = {
      id: (Date.now() + 1).toString(),
      role: 'bot',
      text: response.text,
      time: new Date(),
      quickReplies: response.quickReplies,
      action: (response as BotResponse & { action?: string }).action,
    };
    setMessages(prev => [...prev, botMsg]);

    // Auto-trigger action if needed
    if ((response as BotResponse & { action?: string }).action) {
      handleAction((response as BotResponse & { action?: string }).action!);
    }

    // Save chat log (fire-and-forget)
    supabase.from('ai_chat_logs').insert({
      session_id: sessionId,
      user_message: text.trim(),
      bot_response: response.text,
    }).then(() => {}, console.warn);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(input); }
  };

  const handleQuickReply = (reply: string) => {
    sendMessage(reply);
  };

  return (
    <>
      {/* Floating button */}
      <div className="fixed bottom-6 right-6 z-50">
        {!open && (
          <button
            onClick={() => setOpen(true)}
            aria-label="Open AI Assistant"
            className="relative w-16 h-16 rounded-full flex items-center justify-center shadow-2xl transition-transform hover:scale-110 active:scale-95"
            style={{ background: 'linear-gradient(135deg, #cc4400, #ff6b2b, #ff9f5a)', boxShadow: '0 0 0 0 hsl(25 100% 50% / 0.4)' }}>
            {/* Pulse rings */}
            <span className="absolute inset-0 rounded-full animate-ping opacity-40" style={{ background: 'hsl(25 100% 50% / 0.5)' }} />
            <span className="absolute -inset-2 rounded-full animate-pulse opacity-20" style={{ background: 'hsl(25 100% 50% / 0.4)' }} />
            <span className="absolute -inset-4 rounded-full animate-pulse opacity-10" style={{ background: 'hsl(25 100% 50% / 0.3)', animationDelay: '0.5s' }} />
            {/* Floating bob animation */}
            <span className="relative z-10 flex items-center justify-center w-full h-full" style={{ animation: 'floatBob 3s ease-in-out infinite' }}>
              <RobotAvatar size={36} />
            </span>
          </button>
        )}
      </div>

      {/* Chat panel */}
      {open && (
        <div className={`fixed bottom-6 right-6 z-50 w-[360px] max-w-[calc(100vw-3rem)] transition-all duration-300 ${minimized ? 'h-14' : 'h-[520px]'}`}
          style={{ borderRadius: '20px', boxShadow: '0 0 40px hsl(25 100% 50% / 0.2), 0 20px 60px rgba(0,0,0,0.4)' }}>
          <div className="flex flex-col h-full rounded-[20px] border border-border overflow-hidden"
            style={{ background: 'hsl(var(--card))', backdropFilter: 'blur(20px)' }}>

            {/* Header */}
            <div className="flex items-center gap-3 px-4 py-3 shrink-0"
              style={{ background: 'linear-gradient(135deg, #cc4400, #ff6b2b, #ff9f5a)' }}>
              <div className="relative">
                <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center" style={{ animation: 'floatBob 3s ease-in-out infinite' }}>
                  <RobotAvatar size={28} />
                </div>
                <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-green-400 border-2 border-white" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-white font-bold text-sm">CoreStack AI</div>
                <div className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                  <span className="text-white/75 text-xs">Online · Replies instantly</span>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button onClick={() => setMinimized(m => !m)}
                  className="w-7 h-7 rounded-full hover:bg-white/20 flex items-center justify-center transition-colors">
                  {minimized ? <Maximize2 className="w-3.5 h-3.5 text-white" /> : <Minimize2 className="w-3.5 h-3.5 text-white" />}
                </button>
                <button onClick={() => setOpen(false)}
                  className="w-7 h-7 rounded-full hover:bg-white/20 flex items-center justify-center transition-colors">
                  <X className="w-3.5 h-3.5 text-white" />
                </button>
              </div>
            </div>

            {!minimized && (
              <>
                {/* Quick actions */}
                <div className="flex gap-1.5 px-3 py-2 border-b border-border overflow-x-auto shrink-0 scrollbar-hide">
                  {QUICK_ACTIONS.map(qa => (
                    <button key={qa.action} onClick={() => {
                      if (qa.action === 'open-consultation') sendMessage('Book Consultation');
                      else if (qa.action === 'open-project') sendMessage('Start a project');
                      else if (qa.action === 'careers-jobs') sendMessage('I want to apply for a job');
                      else if (qa.action === 'careers-intern') sendMessage('Tell me about internships');
                      else if (qa.action === 'talk-sales') handleAction('talk-sales');
                    }}
                      className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-border bg-card hover:border-primary/40 hover:bg-muted transition-all whitespace-nowrap text-xs font-medium text-foreground shrink-0">
                      <qa.icon className={`w-3 h-3 ${qa.color} shrink-0`} />
                      {qa.label}
                    </button>
                  ))}
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto px-3 py-3 space-y-3 min-h-0">
                  {messages.map(msg => (
                    <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} gap-2`}>
                      {msg.role === 'bot' && (
                        <div className="w-7 h-7 rounded-full shrink-0 flex items-center justify-center mt-0.5"
                          style={{ background: 'linear-gradient(135deg, #ff6b2b, #ff9f5a)' }}>
                          <RobotAvatar size={18} />
                        </div>
                      )}
                      <div className="max-w-[85%] space-y-1.5">
                        <div className={`px-3 py-2 rounded-2xl text-xs leading-relaxed whitespace-pre-wrap ${msg.role === 'user'
                          ? 'bg-primary text-primary-foreground rounded-br-sm'
                          : 'bg-muted text-foreground rounded-bl-sm border border-border'
                        }`}>
                          {msg.text}
                        </div>
                        {msg.quickReplies && (
                          <div className="flex flex-wrap gap-1">
                            {msg.quickReplies.map(qr => (
                              <button key={qr} onClick={() => handleQuickReply(qr)}
                                className="px-2.5 py-1 rounded-full border border-primary/40 text-primary bg-primary/5 hover:bg-primary/10 text-xs font-medium transition-colors">
                                {qr}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}

                  {/* Typing indicator */}
                  {typing && (
                    <div className="flex justify-start gap-2">
                      <div className="w-7 h-7 rounded-full shrink-0 flex items-center justify-center"
                        style={{ background: 'linear-gradient(135deg, #ff6b2b, #ff9f5a)' }}>
                        <RobotAvatar size={18} />
                      </div>
                      <div className="px-3 py-2.5 rounded-2xl rounded-bl-sm bg-muted border border-border flex items-center gap-1">
                        {[0, 1, 2].map(i => (
                          <div key={i} className="w-1.5 h-1.5 rounded-full bg-muted-foreground animate-bounce"
                            style={{ animationDelay: `${i * 150}ms` }} />
                        ))}
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Input */}
                <div className="px-3 py-3 border-t border-border shrink-0">
                  <div className="flex gap-2 items-center">
                    <Input
                      ref={inputRef}
                      value={input}
                      onChange={e => setInput(e.target.value)}
                      onKeyDown={handleKeyDown}
                      placeholder="Ask me anything…"
                      className="flex-1 h-9 text-xs rounded-xl border-border bg-muted/50 focus-visible:ring-primary/30"
                    />
                    <Button size="sm" onClick={() => sendMessage(input)} disabled={!input.trim() || typing}
                      className="h-9 w-9 p-0 bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl shrink-0">
                      <Send className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                  <p className="text-center text-[10px] text-muted-foreground mt-1.5">Powered by CoreStack AI · Replies in seconds</p>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      <BookConsultationModal open={consultOpen} onClose={() => setConsultOpen(false)} />
      <ProjectEnquiryModal open={projectOpen} onClose={() => setProjectOpen(false)} />
    </>
  );
}
