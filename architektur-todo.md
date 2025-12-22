# Architektur-Analyse: Status Monitor Frontend

**Analysedatum:** 2025-12-22
**Projekt:** Status Monitor (Uptime Kuma-inspiriert)
**Codebase:** ~31.000 LOC in 190 TypeScript-Dateien

**Architektur-Entscheidung:** Backend-for-Frontend (BFF) Pattern
- Next.js 16 als UI Layer + Secure API Proxy
- ASP.NET Core REST API als Backend (geplant)
- JWT Auth via C# API (kein Next.js Secret nötig)

---

## Executive Summary

Das Frontend ist ein **technisch solides "vibecoded" Projekt**. Die Grundarchitektur ist gut, aber es gibt **signifikante Probleme**, die vor einem Produktionseinsatz adressiert werden müssen.

**Wichtig:** Die client-heavy Architektur (15/16 Seiten mit "use client") ist **korrekt für das BFF-Pattern**. Dies ist kein Next.js-Fullstack-Projekt, sondern ein interaktives Dashboard mit externer C# API.

### Gesamtbewertung

| Kategorie | Score | Kommentar |
|-----------|-------|-----------|
| **Code Organisation** | 8/10 | Feature-basiert, gut strukturiert |
| **State Management** | 7/10 | Solide Basis, Prop Drilling |
| **Type Safety** | 6/10 | Strict Mode, aber unsichere Assertions |
| **Routing** | 7/10 | Gute Struktur, Best Practices fehlen |
| **Error Handling** | 4/10 | Grundgerüst, inkonsistent |
| **Loading States** | 8/10 | ✅ Implementiert (6 loading.tsx) |
| **Accessibility** | 4/10 | Kritische Lücken |
| **Testing** | 0/10 | Nicht vorhanden |
| **Production Ready** | 5/10 | Needs work |

---

## Kritische Probleme (Sofort beheben)

---

### ~~2. Loading States fehlen größtenteils~~ ✅ BEHOBEN

**Score: 3/10 → 8/10**

- [x] ~~**Nur 1** `loading.tsx` existiert~~ → Jetzt 7 loading.tsx Dateien
- [x] Dashboard-Seiten haben jetzt Server-Side Loading Skeletons
- [ ] Kein Streaming, kein Suspense (weiterhin ausstehend)
- [x] Hydration-Mismatch-Risiko reduziert durch loading.tsx
- [ ] Race-Conditions bei mehrfachen Klicks (separates Issue)

**Implementierte `loading.tsx` Dateien (2025-12-22):**
- [x] `src/app/(dashboard)/loading.tsx` - Dashboard mit Stats, Monitors, Sidebar
- [x] `src/app/(dashboard)/monitors/loading.tsx` - Split-View mit Tree + Detail
- [x] `src/app/(dashboard)/incidents/loading.tsx` - Split-View mit List + Timeline
- [x] `src/app/(dashboard)/status-pages/loading.tsx` - Split-View mit Groups
- [x] `src/app/(dashboard)/notifications/loading.tsx` - Filter + List Items
- [x] `src/app/(dashboard)/settings/loading.tsx` - Tabs + Form Content
- [x] `src/app/(public)/status/[slug]/loading.tsx` - (bereits vorhanden)

**Noch ausstehend:**
- [ ] `src/app/(auth)/login/loading.tsx` - Login-Formular (niedrige Priorität)

**Fix-Priorität:** ~~P0~~ → P2 (Suspense/Streaming als Verbesserung)

---

### 3. Type Safety Lücken

**Kritische unsichere Assertions (15+ Vorkommen):**

```typescript
// Pattern 1: Double-Cast für Translations
tValidation as unknown as (key: string) => string

// Pattern 2: Unvalidierte Config-Casts
channel.config as EmailConfig  // Keine Runtime-Validierung

// Pattern 3: Never-Casts für Form Values
setValue("config.toEmails" as keyof ..., updated as never)
```

**Spezifische Issues:**

