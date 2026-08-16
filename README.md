# KARSIR-UMKM

![License](https://img.shields.io/github/license/sannnproject/KARSIR-UMKM?style=flat-square)
![Top Language](https://img.shields.io/github/languages/top/sannnproject/KARSIR-UMKM?style=flat-square)
![Last Commit](https://img.shields.io/github/last-commit/sannnproject/KARSIR-UMKM?style=flat-square)
![Stars](https://img.shields.io/github/stars/sannnproject/KARSIR-UMKM?style=flat-square)
![Open Issues](https://img.shields.io/github/issues/sannnproject/KARSIR-UMKM?style=flat-square)

Modern all‑in‑one POS untuk UMKM Indonesia — cashier, inventory, sales, customers, reports, loyalty & multi‑outlet. Dibangun dengan Next.js + TypeScript + Tailwind CSS + Prisma.

---

Daftar isi
- [Deskripsi Singkat](#deskripsi-singkat)
- [Fitur Utama](#fitur-utama)
- [Stack Teknis](#stack-teknis)
- [Arsitektur & Cara Kerja](#arsitektur--cara-kerja)
- [Persiapan Lingkungan Pengembangan](#persiapan-lingkungan-pengembangan)
- [Variabel Lingkungan (ENV)](#variabel-lingkungan-env)
- [Database & Prisma](#database--prisma)
- [Menjalankan Aplikasi (Dev / Prod)](#menjalankan-aplikasi-dev--prod)
- [Deployment (Saran)](#deployment-saran)
- [Testing & Quality (Panduan umum)](#testing--quality-panduan-umum)
- [Contributing](#contributing)
- [Keamanan](#keamanan)
- [License](#license)

Deskripsi singkat
-----------------
KARSIR-UMKM adalah aplikasi Point‑Of‑Sale (POS) modern yang menargetkan usaha mikro, kecil, dan menengah di Indonesia. Aplikasi ini menyediakan modul kasir, manajemen inventori, pencatatan penjualan, data pelanggan, laporan dan fitur loyalty serta dukungan multi-outlet. Fokus implementasi menggunakan teknologi web modern: Next.js untuk UI dan API, TypeScript untuk tipe, Tailwind CSS untuk styling utility-first, dan Prisma sebagai ORM/alat migrasi database.

Fitur utama
-----------
- Kasir (checkout cepat, scanning barcode / input manual)
- Manajemen inventori (barang, stok, varian)
- Pencatatan transaksi penjualan (riwayat, filter)
- Pelanggan & loyalty (data pelanggan, sistem poin/loyalty — jika diaktifkan)
- Laporan (laporan penjualan, laporan stok, ringkasan outlet)
- Multi‑outlet (kelola beberapa cabang/outlet dari satu akun administratif)
- API internal menggunakan Next.js API routes (server-side) yang berinteraksi dengan Prisma

Stack teknis
------------
- Next.js — framework React untuk UI, SSR/SSG dan API routes
- TypeScript — bahasa utama kode (strongly-typed)
- Tailwind CSS — utility-first styling
- Prisma — Type‑safe ORM, schema-driven migrations & query builder
- Node.js — runtime untuk Next.js
- Database (pilihan) — Prisma mendukung beberapa provider (PostgreSQL, MySQL, SQLite, dll). Anda harus menyediakan DATABASE_URL yang sesuai. (Contoh connection string PostgreSQL disediakan di bagian Database)

Arsitektur & cara kerja
-----------------------
1. Frontend & UI
   - Dibangun dengan Next.js + TypeScript.
   - Halaman dapat dibuat dengan rendering sisi server (SSR), static (SSG) atau client-side sesuai kebutuhan fitur kasir/real-time.
   - Styling menggunakan Tailwind CSS, sehingga komponen dibangun dengan utilitas kelas.

2. Backend (Serverless/API routes)
   - Endpoint server internal umumnya disediakan lewat Next.js API routes atau App Router server handlers (tergantung struktur repo).
   - Logika bisnis (transaksi, pengurangan stok, laporan agregasi) dijalankan di server dan berinteraksi dengan Prisma untuk akses database.

3. Persistence
   - Prisma mengelola models (schema) dan migrasi. Aplikasi membaca/menulis data transaksi, item inventori, pelanggan, outlet, dsb. secara terstruktur melalui Prisma Client yang di-generate dari prisma/schema.prisma.

4. Keamanan & konsistensi data
   - Operasi kritikal (update stok, create transaksi) harus dijalankan di server untuk menjaga konsistensi dan menghindari manipulasi client-side.
   - Gunakan transaksi database (Prisma transaction) untuk operasi multi-step (mis. create transaction + update stock) agar atomic.

Persiapan lingkungan pengembangan
--------------------------------
Prasyarat:
- Node.js (direkomendasikan LTS terbaru, mis. 18+ atau 20+)
- Package manager (npm, pnpm, atau yarn — gunakan yang sesuai dengan proyek)
- Database untuk pengembangan (mis. PostgreSQL / MySQL / SQLite). Prisma mendukung beberapa provider — cukup atur DATABASE_URL.

Langkah umum:
1. Clone repo
   - git clone https://github.com/sannnproject/KARSIR-UMKM.git
   - cd KARSIR-UMKM

2. Install dependensi
   - npm install
   - atau yarn install
   - atau pnpm install

3. Siapkan environment variables (lihat bagian selanjutnya)

Variabel lingkungan (ENV)
-------------------------
Minimum yang umum diperlukan (nama variabel disesuaikan dengan implementasi sebenarnya di repo; cek file .env.example di repo jika tersedia):
- DATABASE_URL — connection string untuk database, contoh PostgreSQL:
  postgres://username:password@localhost:5432/karsir_umkm
- NEXT_PUBLIC_BASE_URL — (opsional) URL publik frontend, dipakai untuk absolute links di client
- APP_SECRET / NEXTAUTH_SECRET — (jika ada autentikasi) secret untuk session/auth (jika repo menggunakan NextAuth atau mekanisme serupa)

Catatan: Nama variabel sebenarnya akan tergantung pada implementasi di kode (process.env.NAMA_VAR). Pastikan cocok dengan yang digunakan di kode.

Database & Prisma
-----------------
Prisma bertindak sebagai ORM dan alat migrasi. Berikut urutan tugas Prisma yang umum:

1. Generate Prisma Client
   - npx prisma generate
   - (atau: pnpm prisma generate / yarn prisma generate)

2. Membuat/menjalankan migrasi (development)
   - npx prisma migrate dev --name init
     - Perintah ini membuat/menerapkan migrasi dan menghasilkan Prisma Client
   - Untuk menjalankan migrasi di production:
     - npx prisma migrate deploy

3. Menjalankan query dari kode
   - Di server (API routes / server handlers) impor Prisma Client dan gunakan untuk CRUD:
     - prisma.user.findMany(...)
     - prisma.transaction.create({...})

4. Seed (opsional)
   - Jika repo menyediakan script seed, jalankan:
     - node prisma/seed.js
     - atau npm run prisma:seed (cek package.json)

Catatan mengenai provider DB:
- Jika Anda memilih PostgreSQL, set DATABASE_URL seperti: postgres://user:pass@host:5432/dbname
- Jika memilih SQLite untuk development cepat, set DATABASE_URL=file:./dev.db
- Prisma schema menentukan provider di file prisma/schema.prisma (lihat file tersebut di repo).

Contoh Docker Compose (opsional — contoh Postgres)
- Ini hanya contoh membantu untuk dev; bukan bagian wajib:
  - services:
    - db: image: postgres:15; environment: POSTGRES_USER/POSTGRES_PASSWORD/POSTGRES_DB
    - app: build: .; environment: DATABASE_URL=postgres://user:pass@db:5432/dbname
  - Jalankan: docker compose up -d
  - Setelah db siap: npx prisma migrate deploy atau npx prisma migrate dev

Menjalankan aplikasi (Dev / Prod)
---------------------------------
Perintah standar Next.js / Node.js yang biasanya tersedia:

- Development:
  - npm run dev
  - Menjalankan server dev Next.js (hot-reload)

- Build untuk production:
  - npm run build
  - npm run start
  - Atau: npm run start:prod (tergantung skrip di package.json)

- Prisma:
  - npx prisma generate
  - npx prisma migrate dev --name <name>
  - npx prisma migrate deploy

Pastikan environment variables ter-set sebelum menjalankan build/start.

Deployment (Saran)
------------------
- Vercel: Next.js bekerja sangat baik di Vercel (support SSR, ISR, serverless functions). Set environment variables di UI Vercel.
- Platform lain: Gunakan Node server (Next.js start) atau containerize aplikasi. Pastikan Prisma dapat terhubung ke DB production dan jalankan migrasi (npx prisma migrate deploy) sebagai bagian dari pipeline.
- Backup DB & migrasi: Selalu uji migrasi di staging sebelum mem-push ke production.

Testing & Quality (Panduan umum)
-------------------------------
- Tambahkan unit/integration tests untuk logic sensitif (penanganan transaksi, update stok).
- Gunakan linting (ESLint) dan formatting (Prettier) bila diinginkan untuk menjaga konsistensi. Jika repo sudah menyertakan konfigurasi ESLint/Prettier, jalankan skrip yang ada di package.json (`npm run lint`, `npm run format`).

Contributing
------------
1. Baca CONTRIBUTING.md jika tersedia.
2. Fork → branch fitur (`feat/<singkat-deskripsi>`) atau perbaikan (`fix/<singkat-deskripsi>`).
3. Sertakan deskripsi perubahan dan test bila relevan.
4. Gunakan commit message yang jelas (mis: feat: tambah modul laporan outlet).
5. Buat Pull Request ke branch utama (mis. main atau develop) repo upstream.

Keamanan
--------
- Jangan menyimpan secrets (password, API keys) dalam repo. Gunakan environment variables.
- Lakukan validasi dan sanitize input pada API routes untuk mencegah injeksi / over-posting.
- Untuk operasi finansial/transaksi, gunakan mekanisme transaksi DB (Prisma transaction) untuk atomicity.

FAQ singkat
-----------
Q: Database apa yang wajib dipakai?
A: Tidak ada DB "wajib" — Prisma mendukung PostgreSQL, MySQL, SQLite, dsb. Pilih yang sesuai kebutuhan. Untuk production skala UMKM dengan multi-outlet, PostgreSQL sering direkomendasikan.

Q: Apakah ada integrasi pembayaran / hardware kasir?
A: README ini tidak menambahkan integrasi spesifik. Jika proyek memerlukan integrasi hardware (printer, barcode scanner) atau gateway pembayaran, implementasi dan konfigurasi tambahan diperlukan di level server/client.

License
-------
Proyek ini dilisensikan di bawah Apache License 2.0.

Lihat juga: LICENSE file di repo untuk teks lengkap lisensi Apache‑2.0.
