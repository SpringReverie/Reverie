import GithubSlugger from 'github-slugger';

function normalize(value) {
  const parts = [];
  for (const part of value.replace(/\\/g, '/').split('/')) {
    if (part === '..') parts.pop();
    else if (part && part !== '.') parts.push(part);
  }
  return parts.join('/');
}

export function resolveReference(raw, current, catalog) {
  if (!raw || /^(?:[a-z][a-z\d+.-]*:|\/\/)/i.test(raw)) return null;
  let decoded;
  try { decoded = decodeURIComponent(raw); } catch { decoded = raw; }
  const hashIndex = decoded.indexOf('#');
  const target = (hashIndex < 0 ? decoded : decoded.slice(0, hashIndex)).split('|')[0];
  const hash = hashIndex < 0 ? '' : decoded.slice(hashIndex + 1);
  if (!target) return { kind: 'heading', hash: new GithubSlugger().slug(hash) };
  const entries = [...catalog.notes.map(note => ({ ...note, kind: 'note' })), ...catalog.attachments.map(item => ({ ...item, kind: 'attachment' }))];
  const relative = normalize(`${current?.folder || ''}/${target}`);
  const rooted = normalize(target);
  const matchPath = (entry, key) => entry.path === key || (entry.kind === 'note' && entry.path.replace(/\.md$/i, '') === key);
  let found = entries.find(entry => matchPath(entry, relative)) || entries.find(entry => matchPath(entry, rooted));
  if (!found) {
    const candidates = entries.filter(entry => matchPath(entry, `${entry.folder ? entry.folder + '/' : ''}${target}`) || entry.aliases?.includes(target) || entry.path.replace(/\.md$/i, '').endsWith('/' + rooted));
    if (candidates.length === 1) found = candidates[0];
  }
  return found ? { ...found, hash: found.kind === 'note' ? new GithubSlugger().slug(hash) : hash } : { kind: 'missing', path: target };
}

export function prepareBody(body) {
  const lines = body.replace(/^\s*#\s+[^\n]+\n/, '').split('\n');
  let fence = null;
  return lines.map(line => {
    const marker = line.match(/^\s{0,3}(`{3,}|~{3,})/);
    if (marker) {
      if (!fence) fence = marker[1][0];
      else if (fence === marker[1][0]) fence = null;
    }
    if (!fence && /^\s*\$\$.+\$\$\s*$/.test(line)) return line.replace(/^\s*\$\$(.+)\$\$\s*$/, (_, formula) => `$$\n${formula}\n$$`);
    return line;
  }).join('\n');
}

const textOf = node => node.value ?? (node.children || []).map(textOf).join('');

// Transform text nodes only: examples inside fenced or inline code remain literal.
export function remarkNotebook() {
  return tree => {
    const slugger = new GithubSlugger();
    const walk = node => {
      if (node.type === 'heading') node.data = { ...node.data, hProperties: { ...node.data?.hProperties, id: slugger.slug(textOf(node)) } };
      if (node.type === 'blockquote') {
        const text = node.children?.[0]?.children?.[0];
        const callout = text?.type === 'text' && text.value.match(/^\[!([\w-]+)\][+-]?\s*/);
        if (callout) {
          text.value = text.value.slice(callout[0].length) || callout[1].toUpperCase();
          node.data = { hProperties: { className: ['note-callout', `note-callout-${callout[1].toLowerCase()}`] } };
        }
      }
      if (!node.children || ['code', 'inlineCode', 'link', 'image'].includes(node.type)) return;
      node.children = node.children.flatMap(child => {
        if (child.type !== 'text') { walk(child); return [child]; }
        const parts = [], expression = /(!?)\[\[([^\]\n]+)\]\]|==([^=\n]+)==/g;
        let position = 0;
        for (const match of child.value.matchAll(expression)) {
          if (match.index > position) parts.push({ type: 'text', value: child.value.slice(position, match.index) });
          if (match[3]) parts.push({ type: 'notebookHighlight', data: { hName: 'mark' }, children: [{ type: 'text', value: match[3] }] });
          else {
            const [target, alias] = match[2].split('|');
            const label = alias && !/^\d+(?:x\d+)?$/.test(alias) ? alias : target.split('/').at(-1).replace(/\.md$/i, '');
            parts.push(match[1] ? { type: 'image', url: target, alt: label } : { type: 'link', url: target, children: [{ type: 'text', value: label }] });
          }
          position = match.index + match[0].length;
        }
        if (!parts.length) return [child];
        if (position < child.value.length) parts.push({ type: 'text', value: child.value.slice(position) });
        return parts;
      });
    };
    walk(tree);
  };
}
