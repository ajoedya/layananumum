/* ============================================================
   Mode terang dan gelap Layanan Subbagian Umum
   Berkas ini dimuat di <head> setiap halaman, sebelum gaya halaman, supaya
   mode sudah terpasang saat halaman pertama kali digambar (tidak berkedip).

   Bawaannya mengikuti tema perangkat (prefers-color-scheme). Bila pengguna
   menekan saklar tema, pilihannya disimpan di peramban itu dan dipakai
   seterusnya di semua halaman. Bila pilihannya sama dengan tema perangkat,
   simpanan dihapus supaya situs kembali mengikuti perangkat.

   Mode dipasang lewat atribut data-mode="gelap" pada <html>. Warnanya ada di
   gaya tiap halaman, bagian "Mode gelap". Cara kerjanya sama dengan Olah PDF.
   ============================================================ */
(function () {
  "use strict";

  var KUNCI_MODE = "layanan-mode";
  var media = window.matchMedia ? window.matchMedia("(prefers-color-scheme: dark)") : null;

  // Penyimpanan bisa ditolak (mode privat, kuki diblokir); saklar tetap jalan.
  function baca() { try { return localStorage.getItem(KUNCI_MODE); } catch (e) { return null; } }
  function tulis(m) { try { localStorage.setItem(KUNCI_MODE, m); } catch (e) { /* abaikan */ } }
  function hapus() { try { localStorage.removeItem(KUNCI_MODE); } catch (e) { /* abaikan */ } }

  function modePerangkat() { return media && media.matches ? "gelap" : "terang"; }
  function modeTersimpan() { var m = baca(); return m === "gelap" || m === "terang" ? m : null; }

  function pasangMode(m) {
    var akar = document.documentElement;
    if (m === "gelap") akar.setAttribute("data-mode", "gelap");
    else akar.removeAttribute("data-mode");
    akar.style.colorScheme = m === "gelap" ? "dark" : "light";
    // Saklar tema ikut diperbarui bila sudah ada di halaman.
    var tombol = document.querySelectorAll("[data-tombol-mode]");
    for (var i = 0; i < tombol.length; i++) {
      tombol[i].setAttribute("aria-pressed", m === "gelap" ? "true" : "false");
      tombol[i].setAttribute("aria-label", m === "gelap" ? "Ganti ke tampilan terang" : "Ganti ke tampilan gelap");
      tombol[i].title = m === "gelap" ? "Tampilan terang" : "Tampilan gelap";
    }
    // Halaman diberi tahu supaya bisa menyesuaikan diri, misalnya mengganti banner siang dengan banner malam.
    try { document.dispatchEvent(new CustomEvent("modeberubah", { detail: m })); } catch (e) { /* peramban lama */ }
    return m;
  }

  var mode = pasangMode(modeTersimpan() || modePerangkat());

  // Selama pengguna belum memilih sendiri, ikuti perubahan tema perangkat.
  if (media) {
    var ikuti = function () { if (!modeTersimpan()) mode = pasangMode(modePerangkat()); };
    if (media.addEventListener) media.addEventListener("change", ikuti);
    else if (media.addListener) media.addListener(ikuti);
  }

  // Saklar tema dipasang setelah halaman selesai dimuat.
  document.addEventListener("DOMContentLoaded", function () {
    var tombol = document.querySelectorAll("[data-tombol-mode]");
    for (var i = 0; i < tombol.length; i++) {
      tombol[i].addEventListener("click", function () { window.Tema.alihMode(); });
    }
    pasangMode(mode);
  });


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
    mode: function () { return mode; },
    alihMode: function () {
      mode = mode === "gelap" ? "terang" : "gelap";
      if (mode === modePerangkat()) hapus(); else tulis(mode);
      var baru = mode;
      lingkar(function () { pasangMode(baru); });
      return baru;
    }
  };
})();
