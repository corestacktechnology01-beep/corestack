import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '@/components/layouts/Header';
import Footer from '@/components/layouts/Footer';
import BackButton from '@/components/ui/BackButton';
import { Trophy, RotateCcw, Zap, ChevronRight, Clock, Mic } from 'lucide-react';

interface InterviewQ { id: number; q: string; category: string; keywords: string[]; }

const QUESTIONS: InterviewQ[] = [
  { id:1, q:'Tell me about yourself and your background in software development.', category:'Communication', keywords:['experience','worked','built','developed','team','project','years','skill'] },
  { id:2, q:'What is the difference between REST and GraphQL?', category:'Technical', keywords:['rest','graphql','endpoint','query','schema','http','mutation','subscription','overfetching'] },
  { id:3, q:'Explain what a promise is in JavaScript.', category:'Technical', keywords:['async','asynchronous','resolve','reject','then','catch','pending','fulfilled','callback'] },
  { id:4, q:'How do you handle conflict in a team?', category:'Communication', keywords:['listen','communicate','discuss','resolve','understand','perspective','compromise','feedback','respect'] },
  { id:5, q:'What is database indexing and why is it important?', category:'Technical', keywords:['index','query','performance','slow','fast','lookup','b-tree','optimization','column'] },
  { id:6, q:'Describe a challenging project you worked on and how you overcame difficulties.', category:'Communication', keywords:['challenge','difficult','problem','solution','learned','overcome','team','deadline','approach'] },
  { id:7, q:'What is the difference between SQL and NoSQL databases?', category:'Technical', keywords:['relational','schema','flexible','scalable','mongodb','postgresql','acid','document','table'] },
  { id:8, q:'How do you stay updated with new technologies?', category:'Communication', keywords:['blog','documentation','course','podcast','github','community','learn','practice','follow'] },
  { id:9, q:'Explain the concept of microservices.', category:'Technical', keywords:['independent','service','deploy','scale','api','container','docker','communication','boundary'] },
  { id:10, q:'Where do you see yourself in 5 years?', category:'Communication', keywords:['grow','lead','technical','architect','skill','contribute','team','goal','responsibility'] },
];

const TOTAL_TIME_PER_Q = 60; // seconds per question

function scoreAnswer(answer: string, question: InterviewQ): { communication: number; technical: number; confidence: number } {
  const lower = answer.toLowerCase().trim();
  const words = lower.split(/\s+/).filter(w => w.length > 2);
  const wordCount = words.length;

  // Communication: length, punctuation, structure
  const commBase = Math.min(100, Math.floor((wordCount / 80) * 100));
  const hasPunctuation = (answer.match(/[.,;!?]/g) || []).length;
  const communication = Math.min(100, commBase + (hasPunctuation > 2 ? 15 : 0));

  // Technical: keyword matching
  const matched = question.keywords.filter(k => lower.includes(k)).length;
  const technical = Math.min(100, Math.round((matched / question.keywords.length) * 100));

  // Confidence: length and specificity signals
  const confidence = Math.min(100, Math.floor(Math.min(wordCount / 60, 1) * 80) + (lower.includes('i ') || lower.includes("i've") || lower.includes("i'd") ? 20 : 0));

  return { communication, technical, confidence };
}

function suggestionFor(scores: { communication: number; technical: number; confidence: number }, category: string) {
  const tips: string[] = [];
  if (scores.communication < 60) tips.push('Use structured answers (situation → action → result) for clarity.');
  if (scores.technical < 60) tips.push(category === 'Technical' ? 'Incorporate more technical terms and specific examples.' : 'Reference relevant situations with concrete details.');
  if (scores.confidence < 60) tips.push('Write longer, more complete answers and use first-person language ("I built...", "I led...").');
  if (tips.length === 0) tips.push('Excellent response! Keep up the strong communication and technical depth.');
  return tips;
}

function useTimer(seconds: number, active: boolean, onExpire: () => void) {
  const [remaining, setRemaining] = useState(seconds);
  useEffect(() => {
    if (!active) return;
    if (remaining === 0) { onExpire(); return; }
    const id = setInterval(() => setRemaining(r => r - 1), 1000);
    return () => clearInterval(id);
  }, [active, remaining]);
  const reset = useCallback(() => setRemaining(seconds), [seconds]);
  return { remaining, reset };
}

