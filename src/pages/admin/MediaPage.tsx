import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/db/supabase';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Upload, Trash2, Copy, Image, FileText, Film, Loader2 } from 'lucide-react';

interface MediaFile { id: string; filename: string; url: string; size: number | null; mime_type: string | null; created_at: string; }

function FileIcon({ mime }: { mime: string | null }) {
  if (!mime) return <FileText className="w-8 h-8 text-muted-foreground" />;
  if (mime.startsWith('image/')) return <Image className="w-8 h-8 text-blue-400" />;
  if (mime.startsWith('video/')) return <Film className="w-8 h-8 text-purple-400" />;
  return <FileText className="w-8 h-8 text-muted-foreground" />;
}

export default function MediaPage() {
  const [files, setFiles] = useState<MediaFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  const fetch = useCallback(async () => {
    const { data } = await supabase.from('media_files').select('*').order('created_at', { ascending: false });
    setFiles(data || []); setLoading(false);
  }, []);
  useEffect(() => { fetch(); }, [fetch]);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const path = `media/${Date.now()}_${file.name.replace(/\s+/g, '_')}`;
      const { data: upload, error: uploadErr } = await supabase.storage.from('media').upload(path, file);
      if (uploadErr) throw uploadErr;
      const { data: urlData } = supabase.storage.from('media').getPublicUrl(upload.path);
      await supabase.from('media_files').insert({ filename: file.name, url: urlData.publicUrl, size: file.size, mime_type: file.type });
      toast.success('File uploaded'); fetch();
    } catch {
      toast.error('Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (file: MediaFile) => {
    if (!confirm('Delete file?')) return;
    await supabase.from('media_files').delete().eq('id', file.id);
    toast.success('Deleted'); fetch();
  };

  const copyUrl = (url: string) => {
    navigator.clipboard.writeText(url);
    toast.success('URL copied');
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">Media Library</h1>
          <p className="text-muted-foreground text-sm">{files.length} files</p>
        </div>
        <label className="cursor-pointer">
          <input type="file" className="sr-only" onChange={handleUpload} accept="image/*,video/*,.pdf,.doc,.docx" />
          <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors">
            {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
            {uploading ? 'Uploading…' : 'Upload File'}
          </div>
        </label>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-48"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" /></div>
      ) : files.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-48 border-2 border-dashed border-border rounded-xl">
          <Image className="w-10 h-10 text-muted-foreground mb-2" />
          <p className="text-muted-foreground text-sm">No files uploaded yet</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {files.map(file => (
            <div key={file.id} className="group rounded-xl border border-border bg-card overflow-hidden">
              <div className="aspect-square bg-muted flex items-center justify-center overflow-hidden">
                {file.mime_type?.startsWith('image/') ? (
                  <img src={file.url} alt={file.filename} className="w-full h-full object-cover" />
                ) : (
                  <FileIcon mime={file.mime_type} />
                )}
              </div>
              <div className="p-2">
                <p className="text-xs text-foreground truncate">{file.filename}</p>
                {file.size && <p className="text-xs text-muted-foreground">{(file.size / 1024).toFixed(0)} KB</p>}
                <div className="flex gap-1 mt-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button size="sm" variant="ghost" className="h-6 w-6 p-0" onClick={() => copyUrl(file.url)}><Copy className="w-3 h-3" /></Button>
                  <Button size="sm" variant="ghost" className="h-6 w-6 p-0 hover:text-destructive" onClick={() => handleDelete(file)}><Trash2 className="w-3 h-3" /></Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
