/* ============================================================
   Banner bersama Layanan Subbagian Umum
   Dipakai Olah PDF dan Dashboard Anggaran supaya fotonya sama dengan beranda.
   Aturannya sama dengan beranda (index.html, bagian "Banner berganti"):
   - daftar foto diambil dari isi beranda yang terakhir tersimpan di peramban ini
     (kunci "layanan-konten", diisi beranda dari dasbor admin), atau dari KONTEN_BAWAAN di konten.js;
   - foto berganti tiap `menit` menit (bawaan 360 menit atau 6 jam) mengikuti jam perangkat, jadi semua halaman
     menampilkan foto yang sama pada waktu yang sama;
   - di mode gelap dipakai daftar malam.
   Nama berkas relatif dihitung dari folder beranda (DASAR), lalu diubah menjadi alamat lengkap,
   jadi aman dipakai dari subfolder maupun dari berkas yang dibuka langsung di komputer.

   Pemakaian:
     BannerBersama.mulai(function (b) { ... b.url, b.posisi (0-100), b.uraian ... });
   ============================================================ */
(function () {
  "use strict";
  if (window.BannerBersama) return;

  var KUNCI_SIMPAN = "layanan-konten";
  var ALAMAT_SITUS = "https://ajoedya.github.io/layananumum/";

  // Folder beranda. Di situs: folder induk dari halaman ini (berkas ini ada di akar situs).
  // Dari berkas lokal (file:), atau bila skrip disisipkan langsung ke halaman: alamat situs publik.
  // Halaman yang menyisipkan skrip ini langsung (Dashboard Anggaran) menetapkan window.BANNER_DASAR sendiri.
  function dasar() {
    if (location.protocol === "file:") return ALAMAT_SITUS;
    if (window.BANNER_DASAR) return window.BANNER_DASAR;
    var s = document.currentScript || document.querySelector('script[src$="banner.js"]');
    if (s && s.src) return s.src.replace(/banner\.js(\?.*)?$/, "");
    return ALAMAT_SITUS;
  }
  var DASAR = dasar();

  function alamatAman(a) {
    a = String(a || "").trim();
    if (!a) return "";
    if (/^https:\/\//i.test(a)) return a;
    if (/^[a-z][a-z0-9+.-]*:/i.test(a) || a.indexOf("//") === 0) return "";
    try { return new URL(a, DASAR).href; } catch (e) { return ""; }
  }

  function konfigurasi() {
    var simpan = null;
    try { var t = localStorage.getItem(KUNCI_SIMPAN); simpan = t ? JSON.parse(t) : null; } catch (e) { simpan = null; }
    var bawaan = (window.KONTEN_BAWAAN && window.KONTEN_BAWAAN.banner) || window.BANNER_CADANGAN || {};
    var b = (simpan && simpan.banner) || {};
    // Simpanan untuk koleksi banner lama diabaikan, supaya foto lama tidak muncul lagi.
    if (b.koleksi !== bawaan.koleksi) b = {};
    return {
      menit: b.menit || bawaan.menit || 360,
      siang: Array.isArray(b.siang) ? b.siang : (bawaan.siang || []),
      malam: Array.isArray(b.malam) ? b.malam : (bawaan.malam || [])
    };
  }

  function daftarAktif(k) {
    var gelap = document.documentElement.getAttribute("data-mode") === "gelap";
    var pilih = function (d) { return (d || []).filter(function (x) { return x && x.tampil !== false && alamatAman(x.berkas); }); };
    var d = pilih(gelap ? k.malam : k.siang);
    return d.length ? d : pilih(gelap ? k.siang : k.malam);
  }

  function waktuSetempat(kini) { return kini.getTime() - kini.getTimezoneOffset() * 60000; }

  function mulai(pasang) {
    var terpasang = "", pewaktu = null;
    function jeda() { return Math.max(1, Number(konfigurasi().menit) || 360) * 60000; }
    function sekarang() {
      var k = konfigurasi(), d = daftarAktif(k);
      if (!d.length) return null;
      var b = d[Math.floor(waktuSetempat(new Date()) / jeda()) % d.length];
      return { url: alamatAman(b.berkas), posisi: Number(b.posisi) || 50, uraian: b.uraian || "" };
    }
    function segarkan() {
      var b = sekarang();
      if (!b) return;
      var kunci = b.url + "|" + b.posisi;
      if (kunci === terpasang) return;
      if (terpasang === "") { terpasang = kunci; pasang(b, true); return; }
      // Halaman yang dibiarkan terbuka: muat gambarnya dulu supaya pergantiannya tidak berkedip.
      var muat = new Image();
      muat.onload = muat.onerror = function () { terpasang = kunci; pasang(b, false); };
      muat.src = b.url;
    }
    function jadwalkan() {
      clearTimeout(pewaktu);
      var j = jeda();
      pewaktu = setTimeout(function () { segarkan(); jadwalkan(); }, j - (waktuSetempat(new Date()) % j) + 1000);
    }
    document.addEventListener("modeberubah", segarkan);
    document.addEventListener("visibilitychange", function () { if (!document.hidden) segarkan(); });
    // Atribut data-mode juga dipantau langsung, untuk halaman yang tidak mengirim peristiwa "modeberubah".
    if (window.MutationObserver) {
      new MutationObserver(segarkan).observe(document.documentElement, { attributes: true, attributeFilter: ["data-mode"] });
    }
    segarkan();
    jadwalkan();
  }

  window.BannerBersama = { mulai: mulai, alamatAman: alamatAman };
})();
