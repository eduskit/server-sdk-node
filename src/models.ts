// Public console API data models. JSON field names match the HTTP API.


export type EnvironmentFilter = 'all' | AppEnvironment
export type StatusFilter = 'all' | AppStatus

export interface AppRecord {
  appId: string
  name: string
  environment: AppEnvironment
  appKey: string
  appSecret?: string
  config: Record<string, unknown>
  status: AppStatus
  /** 业务侧回调 URL；未配置时为空 */
  webhookUrl?: string
  /** 已订阅的 Webhook 事件 type；未配置回调时为空数组 */
  subscribedEvents?: string[]
  createdAt: string
  updatedAt: string
}

export interface CreateAppPayload {
  name: string
  environment?: AppEnvironment
  config?: Record<string, unknown>
}

export interface ApplicationListItem extends AppRecord {
  icon: string
  iconBg: string
  iconColor: string
}



export type EduUserStatusFilter = 'all' | EduUserStatus

export interface EduUserRecord {
  eduUserId: string
  appId: string
  originId: string
  nickname: string
  avatar: string
  status: EduUserStatus
  /** api：客户接口建档；platform_app：官方应用上课码建档 */
  signupSource?: string
  createdAt?: string
  updatedAt?: string
}

export interface CreateEduUserPayload {
  originId?: string
  nickname: string
  avatar: string
}

export interface ListEduUsersQuery {
  status?: EduUserStatus
  q?: string
  page?: number
  pageSize?: number
}

export interface ListEduUsersResult {
  items: EduUserRecord[]
  total: number
  page: number
  pageSize: number
}

export interface SearchEduUsersQuery {
  q?: string
  status?: EduUserStatus
  limit?: number
  requireOriginId?: boolean
}

export interface SearchEduUsersResult {
  items: EduUserRecord[]
}

export type AuthUser = {
  userId: string
  nickname: string
  avatar: string
  identities: string[]
  phone?: string
}

export type AuthSession = {
  accessToken: string
  refreshToken: string
  expiresIn: number
  user: AuthUser
}

export type GoogleAuthorizeResult = {
  authorizeUrl: string
  state: string
}

export type AuthProvider = 'phone' | 'wechat' | 'email' | 'google'

export type AuthMethods = {
  site: 'cn' | 'intl'
  providers: AuthProvider[]
  captcha: {
    enabled: boolean
    appId: string
  }
}

export type GoogleCallbackPayload = {
  code: string
  state: string
  redirectUri: string
}


export type CoursewareRecord = {
  coursewareId: string
  /** 列表按课堂筛选时可能有值；应用库上传默认无绑定 */
  classroomId?: string
  ownerEduUserId?: string
  appId: string
  name: string
  originalName: string
  format: CoursewareFormat | string
  sizeBytes: number
  status: CoursewareStatus | string
  progress: number
  jobId: string
  objectKey: string
  sourceUrl: string
  resultManifestUrl: string
  coursewareBaseUrl: string
  wbCoursewareId: string
  errorCode: string
  errorMessage: string
  contentHash?: string
  createdAt: string
  updatedAt: string
}

export type CoursewareStatusFilter = 'all' | CoursewareStatus

export type CreateUploadUrlPayload = {
  fileName: string
  contentHash: string
  contentType?: string
  expiresSeconds?: number
  ownerEduUserId?: string
}

export type UploadUrlResult = {
  uploadUrl: string
  objectKey: string
  sourceUrl: string
  contentType: string
  expiresAt: string
}

export type CreateCoursewarePayload = {
  fileName: string
  originalName: string
  format: string
  sizeBytes: number
  objectKey: string
  sourceUrl: string
  contentHash: string
  ownerEduUserId?: string
}

export type ListCoursewaresResult = {
  items: CoursewareRecord[]
  total: number
  page: number
  pageSize: number
}

