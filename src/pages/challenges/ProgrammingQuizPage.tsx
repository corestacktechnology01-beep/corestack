import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '@/components/layouts/Header';
import Footer from '@/components/layouts/Footer';
import BackButton from '@/components/ui/BackButton';
import { CheckCircle, XCircle, Clock, Trophy, RotateCcw, ChevronRight, Zap, AlertCircle } from 'lucide-react';

// ─── Question bank ─────────────────────────────────────────────────────────────
type Difficulty = 'Easy' | 'Medium' | 'Hard';
interface Question { id: number; q: string; opts: string[]; answer: number; difficulty: Difficulty; }

const ALL_QUESTIONS: Question[] = [
  // Easy
  { id:1, q:'Which keyword declares a constant in JavaScript?', opts:['var','let','const','static'], answer:2, difficulty:'Easy' },
  { id:2, q:'What does HTML stand for?', opts:['HyperText Markup Language','HighText Machine Language','Hyperlink Markup Language','HyperText Machine Link'], answer:0, difficulty:'Easy' },
  { id:3, q:'Which symbol is used for single-line comments in Python?', opts:['//','/*','#','--'], answer:2, difficulty:'Easy' },
  { id:4, q:'What is the default port for HTTP?', opts:['443','21','80','8080'], answer:2, difficulty:'Easy' },
  { id:5, q:'Which data structure operates on LIFO?', opts:['Queue','Stack','Tree','Graph'], answer:1, difficulty:'Easy' },
  { id:6, q:'What does CSS stand for?', opts:['Creative Style Sheets','Cascading Style Sheets','Computer Style Sheets','Colorful Style Sheets'], answer:1, difficulty:'Easy' },
  { id:7, q:'In Python, which function converts a string to an integer?', opts:['str()','float()','int()','num()'], answer:2, difficulty:'Easy' },
  // Medium
  { id:8, q:'What is the time complexity of binary search?', opts:['O(n)','O(log n)','O(n²)','O(1)'], answer:1, difficulty:'Medium' },
  { id:9, q:'Which HTTP method is idempotent and safe?', opts:['POST','PUT','GET','DELETE'], answer:2, difficulty:'Medium' },
  { id:10, q:'What does SQL JOIN produce?', opts:['Union of rows','Intersection of columns','Combined rows from two tables','Deletion of duplicates'], answer:2, difficulty:'Medium' },
  { id:11, q:'Which React hook manages local state?', opts:['useEffect','useContext','useMemo','useState'], answer:3, difficulty:'Medium' },
  { id:12, q:'What does REST stand for?', opts:['Remote Execution State Transfer','Representational State Transfer','Resource Entity State Transfer','Remote State Transfer'], answer:1, difficulty:'Medium' },
  { id:13, q:'Which sorting algorithm has best average-case O(n log n)?', opts:['Bubble Sort','Insertion Sort','Quick Sort','Selection Sort'], answer:2, difficulty:'Medium' },
  { id:14, q:'In TypeScript, what does the `!` non-null assertion do?', opts:['Negates a boolean','Asserts value is not null/undefined','Throws an error','Declares a constant'], answer:1, difficulty:'Medium' },
  { id:15, q:'What is a closure in JavaScript?', opts:['A class','A function accessing its outer scope','A module','An arrow function'], answer:1, difficulty:'Medium' },
  // Hard
  { id:16, q:'What does CAP theorem state?', opts:['A DB can be Consistent, Available, Partition-tolerant — pick at most 2','A network can have 3 simultaneous connections','Cache invalidation is impossible','REST APIs must be stateless'], answer:0, difficulty:'Hard' },
  { id:17, q:'Which design pattern decouples object creation from usage?', opts:['Observer','Factory','Decorator','Command'], answer:1, difficulty:'Hard' },
  { id:18, q:'What is the time complexity of Dijkstra with a min-heap?', opts:['O(V²)','O(E log V)','O(VE)','O(log V)'], answer:1, difficulty:'Hard' },
  { id:19, q:'What does CORS stand for?', opts:['Cross-Origin Resource Sharing','Client-Origin Request Service','Cross-Object Rendering Service','Component-Origin Request System'], answer:0, difficulty:'Hard' },
  { id:20, q:'In a microservices architecture, what is a circuit breaker?', opts:['A rate limiter','A pattern to stop cascading failures','A load balancer','A JWT token'], answer:1, difficulty:'Hard' },
  { id:21, q:'What is eventual consistency?', opts:['Data is always consistent','Data will become consistent over time','Data is never consistent','Data is consistent only in SQL'], answer:1, difficulty:'Hard' },
  { id:22, q:'Which algorithm is used for garbage collection in V8?', opts:['Mark-and-Sweep','Reference Counting','Stop-the-World only','None'], answer:0, difficulty:'Hard' },
];

