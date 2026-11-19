/* Transisi tema piksel untuk mode arkade.
   Dimuat halaman arkade/ dan kulit.js (halaman turunan saat mode arkade aktif). Skrip tema halaman
   (tema.js, bengkelpdf/tema.js, dan salinannya di realisasi/) memanggil window.TransisiPiksel bila ada,
   sebagai pengganti efek cairan: tampilan baru muncul kotak demi kotak dari tombol tema (View Transitions API).
   Tanpa dukungan peramban, atau bila pengguna mengurangi gerak, mode berganti langsung. */
(function () {
  "use strict";
  window.TransisiPiksel = function (terapkan) {
    var kurang = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!document.startViewTransition || kurang) { terapkan(); return; }
    var pilih = "[data-tombol-mode], [data-tema]";
    var t = document.activeElement && document.activeElement.closest ? document.activeElement.closest(pilih) : null;
    if (!t) { var a = document.querySelectorAll(pilih); for (var i = 0; i < a.length; i++) if (a[i].offsetParent) { t = a[i]; break; } }
    var r = t ? t.getBoundingClientRect() : { left: window.innerWidth / 2, top: 0, width: 0, height: 0 };
    var cx = r.left + r.width / 2, cy = r.top + r.height / 2;

    // Kisi kotak selebar layar. Urutan muncul dihitung dari jarak ke tombol ditambah sedikit acak, dibagi ke 12 langkah.
    var W = window.innerWidth, H = window.innerHeight, uk = Math.max(28, Math.round(Math.min(W, H) / 16)), kotak = [], LANGKAH = 12;
    for (var y = 0; y < H; y += uk) for (var x = 0; x < W; x += uk) kotak.push([x, y, Math.hypot(x + uk / 2 - cx, y + uk / 2 - cy) + Math.random() * uk * 5]);
    kotak.sort(function (p, q) { return p[2] - q[2]; });
    kotak.forEach(function (k, i) { k[3] = Math.floor(i / kotak.length * LANGKAH) + 1; });
    // Tiap bingkai memuat semua kotak (yang belum waktunya berukuran nol) supaya jumlah perintah path sama.
    var bingkai = [];
    for (var n = 0; n <= LANGKAH; n++) {
      bingkai.push({
        clipPath: 'path("' + kotak.map(function (k) { var s = k[3] <= n ? uk : 0; return "M" + k[0] + " " + k[1] + "h" + s + "v" + s + "h" + (-s) + "z"; }).join("") + '")',
        easing: "steps(1, end)"
      });
    }

    var gaya = document.createElement("style");
    gaya.textContent = "::view-transition-old(root),::view-transition-new(root){animation:none;mix-blend-mode:normal}::view-transition-new(root){z-index:2}";
    document.head.appendChild(gaya);
    window.__sedangTransisi = true;
    var bersih = function () { gaya.remove(); setTimeout(function () { window.__sedangTransisi = false; }, 400); };
    var vt;
    try { vt = document.startViewTransition(terapkan); } catch (e) { bersih(); terapkan(); return; }
    vt.ready.then(function () {
      document.documentElement.animate(bingkai, { duration: 560, fill: "forwards", pseudoElement: "::view-transition-new(root)" });
    }).catch(function () { /* abaikan */ });
    vt.finished.then(bersih, bersih);
  };
})();
