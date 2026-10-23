# Panduan Pengelolaan Bengkel PDF

Dokumen ini untuk pengelola situs, bukan untuk pengguna. Petunjuk pemakaian tiap perkakas sudah tertulis di halamannya masing-masing, jadi tidak perlu diulang di sini. Gambaran umum situs ada di `README.md`.

---

## 1. Isi situs

Semua berkas duduk sejajar pada lapisan paling atas *repository*. Tidak boleh ada yang masuk ke dalam folder (kecuali folder `dokumentasi`, yang hanya berisi gambar untuk README, dan folder `beta`, tempat uji coba tata letak yang memakai `<base href="../">`), sebab seluruh tautan antarhalaman ditulis secara relatif.

| Berkas | Peran |
|---|---|
| `index.html` | Beranda: panel banner yang menempel di kiri berisi pencarian, kisi kartu perkakas ringkas di kanan |
| `gabung-pecah.html` | Gabung/Pecah: gabung dan susun PDF (putar, buang, nomor halaman), ambil halaman tertentu, atau pecah satu berkas per halaman |
| `koreksi.html` | Edit Teks: ketik langsung, sunting paragraf, huruf tertanam, teks di Form XObject, OCR, gambar asli dan sisipan, bentuk, serta anotasi stabilo, coretan, dan catatan |
| `tanda-air.html` | Pembubuh tanda air (*watermark*), pratinjau di kiri dan panel pengaturan di kanan |
| `gambar.html` | PDF ke gambar dan gambar ke PDF |
| `word.html` | PDF ke Word, termasuk OCR untuk hasil pindaian |
| `penanda.html` | Pembubuh penanda tanda tangan elektronik |
| `pengubah-uk.html` | Pengubah ukuran kertas |
| `kompres.html` | Pemampat ukuran berkas |
| `gabung.html`, `pecah.html`, `susun.html`, `nomor.html` | Halaman pengalih ke `gabung-pecah.html`, supaya tautan lama tetap jalan |
| `beta/` | Tempat uji coba tata letak; `beta/beta.js` mengarahkan menu ke halaman beta |
| `tema.js` | Pengundi tema, dimuat paling awal di setiap halaman |
| `gaya.css` | Warna, huruf, tema, dan tata letak seluruh halaman |
| `editorial.css` | Tata letak khusus beranda |
| `bersama.js` | Menu atas, ikon situs, alamat pendek, dan alat bantu yang dipakai semua halaman |
| `banner-*.jpg` | Gambar banner, satu untuk tiap tema |
| `ornamen-kalimantan-anyaman.svg` | Ornamen di sisi kop dan beranda |
| `favicon*` | Ikon situs untuk tab peramban dan layar ponsel |

Tiga berkas `tema.js`, `gaya.css`, dan `bersama.js` adalah tulang punggungnya. Kalau salah satu tidak ikut terunggah, seluruh situs tetap terbuka tetapi tanpa tema, tanpa warna, atau tanpa menu.

---

## 2. Menerbitkan pertama kali

> **Catatan per Oktober 2026.** Bengkel PDF kini menjadi folder `bengkelpdf/` di dalam repo `layananumum` dan terbit di `https://ajoedya.github.io/layananumum/bengkelpdf/`. Pembaruan cukup dilakukan dengan mengubah berkas di folder itu. Langkah di bawah hanya diperlukan bila situs ini kelak diterbitkan ulang sebagai repo tersendiri.

1. Kumpulkan seluruh berkas pada tabel di atas dalam satu folder di komputer, lalu cocokkan ulang daftarnya.
2. Buka `github.com`, buat akun bila belum punya, lalu klik tanda tambah di pojok kanan atas dan pilih **New repository**.
3. Isi *Repository name* dengan `bengkelpdf`, pilih **Public**, lalu klik **Create repository**. GitHub Pages gratis hanya berjalan pada *repository* publik.
4. Klik **Add file** lalu **Upload files**. Buka folder tadi, tekan Ctrl+A untuk memilih seluruh berkasnya, lalu seret ke kotak unggahan. **Yang diseret harus berkasnya, bukan foldernya**, sebab GitHub akan ikut membuatkan folder itu di dalam *repository* dan seluruh tautan jadi salah alamat.
5. Gulir ke bawah lalu klik **Commit changes**.
6. Masuk ke tab **Settings**, pilih menu **Pages** di kolom kiri, ubah *Branch* dari `None` menjadi `main`, biarkan folder pada pilihan `/ (root)`, lalu klik **Save**.
7. Tunggu satu sampai dua menit, muat ulang halaman *Pages* tadi, dan alamat situsnya akan muncul dengan bentuk `https://namapenggunamu.github.io/bengkelpdf/`.

