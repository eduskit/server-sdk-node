# @eduskit/server-sdk

Node.js / TypeScript B 端 Server SDK。`sdk.client` 调课堂 server-api，`sdk.whiteboardClient` 调白板 server-api。

概念与方法表见仓库 [docs/overview.md](docs/overview.md)、[docs/api.md](docs/api.md)。

## 安装

```bash
npm install @eduskit/server-sdk
```

要求 Node.js 18+（使用内置 `fetch`）。本仓库开发：

```bash
npm install
npm test
```

## 初始化

```ts
import { Eduskit, EduskitError } from '@eduskit/server-sdk'

const sdk = new Eduskit({
  timeoutMs: 10_000,
  lang: 'zh-CN',
  client: {
    baseUrl: 'http://localhost:3112',
    appId: process.env.EDU_APP_ID!,
    appKey: process.env.EDU_APP_KEY!,
    appSecret: process.env.EDU_APP_SECRET!,
  },
  whiteboardClient: {
    baseUrl: 'http://localhost:3012',
    appId: process.env.WB_APP_ID!,
    appKey: process.env.WB_APP_KEY!,
    appSecret: process.env.WB_APP_SECRET!,
  },
})
```

`client` 与 `whiteboardClient` 均可选。也可单独构造：

```ts
import { ClassroomClient, WhiteboardClient } from '@eduskit/server-sdk'
```

## 课堂 `sdk.client`

```ts
const user = await sdk.client.users.register({
  originId: 'stu_001',
  nickname: '小明',
  avatar: 'https://example.com/a.png',
})

const token = await sdk.client.auth.issueToken({
  eduUserId: user.eduUserId,
  originId: 'stu_001',
  role: 'student',
  expiresIn: 86400,
})

const classroom = await sdk.client.classrooms.create({
  name: '一年级数学',
  startsAt: '2026-08-17T10:00:00.000Z',
  endsAt: '2026-08-17T11:00:00.000Z',
  teacherEduUserId: user.eduUserId,
})

await sdk.client.classrooms.start(classroom.classroomId)
await sdk.client.classrooms.members.add(classroom.classroomId, {
  eduUserId: user.eduUserId,
  role: 'student',
})
await sdk.client.classrooms.members.replaceStudents(classroom.classroomId, {
  eduUserIds: [user.eduUserId],
})
await sdk.client.classrooms.permissions.set(classroom.classroomId, user.eduUserId, {
  permission: 'camera',
  effect: 'grant',
  operatorEduUserId: user.eduUserId,
})
await sdk.client.classrooms.coursewares.bind(classroom.classroomId, {
  coursewareIds: ['cw_xxx'],
})
await sdk.client.app.getUiConfig()
```

| 方法 | 说明 |
|------|------|
| `users.register(input)` | 注册/更新 C 端用户 |
| `auth.issueToken(input)` | 签发 C 端 accessToken |
| `classrooms.create(input)` | 创建课堂 |
| `classrooms.start(id)` / `end(id)` | 开课 / 结课 |
| `classrooms.members.add(id, input)` | 加人 |
| `classrooms.members.list(id)` | 成员列表 |
| `classrooms.members.replaceStudents(id, input)` | 全量替换学生 |
| `classrooms.permissions.get/set/clear(...)` | 代老师管权限 |
| `classrooms.coursewares.list/bind/unbind(...)` | 课件绑定 |
| `app.getUiConfig()` / `setUiConfig(input)` | App UI |

## 白板 `sdk.whiteboardClient`

```ts
const credential = await sdk.whiteboardClient.auth.issueRoomToken({
  roomId: 'room_1',
  userId: user.eduUserId,
  role: 'host',
  expiresIn: 3600,
})

const session = await sdk.whiteboardClient.recordings.start('room_1', {
  externalRef: 'lesson_001',
})
await sdk.whiteboardClient.recordings.stop('room_1', {
  recordingId: session.recordingId,
})
await sdk.whiteboardClient.recordings.enqueueVideoExport(session.recordingId, {
  profile: 'hd',
})

await sdk.whiteboardClient.captures.create('room_1', { pageId: 'page_1' })
await sdk.whiteboardClient.files.convert({
  sourceUrl: 'https://cdn.example.com/lesson.pptx',
  fileName: 'lesson.pptx',
})
```

| 方法 | 说明 |
|------|------|
| `auth.issueRoomToken(input)` | 签发 Room Token |
| `recordings.start/stop/list/get` | 录制会话 |
| `recordings.registerMediaAsset` / `deleteMediaAsset` | 媒体资产 |
| `recordings.enqueueVideoExport` / `getVideoExport` | 视频导出（stop 不自动出片） |
| `captures.create/list` | 页截图 |
| `files.convert` / `getConvertJob` | 文件转码 |

## 错误

```ts
try {
  await sdk.client.auth.issueToken({ eduUserId: '' })
} catch (error) {
  if (error instanceof EduskitError) {
    console.error(error.errorCode, error.status, error.traceId, error.source)
  }
}
```

`sdk.client.lastTraceId` / `sdk.whiteboardClient.lastTraceId` 为最近一次调用的 trace。

## 示例

- [examples/classroom-quickstart.ts](examples/classroom-quickstart.ts)
- [examples/whiteboard-quickstart.ts](examples/whiteboard-quickstart.ts)
