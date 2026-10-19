import type { SharedClientOptions } from '../config.js';
import { EduskitError } from '../errors.js';
import { HttpTransport } from '../http.js';
import { createConsoleApis } from './apis.js';

export type ConsoleClientOptions = SharedClientOptions & {
  /** console-api origin, without /v1. */
  baseUrl: string;
  /** Tenant access token. Public authentication methods work without a token. */
  accessToken?: string;
};

export class ConsoleTransport {
  private readonly http: HttpTransport;
  private accessToken: string;
  constructor(options: ConsoleClientOptions) {
    this.http = new HttpTransport({ ...options, appKey: '', appSecret: '', source: 'console' });
    this.accessToken = options.accessToken ?? '';
  }
  setAccessToken(token: string): void { this.accessToken = token; }
  uploadFile(url: string, data: Uint8Array, contentType: string): Promise<void> { return this.http.uploadFile(url, data, contentType); }
  get lastTraceId(): string { return this.http.lastTraceId; }
  request<T>(method: string, path: string, scope: string, input: object = {}, appId?: string, queryKeys?: string[]): Promise<T> {
    const headers: Record<string, string> = {};
    if (scope !== 'public') {
      if (!this.accessToken.trim()) throw new EduskitError({ message: 'tenant accessToken is required', errorCode: 'SDK_CONSOLE_TOKEN_REQUIRED', source: 'console' });
      headers.authorization = `Bearer ${this.accessToken}`;
    }
    if (scope === 'app') {
      if (!appId?.trim()) throw new EduskitError({ message: 'appId is required', errorCode: 'SDK_CONSOLE_APP_ID_REQUIRED', source: 'console' });
      headers['x-app-id'] = appId;
    }
    const params = new URLSearchParams();
    const body: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(input)) {
      const inQuery = queryKeys ? queryKeys.includes(key) : method === 'GET' || method === 'DELETE';
      if (inQuery) {
        if (value === undefined || value === null || value === '') continue;
        if (!['string', 'number', 'boolean'].includes(typeof value)) throw new EduskitError({ message: `query field ${key} must be scalar`, errorCode: 'SDK_QUERY_INVALID', source: 'console' });
        params.set(key, String(value));
      } else body[key] = value;
    }
    const query = params.toString();
    return this.http.request<T>(method, path + (query ? `?${query}` : ''), method === 'GET' || (method === 'DELETE' && !queryKeys) ? undefined : body, headers);
  }
}

export class ConsoleClient {
  private readonly transport: ConsoleTransport;
  readonly auth;
  readonly apps;
  readonly users;
  readonly classrooms;
  readonly entryCodes;
  readonly activity;
  readonly coursewares;
  readonly liveVideos;
  readonly dashboard;
  readonly billing;
  constructor(options: ConsoleClientOptions) {
    this.transport = new ConsoleTransport(options);
    const apis = createConsoleApis(this.transport);
    this.auth = apis.auth;
    this.apps = apis.apps;
    this.users = apis.users;
    this.classrooms = apis.classrooms;
    this.entryCodes = apis.entryCodes;
    this.activity = apis.activity;
    this.coursewares = apis.coursewares;
    this.liveVideos = apis.liveVideos;
    this.dashboard = apis.dashboard;
    this.billing = apis.billing;
  }
  setAccessToken(token: string): void { this.transport.setAccessToken(token); }
  uploadFile(url: string, data: Uint8Array, contentType: string): Promise<void> { return this.transport.uploadFile(url, data, contentType); }
  get lastTraceId(): string { return this.transport.lastTraceId; }
}
