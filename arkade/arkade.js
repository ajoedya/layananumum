/* Mode arkade beranda Layanan Subbagian Umum (tata letak Jendela RPG).
   Dibuka dari beruang madu di pojok beranda (beruang.js). Pilihan mode disimpan di localStorage
   "layanan-mode"; beranda langsung mengalihkan ke sini selama nilainya "arkade", dan tombol KELUAR
   mengembalikannya ke "biasa". Isi, pop up, dan statistik memakai sumber yang sama dengan beranda. */
(function () {
  "use strict";
  var K = window.Konten, layar = document.getElementById("layar");
  var KUNCI_MODE = "layanan-mode";
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
  function hud() {
    return '<header class="hud px"><span>KPKNL <b>BPP</b></span><span class="tengah">LAYANAN <b>' + dua(semua.length) + "</b> · BABAK <b>" + dua(kelompok.length) + "</b></span>" +
      '<span class="kanan"><button type="button" class="tombol-px" data-suara aria-pressed="' + s.suara + '" aria-label="Efek suara">' + (s.suara ? "♪ ON" : "♪ OFF") + "</button>" +
      '<button type="button" class="tombol-px" data-keluar>KELUAR</button></span></header>';
  }
  function banner() {
    return '<div class="banner"><canvas data-banner role="img" aria-label="Beruang madu piksel berkacamata hitam melambai di dermaga Teluk Balikpapan"></canvas>' +
      '<span class="gelembung" aria-hidden="true">JOSJIS!</span><span class="stiker">' + tanggal() + "</span></div>";
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
    if (c && window.BannerBeruang) bannerAktif = BannerBeruang(c, { diam: diam });
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
  function keluar() {
    try { localStorage.setItem(KUNCI_MODE, "biasa"); } catch (e) { /* abaikan */ }
    location.href = new URL("./", document.baseURI).href;
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
    if (b.hasAttribute("data-keluar")) { bunyi(330, .08); keluar(); }
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
  try { localStorage.setItem(KUNCI_MODE, "arkade"); } catch (e) { /* abaikan */ }
  try { if (localStorage.getItem("arkade-suara") === "0") s.suara = false; } catch (e) { /* abaikan */ }
  siapkan();
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
