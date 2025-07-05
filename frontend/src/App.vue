<!-- self-discipline-app/frontend/src/App.vue -->
<template>
  <div id="app-container">
    <!-- 头部导航栏，只在用户登录后显示 -->
    <header v-if="isAuthenticated">
      <nav>
        <router-link to="/">首页</router-link>
        <router-link to="/checkin-types">打卡内容管理</router-link>
        <router-link to="/challenges">我的挑战</router-link>
        <router-link to="/history">打卡历史</router-link>
        <button @click="logout" class="logout-button">退出登录</button>
      </nav>
    </header>

    <!-- 主内容区域，显示当前路由对应的组件 -->
    <main>
      <router-view />
    </main>
  </div>
</template>

<script setup>
import { ref, watchEffect } from 'vue';
import { useRouter, useRoute } from 'vue-router';

const router = useRouter();
const route = useRoute(); // 用于监听路由变化，以便更新认证状态
const isAuthenticated = ref(false);

// 检查用户认证状态
const checkAuthStatus = () => {
  isAuthenticated.value = !!localStorage.getItem('token'); // 如果 localStorage 中有 token，则认为已认证
};

// 立即执行一次检查，并在每次路由变化时重新检查
// watchEffect 会在其依赖发生变化时重新运行
watchEffect(() => {
  checkAuthStatus();
  // 也可以通过监听路由的 meta 字段来判断是否需要更新 UI 状态
  // 例如：当从登录页跳转到需要认证的页面时，Header 应该显示
});

// 退出登录功能
const logout = () => {
  localStorage.removeItem('token'); // 移除 token
  localStorage.removeItem('username'); // 移除用户名
  isAuthenticated.value = false; // 更新认证状态
  router.push('/login'); // 重定向到登录页
};
</script>

<style scoped>
#app-container {
  display: flex;
  flex-direction: column;
  min-height: 100vh; /* 使应用容器至少占满整个视口高度 */
}

header {
  background-color: var(--secondary-color);
  padding: 15px 20px;
  color: white;
  display: flex;
  justify-content: center; /* 导航居中 */
  align-items: center;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
}

nav {
  display: flex;
  gap: 25px; /* 导航项之间的间距 */
  align-items: center;
}

nav a {
  color: white;
  text-decoration: none;
  font-weight: bold;
  padding: 5px 0;
  position: relative;
  transition: color 0.3s ease;
}

nav a:hover {
  color: var(--primary-color);
}

/* 活跃路由链接的样式 */
nav a.router-link-active {
  color: var(--primary-color);
}

nav a.router-link-active::after {
  content: '';
  position: absolute;
  left: 0;
  bottom: -5px;
  width: 100%;
  height: 2px;
  background-color: var(--primary-color);
}

.logout-button {
  background-color: #e74c3c; /* 红色按钮 */
  color: white;
  border: none;
  padding: 8px 12px;
  border-radius: 5px;
  cursor: pointer;
  font-size: 14px;
  transition: background-color 0.3s ease;
  margin-left: 30px; /* 与导航项的间距 */
}

.logout-button:hover {
  background-color: #c0392b;
}

main {
  flex-grow: 1; /* 使 main 区域占据剩余所有空间 */
  padding: 0px; /* 由内部组件控制边距 */
}
</style>