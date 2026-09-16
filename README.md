# 🌾 KrushiSetu — Digital Agriculture. Transparent Procurement.

A high-fidelity **frontend prototype** of an Indian AgriTech + GovTech platform connecting
**Farmers → Procurement Centres → Weighbridge → Transport → Government Schemes → Experts → Transparent Procurement**.

Everything runs in the browser on simulated services — no backend required. Built for
demonstrations, hackathons (Smart India Hackathon ready), evaluation, and as a blueprint for
future backend integration.

---

## 🚀 Quick start

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # typecheck + production build
npm run preview    # serve the production build
```

## 🔐 Demo accounts (OTP login — SIH26032 stakeholder model)

Sign in at `/login` with any of these numbers — the system **detects the role from the mobile
number** after lookup. A **fresh 6-digit OTP is generated for every login/resend** and shown
**on screen** (it simulates the SMS) — tap it to autofill. There is no static master code.

| Role                | Name           | Phone         | Lands on                    |
| ------------------- | -------------- | ------------- | --------------------------- |
| 👨‍🌾 Farmer          | Ramesh Patil   | `9876543210`  | `/farmer` dashboard         |
| 🚛 Truck Driver     | Suresh Jadhav  | `9876543211`  | `/driver` console           |
| 🧑‍💼 Procurement Officer | Amit Deshmukh | `9876543212` | `/officer` operations       |
| 🏢 Centre Manager   | Priya Kulkarni | `9876543213`  | `/centre-manager` console   |
| 📊 District Admin   | Vivek Sharma   | `9876543214`  | `/admin/district` governance |
| 🇮🇳 State Admin      | Anjali Mehta   | `9876543215`  | `/admin/state` overview     |

- Each role has its own navigation, dashboard, permissions and data visibility (frontend RBAC).
- Cross-role access (e.g. officer opening `/farmer`) is blocked by `RoleRoute` and shows
  `/unauthorized` (403) — never a silent redirect.
- The session persists across refreshes (`localStorage`, 30-min demo expiry); **Sign out** clears it.
- Login screen has a **Demo Accounts** panel — tap an account to autofill the number.

## 🌐 Context-aware multilingual UI (i18n)

Built on **i18next + react-i18next** with 13 fully translated locales and English fallback
everywhere (a missing key can never leak to users).

**Language priority chain** — implemented in `src/i18n/languages.ts` →
`resolveLanguageContext()`:

1. **Explicit saved preference** (`localStorage: krushisetu.language`) — always wins
2. **Authenticated user's profile state** (`user.state`, e.g. Maharashtra → Marathi)
3. **App location context** (guest hooks)
4. **Browser language** (fallback signal only)
5. **English**

The region *recommends* a language — it never forces one. A Maharashtra user sees
English / हिन्दी / मराठी in the selector; picking हिन्दी keeps it हिन्दी even if the
profile later changes to Gujarat (only the *recommendation* follows the state).
States without a dedicated locale resolve to English + हिन्दी.

**Selector UX** — a compact `🌐 हिन्दी ▾` control inside the navbar control cluster (also
on the login/OTP screens), showing native names only. The contextual dropdown lists
English + Hindi + regional (deduplicated) plus **More languages →** with all 13. Full
keyboard/ARIA listbox behaviour, Escape/outside-click close, and the active language
follows across pages, refreshes, logout and login.

**RTL** — selecting اردو flips `<html dir="rtl">`, loads a Nastaliq-leaning font stack
with extra line-height, and components use Tailwind `rtl:` variants + `ltr:/rtl:`
utility classes for directional spacing.

| Code | Native name | Code | Native name |
| ---- | ----------- | ---- | ----------- |
| `en` | English | `ml` | മലയാളം |
| `hi` | हिन्दी | `pa` | ਪੰਜਾਬੀ |
| `mr` | मराठी | `or` | ଓଡ଼ିଆ |
| `bn` | বাংলা | `as` | অসমীয়া |
| `te` | తెలుగు | `ur` | اردو (RTL) |
| `ta` | தமிழ் | `gu` | ગુજરાતી |
| `kn` | ಕನ್ನಡ | | |

Adding a language = drop a `translation.json` in `src/i18n/locales/<code>/`, add one entry
to `LANGUAGES` and one state mapping — no component changes.

## 🧭 The connected demo story

1. **Login → OTP → role detection** routes to the right dashboard
2. Farmer: **centre map → live capacity → slot booking** (capacity-validated, centre dashboards update)
3. Centre: **truck arrival → RFID → lane assignment → digital weighing → CV verification**
4. **Farmer–truck–weight linking** under one transaction ID → recorded to history
5. **Audit trail** shows every step, hash-referenced
6. Farmer support ecosystem around it: **AI crop health, experts, schemes, news, multilingual Krushi AI, natural-language search**

## 🗺️ Route map

```
/                    Landing (hero, how-it-works, transparency, stats, news)
/loading             Splash screen (session check)
/search              Natural-language search (9 Indian languages)
/login               Mobile lookup + role detection + demo accounts
/otp-verification    6-box OTP, countdown, resend, change number
/post-login          Role-routing splash
/unauthorized        RBAC blocked page (403)
*                    404