---

## 3. Pemeriksaan wajib sebelum disebarkan

Jangan menyebarkan alamatnya sebelum kelima hal berikut lolos, dan lakukan pengujian di **komputer kantor pada jaringan kantor**, bukan di komputer pribadi.

1. **Seluruh menu terbuka.** Klik satu per satu kedelapan tautan perkakas pada menu atas, pastikan tidak ada yang menampilkan halaman 404. Kalau ada, berarti berkasnya belum terunggah atau namanya tertulis berbeda, sebab GitHub membedakan huruf besar dan kecil.
2. **Warna dan menu muncul.** Kalau halaman tampil polos tanpa warna, `gaya.css` belum terunggah. Kalau menu atas tidak ada, `bersama.js` yang belum.
3. **Pembacaan PDF berjalan.** Buka `penanda.html`, pilih satu Nota Dinas polos, dan pastikan pratinjaunya tergambar. Kalau berkas terpilih tetapi tidak terjadi apa pun, kemungkinan ada galat skrip, jadi buka konsol peramban (F12) untuk melihat sebabnya.
4. **Unduhan beruntun.** Buka `gabung-pecah.html`, pilih bentuk hasil satu berkas per halaman, lalu pastikan berkasnya benar-benar tersimpan semua dan bukan hanya yang pertama. Ini bagian yang paling sering bermasalah sebab perilaku tiap peramban berbeda.
5. **Hasilnya benar.** Buka berkas keluaran dengan Adobe Reader, bukan hanya dengan pratinjau peramban, dan periksa letak penandanya pada halaman yang benar.

---

## 4. Memperbarui

Cukup unggah berkas yang berubah saja, tidak perlu semuanya. Berkas dengan nama sama akan tertimpa setelah **Commit changes**.

Yang perlu diingat, peramban menyimpan salinan berkas lama. Jadi sesudah memperbarui, tampilan pengguna biasanya masih versi lama sampai halamannya dimuat ulang secara paksa dengan **Ctrl + Shift + R**. Sampaikan hal ini setiap kali kamu mengumumkan perbaikan, sebab kalau tidak, akan ada laporan bahwa perbaikanmu tidak muncul padahal sudah terpasang.

### Menambah perkakas baru

Menu atas ditulis sekali saja di dalam `bersama.js`, pada senarai `HALAMAN` di bagian paling atas berkas. Tambahkan satu baris di sana, lalu menunya ikut berubah di seluruh halaman.

```javascript
{ berkas: "namabaru.html", nama: "Nama di Menu" }
```

Halaman baru cukup memuat `tema.js` dan `gaya.css` pada bagian kepala (dengan urutan itu) serta `bersama.js` pada bagian bawah, lalu seluruh warna, tema, dan menunya mengikuti sendiri.

### Alamat pendek

Tautan antarhalaman ditulis tanpa akhiran `.html`, misalnya `pecah` alih-alih `pecah.html`. GitHub Pages melayani keduanya, dan `bersama.js` merapikan alamat di bilah peramban bila pengguna membuka versi berakhiran `.html`. Pertahankan cara ini saat menambah tautan baru.

### Mengganti atau menambah tema

> **Catatan (Oktober 2026).** Banner kini mengikuti beranda Layanan Subbagian Umum lewat `../banner.js` dan `banner-bengkel.js`, dan `tema.js` dikunci ke tema bawaan navy-emas. Untuk mengganti foto, ubah daftar banner di dasbor admin beranda. Uraian di bawah ini berlaku bila pengundian tema acak dipulihkan.

