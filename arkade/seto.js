/* Seto si Rawon Gank: tokoh piksel yang selalu ada di pojok layar mode arkade.
   Ia masuk dari tepi, lalu terus bergoyang dan mengacungkan tangan 🤙 sambil meneriakkan "JOSJIS!".
   Bila penunjuk mendekat (dalam jarak JARAK_DEKAT) atau layar disentuh, biasanya ia langsung menghilang
   dan muncul lagi di pojok lain. Sesekali ia lengah (peluang tetap 1 banding 100 tiap kali didekati); bila saat itu diklik, ia tertangkap dan banner
   teriakan JOSJIS tampil di tengah layar, lalu ia masuk lagi dari pojok lain.
   Gambarnya digambar dengan kode (20 x 30 piksel), tanpa berkas gambar dan tanpa latar.
   Tokohnya hiasan (aria-hidden, tidak bisa difokus). ?seto=0 menyembunyikannya.
   Dengan prefers-reduced-motion ia berdiri diam dan berpindah tanpa animasi. */
(function () {
  "use strict";

  if (/[?&]seto=0\b/.test(location.search)) return;
  var diam = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- Sprite 20x30 ----------
     o garis, h rambut, k kacamata, w kilau, s kulit, d bayangan kulit, e mata, m mulut, t gigi,
     W kaos putih, S bayangan kaos, L/l logo hijau neon, P/Q celana krem, G emas (kalung, gelang), F sepatu */
  var WARNA = { o: "#1a1410", h: "#231c18", k: "#07090c", w: "#cfe8ff", s: "#9a6544", d: "#7a4c31", e: "#1a1410", m: "#5e2620", t: "#f4efe6", W: "#f6f4ef", S: "#d6d2c8", L: "#c6f23a", l: "#3c7d22", P: "#e2d6bb", Q: "#bfb091", G: "#f2b44a", F: "#2e2826" };
  var BINGKAI = {
    diam: [
      ".......oooooo.......",
      "......ohhhhhho......",
      ".....okkwkkkwko.....",
      ".....ohhhhhhhho.....",
      ".....ohhsssshho.....",
      ".....osesssseso.....",
      ".....osssssssso.....",
      ".....ossmttmsso.....",
      "......ossssso.......",
      "........dssd........",
      "....oWWWWGGWWWWo....",
      "....oWWWWWWWWWWo....",
      "....oWWWLLLLWWWo....",
      "...osoWLLlLLWWoso...",
      "...osoWWLLLLWWoso...",
      "...osoWWWWWWWWoso...",
      "...osoSWWWWWWSoso...",
      "...oGoSSWWWWSSoGo...",
      "...osoPPPPPPPPoso...",
      "....ooPPPPPPPPoo....",
      ".....oPPPPPPPPo.....",
      ".....oPPPQQPPPo.....",
      ".....oPPPooPPPo.....",
      ".....oPPPooPPPo.....",
      ".....oPPPooPPPo.....",
      ".....oPPPooPPPo.....",
      ".....oPPPooPPPo.....",
      ".....oQQQooQQQo.....",
      "....oFFFFooFFFFo....",
      "....ooooo..ooooo...."
    ],
    goyangKiri: [
      "......oooooo........",
      ".....ohhhhhho.......",
      "....okkwkkkwko......",
      "....ohhhhhhhho......",
      "....ohhsssshho......",
      "....osesssseso......",
      "....osssssssso......",
      "....ossmttmsso......",
      ".....ossssso........",
      ".......dssd.........",
      "...oWWWWGGWWWWo.....",
      "...oWWWWWWWWWWo.....",
      "...oWWWLLLLWWWo.....",
      "..osoWLLlLLWWoso....",
      "..osoWWLLLLWWoso....",
      "..osoWWWWWWWWoso....",
      "..osoSWWWWWWSoso....",
      "..oGoSSWWWWSSoGo....",
      "..osoPPPPPPPPoso....",
      "...ooPPPPPPPPoo.....",
      ".....oPPPPPPPPo.....",
      ".....oPPPQQPPPo.....",
      "....oPPPoooPPPo.....",
      "....oPPPo..oPPPo....",
      "...oPPPo...oPPPo....",
      "...oPPPo....oPPPo...",
      "....oPPPo...oPPPo...",
      "....oQQQo...oQQQo...",
      "...oFFFFo..oFFFFo...",
      "...ooooo....ooooo..."
    ],
    goyangKanan: [
      "........oooooo......",
      ".......ohhhhhho.....",
      "......okkwkkkwko....",
      "......ohhhhhhhho....",
      "......ohhsssshho....",
      "......osesssseso....",
      "......osssssssso....",
      "......ossmttmsso....",
      ".......ossssso......",
      ".........dssd.......",
      ".....oWWWWGGWWWWo...",
      ".....oWWWWWWWWWWo...",
      ".....oWWWLLLLWWWo...",
      "....osoWLLlLLWWoso..",
      "....osoWWLLLLWWoso..",
      "....osoWWWWWWWWoso..",
      "....osoSWWWWWWSoso..",
      "....oGoSSWWWWSSoGo..",
      "....osoPPPPPPPPoso..",
      ".....ooPPPPPPPPoo...",
      ".....oPPPPPPPPo.....",
      ".....oPPPQQPPPo.....",
      ".....oPPPoooPPPo....",
      "....oPPPo..oPPPo....",
      "....oPPPo...oPPPo...",
      "...oPPPo....oPPPo...",
      "...oPPPo...oPPPo....",
      "...oQQQo...oQQQo....",
      "...oFFFFo..oFFFFo...",
      "...ooooo....ooooo..."
    ],
    teriak: [
      ".......oooooo.......",
      "......ohhhhhho......",
      ".os..okkwkkkwko.....",
      ".oso.ohhhhhhhho.....",
      ".osssohhsssshho.....",
      "..ossosesssseso.....",
      "...Goosssssssso.....",
      "...soossmmmmsso.....",
      "...so.osmmmmo.......",
      "...so...dssd........",
      "...oWWWWWGGWWWWo....",
      "....oWWWWWWWWWWo....",
      "....oWWWLLLLWWWo....",
      ".....oWLLlLLWWoso...",
      ".....oWWLLLLWWoso...",
      ".....oWWWWWWWWoso...",
      ".....oSWWWWWWSoso...",
      ".....oSSWWWWSSoGo...",
      ".....oPPPPPPPPoso...",
      "....ooPPPPPPPPoo....",
      ".....oPPPPPPPPo.....",
      ".....oPPPQQPPPo.....",
      ".....oPPPooPPPo.....",
      ".....oPPPooPPPo.....",
      ".....oPPPooPPPo.....",
      ".....oPPPooPPPo.....",
      ".....oPPPooPPPo.....",
      ".....oQQQooQQQo.....",
      "....oFFFFooFFFFo....",
      "....ooooo..ooooo...."
    ],
    teriakGoyang: [
      "......oooooo........",
      ".....ohhhhhho.......",
      "os..okkwkkkwko......",
      "oso.ohhhhhhhho......",
      "osssohhsssshho......",
      ".ossosesssseso......",
      "..Goosssssssso......",
      "..soossmmmmsso......",
      "..so.osmmmmo........",
      "..so...dssd.........",
      "..oWWWWWGGWWWWo.....",
      "...oWWWWWWWWWWo.....",
      "...oWWWLLLLWWWo.....",
      "....oWLLlLLWWoso....",
      "....oWWLLLLWWoso....",
      "....oWWWWWWWWoso....",
      "....oSWWWWWWSoso....",
      "....oSSWWWWSSoGo....",
      "....oPPPPPPPPoso....",
      "...ooPPPPPPPPoo.....",
      ".....oPPPPPPPPo.....",
      ".....oPPPQQPPPo.....",
      "....oPPPoooPPPo.....",
      "....oPPPo..oPPPo....",
      "...oPPPo...oPPPo....",
      "...oPPPo....oPPPo...",
      "....oPPPo...oPPPo...",
      "....oQQQo...oQQQo...",
      "...oFFFFo..oFFFFo...",
      "...ooooo....ooooo..."
    ],
    tunjuk: [
      "........oooooo......",
      ".......ohhhhhho.....",
      "......okkwkkkwko....",
      "......ohhhhhhhho....",
      "......ohhsssshho....",
      "......osesssseso....",
      "......osssssssso....",
      "......ossmttmsso....",
      ".......ossssso......",
      ".........dssd.......",
      ".....oWWWWGGWWWWo...",
      ".....oWWWWWWWWWWWooo",
      ".....oWWWLLLLWWWWssG",
      "....osoWLLlLLWWo.ooo",
      "....osoWWLLLLWWo....",
      "....osoWWWWWWWWo....",
      "....osoSWWWWWWSo....",
      "....oGoSSWWWWSSo....",
      "....osoPPPPPPPPo....",
      ".....ooPPPPPPPPoo...",
      ".....oPPPPPPPPo.....",
      ".....oPPPQQPPPo.....",
      ".....oPPPoooPPPo....",
      "....oPPPo..oPPPo....",
      "....oPPPo...oPPPo...",
      "...oPPPo....oPPPo...",
      "...oPPPo...oPPPo....",
      "...oQQQo...oQQQo....",
      "...oFFFFo..oFFFFo...",
      "...ooooo....ooooo..."
    ],
    salam: [
      ".......oooooo.......",
      "......ohhhhhho......",
      ".os..okkwkkkwko.....",
      ".oso.ohhhhhhhho.....",
      ".osssohhsssshho.....",
      "..ossosesssseso.....",
      "...Goosssssssso.....",
      "...soossmttmsso.....",
      "...so.ossssso.......",
      "...so...dssd........",
      "...oWWWWWGGWWWWo....",
      "....oWWWWWWWWWWo....",
      "....oWWWLLLLWWWo....",
      ".....oWLLlLLWWoso...",
      ".....oWWLLLLWWoso...",
      ".....oWWWWWWWWoso...",
      ".....oSWWWWWWSoso...",
      ".....oSSWWWWSSoGo...",
      ".....oPPPPPPPPoso...",
      "....ooPPPPPPPPoo....",
      ".....oPPPPPPPPo.....",
      ".....oPPPQQPPPo.....",
      ".....oPPPooPPPo.....",
      ".....oPPPooPPPo.....",
      ".....oPPPooPPPo.....",
      ".....oPPPooPPPo.....",
      ".....oPPPooPPPo.....",
      ".....oQQQooQQQo.....",
      "....oFFFFooFFFFo....",
      "....ooooo..ooooo...."
    ]
  };
  var LEBAR = 20, TINGGI = 30;

  function gambar(baris) {
    var s = "";
    for (var y = 0; y < baris.length; y++) {
      for (var x = 0; x < LEBAR; x++) {
        var w = WARNA[baris[y].charAt(x)];
        if (w) s += '<rect x="' + x + '" y="' + y + '" width="1.02" height="1.02" fill="' + w + '"/>';
      }
    }
    return s;
  }

  var CSS =
    ".seto{position:fixed;z-index:60;left:0;top:0;width:60px;height:90px;pointer-events:auto;cursor:default;touch-action:none;" +
      "transition:opacity .16s steps(3);filter:drop-shadow(2px 0 0 #ffd27a) drop-shadow(-2px 0 0 #ffd27a) drop-shadow(0 2px 0 #ffd27a) drop-shadow(0 -2px 0 #ffd27a) drop-shadow(3px 4px 0 rgba(10,20,32,.35))}" +
    ".seto[hidden]{display:none}" +
    ".seto svg{display:block;width:100%;height:100%;shape-rendering:crispEdges}" +
    ".seto g{display:none}.seto g.aktif{display:inline}" +
    ".seto.balik svg{transform:scaleX(-1)}" +
    ".seto-teriak{position:absolute;bottom:calc(100% + 8px);white-space:nowrap;pointer-events:none;" +
      "font:700 15px/1 'Pixelify Sans',ui-monospace,Consolas,monospace;letter-spacing:.06em;color:#0a1420;background:#ffd27a;padding:7px 9px;" +
      "box-shadow:0 -3px 0 #0a1420,0 3px 0 #0a1420,-3px 0 0 #0a1420,3px 0 0 #0a1420;opacity:0;transition:opacity .1s steps(2)}" +
    ".seto-teriak:after{content:'';position:absolute;top:100%;width:6px;height:6px;background:#0a1420}" +
    ".seto.kanan .seto-teriak{right:0}.seto.kanan .seto-teriak:after{right:22px}" +
    ".seto.kiri .seto-teriak{left:0}.seto.kiri .seto-teriak:after{left:22px}" +
    ".seto.atas .seto-teriak{bottom:auto;top:calc(100% + 8px)}.seto.atas .seto-teriak:after{top:auto;bottom:100%}" +
    ".seto.teriak .seto-teriak{opacity:1}" +
    ".seto.goyang .seto-teriak{transform:translateY(-2px)}" +
    ".seto-debu{position:fixed;z-index:59;width:6px;height:6px;background:#ffd27a;pointer-events:none;box-shadow:0 0 0 2px #0a1420}" +
    // Banner saat tertangkap: kotak piksel navy-emas di tengah layar dengan Seto besar yang berteriak.
    ".seto-banner{position:fixed;z-index:120;left:50%;top:50%;display:flex;align-items:center;gap:18px;padding:18px 26px 18px 18px;" +
      "transform:translate(-50%,-50%);background:#0a1420;color:#ffd27a;cursor:pointer;max-width:calc(100vw - 32px);" +
      "box-shadow:0 -4px 0 #ffd27a,0 4px 0 #ffd27a,-4px 0 0 #ffd27a,4px 0 0 #ffd27a,0 -8px 0 #0a1420,0 8px 0 #0a1420,-8px 0 0 #0a1420,8px 0 0 #0a1420,10px 14px 0 rgba(10,20,32,.4)}" +
    ".seto-banner svg{width:80px;height:120px;flex:none;shape-rendering:crispEdges}" +
    ".seto-banner b{display:block;font:700 64px/1 'Pixelify Sans',ui-monospace,Consolas,monospace;letter-spacing:.04em;text-shadow:4px 4px 0 #b9541f}" +
    ".seto-banner small{display:block;margin-top:10px;font:700 14px/1.2 'Pixelify Sans',ui-monospace,Consolas,monospace;letter-spacing:.08em;color:#f6efe4}" +
    ".seto-banner.gerak{animation:seto-masuk .32s steps(4) both,seto-guncang .5s steps(5) .32s 3}" +
    "@keyframes seto-masuk{from{transform:translate(-50%,-50%) scale(.2)}to{transform:translate(-50%,-50%) scale(1)}}" +
    "@keyframes seto-guncang{0%,100%{transform:translate(-50%,-50%)}25%{transform:translate(calc(-50% - 6px),calc(-50% + 3px))}50%{transform:translate(calc(-50% + 6px),calc(-50% - 3px))}75%{transform:translate(calc(-50% - 3px),calc(-50% - 4px))}}" +
    "@media (max-width:600px){.seto{width:44px;height:66px}.seto-teriak{font-size:13px}" +
      ".seto-banner{gap:12px;padding:14px 18px 14px 12px}.seto-banner svg{width:52px;height:78px}.seto-banner b{font-size:40px}.seto-banner small{font-size:12px}}";

  var JARAK = 12;          // jarak dari tepi layar (px)
  var PELUANG = 1 / 100;   // peluang lengah tiap kali didekati, tetap
  var JARAK_DEKAT = 80;    // jarak penunjuk ke tepi tokoh (px) yang dianggap mendekat
  var dekat = false;       // penunjuk sedang berada dalam JARAK_DEKAT
  var tokoh, teks, bingkaiSkrg, pojok = null, x = 0, y = 0, waktu = [], pergi = false, aktif = false;
  var lengah = false, waktuLengah = null;

  function buat() {
    var g = document.createElement("style");
    g.textContent = CSS;
    document.head.appendChild(g);
    tokoh = document.createElement("div");
    tokoh.className = "seto kanan";
    tokoh.setAttribute("aria-hidden", "true");
    tokoh.hidden = true;
    var isi = '<svg viewBox="0 0 ' + LEBAR + " " + TINGGI + '">';
    for (var nama in BINGKAI) isi += '<g data-b="' + nama + '">' + gambar(BINGKAI[nama]) + "</g>";
    tokoh.innerHTML = isi + '</svg><span class="seto-teriak">JOSJIS!</span>';
    teks = tokoh.querySelector(".seto-teriak");
    // Tetikus mendekat (belum menyentuh tokoh): undi lengah atau menghilang. Sentuhan diundi saat layar disentuh.
    document.addEventListener("pointermove", function (e) {
      if (e.pointerType !== "mouse" || tokoh.hidden) return;
      var r = tokoh.getBoundingClientRect();
      var dx = Math.max(r.left - e.clientX, 0, e.clientX - r.right);
      var dy = Math.max(r.top - e.clientY, 0, e.clientY - r.bottom);
      var jarak = Math.sqrt(dx * dx + dy * dy);
      if (jarak < JARAK_DEKAT) {
        if (!dekat) { dekat = true; didekati(); }
      } else if (dekat && jarak > JARAK_DEKAT + 20) {
        dekat = false;
        if (lengah) waktuLengah = setTimeout(sadar, 500);
      }
    }, { passive: true });
    tokoh.addEventListener("pointerdown", function (e) {
      e.preventDefault();
      if (lengah) { tertangkap(); return; }
      if (e.pointerType === "mouse") { menghindar(); return; }
      if (undi()) tertangkap(); else menghindar();
    });
    tokoh.addEventListener("click", function (e) { e.preventDefault(); e.stopPropagation(); });
    document.body.appendChild(tokoh);
  }

  function tampil(nama) {
    if (bingkaiSkrg === nama) return;
    var lama = tokoh.querySelector("g.aktif");
    if (lama) lama.classList.remove("aktif");
    tokoh.querySelector('g[data-b="' + nama + '"]').classList.add("aktif");
    bingkaiSkrg = nama;
  }
  function letak(nx, ny, angkat) { x = nx; y = ny; tokoh.style.transform = "translate(" + Math.round(nx) + "px," + Math.round(ny + (angkat || 0)) + "px)"; }
  function tunda(f, ms) { var t = setTimeout(f, ms); waktu.push(t); return t; }
  function hentikan() { waktu.forEach(clearTimeout); waktu = []; }

  /* ---------- Memilih pojok ---------- */
  var POJOK = ["kanan-bawah", "kiri-bawah", "kanan-atas", "kiri-atas"];
  function ukuran() { return { w: tokoh.offsetWidth || 60, h: tokoh.offsetHeight || 90 }; }
  function titikPojok(p) {
    var u = ukuran(), L = window.innerWidth, T = window.innerHeight;
    return {
      x: p.indexOf("kiri") === 0 ? JARAK : L - u.w - JARAK,
      y: p.indexOf("atas") > 0 ? JARAK + 34 : T - u.h - JARAK   // pojok atas memberi ruang untuk gelembung teriakan
    };
  }
  // Pojok dianggap lowong bila tak ada tombol, tautan, isian, atau pop up di bawah tokoh.
  function lowong(p) {
    var t = titikPojok(p), u = ukuran();
    var titik = [[t.x + 4, t.y + 4], [t.x + u.w - 4, t.y + 4], [t.x + u.w / 2, t.y + u.h / 2], [t.x + 4, t.y + u.h - 4], [t.x + u.w - 4, t.y + u.h - 4]];
    for (var i = 0; i < titik.length; i++) {
      var dibawah = document.elementsFromPoint(titik[i][0], titik[i][1]);
      for (var j = 0; j < dibawah.length; j++) {
        var el = dibawah[j];
        if (tokoh.contains(el)) continue;
        if (el.closest && el.closest("a,button,input,select,textarea,label,.popup,[role=dialog]")) return false;
      }
    }
    return true;
  }
  // Di layar sempit kabinet arkade memenuhi lebar layar, jadi pojok atas selalu menutupi judul; pakai pojok bawah saja.
  function pilihPojok() {
    var sempit = window.innerWidth < 760;
    var calon = POJOK.filter(function (p) { return p !== pojok && (!sempit || p.indexOf("bawah") > 0) && lowong(p); });
    if (!calon.length) calon = POJOK.filter(function (p) { return p !== pojok && p.indexOf("bawah") > 0; });
    return calon[(Math.random() * calon.length) | 0];
  }
  function aturPojok(p) {
    pojok = p;
    var kiri = p.indexOf("kiri") === 0;
    tokoh.classList.toggle("kiri", kiri);
    tokoh.classList.toggle("kanan", !kiri);
    tokoh.classList.toggle("atas", p.indexOf("atas") > 0);
  }

  /* ---------- Gerak ---------- */
  // Melangkah dari tepi layar ke titik pojok, bergoyang di tiap langkah.
  function masukDari(p, selesai) {
    var t = titikPojok(p), u = ukuran(), kiri = p.indexOf("kiri") === 0;
    var awal = kiri ? -u.w - 4 : window.innerWidth + 4;
    tokoh.classList.toggle("balik", kiri);
    letak(awal, t.y);
    tokoh.hidden = false;
    tokoh.style.opacity = "";
    var langkah = 0, arah = kiri ? 1 : -1;
    (function maju() {
      if (pergi) return;
      langkah++;
      var nx = x + arah * 8, tiba = kiri ? nx >= t.x : nx <= t.x;
      if (tiba) nx = t.x;
      tampil(langkah % 2 ? "goyangKiri" : "goyangKanan");
      letak(nx, t.y, langkah % 2 ? -2 : 0);
      if (tiba) { tokoh.classList.remove("balik"); tampil("diam"); letak(nx, t.y); if (selesai) selesai(); }
      else tunda(maju, 80);
    })();
  }
  function urutan(daftar, selesai) {
    var i = 0;
    (function lanjut() {
      if (i >= daftar.length) { if (selesai) selesai(); return; }
      var l = daftar[i++];
      tampil(l[0]);
      tokoh.classList.toggle("teriak", !!l[2]);
      tokoh.classList.toggle("goyang", l[0] === "teriakGoyang");
      letak(x, y, l[0].indexOf("goyang") === 0 || l[0] === "teriakGoyang" ? -2 : 0);
      tunda(lanjut, l[1]);
    })();
  }
  // Goyangan seperti di video: kiri-kanan, lalu mengacungkan tangan 🤙 dan berteriak JOSJIS.
  function joget(selesai) {
    var d = [];
    for (var i = 0; i < 2; i++) d.push(["goyangKiri", 260], ["diam", 200], ["goyangKanan", 260], ["diam", 200]);
    d.push(["tunjuk", 420], ["diam", 160]);
    for (i = 0; i < 3; i++) d.push(["teriak", 240, true], ["teriakGoyang", 240, true]);
    d.push(["salam", 500, true], ["diam", 300]);
    for (i = 0; i < 2; i++) d.push(["goyangKiri", 260], ["goyangKanan", 260]);
    d.push(["teriak", 300, true], ["teriakGoyang", 300, true], ["teriak", 300, true], ["diam", 400]);
    urutan(d, selesai);
  }

  // Berjoget tanpa henti, dengan jeda diam sebentar di antara putaran.
  function terusJoget() {
    if (diam) { tampil("salam"); tokoh.classList.add("teriak"); return; }
    joget(function () { tunda(terusJoget, 900 + Math.random() * 1600); });
  }
  // Masuk dari tepi ke pojok yang lowong, lalu berjoget. Ia selalu ada di layar.
  function muncul() {
    var p = pilihPojok() || "kanan-bawah";
    aturPojok(p);
    aktif = true; pergi = false;
    if (diam) {
      var t = titikPojok(p);
      letak(t.x, t.y); tokoh.hidden = false; terusJoget();
      return;
    }
    masukDari(p, terusJoget);
  }

  // Debu piksel di tempat ia menghilang.
  function debu(cx, cy) {
    if (diam) return;
    for (var i = 0; i < 8; i++) {
      var d = document.createElement("span");
      d.className = "seto-debu";
      d.style.left = cx + "px"; d.style.top = cy + "px";
      document.body.appendChild(d);
      (function (d, a) {
        var jarak = 16 + Math.random() * 18;
        d.animate([{ transform: "translate(0,0)", opacity: 1 }, { transform: "translate(" + Math.cos(a) * jarak + "px," + Math.sin(a) * jarak + "px)", opacity: 0 }],
          { duration: 360, easing: "steps(4)" }).onfinish = function () { d.remove(); };
      })(d, (Math.PI * 2 * i) / 8);
    }
  }

  /* ---------- Didekati, menghindar, tertangkap ---------- */
  function undi() {
    return Math.random() < PELUANG;
  }
  // Tetikus mendekat: lengah (diam terpaku, bisa diklik) atau langsung menghindar.
  function didekati() {
    if (!aktif || pergi) return;
    clearTimeout(waktuLengah);
    if (lengah) return;
    if (undi()) {
      lengah = true;
      hentikan();
      tokoh.classList.remove("teriak", "goyang");
      tampil("diam");
      letak(x, y);
    } else menghindar();
  }
  // Penunjuk menjauh saat ia lengah: sadar lagi dan lanjut berjoget.
  function sadar() {
    if (!lengah) return;
    lengah = false;
    terusJoget();
  }

  // Tertangkap: banner teriakan JOSJIS di tengah layar, lalu ia masuk lagi dari pojok lain.
  function tertangkap() {
    if (!aktif || pergi) return;
    aktif = false; lengah = false;
    clearTimeout(waktuLengah);
    hentikan();
    tampil("teriak");
    tokoh.classList.add("teriak");
    letak(x, y, -10);
    var banner = document.createElement("div");
    banner.className = "seto-banner" + (diam ? "" : " gerak");
    banner.setAttribute("role", "status");
    banner.innerHTML = '<svg viewBox="0 0 ' + LEBAR + " " + TINGGI + '" aria-hidden="true">' + gambar(BINGKAI.teriak) + "</svg>" +
      "<span><b>JOSJIS!</b><small>SETO TERTANGKAP! 🤙</small></span>";
    var tutup = function () {
      if (!banner.isConnected) return;
      banner.remove();
      var u = ukuran();
      debu(x + u.w / 2, y + u.h / 2);
      tokoh.hidden = true;
      tokoh.classList.remove("teriak");
      tunda(muncul, diam ? 400 : 900);
    };
    banner.addEventListener("click", tutup);
    document.body.appendChild(banner);
    tunda(tutup, 2800);
  }

  // Menghindar: langsung menghilang dalam debu, lalu muncul di pojok lain sambil meledek JOSJIS.
  function menghindar() {
    if (!aktif || pergi) return;
    pergi = true; lengah = false;
    hentikan();
    var u = ukuran();
    debu(x + u.w / 2, y + u.h / 2);
    tokoh.hidden = true;
    tunda(function () {
      var p = pilihPojok() || pojok;
      aturPojok(p);
      var t = titikPojok(p);
      letak(t.x, t.y);
      tampil("salam");
      tokoh.classList.add("teriak");
      tokoh.hidden = false;
      if (!diam) debu(t.x + u.w / 2, t.y + u.h / 2);
      pergi = false; dekat = false;
      tunda(terusJoget, 700);
    }, diam ? 0 : 600);
  }

  function mulai() {
    buat();
    tunda(muncul, 1200);
    window.addEventListener("resize", function () {
      if (!aktif || tokoh.hidden || !pojok) return;
      var t = titikPojok(pojok); letak(t.x, t.y);
    });
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", mulai);
  else mulai();
})();
