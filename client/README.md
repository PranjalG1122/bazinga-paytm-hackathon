# Wapsi Client (Ops Control Room)

Next.js frontend for **Wapsi** — an autonomous merchant reactivation and winback platform built for Paytm. It provides operations teams with live visibility into inactive merchant outreach, automated root-cause resolutions, and recovered payment volume.

---

## Architecture Overview

The client is built with **Next.js 16 (App Router)** and **React 19**, organized following feature-driven architecture:

```
client/
├── app/                  # Next.js App Router root layout, page, and React Query providers
├── features/
│   └── dashboard/        # Merchant recovery control room feature module
│       ├── components/   # UI panels: MetricsGrid, TicketTable, RootCauseBreakdown, TicketDetailPanel
│       ├── hooks/        # React Query hooks (useDashboard) with live polling
│       ├── services/     # Typed API integration client (dashboard-api.ts)
│       └── types/        # TypeScript interfaces matching backend payloads
└── public/               # Static assets & brand media
```

### Key Capabilities
- **Live Ops Telemetry**: Displays high-level stats (resolution rate, volume at risk, recovered volume, average time to resolve).
- **Incident & Dormancy Tracking**: Filterable merchant ticket table categorized by priority tiers (`P1`, `P2`, `P3`) and status (`open`, `resolved`, `escalated`, `no_response`).
- **Root Cause Analytics**: Visual breakdown across common merchant drop-off reasons (e.g., stuck payouts, failed transactions, KYC holds).
- **Deep Ticket Inspector**: Slide-over drawer detailing merchant business info, communication audit log, and autonomous resolution status.

---

## Tech Stack

- **Framework**: [Next.js](https://nextjs.org/) (App Router, Turbopack / Webpack)
- **UI & Styling**: React 19, [Tailwind CSS v4](https://tailwindcss.com/), Lucide Icons
- **State & Data Fetching**: [@tanstack/react-query](https://tanstack.com/query), [Zustand](https://github.com/pmndrs/zustand)

---

## Getting Started

### 1. Environment Setup

Create `.env` or `.env.local` inside `client/`:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

### 2. Install & Run

```bash
npm install
npm run dev
```

The dashboard will be available at [http://localhost:3000](http://localhost:3000).