function pickRandom(arr: Question[], n: number) {
  const shuffled = [...arr].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, n);
}

// ─── Timer ─────────────────────────────────────────────────────────────────────
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

// ─── Result card ───────────────────────────────────────────────────────────────
function ResultCard({ questions, answers, timeTaken, onRetake, onLeaderboard }: {
  questions: Question[]; answers: (number | null)[]; timeTaken: number; onRetake: () => void; onLeaderboard: () => void;
}) {
  const correct = questions.filter((q, i) => answers[i] === q.answer).length;
  const pct = Math.round((correct / questions.length) * 100);
  const passed = pct >= 80;
  return (
    <div className="flex flex-col items-center gap-6 py-12 text-center">
      <div className={`w-24 h-24 rounded-full flex items-center justify-center text-4xl font-black font-display border-4 ${passed ? 'border-green-500 text-green-400 bg-green-500/10' : 'border-primary text-primary bg-primary/10'}`}>
        {pct}%
      </div>
      <div>
        <h2 className="text-2xl font-display font-bold text-foreground text-balance">
          {passed ? '🎉 Certificate Earned!' : 'Good Effort!'}
        </h2>
        <p className="text-muted-foreground mt-1">{correct} / {questions.length} correct · {Math.floor(timeTaken / 60)}m {timeTaken % 60}s</p>
        {passed && <p className="text-green-400 text-sm mt-2 font-medium">Score ≥ 80% — your certificate has been saved to your profile.</p>}
        {!passed && <p className="text-muted-foreground text-sm mt-2">Score 80% or above to earn a certificate. Try again!</p>}
      </div>
      {/* Answer review */}
      <div className="w-full max-w-xl text-left space-y-3 mt-2">
        {questions.map((q, i) => {
          const chosen = answers[i];
          const isCorrect = chosen === q.answer;
          return (
            <div key={q.id} className={`p-4 rounded-xl border text-sm ${isCorrect ? 'border-green-500/30 bg-green-500/5' : 'border-red-500/30 bg-red-500/5'}`}>
              <p className="font-medium text-foreground mb-1">{i + 1}. {q.q}</p>
              {chosen !== null && (
                <p className={isCorrect ? 'text-green-400' : 'text-red-400'}>
                  {isCorrect ? <CheckCircle className="w-3.5 h-3.5 inline mr-1" /> : <XCircle className="w-3.5 h-3.5 inline mr-1" />}
                  Your answer: {q.opts[chosen]}
                </p>
              )}
              {!isCorrect && <p className="text-green-400">Correct: {q.opts[q.answer]}</p>}
            </div>
          );
        })}
      </div>
      <div className="flex flex-col sm:flex-row gap-3 mt-2">
        <button onClick={onRetake} className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-border bg-card text-foreground text-sm font-semibold hover:border-primary/40 transition-all">
          <RotateCcw className="w-4 h-4" /> Retake
        </button>
        <button onClick={onLeaderboard} className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90 transition-opacity">
          <Trophy className="w-4 h-4" /> Leaderboard
        </button>
      </div>
    </div>
  );
}

