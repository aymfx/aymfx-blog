import { defineConfig } from 'vitepress';
import { ViteImageOptimizer } from 'vite-plugin-image-optimizer';

// 导入主题的配置

import { typescriptMenu, nestMenu, vue3Menu, notesMenu } from './menus/notes';
import { picMenu } from './menus/photograph';
import { lifeMenu } from './menus/life';
import { travelMenu } from './menus/travel';

// Vitepress 默认配置
// 详见文档：https://vitepress.dev/reference/site-config
export default defineConfig({
  // base,
  lang: 'zh-cn',
  title: 'aymfx的博客',
  description: 'aymfx的博客主题，基于 vitepress 实现',
  lastUpdated: true,
  head: [['link', { rel: 'icon', href: '/favicon.ico' }]],
  themeConfig: {
    // 展示 2,3 级标题在目录中
    outline: {
      level: [2, 3],
      label: '目录',
    },
    // 默认文案修改
    returnToTopLabel: '回到顶部',
    sidebarMenuLabel: '相关文章',
    lastUpdatedText: '上次更新于',
    logo: '/logo.jpg',

    nav: [
      { text: '🏡首页', link: '/' },
      { text: '🚀生活', link: '/post/life/life.md' },
      { text: '🛳旅游', link: '/post/travel/travel.md' },
      { text: '🤩摄影', link: '/post/photograph/photograph.md' },
      {
        text: '🤡技术笔记',
        items: [
          { text: '前端', link: '/post/frontend/frontend.md' },
          {
            text: 'typescript',
            link: '/post/frontend/typescript/基础.md',
          },
          { text: 'nest', link: '/post/frontend/nest/引导.md' },
        ],
      },
    ],
    sidebar: {
      '/post/frontend/typescript/': typescriptMenu,
      '/post/frontend/nest/': nestMenu,
      '/post/frontend/': notesMenu,
      '/post/life/': lifeMenu,
      '/post/photograph/': picMenu,
      '/post/travel/': travelMenu,
    },
    socialLinks: [
      {
        icon: 'github',
        link: 'https://github.com/aymfx',
      },
    ],
  },
  vite: {
    plugins: [
      ViteImageOptimizer({
        // 图片优化配置
        includePublic: true,
        test: /\.(jpe?g|png|gif|svg)$/i,
        logStats: true,
        png: {
          quality: 70,
        },
        jpeg: {
          quality: 70,
        },
        jpg: {
          quality: 70,
        },
        webp: {
          lossless: true,
        },
        avif: {
          lossless: true,
        },
        svg: {
          multipass: true,
        },
      }),
    ],
  },
});
