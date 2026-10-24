/* Utilitas Bengkel PDF: dipakai Rapikan & OCR, PDF ke Excel, dan Pembersih Metadata.
   Pengolahan berkas berlangsung di perangkat pengguna. Tidak ada unggahan dokumen. */
(function () {
"use strict";
const $ = id => document.getElementById(id);
const te = new TextEncoder();
let ocrWorkerPromise = null;

function pesan(teks, jenis) {
  const el = $("kabar");
  if (!el) return;
  el.textContent = teks || "";
  el.className = "kabar" + (jenis ? " " + jenis : "");
  el.hidden = !teks;
}
function progress(current, total, teks) {
  const label = $("statusProses"), bar = $("kemajuan");
  if (label) label.textContent = teks || "";
  if (bar) { bar.value = current; bar.max = Math.max(total, 1); }
}
function pilihBerkas(callback) {
  Bersama.pasangJatuhan($("jatuhan"), $("berkas"), daftar => {
    const file = daftar.find(f => /\.pdf$/i.test(f.name) || f.type === "application/pdf");
    if (!file) { pesan("Pilih berkas PDF yang valid.", "galat"); return; }
    if (file.size > 75 * 1024 * 1024) { pesan("Berkas terlalu besar. Maksimal 75 MB untuk menjaga memori peramban.", "galat"); return; }
    pesan("");
    $("namaBerkas").textContent = file.name + " · " + Bersama.ukuran(file.size);
    callback(file);
  });
}
function cekTandaTangan(bytes) {
  const pat = ["/ByteRange", "/FT /Sig", "/Type /Sig"];
  const dec = new TextDecoder("latin1");
  const size = 512 * 1024;
  for (let i = 0; i < bytes.length; i += size - 32) {
    const str = dec.decode(bytes.subarray(i, Math.min(bytes.length, i + size)));
    if (pat.some(p => str.includes(p))) return true;
  }
  return false;
}
function mulaiPdfJs() {
  if (typeof pdfjsLib === "undefined") throw Error("PDF.js tidak tersedia.");
  pdfjsLib.GlobalWorkerOptions.workerSrc = new URL("pustaka/pdfjs/pdf.worker.min.js", location.href).href;
}
async function bukaPdf(bytes) {
  mulaiPdfJs();
  return pdfjsLib.getDocument({data: bytes.slice(), isEvalSupported: false}).promise;
}
async function kanvasPdf(hal, batas = 2100) {
  const v = hal.getViewport({scale: 1});
  const skala = Math.min(3, Math.max(1, Math.min(2.7, batas / Math.max(v.width, v.height))));
  const vp = hal.getViewport({scale: skala});
  const cv = document.createElement("canvas");
  cv.width = Math.max(1, Math.round(vp.width));
  cv.height = Math.max(1, Math.round(vp.height));
  const c = cv.getContext("2d", {willReadFrequently: true});
  c.fillStyle = "#fff"; c.fillRect(0, 0, cv.width, cv.height);
  await hal.render({canvasContext: c, viewport: vp}).promise;
  return {kanvas:cv, skala};
}
async function buatPekerjaOcr(onLog) {
  if (!ocrWorkerPromise) {
    ocrWorkerPromise = (async () => {
      if (!window.Tesseract) throw Error("Mesin Tesseract tidak tersedia.");
      const worker = await Tesseract.createWorker(["ind", "eng"], 1, {
        workerPath: new URL("pustaka/tesseract/worker.min.js", location.href).href,
        corePath: "https://cdn.jsdelivr.net/npm/tesseract.js-core@7.0.0",
        logger: m => { if (buatPekerjaOcr.lapor) buatPekerjaOcr.lapor(m); }
      });
      await worker.setParameters({tessedit_pageseg_mode: "3"});
      return worker;
    })();
    ocrWorkerPromise.catch(() => {ocrWorkerPromise = null;});
  }
  buatPekerjaOcr.lapor = onLog || null;
  return ocrWorkerPromise;
}
async function ocr(canvas, onLog) {
  const worker = await buatPekerjaOcr(onLog);
  // Tesseract v7 tidak menyertakan blocks secara bawaan.
  const hasil = await worker.recognize(canvas, {}, {blocks:true, text:true});
  return hasil.data;
}
function semuaKata(data) {
  const out = [];
  for (const b of data.blocks || []) for (const p of b.paragraphs || [])
    for (const l of p.lines || []) for (const w of l.words || []) {
      if (w.text && w.text.trim() && w.bbox && Number(w.confidence || 0) >= 20) {
        out.push({text:w.text.trim(), x0:w.bbox.x0, x1:w.bbox.x1, y0:w.bbox.y0, y1:w.bbox.y1});
      }
    }
  return out;
}
function namaHasil(file, sufiks, ekstensi) {
  return file.name.replace(/\.pdf$/i, "") + "-" + sufiks + "." + ekstensi;
}
function unduh(bytes, nama, mime) {
  const blob = bytes instanceof Blob ? bytes : new Blob([bytes], {type:mime || "application/pdf"});
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href=url; a.download=nama; a.textContent="Unduh " + nama;
  a.className="tombol";
  const slot=$("unduhan"); if (slot) {slot.replaceChildren(a); slot.hidden=false;}
  // Pertahankan URL selama halaman terbuka agar tombol unduh tetap berfungsi.
  if (unduh.url) URL.revokeObjectURL(unduh.url);
  unduh.url=url;
}
function xml(s) {
  return String(s === null || s === undefined ? "" : s).replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, "")
    .replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;")
    .replace(/"/g,"&quot;").replace(/'/g,"&apos;");
}
// Buat ZIP standar (metode store) agar XLSX mandiri tanpa dependensi jaringan.
const crcTab = (() => {
  const t=new Uint32Array(256);
  for(let i=0;i<256;i++){let c=i;for(let j=0;j<8;j++)c=c&1?0xedb88320^(c>>>1):c>>>1;t[i]=c>>>0;}
  return t;
})();
function crc32(data) {let c=0xffffffff;for(const b of data)c=crcTab[(c^b)&255]^(c>>>8);return (c^0xffffffff)>>>0;}
function zip(entries) {
  let chunks=[], central=[], offset=0;
  function pack(n, size, v) { const a=new Uint8Array(size);new DataView(a.buffer)["setUint"+(size*8)](0,v,true);return a; }
  for(const [name, raw] of entries) {
    const fn=te.encode(name), body=typeof raw==="string"?te.encode(raw):raw;
    const crc=crc32(body), h=new Uint8Array(30), d=new DataView(h.buffer);
    d.setUint32(0,0x04034b50,true);d.setUint16(4,20,true);d.setUint16(6,0x800,true);
    d.setUint32(14,crc,true);d.setUint32(18,body.length,true);d.setUint32(22,body.length,true);d.setUint16(26,fn.length,true);
    chunks.push(h,fn,body);
    const c=new Uint8Array(46), cd=new DataView(c.buffer);
    cd.setUint32(0,0x02014b50,true);cd.setUint16(4,20,true);cd.setUint16(6,20,true);cd.setUint16(8,0x800,true);
    cd.setUint32(16,crc,true);cd.setUint32(20,body.length,true);cd.setUint32(24,body.length,true);cd.setUint16(28,fn.length,true);
    cd.setUint32(42,offset,true);central.push(c,fn);
    offset+=h.length+fn.length+body.length;
  }
  const centralLength=central.reduce((s,a)=>s+a.length,0);
  const end=new Uint8Array(22), ed=new DataView(end.buffer);
  ed.setUint32(0,0x06054b50,true);ed.setUint16(8,entries.length,true);ed.setUint16(10,entries.length,true);
  ed.setUint32(12,centralLength,true);ed.setUint32(16,offset,true);
  return new Blob([...chunks,...central,end],{type:"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"});
}
function kolomExcel(n) {
  let s=""; n++;
  while(n){n--;s=String.fromCharCode(65+n%26)+s;n=Math.floor(n/26);}
  return s;
}
function buatXlsx(sheets) {
  const ns="http://schemas.openxmlformats.org/spreadsheetml/2006/main";
  const meta=['<?xml version="1.0" encoding="UTF-8"?>','<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">','<Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>','<Default Extension="xml" ContentType="application/xml"/>','<Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>','<Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/>'];
  const entries=[];
  const wb=['<?xml version="1.0" encoding="UTF-8"?><workbook xmlns="'+ns+'" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><sheets>'];
  const rel=['<?xml version="1.0" encoding="UTF-8"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">'];
  sheets.forEach((sheet,i)=>{
    const id=i+1, path="xl/worksheets/sheet"+id+".xml";
    meta.push('<Override PartName="/'+path+'" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>');
    wb.push('<sheet name="'+xml(sheet.nama.slice(0,31))+'" sheetId="'+id+'" r:id="rId'+id+'"/>');
    rel.push('<Relationship Id="rId'+id+'" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet'+id+'.xml"/>');
    const rows=['<?xml version="1.0" encoding="UTF-8"?><worksheet xmlns="'+ns+'"><sheetData>'];
    sheet.baris.forEach((cells,r)=>{
      rows.push('<row r="'+(r+1)+'">');
      cells.slice(0,80).forEach((v,c)=>{
        if(v===null||v===undefined||v==="") return;
        const addr=kolomExcel(c)+(r+1);
        // Inline string sengaja digunakan agar nomor dengan nol di depan tak rusak.
        rows.push('<c r="'+addr+'" t="inlineStr"><is><t xml:space="preserve">'+xml(v)+'</t></is></c>');
      });
      rows.push('</row>');
    });
    rows.push('</sheetData></worksheet>');
    entries.push([path,rows.join("")]);
  });
  meta.push('</Types>');wb.push('</sheets></workbook>');rel.push('<Relationship Id="rId1000" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/></Relationships>');
  entries.unshift(["[Content_Types].xml",meta.join("")],["_rels/.rels",'<?xml version="1.0" encoding="UTF-8"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/></Relationships>'],["xl/workbook.xml",wb.join("")],["xl/_rels/workbook.xml.rels",rel.join("")],["xl/styles.xml",'<?xml version="1.0" encoding="UTF-8"?><styleSheet xmlns="'+ns+'"><fonts count="1"><font><sz val="11"/><name val="Calibri"/></font></fonts><fills count="2"><fill><patternFill patternType="none"/></fill><fill><patternFill patternType="gray125"/></fill></fills><borders count="1"><border/></borders><cellStyleXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/></cellStyleXfs><cellXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0"/></cellXfs></styleSheet>']);
  return zip(entries);
}
window.AlatBaru={ $,pesan,progress,pilihBerkas,cekTandaTangan,bukaPdf,kanvasPdf,ocr,semuaKata,namaHasil,unduh,buatXlsx };
})();
