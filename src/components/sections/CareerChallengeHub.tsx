import { useNavigate } from 'react-router-dom';
import { Code2, Brain, Bug, Puzzle, Mic, Trophy, ArrowRight, Zap, Server } from 'lucide-react';

const CHALLENGES = [
  {
    id: 'programming-quiz',
    icon: Code2,
    color: 'text-orange-400',
    bg: 'bg-orange-500/10',
    border: 'border-orange-500/20',
    glow: 'hover:shadow-orange-500/10',
    title: 'Programming Quiz',
    desc: '20 random questions across Easy, Medium, and Hard difficulty. Beat the clock and see where you rank.',
    badge: 'Quiz',
    badgeColor: 'bg-orange-500/20 text-orange-400',
    time: '15 min',
  },
  {
    id: 'aptitude-quiz',
    icon: Brain,
    color: 'text-purple-400',
    bg: 'bg-purple-500/10',
    border: 'border-purple-500/20',
    glow: 'hover:shadow-purple-500/10',
    title: 'Logical Aptitude',
    desc: 'Sharpen your reasoning with timed MCQs. Earn a rank based on accuracy and speed.',
    badge: 'Aptitude',
    badgeColor: 'bg-purple-500/20 text-purple-400',
    time: '12 min',
  },
  {
    id: 'debug-challenge',
    icon: Bug,
    color: 'text-red-400',
    bg: 'bg-red-500/10',
    border: 'border-red-500/20',
    glow: 'hover:shadow-red-500/10',
    title: 'Debug Challenge',
    desc: 'Spot and fix the bugs in real code snippets. The fewer attempts, the higher your score.',
    badge: 'Debugging',
    badgeColor: 'bg-red-500/20 text-red-400',
    time: '20 min',
  },
  {
    id: 'tech-matching',
    icon: Puzzle,
    color: 'text-cyan-400',
    bg: 'bg-cyan-500/10',
    border: 'border-cyan-500/20',
    glow: 'hover:shadow-cyan-500/10',
    title: 'Tech Matching',
    desc: 'Match technologies to their use cases — React, Node.js, AWS, MongoDB and more. Fast and fun.',
    badge: 'Matching',
    badgeColor: 'bg-cyan-500/20 text-cyan-400',
    time: '8 min',
  },
  {
    id: 'interview-rapid-fire',
    icon: Mic,
    color: 'text-green-400',
    bg: 'bg-green-500/10',
    border: 'border-green-500/20',
    glow: 'hover:shadow-green-500/10',
    title: 'Interview Rapid Fire',
    desc: 'Answer rapid-fire interview questions and receive a Communication, Technical & Confidence score.',
    badge: 'Interview',
    badgeColor: 'bg-green-500/20 text-green-400',
    time: '10 min',
  },
  {
    id: 'system-design',
    icon: Server,
    color: 'text-amber-400',
    bg: 'bg-amber-500/10',
    border: 'border-amber-500/20',
    glow: 'hover:shadow-amber-500/10',
    title: 'System Design Challenge',
    desc: 'Drag & Drop components to build real-world software architectures. AI evaluates your design for scalability, reliability, and best practices.',
    badge: 'Architecture',
    badgeColor: 'bg-amber-500/20 text-amber-400',
    time: '25 min',
  },
];

export default function CareerChallengeHub() {
  const navigate = useNavigate();
  return (
    <section id="challenge-hub" className="section-padding bg-background relative overflow-hidden">
      {/* Background glows */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-primary/6 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 left-1/4 w-[400px] h-[400px] bg-purple-500/5 rounded-full blur-[100px]" />
      </div>

      <div className="container mx-auto px-4 max-w-7xl relative">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 mb-6">
            <Zap className="w-3.5 h-3.5 text-primary" />
            <span className="text-primary text-xs font-semibold uppercase tracking-widest">Prove Your Skills</span>
          </div>
          <h2 className="text-3xl md:text-5xl font-display font-bold text-foreground mb-5 text-balance">
            Career{' '}
            <span className="gradient-text">Challenge Hub</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto text-pretty">
            Six interactive challenges designed to test and sharpen your technical skills.
            Score above 80% to earn a verified certificate.
          </p>
        </div>

        {/* 5 challenge cards */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {CHALLENGES.map((c, i) => {
            const Icon = c.icon;
            return (
              <button
                key={c.id}
                onClick={() => navigate(`/challenges/${c.id}`)}
                className={`group relative p-7 rounded-2xl border ${c.border} bg-card/60 backdrop-blur-sm hover:bg-card hover:-translate-y-1.5 hover:shadow-2xl ${c.glow} transition-all duration-300 flex flex-col text-left w-full overflow-hidden`}
                style={{ animationDelay: `${i * 0.07}s` }}
              >
                {/* Glow blob */}
                <div className={`absolute -top-8 -right-8 w-28 h-28 rounded-full ${c.bg} blur-2xl opacity-0 group-hover:opacity-80 transition-opacity duration-500`} />

                <div className="flex items-start justify-between mb-5">
                  <div className={`w-12 h-12 rounded-xl ${c.bg} flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shrink-0`}>
                    <Icon className={`w-6 h-6 ${c.color}`} />
                  </div>
                  <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${c.badgeColor}`}>{c.badge}</span>
                </div>

                <h3 className="font-display font-bold text-foreground text-lg mb-2 text-balance">{c.title}</h3>
                <p className="text-sm text-muted-foreground text-pretty flex-1 leading-relaxed">{c.desc}</p>

                <div className="flex items-center justify-between mt-5 pt-4 border-t border-border">
                  <span className="text-xs text-muted-foreground">⏱ {c.time}</span>
                  <span className={`flex items-center gap-1 text-sm font-semibold ${c.color} group-hover:gap-2 transition-all duration-200`}>
                    Start <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Bottom CTAs */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <button
            onClick={() => navigate('/leaderboard')}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-primary-foreground font-semibold text-sm hover:opacity-90 transition-opacity"
          >
            <Trophy className="w-4 h-4" />
            View Leaderboard
          </button>
          <button
            onClick={() => navigate('/profile')}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border border-border bg-card text-foreground font-semibold text-sm hover:border-primary/40 hover:text-primary transition-all duration-200"
          >
            My Progress
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </section>
  );
}