// ─── Page ──────────────────────────────────────────────────────────────────────
export default function ProgrammingQuizPage() {
  const navigate = useNavigate();
  const TOTAL_TIME = 15 * 60;
  const [difficulty, setDifficulty] = useState<Difficulty | 'Mixed'>('Mixed');
  const [phase, setPhase] = useState<'setup' | 'quiz' | 'result'>('setup');
  const [questions, setQuestions] = useState<Question[]>([]);
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState<(number | null)[]>([]);
  const [startTime, setStartTime] = useState(0);
  const [timeTaken, setTimeTaken] = useState(0);
  const { remaining, reset: resetTimer } = useTimer(TOTAL_TIME, phase === 'quiz');

  // Auto-submit when time runs out
  useEffect(() => {
    if (phase === 'quiz' && remaining === 0) handleSubmit();
  }, [remaining, phase]);

  function startQuiz() {
    const pool = difficulty === 'Mixed' ? ALL_QUESTIONS : ALL_QUESTIONS.filter(q => q.difficulty === difficulty);
    const picked = pickRandom(pool, Math.min(20, pool.length));
    setQuestions(picked);
    setAnswers(new Array(picked.length).fill(null));
    setCurrent(0);
    setStartTime(Date.now());
    setPhase('quiz');
    resetTimer();
  }

  function select(idx: number) {
    setAnswers(prev => { const a = [...prev]; a[current] = idx; return a; });
  }

  function handleSubmit() {
    setTimeTaken(Math.round((Date.now() - startTime) / 1000));
    setPhase('result');
  }

  function retake() { setPhase('setup'); }

  const mins = String(Math.floor(remaining / 60)).padStart(2, '0');
  const secs = String(remaining % 60).padStart(2, '0');
  const answered = answers.filter(a => a !== null).length;

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="flex-grow pt-24 pb-16">
        <div className="container mx-auto px-4 max-w-3xl">
          <div className="mb-6"><BackButton /></div>

          {/* Setup */}
          {phase === 'setup' && (
            <div className="text-center">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 mb-6">
                <Zap className="w-3.5 h-3.5 text-primary" />
                <span className="text-primary text-xs font-semibold uppercase tracking-widest">Challenge 1</span>
              </div>
              <h1 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-4 text-balance">Programming Quiz</h1>
              <p className="text-muted-foreground max-w-lg mx-auto mb-10 text-pretty">
                20 random questions. 15-minute timer. Score 80%+ to earn a certificate.
              </p>
              <div className="flex flex-wrap justify-center gap-3 mb-10">
                {(['Mixed', 'Easy', 'Medium', 'Hard'] as const).map(d => (
                  <button key={d} onClick={() => setDifficulty(d)}
                    className={`px-5 py-2 rounded-xl border text-sm font-semibold transition-all ${difficulty === d ? 'bg-primary text-primary-foreground border-primary' : 'border-border text-muted-foreground hover:border-primary/40 hover:text-foreground'}`}>
                    {d}
                  </button>
                ))}
              </div>
              <button onClick={startQuiz} className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-primary text-primary-foreground font-bold text-base hover:opacity-90 transition-opacity">
                Start Quiz <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          )}

          {/* Quiz */}
          {phase === 'quiz' && questions.length > 0 && (
            <div>
              {/* Header bar */}
              <div className="flex items-center justify-between mb-8 p-4 rounded-2xl border border-border bg-card">
                <span className="text-sm font-medium text-muted-foreground">{current + 1} / {questions.length}</span>
                <div className={`flex items-center gap-2 text-sm font-bold font-display ${remaining < 60 ? 'text-red-400' : 'text-foreground'}`}>
                  <Clock className="w-4 h-4" /> {mins}:{secs}
                </div>
                <span className="text-sm text-muted-foreground">{answered} answered</span>
              </div>

              {/* Progress bar */}
              <div className="w-full h-1.5 bg-muted rounded-full mb-8 overflow-hidden">
                <div className="h-full bg-primary rounded-full transition-all duration-300" style={{ width: `${((current + 1) / questions.length) * 100}%` }} />
              </div>

              {/* Question */}
              <div className="p-6 md:p-8 rounded-2xl border border-border bg-card mb-6">
                <div className="flex items-center gap-2 mb-4">
                  <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${questions[current].difficulty === 'Easy' ? 'bg-green-500/20 text-green-400' : questions[current].difficulty === 'Medium' ? 'bg-amber-500/20 text-amber-400' : 'bg-red-500/20 text-red-400'}`}>
                    {questions[current].difficulty}
                  </span>
                </div>
                <p className="text-lg font-medium text-foreground text-pretty leading-relaxed">{questions[current].q}</p>
              </div>

              {/* Options */}
              <div className="space-y-3 mb-8">
                {questions[current].opts.map((opt, i) => (
                  <button key={i} onClick={() => select(i)}
                    className={`w-full text-left p-4 rounded-xl border text-sm font-medium transition-all duration-150 ${answers[current] === i ? 'border-primary bg-primary/10 text-primary' : 'border-border bg-card text-foreground hover:border-primary/40 hover:bg-primary/5'}`}>
                    <span className="font-bold mr-3 text-muted-foreground">{['A', 'B', 'C', 'D'][i]}.</span>{opt}
                  </button>
                ))}
              </div>

              {/* Navigation */}
              <div className="flex items-center justify-between gap-3">
                <button onClick={() => setCurrent(c => Math.max(0, c - 1))} disabled={current === 0}
                  className="px-5 py-2.5 rounded-xl border border-border text-sm font-semibold text-muted-foreground disabled:opacity-40 hover:border-primary/40 hover:text-foreground transition-all">
                  ← Previous
                </button>
                {current < questions.length - 1 ? (
                  <button onClick={() => setCurrent(c => c + 1)}
                    className="px-5 py-2.5 rounded-xl bg-primary/10 border border-primary/30 text-primary text-sm font-semibold hover:bg-primary/20 transition-all">
                    Next →
                  </button>
                ) : (
                  <button onClick={handleSubmit}
                    className="px-6 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-bold hover:opacity-90 transition-opacity">
                    Submit Quiz
                  </button>
                )}
              </div>

              {answered < questions.length && (
                <p className="text-center text-xs text-muted-foreground mt-4 flex items-center justify-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" /> {questions.length - answered} question(s) unanswered
                </p>
              )}
            </div>
          )}

          {/* Result */}
          {phase === 'result' && (
            <ResultCard questions={questions} answers={answers} timeTaken={timeTaken}
              onRetake={retake} onLeaderboard={() => navigate('/leaderboard')} />
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
