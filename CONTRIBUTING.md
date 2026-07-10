# Contributing to Stellar Crowdfund Web

Thanks for your interest in improving Stellar Crowdfund Web.

## Development setup

```bash
npm install
cp .env.example .env.local
npm run dev
```

You'll need the [Freighter](https://www.freighter.app/) browser extension to exercise wallet-connected flows locally.

## Before opening a PR

```bash
npm run lint
npm run typecheck
npm run build
```

All three must pass.

## Commit style

Use conventional, imperative commit subjects (`feat:`, `fix:`, `chore:`, `refactor:`, `docs:`) describing a single logical change.

## Code style

- TypeScript strict mode; avoid `any`.
- Components are function components using hooks.
- Keep contract/network access inside `lib/` and `hooks/`; components should stay presentational where possible.
- No placeholder or TODO content — if a feature isn't ready, don't ship the entry point for it.

## Project structure

See the top-level `README.md` for an overview, and `app/`, `components/`, `hooks/`, and `lib/` for the code itself.
