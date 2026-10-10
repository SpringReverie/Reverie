# 上传 GitHub 并发布网站

这个项目已经使用 React + Vite。根目录 `index.html` 是启动入口，它加载 `src/main.jsx`；页面、样式和动效分别在 `src/` 中。只上传根目录的 `index.html` 无法运行新版网站。

## 推荐：上传源码，由 GitHub Actions 自动构建发布

在 GitHub 创建一个仓库，把下列文件放在仓库根目录，保持目录结构：

```text
.github/
  workflows/
    deploy.yml
src/                  全部源码
public/               全部图片、视频、字体、游戏与旧项目页面
index.html
package.json
package-lock.json
vite.config.js
.gitignore
README.md
GITHUB上线说明.md
```

最后两个说明文件是可选的。`scripts/` 是本地生成资源的辅助工具，也可上传，网站构建不依赖它。

不用上传 `node_modules/`、`dist/`、`preview-*` 截图，以及根目录的原始照片、证书、旧游戏副本和内容补充文档；新版所需的运行资源已经位于 `public/`。上传时特别检查 `.github/workflows/deploy.yml`，不要漏掉这个点号开头的目录。

然后：

1. 将这些文件上传到仓库的 `main` 分支。
2. 打开仓库 **Settings → Pages → Build and deployment → Source**，选择 **GitHub Actions**。
3. 打开仓库 **Actions**，选择 **Deploy portfolio to GitHub Pages**，点 **Run workflow**。以后向 `main` 推送更新就会自动发布。若主分支叫 `master`，把 `deploy.yml` 中的 `branches: [main]` 改成 `[master]`。
4. 工作流成功后，在 **Settings → Pages** 或部署任务输出里查看网站地址。

普通仓库地址通常是 `https://用户名.github.io/仓库名/`；名为 `用户名.github.io` 的仓库通常部署在 `https://用户名.github.io/`。工作流会读取 Pages 的实际路径并传给 Vite；图片、视频、月球纹理、摄影证书与游戏链接都已适配该路径，不需要提前告诉我仓库名。

本地预览继续使用 `npm run dev`。没有连接远程仓库或执行线上部署，工作流需要你上传并启用后才会运行。

## 另一种方式：只上传构建好的静态网站

如果想使用 **Deploy from a branch**，先构建：

```powershell
# 普通项目仓库，替换成真实仓库名
npm.cmd run build -- --base /仓库名/

# 用户名.github.io 仓库或根路径自定义域名
npm.cmd run build -- --base /
```

构建结果在 `dist/`。把 **dist 文件夹里面的所有文件和子目录** 放到专用发布分支（例如 `gh-pages`）的根目录，再在 **Settings → Pages** 选择 **Deploy from a branch → gh-pages → /(root)**。

上面的 `npm.cmd` 适用于 Windows PowerShell，避免本机 npm 脚本吞掉参数分隔符；在 macOS、Linux 或 GitHub Actions 中使用 `npm` 即可。

这种方式上传的是 `dist/index.html` 及其全部配套资源，而不是源码根目录的 `index.html`；不要让网站入口多套一层 `dist/`。以后修改代码后需要重新构建、重新上传。

## 官方说明

- [Vite：GitHub Pages 部署](https://vite.dev/guide/static-deploy.html#github-pages)
- [GitHub：创建 Pages 网站](https://docs.github.com/en/pages/getting-started-with-github-pages/creating-a-github-pages-site)
