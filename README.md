<p align="center">
  <img src="static/assets/svg/planning-poker.svg" alt="Planning Poker Free" width="140" />
</p>

<h1 align="center">Planning Poker Free</h1>

<p align="center">
  Estimación ágil en tiempo real para equipos SCRUM.<br />
  Sin cuentas. Sin fricción. Solo una sala y tu equipo.
</p>

<p align="center">
  <a href="https://planning-poker-free.obsidian-yuzu.workers.dev"><strong>Probar demo</strong></a>
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
- Cuenta de Cloudflare y `wrangler login` (solo para deploy)

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
| `npm run deploy` | Build + deploy a Cloudflare |

## Deploy

```sh
npm run deploy
```

Requiere autenticación (`wrangler login` o `CLOUDFLARE_API_TOKEN`).

Demo de verificación (cuenta preview temporal):

**https://planning-poker-free.obsidian-yuzu.workers.dev**

Para conservar la cuenta preview, reclámala desde el dashboard de Cloudflare (el comando de deploy temporal imprime el claim URL).

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
