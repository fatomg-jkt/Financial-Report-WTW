import crypto from 'node:crypto';

const DEFAULT_ACCOUNT_BASE_URL = 'https://account.accurate.id';

function trimTrailingSlash(value) {
  return value.replace(/\/+$/, '');
}

function ensureRequired(name, value) {
  if (!value || !String(value).trim()) {
    throw new Error(`${name} wajib diisi.`);
  }
  return String(value).trim();
}

export function createApiSignature(timestamp, signatureSecret, encoding = 'base64') {
  const secret = ensureRequired('Signature Secret', signatureSecret);
  const payload = ensureRequired('X-Api-Timestamp', timestamp);
  return crypto.createHmac('sha256', secret).update(payload).digest(encoding);
}

export function createAccurateHeaders({ apiToken, signatureSecret, timestamp = new Date().toISOString() }) {
  const token = ensureRequired('API Token', apiToken);
  return {
    Authorization: `Bearer ${token}`,
    'X-Api-Timestamp': timestamp,
    'X-Api-Signature': createApiSignature(timestamp, signatureSecret),
  };
}

export class AccurateClient {
  constructor({ apiToken = process.env.ACCURATE_API_TOKEN, signatureSecret = process.env.ACCURATE_SIGNATURE_SECRET, baseUrl = process.env.ACCURATE_BASE_URL || DEFAULT_ACCOUNT_BASE_URL, fetchImpl = globalThis.fetch } = {}) {
    this.apiToken = ensureRequired('API Token', apiToken);
    this.signatureSecret = ensureRequired('Signature Secret', signatureSecret);
    this.baseUrl = trimTrailingSlash(baseUrl);
    if (typeof fetchImpl !== 'function') throw new Error('fetch implementation tidak tersedia. Gunakan Node.js 18+ atau kirim fetchImpl.');
    this.fetch = fetchImpl;
  }

  headers(timestamp = new Date().toISOString()) {
    return createAccurateHeaders({ apiToken: this.apiToken, signatureSecret: this.signatureSecret, timestamp });
  }

  async request(path, { method = 'GET', params, body, headers = {}, timestamp } = {}) {
    const url = new URL(path, `${this.baseUrl}/`);
    if (params) Object.entries(params).forEach(([key, value]) => value !== undefined && value !== null && url.searchParams.append(key, value));
    const response = await this.fetch(url, {
      method,
      headers: { ...this.headers(timestamp), ...headers },
      body,
    });
    const text = await response.text();
    const data = text ? JSON.parse(text) : null;
    if (!response.ok || data?.s === false) {
      const message = data?.d?.message || data?.message || response.statusText || 'Request Accurate gagal.';
      throw new Error(message);
    }
    return data;
  }

  getApiTokenInfo() {
    return this.request('/api/api-token.do');
  }
}
