# Financial Report WTW

Integrasi awal Accurate Online API Token. Anda hanya perlu memasukkan API Token dan Signature Secret, lalu aplikasi akan membuat header `Authorization`, `X-Api-Timestamp`, dan `X-Api-Signature` secara otomatis.

## Konfigurasi Environment Variable

Aplikasi membaca kredensial Accurate dari runtime environment:

```env
ACCURATE_API_TOKEN=isi_api_token_anda
ACCURATE_SIGNATURE_SECRET=isi_signature_secret_anda
# Opsional: default https://account.accurate.id
ACCURATE_BASE_URL=
```

> Jangan pernah commit file `.env`, API token, atau signature secret ke repository. Jangan hardcode kredensial di kode, test, README, atau log aplikasi.

### Local development

Untuk pengembangan lokal, Anda bisa memakai file `.env` di root project. File ini hanya dibaca saat local development dan tidak menimpa environment variable yang sudah dipasang di shell/runtime.

```bash
cp .env.example .env
```

Isi `.env` dengan kredensial Accurate Anda:

```env
ACCURATE_API_TOKEN=isi_api_token_anda
ACCURATE_SIGNATURE_SECRET=isi_signature_secret_anda
ACCURATE_BASE_URL=https://account.accurate.id
```

Alternatif tanpa `.env`, export variable di shell sebelum menjalankan CLI:

```bash
export ACCURATE_API_TOKEN="isi_api_token_anda"
export ACCURATE_SIGNATURE_SECRET="isi_signature_secret_anda"
npm run accurate:info
```

Atau pasang inline untuk satu kali eksekusi:

```bash
ACCURATE_API_TOKEN="isi_api_token_anda" ACCURATE_SIGNATURE_SECRET="isi_signature_secret_anda" npm run accurate:info
```

### Cloud deployment

Untuk deployment cloud, pasang variable melalui fitur secret/environment variable provider Anda, bukan melalui file `.env` yang dicommit. Contoh lokasi konfigurasi umum:

- **Vercel**: Project Settings → Environment Variables.
- **Netlify**: Site configuration → Environment variables.
- **Render**: Service → Environment → Environment Variables atau Secret Files.
- **Railway/Fly.io/Heroku**: menu Variables/Secrets/Config Vars sesuai provider.
- **Docker/Kubernetes**: inject melalui `--env`, `env_file` lokal yang tidak dicommit, Secret, atau ConfigMap/Secret manager.

Pastikan variable berikut tersedia di runtime service yang menjalankan aplikasi/CLI:

- `ACCURATE_API_TOKEN`
- `ACCURATE_SIGNATURE_SECRET`
- `ACCURATE_BASE_URL` bila ingin memakai base URL selain default `https://account.accurate.id`

## Cek koneksi Accurate

Jalankan:

```bash
npm run accurate:info
```

Perintah tersebut membaca `ACCURATE_API_TOKEN` dan `ACCURATE_SIGNATURE_SECRET` dari runtime environment atau file `.env` lokal, memanggil endpoint info API Token Accurate, lalu menampilkan respons JSON. Nilai `host` dari respons dapat dipakai sebagai base URL API Accurate untuk data usaha.

Jika perintah gagal dengan pesan bahwa API Token atau Signature Secret wajib diisi, pasang secret di shell lokal, file `.env` lokal, atau environment variable deployment provider. Jangan menampilkan atau menyimpan full token/secret di log dan jangan commit kredensial ke repository.

## Penggunaan di kode

```js
import { AccurateClient } from './src/accurate/client.js';

const accurate = new AccurateClient({
  apiToken: process.env.ACCURATE_API_TOKEN,
  signatureSecret: process.env.ACCURATE_SIGNATURE_SECRET,
});

const info = await accurate.getApiTokenInfo();
console.log(info);
```
