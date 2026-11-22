import { parse } from 'parse5';
import { decodeXML } from 'entities';

export function elements(node, tagName) {
  const found = [];
  function visit(current) {
    if (current.tagName === tagName) found.push(current);
    for (const child of current.childNodes || []) visit(child);
  }
  visit(node);
  return found;
}

export const attribute = (node, name) => node.attrs?.find(attr => attr.name === name)?.value ?? '';
export function nodeText(node) {
  if (node.nodeName === '#text') return node.value;
  return (node.childNodes || []).map(nodeText).join('');
}

// parse5 decodes entities while parsing, exactly once. Text is never reparsed as markup.
export function pageMetadata(html) {
  const document = parse(html);
  const description = elements(document, 'meta').find(node => attribute(node, 'name').toLowerCase() === 'description');
  return {
    title: nodeText(elements(document, 'title')[0] || {}).replace(/\s+/g, ' ').trim(),
    description: attribute(description || {}, 'content').replace(/\s+/g, ' ').trim(),
    lang: attribute(elements(document, 'html')[0] || {}, 'lang') || 'en',
  };
}

export function moduleScripts(html) {
  return elements(parse(html), 'script').filter(node => attribute(node, 'type').toLowerCase() === 'module' && !attribute(node, 'src')).map(nodeText);
}

export function normalizedHttpUrl(value, base) {
  try {
    const url = new URL(value, base);
    return ['http:', 'https:'].includes(url.protocol) && !url.username && !url.password ? url : null;
  } catch { return null; }
}

export function isSiteUrl(value) {
  return normalizedHttpUrl(value)?.origin === 'https://jobpick20.com';
}

export function hasExactLink(html, expected) {
  const wanted = normalizedHttpUrl(expected);
  if (!wanted) return false;
  return elements(parse(html), 'a').some(node => normalizedHttpUrl(attribute(node, 'href'), 'https://jobpick20.com/')?.href === wanted.href);
}

export function sitemapContainsUrl(xml, expected) {
  const wanted = normalizedHttpUrl(expected);
  if (!wanted) return false;
  // Sitemap loc values are XML text, not HTML. Decode the captured text once.
  const locations = [...xml.matchAll(/<loc\b[^>]*>([^<]*)<\/loc>/gi)];
  return locations.some(match => normalizedHttpUrl(decodeXML(match[1].trim()))?.href === wanted.href);
}
