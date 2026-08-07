import { json, error } from '@sveltejs/kit';
import { roomStubFetch } from '$lib/server/room/stubFetch';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ params, platform }) => {
  const env = platform?.env;
  if (!env?.ROOM) error(500, 'ROOM binding no disponible');

  const stub = env.ROOM.get(env.ROOM.idFromName(params.id));
  const res = await roomStubFetch(stub, '/exists', { method: 'GET' });
  const data = await res.json();
  return json(data, { status: res.status });
};
