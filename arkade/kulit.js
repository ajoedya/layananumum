/* Kulit arkade untuk halaman turunan (Monitoring E-Perjadin, Monitoring Realisasi, Olah PDF).
   Hanya aktif selama pengunjung memilih mode arkade (localStorage "layanan-arkade" bernilai "1",
   dipilih lewat beruang di beranda). Dimuat di <head> sesudah skrip tema halaman:
   - memasang kelas "arkade" pada <html> (mode terang dan gelap tetap mengikuti saklar tema),
   - memuat huruf piksel dan kulit.css,
   - mengganti foto panel dengan adegan beruang madu piksel (banner-beruang.js).
   ?mode=biasa mengembalikan tampilan biasa. */
(function () {
  "use strict";
  try {
    // Versi pertama sempat menyimpan pilihan ini di "layanan-mode", kunci milik tema terang/gelap. Dipindahkan sekali.
    var lama = localStorage.getItem("layanan-mode");
    if (lama === "arkade" || lama === "biasa") { if (lama === "arkade") localStorage.setItem("layanan-arkade", "1"); localStorage.removeItem("layanan-mode"); }
    if (/[?&]mode=biasa\b/.test(location.search)) { localStorage.removeItem("layanan-arkade"); return; }
    if (localStorage.getItem("layanan-arkade") !== "1") return;
  } catch (e) { return; }

  var skrip = document.currentScript;
  var dasar = skrip ? skrip.src.replace(/kulit\.js(\?.*)?$/, "") : "../arkade/";
  document.documentElement.classList.add("arkade");

  function gaya(alamat) { var l = document.createElement("link"); l.rel = "stylesheet"; l.href = dasar + alamat; document.head.appendChild(l); }
  gaya("huruf/pixelify-sans.css");
  gaya("kulit.css");
  // Transisi tema piksel; skrip tema halaman memakainya bila tersedia.
  var tp = document.createElement("script"); tp.src = dasar + "tema-piksel.js"; document.head.appendChild(tp);

  var diam = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
  var s = document.createElement("script");
  s.src = dasar + "banner-beruang.js";
  s.onload = function () { if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", pasang); else pasang(); };
  document.head.appendChild(s);

  // Adegan beruang dipasang di wadah foto panel tiap halaman.
  function pasang() {
    var wadah = [].slice.call(document.querySelectorAll(".panel-foto, #latarFoto, .rk-foto"));
    var kop = document.querySelector(".halaman-alat .kop");
    if (kop) { var f = document.createElement("div"); f.className = "arkade-kop-foto"; f.setAttribute("aria-hidden", "true"); kop.insertBefore(f, kop.firstChild); wadah.push(f); }
    wadah.forEach(function (w) {
      var c = document.createElement("canvas");
      c.className = "arkade-adegan";
      c.setAttribute("aria-hidden", "true");
      w.appendChild(c);
      if (window.BannerBeruang) BannerBeruang(c, { diam: diam });
    });
    var pindai = document.createElement("div");
    pindai.className = "arkade-pindai";
    pindai.setAttribute("aria-hidden", "true");
    document.body.appendChild(pindai);
  }
})();