Situs punya beberapa tema, dan masing-masing berpasangan dengan satu gambar banner. Tema **diundi secara acak setiap kali situs dikunjungi**. Selama kunjungan itu (satu tab peramban), semua halaman memakai tema yang sama, dan kunjungan berikutnya diusahakan mendapat tema yang berbeda. Tidak ada tombol pemilih tema.

Tema diatur di dua tempat:

1. **`tema.js`**, senarai `DAFTAR`. Di sini nama tema dan uraian gambar bannernya untuk pembaca layar.
2. **`gaya.css`**, bagian "Tema". Tiap tema punya satu blok `:root[data-tema="..."]` berisi nilai warna, nama berkas banner, dan letak potongan gambarnya. Tema Pelabuhan Senja memakai nilai pada blok `:root` di bagian paling atas berkas, sekaligus menjadi cadangan bila skrip tidak berjalan.

Untuk menambah tema, unggah gambar bannernya, salin satu blok tema di `gaya.css` lalu ganti nilainya, dan tambahkan satu baris di `DAFTAR`. Tema baru langsung ikut diundi. Pastikan warna teks tetap terbaca di atas warna latar yang baru.

### Mode terang dan gelap

Selain tema, situs punya mode terang dan gelap. Saat dibuka, mode **mengikuti tema perangkat** pengunjung (pengaturan terang atau gelap di Windows, macOS, atau ponsel). Di ujung kanan menu atas ada tombol bulat kecil berikon bulan atau matahari untuk berganti mode. Pilihan itu diingat oleh peramban pengunjung dan berlaku di semua halaman. Bila pengunjung kembali memilih mode yang sama dengan perangkatnya, situs kembali mengikuti perangkat.

Warnanya ada di `gaya.css`, bagian "Mode gelap". Blok `:root[data-mode="gelap"]` berisi warna dasar, sedangkan blok `:root[data-mode="gelap"][data-tema="..."]` menjaga rona khas tiap tema. Tombol dan penanda aktif memakai `--aksen-latar` dan `--aksen-teks`, bukan `--biru-tua` dan `--putih`, karena di mode gelap `--biru-tua` berubah menjadi warna judul yang terang. Pratinjau halaman PDF memakai `--kertas` yang selalu putih supaya isi dokumen tampak apa adanya. Bila menambah tema baru, periksa juga tampilannya di mode gelap. Di mode gelap, tema Pelabuhan Senja, Tepian Kota, Kilang, dan Tongkang memakai foto malam (`banner-*-malam.jpg`, kualitas tinggi tanpa diperkecil), sedangkan Hutan Hujan dan Mangrove tetap memakai banner siangnya. Di panel beranda, foto malam diperkecil lewat `--banner-latar-ukuran` supaya objeknya tidak tertutup kabut.

Di beranda, banner menjadi latar panel kiri yang bentuknya tegak, jadi hanya sebagian foto yang tampak. Bagian yang tampak diatur lewat `--banner-latar-posisi` (posisi mendatar lalu tegak, misalnya `12% 100%` untuk menampakkan sisi kiri bawah foto). Bila objek khasnya terlalu tinggi sehingga tertutup kabut di bagian atas, perbesar fotonya lewat `--banner-latar-ukuran` (misalnya `auto 140%` seperti pada tema Tongkang) dan atur posisinya ke atas. Supaya tidak buram di layar beresolusi tinggi, gambar banner sebaiknya **paling tidak 2400 × 1200 piksel** dan disimpan sebagai JPG berkualitas tinggi (sekitar 90), dengan objek khasnya tidak terlalu jauh dari bagian bawah foto.

---

## 5. Ketergantungan yang perlu diwaspadai

Pustaka pdf.js, pdf-lib, fontkit, dan skrip Tesseract.js sudah ikut disimpan di folder `pustaka/`, sehingga fungsi utama tetap jalan walaupun jaringan kantor menyaring CDN. Tinggal dua alamat luar yang dipanggil.

