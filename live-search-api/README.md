# Live Search API — Booking Home Service (prototype lokal)

API kecil untuk membuat pencarian kendaraan di mockup **benar-benar** query ke database
(bukan data dummy). Hanya untuk demo di laptop.

## Yang dibutuhkan
- **Node.js** (sudah ada: `C:\Program Files\nodejs\node.exe`)
- **psql** (PostgreSQL client 17 — sudah ada: `C:\Program Files\PostgreSQL\17\bin\psql.exe`)
- Akses jaringan ke Postgres `10.10.108.20:65432`

## Konfigurasi
Kredensial & path ada di `db.config.json`. **Jangan dibagikan / commit** (berisi password DB).

## Menjalankan
```bash
node "D:\IT Strategic Planning\2026\New Generation SDMS\Module\Booking dan List Booking Home Service\live-search-api\server.js"
```
Server jalan di `http://localhost:5180`. Biarkan jendela ini terbuka selama memakai mockup.

Lalu buka mockup (`mockup-booking-home-service.html`) seperti biasa. Saat mengetik >= 4
karakter di "Cari Plat Nomor", mockup otomatis fetch ke server ini. Kalau server mati,
mockup otomatis fallback ke data contoh (badge "API pencarian tidak aktif").

## Endpoint
```
GET /unit/search?by=policenumber|machinenumber|framenumber&q=<kata kunci>
GET /master/motorahm     # daftar Kode Tipe Unit (mstmotorahm code+name, urut code asc)
GET /health
```
Contoh: `http://localhost:5180/unit/search?by=policenumber&q=AA2022`

## Sumber data (cross-DB: SNEMESIAGEN_CUSTOMER + SIRIS)
| Field di layar | Kolom sumber |
|---|---|
| Plat Nomor | `SNEMESIAGEN_CUSTOMER.mstvehicle.policenumber` (cari: TRIM spasi) |
| Nomor Mesin | `mstvehicle.machinenumber` |
| Nomor Rangka | `mstvehicle.framenumber` |
| Tahun Rakit | `mstvehicle.yearofass` |
| Warna | `mstmotorcolor.colorname` (join `mstvehicle.motorcolorid = mstmotorcolor.id`) |
| **Kode Tipe Unit** | `SIRIS.mstmotorahm.code` |
| **Market Name** | `SIRIS.mstmotorahm.name` |
| **STNK** (Nama/NIK/Alamat/Kode Pos/Geo) | `custvehiclestnk` + `mstcustomer` + `mstgeo*` (join `mstvehicle.id=custvehiclestnk.vehicleid`, `customerid=mstcustomer.id`) |

Jembatan Kode Tipe Unit / Market Name (karena `mstvehicle.motorid` TIDAK ada di `SIRIS.mstmotor`):
```
mstvehicle.motorid -> customer.mstmotor.code (mis. "LNL")
   -> SIRIS.mstmotor.code = "LNL" -> mstmotor.motorahmid = mstmotorahm.id
   -> mstmotorahm.code (Kode Tipe Unit) + mstmotorahm.name (Market Name)
```
Contoh AA 2022 BB: customer motor.code "LNL" -> SIRIS mstmotorahm **LN0 / NEW SCOOPY SPORTY**.

> Catatan data: `code` di `customer.mstmotor` bisa berbeda arti dgn `SIRIS.mstmotor.code`
> (data test), sehingga hasil Market Name mengikuti yang di SIRIS. Perlu dipastikan
> konsistensi master motor antara DB customer dan SIRIS.