/** 课堂课件被显式添加到白板后的绑定记录 */
export type ClassroomWhiteboardCoursewareRecord = {
  appId: string
  classroomId: string
  coursewareId: string
  requestId: string
  whiteboardFileId: string
  loadOpId: string
  serverSeq: number | string
  pageCount: number
  boundAt: string
  duplicated?: boolean
}

/** 转码产物 manifest.json（schema 1.0）中的页面摘要 */
export type CoursewareManifestSlide = {
  slideIndex: number
  slideId?: string
  stepCount?: number
  thumbnail?: string
  hasAudio?: boolean
  hasVideo?: boolean
  steps?: Array<{
    stepIndex: number
    stepId?: string
    svg?: {
      src?: string
      width?: number
      height?: number
    }
  }>
}

export type CoursewareManifest = {
  schemaVersion?: string
  coursewareId?: string
  version?: string
  document?: {
    slideCount?: number
    totalStepCount?: number
    aspectRatio?: string
  }
  slides?: CoursewareManifestSlide[]
}



export type ClassroomStatusFilter = 'all' | ClassroomStatus

export interface ClassroomTeacher {
  eduUserId: string
  nickname: string
  avatar: string
  status: string
}

export interface ClassroomRecord {
  classroomId: string
  appId: string
  name: string
  status: ClassroomStatus
  classroomType: ClassroomType | string
  resolution: ClassroomResolution | string
  maxOnStage: number
  maxAudience?: number
  liveSourceKind?: string
  liveVideoId?: string
  pullStreamUrl?: string
  teacherEduUserId: string
  teacher?: ClassroomTeacher | null
  startsAt: string
  /** 计划结束时间（startsAt + durationMinutes） */
  endsAt: string
  /** 课时时长（分钟） */
  durationMinutes?: number
  createdAt?: string
  recordMode?: ClassroomRecordMode | string
  defaultOnStage?: boolean
  allowTeacherControlDevice?: boolean
  avSubscribeMode?: ClassroomAvSubscribeMode | string
  overtimeMinutes?: number
  autoStartOnSchedule?: boolean
  recordBackgroundUrl?: string
  /** 进课策略：invite_only / open_app */
  joinPolicy?: ClassroomJoinPolicy | string
  /** 纯视频课（无白板） */
  videoOnly?: boolean
  createdBy?: string
  uiConfig?: Record<string, unknown>
}

export interface CreateClassroomPayload {
  name: string
  teacherEduUserId: string
  startsAt: string
  /** 课时时长（分钟）；计划结束时间由服务端派生 */
  durationMinutes: number
  resolution?: ClassroomResolution
  maxOnStage?: number
  maxAudience?: number
  classroomType?: ClassroomType
  liveSourceKind?: string
  liveVideoId?: string
  pullStreamUrl?: string
  recordMode?: ClassroomRecordMode
  avSubscribeMode?: ClassroomAvSubscribeMode
  defaultOnStage?: boolean
  allowTeacherControlDevice?: boolean
  overtimeMinutes?: number
  autoStartOnSchedule?: boolean
  recordBackgroundUrl?: string
  joinPolicy?: ClassroomJoinPolicy
  /** 纯视频课（无白板）；默认 false */
  videoOnly?: boolean
  /** 可选：创建时绑定应用课件库中的课件（可多选） */
  coursewareIds?: string[]
  studentEduUserIds?: string[]
  uiConfig?: Record<string, unknown>
}

/** 开课前修改（不含开始时间、课时时长、课件绑定） */
export type UpdateClassroomPayload = Omit<
  CreateClassroomPayload,
  'startsAt' | 'durationMinutes' | 'coursewareIds' | 'studentEduUserIds'
>

export interface ListClassroomsQuery {
  status?: ClassroomStatus
  q?: string
  /** Scheduled start time lower bound (inclusive), ISO 8601. */
  startsAtFrom?: string
  /** Scheduled start time upper bound (exclusive), ISO 8601. */
  startsAtTo?: string
  actualStartedAtFrom?: string
  actualStartedAtTo?: string
  page?: number
  pageSize?: number
}

