# Panduan serah terima Layanan Subbagian Umum

Panduan ini untuk pengelola berikutnya situs `para.my.id` (Layanan Subbagian Umum KPKNL Balikpapan). Isinya: apa saja yang membuat situs ini berjalan, akses yang harus diserahkan, pekerjaan rutin, dan cara memulihkan bila ada yang putus.

Repo ini terbuka untuk umum. **Jangan menulis kunci, kata sandi, alamat spreadsheet, atau nama akun pribadi di berkas ini.** Catat semua itu di dokumen serah terima internal kantor.

## 1. Bagian yang membuat situs berjalan

| Bagian | Fungsinya | Bila putus |
|---|---|---|
| Repo GitHub `layananumum` | Seluruh halaman situs. Setiap perubahan di cabang `main` langsung tayang lewat GitHub Pages | Situs tidak bisa diperbarui. Halaman yang sudah tayang tetap jalan |
| Domain `para.my.id` | Alamat situs. Berkas `CNAME` di repo mengarahkan GitHub Pages ke domain ini | Situs hanya bisa dibuka lewat `ajoedya.github.io/layananumum/` |
| Spreadsheet penyimpan beserta Apps Script `AdminBeranda.gs` | Isi beranda, pop up, data realisasi, prognosa, statistik, daftar penyunting, dan log. Dasbor admin menyimpan ke sini | Beranda memakai isi cadangan di `konten.js`. Dasbor admin, Monitoring Realisasi (data terbaru), dan Prognosa tidak bisa dipakai |
| Spreadsheet Monitoring E-Perjadin beserta `TautanBukti.gs` | Data status pembayaran surat tugas. Tab E-Perjadin diterbitkan sebagai CSV (Publish to web) | Halaman Perjadin kosong dan daftar ST di Prognosa tidak muncul |
| Olah PDF (`bengkelpdf/`) | Seluruhnya berjalan di peramban, tanpa server | Tidak bergantung pada akun mana pun selain repo |

Alamat Apps Script (`ALAMAT_SKRIP`) dan alamat CSV Perjadin (`SUMBER_CSV_PERJADIN`) ada di `konten.js`. Hanya dua baris itu yang perlu diganti bila server atau sumber datanya pindah.

## 2. Akses yang harus diserahkan

Catat di dokumen internal siapa pemilik setiap akses berikut dan kapan diserahkan.

| Akses | Cara menyerahkan |
|---|---|
| Repo GitHub | Tambahkan pengelola baru sebagai *collaborator* (Settings > Collaborators), atau pindahkan repo ke akun organisasi kantor (Settings > Transfer). Setelah dipindah, periksa Settings > Pages: sumbernya cabang `main` dan domain kustomnya `para.my.id` |
| Domain `para.my.id` | Catat penyedia domain, tanggal habis masa aktif, dan akun yang membayarnya. Aktifkan perpanjangan otomatis bila tersedia. Domain `.my.id` diperpanjang tahunan |
| Spreadsheet penyimpan dan Apps Script | Bagikan spreadsheet sebagai editor kepada pengelola baru. Aplikasi web berjalan **sebagai pemilik deployment**, jadi bila akun pemilik tidak aktif lagi, ikuti langkah di bagian 5 |
| Spreadsheet Monitoring E-Perjadin | Bagikan sebagai editor kepada pengelola baru. Pemicu `TautanBukti.gs` berjalan atas nama akun yang memasangnya, jadi pasang ulang pemicunya dari akun pengelola baru (fungsi `pasangPemicu`) |
| Kunci admin | Ganti lewat menu spreadsheet **Dasbor Beranda > Setel kunci admin**. Kunci lama langsung tidak berlaku |
| Kunci prognosa (bersama seksi) | Ganti di dasbor admin, Monev anggaran > kotak Pengajuan TUP |
| Penyunting terdaftar | Nonaktifkan atau tambahkan di dasbor admin, tab Penyunting |

## 3. Pekerjaan rutin

### Setiap bulan

- Mulai tanggal 5, impor Laporan Ketersediaan Dana Detail (Fa) 16 Segmen bulan lalu di dasbor admin > Monev anggaran, periksa rekonsiliasinya, lalu terbitkan. Dasbor menampilkan pengingat bila data yang tayang sudah tertinggal. Pengingat surel bisa dipasang lewat menu **Dasbor Beranda > Pasang pengingat impor bulanan**.
- Perbarui informasi dan pop up di beranda bila ada kabar baru. Beri tanggal **Tayang sampai** supaya kabar lama hilang sendiri.

### Setiap pergantian tahun anggaran (Desember sampai Februari)

