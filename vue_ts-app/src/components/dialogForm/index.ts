import { App } from 'vue';
import dialogForm from './src/index.vue';
export default {
  install(app: App) {
    app.component('L-dialog-form', dialogForm);
  }
};
