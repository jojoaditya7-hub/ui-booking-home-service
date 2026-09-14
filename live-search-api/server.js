/* =======================================================================
   API PENCARIAN KENDARAAN (prototype lokal) - Booking Home Service NG SDMS
   -----------------------------------------------------------------------
   GET /unit/search?by=policenumber|machinenumber|framenumber&q=<kata kunci>

   Sumber:
   - SNEMESIAGEN_CUSTOMER.dbo.mstvehicle  -> policenumber / machinenumber / framenumber / yearofass
   - SNEMESIAGEN_CUSTOMER.dbo.mstmotor    -> code motor (jembatan)              [via mstvehicle.motorid]
   - SNEMESIAGEN_CUSTOMER.dbo.mstmotorcolor -> colorname (Warna)                [via mstvehicle.motorcolorid]
   - SIRIS.dbo.mstmotor + dbo.mstmotorahm -> Kode Tipe Unit = mstmotorahm.code,
                                             Market Name    = mstmotorahm.name
       (join SIRIS: mstmotor.motorahmid = mstmotorahm.id; dijembatani lewat KODE MOTOR
        karena mstvehicle.motorid TIDAK ada di SIRIS.mstmotor -> match by mstmotor.code)

   Pencocokan Plat/Mesin/Rangka TANPA spasi.
   Catatan: server ini hanya untuk demo di laptop. Kredensial ada di db.config.json
   - JANGAN dibagikan / commit. Jalankan: node server.js
   ======================================================================= */
const http = require('http');
const { execFile } = require('child_process');
const fs = require('fs');
const path = require('path');

