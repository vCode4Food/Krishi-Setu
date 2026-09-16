import { Link } from "react-router-dom";
import { Sprout, ShieldCheck } from "lucide-react";

const linkGroups = [
  {
    heading: "Platform",
    links: [
      { label: "About", to: "/" },
      { label: "Farmer Services", to: "/farmer" },
      { label: "Procurement Centres", to: "/farmer/centres" },
      { label: "Centre Dashboard", to: "/centre" },
    ],
  },
  {
    heading: "Grow",
    links: [
      { label: "Schemes", to: "/farmer/schemes" },
      { label: "News", to: "/farmer/news" },
      { label: "Experts", to: "/farmer/experts" },
      { label: "Crop Health", to: "/farmer/crop-health" },
    ],
  },
  {
    heading: "Support",
    links: [
      { label: "Help", to: "/search" },
      { label: "Privacy", to: "/" },
      { label: "Terms", to: "/" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="border-t border-ink-100 bg-primary-900 text-white">
      <div className="container-page py-12">
        <div className="grid gap-10 md:grid-cols-[1.4fr_repeat(3,1fr)]">
          <div>
            <div className="flex items-center gap-2.5">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10">
                <Sprout className="h-5 w-5 text-primary-200" aria-hidden />
              </span>
              <div>
                <p className="font-display text-lg font-extrabold">KrushiSetu</p>
                <p className="text-xs text-primary-200">Digital Agriculture. Transparent Procurement. Empowered Farmers.</p>
              </div>
            </div>
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-primary-100/80">
              One connected digital platform that makes agricultural procurement smarter, faster, more
              transparent and farmer-centric.
            </p>
            <p className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-primary-100">
              <ShieldCheck className="h-3.5 w-3.5" aria-hidden /> Prototype build — demo data only
            </p>
          </div>
          {linkGroups.map((g) => (
            <div key={g.heading}>
              <h4 className="text-sm font-bold uppercase tracking-wider text-primary-200">{g.heading}</h4>
              <ul className="mt-3 space-y-2">
                {g.links.map((l) => (
                  <li key={l.label}>
                    <Link to={l.to} className="text-sm text-primary-100/80 transition hover:text-white">
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-10 flex flex-col items-start justify-between gap-3 border-t border-white/10 pt-6 text-xs text-primary-200/70 md:flex-row md:items-center">
          <p>© 2026 KrushiSetu · Frontend prototype for demonstration. No real transactions are processed.</p>
          <p>Farmer ID FRM-10482 · Centre CRC-NAG-01 · Operator OP-102</p>
        </div>
      </div>
    </footer>
  );
}
