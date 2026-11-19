/* Mode arkade beranda Layanan Subbagian Umum (tata letak Jendela RPG).
   Dibuka dari beruang madu di pojok beranda (beruang.js). Pilihan mode disimpan di localStorage
   "layanan-arkade" ("1"); beranda langsung mengalihkan ke sini selama kunci itu ada, dan tombol KELUAR
   menghapusnya. Terang dan gelap mengikuti saklar tema situs (tema.js, kunci "layanan-mode").
   Isi, pop up, dan statistik memakai sumber yang sama dengan beranda. */
(function () {
  "use strict";
  var K = window.Konten, layar = document.getElementById("layar");
  var KUNCI_ARKADE = "layanan-arkade";
  var diam = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
  var s = { babak: "semua", cari: "", pilih: 0, kabar: 0, suara: true, diketik: -1 };

  /* ---------- Sprite piksel 12×12 (satu warna, digambar dari peta karakter) ---------- */
  var SPRITE = {
    pesawat: ["............", ".....##.....", ".....##.....", "....####....", "...######...", "############", "############", "....####....", ".....##.....", "....####....", "...##..##...", "............"],
    dokumen: ["..#######...", "..#.....##..", "..#.....#.#.", "..#.....####", "..#.##.....#", "..#........#", "..#.#####..#", "..#........#", "..#.#####..#", "..#........#", "..##########", "............"],
    map: ["............", ".####.......", "#....#######", "#..........#", "#..........#", "#..........#", "#..........#", "#..........#", "#..........#", "############", "............", "............"],
    dompet: ["............", "..########..", ".#........#.", "############", "#..........#", "#.......####", "#.......#..#", "#.......####", "#..........#", "############", "............", "............"],
    kartu: ["............", "############", "#..........#", "############", "############", "#..........#", "#.###......#", "#..........#", "############", "............", "............", "............"],
    sasaran: ["....####....", "..##....##..", ".#..####..#.", ".#.#....#.#.", "#.#..##..#.#", "#.#.####.#.#", "#.#.####.#.#", "#.#..##..#.#", ".#.#....#.#.", ".#..####..#.", "..##....##..", "....####...."],
    kalender: ["..#....#....", "############", "#..........#", "############", "#..........#", "#.##.##.##.#", "#..........#", "#.##.##.##.#", "#..........#", "#.##.##....#", "############", "............"],
    pdf: ["..#######...", "..#.....##..", "..#.....####", "..#........#", "############", "#.##.##.###.", "#.##.#.#.#..", "#.#..#.#.##.", "#.#..##..#..", "############", "..#........#", "..##########"],
    arsip: ["............", "############", "#..........#", "############", ".#........#.", ".#..####..#.", ".#........#.", ".#........#.", ".#........#.", ".##########.", "............", "............"],
    bintang: [".....##.....", ".....##.....", "....####....", "############", ".##########.", "..########..", "...######...", "..########..", "..###..###..", ".##......##.", "............", "............"]
  };
  function sprite(nama, warna) {
    var p = SPRITE[nama] || SPRITE.dokumen, r = "";
    p.forEach(function (baris, y) { for (var x = 0; x < baris.length; x++) if (baris[x] === "#") r += '<rect x="' + x + '" y="' + y + '" width="1" height="1"/>'; });
    return '<svg class="sprite" viewBox="0 0 12 12" aria-hidden="true" focusable="false" fill="' + (warna || "currentColor") + '">' + r + "</svg>";
  }
  function spriteTautan(t, g) {
    var x = (t.judul + " " + (t.kunci || "")).toLowerCase();
    if (g && g.arsip) return "arsip";
    if (/olah pdf|bengkel/.test(x)) return "pdf";
    if (/monitoring e-perjadin|pantau/.test(x)) return "pesawat";
    if (/template|templat|nota dinas/.test(x)) return "dokumen";
    if (/data dukung|suket/.test(x)) return "map";
    if (/sisa dana|saldo/.test(x)) return "dompet";
    if (/rekening/.test(x)) return "kartu";
    if (/capaian|caput/.test(x)) return "sasaran";
    if (/prognosa|tup/.test(x)) return "kalender";
    return "dokumen";
  }
  var SPRITE_KELOMPOK = { perjadin: "pesawat", keuangan: "dompet", pdf: "pdf", perkakas: "pdf", arsip: "arsip" };

  // Beruang madu mini 16x16 (berkacamata hitam) untuk potret di kotak dialog.
  var MINI = ["................", "..ooo......ooo..", ".obbbo....obbbo.", ".obbbboooobbbbo.", "..obbbbbbbbbbo..", ".obbbbbbbbbbbbo.", ".owkkkkookwkkko.", ".obbbbbbbbbbbbo.",
    "..obbmmoommbbo..", "..obbmmmmmmbbo..", "...oobbbbbboo...", "..obbcbbbbcbbo..", ".obobbccccbbobo.", ".obobbbbbbbbobo.", "..oobbbbbbbboo..", "...ooo....ooo..."];
  var WARNA_MINI = { o: "#05080c", b: "#221d1d", m: "#d6a466", c: "#f2a531", w: "#e8f1f8", k: "#05080c" };
  function mini(ukuran) {
    var r = "";
    MINI.forEach(function (b, y) { for (var x = 0; x < 16; x++) { var w = WARNA_MINI[b[x]]; if (w) r += '<rect x="' + x + '" y="' + y + '" width="1.02" height="1.02" fill="' + w + '"/>'; } });
    return '<svg class="mini" viewBox="0 0 16 16" width="' + ukuran + '" height="' + ukuran + '" aria-hidden="true" focusable="false">' + r + "</svg>";
  }

  /* ---------- Isi ----------
     Sumbernya sama dengan beranda: simpanan terakhir di peramban ini (ditulis beranda maupun halaman ini),
     lalu KONTEN_BAWAAN di konten.js. Setelah tampil, isi terbaru diambil dari Apps Script. */
  var KUNCI_SIMPAN = "layanan-konten";
  function baca(kunci) { try { var t = localStorage.getItem(kunci); return t ? JSON.parse(t) : null; } catch (e) { return null; } }
  function tulis(kunci, isi) { try { localStorage.setItem(kunci, JSON.stringify(isi)); } catch (e) { /* abaikan */ } }
  var konten = K.rapikan(baca(KUNCI_SIMPAN) || window.KONTEN_BAWAAN), jejak = JSON.stringify(konten);

  function esc(v) { return String(v == null ? "" : v).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }
  function teks(v) { return esc(v).replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>").replace(/_([^_\s][^_]*)_/g, "<em>$1</em>"); }
  function polos(v) { return K.polos(v); }
  function atr(x) { return 'href="' + esc(x.alamat) + '"' + (x.luar ? ' target="_blank" rel="noopener"' : "") + ' data-id="' + esc(x.id) + '"'; }

  var kelompok = [], info = [], semua = [], BABAK = [];
  function siapkan() {
    var tayang = function (x) { return x.tampil !== false && K.dalamJadwal(x); };
    kelompok = konten.kelompok.filter(function (g) { return g.tampil !== false; }).map(function (g) {
      return { id: g.id, nama: polos(g.nama), judul: polos(g.judulBagian || g.nama), arsip: !!g.arsip, tautan: konten.tautan.filter(function (t) { return t.kelompok === g.id && tayang(t) && K.alamatAman(t.alamat); }) };
    }).filter(function (g) { return g.tautan.length; });
    info = konten.info.filter(tayang);
    semua = [];
    kelompok.forEach(function (g) {
      g.tautan.forEach(function (t) {
        var alamat = K.alamatAman(t.alamat);
        semua.push({ t: t, g: g, alamat: alamat, luar: K.luar(alamat), id: K.slug(K.polos(t.judul)) });
      });
    });
    BABAK = [{ id: "semua", nama: "Semua", judul: "Semua layanan", tautan: semua }].concat(kelompok);
    if (!BABAK.some(function (g) { return g.id === s.babak; })) s.babak = "semua";
  }
  function hasil() {
    var q = s.cari.trim().toLowerCase();
    return semua.filter(function (x) {
      if (!q) return s.babak === "semua" || x.g.id === s.babak;   // pencarian selalu menjelajah semua babak
      var h = (polos(x.t.judul) + " " + polos(x.t.uraian) + " " + (x.t.kunci || "") + " " + x.g.nama).toLowerCase();
      return q.split(/\s+/).every(function (k) { return h.indexOf(k) >= 0; });
    });
  }
  var BLN = ["JAN", "FEB", "MAR", "APR", "MEI", "JUN", "JUL", "AGU", "SEP", "OKT", "NOV", "DES"];
  function tanggal() { var d = new Date(); return String(d.getDate()).padStart(2, "0") + " " + BLN[d.getMonth()] + " " + d.getFullYear(); }
  function dua(n) { return String(n).padStart(2, "0"); }
  function babakKini() { return BABAK.filter(function (g) { return g.id === s.babak; })[0] || BABAK[0]; }
  function lencana(x) { return '<span class="lencana px' + (x.g.arsip ? " arsip" : x.luar ? " luar" : "") + '">' + (x.g.arsip ? "ARSIP" : x.luar ? "LUAR ↗" : "MASUK →") + "</span>"; }

  /* ---------- Suara ----------
     Nyala sebagai bawaan; peramban baru membunyikannya setelah klik atau tombol pertama. Pilihan disimpan di perangkat. */
  var audio = null;
  function bunyi(frek, lama) {
    if (!s.suara) return;
    try {
      audio = audio || new (window.AudioContext || window.webkitAudioContext)();
      var o = audio.createOscillator(), g = audio.createGain();
      o.type = "square"; o.frequency.value = frek; g.gain.value = .04;
      o.connect(g); g.connect(audio.destination); o.start(); o.stop(audio.currentTime + (lama || .05));
    } catch (e) { /* abaikan */ }
  }

  /* ---------- Potongan halaman ---------- */
  function gelap() { return document.documentElement.getAttribute("data-mode") === "gelap"; }
  function hud() {
    return '<header class="hud px"><span>KPKNL <b>BPP</b></span><span class="tengah">LAYANAN <b>' + dua(semua.length) + "</b> · BABAK <b>" + dua(kelompok.length) + "</b></span>" +
      '<span class="kanan"><button type="button" class="tombol-px" data-suara aria-pressed="' + s.suara + '" aria-label="Efek suara">' + (s.suara ? "♪ ON" : "♪ OFF") + "</button>" +
      '<button type="button" class="tombol-px" data-tema aria-label="' + (gelap() ? "Ganti ke tampilan terang" : "Ganti ke tampilan gelap") + '">' + (gelap() ? "☀" : "☾") + "</button>" +
      '<button type="button" class="tombol-px" data-keluar>KELUAR</button></span></header>';
  }
  // Adegan banner bergantian tiap kunjungan (BannerBeruang.pilih) dan bisa diganti dengan tombol di pojok banner.
  var KET_ADEGAN = {
    dermaga: "melambai di dermaga Teluk Balikpapan", mancing: "memancing di dermaga Teluk Balikpapan",
    speedboat: "menyetir speedboat di Teluk Balikpapan", papan: "menunjuk papan bertuliskan JOSJIS di dermaga Teluk Balikpapan"
  };
  function banner() {
    var g = window.BannerBeruang && BannerBeruang.GELEMBUNG ? BannerBeruang.GELEMBUNG[s.adegan] : { left: "47%", top: "10%" };
    return '<div class="banner"><canvas data-banner role="img" aria-label="Beruang madu piksel berkacamata hitam ' + (KET_ADEGAN[s.adegan] || KET_ADEGAN.dermaga) + '"></canvas>' +
      '<span class="gelembung" aria-hidden="true"' + (g ? ' style="left:' + g.left + ';top:' + g.top + '"' : " hidden") + ">JOSJIS!</span>" +
      '<span class="stiker">' + tanggal() + "</span>" +
      (window.BannerBeruang && BannerBeruang.DESAIN ? '<button type="button" class="ganti-adegan" data-adegan aria-label="Ganti adegan banner">ADEGAN ▶</button>' : "") + "</div>";
  }
  function cari() {
    return '<div class="cari-px" role="search"><label for="cariPx">CARI&gt;</label><input type="search" id="cariPx" autocomplete="off" placeholder="ketik nama layanan..." value="' + esc(s.cari) + '"><kbd aria-hidden="true">/</kbd></div>';
  }
  function judulDaftar() { return s.cari.trim() ? "HASIL PENCARIAN" : babakKini().judul.toUpperCase(); }
  function daftar(h) {
    return '<main id="daftar"><ul class="level" aria-label="Daftar layanan">' + (h.length ? h.map(function (x, i) {
      return '<li><a class="lv' + (i === s.pilih ? " pilih" : "") + '" data-i="' + i + '" ' + atr(x) + '><span class="kur" aria-hidden="true">▶</span><span class="sprite-wadah">' + sprite(spriteTautan(x.t, x.g)) + "</span>" +
        "<span><b>" + teks(x.t.judul) + "</b><small>" + teks(x.t.uraian) + "</small></span>" + lencana(x) + (x.luar ? '<span class="sr-only"> (membuka tab baru)</span>' : "") + "</a></li>";
    }).join("") : '<li class="kosong-px">TIDAK ADA YANG COCOK.<br>COBA KATA KUNCI LAIN.</li>') + "</ul></main>";
  }
  function dialog() {
    var k = info[s.kabar % Math.max(1, info.length)];
    if (!k) return '<div class="dialog-wadah"><div class="potret">' + mini(72) + '</div><div class="dialog"><span class="siapa">BERUANG</span><p>Belum ada kabar baru. Selamat bekerja!</p></div></div>';
    return '<div class="dialog-wadah"><div class="potret">' + mini(72) + '</div><div class="dialog" role="status"><span class="siapa">BERUANG' + (k.label ? " · " + esc(polos(k.label).replace(/^\[|\]$/g, "")).toUpperCase() : "") + "</span>" +
      (k.judul ? "<h3>" + teks(k.judul) + "</h3>" : "") + '<p id="isiDialog">' + teks(k.isi) + "</p>" +
      (info.length > 1 ? '<button type="button" data-lanjut aria-label="Kabar berikutnya">LANJUT ' + (s.kabar % info.length + 1) + "/" + info.length + ' <span aria-hidden="true">▼</span></button>' : "") + "</div></div>";
  }
  function kaki() {
    return '<footer class="kaki-px"><div class="kontrol" aria-hidden="true"><span><kbd>/</kbd>CARI</span><span><kbd>←</kbd><kbd>→</kbd>BABAK</span><span><kbd>↑</kbd><kbd>↓</kbd>PILIH</span><span><kbd>ENTER</kbd>BUKA</span></div>' +
      "<span>" + esc(polos(konten.umum.kaki)) + "</span></footer>";
  }
  function html(h) {
    return hud() +
      '<div class="c-atas">' + banner() +
      '<section class="jendela status" aria-labelledby="judulArkade"><h2>STATUS</h2><h1 class="judul-px" id="judulArkade">LAYANAN<br>UMUM</h1><p class="sub-px">Subbagian Umum KPKNL Balikpapan</p>' +
      "<dl><dt>LAYANAN</dt><dd>" + dua(semua.length) + "</dd><dt>BABAK</dt><dd>" + dua(kelompok.length) + "</dd><dt>KABAR</dt><dd>" + dua(info.length) + " baru</dd><dt>HARI</dt><dd>" + tanggal() + "</dd>" +
      '<dt>SEMANGAT</dt><dd><span class="bar" aria-hidden="true"><i></i></span> JOSJIS</dd></dl></section></div>' +
      '<div class="c-tengah"><nav class="jendela" id="babak" aria-labelledby="judulBabak"><h2 id="judulBabak">PERINTAH</h2><ul class="perintah">' + BABAK.map(function (g) {
        return '<li><button type="button" data-babak="' + esc(g.id) + '" aria-pressed="' + (s.babak === g.id) + '"><span class="kur" aria-hidden="true">▶</span>' + esc(g.nama) + "<small>" + g.tautan.length + "</small></button></li>";
      }).join("") + "</ul></nav>" +
      '<section class="jendela" aria-labelledby="judulLevel"><h2 id="judulLevel">' + esc(judulDaftar()) + "</h2>" + cari() + daftar(h) + "</section></div>" +
      '<section class="c-bawah" id="kabar" aria-label="Kabar">' + dialog() + "</section>" + kaki();
  }

  /* ---------- Menggambar ---------- */
  var bannerAktif = null;
  function gambar(fokusCari) {
    var y = window.scrollY;
    if (bannerAktif) bannerAktif.henti();
    layar.innerHTML = html(hasil());
    var c = layar.querySelector("canvas[data-banner]");
    if (c && window.BannerBeruang) bannerAktif = BannerBeruang(c, { diam: diam, desain: s.adegan });
    window.scrollTo(0, y);
    if (fokusCari) { var ci = document.getElementById("cariPx"); ci.focus(); ci.setSelectionRange(ci.value.length, ci.value.length); }
    if (!diam && info.length && s.diketik !== s.kabar) { s.diketik = s.kabar; ketik(); }
  }
  // Teks kabar muncul huruf demi huruf seperti kotak dialog gim.
  var pewaktuKetik;
  function ketik() {
    var p = document.getElementById("isiDialog"); if (!p) return;
    var penuh = p.innerHTML, polosnya = p.textContent, n = 0;
    clearInterval(pewaktuKetik);
    p.setAttribute("aria-label", polosnya); p.textContent = "";
    pewaktuKetik = setInterval(function () {
      n += 2; p.textContent = polosnya.slice(0, n);
      if (n >= polosnya.length) { clearInterval(pewaktuKetik); p.innerHTML = penuh; p.removeAttribute("aria-label"); }
    }, 18);
  }

  function entri() { return [].slice.call(layar.querySelectorAll("#daftar [data-i]")); }
  function pilihKe(i, gulir) {
    var e = entri(); if (!e.length) return;
    var baru = Math.max(0, Math.min(e.length - 1, i));
    if (baru !== s.pilih) bunyi(660, .04);
    s.pilih = baru;
    e.forEach(function (x, j) { x.classList.toggle("pilih", j === s.pilih); });
    if (gulir) e[s.pilih].scrollIntoView({ block: "nearest" });
  }
  function gantiBabak(arah) {
    var ids = BABAK.map(function (g) { return g.id; });
    s.babak = ids[(ids.indexOf(s.babak) + arah + ids.length) % ids.length]; s.pilih = 0; bunyi(440, .06);
    gambar(document.activeElement && document.activeElement.id === "cariPx");
  }

  /* ---------- Tirai piksel ----------
     Masuk dan keluar mode arkade ditandai layar yang tertutup kotak-kotak piksel. Halaman tujuan membuka tirainya
     lagi (sessionStorage "layanan-tirai"). Warnanya mengikuti mode terang atau gelap. */
  function warnaTirai() { return document.documentElement.getAttribute("data-mode") === "gelap" ? ["#0a1420", "#0f2236", "#13304b"] : ["#efe6d2", "#f1e5c8", "#fbf5e8"]; }
  function kanvasTirai() {
    var k = document.createElement("canvas");
    k.setAttribute("aria-hidden", "true");
    k.style.cssText = "position:fixed;inset:0;width:100%;height:100%;z-index:2147483647;pointer-events:none;image-rendering:pixelated";
    k.width = window.innerWidth; k.height = window.innerHeight;
    document.body.appendChild(k);
    var ukuran = Math.max(24, Math.round(Math.min(k.width, k.height) / 14)), kotak = [];
    for (var y = 0; y < k.height; y += ukuran) for (var x = 0; x < k.width; x += ukuran) kotak.push([x, y]);
    return { el: k, c: k.getContext("2d"), ukuran: ukuran, kotak: kotak };
  }
  // Menutup layar mulai dari titik (ax, ay), lalu memanggil selesai.
  function tutupTirai(ax, ay, selesai) {
    var t = kanvasTirai(), w = warnaTirai(), i = 0;
    t.kotak.forEach(function (k) { k[2] = Math.hypot(k[0] - ax, k[1] - ay) + Math.random() * t.ukuran * 6; });
    t.kotak.sort(function (a, b) { return a[2] - b[2]; });
    var per = Math.ceil(t.kotak.length / 30);
    (function langkah() {
      for (var n = 0; n < per && i < t.kotak.length; n++, i++) {
        t.c.fillStyle = Math.random() < .04 ? "#f2b44a" : w[(Math.random() * w.length) | 0];
        t.c.fillRect(t.kotak[i][0], t.kotak[i][1], t.ukuran, t.ukuran);
      }
      if (i < t.kotak.length) requestAnimationFrame(langkah); else selesai(t.el);
    })();
  }
  // Membuka tirai yang dipasang <head> (kelas "tirai"): kotak-kotak menghilang acak dari titik (ax, ay).
  function bukaTirai(ax, ay) {
    var h = document.documentElement;
    if (!h.classList.contains("tirai")) return;
    var t = kanvasTirai(), w = warnaTirai(), i = 0;
    t.kotak.forEach(function (k) { t.c.fillStyle = w[(Math.random() * w.length) | 0]; t.c.fillRect(k[0], k[1], t.ukuran, t.ukuran); k[2] = Math.hypot(k[0] - ax, k[1] - ay) + Math.random() * t.ukuran * 6; });
    h.classList.remove("tirai");
    if (diam) { t.el.remove(); return; }
    t.kotak.sort(function (a, b) { return a[2] - b[2]; });
    var per = Math.ceil(t.kotak.length / 26);
    setTimeout(function langkah() {
      for (var n = 0; n < per && i < t.kotak.length; n++, i++) t.c.clearRect(t.kotak[i][0], t.kotak[i][1], t.ukuran, t.ukuran);
      if (i < t.kotak.length) requestAnimationFrame(langkah); else t.el.remove();
    }, 120);
  }

  // Keluar: beruang pamit, nada turun, layar tertutup piksel dari tombol KELUAR, lalu "SAMPAI JUMPA!" sebelum pindah.
  var sedangKeluar = false;
  function keluar(tombol) {
    if (sedangKeluar) return;
    sedangKeluar = true;
    try { localStorage.removeItem(KUNCI_ARKADE); } catch (e) { /* abaikan */ }
    var tujuan = new URL("./", document.baseURI).href;
    if (diam) { location.href = tujuan; return; }
    try { sessionStorage.setItem("layanan-tirai", "1"); } catch (e) { /* abaikan */ }
    var g = layar.querySelector(".gelembung");
    if (g) { g.hidden = false; if (!g.style.left) { g.style.left = "47%"; g.style.top = "10%"; } g.textContent = "DAH!"; g.style.animation = "none"; g.style.opacity = "1"; }
    [660, 523, 392, 262].forEach(function (f, i) { setTimeout(function () { bunyi(f, .09); }, 110 * i); });
    var r = tombol ? tombol.getBoundingClientRect() : { left: window.innerWidth, top: 0, width: 0, height: 0 };
    setTimeout(function () {
      tutupTirai(r.left + r.width / 2, r.top + r.height / 2, function (kanvas) {
        var pesan = document.createElement("p");
        pesan.textContent = "SAMPAI JUMPA!";
        var gelapnya = document.documentElement.getAttribute("data-mode") === "gelap";
        pesan.style.cssText = "position:fixed;left:50%;top:50%;transform:translate(-50%,-50%);margin:0;z-index:2147483647;font:700 clamp(28px,6vw,56px)/1 var(--px);letter-spacing:.06em;white-space:nowrap;" +
          "color:" + (gelapnya ? "#ffd27a" : "#b8700f") + ";text-shadow:4px 4px 0 " + (gelapnya ? "#b8700f" : "#f2d49a");
        document.body.appendChild(pesan);
        bunyi(196, .2);
        setTimeout(function () { location.href = tujuan; }, 650);
      });
    }, 380);
  }

  layar.addEventListener("input", function (e) { if (e.target.id !== "cariPx") return; s.cari = e.target.value; s.pilih = 0; gambar(true); });
  layar.addEventListener("click", function (e) {
    var b = e.target.closest("button"), a = e.target.closest("a[data-i]");
    if (a) { bunyi(880, .08); return; }
    if (!b) return;
    if (b.hasAttribute("data-babak")) { s.babak = b.dataset.babak; s.pilih = 0; bunyi(440, .06); gambar(); }
    if (b.hasAttribute("data-lanjut")) { s.kabar++; bunyi(520, .05); gambar(); }
    if (b.hasAttribute("data-suara")) {
      s.suara = !s.suara;
      try { localStorage.setItem("arkade-suara", s.suara ? "1" : "0"); } catch (er) { /* abaikan */ }
      gambar(); bunyi(990, .06);
    }
    if (b.hasAttribute("data-keluar")) keluar(b);
    if (b.hasAttribute("data-tema") && window.Tema) { bunyi(770, .06); Tema.alihMode(); }
    if (b.hasAttribute("data-adegan") && window.BannerBeruang) {
      var d = BannerBeruang.DESAIN;
      s.adegan = d[(d.indexOf(s.adegan) + 1) % d.length];
      try { sessionStorage.setItem("layanan-adegan", s.adegan); } catch (er) { /* abaikan */ }
      bunyi(587, .05); setTimeout(function () { bunyi(880, .06); }, 70);
      gambar();
      var gb = layar.querySelector("[data-adegan]"); if (gb) gb.focus();
    }
  });
  layar.addEventListener("mouseover", function (e) { var a = e.target.closest("a[data-i]"); if (a && Number(a.dataset.i) !== s.pilih) pilihKe(Number(a.dataset.i)); });
  layar.addEventListener("focusin", function (e) { var a = e.target.closest("a[data-i]"); if (a) pilihKe(Number(a.dataset.i)); });
  document.addEventListener("keydown", function (e) {
    if (e.altKey || e.ctrlKey || e.metaKey) return;
    var c = document.getElementById("cariPx"), diCari = document.activeElement === c, diTombol = document.activeElement && document.activeElement.tagName === "BUTTON";
    if (e.key === "/" && !diCari) { e.preventDefault(); c.focus(); c.scrollIntoView({ block: "center" }); return; }
    if (e.key === "ArrowRight" || e.key === "ArrowLeft") { if (diCari && c.value) return; e.preventDefault(); gantiBabak(e.key === "ArrowRight" ? 1 : -1); return; }
    if (e.key === "ArrowDown" || e.key === "ArrowUp") { e.preventDefault(); pilihKe(s.pilih + (e.key === "ArrowDown" ? 1 : -1), true); return; }
    if (e.key === "Enter" && !diTombol && !(document.activeElement && document.activeElement.tagName === "A")) {
      var p = entri()[s.pilih]; if (p) { e.preventDefault(); bunyi(880, .08); p.click(); }
    }
  });

  /* ---------- Statistik ----------
     Sama dengan beranda: hanya hitungan harian, tanpa data pribadi. Kunjungan dicatat dengan penanda "arkade",
     klik memakai penanda tautan yang sama dengan beranda supaya hitungannya menyatu. */
  function catat(jenis, id) {
    if (!window.ALAMAT_SKRIP || !window.fetch) return;
    try {
      fetch(window.ALAMAT_SKRIP, { method: "POST", mode: "no-cors", keepalive: true, headers: { "Content-Type": "text/plain;charset=utf-8" },
        body: JSON.stringify({ aksi: "catat", jenis: jenis, id: id }) }).catch(function () { /* abaikan */ });
    } catch (e) { /* abaikan */ }
  }
  (function () {
    var sudah = false;
    try { sudah = !!sessionStorage.getItem("arkade-dihitung"); sessionStorage.setItem("arkade-dihitung", "1"); } catch (e) { /* abaikan */ }
    if (!sudah) catat("kunjungan", "arkade");
  })();
  ["click", "auxclick"].forEach(function (nama) {
    layar.addEventListener(nama, function (e) {
      if (nama === "auxclick" && e.button !== 1) return;
      var a = e.target.closest("a[data-id]");
      if (a) catat("klik", a.dataset.id);
    });
  });

  /* ---------- Mulai ---------- */
  try {
    // Versi pertama sempat menyimpan pilihan ini di "layanan-mode", kunci milik tema terang/gelap. Dipindahkan sekali.
    var lama = localStorage.getItem("layanan-mode");
    if (lama === "arkade" || lama === "biasa") localStorage.removeItem("layanan-mode");
    localStorage.setItem(KUNCI_ARKADE, "1");
  } catch (e) { /* abaikan */ }
  // Saklar tema di HUD digambar ulang mengikuti mode yang berlaku.
  document.addEventListener("modeberubah", function () { var t = document.activeElement && document.activeElement.hasAttribute && document.activeElement.hasAttribute("data-tema"); gambar(); if (t) { var x = layar.querySelector("[data-tema]"); if (x) x.focus(); } });
  try { if (localStorage.getItem("arkade-suara") === "0") s.suara = false; } catch (e) { /* abaikan */ }
  s.adegan = window.BannerBeruang && BannerBeruang.pilih ? BannerBeruang.pilih() : "dermaga";
  siapkan();
  // Datang dari beranda lewat beruang: tirai dibuka dari pojok kanan bawah, tempat beruang berdiri.
  bukaTirai(window.innerWidth, window.innerHeight);
  if (window.Popup) Popup.mulai({ halaman: "beranda", cache: false });
  if (window.Popup) Popup.perbarui(konten);
  gambar();

  if (window.ALAMAT_SKRIP && window.fetch) {
    fetch(window.ALAMAT_SKRIP + "?aksi=baca", { cache: "no-store" })
      .then(function (r) { return r.json(); })
      .then(function (hasilnya) {
        if (!hasilnya || !hasilnya.ok || !hasilnya.konten) return;
        var baru = K.rapikan(hasilnya.konten);
        tulis(KUNCI_SIMPAN, baru);
        if (JSON.stringify(baru) === jejak) return;
        konten = baru; jejak = JSON.stringify(baru);
        siapkan(); s.pilih = 0;
        if (window.Popup) Popup.perbarui(konten);
        gambar(document.activeElement && document.activeElement.id === "cariPx");
      })
      .catch(function () { /* tetap memakai isi yang sudah tampil */ });
  }
})();
