/**
 * Penyimpan isi beranda Layanan Subbagian Umum untuk dasbor admin (admin/).
 *
 * Beranda membaca isi lewat doGet (siapa pun boleh membaca, sama seperti beranda yang terbuka untuk umum).
 * Dasbor admin menyimpan lewat doPost dan wajib menyertakan kunci admin. Kunci tidak pernah ditulis di
 * kode ini maupun di repo; yang disimpan hanya sidik (hash) SHA-256-nya di Properti Skrip.
 *
 * Cara pasang (cukup sekali):
 * 1. Buat Google Spreadsheet baru, misalnya "Isi Beranda Layanan Umum". Spreadsheet ini tidak perlu dibagikan.
 * 2. Buka Ekstensi > Apps Script, hapus isi Code.gs, tempel seluruh isi berkas ini, lalu simpan.
 * 3. Kembali ke spreadsheet dan muat ulang halamannya. Muncul menu "Dasbor Beranda".
 *    Pilih Dasbor Beranda > Setel kunci admin, izinkan aksesnya, lalu ketik kunci admin (minimal 10 karakter).
 *    Kunci ini yang nanti diketik di laman admin. Bagikan hanya kepada pengelola situs.
 * 4. Di Apps Script, klik Terapkan > Deployment baru > pilih jenis "Aplikasi web".
 *      Jalankan sebagai : Saya
 *      Yang memiliki akses : Siapa saja
 *    Klik Terapkan, lalu salin URL aplikasi web (berakhiran /exec).
 * 5. Tempel URL itu ke window.ALAMAT_SKRIP di konten.js pada repo, lalu terbitkan.
 *
 * Bila kode ini diubah kemudian, terapkan ulang lewat Terapkan > Kelola deployment > ikon pensil >
 * Versi: Versi baru, supaya URL /exec tetap sama.
 *
 * Isi beranda tersimpan sebagai JSON di tab "Konten". Setiap penyimpanan dicatat di tab "Riwayat",
 * dan versi lama bisa dipulihkan dari dasbor admin.
 *
 * Data Monitoring Realisasi Anggaran (realisasi/) tersimpan di tab "Realisasi", dengan riwayatnya di tab
 * "RiwayatRealisasi". Bendahara mengimpor Laporan Fa lewat menu Monev anggaran di dasbor admin, lalu
 * menerbitkannya. Halaman realisasi/ membaca data terbitan lewat doGet (aksi=realisasi), jadi tidak perlu
 * lagi mengunggah index.html ke GitHub setiap bulan. Karena kodenya bertambah, terapkan ulang lewat
 * Terapkan > Kelola deployment > ikon pensil > Versi: Versi baru.
 */

var TAB_KONTEN = "Konten";
var TAB_RIWAYAT = "Riwayat";
var PROPERTI_KUNCI = "SIDIK_KUNCI_ADMIN";
var BATAS_GAGAL = 10;           // jumlah kunci salah sebelum penyimpanan dikunci sementara
var MENIT_KUNCI = 15;           // lama penguncian setelah terlalu banyak kunci salah
var BATAS_RIWAYAT = 200;        // baris riwayat terlama dihapus bila melewati jumlah ini
var DETIK_CACHE = 60;           // isi beranda disimpan sementara supaya beranda cepat termuat
var TAB_REALISASI = "Realisasi";
var TAB_RIWAYAT_REALISASI = "RiwayatRealisasi";
var BATAS_RIWAYAT_REALISASI = 60;   // riwayat data realisasi terlama dihapus bila melewati jumlah ini
var BATAS_DATA_REALISASI = 450000;  // panjang maksimum JSON data realisasi
var TAB_STATISTIK = "Statistik";
var TAB_PENYUNTING = "Penyunting";
var TAB_LOG = "Log";
var BATAS_LOG = 500;            // baris log terlama dihapus bila melewati jumlah ini
var BATAS_BARIS_STATISTIK = 20000; // batas pengaman supaya tab Statistik tidak membengkak
var ZONA_WAKTU = "Asia/Makassar";  // tanggal statistik dan log mengikuti WITA
var POTONG = 45000;             // panjang teks per sel (batas sel Google Sheets 50.000 karakter)
// Versi kode dan fitur yang dikenali. Dasbor admin membacanya lewat doGet (aksi=versi) untuk memastikan
// deployment yang tayang sudah memakai kode ini. Naikkan tanggalnya setiap kali kode diubah.
var VERSI_SKRIP = "2026-10-29";
var FITUR_SKRIP = ["pemberitahuan", "pengumuman-jendela"];

/* ---------- Menu di spreadsheet ---------- */
function onOpen() {
  SpreadsheetApp.getUi().createMenu("Dasbor Beranda")
    .addItem("Setel kunci admin", "setelKunciAdmin")
    .addItem("Buka kunci penyimpanan (bila terkunci)", "bukaKunciPenyimpanan")
    .addSeparator()
    .addItem("Pasang pengingat impor bulanan (surel)", "pasangPengingatImpor")
    .addItem("Hapus pengingat impor bulanan", "hapusPengingatImpor")
    .addToUi();
}

function setelKunciAdmin() {
  var ui = SpreadsheetApp.getUi();
  var jawab = ui.prompt("Kunci admin baru", "Minimal 10 karakter. Kunci lama langsung tidak berlaku.", ui.ButtonSet.OK_CANCEL);
  if (jawab.getSelectedButton() !== ui.Button.OK) return;
  var kunci = jawab.getResponseText();
  if (kunci.length < 10) { ui.alert("Kunci terlalu pendek. Gunakan minimal 10 karakter."); return; }
  PropertiesService.getScriptProperties().setProperty(PROPERTI_KUNCI, sidik_(kunci));
  ui.alert("Kunci admin tersimpan.");
}

function bukaKunciPenyimpanan() {
  CacheService.getScriptCache().removeAll(["gagal", "terkunci"]);
  SpreadsheetApp.getUi().alert("Penyimpanan dibuka kembali.");
}

