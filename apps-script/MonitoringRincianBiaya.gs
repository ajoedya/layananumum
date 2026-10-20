/**
 * Monitoring E-Perjadin dan Rincian Biaya Perjadin 2026 - Apps Script
 * Ditempel di: Data Merge Rincian Biaya Perjadin 2026 > Ekstensi > Apps Script
 *
 * Satu spreadsheet untuk semuanya:
 *  - Tab "Monitoring"  : satu baris per ST. Diisi seperti E-Perjadin v2 dulu, dan tab inilah yang
 *                        diterbitkan sebagai CSV untuk halaman perjadin/ di situs Layanan Umum.
 *  - Tab "Data Merge"  : satu baris per pegawai per ST, diturunkan otomatis dari tab Monitoring,
 *                        ditambah isian biaya untuk dokumen Rincian Biaya.
 *
 * Menu "Rincian Biaya":
 *  1. Perbarui dari tab Monitoring : isi Tautan Bukti, lalu tambahkan pegawai/ST baru ke Data Merge
 *  2. Buat dokumen baris terpilih  : buat rincian biaya untuk baris yang sedang diblok
 *  3. Buat semua yang belum dibuat : buat untuk semua baris yang Total_Rp > 0 dan belum ada link
 *  4. Pasang pembaruan otomatis    : jalankan nomor 1 setiap ada perubahan dan tiap 5 menit
 *
 * Supaya Tautan Bukti terbaca dari chip berkas Drive, tambahkan layanan "Google Sheets API":
 * di panel kiri editor klik + di samping Layanan, pilih Google Sheets API, lalu Tambahkan.
 */

const KONFIG = {
  MONITORING_SHEET: 'Monitoring',                          // tab per ST di spreadsheet ini
  SHEET: 'Data Merge',
  JUDUL_BUKTI: 'bukti bayar',                              // kata pada judul kolom chip bukti bayar
  JUDUL_TAUTAN: 'Tautan Bukti',                            // judul kolom yang dibaca situs
  FOLDER_INDUK_ID: '1tc5126HrlZHyLeJTCdzqjGrgabxRAf4x',   // Rincian Biaya Perjadin 2026
  FOLDER_HASIL_ID: '1u4f5WjqdgY9555qXqHphNVJl7qrLnReO',   // Hasil Rincian Biaya
  TEMPLATE_ID: '',                                         // kosongkan: dicari otomatis di folder induk
  NAMA_TEMPLAT: 'Templat_Rincian_Biaya_PD_GDocs',
  BUAT_PDF: true                                           // false jika cukup Google Docs saja
};

const FIELD = ['No_ST', 'KNLWKN', 'Tgl_ST', 'ID_Kegiatan', 'Nama', 'NIP', 'Asal', 'Tujuan',
  'Jenis_Kendaraan', 'Biaya_Angkutan', 'Transport', 'UH_H', 'UH_Rp', 'UH_Total', 'Hotel_H_1',
  'Hotel_Rp_1', 'Total_1', 'Hotel_H_2', 'Hotel_Rp_2', 'Total_2', 'Tiket_Pesawat', 'Total_Rp', 'Bilangan'];
const UANG = ['Biaya_Angkutan', 'Transport', 'UH_Rp', 'UH_Total', 'Hotel_Rp_1', 'Total_1',
  'Hotel_Rp_2', 'Total_2', 'Tiket_Pesawat', 'Total_Rp'];
const BULAN = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus',
  'September', 'Oktober', 'November', 'Desember'];

/* ---------- Menu ---------- */
function onOpen() {
  SpreadsheetApp.getUi().createMenu('Rincian Biaya')
    .addItem('Perbarui dari tab Monitoring', 'perbarui')
    .addSeparator()
    .addItem('Buat dokumen baris terpilih', 'buatTerpilih')
    .addItem('Buat semua yang belum dibuat', 'buatSemua')
    .addSeparator()
    .addItem('Pasang pembaruan otomatis', 'pasangPemicu')
    .addToUi();
}

