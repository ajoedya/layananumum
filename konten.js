/* ============================================================
   Isi beranda Layanan Subbagian Umum

   ALAMAT_SKRIP adalah alamat aplikasi web Apps Script (berakhiran /exec)
   yang menyimpan isi beranda hasil suntingan dasbor admin. Tata caranya ada
   di apps-script/AdminBeranda.gs. Selama masih kosong, beranda memakai
   KONTEN_BAWAAN di bawah dan dasbor admin hanya bisa pratinjau.

   KONTEN_BAWAAN dipakai saat isi dari Apps Script belum pernah termuat atau
   gagal dimuat, supaya beranda tidak pernah kosong. Bila isi beranda sudah
   diatur dari dasbor, bagian ini cukup diperbarui sesekali lewat tombol
   "Unduh cadangan" di dasbor (tidak wajib).

   Penanda teks pada judul, uraian, dan isi informasi:
     **tebal**  → tebal
     _miring_   → miring (untuk istilah asing)
   ============================================================ */
window.ALAMAT_SKRIP = "https://script.google.com/macros/s/AKfycbz-jSdem8YddXJkAImPtBItSmyDafm8FSTmAZSuH0ixwV4pfQTLBko6pWAmCmK1SPtM/exec";

window.KONTEN_BAWAAN = {
  "versi": 1,
  "umum": {
    "label": "Layanan / Umum / Bubuhan BPP",
    "judul": "Layanan Subbagian Umum",
    "subjudul": "untuk urusan kantor yang lebih mudah.",
    "deskripsi": "Perjalanan dinas, keuangan, dan perkakas kerja pegawai KPKNL Balikpapan dalam satu halaman.",
    "keteranganAtas": "KPKNL BALIKPAPAN",
    "keteranganBawah": "Layanan sederhana untuk pekerjaan yang lebih Josjis.",
    "kaki": "KPKNL Balikpapan · Berintegritas dalam Tugas, Prima dalam Pelayanan.",
    "gerbang": { "tampil": true, "teks": "Gerbang Internal (Old)", "alamat": "https://sites.google.com/view/gerbanginternal/halaman-muka" },
    "detikPerInfo": 7
  },
  "pemberitahuan": [],
  "gaya": { "dasar": 1, "huruf": "public-sans", "hurufJudul": "sama", "tema": { "utama": "", "aksen": "" }, "elemen": {} },
  "info": [
    { "tampil": true, "label": "[Perjalanan Dinas]",
      "judul": "Mau SPJ E-Perjadin, tapi rumah Surat Tugasnya belum ada?",
      "isi": "Apabila rumah ST belum muncul di E-Perjadin, mohon untuk dapat menunggu dan cek secara berkala, karena masih menunggu antrean input dan validasi Staf PPK/PPK." },
    { "tampil": true, "label": "[Efisiensi Belanja]",
      "judul": "S-708/MK.03/2026 Langkah Strategis Belanja Kementerian/Lembaga pada Triwulan IV Tahun Anggaran 2026",
      "isi": "Terdapat penyesuaian kembali pagu belanja birokrasi pada akhir Triwulan IV TA 2026, rincian perubahan akan disampaikan pada kesempatan pertama." },
    { "tampil": true, "label": "[Perubahan Alamat Layanan]",
      "judul": "Terdapat Perubahan Alamat Monitoring Realisasi Anggaran dan Olah PDF.",
      "isi": "Alamat situs Monitoring Realisasi Anggaran, sebelumnya Dashboard Anggaran (**ajoedya.github.io/layananumum/realisasi**) & Alamat situs Olah PDF (**ajoedya.github.io/layananumum/bengkelpdf**)." }
  ],
  "kelompok": [
    { "id": "perjadin", "nama": "Perjalanan dinas", "judulBagian": "Perjalanan dinas", "arsip": false, "tampil": true },
    { "id": "keuangan", "nama": "Keuangan", "judulBagian": "Keuangan", "arsip": false, "tampil": true },
    { "id": "perkakas", "nama": "Perkakas", "judulBagian": "Perkakas", "arsip": false, "tampil": true },
    { "id": "arsip", "nama": "Arsip", "judulBagian": "Arsip E-Perjadin versi 1", "arsip": true, "tampil": true }
  ],
  "tautan": [
    { "tampil": true, "kelompok": "perjadin", "judul": "Monitoring E-Perjadin v2",
      "uraian": "Pantau pencairan SPD dan catatan koreksi dari staf PPK, PPK, atau bendahara.",
      "alamat": "perjadin/", "kunci": "perjadin perjalanan dinas spd pencairan pantau koreksi ppk bendahara surat tugas st status pembayaran" },
    { "tampil": true, "kelompok": "perjadin", "judul": "_Template_ ND Usulan Perjadin",
      "uraian": "Unduh templat nota dinas usulan perjalanan dinas yang tinggal diisi.",
      "alamat": "https://s.kemenkeu.go.id/ndperjadinbpp", "kunci": "perjadin perjalanan dinas nota dinas nd usulan template templat unduh" },
    { "tampil": true, "kelompok": "perjadin", "judul": "Data Dukung Perjadin",
      "uraian": "Suket kehadiran, SKTJM peserta eksternal, dan surat pernyataan tidak menginap.",
      "alamat": "https://kemenkeu-my.sharepoint.com/:f:/g/personal/ivandana_saputra_kemenkeu_go_id/IgBzAJyhaYfyQrE5qxD3-0H8Aefxuv8gEhwlVeqqI8RJPf4?e=eiDoWD",
      "kunci": "perjadin perjalanan dinas suket kehadiran presensi sktjm surat pernyataan tidak menginap data dukung" },
    { "tampil": true, "kelompok": "keuangan", "judul": "Sisa Dana",
      "uraian": "Cek dana yang masih tersedia sebelum mengusulkan kegiatan.",
      "alamat": "realisasi/", "kunci": "keuangan saldo sisa dana pagu anggaran realisasi" },
    { "tampil": true, "kelompok": "keuangan", "judul": "Pemutakhiran Rekening",
      "uraian": "Perbarui rekening penerima pembayaran perjalanan dinas atau honor.",
      "alamat": "https://forms.office.com/r/1nnq1CSKEC", "kunci": "keuangan rekening bank honor pembayaran update perbarui pemutakhiran" },
    { "tampil": true, "kelompok": "keuangan", "judul": "Pengisian Capaian Output",
      "uraian": "Tempat PIC Caput tiap seksi mengisi capaian keluaran (_output_) seksinya.",
      "alamat": "https://s.kemenkeu.go.id/CaputBPN2026",
      "kunci": "keuangan caput capaian output keluaran pic seksi" },
    { "tampil": true, "kelompok": "perkakas", "judul": "Olah PDF",
      "uraian": "Edit teks, gabung, pecah, dan beri tanda air langsung di peramban tanpa mengunggah berkas.",
      "alamat": "bengkelpdf/", "kunci": "olah bengkel perkakas pdf kunci sandi password protect edit teks gabung pecah watermark tanda air kompres word naskah" },
    { "tampil": true, "kelompok": "arsip", "judul": "Monitoring E-Perjadin v1",
      "uraian": "Pemantauan SPD untuk perjalanan dinas sebelum **27 Juli 2026**.",
      "alamat": "https://sites.google.com/view/gerbanginternal/halaman-muka/monitoring-spd", "kunci": "arsip perjadin perjalanan dinas spd monitoring lama versi 1" },
    { "tampil": true, "kelompok": "arsip", "judul": "Formulir E-Perjadin v1",
      "uraian": "Wajib diisi untuk perjalanan dinas sebelum **27 Juli 2026**.",
      "alamat": "https://forms.gle/MLRRTcoCkZ9Mc31AA", "kunci": "arsip perjadin perjalanan dinas formulir form lama versi 1" }
  ],
  "banner": {
    "koleksi": "2026-10-kaltim",
    "menit": 360,
    "siang": [
      {"tampil": true, "berkas": "banner-teluk-senja.jpg", "posisi": 48, "uraian": "Teluk Balikpapan saat senja dengan hutan hujan di kiri, gedung kota di tengah, kapal tanker di laut, dan burung enggang terbang"},
      {"tampil": true, "berkas": "banner-jembatan-pagi.jpg", "posisi": 50, "uraian": "Jembatan Pulau Balang pada pagi hari membentang di atas teluk, dikelilingi hutan bakau dan perbukitan berkabut"},
      {"tampil": true, "berkas": "banner-speedboat-pagi.jpg", "posisi": 60, "uraian": "Speedboat penyeberangan Balikpapan ke Penajam melaju di teluk pada pagi hari, dengan dermaga kayu di kiri"}
    ],
    "malam": [
      {"tampil": true, "berkas": "banner-teluk-malam.jpg", "posisi": 45, "uraian": "Teluk Balikpapan pada malam hari dengan lampu kota dan kilang yang terpantul di air, berlatar bulan sabit"},
      {"tampil": true, "berkas": "banner-jembatan-malam.jpg", "posisi": 50, "uraian": "Jembatan Pulau Balang pada malam hari dengan menara dan lampu jalan berwarna keemasan terpantul di teluk"},
      {"tampil": true, "berkas": "banner-speedboat-malam.jpg", "posisi": 60, "uraian": "Speedboat penyeberangan Balikpapan ke Penajam melaju di teluk pada malam hari, dengan dermaga berlampu di kiri"}
    ]
  }
};

