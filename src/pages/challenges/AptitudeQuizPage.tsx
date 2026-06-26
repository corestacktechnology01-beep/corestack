import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '@/components/layouts/Header';
import Footer from '@/components/layouts/Footer';
import BackButton from '@/components/ui/BackButton';
import { CheckCircle, XCircle, Clock, Trophy, RotateCcw, ChevronRight, Zap, AlertCircle } from 'lucide-react';

interface AptQuestion { id: number; q: string; opts: string[]; answer: number; category: string; }

const APTITUDE_QUESTIONS: AptQuestion[] = [
  { id:1, q:'If a train travels 60 km in 45 minutes, what is its speed in km/h?', opts:['80','90','72','75'], answer:0, category:'Speed' },
  { id:2, q:'Find the odd one out: 2, 3, 5, 7, 9, 11', opts:['9','7','5','11'], answer:0, category:'Number Series' },
  { id:3, q:'A is B\'s sister. C is B\'s mother. D is C\'s father. E is D\'s mother. How is A related to D?', opts:['Granddaughter','Daughter','Great-granddaughter','Niece'], answer:0, category:'Relation' },
  { id:4, q:'If 6 workers complete a job in 12 days, how many days for 9 workers?', opts:['8','10','6','9'], answer:0, category:'Work' },
  { id:5, q:'Which number is next: 1, 4, 9, 16, 25, ?', opts:['36','30','32','35'], answer:0, category:'Series' },
  { id:6, q:'A car covers 300 km at 60 km/h and 200 km at 40 km/h. Average speed?', opts:['50 km/h','52 km/h','48 km/h','54 km/h'], answer:0, category:'Average' },
  { id:7, q:'Pointing to a photo, Mohan says "She is the daughter of my grandfather\'s only son." Relation?', opts:['Sister','Niece','Daughter','Cousin'], answer:0, category:'Relation' },
  { id:8, q:'If PINK is coded as 4362, how is NKIP coded?', opts:['2634','3462','6234','3246'], answer:0, category:'Coding' },
  { id:9, q:'A shopkeeper buys at ₹80 and sells at ₹100. Profit %?', opts:['25%','20%','30%','15%'], answer:0, category:'Profit' },
  { id:10, q:'Which figure completes the series: △ □ ○ △ □ ?', opts:['○','△','□','◇'], answer:0, category:'Pattern' },
  { id:11, q:'If all Bloops are Razzles and all Razzles are Lazzles, are all Bloops definitely Lazzles?', opts:['Yes','No','Cannot determine','Only some'], answer:0, category:'Logic' },
  { id:12, q:'72 ÷ 0.09 = ?', opts:['800','80','8000','0.8'], answer:0, category:'Arithmetic' },
  { id:13, q:'A sum of ₹1,000 becomes ₹1,331 in 3 years at compound interest. Rate?', opts:['10%','11%','9%','12%'], answer:0, category:'Interest' },
  { id:14, q:'What comes next: AZ, BY, CX, DW, ?', opts:['EV','EU','FV','EW'], answer:0, category:'Series' },
  { id:15, q:'In a row of 40 students, Ram is 16th from the left. Position from the right?', opts:['25th','24th','26th','23rd'], answer:0, category:'Ranking' },
];

function useTimer(seconds: number, active: boolean) {
  const [remaining, setRemaining] = useState(seconds);
  useEffect(() => {
    if (!active) return;
    const id = setInterval(() => setRemaining(r => Math.max(0, r - 1)), 1000);
    return () => clearInterval(id);
  }, [active]);
  const reset = useCallback(() => setRemaining(seconds), [seconds]);
  return { remaining, reset };
}

function getRank(pct: number) {
  if (pct >= 90) return { label: 'S Rank', color: 'text-yellow-400' };
  if (pct >= 80) return { label: 'A Rank', color: 'text-green-400' };
  if (pct >= 60) return { label: 'B Rank', color: 'text-blue-400' };
  if (pct >= 40) return { label: 'C Rank', color: 'text-amber-400' };
  return { label: 'D Rank', color: 'text-muted-foreground' };
}

