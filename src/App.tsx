import { lazy, Suspense } from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import { AppProvider } from "@/context/AppContext";
import { LanguageProvider } from "@/context/LanguageContext";
import { FarmerLayout } from "@/layouts/FarmerLayout";
import { DriverLayout } from "@/layouts/DriverLayout";
import { ConsoleLayout, officerItems, managerItems } from "@/layouts/ConsoleLayout";
import { RoleRoute, PermissionRoute } from "@/components/layout/RouteGuard";
import Splash from "@/pages/auth/Splash";
import { PageLoader } from "@/components/common/PageLoader";
import { SessionWatch } from "@/components/common/SessionWatch";

const Landing = lazy(() => import("@/pages/public/Landing"));
const SearchPage = lazy(() => import("@/pages/public/NaturalLanguageSearch"));
const Login = lazy(() => import("@/pages/auth/Login"));
const OtpVerification = lazy(() => import("@/pages/auth/OtpVerification"));
const PostLogin = lazy(() => import("@/pages/auth/PostLogin"));
const Unauthorized = lazy(() => import("@/pages/auth/Unauthorized"));
const SessionExpired = lazy(() => import("@/pages/auth/SessionExpired"));
const NotFound = lazy(() => import("@/pages/auth/NotFound"));

const FarmerDashboard = lazy(() => import("@/pages/farmer/FarmerDashboard"));
const CropHealth = lazy(() => import("@/pages/farmer/CropHealth"));
const CentresMap = lazy(() => import("@/pages/farmer/CentresMap"));
const BookSlot = lazy(() => import("@/pages/farmer/BookSlot"));
const Transactions = lazy(() => import("@/pages/farmer/Transactions"));
const Schemes = lazy(() => import("@/pages/farmer/Schemes"));
const News = lazy(() => import("@/pages/farmer/News"));
const Experts = lazy(() => import("@/pages/farmer/Experts"));
const Profile = lazy(() => import("@/pages/farmer/Profile"));

const CentreDashboard = lazy(() => import("@/pages/centre/CentreDashboard"));
const LiveWeighing = lazy(() => import("@/pages/centre/LiveWeighing"));
const IncomingTrucks = lazy(() => import("@/pages/centre/IncomingTrucks"));
const VerificationPage = lazy(() => import("@/pages/centre/VerificationPage"));
const CentreTransactions = lazy(() => import("@/pages/centre/CentreTransactions"));
const AuditTrail = lazy(() => import("@/pages/centre/AuditTrail"));
const CentreAnalytics = lazy(() => import("@/pages/centre/CentreAnalytics"));
const OfficerQueue = lazy(() => import("@/pages/centre/OfficerQueue"));

const DriverDashboard = lazy(() => import("@/pages/driver/DriverDashboard"));
const DriverTrips = lazy(() => import("@/pages/driver/DriverPages").then((m) => ({ default: m.DriverTrips })));
const DriverVehicle = lazy(() => import("@/pages/driver/DriverPages").then((m) => ({ default: m.DriverVehicle })));
const DriverRfid = lazy(() => import("@/pages/driver/DriverPages").then((m) => ({ default: m.DriverRfid })));
const DriverNavigation = lazy(() => import("@/pages/driver/DriverPages").then((m) => ({ default: m.DriverNavigation })));
const DriverHistory = lazy(() => import("@/pages/driver/DriverPages").then((m) => ({ default: m.DriverHistory })));

const ManagerDashboard = lazy(() => import("@/pages/manager/ManagerPages").then((m) => ({ default: m.ManagerDashboard })));
const ManagerCapacity = lazy(() => import("@/pages/manager/ManagerPages").then((m) => ({ default: m.ManagerCapacity })));
const ManagerLanes = lazy(() => import("@/pages/manager/ManagerPages").then((m) => ({ default: m.ManagerLanes })));
const ManagerSlots = lazy(() => import("@/pages/manager/ManagerPages").then((m) => ({ default: m.ManagerSlots })));
const ManagerAnalytics = lazy(() => import("@/pages/manager/ManagerPages").then((m) => ({ default: m.ManagerAnalytics })));

const DistrictDashboard = lazy(() => import("@/pages/admin/AdminPages").then((m) => ({ default: m.DistrictDashboard })));
const DistrictCentres = lazy(() => import("@/pages/admin/AdminPages").then((m) => ({ default: m.DistrictCentres })));
const DistrictProcurement = lazy(() => import("@/pages/admin/AdminPages").then((m) => ({ default: m.DistrictProcurement })));
const DistrictAnalytics = lazy(() => import("@/pages/admin/AdminPages").then((m) => ({ default: m.DistrictAnalytics })));
const DistrictAlerts = lazy(() => import("@/pages/admin/AdminPages").then((m) => ({ default: m.DistrictAlerts })));
const DistrictReports = lazy(() => import("@/pages/admin/AdminPages").then((m) => ({ default: m.DistrictReports })));
const DistrictAudit = lazy(() => import("@/pages/admin/AdminPages").then((m) => ({ default: m.DistrictAudit })));

