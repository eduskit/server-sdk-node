# 控制台管理客户端

`consoleClient` 使用 console-api 地址和租户访问令牌提供 88 项管理接口。课堂与白板客户端继续使用各自的应用凭证。

```ts
import { Eduskit } from '@eduskit/server-sdk';
const sdk = new Eduskit({
  consoleClient: { baseUrl: 'http://localhost:3101', accessToken: tenantAccessToken },
});
const apps = await sdk.consoleClient.apps.list();
const users = await sdk.consoleClient.users.list(appId, { page: 1, pageSize: 20 });
```

Python 属性名为 `console_client`，Go 为 `ConsoleClient()`，Java 为 `consoleClient()`；所有语言也可直接构造 `ConsoleClient`。

应用内接口的第一个参数是应用 ID，SDK 写入 `x-app-id`。应用管理接口根据契约在 Query 或 Body 中携带应用 ID。公共认证接口不发送租户令牌。控制台请求不发送 `x-app-key` 或 `x-app-secret`。

调用 `auth.refresh` 后，用 `setAccessToken` 更新访问令牌，并由业务服务保存新刷新令牌。SDK 不自动刷新或重试。响应返回 `data`；Go 控制台方法把响应写入最后一个 `out` 参数。错误来源为 `console`。

文件上传使用 `uploadFile(url, bytes, contentType)`；Python 为 `upload_file`，Go 为 `UploadFile(ctx, url, bytes, contentType)`。该方法直接 PUT 文件字节，只设置 Content-Type，不向对象存储发送登录令牌或应用凭证。