export interface ListClassroomsResult {
  items: ClassroomRecord[]
  total: number
  page: number
  pageSize: number
}

export interface ClassroomMemberRecord {
  eduUserId: string
  role: string
  joinedAt?: string
  stageStatus?: string
}

export interface ListClassroomMembersResult {
  members: ClassroomMemberRecord[]
}

export interface SetClassroomStudentsResult {
  classroomId: string
  studentCount: number
  eduUserIds: string[]
}

export interface ClassroomEnteredUserRecord {
  eduUserId: string
  nickname: string
  avatar: string
  signupSource?: string
  role: string
  lastEnteredAt: string
  imOnline: boolean
  stageStatus: string
  sessionCount: number
  lastJoinResult: string
  /** 最近一次进房尝试的权威关联键，用于从用户列表精确下钻。 */
  sessionId: string
  attemptId: string
  attemptNo: number
  failedStage: string
  errorCode: number
  deviceId: string
  platform: string
  sdkVersion: string
  networkType: string
}

export interface ListClassroomEnteredUsersQuery {
  page?: number
  pageSize?: number
}

export interface ListClassroomEnteredUsersResult {
  users: ClassroomEnteredUserRecord[]
  total: number
  page: number
  pageSize: number
}

export interface ClassroomEnteredTraceSession {
  sessionId: string
  attemptId: string
  attemptNo: number
  startedAt: string
  lastEventAt: string
  joinStatus: string
  apiOk: boolean
  uiReady: boolean
  controlReady: boolean
  fullReady: boolean
  expectedDomains: string[]
  readyDomains: string[]
  missingDomains: string[]
  joined: boolean
  failed: boolean
  leftRoom: boolean
  whiteboardDegraded: boolean
  rtcFailed: boolean
  failedStage: string
  failureDomain: string
  errorCode: number
  errorCount: number
  eventCount: number
  duplicateEventCount: number
  telemetryDroppedCount: number
  correctedTimestampCount: number
  result: string
  traceId: string
  deviceId: string
  platform: string
  sdkVersion: string
  appVersion: string
  osVersion: string
  deviceModel: string
  networkType: string
  provider: string
  providers: string[]
  latestIngestLagMs: number
  maxIngestLagMs: number
  durations: {
    joinHttpMs: number
    joinSucceededMs: number
    imLoginMs: number
    imGroupMs: number
    sessionReadyMs: number
    roomJoinedMs: number
    rtcEnteredMs: number
    rtcFirstFrameMs: number
    whiteboardReadyMs: number
  }
}

export interface ClassroomEnteredTraceEvent {
  occurredAt: string
  ingestedAt: string
  ingestLagMs: number
  duplicateCount: number
  eventId: string
  sessionId: string
  traceId: string
  signalId: string
  operationId: string
  deviceId: string
  attemptNo: number
  attemptId: string
  connectionId: string
  connectionEpoch: number
  sequence: number
  source: string
  service: string
  eventName: string
  level: string
  stage: string
  result: string
  elapsedMs: number
  durationMs: number
  errorCode: number
  errorMessage: string
  platform: string
  sdkVersion: string
  appVersion: string
  osVersion: string
  deviceModel: string
  networkType: string
  provider: string
  vendorCode: string
  attrs: Record<string, string>
}

export interface ClassroomEnteredUserTrace {
  user: {
    eduUserId: string
    nickname: string
    avatar: string
    role: string
    lastEnteredAt: string
    imOnline: boolean
  }
  sessions: ClassroomEnteredTraceSession[]
  events: ClassroomEnteredTraceEvent[]
  selectedSessionId: string | null
  selectedAttemptId: string | null
  selectedAttemptNo: number | null
  contextSnapshot?: Record<string, string> | null
  eventPage: CursorPage
  sessionsPage: CursorPage
}

export interface CursorPage {
  hasMore: boolean
  nextCursor: string | null
}

export interface ClassroomJoinAttemptRecord
  extends ClassroomEnteredTraceSession {
  eduUserId: string
  nickname: string
  avatar: string
  signupSource?: string
  role: string
  imOnline: boolean
  stageStatus: string
}

