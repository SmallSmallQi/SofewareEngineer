// self-discipline-app/frontend/src/router/index.js
import { createRouter, createWebHistory } from 'vue-router';
import HomeView from '../views/HomeView.vue';
import LoginView from '../views/LoginView.vue';
import RegisterView from '../views/RegisterView.vue';
import CheckinTypesView from '../views/CheckinTypesView.vue';
import ChallengesView from '../views/ChallengesView.vue'; // <-- 添加这行
import CheckinHistoryView from '../views/CheckinHistoryView.vue'; // <-- 添加这行
// 定义路由规则
const routes = [
  {
    path: '/',
    name: 'Home',
    component: HomeView,
    meta: { requiresAuth: true } // 需要认证才能访问
  },
  {
    path: '/login',
    name: 'Login',
    component: LoginView
  },
  {
    path: '/register',
    name: 'Register',
    component: RegisterView
  },
  {
    path: '/checkin-types',
    name: 'CheckinTypes',
    component: CheckinTypesView,
    meta: { requiresAuth: true } // 需要认证才能访问
  },
  {
    path: '/challenges',
    name: 'Challenges',
    component: ChallengesView, // <-- 添加这行
    meta: { requiresAuth: true } // 需要认证才能访问
  },
  {
    path: '/history',
    name: 'CheckinHistory',
    component: CheckinHistoryView, // <-- 添加这行
    meta: { requiresAuth: true }
  },
  // TODO: 后续添加其他路由，如 /challenges, /history 等
];

const router = createRouter({
  history: createWebHistory(), // 使用 HTML5 History 模式
  routes,
});

// 全局导航守卫：在每次路由跳转前执行
router.beforeEach((to, from, next) => {
  const isAuthenticated = localStorage.getItem('token'); // 检查用户是否已登录 (是否存在 token)

  // 如果路由需要认证 (requiresAuth: true) 且用户未登录
  if (to.meta.requiresAuth && !isAuthenticated) {
    next('/login'); // 重定向到登录页
  }
  // 如果用户已登录，但尝试访问登录或注册页
  else if ((to.name === 'Login' || to.name === 'Register') && isAuthenticated) {
    next('/'); // 重定向到首页
  }
  // 否则，允许路由跳转
  else {
    next();
  }
});

export default router;