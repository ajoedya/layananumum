/* ============================================================
   Penyesuaian kecil untuk halaman di folder beta/.
   Halaman beta memakai <base href="../"> supaya tema, gaya, banner, dan
   menu bersama dipakai apa adanya. Berkas ini hanya mengarahkan tautan
   menu ke versi beta yang sudah ada, dan memberi tanda "Beta" di menu.
   Dimuat SESUDAH bersama.js.
   ============================================================ */
(function () {
  "use strict";

  // Perkakas yang sudah punya tata letak beta. Tambahkan di sini bila ada lagi.
  var ADA_DI_BETA = [];
  // Perkakas yang dilebur di beta: tautan lama diarahkan ke perkakas gabungannya.
  var DILEBUR = {};

  function sesuaikan() {
    var menu = document.querySelector(".menu-isi");
    if (!menu) return;

    var merek = menu.querySelector(".menu-nama");
    var beranda = menu.querySelector(".menu-beranda");
    if (merek) merek.setAttribute("href", "beta/");
    if (beranda) beranda.setAttribute("href", "beta/");

    menu.querySelectorAll(".menu-dropdown-content a").forEach(function (a) {
      var tujuan = a.getAttribute("href");
      if (Object.prototype.hasOwnProperty.call(DILEBUR, tujuan)) {
        var lebur = DILEBUR[tujuan];
        if (!lebur) { a.remove(); return; }
        a.setAttribute("href", "beta/" + lebur.ke);
        a.textContent = lebur.nama;
        if (/gabung-pecah$/.test(location.pathname.replace(/\.html?$/, ""))) {
          a.classList.add("aktif"); a.setAttribute("aria-current", "page");
        }
        return;
      }
      if (ADA_DI_BETA.indexOf(tujuan) !== -1) a.setAttribute("href", "beta/" + tujuan);
    });

    if (!menu.querySelector(".menu-beta")) {
      var tanda = document.createElement("a");
      tanda.className = "menu-beta";
      tanda.href = "./";
      tanda.textContent = "Beta";
      tanda.title = "Versi beta. Klik untuk kembali ke versi stabil.";
      tanda.setAttribute("aria-label", "Versi beta, kembali ke versi stabil");
      tanda.style.cssText = "font-size:12px;font-weight:700;letter-spacing:.12em;text-transform:uppercase;" +
        "color:var(--emas-teks);border:1px solid var(--emas-garis);border-radius:999px;padding:6px 12px;" +
        "text-decoration:none;white-space:nowrap";
      menu.insertBefore(tanda, beranda || null);
    }
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", sesuaikan);
  else sesuaikan();
})();
