# Olah PDF

Kumpulan perkakas PDF untuk pekerjaan sehari-hari di kantor, buatan KPKNL Balikpapan. Seluruh pengolahan berjalan di peramban pengguna, jadi **berkas tidak pernah diunggah ke server mana pun**.

**Buka situsnya di [ajoedya.github.io/layananumum/bengkelpdf](https://ajoedya.github.io/layananumum/bengkelpdf/)**

![Beranda Olah PDF](dokumentasi/beranda.jpg)

## Perkakas yang tersedia

| No | Perkakas | Kegunaan |
|---|---|---|
| 01 | [Gabung/Pecah](https://ajoedya.github.io/layananumum/bengkelpdf/gabung-pecah) | Menggabungkan beberapa PDF, mengurutkan, memutar, dan memberi nomor halaman, lalu menyimpannya sebagai satu berkas, mengambil halaman tertentu, atau memecahnya satu berkas per halaman |
| 02 | [Edit Teks](https://ajoedya.github.io/layananumum/bengkelpdf/koreksi) | Mengetik langsung di halaman dengan gaya huruf aslinya, menyunting satu paragraf dengan alir ulang dan perataan, mengganti, memutar, atau memotong gambar, menandai dengan stabilo, coretan, dan catatan, mengenali teks pindaian lewat OCR, serta menyisipkan teks, gambar, dan bentuk |
| 03 | [Watermark](https://ajoedya.github.io/layananumum/bengkelpdf/tanda-air) | Membubuhkan tulisan seperti SALINAN atau KONSEP |
| 04 | [PDF dan Gambar](https://ajoedya.github.io/layananumum/bengkelpdf/gambar) | Mengubah halaman PDF menjadi JPG, atau menyusun gambar menjadi PDF |
| 05 | [PDF ke Word](https://ajoedya.github.io/layananumum/bengkelpdf/word) | Mengubah PDF menjadi dokumen Word yang bisa disunting, termasuk hasil pindaian lewat OCR |
| 06 | [Penanda TTE](https://ajoedya.github.io/layananumum/bengkelpdf/penanda) | Membubuhkan penanda tulisan tanda tangan elektronik |
| 07 | [Ubah Ukuran Kertas](https://ajoedya.github.io/layananumum/bengkelpdf/pengubah-uk) | Menyesuaikan ukuran halaman, misalnya ke A4 atau F4 |
| 08 | [Kompres PDF](https://ajoedya.github.io/layananumum/bengkelpdf/kompres) | Memperkecil ukuran berkas dengan teks tetap utuh dan bisa dicari |
| 09 | [Kunci PDF](https://ajoedya.github.io/layananumum/bengkelpdf/kunci) | Memberi kata sandi (AES-256) dan membatasi izin cetak, salin, atau ubah, atau membuka kunci berkas yang kata sandinya diketahui |

![Edit Teks](dokumentasi/edit-teks.jpg)

## Privasi

Olah PDF adalah situs statis. Pustaka pembaca dan penulis PDF dimuat ke peramban, lalu semua pekerjaan (membaca, menyunting, mengonversi, menyimpan) dikerjakan di komputer pengguna sendiri. Tidak ada server aplikasi, tidak ada akun, dan tidak ada berkas yang dikirim keluar.

Semua pustaka disimpan di folder `pustaka/`: pdf.js, pdf-lib, fontkit, QPDF versi WebAssembly, Tesseract.js beserta inti mesin OCR (`tesseract/core`) dan data bahasa Indonesia dan Inggris (`tesseract/lang`), serta huruf Public Sans, Arimo, Tinos, dan Cousine (`huruf/`, lisensinya di `huruf/LISENSI.md`). Situs tidak memuat apa pun dari CDN atau Google.

Satu-satunya alamat luar adalah Apps Script situs utama (`script.google.com`), untuk statistik pemakaian: nama perkakas yang dibuka dan dipakai, dihitung per hari. Nama, isi, dan ukuran berkas tidak pernah dikirim. Setiap halaman memasang *Content Security Policy* yang hanya mengizinkan alamat itu, sehingga skrip dari tempat lain tidak bisa dimuat dan data tidak bisa dikirim ke alamat lain.

## Aplikasi offline

`sw.js` adalah *service worker* yang menyimpan halaman, skrip, dan pustaka di peramban. Setelah sekali dibuka, Olah PDF tetap bisa dipakai tanpa internet, dan bisa dipasang seperti aplikasi lewat `manifest.webmanifest` (tombol "Instal" di bilah alamat peramban). Halaman dan skrip situs selalu diambil dari jaringan lebih dulu, jadi perubahan langsung terlihat; pustaka diambil dari simpanan. Naikkan `VERSI` di `sw.js` bila pustaka diganti.

PDF yang dipilih atau dilepas di beranda dititipkan sebentar di IndexedDB peramban, lalu diambil sekali oleh perkakas yang dipilih (`Bersama.titipkan` dan langkah 6 di `Bersama.pasangJatuhan`). Perkakas yang terakhir dipakai disimpan di `localStorage` peramban itu saja.

## Tampilan

Banner Olah PDF sama dengan beranda Layanan Subbagian Umum. Fotonya diambil dari daftar banner beranda (diatur di dasbor admin), berganti bersamaan dengan beranda tiap beberapa menit, dan memakai foto malam di mode gelap. Pengaturnya `../banner.js` dan `banner-bengkel.js`. Warna situs dikunci ke tema navy-emas; foto tema lama (`banner-*.jpg` di folder ini) tidak dipakai lagi.

## Untuk pengelola

- Situs diterbitkan dengan GitHub Pages dari cabang `main`, folder akar. Setiap penggabungan ke `main` langsung tayang dalam satu sampai dua menit.
- Tidak ada langkah *build*. Setiap perkakas adalah satu berkas HTML yang berdiri sendiri, ditambah `tema.js`, `gaya.css`, dan `bersama.js` yang dipakai bersama.
- Untuk mencoba di komputer sendiri, jalankan peladen statis apa pun di folder ini, misalnya `python -m http.server`, lalu buka `http://localhost:8000`. Membuka berkas langsung lewat `file://` tidak akan berjalan karena pembatasan peramban.
- Rincian berkas, cara menambah perkakas atau tema, pemeriksaan sebelum menyebarkan, dan hal-hal yang sengaja tidak dibuat ada di [PANDUAN-PENGELOLA.md](PANDUAN-PENGELOLA.md).

## Ide perkakas berikutnya

Catatan untuk nanti, belum dikerjakan:

- **Tanda tangan atau cap gambar.** Menempelkan gambar tanda tangan atau stempel ke PDF, untuk dokumen yang bukan TTE.
- **Putar cepat dan hapus halaman.** Perkakas satu langkah; fungsinya sekarang ada di dalam Gabung/Pecah, tetapi tidak semua orang tahu.
- **Isi formulir PDF.** Mengisi isian formulir PDF lalu menyimpannya.
- **Bandingkan dua PDF.** Menyorot perbedaan teks antara dua versi naskah.
