<template>
  <div class="image-gallery">
    <div class="grid">
      <div 
        v-for="(image, index) in images" 
        :key="index" 
        class="image-item"
        @click="() => showImg(index)"
      >
        <img :src="image.src" :alt="image.alt || `图片 ${index + 1}`" />
      </div>
    </div>
    
    <vue-easy-lightbox
      :visible="visibleRef"
      :imgs="images.map(img => img.src)"
      :index="indexRef"
      @hide="onHide"
    ></vue-easy-lightbox>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import VueEasyLightbox from 'vue-easy-lightbox'

const props = defineProps({
  images: {
    type: Array,
    required: true
  }
})

const visibleRef = ref(false)
const indexRef = ref(0)

const showImg = (index) => {
  indexRef.value = index
  visibleRef.value = true
}

const onHide = () => {
  visibleRef.value = false
}
</script>

<style scoped>
.image-gallery .grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
}

@media (min-width: 768px) {
  .image-gallery .grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

.image-gallery .image-item {
  aspect-ratio: 1;
  overflow: hidden;
  border-radius: 0.5rem;
  cursor: pointer;
  transition: opacity 0.2s;
}

.image-gallery .image-item:hover {
  opacity: 0.9;
}

.image-gallery img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
</style> 