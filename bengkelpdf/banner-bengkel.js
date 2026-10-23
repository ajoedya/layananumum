/* Banner Bengkel PDF mengikuti beranda Layanan Subbagian Umum.
   ../banner.js memilih foto yang sama dengan beranda pada waktu yang sama; berkas ini memasangnya
   ke variabel --banner yang dipakai gaya.css (kop halaman perkakas) dan foto panel beranda Bengkel PDF.
   Dimuat di <head> sesudah tema.js, jadi foto sudah benar sejak halaman pertama kali digambar. */
(function () {
  "use strict";
  if (!window.BannerBersama) return;
  var akar = document.documentElement;
  var uraian = "";
  function labeli() {
    var g = document.querySelector("[data-banner-tema]");
    if (g && uraian) g.setAttribute("aria-label", uraian);
  }
  window.BannerBersama.mulai(function (b) {
    var posisi = b.posisi + "% center";
    akar.style.setProperty("--banner", 'url("' + b.url.replace(/"/g, "%22") + '")');
    akar.style.setProperty("--banner-latar-posisi", posisi);
    akar.style.setProperty("--banner-kop-posisi", posisi);
    akar.style.setProperty("--banner-pita-posisi", posisi);
    akar.style.setProperty("--banner-posisi-bersama", posisi);
    uraian = b.uraian;
    labeli();
  });
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", labeli);
})();