/* ---------- Pengingat impor bulanan ----------
   Pemicu waktu mengirim surel ke pemilik skrip tiap tanggal 5 pukul 08.00 bila data realisasi yang tayang belum
   memuat bulan lalu. Pertama kali dipasang, Google meminta izin mengirim surel atas nama Anda. */
function pasangPengingatImpor() {
  var ui = SpreadsheetApp.getUi();
  hapusPemicuPengingat_();
  ScriptApp.newTrigger("kirimPengingatImpor").timeBased().onMonthDay(5).atHour(8).create();
  ui.alert("Pengingat terpasang. Surel dikirim ke " + Session.getEffectiveUser().getEmail() + " tiap tanggal 5 bila data realisasi belum diperbarui.");
}
function hapusPengingatImpor() {
  hapusPemicuPengingat_();
  SpreadsheetApp.getUi().alert("Pengingat impor bulanan dihapus.");
}
function hapusPemicuPengingat_() {
  ScriptApp.getProjectTriggers().forEach(function (t) { if (t.getHandlerFunction() === "kirimPengingatImpor") ScriptApp.deleteTrigger(t); });
}
function kirimPengingatImpor() {
  var kini = new Date();
  var r = bacaRealisasi_();
  var perlu = kini.getFullYear() * 12 + kini.getMonth();   // bulan lalu (indeks 0 = Januari)
  var m = r.data && r.data.mentah;
  var punya = m && m.bulan ? (m.tahun || kini.getFullYear()) * 12 + (m.bulan - 1) : -1;
  if (punya >= perlu) return;
  var b = (kini.getMonth() + 11) % 12, th = kini.getMonth() === 0 ? kini.getFullYear() - 1 : kini.getFullYear();
  var tayang = m && m.bulan ? BULAN_[m.bulan - 1] + " " + (m.tahun || "") : "data bawaan";
  MailApp.sendEmail(Session.getEffectiveUser().getEmail(), "Pengingat: impor Laporan Fa " + BULAN_[b] + " " + th,
    "Data realisasi di situs Layanan Subbagian Umum masih " + tayang + ".\n\nBuka dasbor admin > Monev anggaran, impor Laporan Fa " + BULAN_[b] + " " + th + ", lalu terbitkan.");
}

/* ---------- Membaca isi (beranda) ---------- */
function doGet(e) {
  var aksi = (e && e.parameter && e.parameter.aksi) || "baca";
  if (aksi === "realisasi") return bacaRealisasiPublik_();
  if (aksi === "versi") return balas_({ ok: true, versi: VERSI_SKRIP, fitur: FITUR_SKRIP });
  if (aksi !== "baca") return balas_({ ok: false, pesan: "Aksi tidak dikenal" });
  var cache = CacheService.getScriptCache();
  var simpanan = cache.get("konten");
  if (simpanan) return ContentService.createTextOutput(simpanan).setMimeType(ContentService.MimeType.JSON);
  var data = bacaKonten_();
  var teks = JSON.stringify({ ok: true, konten: data.konten, diperbarui: data.diperbarui });
  if (teks.length < 95000) cache.put("konten", teks, DETIK_CACHE);
  return ContentService.createTextOutput(teks).setMimeType(ContentService.MimeType.JSON);
}

/* ---------- Menyimpan isi (dasbor admin) ---------- */
function doPost(e) {
  var minta;
  try { minta = JSON.parse(e.postData.contents); } catch (galat) { return balas_({ ok: false, pesan: "Permintaan tidak terbaca" }); }

  // Pencatatan statistik terbuka untuk umum (tanpa kunci), tetapi hanya menambah hitungan dan dibatasi lajunya.
  if (minta.aksi === "catat") return catat_(minta);

  var cache = CacheService.getScriptCache();
  if (cache.get("terkunci")) return balas_({ ok: false, pesan: "Terlalu banyak kunci salah. Coba lagi " + MENIT_KUNCI + " menit lagi." });
  var sidik = PropertiesService.getScriptProperties().getProperty(PROPERTI_KUNCI);
  if (!sidik) return balas_({ ok: false, pesan: "Kunci admin belum disetel di spreadsheet." });
  var who = masuk_(String(minta.kunci || ""), sidik);
  if (who && who.nonaktif) return balas_({ ok: false, pesan: "Akun penyunting ini dinonaktifkan oleh admin." });
  if (!who) {
    var gagal = Number(cache.get("gagal") || 0) + 1;
    cache.put("gagal", String(gagal), MENIT_KUNCI * 60);
    if (gagal >= BATAS_GAGAL) cache.put("terkunci", "1", MENIT_KUNCI * 60);
    catatLog_(teks_(minta.penyunting, 60) || "(tanpa nama)", "-", "Gagal masuk", "Kunci salah (percobaan ke-" + gagal + ")");
    Utilities.sleep(800);
    return balas_({ ok: false, pesan: "Kunci admin salah." });
  }

  cache.remove("gagal");
  // Penyunting terdaftar memakai namanya sendiri; pemegang kunci admin memakai nama yang diketik saat masuk.
  minta.penyunting = who.nama || teks_(minta.penyunting, 60) || "(tanpa nama)";
  if (IZIN_[minta.aksi] === "admin" && who.peran !== "admin") return balas_({ ok: false, pesan: "Bagian ini hanya untuk admin." });
  try {
    switch (minta.aksi) {
      case "cek":
        var data = bacaKonten_();
        catatLog_(minta.penyunting, who.peran, "Masuk", "");
        return balas_({ ok: true, konten: data.konten, diperbarui: data.diperbarui, peran: who.peran, nama: minta.penyunting });
      case "simpan":
        return simpan_(minta, who);
      case "statistik":
        return balas_({ ok: true, baris: bacaStatistik_(120), zona: ZONA_WAKTU });
      case "daftarPenyunting":
        return balas_({ ok: true, penyunting: daftarPenyunting_() });
      case "tambahPenyunting":
        return tambahPenyunting_(minta);
      case "aturPenyunting":
        return aturPenyunting_(minta);
      case "log":
        return balas_({ ok: true, log: bacaLog_(200) });
      case "riwayat":
        return balas_({ ok: true, riwayat: daftarRiwayat_() });
      case "ambilRiwayat":
        return balas_({ ok: true, konten: ambilRiwayat_(Number(minta.baris)) });
      case "cekRealisasi":
        var r = bacaRealisasi_();
        return balas_({ ok: true, data: r.data, diperbarui: r.diperbarui, penyunting: r.penyunting });
      case "simpanRealisasi":
        var hasilR = simpanRealisasi_(minta);
        catatLog_(minta.penyunting, who.peran, "Menerbitkan data realisasi", teks_(minta.catatan, 120));
        return hasilR;
      case "riwayatRealisasi":
        return balas_({ ok: true, riwayat: daftarRiwayatRealisasi_() });
      case "ambilRiwayatRealisasi":
        return balas_({ ok: true, data: ambilRiwayatRealisasi_(Number(minta.baris)) });
      default:
        return balas_({ ok: false, pesan: "Aksi tidak dikenal" });
    }
  } catch (galat) {
    return balas_({ ok: false, pesan: galat.message });
  }
}