export interface ListClassroomJoinAttemptsQuery {
  result?: string
  joinStatus?: string
  failureDomain?: string
  platform?: string
  sdkVersion?: string
  appVersion?: string
  networkType?: string
  provider?: string
  eduUserId?: string
  startedAtFrom?: string
  startedAtTo?: string
  cursor?: string
  pageSize?: number
}

export interface ListClassroomJoinAttemptsResult {
  attempts: ClassroomJoinAttemptRecord[]
  hasMore: boolean
  nextCursor: string | null
  pageSize: number
}

export interface ClassroomEnteredTraceQuery {
  attemptId: string
  cursor?: string
  pageSize?: number
  sessionsCursor?: string
  sessionsPageSize?: number
}

export interface WalletBucket {bucketId:string;sourceType:string;totalPoints:string;availablePoints:string;reservedPoints:string;consumedPoints:string;effectiveAt:string;expiresAt?:string;priority:number}
export type ProtoInt64 = string | number | { low: number; high: number; unsigned?: boolean }
export interface WalletSummary {walletId:string;accountState:string;availablePoints:string;reservedPoints:string;consumedPoints:string;overdraftPoints:string;version?:ProtoInt64;buckets?:WalletBucket[]}
export interface BillingDetail {subjectId?:string;subjectName?:string;subjectRole?:string;subjectOriginId?:string;subjectAvatar?:string;targetId?:string;targetName?:string;targetOriginId?:string;targetAvatar?:string;resourceId?:string;resourceName?:string;resourceType?:string;durationSeconds?:number|null}
export interface BillingDisplay extends BillingDetail {description?:string;quantity?:string;unit?:string;points?:string}
export interface LedgerEntry {ledgerId:string;entryType:string;points:string;availableDelta:string;reservedDelta:string;consumedDelta:string;reservationId?:string;metadataJson:string;createdAt:string;usageEventId?:string;description?:string;detail?:BillingDetail;display?:BillingDisplay}
export interface UsageRecord {usageEventId:string;appId?:string;reservationId?:string;sourceService:string;meter:string;rawQuantity:string;rawUnit:string;dimensionsJson:string;detailJson?:string;detail?:BillingDetail;display?:BillingDisplay;ratedPoints?:string;description?:string;status:string;occurredAt:string;ruleId?:string;priceVersion?:string;rejectionReason?:string}
export interface ReservationRecord {reservationId:string;appId:string;roomId:string;status:string;estimatedPoints:string;reservedPoints:string;consumedPoints:string;expectedEndAt?:string;expiresAt:string;createdAt:string;settledAt?:string}
export interface Paged<T> {
  items?: T[]
  total: string
  page: number
  pageSize: number
}

export interface CatalogList<T> {
  items?: T[]
}

export interface PlanCatalogItem {
  planKey: string
  name: string
  version: number
  status: string
  grantPoints: string
  featuresJson: string
}

export interface ResourcePackageItem {
  packageKey: string
  name: string
  points: string
  validityMonths: number
}

export interface EntitlementSnapshot {
  tenantId?: string
  appId?: string
  version?: ProtoInt64
  accountState?: string
  expiresAt?: string
  featuresJson?: string
}

export interface AutoRechargeRule {
  tenantId?: string
  packageKey?: string
  thresholdPoints?: string
  monthlyLimit?: number
  enabled?: boolean
  usedThisMonth?: number
}

export interface PurchasePackagePayload {
  packageKey: string
  idempotencyKey: string
}

export interface PurchasePlanPayload {
  planKey: string
  period?: string
  idempotencyKey: string
}

export interface UpsertAutoRechargePayload {
  packageKey: string
  thresholdPoints: string
  monthlyLimit: number
  enabled: boolean
}

export interface ClassroomEstimatePayload {
  onStageCount: number
  audienceCount?: number
  durationMinutes: number
  resolutionTier?: string
  recordMode?: string
  aiSubtitle?: boolean
  aiSummary?: boolean
  transcodeMinutes?: number
  storageGbMonth?: number
  cdnGb?: number
}

