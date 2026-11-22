const MAX_CENTS = 10_000_000_000;
const labels = {total:'all-in fixed cash',basic:'basic pay',housing:'separate housing allowance',transport:'separate transport allowance',other:'other separate fixed allowances',costs:'monthly costs and deductions',conditional:'conditional pay estimate'};
export function readAmount(value) {
  if (typeof value !== 'string' || value.length > 20) return {error:'Use an amount with no more than two decimal places.'};
  const text = value.trim();
  if (!text) return {cents:null};
  if (!/^(?:\d+|\d{1,3}(?:,\d{3})+)(?:\.\d{1,2})?$/.test(text)) return {error:'Use a non-negative AED amount, with at most two decimal places.'};
  const [whole, fraction = ''] = text.replaceAll(',','').split('.');
  const cents = Number(whole) * 100 + Number(fraction.padEnd(2,'0'));
  if (!Number.isSafeInteger(cents) || cents > MAX_CENTS) return {error:'Use an amount from 0 to 100,000,000 AED.'};
  return {cents};
}
export function calculateOffer(input = {}) {
  if (!input || typeof input !== 'object' || !['total','parts'].includes(input.mode)) return {errors:['Choose an offer format.'],pending:[],fixedCents:null,balanceCents:null,costsCents:null,conditionalCents:null};
  const fields = input.mode === 'total' ? ['total'] : ['basic','housing','transport','other'];
  const errors = [], pending = [], values = {};
  for (const key of [...fields,'costs','conditional']) {
    const result = readAmount(input[key] ?? '');
    if (result.error) errors.push(labels[key] + ': ' + result.error);
    values[key] = result.cents ?? null;
    if (fields.includes(key) && values[key] === null && !result.error) pending.push(labels[key]);
  }
  const fixedCents = pending.length || errors.length ? null : fields.reduce((sum,key)=>sum + values[key],0);
  const costsCents = values.costs;
  return {errors,pending,fixedCents,costsCents,conditionalCents:values.conditional,balanceCents:fixedCents !== null && costsCents !== null ? fixedCents - costsCents : null};
}
export function compareOffers(a,b) {
  const offers = [calculateOffer(a),calculateOffer(b)];
  return {offers,fixedDifferenceCents:offers.every(o=>o.fixedCents !== null) ? offers[0].fixedCents - offers[1].fixedCents : null};
}

if (typeof document !== 'undefined') {
  const root = document.querySelector('#offer-worksheet');
  if (root) {
    const status = root.querySelector('#offer-status'), output = root.querySelector('#offer-results');
    const cards = [...root.querySelectorAll('[data-offer]')];
    const money = cents => new Intl.NumberFormat('en-AE',{style:'currency',currency:'AED',minimumFractionDigits:2,maximumFractionDigits:2}).format(cents/100);
    const add = (parent,tag,text) => {const element = document.createElement(tag);element.textContent = text;parent.append(element);return element;};
    const data = card => Object.fromEntries([...card.querySelectorAll('[data-value]')].map(e=>[e.dataset.value,e.value]));
    const sync = card => {
      const totalMode = card.querySelector('[data-value="mode"]').value === 'total';
      for (const group of card.querySelectorAll('[data-mode]')) {
        const active = (group.dataset.mode === 'total') === totalMode;
        group.hidden = !active;
        for (const field of group.querySelectorAll('input')) field.disabled = !active;
      }
    };
    const stale = () => {output.replaceChildren();output.hidden = true;status.textContent = 'Entries changed. Choose Compare offers to update the results.';};
    for (const card of cards) {
      sync(card);
      card.addEventListener('change',()=>{sync(card);stale();});
      card.addEventListener('input',stale);
    }
    root.querySelector('#compare-offers').addEventListener('click',()=>{
      const result = compareOffers(...cards.map(data));
      output.replaceChildren();output.hidden = false;
      add(output,'h3','Your comparison, from the amounts you entered');
      for (let index = 0; index < 2; index++) {
        const offer = result.offers[index], panel = add(output,'section','');
        add(panel,'h4','Offer ' + (index === 0 ? 'A' : 'B'));
        if (offer.errors.length) {
          add(panel,'p','Correct these entries before using a total:');
          const list = add(panel,'ul','');for (const error of offer.errors) add(list,'li',error);
          continue;
        }
        if (offer.fixedCents === null) add(panel,'p','Fixed cash not calculated. Confirm: ' + offer.pending.join(', ') + '. Enter 0 only when the written offer confirms a component is not paid separately.');
        else add(panel,'p','Entered fixed monthly cash: ' + money(offer.fixedCents) + '. This assumes the amounts are confirmed and do not overlap.');
        if (offer.conditionalCents === null) add(panel,'p','Conditional pay: not entered. It is not included in fixed cash.');
        else add(panel,'p','Conditional pay estimate: ' + money(offer.conditionalCents) + ' per month. Excluded from fixed cash and the scenario balance.');
        if (offer.balanceCents !== null) add(panel,'p','Scenario balance after your entered costs/deductions: ' + money(offer.balanceCents) + ' per month. Fixed cash minus ' + money(offer.costsCents) + '; not a take-home-pay or savings prediction.');
        else add(panel,'p','Scenario balance not calculated. It needs complete fixed cash and a monthly cost/deduction amount.');
      }
      if (result.fixedDifferenceCents !== null) {
        const d = result.fixedDifferenceCents;
        add(output,'p',d === 0 ? 'The entered fixed monthly cash is equal. That does not make the offers equivalent.' : 'Offer ' + (d > 0 ? 'A' : 'B') + ' has ' + money(Math.abs(d)) + ' more entered fixed cash per month. This is not a recommendation to choose it.');
      }
      add(output,'p','Before deciding, compare the written terms, hours, worksite, non-cash benefits and anything still unclear. No salary benchmark, tax, exchange-rate or cost-of-living estimate is applied here.');
      status.textContent = result.offers.some(o=>o.errors.length) ? 'Some entries need correction. Read the results below.' : 'Comparison updated. Missing or unconfirmed amounts are not treated as zero.';
      output.focus();
    });
    root.querySelector('#clear-offers').addEventListener('click',()=>{
      for (const card of cards) {
        for (const input of card.querySelectorAll('input,textarea')) input.value = '';
        card.querySelector('select').value = 'total';card.querySelector('details').open = false;sync(card);
      }
      output.replaceChildren();output.hidden = true;status.textContent = 'Worksheet cleared. Nothing was saved by this worksheet.';
      cards[0].querySelector('select').focus();
    });
  }
    }
