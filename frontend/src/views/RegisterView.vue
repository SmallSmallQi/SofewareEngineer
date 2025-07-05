<!-- self-discipline-app/frontend/src/views/RegisterView.vue -->
<template>
  <div class="register-container card">
    <h2 class="text-center">注册</h2>
    <form @submit.prevent="handleRegister">
      <div class="form-group">
        <label for="username">用户名:</label>
        <input type="text" id="username" v-model="username" required autocomplete="username">
      </div>
      <div class="form-group">
        <label for="password">密码:</label>
        <input type="password" id="password" v-model="password" required autocomplete="new-password">
      </div>
      <div class="form-group">
        <label for="confirmPassword">确认密码:</label>
        <input type="password" id="confirmPassword" v-model="confirmPassword" required autocomplete="new-password">
      </div>
      <button type="submit" :disabled="loading">
        {{ loading ? '注册中...' : '注册' }}
      </button>
      <p v-if="error" class="error-message">{{ error }}</p>
      <p class="text-center">已有账号？<router-link to="/login">立即登录</router-link></p>
    </form>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { registerUser } from '../api/auth'; // 导入注册 API

const username = ref('');
const password = ref('');
const confirmPassword = ref('');
const error = ref('');
const loading = ref(false);
const router = useRouter();

const handleRegister = async () => {
  error.value = '';
  if (password.value !== confirmPassword.value) {
    error.value = '两次输入的密码不一致！';
    return;
  }
  loading.value = true;
  try {
    const data = await registerUser(username.value, password.value);
    localStorage.setItem('token', data.token); // 注册成功后也保存 token
    localStorage.setItem('username', data.username); // 保存用户名
    alert('注册成功并已自动登录！');
    router.push('/'); // 注册成功后跳转到首页
  } catch (err) {
    error.value = err.response?.data?.message || '注册失败，请重试。';
    console.error('注册错误:', err);
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
.register-container {
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