// Generic admin CRUD table component used by many management pages
import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Plus, Loader2 } from 'lucide-react';

interface Column<T> {
  key: keyof T | string;
  label: string;
  render?: (row: T) => React.ReactNode;
}

interface AdminTableProps<T extends { id: string }> {
  title: string;
  data: T[];
  columns: Column<T>[];
  loading: boolean;
  searchPlaceholder?: string;
  onSearch?: (q: string) => void;
  onAdd?: () => void;
  addLabel?: string;
  emptyMessage?: string;
  actions?: (row: T) => React.ReactNode;
}

export function AdminTable<T extends { id: string }>({
  title, data, columns, loading,
  searchPlaceholder = 'Search…',
  onSearch, onAdd, addLabel = 'Add New',
  emptyMessage = 'No records found.',
  actions,
}: AdminTableProps<T>) {
  const [q, setQ] = useState('');

  const handleSearch = (v: string) => {
    setQ(v);
    onSearch?.(v);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <h2 className="text-xl font-display font-bold text-foreground">{title}</h2>
        <div className="flex gap-2">
          {onSearch && (
            <div className="relative flex-1 sm:w-56">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder={searchPlaceholder}
                value={q}
                onChange={e => handleSearch(e.target.value)}
                className="pl-9 h-9"
              />
            </div>
          )}
          {onAdd && (
            <Button size="sm" className="h-9 bg-primary hover:bg-primary/90 text-primary-foreground shrink-0" onClick={onAdd}>
              <Plus className="w-4 h-4 mr-1" /> {addLabel}
            </Button>
          )}
        </div>
      </div>

      <div className="rounded-xl border border-border bg-card">
        <div className="overflow-x-auto w-full max-w-full">
          <table className="w-full min-w-max [&>div]:max-w-full">
            <thead>
              <tr className="border-b border-border">
                {columns.map(col => (
                  <th key={String(col.key)} className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide whitespace-nowrap">
                    {col.label}
                  </th>
                ))}
                {actions && <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide whitespace-nowrap">Actions</th>}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={columns.length + (actions ? 1 : 0)} className="px-4 py-12 text-center">
                  <Loader2 className="w-6 h-6 animate-spin text-primary mx-auto" />
                </td></tr>
              ) : data.length === 0 ? (
                <tr><td colSpan={columns.length + (actions ? 1 : 0)} className="px-4 py-12 text-center text-sm text-muted-foreground">
                  {emptyMessage}
                </td></tr>
              ) : data.map(row => (
                <tr key={row.id} className="border-b border-border/50 last:border-0 hover:bg-muted/20 transition-colors">
                  {columns.map(col => (
                    <td key={String(col.key)} className="px-4 py-3 text-sm text-foreground whitespace-nowrap">
                      {col.render ? col.render(row) : String((row as Record<string, unknown>)[String(col.key)] ?? '')}
                    </td>
                  ))}
                  {actions && <td className="px-4 py-3 whitespace-nowrap">{actions(row)}</td>}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
