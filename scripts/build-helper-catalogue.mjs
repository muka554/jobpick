import fs from 'node:fs';
import path from 'node:path';
const root=process.cwd();
const decode=text=>text.replace(/&(?:amp|lt|gt|quot|apos|#39|#\d+|#x[\da-f]+);/gi,entity=>({ '&amp;':'&','&lt;':'<','&gt;':'>','&quot;':'"','&apos;':"'",'&#39;':"'" }[entity.toLowerCase()]??String.fromCodePoint(entity[2]?.toLowerCase()==='x'?parseInt(entity.slice(3,-1),16):parseInt(entity.slice(2,-1),10))));
const strip=text=>decode(text.replace(/<[^>]*>/g,'').replace(/\s+/g,' ').trim());
const locations=[...fs.readFileSync('sitemap.xml','utf8').matchAll(/<loc>([^<]+)<\/loc>/g)].map(m=>decode(m[1]));
const catalogue=[];
for(const location of locations){
 const url=new URL(location);if(url.hostname!=='jobpick20.com')throw new Error('Unexpected sitemap host');
 if(url.pathname==='/tools/site-helper/')continue;
 const file=path.join(root,decodeURIComponent(url.pathname),'index.html');
 const html=fs.readFileSync(file,'utf8');
 const title=strip(html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1]??'');
 const tag=[...html.matchAll(/<meta\b[^>]*>/gi)].map(m=>m[0]).find(m=>/\bname=["']description["']/i.test(m));
 const description=strip(tag?.match(/\bcontent=(["'])([\s\S]*?)\1/i)?.[2]??'');
 const lang=html.match(/<html\b[^>]*\blang=["']([^"']+)/i)?.[1]??'en';
 if(!title)throw new Error('Missing title '+file);
 catalogue.push({path:url.pathname,title,description,lang});
}
catalogue.sort((a,b)=>a.path.localeCompare(b.path));
fs.writeFileSync('assets/helper-catalogue.mjs','// Generated from sitemap-linked page metadata. Refresh after publishing a page.\nexport const CATALOGUE = '+JSON.stringify(catalogue,null,2)+';\n');
console.log('Built local helper catalogue for '+catalogue.length+' published page paths.');

const escape=text=>text.replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
const helper='tools/site-helper/index.html';
if(fs.existsSync(helper)){
 const items=catalogue.map(page=>'<li><a dir="auto" lang="'+escape(page.lang)+'" href="'+escape(page.path)+'">'+escape(page.title)+'</a> <span class="field-help">('+escape(page.lang)+')</span></li>').join('');
 const html=fs.readFileSync(helper,'utf8');if(!html.includes('id="sh-catalogue"'))throw new Error('Missing static catalogue region');
 fs.writeFileSync(helper,html.replace(/<div id="sh-catalogue">[\s\S]*?<\/div>/,'<div id="sh-catalogue"><ul>'+items+'</ul></div>'));
}
