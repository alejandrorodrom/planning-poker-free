import { forwardWebSocket } from '$lib/server/forwardWebSocket';
import { error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = ({ params, request, platform }) => {
  const env = platform?.env;
  if (!env?.ROOM) error(500, 'ROOM binding no disponible');
  return forwardWebSocket(request, env.ROOM, params.id);
};
