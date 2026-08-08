<p align="center">
  <img src="static/assets/svg/planning-poker.svg" alt="Planning Poker Free" width="140" />
</p>

<h1 align="center">Planning Poker Free</h1>

<p align="center">
  <strong>Estimación ágil en tiempo real para equipos Scrum.</strong><br />
  Sin cuentas. Sin fricción. Solo una sala y tu equipo.
</p>

<p align="center">
  <a href="https://planningpoker.free/"><strong>https://planningpoker.free</strong></a>
</p>

<p align="center">
  <a href="https://planningpoker.free/"><img alt="Live" src="https://img.shields.io/badge/live-planningpoker.free-0F9D58.svg" /></a>
  <a href="https://github.com/alejandrorodrom/planning-poker-free/blob/main/LICENSE"><img alt="License: MIT" src="https://img.shields.io/badge/license-MIT-blue.svg" /></a>
  <a href="https://nodejs.org/"><img alt="Node.js >= 22" src="https://img.shields.io/badge/node-%3E%3D22-brightgreen.svg" /></a>
  <a href="https://svelte.dev/"><img alt="Svelte 5" src="https://img.shields.io/badge/svelte-5-FF3E00.svg" /></a>
  <a href="https://developers.cloudflare.com/workers/"><img alt="Cloudflare Workers" src="https://img.shields.io/badge/cloudflare-workers-F38020.svg" /></a>
</p>

<p align="center">
  <a href="#características">Características</a>
  ·
  <a href="#stack">Stack</a>
  ·
  <a href="#desarrollo">Desarrollo</a>
  ·
  <a href="#deploy">Deploy</a>
  ·
  <a href="CONTRIBUTING.md">Contribuir</a>
</p>

---

## Descripción

