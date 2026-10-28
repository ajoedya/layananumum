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
      if (dari && !tanpaGerak && !kurangGerak && pil.animate && (dari.x !== ke.x || dari.y !== ke.y || dari.w !== ke.w || dari.h !== ke.h)) {
        pil.animate([
          { width: dari.w + "px", height: dari.h + "px", transform: "translate(" + dari.x + "px," + dari.y + "px)" },
          { width: ke.w + "px", height: ke.h + "px", transform: "translate(" + ke.x + "px," + ke.y + "px)" }
        ], { duration: 420, easing: "cubic-bezier(.22,.61,.36,1)" });
      }
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

  window.Gerak = { pilMenu: pilMenu };
})();