function simpan_(minta, who) {
  var kunciTulis = LockService.getScriptLock();
  if (!kunciTulis.tryLock(10000)) return balas_({ ok: false, pesan: "Sedang ada penyimpanan lain. Coba lagi." });
  try {
    var lama = bacaKonten_();
    // Mencegah dua admin saling menimpa: penyimpanan ditolak bila isi sudah diubah orang lain sejak dimuat.
    if (lama.diperbarui && minta.dasar && minta.dasar !== lama.diperbarui) {
      return balas_({ ok: false, bentrok: true, pesan: "Isi beranda sudah diubah dari tempat lain sejak dasbor dimuat. Muat ulang dasbor dulu.", konten: lama.konten, diperbarui: lama.diperbarui });
    }
    var bersih = periksa_(minta.konten);
    var teks = JSON.stringify(bersih);
    if (teks.length > 400000) throw new Error("Isi beranda terlalu besar.");
    var waktu = new Date().toISOString();
    tulisKonten_(teks, waktu);

    var penyunting = String(minta.penyunting || "").slice(0, 60) || "(tanpa nama)";
    var catatan = String(minta.catatan || "").slice(0, 200);
    var riwayat = tab_(TAB_RIWAYAT, ["Waktu", "Penyunting", "Catatan", "Isi"]);
    riwayat.appendRow([waktu, penyunting, catatan].concat(potong_(teks)));
    var lebih = riwayat.getLastRow() - 1 - BATAS_RIWAYAT;
    if (lebih > 0) riwayat.deleteRows(2, lebih);

    CacheService.getScriptCache().remove("konten");
    catatLog_(penyunting, who ? who.peran : "-", "Menerbitkan beranda", catatan);
    return balas_({ ok: true, diperbarui: waktu });
  } catch (galat) {
    return balas_({ ok: false, pesan: galat.message });
  } finally {
    kunciTulis.releaseLock();
  }
}

/* ---------- Hak akses ----------
   Aksi yang tidak tercantum boleh dipakai semua penyunting terdaftar. Data realisasi (keuangan), daftar penyunting,
   dan log aktivitas hanya untuk pemegang kunci admin. */
var IZIN_ = { cekRealisasi: "admin", simpanRealisasi: "admin", riwayatRealisasi: "admin", ambilRiwayatRealisasi: "admin",
              daftarPenyunting: "admin", tambahPenyunting: "admin", aturPenyunting: "admin", log: "admin" };

