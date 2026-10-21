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
  "info": [
    { "tampil": true, "label": "[Perjalanan Dinas]",
      "judul": "Mau SPJ E-Perjadin, tapi rumah Surat Tugasnya belum ada?",
      "isi": "Apabila rumah ST belum muncul di E-Perjadin, mohon untuk dapat menunggu dan cek secara berkala, karena masih menunggu antrean input dan validasi Staf PPK/PPK." },
    { "tampil": true, "label": "[Efisiensi Belanja]",
      "judul": "S-708/MK.03/2026 Langkah Strategis Belanja Kementerian/Lembaga pada Triwulan IV Tahun Anggaran 2026",
      "isi": "Terdapat penyesuaian kembali pagu belanja birokrasi pada akhir Triwulan IV TA 2026, rincian perubahan akan disampaikan pada kesempatan pertama." },
    { "tampil": true, "label": "[Perubahan Alamat Layanan]",
      "judul": "Terdapat Perubahan Alamat Dashboard Anggaran dan Bengkel PDF.",
      "isi": "Alamat situs Dashboard Anggaran (**ajoedya.github.io/layananumum/jagakas**) & Alamat situs Bengkel PDF (**ajoedya.github.io/layananumum/bengkelpdf**)." }
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
      "alamat": "jagakas/", "kunci": "keuangan saldo sisa dana pagu anggaran realisasi" },
    { "tampil": true, "kelompok": "keuangan", "judul": "Pemutakhiran Rekening",
      "uraian": "Perbarui rekening penerima pembayaran perjalanan dinas atau honor.",
      "alamat": "https://forms.office.com/r/1nnq1CSKEC", "kunci": "keuangan rekening bank honor pembayaran update perbarui pemutakhiran" },
    { "tampil": true, "kelompok": "keuangan", "judul": "Pengisian Capaian Output",
      "uraian": "Tempat PIC Caput tiap seksi mengisi capaian keluaran (_output_) seksinya.",
      "alamat": "https://s.kemenkeu.go.id/CaputBPN2026",
      "kunci": "keuangan caput capaian output keluaran pic seksi" },
    { "tampil": true, "kelompok": "perkakas", "judul": "Bengkel PDF",
      "uraian": "Edit teks, gabung, pecah, dan beri tanda air langsung di peramban tanpa mengunggah berkas.",
      "alamat": "bengkelpdf/", "kunci": "bengkel perkakas pdf edit teks gabung pecah watermark tanda air kompres word naskah" },
    { "tampil": true, "kelompok": "arsip", "judul": "Monitoring E-Perjadin v1",
      "uraian": "Pemantauan SPD untuk perjalanan dinas sebelum **27 Juli 2026**.",
      "alamat": "https://sites.google.com/view/gerbanginternal/halaman-muka/monitoring-spd", "kunci": "arsip perjadin perjalanan dinas spd monitoring lama versi 1" },
    { "tampil": true, "kelompok": "arsip", "judul": "Formulir E-Perjadin v1",
      "uraian": "Wajib diisi untuk perjalanan dinas sebelum **27 Juli 2026**.",
      "alamat": "https://forms.gle/MLRRTcoCkZ9Mc31AA", "kunci": "arsip perjadin perjalanan dinas formulir form lama versi 1" }
  ],
  "banner": {
    "menit": 10,
    "siang": [
      { "tampil": true, "berkas": "banner-balikpapan.jpg", "posisi": 72, "uraian": "Pemandangan Teluk Balikpapan saat matahari terbit dengan gedung kota, pelabuhan, kapal, dan hutan mangrove" },
      { "tampil": true, "berkas": "banner-masjid.jpg", "posisi": 70, "uraian": "Masjid berkubah biru dengan empat menara di tengah kota, berlatar teluk dan perbukitan" },
      { "tampil": true, "berkas": "banner-taman.jpg", "posisi": 51, "uraian": "Taman kota dengan air mancur di tengah, dikelilingi pohon palem dan gedung perkantoran" },
      { "tampil": true, "berkas": "banner-pantai.jpg", "posisi": 24, "uraian": "Jalur pejalan kaki di tepi pantai dengan pohon palem, bebatuan, dan gedung kota di kejauhan" },
      { "tampil": true, "berkas": "banner-enggang.jpg", "posisi": 19, "uraian": "Burung enggang terbang di atas hutan hujan berkabut dengan kota dan teluk saat matahari terbit" },
      { "tampil": true, "berkas": "banner-beruang.jpg", "posisi": 94, "uraian": "Beruang madu di lereng hutan hujan memandang kota dan teluk saat matahari terbit" }
    ],
    "malam": [
      { "tampil": true, "berkas": "banner-malam-teluk.jpg", "posisi": 28, "uraian": "Teluk Balikpapan pada malam hari dengan lampu kota di perbukitan dan pantulan cahaya di air" },
      { "tampil": true, "berkas": "banner-malam-tepian.jpg", "posisi": 22, "uraian": "Jalur pejalan kaki tepi laut pada malam hari dengan pohon palem, lampu taman, dan gedung kota di kejauhan" },
      { "tampil": true, "berkas": "banner-malam-pelabuhan.jpg", "posisi": 72, "uraian": "Pelabuhan dan kilang di teluk pada malam hari dengan kapal-kapal berlampu" },
      { "tampil": true, "berkas": "banner-malam-jalan.jpg", "posisi": 20, "uraian": "Jalan tepi pantai yang basah sehabis hujan pada malam hari dengan lampu jalan dan pohon palem" }
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

  // Melengkapi isi yang kurang dengan bawaan, supaya isi lama dari Apps Script tetap bisa dipakai.
  function rapikan(k) {
    var b = window.KONTEN_BAWAAN;
    if (!k || typeof k !== "object") return salin(b);
    var hasil = salin(k);
    hasil.umum = Object.assign({}, salin(b.umum), hasil.umum || {});
    hasil.umum.gerbang = Object.assign({}, b.umum.gerbang, (k.umum && k.umum.gerbang) || {});
    ["info", "kelompok", "tautan"].forEach(function (n) { if (!Array.isArray(hasil[n])) hasil[n] = salin(b[n]); });
    hasil.banner = Object.assign({}, salin(b.banner), hasil.banner || {});
    ["siang", "malam"].forEach(function (n) { if (!Array.isArray(hasil.banner[n])) hasil.banner[n] = salin(b.banner[n]); });
    return hasil;
  }

  function slug(teks) {
    return polos(teks).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 40) || "kelompok";
  }

  return { isiTeks: isiTeks, polos: polos, alamatAman: alamatAman, luar: luar, salin: salin, rapikan: rapikan, slug: slug };
})();
