// self-discipline-app/frontend/src/api/axiosInstance.js
import axios from 'axios';
import router from '../router'; // 导入 router 实例，用于重定向

// 后端 API 地址，从 Vite 环境变量中读取
// 注意：Vite 环境变量需要以 VITE_ 开头
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'; // 提供一个默认值以防万一

const axiosInstance = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
    timeout: 10000 // 请求超时时间 10 秒
});

// 请求拦截器：在每个请求发送前添加 JWT token
axiosInstance.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token'); // 从 localStorage 获取 token
        if (token) {
            config.headers.Authorization = `Bearer ${token}`; // 在请求头中设置 Authorization
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// 响应拦截器：处理错误响应，例如 token 过期或未授权
axiosInstance.interceptors.response.use(
    (response) => {
        return response;
    },
    (error) => {
        // 如果响应状态码是 401（未授权）
        if (error.response && error.response.status === 401) {
            console.error('Unauthorized: Token expired or invalid. Redirecting to login...');
            localStorage.removeItem('token'); // 移除过期或无效的 token
            localStorage.removeItem('username'); // 移除用户信息
            // 使用 router 实例重定向到登录页
            router.push('/login');
        }
        return Promise.reject(error);
    }
);

export default axiosInstance;