import { defineConfig } from 'vitepress'
import { generatedSidebar } from './sidebar.mts'

// https://vitepress.dev/reference/site-config
export default defineConfig({
  lang: 'zh-CN',
  title: 'Frontend Knowledge Base',
  description: 'Frontend Knowledge Base for Banzaza.',
  srcExclude: ['**/README.md'],
  markdown: {
    // 文档里大量提及 HTML 标签，关闭原始 HTML 解析避免 Vue 编译报错
    html: false,
  },
  themeConfig: {
    nav: [
      { text: '首页', link: '/' },
      { text: '大纲', link: '/大纲' },
      { text: '开放式面试题', link: '/开放式面试题' },
    ],
    sidebar: generatedSidebar,
    search: {
      provider: 'local',
    },
    docFooter: {
      prev: '上一页',
      next: '下一页',
    },
    outline: {
      label: '页面导航',
    },
  },
})
