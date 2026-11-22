// Minimal, uncompressed OpenXML package. No network, macros, remote relationships or dependencies.
const utf8 = new TextEncoder();
const xml = value => String(value).replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\uFFFE\uFFFF]/g, '').replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;').replaceAll("'", '&apos;');
const crcTable = Uint32Array.from({ length: 256 }, (_, n) => { for (let k = 0; k < 8; k++) n = n & 1 ? 0xedb88320 ^ (n >>> 1) : n >>> 1; return n >>> 0; });
function crc32(bytes) { let crc = 0xffffffff; for (const b of bytes) crc = crcTable[(crc ^ b) & 255] ^ (crc >>> 8); return (crc ^ 0xffffffff) >>> 0; }
function header(size, values) { const bytes = new Uint8Array(size), view = new DataView(bytes.buffer); for (const [offset, value, width] of values) view[width === 4 ? 'setUint32' : 'setUint16'](offset, value, true); return bytes; }
export function zipStore(files) {
  const local = [], central = []; let offset = 0, centralSize = 0;
  for (const [name, content] of files) {
    const n = utf8.encode(name), data = utf8.encode(content), crc = crc32(data);
    const h = header(30, [[0, 0x04034b50, 4], [4, 20, 2], [6, 0x800, 2], [12, 0x21, 2], [14, crc, 4], [18, data.length, 4], [22, data.length, 4], [26, n.length, 2]]);
    const c = header(46, [[0, 0x02014b50, 4], [4, 20, 2], [6, 20, 2], [8, 0x800, 2], [14, 0x21, 2], [16, crc, 4], [20, data.length, 4], [24, data.length, 4], [28, n.length, 2], [42, offset, 4]]);
    local.push(h, n, data); central.push(c, n); offset += h.length + n.length + data.length; centralSize += c.length + n.length;
  }
  const end = header(22, [[0, 0x06054b50, 4], [8, files.length, 2], [10, files.length, 2], [12, centralSize, 4], [16, offset, 4]]);
  return new Blob([...local, ...central, end], { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' });
}
export function docxFile(blocks, { template = 'professional', direction = 'ltr' } = {}) {
  const rtl = direction === 'rtl';
  const serif = ['editorial','executive'].includes(template);
  const accent = ({professional:'156A61',editorial:'6C4630',compact:'263444',executive:'243C60',minimal:'293038',contemporary:'673F61'})[template] || '156A61';
  const runs = blocks.map(b => {
    const heading = ['name', 'heading', 'subheading'].includes(b.type);
    const size = b.type === 'name' ? 48 : b.type === 'role' ? 26 : 22;
    const color = ['name', 'heading', 'role'].includes(b.type) ? accent : '202A35';
    const before = b.type === 'heading' ? 240 : b.type === 'subheading' ? 120 : 0;
    const after = b.type === 'name' ? 80 : 100;
    const text = (b.type === 'bullet' ? '• ' : '') + b.text;
    const textRtl = /^[^A-Za-z\u0600-\u06ff]*[\u0600-\u06ff]/u.test(b.text);
    const align = template === 'minimal' && ['name','role','contact'].includes(b.type) ? 'center' : textRtl ? (rtl ? 'start' : 'end') : (rtl ? 'right' : 'left');
    return `<w:p><w:pPr><w:bidi w:val="${textRtl ? 1 : 0}"/><w:jc w:val="${align}"/>${['heading', 'subheading', 'name', 'role', 'meta'].includes(b.type) ? '<w:keepNext/>' : ''}<w:widowControl/><w:spacing w:before="${before}" w:after="${after}" w:line="288" w:lineRule="auto"/>${b.type === 'heading' ? `<w:pBdr><w:bottom w:val="single" w:sz="4" w:color="${accent}"/></w:pBdr>` : ''}</w:pPr><w:r><w:rPr><w:rFonts w:ascii="${serif ? 'Georgia' : 'Arial'}" w:hAnsi="${serif ? 'Georgia' : 'Arial'}" w:cs="Arial"/>${heading ? '<w:b/><w:bCs/>' : ''}<w:color w:val="${color}"/><w:sz w:val="${size}"/><w:szCs w:val="${size}"/><w:rtl w:val="${textRtl ? 1 : 0}"/></w:rPr><w:t xml:space="preserve">${xml(text)}</w:t></w:r></w:p>`;
  }).join('');
  return zipStore([
    ['[Content_Types].xml', '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/></Types>'],
    ['_rels/.rels', '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/></Relationships>'],
    ['word/document.xml', `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:body>${runs}<w:sectPr><w:pgSz w:w="11906" w:h="16838"/><w:pgMar w:top="850" w:right="850" w:bottom="850" w:left="850"/></w:sectPr></w:body></w:document>`],
  ]);
}
export function safeFilename(name, suffix) { return `${String(name || 'my').replace(/[^\p{L}\p{N} _-]/gu, '').trim().slice(0, 60).replace(/\s+/g, '-') || 'my'}-${suffix}`; }
export function downloadFile(blob, name, doc = document) {
  const url = URL.createObjectURL(blob), a = doc.createElement('a');
  a.href = url; a.download = name; doc.body.append(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 30000);
}