export interface EstimateRatedLine {
  meter: string
  rawQuantity: string
  rawUnit: string
  points: string
  ruleId?: string
  priceVersion?: string
  dimensions?: Record<string, string>
}

export interface ClassroomEstimateResult {
  points: string
  lines?: EstimateRatedLine[]
}

export const DASHBOARD_PARTS = [
  'overview',
  'trends',
  'classrooms',
  'quality',
  'usage',
  'issues',
] as const
export type DashboardPart = (typeof DASHBOARD_PARTS)[number]
export type DashboardPreset = 'today' | 'yesterday' | '7d' | '30d' | 'custom'
export interface DashboardQuery {
  appId?: string
  environment?: string
  preset: DashboardPreset
  timezone: string
  fromDate?: string
  toDate?: string
}
export interface DashboardWindow {
  from: string
  to: string
  previousFrom: string
  previousTo: string
  asOf: string
  timezone: string
  granularity: 'hour' | 'day'
  availableFrom: string
  previousAvailable: boolean
  currentAvailable: boolean
  version: number
}
export interface DashboardApp {
  appId: string
  name: string
  environment: string
  status: string
}
export interface Section<T> {
  status: 'ok' | 'unavailable'
  data: T | null
  updatedAt: string | null
}
export interface Participation {
  opened: number
  ended: number
  scheduled: number
  expired: number
  users: number
  students: number
  teachers: number
  attendances: number
  seconds: number
}
export interface Overview {
  current: Participation
  previous: Participation
  liveCount: number
  online: number
}
export interface ClassroomTrend {
  at: string
  opened?: number
  users?: number
  seconds?: number
}
export interface ClassroomApp {
  appId: string
  opened?: number
  users?: number
  seconds?: number
}
export interface DashboardClassroom {
  appId: string
  classroomId: string
  name: string
  teacherId: string
  teacherName?: string
  startsAt: string
  endsAt: string
  status: string
  online: number
}
export interface QualitySummary {
  attempts: number
  joined: number
  succeeded: number
  degraded: number
  failed: number
  abandoned: number
  pending: number
  latencySamples: number
  p50Ms: number | null
  p95Ms: number | null
  successRate: number | null
  rtcExpected: number
  rtcReady: number
  whiteboardExpected: number
  whiteboardReady: number
  dropped: number
  lastIngestAt: string | null
}
export interface QualityAttempt {
  appId: string
  classroomId: string
  eduUserId: string
  sessionId: string
  attemptId: string
  startedAt: string
  status: string
  stage: string
}
export interface Quality {
  current: QualitySummary
  previous: QualitySummary
  breakdown: {
    platform: string
    sdkVersion: string
    attempts: number
    failed: number
  }[]
  failures: { stage: string; count: number }[]
  recent: QualityAttempt[]
}
export interface UsageGroup {
  key: string
  points: string
  count?: number
}
export interface Usage {
  points: string
  previousPoints: string
  pending?: number
  late?: number
  rejected?: number
  trend: { at: string; points: string }[]
  meters: UsageGroup[]
  applications: UsageGroup[]
}
export interface CoursewareIssues {
  failed?: number
  processing?: number
  items: {
    appId: string
    coursewareId: string
    name: string
    updatedAt: string
  }[]
}
export interface DashboardData {
  overview: Section<Overview>
  trends: Section<{ trend: ClassroomTrend[]; applications: ClassroomApp[] }>
  classrooms: Section<{
    live: DashboardClassroom[]
    upcoming: DashboardClassroom[]
    expired: DashboardClassroom[]
  }>
  quality: Section<Quality>
  usage: {
    usage: Section<Usage>
    wallet: Section<WalletSummary>
    entitlement: Section<EntitlementSnapshot>
  }
  issues: Section<CoursewareIssues>
}
export interface DashboardResponse<K extends DashboardPart> {
  window: DashboardWindow
  apps: DashboardApp[]
  data: DashboardData[K]
}
export interface DashboardPartState<K extends DashboardPart> {
  response: DashboardResponse<K> | null
  loading: boolean
  error: boolean
}