/* ---------- Fungsi sel: =TERBILANG(V2:V) ---------- */
function TERBILANG(input) {
  if (Array.isArray(input)) return input.map(r => r.map(v => terbilangAngka(v)));
  return terbilangAngka(input);
}
function terbilangAngka(v) {
  if (v === '' || v === null || v === undefined) return '';
  const n = Math.floor(Number(v));
  if (!n || n < 0) return '';
  return kata(n).replace(/\s+/g, ' ').trim();
}
function kata(n) {
  const s = ['', 'satu', 'dua', 'tiga', 'empat', 'lima', 'enam', 'tujuh', 'delapan', 'sembilan', 'sepuluh', 'sebelas'];
  if (n < 12) return s[n];
  if (n < 20) return kata(n - 10) + ' belas';
  if (n < 100) return kata(Math.floor(n / 10)) + ' puluh ' + kata(n % 10);
  if (n < 200) return 'seratus ' + kata(n - 100);
  if (n < 1000) return kata(Math.floor(n / 100)) + ' ratus ' + kata(n % 100);
  if (n < 2000) return 'seribu ' + kata(n - 1000);
  if (n < 1e6) return kata(Math.floor(n / 1000)) + ' ribu ' + kata(n % 1000);
  if (n < 1e9) return kata(Math.floor(n / 1e6)) + ' juta ' + kata(n % 1e6);
  return kata(Math.floor(n / 1e9)) + ' miliar ' + kata(n % 1e9);
}

/* ---------- Bantuan ---------- */
function lembar() {
  const sh = SpreadsheetApp.getActive().getSheetByName(KONFIG.SHEET);
  if (!sh) throw new Error('Sheet "' + KONFIG.SHEET + '" tidak ditemukan.');
  return sh;
}
function kolom(sh) {
  const h = sh.getRange(1, 1, 1, sh.getLastColumn()).getValues()[0];
  const m = {};
  h.forEach((x, i) => { if (x) m[String(x).trim()] = i + 1; });
  return m;
}
const norm = s => String(s || '').toLowerCase().replace(/\s+/g, '');
const kunci = (no, suf, nama) => [String(no).trim(), String(suf).trim(), String(nama).trim().toLowerCase()].join('|');
function rupiah(v) {
  return String(Math.round(Number(v))).replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}
function tampil(field, v) {
  if (v === '' || v === null || v === undefined) return '';
  if (field === 'Tgl_ST' && v instanceof Date) return v.getDate() + ' ' + BULAN[v.getMonth()] + ' ' + v.getFullYear();
  if (UANG.indexOf(field) > -1 && typeof v === 'number') return rupiah(v);
  return String(v);
}

/* ---------- 1. Perbarui dari tab Monitoring ---------- */
function perbarui() {
  isiTautanBukti();
  sinkronMonitoring();
}

/* Mengisi kolom Tautan Bukti dari chip berkas Drive di kolom Keterangan/Bukti Bayar,
   supaya situs Monitoring E-Perjadin bisa menampilkan tombol unduh. */
