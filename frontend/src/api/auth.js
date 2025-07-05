// self-discipline-app/frontend/src/api/auth.js
import axios from './axiosInstance'; // 导入我们配置好的 axios 实例

export const registerUser = async (username, password) => {
    try {
        const response = await axios.post('/auth/register', { username, password });
        return response.data;
    } catch (error) {
        // 抛出错误以便在组件中捕获和处理
        throw error;
    }
};

export const loginUser = async (username, password) => {
    try {
        const response = await axios.post('/auth/login', { username, password });
        return response.data;
    } catch (error) {
        throw error;
    }
};