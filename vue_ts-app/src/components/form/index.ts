import { App } from 'vue';
import LForm from './src/index.vue';
export default {
  install(app: App) {
    app.component('L-form', LForm);
  }
};
