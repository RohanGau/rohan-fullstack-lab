/**
 * Permission enforcement across Content, Inbox, Diagnostics, and Agent routes
 * over HTTP against the real Express app and in-memory MongoDB.
 */
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import request from 'supertest';
import { PERMISSIONS } from '@fullstack-lab/constants';
import { buildTestApp } from './helpers/app';
import { clearTestDb, startTestDb, stopTestDb } from './helpers/db';
import { accessTokenFor, bearer, createOperator, operatorWithToken } from './helpers/operators';
import Operator from '../src/models/Operator';
import Role from '../src/models/Role';
import { bootstrapAccessControl } from '../src/services/accessControlBootstrap';

const app = buildTestApp();
const API = '/api/v1';
const MISSING_ID = '000000000000000000000000';

beforeAll(async () => {
  await startTestDb();
}, 60000);

beforeEach(async () => {
  await clearTestDb();
  await bootstrapAccessControl();
});

afterAll(async () => {
  await stopTestDb();
});

describe('Content & Inbox route permissions', () => {
  it('refuses unauthenticated requests with 401 and static ADMIN_TOKEN with 403', async () => {
    const legacy = bearer(process.env.ADMIN_TOKEN as string);

    expect((await request(app).post(`${API}/blogs`).send({})).status).toBe(401);
    expect((await request(app).get(`${API}/contact`)).status).toBe(401);
    expect((await request(app).get(`${API}/slots`)).status).toBe(401);
    expect((await request(app).get('/health/sentry-test')).status).toBe(401);

    expect((await request(app).post(`${API}/blogs`).set(legacy).send({})).status).toBe(403);
    expect((await request(app).get(`${API}/contact`).set(legacy)).status).toBe(403);
    expect((await request(app).get(`${API}/slots`).set(legacy)).status).toBe(403);
    expect((await request(app).get('/health/sentry-test').set(legacy)).status).toBe(403);
  });

  it('enforces blog, project, profile, and upload permissions per role', async () => {
    const { token: contentToken } = await operatorWithToken('content@example.com', [
      'content_manager',
    ]);
    const { token: viewerToken } = await operatorWithToken('viewer@example.com', ['viewer']);
    const { token: inboxToken } = await operatorWithToken('inbox@example.com', ['inbox_manager']);

    // Viewer and Inbox Manager are denied all CMS/upload writes (403)
    for (const deniedToken of [viewerToken, inboxToken]) {
      expect(
        (await request(app).post(`${API}/blogs`).set(bearer(deniedToken)).send({})).status
      ).toBe(403);
      expect(
        (await request(app).put(`${API}/blogs/${MISSING_ID}`).set(bearer(deniedToken)).send({}))
          .status
      ).toBe(403);
      expect(
        (await request(app).delete(`${API}/blogs/${MISSING_ID}`).set(bearer(deniedToken))).status
      ).toBe(403);

      expect(
        (await request(app).post(`${API}/projects`).set(bearer(deniedToken)).send({})).status
      ).toBe(403);
      expect(
        (await request(app).put(`${API}/projects/${MISSING_ID}`).set(bearer(deniedToken)).send({}))
          .status
      ).toBe(403);
      expect(
        (await request(app).delete(`${API}/projects/${MISSING_ID}`).set(bearer(deniedToken))).status
      ).toBe(403);

      expect(
        (await request(app).post(`${API}/profiles`).set(bearer(deniedToken)).send({})).status
      ).toBe(403);
      expect(
        (await request(app).put(`${API}/profiles/${MISSING_ID}`).set(bearer(deniedToken)).send({}))
          .status
      ).toBe(403);
      expect(
        (await request(app).delete(`${API}/profiles/${MISSING_ID}`).set(bearer(deniedToken))).status
      ).toBe(403);

      expect(
        (
          await request(app)
            .post(`${API}/uploads/generate-upload-url`)
            .set(bearer(deniedToken))
            .send({})
        ).status
      ).toBe(403);
      expect(
        (await request(app).delete(`${API}/uploads`).set(bearer(deniedToken)).send({})).status
      ).toBe(403);
    }

    // Content Manager passes permission checks and reaches controller/validation (not 401/403)
    const blogRes = await request(app).post(`${API}/blogs`).set(bearer(contentToken)).send({
      title: 'Permitted Blog Post',
      content: 'This blog body has sufficient length for validation.',
      author: 'Content Manager',
    });
    expect(blogRes.status).toBe(201);

    expect(
      (await request(app).delete(`${API}/blogs/${blogRes.body.id}`).set(bearer(contentToken)))
        .status
    ).toBe(204);
    expect(
      (await request(app).post(`${API}/projects`).set(bearer(contentToken)).send({})).status
    ).toBe(400);
    expect(
      (await request(app).post(`${API}/profiles`).set(bearer(contentToken)).send({})).status
    ).toBe(400);
    expect(
      (
        await request(app)
          .post(`${API}/uploads/generate-upload-url`)
          .set(bearer(contentToken))
          .send({})
      ).status
    ).toBe(400);
  });

  it('enforces contact, slot, and diagnostics permissions per role', async () => {
    const { token: contentToken } = await operatorWithToken('content@example.com', [
      'content_manager',
    ]);
    const { token: viewerToken } = await operatorWithToken('viewer@example.com', ['viewer']);
    const { token: inboxToken } = await operatorWithToken('inbox@example.com', ['inbox_manager']);
    const { token: adminToken } = await operatorWithToken('admin@example.com', ['admin']);

    // Content Manager is refused on inbox and diagnostics routes
    expect((await request(app).get(`${API}/contact`).set(bearer(contentToken))).status).toBe(403);
    expect((await request(app).get(`${API}/slots`).set(bearer(contentToken))).status).toBe(403);
    expect((await request(app).get('/health/sentry-test').set(bearer(contentToken))).status).toBe(
      403
    );

    // Viewer can read contacts and slots, but cannot mutate or delete them
    expect((await request(app).get(`${API}/contact`).set(bearer(viewerToken))).status).toBe(200);
    expect((await request(app).get(`${API}/slots`).set(bearer(viewerToken))).status).toBe(200);
    expect(
      (await request(app).delete(`${API}/contact/${MISSING_ID}`).set(bearer(viewerToken))).status
    ).toBe(403);
    expect(
      (await request(app).put(`${API}/slots/${MISSING_ID}`).set(bearer(viewerToken)).send({}))
        .status
    ).toBe(403);
    expect(
      (await request(app).delete(`${API}/slots/${MISSING_ID}`).set(bearer(viewerToken))).status
    ).toBe(403);

    // Inbox Manager can access contact & slot mutations (reaches 400/404, not 403), but not diagnostics
    expect(
      (await request(app).delete(`${API}/contact/${MISSING_ID}`).set(bearer(inboxToken))).status
    ).toBe(404);
    expect(
      (await request(app).delete(`${API}/slots/${MISSING_ID}`).set(bearer(inboxToken))).status
    ).toBe(404);
    expect((await request(app).get('/health/sentry-test').set(bearer(inboxToken))).status).toBe(
      403
    );

    // Admin holds diagnostics:run
    expect(
      (await request(app).get('/health/sentry-test?type=message').set(bearer(adminToken))).status
    ).toBe(200);
  });

  it('refuses a deactivated Operator immediately even with an unexpired token', async () => {
    const op = await createOperator('temp-content@example.com', ['content_manager']);
    const token = await accessTokenFor(op);

    expect((await request(app).post(`${API}/blogs`).set(bearer(token)).send({})).status).toBe(400);

    await Operator.updateOne({ _id: op.id }, { active: false });

    expect((await request(app).post(`${API}/blogs`).set(bearer(token)).send({})).status).toBe(403);
  });
});

