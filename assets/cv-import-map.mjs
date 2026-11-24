// Conservative text mapping. No generated facts, inferred dates, employers or skills.
import {blankDraft,importDraft,LIMITS} from './cv-studio-model.mjs?v=20261124-2';
export const IMPORT_TEXT_LIMIT=150000;
const headings={summary:['professional summary','personal profile','profile','summary','objective','نبذة شخصية','الملخص المهني','نبذة عني','الهدف الوظيفي'],experience:['work experience','professional experience','employment history','experience','الخبرات العملية','الخبرة العملية','الخبرات المهنية','الخبرة المهنية','الخبرات'],education:['education','education and qualifications','academic qualifications','التعليم','المؤهلات العلمية','المؤهلات الأكاديمية'],skills:['skills','technical skills','core skills','key skills','المهارات','المهارات التقنية'],languages:['languages','اللغات'],certifications:['certifications','certificates','licenses and certifications','الشهادات','الشهادات المهنية','الدورات التدريبية'],projects:['projects','personal projects','المشاريع']};
const labels={name:['name','full name','الاسم','الاسم الكامل'],title:['title','professional title','job title','المسمى الوظيفي'],email:['email','e-mail','البريد الإلكتروني','البريد الالكتروني'],phone:['phone','mobile','telephone','الهاتف','الجوال','رقم الهاتف'],city:['location','address','city','العنوان','المدينة'],link:['linkedin','portfolio','website','الموقع الإلكتروني'],availability:['availability','notice period','فترة الإشعار'],workStatus:['work status','visa status','حالة التأشيرة']};
const key=s=>s.toLocaleLowerCase().replace(/[\u064b-\u065f\u0640]/g,'').replace(/[:：\s]+$/,'').trim();
const find=(map,text)=>Object.keys(map).find(k=>map[k].some(x=>key(x)===key(text)));
function fit(value,max,label){if(value.length>max)throw new Error(`${label} is too long for an editor field. Shorten or split the extracted text, then try again. Nothing was replaced.`);return value;}
export function mapCvText(raw){
 if(typeof raw!=='string'||!raw.trim())throw new Error('Add CV text first.');if(raw.length>IMPORT_TEXT_LIMIT)throw new Error('Use up to 150,000 characters. Split a long document before importing.');
 const text=raw.replace(/\r\n?/g,'\n').replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f]/g,'');
 const d=blankDraft(),sections=Object.fromEntries(Object.keys(headings).map(k=>[k,[]])),other=[],warnings=['Check every field against the source. Section mapping is a best effort, not a verified CV.'];let section='',beforeHeading=true;
 const rows=text.split('\n').map(x=>x.replace(/[ \t\u00a0]+/g,' ').trim()).filter(Boolean);
 for(let i=0;i<rows.length;i++){
  const line=rows[i],h=find(headings,line);if(h){section=h;beforeHeading=false;continue;}
  const labelled=line.match(/^([^:：]{2,36})[:：]\s*(.+)$/u),label=labelled&&find(labels,labelled[1]);
  if(beforeHeading&&label&&!d.profile[label]){d.profile[label]=fit(labelled[2],LIMITS.short,label);continue;}
  if(beforeHeading){
   if(!d.profile.email&&/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(line)){d.profile.email=fit(line,LIMITS.short,'Email');continue;}
   if(!d.profile.phone&&/^\+?[\d٠-٩][\d٠-٩ ()+.\-]{6,25}$/u.test(line)){d.profile.phone=line;continue;}
   if(!d.profile.link&&/^(?:https?:\/\/|www\.|linkedin\.com\/)[^\s]+$/i.test(line)){d.profile.link=fit(line,LIMITS.short,'Link');continue;}
   if(i===0&&!d.profile.name&&line.length<=100&&line.split(/\s+/).length>=2&&line.split(/\s+/).length<=6&&/^[\p{L}\p{M} .'’\-]+$/u.test(line)&&!/curriculum|resume|résumé|السيرة|ذاتي/i.test(line)){d.profile.name=line;warnings.push('The first line was suggested as the name. Confirm it.');continue;}
  }
  (section?sections[section]:other).push(line);
 }
 d.profile.summary=fit(sections.summary.join('\n'),3000,'Summary');
 for(const k of ['skills','languages','certifications','projects'])d[k]=fit(sections[k].join('\n'),LIMITS.text,k);
 // Keep uncertain employment/education together rather than guessing dates or affiliations.
 const pack=(rows,kind,field)=>{d[kind]=[];let entry=blankDraft()[kind][0];for(const line of rows){const next=[entry[field],line].filter(Boolean).join('\n');if(next.length>LIMITS.text){if(!entry[field])fit(line,LIMITS.text,kind);d[kind].push(entry);entry={...blankDraft()[kind][0]};}entry[field]=[entry[field],line].filter(Boolean).join('\n');}if(entry[field])d[kind].push(entry);if(d[kind].length>LIMITS.entries)throw new Error('Too many imported sections. Split the text before importing.');};
 pack(sections.experience,'experience','bullets');pack(sections.education,'education','detail');
 // Only split explicit title | organisation pairs. Free-form text stays intact.
 function structured(rows,kind){
  const entries=[];let entry=null;const detail=kind==='experience'?'bullets':'detail';
  for(const line of rows){
   const pair=line.split(/\s+\|\s+/u);
   if(pair.length===2&&pair.every(v=>v.length>1&&v.length<=LIMITS.short)&&!/@|https?:|\d{4}/i.test(line)){
    if(entry)entries.push(entry);entry={...blankDraft()[kind][0]};
    if(kind==='experience'){entry.title=pair[0];entry.employer=pair[1];}else{entry.qualification=pair[0];entry.institution=pair[1];}continue;
   }
   if(!entry)return null;
   const dates=line.match(/^((?:(?:Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:tember)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)\s+)?(?:19|20)\d{2})\s+[–—-]\s+((?:(?:[A-Za-z]+)\s+)?(?:19|20)\d{2}|Present|Current|حتى الآن|الآن)$/iu);
   if(dates&&kind==='experience'&&!entry.start){entry.start=dates[1];entry.end=dates[2];}
   else if(dates&&kind==='education'&&!entry.dates)entry.dates=line;
   else entry[detail]=[entry[detail],line].filter(Boolean).join('\n');
  }
  if(entry)entries.push(entry);return entries.length<=LIMITS.entries?entries:null;
 }
 for(const kind of ['experience','education']){const parsed=structured(sections[kind],kind);if(parsed?.length)d[kind]=parsed;}

 if(sections.experience.length||sections.education.length)warnings.push('Work and education text was kept in editable entries. Only explicit title | organisation pairs and clear dates were separated. Check affiliations, dates and reading order.');
 d.importedDetails=fit(other.join('\n'),LIMITS.text,'Unsorted details');if(other.length)warnings.push('Unsorted details are kept in Other imported details, and included in exports until you move or remove them.');
 const arabic=(text.match(/[\u0600-\u06ff]/g)||[]).length,latin=(text.match(/[a-z]/ig)||[]).length;d.direction=arabic>latin?'rtl':'ltr';
 return{draft:importDraft(d),warnings,source:text};
}
