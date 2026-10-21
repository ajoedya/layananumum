# Dashboard Realisasi Anggaran

Dashboard pemantauan penyerapan anggaran KPKNL Balikpapan untuk Tahun Anggaran 2026. Halaman ini menampilkan pagu, realisasi, dan sisa anggaran satker, lalu membandingkan capaiannya dengan target penyerapan triwulanan.

**Buka dashboard di [ajoedya.github.io/layananumum/jagakas](https://ajoedya.github.io/layananumum/jagakas/)**

Dashboard bisa dibuka di peramban komputer maupun ponsel, tanpa perlu memasang aplikasi atau masuk dengan akun.

## Isi dashboard

| Tab | Isi |
|---|---|
| **Ringkasan** | Persentase penyerapan satker terhadap target tertimbang, kartu angka (pagu, realisasi, realisasi bulan berjalan, sisa, blokir, dan target), serta rekap per kelompok belanja, unit pengampu, jenis belanja, dan rincian output. |
| **Monitoring per RO** | Rincian satu rincian output (RO) dalam susunan kertas kerja seperti POK, yaitu subkomponen, akun, lalu item belanja beserta subtotalnya. Pilih RO lewat daftar atau tombol panah. |
| **Quick Report** | Laporan yang bisa disusun sendiri seperti menu laporan di OMSPAN. Pilih dimensi untuk baris dan kolom, nilai yang ditampilkan, lalu saring datanya. Hasilnya bisa diekspor ke Excel atau dicetak. |

Tombol **Cetak** di kanan atas mencetak Ringkasan dalam satu halaman A4, dan bisa juga mencetak RO tertentu saja.

## Cara membaca status

Status setiap baris dibandingkan dengan target penyerapan triwulan berjalan.

- **Di atas target** berarti realisasi sudah sama dengan atau melampaui target.
- **Mendekati target** berarti realisasi masih di bawah target, tetapi selisihnya masih dalam batas toleransi. Status ini hanya muncul bila ada toleransi, yaitu pada belanja pegawai.
- **Perlu percepatan** berarti realisasi di bawah target dan selisihnya melewati toleransi.
- **Tidak dianggarkan** berarti pagunya nol.

Target mengikuti **PER-5/PB/2024** dan bersifat datar per triwulan, artinya target baru naik ketika memasuki triwulan berikutnya dan tidak dihitung naik sedikit demi sedikit setiap bulan.

| Kelompok belanja | TW I | TW II | TW III | TW IV |
|---|---|---|---|---|
| 51 Belanja Pegawai | 20% | 50% | 75% | 95% |
| 52 Belanja Barang | 15% | 50% | 70% | 90% |
| 53 Belanja Modal | 10% | 40% | 70% | 90% |

Untuk belanja pegawai, **ND-145/PB.2/2026** memberi toleransi 10 persen poin pada triwulan I sampai III. Toleransi ini dipakai sebagai batas status Mendekati target, bukan pengurang angka target. Target tertimbang hanya ditampilkan di tingkat satker, yaitu rata-rata target tiap kelompok belanja yang ditimbang dengan pagunya. Status per unit, per RO, dan per jenis belanja dibandingkan dengan target tertimbang satker ini.

## Sumber data dan privasi

Angka di dashboard diolah dari **Laporan Ketersediaan Dana Detail (Fa) 16 Segmen**, hasil ekspor OMSPAN atau SAKTI. Tanggal pembaruan dan periode realisasi tercantum di bagian atas dashboard.

Seluruh pengolahan berjalan di peramban. Tidak ada server, basis data, maupun formulir yang mengirim data ke mana pun.

---

## Catatan pemeliharaan

Bagian ini untuk bendahara pengeluaran yang memperbarui dashboard setiap bulan.

### Dua berkas

| Berkas | Peran |
|---|---|
| `dashboard-realisasi-kpknl-balikpapan.html` | **File induk**, disimpan bendahara dan tidak diunggah ke repo ini. Berisi layar impor dan tab Parameter untuk mengatur pemetaan dan target. |
| `index.html` | **Salinan pengguna** yang ada di repo ini. Dibuat dari file induk dan sudah memuat data bulan berjalan, sehingga pegawai cukup membukanya. |

File induk adalah sumbernya, sedangkan `index.html` hanya hasilnya. Perubahan tampilan atau fitur selalu dikerjakan di file induk, karena `index.html` akan tertimpa pada pembaruan berikutnya.

### Memperbarui data bulanan

1. Ekspor Laporan Ketersediaan Dana Detail (Fa) 16 Segmen dari OMSPAN atau SAKTI dalam format Excel.
2. Buka file induk di peramban, lalu seret berkas ekspor ke layar muat atau klik **Pilih file**.
3. Periksa kotak **Rekonsiliasi**. Total pagu dan realisasi harus sama persis dengan baris JUMLAH SELURUHNYA pada laporan Fa.
4. Kalau ada RO baru akibat revisi DIPA, lengkapi unit pengampunya di tab **Parameter**. Baris yang belum punya unit ditandai kuning.
5. Klik **Simpan untuk pengguna**. Peramban mengunduh berkas `index.html`.
6. Unggah `index.html` tersebut ke repo ini untuk menggantikan yang lama. Situs berubah sekitar satu sampai dua menit kemudian.

### Pengaturan di tab Parameter

Tab Parameter hanya ada di file induk. Di sana tersimpan pemetaan 22 rincian output ke tujuh unit pengampu (Subbagian Umum, Seksi PKN, Seksi Piutang Negara, Seksi HI, Seksi KI, Kelompok Jafung Pelelang, dan Kelompok Jafung Penilai), pemetaan akun ke delapan jenis belanja, serta persentase target per triwulan.

### Teknis

- Satu berkas HTML mandiri, termasuk gambar, ikon, dan foto kop.
- Pustaka [SheetJS](https://sheetjs.com/) dimuat dari cdnjs untuk membaca ekspor Excel di file induk dan untuk tombol Ekspor ke Excel di Quick Report. Tanpa internet, ekspor Quick Report beralih ke CSV.
- Diterbitkan lewat GitHub Pages dari cabang `main`.
