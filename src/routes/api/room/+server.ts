import { json, error } from '@sveltejs/kit';
import { ERROR_CODES } from '$lib/errors';
import { sanitizeAvatar } from '$lib/room/avatar';
import { normalizeCreateRoomConfig } from '$lib/room/createConfig';
import { randomId } from '$lib/server/room/crypto';
import { roomStubFetch } from '$lib/server/room/stubFetch';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ request, platform }) => {
  const env = platform?.env;
  if (!env?.ROOM) error(500, ERROR_CODES.internal_error);

  const body = (await request.json()) as {
    name?: string;
    roomName?: string;
    isPrivate?: boolean;
    password?: string;
    deck?: string;
    estimateRule?: string;
    revealMode?: string;
    autoRevealOnTimerEnd?: boolean;
    defaultTimerSeconds?: number | null;
    avatar?: unknown;
  };

  const hostName = body.name?.trim();
  if (!hostName) error(400, ERROR_CODES.display_name_required);

  const roomName = body.roomName?.trim();
  if (!roomName) error(400, ERROR_CODES.room_name_required);

  if (body.isPrivate && !body.password?.trim()) {
    error(400, ERROR_CODES.password_required);
  }

  const roomId = randomId(4);
  const stub = env.ROOM.get(env.ROOM.idFromName(roomId));
  const config = normalizeCreateRoomConfig(body);

  const res = await roomStubFetch(stub, '/create', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      id: roomId,
      roomName,
      hostName,
      isPrivate: Boolean(body.isPrivate),
      password: body.password,
      ...config,
      avatar: sanitizeAvatar(body.avatar)
    })
  });

  const data = await res.json();
  if (!res.ok) {
    error(res.status, (data as { error?: string }).error ?? ERROR_CODES.create_room_failed);
  }

  return json(data);
};
