export type EduskitSource = 'classroom' | 'whiteboard';

export type EduskitErrorInit = {
  message: string;
  status?: number;
  errorCode?: string;
  traceId?: string;
  path?: string;
  source?: EduskitSource;
};

export class EduskitError extends Error {
  readonly status?: number;
  readonly errorCode?: string;
  readonly traceId?: string;
  readonly path?: string;
  readonly source?: EduskitSource;

  constructor(init: EduskitErrorInit) {
    super(init.message);
    this.name = 'EduskitError';
    this.status = init.status;
    this.errorCode = init.errorCode;
    this.traceId = init.traceId;
    this.path = init.path;
    this.source = init.source;
  }
}