export default function InterviewRapidFirePage() {
  const navigate = useNavigate();
  const [phase, setPhase] = useState<'setup' | 'interview' | 'result'>('setup');
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState<string[]>(new Array(QUESTIONS.length).fill(''));
  const [allScores, setAllScores] = useState<ReturnType<typeof scoreAnswer>[]>([]);

  function nextQuestion() {
    if (current < QUESTIONS.length - 1) { setCurrent(c => c + 1); resetTimer(); }
    else { finish(); }
  }

  const { remaining, reset: resetTimer } = useTimer(TOTAL_TIME_PER_Q, phase === 'interview', nextQuestion);

  function start() { setAnswers(new Array(QUESTIONS.length).fill('')); setCurrent(0); setPhase('interview'); resetTimer(); }

  function finish() {
    const s = QUESTIONS.map((q, i) => scoreAnswer(answers[i], q));
    setAllScores(s);
    setPhase('result');
  }

  const avgComm = allScores.length ? Math.round(allScores.reduce((a, s) => a + s.communication, 0) / allScores.length) : 0;
  const avgTech = allScores.length ? Math.round(allScores.reduce((a, s) => a + s.technical, 0) / allScores.length) : 0;
  const avgConf = allScores.length ? Math.round(allScores.reduce((a, s) => a + s.confidence, 0) / allScores.length) : 0;
  const overall = Math.round((avgComm + avgTech + avgConf) / 3);

  const mins = String(Math.floor(remaining / 60)).padStart(2, '0');
  const secs = String(remaining % 60).padStart(2, '0');

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="flex-grow pt-24 pb-16">
        <div className="container mx-auto px-4 max-w-3xl">
          <div className="mb-6"><BackButton /></div>

          {phase === 'setup' && (
            <div className="text-center">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-green-500/10 border border-green-500/20 mb-6">
                <Zap className="w-3.5 h-3.5 text-green-400" />
                <span className="text-green-400 text-xs font-semibold uppercase tracking-widest">Challenge 5</span>
              </div>
              <h1 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-4 text-balance">Interview Rapid Fire</h1>
              <p className="text-muted-foreground max-w-lg mx-auto mb-10 text-pretty">
                Answer {QUESTIONS.length} interview questions — 60 seconds each. Receive Communication, Technical, and Confidence scores with improvement suggestions.
              </p>
              <div className="grid grid-cols-3 gap-4 max-w-sm mx-auto mb-10">
                {[['10', 'Questions'], ['60s', 'Per Question'], ['3', 'Score Axes']].map(([v, l]) => (
                  <div key={l} className="p-4 rounded-xl border border-border bg-card text-center">
                    <div className="text-2xl font-display font-black text-primary">{v}</div>
                    <div className="text-xs text-muted-foreground mt-1">{l}</div>
                  </div>
                ))}
              </div>
              <button onClick={start} className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-primary text-primary-foreground font-bold text-base hover:opacity-90 transition-opacity">
                <Mic className="w-5 h-5" /> Start Interview
              </button>
            </div>
          )}

          {phase === 'interview' && (
            <div>
              <div className="flex items-center justify-between mb-8 p-4 rounded-2xl border border-border bg-card">
                <span className="text-sm font-medium text-muted-foreground">Question {current + 1} / {QUESTIONS.length}</span>
                <div className={`flex items-center gap-2 text-sm font-bold font-display ${remaining < 15 ? 'text-red-400 animate-pulse' : 'text-foreground'}`}>
                  <Clock className="w-4 h-4" /> {mins}:{secs}
                </div>
                <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${QUESTIONS[current].category === 'Technical' ? 'bg-blue-500/20 text-blue-400' : 'bg-green-500/20 text-green-400'}`}>
                  {QUESTIONS[current].category}
                </span>
              </div>

              <div className="w-full h-1.5 bg-muted rounded-full mb-8 overflow-hidden">
                <div className="h-full bg-green-500 rounded-full transition-all duration-300" style={{ width: `${((TOTAL_TIME_PER_Q - remaining) / TOTAL_TIME_PER_Q) * 100}%` }} />
              </div>

              <div className="p-6 md:p-8 rounded-2xl border border-border bg-card mb-6">
                <p className="text-xl font-display font-semibold text-foreground text-pretty leading-relaxed">{QUESTIONS[current].q}</p>
              </div>

              <textarea
                rows={6}
                value={answers[current]}
                onChange={e => setAnswers(prev => { const a = [...prev]; a[current] = e.target.value; return a; })}
                placeholder="Type your answer here... Be specific, use examples, and be thorough."
                className="w-full px-4 py-3 rounded-xl border border-border bg-card text-foreground text-sm focus:outline-none focus:border-primary transition-colors resize-none mb-6"
              />

              <div className="flex items-center justify-end">
                <button onClick={nextQuestion}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-primary-foreground font-bold text-sm hover:opacity-90 transition-opacity">
                  {current < QUESTIONS.length - 1 ? 'Next Question' : 'Finish'} <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {phase === 'result' && (
            <div className="flex flex-col items-center gap-8 py-8">
              {/* Overall */}
              <div className={`w-24 h-24 rounded-full flex items-center justify-center text-4xl font-black font-display border-4 ${overall >= 80 ? 'border-green-500 text-green-400 bg-green-500/10' : 'border-primary text-primary bg-primary/10'}`}>{overall}%</div>
              <div className="text-center">
                <h2 className="text-2xl font-display font-bold text-foreground">{overall >= 80 ? '🎉 Certificate Earned!' : 'Good Performance!'}</h2>
                {overall >= 80 && <p className="text-green-400 text-sm mt-2">Score ≥ 80% — certificate saved to your profile.</p>}
              </div>

              {/* Score axes */}
              <div className="grid grid-cols-3 gap-4 w-full max-w-lg">
                {[
                  { label: 'Communication', score: avgComm, color: 'text-green-400', bar: 'bg-green-500' },
                  { label: 'Technical', score: avgTech, color: 'text-blue-400', bar: 'bg-blue-500' },
                  { label: 'Confidence', score: avgConf, color: 'text-amber-400', bar: 'bg-amber-500' },
                ].map(ax => (
                  <div key={ax.label} className="p-4 rounded-xl border border-border bg-card text-center">
                    <div className={`text-3xl font-display font-black ${ax.color}`}>{ax.score}</div>
                    <div className="text-xs text-muted-foreground mt-1 mb-2">{ax.label}</div>
                    <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
                      <div className={`h-full ${ax.bar} rounded-full transition-all duration-700`} style={{ width: `${ax.score}%` }} />
                    </div>
                  </div>
                ))}
              </div>

              {/* Per-question breakdown */}
              <div className="w-full space-y-4">
                <h3 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">Question Breakdown</h3>
                {QUESTIONS.map((q, i) => {
                  const s = allScores[i];
                  if (!s) return null;
                  const tips = suggestionFor(s, q.category);
                  const qOverall = Math.round((s.communication + s.technical + s.confidence) / 3);
                  return (
                    <div key={q.id} className="p-5 rounded-2xl border border-border bg-card">
                      <div className="flex items-start justify-between gap-4 mb-3">
                        <p className="text-sm font-medium text-foreground text-pretty flex-1">{i + 1}. {q.q}</p>
                        <span className={`text-sm font-black font-display shrink-0 ${qOverall >= 70 ? 'text-green-400' : qOverall >= 50 ? 'text-amber-400' : 'text-red-400'}`}>{qOverall}%</span>
                      </div>
                      {answers[i] && (
                        <p className="text-xs text-muted-foreground italic mb-3 line-clamp-2 bg-muted/40 px-3 py-2 rounded-lg">"{answers[i]}"</p>
                      )}
                      <div className="space-y-1">
                        {tips.map((t, j) => (
                          <p key={j} className="text-xs text-foreground flex items-start gap-2">
                            <span className="text-primary mt-0.5">•</span>{t}
                          </p>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <button onClick={() => { start(); }}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-border bg-card text-foreground text-sm font-semibold hover:border-primary/40 transition-all">
                  <RotateCcw className="w-4 h-4" /> Retry
                </button>
                <button onClick={() => navigate('/leaderboard')}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90 transition-opacity">
                  <Trophy className="w-4 h-4" /> Leaderboard
                </button>
              </div>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
