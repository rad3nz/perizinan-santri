# Sistem Perizinan Santri

Aplikasi manajemen perizinan (izin keluar) santri dengan alur persetujuan
berjenjang **Santri → Muaddib → Mudir**, status real-time, dan notifikasi
langsung melalui WebSocket.

## Stack

- **Backend:** Bun + [ElysiaJS](https://elysiajs.com) (REST + WebSocket), Drizzle ORM, **MariaDB** (driver `mysql2`).
- **Frontend:** React 19 + Vite + [Mantine](https://mantine.dev), TanStack Query, React Router, Zustand.
- **Tipe end-to-end:** [Eden Treaty](https://elysiajs.com/eden/overview.html) — frontend meng-`import type { App }` dari backend, jadi pemanggilan API tervalidasi saat kompilasi.
- **Monorepo:** Bun workspaces (`apps/backend`, `apps/frontend`, `packages/shared`).
- **Tooling:** Biome (lint/format), Vitest + Testing Library (frontend), `bun test` (backend).

Seluruh teks antarmuka berbahasa **Indonesia**; seluruh identifier kode berbahasa **Inggris**.

## Menjalankan dengan Docker (disarankan)

Membutuhkan Docker + Docker Compose. Satu perintah menyalakan MariaDB → backend
(migrasi + seed) → frontend.

```bash
cp .env.example .env        # lalu sesuaikan secret (mis. JWT_SECRET)
docker compose up --build   # mariadb → backend (migrate+seed) → frontend
# buka http://localhost:5173
```

- Frontend (nginx) di `http://localhost:5173`, backend (REST + WS) di `http://localhost:3000`.
- Backend menunggu MariaDB **healthy**, lalu menjalankan `db:migrate` + `db:seed` (idempoten) sebelum `start`.
- Reset data: `docker compose down -v` (menghapus volume `mariadb_data`).
- Catatan port: jika port `3306`/`3000`/`5173` host sudah dipakai (mis. MariaDB lokal), ubah `MARIADB_PORT`/`BACKEND_PORT`/`FRONTEND_PORT` di `.env`. Koneksi internal backend→DB tetap lewat jaringan compose (`mariadb:3306`).

## Menjalankan manual (fallback tanpa Docker)

Membutuhkan Bun ≥ 1.3 dan MariaDB lokal yang berjalan.

```bash
# 1. Dependencies
bun install

# 2. Database (buat user + database — perlu akses root MariaDB)
sudo mariadb -e "CREATE DATABASE IF NOT EXISTS perizinan_santri; \
  CREATE USER IF NOT EXISTS 'perizinan'@'localhost' IDENTIFIED BY 'changeme'; \
  GRANT ALL PRIVILEGES ON perizinan_santri.* TO 'perizinan'@'localhost'; FLUSH PRIVILEGES;"

# 3. Backend — buat apps/backend/.env:
#   DATABASE_URL=mysql://perizinan:changeme@localhost:3306/perizinan_santri
#   JWT_SECRET=ganti_dengan_string_acak_panjang
bun run --filter @perizinan/backend db:migrate
bun run --filter @perizinan/backend db:seed
bun run --filter @perizinan/backend dev      # http://localhost:3000

# 4. Frontend — apps/frontend/.env berisi VITE_API_URL/VITE_WS_URL
bun run --filter @perizinan/frontend dev     # http://localhost:5173
```

## Akun demo

Semua kata sandi: **`password`**.

| username | peran | kamar |
|---|---|---|
| `admin` | admin | — |
| `mudir` | mudir | — |
| `muaddib1` | muaddib | Kamar Al-Farabi (1) |
| `muaddib2` | muaddib | Kamar Al-Ghazali (2) |
| `santri1`…`santri4` | santri | Kamar Al-Farabi (1) |
| `santri5`…`santri8` | santri | Kamar Al-Ghazali (2) |
| `santri9`…`santri10` | santri | Kamar Ibnu Sina (3) |

> Kamar Ibnu Sina (3) sengaja **tanpa muaddib** untuk menguji penanganan kasus
> "tidak ada penerima notifikasi" secara wajar.

## Alur singkat

1. **Santri** mengajukan perizinan → status `menunggu_muaddib` (muaddib kamar diberi notifikasi langsung).
2. **Muaddib** menyetujui (`menunggu_mudir`, semua mudir dinotifikasi) atau menolak (wajib alasan).
3. **Mudir** menyetujui (`disetujui`) atau menolak.
4. **Santri** menekan **Berangkat** lalu **Kembali** — hanya muaddib kamar yang dinotifikasi pada tahap ini.

## Struktur repo

```
apps/backend     ElysiaJS + Drizzle + MariaDB (REST + WS, migrasi, seed)
apps/frontend    React + Vite + Mantine (SPA)
packages/shared  enum + TRANSITIONS (state machine) yang dipakai bersama
docs/            spesifikasi kanonik 00–13
docs/superpowers implementation plan + implementation-insights.md
```

Detail desain ada di [`docs/`](./docs/) (arsitektur, data model, aturan bisnis,
RBAC, API, realtime, frontend, deployment, dst.) dan catatan implementasi di
[`docs/superpowers/implementation-insights.md`](./docs/superpowers/implementation-insights.md).

## Pengujian & kualitas

```bash
bun run lint        # Biome (semua workspace)
bun run typecheck   # tsc --noEmit per workspace
bun run test        # Vitest (frontend) + bun test (backend, butuh MariaDB aktif)
```
