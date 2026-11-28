/* Beruang madu piksel: tombol menuju mode arkade.
   Beruang kecil berkacamata hitam selalu berdiri di pojok bawah layar.
   Sesekali ia melambai atau kacamatanya berkilau. Bila diklik, layar berubah jadi
   piksel dan beranda beralih ke mode arkade.
   Bila pop up tampil di pojok yang sama, beruang pindah ke pojok seberang. Beruang tidak menimpa tautan
   atau tombol: bila pojoknya berisi tautan, ia naik, pindah pojok, atau menyingkir sampai pojok kosong.
   Label MODE ARKADE hanya tampil saat beruang disorot atau difokus.
   Mode arkade ada di arkade/; pilihan mode disimpan di sana (localStorage "layanan-arkade").
   ?beruang=0 menyembunyikannya. Pratinjau dari dasbor admin (?pratinjau=1) tidak memuatnya. */
(function () {
  "use strict";

  var KUNCI_SESI = "layanan-beruang";   // sudah pernah berjalan masuk di sesi ini
  var skrip = document.currentScript;
  var TUJUAN = (skrip && skrip.getAttribute("data-tujuan")) || "arkade/";
  if (/[?&](beruang=0|pratinjau=1)\b/.test(location.search)) return;
  var diam = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
  function sesi(k, v) { try { if (v === undefined) return sessionStorage.getItem(k); sessionStorage.setItem(k, v); } catch (e) { return null; } }

  /* ---------- Sprite 16x16 ----------
     o garis, b bulu hitam, m moncong, n hidung, c tanda dada, w kilau, k kaca mata hitam, l lidah */
  var WARNA = { o: "#0e0b09", b: "#221d1d", m: "#d6a466", n: "#0e0b09", c: "#f2a531", w: "#f6efe4", l: "#e0607a", k: "#05080c" };
  var DASAR = [
    "................",
    "..ooo......ooo..",
    ".obbbo....obbbo.",
    ".obbbboooobbbbo.",
    "..obbbbbbbbbbo..",
    ".obbbbbbbbbbbbo.",
    ".owkkkkookwkkko.",
    ".obbbbbbbbbbbbo.",
    "..obbmmoommbbo..",
    "..obbmmmmmmbbo..",
    "...oobbbbbboo...",
    "..obbcbbbbcbbo..",
    ".obobbccccbbobo.",
    ".obobbbbbbbbobo.",
    "..oobbbbbbbboo..",
    "...ooo....ooo..."
  ];
  // Bingkai lain dibuat dengan mengganti baris tertentu dari DASAR.
  function ubah(ganti) { var k = DASAR.slice(); for (var y in ganti) k[y] = ganti[y]; return k; }
  var SENYUM = { 9: "..obbmmllmmbbo.." };
  var LAMBAI = {
    7: ".obbbbbbbbbbbooo", 8: "..obbmmoommbbomo", 9: "..obbmmllmmbbobo", 10: "...oobbbbbboobbo",
    11: "..obbcbbbbcbbbbo", 12: ".obobbccccbbbbo.", 13: ".obobbbbbbbbbbo."
  };
  function gabung(a, b) { var h = {}, k; for (k in a) h[k] = a[k]; for (k in b) h[k] = b[k]; return h; }

  var BINGKAI = {
    jalan1: ubah({ 15: "...oo.....ooo..." }),
    jalan2: ubah({ 15: "...ooo.....oo..." }),
    diam: DASAR,
    kilau: ubah({ 6: ".okkwkkookkkwko." }),
    lambai1: ubah(gabung(SENYUM, LAMBAI)),
    lambai2: ubah(SENYUM),
    loncat: ubah(gabung(gabung(SENYUM, LAMBAI), { 15: "................" }))
  };

  function gambar(baris) {
    var s = "";
    for (var y = 0; y < baris.length; y++) {
      for (var x = 0; x < 16; x++) {
        var w = WARNA[baris[y].charAt(x)];
        if (w) s += '<rect x="' + x + '" y="' + y + '" width="1.02" height="1.02" fill="' + w + '"/>';
      }
    }
    return s;
  }

  var CSS =
    ".beruang{position:fixed;z-index:55;left:0;bottom:max(10px,env(safe-area-inset-bottom));width:60px;height:60px;padding:0;margin:0;border:0;background:none;cursor:pointer;" +
      "transition:opacity .2s steps(3);-webkit-tap-highlight-color:transparent;filter:drop-shadow(2px 0 0 #ffd27a) drop-shadow(-2px 0 0 #ffd27a) drop-shadow(0 2px 0 #ffd27a) drop-shadow(0 -2px 0 #ffd27a) drop-shadow(3px 4px 0 rgba(10,20,32,.35))}" +
    ".beruang svg{display:block;width:100%;height:100%;shape-rendering:crispEdges}" +
    ".beruang g{display:none}.beruang g.aktif{display:inline}" +
    ".beruang:focus-visible{outline:3px solid #f2b44a;outline-offset:6px}" +
    ".beruang.balik svg{transform:scaleX(-1)}" +
    ".beruang-gelembung{position:absolute;bottom:72px;white-space:nowrap;pointer-events:none;" +
      "font:700 13px/1 'Pixelify Sans',ui-monospace,Consolas,monospace;letter-spacing:.04em;color:#0a1420;background:#ffd27a;padding:7px 9px;" +
      "box-shadow:0 -3px 0 #0a1420,0 3px 0 #0a1420,-3px 0 0 #0a1420,3px 0 0 #0a1420;opacity:0;transition:opacity .12s steps(2)}" +
    ".beruang-gelembung:after{content:'';position:absolute;top:100%;width:6px;height:6px;background:#0a1420}" +
    ".beruang.kanan .beruang-gelembung{right:4px}.beruang.kanan .beruang-gelembung:after{right:20px}" +
    ".beruang.kiri .beruang-gelembung{left:4px}.beruang.kiri .beruang-gelembung:after{left:20px}" +
    ".beruang:hover .beruang-gelembung,.beruang:focus-visible .beruang-gelembung{opacity:1}" +
    ".beruang.menyingkir{opacity:0;visibility:hidden;transition:opacity .2s steps(3),visibility 0s .2s}" +
    ".beruang-tabir{position:fixed;inset:0;z-index:100;pointer-events:none}" +
    "html.ada-beruang main.isi{padding-bottom:92px}" +
    "@media (max-width:600px){.beruang{width:48px;height:48px}.beruang-gelembung{bottom:60px}html.ada-beruang main.isi{padding-bottom:76px}}";

  var JARAK = 14;   // jarak dari tepi layar (px)
  var tombol, bingkaiSkrg, posisi = 0, pojok = "kanan", naik = 0, waktuJalan = null, sudah = false, sibuk = false;
  var akhirGulir = 0, menyingkir = false;
  var INTERAKTIF = "a[href],button,input,select,textarea,summary,[role=button],[tabindex]:not([tabindex='-1'])";

  function buat() {
    var g = document.createElement("style");
    g.textContent = CSS;
    document.head.appendChild(g);
    tombol = document.createElement("button");
    tombol.type = "button";
    tombol.className = "beruang kanan";
    tombol.setAttribute("aria-label", "Beralih ke mode arkade");
    var isi = '<svg viewBox="0 0 16 16" aria-hidden="true">';
    for (var nama in BINGKAI) isi += '<g data-b="' + nama + '">' + gambar(BINGKAI[nama]) + "</g>";
    tombol.innerHTML = isi + '</svg><span class="beruang-gelembung" aria-hidden="true">MODE ARKADE ▶</span>';
    tombol.addEventListener("click", masukArkade);
    tombol.addEventListener("mouseenter", function () { lambai(2); });
    tombol.addEventListener("focus", function () { lambai(2); });
    document.body.appendChild(tombol);
    document.documentElement.classList.add("ada-beruang");
  }

  function tampil(nama) {
    if (bingkaiSkrg === nama) return;
    var lama = tombol.querySelector("g.aktif");
    if (lama) lama.classList.remove("aktif");
    tombol.querySelector('g[data-b="' + nama + '"]').classList.add("aktif");
    bingkaiSkrg = nama;
  }
  function letak(x, angkat) { posisi = x; tombol.style.transform = "translate(" + Math.round(x) + "px," + (angkat || 0) + "px)"; }
  function xPojok(p) { return p === "kiri" ? JARAK : window.innerWidth - tombol.offsetWidth - JARAK; }
  // Bagian halaman yang tidak ikut menggulir (panel samping yang lengket atau tetap).
  function menetap(el) {
    for (; el && el !== document.body; el = el.parentElement) { var pos = getComputedStyle(el).position; if (pos === "fixed" || pos === "sticky") return true; }
    return false;
  }
  function berisi(el) {
    if (/^(A|BUTTON|INPUT|SELECT|TEXTAREA|IMG|SVG|LABEL|H[1-6]|P|LI)$/i.test(el.tagName)) return true;
    for (var n = el.firstChild; n; n = n.nextSibling) if (n.nodeType === 3 && n.textContent.trim()) return true;
    return false;
  }
  // Pojok dianggap kosong bila tak ada teks dari bagian yang menetap di bawah beruang,
  // dan tak ada tautan atau tombol (menetap maupun ikut menggulir).
  function kosongDi(x, y, w) {
    // Titik periksa sedikit di luar badan beruang supaya ada jarak dari tautan di sekitarnya.
    var a = -6, z = w + 6, m = w / 2;
    var titik = [[x + a, y + a], [x + m, y + a], [x + z, y + a], [x + a, y + m], [x + m, y + m], [x + z, y + m], [x + a, y + z], [x + m, y + z], [x + z, y + z]];
    for (var i = 0; i < titik.length; i++) {
      var dibawah = document.elementsFromPoint(titik[i][0], titik[i][1]);
      for (var j = 0; j < dibawah.length; j++) {
        var el = dibawah[j];
        if (tombol.contains(el) || el === document.documentElement || el === document.body) continue;
        if (berisi(el) && menetap(el)) return false;
        if (el.closest && el.closest(INTERAKTIF)) return false;
        break;
      }
    }
    return true;
  }
  // Seberapa jauh beruang perlu naik dari tepi bawah supaya pojoknya kosong; null bila tak ada.
  function cariNaik(p) {
    var w = tombol.offsetWidth, x = xPojok(p), dasar = window.innerHeight - w - JARAK;
    for (var dy = 0; dy <= 240; dy += 12) if (kosongDi(x, dasar - dy, w)) return dy;
    return null;
  }
  // Pojok dan ketinggian yang kosong: pojok sekarang lebih dulu, lalu pojok seberang.
  function cariTempat() {
    var urut = [pojok, pojok === "kanan" ? "kiri" : "kanan"];
    for (var i = 0; i < urut.length; i++) {
      if (tertutup(urut[i])) continue;
      var dy = cariNaik(urut[i]);
      if (dy !== null) return { p: urut[i], dy: dy };
    }
    return null;
  }
  function singkir(ya) { menyingkir = ya; tombol.classList.toggle("menyingkir", ya); }
  function aturNaik(dy) { naik = dy; tombol.style.bottom = "calc(max(10px, env(safe-area-inset-bottom)) + " + dy + "px)"; }

  function aturPojok(p) { pojok = p; tombol.classList.toggle("kanan", p === "kanan"); tombol.classList.toggle("kiri", p === "kiri"); }

  // Berjalan ke x tujuan dengan langkah piksel.
  function jalan(keX, selesai) {
    clearInterval(waktuJalan);
    var arah = keX >= posisi ? 1 : -1, langkah = 0;
    sibuk = true;
    tombol.classList.toggle("balik", arah < 0);
    waktuJalan = setInterval(function () {
      langkah++;
      var x = posisi + arah * 6, tiba = arah > 0 ? x >= keX : x <= keX;
      if (tiba) x = keX;
      tampil(langkah % 2 ? "jalan1" : "jalan2");
      letak(x, langkah % 2 ? -2 : 0);
      if (tiba) { clearInterval(waktuJalan); tombol.classList.remove("balik"); tampil("diam"); letak(x, 0); sibuk = false; if (selesai) selesai(); }
    }, 90);
  }

  function urutan(daftar, selesai) {
    var i = 0;
    sibuk = true;
    (function lanjut() {
      if (sudah) return;
      if (i >= daftar.length) { sibuk = false; if (selesai) selesai(); return; }
      var l = daftar[i++];
      tampil(l[0]);
      setTimeout(lanjut, l[1]);
    })();
  }
  function lambai(kali) {
    if (sibuk || sudah || diam) return;
    var d = [];
    for (var i = 0; i < kali; i++) d.push(["lambai1", 240], ["lambai2", 240]);
    d.push(["diam", 10]);
    urutan(d);
  }

  // Tingkah sesekali saat menunggu: melambai atau kacamata berkilau.
  function iseng() {
    setTimeout(function () {
      if (!sudah && !document.hidden && !sibuk && !diam) {
        if (Math.random() < .45) { tombol.classList.add("bicara"); lambai(3); setTimeout(function () { tombol.classList.remove("bicara"); }, 2200); }
        else urutan([["kilau", 160], ["diam", 120], ["kilau", 160], ["diam", 10]]);
      }
      iseng();
    }, 9000 + Math.random() * 9000);
  }

  // Pop up tampil di pojok bawah. Bila menutupi beruang, beruang pindah ke pojok seberang.
  function tertutup(p) {
    var x = xPojok(p), w = tombol.offsetWidth, y = window.innerHeight - w - JARAK - naik;
    var daftar = document.querySelectorAll(".popup");
    for (var i = 0; i < daftar.length; i++) {
      var r = daftar[i].getBoundingClientRect(), gaya = getComputedStyle(daftar[i]);
      if (!r.width || !r.height || gaya.visibility === "hidden" || gaya.display === "none" || Number(gaya.opacity) < .1) continue;
      if (r.left < x + w && r.right > x && r.top < y + w && r.bottom > y) return true;
    }
    return false;
  }
  function awasi() {
    window.addEventListener("scroll", function () { akhirGulir = Date.now(); }, { passive: true });
    setInterval(function () {
      if (sudah || sibuk || Date.now() - akhirGulir < 300) return;
      var t = cariTempat();
      if (!t) { if (!menyingkir) singkir(true); return; }
      var mau = t.p, tujuanX = xPojok(mau);
      // Muncul lagi setelah menyingkir: langsung di tempat yang kosong.
      if (menyingkir) { aturPojok(mau); aturNaik(t.dy); letak(tujuanX); singkir(false); return; }
      if (mau !== pojok || Math.abs(tujuanX - posisi) > 2) {
        aturPojok(mau);
        if (diam) { letak(tujuanX); aturNaik(t.dy); }
        else if (Math.abs(tujuanX - posisi) > 160) {
          // Jarak jauh: menghilang sebentar, lalu berjalan masuk dari tepi pojok tujuan.
          sibuk = true;
          tombol.style.opacity = "0";
          setTimeout(function () {
            aturNaik(t.dy);
            letak(mau === "kiri" ? -tombol.offsetWidth : window.innerWidth);
            tombol.style.opacity = "";
            jalan(tujuanX);
          }, 200);
        }
        else jalan(tujuanX, function () { aturNaik(t.dy); });
      }
      else if (t.dy !== naik) aturNaik(t.dy);
    }, 400);
  }

  // Kembali dari mode arkade: tirai piksel yang dipasang <head> (kelas "tirai") dibuka acak dari pojok beruang.
  function bukaTirai() {
    var h = document.documentElement;
    if (!h.classList.contains("tirai")) return;
    var gelap = h.getAttribute("data-mode") === "gelap";
    var warna = gelap ? ["#0a1420", "#0f2236", "#13304b"] : ["#efe6d2", "#f1e5c8", "#fbf5e8"];
    var k = document.createElement("canvas");
    k.className = "beruang-tabir";
    k.width = window.innerWidth; k.height = window.innerHeight;
    document.body.appendChild(k);
    var c = k.getContext("2d"), ukuran = Math.max(24, Math.round(Math.min(k.width, k.height) / 14)), kotak = [];
    for (var y = 0; y < k.height; y += ukuran) for (var x = 0; x < k.width; x += ukuran) {
      c.fillStyle = warna[(Math.random() * warna.length) | 0]; c.fillRect(x, y, ukuran, ukuran);
      kotak.push([x, y, Math.hypot(x - k.width, y - k.height) + Math.random() * ukuran * 6]);
    }
    h.classList.remove("tirai");
    if (diam) { k.remove(); return; }
    kotak.sort(function (a, b) { return a[2] - b[2]; });
    var i = 0, per = Math.ceil(kotak.length / 26);
    setTimeout(function langkah() {
      for (var n = 0; n < per && i < kotak.length; n++, i++) c.clearRect(kotak[i][0], kotak[i][1], ukuran, ukuran);
      if (i < kotak.length) requestAnimationFrame(langkah); else k.remove();
    }, 120);
  }

  function mulai() {
    buat();
    bukaTirai();
    tampil("diam");
    var x = xPojok(pojok);
    aturNaik(cariNaik(pojok) || 0);
    if (diam || sesi(KUNCI_SESI)) { letak(x); }
    else {
      sesi(KUNCI_SESI, "1");
      letak(window.innerWidth + 10);
      setTimeout(function () {
        jalan(xPojok(pojok), function () { tombol.classList.add("bicara"); lambai(3); setTimeout(function () { tombol.classList.remove("bicara"); }, 2400); });
      }, 600);
    }
    awasi();
    iseng();
  }

  // Transisi: layar tertutup kotak-kotak piksel (navy atau krem mengikuti tema) yang menyebar dari beruang, lalu pindah ke mode arkade.
  function masukArkade() {
    if (sudah) return;
    sudah = true;
    clearInterval(waktuJalan);
    tombol.classList.remove("bicara");
    if (diam) { location.href = TUJUAN; return; }
    tampil("loncat"); letak(posisi, -14);
    setTimeout(function () { tampil("lambai2"); letak(posisi, 0); }, 180);
    var kanvas = document.createElement("canvas");
    kanvas.className = "beruang-tabir";
    var L = window.innerWidth, T = window.innerHeight;
    kanvas.width = L; kanvas.height = T;
    document.body.appendChild(kanvas);
    var c = kanvas.getContext("2d");
    var ukuran = Math.max(24, Math.round(Math.min(L, T) / 14));
    var kotak = [];
    for (var y = 0; y < T; y += ukuran) for (var x = 0; x < L; x += ukuran) kotak.push([x, y]);
    var bx = posisi + tombol.offsetWidth / 2, by = T - 40;
    kotak.forEach(function (k) { k[2] = Math.hypot(k[0] - bx, k[1] - by) + Math.random() * ukuran * 6; });
    kotak.sort(function (a, b) { return a[2] - b[2]; });
    var warna = document.documentElement.getAttribute("data-mode") === "gelap" ? ["#0a1420", "#0f2236", "#13304b"] : ["#efe6d2", "#f1e5c8", "#fbf5e8"];
    try { sessionStorage.setItem("layanan-tirai", "1"); } catch (e) { /* abaikan */ }
    var i = 0, perBingkai = Math.ceil(kotak.length / 32);
    setTimeout(function langkah() {
      for (var n = 0; n < perBingkai && i < kotak.length; n++, i++) {
        c.fillStyle = Math.random() < .04 ? "#f2b44a" : warna[(Math.random() * warna.length) | 0];
        c.fillRect(kotak[i][0], kotak[i][1], ukuran, ukuran);
      }
      if (i < kotak.length) requestAnimationFrame(langkah);
      else setTimeout(function () { location.href = TUJUAN; }, 180);
    }, 350);
  }

  // Kembali lewat tombol Back: muat ulang supaya tabir piksel tidak tertinggal.
  window.addEventListener("pageshow", function (e) { if (e.persisted) location.reload(); });
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", mulai);
  else mulai();
})();
