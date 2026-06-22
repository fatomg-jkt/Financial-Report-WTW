import test from 'node:test';
import assert from 'node:assert/strict';
import { createApiSignature, createAccurateHeaders, AccurateClient } from '../src/accurate/client.js';

test('creates Accurate HMAC SHA-256 signature as base64', () => {
  assert.equal(createApiSignature('02/11/2023 09:01:01', '31d49b3dc632614495ff8071e5be44a1'), '8NxvylwwMcjGyzVXK0qbwNvFFuzHpwE9tECllVwLkbo=');
});

test('creates required Accurate API token headers', () => {
  assert.deepEqual(createAccurateHeaders({ apiToken: 'token', signatureSecret: 'secret', timestamp: '1698903037' }), {
    Authorization: 'Bearer token',
    'X-Api-Timestamp': '1698903037',
    'X-Api-Signature': createApiSignature('1698903037', 'secret'),
  });
});

test('requests API token info with only token and signature secret', async () => {
  const calls = [];
  const client = new AccurateClient({
    apiToken: 'token',
    signatureSecret: 'secret',
    fetchImpl: async (url, options) => {
      calls.push({ url: String(url), options });
      return new Response(JSON.stringify({ s: true, d: { host: 'https://public.accurate.id' } }), { status: 200 });
    },
  });

  const data = await client.getApiTokenInfo();
  assert.equal(data.d.host, 'https://public.accurate.id');
  assert.equal(calls[0].url, 'https://account.accurate.id/api/api-token.do');
  assert.equal(calls[0].options.headers.Authorization, 'Bearer token');
});
