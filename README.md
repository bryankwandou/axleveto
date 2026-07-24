# AxleVeto

AxleVeto is a verifiable dispatch safety interlock for commercial fleets. It connects grounded driver inspections, critical maintenance intervals, role-gated release authority, and a tamper-evident proof ledger into one enforceable decision: a vehicle may dispatch, or it may not.

## Product wedge

Most fleet systems record maintenance and inspections. AxleVeto owns the decision boundary between those records and the morning dispatch window. A critical overdue interval, stale inspection, or unresolved safety flag produces a server-side veto that a dispatcher cannot dismiss.

## MVP workflows

- Fleet control room with live ready, attention, and blocked states.
- Grounded Groq operations agent with visible tool execution trace and deterministic dispatch guardrails.
- Phantom/Solflare browser wallet connection with devnet balance, wallet-signed memo proofs, and server verification.
- Framer Motion page reveals, agent response transitions, and proof-state animation with reduced-motion support.
- Driver pre-trip notes converted into grounded structured drafts through Groq when available, with deterministic fallback.
- Explicit `Not reported` handling for every unmentioned vehicle system.
- Server-side dispatch gate with direct API enforcement.
- Maintenance completion that resets the matching interval.
- Narrow physical-verification override for maintenance managers and fleet admins.
- Solana devnet health check and memo proof anchoring.
- Supabase schema with tenant RLS and append-only audit records.

## Run

```bash
npm install
npm run dev
```

Open `http://localhost:3000`. The operational workspace is at `/dashboard`.

## Verify

```bash
npm run type-check
npm run lint
npm test
npm run build
```

## Environment

```env
GROQ_API_KEY=
GROQ_MODEL=llama-3.3-70b-versatile
NEXT_PUBLIC_SOLANA_RPC_URL=https://api.devnet.solana.com
SOLANA_PRIVATE_KEY=[64-byte JSON array]
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
```

Never expose `SOLANA_PRIVATE_KEY` or `SUPABASE_SERVICE_ROLE_KEY` to browser code.