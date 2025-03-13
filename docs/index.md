---
layout: home
blog:
  name: 'aymfx的博客小屋'
  motto: 记录学习与成长的点滴
  inspiringTimeout: 3000
  pageSize: 6
---

<!-- 放图片 -->

<div align="center">
    <h1>你好，我是 aymfx (十二) 👋</h1>
    <p>热爱技术 · 追求卓越 · 永远学习</p>
</div>

<div class="inspiring-quotes">
  <div class="quote-container">
    <div class="quote-content">
      <p :class="{ 'fade': fade }" v-text="currentQuote"></p>
    </div>
  </div>
</div>

## 👨‍💻 关于我

- 🐱 资深铲屎官 十二其实是猫的名字
- 🚀 高级前端工程师，热衷于 Web 技术探索
- 📷 业余摄影爱好者，记录生活的美好瞬间
- 🏃 跑步爱好者，享受运动带来的快乐
- 📍 现居深圳，期待与各位同行交流

## 📫 联系我

- 📝 博客：[aymfx's blog](https://www.aymfx.cn/)
- 📧 邮箱：[1095731371@qq.com]

<h2 align="center">📸 我的生活记录</h2>

<div class="photo-wall">
  <a href="/pic/index" class="photo-item">
    <img src="/images/cat.jpg" alt="我家的猫咪" title="十二" loading="lazy" />
    <div class="photo-desc">生活随拍</div>
  </a>
  <a href="/life/index" class="photo-item">
    <img src="/images/huli.jpg" alt="生活随拍" title="生活" loading="lazy" />
    <div class="photo-desc">记录生活</div>
  </a>
  <a href="/it/index" class="photo-item">
    <img src="/images/ri.jpg" alt="编程日常" title="工作" loading="lazy" />
    <div class="photo-desc">编程日常</div>
  </a>
  <a href="/travel/index" class="photo-item">
    <img src="/images/shan.jpg" alt="旅游时光" title="旅游" loading="lazy" />
    <div class="photo-desc">旅游时光</div>
  </a>
</div>

<style>
.photo-wall {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  padding: 20px;
  margin: 20px 0;
}

.photo-item {
  position: relative;
  overflow: hidden;
  border-radius: 8px;
  box-shadow: 0 4px 8px rgba(0,0,0,0.1);
  transition: transform 0.3s ease;
}

.photo-item:hover {
  cursor:pointer;
  transform: translateY(-5px);
}

.photo-item img {
  width: 100%;
  height: 250px;
  object-fit: cover;
  display: block;
}

.photo-desc {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 10px;
  background: rgba(0,0,0,0.6);
  color: white;
  font-size: 14px;
  text-align: center;
  transform: translateY(100%);
  transition: transform 0.3s ease;
}

.photo-item:hover .photo-desc {
  transform: translateY(0);
}

@media (max-width: 768px) {
  .photo-wall {
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 15px;
    padding: 15px;
  }
  
  .photo-item img {
    height: 200px;
  }
}

.inspiring-quotes {
  margin: 40px auto;
  max-width: 800px;
  padding: 20px;
}

.quote-container {
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  border-radius: 12px;
  padding: 30px;
  text-align: center;
  box-shadow: 0 8px 16px rgba(0,0,0,0.1);
  position: relative;
  overflow: hidden;
}

.quote-content {
  position: relative;
}

.quote-content p {
  font-size: 1.2rem;
  color: #2c3e50;
  line-height: 1.6;
  margin: 0;
  font-style: italic;
  transition: opacity 0.5s ease;
}

.quote-content p.fade {
  opacity: 0;
}

.quote-content::before,
.quote-content::after {
  content: '"';
  font-size: 2rem;
  color: #7f8c8d;
  position: absolute;
}

.quote-content::before {
  left: -20px;
  top: -10px;
}

.quote-content::after {
  right: -20px;
  bottom: -10px;
}

</style>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'

const quotes = [
  '越努力越幸运',
  '一万年太久，只争朝夕',
  '我知道潮落之后一定有潮起，有什么了不起',
  '那阳光碎裂在熟悉场景，好安静、一个人能背多少的往事，真不轻。谁的笑、谁的温暖的手心，我着迷、伤痕好像都变成了曾经。'
]

const currentQuote = ref(quotes[0])
const fade = ref(false)
let timer = null

const updateQuote = () => {
  fade.value = true
  
  setTimeout(() => {
    const currentIndex = quotes.indexOf(currentQuote.value)
    const nextIndex = (currentIndex + 1) % quotes.length
    currentQuote.value = quotes[nextIndex]
    fade.value = false
  }, 500)
}

onMounted(() => {
  timer = setInterval(updateQuote, 3000)
})

onBeforeUnmount(() => {
  if (timer) {
    clearInterval(timer)
  }
})
</script>
