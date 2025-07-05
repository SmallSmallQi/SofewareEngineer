// self-discipline-app/backend/src/app.js

// **第一步：在所有其他模块导入之前，加载 .env 文件**
console.log('Attempting to load .env file...'); // <-- 确保有这行
require('dotenv').config({ path: './.env' });
console.log('After dotenv.config(), process.env.MONGO_URI is:', process.env.MONGO_URI); // <-- 确保有这行
console.log('After dotenv.config(), process.env.PORT is:', process.env.PORT); // <-- 确保有这行


const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db'); // 导入数据库连接函数

// 导入路由模块
const authRoutes = require('./routes/authRoutes');
const checkinTypeRoutes = require('./routes/checkinTypeRoutes');
// TODO: 在这里导入 CheckinRecord 和 Challenge 路由文件

// **第二步：现在可以安全地连接数据库了，因为 MONGO_URI 已经被加载到 process.env 中**
connectDB(); // connectDB 内部会再次访问 process.env.MONGO_URI

// 初始化 Express 应用
const app = express();

// 中间件设置
app.use(express.json()); // 解析 JSON 格式的请求体
app.use(cors()); // 启用 CORS (Cross-Origin Resource Sharing)，允许前端应用访问后端

// 路由挂载
app.use('/api/auth', authRoutes); // 用户认证相关的 API (注册、登录)
app.use('/api/checkin-types', checkinTypeRoutes); // 打卡内容管理 API
// TODO: app.use('/api/checkins', checkinRecordRoutes); // 打卡记录 API
// TODO: app.use('/api/challenges', challengeRoutes); // 挑战目标 API

// 简单的根路由，用于测试服务器是否运行
app.get('/', (req, res) => {
    res.send('自律挑战应用后端 API 正在运行！');
});

// 错误处理中间件 (可选，但推荐)
app.use((err, req, res, next) => {
    console.error(err.stack); // 打印错误堆栈到控制台
    res.status(500).send('服务器内部错误！'); // 向客户端发送通用错误消息
});

// 定义服务器监听端口
const PORT = process.env.PORT || 5000; // 优先使用 .env 中定义的 PORT，否则默认 5000
console.log('Final PORT is:', PORT); // <-- 确保有这行

// 启动服务器
app.listen(PORT, () => {
    console.log(`服务器运行在端口 ${PORT}`);
    console.log(`访问地址: http://localhost:${PORT}`);
});