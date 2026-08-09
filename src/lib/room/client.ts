import { ERROR_CODES } from '$lib/errors';
import type { ClientToServer, RoomPublicState, ServerToClient, StoryPublic } from './protocol';
import { roomWebSocketUrl } from './wsUrl';

export type RoomClientHandlers = {
  onSync: (state: RoomPublicState, you?: { playerId: string; token: string }) => void;
  onError: (message: string, code?: string) => void;
  onSessionTaken: () => void;
  onRemoved: () => void;
  onRoomClosed: (reason: string, results: StoryPublic[]) => void;
  onConnectionChange: (status: 'connecting' | 'open' | 'closed') => void;
};

const RECONNECT_BASE_MS = 500;
const RECONNECT_MAX_MS = 5000;

export class RoomClient {
  private ws: WebSocket | null = null;
  private roomId: string;
  private handlers: RoomClientHandlers;
  private closedByUser = false;
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private reconnectAttempt = 0;
  private generation = 0;

  constructor(roomId: string, handlers: RoomClientHandlers) {
    this.roomId = roomId;
    this.handlers = handlers;
  }

  connect(): void {
    this.closedByUser = false;
    this.clearReconnectTimer();
    this.openSocket();
  }

  send(msg: ClientToServer): void {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(msg));
    }
  }

  close(): void {
    this.closedByUser = true;
    this.clearReconnectTimer();
    this.generation += 1;
    const ws = this.ws;
    this.ws = null;
    ws?.close();
  }

  get wasClosedByUser() {
    return this.closedByUser;
  }

  private openSocket(): void {
    const generation = ++this.generation;
    this.handlers.onConnectionChange('connecting');
    const ws = new WebSocket(roomWebSocketUrl(this.roomId));
    this.ws = ws;

    ws.onopen = () => {
      if (generation !== this.generation || this.ws !== ws) return;
      this.reconnectAttempt = 0;
      this.handlers.onConnectionChange('open');
    };

    ws.onclose = () => {
      if (generation !== this.generation || this.ws !== ws) return;
      this.ws = null;
      this.handlers.onConnectionChange('closed');
      this.scheduleReconnect();
    };

    ws.onerror = () => {
      if (generation !== this.generation || this.ws !== ws) return;
      this.handlers.onError(ERROR_CODES.connection_error, ERROR_CODES.connection_error);
    };

    ws.onmessage = (event) => {
      if (generation !== this.generation || this.ws !== ws) return;
      let msg: ServerToClient;
      try {
        msg = JSON.parse(String(event.data)) as ServerToClient;
      } catch {
        return;
      }
      switch (msg.type) {
        case 'sync':
          this.handlers.onSync(msg.state, msg.you);
          break;
        case 'error':
          this.handlers.onError(msg.message, msg.code);
          break;
        case 'session_taken':
          this.handlers.onSessionTaken();
          break;
        case 'removed':
          this.handlers.onRemoved();
          break;
        case 'room_closed':
          this.handlers.onRoomClosed(msg.reason, msg.results);
          break;
      }
    };
  }

  private scheduleReconnect(): void {
    if (this.closedByUser || this.reconnectTimer) return;
    const delay = Math.min(
      RECONNECT_MAX_MS,
      RECONNECT_BASE_MS * 2 ** this.reconnectAttempt
    );
    this.reconnectAttempt += 1;
    this.reconnectTimer = setTimeout(() => {
      this.reconnectTimer = null;
      if (this.closedByUser) return;
      this.openSocket();
    }, delay);
  }

  private clearReconnectTimer(): void {
    if (!this.reconnectTimer) return;
    clearTimeout(this.reconnectTimer);
    this.reconnectTimer = null;
  }
}
