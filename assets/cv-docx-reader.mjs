// Bounded local DOCX text reader. Reads text only, never relationships, images or macros.
export const DOCX_LIMITS=Object.freeze({bytes:8*1024*1024,entries:400,xmlBytes:2*1024*1024,totalBytes:4*1024*1024,characters:150000,timeoutMs:15000});
const W='http://schemas.openxmlformats.org/wordprocessingml/2006/main';
export class DocxReadError extends Error {constructor(code){super(code);this.code=code;this.name='DocxReadError';}}
const fail=code=>{throw new DocxReadError(code);};
const crcTable=Uint32Array.from({length:256},(_,n)=>{for(let k=0;k<8;k++)n=n&1?0xedb88320^(n>>>1):n>>>1;return n>>>0;});
function crc32(bytes){let c=0xffffffff;for(const b of bytes)c=crcTable[(c^b)&255]^(c>>>8);return(c^0xffffffff)>>>0;}
export async function readDocxParts(file,{limits=DOCX_LIMITS,decompress=bytes=>new Blob([bytes]).stream().pipeThrough(new DecompressionStream('deflate-raw'))}={}){
 if(!file?.size)fail('empty');if(file.size>limits.bytes)fail('size');if(!/\.docx$/i.test(file.name||''))fail('type');
 let stopped=false,timer,reader;const deadline=new Promise((_,reject)=>{timer=setTimeout(()=>{stopped=true;reader?.cancel().catch(()=>{});reject(new DocxReadError('timeout'));},limits.timeoutMs);});
 const read=async()=>{const bytes=new Uint8Array(await file.arrayBuffer());if(stopped)fail('timeout');const v=new DataView(bytes.buffer,bytes.byteOffset,bytes.byteLength),n=bytes.length;
  let end=-1;for(let i=n-22;i>=Math.max(0,n-65557);i--)if(v.getUint32(i,true)===0x06054b50&&i+22+v.getUint16(i+20,true)===n){end=i;break;}if(end<0)fail('invalid');
  const count=v.getUint16(end+10,true),centralSize=v.getUint32(end+12,true),centralStart=v.getUint32(end+16,true);
  if(v.getUint16(end+4,true)||v.getUint16(end+6,true)||v.getUint16(end+8,true)!==count||count===65535||count>limits.entries||centralStart+centralSize!==end)fail('unsupported');
  const names=new Set(),selected=[];let pos=centralStart,total=0;
  for(let i=0;i<count;i++){
   if(pos+46>end||v.getUint32(pos,true)!==0x02014b50)fail('invalid');const flags=v.getUint16(pos+8,true),method=v.getUint16(pos+10,true),crc=v.getUint32(pos+16,true),packed=v.getUint32(pos+20,true),size=v.getUint32(pos+24,true),nl=v.getUint16(pos+28,true),el=v.getUint16(pos+30,true),cl=v.getUint16(pos+32,true),offset=v.getUint32(pos+42,true);
   if(pos+46+nl+el+cl>end)fail('invalid');const name=new TextDecoder('utf-8',{fatal:true}).decode(bytes.subarray(pos+46,pos+46+nl));
   if(names.has(name)||name.includes('..')||name.includes('\\')||name.startsWith('/')||flags&1||packed===0xffffffff||size===0xffffffff||offset===0xffffffff)fail('unsupported');names.add(name);
   if(/vbaProject|\.bin$/i.test(name))fail('unsupported');
   if(/^word\/(?:document|header\d+|footer\d+|footnotes|endnotes)\.xml$/.test(name)){
    if(![0,8].includes(method)||size>limits.xmlBytes||(total+=size)>limits.totalBytes)fail('length');
    if(offset+30>centralStart||v.getUint32(offset,true)!==0x04034b50||v.getUint16(offset+8,true)!==method||v.getUint16(offset+6,true)&1)fail('invalid');
    const localNameLength=v.getUint16(offset+26,true),start=offset+30+localNameLength+v.getUint16(offset+28,true);
    if(new TextDecoder().decode(bytes.subarray(offset+30,offset+30+localNameLength))!==name||start+packed>centralStart)fail('invalid');
    selected.push({name,method,crc,size,data:bytes.subarray(start,start+packed)});
   }pos+=46+nl+el+cl;
  }
  if(pos!==end||!names.has('[Content_Types].xml')||!selected.some(x=>x.name==='word/document.xml'))fail('invalid');
  const parts=[];selected.sort((a,b)=>Number(b.name==='word/document.xml')-Number(a.name==='word/document.xml')||a.name.localeCompare(b.name));
  for(const part of selected){if(stopped)fail('timeout');let output=part.data;
   if(part.method===8){reader=decompress(part.data).getReader();const chunks=[];let length=0;try{while(true){const{done,value}=await reader.read();if(stopped)fail('timeout');if(done)break;length+=value.length;if(length>part.size||length>limits.xmlBytes)fail('length');chunks.push(value);}output=new Uint8Array(length);let off=0;for(const c of chunks){output.set(c,off);off+=c.length;}}finally{await reader.cancel().catch(()=>{});reader=null;}}
   if(output.length!==part.size||crc32(output)!==part.crc)fail('invalid');const xml=new TextDecoder('utf-8',{fatal:true}).decode(output);if(/<!DOCTYPE|<!ENTITY/i.test(xml))fail('unsupported');parts.push({name:part.name,xml});
  }return parts;
 };
 try{return await Promise.race([read(),deadline]);}catch(e){if(e instanceof DocxReadError)throw e;throw new DocxReadError('invalid');}finally{stopped=true;clearTimeout(timer);reader?.cancel().catch(()=>{});}
}
export function docxPartsText(parts,{Parser=globalThis.DOMParser,limit=DOCX_LIMITS.characters}={}){
 const paragraphs=[];let length=0;
 for(const part of parts){const doc=new Parser().parseFromString(part.xml,'application/xml');if(doc.getElementsByTagName('parsererror').length)fail('invalid');
  for(const p of doc.getElementsByTagNameNS(W,'p')){let text='';const walk=node=>{if(node.nodeType!==1)return;if(node!==p&&node.namespaceURI===W&&node.localName==='p')return;if(node.namespaceURI===W&&['del','moveFrom','instrText'].includes(node.localName))return;if(node.namespaceURI===W&&node.localName==='t'){text+=node.textContent;return;}if(node.namespaceURI===W&&['tab','br','cr'].includes(node.localName)){text+=node.localName==='tab'?'\t':'\n';return;}for(const child of node.children)walk(child);};walk(p);if(text.trim()){length+=text.length+1;if(length>limit)fail('length');paragraphs.push(text.trim());}}
 }const text=paragraphs.join('\n');if(text.replace(/\s/g,'').length<10)fail('empty');return text;
}
export async function extractDocxText(file,options){return docxPartsText(await readDocxParts(file,options),options);}
