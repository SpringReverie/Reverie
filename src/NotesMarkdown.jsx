import { memo, useEffect, useMemo, useRef, useState } from 'react';
import { Check, Copy } from 'lucide-react';
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import { prepareBody, remarkNotebook, resolveReference } from './notes-content';
import { sitePath } from './sitePath';

const remarkPlugins = [remarkGfm, remarkMath, remarkNotebook];
const rehypePlugins = [[rehypeKatex, { strict: false, trust: false, throwOnError: false }]];
const imageTypes = new Set(['png', 'jpg', 'jpeg', 'webp', 'gif', 'svg', 'avif']);

function CodeBlock({ children }) {
  const pre = useRef(null), timer = useRef(0);
  const [copied, setCopied] = useState(false), [error, setError] = useState('');
  useEffect(() => () => clearTimeout(timer.current), []);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(pre.current.textContent);
      setCopied(true); setError(''); clearTimeout(timer.current);
      timer.current = setTimeout(() => setCopied(false), 2000);
    } catch { setError('复制未完成，可以选中代码手动复制。'); }
  };
  return <figure className="notes-code-block"><div><span>代码片段</span><button onClick={copy} aria-label={copied ? '代码已复制' : '复制代码'}>{copied ? <Check size={13}/> : <Copy size={13}/>}<span>{copied ? '已复制' : '复制'}</span></button></div><pre ref={pre}>{children}</pre>{error && <figcaption role="status">{error}</figcaption>}</figure>;
}

export default memo(function NotesMarkdown({ body, note, catalog, onNavigate }) {
  const content = useMemo(() => prepareBody(body), [body]);
  const referenceUrl = reference => reference.kind === 'note'
    ? `${sitePath('notes.html')}?note=${reference.id}${reference.hash ? '#' + encodeURIComponent(reference.hash) : ''}`
    : sitePath(`notes/${reference.file}`) + (reference.hash ? '#' + reference.hash : '');
  return <Markdown skipHtml remarkPlugins={remarkPlugins} rehypePlugins={rehypePlugins} components={{
    pre: CodeBlock,
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
});
