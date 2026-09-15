import { useEffect, useMemo, useState } from "react";
import {
  PhoneCall,
  MapPin,
  Calendar,
  Clock,
  Search,
  Pencil,
  Lock,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronsUpDown,
  Info,
  AlertTriangle,
  ArrowRight,
  ArrowLeft,
  Save,
  Ticket,
  Code2,
  X,
  User,
  Wrench,
  Package,
  PackageOpen,
  Coins,
  Tag,
  Trash2,
  Minus,
  Plus,
  PanelLeft,
  ClipboardList,
  List,
} from "lucide-react";

/* ==================================================================
   BOOKING HOME SERVICE - LANGKAH 1
   NG SDMS / NG NMS - desain Front End (belum terhubung API)

   Konvensi yang dipakai supaya siap binding ke tabel:
   - Nama field pada `form` = NAMA KOLOM tabel (bukan camelCase UI).
   - Master data dummy di bawah memakai nama kolom tabel aslinya.
     Saat integrasi: ganti konstanta MST_* / GV_* dengan hasil GET API.
   - `buildPayload(form)` menghasilkan bentuk baris yang dikirim ke API.
   - Teks memakai key i18n `booking.*` (lihat DICT) - tinggal dipindah
     ke react-i18next: const { t } = useTranslation("booking").
   ================================================================== */

/* ------------------------------------------------------------------
   MASTER DATA (dummy - meniru struktur tabel)
   ------------------------------------------------------------------ */

// siris.mstgeoprovince
/* Master wilayah - DATA ASLI dari PostgreSQL SIRIS (schema dbo.mstgeo*), 9 Sep 2026.
   Hanya 2 provinsi: Jawa Timur (3500) & Nusa Tenggara Timur (5300).
   Provinsi + KOTA lengkap; KECAMATAN & KELURAHAN hanya sampel 3 kota
   (Kota Surabaya, Kota Malang, Kota Kupang) supaya file tetap ringkas.
   id = kode wilayah (business key SIRIS).
   INTEGRASI: ganti dgn GET API cascading (city?provinceId=, district?cityId=, village?districtId=). */
const MST_GEOPROVINCE = [
  { id:"3500", code:"3500", name:"Jawa Timur" },
  { id:"5300", code:"5300", name:"Nusa Tenggara Timur" },
];

// dbo.mstgeoprovince - SEMUA provinsi (utk dropdown Provinsi di tab STNK, tanpa pembatasan)
const MST_GEOPROVINCE_ALL = [
  { id:"5100", code:"5100", name:"BALI" },
  { id:"1900", code:"1900", name:"BANGKA BELITUNG" },
  { id:"3600", code:"3600", name:"BANTEN" },
  { id:"1700", code:"1700", name:"BENGKULU" },
  { id:"3400", code:"3400", name:"DI YOGYAKARTA" },
  { id:"1100", code:"1100", name:"DI. ACEH" },
  { id:"3100", code:"3100", name:"DKI JAKARTA" },
  { id:"7500", code:"7500", name:"GORONTALO" },
  { id:"1500", code:"1500", name:"JAMBI" },
  { id:"3200", code:"3200", name:"JAWA BARAT" },
  { id:"3300", code:"3300", name:"JAWA TENGAH" },
  { id:"3500", code:"3500", name:"JAWA TIMUR" },
  { id:"6100", code:"6100", name:"KALIMANTAN BARAT" },
  { id:"6300", code:"6300", name:"KALIMANTAN SELATAN" },
  { id:"6200", code:"6200", name:"KALIMANTAN TENGAH" },
  { id:"6400", code:"6400", name:"KALIMANTAN TIMUR" },
  { id:"8700", code:"8700", name:"KALIMANTAN UTARA" },
  { id:"8600", code:"8600", name:"KEP. RIAU" },
  { id:"1800", code:"1800", name:"LAMPUNG" },
  { id:"8100", code:"8100", name:"MALUKU" },
  { id:"8200", code:"8200", name:"MALUKU UTARA" },
  { id:"5200", code:"5200", name:"NUSA TENGGARA BARAT" },
  { id:"5300", code:"5300", name:"NUSA TENGGARA TIMUR" },
  { id:"9400", code:"9400", name:"PAPUA" },
  { id:"8300", code:"8300", name:"PAPUA BARAT" },
  { id:"2200", code:"2200", name:"PAPUA BARAT DAYA" },
  { id:"2000", code:"2000", name:"PAPUA PEGUNUNGAN" },
  { id:"1000", code:"1000", name:"PAPUA SELATAN" },
  { id:"8400", code:"8400", name:"PAPUA TENGAH" },
  { id:"8500", code:"8500", name:"PAPUA TIMUR" },
  { id:"1400", code:"1400", name:"RIAU" },
  { id:"8800", code:"8800", name:"SULAWESI BARAT" },
  { id:"7300", code:"7300", name:"SULAWESI SELATAN" },
  { id:"7200", code:"7200", name:"SULAWESI TENGAH" },
  { id:"7400", code:"7400", name:"SULAWESI TENGGARA" },
  { id:"7100", code:"7100", name:"SULAWESI UTARA" },
  { id:"1300", code:"1300", name:"SUMATERA BARAT" },
  { id:"1600", code:"1600", name:"SUMATERA SELATAN" },
  { id:"1200", code:"1200", name:"SUMATERA UTARA" },
  { id:"5800", code:"5800", name:"TIMOR LESTE" },
];

// dbo.mstgeocity (geoprovinceid -> mstgeoprovince.id) - semua kota di 2 provinsi target
const MST_GEOCITY = [
  { id:"3526", code:"3526", name:"Kab. Bangkalan", geoprovinceid:"3500" },
  { id:"3510", code:"3510", name:"Kab. Banyuwangi", geoprovinceid:"3500" },
  { id:"3505", code:"3505", name:"Kab. Blitar", geoprovinceid:"3500" },
  { id:"3522", code:"3522", name:"Kab. Bojonegoro", geoprovinceid:"3500" },
  { id:"3511", code:"3511", name:"Kab. Bondowoso", geoprovinceid:"3500" },
  { id:"3525", code:"3525", name:"Kab. Gresik", geoprovinceid:"3500" },
  { id:"3509", code:"3509", name:"Kab. Jember", geoprovinceid:"3500" },
  { id:"3517", code:"3517", name:"Kab. Jombang", geoprovinceid:"3500" },
  { id:"3506", code:"3506", name:"Kab. Kediri", geoprovinceid:"3500" },
  { id:"3524", code:"3524", name:"Kab. Lamongan", geoprovinceid:"3500" },
  { id:"3508", code:"3508", name:"Kab. Lumajang", geoprovinceid:"3500" },
  { id:"3519", code:"3519", name:"Kab. Madiun", geoprovinceid:"3500" },
  { id:"3520", code:"3520", name:"Kab. Magetan", geoprovinceid:"3500" },
  { id:"3507", code:"3507", name:"Kab. Malang", geoprovinceid:"3500" },
  { id:"3516", code:"3516", name:"Kab. Mojokerto", geoprovinceid:"3500" },
  { id:"3518", code:"3518", name:"Kab. Nganjuk", geoprovinceid:"3500" },
  { id:"3521", code:"3521", name:"Kab. Ngawi", geoprovinceid:"3500" },
  { id:"3501", code:"3501", name:"Kab. Pacitan", geoprovinceid:"3500" },
  { id:"3528", code:"3528", name:"Kab. Pamekasan", geoprovinceid:"3500" },
  { id:"3514", code:"3514", name:"Kab. Pasuruan", geoprovinceid:"3500" },
  { id:"3502", code:"3502", name:"Kab. Ponorogo", geoprovinceid:"3500" },
  { id:"3513", code:"3513", name:"Kab. Probolinggo", geoprovinceid:"3500" },
  { id:"3527", code:"3527", name:"Kab. Sampang", geoprovinceid:"3500" },
  { id:"3515", code:"3515", name:"Kab. Sidoarjo", geoprovinceid:"3500" },
  { id:"3512", code:"3512", name:"Kab. Situbondo", geoprovinceid:"3500" },
  { id:"3529", code:"3529", name:"Kab. Sumenep", geoprovinceid:"3500" },
  { id:"3503", code:"3503", name:"Kab. Trenggalek", geoprovinceid:"3500" },
  { id:"3523", code:"3523", name:"Kab. Tuban", geoprovinceid:"3500" },
  { id:"3504", code:"3504", name:"Kab. Tulungagung", geoprovinceid:"3500" },
  { id:"3579", code:"3579", name:"Kota Batu", geoprovinceid:"3500" },
  { id:"3572", code:"3572", name:"Kota Blitar", geoprovinceid:"3500" },
  { id:"3571", code:"3571", name:"Kota Kediri", geoprovinceid:"3500" },
  { id:"3577", code:"3577", name:"Kota Madiun", geoprovinceid:"3500" },
  { id:"3573", code:"3573", name:"Kota Malang", geoprovinceid:"3500" },
  { id:"3576", code:"3576", name:"Kota Mojokerto", geoprovinceid:"3500" },
  { id:"3575", code:"3575", name:"Kota Pasuruan", geoprovinceid:"3500" },
  { id:"3574", code:"3574", name:"Kota Probolinggo", geoprovinceid:"3500" },
  { id:"3578", code:"3578", name:"Kota Surabaya", geoprovinceid:"3500" },
  { id:"5307", code:"5307", name:"Kab. Alor", geoprovinceid:"5300" },
  { id:"5306", code:"5306", name:"Kab. Belu", geoprovinceid:"5300" },
  { id:"5311", code:"5311", name:"Kab. Ende", geoprovinceid:"5300" },
  { id:"5309", code:"5309", name:"Kab. Flores Timur", geoprovinceid:"5300" },
  { id:"5303", code:"5303", name:"Kab. Kupang", geoprovinceid:"5300" },
  { id:"5308", code:"5308", name:"Kab. Lembata", geoprovinceid:"5300" },
  { id:"5320", code:"5320", name:"Kab. Malaka", geoprovinceid:"5300" },
  { id:"5313", code:"5313", name:"Kab. Manggarai", geoprovinceid:"5300" },
  { id:"5315", code:"5315", name:"Kab. Manggarai Barat", geoprovinceid:"5300" },
  { id:"5372", code:"5372", name:"Kab. Manggarai Timur", geoprovinceid:"5300" },
  { id:"5318", code:"5318", name:"Kab. Nagekeo", geoprovinceid:"5300" },
  { id:"5312", code:"5312", name:"Kab. Ngada", geoprovinceid:"5300" },
  { id:"5314", code:"5314", name:"Kab. Rote Ndao", geoprovinceid:"5300" },
  { id:"5319", code:"5319", name:"Kab. Sabu Raijua", geoprovinceid:"5300" },
  { id:"5310", code:"5310", name:"Kab. Sikka", geoprovinceid:"5300" },
  { id:"5301", code:"5301", name:"Kab. Sumba Barat", geoprovinceid:"5300" },
  { id:"5316", code:"5316", name:"Kab. Sumba Barat Daya", geoprovinceid:"5300" },
  { id:"5317", code:"5317", name:"Kab. Sumba Tengah", geoprovinceid:"5300" },
  { id:"5302", code:"5302", name:"Kab. Sumba Timur", geoprovinceid:"5300" },
  { id:"5304", code:"5304", name:"Kab. Timor Tengah Selatan", geoprovinceid:"5300" },
  { id:"5305", code:"5305", name:"Kab. Timor Tengah Utara", geoprovinceid:"5300" },
  { id:"5371", code:"5371", name:"Kota Kupang", geoprovinceid:"5300" },
];

// dbo.mstgeodistrict (geocityid -> mstgeocity.id) - SAMPEL: hanya Surabaya/Malang/Kupang
const MST_GEODISTRICT = [
  { id:"537101", code:"537101", name:"Alak", geocityid:"5371" },
  { id:"537103", code:"537103", name:"Kelapa Lima", geocityid:"5371" },
  { id:"537106", code:"537106", name:"Kota Lama", geocityid:"5371" },
  { id:"537105", code:"537105", name:"Kota Raja", geocityid:"5371" },
  { id:"537102", code:"537102", name:"Maulafa", geocityid:"5371" },
  { id:"537104", code:"537104", name:"Oebobo", geocityid:"5371" },
  { id:"357301", code:"357301", name:"Blimbing", geocityid:"3573" },
  { id:"357303", code:"357303", name:"Kedungkandang", geocityid:"3573" },
  { id:"357302", code:"357302", name:"Klojen", geocityid:"3573" },
  { id:"357305", code:"357305", name:"Lowokwaru", geocityid:"3573" },
  { id:"357304", code:"357304", name:"Sukun", geocityid:"3573" },
  { id:"357828", code:"357828", name:"Asem Rowo", geocityid:"3578" },
  { id:"357819", code:"357819", name:"Benowo", geocityid:"3578" },
  { id:"357813", code:"357813", name:"Bubutan", geocityid:"3578" },
  { id:"357829", code:"357829", name:"Bulak", geocityid:"3578" },
  { id:"357821", code:"357821", name:"Dukuhpakis", geocityid:"3578" },
  { id:"357822", code:"357822", name:"Gayungan", geocityid:"3578" },
  { id:"357807", code:"357807", name:"Genteng", geocityid:"3578" },
  { id:"357808", code:"357808", name:"Gubeng", geocityid:"3578" },
  { id:"357825", code:"357825", name:"Gunung Anyar", geocityid:"3578" },
  { id:"357823", code:"357823", name:"Jambangan", geocityid:"3578" },
  { id:"357801", code:"357801", name:"Karangpilang", geocityid:"3578" },
  { id:"357817", code:"357817", name:"Kenjeran", geocityid:"3578" },
  { id:"357815", code:"357815", name:"Krembangan", geocityid:"3578" },
  { id:"357818", code:"357818", name:"Lakarsantri", geocityid:"3578" },
  { id:"357826", code:"357826", name:"Mulyorejo", geocityid:"3578" },
  { id:"357812", code:"357812", name:"Pabean Cantian", geocityid:"3578" },
  { id:"357830", code:"357830", name:"Pakal", geocityid:"3578" },
  { id:"357803", code:"357803", name:"Rungkut", geocityid:"3578" },
  { id:"357831", code:"357831", name:"Sambikerep", geocityid:"3578" },
  { id:"357806", code:"357806", name:"Sawahan", geocityid:"3578" },
  { id:"357816", code:"357816", name:"Semampir", geocityid:"3578" },
  { id:"357811", code:"357811", name:"Simokerto", geocityid:"3578" },
  { id:"357809", code:"357809", name:"Sukolilo", geocityid:"3578" },
  { id:"357827", code:"357827", name:"Sukomanunggal", geocityid:"3578" },
  { id:"357810", code:"357810", name:"Tambaksari", geocityid:"3578" },
  { id:"357814", code:"357814", name:"Tandes", geocityid:"3578" },
  { id:"357805", code:"357805", name:"Tegalsari", geocityid:"3578" },
  { id:"357824", code:"357824", name:"Tenggilis Mejoyo", geocityid:"3578" },
  { id:"357820", code:"357820", name:"Wiyung", geocityid:"3578" },
  { id:"357802", code:"357802", name:"Wonocolo", geocityid:"3578" },
  { id:"357804", code:"357804", name:"Wonokromo", geocityid:"3578" },
];

