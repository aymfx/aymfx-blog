import DefaultTheme from 'vitepress/theme';
import PhotoAlbum from '../components/PhotoAlbum.vue';

export default {
  ...DefaultTheme,
  enhanceApp({ app }) {
    app.component('PhotoAlbum', PhotoAlbum);
  },
};
