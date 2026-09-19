import type { SideClientOptions } from '../config.js';
import { encodePath, HttpTransport } from '../http.js';
import {
  ROOM_TOKEN_AUDIENCE,
  ROOM_TOKEN_ISSUER,
  requireText,
  sdkTokenError,
  signHs256,
  type LocalTokenSigner,
} from '../token.js';
import type {
  Capture,
  ConvertJob,
  CreateCaptureInput,
  CreateConvertJobInput,
  EnqueueVideoExportInput,
  IssueRoomTokenInput,
  MediaAsset,
  RecordingSession,
  RegisterMediaAssetInput,
  RoomToken,
  StartRecordingInput,
  StopRecordingInput,
  VideoExportJob,
  AttachRoomCoursewareInput,
  AttachedRoomCourseware,
} from './types.js';

export class WhiteboardClient {
  readonly auth: WhiteboardAuthApi;
  readonly recordings: WhiteboardRecordingsApi;
  readonly captures: WhiteboardCapturesApi;
  readonly files: WhiteboardFilesApi;
  readonly rooms: WhiteboardRoomsApi;
  private readonly http: HttpTransport;

  constructor(options: SideClientOptions) {
    this.http = new HttpTransport({ ...options, source: 'whiteboard' });
    this.auth = new WhiteboardAuthApi({
      appId: options.appId,
      appSecret: options.appSecret,
      source: 'whiteboard',
    });
    this.recordings = new WhiteboardRecordingsApi(this.http);
    this.captures = new WhiteboardCapturesApi(this.http);
    this.files = new WhiteboardFilesApi(this.http);
    this.rooms = new WhiteboardRoomsApi(this.http);
  }

  get lastTraceId(): string {
    return this.http.lastTraceId;
  }
}

class WhiteboardRoomsApi {
  constructor(private readonly http: HttpTransport) {}

  attachCourseware(
    roomId: string,
    input: AttachRoomCoursewareInput,
  ): Promise<AttachedRoomCourseware> {
    return this.http.request(
      'POST',
      `/v1/rooms/${encodePath(roomId)}/coursewares`,
      input,
    );
  }
}

class WhiteboardAuthApi {
  constructor(private readonly signer: LocalTokenSigner) {}

  async issueRoomToken(input: IssueRoomTokenInput): Promise<RoomToken> {
    const roomId = requireText(input.roomId, 'roomId', 'whiteboard');
    const userId = requireText(input.userId, 'userId', 'whiteboard');
    if (!['host', 'participant', 'observer'].includes(input.role)) {
      throw sdkTokenError('role must be host, participant, or observer', 'whiteboard');
    }
    const expiresIn = input.expiresIn ?? 3600;
    const signed = signHs256(
      this.signer,
      {
        app_id: this.signer.appId,
        room_id: roomId,
        role: input.role,
        source: 'server_sdk',
      },
      {
        issuer: ROOM_TOKEN_ISSUER,
        audience: ROOM_TOKEN_AUDIENCE,
        subject: userId,
        expiresIn,
      },
    );
    return {
      token: signed.token,
      appId: this.signer.appId,
      roomId,
      userId,
      role: input.role,
      expiresIn,
      expiresAt: new Date(signed.expiresAt * 1000).toISOString(),
    };
  }
}

class WhiteboardRecordingsApi {
  constructor(private readonly http: HttpTransport) {}

  start(
    roomId: string,
    input: StartRecordingInput = {},
  ): Promise<RecordingSession> {
    return this.http.request(
      'POST',
      `/v1/rooms/${encodePath(roomId)}/recording/start`,
      input,
    );
  }

  stop(roomId: string, input: StopRecordingInput): Promise<RecordingSession> {
    return this.http.request(
      'POST',
      `/v1/rooms/${encodePath(roomId)}/recording/stop`,
      input,
    );
  }

  list(roomId: string): Promise<RecordingSession[]> {
    return this.http.request(
      'GET',
      `/v1/rooms/${encodePath(roomId)}/recordings`,
    );
  }

  get(recordingId: string): Promise<RecordingSession> {
    return this.http.request(
      'GET',
      `/v1/recordings/${encodePath(recordingId)}`,
    );
  }

  registerMediaAsset(
    recordingId: string,
    input: RegisterMediaAssetInput,
  ): Promise<MediaAsset> {
    return this.http.request(
      'POST',
      `/v1/recordings/${encodePath(recordingId)}/media-assets`,
      input,
    );
  }

  deleteMediaAsset(recordingId: string, assetId: string): Promise<MediaAsset> {
    return this.http.request(
      'DELETE',
      `/v1/recordings/${encodePath(recordingId)}/media-assets/${encodePath(assetId)}`,
    );
  }

  enqueueVideoExport(
    recordingId: string,
    input: EnqueueVideoExportInput = {},
  ): Promise<VideoExportJob> {
    return this.http.request(
      'POST',
      `/v1/recordings/${encodePath(recordingId)}/video-exports`,
      input,
    );
  }

  getVideoExport(
    recordingId: string,
    jobId: string,
  ): Promise<VideoExportJob> {
    return this.http.request(
      'GET',
      `/v1/recordings/${encodePath(recordingId)}/video-exports/${encodePath(jobId)}`,
    );
  }
}

class WhiteboardCapturesApi {
  constructor(private readonly http: HttpTransport) {}

  create(roomId: string, input: CreateCaptureInput): Promise<Capture> {
    return this.http.request(
      'POST',
      `/v1/rooms/${encodePath(roomId)}/captures`,
      { roomId, ...input },
    );
  }

  list(roomId: string): Promise<Capture[]> {
    return this.http.request(
      'GET',
      `/v1/rooms/${encodePath(roomId)}/captures`,
    );
  }
}

class WhiteboardFilesApi {
  constructor(private readonly http: HttpTransport) {}

  convert(input: CreateConvertJobInput): Promise<ConvertJob> {
    return this.http.request('POST', '/v1/files/convert', input);
  }

  getConvertJob(jobId: string): Promise<ConvertJob> {
    return this.http.request(
      'GET',
      `/v1/files/convert/${encodePath(jobId)}`,
    );
  }
}
