import { readdir, readFile, writeFile, mkdir, stat, copyFile, rm, lstat } from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';
import { parse } from 'yaml';

export const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const attachmentTypes = new Set(['.pdf', '.png', '.jpg', '.jpeg', '.webp', '.gif', '.svg', '.avif', '.mp3', '.m4a', '.wav', '.ogg', '.mp4', '.webm', '.txt', '.csv', '.canvas', '.docx', '.xlsx', '.pptx']);
const digest = value => createHash('sha256').update(value).digest('hex').slice(0, 20);

async function findVault() {
  const argument = process.argv.indexOf('--vault');
  if (argument !== -1) {
    if (!process.argv[argument + 1]) throw new Error('--vault 后需要填写笔记库路径。');
    return path.resolve(process.argv[argument + 1]);
  }
  if (process.env.OBSIDIAN_VAULT) return path.resolve(process.env.OBSIDIAN_VAULT);
  try {
    const local = JSON.parse((await readFile(path.join(projectRoot, '.notes-sync.local.json'), 'utf8')).replace(/^\uFEFF/, ''));
    if (local.vault) return path.resolve(local.vault);
  } catch (error) { if (error.code !== 'ENOENT') throw error; }
  const configPath = path.join(process.env.APPDATA || path.join(os.homedir(), 'AppData', 'Roaming'), 'obsidian', 'obsidian.json');
  const config = JSON.parse(await readFile(configPath, 'utf8'));
  const vaults = Object.values(config.vaults || {});
  const open = vaults.filter(vault => vault.open);
  if (open.length === 1) return open[0].path;
  if (vaults.length === 1) return vaults[0].path;
  throw new Error('检测到多个笔记库，请在 .notes-sync.local.json 中指定 vault，或使用 --vault 参数。');
}

export async function syncNotes({ vault, root = projectRoot } = {}) {
  const vaultRoot = path.resolve(vault || await findVault());
  if (!(await stat(vaultRoot)).isDirectory()) throw new Error('笔记库目录不存在。');
  const output = path.resolve(root, 'public', 'notes');
  if (output !== path.join(path.resolve(root), 'public', 'notes') || output.startsWith(vaultRoot + path.sep) || vaultRoot.startsWith(output + path.sep) || output === vaultRoot) throw new Error('导出目录与笔记库不能重叠。');
  const files = [];
  const walk = async directory => {
    for (const entry of await readdir(directory, { withFileTypes: true })) {
      // Hidden tool state, trash and symlinks are never part of the public library.
      if (entry.name.startsWith('.') || entry.isSymbolicLink() || entry.name === 'node_modules') continue;
      const absolute = path.join(directory, entry.name);
      if (entry.isDirectory()) await walk(absolute);
      else if (entry.isFile()) files.push(absolute);
    }
  };
  await walk(vaultRoot);
  files.sort((a, b) => a.localeCompare(b, 'zh-CN'));
  const notes = [], attachments = [], assets = new Map();
  for (const absolute of files) {
    const extension = path.extname(absolute).toLowerCase();
    if (extension !== '.md' && !attachmentTypes.has(extension)) continue;
    const relative = path.relative(vaultRoot, absolute).split(path.sep).join('/');
    const info = await stat(absolute);
    if (info.size > 95 * 1024 * 1024) throw new Error(`文件超过 GitHub 单文件限制，请先缩小再同步：${relative}`);
    const buffer = await readFile(absolute);
    const common = { path: relative, folder: path.posix.dirname(relative) === '.' ? '' : path.posix.dirname(relative), updated: info.mtime.toISOString() };
    if (extension === '.md') {
      let body = buffer.toString('utf8').replace(/^\uFEFF/, '').replace(/\r\n/g, '\n');
      let metadata = {};
      const frontmatter = body.match(/^---\n([\s\S]*?)\n---(?:\n|$)/);
      if (frontmatter) { metadata = parse(frontmatter[1]) || {}; body = body.slice(frontmatter[0].length); }
      const heading = body.match(/^#\s+(.+)$/m)?.[1];
      const title = String(metadata.title || heading || path.basename(absolute, path.extname(absolute))).replace(/[*`]/g, '').trim();
      const aliases = [metadata.aliases, metadata.alias].flat().filter(value => typeof value === 'string');
      const tags = [metadata.tags].flat().filter(value => typeof value === 'string');
      // Obsidian comments are not visible note content.
      body = body.replace(/%%[\s\S]*?%%/g, '');
      const searchText = body.replace(/```[\s\S]*?```/g, ' ').replace(/[#>*_`\[\]$|]/g, ' ').replace(/\s+/g, ' ').trim();
      const id = digest(relative);
      const payload = JSON.stringify({ body });
      const file = `pages/${id}-${digest(payload)}.json`;
      assets.set(file, payload);
      notes.push({ ...common, id, title, aliases, tags, file, searchText, excerpt: searchText.slice(0, 140), minutes: Math.max(1, Math.ceil([...body].length / 650)) });
    } else {
      const file = `files/${digest(buffer)}${extension}`;
      assets.set(file, { absolute });
      attachments.push({ ...common, title: path.basename(absolute), file, extension: extension.slice(1), bytes: info.size });
    }
  }
  if (!notes.length && !attachments.length) throw new Error('没有找到可发布的笔记或附件，本次保留已有导出。');
  const all = [...notes, ...attachments];
  const index = { version: 1, title: '学习笔记', updated: all.map(item => item.updated).sort().at(-1), notes, attachments };
  // Finish reading and validating the source before modifying the dedicated output directory.
  await mkdir(output, { recursive: true });
  if ((await lstat(output)).isSymbolicLink()) throw new Error('导出目录不能是符号链接。');
  for (const [name, value] of assets) {
    const destination = path.join(output, name);
    await mkdir(path.dirname(destination), { recursive: true });
    if (typeof value === 'string') await writeFile(destination, value, 'utf8');
    else await copyFile(value.absolute, destination);
  }
  await writeFile(path.join(output, 'index.json'), JSON.stringify(index), 'utf8');
  const prune = async directory => {
    for (const entry of await readdir(directory, { withFileTypes: true })) {
      const absolute = path.join(directory, entry.name);
      const relative = path.relative(output, absolute).split(path.sep).join('/');
      if (entry.isSymbolicLink()) throw new Error('导出目录中发现符号链接，已停止清理。');
      if (entry.isDirectory()) await prune(absolute);
      else if (relative !== 'index.json' && !assets.has(relative)) await rm(absolute);
    }
  };
  await prune(output);
  console.log(`已同步 ${notes.length} 篇笔记、${attachments.length} 个附件。原始笔记保持不变。`);
  return index;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  syncNotes().catch(error => { console.error(error.message); process.exitCode = 1; });
}
