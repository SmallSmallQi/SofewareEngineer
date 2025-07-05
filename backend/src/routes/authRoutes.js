// self-discipline-app/backend/src/routes/authRoutes.js
const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');


const router = express.Router();

// 辅助函数：生成 JWT Token
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '1h' // Token 有效期设为 1 小时
    });
};

// @route   POST /api/auth/register
// @desc    注册新用户
// @access  Public (任何人都可以访问)
router.post('/register', async (req, res) => {
    const { username, password } = req.body;

    // 简单的输入验证
    if (!username || !password) {
        return res.status(400).json({ message: '请提供用户名和密码' });
    }

    try {
        // 检查用户是否已存在
        let user = await User.findOne({ username });
        if (user) {
            return res.status(400).json({ message: '用户已存在' });
        }

        // 创建新用户 (密码会在 User 模型中的 pre-save 钩子中自动哈希)
        user = await User.create({ username, password });

        res.status(201).json({
            _id: user._id,
            username: user.username,
            token: generateToken(user._id) // 注册成功后直接返回 Token
        });
    } catch (error) {
        console.error('用户注册失败:', error.message);
        res.status(500).json({ message: '服务器错误', error: error.message });
    }
});

// @route   POST /api/auth/login
// @desc    用户登录
// @access  Public
router.post('/login', async (req, res) => {
    const { username, password } = req.body;

    // 简单的输入验证
    if (!username || !password) {
        return res.status(400).json({ message: '请提供用户名和密码' });
    }

    try {
        // 查找用户
        const user = await User.findOne({ username });
        if (!user) {
            return res.status(400).json({ message: '无效的用户名或密码' });
        }

        // 比较密码
        const isMatch = await user.matchPassword(password);
        if (!isMatch) {
            return res.status(400).json({ message: '无效的用户名或密码' });
        }

        res.json({
            _id: user._id,
            username: user.username,
            token: generateToken(user._id) // 登录成功后返回 Token
        });
    } catch (error) {
        console.error('用户登录失败:', error.message);
        res.status(500).json({ message: '服务器错误', error: error.message });
    }
});

module.exports = router;