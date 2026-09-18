import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ShieldCheck } from "lucide-react";
import { BrandLogo } from "@/components/common/BrandLogo";

const linkGroups = [
  {
    headingKey: "platform",
    links: [
      { key: "about", to: "/" },
      { key: "farmerServices", to: "/farmer" },
      { key: "procurementCentres", to: "/farmer/centres" },
      { key: "centreDashboard", to: "/centre" },
    ],
  },
  {
    headingKey: "grow",
    links: [
      { key: "schemes", to: "/farmer/schemes" },
      { key: "news", to: "/farmer/news" },
      { key: "experts", to: "/farmer/experts" },
      { key: "cropHealth", to: "/farmer/crop-health" },
    ],
  },
  {
    headingKey: "support",
    links: [
      { key: "help", to: "/search" },
      { key: "privacy", to: "/" },
      { key: "terms", to: "/" },
    ],
  },
];

export function Footer() {
  const { t } = useTranslation();
  return (
    <footer className="border-t border-ink-100 bg-primary-900 text-white">
      <div className="container-page py-12">
        <div className="grid gap-10 md:grid-cols-[1.4fr_repeat(3,1fr)]">
          <div>
            <div className="flex items-center gap-2.5">
              <BrandLogo className="h-10 w-10 rounded-xl bg-white object-cover p-1 shadow-lift" />
              <div>
                <p className="font-display text-lg font-extrabold">{t("common.appName")}</p>
                <p className="text-xs text-primary-200">{t("footer.tagline")}</p>
              </div>
            </div>
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-primary-100/80">
              {t("footer.blurb")}
            </p>
            <p className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-primary-100">
              <ShieldCheck className="h-3.5 w-3.5" aria-hidden /> {t("footer.prototypeBadge")}
            </p>
          </div>
          {linkGroups.map((g) => (
            <div key={g.headingKey}>
              <h4 className="text-sm font-bold uppercase tracking-wider text-primary-200">{t(`footer.${g.headingKey}`)}</h4>
              <ul className="mt-3 space-y-2">
                {g.links.map((l) => (
                  <li key={l.key}>
                    <Link to={l.to} className="text-sm text-primary-100/80 transition hover:text-white">
                      {t(`footer.${l.key}`)}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-10 flex flex-col items-start justify-between gap-3 border-t border-white/10 pt-6 text-xs text-primary-200/70 md:flex-row md:items-center">
          <p>{t("footer.copyright")}</p>
          <p>Farmer ID FRM-10482 · Centre CRC-NAG-01 · Operator OP-102</p>
        </div>
      </div>
    </footer>
  );
}
