/* ============================================================
   Service worker Olah PDF
   - Halaman, skrip, dan gaya situs: jaringan dulu (selalu versi terbaru), lalu salinan tersimpan bila offline
     atau jaringan terlalu lambat (lebih dari 4 detik).
   - Pustaka di pustaka/ dan berkas huruf: simpanan dulu, karena isinya tidak berubah tanpa ganti versi.
     Mesin OCR, data bahasa, dan QPDF ikut tersimpan saat pertama kali dipakai.
   - Hanya permintaan GET ke situs ini yang disimpan. Berkas PDF pengguna tidak pernah melewati service worker
     ke server mana pun dan tidak disimpan di sini.
   Naikkan VERSI bila daftar AWAL berubah atau pustaka diganti, supaya simpanan lama dibuang.
   ============================================================ */
const VERSI = "olahpdf-v1";
const SIMPAN_SITUS = VERSI + "-situs";
const SIMPAN_PUSTAKA = VERSI + "-pustaka";

// Disiapkan saat dipasang supaya semua perkakas bisa dibuka offline sejak kunjungan pertama.
const AWAL = [
  "./", "gabung-pecah", "pengubah-uk", "gambar", "word", "pdf-excel", "koreksi", "tanda-air", "penanda",
  "kompres", "rapikan-ocr", "kunci", "metadata",
  "gaya.css", "editorial.css", "alat-baru.css", "bersama.js", "tema.js", "banner-bengkel.js", "alat-baru.js",
  "word.js", "koreksi.js", "manifest.webmanifest", "favicon.svg", "favicon-192.png",
  "../dasar.css", "../gerak.css", "../gerak.js", "../konten.js", "../banner.js", "../popup.css", "../popup.js",
  "pustaka/huruf/public-sans.css", "pustaka/huruf/public-sans-latin.woff2", "pustaka/huruf/public-sans-latin-ext.woff2",
  "pustaka/pdfjs/pdf.min.js", "pustaka/pdfjs/pdf.worker.min.js", "pustaka/pdf-lib.min.js",
  "pustaka/tesseract/tesseract.min.js", "pustaka/tesseract/worker.min.js"
];

self.addEventListener("install", (e) => {
  e.waitUntil((async () => {
    const situs = await caches.open(SIMPAN_SITUS), pustaka = await caches.open(SIMPAN_PUSTAKA);
    // Satu per satu, supaya satu berkas yang gagal tidak menggagalkan seluruh pemasangan.
    await Promise.all(AWAL.map((u) => (u.indexOf("pustaka/") === 0 ? pustaka : situs).add(u).catch(() => {})));
    await self.skipWaiting();
  })());
});

self.addEventListener("activate", (e) => {
  e.waitUntil((async () => {
    const nama = await caches.keys();
    await Promise.all(nama.filter((n) => n.indexOf("olahpdf-") === 0 && n.indexOf(VERSI + "-") !== 0).map((n) => caches.delete(n)));
    await self.clients.claim();
  })());
});

function pustaka(url) { return /\/bengkelpdf\/pustaka\//.test(url.pathname) || /\.woff2?$|\.ttf$/.test(url.pathname); }

async function simpananDulu(req) {
  const simpan = await caches.open(SIMPAN_PUSTAKA);
  const ada = await simpan.match(req, { ignoreSearch: true });
  if (ada) return ada;
  const res = await fetch(req);
  if (res.ok && res.type === "basic") simpan.put(req, res.clone()).catch(() => {});
  return res;
}

async function jaringanDulu(req) {
  const simpan = await caches.open(SIMPAN_SITUS);
  const dariJaringan = fetch(req).then((res) => {
    if (res.ok && res.type === "basic") simpan.put(req, res.clone()).catch(() => {});
    return res;
  });
  dariJaringan.catch(() => {});
  // Jaringan lambat: pakai salinan tersimpan setelah 4 detik, sementara salinan baru tetap diperbarui di belakang.
  const batas = new Promise((selesai) => setTimeout(selesai, 4000));
  try {
    const hasil = await Promise.race([dariJaringan, batas.then(() => simpan.match(req, { ignoreSearch: true }))]);
    if (hasil) return hasil;
    return await dariJaringan;
  } catch (err) {
    const ada = await simpan.match(req, { ignoreSearch: true });
    if (ada) return ada;
    if (req.mode === "navigate") {
      const beranda = await simpan.match("./");
      if (beranda) return beranda;
    }
    throw err;
  }
}

self.addEventListener("fetch", (e) => {
  const req = e.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  if (url.origin !== location.origin) return;           // Apps Script dan situs lain tidak disentuh
  if (req.headers.has("range")) return;
  e.respondWith(pustaka(url) ? simpananDulu(req) : jaringanDulu(req));
});