// dbo.mstgeovillage (geodistrictid -> mstgeodistrict.id) - SAMPEL: hanya kec. di kota sampel
const MST_GEOVILLAGE = [
  { id:"5371010008", code:"5371010008", name:"Alak", geodistrictid:"537101" },
  { id:"5371010009", code:"5371010009", name:"Batu Plat", geodistrictid:"537101" },
  { id:"5371010005", code:"5371010005", name:"Fatufeto", geodistrictid:"537101" },
  { id:"5371010007", code:"5371010007", name:"Mantasi", geodistrictid:"537101" },
  { id:"5371010010", code:"5371010010", name:"Manulai Ii", geodistrictid:"537101" },
  { id:"5371010006", code:"5371010006", name:"Manutapen", geodistrictid:"537101" },
  { id:"5371010011", code:"5371010011", name:"Naioni", geodistrictid:"537101" },
  { id:"5371010001", code:"5371010001", name:"Namosain", geodistrictid:"537101" },
  { id:"5371010003", code:"5371010003", name:"Nunbaun Delha", geodistrictid:"537101" },
  { id:"5371010002", code:"5371010002", name:"Nunbaun Sabu", geodistrictid:"537101" },
  { id:"5371010004", code:"5371010004", name:"Nunhila", geodistrictid:"537101" },
  { id:"5371010012", code:"5371010012", name:"Penkase Oeleta", geodistrictid:"537101" },
  { id:"3578280001", code:"3578280001", name:"Asem Rowo", geodistrictid:"357828" },
  { id:"3578280002", code:"3578280002", name:"Genting Kalianak", geodistrictid:"357828" },
  { id:"3578280003", code:"3578280003", name:"Tambak Sarioso", geodistrictid:"357828" },
  { id:"3578190001", code:"3578190001", name:"Kandangan", geodistrictid:"357819" },
  { id:"3578190004", code:"3578190004", name:"Romokalisari", geodistrictid:"357819" },
  { id:"3578190002", code:"3578190002", name:"Sememi", geodistrictid:"357819" },
  { id:"3578190003", code:"3578190003", name:"Tambak Oso Wilangun", geodistrictid:"357819" },
  { id:"3573010002", code:"3573010002", name:"Arjosari", geodistrictid:"357301" },
  { id:"3573010001", code:"3573010001", name:"Balearjosari", geodistrictid:"357301" },
  { id:"3573010005", code:"3573010005", name:"Blimbing", geodistrictid:"357301" },
  { id:"3573010008", code:"3573010008", name:"Bunulrejo", geodistrictid:"357301" },
  { id:"3573010011", code:"3573010011", name:"Jodipan", geodistrictid:"357301" },
  { id:"3573010009", code:"3573010009", name:"Kesatrian", geodistrictid:"357301" },
  { id:"3573010006", code:"3573010006", name:"Pandanwangi", geodistrictid:"357301" },
  { id:"3573010010", code:"3573010010", name:"Polehan", geodistrictid:"357301" },
  { id:"3573010003", code:"3573010003", name:"Polowijen", geodistrictid:"357301" },
  { id:"3573010007", code:"3573010007", name:"Purwantoro", geodistrictid:"357301" },
  { id:"3573010004", code:"3573010004", name:"Purwodadi", geodistrictid:"357301" },
  { id:"3578130001", code:"3578130001", name:"Alun-Alun Contong", geodistrictid:"357813" },
  { id:"3578130002", code:"3578130002", name:"Bubutan", geodistrictid:"357813" },
  { id:"3578130003", code:"3578130003", name:"Gundih", geodistrictid:"357813" },
  { id:"3578130004", code:"3578130004", name:"Jepara", geodistrictid:"357813" },
  { id:"3578130005", code:"3578130005", name:"Tembok Dukuh", geodistrictid:"357813" },
  { id:"3578290003", code:"3578290003", name:"Bulak", geodistrictid:"357829" },
  { id:"3578290001", code:"3578290001", name:"Kedung Cowek", geodistrictid:"357829" },
  { id:"3578290002", code:"3578290002", name:"Kenjeran", geodistrictid:"357829" },
  { id:"3578290004", code:"3578290004", name:"Sukolilo Baru", geodistrictid:"357829" },
  { id:"3578210002", code:"3578210002", name:"Dukuh Kupang", geodistrictid:"357821" },
  { id:"3578210001", code:"3578210001", name:"Dukuh Pakis", geodistrictid:"357821" },
  { id:"3578210003", code:"3578210003", name:"Gunung Sari", geodistrictid:"357821" },
  { id:"3578210004", code:"3578210004", name:"Pradah Kalikendal", geodistrictid:"357821" },
  { id:"3578220003", code:"3578220003", name:"Dukuh Menanggal", geodistrictid:"357822" },
  { id:"3578220001", code:"3578220001", name:"Gayungan", geodistrictid:"357822" },
  { id:"3578220004", code:"3578220004", name:"Ketintang", geodistrictid:"357822" },
  { id:"3578220002", code:"3578220002", name:"Menanggal", geodistrictid:"357822" },
  { id:"3578070001", code:"3578070001", name:"Embong Kaliasin", geodistrictid:"357807" },
  { id:"3578070002", code:"3578070002", name:"Genteng", geodistrictid:"357807" },
  { id:"3578070003", code:"3578070003", name:"Kapasari", geodistrictid:"357807" },
  { id:"3578070004", code:"3578070004", name:"Ketabang", geodistrictid:"357807" },
  { id:"3578070005", code:"3578070005", name:"Peneleh", geodistrictid:"357807" },
  { id:"3578080003", code:"3578080003", name:"Airlangga", geodistrictid:"357808" },
  { id:"3578080005", code:"3578080005", name:"Baratajaya", geodistrictid:"357808" },
  { id:"3578080001", code:"3578080001", name:"Gubeng", geodistrictid:"357808" },
  { id:"3578080004", code:"3578080004", name:"Kertajaya", geodistrictid:"357808" },
  { id:"3578080002", code:"3578080002", name:"Mojo", geodistrictid:"357808" },
  { id:"3578080006", code:"3578080006", name:"Pucang Sewu", geodistrictid:"357808" },
  { id:"3578250001", code:"3578250001", name:"Gunung Anyar", geodistrictid:"357825" },
  { id:"3578250004", code:"3578250004", name:"Gunung Anyar Tambak", geodistrictid:"357825" },
  { id:"3578250003", code:"3578250003", name:"Rungkut Menanggal", geodistrictid:"357825" },
  { id:"3578250002", code:"3578250002", name:"Rungkut Tengah", geodistrictid:"357825" },
  { id:"3578230001", code:"3578230001", name:"Jambangan", geodistrictid:"357823" },
  { id:"3578230002", code:"3578230002", name:"Karah", geodistrictid:"357823" },
  { id:"3578230003", code:"3578230003", name:"Kebonsari", geodistrictid:"357823" },
  { id:"3578230004", code:"3578230004", name:"Pagesangan", geodistrictid:"357823" },
  { id:"3578010001", code:"3578010001", name:"Karang Pilang", geodistrictid:"357801" },
  { id:"3578010002", code:"3578010002", name:"Kebraon", geodistrictid:"357801" },
  { id:"3578010003", code:"3578010003", name:"Kedurus", geodistrictid:"357801" },
  { id:"3578010004", code:"3578010004", name:"Waru Gunung", geodistrictid:"357801" },
  { id:"3573030011", code:"3573030011", name:"Arjowinangun", geodistrictid:"357303" },
  { id:"3573030003", code:"3573030003", name:"Bumiayu", geodistrictid:"357303" },
  { id:"3573030005", code:"3573030005", name:"Buring", geodistrictid:"357303" },
  { id:"3573030010", code:"3573030010", name:"Cemorokandang", geodistrictid:"357303" },
  { id:"3573030006", code:"3573030006", name:"Kedungkandang", geodistrictid:"357303" },
  { id:"3573030001", code:"3573030001", name:"Kotalama", geodistrictid:"357303" },
  { id:"3573030007", code:"3573030007", name:"Lesanpuro", geodistrictid:"357303" },
  { id:"3573030009", code:"3573030009", name:"Madyopuro", geodistrictid:"357303" },
  { id:"3573030002", code:"3573030002", name:"Mergosono", geodistrictid:"357303" },
  { id:"3573030008", code:"3573030008", name:"Sawojajar", geodistrictid:"357303" },
  { id:"3573030012", code:"3573030012", name:"Tlogowaru", geodistrictid:"357303" },
  { id:"3573030004", code:"3573030004", name:"Wonokoyo", geodistrictid:"357303" },
  { id:"5371030001", code:"5371030001", name:"Kelapa Lima", geodistrictid:"537103" },
  { id:"5371030003", code:"5371030003", name:"Lasiana", geodistrictid:"537103" },
  { id:"5371030002", code:"5371030002", name:"Oesapa", geodistrictid:"537103" },
  { id:"5371030004", code:"5371030004", name:"Oesapa Barat", geodistrictid:"537103" },
  { id:"5371030005", code:"5371030005", name:"Oesapa Selatan", geodistrictid:"537103" },
  { id:"3578170003", code:"3578170003", name:"Bulak Banteng", geodistrictid:"357817" },
  { id:"3578170002", code:"3578170002", name:"Sidotopo Wetan", geodistrictid:"357817" },
  { id:"3578170004", code:"3578170004", name:"Tambak Wedi", geodistrictid:"357817" },
  { id:"3578170001", code:"3578170001", name:"Tanah Kali Kedinding", geodistrictid:"357817" },
  { id:"3573020009", code:"3573020009", name:"Bareng", geodistrictid:"357302" },
  { id:"3573020010", code:"3573020010", name:"Gading Kasri", geodistrictid:"357302" },
  { id:"3573020006", code:"3573020006", name:"Kasin", geodistrictid:"357302" },
  { id:"3573020007", code:"3573020007", name:"Kauman", geodistrictid:"357302" },
  { id:"3573020004", code:"3573020004", name:"Kiduldalem", geodistrictid:"357302" },
  { id:"3573020001", code:"3573020001", name:"Klojen", geodistrictid:"357302" },
  { id:"3573020008", code:"3573020008", name:"Oro-Oro Dowo", geodistrictid:"357302" },
  { id:"3573020011", code:"3573020011", name:"Penanggungan", geodistrictid:"357302" },
  { id:"3573020002", code:"3573020002", name:"Rampalcelaket", geodistrictid:"357302" },
  { id:"3573020003", code:"3573020003", name:"Samaan", geodistrictid:"357302" },
  { id:"3573020005", code:"3573020005", name:"Sukoharjo", geodistrictid:"357302" },
  { id:"5371060001", code:"5371060001", name:"Airmata", geodistrictid:"537106" },
  { id:"5371060003", code:"5371060003", name:"Bonipoi", geodistrictid:"537106" },
  { id:"5371060008", code:"5371060008", name:"Fatubesi", geodistrictid:"537106" },
  { id:"5371060002", code:"5371060002", name:"Lai Lai Bisi Kopan", geodistrictid:"537106" },
  { id:"5371060006", code:"5371060006", name:"Merdeka", geodistrictid:"537106" },
  { id:"5371060010", code:"5371060010", name:"Nefonaek", geodistrictid:"537106" },
  { id:"5371060007", code:"5371060007", name:"Oeba", geodistrictid:"537106" },
  { id:"5371060009", code:"5371060009", name:"Pasir Panjang", geodistrictid:"537106" },
  { id:"5371060004", code:"5371060004", name:"Solor", geodistrictid:"537106" },
  { id:"5371060005", code:"5371060005", name:"Tode Kisar", geodistrictid:"537106" },
  { id:"5371050003", code:"5371050003", name:"Airnona", geodistrictid:"537105" },
  { id:"5371050001", code:"5371050001", name:"Bakunase", geodistrictid:"537105" },
  { id:"5371050002", code:"5371050002", name:"Bakunase Dua", geodistrictid:"537105" },
  { id:"5371050008", code:"5371050008", name:"Fontein", geodistrictid:"537105" },
  { id:"5371050006", code:"5371050006", name:"Kuanino", geodistrictid:"537105" },
  { id:"5371050005", code:"5371050005", name:"Naikoten Dua", geodistrictid:"537105" },
  { id:"5371050004", code:"5371050004", name:"Naikoten Satu", geodistrictid:"537105" },
  { id:"5371050007", code:"5371050007", name:"Nunleu", geodistrictid:"537105" },
  { id:"3578150004", code:"3578150004", name:"Dupak", geodistrictid:"357815" },
  { id:"3578150002", code:"3578150002", name:"Kemayoran", geodistrictid:"357815" },
  { id:"3578150001", code:"3578150001", name:"Krembangan Selatan", geodistrictid:"357815" },
  { id:"3578150005", code:"3578150005", name:"Morokrembangan", geodistrictid:"357815" },
  { id:"3578150003", code:"3578150003", name:"Perak Barat", geodistrictid:"357815" },
  { id:"3578180001", code:"3578180001", name:"Bangkingan", geodistrictid:"357818" },
  { id:"3578180002", code:"3578180002", name:"Jeruk", geodistrictid:"357818" },
  { id:"3578180003", code:"3578180003", name:"Lakarsantri", geodistrictid:"357818" },
  { id:"3578180004", code:"3578180004", name:"Lidah Kulon", geodistrictid:"357818" },
  { id:"3578180005", code:"3578180005", name:"Lidah Wetan", geodistrictid:"357818" },
  { id:"3578180006", code:"3578180006", name:"Sumurwelut", geodistrictid:"357818" },
  { id:"3573050004", code:"3573050004", name:"Dinoyo", geodistrictid:"357305" },
  { id:"3573050007", code:"3573050007", name:"Jatimulyo", geodistrictid:"357305" },
  { id:"3573050006", code:"3573050006", name:"Ketawanggede", geodistrictid:"357305" },
  { id:"3573050011", code:"3573050011", name:"Lowokwaru", geodistrictid:"357305" },
  { id:"3573050002", code:"3573050002", name:"Merjosari", geodistrictid:"357305" },
  { id:"3573050009", code:"3573050009", name:"Mojolangu", geodistrictid:"357305" },
  { id:"3573050005", code:"3573050005", name:"Sumbersari", geodistrictid:"357305" },
  { id:"3573050012", code:"3573050012", name:"Tasik Madu", geodistrictid:"357305" },
  { id:"3573050003", code:"3573050003", name:"Tlogomas", geodistrictid:"357305" },
  { id:"3573050010", code:"3573050010", name:"Tulusrejo", geodistrictid:"357305" },
  { id:"3573050001", code:"3573050001", name:"Tunggulwulung", geodistrictid:"357305" },
  { id:"3573050008", code:"3573050008", name:"Tunjungsekar", geodistrictid:"357305" },
  { id:"5371020005", code:"5371020005", name:"Bello", geodistrictid:"537102" },
  { id:"5371020006", code:"5371020006", name:"Fatukoa", geodistrictid:"537102" },
  { id:"5371020007", code:"5371020007", name:"Kolhua", geodistrictid:"537102" },
  { id:"5371020002", code:"5371020002", name:"Maulafa", geodistrictid:"537102" },
  { id:"5371020009", code:"5371020009", name:"Naikolan", geodistrictid:"537102" },
  { id:"5371020004", code:"5371020004", name:"Naimata", geodistrictid:"537102" },
  { id:"5371020001", code:"5371020001", name:"Oepura", geodistrictid:"537102" },
  { id:"5371020003", code:"5371020003", name:"Penfui", geodistrictid:"537102" },
  { id:"5371020008", code:"5371020008", name:"Sikumana", geodistrictid:"537102" },
  { id:"3578260005", code:"3578260005", name:"Dukuh Sutorejo", geodistrictid:"357826" },
  { id:"3578260006", code:"3578260006", name:"Kalijudan", geodistrictid:"357826" },
  { id:"3578260004", code:"3578260004", name:"Kalisari", geodistrictid:"357826" },
  { id:"3578260003", code:"3578260003", name:"Kejawan Putih Tambak", geodistrictid:"357826" },
  { id:"3578260002", code:"3578260002", name:"Manyar Sabrangan", geodistrictid:"357826" },
  { id:"3578260001", code:"3578260001", name:"Mulyorejo", geodistrictid:"357826" },
  { id:"5371040005", code:"5371040005", name:"Fatululi", geodistrictid:"537104" },
  { id:"5371040006", code:"5371040006", name:"Kayu Putih", geodistrictid:"537104" },
  { id:"5371040004", code:"5371040004", name:"Liliba", geodistrictid:"537104" },
  { id:"5371040001", code:"5371040001", name:"Oebobo", geodistrictid:"537104" },
  { id:"5371040003", code:"5371040003", name:"Oebufu", geodistrictid:"537104" },
  { id:"5371040002", code:"5371040002", name:"Oetete", geodistrictid:"537104" },
  { id:"5371040007", code:"5371040007", name:"Tuak Daun Merah", geodistrictid:"537104" },
  { id:"3578120001", code:"3578120001", name:"Bongkaran", geodistrictid:"357812" },
  { id:"3578120003", code:"3578120003", name:"Krembangan Utara", geodistrictid:"357812" },
  { id:"3578120002", code:"3578120002", name:"Nyamplungan", geodistrictid:"357812" },
  { id:"3578120004", code:"3578120004", name:"Tanjung Perak", geodistrictid:"357812" },
  { id:"3578300002", code:"3578300002", name:"Babat Jerawat", geodistrictid:"357830" },
  { id:"3578300004", code:"3578300004", name:"Benowo", geodistrictid:"357830" },
  { id:"3578300001", code:"3578300001", name:"Pakal", geodistrictid:"357830" },
  { id:"3578300003", code:"3578300003", name:"Sumber Rejo", geodistrictid:"357830" },
  { id:"3578030001", code:"3578030001", name:"Kalirungkut", geodistrictid:"357803" },
  { id:"3578030003", code:"3578030003", name:"Kedung Baruk", geodistrictid:"357803" },
  { id:"3578030006", code:"3578030006", name:"Medokan Ayu", geodistrictid:"357803" },
  { id:"3578030004", code:"3578030004", name:"Penjaringansari", geodistrictid:"357803" },
  { id:"3578030002", code:"3578030002", name:"Rungkut Kidul", geodistrictid:"357803" },
  { id:"3578030005", code:"3578030005", name:"Wonorejo", geodistrictid:"357803" },
  { id:"3578310003", code:"3578310003", name:"Beringin", geodistrictid:"357831" },
  { id:"3578310004", code:"3578310004", name:"Lontar", geodistrictid:"357831" },
  { id:"3578310002", code:"3578310002", name:"Made", geodistrictid:"357831" },
  { id:"3578310001", code:"3578310001", name:"Sambikerep", geodistrictid:"357831" },
  { id:"3578060003", code:"3578060003", name:"Banyu Urip", geodistrictid:"357806" },
  { id:"3578060005", code:"3578060005", name:"Kupang Krajan", geodistrictid:"357806" },
  { id:"3578060006", code:"3578060006", name:"Pakis", geodistrictid:"357806" },
  { id:"3578060001", code:"3578060001", name:"Petemon", geodistrictid:"357806" },
  { id:"3578060004", code:"3578060004", name:"Putat Jaya", geodistrictid:"357806" },
  { id:"3578060002", code:"3578060002", name:"Sawahan", geodistrictid:"357806" },
  { id:"3578160001", code:"3578160001", name:"Ampel", geodistrictid:"357816" },
  { id:"3578160002", code:"3578160002", name:"Pegirian", geodistrictid:"357816" },
  { id:"3578160005", code:"3578160005", name:"Sidotopo", geodistrictid:"357816" },
  { id:"3578160004", code:"3578160004", name:"Ujung", geodistrictid:"357816" },
  { id:"3578160003", code:"3578160003", name:"Wonokusumo", geodistrictid:"357816" },
  { id:"3578110002", code:"3578110002", name:"Kapasan", geodistrictid:"357811" },
  { id:"3578110003", code:"3578110003", name:"Sidodadi", geodistrictid:"357811" },
  { id:"3578110001", code:"3578110001", name:"Simokerto", geodistrictid:"357811" },
  { id:"3578110004", code:"3578110004", name:"Simolawang", geodistrictid:"357811" },
  { id:"3578110005", code:"3578110005", name:"Tambakrejo", geodistrictid:"357811" },
  { id:"3578090002", code:"3578090002", name:"Gebang Putih", geodistrictid:"357809" },
  { id:"3578090001", code:"3578090001", name:"Keputih", geodistrictid:"357809" },
  { id:"3578090003", code:"3578090003", name:"Klampis Ngasem", geodistrictid:"357809" },
  { id:"3578090007", code:"3578090007", name:"Medokan Semampir", geodistrictid:"357809" },
  { id:"3578090004", code:"3578090004", name:"Menur Pumpungan", geodistrictid:"357809" },
  { id:"3578090005", code:"3578090005", name:"Nginden Jangkungan", geodistrictid:"357809" },
  { id:"3578090006", code:"3578090006", name:"Semolowaru", geodistrictid:"357809" },
  { id:"3578270004", code:"3578270004", name:"Putat Gede", geodistrictid:"357827" },
  { id:"3578270005", code:"3578270005", name:"Simomulyo", geodistrictid:"357827" },
  { id:"3578270006", code:"3578270006", name:"Simomulyo Baru", geodistrictid:"357827" },
  { id:"3578270003", code:"3578270003", name:"Sonokwijenan", geodistrictid:"357827" },
  { id:"3578270001", code:"3578270001", name:"Sukomanunggal", geodistrictid:"357827" },
  { id:"3578270002", code:"3578270002", name:"Tanjungsari", geodistrictid:"357827" },
  { id:"3573040011", code:"3573040011", name:"Bakalankrajan", geodistrictid:"357304" },
  { id:"3573040008", code:"3573040008", name:"Bandulan", geodistrictid:"357304" },
  { id:"3573040004", code:"3573040004", name:"Bandungrejosari", geodistrictid:"357304" },
  { id:"3573040001", code:"3573040001", name:"Ciptomulyo", geodistrictid:"357304" },
  { id:"3573040002", code:"3573040002", name:"Gadang", geodistrictid:"357304" },
  { id:"3573040009", code:"3573040009", name:"Karangbesuki", geodistrictid:"357304" },
  { id:"3573040003", code:"3573040003", name:"Kebonsari", geodistrictid:"357304" },
  { id:"3573040010", code:"3573040010", name:"Mulyorejo", geodistrictid:"357304" },
  { id:"3573040007", code:"3573040007", name:"Pisangcandi", geodistrictid:"357304" },
  { id:"3573040005", code:"3573040005", name:"Sukun", geodistrictid:"357304" },
  { id:"3573040006", code:"3573040006", name:"Tanjungrejo", geodistrictid:"357304" },
  { id:"3578100008", code:"3578100008", name:"Dukuh Setro", geodistrictid:"357810" },
  { id:"3578100003", code:"3578100003", name:"Gading", geodistrictid:"357810" },
  { id:"3578100007", code:"3578100007", name:"Kapasmadya Baru", geodistrictid:"357810" },
  { id:"3578100006", code:"3578100006", name:"Pacarkeling", geodistrictid:"357810" },
  { id:"3578100004", code:"3578100004", name:"Pacarkembang", geodistrictid:"357810" },
  { id:"3578100002", code:"3578100002", name:"Ploso", geodistrictid:"357810" },
  { id:"3578100005", code:"3578100005", name:"Rangkah", geodistrictid:"357810" },
  { id:"3578100001", code:"3578100001", name:"Tambaksari", geodistrictid:"357810" },
  { id:"3578140003", code:"3578140003", name:"Balongsari", geodistrictid:"357814" },
  { id:"3578140006", code:"3578140006", name:"Banjar Sugihan", geodistrictid:"357814" },
  { id:"3578140002", code:"3578140002", name:"Karang Poh", geodistrictid:"357814" },
  { id:"3578140004", code:"3578140004", name:"Manukan Kulon", geodistrictid:"357814" },
  { id:"3578140005", code:"3578140005", name:"Manukan Wetan", geodistrictid:"357814" },
  { id:"3578140001", code:"3578140001", name:"Tandes", geodistrictid:"357814" },
  { id:"3578050002", code:"3578050002", name:"Dr. Soetomo", geodistrictid:"357805" },
  { id:"3578050003", code:"3578050003", name:"Kedungdoro", geodistrictid:"357805" },
  { id:"3578050004", code:"3578050004", name:"Keputran", geodistrictid:"357805" },
  { id:"3578050001", code:"3578050001", name:"Tegalsari", geodistrictid:"357805" },
  { id:"3578050005", code:"3578050005", name:"Wonorejo", geodistrictid:"357805" },
  { id:"3578240002", code:"3578240002", name:"Kendangsari", geodistrictid:"357824" },
  { id:"3578240001", code:"3578240001", name:"Kutisari", geodistrictid:"357824" },
  { id:"3578240004", code:"3578240004", name:"Panjang Jiwo", geodistrictid:"357824" },
  { id:"3578240003", code:"3578240003", name:"Tenggilis Mejoyo", geodistrictid:"357824" },
  { id:"3578200003", code:"3578200003", name:"Babatan", geodistrictid:"357820" },
  { id:"3578200004", code:"3578200004", name:"Balas Klumprik", geodistrictid:"357820" },
  { id:"3578200002", code:"3578200002", name:"Jajar Tunggal", geodistrictid:"357820" },
  { id:"3578200001", code:"3578200001", name:"Wiyung", geodistrictid:"357820" },
  { id:"3578020002", code:"3578020002", name:"Bendul Merisi", geodistrictid:"357802" },
  { id:"3578020004", code:"3578020004", name:"Jemur Wonosari", geodistrictid:"357802" },
  { id:"3578020003", code:"3578020003", name:"Margorejo", geodistrictid:"357802" },
  { id:"3578020001", code:"3578020001", name:"Sidosermo", geodistrictid:"357802" },
  { id:"3578020005", code:"3578020005", name:"Siwalankerto", geodistrictid:"357802" },
  { id:"3578040005", code:"3578040005", name:"Darmo", geodistrictid:"357804" },
  { id:"3578040002", code:"3578040002", name:"Jagir", geodistrictid:"357804" },
  { id:"3578040003", code:"3578040003", name:"Ngagel", geodistrictid:"357804" },
  { id:"3578040004", code:"3578040004", name:"Ngagel Rejo", geodistrictid:"357804" },
  { id:"3578040006", code:"3578040006", name:"Sawunggaling", geodistrictid:"357804" },
  { id:"3578040001", code:"3578040001", name:"Wonokromo", geodistrictid:"357804" },
];

// dbo.msttwodigitmotor
const MST_TWODIGITMOTOR = [
  { id: "2D-BD", kodetwodigit: "BD", deskripsi: "THE ALL NEW BEAT FI" },
  { id: "2D-VG", kodetwodigit: "VG", deskripsi: "VARIO 125 CBS ISS" },
  { id: "2D-VH", kodetwodigit: "VH", deskripsi: "VARIO 125 TECHNO NON ISS" },
  { id: "2D-KF", kodetwodigit: "KF", deskripsi: "PCX 160 CBS" },
  { id: "2D-JM", kodetwodigit: "JM", deskripsi: "SCOOPY STYLUS" },
  { id: "2D-GN", kodetwodigit: "GN", deskripsi: "GENIO CBS" },
];