describe('Agent gateway permissions', () => {
  it('enforces agent:use plus per-tool permissions and binds confirmation tokens to the actor', async () => {
    await Role.create({
      name: 'agent_creator',
      permissions: [PERMISSIONS.AGENT_USE, PERMISSIONS.BLOG_CREATE],
    });
    const { token: viewerToken } = await operatorWithToken('viewer@example.com', ['viewer']);
    const { token: creatorToken } = await operatorWithToken('creator@example.com', [
      'agent_creator',
    ]);
    const { token: adminToken } = await operatorWithToken('admin@example.com', ['admin']);
    const { token: secondAdminToken } = await operatorWithToken('admin2@example.com', ['admin']);

    // Viewer lacks agent:use -> 403
    const deniedGateway = await request(app)
      .post(`${API}/agent/chat`)
      .set(bearer(viewerToken))
      .send({ toolName: 'blogs_list_recent' });
    expect(deniedGateway.status).toBe(403);

    // Agent creator holds agent:use + blog:create -> allowed for blogs_create_draft, refused for blogs_update_draft
    const createDryRun = await request(app)
      .post(`${API}/agent/chat`)
      .set(bearer(creatorToken))
      .send({
        toolName: 'blogs_create_draft',
        dryRun: true,
        toolInput: {
          title: 'Agent Blog Post',
          content: 'Sufficiently long agent blog content here.',
          author: 'Agent',
        },
      });
    expect(createDryRun.status).toBe(200);

    const updateDenied = await request(app)
      .post(`${API}/agent/chat`)
      .set(bearer(creatorToken))
      .send({
        toolName: 'blogs_update_draft',
        toolInput: { id: MISSING_ID, title: 'Updated' },
      });
    expect(updateDenied.status).toBe(403);

    // Confirmation token cannot be confirmed by another Operator
    const pending = await request(app)
      .post(`${API}/agent/chat`)
      .set(bearer(adminToken))
      .send({
        toolName: 'blogs_delete_draft',
        toolInput: { id: MISSING_ID },
      });
    expect(pending.status).toBe(202);

    const crossConfirm = await request(app)
      .post(`${API}/agent/confirm`)
      .set(bearer(secondAdminToken))
      .send({ intentId: pending.body.confirmation.intentId });
    expect(crossConfirm.status).toBe(403);
  });
});