export const activityCategories = ['join', 'stage', 'media', 'permission', 'message', 'whiteboard', 'tool', 'connection', 'lifecycle', 'other'] as const
export const activityRelations = ['initiated', 'affected', 'observed', 'system', 'server'] as const
export const activityTracks = ['class_phase', 'presence', 'im', 'stage', 'microphone', 'camera', 'rtc', 'live', 'whiteboard', 'network', 'foreground'] as const
export interface ActivityScope { appId: string; classroomId: string; eduUserId: string }
export interface ActivityWindow { from: string; to: string; asOf: string }
export interface ActivityFilters {
  from?: string; to?: string; deviceId?: string; attemptId?: string
  category?: typeof activityCategories[number]; relation?: typeof activityRelations[number]
}
export interface ActivityNode {
  id: string; occurredAt: string; lastEventAt: string; action: string; eventName: string
  category: string; relation: string; origin: string; requestedState: string
  status: 'applied' | 'acknowledged' | 'failed' | 'rejected' | 'cancelled' | 'pending' | 'observed'
  actorUserIds: string[]; targetUserIds: string[]; sessionIds: string[]; attemptIds: string[]; deviceIds: string[]
  eventCount: number; errorCount: number; duplicateCount: number; correctedTimestampCount: number
  errorMessage: string; errorCode: number
  identifiersTruncated: boolean
  facet?: string
  severity?: 'critical' | 'warning' | 'info'
  highlights?: Record<string, string>
  evidence: { requested: boolean; accepted: boolean; httpCompleted: boolean; signalSent: boolean; providerAcknowledged: boolean; received: boolean; applied: boolean } | null
}
export interface ActivityTrackInterval { track: string; from: string; to: string; state: string; reason: string }
export interface ActivityTracks { tracks: ActivityTrackInterval[]; window: ActivityWindow; retentionDays: number }
export interface ActivityOverview {
  presenceMs: number; onStageMs: number; microphoneOnMs: number; cameraOnMs: number
  offlineMs: number; disconnectCount: number; joinCount: number; lastLeaveReason: string
  criticalCount?: number; warningCount?: number
  window: ActivityWindow; retentionDays: number
}
export interface ActivityEvent {
  eventId: string; occurredAt: string; ingestedAt: string; eventName: string; source: string; service: string
  observerUserId: string; actorUserId: string; targetUserId: string; sessionId: string; attemptId: string
  operationId: string; signalId: string; traceId: string; deviceId: string; connectionId: string; connectionEpoch: number
  sequence: number; stage: string; result: string; level: string; durationMs: number; elapsedMs: number
  errorCode: number; errorMessage: string; platform: string; sdkVersion: string; networkType: string
  correctedTimestamp: boolean; clockOffsetMs: number; duplicateCount: number; attrs: Record<string, string>
}
export interface ActivityPage {
  items: ActivityNode[]; window: ActivityWindow; retentionDays: number; generatedAt: string
  hasMore: boolean; nextCursor: string | null
  coverage?: { clientEventCount: number; serverEventCount: number; lastClientAt: string | null; lastServerAt: string | null; dropReportCount: number; reportedDroppedCount: number } | null
}
export interface ActivityDetail {
  summary?: ActivityNode | null
  activityId: string; events: ActivityEvent[]; window: ActivityWindow; hasMore: boolean; nextCursor: string | null
}

