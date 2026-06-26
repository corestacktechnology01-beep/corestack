import { useEffect, useState } from 'react';
import { supabase } from '@/db/supabase';
import type { ActivityLog } from '@/types/types';
import { Activity } from 'lucide-react';

export default function ActivityPage() {
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.from('activity_logs').select('*').order('created_at', { ascending: false }).limit(100)
      .then(({ data }) => { setLogs(data || []); setLoading(false); });
  }, []);

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-display font-bold text-foreground">Activity Logs</h1>

      <div className="rounded-xl border border-border bg-card overflow-x-auto">
        <table className="w-full min-w-max">
          <thead>
            <tr className="border-b border-border">
              {['Action', 'Entity', 'Details', 'IP Address', 'Timestamp'].map(h => (
                <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide whitespace-nowrap">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={5} className="px-4 py-12 text-center">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto" />
              </td></tr>
            ) : logs.length === 0 ? (
              <tr><td colSpan={5} className="px-4 py-12 text-center text-sm text-muted-foreground">No activity recorded</td></tr>
            ) : logs.map(log => (
              <tr key={log.id} className="border-b border-border/50 last:border-0 hover:bg-muted/20">
                <td className="px-4 py-3 whitespace-nowrap">
                  <div className="flex items-center gap-2">
                    <Activity className="w-3.5 h-3.5 text-primary shrink-0" />
                    <span className="text-sm text-foreground capitalize">{log.action.replace(/_/g, ' ')}</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-sm text-muted-foreground capitalize whitespace-nowrap">{log.entity_type || '—'}</td>
                <td className="px-4 py-3 text-sm text-muted-foreground max-w-xs truncate">{log.details ? JSON.stringify(log.details) : '—'}</td>
                <td className="px-4 py-3 text-sm text-muted-foreground whitespace-nowrap">{log.ip_address || '—'}</td>
                <td className="px-4 py-3 text-sm text-muted-foreground whitespace-nowrap">{new Date(log.created_at).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
