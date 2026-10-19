import { LiveVideosApi, ClassroomMediaApi, ServerUsersApi, ServerClassroomsApi, CoursewaresApi, ActivityApi } from './media.js';
import { withQuery } from '../http.js';
import type { SideClientOptions } from '../config.js';
import { encodePath, HttpTransport } from '../http.js';
import {
  EDU_TOKEN_AUDIENCE,
  EDU_TOKEN_ISSUER,
  requireText,
  signHs256,
  type LocalTokenSigner,
} from '../token.js';
import type {
  AddMemberInput,
  AppUiConfig,
  BindCoursewaresInput,
  BindCoursewaresResult,
  Classroom,
  ClearPermissionInput,
  CoursewareList,
  CreateClassroomInput,
  EduUser,
  EduUserToken,
  IssueTokenInput,
  MemberList,
  Membership,
  Permissions,
  RegisterEduUserInput,
  ReplaceStudentsInput,
  ReplaceStudentsResult,
  SetAppUiConfigInput,
  SetPermissionInput,
  UnbindCoursewaresResult,
} from './types.js';

export class ClassroomClient {
  readonly coursewares: CoursewaresApi;
  readonly activity: ActivityApi;
  readonly liveVideos: LiveVideosApi;
  readonly classroomMedia: ClassroomMediaApi;
  readonly users: ClassroomUsersApi;
  readonly auth: ClassroomAuthApi;
  readonly classrooms: ClassroomClassroomsApi;
  readonly app: ClassroomAppApi;
  private readonly http: HttpTransport;

  constructor(options: SideClientOptions) {
    this.http = new HttpTransport({ ...options, source: 'classroom' });
    this.coursewares = new CoursewaresApi(this.http);
    this.activity = new ActivityApi(this.http);
    this.liveVideos = new LiveVideosApi(this.http);
    this.classroomMedia = new ClassroomMediaApi(this.http);
    this.users = new ClassroomUsersApi(this.http);
    this.auth = new ClassroomAuthApi({
      appId: options.appId,
      appSecret: options.appSecret,
      source: 'classroom',
    });
    this.classrooms = new ClassroomClassroomsApi(this.http);
    this.app = new ClassroomAppApi(this.http);
  }

  uploadFile(url: string, data: Uint8Array, contentType: string): Promise<void> {
    return this.http.uploadFile(url, data, contentType);
  }

  get lastTraceId(): string {
    return this.http.lastTraceId;
  }
}

class ClassroomUsersApi extends ServerUsersApi {
  constructor(private readonly http: HttpTransport) { super(http); }

  register(input: RegisterEduUserInput): Promise<EduUser> {
    return this.http.request('POST', '/v1/users', input);
  }
}

class ClassroomAuthApi {
  constructor(private readonly signer: LocalTokenSigner) {}

  async issueToken(input: IssueTokenInput): Promise<EduUserToken> {
    const eduUserId = requireText(input.eduUserId, 'eduUserId', 'classroom');
    const expiresIn = input.expiresIn ?? 86_400;
    const signed = signHs256(
      this.signer,
      {
        appId: this.signer.appId,
        ...(input.originId ? { originId: input.originId } : {}),
        ...(input.role ? { role: input.role } : {}),
      },
      {
        issuer: EDU_TOKEN_ISSUER,
        audience: EDU_TOKEN_AUDIENCE,
        subject: eduUserId,
        expiresIn,
      },
    );
    return {
      accessToken: signed.token,
      expiresIn,
      expiresAt: new Date(signed.expiresAt * 1000).toISOString(),
      tokenType: 'Bearer',
      appId: this.signer.appId,
      eduUserId,
      originId: input.originId ?? '',
      role: input.role ?? '',
    };
  }
}

class ClassroomMembersApi {
  constructor(private readonly http: HttpTransport) {}

  add(classroomId: string, input: AddMemberInput): Promise<Membership> {
    return this.http.request(
      'POST',
      "/v1/classrooms/members",
      { ...input, classroomId: classroomId },
    );
  }

  list(classroomId: string): Promise<MemberList> {
    return this.http.request(
      'GET',
      withQuery("/v1/classrooms/members", { classroomId: classroomId }),
    );
  }

