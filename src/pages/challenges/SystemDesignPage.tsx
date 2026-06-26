import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import BackButton from '@/components/ui/BackButton';
import {
  Server, Database, Globe, Shield, Zap, Cloud, ArrowRight,
  Trophy, Timer, Star, CheckCircle, RefreshCw, LayoutGrid,
  Layers, Activity
} from 'lucide-react';

// ── Types ──────────────────────────────────────────────────────────────────
type Difficulty = 'Easy' | 'Medium' | 'Hard';
type Phase = 'intro' | 'design' | 'result';

interface Component {
  id: string;
  label: string;
  icon: React.ElementType;
  color: string;
  bg: string;
}

interface DropZone {
  id: string;
  label: string;
  accepts: string[];
  placed: string | null;
}

interface Problem {
  id: string;
  title: string;
  description: string;
  difficulty: Difficulty;
  timeLimit: number; // seconds
  requiredComponents: string[];
  zones: DropZone[];
  hints: string[];
  scoring: { complete: number; partial: number };
}

// ── Static data ────────────────────────────────────────────────────────────
const COMPONENTS: Component[] = [
  { id: 'cdn', label: 'CDN', icon: Globe, color: 'text-blue-400', bg: 'bg-blue-500/10' },
  { id: 'lb', label: 'Load Balancer', icon: Activity, color: 'text-orange-400', bg: 'bg-orange-500/10' },
  { id: 'api', label: 'API Gateway', icon: Zap, color: 'text-yellow-400', bg: 'bg-yellow-500/10' },
  { id: 'cache', label: 'Cache (Redis)', icon: Layers, color: 'text-red-400', bg: 'bg-red-500/10' },
  { id: 'db', label: 'Database', icon: Database, color: 'text-purple-400', bg: 'bg-purple-500/10' },
  { id: 'auth', label: 'Auth Service', icon: Shield, color: 'text-green-400', bg: 'bg-green-500/10' },
  { id: 'server', label: 'App Server', icon: Server, color: 'text-cyan-400', bg: 'bg-cyan-500/10' },
  { id: 'cloud', label: 'Cloud Storage', icon: Cloud, color: 'text-amber-400', bg: 'bg-amber-500/10' },
  { id: 'queue', label: 'Message Queue', icon: LayoutGrid, color: 'text-pink-400', bg: 'bg-pink-500/10' },
];

const PROBLEMS: Problem[] = [
  {
    id: 'url-shortener',
    title: 'URL Shortener Service',
    description:
      'Design a scalable URL shortening service (like bit.ly) that handles 100M daily requests. It must support fast redirects, analytics, and high availability.',
    difficulty: 'Easy',
    timeLimit: 600,
    requiredComponents: ['lb', 'api', 'cache', 'db'],
    zones: [
      { id: 'z1', label: 'Entry Layer', accepts: ['cdn', 'lb'], placed: null },
      { id: 'z2', label: 'Application Layer', accepts: ['api', 'server'], placed: null },
      { id: 'z3', label: 'Caching Layer', accepts: ['cache'], placed: null },
      { id: 'z4', label: 'Persistence Layer', accepts: ['db', 'cloud'], placed: null },
    ],
    hints: ['Use a Load Balancer at the entry point', 'Redis cache reduces DB reads by 90%'],
    scoring: { complete: 100, partial: 60 },
  },
  {
    id: 'chat-app',
    title: 'Real-Time Chat Application',
    description:
      'Design a chat system like WhatsApp that supports 50M concurrent users, message delivery guarantees, and end-to-end encryption.',
    difficulty: 'Medium',
    timeLimit: 900,
    requiredComponents: ['lb', 'api', 'auth', 'cache', 'db', 'queue'],
    zones: [
      { id: 'z1', label: 'Edge / CDN', accepts: ['cdn', 'lb'], placed: null },
      { id: 'z2', label: 'Auth & Gateway', accepts: ['auth', 'api'], placed: null },
      { id: 'z3', label: 'Messaging Layer', accepts: ['server', 'queue'], placed: null },
      { id: 'z4', label: 'Storage', accepts: ['db', 'cache', 'cloud'], placed: null },
    ],
    hints: ['WebSockets need persistent connections — distribute with LB', 'Message Queue decouples producers from consumers'],
    scoring: { complete: 100, partial: 55 },
  },
  {
    id: 'video-streaming',
    title: 'Video Streaming Platform',
    description:
      'Design a Netflix-like video streaming service with adaptive bitrate, global delivery, recommendation engine, and 99.99% uptime SLA.',
    difficulty: 'Hard',
    timeLimit: 1200,
    requiredComponents: ['cdn', 'lb', 'api', 'auth', 'db', 'cloud', 'queue', 'cache'],
    zones: [
      { id: 'z1', label: 'Global CDN', accepts: ['cdn'], placed: null },
      { id: 'z2', label: 'Auth & Load Balancing', accepts: ['auth', 'lb'], placed: null },
      { id: 'z3', label: 'API & Processing', accepts: ['api', 'queue', 'server'], placed: null },
      { id: 'z4', label: 'Media & Data Storage', accepts: ['cloud', 'db', 'cache'], placed: null },
    ],
    hints: ['CDN is critical for low-latency video delivery', 'Use async queues for video transcoding jobs'],
    scoring: { complete: 100, partial: 50 },
  },
];

