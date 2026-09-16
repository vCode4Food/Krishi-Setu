import { Wheat, MapPin, Phone, BadgeCheck, Award, CalendarDays, ShieldCheck, Star, LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useApp } from "@/context/AppContext";
import { useAuth } from "@/context/AuthContext";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card } from "@/components/common/Card";
import { StatusBadge, SecuredBadge } from "@/components/common/Badges";
import { Button } from "@/components/common/Button";
import { formatINR } from "@/utils/format";

export default function Profile() {
  const { farmer, bookings, transactions, pushToast } = useApp();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const myTxns = transactions.filter((t) => t.farmerId === farmer.farmerId);
  const earned = myTxns.reduce((s, t) => s + t.amount, 0);

  return (
    <div>
      <PageHeader title="My Profile" description="Demo farmer identity used across the KrushiSetu prototype." />

      <div className="grid gap-5 lg:grid-cols-[1fr_1.4fr]">
        <Card className="overflow-hidden">
          <div className="bg-primary-700 p-6 text-center text-white">
            <img
              src={farmer.avatarUrl}
              alt={farmer.name}
              className="mx-auto h-24 w-24 rounded-2xl border-4 border-white/20 object-cover"
            />
            <h2 className="mt-3 font-display text-xl font-extrabold">{farmer.name}</h2>
            <p className="text-sm text-primary-100">Farmer ID · {farmer.farmerId}</p>
            <div className="mt-3 flex justify-center">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-xs font-bold">
                <Star className="h-3.5 w-3.5 fill-saffron-300 text-saffron-300" aria-hidden /> {farmer.rating} farmer rating
              </span>
            </div>
          </div>
          <dl className="space-y-3 p-5 text-sm">
            {[
              { icon: MapPin, k: "Location", v: `${farmer.village}, ${farmer.location}` },
              { icon: Phone, k: "Phone", v: farmer.phone },
              { icon: Wheat, k: "Crops", v: farmer.crops.join(", ") },
              { icon: CalendarDays, k: "Member since", v: String(farmer.memberSince) },
              { icon: Award, k: "PM-KISAN", v: farmer.pmKisan ? "Enrolled ✓" : "Not enrolled" },
            ].map((r) => (
              <div key={r.k} className="flex items-center gap-3">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-earth-100 text-ink-500">
                  <r.icon className="h-4 w-4" aria-hidden />
                </span>
                <div>
                  <dt className="text-[11px] font-bold uppercase tracking-wide text-ink-400">{r.k}</dt>
                  <dd className="font-semibold text-ink-900">{r.v}</dd>
                </div>
              </div>
            ))}
          </dl>
        </Card>

        <div className="space-y-5">
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {[
              { k: "Land", v: `${farmer.landAcres} acres` },
              { k: "Transactions", v: String(myTxns.length) },
              { k: "Total earned", v: formatINR(earned) },
              { k: "Slots booked", v: String(bookings.length) },
            ].map((x) => (
              <Card key={x.k} className="p-4">
                <p className="text-xs font-bold uppercase text-ink-400">{x.k}</p>
                <p className="mt-1 font-display text-xl font-extrabold text-ink-900">{x.v}</p>
              </Card>
            ))}
          </div>

          <Card className="p-5">
            <h3 className="flex items-center gap-2 font-bold text-ink-900">
              <ShieldCheck className="h-5 w-5 text-primary-700" aria-hidden /> Trust & verification
            </h3>
            <ul className="mt-3 space-y-2">
              {[
                "Identity verified via Aadhaar e-KYC (simulated)",
                "Bank account linked — HDFC ••4821",
                "Land records synced with Bhulekh Mahabhulekh (demo)",
                "All procurements digitally signed & audit-logged",
              ].map((t) => (
                <li key={t} className="flex items-center gap-2 text-sm text-ink-700">
                  <BadgeCheck className="h-4.5 w-4.5 shrink-0 text-primary-600" aria-hidden /> {t}
                </li>
              ))}
            </ul>
            <div className="mt-4 flex flex-wrap gap-2">
              <SecuredBadge />
              <StatusBadge tone="blue" label="Session: demo farmer (Ramesh Patil)" />
            </div>
          </Card>

          <Card className="p-5">
            <h3 className="font-bold text-ink-900">Session & demo controls</h3>
            <p className="mt-1 text-sm text-ink-500">
              Signed in via OTP as <strong className="text-ink-900">{user?.name ?? "demo farmer"}</strong>
              {user?.mobile ? ` · +91 ${user.mobile.slice(0, 5)} ${user.mobile.slice(5)}` : ""}. The session persists across page refreshes in
              this browser tab.
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              <Button
                variant="secondary"
                onClick={() => pushToast({ kind: "info", title: "Demo mode", body: "All data in this prototype is simulated for evaluation." })}
              >
                About demo mode
              </Button>
              <Button
                variant="outline"
                icon={<LogOut className="h-4 w-4" />}
                onClick={() => {
                  logout();
                  pushToast({ kind: "info", title: "Signed out", body: "Session cleared (simulated)." });
                  navigate("/");
                }}
              >
                Sign out
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
