# Contributing

Thanks for your interest in **Planning Poker Free**. This document summarizes how to propose useful, reviewable changes.

<p>
  <a href="CONTRIBUTING.es.md">Español</a>
  ·
  <a href="CONTRIBUTING.md">English</a>
</p>

By participating, you agree to the [Code of Conduct](CODE_OF_CONDUCT.md).

## Before you start

1. Check open issues and PRs to avoid duplicate work.
2. For large changes (architecture, major product features, breaking changes), open an **issue** first and discuss the approach.
3. The name, logo, and visual identity are covered by [TRADEMARK.md](TRADEMARK.md): do not reuse them in forks as the official brand.

## Local setup

Requirements: **Node.js ≥ 24** (see `.nvmrc`).

```sh
nvm use
npm install
npm run gen
npm run dev
```

Open [http://localhost:5173](http://localhost:5173).

In development, Wrangler runs as a sidecar for Durable Objects and WebSockets.

### Checks before opening a PR

```sh
npm run format
npm run lint
npm run check
npm run build
```

## Contribution flow

1. Fork if needed and create a branch from `main` with a descriptive name (`fix/…`, `feat/…`, `docs/…`).
2. Keep changes small and focused; one PR = one purpose.
3. Follow existing code style (Svelte 5, TypeScript, repo conventions).
4. Include context in the PR: what changed, why, and how to test it.
5. Never commit secrets (`.env`, tokens, credentials).

## Sensitive areas

| Area | Notes |
| --- | --- |
| `src/lib/server/room/Room.ts` | Room logic, WebSockets, alarms; changes need manual multi-tab testing |
| Client/server protocol | Keep compatibility or document breaking changes |
| Branding / logo assets | See `TRADEMARK.md` |

## Security reports

Do not open public issues for vulnerabilities. Follow [SECURITY.md](SECURITY.md).

## License

By contributing, you agree that your contributions are licensed under the project's [MIT](LICENSE) license.