export type AppEnvironment = 'development' | 'staging' | 'production';
export type AppStatus = 'active' | 'disabled';
export type EduUserStatus = 'active' | 'disabled';
export type ClassroomStatus = 'creating' | 'pending' | 'live' | 'ended' | 'expired';
export type ClassroomResolution = '360p' | '480p' | '720p' | '1080p';
export type ClassroomType = 'live' | 'realtime';
export type ClassroomRecordMode = 'none' | 'classroom' | 'mix' | 'page';
export type ClassroomAvSubscribeMode = 'teacher_only' | 'self_only' | 'on_stage_all';
export type ClassroomJoinPolicy = 'invite_only' | 'open_app';
export type CoursewareStatus = 'uploading' | 'queued' | 'processing' | 'ready' | 'failed';
export type CoursewareFormat = 'ppt' | 'pptx' | 'pdf' | 'doc' | 'docx' | 'xls' | 'xlsx' | 'txt' | 'png' | 'jpg' | 'jpeg' | 'webp' | 'gif' | 'bmp' | 'svg';
export type EmptyInput = Record<string, never>;
export type OperationResult = { [key: string]: unknown };
export interface SmsSendInput { phone: string; scene?: 'login' | 'bind'; captchaTicket?: string; captchaRandstr?: string }
export interface SmsVerifyInput extends SmsSendInput { code: string }
export interface EmailSendInput { email: string; scene?: 'login' | 'bind' }
export interface EmailVerifyInput extends EmailSendInput { code: string }
export interface OAuthAuthorizeInput { redirectUri: string; state?: string }
export interface GoogleTokenInput { idToken: string }
export interface WechatBindPhoneSendInput { bindTicket: string; phone: string; captchaTicket?: string; captchaRandstr?: string }
export interface WechatBindPhoneVerifyInput extends WechatBindPhoneSendInput { code: string }
export interface PhoneVerifyInput { phone: string; code: string; captchaTicket?: string; captchaRandstr?: string }
export type WechatCallbackResult = (AuthSession & { nextAction: 'session'; bindTicket?: string }) | { nextAction: 'bind_phone'; bindTicket: string };
export interface RefreshInput { refreshToken: string }
export interface CurrentUserResult { user: AuthUser }
export interface AppIdInput { appId: string }
export interface UpdateAppConfigInput extends AppIdInput { config: Record<string, unknown> }
export interface UpdateWebhookInput extends AppIdInput { webhookUrl: string; subscribedEvents?: string[]; rotateSecret?: boolean }
export interface UpdateWebhookResult extends AppRecord { webhookSecret?: string }
export interface UserStatusInput { eduUserId: string; status: EduUserStatus }
export interface UserTokenInput { eduUserId: string; expiresIn?: number }
export interface EduUserTokenResult { accessToken: string; expiresIn: number; expiresAt: string; tokenType: string; appId: string; eduUserId: string; originId?: string }
export interface ClassroomIdInput { classroomId: string }
export type UpdateClassroomInput = ClassroomIdInput & UpdateClassroomPayload & { uiConfig?: Record<string, unknown> };
export interface AddMemberInput extends ClassroomIdInput { eduUserId: string; role: 'teacher' | 'assistant' | 'student' | 'inspector' }
export interface MembershipResult { classroomId: string; eduUserId: string; role: string; joinedAt?: string }
export interface ReplaceStudentsInput extends ClassroomIdInput { eduUserIds: string[] }
export interface BindCoursewaresInput extends ClassroomIdInput { coursewareIds: string[] }
export interface BindCoursewaresResult { boundCount: number; skippedCount: number; boundCoursewareIds: string[]; skippedCoursewareIds: string[] }
export interface UnbindCoursewaresResult { unboundCount: number }
export interface ClassroomCoursewaresResult { items: CoursewareRecord[] }
export interface WhiteboardCoursewaresResult { items: ClassroomWhiteboardCoursewareRecord[] }
export interface AddWhiteboardCoursewareInput extends ClassroomIdInput { coursewareId: string; requestId: string }
export interface AttendanceInput extends ClassroomIdInput { eduUserId?: string }
export interface AttendanceMember { eduUserId: string; role: string; inRoomSeconds: ProtoInt64; onStageSeconds: ProtoInt64; firstStartedAt: string; lastEndedAt: string; open: boolean }
export interface AttendanceSegment { segmentId: string; eduUserId: string; role: string; kind: string; startedAt: string; endedAt: string; endReason: string; durationSeconds: ProtoInt64 }
export interface AttendanceResult { members: AttendanceMember[]; segments: AttendanceSegment[] }
export interface PurchasePlanResult { subscriptionId: string; tenantId: string; planKey: string; planVersionId: string; status: string; startsAt: string; endsAt: string; entitlementVersion: ProtoInt64 }
export type EnteredUsersInput = ClassroomIdInput & ListClassroomEnteredUsersQuery;
export type JoinAttemptsInput = ClassroomIdInput & ListClassroomJoinAttemptsQuery;
export type EnteredUserTraceInput = ClassroomIdInput & ClassroomEnteredTraceQuery & { eduUserId: string };
export interface SetLiveSourceInput extends ClassroomIdInput { kind: 'device' | 'file' | 'push' | 'pull'; liveVideoId?: string; pullStreamUrl?: string }
export interface LiveSourceRecord { classroomId: string; kind: string; liveVideoId: string; pullStreamUrl: string; streamName: string; ingestStatus: string; version: number }
export interface LivePushCredential { pushUrl: string; streamName: string; expiresAt: string }
export interface LivePlayAddress { webrtc: string; flv: string; hls: string; rtmp: string }
export interface LiveRelayStream { streamName: string; publisherUserId: string; streamType: string; play: LivePlayAddress; expiresAt: string }
export interface LivePlayCredentials { status: string; relayVersion: number; streams: LiveRelayStream[] }
export interface EntryCodeClaimRecord { eduUserId: string; nickname: string; claimedAt: string }
export interface EntryCodeRecord { entryCodeId: string; role: string; code: string; status: string; maxClaims: number; claimedCount: number; remark: string; claims: EntryCodeClaimRecord[] }
export interface EntryCodeList { codes: EntryCodeRecord[] }
export interface IssueEntryCodesInput extends ClassroomIdInput { role: 'teacher' | 'student'; maxClaims: number; count?: number; remark?: string }
export interface UpdateEntryCodeInput extends ClassroomIdInput { entryCodeId: string; maxClaims?: number; remark?: string; rotate?: boolean }
export interface RevokeEntryCodeInput extends ClassroomIdInput { entryCodeId: string }
export type ActivityQuery = ClassroomIdInput & ActivityFilters & { eduUserId: string; cursor?: string; pageSize?: number };
export type ActivityDetailInput = ClassroomIdInput & ActivityWindow & { eduUserId: string; activityId: string; cursor?: string; pageSize?: number };
export interface PaginationInput { page?: number; pageSize?: number }
export interface ListCoursewaresInput extends PaginationInput { classroomId?: string; ownerEduUserId?: string; status?: CoursewareStatus; q?: string }
export interface CoursewareIdInput { coursewareId: string }
export interface LiveVideoUploadInput { fileName: string; contentType?: string }
export interface LiveVideoUploadResult { uploadUrl: string; objectKey: string; expiresAt: string }
export interface CreateLiveVideoInput { title: string; objectKey: string; contentHash?: string; sizeBytes?: number }
export interface LiveVideoIdInput { liveVideoId: string }
export interface LiveVideoRecord { liveVideoId: string; appId: string; title: string; objectKey: string; playbackUrl: string; status: string; contentHash: string; sizeBytes: number; createdAt: string }
export interface ListLiveVideosResult { videos: LiveVideoRecord[]; total: number; page: number; pageSize: number }
export interface LedgerInput extends PaginationInput { type?: string; status?: string }
export interface UsageInput extends LedgerInput { scope?: 'dashboard'; appId?: string; environment?: AppEnvironment; from?: string; to?: string }
export interface ReservationsInput extends PaginationInput { status?: string }

export interface SendCodeResult { sent: boolean; expiresIn: number; message: string; devCode?: string }
export interface LogoutResult { success: boolean }
export interface DeleteResult { deleted: boolean }
export type BindPhoneSendInput = Omit<SmsSendInput, "scene">;