- [ ] HTTP-Config Schema markiert optionale Felder als required
  - **Datei:** `src/lib/validations/monitor.ts:8-22`
  - **Fix:** `body: z.string().optional()`, `checkKeyword: z.string().optional()`

- [ ] Non-null Assertions ohne Fallback
  - **Datei:** `src/features/monitors/api/queries.ts:42`
  - **Pattern:** `queryFn: () => monitorApi.getById(id!)`

- [ ] Incident Datum nicht als ISO 8601 validiert
  - **Datei:** `src/lib/validations/incident.ts:46`
  - **Fix:** `z.string().datetime()` statt `z.string().min(1)`

- [ ] `status: "resolved"` erlaubt ohne `resolvedAt`
  - **Datei:** `src/lib/validations/incident.ts:50-62`

**Fix-Priorität:** P0

---

### 4. Security: Keine Route Protection

- [ ] Dashboard-Routes sind **ohne Login erreichbar**
- [ ] Kein Middleware für Authentication
- [ ] API Routes ohne Input-Validierung

**Fehlende Datei:**
```typescript
// src/middleware.ts - MUSS ERSTELLT WERDEN
import { NextRequest, NextResponse } from "next/server";

export function middleware(request: NextRequest) {
  const token = request.cookies.get("auth-token");
  const { pathname } = request.nextUrl;

  if (!pathname.startsWith("/login") &&
      !pathname.startsWith("/status") &&
      !pathname.startsWith("/api") &&
      !token) {
    return NextResponse.redirect(new URL("/login", request.url));
  }
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
```

**Fix-Priorität:** P0

---

## Hohe Priorität (Zeitnah beheben)

### 5. State Management: Prop Drilling

**Score: 5/10**

Split-View Komponenten haben 8-11 Callback-Props:

```typescript
// src/components/monitors/monitor-split-view.tsx
interface MonitorSplitViewProps {
  onSelectMonitor
  onServiceGroupsChange
  onMonitorUpdate
  onMonitorCreate
  onMonitorDelete
  onAddGroup
  onRenameGroup
  onDeleteGroup
  // ... mehr
}
```

**Empfohlene Lösung:**

- [ ] Custom Hook `useMonitorActions()` erstellen
- [ ] Context Provider für Feature-Domains
- [ ] Callback-Gruppen zusammenfassen

**Betroffene Dateien:**
- `src/components/monitors/monitor-split-view.tsx`
- `src/components/incidents/incident-split-view.tsx`
- `src/components/status-pages/status-page-split-view.tsx`
- `src/app/(dashboard)/monitors/page.tsx`

**Fix-Priorität:** P1

---

### 6. Mock-Daten Architektur

**Probleme:**

- [ ] `src/mocks/monitors.ts` ist **1.771 Zeilen** - zu groß
- [ ] Mutable Global State Pattern
- [ ] Hardcoded IDs verursachen Inkonsistenzen
- [ ] ERROR_RATE hardcoded auf 0

**Aufteilen in:**
```
src/mocks/
├── monitors/
│   ├── data.ts          # Initiale Daten
│   ├── generators.ts    # generateMockCheckResults(), etc.
│   └── handlers.ts      # CRUD Operationen
├── incidents/
│   ├── data.ts
│   └── handlers.ts
├── status-pages.ts
├── notifications.ts
└── settings.ts
```

**Hardcoded ID Probleme:**
- Status Page `sp-1` referenziert `monitors: ["1", "2", "3", "4", "5"]`
- Service Groups referenzieren `monitorId: "2"`
- Notifications referenzieren `relatedIncidentId: "inc-2"`
- **Risiko:** Löschen eines Monitors bricht mehrere Relationen

**Fix-Priorität:** P1

---

### 7. Error Handling unvollständig

**Score: 4/10**

- [ ] Error Boundaries existieren, werden nicht konsistent genutzt
- [ ] Keine spezifischen Error-Types (404 vs. Network vs. Validation)
- [ ] Mutations haben keine Error-UI
- [ ] `FieldError` ohne `role="alert"`

