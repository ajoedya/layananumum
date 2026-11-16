/* Aksen Natal untuk panel biru beranda: salju, untaian lampu, bola hiasan, dan ucapan.
   Tampil sendiri setiap 1 Desember sampai 6 Januari dengan salju, lampu, dan hiasan (lihat mulaiOtomatis di bawah).
   Pakai manual: Natal.pasang({ salju: true, lampu: true, hiasan: true, ucapan: false }).
   Semua lapisan hanya hiasan (aria-hidden, tidak bisa diklik). Bila pengguna memilih kurangi gerakan,
   salju digambar diam dan lampu serta hiasan tidak beranimasi. */
(function () {
  "use strict";
  var NS = "http://www.w3.org/2000/svg";
  var WARNA = [["#e5484d", "#ff6b6b"], ["#3fb37f", "#5fe0a2"], ["#ffd27a", "#ffe3a3"], ["#5aa9e6", "#8cc8ff"]];
  var diamDiminta = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
  var lapisan = {};

  function svg(tag, atr) {
    var n = document.createElementNS(NS, tag);
    for (var k in atr) n.setAttribute(k, atr[k]);
    return n;
  }
  function wadah() { return document.querySelector(".panel-dalam"); }

  /* ---------- Salju ---------- */
  function pasangSalju(w) {
    var kanvas = document.createElement("canvas");
    kanvas.className = "natal-salju-kanvas";
    kanvas.setAttribute("aria-hidden", "true");
    // Diletakkan tepat setelah tabir, supaya di atas foto tetapi di bawah teks.
    var tabir = w.querySelector(".panel-tabir");
    w.insertBefore(kanvas, tabir ? tabir.nextSibling : w.firstChild);
    var ctx = kanvas.getContext("2d"), butir = [], lebar = 0, tinggi = 0, rasio = 1, jalan = true, rangka = 0, akhir = 0;

    function ukur() {
      rasio = Math.min(2, window.devicePixelRatio || 1);
      lebar = w.clientWidth; tinggi = w.clientHeight;
      kanvas.width = Math.round(lebar * rasio); kanvas.height = Math.round(tinggi * rasio);
      ctx.setTransform(rasio, 0, 0, rasio, 0, 0);
      var jumlah = Math.min(110, Math.round(lebar * tinggi / 7000));
      while (butir.length < jumlah) butir.push(baru(true));
      butir.length = jumlah;
      if (diamDiminta) gambar();
    }
    function baru(acak) {
      var r = .8 + Math.pow(Math.random(), 2) * 2.2;
      return { x: Math.random() * lebar, y: acak ? Math.random() * tinggi : -6, r: r,
        v: 14 + r * 11 + Math.random() * 8, fase: Math.random() * 6.28, ayun: 6 + Math.random() * 14, a: .45 + r / 6 };
    }
    function gambar() {
      ctx.clearRect(0, 0, lebar, tinggi);
      for (var i = 0; i < butir.length; i++) {
        var b = butir[i];
        ctx.globalAlpha = b.a;
        ctx.beginPath(); ctx.arc(b.x + Math.sin(b.fase) * b.ayun, b.y, b.r, 0, 6.283); ctx.fillStyle = "#fff"; ctx.fill();
      }
      ctx.globalAlpha = 1;
    }
    function langkah(t) {
      rangka = 0;
      if (!jalan) return;
      var dt = Math.min(.05, akhir ? (t - akhir) / 1000 : 0); akhir = t;
      for (var i = 0; i < butir.length; i++) {
        var b = butir[i];
        b.y += b.v * dt; b.fase += dt * .9;
        if (b.y > tinggi + 6) { var n = baru(false); n.x = Math.random() * lebar; butir[i] = n; }
      }
      gambar();
      rangka = requestAnimationFrame(langkah);
    }
    function mulai() { if (!diamDiminta && !rangka && jalan) { akhir = 0; rangka = requestAnimationFrame(langkah); } }

    var ro = new ResizeObserver(ukur); ro.observe(w);
    // Berhenti saat panel tidak terlihat atau tab disembunyikan, supaya tidak memakan baterai.
    var io = new IntersectionObserver(function (e) { jalan = e[0].isIntersecting && !document.hidden; mulai(); });
    io.observe(w);
    function tab() { jalan = !document.hidden; mulai(); }
    document.addEventListener("visibilitychange", tab);
    ukur(); mulai();
    return function () { jalan = false; cancelAnimationFrame(rangka); ro.disconnect(); io.disconnect(); document.removeEventListener("visibilitychange", tab); kanvas.remove(); };
  }

  /* ---------- Untaian lampu ---------- */
  function pasangLampu(w) {
    var s = svg("svg", { "class": "natal-lampu-untai", "aria-hidden": "true", focusable: "false" });
    w.appendChild(s);
    function bangun() {
      var L = w.clientWidth;
      while (s.firstChild) s.removeChild(s.firstChild);
      s.setAttribute("viewBox", "0 0 " + L + " 46");
      // Kabel melengkung di antara titik gantung; lampu ditaruh merata di sepanjang lengkungan.
      var bentang = L < 500 ? 120 : 150, n = Math.max(2, Math.round(L / bentang)), pjg = L / n, kendur = 16, d = "";
      var titik = [];
      for (var i = 0; i < n; i++) {
        var x0 = i * pjg, x1 = x0 + pjg;
        d += (i ? "" : "M" + x0 + " 4") + " Q" + (x0 + pjg / 2) + " " + (4 + kendur * 2) + " " + x1 + " 4";
        var per = Math.max(3, Math.round(pjg / 34));
        for (var j = 1; j < per; j++) {
          var t = j / per, x = x0 + pjg * t, y = 4 + 2 * kendur * 2 * t * (1 - t), sudut = Math.atan2(2 * kendur * 2 * (1 - 2 * t) / pjg, 1) * 57.3;
          titik.push([x, y, sudut]);
        }
      }
      s.appendChild(svg("path", { d: d }));
      titik.forEach(function (p, k) {
        var w2 = WARNA[k % WARNA.length];
        var g = svg("g", { "class": "bola", transform: "translate(" + p[0].toFixed(1) + " " + p[1].toFixed(1) + ") rotate(" + p[2].toFixed(1) + ")" });
        g.style.setProperty("--cahaya", w2[1]);
        g.style.animationDelay = (-(k * 0.37) % 2.6).toFixed(2) + "s";
        g.appendChild(svg("rect", { x: -2.2, y: 0, width: 4.4, height: 4, rx: 1 }));
        g.appendChild(svg("ellipse", { cx: 0, cy: 10, rx: 4.2, ry: 6.6, fill: w2[0] }));
        s.appendChild(g);
      });
    }
    var ro = new ResizeObserver(bangun); ro.observe(w);
    bangun();
    return function () { ro.disconnect(); s.remove(); };
  }

  /* ---------- Bola hiasan ---------- */
  function pasangHiasan(w) {
    var d = document.createElement("div");
    d.className = "natal-hiasan-gantung"; d.setAttribute("aria-hidden", "true");
    [[64, 12, 0], [98, 14, 2], [76, 11, 1]].forEach(function (h, i) {
      var tali = h[0], r = h[1], w2 = WARNA[h[2]];
      var s = svg("svg", { width: r * 2 + 4, height: tali + r * 2 + 6, viewBox: (-r - 2) + " 0 " + (r * 2 + 4) + " " + (tali + r * 2 + 6), focusable: "false" });
      var id = "natal-kilau-" + i;
      var grad = svg("radialGradient", { id: id, cx: "35%", cy: "30%", r: "75%" });
      grad.appendChild(svg("stop", { offset: "0", "stop-color": "#fff", "stop-opacity": ".85" }));
      grad.appendChild(svg("stop", { offset: ".25", "stop-color": w2[1] }));
      grad.appendChild(svg("stop", { offset: "1", "stop-color": w2[0] }));
      var defs = svg("defs", {}); defs.appendChild(grad); s.appendChild(defs);
      s.appendChild(svg("line", { x1: 0, y1: 0, x2: 0, y2: tali, stroke: "rgba(255,210,122,.75)", "stroke-width": 1 }));
      s.appendChild(svg("rect", { x: -3.5, y: tali, width: 7, height: 5, rx: 1.2, fill: "#d9b25f" }));
      s.appendChild(svg("circle", { cx: 0, cy: tali + 4 + r, r: r, fill: "url(#" + id + ")" }));
      var span = document.createElement("span"); span.appendChild(s); d.appendChild(span);
    });
    w.appendChild(d);
    return function () { d.remove(); };
  }

  /* ---------- Ucapan ---------- */
  function pasangUcapan(w) {
    var p = document.createElement("p");
    p.className = "natal-ucapan-lencana";
    p.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M12 3l1.6 3.4L17 7l-2.5 2.4.6 3.6L12 11.3 8.9 13l.6-3.6L7 7l3.4-.6Z" fill="#ffd27a"/><path d="M12 13.5 6 21h12Z" fill="#3fb37f"/><circle cx="10" cy="18" r="1" fill="#e5484d"/><circle cx="14" cy="16.6" r="1" fill="#ffd27a"/></svg>';
    p.appendChild(document.createTextNode("Selamat Natal dan Tahun Baru"));
    var judul = w.querySelector(".panel-judul");
    if (judul) judul.appendChild(p); else w.appendChild(p);
    return function () { p.remove(); };
  }

  var PEMASANG = { salju: pasangSalju, lampu: pasangLampu, hiasan: pasangHiasan, ucapan: pasangUcapan };

  function pasang(pilihan) {
    var w = wadah(); if (!w) return;
    Object.keys(PEMASANG).forEach(function (k) {
      var mau = !!(pilihan && pilihan[k]);
      document.documentElement.classList.toggle("natal-" + k, mau);
      if (mau && !lapisan[k]) lapisan[k] = PEMASANG[k](w);
      if (!mau && lapisan[k]) { lapisan[k](); delete lapisan[k]; }
    });
  }

  /* Musim Natal: 1 Desember sampai 6 Januari menurut jam perangkat pengunjung.
     Tambahkan ?natal=1 pada alamat untuk mencoba di luar musim, atau ?natal=0 untuk mematikannya. */
  function musimNatal(d) { var b = d.getMonth(); return b === 11 || (b === 0 && d.getDate() <= 6); }
  function mulaiOtomatis() {
    var paksa = /[?&]natal=([01])/.exec(location.search);
    var aktif = paksa ? paksa[1] === "1" : musimNatal(new Date());
    if (aktif) pasang({ salju: true, lampu: true, hiasan: true, ucapan: false });
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", mulaiOtomatis); else mulaiOtomatis();

  window.Natal = { pasang: pasang, musimNatal: musimNatal };
})();
