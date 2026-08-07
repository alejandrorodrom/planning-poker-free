import { forwardWebSocket } from './forwardWebSocket';

export { Room } from './room/Room';

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    const wsMatch = url.pathname.match(/^\/api\/room\/([^/]+)\/ws\/?$/);
    if (wsMatch) {
      return forwardWebSocket(request, env.ROOM, wsMatch[1]!);
    }
    return new Response('Not found', { status: 404 });
  }
};
