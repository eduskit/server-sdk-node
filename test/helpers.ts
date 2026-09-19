export type RecordedRequest = {
  url: string;
  method: string;
  headers: Record<string, string>;
  body?: unknown;
};

export function mockFetch(handler: (req: RecordedRequest) => {
  status?: number;
  body: unknown;
  headers?: Record<string, string>;
}) {
  const calls: RecordedRequest[] = [];
  const fetchImpl = async (input: string, init?: RequestInit) => {
    const headers: Record<string, string> = {};
    const raw = init?.headers;
    if (raw && typeof raw === 'object' && !Array.isArray(raw)) {
      for (const [key, value] of Object.entries(raw as Record<string, string>)) {
        headers[key.toLowerCase()] = value;
      }
    }
    const recorded: RecordedRequest = {
      url: input,
      method: (init?.method ?? 'GET').toUpperCase(),
      headers,
      body: init?.body ? JSON.parse(String(init.body)) : undefined,
    };
    calls.push(recorded);
    const result = handler(recorded);
    const responseHeaders = new Headers({
      'content-type': 'application/json',
      'x-trace-id': 'trace-from-header',
      ...result.headers,
    });
    return new Response(JSON.stringify(result.body), {
      status: result.status ?? 200,
      headers: responseHeaders,
    });
  };
  return { fetchImpl, calls };
}
