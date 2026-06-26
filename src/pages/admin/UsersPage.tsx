import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/db/supabase';
import type { Profile } from '@/types/types';
import { AdminTable } from '@/components/admin/AdminTable';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { Pencil, UserPlus } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

export default function UsersPage() {
  const [users, setUsers] = useState<Profile[]>([]);
  const [filtered, setFiltered] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editUser, setEditUser] = useState<Profile | null>(null);
  const [role, setRole] = useState<'user' | 'admin'>('user');
  const [addOpen, setAddOpen] = useState(false);
  const [newUsername, setNewUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [adding, setAdding] = useState(false);
  const { signUpWithUsername } = useAuth();

  const fetch = useCallback(async () => {
    const { data } = await supabase.from('profiles').select('*').order('created_at', { ascending: false });
    setUsers(data || []); setFiltered(data || []); setLoading(false);
  }, []);
  useEffect(() => { fetch(); }, [fetch]);

  const handleSearch = (q: string) => {
    const lq = q.toLowerCase();
    setFiltered(users.filter(u => (u.email || '').toLowerCase().includes(lq) || (u.full_name || '').toLowerCase().includes(lq)));
  };

  const openEdit = (u: Profile) => { setEditUser(u); setRole(u.role); setOpen(true); };

  const handleUpdateRole = async () => {
    if (!editUser) return;
    const { error } = await supabase.from('profiles').update({ role }).eq('id', editUser.id);
    if (error) { toast.error('Update failed'); return; }
    toast.success('Role updated'); setOpen(false); fetch();
  };

  const handleAddAdmin = async () => {
    if (!newUsername || !newPassword) { toast.error('Username and password required'); return; }
    setAdding(true);
    const { error } = await signUpWithUsername(newUsername, newPassword);
    if (error) { toast.error(`Failed: ${error.message}`); setAdding(false); return; }
    // Promote to admin after short delay for profile creation
    setTimeout(async () => {
      const email = `${newUsername}@miaoda.com`;
      const { data: p } = await supabase.from('profiles').select('id').eq('email', email).maybeSingle();
      if (p) await supabase.from('profiles').update({ role: 'admin', full_name: newUsername }).eq('id', p.id);
      toast.success('Admin account created'); setAddOpen(false); setNewUsername(''); setNewPassword(''); setAdding(false); fetch();
    }, 1500);
  };

  const ROLE_COLORS: Record<string, string> = { admin: 'bg-primary/20 text-primary', user: 'bg-muted text-muted-foreground' };

  const columns = [
    { key: 'email', label: 'Email', render: (r: Profile) => r.email || '—' },
    { key: 'full_name', label: 'Name', render: (r: Profile) => r.full_name || '—' },
    { key: 'role', label: 'Role', render: (r: Profile) => <span className={`text-xs px-2 py-0.5 rounded-full capitalize ${ROLE_COLORS[r.role] || ''}`}>{r.role}</span> },
    { key: 'created_at', label: 'Joined', render: (r: Profile) => new Date(r.created_at).toLocaleDateString() },
  ];

  return (
    <>
      <div className="flex justify-end mb-4">
        <Button size="sm" className="bg-primary hover:bg-primary/90 text-primary-foreground" onClick={() => setAddOpen(true)}>
          <UserPlus className="w-4 h-4 mr-1.5" /> Create Admin
        </Button>
      </div>
      <AdminTable title="User Management" data={filtered} columns={columns} loading={loading}
        onSearch={handleSearch} emptyMessage="No users"
        actions={row => (
          <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={() => openEdit(row)}><Pencil className="w-3.5 h-3.5" /></Button>
        )}
      />

      {/* Edit role dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-[calc(100%-2rem)] md:max-w-sm">
          <DialogHeader><DialogTitle>Change User Role</DialogTitle></DialogHeader>
          <div className="space-y-4 mt-2">
            <p className="text-sm text-muted-foreground">{editUser?.email}</p>
            <div className="space-y-1.5">
              <Label className="text-sm font-normal">Role</Label>
              <Select value={role} onValueChange={(v) => setRole(v as 'user' | 'admin')}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="user">User</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" className="flex-1" onClick={() => setOpen(false)}>Cancel</Button>
              <Button className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground" onClick={handleUpdateRole}>Save</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Create admin dialog */}
      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="max-w-[calc(100%-2rem)] md:max-w-sm">
          <DialogHeader><DialogTitle>Create Admin Account</DialogTitle></DialogHeader>
          <div className="space-y-3 mt-2">
            <div className="space-y-1.5"><Label className="text-sm font-normal">Username</Label><Input value={newUsername} onChange={e => setNewUsername(e.target.value)} placeholder="admin" /></div>
            <div className="space-y-1.5"><Label className="text-sm font-normal">Password</Label><Input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} placeholder="••••••••" /></div>
            <div className="flex gap-2 pt-1">
              <Button variant="outline" className="flex-1" onClick={() => setAddOpen(false)}>Cancel</Button>
              <Button className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground" onClick={handleAddAdmin} disabled={adding}>{adding ? 'Creating…' : 'Create Admin'}</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
