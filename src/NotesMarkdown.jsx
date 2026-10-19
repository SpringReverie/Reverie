import { useMemo } from 'react';
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import { prepareBody, remarkNotebook, resolveReference } from './notes-content';
import { sitePath } from './sitePath';

const remarkPlugins = [remarkGfm, remarkMath, remarkNotebook];
const rehypePlugins = [[rehypeKatex, { strict: false, trust: false, throwOnError: false }]];
const imageTypes = new Set(['png', 'jpg', 'jpeg', 'webp', 'gif', 'svg', 'avif']);

export default function NotesMarkdown({ body, note, catalog, onNavigate }) {
  const content = useMemo(() => prepareBody(body), [body]);
  const referenceUrl = reference => reference.kind === 'note'
    ? `${sitePath('notes.html')}?note=${reference.id}${reference.hash ? '#' + encodeURIComponent(reference.hash) : ''}`
    : sitePath(`notes/${reference.file}`) + (reference.hash ? '#' + reference.hash : '');
  return <Markdown skipHtml remarkPlugins={remarkPlugins} rehypePlugins={rehypePlugins} components={{
    a({ href, children }) {
      const reference = resolveReference(href, note, catalog);
      if (reference?.kind === 'missing') return <span className="note-missing-link" title={`暂未找到：${reference.path}`}>{children}</span>;
      if (reference?.kind === 'heading') return <a href={`#${encodeURIComponent(reference.hash)}`}>{children}</a>;
      if (reference?.kind === 'note') return <a href={referenceUrl(reference)} onClick={event => { if (!event.ctrlKey && !event.metaKey && !event.shiftKey && event.button === 0) { event.preventDefault(); onNavigate(reference.id, reference.hash); } }}>{children}</a>;
      return <a href={reference ? referenceUrl(reference) : href} target="_blank" rel="noreferrer">{children}</a>;
    },
    img({ src, alt }) {
      const reference = resolveReference(src, note, catalog);
      if (reference?.kind === 'missing') return <span className="note-missing-link">未找到附件：{alt || src}</span>;
      if (reference?.kind === 'note') return <a href={referenceUrl(reference)} onClick={event => { event.preventDefault(); onNavigate(reference.id, reference.hash); }}>阅读笔记：{reference.title}</a>;
      if (reference?.kind === 'attachment' && !imageTypes.has(reference.extension)) return <a href={referenceUrl(reference)} target="_blank" rel="noreferrer">打开附件：{alt || reference.title} ↗</a>;
      return <img src={reference ? referenceUrl(reference) : src} alt={alt || ''} loading="lazy"/>;
    },
    table({ children }) { return <div className="note-table-scroll" tabIndex={0} role="region" aria-label="表格，可横向滚动"><table>{children}</table></div>; },
  }}>{content}</Markdown>;
}
