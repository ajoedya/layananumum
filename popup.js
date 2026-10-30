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

   Jendela pengumuman (bentuk "jendela") tampil di tengah layar dengan latar buram. Pemicunya:
   - "buka": ikut antrean di atas saat halaman dibuka;
   - "klik": tidak ikut antrean. Klik pada tautan ke pemicuAlamat ditahan, jendela tampil, dan pengunjung baru diteruskan
     ke tujuan setelah menekan tombol lanjut. Frekuensinya dicatat saat tombol lanjut ditekan, jadi yang membatalkan akan
     melihatnya lagi pada klik berikutnya. Klik dengan Ctrl, Shift, atau tombol tengah tetap langsung membuka tautan.

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
  var s = { halaman: "", akar: "", pratinjau: false, daftar: [], dimuat: {}, aktif: null, tunda: null, pewaktu: null, sisa: 0, sejak: 0, pernah: false, klik: null };

  // Penyimpanan bisa ditolak (mode privat, kuki diblokir); pop up tetap jalan tanpa mengingat.
  function bacaPeta(tempat, kunci) {
    try { var t = window[tempat].getItem(kunci); var o = t ? JSON.parse(t) : null; return o && typeof o === "object" ? o : {}; } catch (e) { return {}; }
  }
  function tulisPeta(tempat, kunci, o) { try { window[tempat].setItem(kunci, JSON.stringify(o)); } catch (e) { /* abaikan */ } }

  function klik(p) { return p.bentuk === "jendela" && p.pemicu === "klik"; }
  function tanda(p) {
    return [p.bentuk, p.jenis, p.judul, p.isi, p.gambar, p.gambarAlt, p.tombolTeks, p.tombolAlamat, p.detik].join("|") + (klik(p) ? "|" + p.pemicuAlamat : "");
  }
  // Jendela pengumuman memakai aturan frekuensi yang sama dengan pop up di pojok.
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
    if (!p || p.tampil !== true || !(p.judul || p.isi) || !K.dalamJadwal(p) || klik(p)) return false;
    if (s.dimuat[p.id + "|" + tanda(p)]) return false;
    if (s.pratinjau) return true;
    return Array.isArray(p.halaman) && p.halaman.indexOf(s.halaman) >= 0 && !sudahDilihat(p);
  }

  /* ---------- Hitung mundur ---------- */
  function jalan() {
    var a = s.aktif;
    if (!a || a.jendela || s.pewaktu || document.hidden) return;
    s.sejak = Date.now();
    s.pewaktu = setTimeout(function () { s.pewaktu = null; tutup(a.el); }, s.sisa);
    a.waktu.style.animationPlayState = "running";
  }
  function jeda() {
    var a = s.aktif;
    if (!a || a.jendela || !s.pewaktu) return;
    clearTimeout(s.pewaktu); s.pewaktu = null;
    s.sisa = Math.max(1000, s.sisa - (Date.now() - s.sejak));
    a.waktu.style.animationPlayState = "paused";
  }

  /* ---------- Menggambar satu pop up ---------- */
  function tampilkan(p) {
    if (p.bentuk === "jendela") { tampilkanJendela(p); return; }
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

  /* ---------- Jendela pengumuman ----------
     Dialog modal di tengah layar. Kelas pj-* mengatur latar (buram, redup) dan lebar; nilainya dari daftar pilihan,
     bukan angka bebas, karena ::backdrop tidak mewarisi variabel CSS di semua peramban.
     `lanjut` berisi alamat tautan yang diklik (pemicu "klik"); bila ada, jendela diberi tombol lanjut.
     `selesai(maju)` dipanggil sekali saat jendela ditutup; maju bernilai true bila pengunjung menekan tombol lanjut. */
  function buatJendela(p, lanjut, selesai) {
    var dialog = document.createElement("dialog");
    dialog.className = "pengumuman-jendela pj--" + p.jenis + " pj-buram-" + p.buram + " pj-redup-" + p.redup + " pj-lebar-" + p.lebar;
    dialog.setAttribute("aria-label", p.judul ? K.polos(p.judul) : "Pengumuman");

    var kepala = document.createElement("div");
    kepala.className = "pengumuman-kepala";
    var ikon = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    ikon.setAttribute("class", "pengumuman-ikon"); ikon.setAttribute("viewBox", "0 0 24 24");
    ikon.setAttribute("aria-hidden", "true"); ikon.setAttribute("focusable", "false");
    ikon.innerHTML = IKON[p.jenis] || IKON.info;
    kepala.appendChild(ikon);
    var judul = K.isiTeks(document.createElement("h2"), p.judul || "Pengumuman");
    var jenis = document.createElement("span");
    jenis.className = "popup-sr"; jenis.textContent = (NAMA_JENIS[p.jenis] || "Informasi") + ": ";
    judul.insertBefore(jenis, judul.firstChild);
    kepala.appendChild(judul);
    dialog.appendChild(kepala);

    var alamat = K.alamatAman(p.gambar);
    if (alamat) {
      var gambar = document.createElement("img");
      gambar.src = K.luar(alamat) ? alamat : s.akar + alamat;
      gambar.alt = p.gambarAlt || "";
      dialog.appendChild(gambar);
    }
    if (p.isi) dialog.appendChild(K.isiTeks(document.createElement("p"), p.isi));
    var tujuan = K.alamatAman(p.tombolAlamat);
    if (p.tombolTeks && tujuan) {
      var tautan = document.createElement("a");
      tautan.className = "pengumuman-tautan"; tautan.textContent = p.tombolTeks;
      tautan.href = K.luar(tujuan) ? tujuan : s.akar + tujuan;
      if (K.luar(tujuan)) { tautan.target = "_blank"; tautan.rel = "noopener"; }
      dialog.appendChild(tautan);
    }

    // Tombol utama: "Lanjutkan" untuk pemicu klik, "Tutup" untuk pemicu buka. Centang wajib baca menahannya.
    var aksi = document.createElement("div");
    aksi.className = "pengumuman-aksi";
    var utama = document.createElement("button");
    utama.type = "button"; utama.className = "pengumuman-tutup";
    utama.textContent = lanjut ? (p.tombolLanjut || "Lanjutkan") : (p.tombolTutup || "Tutup");
    utama.addEventListener("click", function () { akhiri(!!lanjut); });
    aksi.appendChild(utama);
    if (lanjut) {
      var batal = document.createElement("button");
      batal.type = "button"; batal.className = "pengumuman-tutup pengumuman-kedua"; batal.textContent = p.tombolTutup || "Batal";
      batal.addEventListener("click", function () { akhiri(false); });
      aksi.appendChild(batal);
    }
    var centang = null;
    if (p.wajibBaca) {
      var label = document.createElement("label");
      label.className = "pengumuman-baca";
      centang = document.createElement("input"); centang.type = "checkbox";
      label.appendChild(centang);
      label.appendChild(document.createTextNode(p.teksBaca || "Saya sudah membaca pengumuman ini"));
      dialog.appendChild(label);
      utama.disabled = true;
      centang.addEventListener("change", function () { utama.disabled = !centang.checked; });
    }
    if (p.sembunyikan) {
      var sembunyi = document.createElement("button");
      sembunyi.type = "button"; sembunyi.className = "popup-sembunyi"; sembunyi.textContent = "Jangan tampilkan lagi";
      sembunyi.addEventListener("click", function () {
        if (centang && !centang.checked) { centang.focus(); return; }
        if (!s.pratinjau) sembunyikanSelamanya(p);
        akhiri(!!lanjut);
      });
      aksi.appendChild(sembunyi);
    }
    dialog.appendChild(aksi);

    var ditutup = false;
    function akhiri(maju) {
      if (ditutup) return;
      ditutup = true;
      if (dialog.open) dialog.close();
      dialog.remove();
      selesai(maju);
    }
    dialog._akhiri = akhiri;
    // Escape selalu menutup (tanpa meneruskan ke tujuan), supaya pengunjung tidak terkurung.
    dialog.addEventListener("cancel", function (e) { e.preventDefault(); akhiri(false); });
    if (p.tutupLatar) {
      dialog.addEventListener("click", function (e) {
        if (e.target !== dialog) return;
        var r = dialog.getBoundingClientRect();
        if (e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom) akhiri(false);
      });
    }
    document.body.appendChild(dialog);
    dialog.showModal();
    (centang || utama).focus();
    return dialog;
  }

  function tampilkanJendela(p) {
    var dialog = buatJendela(p, null, function () {
      if (s.aktif && s.aktif.el === dialog) s.aktif = null;
      s.pernah = true;
      giliran();
    });
    s.aktif = { p: p, el: dialog, jendela: true };
    catatTampil(p);
  }

  /* ---------- Pemicu klik ----------
     Alamat dibandingkan sebagai alamat lengkap tanpa query dan pagar, dan "index.html" serta garis miring di ujung diabaikan,
     jadi "perjadin/", "perjadin/index.html", dan "./perjadin" dianggap sama. Alamat dalam situs dihitung dari akar situs. */
  function jalurUtuh(u) { return u.origin + u.pathname.replace(/index\.html$/, "").replace(/\/+$/, ""); }
  function cocok(href, alamat) {
    try {
      var akar = new URL(s.akar || "./", location.href);
      return jalurUtuh(new URL(href, location.href)) === jalurUtuh(new URL(alamat, akar));
    } catch (e) { return false; }
  }
  function jendelaKlik(href) {
    return s.daftar.filter(function (p) {
      var alamat = K.alamatAman(p.pemicuAlamat);
      if (!klik(p) || p.tampil !== true || !(p.judul || p.isi) || !K.dalamJadwal(p) || !alamat || !cocok(href, alamat)) return false;
      return s.pratinjau || (Array.isArray(p.halaman) && p.halaman.indexOf(s.halaman) >= 0 && !sudahDilihat(p));
    })[0];
  }
  document.addEventListener("click", function (e) {
    if (s.klik || e.defaultPrevented || e.button !== 0 || e.ctrlKey || e.metaKey || e.shiftKey || e.altKey) return;
    var a = e.target.closest && e.target.closest("a[href]");
    if (!a || a.closest("dialog")) return;
    var p = jendelaKlik(a.href);
    if (!p) return;
    e.preventDefault();
    var href = a.href, tabBaru = a.target === "_blank";
    s.klik = buatJendela(p, href, function (maju) {
      s.klik = null;
      if (!maju) { a.focus(); return; }
      catatTampil(p);
      if (tabBaru) window.open(href, "_blank", "noopener"); else location.href = href;
    });
  });

  function tutup(el) {
    var a = s.aktif;
    if (!a || (el && a.el !== el)) return;
    if (a.jendela) { a.el._akhiri(false); return; }
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
