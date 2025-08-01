export const typescriptMenu = [
  {
    text: 'typescript学习笔记',
    items: [
      { text: 'typescript基础', link: '/post/frontend/typescript/基础.md' },
      {
        text: 'type和interface的区别',
        link: '/post/frontend/typescript/type和interface.md',
      },
      {
        text: '泛型的使用',
        link: '/post/frontend/typescript/泛型.md',
      },
      {
        text: '类型计算',
        link: '/post/frontend/typescript/类型计算的方式.md',
      },
      {
        text: '命名空间和模块',
        link: '/post/frontend/typescript/命名空间.md',
      },
      {
        text: '装包与拆包',
        link: '/post/frontend/typescript/装包拆包.md',
      },
      {
        text: '函数的协变与逆变',
        link: '/post/frontend/typescript/函数的协变与逆变.md',
      },
      {
        text: 'infer的用法与技巧',
        link: '/post/frontend/typescript/infer的用法与技巧.md',
      },
      {
        text: '模板字符串类型',
        link: '/post/frontend/typescript/模板字符串类型.md',
      },
      {
        text: '装饰器',
        link: '/post/frontend/typescript/装饰器.md',
      },
      {
        text: 'TSConfig配置文件',
        link: '/post/frontend/typescript/TSConfig配置文件.md',
      },
      {
        text: 'TS 类型体操',
        link: '/post/frontend/typescript/TS类型体操.md',
      },
    ],
  },
];

// nest
export const nestMenu = [
  {
    text: 'nest学习笔记',
    items: [
      { text: '引导', link: '/post/frontend/nest/引导.md' },
      {
        text: '基础知识',
        items: [
          { text: '模块', link: '/post/frontend/nest/概述/模块.md' },
          { text: '控制器', link: '/post/frontend/nest/概述/控制器.md' },
          { text: '提供者', link: '/post/frontend/nest/概述/提供者.md' },
          { text: '中间件', link: '/post/frontend/nest/概述/中间件.md' },
          {
            text: '异常过滤器',
            link: '/post/frontend/nest/概述/异常过滤器.md',
          },
          { text: '管道', link: '/post/frontend/nest/概述/管道.md' },
          { text: '守卫', link: '/post/frontend/nest/概述/守卫.md' },
          { text: '拦截器', link: '/post/frontend/nest/概述/拦截器.md' },
          {
            text: '自定义装饰器',
            link: '/post/frontend/nest/概述/自定义装饰器.md',
          },
        ],
      },
      {
        text: '深入核心概念',
        items: [
          {
            text: '自定义提供者',
            link: '/post/frontend/nest/基础知识/自定义提供者.md',
          },
          {
            text: '异步提供者',
            link: '/post/frontend/nest/基础知识/异步提供者.md',
          },
          {
            text: '动态模块',
            link: '/post/frontend/nest/基础知识/动态模块.md',
          },
          {
            text: '注入作用域',
            link: '/post/frontend/nest/基础知识/注入作用域.md',
          },
          {
            text: '循环依赖',
            link: '/post/frontend/nest/基础知识/循环依赖.md',
          },
          {
            text: '模块引用',
            link: '/post/frontend/nest/基础知识/模块引用.md',
          },
          {
            text: '懒加载模块',
            link: '/post/frontend/nest/基础知识/懒加载模块.md',
          },
          {
            text: '执行上下文',
            link: '/post/frontend/nest/基础知识/执行上下文.md',
          },
          {
            text: '发现服务',
            link: '/post/frontend/nest/基础知识/发现服务.md',
          },
          {
            text: '生命周期事件',
            link: '/post/frontend/nest/基础知识/生命周期事件.md',
          },
          { text: '测试', link: '/post/frontend/nest/基础知识/测试应用.md' },
        ],
      },
      {
        text: '高级主题',
        items: [
          {
            text: '配置config',
            link: '/post/frontend/nest/技术/配置config.md',
          },
          { text: '数据库', link: '/post/frontend/nest/技术/数据库.md' },
          { text: 'Mongo', link: '/post/frontend/nest/技术/Mongo.md' },
          { text: '验证', link: '/post/frontend/nest/技术/验证.md' },
          { text: '缓存', link: '/post/frontend/nest/技术/缓存.md' },
          { text: '序列化', link: '/post/frontend/nest/技术/序列化.md' },
          { text: '版本控制', link: '/post/frontend/nest/技术/版本控制.md' },
          { text: '任务调度', link: '/post/frontend/nest/技术/任务调度.md' },
          { text: '队列', link: '/post/frontend/nest/技术/队列.md' },
          {
            text: '日志记录器',
            link: '/post/frontend/nest/技术/日志记录器.md',
          },
          { text: 'Cookies', link: '/post/frontend/nest/技术/Cookies.md' },
          { text: '事件', link: '/post/frontend/nest/技术/事件.md' },
          { text: '压缩', link: '/post/frontend/nest/技术/压缩.md' },
          { text: '文件上传', link: '/post/frontend/nest/技术/文件上传.md' },
          {
            text: '流式传输文件',
            link: '/post/frontend/nest/技术/流式传输文件.md',
          },
          { text: 'HTTP模块', link: '/post/frontend/nest/技术/HTTP模块.md' },
          { text: '会话', link: '/post/frontend/nest/技术/会话.md' },
          {
            text: '模型-视图-控制器',
            link: '/post/frontend/nest/技术/模型-视图-控制器.md',
          },
          { text: '性能', link: '/post/frontend/nest/技术/性能.md' },
          {
            text: '服务器发送事件',
            link: '/post/frontend/nest/技术/服务器发送事件.md',
          },
          { text: 'Session', link: '/post/frontend/nest/技术/Session.md' },
        ],
      },
      {
        text: '安全',
        items: [
          { text: '身份验证', link: '/post/frontend/nest/安全/身份验证.md' },
          { text: '授权', link: '/post/frontend/nest/安全/授权.md' },
          {
            text: '加密和散列',
            link: '/post/frontend/nest/安全/加密和散列.md',
          },
          { text: 'Helmet', link: '/post/frontend/nest/安全/Helmet.md' },
          { text: 'CORS', link: '/post/frontend/nest/安全/CORS.md' },
          { text: 'CSRF 保护', link: '/post/frontend/nest/安全/CSRF保护.md' },
          { text: '限流', link: '/post/frontend/nest/安全/限流.md' },
        ],
      },
    ],
  },
];

