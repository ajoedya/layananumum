/* ============================================================
   Gerak bersama: pil emas yang mengalir seperti tetes kental antar menu
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

  /* Gerak cair "tetes kental": pil bergerak seperti tetesan madu. Kepala melesat ke menu tujuan, ekor tertinggal, dan
     keduanya tersambung leher yang makin tipis; bila jaraknya jauh, leher putus menjadi dua tetes lalu menyatu kembali.
     Kepala, ekor, dan leher digambar di lapisan sementara yang dilebur filter SVG (kabur lalu dipertegas), jadi tepinya
     menyatu seperti cairan. Selama bergerak pil asli disembunyikan; setelah tenang lapisan dilepas dan pil asli tampil lagi.
     Posisi digerakkan pegas teredam (bukan durasi tetap), jadi bila tujuan berubah di tengah jalan (misalnya saat menggulir
     cepat) tetesan langsung berbelok dari posisinya sekarang. Pemanggil sudah menaruh pil asli di tujuan sebelum memanggil. */
  var ID_LEBUR = "gerak-lebur";
  function pasangFilter() {
    if (document.getElementById(ID_LEBUR)) return;
    var ns = "http://www.w3.org/2000/svg", svg = document.createElementNS(ns, "svg");
    svg.setAttribute("width", "0"); svg.setAttribute("height", "0"); svg.setAttribute("aria-hidden", "true"); svg.setAttribute("focusable", "false");
    svg.style.position = "absolute"; svg.style.width = "0"; svg.style.height = "0"; svg.style.overflow = "hidden";
    svg.innerHTML = '<filter id="' + ID_LEBUR + '" x="-20%" y="-20%" width="140%" height="140%" color-interpolation-filters="sRGB">' +
      '<feGaussianBlur in="SourceGraphic" stdDeviation="7" result="kabur"/>' +
      '<feColorMatrix in="kabur" mode="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 24 -10" result="lebur"/>' +
      '<feComposite in="SourceGraphic" in2="lebur" operator="atop"/></filter>';
    document.body.appendChild(svg);
  }

  // Pegas teredam: kekakuan k dan rasio redaman z (di bawah 1 berarti sedikit memantul).
  function Pegas(x, k, z) { this.x = x; this.v = 0; this.t = x; this.k = k; this.z = z; }
  Pegas.prototype.langkah = function (dt) {
    this.v += (-this.k * (this.x - this.t) - 2 * Math.sqrt(this.k) * this.z * this.v) * dt;
    this.x += this.v * dt;
  };
  Pegas.prototype.diam = function () { return Math.abs(this.x - this.t) < .2 && Math.abs(this.v) < 2; };

  function lapisanLebur(pil) {
    if (pil._lebur && pil._lebur.parentNode === pil.parentNode) return pil._lebur;
    pasangFilter();
    var g = document.createElement("span"), gaya = getComputedStyle(pil);
    g.setAttribute("aria-hidden", "true");
    g.style.cssText = "position:absolute;left:0;top:0;right:0;bottom:0;z-index:0;pointer-events:none;" +
      "filter:url(#" + ID_LEBUR + ") drop-shadow(0 6px 12px rgba(242,180,74,.3))";
    for (var i = 0; i < 3; i++) {
      var b = document.createElement("span");
      b.style.cssText = "position:absolute;left:0;top:0;width:0;height:0;will-change:transform,width,height";
      // Kepala dan ekor memakai gradien pil; leher berwarna rata supaya batang yang diputar tidak tampak sebagai pita terang.
      if (i < 2) b.style.backgroundImage = gaya.backgroundImage; else b.style.background = "var(--emas-terang, #ffd27a)";
      g.appendChild(b);
    }
    pil.parentNode.insertBefore(g, pil);
    pil._lebur = g;
    return g;
  }

  function animasiCair(pil, dari, ke) {
    if (!pil.parentNode || !window.requestAnimationFrame) return;
    var g = lapisanLebur(pil), bentuk = g.children, k = pil._kental;
    if (!k) {
      k = pil._kental = {
        kx: new Pegas(dari.x + dari.w / 2, 300, .62), ky: new Pegas(dari.y + dari.h / 2, 300, .62),
        ex: new Pegas(dari.x + dari.w / 2, 95, .9), ey: new Pegas(dari.y + dari.h / 2, 95, .9),
        w: new Pegas(dari.w, 260, .9), h: new Pegas(dari.h, 260, .9)
      };
    }
    k.kx.t = k.ex.t = ke.x + ke.w / 2; k.ky.t = k.ey.t = ke.y + ke.h / 2; k.w.t = ke.w; k.h.t = ke.h;
    var sudut = getComputedStyle(pil).borderTopLeftRadius || "12px";
    bentuk[0].style.borderRadius = bentuk[1].style.borderRadius = sudut; bentuk[2].style.borderRadius = "999px";
    pil.style.visibility = "hidden"; g.style.display = "";
    if (k.jalan) return; // Sudah bergerak: pegas cukup diberi tujuan baru.
    var pegas = [k.kx, k.ky, k.ex, k.ey, k.w, k.h], akhir = null;
    function taruh(el, cx, cy, w, h) {
      el.style.width = w + "px"; el.style.height = h + "px";
      el.style.transform = "translate(" + (cx - w / 2) + "px," + (cy - h / 2) + "px)";
    }
    function gambar() {
      var dx = k.kx.x - k.ex.x, dy = k.ky.x - k.ey.x, d = Math.hypot(dx, dy), w = k.w.x, h = k.h.x;
      // Volume tetap: makin jauh kepala dan ekor terpisah, makin kecil keduanya. Beda ukuran memudar saat keduanya menyatu.
      var skala = 1 - Math.min(.28, d / 520), beda = Math.min(1, d / 40);
      taruh(bentuk[0], k.kx.x, k.ky.x, w * (skala + .06 * beda), h * (skala + .06 * beda));
      taruh(bentuk[1], k.ex.x, k.ey.x, w * (skala - .04 * beda), h * (skala - .04 * beda));
      // Leher hanya ada saat kepala dan ekor berjauhan; makin jauh makin tipis, lalu putus.
      var silang = Math.abs(dx) > Math.abs(dy) ? h : w, tebal = Math.max(0, silang * .55 - d * .16), leher = bentuk[2];
      if (tebal < 3 || d < silang * .5) { leher.style.width = "0px"; leher.style.height = "0px"; return; }
      leher.style.width = d + "px"; leher.style.height = tebal + "px";
      leher.style.transform = "translate(" + ((k.kx.x + k.ex.x) / 2 - d / 2) + "px," + ((k.ky.x + k.ey.x) / 2 - tebal / 2) + "px) rotate(" + Math.atan2(dy, dx) + "rad)";
    }
    function bingkai(kini) {
      var dt = Math.min(48, kini - (akhir || kini - 16)) / 1000; akhir = kini;
      // Langkah kecil supaya pegas kaku tetap stabil.
      for (var n = Math.ceil(dt / .004), i = 0; i < n; i++) for (var j = 0; j < pegas.length; j++) pegas[j].langkah(dt / n);
      gambar();
      var tenang = true;
      for (j = 0; j < pegas.length; j++) if (!pegas[j].diam()) { tenang = false; break; }
      // Menu yang tersembunyi di tengah gerak (panel menyusut) juga mengakhiri gerak.
      if (tenang || !pil.parentNode || !pil.offsetParent) {
        g.style.display = "none"; pil.style.visibility = ""; pil._kental = null;
        return;
      }
      k.jalan = requestAnimationFrame(bingkai);
    }
    gambar();
    k.jalan = requestAnimationFrame(bingkai);
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
