/* ============================================================
   Pop up pemberitahuan bersama
   Dipakai beranda, Monitoring E-Perjadin, Monitoring Realisasi Anggaran, dan Olah PDF. Gayanya ada di popup.css.
   Isinya daftar `pemberitahuan` dari dasbor admin (tab Pop up). Prasyarat: konten.js sudah dimuat.

   Aturan tampil:
   - satu pop up pada satu waktu; yang lain mengantre dan muncul bergiliran setelah yang tampil ditutup atau habis waktunya;
   - frekuensi per pop up: sekali per sesi (sessionStorage), sekali per hari, atau setiap halaman dibuka;
   - isi yang diubah admin dianggap pop up baru, jadi muncul lagi bagi yang sudah pernah melihatnya;
   - tombol "Jangan tampilkan lagi" menyembunyikan pop up itu di peramban ini sampai isinya diubah;
   - hitung mundur berhenti saat disorot, difokus papan ketik, atau tab tidak terlihat.

   Pemakaian:
     Popup.mulai({ halaman: "perjadin", akar: "../", ambil: true });   // halaman turunan: pakai simpanan, lalu ambil isi terbaru
     Popup.mulai({ halaman: "beranda", cache: false, pratinjau: p });  // beranda mengelola isinya sendiri,
     Popup.perbarui(konten);                                           // lalu mengirimnya tiap kali digambar
   `akar` adalah jalur dari halaman ke akar situs, untuk tombol berupa alamat dalam situs. Olah PDF tidak memakai `ambil`
   karena CSP-nya sengaja menutup sambungan keluar; ia hanya memakai isi yang sudah tersimpan oleh halaman lain.
   ============================================================ */
