import { useState, useEffect } from 'react';
import { supabase } from '@/db/supabase';
import { Award, DownloadCloud, Trash2, RefreshCw, Search, AlertCircle, QrCode } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import jsPDF from 'jspdf';
import QRCode from 'qrcode';

interface Certificate {
  id: string;
  cert_id: string;
  user_id: string;
  full_name: string;
  challenge_name: string;
  score: number;
  issued_at: string;
  qr_data: string | null;
}

export default function CertificatesAdminPage() {
  const [certs, setCerts] = useState<Certificate[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => { fetch(); }, []);

  async function fetch() {
    setLoading(true);
    const { data } = await supabase
      .from('certificates')
      .select('*')
      .order('issued_at', { ascending: false });
    setCerts(data ?? []);
    setLoading(false);
  }

  async function revoke(id: string, certId: string) {
    if (!window.confirm(`Revoke certificate ${certId}?`)) return;
    const { error } = await supabase.from('certificates').delete().eq('id', id);
    if (error) { toast.error('Failed to revoke'); return; }
    toast.success('Certificate revoked');
    fetch();
  }

  async function downloadPDF(cert: Certificate) {
    const qrDataUrl = await QRCode.toDataURL(`https://corestack.tech/verify/${cert.cert_id}`, { width: 100 });
    const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
    const W = 297, H = 210;
    doc.setFillColor(10, 10, 15);
    doc.rect(0, 0, W, H, 'F');
    doc.setDrawColor(255, 115, 0);
    doc.setLineWidth(1.5);
    doc.rect(8, 8, W - 16, H - 16, 'S');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(32);
    doc.setTextColor(255, 255, 255);
    doc.text('CERTIFICATE OF COMPLETION', W / 2, 45, { align: 'center' });
    doc.setFontSize(14);
    doc.setTextColor(255, 115, 0);
    doc.text('CoreStack Technology', W / 2, 58, { align: 'center' });
    doc.setFontSize(13);
    doc.setTextColor(180, 180, 200);
    doc.text('This is to certify that', W / 2, 78, { align: 'center' });
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(26);
    doc.setTextColor(255, 255, 255);
    doc.text(cert.full_name, W / 2, 93, { align: 'center' });
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(13);
    doc.setTextColor(180, 180, 200);
    doc.text('has successfully completed', W / 2, 107, { align: 'center' });
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(18);
    doc.setTextColor(255, 115, 0);
    doc.text(cert.challenge_name, W / 2, 120, { align: 'center' });
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(14);
    doc.setTextColor(255, 255, 255);
    doc.text(`Score: ${cert.score}%`, W / 2, 133, { align: 'center' });
    doc.setFontSize(11);
    doc.setTextColor(130, 130, 150);
    doc.text(`Issued: ${new Date(cert.issued_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}`, W / 2, 145, { align: 'center' });
    doc.text(`Certificate ID: ${cert.cert_id}`, W / 2, 153, { align: 'center' });
    doc.addImage(qrDataUrl, 'PNG', W - 50, H - 52, 38, 38);
    doc.save(`${cert.cert_id}.pdf`);
    toast.success('PDF downloaded');
  }

  function exportCSV() {
    const rows = [['Cert ID', 'Full Name', 'Challenge', 'Score (%)', 'Issued At']];
    filtered.forEach(c => rows.push([c.cert_id, c.full_name, c.challenge_name, String(c.score), new Date(c.issued_at).toLocaleDateString()]));
    const csv = rows.map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'certificates.csv'; a.click();
    URL.revokeObjectURL(url);
    toast.success('Export started');
  }

  const filtered = certs.filter(c =>
    !search || c.full_name.toLowerCase().includes(search.toLowerCase()) ||
    c.cert_id.toLowerCase().includes(search.toLowerCase()) ||
    c.challenge_name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">Certificate Management</h1>
          <p className="text-sm text-muted-foreground mt-1">{certs.length} certificates issued to date</p>
        </div>
        <div className="flex gap-2 shrink-0">
          <Button variant="outline" onClick={exportCSV} className="gap-2"><DownloadCloud className="w-4 h-4" />Export CSV</Button>
          <Button variant="outline" onClick={fetch} className="gap-2"><RefreshCw className="w-4 h-4" />Refresh</Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Issued', value: certs.length },
          { label: 'Unique Users', value: new Set(certs.map(c => c.user_id)).size },
          { label: 'This Month', value: certs.filter(c => new Date(c.issued_at).getMonth() === new Date().getMonth()).length },
          { label: 'Avg Score', value: certs.length ? Math.round(certs.reduce((a, c) => a + c.score, 0) / certs.length) + '%' : '—' },
        ].map(s => (
          <div key={s.label} className="p-4 rounded-2xl border border-border bg-card">
            <div className="text-xs font-medium text-muted-foreground mb-1">{s.label}</div>
            <div className="text-2xl font-display font-black text-foreground">{s.value}</div>
          </div>
        ))}
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name, cert ID or challenge..." className="pl-9 px-9" />
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <Award className="w-10 h-10 mx-auto mb-3 opacity-30" />
          <p className="font-medium">No certificates found</p>
        </div>
      ) : (
        <div className="rounded-2xl border border-border bg-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  {['Cert ID', 'Name', 'Challenge', 'Score', 'Issued', 'Actions'].map(h => (
                    <th key={h} className="text-left px-5 py-3.5 text-xs font-semibold uppercase tracking-widest text-muted-foreground whitespace-nowrap last:text-right">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map(c => (
                  <tr key={c.id} className="border-b border-border/50 last:border-0 hover:bg-muted/20 transition-colors">
                    <td className="px-5 py-3.5 whitespace-nowrap">
                      <span className="font-mono text-xs text-primary">{c.cert_id}</span>
                    </td>
                    <td className="px-5 py-3.5 whitespace-nowrap">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary shrink-0">{c.full_name.charAt(0)}</div>
                        <span className="text-sm font-medium text-foreground">{c.full_name}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 whitespace-nowrap text-sm text-muted-foreground">{c.challenge_name}</td>
                    <td className="px-5 py-3.5 whitespace-nowrap">
                      <span className={`text-sm font-display font-black ${c.score >= 90 ? 'text-green-400' : c.score >= 80 ? 'text-amber-400' : 'text-muted-foreground'}`}>{c.score}%</span>
                    </td>
                    <td className="px-5 py-3.5 whitespace-nowrap text-xs text-muted-foreground">{new Date(c.issued_at).toLocaleDateString()}</td>
                    <td className="px-5 py-3.5 whitespace-nowrap text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => downloadPDF(c)} className="text-muted-foreground hover:text-primary p-1.5 rounded-lg hover:bg-primary/10 transition-all" title="Download PDF">
                          <DownloadCloud className="w-3.5 h-3.5" />
                        </button>
                        <button className="text-muted-foreground hover:text-blue-400 p-1.5 rounded-lg hover:bg-blue-500/10 transition-all" title="Show QR">
                          <QrCode className="w-3.5 h-3.5" />
                        </button>
                        <button onClick={() => revoke(c.id, c.cert_id)} className="text-muted-foreground hover:text-red-400 p-1.5 rounded-lg hover:bg-red-500/10 transition-all" title="Revoke">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
