import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

interface BackButtonProps {
  className?: string;
}

/**
 * Universal premium glassmorphism Back button.
 * Uses navigate(-1) — preserves scroll position, no page reload.
 */
export default function BackButton({ className = '' }: BackButtonProps) {
  const navigate = useNavigate();
  return (
    <button
      onClick={() => navigate(-1)}
      className={`group inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-border bg-card/70 backdrop-blur-md text-sm font-medium text-muted-foreground hover:text-primary hover:border-primary/40 hover:bg-primary/5 transition-all duration-200 shadow-sm w-fit ${className}`}
    >
      <ArrowLeft className="w-4 h-4 transition-transform duration-200 group-hover:-translate-x-0.5" />
      Back
    </button>
  );
}
