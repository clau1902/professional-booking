import Link from "next/link";

export function Footer() {
  return (
    <footer className="bg-[var(--foreground)] text-[var(--cream)] mt-24">
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          {/* Brand */}
          <div className="md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <span className="w-7 h-7 rounded-full bg-[var(--terra)] flex items-center justify-center">
                <span className="text-white text-xs font-bold">H</span>
              </span>
              <span className="font-display text-xl font-semibold">Handpicked</span>
            </div>
            <p className="text-sm text-[var(--cream)]/60 leading-relaxed">
              Connecting you with trusted local professionals since 2024.
            </p>
          </div>

          {/* Services */}
          <div>
            <h4 className="font-display text-sm font-semibold uppercase tracking-widest mb-4 text-[var(--cream)]/50">
              Services
            </h4>
            <ul className="space-y-3 text-sm text-[var(--cream)]/70">
              {["Cleaning", "Tutoring", "Photography", "Personal Training", "Plumbing", "Electrical"].map((s) => (
                <li key={s}>
                  <Link href={`/professionals?category=${s}`} className="hover:text-[var(--cream)] transition-colors">
                    {s}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="font-display text-sm font-semibold uppercase tracking-widest mb-4 text-[var(--cream)]/50">
              Company
            </h4>
            <ul className="space-y-3 text-sm text-[var(--cream)]/70">
              {[
                ["About", "/about"],
                ["How it works", "/#how-it-works"],
                ["For professionals", "/professionals/join"],
                ["Blog", "/blog"],
                ["Careers", "/careers"],
              ].map(([label, href]) => (
                <li key={label}>
                  <Link href={href} className="hover:text-[var(--cream)] transition-colors">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="font-display text-sm font-semibold uppercase tracking-widest mb-4 text-[var(--cream)]/50">
              Support
            </h4>
            <ul className="space-y-3 text-sm text-[var(--cream)]/70">
              {[
                ["Help Center", "/help"],
                ["Safety", "/safety"],
                ["Terms of Service", "/terms"],
                ["Privacy Policy", "/privacy"],
                ["Contact Us", "/contact"],
              ].map(([label, href]) => (
                <li key={label}>
                  <Link href={href} className="hover:text-[var(--cream)] transition-colors">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-[var(--cream)]/10 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-xs text-[var(--cream)]/40">
            © 2024 Handpicked. All rights reserved.
          </p>
          <p className="text-xs text-[var(--cream)]/40 font-display italic">
            Trusted by 50,000+ customers across 120 cities
          </p>
        </div>
      </div>
    </footer>
  );
}
