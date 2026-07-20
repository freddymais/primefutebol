# Scout: PDF Libraries & Existing PDF Code

## 1. Installed PDF Libraries (package.json)

| Package | Version | Type | Status |
|---|---|---|---|
| `jspdf` | `^4.2.1` | dependency | ✅ Installed |
| `html2canvas` | `^1.4.1` | dependency | ✅ Installed |

**No other PDF libraries installed.** No `pdfmake`, `@react-pdf/renderer`, `puppeteer`, `@react-pdf`, `react-to-print`, or similar.

---

## 2. Existing PDF Generation Code — All Client-Side

All PDF generation in this project uses the **same pattern**: `html2canvas` captures a `ref`-wrapped DOM element as a canvas image, then `jsPDF` places that image into an A4 PDF. This is purely **client-side** (runs in the browser). There is **zero server-side PDF generation**.

### Files using `jsPDF` + `html2canvas` (5 report pages):

| File | Purpose | Export Pattern |
|---|---|---|
| `src/app/(dashboard)/reports/consumables/page.tsx` | Consumables report | html2canvas → jsPDF image |
| `src/app/(dashboard)/reports/monthly-tenants/page.tsx` | Monthly tenants report | html2canvas → jsPDF image |
| `src/app/(dashboard)/reports/occupancy/page.tsx` | Occupancy report | html2canvas → jsPDF image |
| `src/app/(dashboard)/reports/reservations/page.tsx` | Reservations report | html2canvas → jsPDF image |
| `src/app/(dashboard)/reports/revenue/page.tsx` | Revenue report | html2canvas → jsPDF image |

### Common PDF Export Pattern (all 5 files identical):

```typescript
const handleExportPDF = async () => {
  if (!reportRef.current) return
  setExporting(true)
  try {
    const canvas = await html2canvas(reportRef.current, {
      scale: 2,
      useCORS: true,
      backgroundColor: '#0E141B'  // dark background
    })
    const imgData = canvas.toDataURL('image/png')
    const pdf = new jsPDF('p', 'mm', 'a4')
    const imgWidth = 190
    const imgHeight = (canvas.height * imgWidth) / canvas.width
    pdf.setFontSize(16)
    pdf.text('Title', 105, 15, { align: 'center' })
    pdf.addImage(imgData, 'PNG', 10, 25, imgWidth, imgHeight)
    pdf.save('filename.pdf')
  } finally {
    setExporting(false)
  }
}
```

**Key characteristics:**
- Single-page PDF only (no multi-page handling for tall content)
- Uses `html2canvas` to rasterize the DOM — not vector text
- Dark background (`#0E141B`) baked into the capture
- `scale: 2` for retina-quality capture
- Title added as a text header above the captured image
- Button label: `"Exportar PDF"`

---

## 3. No Existing Ticket/Receipt/Comprovante PDF Code

- **No files** named `*ticket*`, `*receipt*`, `*comprovante*`, `*checkout*`, or `*export*` exist in `src/`.
- **No `window.print()` or `@media print`** CSS anywhere.
- **No server-side PDF API routes** — the `src/app/api/` directory has no PDF-related endpoints.

---

## 4. Checkout Flow (Where Ticket/Receipt Would Be Added)

### Two checkout touchpoints exist:

**A. Reservation list checkout modal** (`src/app/(dashboard)/reservations/page.tsx`):
- "Check-out" badge button opens a Modal showing client, room, dates, daily rate, consumables total, grand total
- Checkbox "Marcar como pago" — if checked, payment is processed at checkout
- Calls `PUT /api/reservations/{id}/checkout` with `{ paid: true/false }`
- After checkout, **no receipt/ticket is generated** — modal just closes

**B. Reservation detail page** (`src/app/(dashboard)/reservations/[id]/page.tsx`):
- "Pagar" button opens payment type modal (dinheiro/credito/debito/pix)
- Calls `PUT /api/reservations/{id}` with `{ paid: true, paymentType }`
- Financial sidebar shows: Diárias, Consumos, Total, Status, Payment Type
- After payment, **no receipt is generated** — just shows "Pago" badge

### Checkout API response data (available for PDF):
The `PUT /api/reservations/{id}/checkout` endpoint returns:
```json
{
  "client": { "name", "cpf", "phone", "email" },
  "room": { "number", "type", "pricePerDay" },
  "checkIn", "checkOut",
  "totalPrice",           // daily rates total
  "paid", "paidAt", "paymentType",
  "status",
  "consumables": [{ "description", "quantity", "unitPrice", "totalPrice" }],
  "totalOwed",            // totalPrice + consumablesTotal
  "consumablesTotal",
  "pendingAmount"
}
```

---

## 5. Monthly Tenant Billing Flow (Second Receipt Opportunity)

- Monthly tenant detail page (`src/app/(dashboard)/monthly-tenants/[id]/page.tsx`)
- Has payment modal with payment type selection
- Calls `PUT /api/monthly-billings/{id}` to mark as paid
- **No receipt generated** after payment either

---

## 6. Project Data Model (Reservation)

```
Reservation {
  id, clientId, roomId, checkIn, checkOut,
  status: "reserved" | "checkin" | "checkout" | "paid",
  totalPrice: Float,
  paid: Boolean, paidAt: DateTime?, paymentType: String?,
  notes: String?,
  client: Client { name, cpf, phone, email },
  room: Room { number, type, pricePerDay },
  consumables: Consumable[] { description, quantity, unitPrice, totalPrice }
}
```

---

## 7. Project Branding

- App name: **"PrimeHotel - Sistema de Gestão"**
- Tagline: "Excelência em hospitalidade"
- Logo: `/prime.png`
- Color scheme: Gold accent (`#C8924B`), dark theme with glass morphism
- Font display: Sora, Font mono: JetBrains Mono

---

## 8. Recommendation Summary

- **jsPDF + html2canvas are already installed** and proven in the codebase
- For a structured receipt/ticket (not a screenshot of a page), **jsPDF direct text/canvas API** is the right approach — the existing html2canvas pattern is for dashboard report snapshots, not receipts
- A ticket receipt should use jsPDF's **text primitives** (setFont, text, line, etc.) for crisp vector output, not html2canvas rasterization
- The checkout flow (both list modal and detail page) already has all the data needed; a PDF export button just needs to be wired in
- No additional npm packages are needed for basic receipt PDF generation
