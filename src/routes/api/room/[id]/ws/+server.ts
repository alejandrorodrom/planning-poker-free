import { forwardWebSocket } from '#lib/server/forwardWebSocket.ts';
import { error } from '@sveltejs/kit';
import { env } from 'cloudflare:workers';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = ({ params, request }) => {
  if (!env.ROOM) error(500, 'ROOM binding no disponible');
  return forwardWebSocket(request, env.ROOM, params.id);
};