| Alamat | Kegunaan | Akibat kalau tersaring |
|---|---|---|
| `cdn.jsdelivr.net` | Inti mesin dan data bahasa Tesseract.js untuk OCR, serta huruf untuk Koreksi PDF | Hanya pengenalan teks hasil pindaian dan penanaman huruf yang mati |
| `fonts.googleapis.com` | Huruf Public Sans | Hanya hurufnya berubah, fungsinya tetap jalan |

Kalau menambah pustaka atau alamat luar baru, ingat memperbarui *Content Security Policy* di bagian `<head>` setiap halaman. Tanpa itu, peramban akan memblokir alamat baru tersebut. Saat memutakhirkan pdf.js, pertahankan opsi `isEvalSupported: false` di setiap pemanggilan `getDocument`.

---|---|---|
| `cdnjs.cloudflare.com` | Pustaka pdf.js, membaca dan menggambar PDF | Pratinjau dan deteksi nama mati total |
| `unpkg.com` | Pustaka pdf-lib, menulis PDF | Penyimpanan hasil gagal |
| `cdn.jsdelivr.net` | Tesseract.js untuk OCR di PDF ke Word | Hanya pengenalan teks hasil pindaian yang mati |
| `fonts.googleapis.com` | Huruf Public Sans | Hanya hurufnya berubah, fungsinya tetap jalan |

Dua yang pertama bersifat menentukan. Kalau jaringan kantormu menyaringnya, jalan keluarnya adalah membuat versi mandiri, yaitu kedua pustaka itu ikut diunggah ke *repository* sehingga tidak ada panggilan keluar sama sekali. Ukurannya bertambah sekitar satu setengah megabita, tetapi tahan terhadap penyaringan dan tetap jalan meski internet mati.

---

## 6. Batas kemampuan yang sengaja tidak disediakan

Hal berikut sengaja tidak dibuat, dan alasannya perlu kamu pegang supaya bisa menjawab kalau ada yang meminta.

**Pembuatan QR *Code* verifikasi.** QR pada naskah dinas bertanda tangan elektronik bukan hiasan, melainkan penaut ke data verifikasi di sisi Kemenkeu dan Komdigi. QR yang dibuat sendiri atau disalin dari dokumen lain akan membuat naskah tampak sah padahal tidak, dan itu bukan sekadar keliru secara teknis melainkan berbahaya.

---

## 7. Tanggung jawab

Sejak alamat situs ini disebarkan, orang akan memakainya untuk naskah dinas yang sesungguhnya, dan statusnya bukan lagi percobaan pribadi. Tiga hal berikut sebaiknya kamu kerjakan.

1. **Beri tahu pengelola teknologi informasi di kantormu.** Bukan meminta izin formal, melainkan supaya ada yang tahu ketika nanti muncul pertanyaan tentang keamanan atau ketika kamu berpindah tugas.
2. **Tawarkan agar berkasnya dititipkan di laman internal kantor.** Alamat berakhiran `github.io` terbaca sebagai milik pribadi, dan untuk perkakas yang menyentuh naskah dinas hal itu akan terus menimbulkan pertanyaan tentang siapa yang bertanggung jawab bila ada dokumen yang rusak. Caranya sama saja, sebab yang dibutuhkan hanya berkas statis.
3. **Cek dulu apakah aplikasi TTE kantormu sudah membubuhkan penandanya sendiri.** Sebagian aplikasi berbasis sertifikat BSrE membubuhkan penanda visual berikut QR secara otomatis pada saat penandatanganan. Kalau begitu keadaannya, perkakas penanda ini justru menghasilkan tulisan ganda, dan pengguna perlu diberi tahu kapan perkakas itu tidak boleh dipakai.

---

## 8. Saran urutan pengembangan

Jangan menambah fitur sebelum yang sekarang teruji dipakai orang sungguhan. Serahkan dulu ke satu atau dua rekan selama dua pekan, sebab kesalahan yang muncul dari pemakaian nyata akan mengubah rancanganmu jauh lebih banyak daripada penambahan fitur. Perkakas yang mengerjakan sedikit hal dengan benar jauh lebih berguna daripada sepuluh fitur yang setengah jadi.

Kalau nanti berkembang, pertahankan aturan satu perkakas satu berkas. Aturan itulah yang membuat kesalahan pada satu fitur tidak menjatuhkan yang lain.