export const vue3Menu = [
  { text: '引导', link: '/post/frontend/vue3/引导.md' },
  {
    text: 'vue3学习笔记',
    items: [
      {
        text: '核心概念与响应式系统理解',
        link: '/post/frontend/vue3/核心概念与响应式系统.md',
      },
    ],
  },
];

export const notesMenu = [
  { text: '引导', link: '/post/frontend/frontend.md' },
  {
    text: '专题',
    items: [
      {
        text: '浏览器事件循环',
        link: '/post/frontend/interview/事件循环.md',
      },
      {
        text: 'webpack用法',
        link: '/post/frontend/interview/webpack.md',
      },
      {
        text: '常用的设计模式',
        link: '/post/frontend/interview/常用的设计模式.md',
      },
      {
        text: '网络知识点',
        link: '/post/frontend/interview/网络知识点.md',
      },
      {
        text: '前端页面渲染方式',
        link: '/post/frontend/interview/前端页面渲染方式.md',
      },
    ],
  },
  {
    text: '开发流程',
    items: [
      { text: '时序图', link: '/post/frontend/notes/开发流程/时序图.md' },
      {
        text: 'git常用命令',
        link: '/post/frontend/notes/开发流程/git常用命令.md',
      },
    ],
  },
  {
    text: '工程化',
    items: [
      {
        text: 'docker基础',
        link: '/post/frontend/notes/工程化/docker.md',
      },
      {
        text: 'monorepo方案',
        link: '/post/frontend/notes/工程化/monorepo方案.md',
      },
    ],
  },
  {
    text: 'AI学习',
    items: [
      {
        text: 'curosr规则',
        link: '/post/frontend/notes/AI学习/cursor.md',
      },
    ],
  },
  {
    text: '前端工具',
    items: [
      {
        text: '图片优化配置（Vite）',
        link: '/post/frontend/notes/前端工具/image-optimization.md',
      },
    ],
  },
];
