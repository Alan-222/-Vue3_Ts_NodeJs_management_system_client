import { createApp, Directive } from 'vue';
import { store, key } from '@/store/index';
import router from '@/router/index';
// 导入路由拦截文件
import '@/permission';
import App from '@/App.vue';
// 导入公共css
import '@/assets/styles/common.scss';
// 引入element-plus css文件
import ElementPlus from 'element-plus';
import 'element-plus/dist/index.css';
// 导入svg图标组件
import SvgIcon from './components/SvgIcon/index.vue';
import 'virtual:svg-icons-register';
// 导入自定义指令
import * as directive from '@/directive';
// 导入自定义组件
import form from '@/components/form/index';
import dialogForm from '@/components/dialogForm';

const app = createApp(App);
app.component('svg-icon', SvgIcon);
// 在vue实例上定义自定义指令
Object.keys(directive).forEach((key) => {
  app.directive(key, (directive as { [key: string]: Directive })[key]);
});

app.use(store, key);
app.use(router).use(ElementPlus).use(form).use(dialogForm).mount('#app');
