# 应用业务接口

业务服务使用 `sdk.client`，以 `appKey/appSecret` 连接 edu `server-api`。应用 ID 由服务端鉴权解析，不传租户令牌或 `x-app-id`。账号、应用创建和跨应用管理、租户仪表盘、钱包和购买使用独立的 `consoleClient`。

当前源码覆盖 50 个 server-api HTTP 路由；课堂用户 Token 由 `client.auth.issueToken` 本地签名。以下 45 项对应控制台的应用业务操作。新增接口需要部署相应的 edu_service/server-api 并构建本仓库 SDK。

- 详细参数和五种语言调用方式：[应用业务接口](https://docs.eduskit.com/server-sdk/business-api/)。
- 完整上传、课堂创建与诊断导出示例：[business-management.ts](../packages/nodejs/examples/business-management.ts)。
- `client.uploadFile` 直传签名上传地址，不携带应用密钥或租户令牌；Python 为 `upload_file`，Go 为 `UploadFile`。

| 方法 | HTTP | 功能 |
| --- | --- | --- |
| `client.users.list` | `GET /v1/users` | 用户列表 |
| `client.users.search` | `GET /v1/users/search` | 搜索用户 |
| `client.users.register` | `POST /v1/users` | 创建用户 |
| `client.users.setStatus` | `PATCH /v1/users/status` | 启用或停用用户 |
| `client.classrooms.list` | `GET /v1/classrooms` | 课堂列表 |
| `client.classrooms.get` | `GET /v1/classrooms/detail` | 课堂详情 |
| `client.classrooms.create` | `POST /v1/classrooms` | 创建课堂 |
| `client.classrooms.update` | `PATCH /v1/classrooms/update` | 修改课堂 |
| `client.classrooms.start` | `POST /v1/classrooms/start` | 开始课堂 |
| `client.classrooms.end` | `POST /v1/classrooms/end` | 结束课堂 |
| `client.classrooms.members.list` | `GET /v1/classrooms/members` | 课堂成员 |
| `client.classrooms.members.add` | `POST /v1/classrooms/members` | 添加课堂成员 |
| `client.classrooms.members.replaceStudents` | `PUT /v1/classrooms/members/students` | 覆盖学生名单 |
| `client.classrooms.coursewares.list` | `GET /v1/classrooms/coursewares` | 课堂课件列表 |
| `client.classrooms.coursewares.bind` | `POST /v1/classrooms/coursewares` | 绑定课堂课件 |
| `client.classrooms.coursewares.unbind` | `DELETE /v1/classrooms/coursewares` | 解绑课堂课件 |
| `client.classroomMedia.listWhiteboardCoursewares` | `GET /v1/classrooms/whiteboard/coursewares` | 白板课件列表 |
| `client.classroomMedia.addWhiteboardCourseware` | `POST /v1/classrooms/whiteboard/coursewares` | 添加课件到白板 |
| `client.classrooms.attendance` | `GET /v1/classrooms/attendance` | 课堂出勤记录 |
| `client.classrooms.listEnteredUsers` | `GET /v1/classrooms/entered-users` | 实际进课用户 |
| `client.classrooms.listJoinAttempts` | `GET /v1/classrooms/join-attempts` | 进课尝试 |
| `client.classrooms.getEnteredUserTrace` | `GET /v1/classrooms/entered-users/trace` | 用户进课轨迹 |
| `client.classroomMedia.getLiveSource` | `GET /v1/classrooms/live-source` | 直播源详情 |
| `client.classroomMedia.setLiveSource` | `PUT /v1/classrooms/live-source` | 设置直播源 |
| `client.classroomMedia.issueLivePushCredential` | `POST /v1/classrooms/live-source/push-credential` | 推流凭证 |
| `client.classroomMedia.getLivePlayCredentials` | `GET /v1/classrooms/live/play-credentials` | 直播播放凭证 |
| `client.classrooms.entryCode.list` | `GET /v1/classrooms/entry-codes` | 上课码及领用记录 |
| `client.classrooms.entryCode.issue` | `POST /v1/classrooms/entry-codes` | 签发上课码 |
| `client.classrooms.entryCode.update` | `POST /v1/classrooms/entry-codes/update` | 修改或轮换上课码 |
| `client.classrooms.entryCode.revoke` | `POST /v1/classrooms/entry-codes/revoke` | 撤销上课码 |
| `client.activity.list` | `GET /v1/classrooms/activity` | 课堂活动列表 |
| `client.activity.tracks` | `GET /v1/classrooms/activity/tracks` | 课堂活动轨道 |
| `client.activity.overview` | `GET /v1/classrooms/activity/overview` | 课堂活动概览 |
| `client.activity.detail` | `GET /v1/classrooms/activity/detail` | 课堂活动详情 |
| `client.coursewares.list` | `GET /v1/coursewares` | 课件库列表 |
| `client.coursewares.createUploadUrl` | `POST /v1/coursewares/upload-url` | 课件上传地址 |
| `client.coursewares.create` | `POST /v1/coursewares` | 创建并转码课件 |
| `client.coursewares.get` | `GET /v1/coursewares/detail` | 课件详情 |
| `client.coursewares.getManifest` | `GET /v1/coursewares/manifest` | 课件页面清单 |
| `client.coursewares.remove` | `DELETE /v1/coursewares/remove` | 删除课件 |
| `client.coursewares.retry` | `POST /v1/coursewares/retry` | 重试课件转码 |
| `client.liveVideos.list` | `GET /v1/live-videos` | 直播素材列表 |
| `client.liveVideos.createUploadUrl` | `POST /v1/live-videos/upload-url` | 直播视频上传地址 |
| `client.liveVideos.create` | `POST /v1/live-videos` | 创建直播素材 |
| `client.liveVideos.remove` | `DELETE /v1/live-videos/remove` | 删除直播素材 |
