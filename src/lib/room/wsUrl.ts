import { dev } from '$app/environment';

export function roomWebSocketUrl(roomId: string): string {
  if (dev && typeof __DEV_WORKER_PORT__ !== 'undefined') {
    return `ws://${window.location.hostname}:${__DEV_WORKER_PORT__}/api/room/${roomId}/ws`;
  }
  const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
  return `${protocol}//${window.location.host}/api/room/${roomId}/ws`;
}
