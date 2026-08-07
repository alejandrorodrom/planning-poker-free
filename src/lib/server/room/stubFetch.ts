export function roomStubFetch(
  stub: DurableObjectStub,
  path: string,
  init?: RequestInit
): Promise<Response> {
  const url = path.startsWith('http') ? path : `https://room${path.startsWith('/') ? '' : '/'}${path}`;
  return stub.fetch(url, init);
}