/farmer              Dashboard (farmer role)
/farmer/crop-health  AI crop analysis (upload + simulated pipeline)
/farmer/centres      Leaflet map, filters, centre details
/farmer/book-slot    4-step booking wizard with capacity control
/farmer/transactions History + receipt detail
/farmer/schemes      Scheme filters + eligibility wizard
/farmer/news         Categories + featured carousel
/farmer/experts      Expert booking flow
/farmer/profile      Profile + session

/driver              Driver dashboard: trip, stage timeline, linked farmer
/driver/trips        Active + completed assignments
/driver/vehicle      Truck + RFID tag health
/driver/rfid         Live gate-read simulation
/driver/navigation   Route guidance + turn list
/driver/history      Settled deliveries

/officer             Operations dashboard (procurement_officer)
/officer/weighing    RFID → weighbridge → CV → confirm transaction
/officer/queue       Queue management: call next, notify
/officer/trucks      Gate feed with RFID states
/officer/verification CV review console (permission-gated)
/officer/transactions Register with filters
/officer/audit       Append-only audit timeline
/officer/analytics   Recharts reports

/centre-manager      Centre-wide dashboard (centre_manager)
/centre-manager/capacity  Capacity + emergency top-up
/centre-manager/lanes     Lane management + auto-assign
/centre-manager/slots     Slot plan per window
/centre-manager/analytics Throughput, mix, CV, stage times
/centre-manager/audit     Centre audit timeline

/admin/district      District governance map + KPIs (district_admin)
/admin/district/centres /procurement /analytics /alerts /reports /audit

/admin/state         State overview + drill-down (state_admin)
/admin/state/districts /centres /procurement /fraud /analytics /reports /audit
```

Legacy `/centre` routes redirect to `/officer`.`

## 🏗️ Architecture

```
src/
├── components/
│   ├── common/       Button, Card, Modal, Badges, Carousel, StatCard, CapacityMeter…
│   ├── layout/       Navbar, Footer, NotificationPanel, RouteGuard, Toasts, PageHeader
│   ├── farmer/       CentreCard, NewsCard, SchemeCard, ExpertCard
│   ├── centre/       Charts (Recharts)
│   └── chatbot/      KrushiAI floating assistant
├── pages/
│   ├── auth/         Splash, Login, OtpVerification, PostLogin, Unauthorized, NotFound
│   ├── farmer/       9 farmer pages
│   ├── driver/       Dashboard + trips/vehicle/RFID/navigation/history
│   ├── centre/       Operator pages + officer queue
│   ├── manager/      Centre-manager console pages
│   ├── admin/        District + state governance pages
│   └── public/       Landing, NaturalLanguageSearch
├── layouts/          FarmerLayout, DriverLayout (bottom nav), ConsoleLayout (sidebar)
├── context/          AuthContext (session/RBAC/expiry), AppContext (mode, bookings, capacity, notifications)
├── services/         mockAuth, mockAI, mockRFID, mockWeighbridge, mockProcurement, mockMaps
├── data/             farmers, centres, trucks, transactions, schemes, news, experts, notifications
├── hooks/            useCountUp, useCarousel
├── types/            Shared domain types
└── utils/            Formatters (INR, kg, capacity)
```

**Swapping mocks for real APIs:** every feature calls a service function
(`analyzeCrop()`, `identifyTruck()`, `captureGrossWeight()`, `verifyProduce()`, `bookProcurementSlot()`,
`sendChatMessage()`, …) that returns a Promise with artificial latency. Replace the bodies with
`fetch()` calls — no UI changes needed.

## 🎨 Design system

- Tailwind CSS v4 tokens: deep agricultural greens (`primary`), warm earth neutrals (`earth`),
  saffron accents, controlled alert reds, off-white canvas
- Inter Variable (body) + Plus Jakarta Sans Variable (display), self-hosted via Fontsource
- Status uses icon + text (never colour alone), visible focus rings, semantic HTML,
  keyboard-closable modals, aria labels throughout
- Mobile-first farmer experience (bottom navigation, 360px-safe), desktop-first centre control room

## ✅ QA performed

- `tsc --noEmit` clean, production build clean, zero console errors across routes
- Full farmer journey: booking reduces centre capacity everywhere (dashboard, map, booking wizard)
- Full centre journey: RFID → lane → gross/tare capture → CV (verified/mismatch paths) →
  transaction → capacity decrement → notification → audit context
- OTP success/expiry/wrong-code paths, role detection, cross-role guard, 404, refresh persistence, logout
- All image URLs verified reachable (central registry in `src/data/images.ts`)

## ⚠️ Prototype disclaimer

This is a demonstration build. All data, OTPs, AI outputs, RFID reads, weights, CV results and
payments are simulated in the browser. No real authentication, SMS, hardware, government API or
money movement is involved.
