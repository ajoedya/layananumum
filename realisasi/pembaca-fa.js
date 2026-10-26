/* ============================================================
   Pembaca Laporan Ketersediaan Dana Detail (Fa) 16 Segmen
   Dipakai dasbor admin (admin/) untuk membaca ekspor OMSPAN atau SAKTI.
   Isinya salinan bagian "Pembacaan file Laporan Fa" di realisasi/index.html.
   Bila aturan pembacaan berubah, ubah di kedua tempat.
   ============================================================ */
(function () {
"use strict";
const RE_ITEM = /^(\d{6})\.\s*(.*)$/;
const RE_RO = /^[A-Z]{3}\.[A-Z0-9]{3}$/;
const RE_KEG = /^[A-Z]{2}\.\d{4}$/;
const RE_AKUN = /^\d{6}$/;
const RE_SUBKOMP = /^\d{3}\.\d[A-Z0-9]$/;
const KIRI = 16;
const BULAN = ['Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember'];

function teks(v){ return v===null||v===undefined ? '' : String(v).replace(/\s+/g,' ').trim(); }

function angka(v){
  if(v===null||v===undefined||v==='') return 0;
  if(typeof v==='number') return isFinite(v)?v:0;
  let s=String(v).trim().replace(/\s|Rp|\u00a0/gi,'');
  if(!s) return 0;
  let negatif=false;
  if(/^\(.*\)$/.test(s)){negatif=true;s=s.slice(1,-1);}
  if(s.startsWith('-')){negatif=true;s=s.slice(1);}
  if(!/\d/.test(s)) return 0;
  const titik=s.lastIndexOf('.'), koma=s.lastIndexOf(',');
  if(titik>=0&&koma>=0){
    if(koma>titik) s=s.replace(/\./g,'').replace(',','.');
    else s=s.replace(/,/g,'');
  }else if(koma>=0){
    s=(s.length-koma-1)===3&&/^\d{1,3}(,\d{3})+$/.test(s)?s.replace(/,/g,''):s.replace(',','.');
  }else if(titik>=0){
    if(/^\d{1,3}(\.\d{3})+$/.test(s)) s=s.replace(/\./g,'');
  }
  const n=parseFloat(s);
  return isNaN(n)?0:(negatif?-n:n);
}

function bilangan(v){
  if(typeof v==='number') return true;
  const s=teks(v);
  return s!==''&&/^-?[\d.,]+$/.test(s)&&!isNaN(parseFloat(s.replace(/,/g,'.')));
}

/* Judul kolom pada ekspor OMSPAN kerap berada di kolom yang berbeda dari
   kolom angkanya karena sel gabungan. Judulnya dicari lebih dulu, lalu
   kolom angka dipilih dari kolom terdekat yang paling konsisten berisi
   bilangan pada baris-baris item. */
function cariKolomNilai(grid,barisItem){
  const judul={
    pagu:['pagu revisi','pagu'],
    blokir:['lock pagu','blokir','lock'],
    lalu:['periode lalu','realisasi periode lalu'],
    ini:['periode ini','realisasi periode ini']
  };
  const posJudul={};
  for(let r=0;r<Math.min(grid.length,40);r++){
    const baris=grid[r]||[];
    for(let c=0;c<baris.length;c++){
      const s=teks(baris[c]).toLowerCase();
      if(!s) continue;
      for(const k of Object.keys(judul)){
        if(posJudul[k]!==undefined) continue;
        if(judul[k].some(j=>s===j)) posJudul[k]=c;
      }
    }
  }
  const contoh=barisItem.slice(0,Math.min(30,barisItem.length));
  const skor=c=>contoh.reduce((n,r)=>n+(bilangan((grid[r]||[])[c])?1:0),0);
  const hasil={};
  for(const k of Object.keys(judul)){
    const asal=posJudul[k];
    if(asal===undefined){hasil[k]=null;continue;}
    let terbaik=null,nilaiTerbaik=-1;
    for(let d=0;d<=3;d++){
      for(const c of [asal-d,asal+d]){
        if(c<0) continue;
        if(Object.values(hasil).includes(c)) continue;
        const s=skor(c);
        if(s>nilaiTerbaik){nilaiTerbaik=s;terbaik=c;}
      }
      if(nilaiTerbaik>=contoh.length*0.6) break;
    }
    hasil[k]=nilaiTerbaik>0?terbaik:null;
  }
  return hasil;
}

function bacaLaporanFa(grid){
  const catatan=[];
  const barisItem=[];
  for(let r=0;r<grid.length;r++){
    const baris=grid[r]||[];
    for(let c=0;c<Math.min(baris.length,KIRI);c++){
      if(RE_ITEM.test(teks(baris[c]))){barisItem.push(r);break;}
    }
  }
  if(!barisItem.length)
    throw new Error('Tidak ditemukan baris item dengan pola 000001. Uraian. Pastikan yang dipilih adalah Laporan Ketersediaan Dana Detail (Fa) 16 Segmen, bukan laporan lain.');

  const kolom=cariKolomNilai(grid,barisItem);
  for(const k of ['pagu','lalu','ini'])
    if(kolom[k]===null) throw new Error('Kolom '+k+' tidak terbaca dari file ekspor. Kemungkinan judul kolomnya berubah.');

  let bulan=null,tahun=null;
  for(let r=0;r<Math.min(grid.length,12);r++){
    for(const sel of (grid[r]||[]).slice(0,KIRI)){
      const s=teks(sel).toLowerCase();
      if(!bulan){
        const m=s.match(/periode\s+([a-z]+)\s*(\d{4})?/);
        if(m){
          const i=BULAN.map(x=>x.toLowerCase()).indexOf(m[1]);
          if(i>=0){bulan=i+1; if(m[2]) tahun=parseInt(m[2],10);}
        }
      }
      if(!tahun){const t=s.match(/ta\s*(\d{4})/); if(t) tahun=parseInt(t[1],10);}
    }
  }

  let kontrol=null;
  for(let r=0;r<grid.length;r++){
    const baris=grid[r]||[];
    if(baris.slice(0,KIRI).some(v=>teks(v).toUpperCase().startsWith('JUMLAH SELURUHNYA'))){
      const lalu=angka(baris[kolom.lalu]),ini=angka(baris[kolom.ini]);
      kontrol={pagu:angka(baris[kolom.pagu]),blokir:kolom.blokir===null?0:angka(baris[kolom.blokir]),lalu,ini,sd:lalu+ini};
      break;
    }
  }
  if(!kontrol) catatan.push('Baris JUMLAH SELURUHNYA tidak ditemukan sehingga hasil pembacaan tidak dapat dicocokkan dengan total laporan.');

  const kon={keg:'',kegNama:'',ro:'',roNama:'',subKomp:'',akun:'',akunNama:''};
  const item=[];
  for(let r=0;r<grid.length;r++){
    const baris=grid[r]||[];
    const kiri=[];
    for(let c=0;c<Math.min(baris.length,KIRI);c++){
      const s=teks(baris[c]);
      if(s) kiri.push(s);
    }
    if(!kiri.length) continue;
    const kode=kiri[0], nama=kiri.length>1?kiri[1]:'';
    const mItem=kode.match(RE_ITEM);
    if(mItem){
      const lalu=angka(baris[kolom.lalu]),ini=angka(baris[kolom.ini]);
      item.push({
        kode:mItem[1],uraian:mItem[2],
        kodeKeg:kon.keg,kegiatan:kon.kegNama,kodeRo:kon.ro,namaRo:kon.roNama,
        subKomponen:kon.subKomp,kodeAkun:kon.akun,namaAkun:kon.akunNama,
        pagu:angka(baris[kolom.pagu]),blokir:kolom.blokir===null?0:angka(baris[kolom.blokir]),
        lalu,ini,sd:lalu+ini
      });
      continue;
    }
    if(RE_KEG.test(kode)){kon.keg=kode;kon.kegNama=nama;continue;}
    if(RE_RO.test(kode)){kon.ro=kode;kon.roNama=nama;continue;}
    if(RE_SUBKOMP.test(kode)){kon.subKomp=nama;continue;}
    if(RE_AKUN.test(kode)){kon.akun=kode;kon.akunNama=nama;continue;}
  }

  const jml=f=>item.reduce((a,b)=>a+b[f],0);
  const total={pagu:jml('pagu'),blokir:jml('blokir'),lalu:jml('lalu'),ini:jml('ini'),sd:jml('sd')};
  let cocok=null,selisih=null;
  if(kontrol){
    selisih={pagu:total.pagu-kontrol.pagu,sd:total.sd-kontrol.sd};
    cocok=Math.abs(selisih.pagu)<1&&Math.abs(selisih.sd)<1;
  }
  const lihat=new Set(),duplikat=[];
  for(const x of item){ if(lihat.has(x.kode)) duplikat.push(x.kode); lihat.add(x.kode); }
  if(duplikat.length) catatan.push('Kode item berulang: '+duplikat.slice(0,8).join(', ')+(duplikat.length>8?', dan lainnya':'')+'.');
  const tanpaRo=item.filter(x=>!x.kodeRo).length;
  if(tanpaRo) catatan.push(tanpaRo+' item tidak memperoleh kode rincian output saat penelusuran hierarki.');

  return {item,total,kontrol,cocok,selisih,bulan,tahun,catatan};
}

const KONFIG_BAWAAN={
  satker:{nama:'KPKNL Balikpapan',kode:'537962'},
  target:{'51':[0.20,0.50,0.75,0.95],'52':[0.15,0.50,0.70,0.90],'53':[0.10,0.40,0.70,0.90]},
  ambang:{'51':[0.10,0.10,0.10,0],'52':[0,0,0,0],'53':[0,0,0,0]},
  namaKelompok:{'51':'Belanja Pegawai (51)','52':'Belanja Barang (52)','53':'Belanja Modal (53)'},
  unit:{
    'EBA.002':'Subbagian Umum','EBA.994':'Subbagian Umum','EBB.001':'Subbagian Umum','EBB.004':'Subbagian Umum',
    'AAH.001':'Seksi Pengelolaan Kekayaan Negara','ABA.002':'Seksi Pengelolaan Kekayaan Negara',
    'ABA.003':'Seksi Pengelolaan Kekayaan Negara','AEF.I01':'Seksi Pengelolaan Kekayaan Negara',
    'FAE.004':'Seksi Pengelolaan Kekayaan Negara','FAE.301':'Seksi Pengelolaan Kekayaan Negara',
    'FAK.001':'Seksi Pengelolaan Kekayaan Negara',
    'AAH.002':'Seksi Piutang Negara','AEF.002':'Seksi Piutang Negara',
    'BMB.001':'Seksi Hukum dan Informasi','BMB.002':'Seksi Hukum dan Informasi','EBA.969':'Seksi Hukum dan Informasi',
    'EBD.001':'Seksi Kepatuhan Internal',
    'AEF.003':'Kelompok Jafung Pelelang','BAH.001':'Kelompok Jafung Pelelang','FAE.007':'Kelompok Jafung Pelelang',
    'BAH.002':'Kelompok Jafung Penilai','FAE.005':'Kelompok Jafung Penilai'
  },
  urutanUnit:['Subbagian Umum','Seksi Pengelolaan Kekayaan Negara','Seksi Piutang Negara',
    'Seksi Hukum dan Informasi','Seksi Kepatuhan Internal','Kelompok Jafung Pelelang','Kelompok Jafung Penilai'],
  jenis:{
    '521111':'Belanja Operasional Kantor','521113':'Belanja Operasional Kantor',
    '521114':'Belanja Operasional Kantor','521119':'Belanja Operasional Kantor',
    '521115':'Honorarium','522151':'Honorarium',
    '521211':'Bahan dan Konsumsi Rapat','521219':'Belanja Non Operasional Lainnya',
    '521811':'Persediaan (ATK)','523121':'Pemeliharaan',
    '524111':'Perjalanan Dinas','524113':'Perjalanan Dinas',
    '532111':'Belanja Modal','536121':'Belanja Modal'
  },
  /* Peringatan pagu perjalanan dinas di tab Monitoring per RO, dalam pecahan (0,9 = 90%). */
  perjadin:{ambang:0.90},
  urutanJenis:['Belanja Operasional Kantor','Honorarium','Bahan dan Konsumsi Rapat',
    'Belanja Non Operasional Lainnya','Persediaan (ATK)','Pemeliharaan','Perjalanan Dinas','Belanja Modal']
};

window.PembacaFa = { bacaLaporanFa: bacaLaporanFa, KONFIG_BAWAAN: KONFIG_BAWAAN, BULAN: BULAN };
})();