(function () {
  "use strict";
  if (window.Popup) return;
  var K = window.Konten;
  if (!K) return;

  var KUNCI_KONTEN = "layanan-konten";
  var KUNCI_SESI = "layanan-popup-sesi";
  var KUNCI_HARI = "layanan-popup-hari";
  var KUNCI_SEMBUNYI = "layanan-popup-sembunyi";
  var NAMA_JENIS = { info: "Informasi", peringatan: "Peringatan", penting: "Penting" };
  var IKON = {
    info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 8h.01"/>',
    peringatan: '<path d="M12 3.5 2.8 19.5h18.4L12 3.5z"/><path d="M12 10v4M12 17h.01"/>',
    penting: '<circle cx="12" cy="12" r="9"/><path d="M12 7.5v5.5M12 16.5h.01"/>'
  };
  var s = { halaman: "", akar: "", pratinjau: false, daftar: [], dimuat: {}, aktif: null, tunda: null, pewaktu: null, sisa: 0, sejak: 0, pernah: false };

  // Penyimpanan bisa ditolak (mode privat, kuki diblokir); pop up tetap jalan tanpa mengingat.
  function bacaPeta(tempat, kunci) {
    try { var t = window[tempat].getItem(kunci); var o = t ? JSON.parse(t) : null; return o && typeof o === "object" ? o : {}; } catch (e) { return {}; }
  }
  function tulisPeta(tempat, kunci, o) { try { window[tempat].setItem(kunci, JSON.stringify(o)); } catch (e) { /* abaikan */ } }

  function tanda(p) { return [p.jenis, p.judul, p.isi, p.tombolTeks, p.tombolAlamat, p.detik].join("|"); }
  function sudahDilihat(p) {
    var t = tanda(p);
    if (bacaPeta("localStorage", KUNCI_SEMBUNYI)[p.id] === t) return true;
    if (p.frekuensi === "setiap") return false;
    if (p.frekuensi === "harian") return bacaPeta("localStorage", KUNCI_HARI)[p.id] === K.hariIni() + "|" + t;
    return bacaPeta("sessionStorage", KUNCI_SESI)[p.id] === t;
  }
  function catatTampil(p) {
    s.dimuat[p.id + "|" + tanda(p)] = true;
    if (s.pratinjau || p.frekuensi === "setiap") return;
    var tempat = p.frekuensi === "harian" ? "localStorage" : "sessionStorage", kunci = p.frekuensi === "harian" ? KUNCI_HARI : KUNCI_SESI;
    var peta = bacaPeta(tempat, kunci);
    peta[p.id] = (p.frekuensi === "harian" ? K.hariIni() + "|" : "") + tanda(p);
    tulisPeta(tempat, kunci, peta);
  }
  function sembunyikanSelamanya(p) {
    var peta = bacaPeta("localStorage", KUNCI_SEMBUNYI);
    peta[p.id] = tanda(p);
    tulisPeta("localStorage", KUNCI_SEMBUNYI, peta);
  }

  // Dalam pratinjau dari dasbor, pilihan halaman dan catatan "sudah dilihat" diabaikan supaya admin bisa memeriksa semua butir di beranda.
  function layak(p) {
    if (!p || p.tampil !== true || !(p.judul || p.isi) || !K.dalamJadwal(p)) return false;
    if (s.dimuat[p.id + "|" + tanda(p)]) return false;
    if (s.pratinjau) return true;
    return Array.isArray(p.halaman) && p.halaman.indexOf(s.halaman) >= 0 && !sudahDilihat(p);
  }

  /* ---------- Hitung mundur ---------- */
  function jalan() {
    var a = s.aktif;
    if (!a || s.pewaktu || document.hidden) return;
    s.sejak = Date.now();
    s.pewaktu = setTimeout(function () { s.pewaktu = null; tutup(a.el); }, s.sisa);
    a.waktu.style.animationPlayState = "running";
  }
  function jeda() {
    var a = s.aktif;
    if (!a || !s.pewaktu) return;
    clearTimeout(s.pewaktu); s.pewaktu = null;
    s.sisa = Math.max(1000, s.sisa - (Date.now() - s.sejak));
    a.waktu.style.animationPlayState = "paused";
  }

  /* ---------- Menggambar satu pop up ---------- */
  function tampilkan(p) {
    var el = document.createElement("aside");
    el.className = "popup popup--" + p.jenis + " popup--" + p.posisi;
    el.setAttribute("role", p.jenis === "penting" ? "alert" : "status");
    el.setAttribute("aria-label", "Pemberitahuan");

    var ikon = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    ikon.setAttribute("class", "popup-ikon"); ikon.setAttribute("viewBox", "0 0 24 24");
    ikon.setAttribute("aria-hidden", "true"); ikon.setAttribute("focusable", "false");
    ikon.innerHTML = IKON[p.jenis] || IKON.info;
    el.appendChild(ikon);

    var isi = document.createElement("div");
    isi.className = "popup-isi";
    var pertama = null;
    if (p.judul) { pertama = K.isiTeks(document.createElement("strong"), p.judul); isi.appendChild(pertama); }
    if (p.isi) { var badan = K.isiTeks(document.createElement("p"), p.isi); isi.appendChild(badan); if (!pertama) pertama = badan; }
    // Jenis disebut untuk pembaca layar, karena warna dan ikon tidak terbaca olehnya.
    var jenis = document.createElement("span");
    jenis.className = "popup-sr"; jenis.textContent = (NAMA_JENIS[p.jenis] || "Informasi") + ": ";
    pertama.insertBefore(jenis, pertama.firstChild);

    var aksi = document.createElement("div");
    aksi.className = "popup-aksi";
    var alamat = K.alamatAman(p.tombolAlamat);
    if (p.tombolTeks && alamat) {
      var tombol = document.createElement("a");
      tombol.className = "popup-tombol"; tombol.textContent = p.tombolTeks;
      if (K.luar(alamat)) {
        tombol.href = alamat; tombol.target = "_blank"; tombol.rel = "noopener";
        var baru = document.createElement("span"); baru.className = "popup-sr"; baru.textContent = " (membuka tab baru)";
        tombol.appendChild(baru);
      } else tombol.href = s.akar + alamat;
      aksi.appendChild(tombol);
    }
    if (p.sembunyikan) {
      var sembunyi = document.createElement("button");
      sembunyi.type = "button"; sembunyi.className = "popup-sembunyi"; sembunyi.textContent = "Jangan tampilkan lagi";
      sembunyi.addEventListener("click", function () { if (!s.pratinjau) sembunyikanSelamanya(p); tutup(el); });
      aksi.appendChild(sembunyi);
    }
    if (aksi.firstChild) isi.appendChild(aksi);
    el.appendChild(isi);

    var tutupBtn = document.createElement("button");
    tutupBtn.type = "button"; tutupBtn.className = "popup-tutup"; tutupBtn.title = "Tutup";
    tutupBtn.setAttribute("aria-label", "Tutup pemberitahuan");
    tutupBtn.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M6 6l12 12M18 6 6 18"/></svg>';
    tutupBtn.addEventListener("click", function () { tutup(el); });
    el.appendChild(tutupBtn);

    var waktu = document.createElement("span");
    waktu.className = "popup-waktu"; waktu.setAttribute("aria-hidden", "true");
    waktu.style.animationDuration = p.detik + "s";
    el.appendChild(waktu);

    el.addEventListener("mouseenter", jeda);
    el.addEventListener("mouseleave", function () { if (!el.contains(document.activeElement)) jalan(); });
    el.addEventListener("focusin", jeda);
    el.addEventListener("focusout", function (e) { if (!el.contains(e.relatedTarget)) jalan(); });
    el.addEventListener("keydown", function (e) { if (e.key === "Escape") tutup(el); });

    s.aktif = { p: p, el: el, waktu: waktu };
    s.sisa = p.detik * 1000;
    catatTampil(p);
    document.body.appendChild(el);
    jalan();
  }

  function tutup(el) {
    var a = s.aktif;
    if (!a || (el && a.el !== el)) return;
    s.aktif = null;
    clearTimeout(s.pewaktu); s.pewaktu = null;
    a.el.classList.add("popup--keluar");
    setTimeout(function () { if (a.el.parentNode) a.el.parentNode.removeChild(a.el); }, 200);
    s.pernah = true;
    giliran();
  }

  // Menjadwalkan pop up layak berikutnya. Jeda sebelum muncul dihitung per butir, ditambah napas singkat antar pop up.
  function giliran() {
    if (s.aktif || s.tunda) return;
    var p = s.daftar.filter(layak)[0];
    if (!p) return;
    s.tunda = setTimeout(function () {
      s.tunda = null;
      var q = s.daftar.filter(layak)[0];
      if (q) tampilkan(q);
    }, (p.tunda || 0) * 1000 + (s.pernah ? 500 : 0));
  }

  document.addEventListener("visibilitychange", function () { if (document.hidden) jeda(); else jalan(); });

  /* ---------- Antarmuka ---------- */
  function dariSimpanan() {
    try { var t = localStorage.getItem(KUNCI_KONTEN); return t ? K.rapikan(JSON.parse(t)) : null; } catch (e) { return null; }
  }
  // Menerima isi yang sudah dirapikan (Konten.rapikan). Pop up yang sedang tampil ditutup bila admin sudah menghapus atau mengubahnya.
  function perbarui(konten) {
    s.daftar = konten && Array.isArray(konten.pemberitahuan) ? konten.pemberitahuan : [];
    var a = s.aktif;
    if (a) {
      var masihAda = s.daftar.some(function (p) { return p.id === a.p.id && tanda(p) === tanda(a.p) && p.tampil === true && K.dalamJadwal(p); });
      if (!masihAda) tutup(a.el);
    }
    giliran();
  }
  function mulai(opsi) {
    opsi = opsi || {};
    s.halaman = opsi.halaman || ""; s.akar = opsi.akar || ""; s.pratinjau = !!opsi.pratinjau;
    if (opsi.cache !== false) perbarui(dariSimpanan());
    if (opsi.ambil && !s.pratinjau && window.ALAMAT_SKRIP && window.fetch) {
      fetch(window.ALAMAT_SKRIP + "?aksi=baca", { cache: "no-store" })
        .then(function (r) { return r.json(); })
        .then(function (hasil) {
          if (!hasil || !hasil.ok || !hasil.konten) return;
          var baru = K.rapikan(hasil.konten);
          try { localStorage.setItem(KUNCI_KONTEN, JSON.stringify(baru)); } catch (e) { /* abaikan */ }
          perbarui(baru);
        })
        .catch(function () { /* tetap memakai isi yang sudah ada */ });
    }
  }

  window.Popup = { mulai: mulai, perbarui: perbarui };
})();
