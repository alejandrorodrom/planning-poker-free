export async function forwardWebSocket(
  request: Request,
  namespace: DurableObjectNamespace,
  name: string
): Promise<Response> {
  if (request.headers.get('upgrade') !== 'websocket') {
    return new Response('Expected WebSocket', { status: 426 });
  }
  const id = namespace.idFromName(name);
  return namespace.get(id).fetch(request);
}

