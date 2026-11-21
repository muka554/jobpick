const MAX_LETTER = 12000;
const MAX_REQUIREMENTS = 6;
const wordList = text => text.match(/[\p{L}\p{N}]+(?:['’-][\p{L}\p{N}]+)*/gu) || [];
const comparable = text => text.normalize('NFKC').toLocaleLowerCase('en').replace(/\s+/gu, ' ').trim();

// Editorial text signals only. This function cannot verify facts or predict selection.
export function reviewLetter({ letter = '', role = '', employer = '', requirements = '' } = {}) {
  if (![letter, role, employer, requirements].every(value => typeof value === 'string')) {
    return { error: 'Use plain text in each field.' };
  }
  if (!letter.trim()) return { error: 'Paste your cover letter before running the review.' };
  if (letter.length > MAX_LETTER) return { error: 'Keep the letter within 12,000 characters.' };
  if (role.length > 160 || employer.length > 160 || requirements.length > 1200) {
    return { error: 'Keep role and employer within 160 characters, and requirements within 1,200 characters.' };
  }
  const words = wordList(letter).length;
  if (words < 30) return { error: 'Add at least 30 words so the checklist has enough text to review.' };
  const wanted = requirements.split(/\r?\n/u).map(line => line.trim()).filter(Boolean);
  if (wanted.length > MAX_REQUIREMENTS) return { error: 'Use at most six requirements, one per line.' };
  const text = comparable(letter);
  const signals = [];
  const add = (title, detail) => signals.push({ title, detail });
  add('Length', `${words} words. ${words < 180 ? 'This is below our 180–450-word review range. Check whether you have included a specific example and your reason for applying.' : words > 450 ? 'This is above our 180–450-word review range. Look for repetition and check the final page layout.' : 'This is within our 180–450-word review range.'} This is an editorial prompt, not an employer rule; follow the vacancy instructions.`);
  const blocks = letter.trim().split(/\r?\n\s*\r?\n/u).filter(Boolean).length;
  add('Text blocks', `${blocks} block${blocks === 1 ? '' : 's'} separated by blank lines, including any greeting or signature. Review the visual paragraph layout yourself; this count does not measure readability.`);
  for (const [title, value] of [['Target role', role.trim()], ['Employer', employer.trim()]]) {
    add(title, value ? (text.includes(comparable(value)) ? 'The text you entered appears in the letter, ignoring case and whitespace. Confirm that it names the correct role or organisation.' : 'The text you entered was not found. Check the wording and whether the letter is addressed to this application. A different valid spelling may be fine.') : 'Not checked. Add the optional field if you want a literal text comparison.');
  }
  const placeholders = /\[[^\]\n]{1,100}\]|\{\{[^}\n]{1,100}\}\}|<(?:company|employer|role|job title|your name|name)>|\b(?:your company|insert (?:name|company|role)|company name|your name)\b/iu.test(letter);
  add('Unfinished template text', placeholders ? 'Possible placeholders or generic template labels found. Review brackets, names and employer references before sending. Some bracketed text may be intentional.' : 'No supported placeholder pattern found. This is not proof that every name and detail is correct.');
  const action = /\b(?:built|created|managed|prepared|coordinated|handled|resolved|reviewed|analysed|analyzed|documented|supported|delivered|improved|tested|reconciled|designed|developed|scheduled)\b/iu.test(letter);
  add('Evidence to inspect', action ? 'Possible action/example language found. Check that at least one example explains your task, your own action and a result or useful scope. The tool cannot judge whether the example supports the role.' : 'Our small English word list did not find an example cue. Read the letter for one real example of your work. A good example may use words this tool does not recognise.');
  const generic = /\b(?:perfect (?:fit|candidate)|hard[- ]?working|results[- ]driven|team player|passionate about|excellent communication skills)\b/iu.test(letter);
  add('Generic wording', generic ? 'A stock phrase from our small list appears. Consider whether a concrete, truthful example would say more. These phrases are not automatically wrong.' : 'No phrase from our small stock-phrase list found. Other vague language may still be present.');
  const longSentences = letter.split(/[.!?]+(?:\s|$)/u).filter(sentence => wordList(sentence).length > 40).length;
  add('Long-sentence prompt', `${longSentences} possible sentence${longSentences === 1 ? '' : 's'} above 40 words. Our punctuation split can misread abbreviations, headings and line breaks. Read aloud and split only where it improves meaning.`);
  add('Truth and privacy', 'Manually verify every number, employer, date, qualification and claim. Use only your real experience. Do not include client data, passwords, identity-document numbers or confidential work records. This tool cannot verify accuracy or confidentiality.');
  return {
    words, blocks, signals,
    requirements: wanted.map(value => ({ text: value, found: text.includes(comparable(value)) })),
    manual: [
      'Does the opening name the right role and explain a specific reason for this employer?',
      'Does your example connect to a real requirement without copying confidential material?',
      'Does the closing give a sensible next step, and are names and contact details correct?',
      'Have you proofread spelling and checked the actual PDF or application layout?'
    ]
  };
}

if (typeof document !== 'undefined') {
  const root = document.querySelector('[data-cover-letter-checker]');
  if (root) {
    const fields = Object.fromEntries(['letter', 'role', 'employer', 'requirements'].map(key => [key, root.querySelector(`#cl-${key}`)]));
    const output = root.querySelector('#cl-results');
    const status = root.querySelector('#cl-status');
    const append = (tag, text, parent = output) => {
      const element = document.createElement(tag);
      element.textContent = text;
      parent.append(element);
      return element;
    };
    const reset = () => {
      Object.values(fields).forEach(field => { field.value = ''; });
      output.replaceChildren();
      status.textContent = 'Cleared from this page. Your browser or device may keep its own history.';
    };
    root.querySelector('#cl-clear').addEventListener('click', () => { reset(); fields.letter.focus(); });
    window.addEventListener('pagehide', reset);
    root.querySelector('#cl-review').addEventListener('click', () => {
      output.replaceChildren();
      const result = reviewLetter(Object.fromEntries(Object.entries(fields).map(([key, field]) => [key, field.value])));
      if (result.error) { status.textContent = result.error; return; }
      status.textContent = 'Review ready. These are text signals and manual checks, not a score, fact check or hiring prediction.';
      append('h2', 'Your review');
      for (const signal of result.signals) {
        const section = append('section', '');
        append('h3', signal.title, section);
        append('p', signal.detail, section);
      }
      if (result.requirements.length) {
        append('h3', 'Requirement text comparison');
        append('p', 'Literal phrase presence only, ignoring case and whitespace. Not a skill assessment, ATS score or evidence of experience. Do not add a requirement unless it is true of you.');
        const list = append('ul', '');
        for (const requirement of result.requirements) append('li', `${requirement.text}: ${requirement.found ? 'text found' : 'exact text not found; valid wording may differ'}.`, list);
      }
      append('h3', 'Your final human review');
      const list = append('ul', '');
      result.manual.forEach(item => append('li', item, list));
      output.focus();
    });
  }
}
