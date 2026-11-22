// Extract inert text only. Parsed nodes are never inserted into the live document.
export function jobDescriptionText(raw) {
  const parsed = new DOMParser().parseFromString(String(raw || ''), 'text/html');
  const ignored = new Set(['SCRIPT', 'STYLE', 'TEMPLATE', 'IFRAME', 'OBJECT', 'EMBED', 'NOSCRIPT']);
  const blocks = new Set(['P', 'DIV', 'LI', 'UL', 'OL', 'BR', 'HR', 'SECTION', 'H1', 'H2', 'H3', 'H4', 'TABLE', 'TR', 'TD']);
  function text(node) {
    if (node.nodeType === 3) return node.nodeValue;
    if (node.nodeType !== 1 || ignored.has(node.tagName)) return '';
    const value = [...node.childNodes].map(text).join('');
    return blocks.has(node.tagName) ? ' ' + value + ' ' : value;
  }
  return text(parsed.body).replace(/\s+/g, ' ').trim();
}

const previewUrls = new WeakMap();
export async function renderLocalCvPreview(container, file) {
  const doc = container.ownerDocument;
  const name = String(file.name || '').toLowerCase();
  const kind = file.type === 'application/pdf' || name.endsWith('.pdf') ? 'pdf' : file.type === 'text/plain' || name.endsWith('.txt') ? 'text' : 'docx';
  const heading = doc.createElement('strong');
  heading.textContent = kind === 'pdf' ? 'Local PDF preview' : kind === 'text' ? 'Local text preview' : 'DOCX selected';
  const nodes = [heading, doc.createElement('br')];
  let nextUrl;
  if (kind === 'pdf') {
    nextUrl = URL.createObjectURL(file);
    const frame = doc.createElement('iframe');
    frame.title = 'Uploaded CV PDF preview';
    frame.src = nextUrl;
    frame.style.cssText = 'width:100%;height:360px;border:1px solid #40515f;margin-top:10px;background:#fff';
    nodes.push(frame);
  } else if (kind === 'text') {
    const pre = doc.createElement('pre');
    pre.style.cssText = 'white-space:pre-wrap;font:inherit;margin:10px 0 0';
    pre.textContent = await file.text();
    nodes.push(pre);
  } else {
    nodes.push(doc.createTextNode(String(file.name) + ' · ' + Math.ceil(file.size / 1024) + ' KB'), doc.createElement('br'));
    const note = doc.createElement('span');
    note.className = 'note';
    note.textContent = 'DOCX content is extracted securely after upload and shown in the generated preview.';
    nodes.push(note);
  }
  const previousUrl = previewUrls.get(container);
  container.replaceChildren(...nodes);
  if (previousUrl) URL.revokeObjectURL(previousUrl);
  if (nextUrl) previewUrls.set(container, nextUrl); else previewUrls.delete(container);
  return kind;
}
