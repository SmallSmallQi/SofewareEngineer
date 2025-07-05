<!-- self-discipline-app/frontend/src/views/HomeView.vue -->
<template>
  <div class="home-container container">
    <h1>欢迎，{{ username }}！</h1>
    <p>这里是您的自律挑战仪表盘。开始您的挑战之旅吧！</p>

    <div class="card">
        <h3>今日概览</h3>
        <p>这里可以显示当天的打卡状态、活跃挑战等信息。</p>
        <!-- TODO: 添加今日打卡快捷入口、待完成挑战等 -->
    </div>

    <div class="card">
        <h3>我的挑战</h3>
        <p>这里将展示您当前正在进行的所有挑战及其进度。</p>
        <router-link to="/challenges" class="button">管理我的挑战</router-link>
        <!-- TODO: 列表展示挑战，例如 ChallengeCard 组件 -->
    </div>

    <div class="card">
        <h3>打卡内容</h3>
        <p>管理您自定义的打卡类型，例如“阅读”、“健身”等。</p>
        <router-link to="/checkin-types" class="button">管理打卡内容</router-link>
    </div>

    <div class="card">
        <h3>打卡历史</h3>
        <p>查看您的历史打卡记录。</p>
        <router-link to="/history" class="button">查看打卡历史</router-link>
    </div>

  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';

const username = ref('用户'); // 默认值

onMounted(() => {
  // 从 localStorage 获取用户名
  const storedUsername = localStorage.getItem('username');
  if (storedUsername) {
    username.value = storedUsername;
  }
});
</script>

<style scoped>
.home-container {
  padding-top: 30px;
}

.home-container h1 {
  text-align: center;
  margin-bottom: 30px;
}

.card {
  margin-top: 20px;
}

.card h3 {
    margin-bottom: 10px;
}

.card p {
    margin-bottom: 15px;
}

.button { /* 按钮样式，使 router-link 看起来像按钮 */
    display: inline-block;
    background-color: var(--primary-color);
    color: white;
    padding: 8px 15px;
    border-radius: 5px;
    text-decoration: none;
    transition: background-color 0.3s ease;
}

.button:hover {
    background-color: #369a6c;
}
</style>