// Mengembalikan { peran, nama } bila kunci cocok: kunci admin, atau kunci penyunting terdaftar yang aktif.
// Mengembalikan { nonaktif: true } untuk penyunting yang dinonaktifkan, dan null bila kunci tidak dikenal.
function masuk_(kunci, sidikAdmin) {
  if (!kunci) return null;
  var sk = sidik_(kunci);
  if (sk === sidikAdmin) return { peran: "admin", nama: "" };
  var t = SpreadsheetApp.getActive().getSheetByName(TAB_PENYUNTING);
  if (!t || t.getLastRow() < 2) return null;
  var v = t.getRange(2, 1, t.getLastRow() - 1, 5).getValues();
  for (var i = 0; i < v.length; i++) {
    if (String(v[i][1]) !== sk) continue;
    if (String(v[i][2]) !== "ya") return { nonaktif: true };
    t.getRange(2 + i, 5).setValue(new Date().toISOString());
    return { peran: "penyunting", nama: String(v[i][0]) };
  }
  return null;
}
function daftarPenyunting_() {
  var t = SpreadsheetApp.getActive().getSheetByName(TAB_PENYUNTING);
  if (!t || t.getLastRow() < 2) return [];
  return t.getRange(2, 1, t.getLastRow() - 1, 5).getValues().map(function (r) {
    return { nama: String(r[0]), aktif: String(r[2]) === "ya", dibuat: String(r[3] || ""), terakhir: String(r[4] || "") };
  });
}
// Tambah penyunting baru, atau ganti kunci penyunting yang sudah ada (bila namanya sama). Kunci tidak disimpan, hanya sidiknya.
function tambahPenyunting_(minta) {
  var nama = teks_(minta.nama, 40).trim();
  var kunciBaru = String(minta.kunciBaru || "");
  if (!nama) throw new Error("Nama penyunting masih kosong.");
  if (kunciBaru.length < 10) throw new Error("Kunci penyunting minimal 10 karakter.");
  var kunciTulis = LockService.getScriptLock();
  if (!kunciTulis.tryLock(10000)) throw new Error("Sedang ada penyimpanan lain. Coba lagi.");
  try {
    var sk = sidik_(kunciBaru);
    if (sk === PropertiesService.getScriptProperties().getProperty(PROPERTI_KUNCI)) throw new Error("Kunci tidak boleh sama dengan kunci admin.");
    var t = tab_(TAB_PENYUNTING, ["Nama", "Sidik kunci", "Aktif", "Dibuat", "Terakhir masuk"]);
    var n = t.getLastRow() - 1, v = n > 0 ? t.getRange(2, 1, n, 2).getValues() : [];
    var baris = -1;
    v.forEach(function (r, i) {
      if (String(r[1]) === sk) throw new Error("Kunci itu sudah dipakai. Buat kunci lain.");
      if (String(r[0]).toLowerCase() === nama.toLowerCase()) baris = 2 + i;
    });
    var waktu = new Date().toISOString();
    if (baris > 0) { t.getRange(baris, 2, 1, 2).setValues([[sk, "ya"]]); catatLog_(minta.penyunting, "admin", "Mengganti kunci penyunting", nama); }
    else { t.appendRow([nama, sk, "ya", waktu, ""]); catatLog_(minta.penyunting, "admin", "Menambah penyunting", nama); }
    return balas_({ ok: true, penyunting: daftarPenyunting_() });
  } finally { kunciTulis.releaseLock(); }
}
function aturPenyunting_(minta) {
  var t = SpreadsheetApp.getActive().getSheetByName(TAB_PENYUNTING);
  var nama = teks_(minta.nama, 40).toLowerCase();
  if (!t || t.getLastRow() < 2) throw new Error("Penyunting tidak ditemukan.");
  var v = t.getRange(2, 1, t.getLastRow() - 1, 1).getValues();
  for (var i = 0; i < v.length; i++) {
    if (String(v[i][0]).toLowerCase() !== nama) continue;
    t.getRange(2 + i, 3).setValue(minta.aktif ? "ya" : "tidak");
    catatLog_(minta.penyunting, "admin", minta.aktif ? "Mengaktifkan penyunting" : "Menonaktifkan penyunting", String(v[i][0]));
    return balas_({ ok: true, penyunting: daftarPenyunting_() });
  }
  throw new Error("Penyunting tidak ditemukan.");
}

/* ---------- Log aktivitas ---------- */
function catatLog_(nama, peran, aksi, rincian) {
  try {
    var t = tab_(TAB_LOG, ["Waktu", "Nama", "Peran", "Aksi", "Rincian"]);
    t.appendRow([new Date().toISOString(), teks_(nama, 60), teks_(peran, 20), teks_(aksi, 60), teks_(rincian, 200)]);
    var lebih = t.getLastRow() - 1 - BATAS_LOG;
    if (lebih > 0) t.deleteRows(2, lebih);
  } catch (galat) { /* log tidak boleh menggagalkan pekerjaan utama */ }
}
function bacaLog_(maks) {
  var t = SpreadsheetApp.getActive().getSheetByName(TAB_LOG);
  if (!t || t.getLastRow() < 2) return [];
  var jumlah = Math.min(maks, t.getLastRow() - 1), mulai = t.getLastRow() - jumlah + 1;
  return t.getRange(mulai, 1, jumlah, 5).getValues().map(function (r) {
    return { waktu: String(r[0]), nama: String(r[1]), peran: String(r[2]), aksi: String(r[3]), rincian: String(r[4]) };
  }).reverse();
}

/* ---------- Statistik kunjungan dan klik ----------
   Hanya hitungan harian per jenis dan per penanda; tidak ada alamat IP, identitas, atau kuki yang disimpan.
   Pencatatan terbuka untuk umum, jadi angkanya bisa digelembungkan orang yang sengaja; anggap sebagai perkiraan. */
function catat_(minta) {
  try {
    var jenis = minta.jenis === "klik" ? "klik" : minta.jenis === "kunjungan" ? "kunjungan" : "";
    var id = String(minta.id || "").toLowerCase().replace(/[^a-z0-9-]/g, "").slice(0, 60);
    if (!jenis || !id) return balas_({ ok: false });
    // Pengaman laju: paling banyak 150 pencatatan per menit untuk seluruh situs.
    var cache = CacheService.getScriptCache();
    var kunciMenit = "catat-" + Math.floor(Date.now() / 60000);
    var n = Number(cache.get(kunciMenit) || 0) + 1;
    if (n > 150) return balas_({ ok: false });
    cache.put(kunciMenit, String(n), 120);
    var kunciTulis = LockService.getScriptLock();
    if (!kunciTulis.tryLock(3000)) return balas_({ ok: false });
    try {
      var t = tab_(TAB_STATISTIK, ["Kunci", "Tanggal", "Jenis", "Penanda", "Jumlah"]);
      var tgl = Utilities.formatDate(new Date(), ZONA_WAKTU, "yyyy-MM-dd");
      var kunci = tgl + "|" + jenis + "|" + id;
      var temu = t.createTextFinder(kunci).matchEntireCell(true).findNext();
      if (temu) { var sel = t.getRange(temu.getRow(), 5); sel.setValue(Number(sel.getValue() || 0) + 1); }
      else if (t.getLastRow() - 1 < BATAS_BARIS_STATISTIK) t.appendRow([kunci, tgl, jenis, id, 1]);
    } finally { kunciTulis.releaseLock(); }
    return balas_({ ok: true });
  } catch (galat) { return balas_({ ok: false }); }
}
function bacaStatistik_(hari) {
  var t = SpreadsheetApp.getActive().getSheetByName(TAB_STATISTIK);
  if (!t || t.getLastRow() < 2) return [];
  var batas = Utilities.formatDate(new Date(Date.now() - hari * 86400000), ZONA_WAKTU, "yyyy-MM-dd");
  return t.getRange(2, 2, t.getLastRow() - 1, 4).getValues().map(function (r) {
    return { t: r[0] instanceof Date ? Utilities.formatDate(r[0], ZONA_WAKTU, "yyyy-MM-dd") : String(r[0]), j: String(r[1]), id: String(r[2]), n: Number(r[3]) || 0 };
  }).filter(function (x) { return x.t >= batas; });
}