详细参数、返回结构与五种语言示例见 [控制台管理文档](https://docs.eduskit.com/server-sdk/console/)。这些方法属于当前源码构建，公开包 `0.1.5` 不包含这些方法。

## 接口清单

| 方法 | HTTP | 鉴权范围 | 功能 |
| --- | --- | --- | --- |
| `auth.methods` | `GET /v1/auth/methods` | 公开 | 登录方式 |
| `auth.sendSms` | `POST /v1/auth/sms/send` | 公开 | 发送短信验证码 |
| `auth.verifySms` | `POST /v1/auth/sms/verify` | 公开 | 短信登录 |
| `auth.sendEmail` | `POST /v1/auth/email/send` | 公开 | 发送邮箱验证码 |
| `auth.verifyEmail` | `POST /v1/auth/email/verify` | 公开 | 邮箱登录 |
| `auth.googleAuthorize` | `GET /v1/auth/google/authorize` | 公开 | Google 授权地址 |
| `auth.googleCallback` | `POST /v1/auth/google/callback` | 公开 | Google 授权换票 |
| `auth.googleToken` | `POST /v1/auth/google/token` | 公开 | Google ID Token 登录 |
| `auth.wechatAuthorize` | `GET /v1/auth/wechat/authorize` | 公开 | 微信授权地址 |
| `auth.wechatCallback` | `POST /v1/auth/wechat/callback` | 公开 | 微信授权换票 |
| `auth.sendWechatBindPhone` | `POST /v1/auth/wechat/bind-phone/send` | 公开 | 微信登录绑定手机号发码 |
| `auth.verifyWechatBindPhone` | `POST /v1/auth/wechat/bind-phone/verify` | 公开 | 微信登录绑定手机号验证 |
| `auth.sendBindPhone` | `POST /v1/auth/phone/bind/send` | 租户 | 登录账号绑定手机号发码 |
| `auth.verifyBindPhone` | `POST /v1/auth/phone/bind/verify` | 租户 | 登录账号绑定手机号 |
| `auth.wechatBindAuthorize` | `GET /v1/auth/wechat/bind/authorize` | 租户 | 账号绑定微信授权地址 |
| `auth.wechatBindCallback` | `POST /v1/auth/wechat/bind/callback` | 租户 | 账号绑定微信换票 |
| `auth.refresh` | `POST /v1/auth/token/refresh` | 公开 | 刷新租户会话 |
| `auth.logout` | `POST /v1/auth/logout` | 公开 | 退出租户会话 |
| `auth.me` | `GET /v1/auth/me` | 租户 | 当前登录账号 |
| `apps.list` | `GET /v1/apps` | 租户 | 应用列表 |
| `apps.get` | `GET /v1/apps/detail` | 租户 | 应用详情 |
| `apps.create` | `POST /v1/apps` | 租户 | 创建应用 |
| `apps.updateConfig` | `PATCH /v1/apps/config` | 租户 | 覆盖应用配置 |
| `apps.updateWebhook` | `PATCH /v1/apps/webhook` | 租户 | 设置回调及签名密钥 |
| `users.list` | `GET /v1/users` | 租户 + 应用 | 用户列表 |
| `users.search` | `GET /v1/users/search` | 租户 + 应用 | 搜索用户 |
| `users.create` | `POST /v1/users` | 租户 + 应用 | 创建用户 |
| `users.setStatus` | `PATCH /v1/users/status` | 租户 + 应用 | 启用或停用用户 |
| `users.issueToken` | `POST /v1/users/token` | 租户 + 应用 | 签发用户 Token |
| `classrooms.list` | `GET /v1/classrooms` | 租户 + 应用 | 课堂列表 |
| `classrooms.get` | `GET /v1/classrooms/detail` | 租户 + 应用 | 课堂详情 |
| `classrooms.create` | `POST /v1/classrooms` | 租户 + 应用 | 创建课堂 |
| `classrooms.update` | `PATCH /v1/classrooms/update` | 租户 + 应用 | 修改课堂 |
| `classrooms.start` | `POST /v1/classrooms/start` | 租户 + 应用 | 开始课堂 |
| `classrooms.end` | `POST /v1/classrooms/end` | 租户 + 应用 | 结束课堂 |
| `classrooms.listMembers` | `GET /v1/classrooms/members` | 租户 + 应用 | 课堂成员 |
| `classrooms.addMember` | `POST /v1/classrooms/members` | 租户 + 应用 | 添加课堂成员 |
| `classrooms.replaceStudents` | `PUT /v1/classrooms/members/students` | 租户 + 应用 | 覆盖学生名单 |
| `classrooms.listCoursewares` | `GET /v1/classrooms/coursewares` | 租户 + 应用 | 课堂课件列表 |
| `classrooms.bindCoursewares` | `POST /v1/classrooms/coursewares` | 租户 + 应用 | 绑定课堂课件 |
| `classrooms.unbindCoursewares` | `DELETE /v1/classrooms/coursewares` | 租户 + 应用 | 解绑课堂课件 |
| `classrooms.listWhiteboardCoursewares` | `GET /v1/classrooms/whiteboard/coursewares` | 租户 + 应用 | 白板课件列表 |
| `classrooms.addWhiteboardCourseware` | `POST /v1/classrooms/whiteboard/coursewares` | 租户 + 应用 | 添加课件到白板 |
| `classrooms.attendance` | `GET /v1/classrooms/attendance` | 租户 + 应用 | 课堂出勤记录 |
| `classrooms.listEnteredUsers` | `GET /v1/classrooms/entered-users` | 租户 + 应用 | 实际进课用户 |
| `classrooms.listJoinAttempts` | `GET /v1/classrooms/join-attempts` | 租户 + 应用 | 进课尝试 |
| `classrooms.getEnteredUserTrace` | `GET /v1/classrooms/entered-users/trace` | 租户 + 应用 | 用户进课轨迹 |
| `classrooms.getLiveSource` | `GET /v1/classrooms/live-source` | 租户 + 应用 | 直播源详情 |
| `classrooms.setLiveSource` | `PUT /v1/classrooms/live-source` | 租户 + 应用 | 设置直播源 |
| `classrooms.issueLivePushCredential` | `POST /v1/classrooms/live-source/push-credential` | 租户 + 应用 | 推流凭证 |
| `classrooms.getLivePlayCredentials` | `GET /v1/classrooms/live/play-credentials` | 租户 + 应用 | 直播播放凭证 |
| `entryCodes.list` | `GET /v1/classrooms/entry-codes` | 租户 + 应用 | 上课码及领用记录 |
| `entryCodes.issue` | `POST /v1/classrooms/entry-codes` | 租户 + 应用 | 签发上课码 |
| `entryCodes.update` | `POST /v1/classrooms/entry-codes/update` | 租户 + 应用 | 修改或轮换上课码 |
| `entryCodes.revoke` | `POST /v1/classrooms/entry-codes/revoke` | 租户 + 应用 | 撤销上课码 |
| `activity.list` | `GET /v1/classrooms/activity` | 租户 + 应用 | 课堂活动列表 |
| `activity.tracks` | `GET /v1/classrooms/activity/tracks` | 租户 + 应用 | 课堂活动轨道 |
| `activity.overview` | `GET /v1/classrooms/activity/overview` | 租户 + 应用 | 课堂活动概览 |
| `activity.detail` | `GET /v1/classrooms/activity/detail` | 租户 + 应用 | 课堂活动详情 |
| `coursewares.list` | `GET /v1/coursewares` | 租户 + 应用 | 课件库列表 |
| `coursewares.createUploadUrl` | `POST /v1/coursewares/upload-url` | 租户 + 应用 | 课件上传地址 |
| `coursewares.create` | `POST /v1/coursewares` | 租户 + 应用 | 创建并转码课件 |
| `coursewares.get` | `GET /v1/coursewares/detail` | 租户 + 应用 | 课件详情 |
| `coursewares.getManifest` | `GET /v1/coursewares/manifest` | 租户 + 应用 | 课件页面清单 |
| `coursewares.remove` | `DELETE /v1/coursewares/remove` | 租户 + 应用 | 删除课件 |
| `coursewares.retry` | `POST /v1/coursewares/retry` | 租户 + 应用 | 重试课件转码 |
| `liveVideos.list` | `GET /v1/live-videos` | 租户 + 应用 | 直播素材列表 |
| `liveVideos.createUploadUrl` | `POST /v1/live-videos/upload-url` | 租户 + 应用 | 直播视频上传地址 |
| `liveVideos.create` | `POST /v1/live-videos` | 租户 + 应用 | 创建直播素材 |
| `liveVideos.remove` | `DELETE /v1/live-videos/remove` | 租户 + 应用 | 删除直播素材 |
| `dashboard.overview` | `GET /v1/dashboard/overview` | 租户 | 总览 |
| `dashboard.trends` | `GET /v1/dashboard/trends` | 租户 | 趋势 |
| `dashboard.classrooms` | `GET /v1/dashboard/classrooms` | 租户 | 课堂统计 |
| `dashboard.quality` | `GET /v1/dashboard/quality` | 租户 | 进课质量 |
| `dashboard.usage` | `GET /v1/dashboard/usage` | 租户 | 用量汇总 |
| `dashboard.issues` | `GET /v1/dashboard/issues` | 租户 | 课件异常 |
| `billing.wallet` | `GET /v1/billing/wallet` | 租户 | 钱包余额 |
| `billing.entitlements` | `GET /v1/billing/entitlements` | 租户 | 租户权益 |
| `billing.listPlans` | `GET /v1/billing/plans` | 租户 | 套餐目录 |
| `billing.listPackages` | `GET /v1/billing/packages` | 租户 | 资源包目录 |
| `billing.estimate` | `POST /v1/billing/estimate` | 租户 | 费用估算 |
| `billing.listLedger` | `GET /v1/billing/ledger` | 租户 | 积分流水 |
| `billing.listUsage` | `GET /v1/billing/usage` | 租户 | 用量明细 |
| `billing.listReservations` | `GET /v1/billing/reservations` | 租户 | 资源预留 |
| `billing.purchasePlan` | `POST /v1/billing/plans/purchase` | 租户 | 购买套餐 |
| `billing.purchasePackage` | `POST /v1/billing/packages/purchase` | 租户 | 购买资源包 |
| `billing.getAutoRecharge` | `GET /v1/billing/auto-recharge` | 租户 | 自动充值设置 |
| `billing.setAutoRecharge` | `POST /v1/billing/auto-recharge` | 租户 | 保存自动充值设置 |

应用内业务使用 `client` 的应用凭证接口，详见[应用业务接口](business.md)。`consoleClient` 用于需要租户会话的管理调用。
