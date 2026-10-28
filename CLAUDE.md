# Layanan Subbagian Umum KPKNL Balikpapan

Situs statis (HTML, CSS, JS murni, tanpa *build step*) yang terbit lewat GitHub Pages di
`https://ajoedya.github.io/layananumum/`. Perubahan di `main` langsung tayang.

## Peta repo

| Lokasi | Isi |
|---|---|
| `index.html` | Beranda. Isinya dibaca dari Apps Script (`konten.js` → `ALAMAT_SKRIP`), dengan cadangan `KONTEN_BAWAAN` |
| `admin/` | Dasbor admin: isi beranda, tab Pop up (pemberitahuan di pojok layar), tab Tampilan (ukuran, warna, huruf), Pratinjau ponsel/komputer, jadwal tayang, Statistik, Penyunting, Aktivitas, dan Monev anggaran. Menyimpan lewat `doPost` ke `apps-script/AdminBeranda.gs` dengan kunci admin atau kunci penyunting |
| `perjadin/` | Monitoring E-Perjadin. Datanya dibaca langsung dari CSV Google Sheet yang diterbitkan |
| `realisasi/` | Monitoring Realisasi Anggaran (dulu jagakas). Datanya dibaca dari Apps Script (aksi `realisasi`), diterbitkan lewat menu Monev anggaran di `admin/`; data tertanam hanya cadangan. `pembaca-fa.js` adalah pembaca Laporan Fa untuk admin (salinan bagian 1 `index.html`), `pustaka/` berisi SheetJS. Lihat `realisasi/README.md` |
| `bengkelpdf/` | Situs **Olah PDF**. Nama foldernya tetap `bengkelpdf`, tetapi nama yang tampil di layar adalah "Olah PDF". Lihat `bengkelpdf/README.md` dan `PANDUAN-PENGELOLA.md` |
| `apps-script/` | Kode Google Apps Script. Kode ini **tidak** jalan dari repo, jadi setiap perubahan harus ditempel dan di-*deploy* ulang manual di Apps Script |
| `dasar.css`, `tema.js`, `banner.js` | Dipakai bersama semua halaman: gaya dasar, mode terang/gelap (`data-mode="gelap"` di `<html>`), dan banner foto yang berganti tiap 6 jam |
| `konten.js` | Alamat Apps Script, isi bawaan beranda, dan mesin gaya (`Konten.cssGaya`, daftar `ELEMEN` dan `HURUF`). Daftar itu harus sama dengan daftar putih `gaya_` di Apps Script. Tema dan huruf hanya berlaku di beranda |
| `popup.js`, `popup.css` | Pop up pemberitahuan bersama (beranda, Perjadin, Realisasi, Olah PDF). Isinya daftar `pemberitahuan` dari tab Pop up di `admin/`: jenis, tombol tautan, antrean bergilir, frekuensi, posisi, jeda, halaman tujuan. Daftar pilihannya (`Konten.PEMBERITAHUAN`) harus sama dengan daftar putih `pemberitahuan_` di Apps Script. Olah PDF tidak mengambil isi dari Apps Script karena CSP-nya sengaja menutup sambungan keluar; ia hanya memakai isi yang sudah tersimpan di peramban |
| `gerak.js`, `gerak.css` | Pil emas yang bergeser mulus antar menu, sama dengan menu kelompok beranda. Dipakai Olah PDF (`.rk-kelompok`) dan Realisasi (`nav.tab`) lewat `Gerak.pilMenu`. Beranda masih memakai kodenya sendiri di `index.html` |
| `jagakas/`, `perjadin.html` | Hanya pengalih ke alamat baru. Jangan dihapus |

## Aturan kerja

- **Jangan `git push` tanpa persetujuan eksplisit.** Tunjukkan perubahannya dulu (diff atau pratinjau), lalu tunggu kata "push" atau "final".
- Satu sesi untuk satu tugas. Kalau menyentuh berkas bersama (`dasar.css`, `tema.js`, `banner.js`), periksa dampaknya ke semua halaman yang memuatnya.
- **Jangan membaca utuh berkas besar.** `realisasi/index.html` berukuran sekitar 430 KB, jadi cari bagiannya dengan `grep -n` lalu baca rentang barisnya saja. Folder `bengkelpdf/pustaka/` dan `realisasi/pustaka/` berisi pustaka pihak ketiga (pdf.js, pdf-lib, fontkit, QPDF, Tesseract). Jangan dibaca dan jangan diubah. Aturan pembacaan Laporan Fa ada di dua tempat (`realisasi/index.html` dan `realisasi/pembaca-fa.js`), ubah keduanya sekaligus.
- Jaga CSP di `<meta http-equiv="Content-Security-Policy">` tiap halaman. Kalau menambah sumber luar, perbarui CSP-nya dan jelaskan alasannya.
- Alamat lama harus tetap dialihkan. Kalau memindah atau mengganti nama halaman, buat pengalih seperti `jagakas/index.html`.

## Privasi data

- Statistik kunjungan dan klik hanya menyimpan hitungan harian (tanpa IP, identitas, atau kuki). Jangan menambah data pribadi ke sana.
- Data Monev, daftar penyunting, dan log hanya untuk kunci admin (`IZIN_` di Apps Script).

- Situs publik **tidak boleh menautkan** spreadsheet sumber. Spreadsheet itu urusan internal.
- **NIP tidak boleh tampil** di web, meskipun ada di spreadsheet.
- Olah PDF memproses semuanya di peramban pengguna. Jangan menambah fitur yang mengunggah berkas ke server.

## Bahasa dan tulisan

- Teks antarmuka memakai bahasa Indonesia baku sesuai EYD Edisi V, huruf kapital hanya di awal kalimat (*sentence case*), dan tanpa tanda pisah panjang (em dash).
- Istilah anggaran memakai istilah resmi (pagu, realisasi, blokir, RO, akun) secara konsisten.
- Komentar kode ditulis dalam bahasa Indonesia, mengikuti gaya komentar di berkas yang sudah ada.

## UI/UX skills

Taste, a11y, bans, voice, and icon library for this project live in `.ux-profile.md`.
Run `setup-ui-ux-skills` again only to change those defaults.
Before UI or microcopy work, read `.ux-profile.md`, then the matching domain skill (page-patterns, viewports, forms, surfaces, loaders, empty-states, copy, motion).
Before creating a new page, read `page-patterns` and name the pattern. Do not write page markup until the pattern is named.
Layouts must pass `viewports` at 375px and 1280px.
Before finishing UI, run `ux-audit`.

Identitas visual yang harus dipertahankan: palet navy dan emas, huruf Public Sans, banner foto Balikpapan, panel navy di kiri dengan menu kotak bersudut membulat, serta mode terang/gelap lewat `tema.js`.

## Memeriksa hasil

Tidak ada *test suite*. Untuk memeriksa hasil, jalankan `python3 -m http.server` dari akar repo lalu buka halamannya di lebar 375px dan 1280px, dalam mode terang maupun gelap. Periksa juga konsol peramban untuk galat CSP.