// dbo.mstmotorahm (SIRIS) - master Kode Tipe Unit: code + name, urut code asc.
// Dropdown Kode Tipe Unit (input manual). INTEGRASI: GET /master/motorahm.
const MST_MOTORAHM = [
  { code:"AC7", name:"" },
  { code:"AF5", name:"" },
  { code:"AJ0", name:"PHANTOM" },
  { code:"AKJ", name:"TIGER" },
  { code:"AL0", name:"" },
  { code:"AL5", name:"TIGER CAST WHEEL" },
  { code:"AM0", name:"C125N IN M/T" },
  { code:"AM1", name:"C125S IN M/T" },
  { code:"AMA", name:"C125N 2IN M/T" },
  { code:"AMB", name:"C125S 2IN M/T" },
  { code:"AS0", name:"XL750P IN M/T" },
  { code:"AS1", name:"XL750S 3IN M/T" },
  { code:"ASA", name:"XL750P 2IN M/T" },
  { code:"ASB", name:"XL750S 2IN M/T" },
  { code:"AU5", name:"MEGA PRO" },
  { code:"AW0", name:"CB650RACR IN M/T" },
  { code:"AX0", name:"CRF1100D3R 3IN A/T" },
  { code:"AX1", name:"CRF1100D3S 3IN A/T" },
  { code:"AXA", name:"CRF1100D3S IN A/T" },
  { code:"AZ0", name:"CT125AP IN M/T" },
  { code:"BB0", name:"CMX1100DR 3IN A/T" },
  { code:"BB1", name:"CMX1100DS IN A/T" },
  { code:"BD1", name:"KIRANA" },
  { code:"BF3", name:"KARISMA 125 D" },
  { code:"BN1", name:"" },
  { code:"BP0", name:"SUPRA X 125 DRUM BRAKE" },
  { code:"BR0", name:"SUPRA X 125 DISK BRAKE" },
  { code:"BR1", name:"SUPRA X 125 DISK BRAKE" },
  { code:"BS0", name:"SUPRA X 125-R" },
  { code:"BS1", name:"SUPRA X 125-R" },
  { code:"BU0", name:"MEGA PRO CAST WHEEL" },
  { code:"BV0", name:"SUPRA FIT TROMOL" },
  { code:"BV1", name:"SUPRA FIT TROMOL" },
  { code:"BV2", name:"SUPRA FIT TROMOL" },
  { code:"BV3", name:"SUPRA FIT TROMOL" },
  { code:"BW0", name:"SUPRA FIT DISKBRAKE" },
  { code:"BW1", name:"SUPRA FIT DISKBRAKE" },
  { code:"BX0", name:"SUPRA X 125 PGM FI" },
  { code:"BX1", name:"SUPRA X 125 PGM FI" },
  { code:"BY0", name:"SUPRA X 125 PGM FI CW" },
  { code:"BY1", name:"SUPRA X 125 PGM FI CW" },
  { code:"CA0", name:"SUPRA FIT R" },
  { code:"CA1", name:"SUPRA FIT R" },
  { code:"CAA", name:"SUPRA FIT R" },
  { code:"CB0", name:"VARIO SW" },
  { code:"CB1", name:"VARIO SPOKE WHEEL" },
  { code:"CC0", name:"VARIO CW" },
  { code:"CC1", name:"VARIO CAST WHEEL" },
  { code:"CC2", name:"VARIO CAST WHEEL" },
  { code:"CD0", name:"SUPRA X  DOUBLE DISKBRAKE" },
  { code:"CE0", name:"REVO DISK BRAKE" },
  { code:"CE1", name:"REVO DISK BRAKE" },
  { code:"CF0", name:"REVO CAST WHEEL TEST" },
  { code:"CF1", name:"REVO CAST WHEEL" },
  { code:"CG0", name:"SUPRA X 125 DISK BRAKE" },
  { code:"CG1", name:"SUPRA X 125 DISK BRAKE" },
  { code:"CG2", name:"SUPRA X 125 DISK BRAKE" },
  { code:"CG3", name:"SUPRA X 125 DISK BRAKE" },
  { code:"CG4", name:"SUPRA X 125 DISK BRAKE" },
  { code:"CG5", name:"SUPRA X 125 DISK BRAKE" },
  { code:"CH0", name:"SUPRA X 125 R DD" },
  { code:"CH1", name:"SUPRA X 125 R DD" },
  { code:"CH2", name:"SUPRA X 125 R DD" },
  { code:"CH3", name:"SUPRA X 125 R DD" },
  { code:"CH4", name:"SUPRA X 125 R DD" },
  { code:"CH5", name:"SUPRA CAST WHELL MMC" },
  { code:"CJ0", name:"SUPRA X 125 PGM FI CW DD" },
  { code:"CJ1", name:"SUPRA X 125 PGM FI CW DD" },
  { code:"CJ2", name:"SUPRA X 125 PGM FI CW DD" },
  { code:"CK0", name:"SUPRA FIT X TEST" },
  { code:"CL0", name:"CS1" },
  { code:"CL1", name:"CS1" },
  { code:"CM0", name:"BEAT" },
  { code:"CM1", name:"BEAT" },
  { code:"CN0", name:"BLADE" },
  { code:"CN1", name:"BLADE" },
  { code:"CNA", name:"BLADE REPSOL" },
  { code:"CNB", name:"BLADE REPSOL" },
  { code:"CP0", name:"ABSOLUTE REVO 110 SW" },
  { code:"CP1", name:"REVO 110 SPOKE WHEEL" },
  { code:"CR0", name:"ABSOLUTE REVO 110 CW" },
  { code:"CR1", name:"REVO 110 CAST WHEEL" },
  { code:"CRA", name:"ABSOLUTE REVO 110 DX" },
  { code:"CRB", name:"ABSOLUTE REVO 110 DX" },
  { code:"CT0", name:"VARIO TECHNO" },
  { code:"CV0", name:"NEW BEAT SPOKE WHEEL" },
  { code:"CV1", name:"NEW BEAT SPOKE WHEEL" },
  { code:"CV2", name:"NEW BEAT SPOKE WHEEL" },
  { code:"CX0", name:"NEW BEAT CAST WHEEL" },
  { code:"CX1", name:"NEW BEAT CAST WHEEL" },
  { code:"CX2", name:"NEW BEAT CAST WHEEL" },
  { code:"CY0", name:"REVO AT" },
  { code:"CZ0", name:"SCOOPY" },
  { code:"CZ1", name:"SCOOPY" },
  { code:"DA0", name:"MEGA PRO STD" },
  { code:"DA1", name:"MEGA PRO STD" },
  { code:"DA2", name:"MEGA PRO STD" },
  { code:"DB0", name:"MEGA PRO CW" },
  { code:"DB1", name:"MEGA PRO CW" },
  { code:"DB2", name:"MEGA PRO CW" },
  { code:"DBA", name:"MEGA PRO CW" },
  { code:"DC0", name:"TIGER STD" },
  { code:"DD0", name:"TIGER CAST WHEEL" },
  { code:"DD1", name:"TIGER CAST WHEEL" },
  { code:"DD2", name:"TIGER CAST WHEEL" },
  { code:"DDA", name:"NEW TIGER SH" },
  { code:"DDB", name:"TIGER CAST WHEEL" },
  { code:"DE0", name:"NEW MEGA PRO STD" },
  { code:"DE1", name:"NEW MEGA PRO STD" },
  { code:"DF0", name:"NEW MEGA PRO CW" },
  { code:"DF1", name:"NEW MEGA PRO CW" },
  { code:"DG0", name:"CBR 250R STD" },
  { code:"DG1", name:"CBR 250R STD" },
  { code:"DGA", name:"CBR 250R STD" },
  { code:"DH0", name:"CBR 250R ABS" },
  { code:"DH1", name:"CBR 250R ABS" },
  { code:"DHA", name:"CBR 250R ABS" },
  { code:"DJ0", name:"CBR 150R" },
  { code:"DJ1", name:"CBR 150R" },
  { code:"DJA", name:"CBR 150R" },
  { code:"DJB", name:"CBR 150R" },
  { code:"DJC", name:"CBR 150R" },
  { code:"DK0", name:"CB150R" },
  { code:"DK1", name:"CB150R" },
  { code:"DK2", name:"CB150R" },
  { code:"DL0", name:"MEGA PRO CW FI" },
  { code:"DM0", name:"NEW SPORT LS150 CW" },
  { code:"DM1", name:"NEW SPORT LS150 CW" },
  { code:"DM2", name:"VERZA CAST WHEEL" },
  { code:"DN0", name:"NEW SPORT LS150 SW" },
  { code:"DN1", name:"NEW SPORT LS150 SW" },
  { code:"DN2", name:"VERZA SPOKE WHEEL" },
  { code:"DP0", name:"ALL NEW CBR150R" },
  { code:"DPA", name:"ALL NEW CBR150R" },
  { code:"DPB", name:"ALL NEW CBR150R" },
  { code:"DR0", name:"NEW CBR 250R STD" },
  { code:"DRA", name:"NEW CBR 250R STD" },
  { code:"DRB", name:"NEW CBR 250R STD" },
  { code:"DS0", name:"NEW CBR 250R ABS" },
  { code:"DSA", name:"NEW CBR 250R ABS" },
  { code:"DSB", name:"NEW CBR 250R ABS" },
  { code:"DSC", name:"NEW CBR 250R ABS" },
  { code:"DT0", name:"NEW PCX 150" },
  { code:"DV0", name:"ALL NEW CB150R STREETFIRE" },
  { code:"DV2", name:"NEW CB150R STREETFIRE" },
  { code:"DV3", name:"CB150R STREETFIRE" },
  { code:"DW0", name:"CB650F" },
  { code:"DW1", name:"CB650F ABS" },
  { code:"DW2", name:"CB650F" },
  { code:"DW3", name:"CB650F" },
  { code:"DW4", name:"CB650F" },
  { code:"DW5", name:"CB650F" },
  { code:"DX0", name:"CBR650F" },
  { code:"DXA", name:"CBR650F" },
  { code:"DY0", name:"ALL NEW CB150R STREETFIRE SE" },
  { code:"DY1", name:"NEW CB150R STREETFIRE" },
  { code:"DY2", name:"CB150R STREETFIRE" },
  { code:"DYA", name:"ALL NEW CB150R STREETFIRE SE" },
  { code:"DYB", name:"NEW CB150R STREETFIRE" },
  { code:"DYC", name:"CB150R STREETFIRE" },
  { code:"DZ0", name:"CBR1000RR" },
  { code:"EB0", name:"CB500F" },
  { code:"EB1", name:"CB500F STANDARD" },
  { code:"EBA", name:"CB500F ABS" },
  { code:"EBB", name:"CB500F" },
  { code:"EBC", name:"CB500F" },
  { code:"EC0", name:"CB500X" },
  { code:"EC1", name:"CB500X ABS" },
  { code:"EC2", name:"CB500X" },
  { code:"EC3", name:"CB500X" },
  { code:"ED0", name:"ALL NEW CBR 150R" },
  { code:"ED3", name:"NEW CBR 150R" },
  { code:"ED4", name:"CBR 150R" },
  { code:"EDA", name:"ALL NEW CBR 150R" },
  { code:"EDB", name:"ALL NEW CBR 150R" },
  { code:"EDE", name:"NEW CBR 150R" },
  { code:"EDF", name:"NEW CBR 150R" },
  { code:"EDG", name:"CBR 150R" },
  { code:"EDH", name:"CBR 150R" },
  { code:"EE0", name:"CRF250RALLY" },
  { code:"EE1", name:"CRF250RALLY" },
  { code:"EE2", name:"CRF250RLK" },
  { code:"EF0", name:"CMX500 REBEL" },
  { code:"EF1", name:"CMX500AK" },
  { code:"EF2", name:"CMX500 REBEL" },
  { code:"EG0", name:"CB150 VERZA CW" },
  { code:"EG1", name:"CB150 VERZA CW" },
  { code:"EG2", name:"CB150 VERZA CW" },
  { code:"EH0", name:"CB150 VERZA SW" },
  { code:"EH1", name:"CB150 VERZA SW" },
  { code:"EH2", name:"CB150 VERZA SW" },
  { code:"EJ0", name:"ADV750 ED" },
  { code:"EJA", name:"ADV750 2ED" },
  { code:"EK0", name:"NEW CBR 250RR STD" },
  { code:"EK2", name:"NEW CBR250RR STD" },
  { code:"EKA", name:"NEW CBR 250RR STD" },
  { code:"EKC", name:"NEW CBR 250RR STD" },
  { code:"EKH", name:"NEW CBR250RR STD" },
  { code:"EKJ", name:"NEW CBR250RR STD" },
  { code:"EKK", name:"NEW CBR250RR STD" },
  { code:"EL0", name:"NEW CBR 250RR ABS" },
  { code:"EL2", name:"NEW CBR250RR ABS" },
  { code:"ELA", name:"NEW CBR 250RR ABS" },
  { code:"ELB", name:"NEW CBR 250RR ABS" },
  { code:"ELC", name:"NEW CBR 250RR ABS" },
  { code:"ELD", name:"NEW CBR 250RR ABS" },
  { code:"ELH", name:"NEW CBR250RR ABS" },
  { code:"ELJ", name:"NEW CBR250RR ABS" },
  { code:"EM0", name:"CBR500R ABS" },
  { code:"EM1", name:"CBR500R" },
  { code:"EM2", name:"CBR500R" },
  { code:"EMA", name:"CBR500R ABS" },
  { code:"EMB", name:"CBR500R" },
  { code:"EN0", name:"CRF1000A" },
  { code:"EN1", name:"CRF1000A" },
  { code:"EN2", name:"CRF1000ALJ" },
  { code:"EN3", name:"CRF1000ALK" },
  { code:"EP0", name:"CRF1000D" },
  { code:"EP1", name:"CRF1000D" },
  { code:"EP2", name:"CRF1000DLJ 3IN A/T" },
  { code:"EP3", name:"CRF1000DLK" },
  { code:"EPA", name:"CRF1000DL2J 4IN A/T" },
  { code:"EPB", name:"CRF1000DL2K" },
  { code:"ER2", name:"CBR1000RR" },
  { code:"ER3", name:"CBR1000RR SP1" },
  { code:"ER4", name:"CBR1000RR SP1" },
  { code:"ES0", name:"CRF150L" },
  { code:"ES1", name:"CRF150L" },
  { code:"ES2", name:"CRF150L" },
  { code:"ES3", name:"CRF150L" },
  { code:"ES4", name:"CRF150L" },
  { code:"ES5", name:"CRF150L" },
  { code:"ES6", name:"CRF150L" },
  { code:"ES7", name:"CRF150L" },
  { code:"ESE", name:"CRF150L" },
  { code:"ESF", name:"CRF150L" },
  { code:"ESK", name:"CRF150L" },
  { code:"ESL", name:"CRF150L" },
  { code:"ET0", name:"GOLD WING" },
  { code:"ET1", name:"GOLD WING" },
  { code:"ET2", name:"GL1800DM 3IN A/T" },
  { code:"ET3", name:"GL1800DN 3IN A/T" },
  { code:"ET4", name:"GL1800DP 3IN A/T" },
  { code:"ET5", name:"GL1800DR 3IN A/T" },
  { code:"ET6", name:"GL1800DAS 2IN A/T" },
  { code:"EV0", name:"CB150R STREETFIRE" },
  { code:"EV1", name:"CB150R STREETFIRE" },
  { code:"EW0", name:"CB150R STREETFIRE" },
  { code:"EW2", name:"CB150R STREETFIRE" },
  { code:"EWA", name:"CB150R STREETFIRE" },
  { code:"EWB", name:"CB150R STREETFIRE" },
  { code:"EWD", name:"CB150R STREETFIRE" },
  { code:"EWE", name:"CB150R STREETFIRE" },
  { code:"EX0", name:"CBR 150R STD" },
  { code:"EX3", name:"CBR 150R STD" },
  { code:"EXA", name:"CBR 150R STD" },
  { code:"EXB", name:"CBR 150R STD" },
  { code:"EXE", name:"CBR 150R STD" },
  { code:"EXF", name:"CBR 150R STD" },
  { code:"EXG", name:"CBR 150R STD" },
  { code:"EY0", name:"CBR 150R ABS" },
  { code:"EY1", name:"CBR 150R ABS" },
  { code:"EYA", name:"CBR 150R ABS" },
  { code:"EYB", name:"CBR 150R ABS" },
  { code:"EYE", name:"CBR 150R ABS" },
  { code:"EYF", name:"CBR 150R ABS" },
  { code:"EYG", name:"CBR 150R ABS" },
  { code:"EZ0", name:"Z125" },
  { code:"FA0", name:"PCX" },
  { code:"FB0", name:"NSS250AM IN A/T" },
  { code:"FB1", name:"NSS250AP IN A/T" },
  { code:"FB2", name:"NSS250AS IN A/T" },
  { code:"FC0", name:"VARIO TECHNO NON CBS" },
  { code:"FC1", name:"VARIO TECHNO NON CBS" },
  { code:"FD0", name:"NEW VARIO TECHNO CBS" },
  { code:"FD1", name:"NEW VARIO TECHNO CBS" },
  { code:"FE0", name:"NEW VARIO" },
  { code:"FE1", name:"NEW VARIO" },
  { code:"FE2", name:"NEW VARIO" },
  { code:"FF0", name:"REVO FIT" },
  { code:"FF1", name:"REVO FIT" },
  { code:"FF2", name:"REVO FIT" },
  { code:"FG0", name:"REVO SPOKE" },
  { code:"FG1", name:"REVO SPOKE" },
  { code:"FG2", name:"REVO SPOKE MMC" },
  { code:"FH0", name:"REVO CW" },
  { code:"FH1", name:"REVO CW" },
  { code:"FH2", name:"REVO CW MMC" },
  { code:"FJ0", name:"SPACY SPOKE WHEEL" },
  { code:"FK0", name:"SPACY CAST WHEEL" },
  { code:"FL0", name:"SUPRA X 125 CW HELM IN" },
  { code:"FM0", name:"SUPRA X 125 HELM IN FI" },
  { code:"FM1", name:"SUPRA X 125 HELM IN FI" },
  { code:"FM2", name:"SUPRA X 125 HELM IN FI" },
  { code:"FM3", name:"SUPRA X 125 HELM IN FI" },
  { code:"FN0", name:"SCOOPY FI CLASSIC" },
  { code:"FNA", name:"SCOOPY FI" },
  { code:"FP0", name:"BLADE" },
  { code:"FP1", name:"BLADE R" },
  { code:"FPA", name:"BLADE REPSOL" },
  { code:"FR0", name:"SPACY CW HELM IN FI" },
  { code:"FR1", name:"SPACY CW HELM IN FI" },
  { code:"FR2", name:"SPACY CW HELM IN FI" },
  { code:"FS0", name:"NEW VARIO TECHNO PGM FI" },
  { code:"FS1", name:"NEW VARIO TECHNO PGM FI" },
  { code:"FT0", name:"NEW VARIO CBS PGM FI" },
  { code:"FV0", name:"BEAT FI SW" },
  { code:"FW0", name:"BEAT FI CW" },
  { code:"FX0", name:"BEAT FI CBS" },
  { code:"FY0", name:"PCX 150" },
  { code:"FZ0", name:"BLADE S" },
  { code:"GA0", name:"VARIO TECHNO 125 CBS ISS" },
  { code:"GB0", name:"REVO FI" },
  { code:"GB1", name:"REVO FIT FI" },
  { code:"GB2", name:"REVO FIT" },
  { code:"GB3", name:"REVO FIT" },
  { code:"GB4", name:"REVO FIT" },
  { code:"GC0", name:"REVO FI" },
  { code:"GC1", name:"REVO SW FI" },
  { code:"GD0", name:"REVO FI" },
  { code:"GD1", name:"REVO CW FI" },
  { code:"GD2", name:"REVO X" },
  { code:"GD3", name:"REVO X" },
  { code:"GD4", name:"REVO X" },
  { code:"GE0", name:"SUPRA X 125 PGM-FI" },
  { code:"GE1", name:"NEW SUPRA X 125 SW FI" },
  { code:"GE2", name:"SUPRA X 125 SW MMC" },
  { code:"GE3", name:"SUPRA X 125 SW" },
  { code:"GE4", name:"SUPRA X 125 SW MMC" },
  { code:"GE5", name:"SUPRA X 125 SW" },
  { code:"GF0", name:"SUPRA X 125 PGM-FI" },
  { code:"GF1", name:"NEW SUPRA X 125 CW FI SA" },
  { code:"GF2", name:"SUPRA X 125 CW MMC" },
  { code:"GF3", name:"SUPRA X 125 CW" },
  { code:"GF4", name:"SUPRA X 125 CW MMC" },
  { code:"GF5", name:"SUPRA X 125 CW" },
  { code:"GFA", name:"NEW SUPRA X 125 CW FI SL" },
  { code:"GG0", name:"NEW BLADE S 125 FI" },
  { code:"GH0", name:"NEW BLADE R 125 FI" },
  { code:"GH1", name:"NEW BLADE 125 FI R STD" },
  { code:"GHA", name:"NEW BLADE R 125 FI" },
  { code:"GHB", name:"NEW BLADE 125 FI R RE" },
  { code:"GJ0", name:"VARIO FI" },
  { code:"GK0", name:"VARIO TECHNO 125 FI CBS" },
  { code:"GL0", name:"VARIO TECHNO 125 FI ISS" },
  { code:"GM0", name:"BEAT SW FI MMC" },
  { code:"GN0", name:"BEAT CW FI MMC" },
  { code:"GNA", name:"BEAT CW FI MMC" },
  { code:"GP0", name:"BEAT CBS FI MMC" },
  { code:"GPA", name:"BEAT CBS FI MMC" },
  { code:"GR0", name:"SCOOPY" },
  { code:"GRA", name:"SCOOPY" },
  { code:"GS0", name:"BEAT SPORTY CW" },
  { code:"GT0", name:"BEAT SPORTY CBS ISS" },
  { code:"GV0", name:"BEAT SPORTY CBS" },
  { code:"GW0", name:"Beat Pop CW" },
  { code:"GW1", name:"BEAT POP ESP CW PIXEL" },
  { code:"GW2", name:"BEAT POP ESP CW" },
  { code:"GWA", name:"BEAT POP ESP CW COMIC" },
  { code:"GX0", name:"Beat Pop CBS" },
  { code:"GX1", name:"BEAT POP ESP CBS PIXEL" },
  { code:"GX2", name:"BEAT POP ESP CBS" },
  { code:"GXA", name:"BEAT POP ESP CBS COMIC" },
  { code:"GY0", name:"Beat Pop CBS ISS" },
  { code:"GY1", name:"BEAT POP ESP CBS ISS PIXEL" },
  { code:"GY2", name:"BEAT POP ESP CBS-ISS" },
  { code:"GYA", name:"BEAT POP ESP CBS ISS" },
  { code:"GZ0", name:"New Vario 150 Sporty" },
  { code:"GZ1", name:"VARIO 150 MMC" },
  { code:"GZ3", name:"NEW VARIO 150" },
  { code:"GZA", name:"New Vario 150 Exclusive" },
  { code:"HA0", name:"NEW VARIO 125 CBS" },
  { code:"HA1", name:"VARIO 125 CBS MMC" },
  { code:"HA3", name:"NEW VARIO 125 CBS" },
  { code:"HB0", name:"NEW VARIO 125 CBS ISS" },
  { code:"HB1", name:"VARIO 125 CBS-ISS MMC" },
  { code:"HB2", name:"NEW VARIO 125 CBS-ISS" },
  { code:"HC0", name:"SCOOPY ESP" },
  { code:"HCA", name:"SCOOPY ESP SPORTY" },
  { code:"HD0", name:"ALL NEW SONIC 150 R" },
  { code:"HD2", name:"NEW SONIC 150R STANDARD" },
  { code:"HD4", name:"SONIC 150R" },
  { code:"HD5", name:"SONIC 150R" },
  { code:"HD7", name:"SONIC 150R" },
  { code:"HDA", name:"ALL NEW SONIC 150 R" },
  { code:"HDC", name:"NEW SONIC 150R REPSOL" },
  { code:"HDD", name:"NEW SONIC 150R SPECIAL" },
  { code:"HDG", name:"SONIC 150R HRR" },
  { code:"HDH", name:"SONIC 150R MATTE BLACK" },
  { code:"HDK", name:"SONIC 150R HRR" },
  { code:"HDL", name:"SONIC 150R MATTE BLACK" },
  { code:"HDN", name:"SONIC 150R HRR" },
  { code:"HDP", name:"SONIC 150R MATTE BLACK" },
  { code:"HE0", name:"New Vario eSP CBS" },
  { code:"HE1", name:"VARIO ESP CBS MMC" },
  { code:"HE2", name:"VARIO 110 CBS" },
  { code:"HEA", name:"New Vario eSP CBS Adv" },
  { code:"HEB", name:"VARIO ESP CBS ADV MMC" },
  { code:"HEC", name:"VARIO 110 CBS" },
  { code:"HF0", name:"New Vario eSP CBS ISS" },
  { code:"HF1", name:"VARIO ESP CBS ISS MMC" },
  { code:"HF2", name:"VARIO 110 CBS ISS" },
  { code:"HFA", name:"New Vario eSP CBS ISS Adv" },
  { code:"HFB", name:"VARIO ESP CBS ISS ADV MMC" },
  { code:"HFC", name:"VARIO 110 CBS ISS" },
  { code:"HG0", name:"NM4 VULTUS" },
  { code:"HH0", name:"NEW PCX 150" },
  { code:"HH1", name:"PCX 150" },
  { code:"HH2", name:"PCX 150" },
  { code:"HJ0", name:"ALL NEW SUPRA GTR 150 SPORTY" },
  { code:"HJ3", name:"NEW SUPRA GTR150 SPORTY" },
  { code:"HJ6", name:"NEW SUPRA GTR150 SPORTY" },
  { code:"HJ9", name:"NEW SUPRA GTR150 SPORTY" },
  { code:"HJA", name:"ALL NEW SUPRA GTR 150 EXCLUSIVE" },
  { code:"HJD", name:"NEW SUPRA GTR150 EXCLUSIVE" },
  { code:"HJG", name:"NEW SUPRA GTR150 EXCLUSIVE" },
  { code:"HJK", name:"NEW SUPRA GTR 150 EXCLUSIVE" },
  { code:"HK0", name:"BEAT SPORTY CBS" },
  { code:"HK2", name:"BEAT SPORTY CBS" },
  { code:"HK4", name:"BEAT SPORTY CBS" },
  { code:"HK6", name:"BEAT SPORTY CBS" },
  { code:"HL0", name:"BEAT SPORTY CBS ISS" },
  { code:"HL4", name:"BEAT SPORTY CBS ISS" },
  { code:"HL6", name:"BEAT SPORTY CBS ISS" },
  { code:"HL9", name:"BEAT SPORTY CBS ISS" },
  { code:"HM0", name:"BEAT SPORTY CW" },
  { code:"HM3", name:"BEAT SPORTY CW" },
  { code:"HM5", name:"BEAT SPORTY CW" },
  { code:"HM7", name:"BEAT SPORTY CW" },
  { code:"HN0", name:"BEAT STREET CBS" },
  { code:"HN1", name:"BEAT STREET CBS" },
  { code:"HN2", name:"BEAT STREET CBS" },
  { code:"HN3", name:"BEAT STREET" },
  { code:"HN4", name:"BEAT STREET CBS" },
  { code:"HP0", name:"ALL NEW SCOOPY STYLISH" },
  { code:"HP1", name:"ALL NEW SCOOPY STYLISH" },
  { code:"HP2", name:"ALL NEW SCOOPY STYLISH" },
  { code:"HPA", name:"ALL NEW SCOOPY SPORTY" },
  { code:"HPB", name:"ALL NEW SCOOPY PLAYFUL" },
  { code:"HPC", name:"ALL NEW SCOOPY SPORTY" },
  { code:"HPD", name:"ALL NEW SCOOPY SPORTY" },
  { code:"HR0", name:"SH 150" },
  { code:"HR1", name:"SH150ADK IN A/T" },
  { code:"HS0", name:"NEW PCX 150 CBS" },
  { code:"HS1", name:"NEW PCX 150 CBS" },
  { code:"HS2", name:"NEW PCX 150 CBS" },
  { code:"HT0", name:"NEW PCX 150 ABS" },
  { code:"HT1", name:"NEW PCX 150 ABS" },
  { code:"HT2", name:"NEW PCX 150 ABS" },
  { code:"HV0", name:"PCX Hybrid" },
  { code:"HW0", name:"VARIO 150" },
  { code:"HW3", name:"VARIO 150" },
  { code:"HW4", name:"VARIO 150" },
  { code:"HWC", name:"VARIO 150" },
  { code:"HWD", name:"VARIO 150" },
  { code:"HY0", name:"VARIO 125 CBS" },
  { code:"HY2", name:"VARIO 125 CBS" },
  { code:"HY3", name:"VARIO 125 CBS" },
  { code:"HY4", name:"VARIO 125 CBS" },
  { code:"HZ0", name:"VARIO 125 CBS ISS" },
  { code:"HZ1", name:"VARIO 125 CBS ISS" },
  { code:"HZ3", name:"VARIO 125 CBS ISS" },
  { code:"HZ4", name:"VARIO 125 CBS ISS" },
  { code:"HZA", name:"VARIO 125 CBS ISS" },
  { code:"JA0", name:"CB500F" },
  { code:"JB0", name:"CBR500RAK IN M/T" },
  { code:"JC0", name:"CB500XAK" },
  { code:"JC1", name:"CB500XAN IN M/T" },
  { code:"JD0", name:"CBR650RAK IN M/T" },
  { code:"JD1", name:"CB650RAM IN M/T" },
  { code:"JD2", name:"CB650RAN IN M/T" },
  { code:"JD3", name:"CB650RAP IN M/T" },
  { code:"JDA", name:"CB650RAP IN M/T" },
  { code:"JE0", name:"CBR 250RR STD" },
  { code:"JE1", name:"CBR 250RR STD" },
  { code:"JE2", name:"CBR 250RR STD" },
  { code:"JF0", name:"CBR 250RR ABS" },
  { code:"JF1", name:"CBR 250RR ABS" },
  { code:"JF2", name:"CBR 250RR ABS" },
  { code:"JG0", name:"CBR 250RR ABS+QS" },
  { code:"JG1", name:"CBR 250RR ABS+QS" },
  { code:"JG2", name:"CBR 250RR ABS+QS" },
  { code:"JG3", name:"CBR 250RR ABS+QS" },
  { code:"JG4", name:"CBR 250RR ABS+QS" },
  { code:"JH0", name:"CRF1100AL2L 2IN M/T" },
  { code:"JH1", name:"CRF1100AL2M 2IN M/T" },
  { code:"JH2", name:"CRF1100AL2N 3IN M/T" },
  { code:"JH3", name:"CRF1100AL2P 3IN M/T" },
  { code:"JJ0", name:"CRF1100DL2L 2IN A/T" },
  { code:"JJ1", name:"CRF1100DL2M 2IN A/T" },
  { code:"JJ2", name:"CRF1100DL2N 3IN A/T" },
  { code:"JJ3", name:"CRF1100DL2P 3IN A/T" },
  { code:"JK0", name:"CBR1000SPL 2IN M/T" },
  { code:"JK1", name:"CBR1000SPN 3IN M/T" },
  { code:"JL0", name:"CBR1000STL IN M/T" },
  { code:"JL1", name:"CBR1000STR 2IN M/T" },
  { code:"JM0", name:"CBR 150R STD" },
  { code:"JM1", name:"CBR 150R STD" },
  { code:"JM2", name:"CBR 150R STD" },
  { code:"JMA", name:"CBR 150R STD" },
  { code:"JMB", name:"CBR 150R STD" },
  { code:"JMC", name:"CBR 150R STD" },
  { code:"JMG", name:"CBR 150R STD" },
  { code:"JMH", name:"CBR 150R STD" },
  { code:"JMJ", name:"CBR 150R STD" },
  { code:"JML", name:"CBR 150R STD" },
  { code:"JMM", name:"CBR 150R STD" },
  { code:"JN0", name:"CBR 150R ABS" },
  { code:"JN1", name:"CBR 150R ABS" },
  { code:"JNA", name:"CBR 150R ABS" },
  { code:"JNB", name:"CBR 150R ABS" },
  { code:"JNC", name:"CBR 150R ABS" },
  { code:"JND", name:"CBR 150R ABS" },
  { code:"JNS", name:"CBR 150R ABS" },
  { code:"JNT", name:"CBR 150R ABS" },
  { code:"JNU", name:"CBR 150R ABS" },
  { code:"JP0", name:"CBR 600 TRICOLOR" },
  { code:"JR0", name:"CB150R STREETFIRE" },
  { code:"JS0", name:"CB150R STREETFIRE" },
  { code:"JT0", name:"CRF250LRM IN M/T" },
  { code:"JT1", name:"CRF250LRP IN M/T" },
  { code:"JT2", name:"CRF250LRAS IN M/T" },
  { code:"JTA", name:"CRF250LP IN M/T" },
  { code:"JTB", name:"CRF250LAS IN M/T" },
  { code:"JV0", name:"CMX500AM IN M/T" },
  { code:"JV1", name:"CMX500AN IN M/T" },
  { code:"JV2", name:"CMX500AP IN M/T" },
  { code:"JV3", name:"CMX500AS IN M/T" },
  { code:"JX0", name:"CB150X STD" },
  { code:"JXA", name:"CB150X SE" },
  { code:"JY0", name:"Z125MAN IN M/T" },
  { code:"JY1", name:"Z125MAS IN M/T" },
  { code:"JYA", name:"Z125MAN 2IN M/T" },
  { code:"JZ0", name:"ST125AP IN M/T" },
  { code:"JZ1", name:"ST125AS IN M/T" },
  { code:"KA0", name:"CBR 250RR STD" },
  { code:"KAA", name:"CBR 250RR STD" },
  { code:"KB0", name:"CBR 250RR ABS" },
  { code:"KC0", name:"CBR 250RR ABS+QS" },
  { code:"KCA", name:"CBR 250RR ABS+QS" },
  { code:"KCB", name:"CBR 250RR ABS+QS" },
  { code:"KE0", name:"CBR 150R ABS" },
  { code:"KEA", name:"CBR 150R ABS" },
  { code:"KF0", name:"CB150 VERZA SW" },
  { code:"KG0", name:"CB150 VERZA CW" },
  { code:"LA0", name:"SUPER CUB C125" },
  { code:"LB0", name:"FORZA" },
  { code:"LC0", name:"PCX ELECTRIC" },
  { code:"LD0", name:"GENIO CBS" },
  { code:"LD2", name:"GENIO CBS" },
  { code:"LE0", name:"GENIO CBS ISS" },
  { code:"LE1", name:"GENIO CBS ISS" },
  { code:"LEA", name:"GENIO CBS ISS SE" },
  { code:"LF0", name:"ADV150 CBS" },
  { code:"LF1", name:"ADV150 CBS" },
  { code:"LFE", name:"ADV150 CBS" },
  { code:"LG0", name:"ADV150 ABS" },
  { code:"LG1", name:"ADV150 ABS" },
  { code:"LG9", name:"ADV150 ABS TEST" },
  { code:"LGC", name:"ADV150 ABS" },
  { code:"LH0", name:"BEAT SPORTY CBS" },
  { code:"LH1", name:"BEAT SPORTY CBS" },
  { code:"LH2", name:"BEAT SPORTY CBS" },
  { code:"LJ0", name:"BEAT STREET" },
  { code:"LJ1", name:"BEAT STREET" },
  { code:"LJ2", name:"BEAT STREET" },
  { code:"LK0", name:"BEAT SPORTY CBS ISS" },
  { code:"LK1", name:"BEAT SPORTY CBS ISS" },
  { code:"LK2", name:"BEAT SPORTY CBS ISS DELUXE" },
  { code:"LKA", name:"BEAT SPORTY CBS ISS DELUXE" },
  { code:"LKC", name:"BEAT SPORTY CBS ISS DELUXE" },
  { code:"LM0", name:"CT125AM IN M/T" },
  { code:"LN0", name:"NEW SCOOPY SPORTY" },
  { code:"LN1", name:"NEW SCOOPY SPORTY" },
  { code:"LN2", name:"NEW SCOOPY SPORTY" },
  { code:"LN3", name:"NEW SCOOPY SPORTY" },
  { code:"LNA", name:"NEW SCOOPY FASHION" },
  { code:"LNE", name:"NEW SCOOPY FASHION" },
  { code:"LNG", name:"NEW SCOOPY FASHION" },
  { code:"LNJ", name:"NEW SCOOPY FASHION" },
  { code:"LP0", name:"NEW SCOOPY PRESTIGE" },
  { code:"LP1", name:"NEW SCOOPY PRESTIGE" },
  { code:"LP2", name:"NEW SCOOPY PRESTIGE" },
  { code:"LP3", name:"NEW SCOOPY PRESTIGE" },
  { code:"LPA", name:"NEW SCOOPY STYLISH" },
  { code:"LPB", name:"NEW SCOOPY STYLISH" },
  { code:"LPC", name:"NEW SCOOPY STYLISH" },
  { code:"LPD", name:"NEW SCOOPY STYLISH" },
  { code:"LR0", name:"PCX160 CBS" },
  { code:"LR1", name:"PCX 160 CBS" },
  { code:"LS0", name:"PCX160 ABS" },
  { code:"LS1", name:"PCX 160 ABS" },
  { code:"LT0", name:"PCX160 e:HEV" },
  { code:"LV0", name:"VARIO 160 CBS" },
  { code:"LV1", name:"VARIO 160 CBS" },
  { code:"LVA", name:"VARIO 160 CBS" },
  { code:"LVE", name:"VARIO 160 CBS" },
  { code:"LW0", name:"VARIO 160 ABS" },
  { code:"LW1", name:"VARIO 160 ABS" },
  { code:"LWA", name:"VARIO 160 ABS" },
  { code:"LY0", name:"GENIO CBS" },
  { code:"LY1", name:"GENIO CBS" },
  { code:"LY2", name:"GENIO CBS" },
  { code:"LZ0", name:"GENIO CBS ISS" },
  { code:"LZ1", name:"GENIO CBS ISS" },
  { code:"LZ2", name:"GENIO CBS ISS" },
  { code:"MA0", name:"ADV160 CBS" },
  { code:"MB0", name:"ADV160 ABS" },
  { code:"MC0", name:"VARIO 125 CBS" },
  { code:"MC1", name:"VARIO 125 CBS" },
  { code:"MD0", name:"VARIO 125 CBS ISS" },
  { code:"MD1", name:"VARIO 125 CBS ISS" },
  { code:"MDA", name:"VARIO 125 CBS ISS SP" },
  { code:"ME0", name:"EM1 E" },
  { code:"MF0", name:"STYLO 160 CBS" },
  { code:"MF1", name:"STYLO 160 CBS" },
  { code:"MG0", name:"STYLO 160 ABS" },
  { code:"MG1", name:"STYLO 160 ABS" },
  { code:"MGA", name:"STYLO 160 ABS SPECIAL" },
  { code:"MH0", name:"EM1 E: PLUS" },
  { code:"MJ0", name:"BEAT SPORTY CBS" },
  { code:"MJ1", name:"BEAT SPORTY CBS" },
  { code:"MJ2", name:"BEAT SPORTY CBS" },
  { code:"MK0", name:"BEAT SPORTY CBS ISS DELUXE" },
  { code:"MK1", name:"BEAT SPORTY CBS ISS DELUXE" },
  { code:"MK2", name:"BEAT SPORTY CBS ISS" },
  { code:"ML0", name:"BEAT SPORTY DLX SMART KEY" },
  { code:"ML1", name:"BEAT SPORTY DLX SMART KEY" },
  { code:"ML2", name:"BEAT SPORTY DLX SMART KEY" },
  { code:"MM0", name:"BEAT STREET" },
  { code:"MM1", name:"BEAT STREET" },
  { code:"MM2", name:"BEAT STREET" },
  { code:"MN0", name:"CUV E:" },
  { code:"MP0", name:"CUV E: ROADSYNC DUO" },
  { code:"MR0", name:"SCOOPY ENERGETIC" },
  { code:"MRA", name:"SCOOPY FASHION" },
  { code:"MRB", name:"SCOOPY FASHION" },
  { code:"MS0", name:"SCOOPY PRESTIGE" },
  { code:"MS1", name:"SCOOPY PRESTIGE" },
  { code:"MSA", name:"SCOOPY STYLISH" },
  { code:"MSB", name:"SCOOPY STYLISH" },
  { code:"MT0", name:"PCX160 CBS" },
  { code:"MT1", name:"PCX160 CBS" },
  { code:"MV0", name:"PCX160 ABS" },
  { code:"MV1", name:"PCX160 ABS" },
  { code:"MW0", name:"PCX160 ROADSYNC" },
  { code:"MW1", name:"PCX160 HONDA ROADSYNC" },
  { code:"MX0", name:"ICON E:" },
  { code:"MY0", name:"VARIO EVO 160 CBS NITRO" },
  { code:"MYA", name:"VARIO EVO 160 CBS" },
  { code:"MZ0", name:"VARIO EVO 160 ABS" },
  { code:"NA0", name:"ADV160 CBS" },
  { code:"NB0", name:"ADV160 ABS" },
  { code:"NC0", name:"ADV160 ROADSYNC" },
  { code:"ND0", name:"VARIO 125 CBS" },
  { code:"NE0", name:"VARIO 125 CBS ISS" },
  { code:"NF0", name:"VARIO 125 STREET" },
];

