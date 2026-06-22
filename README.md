# Financial Report WTW

Integrasi awal Accurate Online API Token. Anda hanya perlu memasukkan API Token dan Signature Secret, lalu aplikasi akan membuat header `Authorization`, `X-Api-Timestamp`, dan `X-Api-Signature` secara otomatis.

## Konfigurasi

Salin contoh environment berikut lalu isi kredensial dari Accurate:

```bash
cp .env.example .env
```

```env
ACCURATE_API_TOKEN=isi_api_token_anda
ACCURATE_SIGNATURE_SECRET=isi_signature_secret_anda
```

> Jangan commit file `.env` karena berisi kredensial rahasia.

## Cek koneksi Accurate

Jalankan:

```bash
ACCURATE_API_TOKEN=token ACCURATE_SIGNATURE_SECRET=secret npm run accurate:info
```

Perintah tersebut memanggil endpoint info API Token Accurate dan menampilkan respons JSON. Nilai `host` dari respons dapat dipakai sebagai base URL API Accurate untuk data usaha.

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
