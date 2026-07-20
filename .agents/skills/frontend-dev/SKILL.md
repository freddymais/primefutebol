---
name: frontend-dev
description: >
  Frontend development: Next.js 15 React components, Recharts, Leaflet.js, shadcn/ui, Tailwind v4,
  next-intl (FR/AR RTL). Trigger on: "component", "page", "chart", "map", "countdown", "UI",
  "layout", "RTL", "Arabic", "i18n", "shadcn", "Tailwind", or any visual/interface work.
---

# Frontend Developer — Morocco 2030

## Role
Build React components, pages, charts, and maps. Enforce bilingual FR/AR RTL. Every data display must show source + timestamp.

## The Source Badge — NON-NEGOTIABLE

Every component that shows a number MUST include a source badge:

```tsx
import { SourceBadge } from '@/components/ui/source-badge'

// Every indicator card, chart, stat — no exceptions
<SourceBadge source={indicator.source} fetchedAt={indicator.fetchedAt} />
```

## Countdown Widget

```tsx
// Critical: World Cup opening = June 11, 2030
const WC_DATE = new Date('2030-06-11T18:00:00Z') // Opening ceremony, expected UTC

export function CountdownWidget() {
  const [timeLeft, setTimeLeft] = useState(calcTimeLeft())
  
  useEffect(() => {
    const interval = setInterval(() => setTimeLeft(calcTimeLeft()), 1000)
    return () => clearInterval(interval)
  }, [])
  
  // Render: DAYS | HOURS | MINUTES | SECONDS
  // Style: large, dramatic, Moroccan flag colors for accent
}

function calcTimeLeft() {
  const diff = WC_DATE.getTime() - Date.now()
  return {
    days: Math.floor(diff / 86400000),
    hours: Math.floor((diff % 86400000) / 3600000),
    minutes: Math.floor((diff % 3600000) / 60000),
    seconds: Math.floor((diff % 60000) / 1000),
  }
}
```

## Leaflet Map (Stadiums)

```tsx
'use client'
import dynamic from 'next/dynamic'

// Leaflet must be dynamically imported (no SSR)
const MapContainer = dynamic(
  () => import('react-leaflet').then(m => m.MapContainer),
  { ssr: false }
)

export function StadiumMap({ stadiums }: { stadiums: Stadium[] }) {
  return (
    <MapContainer
      center={[31.7917, -7.0926]} // Morocco center
      zoom={6}
      className="h-[400px] w-full rounded-xl"
    >
      {/* TileLayer: OpenStreetMap — free, no API key */}
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      {stadiums.map(stadium => (
        <Marker key={stadium.id} position={[stadium.lat, stadium.lng]}>
          <Popup>
            <StadiumPopup stadium={stadium} />
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  )
}
```

## GDP Chart (Recharts)

```tsx
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ReferenceLine } from 'recharts'

export function GDPChart({ data }: { data: EconomicIndicator[] }) {
  return (
    <LineChart data={chartData} width={600} height={300}>
      <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
      <XAxis dataKey="year" />
      <YAxis unit="%" />
      {/* Reference line at 2026 — projected vs actual split */}
      <ReferenceLine x={2025} stroke="var(--color-warning)" strokeDasharray="4 4" label="Projeté →" />
      <Line dataKey="actual" stroke="var(--color-primary)" strokeWidth={2} dot={false} />
      <Line dataKey="projected" stroke="var(--color-primary)" strokeDasharray="4 4" strokeWidth={2} dot={false} />
    </LineChart>
  )
}
```

## i18n Pattern

```tsx
'use client'
import { useTranslations } from 'next-intl'

export function IndicatorCard({ indicator }: Props) {
  const t = useTranslations('economy')
  
  return (
    <div className="indicator-card">
      <p className="text-sm text-muted-foreground">{t(`indicators.${indicator.id}.label`)}</p>
      <p className="text-3xl font-bold tabular-nums">{formatValue(indicator)}</p>
      <SourceBadge source={indicator.source} fetchedAt={indicator.fetchedAt} />
    </div>
  )
}
```

## RTL Support (MANDATORY)

```tsx
// Root layout
<html lang={locale} dir={locale === 'ar' ? 'rtl' : 'ltr'}>

// Tailwind v4 logical properties — ALWAYS use these
<div className="text-start">   // not text-left
<div className="ms-4">         // not ml-4 (margin-start)
<div className="ps-6">         // not pl-6 (padding-start)
<div className="border-s">     // not border-l
```

## Number Formatting (French locale)

```tsx
// French number format: space as thousands separator
export function formatMAD(amount: number): string {
  return new Intl.NumberFormat('fr-MA', {
    style: 'currency',
    currency: 'MAD',
    maximumFractionDigits: 0,
  }).format(amount)
  // → "80 000 MAD"
}

export function formatPercent(value: number): string {
  return new Intl.NumberFormat('fr-MA', {
    style: 'percent',
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  }).format(value / 100)
  // → "5,0 %"
}
```

## Stale Data Warning

```tsx
// Show when data is older than TTL
export function StaleWarning({ fetchedAt }: { fetchedAt: Date }) {
  const isStale = Date.now() - fetchedAt.getTime() > 86400 * 1000 * 1.5
  if (!isStale) return null
  return (
    <div className="text-xs text-amber-600 flex items-center gap-1">
      ⚠ {t('common.staleData', { date: formatDate(fetchedAt) })}
    </div>
  )
}
```

## Accessibility Checklist

- [ ] Semantic HTML (`<article>`, `<section>`, `<nav>`)
- [ ] Chart alt text for screen readers
- [ ] Color contrast ≥ 4.5:1
- [ ] RTL tested with `dir="rtl"`
- [ ] Mobile: min-width 375px tested

## Handoff Points
- **← From Data Engineer**: Data types + API endpoints
- **← From UX Designer**: Wireframes
- **← From UI Designer**: Design tokens
- **→ Tester**: Components for smoke + E2E tests
