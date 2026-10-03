export type RoomRole = 'host' | 'participant' | 'observer';

export type PrivateWorkspaceInitialization = {
  appId: string;
  roomId: string;
  assignmentId: string;
  sourceSnapshotId: string | null;
  status: 'pending' | 'running' | 'ready' | 'failed';
  attemptCount: number;
  checkpointId: string | null;
  completedAt: string | null;
  lastError: 'initialization_failed' | 'lease_attempts_exhausted' | null;
};

export type IssueRoomTokenInput = {
  roomId: string;
  userId: string;
  role: RoomRole;
  expiresIn?: number;
};

export type RoomToken = {
  token: string;
  roomId: string;
  userId: string;
  role: string;
  expiresIn: number;
  expiresAt: string;
  appId: string;
};

export type StartRecordingInput = {
  externalRef?: string;
};

export type StopRecordingInput = {
  recordingId: string;
};

export type MediaAsset = {
  assetId: string;
  recordingId: string;
  kind: string;
  url: string;
  contentType?: string;
  durationMs?: number;
  metadata?: Record<string, unknown>;
  metadataJson?: string;
  createdAt: string;
};

export type RecordingSession = {
  recordingId: string;
  appId: string;
  roomId: string;
  status: string;
  externalRef?: string;
  wallStart?: string;
  wallEnd?: string;
  startServerSeq?: number | string;
  endServerSeq?: number | string;
  checkpointSeqAtStart?: number | string;
  bundleObjectKey?: string;
  bundleChecksumSha256?: string;
  bundleSizeBytes?: number | string;
  bundleReadyAt?: string;
  startedAt?: string;
  stoppedAt?: string;
  mediaAssets?: MediaAsset[];
};

export type RegisterMediaAssetInput = {
  kind: string;
  url: string;
  contentType?: string;
  durationMs?: number;
  metadata?: Record<string, unknown>;
};

export type EnqueueVideoExportInput = {
  profile?: 'standard' | 'hd';
  sampleMode?: 'change' | 'fixed';
  fps?: number;
  width?: number;
  height?: number;
};

export type VideoExportJob = {
  jobId: string;
  recordingId: string;
  appId: string;
  roomId: string;
  status: string;
  fromSeq?: number | string;
  toSeq?: number | string;
  wallStart?: string;
  wallEnd?: string;
  profile?: string;
  sampleMode?: string;
  fps?: number;
  width?: number;
  height?: number;
  assetId?: string;
  publicUrl?: string;
  objectKey?: string;
  lastError?: string;
  createdAt?: string;
  finishedAt?: string;
};

export type CreateCaptureInput = {
  pageId: string;
  url?: string;
};

export type Capture = {
  captureId: string;
  appId: string;
  roomId: string;
  pageId: string;
  url: string;
  createdAt: string;
};

export type CreateConvertJobInput = {
  sourceUrl?: string;
  fileName?: string;
  objectKey?: string;
  clientReference?: string;
};

export type ConvertJob = {
  jobId: string;
  appId: string;
  sourceUrl?: string;
  fileName?: string;
  status: string;
  progress: number;
  stage?: string;
  errorCode?: string;
  errorMessage?: string;
  resultManifestUrl?: string;
  coursewareBaseUrl?: string;
  resultManifestObjectKey?: string;
  coursewareObjectPrefix?: string;
  coursewareId?: string;
  coursewareVersion?: string;
  clientReference?: string;
  createdAt: string;
  updatedAt: string;
};

export type AttachRoomCoursewareInput = {
  coursewareId: string;
  convertJobId: string;
  requestId: string;
};

export type AttachedRoomCourseware = {
  coursewareId: string;
  whiteboardFileId: string;
  opId: string;
  serverSeq: number;
  serverReceivedAt: number;
  pageCount: number;
  duplicated: boolean;
};

export type PrivateRoomGrant = {generation: string; role: RoomRole; revoked: boolean};
export type ChangePrivateRoomGrantInput = {
  userId: string; requestId: string; expectedGeneration: string;
} & ({action: 'grant'; role: RoomRole} | {action: 'revoke'; role?: never});
export type PrivateRoomAccess = {privateRoom: true; grant: PrivateRoomGrant | null};
export type FrozenRoomBoundary = {frozenSeq: string; closedAt: string};
export type FrozenRoomSnapshot = {
  appId: string; roomId: string; snapshotId: string; assignmentId: string;
  frozenSeq: string; frozenAt: string; status: 'pending' | 'running' | 'ready' | 'failed';
  attemptCount: number; objectKey: string; checksum: string; sizeBytes: string;
  completedAt: string; lastError: string;
};
export type FrozenRoomSnapshotDownload = FrozenRoomSnapshot & {workspaceUrl: string; urlExpiresIn: number};

export interface PrivateRoomWriteWindow {roomId:string;requestId:string;opensAt:string;closesAt:string}
