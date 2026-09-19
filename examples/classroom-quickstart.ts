import { Eduskit } from '../src/index.js';

const sdk = new Eduskit({
  client: {
    baseUrl: process.env.EDU_SERVER_API_BASE_URL ?? 'http://localhost:3112',
    appId: process.env.EDU_APP_ID ?? 'app_dev',
    appKey: process.env.EDU_APP_KEY ?? 'dev_app_key',
    appSecret: process.env.EDU_APP_SECRET ?? 'dev_app_secret',
  },
});

const user = await sdk.client.users.register({
  originId: 'stu_001',
  nickname: '小明',
  avatar: 'https://example.com/a.png',
});

const token = await sdk.client.auth.issueToken({
  eduUserId: user.eduUserId,
  originId: 'stu_001',
});

const startsAt = new Date(Date.now() + 15 * 60 * 1000).toISOString();
const endsAt = new Date(Date.now() + 75 * 60 * 1000).toISOString();
const classroom = await sdk.client.classrooms.create({
  name: '一年级数学',
  startsAt,
  endsAt,
  teacherEduUserId: user.eduUserId,
});

console.log({
  eduUserId: user.eduUserId,
  accessToken: token.accessToken,
  classroomId: classroom.classroomId,
});