// dbo.mstcolor
const MST_COLOR = [
  { id: "CLR-95", code: "95", name: "PUTIH NO STRIPE" },
  { id: "CLR-11", code: "11", name: "HITAM" },
  { id: "CLR-21", code: "21", name: "MERAH" },
  { id: "CLR-33", code: "33", name: "BIRU" },
  { id: "CLR-44", code: "44", name: "SILVER" },
  { id: "CLR-55", code: "55", name: "MATTE BROWN" },
];

/* dbo.mstgeneralvalue - group BOOKINGTYPE ("Booking Type")
   Nilai asli dari SIRIS. Dropdown "Lokasi Layanan" di layar = group ini. */
const GV_BOOKINGTYPE = [
  { code: "BE", name: "AHASS" },
  { code: "AJ", name: "Antar Jemput" },
  { code: "HS", name: "Home Service" },
];

/* dbo.mstgeneralvalue - group BOOKINGCHANNEL ("Booking Channel") - nilai asli SIRIS */
const GV_CHANNELBOOKING = [
  { code: "TLP", name: "Telepon", display: "Telepon" },
  { code: "VST", name: "Kunjungan", display: "Kunjungan" },
];

/* dbo.mstgeneralvalue - group BOOKINGSTATUS - nilai asli SIRIS.
   Booking baru dibuat dengan statuscode '10'. */
export const GV_BOOKINGSTATUS = [
  { code: "10", name: "Open", display: "Belum Follow Up" },
  { code: "11", name: "Completed", display: "Selesai Service" },
  { code: "12", name: "ArrifalConfirm", display: "Konfirmasi Datang" },
  { code: "13", name: "Reschedule", display: "Ganti Jadwal Booking" },
  { code: "14", name: "Cancel", display: "Batal Booking" },
];

/* Mock session AHASS - dbo.mstdealer dealertype H2, sesuai user login.
   INTEGRASI: ambil dari session / JWT user yang login. */
/* Endpoint API pencarian kendaraan (query dbo.mstvehicle + join mstmotor & mstmotorcolor).
   Untuk demo lokal: jalankan live-search-api/server.js. Bila unreachable -> fallback ke UNITS contoh. */
export const SEARCH_API = "http://localhost:5180";

export const SESSION_DEALER = {
  ahmcode: "04663",
  nmscode: "NMS035",
  name: "Mitra Pinasthika Mulia",
  cityname: "KOTA SURABAYA",
  dealertype: "H2",
  ispos: false,
};

// user login aplikasi/web (untuk kolom audit modifiedby). Di produksi diisi dari session login.
export const SESSION_USER = "Pak Kabeng";

// tanggal hari ini (YYYY-MM-DD, waktu lokal) -> batas minimal booking (tidak boleh backdate)
const todayISO = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};

// tanggal panjang berbahasa Indonesia utk header modal slot jam
const ID_DAYS = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];
const ID_MONTHS = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];
const fmtDateLong = (iso) => {
  if (!iso) return { day: "", full: "" };
  const p = iso.split("-").map(Number);
  if (p.length !== 3) return { day: "", full: iso };
  const dt = new Date(p[0], p[1] - 1, p[2]);
  return { day: ID_DAYS[dt.getDay()], full: `${p[2]} ${ID_MONTHS[p[1] - 1]} ${p[0]}` };
};

const COUNTRY_CODES = [
  { code: "+62", name: "Indonesia", top: "#D80027", bottom: "#FFFFFF" },
  { code: "+670", name: "Timor-Leste", top: "#C8102E", bottom: "#111111" },
];

/* dbo.mstgeneralvalue - group code PREFIXPHONE ("Prefix No. HP")
   DATA ASLI, diambil dari PostgreSQL SIRIS 10.10.108.20:65432 pada 9 Sep 2026:
     select m2.name, m.code, m.name, m.display
     from dbo.mstgeneralvaluegroup m2
     join dbo.mstgeneralvalue m on m2.id = m.genvaluegroupid
     where m2.code = 'PREFIXPHONE' order by m.name asc
   39 baris / 6 operator. Bentuk kolomnya:
     code    = prefix internasional (62811)
     name    = nama provider  <- yang ditampilkan ke user
     display = prefix 3 digit tanpa 0 (811)
   INTEGRASI: ganti array ini dengan GET /master/generalvalue?group=PREFIXPHONE */
const GV_PREFIXPHONE = [
  { code: "62831", name: "AXIS", display: "831" },
  { code: "62832", name: "AXIS", display: "832" },
  { code: "62833", name: "AXIS", display: "833" },
  { code: "62838", name: "AXIS", display: "838" },
  { code: "62814", name: "Indosat", display: "814" },
  { code: "62815", name: "Indosat", display: "815" },
  { code: "62816", name: "Indosat", display: "816" },
  { code: "62855", name: "Indosat", display: "855" },
  { code: "62856", name: "Indosat", display: "856" },
  { code: "62857", name: "Indosat", display: "857" },
  { code: "62858", name: "Indosat", display: "858" },
  { code: "62881", name: "Smartfren", display: "881" },
  { code: "62882", name: "Smartfren", display: "882" },
  { code: "62883", name: "Smartfren", display: "883" },
  { code: "62884", name: "Smartfren", display: "884" },
  { code: "62885", name: "Smartfren", display: "885" },
  { code: "62886", name: "Smartfren", display: "886" },
  { code: "62887", name: "Smartfren", display: "887" },
  { code: "62888", name: "Smartfren", display: "888" },
  { code: "62889", name: "Smartfren", display: "889" },
  { code: "62811", name: "Telkomsel", display: "811" },
  { code: "62812", name: "Telkomsel", display: "812" },
  { code: "62813", name: "Telkomsel", display: "813" },
  { code: "62821", name: "Telkomsel", display: "821" },
  { code: "62822", name: "Telkomsel", display: "822" },
  { code: "62823", name: "Telkomsel", display: "823" },
  { code: "62852", name: "Telkomsel", display: "852" },
  { code: "62853", name: "Telkomsel", display: "853" },
  { code: "62895", name: "Tri (3)", display: "895" },
  { code: "62896", name: "Tri (3)", display: "896" },
  { code: "62897", name: "Tri (3)", display: "897" },
  { code: "62898", name: "Tri (3)", display: "898" },
  { code: "62899", name: "Tri (3)", display: "899" },
  { code: "62817", name: "XL Axiata", display: "817" },
  { code: "62818", name: "XL Axiata", display: "818" },
  { code: "62819", name: "XL Axiata", display: "819" },
  { code: "62859", name: "XL Axiata", display: "859" },
  { code: "62877", name: "XL Axiata", display: "877" },
  { code: "62878", name: "XL Axiata", display: "878" },
];

/* Normalkan ke 3 digit tanpa 0 / tanpa 62 supaya '0812', '62812' dan '812' sama.
   Pencocokan memakai code MAUPUN display, jadi tetap jalan walau di SIRIS
   yang terisi hanya salah satu kolomnya. */
const normPrefix = (v) => String(v ?? "").replace(/\D/g, "").replace(/^62/, "").replace(/^0+/, "").slice(0, 3);
const PREFIX_INDEX = GV_PREFIXPHONE.reduce((map, r) => {
  [r.code, r.display].forEach((v) => {
    const p = normPrefix(v);
    if (p.length === 3 && !map[p]) map[p] = r;
  });
  return map;
}, {});
/* null = digit belum cukup, undefined = tidak terdaftar, object = ketemu */
export function lookupProvider(phone) {
  const digits = String(phone ?? "").replace(/\D/g, "");
  if (digits.length < 3) return null;
  return PREFIX_INDEX[digits.slice(0, 3)];
}

/* Kendaraan konsumen - dummy meniru SNEMESIAGEN_CUSTOMER.dbo.mstvehicle + enrich SIRIS.
   Cari: policenumber (Plat, TRIM spasi) / machinenumber (Nomor Mesin) / framenumber (Nomor Rangka).
   Saat ditemukan, load: policenumber, machinenumber, framenumber, yearofass;
   Kode Tipe Unit = SIRIS.dbo.mstmotorahm.code (mstvehicle.motorid -> mstmotor.motorahmid -> mstmotorahm),
   Market Name = SIRIS.dbo.mstmotor.name (mstvehicle.motorid),
   Warna = SIRIS.dbo.mstcolor (mstvehicle.motorcolorid).
   Integrasi: GET /unit/search?by=policenumber|machinenumber|framenumber&q= */
const UNITS = [
  {
    unitid: "UNT-0001",
    policenumber: "L 1234 ABC",
    machinenumber: "JFDE1E1234567",
    framenumber: "MH1JFD119LK123456",
    twodigitcode: "VG",
    assemblyyear: "2023",
    marketname: "VARIO 125 CBS ISS",
    colorcode: "11",
    motorsegment: "MATIC", motorcategory: "MID",
    stnk: {
      fullname: "Andi Pratama", firstname: "Andi", lastname: "Pratama", nik: "3578011203900001",
      address1: "Jl. Airlangga No. 12", address2: "RT 03/RW 05", postalcode: "60286",
      geoprovinceid: "3500", provincename: "Jawa Timur", geocityid: "3578", cityname: "Kota Surabaya",
      geodistrictid: "357808", districtname: "Gubeng", geovillageid: "3578080003", villagename: "Airlangga",
    },
  },
  {
    unitid: "UNT-0002",
    policenumber: "L 5678 XYZ",
    machinenumber: "KF11E7654321",
    framenumber: "MH1KF1119PK654321",
    twodigitcode: "KF",
    assemblyyear: "2024",
    marketname: "PCX 160 CBS",
    colorcode: "44",
    motorsegment: "MATIC", motorcategory: "HIGH",
    stnk: {
      fullname: "Rina Kusuma", firstname: "Rina", lastname: "Kusuma", nik: "3515024506920002",
      address1: "Jl. Kutilang No. 7", address2: "RT 01/RW 02", postalcode: "61256",
      geoprovinceid: "5300", provincename: "Nusa Tenggara Timur", geocityid: "5371", cityname: "Kota Kupang",
      geodistrictid: "537101", districtname: "Alak", geovillageid: "5371010008", villagename: "Alak",
    },
  },
  {
    unitid: "UNT-0003",
    policenumber: "N 4321 DEF",
    machinenumber: "JM01E1122334",
    framenumber: "MH1JM0119MK112233",
    twodigitcode: "JM",
    assemblyyear: "2022",
    marketname: "SCOOPY STYLUS",
    colorcode: "55",
    motorsegment: "MATIC", motorcategory: "LOW",
    stnk: {
      fullname: "Bagus Santoso", firstname: "Bagus", lastname: "Santoso", nik: "3573010101880003",
      address1: "Jl. Ijen No. 45", address2: "RT 02/RW 01", postalcode: "65119",
      geoprovinceid: "3500", provincename: "Jawa Timur", geocityid: "3573", cityname: "Kota Malang",
      geodistrictid: "357302", districtname: "Klojen", geovillageid: "3573020009", villagename: "Bareng",
    },
  },
];

/* Slot jam - integrasi: GET /booking/homeservice/slot?date=&dealerId= */
// Slot jam booking (per jam). id = dbo.mstbookingslothour.id (placeholder di mockup),
// time = range starttime-endtime, quota = sisa slot (0 = penuh). bookingtime menyimpan label range.
const TIME_SLOTS = [
  { id: "slothour-0800", time: "08:00 - 09:00", quota: 1 },
  { id: "slothour-0900", time: "09:00 - 10:00", quota: 1 },
  { id: "slothour-1000", time: "10:00 - 11:00", quota: 1 },
  { id: "slothour-1100", time: "11:00 - 12:00", quota: 1 },
  { id: "slothour-1300", time: "13:00 - 14:00", quota: 2 },
  { id: "slothour-1400", time: "14:00 - 15:00", quota: 0 },
  { id: "slothour-1500", time: "15:00 - 16:00", quota: 3 },
];

// ==== Langkah 2: master mekanik / jasa service / spare part (DUMMY - nanti bind ke tabel master) ====
const MST_MECHANIC = [
  { id: "MK-001", name: "Budi Santoso" },
  { id: "MK-002", name: "Andi Wijaya" },
  { id: "MK-003", name: "Rudi Hartono" },
  { id: "MK-004", name: "Slamet Riyadi" },
  { id: "MK-005", name: "Joko Susilo" },
];
// LEVEL 1: paket = dbo.mstservicepackage (code=jobid, name, estimatetime=estimasi menit).
// Light repair TIDAK ada di pilihan: otomatis ter-load saat pilih part yang di-mapping ke jasa Light repair.
const MST_SERVICE_PKG = [
  { code: "06", name: "Paket Lengkap", estimatetime: 60 },
  { code: "07", name: "Paket ringan", estimatetime: 20 },
  { code: "11", name: "Ganti oli plus", estimatetime: 20 },
  { code: "09", name: "Heavy repair", estimatetime: 90 },
];
// DUMMY setting: daftar jobid paket yang BOLEH muncul di "Tambah Pekerjaan Home Service".
// Di REAL: ambil dari SNEMESIAGEN_SETTING.dbo.mstsettingsdmsdtl (JOIN mstsettingsdms) per dealer (nmscode), tag1=jobid, isactive=true.
const HS_ALLOWED_PKG = ["06", "07", "11"]; // sementara: Paket Lengkap, Paket ringan, Ganti oli plus
// LEVEL 2: variant service = dbo.mstservice (pkgcode=servicepackage.jobid; name memuat segment-category).
// Di real: difilter oleh segment & category motor kendaraan booking (mstmotor.gvsegmentid/gvcategoryid); harga dari mstserviceprice.
const MST_SERVICE = [
  { code: "06U03302", pkgcode: "06", segment: "MATIC", category: "LOW", name: "Paket Lengkap - MATIC - LOW", price: 54000, discount: 0, duration: 10 },
  { code: "06U03102", pkgcode: "06", segment: "MATIC", category: "MID", name: "Paket Lengkap - MATIC - MID", price: 54000, discount: 0, duration: 10 },
  { code: "06U03202", pkgcode: "06", segment: "MATIC", category: "HIGH", name: "Paket Lengkap - MATIC - HIGH", price: 20000, discount: 0, duration: 10 },
  { code: "07U03302", pkgcode: "07", segment: "MATIC", category: "LOW", name: "Paket ringan - MATIC - LOW", price: 50000, discount: 8000, duration: 20 },
  { code: "07U03102", pkgcode: "07", segment: "MATIC", category: "MID", name: "Paket ringan - MATIC - MID", price: 55000, discount: 10000, duration: 20 },
  { code: "07U03202", pkgcode: "07", segment: "MATIC", category: "HIGH", name: "Paket ringan - MATIC - HIGH", price: 60000, discount: 0, duration: 20 },
  { code: "11U03101", pkgcode: "11", segment: "MATIC", category: "MID", name: "Ganti oli plus - MATIC - MID", price: 35000, discount: 5000, duration: 20 },
  { code: "11U03301", pkgcode: "11", segment: "MATIC", category: "LOW", name: "Ganti oli plus - MATIC - LOW", price: 32000, discount: 0, duration: 20 },
  { code: "11U03201", pkgcode: "11", segment: "MATIC", category: "HIGH", name: "Ganti oli plus - MATIC - HIGH", price: 38000, discount: 0, duration: 20 },
  { code: "09U03102", pkgcode: "09", segment: "MATIC", category: "MID", name: "Heavy repair - MATIC - MID", price: 150000, discount: 0, duration: 90 },
  { code: "07U01102", pkgcode: "07", segment: "CUB", category: "MID", name: "Paket ringan - CUB - MID", price: 45000, discount: 0, duration: 20 },
  { code: "07U02102", pkgcode: "07", segment: "SPORT", category: "MID", name: "Paket ringan - SPORT - MID", price: 65000, discount: 0, duration: 20 },
];
const svcLabel = (s) => `${s.code} - ${s.name}`;
// units[] = Kode Tipe Unit (twodigitcode) yg BERELASI dgn part ini (dummy mstpartkendaraan; real: mstpartkendaraan.kodetwodigit).
const MST_PART = [
  { code: "90545300000", name: "WASHER OIL BOLT", price: 16000, units: ["VG", "KF", "JM"] },
  { code: "90201KVBJ00", name: "BOLT, HEX 10MM", price: 11000, units: ["VG", "KF", "JM"] },
  { code: "15400KVBJ01", name: "Filter Oli", price: 22000, units: ["VG", "KF", "JM"] },
  { code: "31916KVBJ01", name: "Busi Standar (CPR9)", price: 25000, units: ["VG", "KF", "JM"] },
  { code: "23100KVBJ01", name: "V-Belt CVT", price: 120000, units: ["VG", "KF"] },
  { code: "22123KVBJ01", name: "Roller CVT (set)", price: 85000, units: ["VG", "KF"] },
];
// DUMMY part grup OIL + mapping ke unit (seolah SIRIS.dbo.mstpartkendaraan sudah terisi).
// Di REAL: mstpartkendaraan (kodetwodigit = Kode Tipe Unit) JOIN mstpart JOIN mstpartgroup (name='OIL'); harga dari mstpricepart.
// units[] = daftar Kode Tipe Unit (twodigitcode) yang ter-mapping ke part OIL ini.
const MST_PART_OIL = [
  { code: "08232-M99-K1LN0", name: "AHM Oil MPX2 SAE 10W-30 0.8L", price: 52000, group: "OIL", units: ["VG", "KF", "JM"] },
  { code: "08234-M99-N0LN0", name: "AHM Oil SPX2 SAE 10W-30 0.8L", price: 58000, group: "OIL", units: ["VG", "KF"] },
  { code: "08232-M99-M1LN0", name: "AHM Oil MPX1 SAE 10W-30 1.0L", price: 63000, group: "OIL", units: ["KF"] },
];
// DUMMY mapping part -> jasa Light Repair (HANYA SEBAGIAN part, per unit). Real: SIRIS.dbo.mstmappingpartlr
// (twodigitcode = Kode Tipe Unit, partcode, pricejasalr = harga jasa LR, frt). Pilih part yg ada di sini -> jasa Light repair auto-muncul.
const MST_PART_LR = [
  { partcode: "90201KVBJ00", twodigitcode: "VG", pricejasalr: 15000, frt: 20 },
  { partcode: "90201KVBJ00", twodigitcode: "KF", pricejasalr: 15000, frt: 20 },
  { partcode: "90201KVBJ00", twodigitcode: "JM", pricejasalr: 15000, frt: 20 },
  { partcode: "23100KVBJ01", twodigitcode: "VG", pricejasalr: 45000, frt: 30 },
  { partcode: "23100KVBJ01", twodigitcode: "KF", pricejasalr: 45000, frt: 30 },
  { partcode: "22123KVBJ01", twodigitcode: "VG", pricejasalr: 35000, frt: 25 },
];
// Hitung ulang jasa Light Repair otomatis dari daftar part (sesuai Kode Tipe Unit). Buang LR lama, tambah untuk part yg ter-mapping.
function syncLightRepairItems(serviceitems, partitems, kode) {
  const base = serviceitems.filter((s) => !s.autoLr);
  partitems.forEach((p) => {
    const m = MST_PART_LR.find((x) => x.partcode === p.code && x.twodigitcode === kode);
    if (m && !base.some((s) => s.code === "LR-" + p.code)) {
      base.push({ code: "LR-" + p.code, name: "Light repair (" + p.name + ")", price: m.pricejasalr, duration: m.frt, autoLr: true });
    }
  });
  return base;
}
const rp = (n) => "Rp " + (Number(n) || 0).toLocaleString("id-ID");

/* ------------------------------------------------------------------
   i18n - key identik dengan mockup-booking-home-service.html
   ------------------------------------------------------------------ */