  replaceStudents(
    classroomId: string,
    input: ReplaceStudentsInput,
  ): Promise<ReplaceStudentsResult> {
    return this.http.request(
      'PUT',
      "/v1/classrooms/members/students",
      { ...input, classroomId: classroomId },
    );
  }
}

class ClassroomPermissionsApi {
  constructor(private readonly http: HttpTransport) {}

  get(classroomId: string, eduUserId: string): Promise<Permissions> {
    return this.http.request(
      'GET',
      withQuery("/v1/classrooms/members/permissions", { classroomId: classroomId, eduUserId: eduUserId }),
    );
  }

  set(
    classroomId: string,
    eduUserId: string,
    input: SetPermissionInput,
  ): Promise<Permissions> {
    return this.http.request(
      'POST',
      "/v1/classrooms/members/permissions",
      { ...input, classroomId: classroomId, eduUserId: eduUserId },
    );
  }

  clear(
    classroomId: string,
    eduUserId: string,
    permission: string,
    input: ClearPermissionInput,
  ): Promise<Permissions> {
    return this.http.request(
      'DELETE',
      withQuery("/v1/classrooms/members/permissions", { classroomId: classroomId, eduUserId: eduUserId, permission: permission }),
      input,
    );
  }
}

class ClassroomCoursewaresApi {
  constructor(private readonly http: HttpTransport) {}

  list(classroomId: string): Promise<CoursewareList> {
    return this.http.request(
      'GET',
      withQuery("/v1/classrooms/coursewares", { classroomId: classroomId }),
    );
  }

  bind(
    classroomId: string,
    input: BindCoursewaresInput,
  ): Promise<BindCoursewaresResult> {
    return this.http.request(
      'POST',
      "/v1/classrooms/coursewares",
      { ...input, classroomId: classroomId },
    );
  }

  unbind(
    classroomId: string,
    input: BindCoursewaresInput,
  ): Promise<UnbindCoursewaresResult> {
    return this.http.request(
      'DELETE',
      withQuery("/v1/classrooms/coursewares", { classroomId: classroomId }),
      input,
    );
  }
}

class ClassroomEntryCodeApi {
  constructor(private readonly http: HttpTransport) {}

  list(classroomId: string) {
    return this.http.request(
      'GET',
      withQuery('/v1/classrooms/entry-codes', { classroomId }),
    );
  }

  issue(classroomId: string, input: Record<string, unknown>) {
    return this.http.request('POST', '/v1/classrooms/entry-codes', {
      ...input,
      classroomId,
    });
  }

  update(classroomId: string, input: Record<string, unknown>) {
    return this.http.request('POST', '/v1/classrooms/entry-codes/update', {
      ...input,
      classroomId,
    });
  }

  revoke(classroomId: string, entryCodeId: string) {
    return this.http.request('POST', '/v1/classrooms/entry-codes/revoke', {
      classroomId,
      entryCodeId,
    });
  }
}

class ClassroomClassroomsApi extends ServerClassroomsApi {
  readonly members: ClassroomMembersApi;
  readonly permissions: ClassroomPermissionsApi;
  readonly coursewares: ClassroomCoursewaresApi;
  readonly entryCode: ClassroomEntryCodeApi;

  constructor(private readonly http: HttpTransport) {
    super(http);
    this.members = new ClassroomMembersApi(http);
    this.permissions = new ClassroomPermissionsApi(http);
    this.coursewares = new ClassroomCoursewaresApi(http);
    this.entryCode = new ClassroomEntryCodeApi(http);
  }

  create(input: CreateClassroomInput): Promise<Classroom> {
    return this.http.request('POST', '/v1/classrooms', input);
  }

  start(classroomId: string): Promise<Classroom> {
    return this.http.request(
      'POST',
      "/v1/classrooms/start", { classroomId: classroomId },
    );
  }

  end(classroomId: string): Promise<Classroom> {
    return this.http.request(
      'POST',
      "/v1/classrooms/end", { classroomId: classroomId },
    );
  }
}

class ClassroomAppApi {
  constructor(private readonly http: HttpTransport) {}

  getUiConfig(): Promise<AppUiConfig> {
    return this.http.request('GET', '/v1/app/ui-config');
  }

  setUiConfig(input: SetAppUiConfigInput): Promise<AppUiConfig> {
    return this.http.request('PUT', '/v1/app/ui-config', input);
  }
}
