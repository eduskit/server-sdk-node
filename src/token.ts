import { createHmac } from 'node:crypto';
import { EduskitError, type EduskitSource } from './errors.js';

export const EDU_TOKEN_ISSUER = 'eduskit-edu-auth';
export const EDU_TOKEN_AUDIENCE = 'eduskit-edu';
export const ROOM_TOKEN_ISSUER = 'eduskit';
export const ROOM_TOKEN_AUDIENCE = 'eduskit-room';

export type LocalTokenSigner = {
  appId: string;
  appSecret: string;
  source: EduskitSource;
};

export function signHs256(
  signer: LocalTokenSigner,
  claims: Record<string, unknown>,
  options: { issuer: string; audience: string; subject: string; expiresIn: number },
): { token: string; issuedAt: number; expiresAt: number } {
  requireText(signer.appId, 'appId', signer.source);
  requireText(signer.appSecret, 'appSecret', signer.source);
  requireText(options.subject, 'subject', signer.source);
  if (!Number.isInteger(options.expiresIn) || options.expiresIn < 60 || options.expiresIn > 604_800) {
    throw sdkTokenError('expiresIn must be an integer between 60 and 604800', signer.source);
  }
  const issuedAt = Math.floor(Date.now() / 1000);
  const expiresAt = issuedAt + options.expiresIn;
  const header = encode({ alg: 'HS256', typ: 'JWT' });
  const payload = encode({
    ...claims,
    iss: options.issuer,
    aud: options.audience,
    sub: options.subject,
    iat: issuedAt,
    exp: expiresAt,
  });
  const content = `${header}.${payload}`;
  const signature = createHmac('sha256', signer.appSecret)
    .update(content)
    .digest('base64url');
  return { token: `${content}.${signature}`, issuedAt, expiresAt };
}

export function requireText(value: unknown, field: string, source: EduskitSource): string {
  if (typeof value !== 'string' || value.trim().length === 0) {
    throw sdkTokenError(`${field} is required`, source);
  }
  return value;
}

export function sdkTokenError(message: string, source: EduskitSource): EduskitError {
  return new EduskitError({ message, errorCode: 'SDK_TOKEN_INPUT_INVALID', source });
}

function encode(value: unknown): string {
  return Buffer.from(JSON.stringify(value), 'utf8').toString('base64url');
}
