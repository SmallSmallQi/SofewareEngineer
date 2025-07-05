// self-discipline-app/frontend/src/main.js
import { createApp } from 'vue';
import App from './App.vue';
import router from './router'; // 导入配置好的 Vue Router 实例

// 创建 Vue 应用实例
const app = createApp(App);

// 使用 Vue Router
app.use(router);

// 将应用挂载到 index.html 中 id 为 'app' 的 DOM 元素上
app.mount('#app');