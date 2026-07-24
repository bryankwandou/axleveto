# Vowrail MVP Execution Plan

## Product Contract

Vowrail compiles a financial mandate into deterministic limits, maps nested authority, exposes worst-case loss, requests a non-authoritative model review, and commits a signed proof to Solana devnet.

## MVP Acceptance

1. A user can change amount, per-action cap, daily cap, depth, and destination status.
2. The same input always produces the same policy verdict.
3. Groq explains risk but cannot mutate the verdict.
4. Phantom can sign and submit a Vowrail policy fingerprint to devnet.
5. The dashboard shows hierarchy, allocated exposure, settled spend, blocks, and conservation status.
6. Tests cover pass, over-allocation, destination rejection, and state preservation.
7. Production build, public GitHub repository, and Vercel deployment succeed.

## Deliberate Deferrals

Production custody, audited token vaults, multi-signature administration, database persistence, billing, and formal verification are not falsely presented as complete. They follow validation with design partners.
