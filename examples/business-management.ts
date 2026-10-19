import { createHash } from 'node:crypto';
import { readFile, writeFile } from 'node:fs/promises';
import { basename } from 'node:path';
import { setTimeout as delay } from 'node:timers/promises';
import { ClassroomClient, type BusinessModels } from '../src/index.js';

export async function uploadPdf(c: ClassroomClient, filePath: string) {
  const bytes = await readFile(filePath);
  const contentHash = createHash('sha256').update(bytes).digest('hex');
  const originalName = basename(filePath);
  const upload = await c.coursewares.createUploadUrl({
    fileName: originalName, contentHash, contentType: 'application/pdf',
  });
  await c.uploadFile(upload.uploadUrl, bytes, upload.contentType);
  let record = await c.coursewares.create({
    fileName: originalName, originalName, format: 'pdf', sizeBytes: bytes.length,
    objectKey: upload.objectKey, sourceUrl: upload.sourceUrl, contentHash,
  });
  for (let poll = 0; poll < 120; poll++) {
    if (record.status === 'ready') return record;
    if (record.status === 'failed') throw new Error(`${record.errorCode}: ${record.errorMessage}`);
    await delay(2000);
    record = await c.coursewares.get({ coursewareId: record.coursewareId });
  }
  throw new Error(`Conversion is still pending: ${record.coursewareId}`);
}

export async function createClassroomWithCourseware(
  c: ClassroomClient, teacherEduUserId: string,
  studentEduUserIds: string[], coursewareId: string,
) {
  const classroom = await c.classrooms.create({
    name: 'SDK classroom', teacherEduUserId,
    startsAt: new Date(Date.now() + 30 * 60_000).toISOString(),
    durationMinutes: 60, classroomType: 'realtime',
    joinPolicy: 'invite_only', coursewareIds: [coursewareId],
  });
  await c.classrooms.members.replaceStudents(classroom.classroomId, { eduUserIds: studentEduUserIds });
  const codes = await c.classrooms.entryCode.issue(classroom.classroomId, {
    role: 'student', maxClaims: 1, count: 1,
  });
  return { classroom, codes };
}

export async function listAllClassrooms(c: ClassroomClient) {
  const records: BusinessModels.ClassroomRecord[] = [];
  for (let page = 1; ; page++) {
    const result = await c.classrooms.list({ page, pageSize: 100 });
    records.push(...result.items);
    if (!result.items.length || records.length >= result.total) return records;
  }
}

export async function exportEntryTrace(
  c: ClassroomClient, classroomId: string,
  eduUserId: string, attemptId: string, outputPath: string,
) {
  const input = { classroomId, eduUserId, attemptId, pageSize: 100, sessionsPageSize: 50 };
  const trace = await c.classrooms.getEnteredUserTrace(input);
  const events = [...trace.events];
  const sessions = [...trace.sessions];
  let eventPage = trace.eventPage;
  let sessionsPage = trace.sessionsPage;
  const seenEvents = new Set<string>();
  const seenSessions = new Set<string>();
  while (eventPage.hasMore) {
    const cursor = eventPage.nextCursor;
    if (!cursor || seenEvents.has(cursor)) throw new Error('Invalid event pagination cursor');
    seenEvents.add(cursor);
    const next = await c.classrooms.getEnteredUserTrace({ ...input, cursor, sessionsPageSize: 1 });
    events.push(...next.events);
    eventPage = next.eventPage;
  }
  while (sessionsPage.hasMore) {
    const cursor = sessionsPage.nextCursor;
    if (!cursor || seenSessions.has(cursor)) throw new Error('Invalid session pagination cursor');
    seenSessions.add(cursor);
    const next = await c.classrooms.getEnteredUserTrace({ ...input, sessionsCursor: cursor, pageSize: 1 });
    sessions.push(...next.sessions);
    sessionsPage = next.sessionsPage;
  }
  const uniqueEvents = [...new Map(events.map(e => [e.eventId || `${e.attemptId}:${e.connectionId}:${e.connectionEpoch}:${e.sequence}:${e.occurredAt}:${e.eventName}`, e])).values()];
  const uniqueSessions = [...new Map(sessions.map(s => [s.attemptId, s])).values()];
  await writeFile(outputPath, JSON.stringify({ ...trace, events: uniqueEvents, sessions: uniqueSessions, eventPage, sessionsPage }, null, 2));
}
