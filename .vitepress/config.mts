import { defineConfig } from 'vitepress';
import { typescriptMenu } from './menus/typescript';
import { vue3Menu } from './menus/vue3';
import { distMenu } from './menus/dict';

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: "aymfx's 的小屋",
  description: '心比天高，技术比纸薄，多学习一分，就多一分的收获',
  base: '/',
  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    nav: [
      { text: '首页', link: '/' },
      {
        text: '技术笔记',
        items: [
          { text: 'typescript', link: '/docs/typescript/基础.md' },
          { text: 'vue3', link: '/docs/vue3/准备工作.md' },
        ],
      },
    ],
    sidebar: {
      '/docs/typescript/': typescriptMenu,
      '/docs/vue3/': vue3Menu,
      '/docs/dict/': distMenu,
    },
    outline: 'deep',
    socialLinks: [
      { icon: 'github', link: 'https://github.com/vuejs/vitepress' },
    ],
  },
});
