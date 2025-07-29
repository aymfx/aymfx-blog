# 图片优化配置

本博客使用了 `vite-plugin-image-optimizer` 插件来自动压缩图片，减少网站加载时间和带宽消耗。

## 优化效果

- 原始图片总大小：313MB
- 优化后图片总大小：129MB
- 压缩率：约 59%

## 当前配置

图片优化配置在 `docs/.vitepress/config.mts` 文件中：

```js
import { ViteImageOptimizer } from 'vite-plugin-image-optimizer';

// ...

export default defineConfig({
  // ...其他配置
  vite: {
    plugins: [
      ViteImageOptimizer({
        // 图片优化配置
        png: {
          quality: 80,
        },
        jpeg: {
          quality: 80,
        },
        jpg: {
          quality: 80,
        },
        webp: {
          lossless: true,
        },
        avif: {
          lossless: true,
        },
        gif: {
          optimizationLevel: 3,
        },
        svg: {
          multipass: true,
          plugins: [
            {
              name: 'preset-default',
              params: {
                overrides: {
                  removeViewBox: false,
                },
              },
            },
          ],
        },
      }),
    ],
  },
});
```

## 工作原理

在构建过程中，`vite-plugin-image-optimizer` 会自动处理以下类型的图片：

- PNG
- JPEG/JPG
- GIF
- WebP
- AVIF
- SVG

图片会根据配置进行压缩，并保存到构建输出目录中。这个过程是自动的，不需要手动干预。

## 自定义优化

如果需要调整图片优化配置，可以修改 `docs/.vitepress/config.mts` 文件中的相关参数：

- `quality`：图片质量（1-100），值越低，压缩率越高，但图片质量会降低
- `lossless`：无损压缩（仅适用于 WebP 和 AVIF）
- `optimizationLevel`：优化级别（GIF，1-3）

## 依赖

此功能依赖以下 npm 包：

```
pnpm add -D vite-plugin-image-optimizer sharp svgo
```

- `vite-plugin-image-optimizer`：Vite 插件，用于优化图片
- `sharp`：高性能图片处理库
- `svgo`：SVG 优化工具 