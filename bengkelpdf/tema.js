/* ============================================================
   Tema Olah PDF
   Berkas kecil ini dimuat di <head> setiap halaman, SEBELUM gaya.css, supaya
   tema sudah terpasang saat halaman pertama kali digambar (tidak berkedip
   dari tema bawaan).

   Tema dipilih otomatis secara acak setiap kali situs dikunjungi. Selama
   kunjungan itu (satu tab peramban), semua halaman memakai tema yang sama,
   dan kunjungan berikutnya diusahakan mendapat banner yang berbeda.

   Warna dan gambar tiap tema ada di gaya.css, bagian "Tema". Mode terang
   dan gelap diatur di bagian bawah berkas ini.
   Menambah tema: unggah bannernya, tambahkan satu baris di DAFTAR, lalu buat
   blok :root[data-tema="id-nya"] di gaya.css. Tema baru langsung ikut diundi.
   ============================================================ */
(function () {
  "use strict";

  var KUNCI_SESI = "bengkel-tema-sesi";        // tema kunjungan yang sedang berjalan
  var KUNCI_TERAKHIR = "bengkel-tema-terakhir"; // tema kunjungan sebelumnya
  var BAWAAN = "pelabuhan";

  // gambar: uraian banner untuk pembaca layar.
  var DAFTAR = [
    { id: "pelabuhan", nama: "Pelabuhan Senja",
      gambar: "Pemandangan teluk saat matahari terbenam dengan perbukitan, gedung kota, dermaga, kilang, dan kapal" },
    { id: "hutan", nama: "Hutan Hujan",
      gambar: "Hutan hujan berkabut di tepi sungai saat matahari terbit, dengan orang utan di dahan pohon" },
    { id: "mangrove", nama: "Mangrove",
      gambar: "Jembatan kayu dan pondok di hutan mangrove saat senja, dengan bekantan di dahan dan kilang di kejauhan" },
    { id: "tongkang", nama: "Tongkang Batu Bara",
      gambar: "Kapal tunda menarik tongkang bermuatan batu bara di teluk, dengan dermaga muat dan kota di perbukitan" },
    { id: "tepian", nama: "Tepian Kota",
      gambar: "Jalan dan taman tepi laut berpohon palem di kota pesisir, dengan gedung tinggi dan dermaga di kejauhan" },
    { id: "kilang", nama: "Kilang",
      gambar: "Menara dan jaringan pipa kilang minyak di siang hari, dengan teluk dan perbukitan di belakangnya" }
  ];

  function cari(id) {
    for (var i = 0; i < DAFTAR.length; i++) if (DAFTAR[i].id === id) return DAFTAR[i];
    return null;
  }

  // Penyimpanan bisa ditolak (mode privat, kuki diblokir); tema tetap jalan.
  function baca(tempat, kunci) {
    try { return window[tempat].getItem(kunci); } catch (e) { return null; }
  }
  function tulis(tempat, kunci, nilai) {
    try { window[tempat].setItem(kunci, nilai); } catch (e) { /* abaikan */ }
  }

  function undi() {
    var terakhir = baca("localStorage", KUNCI_TERAKHIR);
    var calon = DAFTAR.filter(function (t) { return t.id !== terakhir; });
    if (!calon.length) calon = DAFTAR;
    return calon[Math.floor(Math.random() * calon.length)].id;
  }

  // Memasang tema pada <html>. Tema bawaan tidak memakai atribut sama sekali.
  function pasang(id) {
    var tema = cari(id) || cari(BAWAAN);
    var akar = document.documentElement;
    if (tema.id === BAWAAN) akar.removeAttribute("data-tema");
    else akar.setAttribute("data-tema", tema.id);
    // Uraian gambar banner di beranda ikut berganti.
    var gambar = document.querySelector("[data-banner-tema]");
    if (gambar) gambar.setAttribute("aria-label", tema.gambar);
    return tema;
  }

  // Sejak banner diseragamkan dengan beranda Layanan Subbagian Umum (lihat ../banner.js),
  // tema dikunci ke tema bawaan navy-emas. Pengundian tema acak tidak dipakai lagi,
  // tetapi fungsinya dibiarkan supaya mudah dipulihkan bila kelak dibutuhkan.
  var id = BAWAAN;
  var kini = pasang(id);

  /* ---------- Mode terang dan gelap ----------
     Bawaannya mengikuti tema perangkat (prefers-color-scheme). Bila pengguna
     menekan tombol mode di menu atas, pilihannya disimpan di peramban itu dan
     dipakai seterusnya, termasuk untuk semua halaman alat.
     Mode dipasang lewat atribut data-mode="gelap" pada <html>; warnanya ada di
     gaya.css, bagian "Mode gelap". */
  var KUNCI_MODE = "layanan-mode";
  var media = window.matchMedia ? window.matchMedia("(prefers-color-scheme: dark)") : null;

  function modePerangkat() { return media && media.matches ? "gelap" : "terang"; }
  function modeTersimpan() {
    var m = baca("localStorage", KUNCI_MODE);
    return m === "gelap" || m === "terang" ? m : null;
  }
  function pasangMode(m) {
    var akar = document.documentElement;
    if (m === "gelap") akar.setAttribute("data-mode", "gelap");
    else akar.removeAttribute("data-mode");
    akar.style.colorScheme = m === "gelap" ? "dark" : "light";
    // Tombol mode di menu atas ikut diperbarui bila sudah terpasang.
    var tombol = document.querySelectorAll("[data-tombol-mode]");
    for (var i = 0; i < tombol.length; i++) {
      tombol[i].setAttribute("aria-pressed", m === "gelap" ? "true" : "false");
      tombol[i].setAttribute("aria-label", m === "gelap" ? "Ganti ke tampilan terang" : "Ganti ke tampilan gelap");
      tombol[i].title = m === "gelap" ? "Tampilan terang" : "Tampilan gelap";
    }
    return m;
  }

  var mode = pasangMode(modeTersimpan() || modePerangkat());

  // Selama pengguna belum memilih sendiri, ikuti perubahan tema perangkat.
  if (media) {
    var ikuti = function () { if (!modeTersimpan()) mode = pasangMode(modePerangkat()); };
    if (media.addEventListener) media.addEventListener("change", ikuti);
    else if (media.addListener) media.addListener(ikuti);
  }


  // Efek lingkaran: tema baru melebar dari tombol yang ditekan (View Transitions API).
  // Tanpa dukungan peramban, atau bila pengguna mengurangi gerak, mode berganti langsung.
  function lingkar(terapkan) {
    var kurang = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!document.startViewTransition || kurang) { terapkan(); return; }
    var t = document.activeElement && document.activeElement.closest ? document.activeElement.closest("[data-tombol-mode]") : null;
    if (!t) { var a = document.querySelectorAll("[data-tombol-mode]"); for (var i = 0; i < a.length; i++) if (a[i].offsetParent) { t = a[i]; break; } }
    var r = t ? t.getBoundingClientRect() : { left: window.innerWidth / 2, top: 0, width: 0, height: 0 };
    var x = r.left + r.width / 2, y = r.top + r.height / 2;
    var radius = Math.hypot(Math.max(x, window.innerWidth - x), Math.max(y, window.innerHeight - y));
    var gaya = document.createElement("style");
    gaya.textContent = "::view-transition-old(root),::view-transition-new(root){animation:none;mix-blend-mode:normal}::view-transition-new(root){z-index:2}";
    document.head.appendChild(gaya);
    var bersih = function () { gaya.remove(); };
    var vt;
    try { vt = document.startViewTransition(terapkan); } catch (e) { bersih(); terapkan(); return; }
    vt.ready.then(function () {
      document.documentElement.animate(
        { clipPath: ["circle(0px at " + x + "px " + y + "px)", "circle(" + radius + "px at " + x + "px " + y + "px)"] },
        { duration: 650, easing: "cubic-bezier(.22,.61,.36,1)", pseudoElement: "::view-transition-new(root)" });
    }).catch(function () { /* abaikan */ });
    vt.finished.then(bersih, bersih);
  }

  window.Tema = {
    daftar: DAFTAR,
    kini: function () { return kini.id; },
    mode: function () { return mode; },
    // Dipanggil tombol mode: berganti mode dan mengingat pilihan pengguna.
    // Bila hasilnya sama dengan tema perangkat, pilihan dihapus supaya situs
    // kembali mengikuti perangkat.
    alihMode: function () {
      mode = mode === "gelap" ? "terang" : "gelap";
      if (mode === modePerangkat()) {
        try { localStorage.removeItem(KUNCI_MODE); } catch (e) { /* abaikan */ }
      } else {
        tulis("localStorage", KUNCI_MODE, mode);
      }
      var baru = mode;
      lingkar(function () { pasangMode(baru); });
      return baru;
    },
    // Dipanggil sekali setelah halaman selesai dimuat, agar uraian gambar ikut terpasang.
    segarkan: function () { kini = pasang(kini.id); pasangMode(mode); }
  };
})();