const StateDashboard = lazy(() => import("@/pages/admin/AdminPages").then((m) => ({ default: m.StateDashboard })));
const StateDistricts = lazy(() => import("@/pages/admin/AdminPages").then((m) => ({ default: m.StateDistricts })));
const StateCentres = lazy(() => import("@/pages/admin/AdminPages").then((m) => ({ default: m.StateCentres })));
const StateProcurement = lazy(() => import("@/pages/admin/AdminPages").then((m) => ({ default: m.StateProcurement })));
const StateFraud = lazy(() => import("@/pages/admin/AdminPages").then((m) => ({ default: m.StateFraud })));
const StateAnalytics = lazy(() => import("@/pages/admin/AdminPages").then((m) => ({ default: m.StateAnalytics })));
const StateReports = lazy(() => import("@/pages/admin/AdminPages").then((m) => ({ default: m.StateReports })));
const StateAudit = lazy(() => import("@/pages/admin/AdminPages").then((m) => ({ default: m.StateAudit })));

import {
  LayoutDashboard, Building2, Package, BarChart3, ShieldAlert, FileClock,
  Map, Flag, Download, Bell,
} from "lucide-react";

const districtItems = [
  { to: "/admin/district", labelKey: "navbar.dashboard", icon: LayoutDashboard, end: true },
  { to: "/admin/district/centres", labelKey: "navbar.centres", icon: Building2 },
  { to: "/admin/district/procurement", labelKey: "navbar.procurement", icon: Package },
  { to: "/admin/district/analytics", labelKey: "navbar.analytics", icon: BarChart3 },
  { to: "/admin/district/alerts", labelKey: "navbar.alerts", icon: ShieldAlert },
  { to: "/admin/district/reports", labelKey: "navbar.reports", icon: Download },
  { to: "/admin/district/audit", labelKey: "navbar.audit", icon: FileClock },
];

const stateItems = [
  { to: "/admin/state", labelKey: "navbar.dashboard", icon: Map, end: true },
  { to: "/admin/state/districts", labelKey: "navbar.districts", icon: Map },
  { to: "/admin/state/centres", labelKey: "navbar.centres", icon: Building2 },
  { to: "/admin/state/procurement", labelKey: "navbar.procurement", icon: Package },
  { to: "/admin/state/fraud", labelKey: "navbar.fraudAlerts", icon: Flag },
  { to: "/admin/state/analytics", labelKey: "navbar.analytics", icon: BarChart3 },
  { to: "/admin/state/reports", labelKey: "navbar.reports", icon: Download },
  { to: "/admin/state/audit", labelKey: "navbar.audit", icon: Bell },
];

