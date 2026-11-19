/* Banner beruang madu piksel: adegan Teluk Balikpapan 160x90 yang digambar per piksel lalu diperbesar tanpa penghalusan.
   Siang hari di mode terang (matahari, awan, asap kilang) dan malam hari di mode gelap (bintang, bulan, lampu gedung),
   dibaca tiap bingkai sehingga ikut berganti saat saklar tema ditekan.
   Empat adegan bergantian: dermaga (melambai), mancing, speedboat, dan papan JOSJIS.
     BannerBeruang(kanvas, { desain, diam, siang }) -> { henti(), atur(o) }
     BannerBeruang.pilih()       adegan untuk halaman ini: acak, tidak sama dengan yang terakhir dilihat di sesi ini
     BannerBeruang.DESAIN        urutan nama adegan (untuk tombol ganti)
     BannerBeruang.FOKUS[nama]   object-position untuk pita sempit (HP) supaya kepala beruang tetap utuh
     BannerBeruang.GELEMBUNG[nama]  letak gelembung "JOSJIS!" di banner arkade, atau null bila adegannya sudah memuat tulisan */
(function () {
  "use strict";
  var W = 160, H = 90;
  var MALAM = {
    langit1: "#0a1420", langit2: "#0f2236", langit3: "#13304b", bintang: "#e8f1f8", emas: "#ffd27a", emasTua: "#f2b44a",
    kota: "#07101b", kota2: "#0b1a2a", jendela: "#ffd27a", laut: "#0f2236", laut2: "#13304b", pantul: "#ffd27a", pantul2: "#f2b44a", buih: "#9fc3e0",
    kapal: "#07101b", kabin: "#07101b", lampu: "#ffd27a", merah: "#ff6b5e", bata: "#13304b", bata2: "#0f2236", nat: "#0a1420",
    kayu: "#3b2a1f", kayu2: "#2a1d15", papan: "#0f2236"
  };
  var SIANG = {
    langit1: "#6fbbe8", langit2: "#9ad2f2", langit3: "#c6e7f8", emas: "#ffd27a", emasTua: "#f2b44a", inti: "#fff3c4", awan: "#f7fbff", awanBayang: "#d3e6f3",
    kota: "#2f4d6b", kota2: "#4b6f91", jendela: "#c6e7f8", laut: "#2f7fb5", laut2: "#58a6da", pantul: "#fff3c4", pantul2: "#ffd27a", asap: "#dfe7ee", buih: "#f7fbff",
    kapal: "#24384d", kabin: "#f7fbff", lampu: "#f2b44a", merah: "#e0524a", bata: "#3a76a8", bata2: "#2a5f8c", nat: "#1b4468",
    kayu: "#8a5a36", kayu2: "#6b4329", papan: "#0f2236"
  };
  var B = { garis: "#05080c", bulu: "#221d1d", bulu2: "#3a3130", moncong: "#d6a466", moncong2: "#b98446", dada: "#f2a531", dada2: "#c97f17",
    kaca: "#05080c", kilau: "#e8f1f8", kartu: "#e8f1f8", kartuAtas: "#13304b", emasTua: "#f2b44a", emasGelap: "#b8700f", lidah: "#e0607a",
    lambung: "#f2f6fa", lambung2: "#c9d6e0", garisPerahu: "#0f2236", kaca2: "#9fd3f2", tongkat: "#8a5a36", senar: "#e8f1f8", pelampung: "#e0524a", ikan: "#9fc3e0" };

  function acak(benih) { return function () { benih = (benih * 16807) % 2147483647; return (benih - 1) / 2147483646; }; }
  // Huruf piksel 3x5 untuk papan nama.
  var HURUF = { J: ["011", "001", "001", "101", "010"], O: ["111", "101", "101", "101", "111"], S: ["111", "100", "111", "001", "111"], I: ["111", "010", "010", "010", "111"], "!": ["1", "1", "1", "0", "1"] };

  function BannerBeruang(kanvas, opsi) {
    opsi = opsi || {};
    if (!opsi.desain) opsi.desain = BannerBeruang.pilih();
    kanvas.width = W; kanvas.height = H;
    var x = kanvas.getContext("2d"), r = acak(20261119), t = 0, pewaktu = null;
    var bintang = [], gedung = [], jendela = [], awan = [[10, 8, 16, 1.1], [70, 22, 12, .7], [120, 34, 10, .9], [170, 12, 14, .8]];
    for (var i = 0; i < 46; i++) bintang.push([Math.floor(r() * W), Math.floor(r() * 50), r() * 6.28, r() < .25]);
    var gx = 76;
    while (gx < W) { var lw = 4 + Math.floor(r() * 7), lh = 6 + Math.floor(r() * 16); gedung.push([gx, lw, lh]); gx += lw + (r() < .3 ? 1 : 0); }
    gedung.forEach(function (g) { for (var yy = 62 - g[2] + 2; yy < 61; yy += 3) for (var xx = g[0] + 1; xx < g[0] + g[1] - 1; xx += 2) if (r() < .32) jendela.push([xx, yy, r() * 6.28]); });

    // Penyangga piksel: semua titik ditulis ke ImageData, lalu dikirim ke kanvas sekali per bingkai (jauh lebih ringan daripada fillRect per piksel).
    var gbr = x.createImageData(W, H), d32 = new Uint32Array(gbr.data.buffer), simpanWarna = {};
    function kode(c) {
      var v = simpanWarna[c];
      if (v === undefined) { v = ((255 << 24) | (parseInt(c.substr(5, 2), 16) << 16) | (parseInt(c.substr(3, 2), 16) << 8) | parseInt(c.substr(1, 2), 16)) >>> 0; simpanWarna[c] = v; }
      return v;
    }
    function px(a, b, w, h, warna) {
      a = Math.round(a); b = Math.round(b);
      var v = kode(warna), x0 = Math.max(0, a), x1 = Math.min(W, a + Math.round(w || 1)), y0 = Math.max(0, b), y1 = Math.min(H, b + Math.round(h || 1));
      for (var yy = y0; yy < y1; yy++) for (var xx = x0; xx < x1; xx++) d32[yy * W + xx] = v;
    }
    function D() { return !!opsi.diam; }

    /* ---------- Latar: langit, kota, laut, dan lantai (opsional) ---------- */
    function latar(P, S, dermaga) {
      for (var y = 0; y < 62; y++) for (var xx = 0; xx < W; xx++) {
        var w = y < 26 ? P.langit1 : y < 44 ? P.langit2 : P.langit3;
        if (y >= 22 && y < 26 && (xx + y) % 2 === 0) w = P.langit2;
        if (y >= 40 && y < 44 && (xx + y) % 2 === 0) w = P.langit3;
        px(xx, y, 1, 1, w);
      }
      if (S) {
        var denyut = D() ? 0 : Math.floor(t * 2) % 2;
        for (var ys = -7; ys <= 7; ys++) for (var xs = -7; xs <= 7; xs++) { var d2 = xs * xs + ys * ys; if (d2 <= 49) px(134 + xs, 16 + ys, 1, 1, d2 <= 16 ? P.inti : P.emas); }
        [[0, -1], [1, -1], [1, 0], [1, 1], [0, 1], [-1, 1], [-1, 0], [-1, -1]].forEach(function (a, i) {
          var j = (a[0] && a[1] ? 7 : 10) + (i % 2 ? denyut : 1 - denyut);
          px(134 + a[0] * j, 16 + a[1] * j, 1, 1, P.emasTua); px(134 + a[0] * (j + 1), 16 + a[1] * (j + 1), 1, 1, P.emasTua);
        });
        awan.forEach(function (a) {
          var ax = Math.round(((a[0] + (D() ? 0 : t * a[3])) % (W + 40)) - 20);
          px(ax + 2, a[1], a[2] - 4, 1, P.awan); px(ax, a[1] + 1, a[2], 2, P.awan); px(ax + 1, a[1] + 3, a[2] - 2, 1, P.awanBayang); px(ax + 4, a[1] - 1, Math.max(3, a[2] / 2 | 0), 1, P.awan);
        });
      } else {
        bintang.forEach(function (b) {
          var nyala = D() ? 1 : Math.sin(t * .9 + b[2]);
          if (nyala > -.3) px(b[0], b[1], 1, 1, b[3] ? P.emas : P.bintang);
        });
        for (var y2 = -8; y2 <= 8; y2++) for (var x2 = -8; x2 <= 8; x2++) if (x2 * x2 + y2 * y2 <= 64) px(134 + x2, 16 + y2, 1, 1, (x2 + 3) * (x2 + 3) + (y2 + 2) * (y2 + 2) < 6 || (x2 - 3) * (x2 - 3) + (y2 - 3) * (y2 - 3) < 3 || x2 + y2 > 8 ? P.emasTua : P.emas);
      }
      gedung.forEach(function (g) { px(g[0], 62 - g[2], g[1], g[2], P.kota2); px(g[0], 62 - g[2], g[1], 1, P.kota); });
      jendela.forEach(function (j) { if (S ? j[2] < 3 : (D() || Math.sin(t * .4 + j[2]) > -.6)) px(j[0], j[1], 1, 1, P.jendela); });
      [[88, 5], [99, 4]].forEach(function (k) { for (var y3 = -k[1]; y3 <= 0; y3++) for (var x3 = -k[1]; x3 <= k[1]; x3++) if (x3 * x3 + y3 * y3 <= k[1] * k[1]) px(k[0] + x3, 61 + y3, 1, 1, P.kota); });
      px(118, 32, 3, 30, P.kota); px(117, 32, 5, 1, P.kota);
      var f = D() ? 0 : Math.floor(t * 3) % 3;
      px(118, 29 - f, 3, 3 + f, P.emasTua); px(119, 27 - f, 1, 2, P.emas); px(118, 31, 3, 1, P.merah);
      if (S) for (var k2 = 0; k2 < 4; k2++) { var naik = ((D() ? k2 * 3 : t * 4 + k2 * 3) % 12); px(119 + Math.round(naik / 3) - 1, 26 - naik, 3, 2, P.asap); }
      px(127, 40, 2, 22, P.kota); px(126, 40, 4, 1, P.kota);
      var dasarLaut = dermaga ? 79 : H;
      for (var y4 = 62; y4 < dasarLaut; y4++) px(0, y4, W, 1, P.laut);
      for (var y5 = 63; y5 < dasarLaut; y5 += 2) {
        var geser = D() ? 0 : Math.floor(t * 2 + y5) % 12;
        for (var x5 = (y5 * 7 + geser) % 12 - 12; x5 < W; x5 += 12) px(x5, y5, 5, 1, P.laut2);
        var lebar = Math.max(2, 10 - (y5 - 62) / 3), kilat = D() ? 0 : Math.floor(t * 4 + y5) % 3;
        if ((y5 + kilat) % 3 && y5 < 80) px(134 - lebar / 2 + kilat, y5, Math.max(2, lebar - kilat * 2), 1, y5 < 70 ? P.pantul : P.pantul2);
      }
      if (dermaga) {
        px(0, 79, W, 1, P.emas); px(0, 80, W, 1, P.emasTua);
        for (var y6 = 81; y6 < H; y6++) for (var x6 = 0; x6 < W; x6++) {
          var baris = Math.floor((y6 - 81) / 4), xb = (x6 + (baris % 2) * 6) % 12;
          px(x6, y6, 1, 1, (y6 - 81) % 4 === 3 || xb === 0 ? P.nat : (xb < 3 && (y6 - 81) % 4 === 0 ? P.bata : P.bata2));
        }
      }
    }
    function kapalLewat(P) {
      var kx = D() ? 104 : Math.floor(176 - (t * 2.2) % 200);
      px(kx, 66, 12, 2, P.kapal); px(kx + 1, 68, 10, 1, P.kapal); px(kx + 4, 63, 4, 3, P.kabin); px(kx + 5, 64, 1, 1, P.lampu); px(kx + 10, 65, 1, 1, P.merah);
    }

    /* ---------- Beruang madu: bentuk dasar berskala, beberapa pose ----------
       o = { hx, hy (pusat kepala), s (skala), pose: "dada" | "berdiri" | "duduk", lengan: "lambai" | "tunjuk" | "pancing", batasBawah } */
    function beruang(o) {
      var kisi = {}, s = o.s, hx = o.hx, hy = o.hy, batas = o.batasBawah || H;
      var lb = D() ? 0 : Math.floor(t * 2.5) % 2;
      function isi(a, b, w) { a = Math.round(a); b = Math.round(b); if (b >= batas || b < 0) return; kisi[a + "," + b] = w; }
      function elips(ex, ey, rx, ry, w, syarat) {
        for (var yy = Math.floor(ey - ry); yy <= Math.ceil(ey + ry); yy++) for (var xx = Math.floor(ex - rx); xx <= Math.ceil(ex + rx); xx++) {
          var d = (xx - ex) * (xx - ex) / (rx * rx) + (yy - ey) * (yy - ey) / (ry * ry);
          if (d <= 1 && (!syarat || syarat(xx, yy, d))) isi(xx, yy, w);
        }
      }
      // Koordinat relatif terhadap pusat kepala, dikali skala.
      function E(dx, dy, rx, ry, w, syarat) { elips(hx + dx * s, hy + dy * s, Math.max(.6, rx * s), Math.max(.6, ry * s), w, syarat); }
      function K(x1, y1, x2, y2, rad, w) {
        var a1 = hx + x1 * s, b1 = hy + y1 * s, a2 = hx + x2 * s, b2 = hy + y2 * s, n = Math.ceil(Math.hypot(a2 - a1, b2 - b1));
        for (var i = 0; i <= n; i++) elips(a1 + (a2 - a1) * i / n, b1 + (b2 - b1) * i / n, Math.max(.8, rad * s), Math.max(.8, rad * s), w);
      }
      function R(x1, y1, x2, y2, w) {
        var a1 = Math.round(hx + x1 * s), a2 = Math.round(hx + x2 * s), b1 = Math.round(hy + y1 * s), b2 = Math.round(hy + y2 * s);
        for (var yy = b1; yy <= Math.max(b1, b2); yy++) for (var xx = a1; xx <= Math.max(a1, a2); xx++) isi(xx, yy, w);
      }
      var tangan = null;
      // Badan dan kaki.
      if (o.pose === "dada") {
        E(0, 29, 15, 14, B.bulu);
        K(-14, 21, -17, 35, 4, B.bulu);
      } else if (o.pose === "berdiri") {
        E(-6, 36, 5, 5, B.bulu); E(6, 36, 5, 5, B.bulu);
        E(0, 24, 12.5, 13, B.bulu);
        E(-6, 40, 3, 1.2, B.moncong2); E(6, 40, 3, 1.2, B.moncong2);
        if (o.lengan !== "tunjukKiri") K(-11, 18, -14, 30, 3.6, B.bulu);
      } else if (o.pose === "duduk") {
        E(0, 24, 13.5, 11.5, B.bulu);
        K(-6, 31, -9, 38, 4, B.bulu); K(6, 31, 9, 38, 4, B.bulu);
        E(-9, 39, 3.6, 1.6, B.moncong2); E(9, 39, 3.6, 1.6, B.moncong2);
      }
      // Lengan kanan sesuai aksi.
      if (o.lengan === "lambai") {
        var ux = (o.pose === "dada" ? 26 : 21) + lb * 3, uy = (o.pose === "dada" ? -1 : 2) + lb * 3;
        K(o.pose === "dada" ? 12 : 10, o.pose === "dada" ? 21 : 17, ux, uy, o.pose === "dada" ? 4 : 3.6, B.bulu);
        E(ux, uy - 1, 5, 5, B.bulu); E(ux, uy, 2.2, 2, B.moncong);
      } else if (o.lengan === "tunjuk") {
        var tx = 24 + lb, ty = 12;
        K(10, 17, tx, ty, 3.6, B.bulu); E(tx + 1, ty, 3.6, 3.2, B.bulu); E(tx + 2, ty, 1.6, 1.4, B.moncong);
      } else if (o.lengan === "pancing") {
        K(-10, 19, 8, 24, 3.6, B.bulu); K(10, 19, 12, 24, 3.6, B.bulu);
        E(11, 24, 3.6, 3.4, B.bulu);
        tangan = [hx + 12 * s, hy + 23 * s];
      }
      // Tanda U di dada.
      E(0, 20, 11, 7, B.dada, function (xx, yy) { var ry = (yy - (hy + 17 * s)) / s, rx = (xx - hx) / s; return yy >= hy + 18 * s && (rx * rx) / 64 + (ry * ry) / 20 > 1; });
      // Tali dan kartu pengenal.
      for (var k = 0; k <= 10; k++) { isi(hx + (-7 + k * .9) * s, hy + (14 + k) * s, B.emasTua); isi(hx + (6 - k * .2) * s, hy + (14 + k) * s, B.emasTua); }
      R(1, 25, 8, 26, B.kartuAtas); R(1, 27, 8, 34, B.kartu); R(3, 29, 4, 30, B.emasGelap); R(2, 32, 7, 32, B.kartuAtas);
      // Kepala.
      E(-12, -11, 5, 5, B.bulu); E(12, -11, 5, 5, B.bulu); E(-12, -11, 2, 2, B.bulu2); E(12, -11, 2, 2, B.bulu2);
      E(0, 0, 16, 12.5, B.bulu);
      E(0, 0, 16, 12.5, B.bulu2, function (xx, yy, d) { return d > .72 && xx < hx && yy < hy - 2 * s; });
      E(0, 6, 8.5, 5.5, B.moncong);
      E(0, 7, 8.5, 5.5, B.moncong2, function (xx, yy) { return yy >= hy + 10 * s; });
      R(-2, 3, 1, 4, B.garis); R(-1, 5, -1, 6, B.garis); R(-4, 7, 2, 7, B.garis);
      if (!D() && Math.floor(t * .7) % 4 === 0) R(-2, 8, 0, 8.6, B.lidah);
      // Kacamata hitam dan kilaunya.
      R(-11, -4, -2, 0, B.kaca); R(1, -4, 10, 0, B.kaca); R(-1, -3, 0, -3, B.kaca); R(-15, -3, -12, -3, B.kaca); R(11, -3, 14, -3, B.kaca);
      var sapu = D() ? 3 : Math.floor(t * 6) % 40;
      [[-11, -2], [1, 10]].forEach(function (l) { for (var dy = 0; dy < 4; dy++) { var g = l[0] + sapu - dy; if (g >= l[0] && g <= l[1]) R(g, -4 + dy, g + 1, -4 + dy, B.kilau); } });
      R(-10, -4, -10, -4, B.kilau);
      // Garis tepi.
      var tepi = {};
      Object.keys(kisi).forEach(function (k2) {
        var p = k2.split(","), a = +p[0], b = +p[1];
        [[1, 0], [-1, 0], [0, 1], [0, -1]].forEach(function (d) { var n = (a + d[0]) + "," + (b + d[1]); if (!kisi[n] && b + d[1] < batas) tepi[n] = 1; });
      });
      Object.keys(tepi).forEach(function (k3) { var p = k3.split(","); px(+p[0], +p[1], 1, 1, B.garis); });
      Object.keys(kisi).forEach(function (k4) { var p = k4.split(","); px(+p[0], +p[1], 1, 1, kisi[k4]); });
      return tangan;
    }

    /* ---------- Desain ---------- */
    var DESAIN = {
      // A. Dermaga: komposisi lama, beruang sedikit lebih kecil dan lebih rendah supaya kepala selalu utuh.
      dermaga: function (P, S) {
        latar(P, S, true); kapalLewat(P);
        beruang({ hx: 44, hy: 42, s: .82, pose: "dada", lengan: "lambai", batasBawah: 79 });
      },
      // B. Mancing: beruang duduk di tepi dermaga, pelampung naik turun, sesekali ikan melompat.
      mancing: function (P, S) {
        latar(P, S, true); kapalLewat(P);
        var tg = beruang({ hx: 38, hy: 52, s: .72, pose: "duduk", lengan: "pancing", batasBawah: 90 });
        var ujung = [96, 34], ayun = D() ? 0 : Math.sin(t * 2) * 1.2, pel = [100 + Math.round(ayun), 69 + (D() ? 0 : Math.floor(t * 2) % 2)];
        var n = Math.ceil(Math.hypot(ujung[0] - tg[0], ujung[1] - tg[1]));
        for (var i = 0; i <= n; i++) px(tg[0] + (ujung[0] - tg[0]) * i / n, tg[1] + (ujung[1] - tg[1]) * i / n, 1, 1, B.tongkat);
        for (var j = 0; j <= pel[1] - ujung[1]; j++) { var u = j / (pel[1] - ujung[1]); px(ujung[0] + (pel[0] - ujung[0]) * u + Math.sin(u * 3.14) * 2, ujung[1] + j, 1, 1, B.senar); }
        px(pel[0] - 1, pel[1] - 2, 3, 2, B.pelampung); px(pel[0] - 1, pel[1], 3, 1, "#f7fbff");
        px(pel[0] - 4, pel[1] + 2, 9, 1, P.buih);
        var fase = D() ? -1 : (t * .5) % 3;
        if (fase >= 0 && fase < 1) { var fx = 112 + fase * 16, fy = 72 - Math.sin(fase * 3.14) * 12; px(fx, fy, 4, 2, B.ikan); px(fx - 1, fy - 1, 1, 1, B.ikan); px(fx - 1, fy + 2, 1, 1, B.ikan); px(fx + 3, fy, 1, 1, "#05080c"); }
      },
      // C. Speedboat: beruang menyetir speedboat melintasi teluk, buih di belakang.
      speedboat: function (P, S) {
        latar(P, S, false);
        var ayun = D() ? 0 : Math.floor(t * 4) % 2;
        beruang({ hx: 52, hy: 44 + ayun, s: .7, pose: "dada", lengan: "lambai", batasBawah: 70 + ayun });
        var dy = ayun;
        // Lambung perahu.
        for (var y = 0; y < 12; y++) {
          var kiri = 18 + Math.max(0, y - 6), kanan = 104 - y * 1.6;
          px(kiri, 66 + y + dy, kanan - kiri, 1, y === 3 ? B.emasTua : y < 3 ? B.lambung : y < 8 ? B.lambung2 : B.garisPerahu);
        }
        px(18, 65 + dy, 86, 1, B.garisPerahu);
        // Kaca depan.
        for (var k = 0; k < 6; k++) px(70 + k, 60 + k + dy, 2, 1, B.kaca2);
        px(70, 59 + dy, 2, 1, B.garisPerahu);
        // Buih di belakang dan di haluan.
        for (var b = 0; b < 5; b++) { var bx = 16 - b * 4 - (D() ? 0 : Math.floor(t * 8) % 4); px(bx, 74 + (b % 2) + dy, 4, 1, P.buih); px(bx + 1, 77 + dy, 3, 1, P.buih); }
        px(104 - 2, 75 + dy, 6, 1, P.buih); px(100, 78 + dy, 8, 1, P.buih);
      },
      // D. Papan nama: beruang berdiri di dermaga menunjuk papan "JOSJIS!".
      papan: function (P, S) {
        latar(P, S, true); kapalLewat(P);
        // Tiang dan papan.
        px(98, 50, 3, 29, P.kayu); px(98, 50, 1, 29, P.kayu2);
        px(70, 28, 60, 23, "#05080c"); px(71, 29, 58, 21, P.papan); px(72, 30, 56, 1, "#f2b44a"); px(72, 48, 56, 1, "#f2b44a");
        var kata = "JOSJIS!", lx = 73 + 1, kedip = D() || Math.floor(t * 2) % 4 !== 0;
        kata.split("").forEach(function (h) {
          var g = HURUF[h];
          for (var yy = 0; yy < 5; yy++) for (var xx = 0; xx < g[0].length; xx++) if (g[yy][xx] === "1") px(lx + xx * 2, 34 + yy * 2, 2, 2, kedip ? "#ffd27a" : "#f2b44a");
          lx += g[0].length * 2 + 2;
        });
        beruang({ hx: 40, hy: 47, s: .78, pose: "berdiri", lengan: "tunjuk", batasBawah: 90 });
      }
    };

    function gambar() {
      var S = opsi.siang !== undefined ? opsi.siang : document.documentElement.getAttribute("data-mode") !== "gelap";
      (DESAIN[opsi.desain] || DESAIN.dermaga)(S ? SIANG : MALAM, S);
      x.putImageData(gbr, 0, 0);
    }
    gambar();
    // Saat gerak dikurangi, adegan hanya digambar ulang ketika tema berganti.
    if (opsi.diam) document.addEventListener("modeberubah", gambar);
    if (!opsi.diam) {
      var akhir = 0;
      pewaktu = requestAnimationFrame(function langkah(ms) {
        if (ms - akhir > 120) { akhir = ms; t = ms / 1000; gambar(); }
        pewaktu = requestAnimationFrame(langkah);
      });
    }
    return { henti: function () { cancelAnimationFrame(pewaktu); }, atur: function (o) { for (var k in o) opsi[k] = o[k]; gambar(); } };
  }
  var URUTAN = ["dermaga", "mancing", "speedboat", "papan"];
  var pilihan = null;
  BannerBeruang.DESAIN = URUTAN;
  BannerBeruang.FOKUS = { dermaga: "22% 42%", mancing: "24% 62%", speedboat: "32% 52%", papan: "38% 46%" };
  BannerBeruang.GELEMBUNG = { dermaga: { left: "38%", top: "14%" }, mancing: { left: "33%", top: "32%" }, speedboat: { left: "43%", top: "22%" }, papan: null };
  BannerBeruang.pilih = function () {
    if (pilihan) return pilihan;
    var lalu = null;
    try { lalu = sessionStorage.getItem("layanan-adegan"); } catch (e) { /* abaikan */ }
    var calon = URUTAN.filter(function (d) { return d !== lalu; });
    pilihan = calon[Math.floor(Math.random() * calon.length)];
    try { sessionStorage.setItem("layanan-adegan", pilihan); } catch (e) { /* abaikan */ }
    return pilihan;
  };
  window.BannerBeruang = BannerBeruang;
})();
