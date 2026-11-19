/* Banner beruang madu piksel: adegan 160x90 yang digambar per piksel lalu diperbesar tanpa penghalusan.
   BannerBeruang(kanvas, { diam: bool }) -> { henti() } */
(function () {
  "use strict";
  var W = 160, H = 90;
  var C = {
    langit1: "#0a1420", langit2: "#0f2236", langit3: "#13304b", bintang: "#e8f1f8", emas: "#ffd27a", emasTua: "#f2b44a", emasGelap: "#b8700f",
    kota: "#07101b", kota2: "#0b1a2a", laut: "#0f2236", laut2: "#13304b", merah: "#ff6b5e",
    garis: "#05080c", bulu: "#221d1d", bulu2: "#3a3130", moncong: "#d6a466", moncong2: "#b98446", dada: "#f2a531", dada2: "#c97f17",
    kaca: "#05080c", kilau: "#e8f1f8", kartu: "#e8f1f8", lidah: "#e0607a", bata: "#13304b", bata2: "#0f2236", nat: "#0a1420"
  };

  // Angka acak berbenih supaya kota dan bintang selalu sama.
  function acak(benih) { return function () { benih = (benih * 16807) % 2147483647; return (benih - 1) / 2147483646; }; }

  function BannerBeruang(kanvas, opsi) {
    opsi = opsi || {};
    kanvas.width = W; kanvas.height = H;
    var x = kanvas.getContext("2d");
    var r = acak(20261119);
    var bintang = [], gedung = [], jendela = [];
    for (var i = 0; i < 46; i++) bintang.push([Math.floor(r() * W), Math.floor(r() * 50), r() * 6.28, r() < .25]);
    var gx = 76;
    while (gx < W) { var lw = 4 + Math.floor(r() * 7), lh = 6 + Math.floor(r() * 16); gedung.push([gx, lw, lh]); gx += lw + (r() < .3 ? 1 : 0); }
    gedung.forEach(function (g) { for (var yy = 62 - g[2] + 2; yy < 61; yy += 3) for (var xx = g[0] + 1; xx < g[0] + g[1] - 1; xx += 2) if (r() < .32) jendela.push([xx, yy, r() * 6.28]); });

    var t = 0, pewaktu = null;

    function px(a, b, w, h, warna) { x.fillStyle = warna; x.fillRect(a, b, w || 1, h || 1); }

    function latar() {
      // Langit bertingkat dengan pola dither di tiap peralihan.
      for (var y = 0; y < 62; y++) for (var xx = 0; xx < W; xx++) {
        var w = y < 26 ? C.langit1 : y < 44 ? C.langit2 : C.langit3;
        if (y >= 22 && y < 26 && (xx + y) % 2 === 0) w = C.langit2;
        if (y >= 40 && y < 44 && (xx + y) % 2 === 0) w = C.langit3;
        px(xx, y, 1, 1, w);
      }
      bintang.forEach(function (b) {
        var nyala = opsi.diam ? 1 : Math.sin(t * .9 + b[2]);
        if (nyala > -.3) px(b[0], b[1], 1, 1, b[3] ? C.emas : C.bintang);
        if (b[3] && nyala > .85) { px(b[0] - 1, b[1], 1, 1, C.emasTua); px(b[0] + 1, b[1], 1, 1, C.emasTua); px(b[0], b[1] - 1, 1, 1, C.emasTua); px(b[0], b[1] + 1, 1, 1, C.emasTua); }
      });
      // Bulan.
      for (var y2 = -8; y2 <= 8; y2++) for (var x2 = -8; x2 <= 8; x2++) if (x2 * x2 + y2 * y2 <= 64) px(134 + x2, 16 + y2, 1, 1, (x2 + 3) * (x2 + 3) + (y2 + 2) * (y2 + 2) < 6 || (x2 - 3) * (x2 - 3) + (y2 - 3) * (y2 - 3) < 3 ? C.emasTua : x2 + y2 > 8 ? C.emasTua : C.emas);
      // Gedung dan kilang.
      gedung.forEach(function (g) { px(g[0], 62 - g[2], g[1], g[2], C.kota2); px(g[0], 62 - g[2], g[1], 1, C.kota); });
      jendela.forEach(function (j) { if (opsi.diam || Math.sin(t * .4 + j[2]) > -.6) px(j[0], j[1], 1, 1, C.emas); });
      // Tangki bulat kilang.
      [[88, 5], [99, 4]].forEach(function (k) { for (var y3 = -k[1]; y3 <= 0; y3++) for (var x3 = -k[1]; x3 <= k[1]; x3++) if (x3 * x3 + y3 * y3 <= k[1] * k[1]) px(k[0] + x3, 61 + y3, 1, 1, C.kota); });
      // Cerobong suar.
      px(118, 32, 3, 30, C.kota); px(117, 32, 5, 1, C.kota);
      var f = opsi.diam ? 0 : Math.floor(t * 3) % 3;
      px(118, 29 - f, 3, 3 + f, C.emasTua); px(119, 27 - f, 1, 2, C.emas); px(118, 31, 3, 1, C.merah);
      px(127, 40, 2, 22, C.kota); px(126, 40, 4, 1, C.kota);
      // Laut dengan riak dan pantulan bulan.
      for (var y4 = 62; y4 < 79; y4++) px(0, y4, W, 1, C.laut);
      for (var y5 = 63; y5 < 79; y5 += 2) {
        var geser = opsi.diam ? 0 : Math.floor(t * 2 + y5) % 12;
        for (var x5 = (y5 * 7 + geser) % 12 - 12; x5 < W; x5 += 12) px(x5, y5, 5, 1, C.laut2);
        var lebar = 10 - (y5 - 62) / 3, kilat = opsi.diam ? 0 : Math.floor(t * 4 + y5) % 3;
        if ((y5 + kilat) % 3) px(134 - lebar / 2 + kilat, y5, Math.max(2, lebar - kilat * 2), 1, y5 < 70 ? C.emas : C.emasTua);
      }
      // Kapal kecil melintas.
      var kx = opsi.diam ? 104 : Math.floor(176 - (t * 2.2) % 200);
      px(kx, 66, 12, 2, C.kota); px(kx + 1, 68, 10, 1, C.kota); px(kx + 4, 63, 4, 3, C.kota); px(kx + 5, 64, 1, 1, C.emas); px(kx + 10, 65, 1, 1, C.merah);
      // Lantai dermaga ala balok gim.
      px(0, 79, W, 1, C.emas); px(0, 80, W, 1, C.emasTua);
      for (var y6 = 81; y6 < H; y6++) for (var x6 = 0; x6 < W; x6++) {
        var baris = Math.floor((y6 - 81) / 4), xb = (x6 + (baris % 2) * 6) % 12;
        px(x6, y6, 1, 1, (y6 - 81) % 4 === 3 || xb === 0 ? C.nat : (xb < 3 && (y6 - 81) % 4 === 0 ? C.bata : C.bata2));
      }
    }

    /* ---------- Beruang: digambar ke kisi lalu diberi garis tepi otomatis ---------- */
    function beruang() {
      var cx = 46, kisi = {}, lambai = opsi.diam ? 0 : Math.floor(t * 2.5) % 2;
      var napas = opsi.diam ? 0 : (Math.floor(t * 1.2) % 2);
      function isi(a, b, w) { a = Math.round(a); b = Math.round(b); if (b >= 79) return; kisi[a + "," + b] = w; }
      function elips(ex, ey, rx, ry, w, syarat) {
        for (var yy = Math.floor(ey - ry); yy <= Math.ceil(ey + ry); yy++) for (var xx = Math.floor(ex - rx); xx <= Math.ceil(ex + rx); xx++) {
          var d = (xx - ex) * (xx - ex) / (rx * rx) + (yy - ey) * (yy - ey) / (ry * ry);
          if (d <= 1 && (!syarat || syarat(xx, yy, d))) isi(xx, yy, w);
        }
      }
      function kapsul(x1, y1, x2, y2, rad, w) {
        var n = Math.ceil(Math.hypot(x2 - x1, y2 - y1));
        for (var i = 0; i <= n; i++) elips(x1 + (x2 - x1) * i / n, y1 + (y2 - y1) * i / n, rad, rad, w);
      }
      var by = 66 + napas * 0, hy = 37 - napas;
      // Badan, lengan kiri, lengan kanan melambai.
      elips(cx, by, 15, 14, C.bulu);
      kapsul(cx - 14, 58, cx - 17, 72, 4, C.bulu);
      var px2 = cx + 26 + lambai * 3, py2 = 36 + lambai * 3;
      kapsul(cx + 12, 58, px2, py2, 4, C.bulu);
      elips(px2, py2 - 1, 5, 5, C.bulu);
      elips(px2, py2, 2.2, 2, C.moncong);
      // Tanda U di dada.
      elips(cx, 57, 11, 7, C.dada, function (xx, yy) { return yy >= 55 && ((xx - cx) * (xx - cx)) / 64 + ((yy - 54) * (yy - 54)) / 20 > 1; });
      elips(cx, 58, 11, 7, C.dada2, function (xx, yy) { return yy >= 61 && ((xx - cx) * (xx - cx)) / 64 + ((yy - 55) * (yy - 55)) / 20 > 1 && kisi[xx + "," + yy] === C.dada; });
      // Tali dan kartu pengenal.
      for (var k = 0; k <= 10; k++) { isi(cx - 7 + k * .9, 51 + k, C.emasTua); isi(cx + 6 - k * .2, 51 + k, C.emasTua); }
      for (var ky = 62; ky <= 71; ky++) for (var kx = cx + 1; kx <= cx + 8; kx++) isi(kx, ky, ky <= 63 ? C.langit3 : C.kartu);
      isi(cx + 3, 66, C.emasGelap); isi(cx + 4, 66, C.emasGelap); isi(cx + 3, 67, C.emasGelap); isi(cx + 4, 67, C.emasGelap);
      for (var lx = cx + 2; lx <= cx + 7; lx++) isi(lx, 69, C.langit3);
      // Kepala, telinga, sorot bulu.
      elips(cx - 12, hy - 11, 5, 5, C.bulu); elips(cx + 12, hy - 11, 5, 5, C.bulu);
      elips(cx - 12, hy - 11, 2, 2, C.bulu2); elips(cx + 12, hy - 11, 2, 2, C.bulu2);
      elips(cx, hy, 16, 12.5, C.bulu);
      elips(cx, hy, 16, 12.5, C.bulu2, function (xx, yy, d) { return d > .72 && xx < cx && yy < hy - 2; });
      // Moncong, hidung, mulut, lidah.
      elips(cx, hy + 6, 8.5, 5.5, C.moncong);
      elips(cx, hy + 7, 8.5, 5.5, C.moncong2, function (xx, yy) { return yy >= hy + 10; });
      for (var nx = cx - 2; nx <= cx + 1; nx++) { isi(nx, hy + 3, C.garis); isi(nx, hy + 4, C.garis); }
      isi(cx - 1, hy + 5, C.garis); isi(cx - 1, hy + 6, C.garis);
      for (var mx = cx - 4; mx <= cx + 2; mx++) isi(mx, hy + 7, C.garis);
      isi(cx - 5, hy + 6, C.garis); isi(cx + 3, hy + 6, C.garis);
      if (!opsi.diam && Math.floor(t * .7) % 4 === 0) { isi(cx - 2, hy + 8, C.lidah); isi(cx - 1, hy + 8, C.lidah); isi(cx, hy + 8, C.lidah); isi(cx - 1, hy + 9, C.lidah); }
      // Kacamata hitam dengan kilau yang menyapu.
      for (var gy = hy - 4; gy <= hy; gy++) {
        for (var gx2 = cx - 11; gx2 <= cx - 2; gx2++) if (!(gy === hy && (gx2 === cx - 11 || gx2 === cx - 2))) isi(gx2, gy, C.kaca);
        for (var gx3 = cx + 1; gx3 <= cx + 10; gx3++) if (!(gy === hy && (gx3 === cx + 1 || gx3 === cx + 10))) isi(gx3, gy, C.kaca);
      }
      isi(cx - 1, hy - 3, C.kaca); isi(cx, hy - 3, C.kaca);
      for (var ax = cx - 15; ax < cx - 11; ax++) isi(ax, hy - 3, C.kaca);
      for (var ax2 = cx + 11; ax2 <= cx + 14; ax2++) isi(ax2, hy - 3, C.kaca);
      var sapu = opsi.diam ? 3 : Math.floor(t * 6) % 40;
      for (var s = 0; s < 2; s++) {
        [[cx - 11, cx - 2], [cx + 1, cx + 10]].forEach(function (lensa) {
          for (var dy = 0; dy < 4; dy++) { var gx4 = lensa[0] + sapu + s - dy; if (gx4 >= lensa[0] && gx4 <= lensa[1]) isi(gx4, hy - 4 + dy, C.kilau); }
        });
      }
      isi(cx - 10, hy - 4, C.kilau);
      // Garis tepi: piksel kosong yang bertetangga langsung dengan beruang.
      var tepi = {};
      Object.keys(kisi).forEach(function (k2) {
        var p = k2.split(","), a = +p[0], b = +p[1];
        [[1, 0], [-1, 0], [0, 1], [0, -1]].forEach(function (d) { var n = (a + d[0]) + "," + (b + d[1]); if (!kisi[n] && b + d[1] < 79) tepi[n] = 1; });
      });
      Object.keys(tepi).forEach(function (k3) { var p = k3.split(","); px(+p[0], +p[1], 1, 1, C.garis); });
      Object.keys(kisi).forEach(function (k4) { var p = k4.split(","); px(+p[0], +p[1], 1, 1, kisi[k4]); });
    }

    function gambar() { latar(); beruang(); }
    gambar();
    if (!opsi.diam) {
      var akhir = 0;
      pewaktu = requestAnimationFrame(function langkah(ms) {
        if (ms - akhir > 120) { akhir = ms; t = ms / 1000; gambar(); }
        pewaktu = requestAnimationFrame(langkah);
      });
    }
    return { henti: function () { cancelAnimationFrame(pewaktu); } };
  }
  window.BannerBeruang = BannerBeruang;
})();
