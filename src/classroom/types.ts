export type ClassroomMemberRole =
  | 'teacher'
  | 'assistant'
  | 'student'
  | 'inspector';

export type ClassroomPermission =
  | 'camera'
  | 'microphone'
  | 'whiteboard'
  | 'screen_share'
  | 'chat';

export type PermissionEffect = 'grant' | 'revoke';

export type RegisterEduUserInput = {
  originId?: string;
  nickname: string;
  avatar: string;
};

export type EduUser = {
  eduUserId: string;
  appId: string;
  originId?: string;
  nickname: string;
  avatar: string;
  status: string;
};

export type IssueTokenInput = {
  /** POST /v1/users 返回的平台 C 端用户 ID。 */
  eduUserId: string;
  originId?: string;
  role?: ClassroomMemberRole;
  expiresIn?: number;
};

export type EduUserToken = {
  accessToken: string;
  expiresIn: number;
  tokenType: string;
  appId: string;
  eduUserId: string;
  originId: string;
  role: string;
  expiresAt: string;
};

export type CreateClassroomInput = {
  name: string;
  startsAt: string;
  /** 课时时长（分钟，5–480）。计划结束时间由服务端派生，创建时不传 endsAt */
  durationMinutes: number;
  teacherEduUserId: string;
  resolution?: '360p' | '480p' | '720p' | '1080p';
  /** 同时上台人数（1–16），默认 6。计入 maxAudience */
  maxOnStage?: number;
  /**
   * 同时在室人数（含台上）。
   * 未传时实时课等于 maxOnStage，直播课等于 maxOnStage + 1。
   * 正数须不小于上台人数；直播课至少多 1。最大 100000。显式 0 会被拒绝。
   */
  maxAudience?: number;
  /**
   * 学生和助教进课是否默认上台。
   * 未传时仅当 maxAudience 等于 maxOnStage 为 true，否则 false。显式 false 始终允许。
   */
  defaultOnStage?: boolean;
  videoOnly?: boolean;
  recordMode?: 'none' | 'classroom' | 'mix' | 'page';
  allowTeacherControlDevice?: boolean;
  avSubscribeMode?: 'teacher_only' | 'self_only' | 'on_stage_all';
  uiConfig?: Record<string, unknown>;
  overtimeMinutes?: number;
  classroomType?: 'live' | 'realtime';
  /** @deprecated Use liveSourceKind and pullStreamUrl. */
  pushStreamUrl?: string;
  liveSourceKind?: 'device' | 'file' | 'push' | 'pull';
  liveVideoId?: string;
  pullStreamUrl?: string;
  autoStartOnSchedule?: boolean;
  recordBackgroundUrl?: string;
  joinPolicy?: 'invite_only' | 'open_app';
  studentEduUserIds?: string[];
  coursewareIds?: string[];
};

export type ClassroomTeacher = {
  eduUserId: string;
  nickname: string;
  avatar: string;
  status: string;
};

export type Classroom = {
  classroomId: string;
  appId: string;
  name: string;
  status: string;
  createdBy?: string;
  /** 同时上台人数（1–16） */
  maxOnStage?: number;
  /** 同时在室人数（含台上） */
  maxAudience?: number;
  /** 学生和助教进课是否默认上台 */
  defaultOnStage?: boolean;
  startsAt: string;
  /** 计划结束时间（startsAt + durationMinutes） */
  endsAt: string;
  /** 课时时长（分钟） */
  durationMinutes?: number;
  actualStartedAt?: string;
  endedAt?: string;
  effectiveEndsAt?: string;
  resolution?: string;
  teacherEduUserId?: string;
  teacher?: ClassroomTeacher | null;
  recordMode?: string;
  allowTeacherControlDevice?: boolean;
  avSubscribeMode?: string;
  overtimeMinutes?: number;
  classroomType?: string;
  /** @deprecated Use liveSourceKind and pullStreamUrl. */
  pushStreamUrl?: string;
  liveSourceKind?: 'device' | 'file' | 'push' | 'pull';
  liveVideoId?: string;
  pullStreamUrl?: string;
  autoStartOnSchedule?: boolean;
  recordBackgroundUrl?: string;
  joinPolicy?: string;
  videoOnly?: boolean;
  schedulePhase?: string;
  startOverdue?: boolean;
  uiConfig?: Record<string, unknown>;
};

export type AddMemberInput = {
  eduUserId: string;
  role?: ClassroomMemberRole;
};

export type Membership = {
  success?: boolean;
  classroomId: string;
  eduUserId: string;
  role: string;
  stageStatus?: string;
};

export type MembershipItem = {
  eduUserId: string;
  role: string;
  joinedAt?: string;
  stageStatus?: string;
};

export type MemberList = {
  members: MembershipItem[];
};

export type ReplaceStudentsInput = {
  eduUserIds: string[];
};

export type ReplaceStudentsResult = {
  classroomId: string;
  studentCount: number;
  eduUserIds: string[];
};

export type PermissionEntry = {
  permission: string;
  allowed: boolean;
  source?: string;
  status?: string;
  detail?: string;
};

export type Permissions = {
  classroomId: string;
  eduUserId: string;
  role: string;
  permissions: PermissionEntry[];
};

export type SetPermissionInput = {
  permission: ClassroomPermission;
  effect: PermissionEffect;
  operatorEduUserId: string;
};

export type ClearPermissionInput = {
  operatorEduUserId: string;
};

export type Courseware = {
  coursewareId: string;
  ownerEduUserId?: string;
  appId?: string;
  name?: string;
  originalName?: string;
  format?: string;
  sizeBytes?: number;
  status?: string;
  progress?: number;
  jobId?: string;
  objectKey?: string;
  sourceUrl?: string;
  resultManifestUrl?: string;
  coursewareBaseUrl?: string;
  wbCoursewareId?: string;
  errorCode?: string;
  errorMessage?: string;
  contentHash?: string;
  createdAt?: string;
  updatedAt?: string;
};

export type CoursewareList = {
  items: Courseware[];
};

export type BindCoursewaresInput = {
  coursewareIds: string[];
};

export type BindCoursewaresResult = {
  boundCount?: number;
  skippedCount?: number;
  boundCoursewareIds?: string[];
  skippedCoursewareIds?: string[];
};

export type UnbindCoursewaresResult = {
  unboundCount?: number;
};

export type AppUiConfig = {
  appId: string;
  uiConfig: Record<string, unknown>;
};

export type SetAppUiConfigInput = {
  uiConfig: Record<string, unknown>;
};