const DICT = {
  id: {
    "booking.breadcrumb.root": "Booking",
    "booking.page.title": "Booking Management",
    "booking.nav.section": "Home Service",
    "booking.nav.booking": "Booking Home Service",
    "booking.nav.list": "List Booking Home Service",
    "booking.step.prefix": "Langkah",
    "booking.step1.name": "Kendaraan",
    "booking.step2.name": "Mekanik, Service & Part",
    "booking.step3.name": "Ringkasan",
    "booking.section.callerInfo": "Informasi Penelpon",
    "booking.section.serviceLocation": "Lokasi Layanan",
    "booking.section.schedule": "Jadwal Booking",
    "booking.tab.vehicleInfo": "Informasi Kendaraan",
    "booking.tab.stnkInfo": "Informasi STNK",
    "booking.form.callerName": "Nama Penelpon",
    "booking.form.callerNameRequired": "Nama penelpon wajib diisi",
    "booking.form.phoneNumber": "Nomor Telepon",
    "booking.form.phoneRequired": "Nomor telepon wajib diisi",
    "booking.form.phoneInvalid": "Nomor telepon tidak valid (9-13 digit, tanpa 0 di depan)",
    "booking.form.phoneLength": "Untuk +62 nomor telepon harus 8-13 digit",
    "booking.form.phoneRule": "Nomor telepon minimal 8 dan maksimal 13 digit (input dibatasi maksimal 13 karakter).",
    "booking.form.phoneNoLeadingZero": "Untuk +62 nomor tidak boleh diawali angka 0 - awalan 0 otomatis dihapus",
    "booking.form.phoneNotRegistered":
      "Nomor handphone yang diinput tidak terdaftar di provider Indonesia. Silakan input nomor handphone lain.",
    "booking.form.phoneProvider": "Provider",
    "booking.form.serviceLocation": "Lokasi Layanan",
    "booking.form.ahass": "AHASS",
    "booking.form.ahassCity": "Kota AHASS",
    "booking.form.isPos": "Is Pos",
    "booking.hint.geoSample": "Kecamatan/kelurahan untuk kota ini dimuat dari API. Mockup hanya berisi contoh: Surabaya, Malang, Kupang.",
    "booking.note.ahass": "Lokasi layanan = AHASS Anda sesuai user login. Data diambil dari dbo.mstdealer (dealertype H2).",
    "booking.note.pickup": "Antar Jemput: alamat dipakai sebagai titik penjemputan & pengembalian unit. Isi alamat lengkap konsumen.",
    "booking.form.address": "Alamat",
    "booking.form.addressRequired": "Alamat wajib diisi untuk Home Service",
    "booking.form.province": "Provinsi",
    "booking.form.city": "Kota",
    "booking.form.district": "Kecamatan",
    "booking.form.village": "Kelurahan",
    "booking.form.provinceRequired": "Provinsi wajib dipilih",
    "booking.form.cityRequired": "Kota wajib dipilih",
    "booking.form.districtRequired": "Kecamatan wajib dipilih",
    "booking.form.villageRequired": "Kelurahan wajib dipilih",
    "booking.form.policeNumber": "Plat Nomor",
    "booking.form.engineNumber": "Nomor Mesin",
    "booking.form.frameNumber": "Nomor Rangka",
    "booking.form.twoDigitCode": "Kode Tipe Unit",
    "booking.form.assemblyYear": "Tahun Rakit",
    "booking.form.marketName": "Market Name",
    "booking.form.color": "Warna",
    "booking.form.lastKilometer": "Kilometer Terakhir",
    "booking.form.lastKilometerRequired": "Kilometer terakhir wajib diisi",
    "booking.form.kmBelowLast": "Kilometer tidak boleh kurang dari kilometer terakhir kendaraan",
    "booking.form.kmMinInfo": "Minimal (kilometer terakhir kendaraan):",
    "booking.form.vehicleRequired": "Data kendaraan wajib diisi",
    "booking.form.ownerName": "Nama Pemilik STNK",
    "booking.form.ownerNik": "NIK Pemilik",
    "booking.form.stnkAddress": "Alamat STNK",
    "booking.form.ownerFirstName": "Nama Awal Pemilik STNK",
    "booking.form.ownerLastName": "Nama Akhir Pemilik STNK",
    "booking.form.stnkAddress1": "Alamat 1 STNK",
    "booking.form.stnkAddress2": "Alamat 2 STNK",
    "booking.form.postalCode": "Kode Pos",
    "booking.form.stnkValidUntil": "Masa Berlaku STNK",
    "booking.form.taxDueDate": "Jatuh Tempo Pajak",
    "booking.form.channelBooking": "Jalur Booking",
    "booking.form.notesHint": "Opsional, maksimal 100 karakter",
    "booking.form.dateRequired": "Tanggal booking wajib dipilih",
    "booking.form.dateBackdate": "Tanggal booking tidak boleh sebelum hari ini",
    "booking.form.pickDate": "Pilih Tanggal",
    "booking.form.pickTime": "Pilih Jam",
    "booking.form.timeRequired": "Jam booking wajib dipilih",
    "booking.form.notes": "Catatan",
    "booking.form.notesPlaceholder": "Catatan tambahan untuk mekanik (opsional)",
    "booking.summary.title": "Summary",
    "booking.summary.bookingDate": "Booking Date",
    "booking.summary.bookingTime": "Booking Time",
    "booking.summary.serviceLocation": "Lokasi",
    "booking.summary.pickTimeHint": "Klik untuk pilih slot jam booking",
    "booking.slot.full": "Penuh",
    "booking.slot.remaining": "Sisa",
    "booking.slot.unit": "Slot",
    "booking.timeslot.title": "Pilih Waktu Pemesanan",
    "booking.timeslot.subtitle": "Pilih slot waktu pemesanan yang tersedia",
    "booking.timeslot.back": "Kembali",
    "booking.timeslot.save": "Simpan",
    "booking.placeholder.search": "Cari",
    "booking.placeholder.select": "Pilih",
    "booking.placeholder.noResult": "Data tidak ditemukan",
    "booking.action.search": "Cari",
    "booking.action.edit": "Ubah",
    "booking.action.lock": "Simpan",
    "booking.action.next": "Data Mekanik, Service dan Part",
    "booking.action.cancel": "Batal",
    "booking.action.payload": "Lihat Payload",
    "booking.action.prevStep": "Kembali",
    "booking.action.next3": "Lanjut ke Ringkasan",
    "booking.section.mechanic": "Data Mekanik",
    "booking.section.service": "Jasa Service",
    "booking.section.part": "Spare Part",
    "booking.form.mechanicMain": "Mekanik Bertanggung Jawab (Home Service)",
    "booking.form.mechanicHelper": "Mekanik yang Membantu",
    "booking.form.pickMechanic": "Pilih mekanik",
    "booking.form.pickMainFirst": "Pilih mekanik bertanggung jawab terlebih dahulu",
    "booking.action.addHelper": "Tambah",
    "booking.action.addService": "Tambah Service",
    "booking.action.addPart": "Tambah Part",
    "booking.svc.title": "Tambah Service",
    "booking.svc.subtitle": "Pilih paket service untuk ditambahkan ke transaksi.",
    "booking.svc.package": "Paket Service",
    "booking.svc.search": "Cari service",
    "booking.svc.emptyTitle": "Belum ada service dipilih",
    "booking.svc.emptyDesc": "Cari & pilih paket service dari daftar di atas untuk ditambahkan ke transaksi ini.",
    "booking.part.title": "Tambah Part",
    "booking.part.subtitle": "Pilih spare part yang dibawa mekanik ke rumah customer.",
    "booking.part.search": "Cari part",
    "booking.part.emptyTitle": "Belum ada part dipilih",
    "booking.part.emptyDesc": "Cari & pilih spare part dari daftar di atas untuk ditambahkan.",
    "booking.form.discount": "Discount",
    "booking.form.minute": "Menit",
    "booking.form.pickService": "Pilih jasa service",
    "booking.form.pickPart": "Pilih spare part yang dibawa",
    "booking.form.mechanicMainRequired": "Mekanik bertanggung jawab wajib dipilih",
    "booking.empty.none": "Belum ada yang dipilih",
    "booking.msg.step3soon": "Langkah 3 (Ringkasan) menyusul di iterasi berikutnya",
    "booking.msg.unitFound": "Data kendaraan ditemukan",
    "booking.msg.unitNotFound": "Kendaraan tidak ditemukan. Gunakan tombol Ubah untuk input manual.",
    "booking.msg.queryEmpty": "Isi dulu kata kunci pencarian",
    "booking.msg.typeMinChars": "Ketik minimal 4 karakter untuk mencari",
    "booking.msg.searching": "Mencari...",
    "booking.msg.searchOffline": "API pencarian tidak aktif - memakai data contoh",
    "booking.msg.invalidForm": "Lengkapi field yang ditandai merah",
    "booking.msg.validForm": "Data Langkah 1 valid, siap lanjut ke Langkah 2",
    "booking.msg.editUnlocked": "Field kendaraan bisa diubah manual",
    "booking.msg.vehicleUpdated": "Data kendaraan diperbarui ke dbo.mstvehicle",
    "booking.msg.stnkEditUnlocked": "Data STNK bisa diubah",
    "booking.msg.stnkSaved": "Perubahan data STNK disimpan",
    "booking.note.homeservice":
      "Home Service: alamat layanan dipakai sebagai titik kunjungan mekanik. Jika berbeda dengan alamat STNK, isi manual di bawah.",
  },
  en: {
    "booking.breadcrumb.root": "Booking",
    "booking.page.title": "Booking Management",
    "booking.nav.section": "Home Service",
    "booking.nav.booking": "Home Service Booking",
    "booking.nav.list": "Home Service Booking List",
    "booking.step.prefix": "Step",
    "booking.step1.name": "Vehicle",
    "booking.step2.name": "Mechanic, Service & Part",
    "booking.step3.name": "Summary",
    "booking.section.callerInfo": "Caller Information",
    "booking.section.serviceLocation": "Service Location",
    "booking.section.schedule": "Booking Schedule",
    "booking.tab.vehicleInfo": "Vehicle Information",
    "booking.tab.stnkInfo": "STNK Information",
    "booking.form.callerName": "Caller Name",
    "booking.form.callerNameRequired": "Caller name is required",
    "booking.form.phoneNumber": "Phone Number",
    "booking.form.phoneRequired": "Phone number is required",
    "booking.form.phoneInvalid": "Invalid phone number (9-13 digits, no leading 0)",
    "booking.form.phoneLength": "For +62 the phone number must be 8-13 digits",
    "booking.form.phoneRule": "Phone number must be 8-13 digits (input is capped at 13 characters).",
    "booking.form.phoneNoLeadingZero": "For +62 the number must not start with 0 - the leading 0 is removed automatically",
    "booking.form.phoneNotRegistered":
      "This mobile number is not registered with any Indonesian provider. Please enter another number.",
    "booking.form.phoneProvider": "Provider",
    "booking.form.serviceLocation": "Service Location",
    "booking.form.ahass": "AHASS",
    "booking.form.ahassCity": "AHASS City",
    "booking.form.isPos": "Is Pos",
    "booking.hint.geoSample": "Districts/villages for this city are loaded from the API. This mockup only ships samples: Surabaya, Malang, Kupang.",
    "booking.note.ahass": "Service location = your AHASS per login. Data comes from dbo.mstdealer (dealertype H2).",
    "booking.note.pickup": "Pick-up & Delivery: the address is the pick-up and return point. Fill in the full customer address.",
    "booking.form.address": "Address",
    "booking.form.addressRequired": "Address is required for Home Service",
    "booking.form.province": "Province",
    "booking.form.city": "City",
    "booking.form.district": "District",
    "booking.form.village": "Village",
    "booking.form.provinceRequired": "Province is required",
    "booking.form.cityRequired": "City is required",
    "booking.form.districtRequired": "District is required",
    "booking.form.villageRequired": "Village is required",
    "booking.form.policeNumber": "Police Number",
    "booking.form.engineNumber": "Engine Number",
    "booking.form.frameNumber": "Frame Number",
    "booking.form.twoDigitCode": "Unit Type Code",
    "booking.form.assemblyYear": "Build Year",
    "booking.form.marketName": "Market Name",
    "booking.form.color": "Color",
    "booking.form.lastKilometer": "Last Kilometer",
    "booking.form.lastKilometerRequired": "Last kilometer is required",
    "booking.form.kmBelowLast": "Kilometer cannot be less than the vehicle last kilometer",
    "booking.form.kmMinInfo": "Minimum (vehicle last kilometer):",
    "booking.form.vehicleRequired": "Vehicle data is required",
    "booking.form.ownerName": "STNK Owner Name",
    "booking.form.ownerNik": "Owner ID Number",
    "booking.form.stnkAddress": "STNK Address",
    "booking.form.ownerFirstName": "STNK Owner First Name",
    "booking.form.ownerLastName": "STNK Owner Last Name",
    "booking.form.stnkAddress1": "STNK Address 1",
    "booking.form.stnkAddress2": "STNK Address 2",
    "booking.form.postalCode": "Postal Code",
    "booking.form.stnkValidUntil": "STNK Valid Until",
    "booking.form.taxDueDate": "Tax Due Date",
    "booking.form.channelBooking": "Booking Line",
    "booking.form.notesHint": "Optional, max 100 characters",
    "booking.form.dateRequired": "Booking date is required",
    "booking.form.dateBackdate": "Booking date cannot be earlier than today",
    "booking.form.pickDate": "Pick Date",
    "booking.form.pickTime": "Pick Time",
    "booking.form.timeRequired": "Booking time is required",
    "booking.form.notes": "Notes",
    "booking.form.notesPlaceholder": "Additional notes for the mechanic (optional)",
    "booking.summary.title": "Summary",
    "booking.summary.bookingDate": "Booking Date",
    "booking.summary.bookingTime": "Booking Time",
    "booking.summary.serviceLocation": "Location",
    "booking.summary.pickTimeHint": "Click to pick a booking time slot",
    "booking.slot.full": "Full",
    "booking.slot.remaining": "Left",
    "booking.slot.unit": "Slot",
    "booking.timeslot.title": "Choose Booking Time",
    "booking.timeslot.subtitle": "Select an available booking time slot",
    "booking.timeslot.back": "Back",
    "booking.timeslot.save": "Save",
    "booking.placeholder.search": "Search",
    "booking.placeholder.select": "Select",
    "booking.placeholder.noResult": "No data found",
    "booking.action.search": "Search",
    "booking.action.edit": "Edit",
    "booking.action.lock": "Save",
    "booking.action.next": "Mechanic, Service & Part Data",
    "booking.action.prevStep": "Back",
    "booking.action.next3": "Continue to Summary",
    "booking.section.mechanic": "Mechanic Data",
    "booking.section.service": "Service Jobs",
    "booking.section.part": "Spare Part",
    "booking.form.mechanicMain": "Assigned Mechanic (Home Service)",
    "booking.form.mechanicHelper": "Helper Mechanic(s)",
    "booking.form.pickMechanic": "Pick a mechanic",
    "booking.form.pickMainFirst": "Pick the assigned mechanic first",
    "booking.action.addHelper": "Add",
    "booking.action.addService": "Add Service",
    "booking.action.addPart": "Add Part",
    "booking.svc.title": "Add Service",
    "booking.svc.subtitle": "Add a service package to get started. Services can be added optionally afterward.",
    "booking.svc.package": "Service Package",
    "booking.svc.search": "Search service",
    "booking.svc.emptyTitle": "No service selected yet",
    "booking.svc.emptyDesc": "Search and select a service or package from the list above to add it to this transaction.",
    "booking.part.title": "Add Part",
    "booking.part.subtitle": "Choose spare parts the mechanic brings to the customer.",
    "booking.part.search": "Search part",
    "booking.part.emptyTitle": "No part selected yet",
    "booking.part.emptyDesc": "Search and select spare parts from the list above to add them.",
    "booking.form.discount": "Discount",
    "booking.form.minute": "Min",
    "booking.form.pickService": "Pick a service job",
    "booking.form.pickPart": "Pick a spare part to bring",
    "booking.form.mechanicMainRequired": "Assigned mechanic is required",
    "booking.empty.none": "Nothing selected yet",
    "booking.msg.step3soon": "Step 3 (Summary) is coming in the next iteration",
    "booking.action.cancel": "Cancel",
    "booking.action.payload": "View Payload",
    "booking.msg.unitFound": "Vehicle data found",
    "booking.msg.unitNotFound": "Vehicle not found. Use the Edit button to input manually.",
    "booking.msg.queryEmpty": "Enter a search keyword first",
    "booking.msg.typeMinChars": "Type at least 4 characters to search",
    "booking.msg.searching": "Searching...",
    "booking.msg.searchOffline": "Search API is offline - using sample data",
    "booking.msg.invalidForm": "Please complete the fields marked in red",
    "booking.msg.validForm": "Step 1 data is valid, ready for Step 2",
    "booking.msg.editUnlocked": "Vehicle fields can now be edited manually",
    "booking.msg.vehicleUpdated": "Vehicle data updated to dbo.mstvehicle",
    "booking.msg.stnkEditUnlocked": "STNK data can now be edited",
    "booking.msg.stnkSaved": "STNK changes saved",
    "booking.note.homeservice":
      "Home Service: the service address is the mechanic visit point. If different from the STNK address, fill it manually below.",
  },
};

/* ------------------------------------------------------------------
   STATE AWAL - nama properti = nama kolom trxbookinghomeservice
   ------------------------------------------------------------------ */
const EMPTY_FORM = {
  // informasi penelpon
  callername: "",
  callerphonecc: "+62",
  callerphone: "",
  callerphoneprovider: "", // diisi otomatis dari master PREFIXPHONE
  // lokasi layanan
  bookingtypecode: "BE", // default AHASS
  address: "",
  geoprovinceid: "3500", // default Jawa Timur (utk Home Service / Antar Jemput)
  geocityid: "",
  geodistrictid: "",
  geovillageid: "",
  // kendaraan
  unitid: "",
  policenumber: "",
  enginenumber: "",
  framenumber: "",
  twodigitcode: "",
  assemblyyear: "",
  marketname: "",
  colorcode: "",
  colorname: "", // nama warna dari hasil live (mstmotorcolor.colorname)
  lastkilometer: "",
  minkilometer: "", // batas minimum = mstvehicle.lastkilometer saat unit ditemukan
  motorsegment: "", // MATIC/CUB/SPORT/EV
  motorcategory: "", // LOW/MID/HIGH -> filter variant service (dari Kode Tipe Unit / mstmotor)
  // stnk (dari custvehiclestnk + mstcustomer)
  stnkfullname: "",
  stnkfirstname: "",
  stnklastname: "",
  stnkownernik: "",
  stnkaddress1: "",
  stnkaddress2: "",
  stnkpostalcode: "",
  stnkgeoprovinceid: "", stnkprovincename: "",
  stnkgeocityid: "", stnkcityname: "",
  stnkgeodistrictid: "", stnkdistrictname: "",
  stnkgeovillageid: "", stnkvillagename: "",
  stnkcustomerid: "", // dbo.mstcustomer.id -> kunci UPDATE saat Simpan STNK
  // jadwal
  channelbookingcode: "TLP",
  bookingdate: "", // kosong dulu: Summary & Pilih Jam baru muncul setelah tanggal dipilih
  bookingslothourid: "", // dbo.mstbookingslothour.id dari slot yang dipilih (utk hitung sisa slot)
  // ---- Langkah 2: Data Mekanik, Service & Part ----
  mechanicid: "",
  mechanicname: "",
  helpermechanics: [], // [{id,name}]
  serviceitems: [], // [{code,name,price}]
  partitems: [], // [{code,name,price,qty}]
  bookingtime: "",
  notes: "",
};

/* Bentuk baris yang dikirim ke POST /booking/homeservice/draft */
/* Binding-to-UPDATE ke dbo.mstvehicle saat unit ditemukan lalu di-Simpan.
   Plat Nomor -> policenumber ; Kilometer Terakhir -> lastkilometer (angka, 0 bila kosong).
   Field lain tidak ikut di-update karena saat data ditemukan hanya Plat & Km yang enable. */
export function buildVehicleUpdate(form) {
  return {
    table: "dbo.mstvehicle",
    where: { id: form.unitid },
    set: {
      policenumber: form.policenumber,
      lastkilometer: form.lastkilometer ? Number(String(form.lastkilometer).replace(/\D/g, "")) : 0,
    },
  };
}

/* Binding-to-UPDATE ke dbo.mstcustomer saat Simpan tab STNK.
   Field STNK yang bisa diubah -> kolom mstcustomer; NIK tidak diikutkan (disable).
   modifiedby = user login aplikasi; modifieddatetime = getdate() saat perubahan. */
export function buildCustomerUpdate(form) {
  return {
    table: "dbo.mstcustomer",
    where: { id: form.stnkcustomerid },
    set: {
      firstname: form.stnkfirstname,
      lastname: form.stnklastname,
      fullname: `${form.stnkfirstname || ""} ${form.stnklastname || ""}`.trim(),
      address1: form.stnkaddress1,
      address2: form.stnkaddress2,
      postalcode: form.stnkpostalcode,
      geoprovinceid: form.stnkgeoprovinceid || null,
      geocityid: form.stnkgeocityid || null,
      geodistrictid: form.stnkgeodistrictid || null,
      geovillageid: form.stnkgeovillageid || null,
      modifiedby: SESSION_USER, // <- nama login aplikasi/web
      modifieddatetime: new Date().toISOString(), // <- getdate() perubahan (server sebaiknya pakai now()/getdate())
    },
  };
}

export function buildPayload(form, dealer = SESSION_DEALER) {
  const nameOf = (rows, id) => rows.find((r) => r.id === id)?.name ?? "";
  return {
    bookingno: "(auto - generate di server)",
    dealerid: "(dari session user login)",
    bookingtypecode: form.bookingtypecode,
    channelbookingcode: form.channelbookingcode,
    bookingdate: form.bookingdate,
    bookingtime: form.bookingtime,
    bookingslothourid: form.bookingslothourid || null, // -> dbo.trxbookinghomeservice.bookingslothourid
    statuscode: "10", // BOOKINGSTATUS 10 = Open / Belum Follow Up
    callername: form.callername,
    callerphonecc: form.callerphonecc,
    callerphone: form.callerphone,
    callerphoneprovider: form.callerphoneprovider || null,
    // lokasi layanan bergantung bookingtypecode
    ...(form.bookingtypecode === "BE"
      ? {
          ahassahmcode: dealer.ahmcode,
          ahassnmscode: dealer.nmscode,
          ahassname: dealer.name,
          ahasscityname: dealer.cityname,
          ispos: dealer.ispos,
        }
      : {
          serviceaddress: form.address,
          geoprovinceid: form.geoprovinceid,
          geoprovincename: nameOf(MST_GEOPROVINCE, form.geoprovinceid),
          geocityid: form.geocityid,
          geocityname: nameOf(MST_GEOCITY, form.geocityid),
          geodistrictid: form.geodistrictid,
          geodistrictname: nameOf(MST_GEODISTRICT, form.geodistrictid),
          geovillageid: form.geovillageid,
          geovillagename: nameOf(MST_GEOVILLAGE, form.geovillageid),
        }),
    unitid: form.unitid || null,
    policenumber: form.policenumber,
    enginenumber: form.enginenumber,
    framenumber: form.framenumber,
    twodigitcode: form.twodigitcode,
    assemblyyear: form.assemblyyear,
    marketname: form.marketname,
    colorcode: form.colorcode,
    lastkilometer: form.lastkilometer ? Number(String(form.lastkilometer).replace(/\D/g, "")) : null,
    stnkfirstname: form.stnkfirstname,
    stnklastname: form.stnklastname,
    stnkfullname: form.stnkfullname || `${form.stnkfirstname} ${form.stnklastname}`.trim(),
    stnkownernik: form.stnkownernik,
    stnkaddress1: form.stnkaddress1,
    stnkaddress2: form.stnkaddress2,
    stnkpostalcode: form.stnkpostalcode,
    stnkgeoprovinceid: form.stnkgeoprovinceid, stnkgeocityid: form.stnkgeocityid,
    stnkgeodistrictid: form.stnkgeodistrictid, stnkgeovillageid: form.stnkgeovillageid,
    notes: form.notes,
    // UPDATE ke dbo.mstvehicle hanya bila unit ditemukan (punya unitid) - lihat buildVehicleUpdate
    mstvehicleUpdate: form.unitid ? buildVehicleUpdate(form) : null,
    mstcustomerUpdate: form.stnkcustomerid ? buildCustomerUpdate(form) : null,
    // ---- Langkah 2: Data Mekanik, Service & Part ----
    mechanicid: form.mechanicid || null,
    mechanicname: form.mechanicname || null,
    helpermechanicids: (form.helpermechanics || []).map((h) => h.id),
    serviceitems: (form.serviceitems || []).map((s) => ({ code: s.code, name: s.name, price: s.price, duration: s.duration })),
    partitems: (form.partitems || []).map((p) => ({ code: p.code, name: p.name, price: p.price, qty: p.qty })),
    createdby: "(dari session user login)",
  };
}

/* ------------------------------------------------------------------
   KOMPONEN KECIL
   ------------------------------------------------------------------ */
function Field({ label, required, error, hint, children }) {
  return (
    <div className="flex flex-col gap-1.5 min-w-0">
      <label className={`text-[13px] font-semibold ${error ? "text-red-600" : "text-slate-800"}`}>
        {label} {required && <span className="text-red-600">*</span>}
      </label>
      {children}
      {(error || hint) && (
        <span className={`text-xs ${error ? "text-red-600" : "text-slate-500"}`}>{error || hint}</span>
      )}
    </div>
  );
}

function EmptyBox({ title, desc }) {
  return (
    <div className="flex flex-col items-center gap-2 px-4 py-8 text-center">
      <div className="flex h-[76px] w-[76px] items-center justify-center rounded-full bg-orange-50 text-orange-500">
        <PackageOpen size={30} />
      </div>
      <div className="mt-1 text-base font-extrabold text-slate-800">{title}</div>
      <div className="max-w-sm text-[13px] text-slate-500">{desc}</div>
    </div>
  );
}

const inputBase =
  "w-full h-[42px] rounded-xl border px-3.5 text-sm outline-none transition-colors placeholder:text-slate-400";
const inputTone = (error, readOnly) =>
  error
    ? "border-red-500 ring-[3px] ring-red-500/10 bg-white"
    : readOnly
    ? "border-gray-200 bg-gray-50 text-slate-500"
    : "border-gray-200 bg-white focus:border-orange-500 focus:ring-[3px] focus:ring-orange-500/20";

function TextField({ value, onChange, placeholder, error, readOnly, upper, maxLength, inputMode }) {
  return (
    <input
      className={`${inputBase} ${inputTone(error, readOnly)}`}
      value={value ?? ""}
      placeholder={placeholder}
      readOnly={readOnly}
      maxLength={maxLength}
      inputMode={inputMode}
      onChange={(e) => onChange(upper ? e.target.value.toUpperCase() : e.target.value)}
    />
  );
}

function SelectField({ value, onChange, rows, valueKey = "id", placeholder, error, disabled, noPlaceholder }) {
  return (
    <div className="relative">
      <select
        className={`${inputBase} ${inputTone(error, disabled)} appearance-none pr-10 cursor-pointer ${
          value ? "text-blue-700" : "text-slate-400"
        }`}
        value={value ?? ""}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value)}
      >
        {!noPlaceholder && <option value="">{placeholder}</option>}
        {rows.map((r) => (
          <option key={r[valueKey]} value={r[valueKey]} className="text-slate-800">
            {r.name}
          </option>
        ))}
      </select>
      <ChevronDown size={17} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-500" />
    </div>
  );
}

