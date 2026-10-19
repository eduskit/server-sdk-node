import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { ConsoleClient, Eduskit, EduskitError } from '../src/index.js';

const operations = JSON.parse(readFileSync(new URL('../../test/console-contract.json', import.meta.url), 'utf8'));
test('every console operation routes method, scope, query and body and unwraps data', async () => {
  let active: any;
  let count = 0;
  const c = new ConsoleClient({ baseUrl: 'https://console.test/', accessToken: 'tenant-token', fetch: async (url, init) => {
    count++;
    const parsed = new URL(url);
    assert.equal(parsed.pathname, active.path);
    assert.equal(init?.method, active.method);
    const headers = new Headers(init?.headers);
    assert.equal(headers.get('authorization'), active.scope === 'public' ? null : 'Bearer tenant-token');
    assert.equal(headers.get('x-app-id'), active.scope === 'app' ? 'app_1' : null);
    assert.equal(headers.get('x-app-key'), null);
    assert.equal(headers.get('x-app-secret'), null);
    if (active.input === 'EmptyInput') assert.equal(parsed.search, '');
    else if (active.queryKeys) {
      assert.equal(parsed.searchParams.get('classroomId'), 'cls_中 &/?');
      assert.deepEqual(JSON.parse(init!.body as string), { q: '中 &/?', page: 0, enabled: false });
    } else if (['GET', 'DELETE'].includes(active.method)) {
      assert.equal(parsed.searchParams.get('q'), '中 &/?');
      assert.equal(parsed.searchParams.get('page'), '0');
      assert.equal(parsed.searchParams.get('enabled'), 'false');
      assert.equal(parsed.searchParams.has('unused'), false);
      assert.equal(init?.body, undefined);
    } else assert.equal(JSON.parse(init!.body as string).classroomId, 'cls_中 &/?');
    return new Response(JSON.stringify({ code: 0, data: [{ value: 'ok' }], traceId: 'trace-console' }));
  }});
  for (active of operations) {
    const [group, method] = active.name.split('.');
    const args: unknown[] = active.scope === 'app' ? ['app_1'] : [];
    if (active.input !== 'EmptyInput') args.push({ classroomId: 'cls_中 &/?', q: '中 &/?', page: 0, enabled: false, unused: undefined });
    const result = await (c as any)[group][method](...args);
    assert.deepEqual(result, [{ value: 'ok' }]);
    assert.equal(c.lastTraceId, 'trace-console');
  }
  assert.equal(count, operations.length);
});
test('console guards, explicit token replacement, errors, and signed upload isolation', async () => {
  let calls = 0;
  const c = new ConsoleClient({ baseUrl: 'https://console.test', fetch: async (url, init) => {
    calls++;
    const headers = new Headers(init?.headers);
    if (url.startsWith('https://storage.test')) {
      assert.deepEqual([...headers.keys()], ['content-type']);
      assert.equal(init?.method, 'PUT');
      assert.deepEqual([...new Uint8Array(init?.body as ArrayBuffer)], [0, 255, 1]);
      return new Response('', { status: 200 });
    }
    assert.equal(headers.get('authorization'), 'Bearer updated');
    return new Response(JSON.stringify({ code: 403, errorCode: 'APP_NOT_OWNED', message: 'denied', traceId: 'denied-trace' }), { status: 403 });
  }});
  assert.throws(() => c.apps.list(), (e: any) => e.errorCode === 'SDK_CONSOLE_TOKEN_REQUIRED');
  c.setAccessToken('updated');
  assert.throws(() => c.users.list(' '), (e: any) => e.errorCode === 'SDK_CONSOLE_APP_ID_REQUIRED');
  assert.equal(calls, 0);
  await assert.rejects(c.apps.list(), (e: any) => e instanceof EduskitError && e.source === 'console' && e.traceId === 'denied-trace');
  await c.uploadFile('https://storage.test/signed?secret=value', new Uint8Array([0, 255, 1]), 'application/octet-stream');
  assert.throws(() => new Eduskit({}).consoleClient, (e: any) => e.errorCode === 'SDK_CLIENT_NOT_CONFIGURED');
});
test('console preserves null envelope data and rejects structured query values', async () => {
  const c = new ConsoleClient({ baseUrl: 'https://console.test', accessToken: 'token', fetch: async () => new Response('{"code":0,"data":null}') });
  assert.equal(await c.auth.me(), null);
  assert.throws(() => c.users.list('app_1', { q: ['invalid'] } as any), (e: any) => e.errorCode === 'SDK_QUERY_INVALID');
});
test('all app-credential media methods route requests without tenant auth', async () => {
  const media = JSON.parse(readFileSync(new URL('../../test/media-contract.json', import.meta.url), 'utf8'));
  let active: any;
  const sdk = new Eduskit({ client: { baseUrl: 'https://server.test', appId: 'app_1', appKey: 'key', appSecret: 'secret' }, fetch: async (url, init) => {
    const parsed = new URL(url); const headers = new Headers(init?.headers);
    assert.equal(parsed.pathname, active.path); assert.equal(init?.method, active.method);
    assert.equal(headers.get('x-app-key'), 'key'); assert.equal(headers.get('x-app-secret'), 'secret');
    assert.equal(headers.get('authorization'), null); assert.equal(headers.get('x-app-id'), null);
    if (['GET','DELETE'].includes(active.method)) assert.equal(parsed.searchParams.get('classroomId'), 'cls_中 &/?');
    else assert.equal(JSON.parse(init!.body as string).classroomId, 'cls_中 &/?');
    return new Response('{"code":0,"data":{"ok":true}}');
  }});
  for (active of media) {
    const [group,name] = active.name.split('.');
    assert.deepEqual(await (sdk.client as any)[group][name]({ classroomId: 'cls_中 &/?' }), { ok: true });
  }
});

test('business uploads do not send application credentials and search preserves false', async () => {
  const sdk = new Eduskit({ client: { baseUrl: 'https://server.test', appId: 'app_1', appKey: 'key', appSecret: 'secret' }, fetch: async (url, init) => {
    const headers = new Headers(init?.headers);
    if (url.startsWith('https://storage.test')) {
      assert.equal(init?.method, 'PUT');
      assert.deepEqual([...headers.keys()], ['content-type']);
      assert.deepEqual([...new Uint8Array(init?.body as ArrayBuffer)], [0, 255, 1]);
      return new Response('', { status: 200 });
    }
    assert.equal(new URL(url).searchParams.get('requireOriginId'), 'false');
    assert.equal(headers.get('authorization'), null);
    return new Response('{"code":0,"data":{"items":[]}}');
  }});
  await sdk.client.uploadFile('https://storage.test/signed', new Uint8Array([0, 255, 1]), 'application/pdf');
  await sdk.client.users.search({ requireOriginId: false });
});
