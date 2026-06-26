import { useState, useEffect } from 'react';
import { supabase } from '@/db/supabase';
import { Plus, Trash2, Edit2, Save, X, ChevronDown, ChevronUp, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';

type ChallengeType = 'programming-quiz' | 'aptitude-quiz';
type Difficulty = 'Easy' | 'Medium' | 'Hard';

interface QuizQuestion {
  id?: string;
  challenge_type: ChallengeType;
  difficulty: Difficulty;
  question: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  correct_answer: number; // 0-3
  category?: string;
  is_active: boolean;
}

const EMPTY_Q: QuizQuestion = {
  challenge_type: 'programming-quiz',
  difficulty: 'Medium',
  question: '',
  option_a: '',
  option_b: '',
  option_c: '',
  option_d: '',
  correct_answer: 0,
  category: '',
  is_active: true,
};

export default function ChallengesAdminPage() {
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [editId, setEditId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<QuizQuestion>({ ...EMPTY_Q });
  const [filterType, setFilterType] = useState<ChallengeType | 'all'>('all');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => { fetchQuestions(); }, []);

  async function fetchQuestions() {
    setLoading(true);
    const { data } = await supabase
      .from('quiz_questions')
      .select('*')
      .order('created_at', { ascending: false });
    setQuestions(data ?? []);
    setLoading(false);
  }

  async function save() {
    if (!form.question || !form.option_a || !form.option_b || !form.option_c || !form.option_d) {
      toast.error('Please fill in all fields');
      return;
    }
    if (editId) {
      const { error } = await supabase.from('quiz_questions').update(form).eq('id', editId);
      if (error) { toast.error('Failed to update question'); return; }
      toast.success('Question updated');
      setEditId(null);
    } else {
      const { error } = await supabase.from('quiz_questions').insert([form]);
      if (error) { toast.error('Failed to add question'); return; }
      toast.success('Question added');
    }
    setShowForm(false);
    setForm({ ...EMPTY_Q });
    fetchQuestions();
  }

  async function deleteQ(id: string) {
    const { error } = await supabase.from('quiz_questions').delete().eq('id', id);
    if (error) { toast.error('Failed to delete'); return; }
    toast.success('Deleted');
    fetchQuestions();
  }

  function startEdit(q: QuizQuestion) {
    setForm({ ...q });
    setEditId(q.id ?? null);
    setShowForm(true);
  }

  function cancelForm() {
    setShowForm(false);
    setEditId(null);
    setForm({ ...EMPTY_Q });
  }

  const filtered = filterType === 'all' ? questions : questions.filter(q => q.challenge_type === filterType);
  const diffColor = (d: Difficulty) => d === 'Easy' ? 'bg-green-500/20 text-green-400' : d === 'Medium' ? 'bg-amber-500/20 text-amber-400' : 'bg-red-500/20 text-red-400';
  const opts = ['A', 'B', 'C', 'D'];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">Challenge Questions</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage quiz and aptitude questions for the Career Challenge Hub</p>
        </div>
        <Button onClick={() => { setShowForm(true); setEditId(null); setForm({ ...EMPTY_Q }); }} className="gap-2 shrink-0">
          <Plus className="w-4 h-4" /> Add Question
        </Button>
      </div>

      {/* Filter */}
      <div className="flex flex-wrap gap-2">
        {(['all', 'programming-quiz', 'aptitude-quiz'] as const).map(t => (
          <button key={t} onClick={() => setFilterType(t)}
            className={`px-4 py-2 rounded-xl border text-sm font-medium transition-all capitalize ${filterType === t ? 'bg-primary text-primary-foreground border-primary' : 'border-border text-muted-foreground hover:border-primary/40 hover:text-foreground'}`}>
            {t === 'all' ? 'All' : t.replace('-', ' ')} {t !== 'all' && `(${questions.filter(q => q.challenge_type === t).length})`}
          </button>
        ))}
      </div>

      {/* Add / Edit form */}
      {showForm && (
        <div className="p-6 rounded-2xl border border-primary/20 bg-primary/5 space-y-4">
          <div className="flex items-center justify-between mb-2">
            <h2 className="font-display font-bold text-foreground">{editId ? 'Edit Question' : 'New Question'}</h2>
            <button onClick={cancelForm} className="text-muted-foreground hover:text-foreground"><X className="w-4 h-4" /></button>
          </div>
          <div className="grid sm:grid-cols-3 gap-4">
            <div>
              <Label className="text-sm font-normal mb-1.5 block">Challenge Type</Label>
              <Select value={form.challenge_type} onValueChange={v => setForm(f => ({ ...f, challenge_type: v as ChallengeType }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="programming-quiz">Programming Quiz</SelectItem>
                  <SelectItem value="aptitude-quiz">Aptitude Quiz</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-sm font-normal mb-1.5 block">Difficulty</Label>
              <Select value={form.difficulty} onValueChange={v => setForm(f => ({ ...f, difficulty: v as Difficulty }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Easy">Easy</SelectItem>
                  <SelectItem value="Medium">Medium</SelectItem>
                  <SelectItem value="Hard">Hard</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-sm font-normal mb-1.5 block">Category (optional)</Label>
              <Input value={form.category ?? ''} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} placeholder="e.g. Algorithms" className="px-3" />
            </div>
          </div>
          <div>
            <Label className="text-sm font-normal mb-1.5 block">Question</Label>
            <textarea rows={2} value={form.question} onChange={e => setForm(f => ({ ...f, question: e.target.value }))}
              placeholder="Enter the question text..."
              className="w-full px-3 py-2 rounded-xl border border-border bg-card text-foreground text-sm focus:outline-none focus:border-primary resize-none" />
          </div>
          <div className="grid sm:grid-cols-2 gap-3">
            {(['option_a', 'option_b', 'option_c', 'option_d'] as const).map((key, i) => (
              <div key={key}>
                <Label className="text-sm font-normal mb-1.5 block">{opts[i]}. {i === form.correct_answer ? '✓ Correct' : ''}</Label>
                <div className="flex gap-2">
                  <Input value={form[key]} onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                    placeholder={`Option ${opts[i]}`} className="px-3 flex-1" />
                  <button onClick={() => setForm(f => ({ ...f, correct_answer: i }))}
                    className={`px-3 rounded-xl border text-xs font-semibold transition-all ${form.correct_answer === i ? 'bg-green-500/20 border-green-500/40 text-green-400' : 'border-border text-muted-foreground hover:border-green-500/40'}`}>
                    ✓
                  </button>
                </div>
              </div>
            ))}
          </div>
          <div className="flex gap-3 pt-2">
            <Button onClick={save} className="gap-2"><Save className="w-4 h-4" /> {editId ? 'Update' : 'Save'}</Button>
            <Button variant="outline" onClick={cancelForm}>Cancel</Button>
          </div>
        </div>
      )}

      {/* Question list */}
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <AlertCircle className="w-10 h-10 mx-auto mb-3 opacity-30" />
          <p className="font-medium">No questions yet</p>
          <p className="text-sm">Add your first quiz question above.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(q => (
            <div key={q.id} className="rounded-2xl border border-border bg-card overflow-hidden">
              <div className="flex items-center gap-3 p-4 cursor-pointer hover:bg-muted/30 transition-colors"
                onClick={() => setExpandedId(expandedId === q.id ? null : q.id ?? null)}>
                <span className={`shrink-0 text-xs font-semibold px-2.5 py-1 rounded-full ${diffColor(q.difficulty)}`}>{q.difficulty}</span>
                <span className="flex-1 min-w-0 text-sm font-medium text-foreground truncate">{q.question}</span>
                <span className="shrink-0 text-xs text-muted-foreground capitalize hidden sm:block">{q.challenge_type.replace('-', ' ')}</span>
                <div className="flex items-center gap-2 shrink-0">
                  <button onClick={e => { e.stopPropagation(); startEdit(q); }} className="text-muted-foreground hover:text-foreground p-1.5 rounded-lg hover:bg-muted transition-all">
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button onClick={e => { e.stopPropagation(); if (q.id) deleteQ(q.id); }} className="text-muted-foreground hover:text-red-400 p-1.5 rounded-lg hover:bg-red-500/10 transition-all">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                  {expandedId === q.id ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
                </div>
              </div>
              {expandedId === q.id && (
                <div className="px-4 pb-4 pt-0 border-t border-border bg-muted/20">
                  <div className="grid sm:grid-cols-2 gap-2 mt-3">
                    {[q.option_a, q.option_b, q.option_c, q.option_d].map((opt, i) => (
                      <div key={i} className={`flex items-center gap-2 p-2.5 rounded-xl text-sm ${i === q.correct_answer ? 'bg-green-500/10 border border-green-500/20 text-green-400' : 'text-muted-foreground'}`}>
                        <span className="font-bold text-xs">{opts[i]}.</span>{opt}
                        {i === q.correct_answer && <span className="ml-auto text-xs font-semibold">✓ Correct</span>}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
