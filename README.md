<p align="center">
  <img src="static/assets/svg/planning-poker.svg" alt="Planning Poker Free" width="140" />
</p>

<h1 align="center">Planning Poker Free</h1>

<p align="center">
  <strong>Real-time agile estimation for Scrum teams.</strong><br />
  No accounts. No friction. Just a room and your team.
</p>

<p align="center">
  <a href="https://planningpoker.free/"><strong>https://planningpoker.free</strong></a>
</p>

<p align="center">
  <a href="README.es.md">Español</a>
  ·
  <a href="README.md">English</a>
</p>

<p align="center">
  <a href="https://planningpoker.free/"><img alt="Live" src="https://img.shields.io/badge/live-planningpoker.free-0F9D58.svg" /></a>
  <a href="https://github.com/alejandrorodrom/planning-poker-free/blob/main/LICENSE"><img alt="License: MIT" src="https://img.shields.io/badge/license-MIT-blue.svg" /></a>
  <a href="https://nodejs.org/"><img alt="Node.js >= 24" src="https://img.shields.io/badge/node-%3E%3D24-brightgreen.svg" /></a>
  <a href="https://svelte.dev/"><img alt="Svelte 5" src="https://img.shields.io/badge/svelte-5-FF3E00.svg" /></a>
  <a href="https://developers.cloudflare.com/workers/"><img alt="Cloudflare Workers" src="https://img.shields.io/badge/cloudflare-workers-F38020.svg" /></a>
</p>

<p align="center">
  <a href="#features">Features</a>
  ·
  <a href="#stack">Stack</a>
  ·
  <a href="#development">Development</a>
  ·
  <a href="#deploy">Deploy</a>
  ·
  <a href="CONTRIBUTING.md">Contributing</a>
</p>

---

## Overview

