<p align="center">
  <img src="static/assets/svg/planning-poker.svg" alt="Planning Poker Free" width="140" />
</p>

<h1 align="center">Planning Poker Free</h1>

<p align="center">
  Estimación ágil en tiempo real para equipos SCRUM.<br />
  Sin cuentas. Sin fricción. Solo una sala y tu equipo.
</p>

<p align="center">
  <a href="#deploy-temporal-sin-cuenta-cloudflare"><strong>Deploy temporal</strong></a>
  ·
  <a href="#características">Características</a>
  ·
  <a href="#desarrollo">Desarrollo</a>
  ·
  <a href="CONTRIBUTING.md">Contribuir</a>
</p>

---

## ¿Qué es?

**Planning Poker Free** es una herramienta open-source para estimar historias de usuario (PBI) con Planning Poker. Cada sala corre en un Durable Object de Cloudflare: estado compartido, WebSockets y sincronización en vivo sin infraestructura propia.

Ideal para dailies de estimación, refinamiento o ceremonias remotas.

## Características

| Área | Qué incluye |
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

- Idle ~30 min y máximo ~8 h (alarmas internas multiplexadas).
- Sala finalizada o expirada → pantalla de cierre con opción de crear otra o volver al inicio.

## Stack

| Capa | Tecnología |
| --- | --- |
| UI | [Svelte 5](https://svelte.dev/) + [SvelteKit](https://kit.svelte.dev/) |
| Runtime | [Cloudflare Workers](https://developers.cloudflare.com/workers/) |
| Estado en vivo | [Durable Objects](https://developers.cloudflare.com/durable-objects/) (`Room`, binding `ROOM`) |
| Tipado Workers | `wrangler types` + plugin `@oselvar/sveltekit-add-worker-exports` |

## Requisitos

- **Node.js ≥ 22** (ver `.nvmrc`)
- Para publicar: cuenta de Cloudflare **o** deploy temporal (sin cuenta, ver abajo)

```sh
nvm use
npm install
```

## Desarrollo

```sh
npm run gen   # regenera tipos de Env (ROOM, ASSETS, …)
npm run dev   # Vite + sidecar Wrangler para DO / WebSockets
```

Abre [http://localhost:5173](http://localhost:5173).

En desarrollo, el plugin de Workers levanta un sidecar de Wrangler para Durable Objects y WebSockets.

### Scripts útiles

| Comando | Descripción |
| --- | --- |
| `npm run check` | `svelte-check` + sync de tipos |
| `npm run lint` | Prettier + ESLint |
| `npm run format` | Formato con Prettier |
| `npm run build` | Build de producción (Workers + assets) |
| `npm run preview` | Preview local con Wrangler |
| `npm run deploy` | Build + deploy a tu cuenta Cloudflare (local o GitHub Actions) |

## Deploy

### Deploy temporal (sin cuenta Cloudflare)

Útil si clonaste el repo y quieres una URL pública en minutos, **sin** `wrangler login`. Requiere [Wrangler ≥ 4.102](https://developers.cloudflare.com/workers/platform/claim-deployments/).

1. Asegúrate de **no** estar autenticado (si lo estás: `npx wrangler logout`).
2. Build + deploy temporal:

```sh
npm run build
npx wrangler deploy --temporary
```

3. En la salida verás:
   - una URL `https://planning-poker-free.<subdominio>.workers.dev`
   - un **claim URL**

La demo temporal vive unos **60 minutos**. Si no la reclamas, Cloudflare la elimina.

#### Conservar el deploy (claim)

1. Abre el claim URL que imprimió Wrangler.
2. Inicia sesión o crea una cuenta Cloudflare.
3. Reclama la cuenta preview: el Worker (y recursos como Durable Objects) pasan a ser tuyos y dejan de caducar.
4. Después puedes añadir un **dominio custom** (Workers → Triggers → Custom Domains) y seguir desplegando a **esa** cuenta.

Para redeployar a la cuenta ya reclamada (o a cualquier cuenta permanente), usa el flujo local o GitHub Actions de abajo — no `--temporary`. El flag solo funciona **sin** credenciales; si ya tienes token o login, Wrangler lo rechaza.

Docs oficiales: [Claim deployments (temporary accounts)](https://developers.cloudflare.com/workers/platform/claim-deployments/).

### Local (cuenta permanente)

```sh
wrangler login    # una vez
npm run deploy
```

Te da una URL estable `https://planning-poker-free.<tu-subdominio>.workers.dev`.

### GitHub Actions (recomendado en tu fork / repo)

El workflow [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml) hace build + deploy en cada push a `main` (también *Actions → Deploy → Run workflow*). Usa el environment de GitHub **`production`** (aparece en *Deployments* de la home del repo).

Secrets del repo (`Settings → Secrets and variables → Actions`):

| Secret | Origen |
| --- | --- |
| `CLOUDFLARE_API_TOKEN` | Cloudflare → My Profile → API Tokens (*Edit Cloudflare Workers*) |
| `CLOUDFLARE_ACCOUNT_ID` | Dashboard Workers → Account ID |

Usa el token y el Account ID de **la cuenta donde quieras publicar** (incluida una cuenta que hayas reclamado tras un deploy temporal). Los secrets no se clonan con el código: cada fork configura los suyos.

### Después del primer deploy estable

1. Añade los dos secrets en GitHub (si usas Actions).
2. Push a `main` o lanza el workflow a mano.
3. Comprueba la URL `*.workers.dev` en el log del job / de Wrangler.
4. (Opcional) Dominio custom en Cloudflare → Workers → Triggers → Custom Domains.

## Arquitectura (resumen)

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

Una instancia de `Room` por sala. El estado vive en el DO; no hace falta base de datos externa para el flujo principal.

## Comunidad

| Documento | Contenido |
| --- | --- |
| [CONTRIBUTING.md](CONTRIBUTING.md) | Cómo configurar el entorno y abrir PRs |
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

- [♥ Sponsor en GitHub](https://github.com/sponsors/alejandrorodrom)
- [♥ Ko-fi](https://ko-fi.com/alejandrorodriguezro)

## Licencia

El código fuente se distribuye bajo la licencia [MIT](LICENSE).

El nombre **Planning Poker Free**, el logo y demás identidad visual **no** están cubiertos por la MIT: ver [TRADEMARK.md](TRADEMARK.md).
