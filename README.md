# Booking Home Service — NG SDMS (Front-End)

Modul **Booking Home Service** (Langkah 1 & 2) untuk NG SDMS. Berisi mockup review + komponen React drop-in + prototipe API pencarian.

## Isi repo

| File | Keterangan |
|---|---|
| `mockup-booking-home-service.html` | **Mockup review (vanilla JS, 1 file).** Buka langsung di browser. Sidebar kiri **Referensi → "Binding Tabel"** berisi seluruh binding kolom + aturan validasi + daftar endpoint + query SQL. Jadi acuan utama developer. |
| `BookingHomeService.jsx` | **Komponen React** (React + Tailwind + lucide-react) — drop-in ke aplikasi. Nama field & key i18n identik dengan mockup. |
| `live-search-api/` | Prototipe API pencarian kendaraan (Node + psql). **Hanya untuk demo lokal.** |

## Cara buka mockup
Buka `mockup-booking-home-service.html` di Chrome/Edge — tidak butuh build. Untuk melihat spesifikasi: klik **Referensi → Binding Tabel**.

## Cakupan
- **Langkah 1** — Informasi Penelpon, Lokasi Layanan (AHASS/Home Service/Antar Jemput), Informasi Kendaraan/STNK, Jadwal Booking (slot jam via modal).
- **Langkah 2** — Data Mekanik (bertanggung jawab + pembantu), Jasa Service (paket → variant), Spare Part.
- **Langkah 3** (Ringkasan) & List Booking: belum dibuat.

## Sumber data (lihat Binding Tabel untuk detail)
- Kendaraan/STNK: `SNEMESIAGEN_CUSTOMER` + enrich `SIRIS`.
- Slot jam booking: `SNEMESIAGEN_BOOKING` (`mstbookingslot` + `mstbookingslothour`).
- Paket & jasa service: `SNEMESIAGEN_SERVICE` (`mstservicepackage`, `mstservice`, `mstserviceprice`, filter segment/category via `mstmotor`).

## Menjalankan prototipe API (opsional, demo lokal)
1. Salin `live-search-api/db.config.example.json` → `live-search-api/db.config.json`, isi `user` & `password` DB.
   > **`db.config.json` TIDAK di-commit** (ada di `.gitignore`) karena memuat kredensial.
2. Pastikan Node.js + PostgreSQL client (`psql`) terpasang, dan ada akses jaringan ke DB.
3. Jalankan: `node live-search-api/server.js` (port 5180). Biarkan terbuka lalu buka mockup — pencarian kendaraan otomatis pakai data DB (kalau server mati, fallback ke data contoh).

## Catatan
- Master mekanik/service/part sebagian masih data contoh di FE — siap dibinding ke tabel master (query ada di Binding Tabel).
- Beberapa isu data ditandai di Referensi bagian **"Temuan saat cek DB"**.
