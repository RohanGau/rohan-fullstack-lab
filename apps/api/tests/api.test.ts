/**
 * Public API behaviour, exercised through the real createApp() middleware stack
 * against an in-memory MongoDB. Assertions are exact: no status-code ranges.
 */
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import request from 'supertest';
import { buildTestApp } from './helpers/app';
import { startTestDb, stopTestDb } from './helpers/db';
import Blog from '../src/models/Blog';

const app = buildTestApp();
const API = '/api/v1';
const MISSING_ID = '000000000000000000000000';

const blogSeed = (n: number, status: 'draft' | 'published') => ({
  title: `Post number ${n}`,
  slug: `post-${n}`,
  content: 'Some sufficiently long content body',
  author: 'Rohan',
  status,
});

beforeAll(async () => {
  await startTestDb();
  await Blog.insertMany([blogSeed(1, 'published'), blogSeed(2, 'published'), blogSeed(3, 'draft')]);
}, 60000);

afterAll(async () => {
  await stopTestDb();
});

describe('Root endpoint', () => {
  it('GET / returns status ok', async () => {
    const res = await request(app).get('/').expect('Content-Type', /json/);
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('status', 'ok');
  });
});

describe('Blog endpoints', () => {
  it('GET /blogs returns the seeded posts with a total count header', async () => {
    const res = await request(app).get(`${API}/blogs`);
    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(3);
    expect(res.headers['x-total-count']).toBe('3');
  });

  it('GET /blogs honours the range pagination parameter', async () => {
    const res = await request(app)
      .get(`${API}/blogs`)
      .query({ range: JSON.stringify([0, 1]) });
    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(2);
    expect(res.headers['x-total-count']).toBe('3');
  });

  it('GET /blogs filters by status', async () => {
    const res = await request(app)
      .get(`${API}/blogs`)
      .query({ filter: JSON.stringify({ status: 'published' }) });
    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(2);
    expect(res.body.every((b: { status: string }) => b.status === 'published')).toBe(true);
  });

  it('GET /blogs/:id returns 404 for a well-formed unknown id', async () => {
    const res = await request(app).get(`${API}/blogs/${MISSING_ID}`);
    expect(res.status).toBe(404);
  });

  it('GET /blogs/:id returns 404 for a malformed id', async () => {
    const res = await request(app).get(`${API}/blogs/invalid-id`);
    expect(res.status).toBe(404);
  });
});

describe('Project and profile endpoints', () => {
  it('GET /projects returns an empty array on an empty collection', async () => {
    const res = await request(app).get(`${API}/projects`).expect('Content-Type', /json/);
    expect(res.status).toBe(200);
    expect(res.body).toEqual([]);
  });

  it('GET /profiles returns an empty array on an empty collection', async () => {
    const res = await request(app).get(`${API}/profiles`).expect('Content-Type', /json/);
    expect(res.status).toBe(200);
    expect(res.body).toEqual([]);
  });
});

describe('Contact endpoint', () => {
  it('rejects an empty body because the captcha token is missing', async () => {
    const res = await request(app).post(`${API}/contact`).send({});
    expect(res.status).toBe(400);
    expect(res.body).toEqual({ msg: 'Captcha missing' });
  });

  it('rejects a submission without a captcha token even when the email is invalid', async () => {
    const res = await request(app)
      .post(`${API}/contact`)
      .send({ name: 'Test User', email: 'invalid-email', message: 'Test message' });
    expect(res.status).toBe(400);
    expect(res.body).toEqual({ msg: 'Captcha missing' });
  });
});

describe('Error handling', () => {
  it('returns 404 for unknown routes', async () => {
    const res = await request(app).get(`${API}/unknown-route`);
    expect(res.status).toBe(404);
  });

  it('returns 400 for malformed JSON', async () => {
    const res = await request(app)
      .post(`${API}/contact`)
      .set('Content-Type', 'application/json')
      .send('{ invalid json }');
    expect(res.status).toBe(400);
  });
});

describe('Security headers', () => {
  it('sets nosniff via helmet', async () => {
    const res = await request(app).get('/');
    expect(res.headers['x-content-type-options']).toBe('nosniff');
  });

  it('echoes a request id on every response', async () => {
    const res = await request(app).get('/').set('X-Request-Id', 'req-abc-123');
    expect(res.headers['x-request-id']).toBe('req-abc-123');
  });
});
