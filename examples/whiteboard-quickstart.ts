import { Eduskit } from '../src/index.js';

const sdk = new Eduskit({
  whiteboardClient: {
    baseUrl: process.env.WB_SERVER_API_BASE_URL ?? 'http://localhost:3012',
    appKey: process.env.WB_APP_KEY ?? 'dev_app_key',
    appSecret: process.env.WB_APP_SECRET ?? 'dev_app_secret',
  },
});

const credential = await sdk.whiteboardClient.auth.issueRoomToken({
  roomId: 'room_demo',
  userId: 'teacher_1',
  role: 'host',
  expiresIn: 3600,
});

console.log({
  token: credential.token,
  expiresAt: credential.expiresAt,
});
