// Local PDF text extraction only. Never sends the file or extracted text anywhere.
const ENGINE_URL='/assets/vendor/pdfjs-6.5.438/pdf.min.mjs';
const WORKER_URL='/assets/vendor/pdfjs-6.5.438/pdf.worker.min.mjs';
export const PDF_LIMITS=Object.freeze({bytes:8*1024*1024,pages:30,characters:150000,timeoutMs:25000});
export class PdfCheckError extends Error { constructor(code){super(code);this.name='PdfCheckError';this.code=code;} }
export async function extractPdfText(file,{loadEngine=()=>import(ENGINE_URL),limits=PDF_LIMITS}={}){
 if(!file||!file.size)throw new PdfCheckError('empty');
 if(file.size>limits.bytes)throw new PdfCheckError('size');
 if(!/\.pdf$/i.test(file.name||''))throw new PdfCheckError('type');
 const data=new Uint8Array(await file.arrayBuffer());
 if(!new TextDecoder('latin1').decode(data.subarray(0,1024)).includes('%PDF-'))throw new PdfCheckError('invalid');
 let task,timer;let locked=false,stopped=false;
 try{
  const read=async()=>{
   const pdfjs=await loadEngine();if(stopped)throw new PdfCheckError('timeout');pdfjs.GlobalWorkerOptions.workerSrc=WORKER_URL;
   task=pdfjs.getDocument({data,isEvalSupported:false,disableAutoFetch:true,disableStream:true,useWorkerFetch:false,enableXfa:false,stopAtErrors:true});
   task.onPassword=()=>{locked=true;task.destroy();};
   const pdf=await task.promise;if(pdf.numPages>limits.pages)throw new PdfCheckError('pages');
   let result='';
   for(let number=1;number<=pdf.numPages;number++){
    const page=await pdf.getPage(number);const content=await page.getTextContent();
    for(const item of content.items){if(typeof item.str==='string')result+=item.str+(item.hasEOL?'\n':' ');if(result.length>limits.characters)throw new PdfCheckError('length');}
    result+='\n';page.cleanup();
   }
   if(result.replace(/\s/g,'').length<40)throw new PdfCheckError('scanned');
   return result.trim();
  };
  return await Promise.race([read(),new Promise((_,reject)=>{timer=setTimeout(()=>reject(new PdfCheckError('timeout')),limits.timeoutMs);})]);
 }catch(error){if(locked||error?.name==='PasswordException')throw new PdfCheckError('locked');throw error;}
 finally{stopped=true;clearTimeout(timer);await task?.destroy();}
}
const messages={empty:'That file is empty. Choose another PDF or paste your CV text.',size:'Choose a PDF up to 8 MB, or paste your CV text.',type:'Choose a PDF file, or paste your CV text.',invalid:'That file could not be read as a PDF. Choose another PDF or paste your CV text.',pages:'Choose a CV with 30 pages or fewer, or paste your CV text.',length:'This PDF contains too much text for the quick check. Paste the CV sections you want to check.',scanned:'No usable text was found. This may be a scanned or image-only PDF. Copy text using OCR on your device, then paste it below.',locked:'This PDF is password-protected. Use an unlocked copy on your device, or paste your CV text. Do not share the password.',timeout:'Reading took too long. Try a smaller text-based PDF, or paste your CV text.'};
export function initPdfCheck(doc=document){
 const input=doc.getElementById('cvCheckPdf');if(!input)return;input.disabled=false;
 const text=doc.getElementById('cvText'),button=doc.getElementById('checkCv'),status=doc.getElementById('cvPdfStatus'),result=doc.getElementById('cvResult');
 input.addEventListener('change',async()=>{
  const file=input.files?.[0];if(!file)return;
  input.disabled=true;button.disabled=true;text.readOnly=true;result.textContent='';status.textContent='Reading PDF on your device. The file is not uploaded.';
  try{text.value=await extractPdfText(file);status.textContent='PDF text is ready. Check the structure below, or open the text to review it.';}
  catch(error){status.textContent=messages[error?.code]||'This PDF could not be read in your browser. Try another text-based PDF, or paste your CV text.';if(text.value)status.textContent+=' Existing CV text has not been replaced.';doc.getElementById('cvPasteText').open=true;}
  finally{input.disabled=false;button.disabled=false;text.readOnly=false;input.value='';}
 });
}
if(typeof document!=='undefined')initPdfCheck();
