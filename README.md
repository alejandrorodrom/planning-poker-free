# Planning Poker Free

App de Planning Poker en tiempo real para equipos SCRUM.

## Stack

- **Svelte 5** + **SvelteKit**
- **Cloudflare Workers** + **Durable Objects** (`Room` por sala, binding `ROOM`)
- Plugin `@oselvar/sveltekit-add-worker-exports` (exporta la clase DO)
- Estilos: Pattaya, Montserrat, paleta `#165d70`, liquid button

## Requisitos

- Node.js **>= 22**

```sh
nvm use
npm install
```

## Desarrollo

```sh
npm run gen   # regenera Env (ROOM, ASSETS)
npm run dev
```

Abre [http://localhost:5173](http://localhost:5173).

En dev, el plugin levanta un sidecar Wrangler para Durable Objects / WebSockets.

## Build / preview / deploy

```sh
npm run build
npm run preview
npm run deploy
```

`deploy` requiere `wrangler login` (o `CLOUDFLARE_API_TOKEN`).

Último deploy de verificación (cuenta preview temporal):

- https://planning-poker-free.obsidian-yuzu.workers.dev

Para quedarte con la cuenta: reclama el preview en el dashboard de Cloudflare (`wrangler deploy --temporary` imprime el claim URL).

## Producto

### Sala y sesión

- Crea sala pública/privada (password), baraja y regla de estimate
- Join por link `/room/{id}`: nombre, password si aplica, rol, equipo
- Sesión en `localStorage` (`ppf:room:{id}`) → rejoin sin modal; última pestaña gana
- Sala muerta / TTL / finalizar → doge + crear sala / volver al inicio

### Moderador

- Creador = Moderador (+ voter por defecto)
- Si el Moderador tiene rol **Votar**, también emite carta (incluso en rondas por equipos)
- Ceder moderación, dejar el rol (claim inmediato), claim si el Moderador está offline
- Solo personas **conectadas** pueden interactuar

### Estimación

- Barajas: Fibonacci modificado (default), Fibonacci, potencias de 2, T-shirt, secuencial
- Regla: `consensus` (default), `mode`, `median`, `mean`
- Historias (PBI), voto oculto/reveal, revoto o cerrar votación
- Contador de voto visible (auto-reveal opcional); idle 30 min y max 8 h internos (un `setAlarm` multiplexado)

### Equipos y audiencia (Fase 2)

- Equipos libres creados por el Moderador
- Roles `voter` / `observer` (+ label opcional)
- Audiencia por ronda: todos los voters o equipos seleccionados
- Resultados PBI en vivo (overall + byTeam) con copiar Markdown/CSV

## Autores

- Desarrollo: [Alejandro Rodriguez Romero](https://www.linkedin.com/in/alejandro-rodriguez-romero/)
- Imágenes: [Gabriela Rodriguez Romero](https://www.linkedin.com/in/gabriela-rodriguez-romero/)
