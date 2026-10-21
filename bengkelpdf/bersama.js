/* ============================================================
   Alat bantu bersama. Dimuat semua halaman sebelum skrip masing-masing.
   ============================================================ */
(function () {
  "use strict";

  const HALAMAN = [
    { berkas: "index",       nama: "Beranda" },
    { berkas: "gabung-pecah", nama: "Gabung/Pecah" },
    { berkas: "koreksi",     nama: "Edit Teks" },
    { berkas: "tanda-air",   nama: "Watermark" },
    { berkas: "gambar",      nama: "PDF dan Gambar" },
    { berkas: "word",        nama: "PDF ke Word" },
    { berkas: "penanda",     nama: "Penanda TTE" },
    { berkas: "pengubah-uk", nama: "Ubah Ukuran Kertas" },
    { berkas: "kompres",     nama: "Kompres PDF" }
  ];

  // Memasang favicon secara otomatis jika belum ada di tag <head>
  function pasangFavicon() {
    if (!document.querySelector("link[rel*='icon']")) {
      // Urutannya: .ico untuk peramban lama, .svg dan .png untuk peramban baru,
      // lalu ikon layar utama untuk ponsel. Akhiran ?v= dinaikkan tiap kali
      // gambarnya diganti, supaya peramban tidak memakai ikon lama dari tembolok.
      [
        { rel: "icon", type: "image/x-icon", href: "favicon.ico?v=5" },
        { rel: "icon", type: "image/svg+xml", href: "favicon.svg?v=5" },
        { rel: "icon", type: "image/png", sizes: "32x32", href: "favicon-32.png?v=5" },
        { rel: "icon", type: "image/png", sizes: "16x16", href: "favicon-16.png?v=5" },
        { rel: "icon", type: "image/png", sizes: "192x192", href: "favicon-192.png?v=5" },
        { rel: "apple-touch-icon", href: "favicon-180.png?v=5" }
      ].forEach((ikon) => {
        const link = document.createElement("link");
        Object.keys(ikon).forEach((k) => link.setAttribute(k, ikon[k]));
        document.head.appendChild(link);
      });
    }
  }

  // Nama halaman yang sedang dibuka tanpa akhiran, misalnya "pecah".
  // Beranda, baik dibuka sebagai / maupun /index.html, menjadi "index".
  function namaHalaman() {
    const akhir = decodeURIComponent(location.pathname.split("/").pop() || "").toLowerCase();
    return akhir.replace(/\.html?$/, "") || "index";
  }

  // Alamat yang masih berakhiran .html, misalnya dari markah buku lama,
  // dirapikan di bilah alamat tanpa memuat ulang halaman. GitHub Pages
  // melayani /pecah sebagai pecah.html, jadi alamat pendek itu tetap bisa
  // dibuka ulang dan dibagikan. Server lokal untuk pratinjau dilewati, sebab
  // umumnya tidak mengenal alamat tanpa .html.
  function rapikanAlamat() {
    if (!/^https?:$/.test(location.protocol) || !window.history || !history.replaceState) return;
    if (/^(localhost|127\.0\.0\.1|\[::1\])$/.test(location.hostname)) return;
    const p = location.pathname;
    let baru = null;
    if (/\/index\.html?$/i.test(p)) baru = p.replace(/index\.html?$/i, "");
    else if (/\.html?$/i.test(p)) baru = p.replace(/\.html?$/i, "");
    if (baru !== null) history.replaceState(history.state, "", baru + location.search + location.hash);
  }
  rapikanAlamat();

  function pasangMenu() {
    // Alamat halaman dibandingkan tanpa akhiran .html, sebab situs memakai
    // alamat pendek seperti /pecah, dan beranda bisa berupa / atau /index.
    const kini = namaHalaman();
    const bar = document.createElement("nav");
    bar.className = "menu";
    bar.setAttribute("aria-label", "Navigasi utama");

    const isi = document.createElement("div");
    isi.className = "menu-isi";

    const merek = document.createElement("a");
    merek.className = "menu-nama";
    merek.href = "./";
    merek.innerHTML = "Bengkel PDF<small>KPKNL BALIKPAPAN</small>";
    isi.appendChild(merek);

    const beranda = document.createElement("a");
    beranda.className = "menu-beranda";
    beranda.href = "./";
    beranda.textContent = "Beranda";
    if (kini === "index") beranda.setAttribute("aria-current", "page");
    isi.appendChild(beranda);

    const container = document.createElement("div");
    container.className = "menu-dropdown-wrapper";

    const tombol = document.createElement("button");
    tombol.className = "menu-dropdown-btn";
    tombol.type = "button";
    tombol.textContent = "Daftar Perkakas";
    tombol.setAttribute("aria-expanded", "false");
    tombol.setAttribute("aria-controls", "menu-perkakas");
    tombol.setAttribute("aria-haspopup", "true");

    const menuKonten = document.createElement("div");
    menuKonten.className = "menu-dropdown-content";
    menuKonten.id = "menu-perkakas";

    HALAMAN.forEach((item) => {
      if (item.berkas === "index") return;
      const a = document.createElement("a");
      a.href = item.berkas;
      a.textContent = item.nama;
      if (kini === item.berkas.toLowerCase()) {
        a.classList.add("aktif");
        a.setAttribute("aria-current", "page");
      }
      menuKonten.appendChild(a);
    });

    container.append(tombol, menuKonten);
    isi.appendChild(container);
    pasangBukaTutup(container, tombol);

    // Tombol mode terang/gelap: ikon saja, di ujung kanan menu.
    // Ikon bulan tampil di mode terang, ikon matahari di mode gelap (lihat gaya.css).
    if (window.Tema && window.Tema.alihMode) {
      const mode = document.createElement("button");
      mode.type = "button";
      mode.className = "menu-mode";
      mode.setAttribute("data-tombol-mode", "");
      mode.innerHTML =
        '<svg class="ikon-bulan" viewBox="0 0 24 24" aria-hidden="true" focusable="false">' +
          '<path d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5Z"/></svg>' +
        '<svg class="ikon-matahari" viewBox="0 0 24 24" aria-hidden="true" focusable="false">' +
          '<circle cx="12" cy="12" r="4"/>' +
          '<path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg>';
      mode.addEventListener("click", function () { window.Tema.alihMode(); });
      isi.appendChild(mode);
    }

    bar.appendChild(isi);
    // Pada beranda, tautan "Lewati navigasi" harus menjadi elemen fokus pertama.
    const lewati = document.querySelector(".lewati-konten");
    if (lewati) {
      lewati.insertAdjacentElement("afterend", bar);
    } else {
      document.body.insertBefore(bar, document.body.firstChild);
    }
  }

  // Perilaku buka-tutup yang sama untuk semua menu tarik-turun di bilah atas:
  // klik tombol, klik di luar, tombol Escape, dan fokus yang berpindah keluar.
  function pasangBukaTutup(container, tombol) {
    function aturTerbuka(terbuka) {
      container.classList.toggle("terbuka", terbuka);
      tombol.setAttribute("aria-expanded", String(terbuka));
    }
    tombol.addEventListener("click", (e) => {
      e.stopPropagation();
      aturTerbuka(!container.classList.contains("terbuka"));
    });
    document.addEventListener("click", (e) => {
      if (!container.contains(e.target)) aturTerbuka(false);
    });
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && container.classList.contains("terbuka")) {
        aturTerbuka(false);
        tombol.focus();
      }
    });
    container.addEventListener("focusout", (e) => {
      if (!container.contains(e.relatedTarget)) aturTerbuka(false);
    });
    return aturTerbuka;
  }

  // ============================================================
  // Objek Bersama: Pustaka Utama Penanganan Berkas & Utilities
  // ============================================================
  window.Bersama = {
    // Memasang penanganan klik & drag-and-drop unggah berkas
    pasangJatuhan: function (area, input, callback) {
      if (!area || !input) return;

      // Hentikan penjalaran event dari input file agar tidak balik memicu area
      input.addEventListener("click", (e) => {
        e.stopPropagation();
      });

      // 1. Aksi Klik pada Kotak Unggah
      area.addEventListener("click", () => {
        input.click();
      });

      // 2. Aksi Aksesibilitas Keyboard (Enter / Spasi)
      area.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          input.click();
        }
      });

      // 3. Efek Hover saat Berkas Diseret di Atas Kotak
      ["dragenter", "dragover"].forEach((namaEvent) => {
        area.addEventListener(namaEvent, (e) => {
          e.preventDefault();
          e.stopPropagation();
          area.classList.add("aktif");
        });
      });

      ["dragleave", "drop"].forEach((namaEvent) => {
        area.addEventListener(namaEvent, (e) => {
          e.preventDefault();
          e.stopPropagation();
          area.classList.remove("aktif");
        });
      });

      // 4. Menerima Berkas dari Drag & Drop
      area.addEventListener("drop", (e) => {
        const berkas = Array.from(e.dataTransfer.files || []);
        if (berkas.length > 0 && typeof callback === "function") {
          callback(berkas);
        }
      });

      // 5. Menerima Berkas dari Dialog Pilih Berkas (Klik)
      input.addEventListener("change", () => {
        const berkas = Array.from(input.files || []);
        if (berkas.length > 0 && typeof callback === "function") {
          callback(berkas);
        }
        input.value = ""; // Reset pilihan
      });
    },

    // Penyaring berkas PDF
    pdfSaja: function (daftar) {
      return daftar.filter((f) => f.type === "application/pdf" || /\.pdf$/i.test(f.name));
    },

    // Penyaring berkas Gambar (JPG/PNG)
    gambarSaja: function (daftar) {
      return daftar.filter((f) => /image\/(jpeg|png)/i.test(f.type) || /\.(jpg|jpeg|png)$/i.test(f.name));
    },

    // Menampilkan pesan status/kabar
    pesan: function (id, teks, jenis) {
      const el = document.getElementById(id);
      if (!el) return;
      el.className = "kabar" + (jenis ? " " + jenis : "");
      el.innerHTML = teks;
    },

    // Membaca PDF melalui pdf.js
    bacaPdf: async function (file) {
      const bytes = await file.arrayBuffer();
      const dok = await pdfjsLib.getDocument({ data: bytes.slice(0), isEvalSupported: false }).promise;
      return { bytes, dok, nama: file.name };
    },

    // Render halaman PDF ke Kanvas
    halamanKeKanvas: async function (dok, nomorHalaman, targetLebar) {
      const hal = await dok.getPage(nomorHalaman);
      const vpAsli = hal.getViewport({ scale: 1 });
      const skala = targetLebar / vpAsli.width;
      const vp = hal.getViewport({ scale: skala });

      const kanvas = document.createElement("canvas");
      const ctx = kanvas.getContext("2d");
      kanvas.width = vp.width;
      kanvas.height = vp.height;

      await hal.render({ canvasContext: ctx, viewport: vp }).promise;
      return kanvas;
    },

    // Fungsi Pengunduhan Berkas
    unduh: function (dataBytes, namaBerkas) {
      const blob = new Blob([dataBytes], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = namaBerkas;
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 10000);
    },

    // Pembantu string & ukuran berkas
    tanpaAkhiran: function (nama) {
      return nama.replace(/\.pdf$/i, "");
    },

    lolos: function (str) {
      return String(str)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;");
    },

    ukuran: function (bytes) {
      if (bytes < 1024) return bytes + " B";
      if (bytes < 1048576) return (bytes / 1024).toFixed(1) + " KB";
      return (bytes / 1048576).toFixed(1) + " MB";
    },

    bacaRentang: function (teks, totalHalaman) {
      const hasil = new Set();
      const bagian = teks.split(",");
      for (let item of bagian) {
        item = item.trim();
        if (!item) continue;
        if (item.includes("-")) {
          const [awal, akhir] = item.split("-").map((n) => parseInt(n.trim(), 10));
          if (!isNaN(awal) && !isNaN(akhir)) {
            const min = Math.max(1, Math.min(awal, akhir));
            const max = Math.min(totalHalaman, Math.max(awal, akhir));
            for (let i = min; i <= max; i++) hasil.add(i);
          }
        } else {
          const n = parseInt(item, 10);
          if (!isNaN(n) && n >= 1 && n <= totalHalaman) {
            hasil.add(n);
          }
        }
      }
      return Array.from(hasil).sort((a, b) => a - b);
    }
  };

  // Inisialisasi favicon dan menu saat DOM siap
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function () {
      pasangFavicon();
      pasangMenu();
      if (window.Tema) window.Tema.segarkan();
    });
  } else {
    pasangFavicon();
    pasangMenu();
    if (window.Tema) window.Tema.segarkan();
  }
})();
