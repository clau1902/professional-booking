import Link from "next/link";
import { ArrowLeft } from "lucide-react";

interface Section {
  heading: string;
  body: string;
}

interface Props {
  label: string;       // small eyebrow label
  title: string;
  subtitle: string;
  lastUpdated?: string;
  sections: Section[];
}

export function StaticPage({ label, title, subtitle, lastUpdated, sections }: Props) {
  return (
    <div className="pt-20 min-h-screen bg-[var(--cream)]">
      {/* Hero */}
      <div className="bg-[var(--foreground)] text-[var(--cream)] py-20">
        <div className="max-w-3xl mx-auto px-6">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-[var(--cream)]/50 hover:text-[var(--cream)] text-sm mb-8 transition-colors"
          >
            <ArrowLeft size={15} />
            Back to home
          </Link>
          <p className="text-xs font-medium tracking-widest uppercase text-[var(--cream)]/40 mb-3">
            {label}
          </p>
          <h1 className="font-display text-5xl font-light mb-4">{title}</h1>
          <p className="text-[var(--cream)]/60 text-lg leading-relaxed">{subtitle}</p>
          {lastUpdated && (
            <p className="text-[var(--cream)]/30 text-xs mt-6">Last updated: {lastUpdated}</p>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="max-w-3xl mx-auto px-6 py-16 space-y-12">
        {sections.map((s) => (
          <div key={s.heading}>
            <h2 className="font-display text-2xl font-semibold mb-4 text-[var(--foreground)]">
              {s.heading}
            </h2>
            <div className="text-[var(--muted-foreground)] leading-relaxed whitespace-pre-line">
              {s.body}
            </div>
            <div className="mt-6 h-px bg-[var(--border)]" />
          </div>
        ))}

        {/* Placeholder notice */}
        <div className="bg-[var(--terra-light)] border border-[var(--terra)]/20 rounded-2xl p-6 text-sm text-[var(--terra)]">
          <p className="font-semibold mb-1">🚧 Coming soon</p>
          <p>This page is a placeholder. Full content will be added before launch.</p>
        </div>
      </div>
    </div>
  );
}
