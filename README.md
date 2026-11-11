# Frontend Knowledge Base

基于 [VitePress](https://vitepress.dev/) 的前端知识体系文档站，涵盖基础、工程化、架构与 Agent 等主题。

## 本地开发

```bash
pnpm install
pnpm dev
```

浏览器访问 http://localhost:5173/

## 构建

```bash
# 本地预览构建产物
pnpm docs:build
pnpm docs:preview

# 与 GitHub Pages 相同 base 路径的构建
pnpm docs:build:pages
```

## 在线站点

推送至 `main` 分支后，GitHub Actions 会自动部署到 GitHub Pages：

**https://banzaza.github.io/frontend-knowledge-base/**

首次启用请在仓库 **Settings → Pages → Build and deployment** 中将 **Source** 设为 **GitHub Actions**。
