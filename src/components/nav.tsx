import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";

const links = [
  { href: "/#experience", label: "Pengalaman" },
  { href: "/#timeline", label: "Lini Masa" },
  { href: "/#learn", label: "Materi" },
  { href: "/#ar", label: "AR" },
  { href: "/#quiz", label: "Kuis" },
  { href: "/#ai", label: "Pemandu AI" },
];

export function Nav() {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header className="fixed inset-x-0 top-0 z-50 flex justify-center px-4 pt-4">
      <nav
        className={`flex w-full max-w-6xl items-center justify-between rounded-full border border-border bg-card/90 px-5 py-2.5 backdrop-blur-sm transition-shadow duration-500 ${
          scrolled ? "shadow-[0_8px_30px_-12px_oklch(0_0_0/0.25)]" : ""
        }`}
      >
        <Link to="/" className="flex items-center gap-2.5">
          <span className="flex h-7 w-7 items-center justify-center rounded-full border border-primary/40 text-[0.6rem] font-semibold text-primary">
            H
          </span>
          <span className="font-display text-base tracking-tight">
            Histo<span className="text-primary">AR</span>
          </span>
        </Link>
        <ul className="hidden items-center gap-7 md:flex">
          {links.map((l) => (
            <li key={l.href}>
              <a
                href={l.href}
                className="text-sm text-muted-foreground transition hover:text-foreground"
              >
                {l.label}
              </a>
            </li>
          ))}
        </ul>
        <Link
          to="/materi"
          className="rounded-full bg-primary px-4 py-1.5 text-sm font-medium text-primary-foreground transition hover:bg-primary/90"
        >
          Mulai
        </Link>
      </nav>
    </header>
  );
}
