# Planning Poker Free

App de Planning Poker en tiempo real.

## Stack

- **Svelte 5** + **SvelteKit**
- **Cloudflare Workers** (`@sveltejs/adapter-cloudflare`)
- Estilos portados del avance Angular (Pattaya, Montserrat, paleta `#165d70`, liquid button)
- Durable Objects (siguiente paso para salas realtime)

## Requisitos

- Node.js **>= 22**

```sh
nvm use
npm install
```

## Desarrollo

```sh
npm run dev
```

Abre [http://localhost:5173](http://localhost:5173).

## Build / preview (Cloudflare)

```sh
npm run build
npm run preview
```

## Autores

- Desarrollo: [Alejandro Rodriguez Romero](https://www.linkedin.com/in/alejandro-rodriguez-romero/)
- Imágenes: [Gabriela Rodriguez Romero](https://www.linkedin.com/in/gabriela-rodriguez-romero/)