/* Combo = select dengan kotak pencarian (Kode Dua Digit, Warna, cari unit) */
function ComboField({ value, display, rows, onPick, placeholder, error, readOnly, chevron = "down", onQuery, minChars = 0, minCharsHint, loading, loadingHint }) {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const belowMin = minChars > 0 && q.trim().length < minChars; // suggestion muncul >= minChars karakter
  const list = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (minChars > 0 && s.length < minChars) return [];
    const sns = s.replace(/\s+/g, ""); // cocokkan tanpa spasi (mis. "l123" -> "L 1234 ABC")
    return rows.filter((r) => !sns || `${r.label} ${r.sub ?? ""}`.toLowerCase().replace(/\s+/g, "").includes(sns));
  }, [q, rows, minChars]);
  const Chevron = chevron === "none" ? null : chevron === "updown" ? ChevronsUpDown : ChevronDown;

  return (
    <div className="relative">
      <button
        type="button"
        disabled={readOnly}
        onClick={() => {
          setOpen((o) => !o);
          setQ("");
        }}
        className={`${inputBase} ${inputTone(error, readOnly)} flex items-center gap-2 text-left disabled:cursor-not-allowed`}
      >
        <Search size={16} className="shrink-0 text-slate-400" />
        <span className={`flex-1 truncate ${display ? "" : "text-slate-400"}`}>{display || placeholder}</span>
        {Chevron && <Chevron size={16} className="shrink-0 text-slate-400" />}
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute z-50 left-0 right-0 top-[calc(100%+6px)] max-h-64 overflow-auto rounded-xl border border-gray-200 bg-white p-1.5 shadow-xl">
            <div className="sticky top-[-6px] z-10 -mx-1.5 -mt-1.5 mb-1.5 border-b border-gray-100 bg-white px-1.5 pt-1.5 pb-1.5">
              <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                autoFocus
                className="w-full h-8 rounded-lg border border-gray-200 pl-8 pr-2 text-[13px] outline-none focus:border-orange-500"
                placeholder={placeholder}
                value={q}
                onChange={(e) => {
                  setQ(e.target.value);
                  onQuery?.(e.target.value);
                }}
              />
            </div>
            {list.length === 0 && (
              <div className="px-2.5 py-3 text-center text-[13px] text-slate-500">
                {belowMin ? minCharsHint || `Ketik minimal ${minChars} karakter` : loading ? loadingHint || "Mencari..." : "-"}
              </div>
            )}
            {list.map((r) => (
              <button
                key={r.value}
                type="button"
                onClick={() => {
                  onPick(r.value);
                  setOpen(false);
                }}
                className="group flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left text-[13.5px] hover:bg-orange-500 hover:text-white"
              >
                <span className="truncate">{r.label}</span>
                {r.sub && <span className="ml-auto truncate text-xs text-slate-500 group-hover:text-white/85">{r.sub}</span>}
                {String(r.value) === String(value) && <Check size={14} className="ml-1 text-orange-500 group-hover:text-white" />}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function Stepper({ step, t }) {
  const steps = [
    { n: 1, name: t("booking.step1.name") },
    { n: 2, name: t("booking.step2.name") },
    { n: 3, name: t("booking.step3.name") },
  ];
  return (
    <div className="flex items-start justify-center pt-6 pb-2">
      {steps.map((s, i) => (
        <div key={s.n} className="flex items-start">
          {i > 0 && <div className={`mt-[17px] h-px w-16 sm:w-32 lg:w-48 ${step > s.n - 1 ? "bg-orange-200" : "bg-gray-200"}`} />}
          <div className="flex w-40 flex-col items-center gap-2.5">
            <div
              className={`flex h-[34px] w-[34px] items-center justify-center rounded-full border ${
                step === s.n
                  ? "border-orange-500 bg-orange-500 ring-[5px] ring-orange-100"
                  : step > s.n
                  ? "border-orange-500 bg-orange-50 text-orange-500"
                  : "border-gray-200 bg-white"
              }`}
            >
              {step > s.n ? (
                <Check size={16} />
              ) : step === s.n ? (
                <span className="h-3 w-3 rounded-full border-2 border-white" />
              ) : (
                <span className="h-1.5 w-1.5 rounded-full bg-slate-400" />
              )}
            </div>
            <div className={`text-sm font-bold ${step === s.n ? "text-orange-500" : step > s.n ? "text-slate-800" : "text-slate-400"}`}>
              {t("booking.step.prefix")} {s.n}
            </div>
            <div className={`-mt-1.5 text-[13px] ${step === s.n ? "text-orange-500" : "text-slate-400"}`}>{s.name}</div>
          </div>
        </div>
      ))}
    </div>
  );
}

function Card({ icon: Icon, title, right, children }) {
  return (
    <section className="rounded-2xl border border-gray-200 bg-white p-6">
      {(title || right) && (
        <div className="mb-5 flex items-center gap-2.5">
          {Icon && <Icon size={19} className="text-slate-800" />}
          {title && <h2 className="text-base font-bold tracking-tight">{title}</h2>}
          {right && <div className="ml-auto flex items-center gap-2">{right}</div>}
        </div>
      )}
      {children}
    </section>
  );
}

function Toast({ items, onClose }) {
  return (
    <div className="fixed right-4 top-4 z-[80] flex flex-col gap-2">
      {items.map((it) => (
        <div
          key={it.id}
          className={`flex min-w-[280px] items-center gap-2.5 rounded-xl border border-gray-200 bg-white px-3.5 py-3 text-[13.5px] shadow-xl border-l-[3px] ${
            it.kind === "err" ? "border-l-red-600" : it.kind === "ok" ? "border-l-emerald-600" : "border-l-orange-500"
          }`}
        >
          {it.kind === "err" ? (
            <AlertTriangle size={16} className="text-red-600" />
          ) : it.kind === "ok" ? (
            <CheckCircle2 size={16} className="text-emerald-600" />
          ) : (
            <Info size={16} className="text-orange-500" />
          )}
          <span className="flex-1">{it.msg}</span>
          <button onClick={() => onClose(it.id)} className="text-slate-400">
            <X size={14} />
          </button>
        </div>
      ))}
    </div>
  );
}

/* ==================================================================
   HALAMAN
   ================================================================== */
export default function BookingHomeService() {
  const [lang, setLang] = useState("id");
  const [step, setStep] = useState(1);
  const [helperpick, setHelperpick] = useState(""); // mekanik pembantu dipilih di dropdown (belum ditambah)
  const [addModal, setAddModal] = useState(null); // 'service' | 'part' | null
  const [svcPkgOpen, setSvcPkgOpen] = useState(false);
  const [svcPkg, setSvcPkg] = useState("");
  const [svcSearch, setSvcSearch] = useState("");
  const [svcSel, setSvcSel] = useState([]);
  const [partSearch, setPartSearch] = useState("");
  const [partSel, setPartSel] = useState([]);
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const [vehTab, setVehTab] = useState("unit"); // 'unit' | 'stnk'
  const [vehicleLocked, setVehicleLocked] = useState(true);
  const [unitFound, setUnitFound] = useState(false); // true bila unit ter-load dari mstvehicle (data ditemukan)
  const [stnkEdit, setStnkEdit] = useState(false); // mode edit tab STNK, TERPISAH dari vehicleLocked
  const [stnkNikLocked, setStnkNikLocked] = useState(false); // NIK terkunci bila sudah terisi saat mulai edit
  const [searchBy, setSearchBy] = useState("policenumber");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchOffline, setSearchOffline] = useState(false);
  const [unitSuggestOpen, setUnitSuggestOpen] = useState(false); // dropdown suggestion pencarian unit
  const [selectedUnitId, setSelectedUnitId] = useState(""); // unit dipilih dari suggestion (load saat Cari)
  const [phoneZeroHint, setPhoneZeroHint] = useState(false); // user sempat mengetik/paste 0 di depan
  const [showPayload, setShowPayload] = useState(false);
  const [timeslotOpen, setTimeslotOpen] = useState(false); // modal "Pilih Waktu Pemesanan"
  const [timeslotTemp, setTimeslotTemp] = useState(""); // pilihan slot sementara (belum disimpan)
  const [toasts, setToasts] = useState([]);
  const [sidebar, setSidebar] = useState(true);

  const t = (k) => DICT[lang]?.[k] ?? k;
  const pushToast = (msg, kind) => {
    const id = Date.now() + Math.random();
    setToasts((a) => [...a, { id, msg, kind }]);
    setTimeout(() => setToasts((a) => a.filter((x) => x.id !== id)), 4200);
  };
  const closeToast = (id) => setToasts((a) => a.filter((x) => x.id !== id));

  const isHomeService = form.bookingtypecode === "HS";
  const isAhass = form.bookingtypecode === "BE";
  const needsAddress = form.bookingtypecode === "HS" || form.bookingtypecode === "AJ";
  // kota yang punya data kecamatan/kelurahan di mockup (dari sampel yang di-embed)
  const SAMPLE_CITY_IDS = new Set(MST_GEODISTRICT.map((d) => d.geocityid));
  const cityHasNoSample = form.geocityid && !SAMPLE_CITY_IDS.has(form.geocityid);

  /* set 1 field + reset turunan cascading + hapus error "wajib" */
  const setF = (name, value) => {
    setForm((f) => {
      const next = { ...f, [name]: value };
      if (name === "geoprovinceid") Object.assign(next, { geocityid: "", geodistrictid: "", geovillageid: "" });
      if (name === "geocityid") Object.assign(next, { geodistrictid: "", geovillageid: "" });
      if (name === "geodistrictid") Object.assign(next, { geovillageid: "" });
      if (name === "stnkgeoprovinceid") Object.assign(next, { stnkgeocityid: "", stnkgeodistrictid: "", stnkgeovillageid: "" });
      if (name === "stnkgeocityid") Object.assign(next, { stnkgeodistrictid: "", stnkgeovillageid: "" });
      if (name === "stnkgeodistrictid") Object.assign(next, { stnkgeovillageid: "" });
      if (name === "bookingdate") next.bookingtime = "";
      // ganti ke Home Service / Antar Jemput -> default provinsi Jawa Timur bila belum diisi
      if (name === "bookingtypecode" && (value === "HS" || value === "AJ") && !next.geoprovinceid) next.geoprovinceid = "3500";
      return next;
    });
    setErrors((e) => {
      const n = { ...e };
      delete n[name];
      // km baru tidak boleh kurang dari lastkilometer kendaraan (mstvehicle)
      if (name === "lastkilometer") {
        const min = Number(form.minkilometer || 0);
        const val = Number(String(value).replace(/\D/g, "") || "0");
        if (String(value).trim() !== "" && min > 0 && val < min) n.lastkilometer = "booking.form.kmBelowLast";
      }
      return n;
    });
  };

  /* Nomor telepon: hanya digit; untuk +62 angka 0 di depan ditolak.
     Provider dicari dari 3 digit pertama (master PREFIXPHONE). */
  const isIndonesia = (cc = form.callerphonecc) => cc === "+62";
  const handlePhone = (raw, cc = form.callerphonecc) => {
    let digits = String(raw).replace(/\D/g, "");
    if (isIndonesia(cc)) {
      const stripped = digits.replace(/^0+/, "");
      setPhoneZeroHint(stripped !== digits);
      digits = stripped.slice(0, 13); // +62 maksimal 13 digit (cap keras, termasuk paste)
    } else {
      setPhoneZeroHint(false);
    }
    const hit = isIndonesia(cc) ? lookupProvider(digits) : null;
    setForm((f) => ({ ...f, callerphonecc: cc, callerphone: digits, callerphoneprovider: hit ? hit.name : "" }));
    setErrors((e) => {
      const n = { ...e };
      delete n.callerphone;
      // hit === undefined -> 3 digit awal lengkap tapi tidak ada di master
      if (isIndonesia(cc) && hit === undefined) n.callerphone = "booking.form.phoneNotRegistered";
      return n;
    });
  };
  const phoneHit = isIndonesia() ? lookupProvider(form.callerphone) : null;

  const cities = MST_GEOCITY.filter((c) => c.geoprovinceid === form.geoprovinceid);
  const districts = MST_GEODISTRICT.filter((d) => d.geocityid === form.geocityid);
  const villages = MST_GEOVILLAGE.filter((v) => v.geodistrictid === form.geodistrictid);
  // STNK geo: difilter oleh induk bila induk dipilih; bila induk kosong tampilkan semua (biar tetap bisa diedit)
  const stnkCities = form.stnkgeoprovinceid ? MST_GEOCITY.filter((c) => c.geoprovinceid === form.stnkgeoprovinceid) : MST_GEOCITY;
  const stnkDistricts = form.stnkgeocityid ? MST_GEODISTRICT.filter((d) => d.geocityid === form.stnkgeocityid) : MST_GEODISTRICT;
  const stnkVillages = form.stnkgeodistrictid ? MST_GEOVILLAGE.filter((v) => v.geodistrictid === form.stnkgeodistrictid) : MST_GEOVILLAGE;

  /* --- pencarian unit --------------------------------------------- */
  // debounce ketik -> fetch ke API (>= 4 karakter). Bila API mati -> fallback ke UNITS contoh.
  useEffect(() => {
    const qn = searchQuery.trim().replace(/\s+/g, "");
    if (qn.length < 4) {
      setSearchResults([]);
      setSearchLoading(false);
      return;
    }
    let cancelled = false;
    setSearchLoading(true);
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`${SEARCH_API}/unit/search?by=${encodeURIComponent(searchBy)}&q=${encodeURIComponent(searchQuery.trim())}`);
        const j = await res.json();
        if (cancelled) return;
        setSearchResults(j.ok ? j.data : []);
        setSearchOffline(false);
      } catch (e) {
        if (cancelled) return;
        setSearchOffline(true);
        const qq = searchQuery.trim().toLowerCase().replace(/\s+/g, "");
        setSearchResults(UNITS.filter((u) => String(u[searchBy] || "").toLowerCase().replace(/\s+/g, "").includes(qq)));
      } finally {
        if (!cancelled) setSearchLoading(false);
      }
    }, 300);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [searchQuery, searchBy]);

  const searchRows = useMemo(
    () => searchResults.map((u) => ({ value: u.unitid, label: u[searchBy] || u.policenumber, sub: u.marketname })),
    [searchResults, searchBy]
  );

  const applyUnit = (u) => {
    if (!u) {
      pushToast(t("booking.msg.unitNotFound"), "err");
      setUnitFound(false); // tidak ditemukan -> semua field boleh diinput manual
      setVehicleLocked(false);
      setStnkEdit(false);
      setUnitSuggestOpen(false);
      setSelectedUnitId("");
      return;
    }
    const stnk = u.stnk || {}; // hasil live (mstvehicle) tidak membawa data STNK
    setForm((f) => ({
      ...f,
      unitid: u.unitid,
      policenumber: u.policenumber,
      enginenumber: u.machinenumber, // form.enginenumber (Nomor Mesin) <- mstvehicle.machinenumber
      framenumber: u.framenumber,
      twodigitcode: u.twodigitcode, // Kode Tipe Unit <- mstmotor.code
      // segment & category motor (real: mstvehicle->mstmotor.gvsegmentid/gvcategoryid). Mockup: fallback MATIC/MID.
      motorsegment: u.motorsegment || "MATIC",
      motorcategory: u.motorcategory || "MID",
      assemblyyear: u.assemblyyear,
      marketname: u.marketname, // <- mstmotor.name
      colorcode: u.colorcode,
      colorname: u.colorname || MST_COLOR.find((c) => c.code === u.colorcode)?.name || "", // <- mstmotorcolor.colorname
      // Kilometer Terakhir <- mstvehicle.lastkilometer (0 bila kosong); tetap enable & bisa diedit
      lastkilometer: String(u.lastkilometer ?? "") || "0",
      minkilometer: String(u.lastkilometer ?? "") || "0", // km baru tidak boleh < nilai ini
      stnkfullname: stnk.fullname || "",
      stnkfirstname: stnk.firstname || "",
      stnklastname: stnk.lastname || "",
      stnkownernik: stnk.nik || stnk.ownernik || "",
      stnkaddress1: stnk.address1 || "",
      stnkaddress2: stnk.address2 || "",
      stnkpostalcode: stnk.postalcode || "",
      stnkgeoprovinceid: stnk.geoprovinceid || "", stnkprovincename: stnk.provincename || "",
      stnkgeocityid: stnk.geocityid || "", stnkcityname: stnk.cityname || "",
      stnkgeodistrictid: stnk.geodistrictid || "", stnkdistrictname: stnk.districtname || "",
      stnkgeovillageid: stnk.geovillageid || "", stnkvillagename: stnk.villagename || "",
      stnkcustomerid: stnk.customerid || "", // mstcustomer.id -> kunci UPDATE saat Simpan STNK
    }));
    setErrors({});
    setUnitFound(true); // data ditemukan -> saat Update hanya Plat Nomor (& Kilometer) yang enable
    setVehicleLocked(true);
    setStnkEdit(false); // STNK tampil mode view saat data baru di-load
    setUnitSuggestOpen(false); // tutup suggestion setelah load
    setSelectedUnitId(u.unitid);
    pushToast(t("booking.msg.unitFound"), "ok");
  };

  // pilih suggestion -> MASUK ke kotak input saja (belum load); load saat klik Cari
  const pickSuggestion = (unitid) => {
    const u = searchResults.find((x) => x.unitid === unitid) || UNITS.find((x) => x.unitid === unitid);
    if (u) {
      setSearchQuery(u[searchBy] || u.policenumber);
      setSelectedUnitId(unitid);
    }
    setUnitSuggestOpen(false);
  };

  const doSearch = async () => {
    const q = searchQuery.trim();
    if (q.replace(/\s+/g, "").length < 4) return pushToast(t("booking.msg.typeMinChars"), "err");
    setUnitSuggestOpen(false);
    // kalau sudah pilih suggestion, load unit itu persis (penting utk plat kembar)
    if (selectedUnitId) {
      const picked = searchResults.find((u) => u.unitid === selectedUnitId) || UNITS.find((u) => u.unitid === selectedUnitId);
      if (picked) return applyUnit(picked);
    }
    try {
      const res = await fetch(`${SEARCH_API}/unit/search?by=${encodeURIComponent(searchBy)}&q=${encodeURIComponent(q)}`);
      const j = await res.json();
      setSearchOffline(false);
      return applyUnit(j.ok && j.data.length ? j.data[0] : null);
    } catch (e) {
      // API mati -> fallback ke data contoh
      setSearchOffline(true);
      const qq = q.toLowerCase().replace(/\s+/g, "");
      return applyUnit(UNITS.find((u) => String(u[searchBy] || "").toLowerCase().replace(/\s+/g, "").includes(qq)) || null);
    }
  };

  /* --- validasi Langkah 1 ------------------------------------------ */
  const validate = () => {
    const e = {};
    if (!form.callername.trim()) e.callername = "booking.form.callerNameRequired";
    const phoneDigits = form.callerphone.replace(/\D/g, "");
    if (!phoneDigits) e.callerphone = "booking.form.phoneRequired";
    else if (isIndonesia()) {
      if (phoneDigits.length < 8 || phoneDigits.length > 13) e.callerphone = "booking.form.phoneLength";
      else if (!lookupProvider(phoneDigits)) e.callerphone = "booking.form.phoneNotRegistered";
    } else if (!/^[1-9][0-9]{8,12}$/.test(phoneDigits)) e.callerphone = "booking.form.phoneInvalid";
    if (needsAddress) {
      if (!form.address.trim()) e.address = "booking.form.addressRequired";
      if (!form.geoprovinceid) e.geoprovinceid = "booking.form.provinceRequired";
      if (!form.geocityid) e.geocityid = "booking.form.cityRequired";
      if (!form.geodistrictid) e.geodistrictid = "booking.form.districtRequired";
      if (!form.geovillageid) e.geovillageid = "booking.form.villageRequired";
    }
    if (!form.policenumber.trim()) e.policenumber = "booking.form.vehicleRequired";
    if (!String(form.lastkilometer).trim()) e.lastkilometer = "booking.form.lastKilometerRequired";
    else if (Number(form.minkilometer || 0) > 0 && Number(String(form.lastkilometer).replace(/\D/g, "") || "0") < Number(form.minkilometer))
      e.lastkilometer = "booking.form.kmBelowLast";
    if (!form.bookingdate) e.bookingdate = "booking.form.dateRequired";
    else if (form.bookingdate < todayISO()) e.bookingdate = "booking.form.dateBackdate";
    if (!form.bookingtime) e.bookingtime = "booking.form.timeRequired";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const goNext = () => {
    if (!validate()) return pushToast(t("booking.msg.invalidForm"), "err");
    pushToast(t("booking.msg.validForm"), "ok");
    setStep(2);
    window.scrollTo(0, 0);
  };

  const goStep3 = () => {
    if (!form.mechanicid) {
      setErrors((e) => ({ ...e, mechanicid: "booking.form.mechanicMainRequired" }));
      return pushToast(t("booking.msg.invalidForm"), "err");
    }
    pushToast(t("booking.msg.step3soon"));
  };

  // Langkah 2 handlers
  const pickMechanic = (id) => {
    const m = MST_MECHANIC.find((x) => x.id === id);
    setForm((f) => ({ ...f, mechanicid: id, mechanicname: m ? m.name : "", helpermechanics: f.helpermechanics.filter((h) => h.id !== id) }));
    if (helperpick === id) setHelperpick("");
    setErrors((e) => {
      const n = { ...e };
      delete n.mechanicid;
      return n;
    });
  };
  const addHelperPick = () => {
    const id = helperpick;
    if (!form.mechanicid || !id || id === form.mechanicid) return;
    setForm((f) => (f.helpermechanics.some((h) => h.id === id) ? f : { ...f, helpermechanics: [...f.helpermechanics, { id, name: MST_MECHANIC.find((m) => m.id === id)?.name || "" }] }));
    setHelperpick("");
  };
  const removeHelper = (id) => setForm((f) => ({ ...f, helpermechanics: f.helpermechanics.filter((h) => h.id !== id) }));
  // ===== Modal Tambah Service / Tambah Part =====
  const openAddService = () => { setSvcPkgOpen(false); setSvcPkg(""); setSvcSearch(""); setSvcSel([]); setAddModal("service"); };
  const toggleSvcPkg = () => { setSvcPkgOpen((o) => !o); setSvcSearch(""); };
  const pickSvcPkg = (code) => { setSvcPkg(code); setSvcPkgOpen(false); setSvcSel([]); setSvcSearch(""); };
  const toggleSvcSel = (code) => setSvcSel((a) => (a.includes(code) ? a.filter((c) => c !== code) : [...a, code]));
  const saveAddService = () => {
    setForm((f) => {
      const add = svcSel
        .filter((code) => !f.serviceitems.some((s) => s.code === code))
        .map((code) => {
          const s = MST_SERVICE.find((x) => x.code === code);
          const pk = MST_SERVICE_PKG.find((p) => p.code === s.pkgcode) || {};
          return { code: s.code, name: s.name, price: s.price, duration: pk.estimatetime || 0 };
        });
      return { ...f, serviceitems: [...f.serviceitems, ...add] };
    });
    setAddModal(null);
  };
  const removeService = (code) => setForm((f) => ({ ...f, serviceitems: f.serviceitems.filter((s) => s.code !== code) }));
  const openAddPart = () => { setPartSearch(""); setPartSel([]); setAddModal("part"); };
  const togglePartSel = (code) => setPartSel((a) => (a.includes(code) ? a.filter((c) => c !== code) : [...a, code]));
  const saveAddPart = () => {
    setForm((f) => {
      const add = partSel
        .filter((code) => !f.partitems.some((p) => p.code === code))
        .map((code) => {
          const p = MST_PART.find((x) => x.code === code) || MST_PART_OIL.find((x) => x.code === code);
          return { code: p.code, name: p.name, price: p.price, qty: 1 };
        });
      const partitems = [...f.partitems, ...add];
      return { ...f, partitems, serviceitems: syncLightRepairItems(f.serviceitems, partitems, f.twodigitcode || "") };
    });
    setAddModal(null);
  };
  const removePart = (code) =>
    setForm((f) => {
      const partitems = f.partitems.filter((p) => p.code !== code);
      return { ...f, partitems, serviceitems: syncLightRepairItems(f.serviceitems, partitems, f.twodigitcode || "") };
    });
  const partQty = (code, delta) =>
    setForm((f) => ({ ...f, partitems: f.partitems.map((p) => (p.code === code ? { ...p, qty: Math.max(1, (p.qty || 1) + delta) } : p)) }));

  const err = (name) => (errors[name] ? t(errors[name]) : undefined);
  const nameOf = (rows, id) => rows.find((r) => r.id === id)?.name ?? "-";
  // untuk combo geo searchable
  const geoRows = (arr) => arr.map((r) => ({ value: r.id, label: r.name }));
  const geoName = (arr, id) => arr.find((r) => r.id === id)?.name ?? "";
  const country = COUNTRY_CODES.find((c) => c.code === form.callerphonecc) ?? COUNTRY_CODES[0];
  const twoSel = MST_MOTORAHM.find((x) => x.code === form.twodigitcode);
  const colorSel = MST_COLOR.find((c) => c.code === form.colorcode);
  // Saat data DITEMUKAN, klik Update hanya membuka Plat Nomor (& Kilometer). Field lain tetap terkunci
  // walau vehicleLocked=false, karena unit yang sama tidak boleh diubah data mesin/rangka/tipe/warna-nya.
  // Saat data TIDAK ditemukan (unitFound=false) -> field mengikuti vehicleLocked biasa (boleh input manual).
  const roFound = vehicleLocked || unitFound;
  // km: batas minimum + pesan (interpolasi nilai min)
  const kmMin = Number(form.minkilometer || 0);
  const kmMinTxt = kmMin.toLocaleString("id-ID") + " km";
  const kmErr = errors.lastkilometer
    ? errors.lastkilometer === "booking.form.kmBelowLast"
      ? `${t("booking.form.kmBelowLast")} (${kmMinTxt})`
      : t(errors.lastkilometer)
    : undefined;
  const kmHint = !kmErr && kmMin > 0 ? `${t("booking.form.kmMinInfo")} ${kmMinTxt}` : undefined;
  const fmtDate = (iso) => (iso ? iso.split("-").reverse().join("/") : "-");

  return (
    <div className="flex min-h-screen bg-gray-100 text-slate-800">
      {/* ---------- sidebar ---------- */}
      {sidebar && (
        <aside className="sticky top-0 flex h-screen w-[236px] shrink-0 flex-col border-r border-gray-200 bg-white">
          <div className="flex items-center gap-2 px-5 pb-3.5 pt-5">
            <span className="text-2xl font-extrabold leading-none tracking-tighter text-orange-500">MPM</span>
            <span className="text-[10.5px] font-semibold uppercase tracking-[0.14em] text-slate-500">NG SDMS</span>
          </div>
          <nav className="flex flex-1 flex-col gap-1.5 overflow-auto px-3 py-2">
            <div className="px-2 pb-0.5 pt-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-400">
              {t("booking.breadcrumb.root")}
            </div>
            <div className="flex items-center gap-2.5 rounded-lg border border-gray-100 bg-white px-3 py-2.5 text-[13.5px] font-semibold shadow-sm">
              <ClipboardList size={16} />
              {t("booking.nav.section")}
            </div>
            <button className="ml-2.5 flex items-center gap-2 rounded-lg bg-orange-500 px-3 py-2.5 text-left text-[13px] font-semibold text-white">
              <PhoneCall size={15} />
              {t("booking.nav.booking")}
            </button>
            <button className="ml-2.5 flex items-center gap-2 rounded-lg px-3 py-2.5 text-left text-[13px] text-slate-500 hover:bg-gray-100">
              <List size={15} />
              {t("booking.nav.list")}
            </button>
          </nav>
        </aside>
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        {/* ---------- topbar ---------- */}
        <header className="sticky top-0 z-20 flex h-16 items-center justify-between gap-4 border-b border-gray-200 bg-white px-6">
          <div className="flex items-center gap-2.5 text-sm text-slate-500">
            <button onClick={() => setSidebar((s) => !s)} className="rounded-lg p-1.5 text-slate-500 hover:bg-gray-100">
              <PanelLeft size={18} />
            </button>
            <span>{t("booking.breadcrumb.root")}</span>
            <span className="text-slate-300">/</span>
            <b className="font-bold text-slate-900">{t("booking.page.title")}</b>
          </div>
          <div className="flex items-center gap-3.5">
            <div className="flex gap-1 rounded-full bg-gray-100 p-1">
              {["id", "en"].map((l) => (
                <button
                  key={l}
                  onClick={() => setLang(l)}
                  className={`h-[30px] rounded-full px-4 text-[13px] font-semibold ${
                    lang === l ? "bg-white text-slate-800 shadow-sm" : "text-slate-500"
                  }`}
                >
                  {l.toUpperCase()}
                </button>
              ))}
            </div>
            <button className="flex h-12 items-center gap-2.5 rounded-full border border-gray-200 bg-white py-0 pl-1.5 pr-3">
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-orange-500 text-[13px] font-bold text-white">
                PK
              </span>
              <span className="text-left">
                <span className="block text-[13.5px] font-bold leading-tight">Pak Kabeng</span>
                <span className="block text-[11.5px] text-slate-500">
                  {SESSION_DEALER.nmscode} • {SESSION_DEALER.name}
                </span>
              </span>
              <ChevronsUpDown size={15} className="text-slate-400" />
            </button>
          </div>
        </header>

        {/* ---------- konten ---------- */}
        <div className="mx-auto flex w-full max-w-[1620px] flex-col gap-[18px] px-7 pb-28 pt-7">
          <Stepper step={step} t={t} />

          {step === 1 && (
          <>
          {/* ===== Informasi Penelpon ===== */}
          <Card icon={PhoneCall} title={t("booking.section.callerInfo")}>
            <div className="grid grid-cols-1 gap-x-7 gap-y-[18px] md:grid-cols-2">
              {/* BIND: trxbookinghomeservice.callername */}
              <Field label={t("booking.form.callerName")} required error={err("callername")}>
                <TextField
                  value={form.callername}
                  onChange={(v) => setF("callername", v)}
                  placeholder={t("booking.form.callerName")}
                  error={err("callername")}
                />
              </Field>

              {/* BIND: callerphonecc + callerphone */}
              <Field label={t("booking.form.phoneNumber")} required error={err("callerphone")}>
                <div className="flex gap-3">
                  <div className="relative w-28 shrink-0">
                    <svg width="18" height="13" viewBox="0 0 18 13" className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 rounded-[2px]">
                      <rect width="18" height="6.5" fill={country.top} />
                      <rect y="6.5" width="18" height="6.5" fill={country.bottom} />
                      <rect x=".5" y=".5" width="17" height="12" fill="none" stroke="rgba(0,0,0,.12)" />
                    </svg>
                    <select
                      className={`${inputBase} ${inputTone(false, false)} cursor-pointer appearance-none pl-9 pr-7`}
                      value={form.callerphonecc}
                      /* ganti negara -> hitung ulang provider & buang sisa 0 di depan */
                      onChange={(e) => handlePhone(form.callerphone, e.target.value)}
                    >
                      {COUNTRY_CODES.map((c) => (
                        <option key={c.code} value={c.code}>
                          {c.code}
                        </option>
                      ))}
                    </select>
                    <ChevronDown size={16} className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500" />
                  </div>
                  <TextField
                    value={form.callerphone}
                    onChange={(v) => handlePhone(v)}
                    placeholder="81234567890"
                    inputMode="numeric"
                    error={err("callerphone")}
                  />
                </div>

                {/* awalan 0 dibuang untuk +62 */}
                {phoneZeroHint && (
                  <span className="mt-1.5 flex items-start gap-1.5 text-xs leading-snug text-amber-700">
                    <AlertTriangle size={14} className="mt-px shrink-0" />
                    {t("booking.form.phoneNoLeadingZero")}
                  </span>
                )}
                {/* provider dari 3 digit awal - pesan "tidak terdaftar" sudah tampil lewat error field */}
                {!err("callerphone") && phoneHit && (
                  <span className="mt-1.5 flex items-start gap-1.5 text-xs leading-snug text-emerald-700">
                    <CheckCircle2 size={14} className="mt-px shrink-0" />
                    {t("booking.form.phoneProvider")}: <b className="font-bold">{phoneHit.name}</b>
                  </span>
                )}
                {/* aturan panjang 8-13 + penghitung karakter, tampil live selama ada input +62 */}
                {!err("callerphone") && isIndonesia() && form.callerphone.length > 0 && (
                  <span className="mt-1.5 flex items-start gap-1.5 text-xs leading-snug text-slate-500">
                    <Info size={14} className="mt-px shrink-0" />
                    <span>
                      {t("booking.form.phoneRule")}{" "}
                      <b className="font-semibold tabular-nums">({form.callerphone.length}/13)</b>
                    </span>
                  </span>
                )}
              </Field>
            </div>
          </Card>

          {/* ===== Lokasi Layanan ===== */}
          <Card icon={MapPin} title={t("booking.section.serviceLocation")}>
            {isAhass ? (
              /* ===== AHASS: dealer dari session login (dbo.mstdealer H2) ===== */
              <>
                <div className="grid grid-cols-1 gap-x-7 gap-y-[18px] md:grid-cols-2">
                  {/* kolom kiri: jenis lokasi + Is Pos */}
                  <div className="flex flex-col gap-[18px]">
                    {/* BIND: bookingtypecode -> mstgeneralvalue group BOOKINGTYPE */}
                    <Field label={t("booking.form.serviceLocation")}>
                      <SelectField
                        value={form.bookingtypecode}
                        onChange={(v) => setF("bookingtypecode", v)}
                        rows={GV_BOOKINGTYPE}
                        valueKey="code"
                        noPlaceholder
                      />
                    </Field>
                    {/* BIND: mstdealer.ispos (readonly, sesuai login) */}
                    <label className="inline-flex items-center gap-2 text-[13.5px] text-slate-800">
                      <input type="checkbox" disabled checked={SESSION_DEALER.ispos} className="h-4 w-4 accent-orange-500" />
                      <span>{t("booking.form.isPos")}</span>
                    </label>
                  </div>

                  {/* kolom kanan: AHASS + Kota AHASS (dbo.mstdealer, readonly sesuai login) */}
                  <div className="flex flex-col gap-[18px]">
                    {/* BIND: ahmcode - name */}
                    <Field label={t("booking.form.ahass")}>
                      <TextField value={`${SESSION_DEALER.ahmcode} - ${SESSION_DEALER.name}`} onChange={() => {}} readOnly />
                    </Field>
                    {/* BIND: dbo.mstdealer.cityname */}
                    <Field label={t("booking.form.ahassCity")}>
                      <TextField value={SESSION_DEALER.cityname} onChange={() => {}} readOnly />
                    </Field>
                  </div>
                </div>

                <div className="mt-4 flex items-start gap-2.5 rounded-xl border border-blue-200 bg-blue-50 px-3.5 py-3 text-[13px] text-blue-900">
                  <Info size={16} className="mt-0.5 shrink-0" />
                  <span>{t("booking.note.ahass")}</span>
                </div>
              </>
            ) : (
              /* ===== Home Service / Antar Jemput: alamat + geo cascading ===== */
              <>
                <div className="grid grid-cols-1 gap-x-7 gap-y-[18px] md:grid-cols-2">
                  {/* BIND: bookingtypecode -> mstgeneralvalue group BOOKINGTYPE */}
                  <Field label={t("booking.form.serviceLocation")}>
                    <SelectField
                      value={form.bookingtypecode}
                      onChange={(v) => setF("bookingtypecode", v)}
                      rows={GV_BOOKINGTYPE}
                      valueKey="code"
                      noPlaceholder
                    />
                  </Field>

                  {/* BIND: serviceaddress */}
                  <Field label={t("booking.form.address")} required error={err("address")}>
                    <TextField
                      value={form.address}
                      onChange={(v) => setF("address", v)}
                      placeholder={t("booking.form.address")}
                      error={err("address")}
                    />
                  </Field>

                  {/* BIND: geoprovinceid -> dbo.mstgeoprovince.id (default Jawa Timur), searchable */}
                  <Field label={t("booking.form.province")} required error={err("geoprovinceid")}>
                    <ComboField
                      value={form.geoprovinceid}
                      display={geoName(MST_GEOPROVINCE, form.geoprovinceid)}
                      rows={geoRows(MST_GEOPROVINCE)}
                      onPick={(v) => setF("geoprovinceid", v)}
                      placeholder={t("booking.form.province")}
                      error={err("geoprovinceid")}
                    />
                  </Field>

                  {/* BIND: geocityid -> dbo.mstgeocity.id (filter geoprovinceid), searchable */}
                  <Field label={t("booking.form.city")} required error={err("geocityid")}>
                    <ComboField
                      value={form.geocityid}
                      display={geoName(cities, form.geocityid)}
                      rows={geoRows(cities)}
                      onPick={(v) => setF("geocityid", v)}
                      placeholder={t("booking.form.city")}
                      readOnly={!form.geoprovinceid}
                      error={err("geocityid")}
                    />
                  </Field>

                  {/* BIND: geodistrictid -> dbo.mstgeodistrict.id (filter geocityid), searchable */}
                  <Field
                    label={t("booking.form.district")}
                    required
                    error={err("geodistrictid")}
                    hint={cityHasNoSample ? t("booking.hint.geoSample") : undefined}
                  >
                    <ComboField
                      value={form.geodistrictid}
                      display={geoName(districts, form.geodistrictid)}
                      rows={geoRows(districts)}
                      onPick={(v) => setF("geodistrictid", v)}
                      placeholder={t("booking.form.district")}
                      readOnly={!form.geocityid}
                      error={err("geodistrictid")}
                    />
                  </Field>

                  {/* BIND: geovillageid -> dbo.mstgeovillage.id (filter geodistrictid), searchable */}
                  <Field label={t("booking.form.village")} required error={err("geovillageid")}>
                    <ComboField
                      value={form.geovillageid}
                      display={geoName(villages, form.geovillageid)}
                      rows={geoRows(villages)}
                      onPick={(v) => setF("geovillageid", v)}
                      placeholder={t("booking.form.village")}
                      readOnly={!form.geodistrictid}
                      error={err("geovillageid")}
                    />
                  </Field>
                </div>

                <div className="mt-[18px] flex items-start gap-2.5 rounded-xl border border-blue-200 bg-blue-50 px-3.5 py-3 text-[13px] text-blue-900">
                  <Info size={16} className="mt-0.5 shrink-0" />
                  <span>{t(form.bookingtypecode === "AJ" ? "booking.note.pickup" : "booking.note.homeservice")}</span>
                </div>
              </>
            )}
          </Card>

          {/* ===== Kendaraan / STNK ===== */}
          <Card
            right={
              form.unitid && (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">
                  <CheckCircle2 size={13} />
                  {form.unitid}
                </span>
              )
            }
            title={null}
          >
            <div className="mb-4 inline-flex gap-0.5 rounded-full bg-gray-100 p-1">
              {[
                { key: "unit", label: t("booking.tab.vehicleInfo") },
                { key: "stnk", label: t("booking.tab.stnkInfo") },
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setVehTab(tab.key)}
                  className={`h-[34px] rounded-full px-4 text-[13.5px] font-semibold ${
                    vehTab === tab.key ? "bg-white text-slate-800 shadow-sm" : "text-slate-500"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* baris pencarian unit */}
            <div className="mb-5 flex flex-wrap items-center gap-3">
              <div className="w-[190px]">
                <SelectField
                  value={searchBy}
                  onChange={(v) => {
                    setSearchBy(v);
                    setSearchQuery("");
                    setSelectedUnitId("");
                    setUnitSuggestOpen(false);
                    setSearchResults([]);
                  }}
                  rows={[
                    { code: "policenumber", name: t("booking.form.policeNumber") },
                    { code: "machinenumber", name: t("booking.form.engineNumber") },
                    { code: "framenumber", name: t("booking.form.frameNumber") },
                  ]}
                  valueKey="code"
                  placeholder={t("booking.placeholder.select")}
                />
              </div>
              {/* Kotak pencarian unit: input langsung + suggestion di bawah (KHUSUS Nopol/Mesin/Rangka).
                  Pilih suggestion -> masuk ke input (belum load); tekan Cari untuk load. */}
              <div className="relative w-[260px]">
                <div className="flex h-10 items-center gap-2 rounded-xl border border-gray-200 bg-white px-3 focus-within:border-orange-500 focus-within:ring-2 focus-within:ring-orange-500/15">
                  <Search size={16} className="shrink-0 text-slate-400" />
                  <input
                    id="unitSearchInput"
                    autoComplete="off"
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      setSelectedUnitId("");
                      setUnitSuggestOpen(true);
                    }}
                    onFocus={() => setUnitSuggestOpen(true)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        doSearch();
                      }
                    }}
                    placeholder={`${t("booking.placeholder.search")} ${
                      searchBy === "policenumber"
                        ? t("booking.form.policeNumber")
                        : searchBy === "machinenumber"
                        ? t("booking.form.engineNumber")
                        : t("booking.form.frameNumber")
                    }`}
                    className="min-w-0 flex-1 border-0 bg-transparent p-0 text-sm outline-none placeholder:text-slate-400"
                  />
                </div>
                {unitSuggestOpen && searchQuery.trim().replace(/\s+/g, "").length >= 4 && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setUnitSuggestOpen(false)} />
                    <div className="absolute left-0 right-0 top-[calc(100%+6px)] z-50 max-h-64 overflow-auto rounded-xl border border-gray-200 bg-white p-1.5 shadow-xl">
                      {searchRows.length ? (
                        searchRows.map((r) => (
                          <button
                            key={r.value}
                            type="button"
                            onClick={() => pickSuggestion(r.value)}
                            className={`flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left text-[13.5px] hover:bg-gray-50 ${
                              String(r.value) === String(selectedUnitId) ? "bg-orange-50" : ""
                            }`}
                          >
                            <span className="font-medium text-slate-800">{r.label}</span>
                            {r.sub ? <span className="ml-auto text-xs text-slate-400">{r.sub}</span> : null}
                          </button>
                        ))
                      ) : (
                        <div className="px-2.5 py-3 text-center text-[13px] text-slate-400">
                          {searchLoading ? t("booking.msg.searching") : t("booking.placeholder.noResult")}
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>
              <button
                onClick={doSearch}
                className="inline-flex h-10 items-center gap-2 rounded-xl bg-orange-500 px-4 text-sm font-semibold text-white hover:bg-orange-600"
              >
                <Search size={16} />
                {t("booking.action.search")}
              </button>
              {/* status sumber pencarian */}
              {searchLoading ? (
                <span className="w-full text-xs text-blue-700">{t("booking.msg.searching")}</span>
              ) : searchOffline ? (
                <span className="w-full text-xs text-amber-700">{t("booking.msg.searchOffline")}</span>
              ) : searchResults.length ? (
                <span className="inline-flex w-full items-center gap-1 text-xs font-semibold text-emerald-700">
                  <CheckCircle2 size={13} /> Live DB
                </span>
              ) : null}
            </div>

            {vehTab === "unit" ? (
              <div className="grid grid-cols-1 gap-x-7 gap-y-[18px] md:grid-cols-2">
                {/* BIND: policenumber / enginenumber / framenumber */}
                <Field label={t("booking.form.policeNumber")} error={err("policenumber")}>
                  <TextField
                    value={form.policenumber}
                    onChange={(v) => setF("policenumber", v)}
                    placeholder={t("booking.form.policeNumber")}
                    readOnly={vehicleLocked}
                    upper
                    error={err("policenumber")}
                  />
                </Field>
                <Field label={t("booking.form.engineNumber")}>
                  <TextField
                    value={form.enginenumber}
                    onChange={(v) => setF("enginenumber", v)}
                    placeholder={t("booking.form.engineNumber")}
                    readOnly={roFound}
                    upper
                  />
                </Field>
                <Field label={t("booking.form.frameNumber")}>
                  <TextField
                    value={form.framenumber}
                    onChange={(v) => setF("framenumber", v)}
                    placeholder={t("booking.form.frameNumber")}
                    readOnly={roFound}
                    upper
                  />
                </Field>

                {/* BIND: twodigitcode -> dbo.msttwodigitmotor.kodetwodigit */}
                <Field label={t("booking.form.twoDigitCode")}>
                  <ComboField
                    value={form.twodigitcode}
                    display={
                      twoSel
                        ? twoSel.name
                          ? `${twoSel.code} - ${twoSel.name}`
                          : twoSel.code
                        : form.twodigitcode
                        ? `${form.twodigitcode}${form.marketname ? ` - ${form.marketname}` : ""}`
                        : ""
                    }
                    rows={MST_MOTORAHM.map((x) => ({ value: x.code, label: x.code, sub: x.name }))}
                    onPick={(code) => {
                      setF("twodigitcode", code);
                      // Market Name terisi otomatis dari Kode Tipe Unit yang dipilih
                      const row = MST_MOTORAHM.find((x) => x.code === code);
                      setF("marketname", row ? row.name : "");
                    }}
                    placeholder={t("booking.form.twoDigitCode")}
                    readOnly={roFound}
                  />
                </Field>

                <Field label={t("booking.form.assemblyYear")}>
                  <TextField
                    value={form.assemblyyear}
                    onChange={(v) => setF("assemblyyear", v.replace(/[^0-9]/g, ""))}
                    placeholder={t("booking.form.assemblyYear")}
                    readOnly={roFound}
                    maxLength={4}
                    inputMode="numeric"
                  />
                </Field>

                {/* BIND: marketname -> dbo.mstmotor.name (selalu disable, terisi auto dari Kode Tipe Unit) */}
                <Field label={t("booking.form.marketName")}>
                  <TextField
                    value={form.marketname}
                    onChange={() => {}}
                    placeholder={t("booking.form.marketName")}
                    readOnly
                  />
                </Field>

                {/* BIND: colorcode -> dbo.mstcolor.code */}
                <Field label={t("booking.form.color")}>
                  <ComboField
                    value={form.colorcode}
                    display={colorSel ? colorSel.name : form.colorname || ""}
                    rows={MST_COLOR.map((c) => ({ value: c.code, label: c.name, sub: c.code }))}
                    onPick={(code) => setF("colorcode", code)}
                    placeholder={t("booking.form.color")}
                    readOnly={roFound}
                  />
                </Field>

                {/* BIND: lastkilometer - prefill mstvehicle.lastkilometer, enable, wajib, tidak boleh < minkilometer */}
                <Field label={t("booking.form.lastKilometer")} required error={kmErr} hint={kmHint}>
                  <TextField
                    value={form.lastkilometer}
                    onChange={(v) => setF("lastkilometer", v.replace(/[^0-9]/g, ""))}
                    placeholder={t("booking.form.lastKilometer")}
                    inputMode="numeric"
                    error={kmErr}
                  />
                </Field>
              </div>
            ) : !stnkEdit ? (
              /* ===== STNK MODE VIEW (custvehiclestnk + mstcustomer) ===== */
              <>
                <div className="grid grid-cols-1 gap-x-7 gap-y-[18px] md:grid-cols-2">
                  {/* BIND: mstcustomer.fullname */}
                  <Field label={t("booking.form.ownerName")}>
                    <TextField value={form.stnkfullname} onChange={() => {}} placeholder={t("booking.form.ownerName")} readOnly />
                  </Field>
                  {/* BIND: mstcustomer.nik */}
                  <Field label={t("booking.form.ownerNik")}>
                    <TextField value={form.stnkownernik} onChange={() => {}} placeholder={t("booking.form.ownerNik")} readOnly />
                  </Field>
                  {/* BIND: mstcustomer.address1 + ' ' + address2 */}
                  <Field label={t("booking.form.stnkAddress")}>
                    <TextField value={[form.stnkaddress1, form.stnkaddress2].filter(Boolean).join(" ")} onChange={() => {}} placeholder={t("booking.form.stnkAddress")} readOnly />
                  </Field>
                  {/* BIND: mstcustomer.postalcode */}
                  <Field label={t("booking.form.postalCode")}>
                    <TextField value={form.stnkpostalcode} onChange={() => {}} placeholder={t("booking.form.postalCode")} readOnly />
                  </Field>
                </div>
                <div className="mt-5 grid grid-cols-2 gap-x-5 gap-y-4 border-t border-gray-100 pt-4 lg:grid-cols-4">
                  {[
                    [t("booking.form.province"), form.stnkprovincename],
                    [t("booking.form.city"), form.stnkcityname],
                    [t("booking.form.district"), form.stnkdistrictname],
                    [t("booking.form.village"), form.stnkvillagename],
                  ].map(([k, v]) => (
                    <div key={k}>
                      <div className="text-xs text-slate-500">{k}</div>
                      <div className="mt-0.5 text-[13.5px] font-semibold">{v || "-"}</div>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              /* ===== STNK MODE UBAH (edit) ===== */
              <div className="grid grid-cols-1 gap-x-7 gap-y-[18px] md:grid-cols-2">
                {/* BIND: mstcustomer.firstname / lastname */}
                <Field label={t("booking.form.ownerFirstName")}>
                  <TextField value={form.stnkfirstname} onChange={(v) => setF("stnkfirstname", v)} placeholder={t("booking.form.ownerFirstName")} />
                </Field>
                <Field label={t("booking.form.ownerLastName")}>
                  <TextField value={form.stnklastname} onChange={(v) => setF("stnklastname", v)} placeholder={t("booking.form.ownerLastName")} />
                </Field>
                {/* NIK tetap disable */}
                <Field label={t("booking.form.ownerNik")}>
                  <TextField value={form.stnkownernik} onChange={(v) => setF("stnkownernik", v.replace(/\D/g, ""))} placeholder={t("booking.form.ownerNik")} readOnly={stnkNikLocked} maxLength={16} />
                </Field>
                <Field label={t("booking.form.postalCode")}>
                  <TextField value={form.stnkpostalcode} onChange={(v) => setF("stnkpostalcode", v)} placeholder={t("booking.form.postalCode")} maxLength={5} />
                </Field>
                {/* BIND: mstcustomer.address1 / address2 */}
                <Field label={t("booking.form.stnkAddress1")}>
                  <TextField value={form.stnkaddress1} onChange={(v) => setF("stnkaddress1", v)} placeholder={t("booking.form.stnkAddress1")} />
                </Field>
                <Field label={t("booking.form.stnkAddress2")}>
                  <TextField value={form.stnkaddress2} onChange={(v) => setF("stnkaddress2", v)} placeholder={t("booking.form.stnkAddress2")} />
                </Field>
                {/* geo cascading (mstgeo*) */}
                <Field label={t("booking.form.province")}>
                  <ComboField value={form.stnkgeoprovinceid} display={geoName(MST_GEOPROVINCE_ALL, form.stnkgeoprovinceid)} rows={geoRows(MST_GEOPROVINCE_ALL)} onPick={(v) => setF("stnkgeoprovinceid", v)} placeholder={t("booking.form.province")} />
                </Field>
                <Field label={t("booking.form.city")}>
                  <ComboField value={form.stnkgeocityid} display={geoName(stnkCities, form.stnkgeocityid)} rows={geoRows(stnkCities)} onPick={(v) => setF("stnkgeocityid", v)} placeholder={t("booking.form.city")} />
                </Field>
                <Field label={t("booking.form.district")}>
                  <ComboField value={form.stnkgeodistrictid} display={geoName(stnkDistricts, form.stnkgeodistrictid)} rows={geoRows(stnkDistricts)} onPick={(v) => setF("stnkgeodistrictid", v)} placeholder={t("booking.form.district")} />
                </Field>
                <Field label={t("booking.form.village")}>
                  <ComboField value={form.stnkgeovillageid} display={geoName(stnkVillages, form.stnkgeovillageid)} rows={geoRows(stnkVillages)} onPick={(v) => setF("stnkgeovillageid", v)} placeholder={t("booking.form.village")} />
                </Field>
              </div>
            )}

            <div className="mt-5 flex justify-end">
              {vehTab === "unit" ? (
                /* Tombol Ubah/Simpan KHUSUS Informasi Kendaraan (state: vehicleLocked) */
                <button
                  onClick={() => {
                    if (vehicleLocked) {
                      // klik "Ubah" -> buka edit. Jika data ditemukan hanya Plat Nomor (& Kilometer) yang enable.
                      setVehicleLocked(false);
                      pushToast(t("booking.msg.editUnlocked"));
                      return;
                    }
                    // klik "Simpan": bila data ditemukan -> validasi km lalu UPDATE ke dbo.mstvehicle
                    if (unitFound) {
                      const kmv = Number(String(form.lastkilometer).replace(/\D/g, "") || "0");
                      const kmMinV = Number(form.minkilometer || 0);
                      if (kmMinV > 0 && kmv < kmMinV) {
                        setErrors((e) => ({ ...e, lastkilometer: "booking.form.kmBelowLast" }));
                        pushToast(`${t("booking.form.kmBelowLast")} (${kmMinV.toLocaleString("id-ID")} km)`, "err");
                        return; // jangan lock selama km belum valid
                      }
                      const upd = buildVehicleUpdate(form);
                      pushToast(
                        `${t("booking.msg.vehicleUpdated")}: ${upd.set.policenumber} / ${upd.set.lastkilometer.toLocaleString("id-ID")} km`,
                        "ok"
                      );
                    }
                    setVehicleLocked(true);
                  }}
                  className="inline-flex h-10 items-center gap-2 rounded-full border border-orange-500 bg-white px-4 text-sm font-semibold text-orange-500 hover:bg-orange-50"
                >
                  {vehicleLocked ? <Pencil size={16} /> : <Lock size={16} />}
                  {vehicleLocked ? t("booking.action.edit") : t("booking.action.lock")}
                </button>
              ) : (
                /* Tombol Ubah/Simpan KHUSUS Informasi STNK (state: stnkEdit) - INDEPENDEN dari kendaraan */
                <button
                  onClick={() => {
                    if (!stnkEdit) {
                      // NIK: terkunci hanya bila SUDAH terisi saat mulai edit; kosong -> boleh diinput
                      setStnkNikLocked(!!String(form.stnkownernik || "").trim());
                      setStnkEdit(true);
                      pushToast(t("booking.msg.stnkEditUnlocked"));
                    } else {
                      // Simpan STNK: gabungkan Nama Awal + Akhir jadi fullname, UPDATE ke dbo.mstcustomer, keluar dari mode edit
                      const cu = buildCustomerUpdate(form);
                      setForm((f) => ({ ...f, stnkfullname: `${f.stnkfirstname} ${f.stnklastname}`.trim() || f.stnkfullname }));
                      setStnkEdit(false);
                      pushToast(`${t("booking.msg.stnkSaved")} (mstcustomer.fullname="${cu.set.fullname}", modifiedby="${cu.set.modifiedby}")`, "ok");
                    }
                  }}
                  className="inline-flex h-10 items-center gap-2 rounded-full border border-orange-500 bg-white px-4 text-sm font-semibold text-orange-500 hover:bg-orange-50"
                >
                  {!stnkEdit ? <Pencil size={16} /> : <Lock size={16} />}
                  {!stnkEdit ? t("booking.action.edit") : t("booking.action.lock")}
                </button>
              )}
            </div>
          </Card>

          {/* ===== Jadwal Booking ===== */}
          <Card icon={Calendar} title={t("booking.section.schedule")}>
            <div className="grid grid-cols-1 gap-x-7 gap-y-[18px] md:grid-cols-2">
              <div className="flex flex-col gap-[18px]">
                {/* BIND: channelbookingcode -> mstgeneralvalue "CHANNEL BOOKING" */}
                <Field label={t("booking.form.channelBooking")} required>
                  <SelectField
                    value={form.channelbookingcode}
                    onChange={(v) => setF("channelbookingcode", v)}
                    rows={GV_CHANNELBOOKING}
                    valueKey="code"
                    noPlaceholder
                  />
                </Field>
                {/* BIND: notes - opsional, maksimal 100 karakter */}
                <Field label={t("booking.form.notes")} hint={t("booking.form.notesHint")}>
                  <TextField value={form.notes} onChange={(v) => setF("notes", v)} placeholder={t("booking.form.notesPlaceholder")} maxLength={100} />
                </Field>
              </div>

              <div className="flex flex-col gap-[18px]">
                {/* BIND: bookingdate - wajib, kosong di awal; ganti tanggal me-reset jam */}
                <Field label={t("booking.form.pickDate")} required error={err("bookingdate")}>
                  <input
                    type="date"
                    min={todayISO()}
                    className={`${inputBase} ${inputTone(err("bookingdate"), false)} cursor-pointer`}
                    value={form.bookingdate}
                    onClick={(e) => {
                      try {
                        e.currentTarget.showPicker();
                      } catch {}
                    }}
                    onFocus={(e) => {
                      try {
                        e.currentTarget.showPicker();
                      } catch {}
                    }}
                    onChange={(e) => {
                      const v = e.target.value;
                      setForm((f) => ({ ...f, bookingdate: v, bookingtime: "", bookingslothourid: "" }));
                      setErrors((er) => {
                        const n = { ...er };
                        delete n.bookingtime;
                        if (v && v < todayISO()) n.bookingdate = "booking.form.dateBackdate";
                        else delete n.bookingdate;
                        return n;
                      });
                    }}
                  />
                </Field>

                {/* Summary muncul setelah tanggal dipilih; BISA DIKLIK -> buka modal "Pilih Waktu Pemesanan" */}
                {form.bookingdate && (
                  <>
                    <button
                      type="button"
                      onClick={() => {
                        setTimeslotTemp(form.bookingtime || "");
                        setTimeslotOpen(true);
                      }}
                      className={`flex w-full flex-col gap-2 rounded-xl border-2 border-dashed px-4 py-3.5 text-left transition hover:bg-orange-50 hover:shadow-[0_4px_14px_rgba(249,115,22,0.14)] ${
                        err("bookingtime") ? "border-red-400 bg-red-50/50" : "border-orange-500 bg-orange-50/40"
                      }`}
                    >
                      <div className="text-xs font-extrabold uppercase tracking-wider">{t("booking.summary.title")}</div>
                      {[
                        [Calendar, t("booking.summary.bookingDate"), fmtDate(form.bookingdate)],
                        [Clock, t("booking.summary.bookingTime"), form.bookingtime || "-"],
                        [MapPin, t("booking.summary.serviceLocation"), GV_BOOKINGTYPE.find((g) => g.code === form.bookingtypecode)?.name ?? "-"],
                      ].map(([Icon, k, v]) => (
                        <div key={k} className="flex items-center gap-2 text-[13.5px] text-slate-500">
                          <Icon size={15} />
                          <span>{k}</span>
                          <b className="ml-auto font-bold tabular-nums text-slate-800">{v}</b>
                        </div>
                      ))}
                      <div className="flex items-center gap-1.5 text-[11.5px] font-semibold text-orange-600">
                        <Clock size={12} /> {t("booking.summary.pickTimeHint")}
                      </div>
                    </button>
                    {err("bookingtime") && <span className="text-xs text-red-600">{err("bookingtime")}</span>}
                  </>
                )}
              </div>
            </div>
          </Card>
          </>
          )}

          {step === 2 && (
          <>
          {/* ===== Data Mekanik ===== */}
          <Card icon={User} title={t("booking.section.mechanic")}>
            <div className="grid grid-cols-1 gap-x-7 gap-y-[18px] md:grid-cols-2">
              <Field label={t("booking.form.mechanicMain")} required error={err("mechanicid")}>
                <ComboField
                  value={form.mechanicid}
                  display={form.mechanicname}
                  rows={MST_MECHANIC.map((m) => ({ value: m.id, label: m.name }))}
                  onPick={pickMechanic}
                  placeholder={t("booking.form.pickMechanic")}
                />
              </Field>
              <Field label={t("booking.form.mechanicHelper")}>
                <div className="flex items-start gap-2.5">
                  <div className="min-w-0 flex-1">
                    <ComboField
                      value=""
                      display={helperpick ? MST_MECHANIC.find((m) => m.id === helperpick)?.name || "" : ""}
                      rows={MST_MECHANIC.filter((m) => m.id !== form.mechanicid && !form.helpermechanics.some((h) => h.id === m.id)).map((m) => ({ value: m.id, label: m.name }))}
                      onPick={setHelperpick}
                      placeholder={t("booking.form.pickMechanic")}
                      readOnly={!form.mechanicid}
                    />
                  </div>
                  <button
                    type="button"
                    disabled={!(form.mechanicid && helperpick && helperpick !== form.mechanicid && !form.helpermechanics.some((h) => h.id === helperpick))}
                    onClick={addHelperPick}
                    className="inline-flex h-10 flex-none items-center gap-1.5 rounded-xl border border-orange-500 bg-white px-4 text-sm font-semibold text-orange-500 hover:bg-orange-50 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <Plus size={16} /> {t("booking.action.addHelper")}
                  </button>
                </div>
                {!form.mechanicid && <span className="mt-1.5 block text-xs text-slate-500">{t("booking.form.pickMainFirst")}</span>}
                {form.helpermechanics.length > 0 && (
                  <div className="mt-2.5 flex flex-wrap gap-2">
                    {form.helpermechanics.map((h) => (
                      <span key={h.id} className="inline-flex items-center gap-1.5 rounded-full border border-orange-500 bg-orange-50 py-1 pl-3 pr-1.5 text-[13px] font-semibold text-orange-600">
                        {h.name}
                        <button type="button" onClick={() => removeHelper(h.id)} className="rounded-full p-0.5 hover:bg-orange-200/60">
                          <X size={13} />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </Field>
            </div>
          </Card>

          {/* ===== Jasa Service ===== */}
          <Card
            icon={Wrench}
            title={t("booking.section.service")}
            right={
              <button type="button" onClick={openAddService} className="inline-flex h-9 items-center gap-1.5 rounded-full border border-orange-500 bg-white px-4 text-sm font-semibold text-orange-500 hover:bg-orange-50">
                <Plus size={16} /> {t("booking.action.addService")}
              </button>
            }
          >
            {form.serviceitems.length > 0 ? (
              <div className="flex flex-col gap-3.5">
                {form.serviceitems.map((s) => (
                  <div key={s.code} className="flex items-center gap-3.5 rounded-2xl border border-gray-200 px-4 py-4">
                    <div className="min-w-0 flex-1">
                      <div className="mb-2 text-sm font-extrabold text-orange-600">
                        {svcLabel(s)}
                        {s.autoLr ? <span className="ml-2 rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-bold text-amber-700">Light Repair otomatis</span> : null}
                      </div>
                      <div className="flex flex-wrap gap-4 text-[13px] text-slate-500">
                        <span className="inline-flex items-center gap-1.5"><Coins size={15} /> {rp(s.price)}</span>
                        {s.duration ? <span className="inline-flex items-center gap-1.5"><Clock size={15} /> {s.duration} {t("booking.form.minute")}</span> : null}
                      </div>
                    </div>
                    <button type="button" onClick={() => removeService(s.code)} className="flex-none rounded-lg p-1.5 text-red-500 hover:bg-red-50">
                      <Trash2 size={18} />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyBox title={t("booking.svc.emptyTitle")} desc={t("booking.svc.emptyDesc")} />
            )}
          </Card>

          {/* ===== Spare Part ===== */}
          <Card
            icon={Package}
            title={t("booking.section.part")}
            right={
              <button type="button" onClick={openAddPart} className="inline-flex h-9 items-center gap-1.5 rounded-full border border-orange-500 bg-white px-4 text-sm font-semibold text-orange-500 hover:bg-orange-50">
                <Plus size={16} /> {t("booking.action.addPart")}
              </button>
            }
          >
            {form.partitems.length > 0 ? (
              <div className="flex flex-col gap-3.5">
                {form.partitems.map((p) => (
                  <div key={p.code} className="flex items-center gap-3.5 rounded-2xl border border-gray-200 px-4 py-4">
                    <div className="min-w-0 flex-1">
                      <div className="mb-2 text-sm font-extrabold text-orange-600">{p.code} - {p.name}</div>
                      <div className="flex flex-wrap gap-4 text-[13px] text-slate-500">
                        <span className="inline-flex items-center gap-1.5"><Coins size={15} /> {rp(p.price)}</span>
                      </div>
                    </div>
                    <span className="inline-flex flex-none items-center gap-2">
                      <button type="button" onClick={() => partQty(p.code, -1)} className="flex h-[26px] w-[26px] items-center justify-center rounded-lg border border-gray-200 hover:border-orange-500 hover:text-orange-500">
                        <Minus size={14} />
                      </button>
                      <b className="min-w-[20px] text-center tabular-nums">{p.qty}</b>
                      <button type="button" onClick={() => partQty(p.code, 1)} className="flex h-[26px] w-[26px] items-center justify-center rounded-lg border border-gray-200 hover:border-orange-500 hover:text-orange-500">
                        <Plus size={14} />
                      </button>
                    </span>
                    <span className="min-w-[96px] flex-none text-right text-[13px] tabular-nums text-slate-500">{rp(p.price * p.qty)}</span>
                    <button type="button" onClick={() => removePart(p.code)} className="flex-none rounded-lg p-1.5 text-red-500 hover:bg-red-50">
                      <Trash2 size={18} />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyBox title={t("booking.part.emptyTitle")} desc={t("booking.part.emptyDesc")} />
            )}
          </Card>
          </>
          )}
        </div>

        {/* ---------- action bar ---------- */}
        <div className="sticky bottom-0 z-10 flex items-center gap-3 border-t border-gray-200 bg-white/95 px-7 py-3.5 backdrop-blur">
          <button
            onClick={() => {
              if (step === 2) {
                setStep(1);
                window.scrollTo(0, 0);
                return;
              }
              setForm(EMPTY_FORM);
              setErrors({});
              setVehicleLocked(true);
              setUnitFound(false);
              setStnkEdit(false);
              setStnkNikLocked(false);
              setTimeslotOpen(false);
              setTimeslotTemp("");
              setSearchQuery("");
              setSearchResults([]);
              setSelectedUnitId("");
              setUnitSuggestOpen(false);
              setSearchOffline(false);
              setPhoneZeroHint(false);
              setStep(1);
              setHelperpick("");
              setAddModal(null);
              setSvcPkgOpen(false);
              setSvcPkg("");
              setSvcSearch("");
              setSvcSel([]);
              setPartSearch("");
              setPartSel([]);
            }}
            className="inline-flex h-10 items-center gap-2 rounded-xl px-4 text-sm font-semibold text-slate-500 hover:bg-gray-100"
          >
            {step === 2 && <ArrowLeft size={16} />}
            {step === 2 ? t("booking.action.prevStep") : t("booking.action.cancel")}
          </button>
          <div className="ml-auto flex gap-2.5">
            <button
              onClick={() => setShowPayload(true)}
              className="inline-flex h-10 items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 text-sm font-semibold hover:bg-gray-50"
            >
              <Code2 size={16} />
              {t("booking.action.payload")}
            </button>
            <button
              onClick={step === 2 ? goStep3 : goNext}
              className="inline-flex h-10 items-center gap-2 rounded-xl bg-orange-500 px-4 text-sm font-semibold text-white hover:bg-orange-600"
            >
              {step === 2 ? t("booking.action.next3") : t("booking.action.next")}
              <ArrowRight size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* ---------- modal payload ---------- */}
      {/* Modal Tambah Service */}
      {addModal === "service" &&
        (() => {
          const q = svcSearch.trim().toLowerCase();
          const pkg = MST_SERVICE_PKG.find((p) => p.code === svcPkg);
          const seg = form.motorsegment || "MATIC";
          const catg = form.motorcategory || "MID";
          // Hanya paket yg DIIZINKAN setting (HS_ALLOWED_PKG) & masih punya variant tersedia utk unit ini (variant sudah dipilih -> paket ikut hilang)
          let pkgs = MST_SERVICE_PKG.filter(
            (p) => HS_ALLOWED_PKG.includes(p.code) && MST_SERVICE.some((s) => s.pkgcode === p.code && s.segment === seg && s.category === catg && !form.serviceitems.some((x) => x.code === s.code)),
          );
          if (q) pkgs = pkgs.filter((p) => p.name.toLowerCase().includes(q));
          let vars = MST_SERVICE.filter((s) => s.pkgcode === svcPkg && s.segment === seg && s.category === catg && !form.serviceitems.some((x) => x.code === s.code));
          if (q) vars = vars.filter((s) => `${s.name} ${s.code}`.toLowerCase().includes(q));
          return (
            <div className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-900/45 p-6" onClick={() => setAddModal(null)}>
              <div className="max-h-[86vh] w-full max-w-2xl overflow-auto rounded-2xl bg-white p-6" onClick={(e) => e.stopPropagation()}>
                <div className="mb-4 flex items-start gap-3">
                  <div>
                    <h3 className="text-lg font-extrabold">{t("booking.svc.title")}</h3>
                    <p className="text-[13px] text-slate-500">{t("booking.svc.subtitle")}</p>
                  </div>
                  <button onClick={() => setAddModal(null)} className="ml-auto rounded-lg p-1.5 text-slate-400 hover:bg-gray-100">
                    <X size={18} />
                  </button>
                </div>
                <div className="mb-4 flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={toggleSvcPkg}
                    className={`inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-[13px] font-bold ${svcPkgOpen ? "border-orange-500 bg-orange-500 text-white" : "border-orange-500 text-orange-600 hover:bg-orange-50"}`}
                  >
                    <Plus size={15} /> {t("booking.svc.package")}
                  </button>
                  {pkg && (
                    <button type="button" onClick={toggleSvcPkg} className="rounded-full border border-orange-500 bg-orange-500 px-3.5 py-1.5 text-[13px] font-semibold text-white">
                      {pkg.name}
                    </button>
                  )}
                  <div className="relative ml-auto flex min-w-[200px] items-center">
                    <input
                      value={svcSearch}
                      onChange={(e) => setSvcSearch(e.target.value)}
                      placeholder={t("booking.svc.search")}
                      className="h-[38px] w-full rounded-full border border-gray-200 pl-4 pr-9 text-[13px] outline-none focus:border-orange-500"
                    />
                    <Search size={15} className="pointer-events-none absolute right-3 text-slate-400" />
                  </div>
                </div>
                {svcPkgOpen ? (
                  pkgs.length ? (
                    <>
                      <div className="mb-2 mt-1 text-[13px] font-bold text-slate-800">{t("booking.svc.package")}</div>
                      <div className="grid grid-cols-2 gap-3">
                        {pkgs.map((p) => (
                          <button
                            key={p.code}
                            type="button"
                            onClick={() => pickSvcPkg(p.code)}
                            className={`rounded-xl border px-4 py-3.5 text-left ${svcPkg === p.code ? "border-orange-500 bg-orange-50" : "border-gray-200 bg-white hover:border-orange-500"}`}
                          >
                            <div className="text-sm font-extrabold text-orange-600">{p.name}</div>
                          </button>
                        ))}
                      </div>
                    </>
                  ) : (
                    <div className="py-6 text-center text-sm text-slate-400">{t("booking.placeholder.noResult")}</div>
                  )
                ) : svcPkg ? (
                  vars.length ? (
                    <>
                      <div className="mb-2 mt-1 text-[13px] font-bold text-slate-800">
                        {pkg ? pkg.name : ""}
                        <span className="ml-1.5 inline-block rounded-full border border-orange-500 bg-orange-50 px-2 py-0.5 align-middle text-[11px] font-bold text-orange-600">
                          {seg} · {catg}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        {vars.map((s) => {
                          const on = svcSel.includes(s.code);
                          return (
                            <button
                              key={s.code}
                              type="button"
                              onClick={() => toggleSvcSel(s.code)}
                              className={`rounded-xl border px-4 py-3.5 text-left ${on ? "border-orange-500 bg-orange-50" : "border-gray-200 bg-white hover:border-orange-500"}`}
                            >
                              <div className="mb-1.5 text-sm font-extrabold text-orange-600">{s.name}</div>
                              <div className="flex items-center gap-2 text-[12.5px] text-slate-500">
                                {pkg && pkg.estimatetime ? (
                                  <>
                                    <Clock size={14} /> {pkg.estimatetime} {t("booking.form.minute")}
                                    <span className="h-1 w-1 rounded-full bg-gray-300" />
                                  </>
                                ) : null}
                                <Coins size={14} /> {rp(s.price)}
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </>
                  ) : (
                    <div className="py-6 text-center text-sm text-slate-400">{t("booking.placeholder.noResult")}</div>
                  )
                ) : (
                  <EmptyBox title={t("booking.svc.emptyTitle")} desc={t("booking.svc.emptyDesc")} />
                )}
                <div className="mt-6 flex justify-end gap-2.5">
                  <button onClick={() => setAddModal(null)} className="inline-flex h-10 items-center gap-2 rounded-xl px-4 text-sm font-semibold text-slate-500 hover:bg-gray-100">
                    <ArrowLeft size={16} /> {t("booking.timeslot.back")}
                  </button>
                  <button disabled={!svcSel.length} onClick={saveAddService} className="inline-flex h-10 items-center gap-2 rounded-xl bg-orange-500 px-4 text-sm font-semibold text-white hover:bg-orange-600 disabled:opacity-50">
                    <Save size={16} /> {t("booking.timeslot.save")}
                  </button>
                </div>
              </div>
            </div>
          );
        })()}

      {/* Modal Tambah Part */}
      {addModal === "part" &&
        (() => {
          const q = partSearch.trim().toLowerCase();
          // Mode OIL: bila jasa "Ganti oli plus" ada di daftar service -> hanya part grup OIL yg ter-mapping
          // ke Kode Tipe Unit (dummy MST_PART_OIL; real: mstpartkendaraan + mstpartgroup name='OIL').
          const oilMode = form.serviceitems.some((s) => /ganti oli/i.test(s.name));
          const kode = form.twodigitcode || "";
          // part yang tampil = berelasi dgn unit (mstpartkendaraan.kodetwodigit); bila unit tak diketahui, tampil semua.
          const base = oilMode ? MST_PART_OIL : MST_PART;
          let list = base.filter((p) => (!kode || (p.units || []).includes(kode)) && !form.partitems.some((x) => x.code === p.code));
          if (q) list = list.filter((p) => `${p.name} ${p.code}`.toLowerCase().includes(q));
          return (
            <div className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-900/45 p-6" onClick={() => setAddModal(null)}>
              <div className="max-h-[86vh] w-full max-w-2xl overflow-auto rounded-2xl bg-white p-6" onClick={(e) => e.stopPropagation()}>
                <div className="mb-4 flex items-start gap-3">
                  <div>
                    <h3 className="text-lg font-extrabold">{t("booking.part.title")}</h3>
                    <p className="text-[13px] text-slate-500">{t("booking.part.subtitle")}</p>
                  </div>
                  <button onClick={() => setAddModal(null)} className="ml-auto rounded-lg p-1.5 text-slate-400 hover:bg-gray-100">
                    <X size={18} />
                  </button>
                </div>
                <div className="mb-4 flex items-center">
                  <div className="relative ml-auto flex min-w-[220px] items-center">
                    <input
                      value={partSearch}
                      onChange={(e) => setPartSearch(e.target.value)}
                      placeholder={t("booking.part.search")}
                      className="h-[38px] w-full rounded-full border border-gray-200 pl-4 pr-9 text-[13px] outline-none focus:border-orange-500"
                    />
                    <Search size={15} className="pointer-events-none absolute right-3 text-slate-400" />
                  </div>
                </div>
                {oilMode && (
                  <div className="mb-3 rounded-lg border border-amber-300 bg-amber-50 px-3 py-2 text-[13px] text-amber-800">
                    Mode <b>Ganti oli plus</b>: hanya part grup <b>OIL</b> yang ter-mapping ke unit <b>{kode || "-"}</b> (cek <code>mstpartkendaraan</code>).
                  </div>
                )}
                {list.length ? (
                  <div className="grid grid-cols-2 gap-3">
                    {list.map((p) => {
                      const on = partSel.includes(p.code);
                      return (
                        <button
                          key={p.code}
                          type="button"
                          onClick={() => togglePartSel(p.code)}
                          className={`rounded-xl border px-4 py-3.5 text-left ${on ? "border-orange-500 bg-orange-50" : "border-gray-200 bg-white hover:border-orange-500"}`}
                        >
                          <div className="mb-1.5 text-sm font-extrabold text-orange-600">{p.name}</div>
                          <div className="flex items-center gap-2 text-[12.5px] text-slate-500">
                            {p.code}
                            <span className="h-1 w-1 rounded-full bg-gray-300" />
                            <Coins size={14} /> {rp(p.price)}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                ) : (
                  <EmptyBox title={t("booking.part.emptyTitle")} desc={t("booking.part.emptyDesc")} />
                )}
                <div className="mt-6 flex justify-end gap-2.5">
                  <button onClick={() => setAddModal(null)} className="inline-flex h-10 items-center gap-2 rounded-xl px-4 text-sm font-semibold text-slate-500 hover:bg-gray-100">
                    <ArrowLeft size={16} /> {t("booking.timeslot.back")}
                  </button>
                  <button disabled={!partSel.length} onClick={saveAddPart} className="inline-flex h-10 items-center gap-2 rounded-xl bg-orange-500 px-4 text-sm font-semibold text-white hover:bg-orange-600 disabled:opacity-50">
                    <Save size={16} /> {t("booking.timeslot.save")}
                  </button>
                </div>
              </div>
            </div>
          );
        })()}

      {/* Modal "Pilih Waktu Pemesanan" - dibuka dari Summary yang diklik */}
      {timeslotOpen && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-900/45 p-6" onClick={() => setTimeslotOpen(false)}>
          <div className="w-full max-w-3xl overflow-auto rounded-2xl bg-white p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-start gap-3">
              <div>
                <h3 className="text-base font-bold">{t("booking.timeslot.title")}</h3>
                <p className="text-[13px] text-slate-500">{t("booking.timeslot.subtitle")}</p>
              </div>
              <button onClick={() => setTimeslotOpen(false)} className="ml-auto rounded-lg p-1.5 text-slate-400 hover:bg-gray-100">
                <X size={18} />
              </button>
            </div>
            <div className="my-4 border-l-[3px] border-orange-500 pl-3">
              <div className="text-xs font-semibold text-slate-500">{fmtDateLong(form.bookingdate).day}</div>
              <div className="text-[19px] font-extrabold text-slate-800">{fmtDateLong(form.bookingdate).full}</div>
            </div>
            <div className="flex flex-wrap gap-3">
              {TIME_SLOTS.map((s) => {
                const full = s.quota === 0;
                const on = timeslotTemp === s.time;
                return (
                  <button
                    key={s.time}
                    type="button"
                    disabled={full}
                    onClick={() => setTimeslotTemp(s.time)}
                    className={`min-w-[150px] max-w-[200px] flex-1 rounded-xl border-[1.5px] px-3.5 py-3 text-center transition ${
                      full
                        ? "cursor-not-allowed border-gray-200 opacity-60"
                        : on
                        ? "border-orange-500 bg-orange-500"
                        : "border-orange-500 bg-white hover:bg-orange-50"
                    }`}
                  >
                    <div className={`text-[15px] font-extrabold tabular-nums ${full ? "text-slate-400 line-through" : on ? "text-white" : "text-slate-800"}`}>
                      {s.time}
                    </div>
                    <div className={`mt-1.5 flex items-center justify-center gap-1.5 text-xs ${on ? "text-white" : "text-slate-500"}`}>
                      <Ticket size={13} />
                      {full ? t("booking.slot.full") : `${t("booking.slot.remaining")} ${s.quota} ${t("booking.slot.unit")}`}
                    </div>
                  </button>
                );
              })}
            </div>
            <div className="mt-6 flex justify-end gap-2.5">
              <button onClick={() => setTimeslotOpen(false)} className="inline-flex h-10 items-center gap-2 rounded-xl px-4 text-sm font-semibold text-slate-500 hover:bg-gray-100">
                <ArrowLeft size={16} /> {t("booking.timeslot.back")}
              </button>
              <button
                disabled={!timeslotTemp}
                onClick={() => {
                  const slot = TIME_SLOTS.find((s) => s.time === timeslotTemp) || {};
                  setForm((f) => ({ ...f, bookingtime: timeslotTemp, bookingslothourid: slot.id || "" }));
                  setErrors((er) => {
                    const n = { ...er };
                    delete n.bookingtime;
                    return n;
                  });
                  setTimeslotOpen(false);
                }}
                className="inline-flex h-10 items-center gap-2 rounded-xl bg-orange-500 px-4 text-sm font-semibold text-white hover:bg-orange-600 disabled:opacity-50"
              >
                <Save size={16} /> {t("booking.timeslot.save")}
              </button>
            </div>
          </div>
        </div>
      )}

      {showPayload && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-900/45 p-6" onClick={() => setShowPayload(false)}>
          <div className="max-h-[86vh] w-full max-w-3xl overflow-auto rounded-2xl bg-white p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-start gap-3">
              <div>
                <h3 className="text-base font-bold">Payload Langkah 1</h3>
                <p className="text-[13px] text-slate-500">Bentuk baris yang dikirim ke POST /booking/homeservice/draft.</p>
              </div>
              <button onClick={() => setShowPayload(false)} className="ml-auto rounded-lg p-1.5 text-slate-400 hover:bg-gray-100">
                <X size={18} />
              </button>
            </div>
            <pre className="mt-3 overflow-auto rounded-xl bg-slate-900 p-4 font-mono text-xs leading-relaxed text-slate-200">
              {JSON.stringify(buildPayload(form), null, 2)}
            </pre>
          </div>
        </div>
      )}

      <Toast items={toasts} onClose={closeToast} />
    </div>
  );
}