**Fehlende Error-Types:**
```typescript
// src/lib/errors.ts - ERSTELLEN
export class NotFoundError extends Error {
  constructor(resource: string) {
    super(`${resource} not found`);
    this.name = "NotFoundError";
  }
}

export class ValidationError extends Error {
  constructor(public fields: Record<string, string>) {
    super("Validation failed");
    this.name = "ValidationError";
  }
}

export class NetworkError extends Error {
  constructor(message: string, public statusCode?: number) {
    super(message);
    this.name = "NetworkError";
  }
}
```

**Betroffene Dateien:**
- `src/components/error-boundary.tsx`
- `src/app/(dashboard)/*/error.tsx`
- `src/features/*/api/mutations.ts`

**Fix-Priorität:** P1

---

### 8. Hardcoded German Strings

**Vorkommen in Mutations:**
```typescript
// src/features/monitors/api/mutations.ts
toast.success(`Monitor "${newMonitor.name}" erstellt`);
toast.error(`Fehler beim Erstellen: ${error.message}`);

// src/components/error-boundary.tsx
title="Ein Fehler ist aufgetreten"
message="Unbekannter Fehler"
```

**Fix:**
- [ ] Alle Toast-Messages durch i18n-Funktionen ersetzen
- [ ] Error Boundary Texte lokalisieren

**Betroffene Dateien:**
- `src/features/monitors/api/mutations.ts`
- `src/features/incidents/api/mutations.ts`
- `src/features/status-pages/api/mutations.ts`
- `src/components/error-boundary.tsx`
- `src/components/error-state.tsx`

**Fix-Priorität:** P1

---

## Mittlere Priorität

### 9. BFF-Pattern & Next.js 16 Integration

**Architektur-Entscheidung:** Backend-for-Frontend (BFF) Pattern
- Next.js als UI Layer + Secure API Proxy
- ASP.NET Core REST API als Backend (Source of Truth)
- Keine SEO-Anforderung (internes Tool)

**Aktualisiert:** 2025-12-22 (Re-Validierung für BFF-Architektur)

| Feature | Status | BFF-Pattern Aktion | Schweregrad |
|---------|--------|-------------------|-------------|
| **Client Components** | ✅ 15/16 Seiten nutzen "use client" | **Korrekt - Dashboard ist interaktiv** | ✅ OK |
| **BFF Layer** | ❌ Fehlt komplett | Next.js API Routes als Proxy zu C# API | 🔴 P0 |
| **Auth Protection** | ❌ Dashboard ohne Login | JWT-Validierung in `(dashboard)/layout.tsx` | 🔴 P0 |
| **Server Components** | Nur 1/16 (Public Status) | **Nur für Public Status Pages nötig** | 🟡 P1 |
| **Route Handlers** | ❌ Keine `/api/*` Routes | Erstellen als Proxy mit env vars | 🔴 P0 |
| **Static Params** | Nicht genutzt | `generateStaticParams` für Status Pages | 🟡 P2 |
| **Streaming/Suspense** | Nur `loading.tsx` | Optional - C# API ist schnell | 🟢 P3 |

**Wichtige Klarstellung:**

✅ **Client Components sind KORREKT** für dieses Projekt:
- Dashboard braucht Interaktivität (Drag&Drop, Forms, Charts)
- React Query ist optimal für API-Caching
- Kein SEO nötig (internes Monitoring-Tool)

