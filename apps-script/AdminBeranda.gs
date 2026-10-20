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
 */

var TAB_KONTEN = "Konten";
var TAB_RIWAYAT = "Riwayat";
var PROPERTI_KUNCI = "SIDIK_KUNCI_ADMIN";
var BATAS_GAGAL = 10;           // jumlah kunci salah sebelum penyimpanan dikunci sementara
var MENIT_KUNCI = 15;           // lama penguncian setelah terlalu banyak kunci salah
var BATAS_RIWAYAT = 200;        // baris riwayat terlama dihapus bila melewati jumlah ini
var DETIK_CACHE = 60;           // isi beranda disimpan sementara supaya beranda cepat termuat
var POTONG = 45000;             // panjang teks per sel (batas sel Google Sheets 50.000 karakter)

/* ---------- Menu di spreadsheet ---------- */
function onOpen() {
  SpreadsheetApp.getUi().createMenu("Dasbor Beranda")
    .addItem("Setel kunci admin", "setelKunciAdmin")
    .addItem("Buka kunci penyimpanan (bila terkunci)", "bukaKunciPenyimpanan")
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

/* ---------- Membaca isi (beranda) ---------- */
function doGet(e) {
  var aksi = (e && e.parameter && e.parameter.aksi) || "baca";
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

  var cache = CacheService.getScriptCache();
  if (cache.get("terkunci")) return balas_({ ok: false, pesan: "Terlalu banyak kunci salah. Coba lagi " + MENIT_KUNCI + " menit lagi." });
  var sidik = PropertiesService.getScriptProperties().getProperty(PROPERTI_KUNCI);
  if (!sidik) return balas_({ ok: false, pesan: "Kunci admin belum disetel di spreadsheet." });
  if (!minta.kunci || sidik_(String(minta.kunci)) !== sidik) {
    var gagal = Number(cache.get("gagal") || 0) + 1;
    cache.put("gagal", String(gagal), MENIT_KUNCI * 60);
    if (gagal >= BATAS_GAGAL) cache.put("terkunci", "1", MENIT_KUNCI * 60);
    Utilities.sleep(800);
    return balas_({ ok: false, pesan: "Kunci admin salah." });
  }

  cache.remove("gagal");
  try {
    switch (minta.aksi) {
      case "cek":
        var data = bacaKonten_();
        return balas_({ ok: true, konten: data.konten, diperbarui: data.diperbarui });
      case "simpan":
        return simpan_(minta);
      case "riwayat":
        return balas_({ ok: true, riwayat: daftarRiwayat_() });
      case "ambilRiwayat":
        return balas_({ ok: true, konten: ambilRiwayat_(Number(minta.baris)) });
      default:
        return balas_({ ok: false, pesan: "Aksi tidak dikenal" });
    }
  } catch (galat) {
    return balas_({ ok: false, pesan: galat.message });
  }
}

function simpan_(minta) {
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
    return balas_({ ok: true, diperbarui: waktu });
  } catch (galat) {
    return balas_({ ok: false, pesan: galat.message });
  } finally {
    kunciTulis.releaseLock();
  }
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
      return { tampil: x.tampil !== false, label: teks_(x.label, 80), judul: teks_(x.judul, 250), isi: teks_(x.isi, 800) };
    }),
    kelompok: daftar_(k.kelompok, 30).map(function (x) {
      var id = teks_(x.id, 40).toLowerCase().replace(/[^a-z0-9-]/g, "");
      if (!id) throw new Error("Ada kelompok tanpa kode.");
      return { id: id, nama: teks_(x.nama, 60), judulBagian: teks_(x.judulBagian, 120), arsip: !!x.arsip, tampil: x.tampil !== false };
    }),
    tautan: daftar_(k.tautan, 200).map(function (x) {
      return { tampil: x.tampil !== false, kelompok: teks_(x.kelompok, 40), judul: teks_(x.judul, 120),
               uraian: teks_(x.uraian, 300), alamat: alamat_(x.alamat), kunci: teks_(x.kunci, 400) };
    }),
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

/* ---------- Pembantu ---------- */
function sidik_(teks) {
  return Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, teks, Utilities.Charset.UTF_8)
    .map(function (b) { return ("0" + (b & 255).toString(16)).slice(-2); }).join("");
}
function balas_(isi) {
  return ContentService.createTextOutput(JSON.stringify(isi)).setMimeType(ContentService.MimeType.JSON);
}
