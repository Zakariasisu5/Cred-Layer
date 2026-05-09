const test = require('node:test');
const assert = require('node:assert/strict');
const request = require('supertest');

const app = require('../dist/index').default;

test('GET /health returns service metadata', async () => {
  const res = await request(app).get('/health');

  assert.equal(res.status, 200);
  assert.equal(res.body.status, 'ok');
  assert.equal(res.body.project, 'CredLayer');
  assert.ok(Array.isArray(res.body.endpoints));
  assert.ok(res.body.endpoints.includes('GET  /api/reputation/:wallet'));
});

test('GET /api/reputation/:wallet validates wallet length', async () => {
  const res = await request(app).get('/api/reputation/invalid-wallet');

  assert.equal(res.status, 400);
  assert.equal(res.body.error, 'Invalid Solana wallet address');
});

test('GET /api/leaderboard returns placeholder payload', async () => {
  const res = await request(app).get('/api/leaderboard');

  assert.equal(res.status, 200);
  assert.ok(Array.isArray(res.body.leaderboard));
  assert.equal(
    res.body.message,
    'Leaderboard will be populated after Supabase integration'
  );
});

test('GET /api/openapi.json exposes OpenAPI metadata', async () => {
  const res = await request(app).get('/api/openapi.json');

  assert.equal(res.status, 200);
  assert.equal(res.body.openapi, '3.0.3');
  assert.equal(res.body.info.title, 'CredLayer API');
});
