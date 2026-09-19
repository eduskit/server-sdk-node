import { ClassroomClient } from './classroom/client.js';
import type { EduskitOptions, SideClientOptions } from './config.js';
import { EduskitError } from './errors.js';
import { WhiteboardClient } from './whiteboard/client.js';

export class Eduskit {
  private readonly classroom?: ClassroomClient;
  private readonly whiteboard?: WhiteboardClient;

  constructor(options: EduskitOptions) {
    const shared = {
      timeoutMs: options.timeoutMs,
      lang: options.lang,
      fetch: options.fetch,
    };
    if (options.client) {
      this.classroom = new ClassroomClient({ ...shared, ...options.client });
    }
    if (options.whiteboardClient) {
      this.whiteboard = new WhiteboardClient({
        ...shared,
        ...options.whiteboardClient,
      });
    }
  }

  get client(): ClassroomClient {
    if (!this.classroom) {
      throw new EduskitError({
        message: 'classroom client is not configured',
        errorCode: 'SDK_CLIENT_NOT_CONFIGURED',
        source: 'classroom',
      });
    }
    return this.classroom;
  }

  get whiteboardClient(): WhiteboardClient {
    if (!this.whiteboard) {
      throw new EduskitError({
        message: 'whiteboard client is not configured',
        errorCode: 'SDK_CLIENT_NOT_CONFIGURED',
        source: 'whiteboard',
      });
    }
    return this.whiteboard;
  }
}

export function createClassroomClient(
  options: SideClientOptions,
): ClassroomClient {
  return new ClassroomClient(options);
}

export function createWhiteboardClient(
  options: SideClientOptions,
): WhiteboardClient {
  return new WhiteboardClient(options);
}
