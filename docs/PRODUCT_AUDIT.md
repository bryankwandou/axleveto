# AxleVeto Product Audit — July 24, 2026

## Brutal verdict

A generic “AI fleet maintenance dashboard” is weak, crowded, and easy to copy. AxleVeto only becomes defensible when it refuses to be a dashboard and owns a narrow operational control: dispatch authorization backed by evidence.

## Locked positioning

**Category:** Verifiable dispatch safety interlock.

**Buyer:** Fleet owner, operations director, or safety manager running 20–500 commercial vehicles without enterprise-grade telematics operations.

**User:** Driver, dispatcher, maintenance manager, fleet administrator.

**Core promise:** No vehicle leaves because a critical maintenance fact was buried in a spreadsheet, chat thread, or unreviewed inspection.

## Business model

- Starter: $249/month for up to 25 vehicles.
- Growth: $8–$14 per active vehicle/month with inspection drafting and proof ledger.
- Compliance: premium retention, export, SSO, and insurer-facing evidence packages.
- Expansion: maintenance vendors, insurers, leasing companies, and API dispatch controls.

## Competitive wedge

AxleVeto does not try to replace telematics, routing, fuel cards, or full fleet ERP. It integrates with them and becomes the policy engine deciding whether a unit is dispatchable. The moat is the accumulated decision graph: inspection evidence, interval policy, physical resolution, authority, and immutable release history.

## Workflow acceptance

1. Notes mentioning tires only keep brakes, lights, fluids, and body as `Not reported`.
2. An overdue critical brake interval returns `409` from the server gate.
3. A dispatcher override returns `403` even with a long justification.
4. Matching brake service advances the due odometer.
5. A release digest anchors to Solana devnet without placing private fleet details on-chain.

## Remaining production work

- Connect API routes to Supabase instead of bundled demo records.
- Add authentication and tenant invitation flows.
- Add photo object storage, image compression, and malware scanning.
- Add webhooks for external dispatch/TMS systems.
- Add signed audit exports and retention controls.

## Score after iteration

- Problem severity: 9.2/10
- Differentiation: 8.7/10
- MVP workflow clarity: 9.3/10
- Visual system: 9.0/10
- Production completeness: 7.4/10 until hosted persistence and auth are connected
- Overall startup readiness: 8.7/10

Claims of 99.5/100 would be dishonest before paid pilots, retention data, and production incident history exist.