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

  /* Gerak cair: pil bergerak seperti tetesan. Ujung depan menjulur lalu melar sampai menu tujuan (pil memanjang, menipis,
     dan ujungnya membulat), lalu ujung belakang menyusul, memantul, dan pil kembali ke ukuran menu. Sumbu gerak mengikuti arah
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
    var sudut = getComputedStyle(pil).borderRadius || "12px";
    function bingkai(x, y, w, h, r) { return { width: w + "px", height: h + "px", transform: "translate(" + x + "px," + y + "px)", borderRadius: r || sudut }; }
    var awal = bingkai(dari.x, dari.y, dari.w, dari.h), akhir = bingkai(ke.x, ke.y, ke.w, ke.h), tarik, melar, pantul;
    if (tegak) {
      var atas = Math.min(dari.y, ke.y), bawah = Math.max(dari.y + dari.h, ke.y + ke.h), w = Math.min(dari.w, ke.w);
      var susut = Math.min(14, w * 0.09), jarak = Math.abs(ke.y - dari.y);
      // Tarik: ujung depan mulai menjulur sepertiga jalan, badan sedikit menipis, ujung belakang masih di tempat.
      tarik = maju ? bingkai(dari.x + susut / 2, dari.y, dari.w - susut, dari.h + jarak * 0.35, "999px")
                   : bingkai(dari.x + susut / 2, dari.y - jarak * 0.35, dari.w - susut, dari.h + jarak * 0.35, "999px");
      // Melar: cairan membentang dari menu lama sampai menu baru, paling ramping di tengah perjalanan.
      melar = bingkai((maju ? dari.x : ke.x) + susut, atas, w - susut * 2, bawah - atas, "999px");
      // Pantul: ujung depan sedikit kelewatan, badan melebar dan memipih, lalu kembali ke ukuran menu.
      var lebih = Math.min(7, ke.h * 0.16);
      pantul = bingkai(ke.x - 3, ke.y + (maju ? lebih : -lebih), ke.w + 6, ke.h - lebih);
    } else {
      var kiri = Math.min(dari.x, ke.x), kanan = Math.max(dari.x + dari.w, ke.x + ke.w), h = Math.min(dari.h, ke.h);
      var susutH = Math.min(8, h * 0.14), jarakX = Math.abs(ke.x - dari.x);
      tarik = maju ? bingkai(dari.x, dari.y + susutH / 2, dari.w + jarakX * 0.35, dari.h - susutH, "999px")
                   : bingkai(dari.x - jarakX * 0.35, dari.y + susutH / 2, dari.w + jarakX * 0.35, dari.h - susutH, "999px");
      melar = bingkai(kiri, (maju ? dari.y : ke.y) + susutH, kanan - kiri, h - susutH * 2, "999px");
      var lebihX = Math.min(10, ke.w * 0.08);
      pantul = bingkai(ke.x + (maju ? lebihX : -lebihX), ke.y - 2, ke.w - lebihX, ke.h + 4);
    }
    awal.easing = "cubic-bezier(.5,0,.75,.4)";
    tarik.offset = 0.2; tarik.easing = "cubic-bezier(.3,.2,.3,1)";
    melar.offset = 0.5; melar.easing = "cubic-bezier(.4,0,.2,1)";
    pantul.offset = 0.78; pantul.easing = "cubic-bezier(.35,1.4,.5,1)";
    pil._gerak = pil.animate([awal, tarik, melar, pantul, akhir], { duration: 760 });
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
