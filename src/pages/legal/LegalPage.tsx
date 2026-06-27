import { Link } from 'react-router-dom';
import { ArrowLeft, ShieldCheck, FileText, Cookie } from 'lucide-react';

interface LegalPageProps {
  title: string;
  intro: string;
  sections: Array<{ heading: string; body: string }>;
  icon: 'privacy' | 'terms' | 'cookie';
}

const iconMap = {
  privacy: ShieldCheck,
  terms: FileText,
  cookie: Cookie,
};

export default function LegalPage({ title, intro, sections, icon }: LegalPageProps) {
  const Icon = iconMap[icon];

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="container mx-auto px-4 py-8 sm:px-6 lg:px-8 lg:py-12 max-w-5xl">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:text-primary/80 transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </Link>

        <div className="rounded-3xl border border-border bg-card/80 shadow-sm backdrop-blur-sm overflow-hidden">
          <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent px-6 py-8 sm:px-8 lg:px-10">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                <Icon className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-sm uppercase tracking-[0.2em] text-primary font-semibold">Legal</p>
                <h1 className="text-2xl sm:text-3xl font-display font-bold">{title}</h1>
              </div>
            </div>
            <p className="text-sm sm:text-base text-muted-foreground max-w-3xl leading-7">{intro}</p>
          </div>

          <div className="px-6 py-8 sm:px-8 lg:px-10 space-y-6">
            {sections.map((section) => (
              <section key={section.heading} className="rounded-2xl border border-border/70 bg-background/60 p-5 sm:p-6">
                <h2 className="text-lg sm:text-xl font-semibold text-foreground mb-3">{section.heading}</h2>
                <p className="text-sm sm:text-base leading-7 text-muted-foreground whitespace-pre-line">{section.body}</p>
              </section>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
