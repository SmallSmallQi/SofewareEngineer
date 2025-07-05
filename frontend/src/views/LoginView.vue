<!-- self-discipline-app/frontend/src/views/LoginView.vue -->
<template>
  <div class="login-container card">
    <h2 class="text-center">登录</h2>
    <form @submit.prevent="handleLogin">
      <div class="form-group">
        <label for="username">用户名:</label>
        <input type="text" id="username" v-model="username" required autocomplete="username">
      </div>
      <div class="form-group">
        <label for="password">密码:</label>
        <input type="password" id="password" v-model="password" required autocomplete="current-password">
      </div>
      <button type="submit" :disabled="loading">
        {{ loading ? '登录中...' : '登录' }}
      </button>
      <p v-if="error" class="error-message">{{ error }}</p>
      <p class="text-center">还没有账号？<router-link to="/register">立即注册</router-link></p>
    </form>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { loginUser } from '../api/auth'; // 导入登录 API

const username = ref('');
const password = ref('');
const error = ref('');
const loading = ref(false); // 加载状态
const router = useRouter();

const handleLogin = async () => {
  error.value = ''; // 清除之前的错误信息
  loading.value = true; // 设置加载状态
  try {
    const data = await loginUser(username.value, password.value);
    localStorage.setItem('token', data.token); // 保存 token
    localStorage.setItem('username', data.username); // 保存用户名
    alert('登录成功！'); // 可以替换为更友好的通知组件
    router.push('/'); // 登录成功后跳转到首页
  } catch (err) {
    error.value = err.response?.data?.message || '登录失败，请重试。';
    console.error('登录错误:', err);
  } finally {
    loading.value = false; // 结束加载状态
  }
};
</script>

<style scoped>
.login-container {
  max-width: 400px;
  margin: 50px auto;
  padding: 30px;
}

button {
  width: 100%;
  margin-top: 10px;
}

.text-center {
  margin-top: 20px;
}
</style>