function isiTautanBukti() {
  const tab = SpreadsheetApp.getActive().getSheetByName(KONFIG.MONITORING_SHEET);
  if (!tab) throw new Error('Tab "' + KONFIG.MONITORING_SHEET + '" tidak ditemukan.');
  const lebar = tab.getLastColumn();
  const judul = tab.getRange(1, 1, 1, lebar).getValues()[0].map(j => String(j).replace(/\s+/g, ' ').trim().toLowerCase());
  const kolBukti = judul.findIndex(j => j.indexOf(KONFIG.JUDUL_BUKTI) !== -1) + 1;
  const kolTautan = judul.indexOf(KONFIG.JUDUL_TAUTAN.toLowerCase()) + 1;
  if (!kolBukti || !kolTautan) return;
  const jumlah = tab.getLastRow() - 1;
  if (jumlah < 1) return;

  // Chip berkas Drive hanya terbaca lewat Sheets API (chipRuns). Tanpa layanan itu, hanya tautan biasa yang terbaca.
  let baris = [];
  if (typeof Sheets !== 'undefined') {
    const a1 = "'" + tab.getName().replace(/'/g, "''") + "'!" + tab.getRange(2, kolBukti, jumlah, 1).getA1Notation();
    const data = Sheets.Spreadsheets.get(SpreadsheetApp.getActive().getId(), {
      ranges: [a1], fields: 'sheets.data.rowData.values.chipRuns,sheets.data.rowData.values.hyperlink'
    });
    const blok = (((data.sheets || [])[0] || {}).data || [])[0];
    baris = (blok && blok.rowData) || [];
  }
  const teks = tab.getRange(2, kolBukti, jumlah, 1).getRichTextValues();
  const lama = tab.getRange(2, kolTautan, jumlah, 1).getValues();

  const hasil = [];
  for (let r = 0; r < jumlah; r++) {
    const sel = ((baris[r] || {}).values || [])[0] || {};
    let url = sel.hyperlink || '';
    (sel.chipRuns || []).forEach(c => {
      const p = c.chip && c.chip.richLinkProperties;
      if (!url && p && p.uri) url = p.uri;
    });
    const rt = teks[r][0];
    if (!url && rt) {
      url = rt.getLinkUrl() || '';
      const potongan = rt.getRuns();
      for (let i = 0; i < potongan.length && !url; i++) url = potongan[i].getLinkUrl() || '';
    }
    hasil.push([url || lama[r][0]]);   // tautan lama tidak dihapus bila sel bukti hanya berupa teks
  }
  tab.getRange(2, kolTautan, jumlah, 1).setValues(hasil);
}

/* Menurunkan baris per pegawai di Data Merge dari tab Monitoring. */
function sinkronMonitoring() {
  const src = SpreadsheetApp.getActive().getSheetByName(KONFIG.MONITORING_SHEET);
  if (!src) throw new Error('Tab "' + KONFIG.MONITORING_SHEET + '" tidak ditemukan.');
  const data = src.getDataRange().getDisplayValues();

  let h = -1;
  for (let i = 0; i < Math.min(10, data.length); i++) {
    if (data[i].some(c => norm(c) === 'no.surattugas')) { h = i; break; }
  }
  if (h < 0) throw new Error('Kolom "No. Surat Tugas" tidak ditemukan di monitoring.');
  const H = data[h].map(norm);
  const c = {
    st: H.indexOf('no.surattugas'), pes: H.indexOf('pesertaperjadin'), tgl: H.indexOf('tanggalkegiatan'),
    tahap: H.indexOf('tahappembayaran'), ket: H.indexOf('keterangan/buktibayar'),
    id: H.indexOf('idkegiatan'), kel: H.indexOf('kelompok')
  };

  // Catat ID Kegiatan yang dipakai lebih dari satu ST
  const idKeST = {};
  for (let i = h + 1; i < data.length; i++) {
    const st = String(data[i][c.st] || '').trim(), id = String(data[i][c.id] || '').trim();
    if (st && id) (idKeST[id] = idKeST[id] || new Set()).add(st);
  }

  const sh = lembar(), kol = kolom(sh);
  const lastRow = sh.getLastRow();
  const ada = {};
  let lama = [];
  if (lastRow > 1) {
    lama = sh.getRange(2, 1, lastRow - 1, sh.getLastColumn()).getValues();
    lama.forEach((r, i) => { ada[kunci(r[kol.No_ST - 1], r[kol.KNLWKN - 1], r[kol.Nama - 1])] = i; });
  }

  const baru = [], sudah = {};
  for (let i = h + 1; i < data.length; i++) {
    const r = data[i];
    const st = String(r[c.st] || '').trim();
    const m = st.match(/ST-(\d+)(\/.*)/);
    if (!m) continue;
    const id = String(r[c.id] || '').trim();
    const peserta = String(r[c.pes] || '').split(',').map(x => x.trim()).filter(String);
    if (!peserta.length) peserta.push('');

    peserta.forEach(p => {
      const bag = p.split('/');
      const nama = (bag[0] || '').trim(), nip = (bag[1] || '').trim();
      const cat = [];
      let nipF = nip;
      if (!nama) cat.push('Peserta kosong di monitoring');
      if (nip.toUpperCase() === 'PPNPN') { nipF = '-'; cat.push('PPNPN, tanpa NIP'); }
      else if (/^\d{18}$/.test(nip)) nipF = nip.slice(0, 8) + ' ' + nip.slice(8, 14) + ' ' + nip.slice(14, 15) + ' ' + nip.slice(15);
      else if (nip) cat.push('NIP tidak 18 digit, cek ulang');
      if (!id) cat.push('ID Kegiatan kosong');
      else if (id.length !== 24) cat.push('ID Kegiatan tidak 24 karakter, cek ulang');
      if (id && idKeST[id] && idKeST[id].size > 1) cat.push('ID Kegiatan sama dengan ST lain');

      const info = {
        ID_Kegiatan: id, Kelompok: r[c.kel] || '', Tanggal_Kegiatan: r[c.tgl] || '',
        Tahap_Pembayaran: r[c.tahap] || '', Keterangan: r[c.ket] || '', Catatan_Cek: cat.join('; ')
      };
      const k = kunci(m[1], m[2], nama);
      if (sudah[k]) return;            // baris ganda di monitoring
      sudah[k] = true;
      if (k in ada) {                   // perbarui status baris lama
        const row = lama[ada[k]];
        Object.keys(info).forEach(f => {
          if (!kol[f]) return;
          let v = info[f];
          const old = String(row[kol[f] - 1] || '');
          if (f === 'Catatan_Cek' && old.indexOf('CONTOH') === 0) v = old.split(';')[0] + (v ? '; ' + v : '');
          row[kol[f] - 1] = v;
        });
      } else {
        baru.push(Object.assign({ No_ST: Number(m[1]), KNLWKN: m[2], Nama: nama, NIP: nipF }, info));
      }
    });
  }

  const tulisKolom = (f, start, vals) => {
    if (!kol[f] || !vals.length) return;
    const rg = sh.getRange(start, kol[f], vals.length, 1);
    if (['KNLWKN', 'ID_Kegiatan', 'NIP', 'Tanggal_Kegiatan'].indexOf(f) > -1) rg.setNumberFormat('@');
    rg.setValues(vals.map(v => [v]));
  };
  const info = ['ID_Kegiatan', 'Kelompok', 'Tanggal_Kegiatan', 'Tahap_Pembayaran', 'Keterangan', 'Catatan_Cek'];

  // Tulis balik status baris lama (kolom formula tidak disentuh)
  if (lama.length) info.forEach(f => tulisKolom(f, 2, lama.map(r => r[kol[f] - 1])));

  // Tambah baris baru di bawah
  if (baru.length) {
    const start = Math.max(sh.getLastRow(), 1) + 1;
    ['No_ST', 'KNLWKN', 'Nama', 'NIP'].concat(info).forEach(f => tulisKolom(f, start, baru.map(b => b[f])));
  }
  SpreadsheetApp.getActive().toast(baru.length + ' baris baru ditambahkan, ' + lama.length + ' baris diperbarui.', 'Data Merge diperbarui', 8);
}

/* ---------- 2 & 3. Buat dokumen ---------- */
function buatTerpilih() {
  const sh = lembar();
  const rows = new Set();
  sh.getActiveRangeList().getRanges().forEach(rg => {
    for (let r = rg.getRow(); r < rg.getRow() + rg.getNumRows(); r++) if (r > 1) rows.add(r);
  });
  if (!rows.size) { SpreadsheetApp.getUi().alert('Blok dulu baris yang mau dibuat dokumennya.'); return; }
  proses(sh, Array.from(rows).sort((a, b) => a - b));
}
function buatSemua() {
  const sh = lembar(), kol = kolom(sh), n = sh.getLastRow() - 1;
  if (n < 1) return;
  const v = sh.getRange(2, 1, n, sh.getLastColumn()).getValues();
  const rows = [];
  v.forEach((r, i) => { if (!r[kol.Link_Dokumen - 1] && Number(r[kol.Total_Rp - 1]) > 0) rows.push(i + 2); });
  if (!rows.length) { SpreadsheetApp.getUi().alert('Tidak ada baris baru dengan Total_Rp > 0.'); return; }
  proses(sh, rows);
}

function ambilTemplat() {
  if (KONFIG.TEMPLATE_ID) return DriveApp.getFileById(KONFIG.TEMPLATE_ID);
  const it = DriveApp.getFolderById(KONFIG.FOLDER_INDUK_ID).getFilesByType(MimeType.GOOGLE_DOCS);
  while (it.hasNext()) {
    const f = it.next();
    if (f.getName().indexOf(KONFIG.NAMA_TEMPLAT) === 0) return f;
  }
  throw new Error('Templat Google Docs "' + KONFIG.NAMA_TEMPLAT + '" belum ada di folder induk. ' +
    'Unggah berkas .docx-nya, lalu klik kanan > Buka dengan > Google Dokumen.');
}

function proses(sh, rows) {
  const kol = kolom(sh), lastCol = sh.getLastColumn();
  const tpl = ambilTemplat(), folder = DriveApp.getFolderById(KONFIG.FOLDER_HASIL_ID);
  let ok = 0; const lewat = [];

  rows.forEach(r => {
    const v = sh.getRange(r, 1, 1, lastCol).getValues()[0];
    const rec = {};
    Object.keys(kol).forEach(k => rec[k] = v[kol[k] - 1]);
    if (!rec.No_ST) return;
    if (!(Number(rec.Total_Rp) > 0) || !rec.Tgl_ST) {
      lewat.push('baris ' + r + ' (' + (rec.Nama || '-') + ')');
      return;
    }
    rec.Bilangan = terbilangAngka(rec.Total_Rp);

    const nama = 'Rincian Biaya ST-' + rec.No_ST + ' - ' + rec.Nama;
    const salin = tpl.makeCopy(nama, folder);
    const doc = DocumentApp.openById(salin.getId());
    const body = doc.getBody();
    FIELD.forEach(f => body.replaceText('\\{\\{' + f + '\\}\\}', tampil(f, rec[f])));
    doc.saveAndClose();

    let link = salin.getUrl();
    if (KONFIG.BUAT_PDF) link = folder.createFile(salin.getAs(MimeType.PDF)).setName(nama + '.pdf').getUrl();
    sh.getRange(r, kol.Link_Dokumen).setValue(link);
    ok++;
  });

  let pesan = ok + ' dokumen dibuat di folder "Hasil Rincian Biaya".';
  if (lewat.length) pesan += '\n\nDilewati karena Tgl_ST kosong atau Total_Rp nol:\n' + lewat.join('\n');
  SpreadsheetApp.getUi().alert(pesan);
}

/* ---------- 4. Pemicu otomatis ---------- */
function pasangPemicu() {
  ScriptApp.getProjectTriggers()
    .filter(t => ['perbarui', 'sinkronMonitoring', 'isiTautanBukti'].indexOf(t.getHandlerFunction()) > -1)
    .forEach(t => ScriptApp.deleteTrigger(t));
  ScriptApp.newTrigger('perbarui').timeBased().everyMinutes(5).create();
  ScriptApp.newTrigger('perbarui').forSpreadsheet(SpreadsheetApp.getActive()).onChange().create();
  perbarui();
  SpreadsheetApp.getUi().alert('Pembaruan otomatis aktif: Tautan Bukti dan Data Merge ikut diperbarui setiap ada perubahan dan tiap 5 menit.');
}
