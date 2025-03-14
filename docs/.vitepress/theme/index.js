import DefaultTheme from 'vitepress/theme';
import PhotoAlbum from '../components/PhotoAlbum.vue';
import ImageGallery from '../components/ImageGallery.vue';

export default {
  ...DefaultTheme,
  enhanceApp({ app }) {
    app.component('PhotoAlbum', PhotoAlbum);
    app.component('ImageGallery', ImageGallery);
  },
};
