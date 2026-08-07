export type RoomSession = {
  roomId: string;
  playerId: string;
  token: string;
  name: string;
};

const key = (roomId: string) => `ppf:room:${roomId}`;

export function loadSession(roomId: string): RoomSession | null {
  if (typeof localStorage === 'undefined') return null;
  try {
    const raw = localStorage.getItem(key(roomId));
    if (!raw) return null;
    const parsed = JSON.parse(raw) as RoomSession;
    if (!parsed?.playerId || !parsed?.token || parsed.roomId !== roomId) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function saveSession(session: RoomSession): void {
  localStorage.setItem(key(session.roomId), JSON.stringify(session));
}

export function clearSession(roomId: string): void {
  localStorage.removeItem(key(roomId));
}
