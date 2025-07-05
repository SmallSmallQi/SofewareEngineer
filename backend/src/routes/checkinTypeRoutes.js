// self-discipline-app/backend/src/routes/checkinTypeRoutes.js
const express = require('express');
const { protect } = require('../middleware/authMiddleware'); // 引入认证中间件
const CheckinType = require('../models/CheckinType');

const router = express.Router();

// @route   POST /api/checkin-types
// @desc    创建新的打卡内容
// @access  Private (需要认证)
router.post('/', protect, async (req, res) => {
    const { name, description } = req.body;

    if (!name) {
        return res.status(400).json({ message: '打卡内容名称不能为空' });
    }

    try {
        const newCheckinType = new CheckinType({
            userId: req.user._id, // 从认证中间件中获取用户ID
            name,
            description
        });
        const createdCheckinType = await newCheckinType.save();
        res.status(201).json(createdCheckinType);
    } catch (error) {
        console.error('创建打卡内容失败:', error.message);
        res.status(500).json({ message: '创建打卡内容失败', error: error.message });
    }
});

// @route   GET /api/checkin-types
// @desc    获取用户所有打卡内容
// @access  Private
router.get('/', protect, async (req, res) => {
    try {
        // 查找当前用户创建的所有打卡内容，并按创建时间倒序排列
        const checkinTypes = await CheckinType.find({ userId: req.user._id }).sort({ createdAt: -1 });
        res.json(checkinTypes);
    } catch (error) {
        console.error('获取打卡内容失败:', error.message);
        res.status(500).json({ message: '获取打卡内容失败', error: error.message });
    }
});

// @route   PUT /api/checkin-types/:id
// @desc    更新打卡内容
// @access  Private
router.put('/:id', protect, async (req, res) => {
    const { name, description } = req.body;

    if (!name) {
        return res.status(400).json({ message: '打卡内容名称不能为空' });
    }

    try {
        // 查找并更新指定ID且属于当前用户的打卡内容
        const checkinType = await CheckinType.findOneAndUpdate(
            { _id: req.params.id, userId: req.user._id },
            { name, description },
            { new: true, runValidators: true } // 返回更新后的文档，并运行 schema 验证器
        );

        if (!checkinType) {
            return res.status(404).json({ message: '打卡内容未找到或无权限更新' });
        }
        res.json(checkinType);
    } catch (error) {
        console.error('更新打卡内容失败:', error.message);
        res.status(500).json({ message: '更新打卡内容失败', error: error.message });
    }
});

// @route   DELETE /api/checkin-types/:id
// @desc    删除打卡内容
// @access  Private
router.delete('/:id', protect, async (req, res) => {
    try {
        // 查找并删除指定ID且属于当前用户的打卡内容
        const checkinType = await CheckinType.findOneAndDelete({ _id: req.params.id, userId: req.user._id });

        if (!checkinType) {
            return res.status(404).json({ message: '打卡内容未找到或无权限删除' });
        }
        res.json({ message: '打卡内容删除成功' });
    } catch (error) {
        console.error('删除打卡内容失败:', error.message);
        res.status(500).json({ message: '删除打卡内容失败', error: error.message });
    }
});

module.exports = router;