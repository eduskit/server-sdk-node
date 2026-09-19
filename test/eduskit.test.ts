import assert from 'node:assert/strict';
import { test } from 'node:test';
import { Eduskit, EduskitError } from '../src/index.js';
import { mockFetch } from './helpers.js';

const creds = {
  baseUrl: 'http://edu.test',
  appId: 'app_edu',
  appKey: 'k',
  appSecret: 'secret-for-edu-token-signing',
};

test('unwraps classroom envelope and injects credentials', async () => {
  const { fetchImpl, calls } = mockFetch(() => ({
    body: {
      code: 0,
      message: 'ok',
      data: { eduUserId: 'eu_1', appId: 'app_1', nickname: 'n', avatar: 'https://a', status: 'active' },
      traceId: 'body-trace',
    },
  }));
  const sdk = new Eduskit({
    client: creds,
    fetch: fetchImpl,
  });
  const user = await sdk.client.users.register({
    nickname: 'n',
    avatar: 'https://a',
  });
  assert.equal(user.eduUserId, 'eu_1');
  assert.equal(sdk.client.lastTraceId, 'body-trace');
  assert.equal(calls[0].method, 'POST');
  assert.equal(calls[0].url, 'http://edu.test/v1/users');
  assert.equal(calls[0].headers['x-app-key'], 'k');
  assert.equal(calls[0].headers['x-app-secret'], creds.appSecret);
});

test('classroom semantic methods hit the right paths', async () => {
  const { fetchImpl, calls } = mockFetch((req) => ({
    body: { code: 0, data: { classroomId: 'cls_1', path: req.url } },
  }));
  const sdk = new Eduskit({ client: creds, fetch: fetchImpl });
  await sdk.client.classrooms.create({
    name: 'math',
    startsAt: '2026-08-17T10:00:00.000Z',
    endsAt: '2026-08-17T11:00:00.000Z',
    teacherEduUserId: 'eu_t',
  });
  await sdk.client.classrooms.start('cls_1');
  await sdk.client.classrooms.members.add('cls_1', { eduUserId: 'eu_s', role: 'student' });
  await sdk.client.classrooms.members.replaceStudents('cls_1', { eduUserIds: ['eu_s'] });
  await sdk.client.classrooms.permissions.set('cls_1', 'eu_s', {
    permission: 'camera',
    effect: 'grant',
    operatorEduUserId: 'eu_t',
  });
  await sdk.client.classrooms.coursewares.bind('cls_1', { coursewareIds: ['cw_1'] });
  await sdk.client.app.getUiConfig();

  const paths = calls.map((c) => `${c.method} ${new URL(c.url).pathname}`);
  assert.deepEqual(paths, [
    'POST /v1/classrooms',
    'POST /v1/classrooms/cls_1/start',
    'POST /v1/classrooms/cls_1/members',
    'PUT /v1/classrooms/cls_1/members/students',
    'POST /v1/classrooms/cls_1/members/eu_s/permissions',
    'POST /v1/classrooms/cls_1/coursewares',
    'GET /v1/app/ui-config',
  ]);
});

test('whiteboard issueRoomToken signs locally without an HTTP request', async () => {
  const { fetchImpl, calls } = mockFetch(() => ({
    body: {
      code: 0,
      data: { token: 'rt', roomId: 'r1', userId: 'u1', role: 'host', expiresIn: 3600, expiresAt: 't', appId: 'a' },
    },
    headers: { 'x-trace-id': 'wb-trace' },
  }));
  const sdk = new Eduskit({
    whiteboardClient: { baseUrl: 'http://wb.test', appId: 'app_wb', appKey: 'wk', appSecret: 'secret-for-whiteboard-token' },
    fetch: fetchImpl,
  });
  const token = await sdk.whiteboardClient.auth.issueRoomToken({
    roomId: 'r1',
    userId: 'u1',
    role: 'host',
  });
  assert.equal(token.appId, 'app_wb');
  assert.equal(token.token.split('.').length, 3);
  assert.equal(calls.length, 0);
});

test('whiteboard recording and convert paths', async () => {
  const { fetchImpl, calls } = mockFetch(() => ({
    body: { code: 0, data: { recordingId: 'rec_1', jobId: 'job_1', status: 'pending', progress: 0, createdAt: '', updatedAt: '' } },
  }));
  const sdk = new Eduskit({
    whiteboardClient: { baseUrl: 'http://wb.test', appId: 'app_wb', appKey: 'wk', appSecret: 'secret-for-whiteboard-token' },
    fetch: fetchImpl,
  });
  await sdk.whiteboardClient.recordings.start('room_1', { externalRef: 'ext' });
  await sdk.whiteboardClient.recordings.enqueueVideoExport('rec_1', { profile: 'hd' });
  await sdk.whiteboardClient.captures.create('room_1', { pageId: 'p1' });
  await sdk.whiteboardClient.files.convert({ sourceUrl: 'https://f/a.pptx' });
  await sdk.whiteboardClient.files.getConvertJob('job_1');

  const paths = calls.map((c) => `${c.method} ${new URL(c.url).pathname}`);
  assert.deepEqual(paths, [
    'POST /v1/rooms/room_1/recording/start',
    'POST /v1/recordings/rec_1/video-exports',
    'POST /v1/rooms/room_1/captures',
    'POST /v1/files/convert',
    'GET /v1/files/convert/job_1',
  ]);
  assert.equal((calls[2].body as { roomId: string }).roomId, 'room_1');
});

test('classroom issueToken signs locally and validates input', async () => {
  const sdk = new Eduskit({ client: creds });
  const token = await sdk.client.auth.issueToken({
    eduUserId: 'eu_1',
    originId: 'origin_1',
    role: 'student',
    expiresIn: 600,
  });
  assert.equal(token.appId, 'app_edu');
  assert.equal(token.eduUserId, 'eu_1');
  assert.equal(token.tokenType, 'Bearer');
  assert.equal(token.accessToken.split('.').length, 3);
  await assert.rejects(
    () => sdk.client.auth.issueToken({ eduUserId: '', expiresIn: 600 }),
    (error: unknown) => {
      assert.ok(error instanceof EduskitError);
      assert.equal(error.errorCode, 'SDK_TOKEN_INPUT_INVALID');
      assert.equal(error.source, 'classroom');
      return true;
    },
  );
});

test('unconfigured side throws immediately', () => {
  const sdk = new Eduskit({ client: creds });
  assert.throws(() => sdk.whiteboardClient, (error: unknown) => {
    assert.ok(error instanceof EduskitError);
    assert.equal(error.errorCode, 'SDK_CLIENT_NOT_CONFIGURED');
    return true;
  });
});
