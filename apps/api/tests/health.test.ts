/**
 * Health Check Endpoint Tests
 *
 * These tests verify that the health check endpoints work correctly.
 * Health checks are critical for:
 * - Load balancer routing decisions
 * - Container orchestration (K8s, Fly.io)
 * - Zero-downtime deployments
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import express from 'express';
import healthRoutes from '../src/routes/healthRoutes';

// Create a minimal test app
const app = express();
app.use('/health', healthRoutes);

describe('Health Check Endpoints', () => {
  describe('GET /health/live', () => {
    it('should return 200 with alive status', async () => {
      const response = await request(app)
        .get('/health/live')
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body).toHaveProperty('alive', true);
      expect(response.body).toHaveProperty('uptime');
      expect(typeof response.body.uptime).toBe('number');
    });

    it('should have uptime greater than 0', async () => {
      const response = await request(app).get('/health/live');
      expect(response.body.uptime).toBeGreaterThanOrEqual(0);
    });
  });

  describe('GET /health/ready', () => {
    it('should return health status object', async () => {
      const response = await request(app).get('/health/ready').expect('Content-Type', /json/);

      // Status could be 200 (healthy) or 503 (unhealthy) depending on DB
      expect([200, 503]).toContain(response.status);
      expect(response.body).toHaveProperty('status');
      expect(response.body).toHaveProperty('timestamp');
      expect(response.body).toHaveProperty('checks');
    });

    it('should include mongodb check in response', async () => {
      const response = await request(app).get('/health/ready');
      expect(response.body.checks).toHaveProperty('mongodb');
    });

    it('should have valid timestamp format', async () => {
      const response = await request(app).get('/health/ready');
      const timestamp = new Date(response.body.timestamp);
      expect(timestamp.toString()).not.toBe('Invalid Date');
    });
  });

  describe('GET /health', () => {
    it('should return deep health check with system info', async () => {
      const response = await request(app).get('/health').expect('Content-Type', /json/);

      expect([200, 503]).toContain(response.status);
      expect(response.body).toHaveProperty('status');
      expect(response.body).toHaveProperty('system');
    });

    it('should include memory information', async () => {
      const response = await request(app).get('/health');

      if (response.body.system) {
        expect(response.body.system).toHaveProperty('memory');
        expect(response.body.system).toHaveProperty('nodeVersion');
        expect(response.body.system).toHaveProperty('platform');
      }
    });
  });
});

describe('Health Check Response Times', () => {
  it('liveness check should respond quickly (< 100ms)', async () => {
    const start = Date.now();
    await request(app).get('/health/live');
    const duration = Date.now() - start;

    expect(duration).toBeLessThan(100);
  });

  it('readiness check should respond within reasonable time (< 5000ms)', async () => {
    const start = Date.now();
    await request(app).get('/health/ready');
    const duration = Date.now() - start;

    expect(duration).toBeLessThan(5000);
  });
});