/* Alat bersama untuk beranda dan dasbor admin. */
window.Konten = (function () {
  "use strict";

  // Penanda **tebal** dan _miring_ diubah menjadi elemen, tanpa pernah menafsirkan HTML.
  function isiTeks(el, teks) {
    el.textContent = "";
    String(teks || "").split(/(\*\*[^*]+\*\*|_[^_\s][^_]*_)/).forEach(function (bagian) {
      if (!bagian) return;
      var tag = null, isi = bagian;
      if (/^\*\*[^*]+\*\*$/.test(bagian)) { tag = "b"; isi = bagian.slice(2, -2); }
      else if (/^_[^_]+_$/.test(bagian)) { tag = "i"; isi = bagian.slice(1, -1); }
      if (tag) { var n = document.createElement(tag); n.textContent = isi; el.appendChild(n); }
      else el.appendChild(document.createTextNode(bagian));
    });
    return el;
  }
  function polos(teks) { return String(teks || "").replace(/\*\*([^*]+)\*\*/g, "$1").replace(/_([^_]+)_/g, "$1"); }

  // Hanya alamat https atau alamat di dalam situs ini yang dipakai; selain itu (javascript:, data:) ditolak.
  function alamatAman(a) {
    a = String(a || "").trim();
    if (!a) return "";
    if (/^https:\/\//i.test(a)) return a;
    if (/^[a-z][a-z0-9+.-]*:/i.test(a) || a.indexOf("//") === 0) return "";
    return a;
  }
  function luar(a) { return /^https:\/\//i.test(a); }

  function salin(o) { return JSON.parse(JSON.stringify(o)); }

  /* ---------- Pop up pemberitahuan ----------
     Daftar pilihan ini harus sama dengan daftar putih pemberitahuan_ di Apps Script.
     Bentuk lama (satu objek `popup`, hanya untuk beranda) diubah menjadi satu butir daftar, supaya isi yang sudah tersimpan tetap tampil. */
  var PEMBERITAHUAN = {
    bentuk: [["pojok", "Pemberitahuan di pojok"], ["jendela", "Jendela pengumuman"]],
    jenis: [["info", "Informasi"], ["peringatan", "Peringatan"], ["penting", "Penting"]],
    posisi: [["kanan-bawah", "Kanan bawah"], ["kiri-bawah", "Kiri bawah"], ["kanan-atas", "Kanan atas"], ["kiri-atas", "Kiri atas"]],
    frekuensi: [["sesi", "Sekali per sesi"], ["harian", "Sekali per hari"], ["setiap", "Setiap kali"]],
    halaman: [["beranda", "Beranda"], ["perjadin", "Monitoring E-Perjadin"], ["realisasi", "Monitoring Realisasi Anggaran"], ["olahpdf", "Olah PDF"]],
    // Khusus jendela pengumuman. Pemicu "klik" memunculkan jendela saat pengunjung mengklik tautan ke pemicuAlamat,
    // lalu meneruskannya ke tujuan setelah menekan tombol lanjut.
    pemicu: [["buka", "Saat halaman dibuka"], ["klik", "Saat tautan tertentu diklik"]],
    buram: [["tanpa", "Tanpa buram"], ["tipis", "Tipis"], ["sedang", "Sedang"], ["tebal", "Tebal"]],
    redup: [["terang", "Terang"], ["sedang", "Sedang"], ["gelap", "Gelap"]],
    lebar: [["kecil", "Kecil"], ["sedang", "Sedang"], ["besar", "Besar"]]
  };
  function kodeDalam(daftar, nilai, bawaan) {
    for (var i = 0; i < daftar.length; i++) if (daftar[i][0] === nilai) return nilai;
    return bawaan;
  }
  function batasi(n, min, maks, bawaan) { n = Number(n); return isFinite(n) && n >= 0 ? Math.min(maks, Math.max(min, Math.round(n))) : bawaan; }
  function idPemberitahuan() { return "p" + Math.random().toString(36).slice(2, 10); }
  function rapikanButirPemberitahuan(x) {
    x = x && typeof x === "object" ? x : {};
    var semua = PEMBERITAHUAN.halaman.map(function (h) { return h[0]; });
    var o = {
      id: /^[a-z0-9-]{1,20}$/.test(String(x.id || "")) ? String(x.id) : idPemberitahuan(),
      tampil: x.tampil !== false,
      bentuk: x.bentuk === "jendela" ? "jendela" : "pojok", gambar: String(x.gambar || ""), gambarAlt: String(x.gambarAlt || ""),
      jenis: kodeDalam(PEMBERITAHUAN.jenis, x.jenis, "info"),
      judul: String(x.judul == null ? "" : x.judul), isi: String(x.isi == null ? "" : x.isi),
      tombolTeks: String(x.tombolTeks == null ? "" : x.tombolTeks), tombolAlamat: String(x.tombolAlamat == null ? "" : x.tombolAlamat),
      detik: batasi(x.detik, 5, 600, 60), tunda: batasi(x.tunda, 0, 60, 0),
      posisi: kodeDalam(PEMBERITAHUAN.posisi, x.posisi, "kanan-bawah"),
      frekuensi: kodeDalam(PEMBERITAHUAN.frekuensi, x.frekuensi, "sesi"),
      halaman: Array.isArray(x.halaman) ? semua.filter(function (h) { return x.halaman.indexOf(h) >= 0; }) : semua,
      sembunyikan: x.sembunyikan === true,
      pemicu: kodeDalam(PEMBERITAHUAN.pemicu, x.pemicu, "buka"),
      pemicuAlamat: String(x.pemicuAlamat || ""),
      buram: kodeDalam(PEMBERITAHUAN.buram, x.buram, "sedang"),
      redup: kodeDalam(PEMBERITAHUAN.redup, x.redup, "sedang"),
      lebar: kodeDalam(PEMBERITAHUAN.lebar, x.lebar, "sedang"),
      tombolLanjut: String(x.tombolLanjut || ""), tombolTutup: String(x.tombolTutup || ""),
      tutupLatar: x.tutupLatar === true,
      wajibBaca: x.wajibBaca === true, teksBaca: String(x.teksBaca || "")
    };
    ["mulai", "selesai"].forEach(function (f) { if (/^\d{4}-\d{2}-\d{2}$/.test(String(x[f] || ""))) o[f] = x[f]; });
    return o;
  }
  function rapikanPemberitahuan(k) {
    if (Array.isArray(k.pemberitahuan)) return k.pemberitahuan.map(rapikanButirPemberitahuan);
    var p = k.popup;
    if (p && typeof p === "object" && (p.judul || p.isi)) {
      return [rapikanButirPemberitahuan({ id: "lama", tampil: p.tampil === true, judul: p.judul, isi: p.isi, detik: p.detik, halaman: ["beranda"], mulai: p.mulai, selesai: p.selesai })];
    }
    return [];
  }

  // Melengkapi isi yang kurang dengan bawaan, supaya isi lama dari Apps Script tetap bisa dipakai.
  function rapikan(k) {
    var b = window.KONTEN_BAWAAN;
    if (!k || typeof k !== "object") return salin(b);
    var hasil = salin(k);
    hasil.umum = Object.assign({}, salin(b.umum), hasil.umum || {});
    hasil.umum.gerbang = Object.assign({}, b.umum.gerbang, (k.umum && k.umum.gerbang) || {});
    hasil.pemberitahuan = rapikanPemberitahuan(k);
    delete hasil.popup;
    ["info", "kelompok", "tautan"].forEach(function (n) { if (!Array.isArray(hasil[n])) hasil[n] = salin(b[n]); });
    // Simpanan yang dibuat untuk koleksi banner lama diganti koleksi bawaan, supaya foto lama tidak muncul lagi.
    hasil.banner = (k.banner && k.banner.koleksi === b.banner.koleksi)
      ? Object.assign({}, salin(b.banner), hasil.banner)
      : salin(b.banner);
    ["siang", "malam"].forEach(function (n) { if (!Array.isArray(hasil.banner[n])) hasil.banner[n] = salin(b.banner[n]); });
    hasil.gaya = rapikanGaya(k.gaya);
    ["info", "tautan"].forEach(function (n) {
      hasil[n].forEach(function (x) {
        if (!x) return;
        if (x.gaya) { x.gaya = rapikanButir(x.gaya); if (!x.gaya) delete x.gaya; }
        ["mulai", "selesai"].forEach(function (f) { if (!/^\d{4}-\d{2}-\d{2}$/.test(String(x[f] || ""))) delete x[f]; });
      });
    });
    return hasil;
  }

  /* ---------- Jadwal tayang ----------
     Informasi dan tautan boleh punya tanggal mulai dan selesai (yyyy-mm-dd, tanggal selesai ikut tayang).
     Dibandingkan dengan tanggal di perangkat pembaca, jadi semua pegawai di zona waktu yang sama melihat hal yang sama. */
  function hariIni(kini) {
    kini = kini || new Date();
    var b = kini.getMonth() + 1, h = kini.getDate();
    return kini.getFullYear() + "-" + (b < 10 ? "0" : "") + b + "-" + (h < 10 ? "0" : "") + h;
  }
  // Mengembalikan "" bila sedang tayang, "belum" bila belum mulai, "lewat" bila sudah berakhir.
  function statusJadwal(x, kini) {
    var t = hariIni(kini);
    if (x && x.mulai && t < x.mulai) return "belum";
    if (x && x.selesai && t > x.selesai) return "lewat";
    return "";
  }
  function dalamJadwal(x, kini) { return !statusJadwal(x, kini); }

  function slug(teks) {
    return polos(teks).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 40) || "kelompok";
  }


  /* ---------- Gaya tampilan (ukuran, warna, huruf, tema) ----------
     Dipakai beranda untuk membangun <style id="gayaDinamis"> dan dasbor admin untuk formulir serta peringatan kontras.
     Hanya angka dan kode warna heks yang lolos, jadi hasilnya aman dipasang sebagai CSS. */
  var ELEMEN = [
    { id: "judul",     nama: "Judul besar",              panel: true,  sel: "h1 .judul-utama",   wajar: "32 px" },
    { id: "subjudul",  nama: "Subjudul emas",            panel: true,  sel: "#isiSubjudul",      wajar: "22 px" },
    { id: "deskripsi", nama: "Deskripsi panel",          panel: true,  sel: ".panel-deskripsi",  wajar: "15 px" },
    { id: "label",     nama: "Label kecil",              panel: true,  sel: ".panel .label",     wajar: "12 px" },
    { id: "bagian",    nama: "Judul bagian",             panel: false, sel: ".bagian h2",        wajar: "12 px" },
    { id: "tj",        nama: "Judul kartu tautan",       panel: false, sel: ".uraian strong",    wajar: "16 px" },
    { id: "tu",        nama: "Uraian kartu tautan",      panel: false, sel: ".uraian span",      wajar: "14 px" },
    { id: "ij",        nama: "Judul kotak informasi",    panel: false, sel: ".info strong",      wajar: "17 px" },
    { id: "ii",        nama: "Isi kotak informasi",      panel: false, sel: ".info p:last-child", wajar: "14 px" },
    { id: "kaki",      nama: "Teks kaki halaman",        panel: false, sel: ".kaki",             wajar: "14 px" }
  ];
  var HURUF = {
    "public-sans": { nama: "Public Sans (bawaan)", tumpukan: '"Public Sans", system-ui, -apple-system, "Segoe UI", sans-serif', gf: "" },
    "inter":       { nama: "Inter", tumpukan: '"Inter", system-ui, -apple-system, "Segoe UI", sans-serif', gf: "Inter:wght@400;500;600;700;800" },
    "source-sans": { nama: "Source Sans 3", tumpukan: '"Source Sans 3", system-ui, -apple-system, "Segoe UI", sans-serif', gf: "Source+Sans+3:ital,wght@0,400;0,600;0,700;0,800;1,400" },
    "atkinson":    { nama: "Atkinson Hyperlegible (mudah dibaca)", tumpukan: '"Atkinson Hyperlegible", system-ui, -apple-system, "Segoe UI", sans-serif', gf: "Atkinson+Hyperlegible:ital,wght@0,400;0,700;1,400" },
    "lora":        { nama: "Lora (berkaki)", tumpukan: '"Lora", Georgia, "Times New Roman", serif', gf: "Lora:ital,wght@0,400;0,600;0,700;1,400" },
    "sistem":      { nama: "Huruf bawaan perangkat", tumpukan: 'system-ui, -apple-system, "Segoe UI", Roboto, sans-serif', gf: "" }
  };
  var PRESET_TEMA = [
    { nama: "Navy dan emas (bawaan)", utama: "", aksen: "" },
    { nama: "Hijau zamrud", utama: "#0b4a3c", aksen: "#c28a1a" },
    { nama: "Marun", utama: "#5b1a2b", aksen: "#c9953a" },
    { nama: "Ungu tua", utama: "#3b2a6b", aksen: "#d19a2f" },
    { nama: "Biru baja", utama: "#263544", aksen: "#d58a1f" }
  ];
  var TEBAL = ["", "400", "500", "600", "700", "800"];
  var TERANG = ':root:not([data-mode="gelap"])';
  var UTAMA_BAWAAN = "#0f3554", AKSEN_BAWAAN = "#b8700f";

  function angka(v, min, maks, awal) { v = Number(v); return isFinite(v) ? Math.min(maks, Math.max(min, Math.round(v * 100) / 100)) : awal; }
  function heks(v) { v = String(v || "").trim().toLowerCase(); return /^#[0-9a-f]{6}$/.test(v) ? v : ""; }

  function rapikanGaya(g) {
    g = (g && typeof g === "object") ? g : {};
    var hasil = { dasar: angka(g.dasar, 0.85, 1.3, 1), huruf: HURUF[g.huruf] ? g.huruf : "public-sans", hurufJudul: (g.hurufJudul === "sama" || HURUF[g.hurufJudul]) ? g.hurufJudul : "sama",
      tema: { utama: heks(g.tema && g.tema.utama), aksen: heks(g.tema && g.tema.aksen) }, elemen: {} };
    ELEMEN.forEach(function (e) {
      var x = g.elemen && g.elemen[e.id];
      if (!x || typeof x !== "object") return;
      var o = { skala: angka(x.skala, 0.7, 1.6, 1), tebal: TEBAL.indexOf(String(x.tebal || "")) > 0 ? String(x.tebal) : "", warna: heks(x.warna), warnaGelap: e.panel ? "" : heks(x.warnaGelap) };
      if (o.skala !== 1 || o.tebal || o.warna || o.warnaGelap) hasil.elemen[e.id] = o;
    });
    return hasil;
  }
  // Gaya satu kartu atau satu informasi: skala dan warna judul. Mengembalikan null bila tidak ada yang diubah.
  function rapikanButir(x) {
    if (!x || typeof x !== "object") return null;
    var o = { skala: angka(x.skala, 0.7, 1.6, 1), warna: heks(x.warna), warnaGelap: heks(x.warnaGelap) };
    return (o.skala !== 1 || o.warna || o.warnaGelap) ? o : null;
  }
  function punyaGaya(x) { return !!(x && x.gaya && rapikanButir(x.gaya)); }

  // Alat warna.
  function rgb(h) { h = heks(h); return [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)]; }
  function dariRgb(a) { return "#" + a.map(function (n) { n = Math.max(0, Math.min(255, Math.round(n))); return (n < 16 ? "0" : "") + n.toString(16); }).join(""); }
  function campur(a, b, t) { var x = rgb(a), y = rgb(b); return dariRgb(x.map(function (n, i) { return n + (y[i] - n) * t; })); }
  function luminans(h) {
    return rgb(h).map(function (n) { n /= 255; return n <= 0.03928 ? n / 12.92 : Math.pow((n + 0.055) / 1.055, 2.4); })
      .reduce(function (s, n, i) { return s + n * [0.2126, 0.7152, 0.0722][i]; }, 0);
  }
  function kontras(a, b) { var p = luminans(a), q = luminans(b); return (Math.max(p, q) + 0.05) / (Math.min(p, q) + 0.05); }
  // Menggeser warna ke hitam (arah "gelap") atau putih (arah "terang") sampai cukup kontras terhadap latar.
  function sesuaikan(w, latar, min, arah) {
    var ujung = arah === "gelap" ? "#000000" : "#ffffff";
    for (var t = 0; t <= 1.001; t += 0.04) { var c = campur(w, ujung, t); if (kontras(c, latar) >= min) return c; }
    return ujung;
  }
  function skalaRgb(h, f) { return dariRgb(rgb(h).map(function (n) { return n * f; })); }
  function tigaRgb(h) { return rgb(h).join(", "); }

  // Peringatan lunak untuk dasbor: warna yang sulit dibaca. Tidak memblokir penyimpanan.
  function periksaGaya(g) {
    g = rapikanGaya(g);
    var p = [];
    if (g.tema.utama && kontras(g.tema.utama, "#ffffff") < 4.5) p.push("Warna utama terlalu terang: teks putih di panel samping sulit dibaca (kontras " + kontras(g.tema.utama, "#ffffff").toFixed(1).replace(".", ",") + ", minimal 4,5).");
    ELEMEN.forEach(function (e) {
      var x = g.elemen[e.id]; if (!x) return;
      var latarTerang = e.panel ? (g.tema.utama || UTAMA_BAWAAN) : "#ffffff";
      if (x.warna) {
        var k = kontras(x.warna, latarTerang);
        if (k < 4.5) p.push(e.nama + ": warna terlalu dekat dengan latarnya (kontras " + k.toFixed(1).replace(".", ",") + ", minimal 4,5).");
      }
      if (x.warnaGelap) {
        var k2 = kontras(x.warnaGelap, "#16212c");
        if (k2 < 4.5) p.push(e.nama + " (mode gelap): kontras " + k2.toFixed(1).replace(".", ",") + ", minimal 4,5.");
      }
    });
    return p;
  }

  // Membangun CSS dari gaya dan butir. Hasilnya hanya berisi nilai yang sudah disaring.
  function cssGaya(gaya, konten) {
    var g = rapikanGaya(gaya), v = [], aturan = [], gelap = [], mutlak = [];
    var tumpuk = function (kunci) { return HURUF[kunci].tumpukan; };
    if (g.huruf !== "public-sans") v.push("--huruf:" + tumpuk(g.huruf));
    if (g.hurufJudul !== "sama") v.push("--huruf-judul:" + tumpuk(g.hurufJudul));
    ELEMEN.forEach(function (e) {
      var x = g.elemen[e.id], s = Math.round(g.dasar * (x ? x.skala : 1) * 1000) / 1000;
      if (s !== 1) v.push("--s-" + e.id + ":" + s);
      if (!x) return;
      // Ketebalan berlaku di kedua mode; warna elemen di luar panel berlaku di mode terang saja (mode gelap punya warnanya sendiri).
      if (x.tebal) aturan.push(e.sel + "{font-weight:" + x.tebal + "}");
      if (x.warna) aturan.push((e.panel ? "" : TERANG + " ") + e.sel + "{color:" + x.warna + "}");
      if (x.warnaGelap) gelap.push(':root[data-mode="gelap"] ' + e.sel + "{color:" + x.warnaGelap + "}");
    });
    // Tema warna: hanya dibuat bila diubah dari bawaan.
    var u = g.tema.utama, a = g.tema.aksen, t = [], tg = [];
    if (u) {
      var panelTerang = u, panelGelap = skalaRgb(u, 0.62);
      t.push("--laut-tua:" + u, "--laut-hover:" + campur(u, "#ffffff", 0.14), "--tautan:" + campur(u, "#ffffff", 0.08),
        "--rgb-laut:" + tigaRgb(panelTerang), "--rgb-gelap:" + tigaRgb(skalaRgb(u, 0.78)), "--bayang-teks:" + skalaRgb(u, 0.65));
      tg.push("--laut-hover:" + campur(u, "#ffffff", 0.25), "--rgb-laut:" + tigaRgb(panelGelap), "--rgb-gelap:" + tigaRgb(skalaRgb(u, 0.32)));
    }
    if (a) {
      t.push("--emas-tua:" + a, "--emas-teks:" + sesuaikan(a, "#ffffff", 4.5, "gelap"), "--emas-muda:" + campur(a, "#ffffff", 0.9), "--emas-garis:" + campur(a, "#ffffff", 0.62));
      tg.push("--emas-tua:" + sesuaikan(a, "#16212c", 3, "terang"), "--emas-teks:" + sesuaikan(a, "#16212c", 4.5, "terang"), "--emas-muda:" + campur(a, "#0e1620", 0.88), "--emas-garis:" + campur(a, "#0e1620", 0.65));
    }
    if (u || a) {
      var navi = u || UTAMA_BAWAAN, kotak = sesuaikan(a || "#ffd27a", navi, 4.5, "terang");
      t.push("--emas-terang:" + kotak);
      var teksKotak = kontras(navi, kotak) >= kontras("#0a0a0a", kotak) ? navi : "#0a0a0a";
      aturan.push('.kelompok a[aria-current="true"] b{color:' + teksKotak + "}");
    }
    var css = "";
    if (v.length || t.length) css += ":root{" + v.concat(t).join(";") + "}\n";
    if (tg.length) css += ':root[data-mode="gelap"]{' + tg.join(";") + "}\n";
    css += aturan.join("\n") + (aturan.length ? "\n" : "") + gelap.join("\n") + (gelap.length ? "\n" : "");
    // Gaya per butir. Kelas gx-t<n> untuk tautan dan gx-i<n> untuk informasi (n = urutan di daftar penuh).
    var butir = function (daftar, awalan, varJ, varU, selJ) {
      (daftar || []).forEach(function (x, n) {
        var b = x && rapikanButir(x.gaya); if (!b) return;
        var s = Math.round(g.dasar * b.skala * 1000) / 1000, k = "." + awalan + n;
        if (b.skala !== 1) css += k + "{--s-" + varJ + ":" + s + ";--s-" + varU + ":" + s + "}\n";
        if (b.warna) css += TERANG + " " + k + " " + selJ + "{color:" + b.warna + "}\n";
        if (b.warnaGelap) css += ':root[data-mode="gelap"] ' + k + " " + selJ + "{color:" + b.warnaGelap + "}\n";
      });
    };
    if (konten) { butir(konten.tautan, "gx-t", "tj", "tu", ".uraian strong"); butir(konten.info, "gx-i", "ij", "ii", "strong"); }
    return css;
  }
  // Alamat lembar gaya Google Fonts untuk huruf yang dipilih (kosong bila tidak perlu).
  function alamatHuruf(gaya) {
    var g = rapikanGaya(gaya), daftar = [];
    [g.huruf, g.hurufJudul].forEach(function (k) { if (HURUF[k] && HURUF[k].gf && daftar.indexOf(HURUF[k].gf) < 0) daftar.push(HURUF[k].gf); });
    return daftar.length ? "https://fonts.googleapis.com/css2?" + daftar.map(function (f) { return "family=" + f; }).join("&") + "&display=swap" : "";
  }

  return { ELEMEN: ELEMEN, HURUF: HURUF, PRESET_TEMA: PRESET_TEMA, TEBAL: TEBAL, UTAMA_BAWAAN: UTAMA_BAWAAN, AKSEN_BAWAAN: AKSEN_BAWAAN,
    rapikanGaya: rapikanGaya, rapikanButir: rapikanButir, punyaGaya: punyaGaya, periksaGaya: periksaGaya, cssGaya: cssGaya, alamatHuruf: alamatHuruf, kontras: kontras,
    isiTeks: isiTeks, polos: polos, alamatAman: alamatAman, luar: luar, salin: salin, rapikan: rapikan, slug: slug, statusJadwal: statusJadwal, dalamJadwal: dalamJadwal, hariIni: hariIni,
    PEMBERITAHUAN: PEMBERITAHUAN, rapikanButirPemberitahuan: rapikanButirPemberitahuan };
})();
