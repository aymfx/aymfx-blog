<template>
  <div class="photo-album">
    <!-- 特色图片 -->
    <div v-if="featured" class="photo-item featured" @click="showLightbox(featured)">
      <div class="image-wrapper">
        <img :src="featured.src" :alt="featured.alt" />
        <div v-if="featured.caption" class="photo-caption">{{ featured.caption }}</div>
      </div>
    </div>

    <!-- 图片网格 -->
    <div class="photo-grid">
      <div v-for="(photo, index) in photos" 
           :key="index" 
           class="photo-item"
           @click="showLightbox(photo)">
        <div class="image-wrapper">
          <img :src="photo.src" :alt="photo.alt || '照片'" />
          <div v-if="photo.caption" class="photo-caption">{{ photo.caption }}</div>
        </div>
      </div>
    </div>

    <!-- 图片查看器 -->
    <vue-easy-lightbox
      :visible="visible"
      :imgs="allPhotos"
      :index="currentIndex"
      :rotation="rotation"
      :scale="scale"
      @hide="handleHide"
      move-disabled
    >
      <template #toolbar="{ toolbarMethods }">
        <div class="toolbar">
          <button @click="toolbarMethods.zoomIn">放大</button>
          <button @click="toolbarMethods.zoomOut">缩小</button>
          <button @click="toolbarMethods.rotateLeft">向左旋转</button>
          <button @click="toolbarMethods.rotateRight">向右旋转</button>
          <button @click="handleHide">关闭</button>
        </div>
      </template>
      <template #prev-btn="{ prev }">
        <button class="nav-btn prev" @click="prev">←</button>
      </template>
      <template #next-btn="{ next }">
        <button class="nav-btn next" @click="next">→</button>
      </template>
    </vue-easy-lightbox>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import VueEasyLightbox from 'vue-easy-lightbox'

const props = defineProps({
  // 特色图片
  featured: {
    type: Object,
    default: null
  },
  // 普通图片数组
  photos: {
    type: Array,
    required: true
  }
})

// 合并所有图片
const allPhotos = computed(() => {
  const photos = []
  if (props.featured) {
    photos.push(props.featured.src)
  }
  const srcs = (props.photos || []).map(p => p.src)
  photos.push(...srcs)
  return photos
})

const visible = ref(false)
const currentIndex = ref(0)
const rotation = ref(0)
const scale = ref(1)

const showLightbox = (photo) => {
  const index = props.featured 
    ? [props.featured, ...props.photos].findIndex(p => p.src === photo.src)
    : props.photos.findIndex(p => p.src === photo.src)
  currentIndex.value = index
  visible.value = true
}

const handleHide = () => {
  visible.value = false
  rotation.value = 0
  scale.value = 1
}
</script>

<style scoped>
.photo-album {
  max-width: 1200px;
  margin: 2rem auto;
  padding: 0 1rem;
}

.photo-item {
  position: relative;
  overflow: hidden;
  border-radius: 8px;
  box-shadow: 0 4px 8px rgba(0,0,0,0.1);
  transition: transform 0.3s ease;
}

.photo-item:hover {
  transform: translateY(-5px);
}

.photo-item img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.photo-item.featured {
  margin-bottom: 2rem;
}

.photo-item.featured img {
  height: 400px;
}

.photo-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 1.5rem;
}

.photo-caption {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 1rem;
  background: linear-gradient(transparent, rgba(0,0,0,0.7));
  color: white;
  font-size: 0.9rem;
  transform: translateY(100%);
  transition: transform 0.3s ease;
}

.photo-item:hover .photo-caption {
  transform: translateY(0);
}

@media (max-width: 768px) {
  .photo-grid {
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: 1rem;
  }
  
  .photo-item.featured img {
    height: 300px;
  }
}

.toolbar {
  position: fixed;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(0, 0, 0, 0.5);
  padding: 10px;
  border-radius: 8px;
  display: flex;
  gap: 10px;
}

.toolbar button {
  background: white;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  color: #333;
  transition: all 0.3s ease;
}

.toolbar button:hover {
  background: #f0f0f0;
}

.nav-btn {
  background: rgba(255, 255, 255, 0.3);
  border: none;
  color: white;
  padding: 20px;
  font-size: 24px;
  cursor: pointer;
  border-radius: 50%;
  transition: all 0.3s ease;
}

.nav-btn:hover {
  background: rgba(255, 255, 255, 0.5);
}

.nav-btn.prev {
  position: fixed;
  left: 20px;
  top: 50%;
  transform: translateY(-50%);
}

.nav-btn.next {
  position: fixed;
  right: 20px;
  top: 50%;
  transform: translateY(-50%);
}

/* 添加鼠标手型 */
.photo-item {
  cursor: pointer;
}
</style> 