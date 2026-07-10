# Stellar Crowdfund Web

A Next.js web application for crowdfunding on the [Stellar](https://stellar.org) network. Anyone can launch a campaign, back projects they believe in, track milestone-based fund releases, and claim automatic refunds if a campaign fails to reach its goal.

Part of the [StellarFund](https://github.com/StellarFund) GitHub org.

## Sister repos

- Contracts: [stellar-crowdfund-contracts](https://github.com/StellarFund/stellar-crowdfund-contracts)
- API + Docs: [stellar-crowdfund-api](https://github.com/StellarFund/stellar-crowdfund-api)

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

## Stellar integration

### Wallet connection

[`lib/freighter.ts`](./lib/freighter.ts) wraps `@stellar/freighter-api`:
`connectFreighter()` checks the extension is installed, requests access,
and reads back the connected network so the UI can warn on a mismatch (see
[`hooks/useWallet.tsx`](./hooks/useWallet.tsx)). Nothing here talks to
Horizon or Soroban RPC directly — it only produces a public key and signs
XDR handed to it by `lib/stellar.ts`.

### Reads and writes

[`lib/stellar.ts`](./lib/stellar.ts) is the only file that talks to Soroban
RPC (`@stellar/stellar-sdk`), via two functions everything else goes
through:

- `readContract(contractId, method, args)` — simulates a call with a
  throwaway zero-sequence source account (no funded account needed) and
  decodes the result with `scValToNative`. Used for every list/get view.
- `invokeContract(contractId, method, args, sourcePublicKey, onStage)` —
  builds the transaction, `simulateTransaction` + `prepareTransaction` to
  get correct Soroban footprint/fees, hands the XDR to Freighter for
  signing, submits, then polls `getTransaction` until it lands. Used for
  `back`, `claim_refund`, `submit_proof`.

[`lib/contracts.ts`](./lib/contracts.ts) is the thin domain layer hooks call
(`listCampaigns`, `getCampaign`, `backCampaign`, `claimRefund`,
`submitMilestoneProof`, ...) — see [Known integration gap](#known-integration-gap-vs-the-deployed-contracts)
below for what it currently targets.

### Demo fallback

Every function in `lib/contracts.ts` checks `usingLiveContracts()`
(`Boolean(NEXT_PUBLIC_REGISTRY_CONTRACT_ID)`) and falls back to
[`lib/demoStore.ts`](./lib/demoStore.ts), an in-memory dataset, when unset.
This is why the app is "fully functional" with zero configuration — every
page works against fake data until you deliberately point it at a real
deployment.

### Known integration gap vs. the deployed contracts

**`NEXT_PUBLIC_REGISTRY_CONTRACT_ID` should stay unset for now.** This
app's contract layer was built against an earlier, single-contract design —
one "registry" contract exposing `list_campaigns`, `get_campaign`,
`get_contributions`, `platform_stats`, `back`, `claim_refund`,
`submit_proof`, `refundable_amount`, `has_claimed_refund` — and
`Campaign.contractAddress` in [`types/index.ts`](./types/index.ts) assumes
each campaign has its own deployed contract.

The contracts actually deployed by
[`stellar-crowdfund-contracts`](https://github.com/StellarFund/stellar-crowdfund-contracts#deployed-contracts-testnet)
don't match either assumption:

- There are **four** fixed contracts (`campaign`, `escrow`, `milestone`,
  `registry`), not one — no method above exists on any of them under those
  names. The closest real equivalents are `campaign.get_active_campaigns`,
  `campaign.get_campaign`, `escrow.get_contributions_by_campaign`,
  `registry.get_stats`, `escrow.contribute`, `escrow.refund_backer`, and
  `milestone.submit_milestone`.
- Campaigns are identified by a `u64` returned from
  `campaign.create_campaign`, not a per-campaign contract address — every
  write call needs the fixed `escrow`/`milestone` contract ID plus that
  numeric campaign ID, not `Campaign.contractAddress`.
- Several of those real functions require an **admin-signed** follow-up
  call on a different contract (e.g. `escrow.register_campaign` after
  `campaign.create_campaign`) that nothing in this org currently automates
  — see [the orchestrator gap in the contracts repo](https://github.com/StellarFund/stellar-crowdfund-contracts#the-off-chain-orchestrator-gap).
  A pure frontend can't safely do this itself, since the admin key can't
  live in a browser.

Pointing `NEXT_PUBLIC_REGISTRY_CONTRACT_ID` at the real testnet `registry`
ID today will send `readContract`/`invokeContract` calls that revert or
error against methods that don't exist. Rewiring `lib/contracts.ts` to the
real four-contract ABI (and deciding where the admin-gated glue calls run)
is the next real integration step for this repo.

### Network config

| Variable | Testnet value | Mainnet value |
|---|---|---|
| `NEXT_PUBLIC_STELLAR_NETWORK` | `testnet` | `public` |
| `NEXT_PUBLIC_HORIZON_URL` | `https://horizon-testnet.stellar.org` | `https://horizon.stellar.org` |
| `NEXT_PUBLIC_SOROBAN_RPC_URL` | `https://soroban-testnet.stellar.org` | `https://soroban-rpc.stellar.org` |
| `NEXT_PUBLIC_REGISTRY_CONTRACT_ID` | see [Known integration gap](#known-integration-gap-vs-the-deployed-contracts) | not yet deployed |

`lib/stellar.ts` derives the network passphrase from
`NEXT_PUBLIC_STELLAR_NETWORK` via `@stellar/stellar-sdk`'s `Networks.TESTNET`
/ `Networks.PUBLIC` — it isn't a separate env var.

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md).
