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
  endsAt: string;
  teacherEduUserId: string;
  resolution?: '360p' | '480p' | '720p' | '1080p';
  maxOnStage?: number;
  defaultOnStage?: boolean;
  videoOnly?: boolean;
  recordMode?: 'none' | 'classroom' | 'mix';
  allowTeacherControlDevice?: boolean;
  avSubscribeMode?: 'teacher_only' | 'self_only' | 'on_stage_all';
  uiConfig?: Record<string, unknown>;
  overtimeMinutes?: number;
  classroomType?: 'live' | 'realtime';
  pushStreamUrl?: string;
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
  maxOnStage?: number;
  defaultOnStage?: boolean;
  startsAt: string;
  endsAt: string;
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
  pushStreamUrl?: string;
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