const CFG = JSON.parse(fs.readFileSync(path.join(__dirname, 'db.config.json'), 'utf8'));
const BY_COLUMNS = { policenumber: 'policenumber', machinenumber: 'machinenumber', framenumber: 'framenumber' };
const sqlStr = v => "'" + String(v).replace(/'/g, "''") + "'";

function psql(db, sql) {
  return new Promise((resolve, reject) => {
    const args = ['-h', CFG.host, '-p', String(CFG.port), '-U', CFG.user, '-d', db,
      '-A', '-F', '|', '-t', '--no-align', '-c', sql];
    execFile(CFG.psql, args, { env: { ...process.env, PGPASSWORD: CFG.password }, maxBuffer: 8 * 1024 * 1024 },
      (err, stdout, stderr) => (err ? reject(new Error(stderr || err.message)) : resolve(stdout)));
  });
}
function toRows(stdout, cols) {
  return stdout.split(/\r?\n/).filter(Boolean).map(line => {
    const p = line.split('|');
    const o = {};
    cols.forEach((c, i) => { o[c] = p[i] != null ? p[i] : ''; });
    return o;
  });
}

async function searchVehicles(by, q) {
  const col = BY_COLUMNS[by] || 'policenumber';
  const qns = String(q).toUpperCase().replace(/[^A-Z0-9]/g, ''); // huruf+angka saja -> aman utk LIKE
  if (qns.length < 4) return [];
  const like = "'%" + qns + "%'";

  // 1) SNEMESIAGEN_CUSTOMER: vehicle + KODE MOTOR (jembatan) + warna
  // + STNK: custvehiclestnk (1 per vehicle, terbaru) -> mstcustomer -> mstgeo* (semua di DB customer)
  const vSql =
    "select v.id::text, coalesce(v.policenumber,''), coalesce(v.machinenumber,''), coalesce(v.framenumber,''), " +
    "coalesce(v.yearofass,0), coalesce(v.lastkilometer,0), coalesce(mo.code,''), coalesce(mc.colorcode,''), coalesce(mc.colorname,''), " +
    "coalesce(cust.fullname,''), coalesce(cust.firstname,''), coalesce(cust.lastname,''), coalesce(cust.nik,''), " +
    "coalesce(cust.address1,''), coalesce(cust.address2,''), coalesce(cust.postalcode,''), " +
    "coalesce(cust.geoprovinceid::text,''), coalesce(sgp.name,''), coalesce(cust.geocityid::text,''), coalesce(sgc.name,''), " +
    "coalesce(cust.geodistrictid::text,''), coalesce(sgd.name,''), coalesce(cust.geovillageid::text,''), coalesce(sgv.name,''), " +
    "coalesce(cust.id::text,'') " +
    "from dbo.mstvehicle v " +
    "left join dbo.mstmotor mo on v.motorid = mo.id " +
    "left join dbo.mstmotorcolor mc on v.motorcolorid = mc.id " +
    "left join (select distinct on (vehicleid) vehicleid, customerid from dbo.custvehiclestnk " +
    "  where (deleteddate is null or deleteddate = '1900-01-01') order by vehicleid, datefrom desc nulls last) cs on cs.vehicleid = v.id " +
    "left join dbo.mstcustomer cust on cs.customerid = cust.id " +
    "left join dbo.mstgeoprovince sgp on cust.geoprovinceid = sgp.id " +
    "left join dbo.mstgeocity sgc on cust.geocityid = sgc.id " +
    "left join dbo.mstgeodistrict sgd on cust.geodistrictid = sgd.id " +
    "left join dbo.mstgeovillage sgv on cust.geovillageid = sgv.id " +
    "where replace(upper(coalesce(v." + col + ",'')),' ','') like " + like + " " +
    "and (v.deleteddate is null or v.deleteddate = '1900-01-01') " +
    "order by v.policenumber limit 25;";
  const vRows = toRows(await psql(CFG.customerDb, vSql),
    ['unitid', 'policenumber', 'machinenumber', 'framenumber', 'yearofass', 'lastkilometer', 'motorcode', 'colorcode', 'colorname',
     'sfullname', 'sfirst', 'slast', 'snik', 'saddr1', 'saddr2', 'spostal',
     'sprovid', 'sprovname', 'scityid', 'scityname', 'sdistid', 'sdistname', 'svillid', 'svillname', 'scustid']);
  if (!vRows.length) return [];

  // 2) SIRIS: KODE MOTOR -> mstmotorahm.code (Kode Tipe Unit) + mstmotorahm.name (Market Name)
  //    join SIRIS.mstmotor.motorahmid = SIRIS.mstmotorahm.id ; dijembatani via mstmotor.code
  const codes = [...new Set(vRows.map(r => r.motorcode).filter(Boolean))];
  const ahmMap = {};
  if (codes.length) {
    const sSql =
      "select mm.code, ahm.code, ahm.name " +
      "from dbo.mstmotor mm join dbo.mstmotorahm ahm on mm.motorahmid = ahm.id " +
      "where mm.code in (" + codes.map(sqlStr).join(',') + ") " +
      "and (mm.deleteddatetime is null or mm.deleteddatetime = '1900-01-01');";
    toRows(await psql(CFG.sirisDb, sSql), ['motorcode', 'kodetipe', 'marketname'])
      .forEach(r => { if (!ahmMap[r.motorcode]) ahmMap[r.motorcode] = r; });
  }

  return vRows.map(v => {
    const a = ahmMap[v.motorcode] || {};
    return {
      unitid: v.unitid,
      policenumber: v.policenumber,
      machinenumber: v.machinenumber,
      framenumber: v.framenumber,
      assemblyyear: v.yearofass && v.yearofass !== '0' ? v.yearofass : '',
      lastkilometer: v.lastkilometer,
      motorcode: v.motorcode,          // kode motor customer (jembatan)
      twodigitcode: a.kodetipe || '',  // Kode Tipe Unit = SIRIS.mstmotorahm.code
      marketname: a.marketname || '',  // Market Name    = SIRIS.mstmotorahm.name
      colorcode: v.colorcode,
      colorname: v.colorname,          // Warna = mstmotorcolor.colorname
      // STNK dari custvehiclestnk + mstcustomer + mstgeo* (kosong bila tidak ada)
      stnk: {
        customerid: v.scustid, // dbo.mstcustomer.id -> untuk UPDATE saat Simpan STNK
        fullname: v.sfullname, firstname: v.sfirst, lastname: v.slast, nik: v.snik,
        address1: v.saddr1, address2: v.saddr2, postalcode: v.spostal,
        geoprovinceid: v.sprovid, provincename: v.sprovname,
        geocityid: v.scityid, cityname: v.scityname,
        geodistrictid: v.sdistid, districtname: v.sdistname,
        geovillageid: v.svillid, villagename: v.svillname,
      },
    };
  });
}

// master Kode Tipe Unit: dbo.mstmotorahm (code + name), urut code asc
async function listMotorahm() {
  const sql =
    "select code, coalesce(name,'') from dbo.mstmotorahm " +
    "where (deleteddatetime is null or deleteddatetime = '1900-01-01') and code is not null and code <> '' " +
    "order by code asc;";
  return toRows(await psql(CFG.sirisDb, sql), ['code', 'name']);
}

const server = http.createServer(async (req, res) => {
  const cors = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };
  if (req.method === 'OPTIONS') { res.writeHead(204, cors); return res.end(); }
  const u = new URL(req.url, 'http://localhost');
  if (u.pathname === '/health') { res.writeHead(200, cors); return res.end('ok'); }
  if (u.pathname === '/master/motorahm') {
    try {
      const data = await listMotorahm();
      res.writeHead(200, { ...cors, 'Content-Type': 'application/json; charset=utf-8' });
      return res.end(JSON.stringify({ ok: true, count: data.length, data }));
    } catch (e) {
      res.writeHead(500, { ...cors, 'Content-Type': 'application/json; charset=utf-8' });
      return res.end(JSON.stringify({ ok: false, error: String(e.message).slice(0, 300) }));
    }
  }
  if (u.pathname === '/unit/search') {
    try {
      const data = await searchVehicles(u.searchParams.get('by') || 'policenumber', u.searchParams.get('q') || '');
      res.writeHead(200, { ...cors, 'Content-Type': 'application/json; charset=utf-8' });
      return res.end(JSON.stringify({ ok: true, count: data.length, data }));
    } catch (e) {
      res.writeHead(500, { ...cors, 'Content-Type': 'application/json; charset=utf-8' });
      return res.end(JSON.stringify({ ok: false, error: String(e.message).slice(0, 300) }));
    }
  }
  res.writeHead(404, cors); res.end('not found');
});
const PORT = CFG.port_api || 5180;
server.listen(PORT, () => console.log('Live search API di http://localhost:' + PORT + '  (GET /unit/search?by=&q=)'));
