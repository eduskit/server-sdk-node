import type { FetchLike } from './http.js';

export type ClientCredentials = {
  baseUrl: string;
  /** 租户应用 ID；用于客户后端本地签发 SDK Token。 */
  appId: string;
  appKey: string;
  appSecret: string;
};

export type SharedClientOptions = {
  timeoutMs?: number;
  lang?: string;
  fetch?: FetchLike;
};

export type EduskitOptions = SharedClientOptions & {
  client?: ClientCredentials;
  whiteboardClient?: ClientCredentials;
};

export type SideClientOptions = ClientCredentials & SharedClientOptions;
