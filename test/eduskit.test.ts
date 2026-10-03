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
    'POST /v1/classrooms/start',
    'POST /v1/classrooms/members',
    'PUT /v1/classrooms/members/students',
    'POST /v1/classrooms/members/permissions',
    'POST /v1/classrooms/coursewares',
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
  const claims = JSON.parse(Buffer.from(token.token.split('.')[1]!, 'base64url').toString('utf8'));
  assert.ok(Object.hasOwn(claims, 'access_generation'));
  assert.equal(claims.access_generation, null);
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
    'POST /v1/rooms/recording/start',
    'POST /v1/recordings/video-exports',
    'POST /v1/rooms/captures',
    'POST /v1/files/convert',
    'GET /v1/files/convert',
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

test('identifiers travel in encoded query or JSON while operation paths stay constant', async () => {
  const { fetchImpl, calls } = mockFetch(() => ({ body: { code: 0, data: {} } }));
  const sdk = new Eduskit({ client: creds, whiteboardClient: { ...creds, baseUrl: 'http://wb.test' }, fetch: fetchImpl });
  const classroomId = 'class /?&';
  const eduUserId = 'user +#';
  await sdk.client.classrooms.permissions.get(classroomId, eduUserId);
  const read = new URL(calls[0].url);
  assert.equal(read.pathname, '/v1/classrooms/members/permissions');
  assert.equal(read.searchParams.get('classroomId'), classroomId);
  assert.equal(read.searchParams.get('eduUserId'), eduUserId);
  assert.equal(calls[0].body, undefined);
  const input = { permission: 'camera' as const, effect: 'grant' as const, operatorEduUserId: 'eu_teacher' };
  await sdk.client.classrooms.permissions.set(classroomId, eduUserId, input);
  assert.equal(new URL(calls[1].url).pathname, read.pathname);
  assert.equal(new URL(calls[1].url).search, '');
  assert.deepEqual(calls[1].body, { ...input, classroomId, eduUserId });
  assert.equal('classroomId' in input, false);
  await sdk.whiteboardClient.recordings.getVideoExport('record /&', 'job +?');
  const job = new URL(calls[2].url);
  assert.equal(job.pathname, '/v1/recordings/video-exports');
  assert.equal(job.searchParams.get('recordingId'), 'record /&');
  assert.equal(job.searchParams.get('jobId'), 'job +?');
  await sdk.whiteboardClient.recordings.deleteMediaAsset('record /&', 'asset +?');
  assert.equal(new URL(calls[3].url).pathname, '/v1/recordings/media-assets');
  assert.equal(new URL(calls[3].url).searchParams.get('assetId'), 'asset +?');
});


test('private room SDK methods use authenticated server routes and preserve canonical IDs and CAS strings', async () => {
  const {fetchImpl, calls} = mockFetch(() => ({body: {code: 0, data: {marker: 'server-result'}}}));
  const sdk = new Eduskit({whiteboardClient: {...creds, baseUrl: 'http://wb.test'}, fetch: fetchImpl});
  const rooms = sdk.whiteboardClient.rooms;
  const outputs = [
    await rooms.provisionPrivateRoom('room_a', 'assignment_a'),
    await rooms.changePrivateRoomGrant('room_a', {userId: 'student_a', requestId: 'grant_a', expectedGeneration: '9223372036854775806', action: 'grant', role: 'participant'}),
    await rooms.getPrivateRoomAccess('room_a', 'student_a'),
    await rooms.issuePrivateRoomToken('room_a', {userId: 'student_a', role: 'participant', expiresIn: 600}),
    await rooms.sealPrivateRoom('room_a'),
    await rooms.createFrozenSnapshot('room_a', 'snapshot_a'),
    await rooms.getFrozenSnapshot('room_a', 'snapshot_a'),
    await rooms.getFrozenSnapshotDownload('room_a', 'snapshot_a'),
    await rooms.initializePrivateWorkspace('room_a', 'assignment_a', null),
    await rooms.initializePrivateWorkspace('room_a', 'assignment_a', 'snapshot_a'),
    await rooms.getPrivateWorkspaceInitialization('room_a'),
    await rooms.schedulePrivateRoomWrites('room_a','window_a','2026-10-02T00:00:00.000Z','2026-10-02T00:10:00.000Z'),
  ];
  assert.equal(calls.length, 12);
  assert.deepEqual(calls.map(call => new URL(call.url).pathname), ['/v1/rooms/private',
    '/v1/rooms/private/grants', '/v1/rooms/private/access/query', '/v1/rooms/private/token',
    '/v1/rooms/private/seal', '/v1/rooms/private/snapshots', '/v1/rooms/private/snapshots/query', '/v1/rooms/private/snapshots/download',
    '/v1/rooms/private/initializations', '/v1/rooms/private/initializations', '/v1/rooms/private/initializations/query', '/v1/rooms/private/write-window']);
  for (const call of calls) {
    assert.equal(call.method, 'POST'); assert.equal(call.headers['x-app-key'], creds.appKey);
    assert.equal(call.headers['x-app-secret'], creds.appSecret); assert.equal((call.body as {roomId: string}).roomId, 'room_a');
  }
  assert.equal((calls[1].body as {expectedGeneration: string}).expectedGeneration, '9223372036854775806');
  assert.equal('accessGeneration' in (calls[3].body as object), false);
  assert.deepEqual(calls[8].body, {roomId: 'room_a', assignmentId: 'assignment_a', sourceSnapshotId: null});
  assert.deepEqual(calls[9].body, {roomId: 'room_a', assignmentId: 'assignment_a', sourceSnapshotId: 'snapshot_a'});
  assert.deepEqual(calls[10].body, {roomId: 'room_a'});
  assert.deepEqual(calls[11].body,{roomId:'room_a',requestId:'window_a',opensAt:'2026-10-02T00:00:00.000Z',closesAt:'2026-10-02T00:10:00.000Z'});
  for (const output of outputs) assert.deepEqual(output, {marker: 'server-result'});
});
