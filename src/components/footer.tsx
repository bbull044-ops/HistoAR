const sitemap = [
  {
    h: "Jelajahi",
    l: [
      { label: "Beranda", href: "/" },
      { label: "Daftar Materi", href: "/materi" },
      { label: "Lini Masa", href: "/#timeline" },
      { label: "Kuis", href: "/#quiz" },
    ],
  },
  {
    h: "Cakupan Materi",
    l: [
      { label: "Zaman Praaksara", href: "/#learn" },
      { label: "Manusia Purba", href: "/#learn" },
      { label: "Situs Megalitik", href: "/#learn" },
      { label: "Sistem Kepercayaan", href: "/#learn" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="relative mx-auto max-w-6xl px-6 pb-16 pt-12">
      <div className="border-t border-border pt-10">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <div className="flex items-center gap-2.5">
              <span className="flex h-7 w-7 items-center justify-center border border-primary/40 text-[0.6rem] font-semibold text-primary">
                H
              </span>
              <span className="font-display text-base tracking-tight">
                Histo<span className="text-primary">AR</span>
              </span>
            </div>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-muted-foreground">
              Arsip digital sejarah dan prasejarah Indonesia, manusia purba,
              situs megalitik, dan periodisasi zaman, disusun seperti katalog
              museum dan dijelajahi lewat augmented reality.
            </p>
          </div>
          {sitemap.map((c) => (
            <div key={c.h}>
              <div className="catalog-label text-accent-foreground">{c.h}</div>
              <ul className="mt-4 space-y-2.5 text-sm text-muted-foreground">
                {c.l.map((x) => (
                  <li key={x.label}>
                    <a href={x.href} className="transition hover:text-foreground">
                      {x.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-10 flex flex-wrap items-center justify-between gap-4 border-t border-border pt-6 text-xs text-muted-foreground">
          <span>© {new Date().getFullYear()} HistoAR</span>
          <span className="catalog-label">Arsip Edukasi Prasejarah Indonesia</span>
        </div>
      </div>
    </footer>
  );
}