/* ---------- Pemeriksaan isi ----------
   Semua teks dipangkas panjangnya dan semua alamat hanya boleh https atau alamat di dalam situs. */
function teks_(v, maks) { return String(v == null ? "" : v).replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f]/g, "").slice(0, maks || 300); }
function alamat_(v) {
  var a = teks_(v, 1000).trim();
  if (!a) return "";
  if (/^https:\/\//i.test(a)) return a;
  if (/^[a-z][a-z0-9+.-]*:/i.test(a) || a.indexOf("//") === 0) throw new Error("Alamat tidak diizinkan: " + a.slice(0, 60));
  return a;
}
function daftar_(v, maks) { if (!Array.isArray(v)) return []; return v.slice(0, maks); }
/* ---------- Pop up pemberitahuan ----------
   Daftar putih ini harus sama dengan PEMBERITAHUAN di konten.js. Tombol tautan memakai aturan alamat yang sama dengan tautan layanan. */
var PEMBERITAHUAN_JENIS_ = { info: true, peringatan: true, penting: true };
var PEMBERITAHUAN_POSISI_ = { "kanan-bawah": true, "kiri-bawah": true, "kanan-atas": true, "kiri-atas": true };
var PEMBERITAHUAN_FREKUENSI_ = { sesi: true, harian: true, setiap: true };
var PEMBERITAHUAN_HALAMAN_ = ["beranda", "perjadin", "realisasi", "olahpdf"];
function angkaBatas_(v, min, maks, bawaan) { v = Number(v); return isFinite(v) && v >= 0 ? Math.min(maks, Math.max(min, Math.round(v))) : bawaan; }
function pemberitahuan_(daftar) {
  var dipakai = {};
  return daftar_(daftar, 10).map(function (x) {
    x = (x && typeof x === "object") ? x : {};
    var id = teks_(x.id, 20).toLowerCase().replace(/[^a-z0-9-]/g, "");
    if (!id || dipakai[id]) id = "p" + Utilities.getUuid().replace(/-/g, "").slice(0, 10);
    dipakai[id] = true;
    var o = {
      id: id, tampil: x.tampil !== false,
      bentuk: x.bentuk === "jendela" ? "jendela" : "pojok", gambar: alamat_(x.gambar), gambarAlt: teks_(x.gambarAlt, 160),
      jenis: PEMBERITAHUAN_JENIS_[x.jenis] ? x.jenis : "info",
      judul: teks_(x.judul, 80), isi: teks_(x.isi, 2000),
      tombolTeks: teks_(x.tombolTeks, 40), tombolAlamat: alamat_(x.tombolAlamat),
      detik: angkaBatas_(x.detik, 5, 600, 60), tunda: angkaBatas_(x.tunda, 0, 60, 0),
      posisi: PEMBERITAHUAN_POSISI_[x.posisi] ? x.posisi : "kanan-bawah",
      frekuensi: PEMBERITAHUAN_FREKUENSI_[x.frekuensi] ? x.frekuensi : "sesi",
      halaman: Array.isArray(x.halaman) ? PEMBERITAHUAN_HALAMAN_.filter(function (h) { return x.halaman.indexOf(h) >= 0; }) : PEMBERITAHUAN_HALAMAN_.slice(),
      sembunyikan: x.sembunyikan === true
    };
    jadwal_(o, x);
    return o;
  });
}
function periksa_(k) {
  if (!k || typeof k !== "object") throw new Error("Isi beranda kosong.");
  var u = k.umum || {}, g = u.gerbang || {}, b = k.banner || {};
  var hasil = {
    versi: 1,
    umum: {
      label: teks_(u.label, 120), judul: teks_(u.judul, 120), subjudul: teks_(u.subjudul, 160),
      deskripsi: teks_(u.deskripsi, 400), keteranganAtas: teks_(u.keteranganAtas, 60), keteranganBawah: teks_(u.keteranganBawah, 160),
      kaki: teks_(u.kaki, 200),
      gerbang: { tampil: g.tampil !== false, teks: teks_(g.teks, 60), alamat: alamat_(g.alamat) },
      detikPerInfo: Math.min(60, Math.max(3, Number(u.detikPerInfo) || 7))
    },
    info: daftar_(k.info, 30).map(function (x) {
      var o = { tampil: x.tampil !== false, label: teks_(x.label, 80), judul: teks_(x.judul, 250), isi: teks_(x.isi, 800) };
      var gb = gayaButir_(x.gaya); if (gb) o.gaya = gb;
      jadwal_(o, x);
      return o;
    }),
    kelompok: daftar_(k.kelompok, 30).map(function (x) {
      var id = teks_(x.id, 40).toLowerCase().replace(/[^a-z0-9-]/g, "");
      if (!id) throw new Error("Ada kelompok tanpa kode.");
      return { id: id, nama: teks_(x.nama, 60), judulBagian: teks_(x.judulBagian, 120), arsip: !!x.arsip, tampil: x.tampil !== false };
    }),
    tautan: daftar_(k.tautan, 200).map(function (x) {
      var o = { tampil: x.tampil !== false, kelompok: teks_(x.kelompok, 40), judul: teks_(x.judul, 120),
               uraian: teks_(x.uraian, 300), alamat: alamat_(x.alamat), kunci: teks_(x.kunci, 400) };
      var gb = gayaButir_(x.gaya); if (gb) o.gaya = gb;
      jadwal_(o, x);
      return o;
    }),
    // Pop up pemberitahuan di pojok layar. Lama tampil dibatasi 5 detik sampai 10 menit, paling banyak 10 butir.
    pemberitahuan: pemberitahuan_(k.pemberitahuan),
    gaya: gaya_(k.gaya),
    banner: {
      menit: Math.min(240, Math.max(1, Number(b.menit) || 10)),
      siang: daftar_(b.siang, 30).map(banner_),
      malam: daftar_(b.malam, 30).map(banner_)
    }
  };
  var kode = {};
  hasil.kelompok.forEach(function (x) {
    if (kode[x.id]) throw new Error("Kode kelompok ganda: " + x.id);
    kode[x.id] = true;
  });
  return hasil;
}
/* ---------- Gaya tampilan ----------
   Hanya angka dalam batas, kode warna #rrggbb, dan kunci huruf dari daftar putih yang lolos,
   jadi tidak ada teks bebas yang bisa masuk ke CSS beranda. Daftar ini harus sama dengan ELEMEN dan HURUF di konten.js. */
var GAYA_ELEMEN_ = { judul: true, subjudul: true, deskripsi: true, label: true, bagian: true, tj: true, tu: true, ij: true, ii: true, kaki: true };
var GAYA_PANEL_ = { judul: true, subjudul: true, deskripsi: true, label: true };
var GAYA_HURUF_ = { "public-sans": true, "inter": true, "source-sans": true, "atkinson": true, "lora": true, "sistem": true };
var GAYA_TEBAL_ = { "400": true, "500": true, "600": true, "700": true, "800": true };
function angkaGaya_(v, min, maks) { v = Number(v); return isFinite(v) ? Math.min(maks, Math.max(min, Math.round(v * 100) / 100)) : 1; }
function heksGaya_(v) { v = String(v || "").trim().toLowerCase(); return /^#[0-9a-f]{6}$/.test(v) ? v : ""; }
// Jadwal tayang (tanggal yyyy-mm-dd, boleh kosong). Tanggal yang tidak sah dibuang.
function jadwal_(o, x) {
  var m = /^\d{4}-\d{2}-\d{2}$/.test(String(x.mulai || "")) ? String(x.mulai) : "";
  var a = /^\d{4}-\d{2}-\d{2}$/.test(String(x.selesai || "")) ? String(x.selesai) : "";
  if (m) o.mulai = m;
  if (a) o.selesai = a;
}
function gayaButir_(x) {
  if (!x || typeof x !== "object") return null;
  var o = { skala: angkaGaya_(x.skala, 0.7, 1.6), warna: heksGaya_(x.warna), warnaGelap: heksGaya_(x.warnaGelap) };
  return (o.skala !== 1 || o.warna || o.warnaGelap) ? o : null;
}
function gaya_(g) {
  g = (g && typeof g === "object") ? g : {};
  var t = g.tema || {};
  var hasil = {
    dasar: angkaGaya_(g.dasar, 0.85, 1.3),
    huruf: GAYA_HURUF_[g.huruf] ? g.huruf : "public-sans",
    hurufJudul: (g.hurufJudul === "sama" || GAYA_HURUF_[g.hurufJudul]) ? g.hurufJudul : "sama",
    tema: { utama: heksGaya_(t.utama), aksen: heksGaya_(t.aksen) },
    elemen: {}
  };
  Object.keys(GAYA_ELEMEN_).forEach(function (id) {
    var x = g.elemen && g.elemen[id];
    if (!x || typeof x !== "object") return;
    var o = { skala: angkaGaya_(x.skala, 0.7, 1.6), tebal: GAYA_TEBAL_[String(x.tebal)] ? String(x.tebal) : "",
              warna: heksGaya_(x.warna), warnaGelap: GAYA_PANEL_[id] ? "" : heksGaya_(x.warnaGelap) };
    if (o.skala !== 1 || o.tebal || o.warna || o.warnaGelap) hasil.elemen[id] = o;
  });
  return hasil;
}
function banner_(x) {
  return { tampil: x.tampil !== false, berkas: alamat_(x.berkas), posisi: Math.min(100, Math.max(0, Math.round(Number(x.posisi) || 50))), uraian: teks_(x.uraian, 250) };
}

/* ---------- Penyimpanan di spreadsheet ---------- */
function tab_(nama, judul) {
  var ss = SpreadsheetApp.getActive();
  var t = ss.getSheetByName(nama);
  if (!t) {
    t = ss.insertSheet(nama);
    t.getRange(1, 1, 1, judul.length).setValues([judul]).setFontWeight("bold");
    t.setFrozenRows(1);
  }
  return t;
}
function potong_(teks) {
  var hasil = [];
  for (var i = 0; i < teks.length; i += POTONG) hasil.push(teks.slice(i, i + POTONG));
  return hasil.length ? hasil : [""];
}
function tulisKonten_(teks, waktu) {
  var t = tab_(TAB_KONTEN, ["Diperbarui", "Isi (jangan diubah manual)"]);
  var bagian = potong_(teks);
  t.getRange(2, 1, 1, Math.max(t.getLastColumn(), 2)).clearContent();
  t.getRange(2, 1, 1, bagian.length + 1).setValues([[waktu].concat(bagian)]);
}
function bacaKonten_() {
  var t = SpreadsheetApp.getActive().getSheetByName(TAB_KONTEN);
  if (!t || t.getLastRow() < 2) return { konten: null, diperbarui: "" };
  var baris = t.getRange(2, 1, 1, t.getLastColumn()).getValues()[0];
  var teks = baris.slice(1).join("");
  var waktu = baris[0] instanceof Date ? baris[0].toISOString() : String(baris[0] || "");
  try { return { konten: teks ? JSON.parse(teks) : null, diperbarui: waktu }; }
  catch (galat) { return { konten: null, diperbarui: waktu }; }
}
function daftarRiwayat_() {
  var t = SpreadsheetApp.getActive().getSheetByName(TAB_RIWAYAT);
  if (!t || t.getLastRow() < 2) return [];
  var jumlah = Math.min(30, t.getLastRow() - 1), mulai = t.getLastRow() - jumlah + 1;
  return t.getRange(mulai, 1, jumlah, 3).getValues().map(function (r, i) {
    return { baris: mulai + i, waktu: r[0] instanceof Date ? r[0].toISOString() : String(r[0]), penyunting: String(r[1]), catatan: String(r[2]) };
  }).reverse();
}
function ambilRiwayat_(baris) {
  var t = SpreadsheetApp.getActive().getSheetByName(TAB_RIWAYAT);
  if (!t || !(baris >= 2) || baris > t.getLastRow()) throw new Error("Riwayat tidak ditemukan.");
  return JSON.parse(t.getRange(baris, 4, 1, Math.max(1, t.getLastColumn() - 3)).getValues()[0].join(""));
}

/* ---------- Data Monitoring Realisasi Anggaran ---------- */
function bacaRealisasiPublik_() {
  var cache = CacheService.getScriptCache();
  var simpanan = cache.get("realisasi");
  if (simpanan) return ContentService.createTextOutput(simpanan).setMimeType(ContentService.MimeType.JSON);
  var r = bacaRealisasi_();
  var teks = JSON.stringify({ ok: true, data: r.data, diperbarui: r.diperbarui });
  if (teks.length < 95000) cache.put("realisasi", teks, DETIK_CACHE);
  return ContentService.createTextOutput(teks).setMimeType(ContentService.MimeType.JSON);
}
function bacaRealisasi_() {
  var t = SpreadsheetApp.getActive().getSheetByName(TAB_REALISASI);
  if (!t || t.getLastRow() < 2) return { data: null, diperbarui: "", penyunting: "" };
  var baris = t.getRange(2, 1, 1, t.getLastColumn()).getValues()[0];
  var teks = baris.slice(2).join("");
  var waktu = baris[0] instanceof Date ? baris[0].toISOString() : String(baris[0] || "");
  try { return { data: teks ? JSON.parse(teks) : null, diperbarui: waktu, penyunting: String(baris[1] || "") }; }
  catch (galat) { return { data: null, diperbarui: waktu, penyunting: "" }; }
}
function simpanRealisasi_(minta) {
  var kunciTulis = LockService.getScriptLock();
  if (!kunciTulis.tryLock(10000)) return balas_({ ok: false, pesan: "Sedang ada penyimpanan lain. Coba lagi." });
  try {
    var lama = bacaRealisasi_();
    // Mencegah dua admin saling menimpa, sama seperti penyimpanan isi beranda.
    if (lama.diperbarui && minta.dasar && minta.dasar !== lama.diperbarui) {
      return balas_({ ok: false, bentrok: true, pesan: "Data realisasi sudah diterbitkan dari tempat lain sejak dasbor dimuat. Muat ulang dasbor dulu.", data: lama.data, diperbarui: lama.diperbarui });
    }
    var waktu = new Date().toISOString();
    var bersih = periksaRealisasi_(minta.data, waktu);
    var teks = JSON.stringify(bersih);
    if (teks.length > BATAS_DATA_REALISASI) throw new Error("Data realisasi terlalu besar.");

    var penyunting = String(minta.penyunting || "").slice(0, 60) || "(tanpa nama)";
    var catatan = String(minta.catatan || "").slice(0, 200);
    var t = tab_(TAB_REALISASI, ["Diperbarui", "Penyunting", "Isi (jangan diubah manual)"]);
    var bagian = potong_(teks);
    t.getRange(2, 1, 1, Math.max(t.getLastColumn(), 3)).clearContent();
    t.getRange(2, 1, 1, bagian.length + 2).setValues([[waktu, penyunting].concat(bagian)]);

    var periode = bersih.mentah.bulan ? BULAN_[bersih.mentah.bulan - 1] + " " + (bersih.mentah.tahun || "") : "";
    var riwayat = tab_(TAB_RIWAYAT_REALISASI, ["Waktu", "Penyunting", "Catatan", "Periode", "Isi"]);
    riwayat.appendRow([waktu, penyunting, catatan, periode.trim()].concat(potong_(teks)));
    var lebih = riwayat.getLastRow() - 1 - BATAS_RIWAYAT_REALISASI;
    if (lebih > 0) riwayat.deleteRows(2, lebih);

    CacheService.getScriptCache().remove("realisasi");
    return balas_({ ok: true, diperbarui: waktu });
  } catch (galat) {
    return balas_({ ok: false, pesan: galat.message });
  } finally {
    kunciTulis.releaseLock();
  }
}
function daftarRiwayatRealisasi_() {
  var t = SpreadsheetApp.getActive().getSheetByName(TAB_RIWAYAT_REALISASI);
  if (!t || t.getLastRow() < 2) return [];
  var jumlah = Math.min(30, t.getLastRow() - 1), mulai = t.getLastRow() - jumlah + 1;
  return t.getRange(mulai, 1, jumlah, 4).getValues().map(function (r, i) {
    return { baris: mulai + i, waktu: r[0] instanceof Date ? r[0].toISOString() : String(r[0]), penyunting: String(r[1]), catatan: String(r[2]), periode: String(r[3]) };
  }).reverse();
}
function ambilRiwayatRealisasi_(baris) {
  var t = SpreadsheetApp.getActive().getSheetByName(TAB_RIWAYAT_REALISASI);
  if (!t || !(baris >= 2) || baris > t.getLastRow()) throw new Error("Riwayat tidak ditemukan.");
  return JSON.parse(t.getRange(baris, 5, 1, Math.max(1, t.getLastColumn() - 4)).getValues()[0].join(""));
}

/* Pemeriksaan data realisasi: angka dihitung ulang, teks dipangkas, bentuk konfigurasi dibatasi. */
var BULAN_ = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];
function angka_(v) { var n = Number(v); return isFinite(n) ? Math.round(n * 100) / 100 : 0; }
function peta_(o, maksKunci, maksTeks) {
  var h = {};
  if (!o || typeof o !== "object" || Array.isArray(o)) return h;
  Object.keys(o).slice(0, maksKunci).forEach(function (k) { h[teks_(k, 40)] = teks_(o[k], maksTeks); });
  return h;
}
function larik_(v, maks, maksTeks) {
  return (Array.isArray(v) ? v : []).slice(0, maks).map(function (x) { return teks_(x, maksTeks); });
}
function pecahan_(v) { var n = Number(v); return isFinite(n) ? Math.min(1, Math.max(0, n)) : 0; }
function empatPecahan_(v) {
  var a = Array.isArray(v) ? v : [];
  return [0, 1, 2, 3].map(function (i) { return pecahan_(a[i]); });
}
function periksaRealisasi_(d, waktu) {
  if (!d || !d.mentah || !Array.isArray(d.mentah.item)) throw new Error("Data realisasi tidak lengkap.");
  var m = d.mentah;
  if (!m.item.length) throw new Error("Data realisasi tidak berisi item belanja.");
  if (m.item.length > 3000) throw new Error("Jumlah item belanja melebihi batas 3000.");
  var item = m.item.map(function (x) {
    var lalu = angka_(x.lalu), ini = angka_(x.ini);
    return {
      kode: teks_(x.kode, 12), uraian: teks_(x.uraian, 300),
      kodeKeg: teks_(x.kodeKeg, 20), kegiatan: teks_(x.kegiatan, 200),
      kodeRo: teks_(x.kodeRo, 12), namaRo: teks_(x.namaRo, 200),
      subKomponen: teks_(x.subKomponen, 250), kodeAkun: teks_(x.kodeAkun, 8), namaAkun: teks_(x.namaAkun, 150),
      pagu: angka_(x.pagu), blokir: angka_(x.blokir), lalu: lalu, ini: ini, sd: Math.round((lalu + ini) * 100) / 100
    };
  });
  var total = { pagu: 0, blokir: 0, lalu: 0, ini: 0, sd: 0 };
  item.forEach(function (x) { Object.keys(total).forEach(function (k) { total[k] += x[k]; }); });
  Object.keys(total).forEach(function (k) { total[k] = Math.round(total[k] * 100) / 100; });
  var bulan = Math.round(Number(m.bulan));
  if (!(bulan >= 1 && bulan <= 12)) throw new Error("Bulan periode tidak valid.");
  var kontrol = null, selisih = null, cocok = null;
  if (m.kontrol && typeof m.kontrol === "object") {
    kontrol = { pagu: angka_(m.kontrol.pagu), blokir: angka_(m.kontrol.blokir), lalu: angka_(m.kontrol.lalu), ini: angka_(m.kontrol.ini), sd: angka_(m.kontrol.sd) };
    selisih = { pagu: total.pagu - kontrol.pagu, sd: total.sd - kontrol.sd };
    cocok = Math.abs(selisih.pagu) < 1 && Math.abs(selisih.sd) < 1;
  }
  var k = d.konfig || {};
  var kel = {};
  ["51", "52", "53"].forEach(function (c) { kel[c] = true; });
  var target = {}, ambang = {}, namaKel = {};
  Object.keys(kel).forEach(function (c) {
    target[c] = empatPecahan_((k.target || {})[c]);
    ambang[c] = empatPecahan_((k.ambang || {})[c]);
    namaKel[c] = teks_((k.namaKelompok || {})[c], 60) || c;
  });
  var preset = Array.isArray(k.presetBersama) ? JSON.parse(JSON.stringify(k.presetBersama.slice(0, 50))) : [];
  if (JSON.stringify(preset).length > 60000) throw new Error("Preset Quick Report terlalu besar.");
  return {
    mentah: {
      item: item, total: total, kontrol: kontrol, cocok: cocok, selisih: selisih, bulan: bulan,
      tahun: Math.round(Number(m.tahun)) || null, catatan: larik_(m.catatan, 10, 300)
    },
    bulan: bulan,
    tanggal: waktu,
    tren: tren_(d.tren),
    konfig: {
      satker: { nama: teks_((k.satker || {}).nama, 100), kode: teks_((k.satker || {}).kode, 12) },
      target: target, ambang: ambang, namaKelompok: namaKel,
      unit: peta_(k.unit, 300, 100), urutanUnit: larik_(k.urutanUnit, 30, 100),
      jenis: peta_(k.jenis, 300, 100), urutanJenis: larik_(k.urutanJenis, 30, 100),
      perjadin: { ambang: pecahan_((k.perjadin || {}).ambang || 0.9) },
      presetBersama: preset
    }
  };
}

// Titik tren per bulan (paling banyak 36), diurutkan menurut periode. Satu titik per tahun-bulan.
function tren_(v) {
  if (!Array.isArray(v)) return [];
  var peta = {};
  v.slice(0, 60).forEach(function (x) {
    if (!x || typeof x !== "object") return;
    var bulan = Math.round(Number(x.bulan)), tahun = Math.round(Number(x.tahun)) || 0;
    if (!(bulan >= 1 && bulan <= 12)) return;
    peta[tahun * 100 + bulan] = { bulan: bulan, tahun: tahun || null, pagu: angka_(x.pagu), blokir: angka_(x.blokir), sd: angka_(x.sd),
                                  target: pecahan_(x.target), ambang: pecahan_(x.ambang) };
  });
  return Object.keys(peta).map(Number).sort(function (a, b) { return a - b; }).slice(-36).map(function (k) { return peta[k]; });
}

/* ---------- Pembantu ---------- */
function sidik_(teks) {
  return Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, teks, Utilities.Charset.UTF_8)
    .map(function (b) { return ("0" + (b & 255).toString(16)).slice(-2); }).join("");
}
function balas_(isi) {
  return ContentService.createTextOutput(JSON.stringify(isi)).setMimeType(ContentService.MimeType.JSON);
}