**Planning Poker Free** es una aplicación open source para estimar historias de usuario (PBI) mediante Planning Poker. Cada sala se ejecuta en un [Durable Object](https://developers.cloudflare.com/durable-objects/) de Cloudflare: estado compartido, WebSockets y sincronización en vivo, sin infraestructura propia ni registro de usuarios.

Pensada para ceremonias de estimación, refinamiento y equipos remotos.

## Características

| Área | Detalle |
| --- | --- |
| **Salas** | Públicas o privadas con contraseña; acceso por enlace `/room/{id}` |
| **Sesión** | Rejoin automático vía `localStorage`; la última pestaña activa gana |
| **Roles** | Moderador, votante y observador; cesión y claim de moderación |
| **Barajas** | Fibonacci modificado, Fibonacci, potencias de 2, T-shirt, secuencial |
| **Estimación** | Consenso, moda, mediana o media; voto oculto / revelado / auto-reveal |
| **Equipos** | Audiencia por ronda (todos o equipos); resultados overall y por equipo |
| **Export** | Copia de resultados en Markdown o CSV |

### Moderación

- El creador de la sala es Moderador (y votante por defecto).
- Puede ceder la moderación o dejar el rol; si está offline, otro participante conectado puede reclamarla.
- Solo participantes **conectados** pueden interactuar.

### Ciclo de vida de la sala

- Idle ≈ 30 min y duración máxima ≈ 8 h (alarmas internas multiplexadas).
- Sala finalizada o expirada → pantalla de cierre con opción de crear otra o volver al inicio.

## Stack

| Capa | Tecnología |
| --- | --- |
| UI | [Svelte 5](https://svelte.dev/) + [SvelteKit](https://kit.svelte.dev/) |
| Runtime | [Cloudflare Workers](https://developers.cloudflare.com/workers/) |
| Estado en vivo | [Durable Objects](https://developers.cloudflare.com/durable-objects/) (`Room`, binding `ROOM`) |
| Tipado Workers | `wrangler types` + [`@oselvar/sveltekit-add-worker-exports`](https://www.npmjs.com/package/@oselvar/sveltekit-add-worker-exports) |

## Requisitos

- **Node.js ≥ 22** (ver [`.nvmrc`](.nvmrc))
- Para publicar: cuenta de Cloudflare, o [deploy temporal](#deploy-temporal-sin-cuenta-cloudflare) sin cuenta

```sh
nvm use
npm install
```

## Desarrollo

```sh
npm run gen   # regenera tipos de Env (ROOM, ASSETS, …)
npm run dev   # Vite + sidecar Wrangler (Durable Objects / WebSockets)
```

Abre [http://localhost:5173](http://localhost:5173).

En desarrollo, el plugin de Workers levanta un sidecar de Wrangler para Durable Objects y WebSockets.

### Scripts

| Comando | Descripción |
| --- | --- |
| `npm run check` | `svelte-check` y sync de tipos |
| `npm run lint` | Prettier + ESLint |
| `npm run format` | Formato con Prettier |
| `npm run build` | Build de producción (Workers + assets) |
| `npm run preview` | Preview local con Wrangler |
| `npm run deploy` | Build + deploy a Cloudflare (producción) |
| `npm run deploy:staging` | Build + deploy al Worker de staging |

## Deploy

### Deploy temporal (sin cuenta Cloudflare)

Ideal al clonar el repositorio si quieres una URL pública en minutos, **sin** `wrangler login`. Requiere [Wrangler ≥ 4.102](https://developers.cloudflare.com/workers/platform/claim-deployments/).

1. Asegúrate de **no** estar autenticado (`npx wrangler logout` si hace falta).
2. Build y deploy temporal:

```sh
npm run build
npx wrangler deploy --temporary
```

3. La salida incluye:
   - URL `https://planning-poker-free.<subdominio>.workers.dev`
   - **claim URL**

La instancia temporal permanece activa unos **60 minutos**. Si no la reclamas, Cloudflare la elimina.

#### Conservar el deploy (claim)

1. Abre el claim URL impreso por Wrangler.
2. Inicia sesión o crea una cuenta Cloudflare.
3. Reclama la cuenta preview: el Worker y sus recursos (p. ej. Durable Objects) pasan a ser tuyos.
4. Opcional: dominio personalizado en Workers → Triggers → Custom Domains.

Para redeployar en una cuenta permanente, usa el flujo local o GitHub Actions — no `--temporary`. Ese flag solo aplica **sin** credenciales.

Referencia: [Claim deployments (temporary accounts)](https://developers.cloudflare.com/workers/platform/claim-deployments/).

### Local (cuenta permanente)

```sh
wrangler login    # una vez
npm run deploy           # producción
npm run deploy:staging   # staging (Worker aparte)
```

- Producción (oficial): [https://planningpoker.free](https://planningpoker.free)
- Producción (`workers.dev`): `https://planning-poker-free.<tu-subdominio>.workers.dev`
- Staging: `https://planning-poker-free-staging.<tu-subdominio>.workers.dev`

### GitHub Actions

**Producción** — [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml): build y deploy en cada push a `main` (también *Actions → Deploy → Run workflow*). Environment de GitHub **`production`**.

**Staging** — [`.github/workflows/deploy-staging.yml`](.github/workflows/deploy-staging.yml): solo *workflow_dispatch*. En *Actions → Deploy staging → Run workflow* eliges la **rama** a desplegar. Publica el Worker `planning-poker-free-staging` (Durable Objects propios, sin tocar producción). Environment de GitHub **`staging`**.

URL de staging: `https://planning-poker-free-staging.<tu-subdominio>.workers.dev`.

Secrets en cada environment (`Settings → Environments → production` / `staging`):

| Secret | Origen |
| --- | --- |
| `CLOUDFLARE_API_TOKEN` | Cloudflare → My Profile → API Tokens (*Edit Cloudflare Workers*) |
| `CLOUDFLARE_ACCOUNT_ID` | Dashboard Workers → Account ID |

Usa las credenciales de **la cuenta donde quieras publicar** (incluida una reclamada tras un deploy temporal). Los secrets no se incluyen en el código: cada fork debe configurar los suyos.

### Tras el primer deploy estable

1. Configura los secrets en GitHub (si usas Actions). Para staging, crea el environment `staging` con los mismos secrets.
2. Haz push a `main` o lanza el workflow de producción manualmente.
3. Verifica [https://planningpoker.free](https://planningpoker.free) o la URL `*.workers.dev` en el log del job o de Wrangler.
4. (Opcional) Prueba una rama en staging: *Actions → Deploy staging → Run workflow* → elige rama.
5. Dominio custom (producción oficial): Cloudflare → Workers → Domains & Routes → Custom Domains → `planningpoker.free`.

## Arquitectura

```
Cliente (SvelteKit)
    │  HTTP + WebSocket
    ▼
Worker (SvelteKit adapter-cloudflare)
    │  id de sala → stub
    ▼
Durable Object Room
    · jugadores, votos, PBI, equipos
    · broadcast en vivo
    · alarmas (idle / TTL)
```

Una instancia de `Room` por sala. El estado vive en el Durable Object; el flujo principal no requiere base de datos externa.

## Comunidad

| Documento | Contenido |
| --- | --- |
| [CONTRIBUTING.md](CONTRIBUTING.md) | Entorno local y proceso de PRs |
| [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md) | Normas de participación |
| [SECURITY.md](SECURITY.md) | Reporte privado de vulnerabilidades |
| [TRADEMARK.md](TRADEMARK.md) | Uso del nombre y el logo |

## Autores

| Rol | Persona |
| --- | --- |
| Desarrollo | [Alejandro Rodriguez Romero](https://www.linkedin.com/in/alejandro-rodriguez-romero/) |
| Imágenes | [Gabriela Rodriguez Romero](https://www.linkedin.com/in/gabriela-rodriguez-romero/) |

## Sponsors

Si el proyecto te resulta útil, puedes apoyar su mantenimiento:

- [GitHub Sponsors](https://github.com/sponsors/alejandrorodrom)
- [Ko-fi](https://ko-fi.com/alejandrorodriguezro)

## Licencia

El código fuente se distribuye bajo la licencia [MIT](LICENSE).

El nombre **Planning Poker Free**, el logo y la identidad visual **no** están cubiertos por la MIT: ver [TRADEMARK.md](TRADEMARK.md).
