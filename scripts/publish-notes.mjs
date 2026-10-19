import { spawnSync } from 'node:child_process';
import { cp, mkdir, readdir, rm } from 'node:fs/promises';
import path from 'node:path';
import { projectRoot, syncNotes } from './sync-notes.mjs';

function run(command, args, cwd, capture = false) {
  const result = spawnSync(command, args, { cwd, encoding: 'utf8', stdio: capture ? 'pipe' : 'inherit', windowsHide: true });
  if (result.error) throw result.error;
  if (result.status !== 0) throw new Error(capture ? result.stderr.trim() : `命令执行失败：${command} ${args.join(' ')}`);
  return result.stdout?.trim() || '';
}

try {
  const probe = spawnSync('git', ['rev-parse', '--show-toplevel'], { cwd: projectRoot, encoding: 'utf8', windowsHide: true });
  const checkout = probe.status === 0 ? projectRoot : path.join(projectRoot, '.deployment', 'Reverie');
  const remote = run('git', ['remote', 'get-url', 'origin'], checkout, true);
  if (!/^https:\/\/github\.com\/SpringReverie\/Reverie(?:\.git)?\/?$/i.test(remote)) throw new Error('发布仓库与个人网站仓库不一致，已停止。');
  const status = run('git', ['status', '--porcelain'], checkout, true);
  if (status) throw new Error('发布仓库有尚未提交的修改，请先处理后重试，以免混入其他改动。');
  if (run('git', ['branch', '--show-current'], checkout, true) !== 'main') throw new Error('请在 main 分支发布笔记。');
  run('git', ['pull', '--ff-only', 'origin', 'main'], checkout);
  const index = await syncNotes();
  if (!process.env.npm_execpath) throw new Error('请通过 npm run notes:publish 或双击更新脚本运行。');
  run(process.execPath, [process.env.npm_execpath, 'run', 'build', '--', '--base', '/Reverie/'], projectRoot);
  if (checkout !== projectRoot) {
    const destination = path.resolve(checkout, 'public', 'notes');
    if (destination !== path.join(projectRoot, '.deployment', 'Reverie', 'public', 'notes')) throw new Error('发布目录超出指定仓库。');
    await mkdir(destination, { recursive: true });
    await cp(path.join(projectRoot, 'public', 'notes'), destination, { recursive: true, force: true });
    const exported = new Set(['index.json', ...index.notes.map(item => item.file), ...index.attachments.map(item => item.file)]);
    const prune = async directory => {
      for (const entry of await readdir(directory, { withFileTypes: true })) {
        const absolute = path.join(directory, entry.name);
        if (entry.isSymbolicLink()) throw new Error('发布目录中不允许符号链接。');
        if (entry.isDirectory()) await prune(absolute);
        else if (!exported.has(path.relative(destination, absolute).split(path.sep).join('/'))) await rm(absolute);
      }
    };
    await prune(destination);
  }
  run('git', ['add', '--', 'public/notes'], checkout);
  if (run('git', ['diff', '--cached', '--name-only'], checkout, true)) run('git', ['commit', '-m', 'Update published Obsidian notes'], checkout);
  else console.log('笔记内容没有变化，无需创建新版本。');
  run('git', ['push', 'origin', 'main'], checkout);
  console.log('笔记已提交，GitHub Actions 将自动更新网页。');
  console.log('https://springreverie.github.io/Reverie/notes.html');
} catch (error) {
  console.error(`更新未完成：${error.message}`);
  console.error('原始 Obsidian 笔记未被修改。');
  process.exitCode = 1;
}
