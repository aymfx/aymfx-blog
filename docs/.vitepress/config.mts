import { defineConfig } from 'vitepress';

// 导入主题的配置

import { typescriptMenu } from './menus/typescript';
import { picMenu } from './menus/pic';
import { lifeMenu } from './menus/life';
import { itMenu } from './menus/it';
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
      { text: '🚀生活', link: '/post/life/最喜欢的歌.md' },
      { text: '🛳旅游', link: '/post/travel/长沙游.md' },
      { text: '🤩摄影', link: '/post/pic/深圳湾公园拍鸟.md' },
      {
        text: '🤡技术笔记',
        items: [
          { text: '🤣typescript', link: '/post/typescript/基础.md' },
          { text: '😁前端', link: '/post/it/时序图.md' },
        ],
      },
    ],
    sidebar: {
      '/post/typescript/': typescriptMenu,
      '/post/life/': lifeMenu,
      '/post/pic/': picMenu,
      '/post/it/': itMenu,
      '/post/travel/': travelMenu,
    },
    socialLinks: [
      {
        icon: 'github',
        link: 'https://github.com/aymfx',
      },
    ],
  },
});
