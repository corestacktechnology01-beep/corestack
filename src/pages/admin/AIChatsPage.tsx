import { useState, useEffect } from 'react';
import { supabase } from '@/db/supabase';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Search, Download, RefreshCw, Eye, Bot, MessageSquare, Filter } from 'lucide-react';

interface ChatLog {
  id: string;
  session_id: string;
  user_message: string;
  bot_response: string;
  created_at: string;
}

export default function AIChatsPage() {
  const [logs, setLogs] = useState<ChatLog[]>([]);
  const [filtered, setFiltered] = useState<ChatLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [sessionFilter, setSessionFilter] = useState('all');
  const [selected, setSelected] = useState<ChatLog | null>(null);

  const fetchData = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('ai_chat_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(500);
    setLogs(Array.isArray(data) ? data : []);
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const uniqueSessions = Array.from(new Set(logs.map(l => l.session_id)));

  useEffect(() => {
    let list = [...logs];
    if (sessionFilter !== 'all') list = list.filter(l => l.session_id === sessionFilter);
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(l =>
        l.user_message.toLowerCase().includes(q) ||
        l.bot_response.toLowerCase().includes(q) ||
        l.session_id.toLowerCase().includes(q)
      );
    }
    setFiltered(list);
  }, [logs, search, sessionFilter]);

  const exportCSV = () => {
    const headers = ['Session ID', 'User Message', 'Bot Response', 'Date'];
    const rows = filtered.map(l => [
      l.session_id, l.user_message, l.bot_response,
      new Date(l.created_at).toLocaleString(),
    ]);
    const csv = [headers, ...rows].map(r => r.map(c => `"${c.replace(/"/g, '""')}"`).join(',')).join('\n');
    const a = document.createElement('a');
    a.href = 'data:text/csv,' + encodeURIComponent(csv);
    a.download = `ai-chat-logs-${Date.now()}.csv`;
    a.click();
  };

  // Group by session for stats
  const sessionCount = uniqueSessions.length;
  const avgPerSession = sessionCount > 0 ? (logs.length / sessionCount).toFixed(1) : '0';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground flex items-center gap-2">
            <Bot className="w-6 h-6 text-primary" /> AI Chat Logs
          </h1>
          <p className="text-muted-foreground text-sm mt-1">Review all AI assistant conversations from website visitors</p>
        </div>
        <div className="flex gap-2 shrink-0">
          <Button variant="outline" size="sm" onClick={fetchData} className="gap-1.5">
            <RefreshCw className="w-3.5 h-3.5" /> Refresh
          </Button>
          <Button variant="outline" size="sm" onClick={exportCSV} className="gap-1.5">
            <Download className="w-3.5 h-3.5" /> Export CSV
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Messages', value: logs.length },
          { label: 'Unique Sessions', value: sessionCount },
          { label: 'Avg per Session', value: avgPerSession },
          { label: 'Today', value: logs.filter(l => new Date(l.created_at).toDateString() === new Date().toDateString()).length },
        ].map(s => (
          <div key={s.label} className="p-4 rounded-xl border border-border bg-card">
            <div className="text-2xl font-display font-bold text-foreground">{s.value}</div>
            <div className="text-xs text-muted-foreground">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Search messages or session ID…" className="pl-9"
            value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <Select value={sessionFilter} onValueChange={setSessionFilter}>
          <SelectTrigger className="w-full sm:w-52">
            <Filter className="w-3.5 h-3.5 mr-2 text-muted-foreground" />
            <SelectValue placeholder="Session" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Sessions</SelectItem>
            {uniqueSessions.slice(0, 50).map(s => (
              <SelectItem key={s} value={s}>{s.slice(0, 24)}…</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <div className="rounded-xl border border-border bg-card overflow-x-auto">
        <table className="w-full min-w-[700px]">
          <thead>
            <tr className="border-b border-border bg-muted/30">
              {['Session ID', 'User Message', 'Bot Response', 'Date', 'View'].map(h => (
                <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider whitespace-nowrap">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              Array.from({ length: 8 }).map((_, i) => (
                <tr key={i} className="border-b border-border last:border-0">
                  {Array.from({ length: 5 }).map((_, j) => (
                    <td key={j} className="px-4 py-3"><div className="h-4 rounded bg-muted animate-pulse" /></td>
                  ))}
                </tr>
              ))
            ) : filtered.length === 0 ? (
              <tr><td colSpan={5} className="px-4 py-12 text-center text-muted-foreground text-sm">No chat logs found</td></tr>
            ) : filtered.map(log => (
              <tr key={log.id} className="border-b border-border last:border-0 hover:bg-muted/20 transition-colors">
                <td className="px-4 py-3 whitespace-nowrap font-mono text-xs text-muted-foreground">
                  {log.session_id.slice(-12)}
                </td>
                <td className="px-4 py-3">
                  <div className="text-sm text-foreground max-w-[220px] truncate">{log.user_message}</div>
                </td>
                <td className="px-4 py-3">
                  <div className="text-sm text-muted-foreground max-w-[240px] truncate">{log.bot_response.slice(0, 80)}…</div>
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-xs text-muted-foreground">
                  {new Date(log.created_at).toLocaleDateString()}
                </td>
                <td className="px-4 py-3">
                  <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => setSelected(log)}>
                    <Eye className="w-3.5 h-3.5" />
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="text-xs text-muted-foreground">{filtered.length} of {logs.length} messages</p>

      {/* Detail dialog */}
      <Dialog open={!!selected} onOpenChange={v => !v && setSelected(null)}>
        <DialogContent className="max-w-[calc(100%-2rem)] md:max-w-lg max-h-[90dvh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-primary" /> Chat Exchange
            </DialogTitle>
          </DialogHeader>
          {selected && (
            <div className="space-y-4">
              <div className="text-xs text-muted-foreground">
                Session: <span className="font-mono text-foreground">{selected.session_id}</span>
                <span className="ml-3">{new Date(selected.created_at).toLocaleString()}</span>
              </div>
              <div className="space-y-3">
                {/* User message */}
                <div className="flex justify-end">
                  <div className="max-w-[85%] px-4 py-2.5 rounded-2xl rounded-br-sm bg-primary text-primary-foreground text-sm">
                    {selected.user_message}
                  </div>
                </div>
                {/* Bot response */}
                <div className="flex gap-2">
                  <div className="w-8 h-8 rounded-full shrink-0 flex items-center justify-center"
                    style={{ background: 'linear-gradient(135deg, #ff6b2b, #ff9f5a)' }}>
                    <Bot className="w-4 h-4 text-white" />
                  </div>
                  <div className="max-w-[85%] px-4 py-2.5 rounded-2xl rounded-bl-sm bg-muted border border-border text-sm text-foreground whitespace-pre-wrap">
                    {selected.bot_response}
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