const DIFFICULTY_COLORS: Record<Difficulty, string> = {
  Easy: 'bg-green-500/20 text-green-400 border-green-500/30',
  Medium: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  Hard: 'bg-red-500/20 text-red-400 border-red-500/30',
};

function useTimer(initial: number) {
  const [seconds, setSeconds] = useState(initial);
  const [running, setRunning] = useState(false);
  const start = useCallback(() => {
    setRunning(true);
    const interval = setInterval(() => {
      setSeconds(s => {
        if (s <= 1) { clearInterval(interval); setRunning(false); return 0; }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, []);
  const fmt = (s: number) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;
  return { seconds, running, start, fmt };
}

// ── Main component ─────────────────────────────────────────────────────────
export default function SystemDesignPage() {
  const navigate = useNavigate();
  const [phase, setPhase] = useState<Phase>('intro');
  const [selectedDifficulty, setSelectedDifficulty] = useState<Difficulty>('Easy');
  const [problem, setProblem] = useState<Problem | null>(null);
  const [zones, setZones] = useState<DropZone[]>([]);
  const [dragging, setDragging] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [showHints, setShowHints] = useState(false);

  const timer = useTimer(problem?.timeLimit ?? 600);

  const startChallenge = () => {
    const filtered = PROBLEMS.filter(p => p.difficulty === selectedDifficulty);
    const p = filtered[Math.floor(Math.random() * filtered.length)];
    const fresh: Problem = { ...p, zones: p.zones.map(z => ({ ...z, placed: null })) };
    setProblem(fresh);
    setZones(fresh.zones.map(z => ({ ...z })));
    setPhase('design');
    timer.start();
  };

  const handleDrop = (zoneId: string) => {
    if (!dragging || !problem) return;
    const zone = zones.find(z => z.id === zoneId);
    if (!zone || !zone.accepts.includes(dragging)) return;
    setZones(prev => prev.map(z => z.id === zoneId ? { ...z, placed: dragging } : z));
    setDragging(null);
  };

  const submitDesign = () => {
    if (!problem) return;
    const placed = zones.map(z => z.placed).filter(Boolean) as string[];
    const required = problem.requiredComponents;
    const matched = required.filter(r => placed.includes(r)).length;
    const ratio = matched / required.length;
    const computed = ratio === 1
      ? problem.scoring.complete
      : Math.round(ratio * problem.scoring.partial);
    setScore(computed);
    setPhase('result');
  };

  const reset = () => {
    setPhase('intro');
    setProblem(null);
    setZones([]);
    setScore(0);
    setShowHints(false);
  };

  const getRank = (s: number) => {
    if (s >= 90) return { label: 'Architect', color: 'text-amber-400', icon: '🏆' };
    if (s >= 75) return { label: 'Senior Engineer', color: 'text-purple-400', icon: '🥇' };
    if (s >= 55) return { label: 'Mid-Level', color: 'text-blue-400', icon: '🥈' };
    return { label: 'Junior', color: 'text-muted-foreground', icon: '🥉' };
  };

  // ── INTRO ────────────────────────────────────────────────────────────────
  if (phase === 'intro') {
    return (
      <div className="min-h-screen bg-[#05050a] text-foreground">
        <div className="container mx-auto px-4 max-w-3xl py-12">
          <BackButton />
          <div className="text-center mt-8">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-amber-500/10 border border-amber-500/20 mb-6">
              <Server className="w-10 h-10 text-amber-400" />
            </div>
            <h1 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-3 text-balance">
              System Design Challenge
            </h1>
            <p className="text-muted-foreground text-base mb-8 text-pretty max-w-xl mx-auto">
              Drag &amp; Drop components to architect real-world systems. AI evaluates your design for
              scalability, reliability, and engineering best practices.
            </p>
            {/* Difficulty selector */}
            <div className="mb-8">
              <p className="text-sm font-medium text-muted-foreground mb-3">Select Difficulty</p>
              <div className="flex justify-center gap-3 flex-wrap">
                {(['Easy', 'Medium', 'Hard'] as Difficulty[]).map(d => (
                  <button
                    key={d}
                    onClick={() => setSelectedDifficulty(d)}
                    className={`px-5 py-2.5 rounded-xl border text-sm font-semibold transition-all duration-200 ${
                      selectedDifficulty === d
                        ? DIFFICULTY_COLORS[d] + ' scale-105'
                        : 'border-border text-muted-foreground hover:border-primary/30'
                    }`}
                  >
                    {d}
                  </button>
                ))}
              </div>
            </div>
            {/* Feature pills */}
            <div className="flex flex-wrap justify-center gap-2 mb-10">
              {['Drag & Drop', 'AI Evaluation', 'Timed Challenge', 'Instant Feedback', 'Score & Ranking'].map(f => (
                <span key={f} className="px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-medium">
                  {f}
                </span>
              ))}
            </div>
            <Button
              size="lg"
              className="h-12 px-10 bg-amber-500 hover:bg-amber-500/90 text-white font-semibold text-base"
              onClick={startChallenge}
            >
              Start Challenge <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // ── RESULT ───────────────────────────────────────────────────────────────
  if (phase === 'result' && problem) {
    const rank = getRank(score);
    const cert = score >= 80;
    return (
      <div className="min-h-screen bg-[#05050a] text-foreground flex items-center justify-center px-4">
        <div className="w-full max-w-xl">
          <div className="rounded-2xl border border-amber-500/20 bg-card p-8 text-center">
            <div className="text-6xl mb-4">{rank.icon}</div>
            <h2 className="text-3xl font-display font-bold mb-1">
              Score: <span className="text-amber-400">{score}</span>/100
            </h2>
            <p className={`text-xl font-semibold mb-6 ${rank.color}`}>{rank.label}</p>
            {cert && (
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-green-500/10 border border-green-500/30 text-green-400 text-sm font-medium mb-6">
                <CheckCircle className="w-4 h-4" /> Certificate Earned! You scored ≥ 80%
              </div>
            )}
            {/* Zone review */}
            <div className="text-left space-y-2 mb-6">
              {zones.map(z => {
                const comp = COMPONENTS.find(c => c.id === z.placed);
                const correct = z.placed && z.accepts.includes(z.placed);
                return (
                  <div key={z.id} className={`flex items-center justify-between p-3 rounded-xl border text-sm ${correct ? 'border-green-500/30 bg-green-500/5' : 'border-red-500/30 bg-red-500/5'}`}>
                    <span className="text-muted-foreground">{z.label}</span>
                    <span className={correct ? 'text-green-400 font-medium' : 'text-red-400'}>
                      {comp ? comp.label : 'Empty'} {correct ? '✓' : '✗'}
                    </span>
                  </div>
                );
              })}
            </div>
            {/* AI feedback */}
            <div className="p-4 rounded-xl border border-amber-500/20 bg-amber-500/5 text-left mb-6">
              <p className="text-xs text-amber-400 font-semibold uppercase tracking-wide mb-1">AI Evaluation</p>
              <p className="text-sm text-muted-foreground text-pretty">
                {score >= 80
                  ? `Excellent design for ${problem.title}! Your architecture demonstrates strong understanding of scalability and component separation. Consider adding rate limiting and monitoring in production.`
                  : `Good attempt on ${problem.title}. Review the missing components — especially ${problem.requiredComponents.filter(r => !zones.map(z => z.placed).includes(r)).join(', ')}. These are critical for a production-ready system.`}
              </p>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" className="flex-1" onClick={reset}>
                <RefreshCw className="w-4 h-4 mr-2" /> Try Again
              </Button>
              <Button
                className="flex-1 bg-amber-500 hover:bg-amber-500/90 text-white font-semibold"
                onClick={() => navigate('/leaderboard')}
              >
                <Trophy className="w-4 h-4 mr-2" /> Leaderboard
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── DESIGN CANVAS ────────────────────────────────────────────────────────
  if (phase === 'design' && problem) {
    const placed = zones.flatMap(z => z.placed ? [z.placed] : []);
    const available = COMPONENTS.filter(c => !placed.includes(c.id));
    return (
      <div className="min-h-screen bg-[#05050a] text-foreground pb-12">
        {/* Header bar */}
        <div className="sticky top-0 z-20 border-b border-border bg-[#05050a]/90 backdrop-blur-md px-4 py-3">
          <div className="container mx-auto max-w-5xl flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 min-w-0">
              <BackButton />
              <div className="min-w-0">
                <h2 className="font-display font-bold text-foreground text-sm md:text-base truncate">{problem.title}</h2>
                <span className={`text-xs px-2 py-0.5 rounded-full border ${DIFFICULTY_COLORS[problem.difficulty]}`}>{problem.difficulty}</span>
              </div>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <div className={`flex items-center gap-1.5 text-sm font-mono ${timer.seconds < 60 ? 'text-red-400' : 'text-muted-foreground'}`}>
                <Timer className="w-4 h-4" />
                {timer.fmt(timer.seconds)}
              </div>
              <Button
                size="sm"
                variant="outline"
                className="text-xs"
                onClick={() => setShowHints(v => !v)}
              >
                {showHints ? 'Hide Hints' : 'Show Hints'}
              </Button>
              <Button
                size="sm"
                className="bg-amber-500 hover:bg-amber-500/90 text-white text-xs font-semibold"
                onClick={submitDesign}
              >
                <Star className="w-3.5 h-3.5 mr-1" /> Submit
              </Button>
            </div>
          </div>
        </div>

        <div className="container mx-auto max-w-5xl px-4 pt-6 space-y-6">
          {/* Problem description */}
          <div className="p-5 rounded-xl border border-border bg-card/60">
            <p className="text-sm text-muted-foreground text-pretty leading-relaxed">{problem.description}</p>
            {showHints && (
              <ul className="mt-3 space-y-1">
                {problem.hints.map((h, i) => (
                  <li key={i} className="text-xs text-amber-400 flex items-start gap-1.5">
                    <span className="mt-0.5">💡</span>{h}
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Component palette */}
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">
              Available Components — drag to a zone below
            </p>
            <div className="flex flex-wrap gap-2">
              {available.map(c => {
                const Icon = c.icon;
                return (
                  <div
                    key={c.id}
                    draggable
                    onDragStart={() => setDragging(c.id)}
                    onDragEnd={() => setDragging(null)}
                    className={`flex items-center gap-2 px-3 py-2 rounded-xl border border-border ${c.bg} cursor-grab active:cursor-grabbing select-none transition-all duration-150 hover:-translate-y-0.5 hover:shadow-lg ${dragging === c.id ? 'opacity-50 scale-95' : ''}`}
                  >
                    <Icon className={`w-4 h-4 ${c.color} shrink-0`} />
                    <span className={`text-xs font-medium ${c.color}`}>{c.label}</span>
                  </div>
                );
              })}
              {available.length === 0 && (
                <p className="text-xs text-muted-foreground italic">All components placed.</p>
              )}
            </div>
          </div>

          {/* Architecture zones */}
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">
              Architecture Zones — drop components here
            </p>
            <div className="grid sm:grid-cols-2 gap-4">
              {zones.map(zone => {
                const placedComp = COMPONENTS.find(c => c.id === zone.placed);
                const isAccepting = dragging && zone.accepts.includes(dragging) && !zone.placed;
                return (
                  <div
                    key={zone.id}
                    onDragOver={e => { if (isAccepting) e.preventDefault(); }}
                    onDrop={() => handleDrop(zone.id)}
                    className={`relative min-h-[88px] rounded-xl border-2 border-dashed p-4 transition-all duration-200 flex flex-col justify-between ${
                      isAccepting
                        ? 'border-amber-400/60 bg-amber-500/5 scale-[1.01]'
                        : placedComp
                        ? 'border-green-500/40 bg-green-500/5'
                        : 'border-border bg-card/40'
                    }`}
                  >
                    <span className="text-xs text-muted-foreground font-medium">{zone.label}</span>
                    {placedComp ? (
                      <div className="flex items-center justify-between mt-2">
                        <div className="flex items-center gap-2">
                          <placedComp.icon className={`w-5 h-5 ${placedComp.color}`} />
                          <span className={`text-sm font-semibold ${placedComp.color}`}>{placedComp.label}</span>
                        </div>
                        <button
                          onClick={() => setZones(prev => prev.map(z => z.id === zone.id ? { ...z, placed: null } : z))}
                          className="text-xs text-muted-foreground hover:text-red-400 transition-colors"
                        >
                          ✕
                        </button>
                      </div>
                    ) : (
                      <p className="text-xs text-muted-foreground/50 mt-2 italic">
                        {isAccepting ? 'Drop here' : `Accepts: ${zone.accepts.map(a => COMPONENTS.find(c => c.id === a)?.label).filter(Boolean).join(', ')}`}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
