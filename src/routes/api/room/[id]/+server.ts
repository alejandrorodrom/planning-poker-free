import { error } from '@sveltejs/kit';
import { env } from 'cloudflare:workers';
import { roomStubFetch } from '#lib/server/room/stubFetch.ts';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ params }) => {
  if (!env.ROOM) error(500, 'ROOM binding no disponible');

  const stub = env.ROOM.get(env.ROOM.idFromName(params.id));
  const res = await roomStubFetch(stub, '/exists', { method: 'GET' });
  const data = await res.json();
  return Response.json(data, { status: res.status });
};
