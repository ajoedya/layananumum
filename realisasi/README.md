# Monitoring Realisasi Anggaran

Dashboard pemantauan penyerapan anggaran KPKNL Balikpapan untuk Tahun Anggaran 2026. Halaman ini menampilkan pagu, realisasi, dan sisa anggaran satker, lalu membandingkan capaiannya dengan target penyerapan triwulanan.

**Buka di [ajoedya.github.io/layananumum/realisasi](https://ajoedya.github.io/layananumum/realisasi/)** (alamat lama `/jagakas/` otomatis dialihkan ke sini).

Dashboard bisa dibuka di peramban komputer maupun ponsel, tanpa perlu memasang aplikasi atau masuk dengan akun.

## Isi dashboard

| Tab | Isi |
|---|---|
| **Ringkasan** | Persentase penyerapan satker terhadap target tertimbang, kartu angka (pagu, realisasi, realisasi bulan berjalan, sisa, blokir, dan target), serta rekap per kelompok belanja, unit pengampu, jenis belanja, dan rincian output. |
| **Monitoring per RO** | Rincian satu rincian output (RO) dalam susunan kertas kerja seperti POK, yaitu subkomponen, akun, lalu item belanja beserta subtotalnya. Pilih RO lewat daftar atau tombol panah. |
| **Prognosa** | Kesesuaian prognosa kegiatan seksi terhadap realisasi, per unit pengampu dan jenis belanja: prognosa, target sampai akhir bulan data, realisasi tambahan sejak prognosa ditetapkan, persentase kesesuaian, dan jumlah kegiatan terlaksana. Prognosa diisi seksi di `prognosa/` dan ditetapkan bendahara di dasbor admin. Nama kegiatan tidak ditampilkan. |
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

Data diterbitkan lewat dasbor admin, tanpa mengunggah berkas ke GitHub.

1. Ekspor Laporan Ketersediaan Dana Detail (Fa) 16 Segmen dari OMSPAN atau SAKTI dalam format Excel.
2. Buka dasbor admin (`/admin/`), masuk dengan kunci admin, lalu pilih **Monev anggaran**.
3. Seret berkas ekspor ke kotak **Impor laporan**.
4. Periksa hasil pembacaan. Pesan Rekonsiliasi harus cocok dengan baris JUMLAH SELURUHNYA pada laporan.
5. Bila ada RO atau akun baru akibat revisi DIPA, pilih unit pengampu atau jenis belanjanya di bagian **Pemetaan**. Penerbitan tertahan sampai semuanya terpetakan.
6. Klik **Pratinjau di halaman Monitoring** untuk melihat hasilnya, lalu **Terbitkan data**. Halaman ini memakai data baru sekitar satu menit kemudian.

Data terbitan disimpan di Apps Script (tab `Realisasi` dan `RiwayatRealisasi` pada spreadsheet penyimpan beranda), jadi versi lama bisa dimuat kembali dari riwayat di dasbor admin. Berkas `index.html` ini tetap memuat data tertanam, tetapi hanya sebagai cadangan bila Apps Script tidak terjangkau.

Target penyerapan, ambang, dan preset Quick Report tidak diubah lewat dasbor admin. Bagian itu mengikuti data terbitan terakhir.

### Pengaturan di tab Parameter

Tab Parameter hanya ada di file induk. Di sana tersimpan pemetaan 22 rincian output ke tujuh unit pengampu (Subbagian Umum, Seksi PKN, Seksi Piutang Negara, Seksi HI, Seksi KI, Kelompok Jafung Pelelang, dan Kelompok Jafung Penilai), pemetaan akun ke delapan jenis belanja, serta persentase target per triwulan.

### Teknis

- Satu berkas HTML mandiri, termasuk gambar, ikon, dan foto kop.
- Pustaka [SheetJS](https://sheetjs.com/) dimuat dari cdnjs untuk membaca ekspor Excel di file induk dan untuk tombol Ekspor ke Excel di Quick Report. Tanpa internet, ekspor Quick Report beralih ke CSV.
- Diterbitkan lewat GitHub Pages dari cabang `main`.

## Tren, target, dan ekspor (dasbor admin)

- Tiap penerbitan menambah satu titik tren (`tren` di data) untuk bulan itu. Kartu "Penyerapan antarbulan" tampil di rekap lengkap setelah ada dua titik.
- Target dan ambang per kelompok belanja dan triwulan bisa diubah di menu Monev anggaran, lalu diterbitkan tanpa impor ulang.
- Tombol "Unduh ringkasan (.xlsx)" membuat ringkasan bulanan (empat lembar).
- Pengingat impor: bilah di dasbor muncul mulai tanggal 5 bila data belum memuat bulan lalu. Surel pengingat dipasang lewat menu Dasbor Beranda di spreadsheet.
