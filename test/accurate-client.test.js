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

async function withEnv(env, callback) {
  const original = { ...process.env };
  process.env = { ...original, ...env };
  try {
    return await callback();
  } finally {
    process.env = original;
  }
}

test('CLI client reads credentials from runtime environment', async () => {
  await withEnv({ ACCURATE_API_TOKEN: 'runtime-token', ACCURATE_SIGNATURE_SECRET: 'runtime-secret' }, async () => {
    const client = new AccurateClient({
      fetchImpl: async () => new Response(JSON.stringify({ s: true }), { status: 200 }),
    });

    assert.equal(client.apiToken, 'runtime-token');
    assert.equal(client.signatureSecret, 'runtime-secret');
  });
});

test('loads local .env without overriding runtime environment variables', async (t) => {
  const { mkdtemp, writeFile, rm } = await import('node:fs/promises');
  const { tmpdir } = await import('node:os');
  const { join } = await import('node:path');
  const { loadLocalEnv } = await import('../src/config/load-local-env.js');
  const cwd = await mkdtemp(join(tmpdir(), 'accurate-env-'));
  t.after(() => rm(cwd, { recursive: true, force: true }));

  await writeFile(join(cwd, '.env'), [
    'ACCURATE_API_TOKEN=local-token',
    'ACCURATE_SIGNATURE_SECRET=local-secret',
    'ACCURATE_BASE_URL=https://example.test # comment',
  ].join('\n'));

  await withEnv({ ACCURATE_API_TOKEN: 'runtime-token' }, async () => {
    delete process.env.ACCURATE_SIGNATURE_SECRET;
    delete process.env.ACCURATE_BASE_URL;

    assert.equal(loadLocalEnv({ cwd }), true);
    assert.equal(process.env.ACCURATE_API_TOKEN, 'runtime-token');
    assert.equal(process.env.ACCURATE_SIGNATURE_SECRET, 'local-secret');
    assert.equal(process.env.ACCURATE_BASE_URL, 'https://example.test');
  });
});
