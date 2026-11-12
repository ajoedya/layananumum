/* ============================================================
   Gerak bersama: pil emas yang bergeser mulus antar menu
   Beranda memakai pil ini untuk menu kelompok di panel kiri. Berkas ini memberi gerakan yang sama pada halaman turunan
   (menu kelompok Olah PDF dan tab panel Monitoring Realisasi Anggaran) tanpa mengubah cara tiap halaman menandai menu aktif:
   pil hanya memantau atribut penanda (bawaan aria-current) dan berpindah ke butir yang ditandai. Gayanya ada di gerak.css.

   Pemakaian:
     Gerak.pilMenu(document.getElementById("menuKelompok"));
     Gerak.pilMenu(document.querySelector("nav.tab"), { aktif: 'button[aria-selected="true"]', atribut: ["aria-selected"] });
   Tanpa JavaScript, atau bila halaman tidak memanggilnya, menu tetap memakai penanda aktif bawaan halaman.
   ============================================================ */
(function () {
  "use strict";
  if (window.Gerak) return;

  var kurangGerak = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* Gerak cair: pil bergerak seperti tetesan. Ujung depan melar lebih dulu sampai menu tujuan (pil memanjang dan sedikit
     menipis), lalu ujung belakang menyusul, sedikit memantul, dan pil kembali ke ukuran menu. Sumbu gerak mengikuti arah
     perpindahan terbesar, jadi berlaku untuk menu tegak (panel kiri) maupun mendatar (chip di layar sempit).
     Bila pil sedang bergerak lalu tujuan berubah lagi (misalnya saat menggulir cepat), gerak baru dimulai dari posisi pil
     yang sedang terlihat, bukan melompat dari tujuan lama. */
  function animasiCair(pil, dari, ke) {
    if (!pil.animate) return;
    if (pil._gerak && pil._gerak.playState === "running") {
      var r = pil.getBoundingClientRect(), induk = pil.offsetParent;
      if (induk) {
        var ri = induk.getBoundingClientRect();
        dari = { x: r.left - ri.left - induk.clientLeft + induk.scrollLeft, y: r.top - ri.top - induk.clientTop + induk.scrollTop, w: r.width, h: r.height };
      }
      pil._gerak.cancel();
    }
    var tegak = Math.abs(ke.y - dari.y) >= Math.abs(ke.x - dari.x);
    var maju = tegak ? ke.y > dari.y : ke.x > dari.x;
    function bingkai(x, y, w, h) { return { width: w + "px", height: h + "px", transform: "translate(" + x + "px," + y + "px)" }; }
    var awal = bingkai(dari.x, dari.y, dari.w, dari.h), akhir = bingkai(ke.x, ke.y, ke.w, ke.h), melar, pantul;
    if (tegak) {
      // Melar: rentang dari tepi lama sampai tepi baru, sedikit lebih ramping di sisi kiri dan kanan.
      var atas = Math.min(dari.y, ke.y), bawah = Math.max(dari.y + dari.h, ke.y + ke.h), w = Math.min(dari.w, ke.w), susut = Math.min(6, w * 0.04);
      melar = bingkai((maju ? dari.x : ke.x) + susut, atas, w - susut * 2, bawah - atas);
      // Pantul: sedikit melewati tujuan searah gerak, lalu memipih.
      var lebih = Math.min(4, ke.h * 0.1);
      pantul = bingkai(ke.x - 1, ke.y + (maju ? lebih : -lebih), ke.w + 2, ke.h - lebih);
    } else {
      var kiri = Math.min(dari.x, ke.x), kanan = Math.max(dari.x + dari.w, ke.x + ke.w), h = Math.min(dari.h, ke.h), susutH = Math.min(4, h * 0.08);
      melar = bingkai(kiri, (maju ? dari.y : ke.y) + susutH, kanan - kiri, h - susutH * 2);
      var lebihX = Math.min(6, ke.w * 0.06);
      pantul = bingkai(ke.x + (maju ? lebihX : -lebihX), ke.y - 1, ke.w - lebihX, ke.h + 2);
    }
    melar.offset = 0.42; melar.easing = "cubic-bezier(.3,0,.2,1)";
    pantul.offset = 0.78; pantul.easing = "cubic-bezier(.3,.7,.4,1)";
    awal.easing = "cubic-bezier(.55,0,.35,1)";
    pil._gerak = pil.animate([awal, melar, pantul, akhir], { duration: 620 });
  }

  function pilMenu(menu, opsi) {
    if (!menu || menu._pil) return;
    opsi = opsi || {};
    var penandaAktif = opsi.aktif || 'a[aria-current="true"]';
    var atribut = opsi.atribut || ["aria-current"];
    var pil = document.createElement("span");
    pil.className = "pil-menu"; pil.setAttribute("aria-hidden", "true"); pil.hidden = true;
    menu._pil = pil;
    menu.classList.add("pil-aktif");

    var terakhir = null;
    function geser(tanpaGerak) {
      var a = menu.querySelector(penandaAktif);
      if (!pil.parentNode) menu.appendChild(pil);
      // Menu yang sedang tersembunyi (misalnya panel yang menyusut) belum punya ukuran; pil menunggu sampai menu tampak.
      if (!a || !a.offsetWidth) { pil.hidden = true; terakhir = null; return; }
      pil.hidden = false;
      var ke = { x: a.offsetLeft, y: a.offsetTop, w: a.offsetWidth, h: a.offsetHeight }, dari = terakhir;
      pil.style.width = ke.w + "px"; pil.style.height = ke.h + "px"; pil.style.transform = "translate(" + ke.x + "px," + ke.y + "px)";
      pil.style.borderRadius = getComputedStyle(a).borderRadius;
      if (dari && !tanpaGerak && !kurangGerak && (dari.x !== ke.x || dari.y !== ke.y || dari.w !== ke.w || dari.h !== ke.h)) animasiCair(pil, dari, ke);
      terakhir = ke;
    }

    if (window.MutationObserver) {
      new MutationObserver(function (daftar) {
        // Penambahan pil sendiri tidak perlu memicu hitung ulang.
        var perlu = daftar.some(function (m) { return m.type === "attributes" || Array.prototype.some.call(m.addedNodes, function (n) { return n !== pil; }); });
        if (perlu) geser(false);
      }).observe(menu, { attributes: true, attributeFilter: atribut, subtree: true, childList: true });
    }
    if (window.ResizeObserver) new ResizeObserver(function () { geser(true); }).observe(menu);
    window.addEventListener("resize", function () { geser(true); });
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { geser(true); });
    geser(true);
  }

  window.Gerak = { pilMenu: pilMenu, animasiCair: animasiCair };
})();
