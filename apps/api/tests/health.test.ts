/**
 * Health endpoints through the real app, with an in-memory MongoDB connected.
 */
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import request from 'supertest';
import { buildTestApp } from './helpers/app';
import { startTestDb, stopTestDb } from './helpers/db';

const app = buildTestApp();

beforeAll(async () => {
  await startTestDb();
}, 60000);

afterAll(async () => {
  await stopTestDb();
});

describe('GET /health/live', () => {
  it('returns 200 with alive=true and a numeric uptime', async () => {
    const res = await request(app).get('/health/live').expect('Content-Type', /json/);
    expect(res.status).toBe(200);
    expect(res.body.alive).toBe(true);
    expect(res.body.uptime).toBeGreaterThanOrEqual(0);
  });
});

describe('GET /health/ready', () => {
  it('returns 200 when MongoDB is connected', async () => {
    const res = await request(app).get('/health/ready').expect('Content-Type', /json/);
    expect(res.status).toBe(200);
    expect(res.body.checks).toHaveProperty('mongodb');
    expect(new Date(res.body.timestamp).toString()).not.toBe('Invalid Date');
  });
});

describe('GET /health', () => {
  it('returns 200 with system information when healthy', async () => {
    const res = await request(app).get('/health').expect('Content-Type', /json/);
    expect(res.status).toBe(200);
    expect(res.body.system).toHaveProperty('memory');
    expect(res.body.system).toHaveProperty('nodeVersion');
    expect(res.body.system).toHaveProperty('platform');
  });
});