export default function App() {
  return (
    <AuthProvider>
      <LanguageGate>
        <AppProvider>
          <SessionWatch />
          <BrowserRouter>
            <Suspense fallback={<PageLoader />}>
              <Routes>
              {/* Public */}
              <Route path="/" element={<Landing />} />
              <Route path="/loading" element={<Splash />} />
              <Route path="/search" element={<SearchPage />} />
              <Route path="/login" element={<Login />} />
              <Route path="/otp-verification" element={<OtpVerification />} />
              <Route path="/post-login" element={<PostLogin />} />
              <Route path="/unauthorized" element={<Unauthorized />} />
              <Route path="/session-expired" element={<SessionExpired />} />

              {/* Farmer experience (role: farmer) */}
              <Route element={<RoleRoute family="farmer" />}>
                <Route path="/farmer" element={<FarmerLayout />}>
                  <Route index element={<FarmerDashboard />} />
                  <Route path="crop-health" element={<CropHealth />} />
                  <Route path="centres" element={<CentresMap />} />
                  <Route path="book-slot" element={<BookSlot />} />
                  <Route path="transactions" element={<Transactions />} />
                  <Route path="schemes" element={<Schemes />} />
                  <Route path="news" element={<News />} />
                  <Route path="experts" element={<Experts />} />
                  <Route path="assistant" element={<Navigate to="/farmer" replace />} />
                  <Route path="profile" element={<Profile />} />
                </Route>
              </Route>

              {/* Centre operator console (role: procurement_officer) — legacy /centre alias */}
              <Route element={<RoleRoute family="officer" />}>
                <Route path="/centre" element={<Navigate to="/officer" replace />} />
              </Route>
              <Route element={<RoleRoute family="officer" />}>
                <Route
                  path="/officer"
                  element={
                    <ConsoleLayout
                      family="officer"
                      items={officerItems}
                      contextLabel="Nagpur Central"
                      contextSub="● Operational — 4 lanes"
                    />
                  }
                >
                  <Route index element={<CentreDashboard />} />
                  <Route path="weighing" element={<LiveWeighing />} />
                  <Route path="queue" element={<OfficerQueue />} />
                  <Route path="trucks" element={<IncomingTrucks />} />
                  <Route element={<PermissionRoute permission="perform_cv_verification" />}>
                    <Route path="verification" element={<VerificationPage />} />
                  </Route>
                  <Route path="transactions" element={<CentreTransactions />} />
                  <Route path="audit" element={<AuditTrail />} />
                  <Route path="analytics" element={<CentreAnalytics />} />
                </Route>
              </Route>

              {/* Driver experience (role: truck_driver) */}
              <Route element={<RoleRoute family="driver" />}>
                <Route path="/driver" element={<DriverLayout />}>
                  <Route index element={<DriverDashboard />} />
                  <Route path="dashboard" element={<Navigate to="/driver" replace />} />
                  <Route path="trips" element={<DriverTrips />} />
                  <Route path="vehicle" element={<DriverVehicle />} />
                  <Route path="rfid" element={<DriverRfid />} />
                  <Route path="navigation" element={<DriverNavigation />} />
                  <Route path="history" element={<DriverHistory />} />
                </Route>
              </Route>

              {/* Centre manager console (role: centre_manager) */}
              <Route element={<RoleRoute family="centre-manager" />}>
                <Route
                  path="/centre-manager"
                  element={
                    <ConsoleLayout
                      family="centre-manager"
                      items={managerItems}
                      contextLabel="Nagpur Central"
                      contextSub="● Operational — 4 lanes"
                    />
                  }
                >
                  <Route index element={<ManagerDashboard />} />
                  <Route path="capacity" element={<ManagerCapacity />} />
                  <Route path="lanes" element={<ManagerLanes />} />
                  <Route path="slots" element={<ManagerSlots />} />
                  <Route path="analytics" element={<ManagerAnalytics />} />
                  <Route path="audit" element={<AuditTrail />} />
                  <Route path="operations" element={<Navigate to="/centre-manager" replace />} />
                </Route>
              </Route>

              {/* District admin (role: district_admin) */}
              <Route element={<RoleRoute family="admin" />}>
                <Route
                  path="/admin/district"
                  element={
                    <ConsoleLayout
                      family="district"
                      items={districtItems}
                      contextLabel="Nagpur District"
                      contextSub="● 6 centres · 5 active"
                    />
                  }
                >
                  <Route index element={<DistrictDashboard />} />
                  <Route path="dashboard" element={<Navigate to="/admin/district" replace />} />
                  <Route path="centres" element={<DistrictCentres />} />
                  <Route path="procurement" element={<DistrictProcurement />} />
                  <Route path="analytics" element={<DistrictAnalytics />} />
                  <Route path="alerts" element={<DistrictAlerts />} />
                  <Route path="reports" element={<DistrictReports />} />
                  <Route path="audit" element={<DistrictAudit />} />
                </Route>
              </Route>

              {/* State admin (role: state_admin) */}
              <Route element={<RoleRoute family="admin" />}>
                <Route
                  path="/admin/state"
                  element={
                    <ConsoleLayout
                      family="state"
                      items={stateItems}
                      contextLabel="Maharashtra"
                      contextSub="● 6 districts networked"
                    />
                  }
                >
                  <Route index element={<StateDashboard />} />
                  <Route path="dashboard" element={<Navigate to="/admin/state" replace />} />
                  <Route path="districts" element={<StateDistricts />} />
                  <Route path="centres" element={<StateCentres />} />
                  <Route path="procurement" element={<StateProcurement />} />
                  <Route path="fraud" element={<StateFraud />} />
                  <Route path="analytics" element={<StateAnalytics />} />
                  <Route path="reports" element={<StateReports />} />
                  <Route path="audit" element={<StateAudit />} />
                </Route>
              </Route>

              <Route path="/404" element={<NotFound />} />
              <Route path="*" element={<NotFound />} />
              </Routes>
          </Suspense>
        </BrowserRouter>
      </AppProvider>
      </LanguageGate>
    </AuthProvider>
  );
}

/**
 * Bridges the authenticated user's profile state into language resolution.
 * Preference (localStorage) still wins; profile state only recommends the
 * regional language when no explicit choice exists.
 */
function LanguageGate({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  return <LanguageProvider hints={{ profileState: user?.state ?? null }}>{children}</LanguageProvider>;
}
