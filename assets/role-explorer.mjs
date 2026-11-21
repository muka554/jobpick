export const ROLES = [
  {
    "id": "it",
    "name": "IT and software",
    "guide": "/it-jobs-uae/",
    "next": "Read the actual vacancy for its programming, systems or testing requirements. An interest in technology is not evidence of the required technical skill.",
    "choices": [
      "Build or change software and digital systems",
      "A tested software feature or a documented technical change",
      "Why a software feature behaves unexpectedly",
      "Programming, testing or system design"
    ]
  },
  {
    "id": "support",
    "name": "Technical support",
    "guide": "/technical-support-jobs-uae/",
    "next": "Compare first-line support, desktop support and systems responsibilities. Check the tools, shifts and level of troubleshooting expected.",
    "choices": [
      "Help people troubleshoot devices or business software",
      "A resolved support request with useful handover notes",
      "Why a user cannot access a tool they need",
      "Troubleshooting, access processes or support documentation"
    ]
  },
  {
    "id": "service",
    "name": "Customer service",
    "guide": "/customer-service-jobs-dubai/",
    "next": "Check the service channel, language requirements, complaint responsibilities and whether sales targets are part of the job.",
    "choices": [
      "Help customers understand a process or resolve an enquiry",
      "A clear customer response and an accurate service record",
      "How to explain an unavailable service or an unresolved complaint",
      "Customer communication, service policies or complaint handling"
    ]
  },
  {
    "id": "sales",
    "name": "Sales",
    "guide": "/sales-jobs-uae/",
    "next": "Compare the customer, product, territory and target responsibilities. Ask which pay is fixed and which is conditional.",
    "choices": [
      "Understand a customer's need and discuss a suitable offer",
      "A well-qualified opportunity and a clear next step",
      "Why a potential customer is hesitant about an offer",
      "Discovery questions, product knowledge or account follow-up"
    ]
  },
  {
    "id": "finance",
    "name": "Finance and accounting",
    "guide": "/guides/finance-jobs-uae/",
    "next": "Match the vacancy's transaction, reporting or control duties to actual experience and qualification requirements. Interest in numbers alone does not establish readiness.",
    "choices": [
      "Check financial records and explain differences",
      "A reconciled record or a clear financial report",
      "Why two financial records do not agree",
      "Reconciliation, financial reporting or accounting controls"
    ]
  },
  {
    "id": "logistics",
    "name": "Logistics and operations",
    "guide": "/guides/logistics-jobs-uae/",
    "next": "Distinguish coordination from management. Check site, shift, document, stock and supplier responsibilities in the actual role.",
    "choices": [
      "Coordinate the movement of goods and operational information",
      "An accurate stock or shipment record and a clear handover",
      "How to handle a delivery or inventory exception",
      "Inventory processes, shipment coordination or operational handovers"
    ]
  },
  {
    "id": "healthcare",
    "name": "Healthcare",
    "guide": "/guides/healthcare-jobs-uae/",
    "next": "Separate clinical and non-clinical roles. Check the relevant qualification, licensing, supervision and permission-to-practise requirements independently. This result does not establish eligibility.",
    "choices": [
      "Learn about patient service and care-team communication",
      "A clear, confidential care-team or patient-service handover",
      "How a care team can communicate within role and privacy boundaries",
      "Healthcare role boundaries, patient service or team communication"
    ]
  },
  {
    "id": "hospitality",
    "name": "Hospitality",
    "guide": "/guides/hospitality-jobs-uae/",
    "next": "Choose a department before judging a vacancy. Check guest-service, operational, shift and package details with the actual employing entity.",
    "choices": [
      "Support guest experiences and day-to-day hospitality service",
      "A well-handled guest request and useful shift notes",
      "How to manage a guest request during a busy service period",
      "Guest service, department procedures or shift coordination"
    ]
  }
];
export function exploreRoles(answers){
 if(!Array.isArray(answers)||answers.length!==4||answers.some(id=>id!=='unsure'&&!ROLES.some(role=>role.id===id)))return {error:'Answer all four questions, or choose Not sure for any question.'};
 const results=ROLES.map(role=>({id:role.id,name:role.name,guide:role.guide,next:role.next,count:answers.filter(id=>id===role.id).length})).filter(role=>role.count>0).sort((a,b)=>b.count-a.count);
 return {results,unsure:answers.filter(id=>id==='unsure').length};
}
if(typeof document!=='undefined'){
 const root=document.querySelector('[data-role-explorer]');
 if(root){
  const fields=[1,2,3,4].map(n=>root.querySelector('#re-q'+n)),status=root.querySelector('#re-status'),output=root.querySelector('#re-results');
  const add=(tag,text,parent=output)=>{const el=document.createElement(tag);el.textContent=text;parent.append(el);return el;};
  const reset=()=>{fields.forEach((field,i)=>{field.value='';root.querySelector('#re-choice'+(i+1)).textContent='';});output.replaceChildren();status.textContent='Answers and results cleared from this page.';};
  fields.forEach((field,i)=>field.addEventListener('change',()=>{root.querySelector('#re-choice'+(i+1)).textContent=field.value?'Selected: '+field.selectedOptions[0].textContent:'';output.replaceChildren();status.textContent='Answer changed. Build your reading shortlist when ready.';}));
  root.querySelector('#re-clear').addEventListener('click',()=>{reset();fields[0].focus();});window.addEventListener('pagehide',reset);
  root.querySelector('#re-show').addEventListener('click',()=>{
   output.replaceChildren();const review=exploreRoles(fields.map(field=>field.value));
   if(review.error){status.textContent=review.error;const missing=fields.find(field=>!field.value);if(missing)missing.focus();return;}
   add('h2','Your reading shortlist');
   if(!review.results.length){add('p','No preference signal from these answers. That is fine. Browse the full guide list below, read a real vacancy and return when you have a task you want to explore.');}
   else{
    add('p','These guides match the tasks or topics you chose. Counts describe your selections, not ability, compatibility, qualification or chances of being hired. Equal counts are tied; their display order has no meaning.');
    review.results.forEach(role=>{const section=add('section','');add('h3',role.name,section);add('p','Chosen in '+role.count+' of 4 answers. This is a reading suggestion, not a fit score.',section);add('p',role.next,section);const link=add('a','Explore the '+role.name+' guide',section);link.href=role.guide;});
   }
   if(review.unsure)add('p',review.unsure+' answer'+(review.unsure===1?' was':'s were')+' Not sure and added no count. Unselected guides are not ruled out.');
   add('p','Next: read one suggested guide and one alternative. Compare their actual duties with your interests, evidence and constraints. Check requirements in a current vacancy before applying.');status.textContent='Shortlist ready. This exercise routes you to reading; it does not assess suitability.';output.focus();
  });
 }
                  }
