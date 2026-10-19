/**
 * Mengisi kolom "Tautan Bukti" di tab E-Perjadin v2 dengan alamat berkas dari chip
 * di kolom "Keterangan/Bukti Bayar", supaya situs Monitoring E-Perjadin bisa menampilkan tombol unduh.
 *
 * Cara pasang (cukup sekali):
 * 1. Di Google Sheets, buka Ekstensi > Apps Script.
 * 2. Hapus isi Code.gs, tempel seluruh isi berkas ini, lalu simpan.
 * 3. Di panel kiri, klik + di samping "Layanan" (Services), pilih "Google Sheets API", lalu klik Tambahkan.
 *    Layanan ini dipakai untuk membaca alamat chip berkas Drive.
 * 4. Pilih fungsi pasangPemicu di atas, klik Jalankan, lalu izinkan aksesnya.
 *    Kolom "Tautan Bukti" langsung terisi, lalu terisi ulang otomatis tiap 5 menit dan setiap ada perubahan.
 */

var ID_TAB = 734508134;                 // gid tab E-Perjadin v2
var JUDUL_BUKTI = "bukti bayar";        // kata pada judul kolom chip bukti bayar
var JUDUL_TAUTAN = "Tautan Bukti";      // judul kolom yang dibaca situs

function isiTautanBukti() {
  var tab = SpreadsheetApp.getActive().getSheets().filter(function (s) { return s.getSheetId() === ID_TAB; })[0];
  if (!tab) throw new Error("Tab dengan gid " + ID_TAB + " tidak ditemukan");

  var lebar = tab.getLastColumn();
  var judul = tab.getRange(1, 1, 1, lebar).getValues()[0].map(function (j) {
    return String(j).replace(/\s+/g, " ").trim().toLowerCase();
  });
  var kolBukti = judul.findIndex(function (j) { return j.indexOf(JUDUL_BUKTI) !== -1; }) + 1;
  if (!kolBukti) throw new Error('Kolom berjudul "' + JUDUL_BUKTI + '" tidak ditemukan');

  var kolTautan = judul.indexOf(JUDUL_TAUTAN.toLowerCase()) + 1;
  if (!kolTautan) {
    kolTautan = lebar + 1;
    tab.getRange(1, kolTautan).setValue(JUDUL_TAUTAN).setFontWeight("bold");
  }

  var jumlah = tab.getLastRow() - 1;
  if (jumlah < 1) return;

  // Chip berkas Drive tidak terbaca lewat SpreadsheetApp, jadi alamatnya diambil dari Sheets API (chipRuns).
  var rentang = tab.getRange(2, kolBukti, jumlah, 1).getA1Notation();
  if (typeof Sheets === "undefined") {
    throw new Error('Layanan "Google Sheets API" belum ditambahkan. Klik + di samping Layanan, pilih Google Sheets API, lalu Tambahkan.');
  }
  var data = Sheets.Spreadsheets.get(SpreadsheetApp.getActive().getId(), {
    ranges: ["'" + tab.getName().replace(/'/g, "''") + "'!" + rentang],
    fields: "sheets.data.rowData.values.chipRuns,sheets.data.rowData.values.hyperlink"
  });
  var baris = (((data.sheets || [])[0] || {}).data || [])[0];
  baris = (baris && baris.rowData) || [];

  // Cadangan untuk tautan biasa (Ctrl+K) yang bukan chip.
  var teks = tab.getRange(2, kolBukti, jumlah, 1).getRichTextValues();

  var hasil = [];
  for (var r = 0; r < jumlah; r++) {
    var sel = ((baris[r] || {}).values || [])[0] || {};
    var url = sel.hyperlink || "";
    (sel.chipRuns || []).forEach(function (c) {
      var p = c.chip && c.chip.richLinkProperties;
      if (!url && p && p.uri) url = p.uri;
    });
    var rt = teks[r][0];
    if (!url && rt) {
      url = rt.getLinkUrl() || "";
      var potongan = rt.getRuns();
      for (var i = 0; i < potongan.length && !url; i++) url = potongan[i].getLinkUrl() || "";
    }
    hasil.push([url]);
  }
  tab.getRange(2, kolTautan, jumlah, 1).setValues(hasil);
}

/** Jalankan sekali: mengisi kolom sekarang dan memasang pengisian otomatis. */
function pasangPemicu() {
  ScriptApp.getProjectTriggers().forEach(function (p) {
    if (p.getHandlerFunction() === "isiTautanBukti") ScriptApp.deleteTrigger(p);
  });
  ScriptApp.newTrigger("isiTautanBukti").timeBased().everyMinutes(5).create();
  ScriptApp.newTrigger("isiTautanBukti").forSpreadsheet(SpreadsheetApp.getActive()).onChange().create();
  isiTautanBukti();
}
