import { EduskitError, type EduskitSource } from './errors.js';

export type FetchLike = (
  input: string,
  init?: RequestInit,
) => Promise<Response>;

export type HttpConfig = {
  baseUrl: string;
  appKey: string;
  appSecret: string;
  timeoutMs?: number;
  lang?: string;
  fetch?: FetchLike;
  source: EduskitSource;
};

type Envelope = {
  code?: number;
  message?: string;
  data?: unknown;
  traceId?: string;
  errorCode?: string;
  path?: string;
};

export class HttpTransport {
  lastTraceId = '';
  private readonly baseUrl: string;
  private readonly appKey: string;
  private readonly appSecret: string;
  private readonly timeoutMs: number;
  private readonly lang: string;
  private readonly fetchImpl: FetchLike;
  private readonly source: EduskitSource;

  constructor(config: HttpConfig) {
    this.baseUrl = config.baseUrl.replace(/\/+$/, '');
    this.appKey = config.appKey;
    this.appSecret = config.appSecret;
    this.timeoutMs = config.timeoutMs ?? 10_000;
    this.lang = config.lang ?? 'zh-CN';
    this.fetchImpl = config.fetch ?? fetch;
    this.source = config.source;
  }

  async request<T>(
    method: string,
    path: string,
    body?: unknown,
  ): Promise<T> {
    const url = `${this.baseUrl}${path}`;
    const traceId = crypto.randomUUID().replace(/-/g, '').slice(0, 16);
    const headers: Record<string, string> = {
      'content-type': 'application/json',
      accept: 'application/json',
      'x-app-key': this.appKey,
      'x-app-secret': this.appSecret,
      'x-lang': this.lang,
      'x-trace-id': traceId,
    };

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), this.timeoutMs);
    let response: Response;
    try {
      response = await this.fetchImpl(url, {
        method,
        headers,
        body: body === undefined ? undefined : JSON.stringify(body),
        signal: controller.signal,
      });
    } catch (error) {
      clearTimeout(timer);
      if (error instanceof Error && error.name === 'AbortError') {
        throw new EduskitError({
          message: `request timeout after ${this.timeoutMs}ms`,
          errorCode: 'SDK_TIMEOUT',
          path,
          source: this.source,
          traceId,
        });
      }
      throw new EduskitError({
        message: error instanceof Error ? error.message : String(error),
        errorCode: 'SDK_NETWORK_ERROR',
        path,
        source: this.source,
        traceId,
      });
    }
    clearTimeout(timer);

    const headerTrace = response.headers.get('x-trace-id') ?? traceId;
    const text = await response.text();
    let payload: Envelope = {};
    if (text) {
      try {
        payload = JSON.parse(text) as Envelope;
      } catch {
        throw new EduskitError({
          message: text || `invalid json (HTTP ${response.status})`,
          status: response.status,
          errorCode: 'SDK_INVALID_JSON',
          path,
          source: this.source,
          traceId: headerTrace,
        });
      }
    }

    this.lastTraceId = String(payload.traceId || headerTrace);

    if (!response.ok || (payload.code != null && payload.code !== 0)) {
      throw new EduskitError({
        message: payload.message || `HTTP ${response.status}`,
        status: response.status,
        errorCode: payload.errorCode || `HTTP_${response.status}`,
        path: payload.path || path,
        source: this.source,
        traceId: this.lastTraceId,
      });
    }

    return (payload.data ?? payload) as T;
  }
}

export function encodePath(value: string): string {
  return encodeURIComponent(value);
}
