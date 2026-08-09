# Contribuir

Gracias por tu interés en **Planning Poker Free**. Este documento resume cómo proponer cambios de forma útil y revisable.

<p>
  <a href="CONTRIBUTING.es.md">Español</a>
  ·
  <a href="CONTRIBUTING.md">English</a>
</p>

Al participar, aceptas el [Código de conducta](CODE_OF_CONDUCT.es.md).

## Antes de empezar

1. Revisa issues y PRs abiertos para evitar trabajo duplicado.
2. Para cambios grandes (arquitectura, nuevas features de producto, breaking changes), abre primero un **issue** y comenta el enfoque.
3. El nombre, el logo y la identidad visual están sujetos a [TRADEMARK.es.md](TRADEMARK.es.md): no los reutilices en forks como marca oficial.

## Configuración local

Requisitos: **Node.js ≥ 24** (ver `.nvmrc`).

```sh
nvm use
npm install
npm run gen
npm run dev
```

Abre [http://localhost:5173](http://localhost:5173).

En desarrollo, Wrangler corre como sidecar para Durable Objects y WebSockets.

### Comprobaciones antes de abrir un PR

```sh
npm run format
npm run lint
npm run check
npm run build
```

## Flujo de contribución

1. Haz fork (si aplica) y crea una rama desde `main` con un nombre descriptivo (`fix/…`, `feat/…`, `docs/…`).
2. Haz cambios pequeños y enfocados; un PR = un propósito.
3. Sigue el estilo del código existente (Svelte 5, TypeScript, convenciones del repo).
4. Incluye contexto en el PR: qué cambia, por qué, y cómo probarlo.
5. No commits de secretos (`.env`, tokens, credenciales).

## Áreas sensibles

| Área | Notas |
| --- | --- |
| `src/lib/server/room/Room.ts` | Lógica de sala, WebSockets, alarmas; cambios requieren prueba manual multi-pestaña |
| Protocolo cliente/servidor | Mantén compatibilidad o documenta breaking changes |
| Branding / assets de logo | Ver `TRADEMARK.es.md` |

## Reportes de seguridad

No abras issues públicos para vulnerabilidades. Sigue [SECURITY.es.md](SECURITY.es.md).

## Licencia

Al contribuir, aceptas que tus aportes se licencien bajo la [MIT](LICENSE) del proyecto.
