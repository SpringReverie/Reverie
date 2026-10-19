import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, mkdir, writeFile, readFile, rm, access } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import { syncNotes, projectRoot } from './sync-notes.mjs';
import { prepareBody, remarkNotebook, resolveReference } from '../src/notes-content.js';

const render = body => renderToStaticMarkup(React.createElement(Markdown, {
  skipHtml: true, remarkPlugins: [remarkGfm, remarkMath, remarkNotebook],
  rehypePlugins: [[rehypeKatex, { strict: false, trust: false, throwOnError: false }]],
}, prepareBody(body)));

test('export includes new notes and attachments, ignores tool state, and removes stale generated files', async () => {
  const temporary = await mkdtemp(path.join(os.tmpdir(), 'reverie-notes-'));
  const vault = path.join(temporary, 'vault'), root = path.join(temporary, 'website');
  try {
    await mkdir(path.join(vault, '课程', '.workbuddy'), { recursive: true });
    await mkdir(path.join(vault, '.obsidian'), { recursive: true });
    await writeFile(path.join(vault, '课程', '第一章.md'), '---\ntitle: 章节标题\ntags: [数学]\n---\n# 第一章\n正文\n%%隐藏批注%%\n');
    await writeFile(path.join(vault, '课程', '.workbuddy', 'private.md'), '工具记录');
    await writeFile(path.join(vault, '.obsidian', 'settings.md'), '设置');
    await writeFile(path.join(vault, '课程', '资料.pdf'), '%PDF-fixture');
    const first = await syncNotes({ vault, root });
    assert.equal(first.notes.length, 1); assert.equal(first.attachments.length, 1);
    assert.equal(first.notes[0].title, '章节标题'); assert.deepEqual(first.notes[0].tags, ['数学']);
    const output = path.join(root, 'public', 'notes');
    const payload = JSON.parse(await readFile(path.join(output, first.notes[0].file), 'utf8'));
    assert.ok(!payload.body.includes('隐藏批注')); assert.ok(!JSON.stringify(first).includes('工具记录'));
    const unchanged = await syncNotes({ vault, root });
    assert.deepEqual(unchanged, first, 'unchanged notes should not cause a new commit');
    await writeFile(path.join(vault, '课程', '第一章.md'), '# 更新后的第一章\n新增内容');
    await writeFile(path.join(vault, '课程', '第二章.md'), '# 第二章\n下一篇');
    const second = await syncNotes({ vault, root });
    assert.equal(second.notes.length, 2);
    const revised = second.notes.find(note => note.path.endsWith('第一章.md'));
    assert.equal(revised.id, first.notes[0].id, 'edits retain the public note URL');
    assert.notEqual(revised.file, first.notes[0].file, 'content changes invalidate page caches');
    await assert.rejects(access(path.join(output, first.notes[0].file)), { code: 'ENOENT' });
    await rm(path.join(vault, '课程', '第二章.md'));
    const third = await syncNotes({ vault, root });
    assert.equal(third.notes.length, 1);
    assert.ok((await readFile(path.join(vault, '课程', '第一章.md'), 'utf8')).includes('新增内容'));
  } finally { await rm(temporary, { recursive: true, force: true }); }
});

test('relative paths, wiki aliases, duplicate names, attachments and encoded Chinese paths resolve', () => {
  const current = { folder: '课程/数学' };
  const catalog = { notes: [
    { id: '1', path: '课程/数学/极限.md', folder: '课程/数学', aliases: ['极限定义'] },
    { id: '2', path: '课程/物理/极限.md', folder: '课程/物理', aliases: [] },
    { id: '3', path: '课程/物理/运动.md', folder: '课程/物理', aliases: [] },
  ], attachments: [{ path: '课程/资料/指导.pdf', folder: '课程/资料', file: 'files/test.pdf' }] };
  assert.equal(resolveReference('极限', current, catalog).id, '1');
  assert.equal(resolveReference('极限定义', current, catalog).id, '1');
  assert.equal(resolveReference('../物理/运动.md#速度', current, catalog).id, '3');
  assert.equal(resolveReference('../资料/%E6%8C%87%E5%AF%BC.pdf', current, catalog).kind, 'attachment');
  assert.equal(resolveReference('极限', { folder: '其他' }, catalog).kind, 'missing', 'ambiguous links must not point to the wrong note');
  assert.equal(resolveReference('#一极限', current, catalog).kind, 'heading');
  assert.equal(resolveReference('javascript:alert(1)', current, catalog), null);
});

test('math, tables, heading anchors and Obsidian links render without executing note HTML', () => {
  const html = render('# 标题\n\n## 一、极限\n\n$$\\lim_{x\\to0}\\frac{\\sin x}{x}=1$$\n\n| 概念 | 值 |\n| --- | --- |\n| 极限 | $1$ |\n\n[[课程/第二章|下一篇]]\n\n==重点==\n\n> [!note] 提示\n> 内容\n\n`[[代码示例]]`\n\n```js\n[[原样保留]]\n```\n\n<script>alert(1)</script>');
  assert.match(html, /katex-display/); assert.match(html, /<table>/); assert.match(html, /id="一极限"/);
  assert.match(html, />下一篇<\/a>/); assert.match(html, /<mark>重点<\/mark>/); assert.match(html, /note-callout-note/);
  assert.match(html, /<code>\[\[代码示例\]\]<\/code>/); assert.match(html, /\[\[原样保留\]\]/);
  assert.ok(!html.includes('<script>')); assert.ok(!html.includes('katex-error'));
});

test('the exported calculus note renders its formulas and tables', async () => {
  const catalog = JSON.parse(await readFile(path.join(projectRoot, 'public', 'notes', 'index.json'), 'utf8'));
  assert.ok(catalog.notes.length > 0);
  for (const note of catalog.notes) {
    assert.ok(!note.path.split('/').some(segment => segment.startsWith('.')));
    const { body } = JSON.parse(await readFile(path.join(projectRoot, 'public', 'notes', note.file), 'utf8'));
    const html = render(body);
    if (note.title.includes('导数')) {
      assert.ok((html.match(/class="katex"/g) || []).length > 60);
      assert.ok((html.match(/<table>/g) || []).length > 5);
      assert.ok(!html.includes('katex-error'), 'a source formula failed to render');
    }
  }
});
