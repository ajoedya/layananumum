# Layanan Subbagian Umum KPKNL Balikpapan

Situs statis (HTML, CSS, JS murni, tanpa *build step*) yang terbit lewat GitHub Pages di
`https://ajoedya.github.io/layananumum/`. Perubahan di `main` langsung tayang.

## Peta repo

| Lokasi | Isi |
|---|---|
| `index.html` | Beranda. Isinya dibaca dari Apps Script (`konten.js` → `ALAMAT_SKRIP`), dengan cadangan `KONTEN_BAWAAN` |
| `admin/` | Dasbor admin untuk menyunting isi beranda. Menyimpan lewat `doPost` ke `apps-script/AdminBeranda.gs` dengan kunci admin |
| `perjadin/` | Monitoring E-Perjadin. Datanya dibaca langsung dari CSV Google Sheet yang diterbitkan |
| `realisasi/` | Monitoring Realisasi Anggaran (dulu jagakas). Lihat `realisasi/README.md` |
| `bengkelpdf/` | Situs **Olah PDF**. Nama foldernya tetap `bengkelpdf`, tetapi nama yang tampil di layar adalah "Olah PDF". Lihat `bengkelpdf/README.md` dan `PANDUAN-PENGELOLA.md` |
| `apps-script/` | Kode Google Apps Script. Kode ini **tidak** jalan dari repo, jadi setiap perubahan harus ditempel dan di-*deploy* ulang manual di Apps Script |
| `dasar.css`, `tema.js`, `banner.js` | Dipakai bersama semua halaman: gaya dasar, mode terang/gelap (`data-mode="gelap"` di `<html>`), dan banner foto yang berganti tiap 6 jam |
| `konten.js` | Alamat Apps Script dan isi bawaan beranda |
| `jagakas/`, `perjadin.html` | Hanya pengalih ke alamat baru. Jangan dihapus |

## Aturan kerja

- **Jangan `git push` tanpa persetujuan eksplisit.** Tunjukkan perubahannya dulu (diff atau pratinjau), lalu tunggu kata "push" atau "final".
- Satu sesi untuk satu tugas. Kalau menyentuh berkas bersama (`dasar.css`, `tema.js`, `banner.js`), periksa dampaknya ke semua halaman yang memuatnya.
- **Jangan membaca utuh berkas besar.** `realisasi/index.html` berukuran sekitar 430 KB, jadi cari bagiannya dengan `grep -n` lalu baca rentang barisnya saja. Folder `bengkelpdf/pustaka/` berisi pustaka pihak ketiga (pdf.js, pdf-lib, fontkit, QPDF, Tesseract). Jangan dibaca dan jangan diubah.
- Jaga CSP di `<meta http-equiv="Content-Security-Policy">` tiap halaman. Kalau menambah sumber luar, perbarui CSP-nya dan jelaskan alasannya.
- Alamat lama harus tetap dialihkan. Kalau memindah atau mengganti nama halaman, buat pengalih seperti `jagakas/index.html`.

## Privasi data

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
