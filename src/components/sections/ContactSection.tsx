import { useState } from 'react';
import { supabase } from '@/db/supabase';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { MapPin, Phone, Mail, Clock, MessageCircle, Loader2, Send, CalendarDays } from 'lucide-react';
import BookConsultationModal from '@/components/modals/BookConsultationModal';

const CONTACT_INFO = [
  { icon: MapPin, label: 'Address', value: 'Khopoli, Maharashtra, India' },
  { icon: Phone, label: 'Phone', value: '+91 98765 43210' },
  { icon: Mail, label: 'Email', value: 'corestacktechnology01@gmail.com' },
  { icon: Clock, label: 'Hours', value: 'Mon–Fri: 9:00 AM – 6:00 PM IST' },
];

export default function ContactSection() {
  const [form, setForm] = useState({ full_name: '', email: '', phone: '', company: '', subject: '', message: '' });
  const [loading, setLoading] = useState(false);
  const [consultOpen, setConsultOpen] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.full_name || !form.email || !form.message) {
      toast.error('Please fill in all required fields');
      return;
    }
    setLoading(true);
    try {
      const { error } = await supabase.from('leads').insert({
        full_name: form.full_name,
        email: form.email,
        phone: form.phone || null,
        company: form.company || null,
        subject: form.subject || null,
        message: form.message,
        source: 'contact_form',
      });
      if (error) throw error;
      toast.success('Message sent! We\'ll respond within 24 hours.');
      setForm({ full_name: '', email: '', phone: '', company: '', subject: '', message: '' });
    } catch {
      toast.error('Failed to send message. Please try again or email us directly.');
    } finally {
      setLoading(false);
    }
  };

  const handleNewsletterSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const emailEl = e.currentTarget.elements.namedItem('newsletter_email') as HTMLInputElement;
    if (!emailEl?.value) return;
    try {
      const { error } = await supabase.from('newsletter_subscribers').insert({ email: emailEl.value });
      if (error?.code === '23505') { toast.info('You\'re already subscribed!'); return; }
      if (error) throw error;
      toast.success('Subscribed successfully! Welcome to CoreStack insights.');
      emailEl.value = '';
    } catch {
      toast.error('Subscription failed. Please try again.');
    }
  };

  return (
    <section id="contact" className="section-padding bg-muted/30">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="text-center mb-16">
          <span className="text-primary font-semibold text-sm uppercase tracking-widest">Get in Touch</span>
          <h2 className="text-3xl md:text-5xl font-display font-bold text-foreground mt-3 mb-5 text-balance">
            Start Your{' '}
            <span className="gradient-text">Digital Journey</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto text-pretty">
            Ready to transform your business? Tell us about your project and our team will
            get back to you within 24 hours with a detailed response.
          </p>
          {/* Book Consultation CTA */}
          <div className="mt-6">
            <Button
              className="h-12 px-8 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-base gap-2"
              onClick={() => setConsultOpen(true)}
            >
              <CalendarDays className="w-5 h-5" /> Book a Free Consultation
            </Button>
          </div>
        </div>
        <BookConsultationModal open={consultOpen} onClose={() => setConsultOpen(false)} />

        <div className="grid lg:grid-cols-2 gap-10">
          {/* Contact Form */}
          <div className="rounded-2xl border border-border bg-card p-7">
            <h3 className="text-xl font-display font-bold text-foreground mb-6">Send us a Message</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-sm font-normal">Full Name *</Label>
                  <Input placeholder="John Smith" value={form.full_name} onChange={e => setForm(f => ({ ...f, full_name: e.target.value }))} required />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-sm font-normal">Email Address *</Label>
                  <Input type="email" placeholder="john@company.com" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} required />
                </div>
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-sm font-normal">Phone Number</Label>
                  <Input placeholder="+1 (555) 000-0000" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-sm font-normal">Company Name</Label>
                  <Input placeholder="Your Company" value={form.company} onChange={e => setForm(f => ({ ...f, company: e.target.value }))} />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label className="text-sm font-normal">Subject</Label>
                <Input placeholder="e.g. Custom Software Development Project" value={form.subject} onChange={e => setForm(f => ({ ...f, subject: e.target.value }))} />
              </div>
              <div className="space-y-1.5">
                <Label className="text-sm font-normal">Message *</Label>
                <Textarea
                  placeholder="Tell us about your project, goals, timeline, and budget..."
                  rows={5}
                  value={form.message}
                  onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
                  required
                />
              </div>
              <Button
                type="submit"
                className="w-full h-11 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold"
                disabled={loading}
              >
                {loading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Sending…</> : <><Send className="w-4 h-4 mr-2" /> Send Message</>}
              </Button>
            </form>
          </div>

          {/* Contact info + Map */}
          <div className="space-y-6">
            {/* Info cards */}
            <div className="grid sm:grid-cols-2 gap-4">
              {CONTACT_INFO.map(item => (
                <div key={item.label} className="flex items-start gap-3 p-4 rounded-xl border border-border bg-card">
                  <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                    <item.icon className="w-4 h-4 text-primary" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs text-muted-foreground">{item.label}</div>
                    <div className="text-sm text-foreground font-medium mt-0.5 break-words">{item.value}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* WhatsApp CTA */}
            <a
              href="https://wa.me/9421920479"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 p-4 rounded-xl border border-green-500/30 bg-green-500/5 hover:bg-green-500/10 transition-colors"
            >
              <div className="w-10 h-10 rounded-xl bg-green-500/20 flex items-center justify-center shrink-0">
                <MessageCircle className="w-5 h-5 text-green-400" />
              </div>
              <div>
                <div className="https://wa.me/qr/LAU6DIEPYNU4H1">Chat on WhatsApp</div>
                <div className="text-xs text-muted-foreground">Quick response within 1 hour</div>
              </div>
            </a>

            {/* Google Maps embed */}
            <div className="rounded-xl overflow-hidden border border-border aspect-video w-full">
              <iframe
                width="100%"
                height="100%"
                frameBorder="0"
                style={{ border: 0 }}
                referrerPolicy="no-referrer-when-downgrade"
                src="https://www.google.com/maps/embed/v1/place?key=AIzaSyB_LJOYJL-84SMuxNB7LtRGhxEQLjswvy0&q=Khopoli,Maharashtra,India&language=en&region=in"
                allowFullScreen
              />
            </div>

            {/* Newsletter */}
            <div className="p-5 rounded-xl border border-primary/20 bg-primary/5">
              <h4 className="font-display font-bold text-foreground mb-1">Stay in the Loop</h4>
              <p className="text-sm text-muted-foreground mb-3">Get weekly insights on AI, cloud, and enterprise tech trends.</p>
              <form onSubmit={handleNewsletterSubmit} className="flex gap-2">
                <Input name="newsletter_email" type="email" placeholder="your@email.com" className="flex-1 bg-background" required />
                <Button type="submit" className="shrink-0 bg-primary hover:bg-primary/90 text-primary-foreground">Subscribe</Button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
