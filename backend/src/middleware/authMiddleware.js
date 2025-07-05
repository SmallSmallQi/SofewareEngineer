// self-discipline-app/backend/src/middleware/authMiddleware.js
const jwt = require('jsonwebtoken');
const User = require('../models/User');


const protect = async (req, res, next) => {
    let token;

    // 检查请求头中是否有授权信息，并且是以 'Bearer' 开头
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            // 从 Header 中获取 token (格式: "Bearer TOKEN")
            token = req.headers.authorization.split(' ')[1];

            // 验证 token，解码出 payload (包含用户ID)
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            // 根据解码出的用户ID查找用户，并将用户对象附加到请求对象上
            // .select('-password') 是为了不返回用户的密码
            req.user = await User.findById(decoded.id).select('-password');

            next(); // 继续执行下一个中间件或路由处理器
        } catch (error) {
            console.error('Token 验证失败:', error.message);
            res.status(401).json({ message: '未授权，Token 失效或不正确' });
        }
    }

    // 如果没有 token
    if (!token) {
        res.status(401).json({ message: '未授权，未提供 Token' });
    }
};

module.exports = { protect };