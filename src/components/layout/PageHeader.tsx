import type { ReactNode } from "react";
import { Link, useLocation } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

export function Breadcrumb({ items }: { items: { label: string; to?: string }[] }) {
  return (
    <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-1 text-xs text-ink-400">
      {items.map((item, i) => (
        <span key={i} className="flex items-center gap-1">
          {i > 0 && <ChevronRight className="h-3 w-3" aria-hidden />}
          {item.to ? (
            <Link to={item.to} className="hover:text-primary-700">
              {item.label}
            </Link>
          ) : (
            <span className="font-medium text-ink-500">{item.label}</span>
          )}
        </span>
      ))}
    </nav>
  );
}

export function PageHeader({
  title,
  description,
  breadcrumb,
  actions,
}: {
  title: string;
  description?: string;
  breadcrumb?: { label: string; to?: string }[];
  actions?: ReactNode;
}) {
  const location = useLocation();
  const { user } = useAuth();
  const roleRoot = (user &&
    ({
      farmer: { label: "Farmer", to: "/farmer" },
      truck_driver: { label: "Driver", to: "/driver" },
      procurement_officer: { label: "Officer Console", to: "/officer" },
      centre_manager: { label: "Centre Manager", to: "/centre-manager" },
      district_admin: { label: "District Admin", to: "/admin/district" },
      state_admin: { label: "State Admin", to: "/admin/state" },
      citizen: { label: "Home", to: "/" },
    })[user.role]) ??
    { label: location.pathname.startsWith("/centre") ? "Centre" : "Farmer", to: location.pathname.startsWith("/centre") ? "/centre" : "/farmer" };
  const crumbs = breadcrumb ?? [{ label: roleRoot.label, to: roleRoot.to }, { label: title }];

  return (
    <header className="mb-6">
      {crumbs.length > 1 && (
        <div className="mb-2">
          <Breadcrumb items={crumbs} />
        </div>
      )}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold text-ink-900 md:text-3xl">{title}</h1>
          {description && <p className="mt-1 max-w-2xl text-sm text-ink-500 md:text-base">{description}</p>}
        </div>
        {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
      </div>
    </header>
  );
}
