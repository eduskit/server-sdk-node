export { Eduskit, createClassroomClient, createWhiteboardClient } from './eduskit.js';
export { ClassroomClient } from './classroom/client.js';
export { WhiteboardClient } from './whiteboard/client.js';
export { EduskitError } from './errors.js';
export {
  EDU_TOKEN_AUDIENCE,
  EDU_TOKEN_ISSUER,
  ROOM_TOKEN_AUDIENCE,
  ROOM_TOKEN_ISSUER,
} from './token.js';
export type { EduskitSource, EduskitErrorInit } from './errors.js';
export type {
  ClientCredentials,
  EduskitOptions,
  SharedClientOptions,
  SideClientOptions,
} from './config.js';
export type * from './classroom/types.js';
export type * from './whiteboard/types.js';