Buka dasbor admin > **Tahun baru**. Mulai 1 Desember dasbor menampilkan pengingat sampai butir otomatisnya beres. Daftar periksanya:

1. Terbitkan data realisasi TA baru (Laporan Fa Januari). Sampai data ini terbit, halaman Monitoring tetap menampilkan TA sebelumnya. Grafik tren otomatis hanya menampilkan bulan-bulan TA yang sedang tayang.
2. Periksa target dan ambang penyerapan sesuai ketentuan Ditjen Perbendaharaan TA baru, di Monev anggaran > Target.
3. Arsipkan prognosa TA lalu dengan tombol di modul Tahun baru, setelah pengajuan TUP TA lalu selesai. Tombolnya baru aktif mulai 1 Januari. Tab prognosa diberi akhiran tahun di spreadsheet; tidak ada yang dihapus.
4. Atur prognosa TA baru (batas pengisian, batas kegiatan, saldo UP), lalu buka pengisian untuk seksi.
5. Periksa sumber data Monitoring E-Perjadin. Bila TA baru memakai tab atau spreadsheet lain: terbitkan tab itu sebagai CSV, ganti `SUMBER_CSV_PERJADIN` di `konten.js`, lalu pasang `TautanBukti.gs` dan sesuaikan `ID_TAB` dengan gid tab baru.
6. Tinjau isi beranda yang menyebut tahun lalu. Modul Tahun baru mendaftar informasi, tautan, dan pop up yang masih tayang dan menyebut tahun sebelumnya, dengan tombol Sunting untuk masing-masing.
7. Periksa akun, domain, dan kunci (bagian 2).

Aksen Natal di beranda tampil dan hilang sendiri (1 Desember sampai 6 Januari), tidak perlu diurus.

### Setiap tahun

- Perpanjang domain `para.my.id` sebelum masa aktifnya habis.
- Pastikan akun pemilik deployment Apps Script masih aktif.

### Fitur yang tidak dipakai

Bagian yang tidak dipakai bisa dimatikan lewat tombol **Fitur** di bilah atas dasbor admin: Pengajuan TUP dan prognosa seksi, tren penyerapan, editor target, modul Tahun baru, dan tab di bagian Beranda. Fitur yang dimatikan hanya disembunyikan (juga dari halaman Prognosa dan Monitoring); datanya tetap ada dan bisa dinyalakan lagi.

## 4. Mengubah kode

- Halaman situs: ubah berkas di repo lalu kirim ke cabang `main`. GitHub Pages memperbaruinya dalam sekitar 10 menit. Aturan teknis repo ada di `CLAUDE.md`.
- Apps Script tidak berjalan dari repo. Setiap kali `apps-script/AdminBeranda.gs` diubah, tempel isinya ke editor Apps Script, simpan, lalu **Terapkan > Kelola deployment > ikon pensil > Versi: Versi baru**. Jangan membuat deployment baru, karena alamat `/exec` akan berubah. Naikkan `VERSI_SKRIP` di kodenya; dasbor admin memeriksa versi ini dan memberi tahu bila deployment masih kode lama.
- Periksa versi yang tayang dengan membuka alamat Apps Script ditambah `?aksi=versi`.

## 5. Bila Apps Script harus pindah akun

1. Dari akun pengelola baru, buat salinan spreadsheet penyimpan (File > Buat salinan). Kode Apps Script ikut tersalin.
2. Di salinan itu, buka menu **Dasbor Beranda > Setel kunci admin** dan setel kunci baru.
3. Buka Ekstensi > Apps Script, lalu **Terapkan > Deployment baru > Aplikasi web**, dengan *Jalankan sebagai: Saya* dan *Yang memiliki akses: Siapa saja*. Salin alamat `/exec`-nya.
4. Ganti `window.ALAMAT_SKRIP` di `konten.js` dengan alamat baru, lalu kirim ke `main`.
5. Di dasbor admin, setel ulang kunci prognosa dan daftar penyunting bila perlu. Kunci prognosa dan aturan prognosa tersimpan di Properti Skrip, jadi tidak ikut tersalin.
6. Pasang ulang pengingat impor bulanan dari menu spreadsheet bila dipakai.

## 6. Aturan yang harus tetap dijaga

- Situs publik tidak boleh menautkan spreadsheet sumber.
- NIP tidak boleh tampil di web.
- Statistik hanya menyimpan hitungan harian, tanpa data pribadi.
- Olah PDF tidak boleh mengunggah berkas pengguna ke server.
- Teks antarmuka memakai bahasa Indonesia baku sesuai EYD Edisi V.