❌ **Fehlende Komponenten:**
- BFF Layer (Next.js API Routes)
- Auth-Validierung (JWT gegen C# API)
- Environment Variables Setup

**BFF-Architektur Flow:**

```
Browser
  ↓ fetch('/api/monitors')
Next.js Client Components (React Query)
  ↓
Next.js API Routes (/app/api/*/route.ts)
  ↓ HTTP + Bearer Token (from env)
ASP.NET Core REST API
  ↓
TimescaleDB
```

**Empfohlene Änderungen (BFF-Pattern):**

**Phase 1: BFF Layer erstellen (P0)**

- [ ] **Next.js API Routes** als Proxy
  ```typescript
  // src/app/api/monitors/route.ts (NEU!)
  import { NextRequest, NextResponse } from 'next/server';

  const API_URL = process.env.CSHARP_API_URL;

  export async function GET() {
    const response = await fetch(`${API_URL}/api/monitors`);
    return NextResponse.json(await response.json());
  }

  export async function POST(request: NextRequest) {
    const body = await request.json();
    const response = await fetch(`${API_URL}/api/monitors`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    return NextResponse.json(await response.json());
  }
  ```

- [ ] **Environment Variables**
  ```bash
  # .env.local (NICHT ins Git!)
  CSHARP_API_URL=http://localhost:5000

  # Optional: Falls C# API einen API Key braucht
  CSHARP_API_KEY=your-secret-key
  ```

- [ ] **React Query URLs anpassen**
  ```typescript
  // src/features/monitors/api/queries.ts
  const monitorApi = {
    getAll: async () => {
      // VORHER: getMockMonitors()
      // NACHHER: fetch('/api/monitors')
      const response = await fetch('/api/monitors');
      return response.json();
    },
  };
  ```

**Phase 2: Auth Protection (P0)**

- [ ] **Dashboard Layout mit JWT-Validierung**
  ```typescript
  // src/app/(dashboard)/layout.tsx
  import { cookies } from 'next/headers';
  import { redirect } from 'next/navigation';

  export default async function DashboardLayout({ children }) {
    const token = (await cookies()).get('auth-token');

    if (!token) {
      redirect('/login');
    }

    // Validierung gegen C# API
    const isValid = await fetch(`${process.env.CSHARP_API_URL}/api/auth/validate`, {
      headers: { 'Authorization': `Bearer ${token.value}` },
    }).then(res => res.ok);

    if (!isValid) {
      redirect('/login');
    }

    return <>{children}</>;
  }
  ```

- [ ] **Login mit C# API**
  ```typescript
  // src/app/api/auth/login/route.ts (NEU!)
  export async function POST(request: NextRequest) {
    const { email, password } = await request.json();

    const response = await fetch(`${process.env.CSHARP_API_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    const { token } = await response.json();

    // Set HTTP-only cookie
    const res = NextResponse.json({ success: true });
    res.cookies.set('auth-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return res;
  }
  ```

**Phase 3: Public Status Pages optimieren (P1)**

- [ ] **Server Component für Status Pages**
  ```typescript
  // src/app/(public)/status/[slug]/page.tsx
  // KEIN "use client" - ist read-only

  export async function generateStaticParams() {
    const pages = await fetch(`${process.env.CSHARP_API_URL}/api/status-pages`)
      .then(res => res.json());
    return pages.map(page => ({ slug: page.slug }));
  }

  export const revalidate = 60; // ISR: Rebuild alle 60s

  export default async function StatusPage({ params }) {
    const { slug } = await params;
    const data = await fetch(
      `${process.env.CSHARP_API_URL}/api/status-pages/${slug}`,
      { next: { revalidate: 60 } }
    ).then(res => res.json());

    return <StatusPageDisplay data={data} />;
  }
  ```

**API Routes Struktur:**

```
src/app/api/
├── monitors/
│   ├── route.ts              # GET/POST /api/monitors
│   └── [id]/
│       └── route.ts          # GET/PUT/DELETE /api/monitors/:id
├── incidents/
│   ├── route.ts
│   └── [id]/route.ts
├── status-pages/
│   ├── route.ts
│   └── [id]/route.ts
├── notifications/route.ts
├── settings/route.ts
└── auth/
    ├── login/route.ts        # POST /api/auth/login
    ├── logout/route.ts       # POST /api/auth/logout
    └── validate/route.ts     # GET /api/auth/validate
```

**Was NICHT geändert werden muss:**

✅ Client Components für Dashboard - **bleiben wie sie sind**
✅ React Query Setup - **nur URLs anpassen**
✅ TanStack Query Cache - **besser als Server-Side für interaktive UI**
✅ Zustand für UI State - **korrekt für Theme/Language**
✅ "use client" in Pages - **Dashboard braucht Interaktivität**

**Next.js 16 Features für BFF:**

- ✅ Async params - Bereits adoptiert
- ✅ Route Handlers - Müssen erstellt werden
- ⚠️ `"use cache"` - Nicht nötig (React Query cached client-side)
- ⚠️ `proxy.ts` - Nicht nötig (keine Routing-Logic)
- ⚠️ Server Components - Nur für Public Status Pages

**Quellen:**
- [Next.js Route Handlers](https://nextjs.org/docs/app/building-your-application/routing/route-handlers)
- [BFF Pattern Explained](https://learn.microsoft.com/en-us/azure/architecture/patterns/backends-for-frontends)
- [Next.js Authentication](https://nextjs.org/docs/app/building-your-application/authentication)

**Fix-Priorität:** P0 (BFF Layer + Auth)

---

### 10. Zod Validation Probleme

**HTTP Config - Optionale Felder falsch definiert:**
```typescript
// src/lib/validations/monitor.ts:8-22
// AKTUELL (falsch):
body: z.string(),
checkKeyword: z.string(),

// KORRIGIERT:
body: z.string().optional(),
checkKeyword: z.string().optional(),
authUsername: z.string().optional(),
authPassword: z.string().optional(),
authToken: z.string().optional(),
```

**Incident Schema - Conditional Validation fehlt:**
```typescript
// src/lib/validations/incident.ts
// Aktuell erlaubt status: "resolved" ohne resolvedAt
// KORRIGIERT:
.refine((data) => {
  if (data.status === "resolved") {
    return !!data.resolvedAt;
  }
  if (data.status === "ongoing") {
    return !data.resolvedAt;
  }
  return true;
}, {
  message: "Resolved incidents must have a resolution date",
  path: ["resolvedAt"],
})
```

**Fix-Priorität:** P2

---

### 11. Komponenten-Architektur Verbesserungen

**Große Dateien aufteilen:**

| Datei | Zeilen | Aktion |
|-------|--------|--------|
| `monitor-edit-panel.tsx` | 855 | Helper-Komponenten extrahieren |
| `monitor-list-panel.tsx` | 350+ | Tree-Logik in Hook auslagern |
| `monitor-recent-checks.tsx` | 428 | Pagination/Filter-Logik extrahieren |

**Fehlende generische Wrapper:**
- [ ] `<SplitViewContainer>` - Wiederverwendbar für alle Split-Views
- [ ] `<ListPanel>` - Mit Such-, Filter-, Sortier-Props
- [ ] `<DetailPanel>` - Mit Header, Back-Navigation
- [ ] `<FormSection>` - Collapsible Form-Bereiche

**Code-Duplikation:**
- `SortableTreeItem` (monitor-list-panel.tsx) vs `ServiceTreeItem` (service-tree.tsx)
- Delete Confirmation Dialogs in allen Split-Views

**Fix-Priorität:** P2

---

### 12. Query Client Issues

**Probleme:**
- [ ] Singleton Pattern kann SSR-Probleme verursachen
- [ ] Hardcoded 30s Polling ohne Backoff
- [ ] `refetchInterval` auch für inaktive Tabs
- [ ] Manche Queries invalidieren zu viel Cache

**Konfiguration überarbeiten:**
```typescript
// src/lib/query-client.ts
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 10 * 1000,
      refetchInterval: false, // Nicht global, per Query
      refetchOnWindowFocus: true,
      refetchIntervalInBackground: false, // Wichtig!
      retry: (failureCount, error) => {
        if (error instanceof NotFoundError) return false;
        return failureCount < 2;
      },
    },
  },
});
```

**Fix-Priorität:** P2

---

## Positives (Beibehalten)

### Was gut funktioniert:

- **TypeScript Strict Mode** - Nur ~10 `any` Usage
- **TanStack Query** - Optimistic Updates mit Rollback korrekt implementiert
- **Query Key Factory** - Hierarchisches Pattern in `features/*/api/keys.ts`
- **Zustand Stores** - Minimal, fokussiert auf UI State (Theme, Language, Command Palette)
- **Zod Validation Grundgerüst** - Mit i18n-Support
- **API Abstraction** - Ein Env-Variable Switch (`NEXT_PUBLIC_USE_MOCKS`)
- **Route Groups** - `(auth)`, `(dashboard)`, `(public)` gut strukturiert
- **Error Boundaries** - Pro Feature-Segment vorhanden
- **shadcn/ui** - Radix UI gibt gute Basis für Accessibility

---

## Vergleich mit Best Practices 2025

| Bereich | Status Monitor | Best Practice | Gap |
|---------|---------------|---------------|-----|
| **Server State** | TanStack Query | TanStack Query | Keiner |
| **Client State** | Zustand | Zustand | Keiner |
| **Forms** | RHF + Zod | RHF + Zod | Keiner |
| **Routing** | App Router | App Router + Streaming | Streaming fehlt |
| **A11y** | Minimal | WCAG 2.1 AA | Kritisch |
| **Testing** | Keine | Unit + E2E | Komplett fehlt |
| **Monitoring** | Mock | Real-time Events | Backend fehlt |
| **Status Page** | Polling | WebSocket/SSE | Suboptimal |

### Uptime Monitoring Best Practices (nicht erfüllt):

- [ ] **1-Minute Check Intervals** - Mock-Daten statisch
- [ ] **Incident Automation** - Nur manuelle Updates
- [ ] **Multi-Location Checks** - Nur simuliert
- [ ] **Rolling 90-Day Uptime** - Implementiert aber nicht validiert
- [ ] **Maintenance Exclusion** - In Types, nicht in Logik

---

## Empfohlene Fix-Reihenfolge

### Phase 1: Security & Stability

**Geschätzter Aufwand: 1-2 Wochen**

1. [ ] Middleware für Route Protection erstellen
2. [ ] `loading.tsx` für alle Dashboard-Routes
3. [ ] Type Assertions durch Type Guards ersetzen
4. [ ] Error Handling mit spezifischen Error-Types

### Phase 2: Accessibility

**Geschätzter Aufwand: 2-3 Wochen**

1. [ ] ARIA Labels für alle interaktiven Elemente
2. [ ] `aria-live` Regionen für Loading/Error States
3. [ ] Keyboard Navigation für Trees
4. [ ] Color Contrast Audit mit WCAG Tools

### Phase 3: Code Quality

**Geschätzter Aufwand: 1-2 Wochen**

1. [ ] Mock-Datei aufteilen
2. [ ] Custom Hooks für Callback-Gruppen
3. [ ] Hardcoded Strings durch i18n ersetzen
4. [ ] Zod Schemas korrigieren

### Phase 4: Performance

**Geschätzter Aufwand: 1 Woche**

1. [ ] Suspense Boundaries implementieren
2. [ ] Server Components wo möglich
3. [ ] Streaming für große Datenlisten
4. [ ] Request Deduplication

### Phase 5: Testing

**Geschätzter Aufwand: 2-3 Wochen**

1. [ ] Unit Tests für Validation Schemas
2. [ ] Component Tests für kritische UI
3. [ ] E2E Tests für User Flows
4. [ ] Accessibility Tests automatisieren

---

## Referenzen

- [Next.js 15 Best Practices 2025](https://dev.to/bajrayejoon/best-practices-for-organizing-your-nextjs-15-2025-53ji)
- [Status Page Best Practices - UptimeRobot](https://uptimerobot.com/knowledge-hub/monitoring/building-a-status-page-ultimate-guide/)
- [React State Management 2025](https://www.developerway.com/posts/react-state-management-2025)
- [TanStack Query + Zustand Patterns](https://javascript.plainenglish.io/zustand-and-tanstack-query-the-dynamic-duo-that-simplified-my-react-state-management-e71b924efb90)