**Planning Poker Free** is an open-source app for estimating user stories (PBIs) with Planning Poker. Each room runs in a Cloudflare [Durable Object](https://developers.cloudflare.com/durable-objects/): shared state, WebSockets, and live sync—no self-hosted infra and no user registration.

Built for estimation ceremonies, refinement, and remote teams.

## Features

| Area | Detail |
| --- | --- |
| **Rooms** | Public or password-protected; join via `/room/{id}` |
| **Session** | Auto-rejoin via `localStorage`; the last active tab wins |
| **Roles** | Moderator, voter, and observer; transfer and claim moderation |
| **Decks** | Modified Fibonacci, Fibonacci, powers of 2, T-shirt, sequential |
| **Estimation** | Consensus, mode, median, or mean; hidden / live / auto-reveal |
| **Teams** | Round audience (everyone or specific teams); overall and per-team results |
| **Export** | Copy results as Markdown or CSV |
| **i18n** | English and Spanish UI; auto-detect + language switcher |

### Moderation

- The room creator is Moderator (and a voter by default).
- They can transfer moderation or leave the role; if offline, another connected participant can claim it.
- Only **connected** participants can interact.

### Room lifecycle

- Idle ≈ 30 min and max lifetime ≈ 8 h (multiplexed internal alarms).
- Closed or expired room → closing screen with options to create another room or go home.

## Stack

| Layer | Technology |
| --- | --- |
| UI | [Svelte 5](https://svelte.dev/) + [SvelteKit](https://kit.svelte.dev/) |
| Runtime | [Cloudflare Workers](https://developers.cloudflare.com/workers/) |
| Live state | [Durable Objects](https://developers.cloudflare.com/durable-objects/) (`Room`, binding `ROOM`) |
| Workers typing | `wrangler types` + [`@oselvar/sveltekit-add-worker-exports`](https://www.npmjs.com/package/@oselvar/sveltekit-add-worker-exports) |

## Requirements

- **Node.js ≥ 24** (see [`.nvmrc`](.nvmrc))
- To publish: a Cloudflare account, or a [temporary deploy](#temporary-deploy-no-cloudflare-account) without one

```sh
nvm use
npm install
```

## Development

```sh
npm run gen   # regenerate Env types (ROOM, ASSETS, …)
npm run dev   # Vite + Wrangler sidecar (Durable Objects / WebSockets)
```

Open [http://localhost:5173](http://localhost:5173).

In development, the Workers plugin starts a Wrangler sidecar for Durable Objects and WebSockets.

### Scripts

| Command | Description |
| --- | --- |
| `npm run check` | `svelte-check` and type sync |
| `npm run lint` | Prettier + ESLint |
| `npm run format` | Format with Prettier |
| `npm run build` | Production build (Workers + assets) |
| `npm run preview` | Local preview with Wrangler |
| `npm run deploy` | Build + deploy to Cloudflare (production) |
| `npm run deploy:staging` | Build + deploy to the staging Worker |

## Deploy

### Temporary deploy (no Cloudflare account)

Useful right after cloning if you want a public URL in minutes **without** `wrangler login`. Requires [Wrangler ≥ 4.102](https://developers.cloudflare.com/workers/platform/claim-deployments/).

1. Make sure you are **not** authenticated (`npx wrangler logout` if needed).
2. Build and temporary deploy:

```sh
npm run build
npx wrangler deploy --temporary
```

3. The output includes:
   - a URL `https://planning-poker-free.<subdomain>.workers.dev`
   - a **claim URL**

The temporary instance stays up for about **60 minutes**. If you do not claim it, Cloudflare deletes it.

#### Keep the deploy (claim)

1. Open the claim URL printed by Wrangler.
2. Sign in or create a Cloudflare account.
3. Claim the preview account: the Worker and its resources (e.g. Durable Objects) become yours.
4. Optional: custom domain under Workers → Triggers → Custom Domains.

To redeploy on a permanent account, use the local or GitHub Actions flow—not `--temporary`. That flag only applies **without** credentials.

Reference: [Claim deployments (temporary accounts)](https://developers.cloudflare.com/workers/platform/claim-deployments/).

### Local (permanent account)

```sh
wrangler login    # once
npm run deploy           # production
npm run deploy:staging   # staging (separate Worker)
```

- Official production: [https://planningpoker.free](https://planningpoker.free)
- Production (`workers.dev`): `https://planning-poker-free.<your-subdomain>.workers.dev`
- Staging: `https://planning-poker-free-staging.<your-subdomain>.workers.dev`

### GitHub Actions

**Production** — [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml): build and deploy on every push to `main` (also *Actions → Deploy → Run workflow*). GitHub environment **`production`**.

**Staging** — [`.github/workflows/deploy-staging.yml`](.github/workflows/deploy-staging.yml): *workflow_dispatch* only. In *Actions → Deploy staging → Run workflow* you pick the **branch** to deploy. Publishes the `planning-poker-free-staging` Worker (own Durable Objects, production untouched). GitHub environment **`staging`**.

Staging URL: `https://planning-poker-free-staging.<your-subdomain>.workers.dev`.

Secrets in each environment (`Settings → Environments → production` / `staging`):

| Secret | Source |
| --- | --- |
| `CLOUDFLARE_API_TOKEN` | Cloudflare → My Profile → API Tokens (*Edit Cloudflare Workers*) |
| `CLOUDFLARE_ACCOUNT_ID` | Workers dashboard → Account ID |

Use credentials for **the account you want to publish to** (including one claimed after a temporary deploy). Secrets are not in the repo: each fork must set its own.

### After the first stable deploy

1. Configure GitHub secrets (if you use Actions). For staging, create the `staging` environment with the same secrets.
2. Push to `main` or run the production workflow manually.
3. Verify [https://planningpoker.free](https://planningpoker.free) or the `*.workers.dev` URL in the job or Wrangler log.
4. (Optional) Try a branch on staging: *Actions → Deploy staging → Run workflow* → pick a branch.
5. Custom domain (official production): Cloudflare → Workers → Domains & Routes → Custom Domains → `planningpoker.free`.

## Architecture

```
Client (SvelteKit)
    │  HTTP + WebSocket
    ▼
Worker (SvelteKit adapter-cloudflare)
    │  room id → stub
    ▼
Durable Object Room
    · players, votes, PBIs, teams
    · live broadcast
    · alarms (idle / TTL)
```

One `Room` instance per room. State lives in the Durable Object; the main flow needs no external database.

## Community

| Document | Content |
| --- | --- |
| [CONTRIBUTING.md](CONTRIBUTING.md) | Local setup and PR process |
| [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md) | Participation guidelines |
| [SECURITY.md](SECURITY.md) | Private vulnerability reporting |
| [TRADEMARK.md](TRADEMARK.md) | Name and logo usage |

## Authors

| Role | Person |
| --- | --- |
| Development | [Alejandro Rodriguez Romero](https://www.linkedin.com/in/alejandro-rodriguez-romero/) |
| Imagery | [Gabriela Rodriguez Romero](https://www.linkedin.com/in/gabriela-rodriguez-romero/) |

## Sponsors

If the project is useful to you, you can support its maintenance:

- [GitHub Sponsors](https://github.com/sponsors/alejandrorodrom)
- [Ko-fi](https://ko-fi.com/alejandrorodriguezro)

## License

Source code is distributed under the [MIT](LICENSE) license.

The name **Planning Poker Free**, the logo, and visual identity are **not** covered by MIT: see [TRADEMARK.md](TRADEMARK.md).
