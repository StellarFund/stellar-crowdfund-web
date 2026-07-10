# Stellar Crowdfund Web

A Next.js web application for crowdfunding on the [Stellar](https://stellar.org) network. Anyone can launch a campaign, back projects they believe in, track milestone-based fund releases, and claim automatic refunds if a campaign fails to reach its goal.

Part of the [StellarFund](https://github.com/StellarFund) GitHub org.

## Sister repos

- Contracts: [stellar-crowdfund-contracts](https://github.com/StellarFund/stellar-crowdfund-contracts)
- API + Docs: [stellar-crowdfund-api-docs](https://github.com/StellarFund/stellar-crowdfund-api-docs)

## Tech stack

- Next.js 14 (App Router) + TypeScript
- Tailwind CSS (dark mode default)
- `@stellar/freighter-api` for wallet connectivity
- `@stellar/stellar-sdk` for Horizon + Soroban RPC access
- Recharts for dashboard charts
- date-fns for date formatting

## Getting started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Environment variables

Copy `.env.example` to `.env.local` and set the deployed registry contract ID once the [contracts repo](https://github.com/StellarFund/stellar-crowdfund-contracts) has a deployment for your target network. Without it, the app falls back to a local demo dataset so every page remains fully functional during development.

| Variable | Description |
| --- | --- |
| `NEXT_PUBLIC_STELLAR_NETWORK` | `testnet` or `public` |
| `NEXT_PUBLIC_HORIZON_URL` | Horizon endpoint |
| `NEXT_PUBLIC_SOROBAN_RPC_URL` | Soroban RPC endpoint |
| `NEXT_PUBLIC_REGISTRY_CONTRACT_ID` | Deployed campaign registry contract ID |

## Scripts

- `npm run dev` – start the dev server
- `npm run build` – production build
- `npm run lint` – run ESLint
- `npm run typecheck` – run the TypeScript compiler with no emit

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md).