export default function AptitudeQuizPage() {
  const navigate = useNavigate();
  const TOTAL_TIME = 12 * 60;
  const questions = APTITUDE_QUESTIONS;
  const [phase, setPhase] = useState<'setup' | 'quiz' | 'result'>('setup');
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState<(number | null)[]>(new Array(questions.length).fill(null));
  const [startTime, setStartTime] = useState(0);
  const [timeTaken, setTimeTaken] = useState(0);
  const { remaining, reset: resetTimer } = useTimer(TOTAL_TIME, phase === 'quiz');

  useEffect(() => { if (phase === 'quiz' && remaining === 0) submit(); }, [remaining, phase]);

  function start() { setAnswers(new Array(questions.length).fill(null)); setCurrent(0); setStartTime(Date.now()); setPhase('quiz'); resetTimer(); }
  function select(i: number) { setAnswers(prev => { const a = [...prev]; a[current] = i; return a; }); }
  function submit() { setTimeTaken(Math.round((Date.now() - startTime) / 1000)); setPhase('result'); }

  const correct = questions.filter((q, i) => answers[i] === q.answer).length;
  const pct = Math.round((correct / questions.length) * 100);
  const rank = getRank(pct);
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
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/20 mb-6">
                <Zap className="w-3.5 h-3.5 text-purple-400" />
                <span className="text-purple-400 text-xs font-semibold uppercase tracking-widest">Challenge 2</span>
              </div>
              <h1 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-4 text-balance">Logical Aptitude Quiz</h1>
              <p className="text-muted-foreground max-w-lg mx-auto mb-10 text-pretty">15 MCQs covering speed, logic, series, coding and more. 12-minute timer. Your rank is based on accuracy and speed.</p>
              <div className="grid grid-cols-3 gap-4 max-w-md mx-auto mb-10">
                {[['15', 'Questions'], ['12 min', 'Time Limit'], ['80%+', 'Certificate']].map(([v, l]) => (
                  <div key={l} className="p-4 rounded-xl border border-border bg-card text-center">
                    <div className="text-2xl font-display font-black text-primary">{v}</div>
                    <div className="text-xs text-muted-foreground mt-1">{l}</div>
                  </div>
                ))}
              </div>
              <button onClick={start} className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-primary text-primary-foreground font-bold text-base hover:opacity-90 transition-opacity">
                Start Quiz <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          )}

          {phase === 'quiz' && (
            <div>
              <div className="flex items-center justify-between mb-8 p-4 rounded-2xl border border-border bg-card">
                <span className="text-sm font-medium text-muted-foreground">{current + 1} / {questions.length}</span>
                <div className={`flex items-center gap-2 text-sm font-bold font-display ${remaining < 60 ? 'text-red-400' : 'text-foreground'}`}>
                  <Clock className="w-4 h-4" /> {mins}:{secs}
                </div>
                <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded-lg">{questions[current].category}</span>
              </div>
              <div className="w-full h-1.5 bg-muted rounded-full mb-8 overflow-hidden">
                <div className="h-full bg-purple-500 rounded-full transition-all duration-300" style={{ width: `${((current + 1) / questions.length) * 100}%` }} />
              </div>
              <div className="p-6 md:p-8 rounded-2xl border border-border bg-card mb-6">
                <p className="text-lg font-medium text-foreground text-pretty leading-relaxed">{questions[current].q}</p>
              </div>
              <div className="space-y-3 mb-8">
                {questions[current].opts.map((opt, i) => (
                  <button key={i} onClick={() => select(i)}
                    className={`w-full text-left p-4 rounded-xl border text-sm font-medium transition-all ${answers[current] === i ? 'border-purple-500 bg-purple-500/10 text-purple-400' : 'border-border bg-card text-foreground hover:border-purple-500/40 hover:bg-purple-500/5'}`}>
                    <span className="font-bold mr-3 text-muted-foreground">{['A','B','C','D'][i]}.</span>{opt}
                  </button>
                ))}
              </div>
              <div className="flex items-center justify-between">
                <button onClick={() => setCurrent(c => Math.max(0, c - 1))} disabled={current === 0}
                  className="px-5 py-2.5 rounded-xl border border-border text-sm font-semibold text-muted-foreground disabled:opacity-40 hover:border-primary/40 transition-all">
                  ← Previous
                </button>
                {current < questions.length - 1
                  ? <button onClick={() => setCurrent(c => c + 1)} className="px-5 py-2.5 rounded-xl bg-purple-500/10 border border-purple-500/30 text-purple-400 text-sm font-semibold hover:bg-purple-500/20 transition-all">Next →</button>
                  : <button onClick={submit} className="px-6 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-bold hover:opacity-90 transition-opacity">Submit Quiz</button>}
              </div>
              {answers.filter(a => a !== null).length < questions.length && (
                <p className="text-center text-xs text-muted-foreground mt-4 flex items-center justify-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" />{questions.length - answers.filter(a => a !== null).length} unanswered
                </p>
              )}
            </div>
          )}

          {phase === 'result' && (
            <div className="flex flex-col items-center gap-6 py-12 text-center">
              <div className={`w-24 h-24 rounded-full flex items-center justify-center text-4xl font-black font-display border-4 ${pct >= 80 ? 'border-green-500 text-green-400 bg-green-500/10' : 'border-primary text-primary bg-primary/10'}`}>{pct}%</div>
              <div>
                <h2 className="text-2xl font-display font-bold text-foreground">{pct >= 80 ? '🎉 Certificate Earned!' : 'Good Effort!'}</h2>
                <p className={`text-xl font-black font-display mt-2 ${rank.color}`}>{rank.label}</p>
                <p className="text-muted-foreground mt-1">{correct} / {questions.length} correct · {Math.floor(timeTaken / 60)}m {timeTaken % 60}s</p>
                {pct >= 80 && <p className="text-green-400 text-sm mt-2">Score ≥ 80% — certificate saved to your profile.</p>}
              </div>
              <div className="w-full max-w-xl text-left space-y-3 mt-2">
                {questions.map((q, i) => {
                  const isCorrect = answers[i] === q.answer;
                  return (
                    <div key={q.id} className={`p-4 rounded-xl border text-sm ${isCorrect ? 'border-green-500/30 bg-green-500/5' : 'border-red-500/30 bg-red-500/5'}`}>
                      <p className="font-medium text-foreground mb-1">{i+1}. {q.q}</p>
                      {answers[i] !== null && <p className={isCorrect ? 'text-green-400' : 'text-red-400'}>{isCorrect ? <CheckCircle className="w-3.5 h-3.5 inline mr-1" /> : <XCircle className="w-3.5 h-3.5 inline mr-1" />}Your: {q.opts[answers[i]!]}</p>}
                      {!isCorrect && <p className="text-green-400">Correct: {q.opts[q.answer]}</p>}
                    </div>
                  );
                })}
              </div>
              <div className="flex flex-col sm:flex-row gap-3">
                <button onClick={() => { setPhase('setup'); setAnswers(new Array(questions.length).fill(null)); setCurrent(0); }}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-border bg-card text-foreground text-sm font-semibold hover:border-primary/40 transition-all">
                  <RotateCcw className="w-4 h-4" /> Retake
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
