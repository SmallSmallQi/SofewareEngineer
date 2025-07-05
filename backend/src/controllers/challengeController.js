// self-discipline-app/backend/src/controllers/challengeController.js
const Challenge = require('../models/Challenge');

// @desc    创建新挑战
// @route   POST /api/challenges
// @access  Private
const createChallenge = async (req, res) => {
    const { name, description, startDate, endDate, checkinTypeId, targetValue, targetUnit, frequency } = req.body;

    // 基本验证
    if (!name || !startDate || !endDate) {
        return res.status(400).json({ message: '挑战名称、开始日期和结束日期为必填项' });
    }

    try {
        const newChallenge = new Challenge({
            userId: req.user._id, // 从认证中间件获取用户ID
            name,
            description,
            startDate,
            endDate,
            checkinTypeId: checkinTypeId || null, // 允许为空
            targetValue,
            targetUnit,
            frequency
        });

        const createdChallenge = await newChallenge.save();
        res.status(201).json(createdChallenge);
    } catch (error) {
        console.error('创建挑战失败:', error.message);
        res.status(500).json({ message: '创建挑战失败', error: error.message });
    }
};

// @desc    获取用户所有挑战
// @route   GET /api/challenges
// @access  Private
const getChallenges = async (req, res) => {
    try {
        // 查找当前用户创建的所有挑战，并按创建时间倒序排列
        // 也可以选择性地 populate 关联的 checkinType 信息
        const challenges = await Challenge.find({ userId: req.user._id })
            .populate('checkinTypeId', 'name') // 填充关联打卡类型的 name 字段
            .sort({ createdAt: -1 });
        res.json(challenges);
    } catch (error) {
        console.error('获取挑战失败:', error.message);
        res.status(500).json({ message: '获取挑战失败', error: error.message });
    }
};

// @desc    获取单个挑战详情
// @route   GET /api/challenges/:id
// @access  Private
const getChallengeById = async (req, res) => {
    try {
        const challenge = await Challenge.findOne({ _id: req.params.id, userId: req.user._id })
            .populate('checkinTypeId', 'name');

        if (!challenge) {
            return res.status(404).json({ message: '挑战未找到或无权限访问' });
        }
        res.json(challenge);
    } catch (error) {
        console.error('获取挑战详情失败:', error.message);
        res.status(500).json({ message: '获取挑战详情失败', error: error.message });
    }
};


// @desc    更新挑战
// @route   PUT /api/challenges/:id
// @access  Private
const updateChallenge = async (req, res) => {
    const { name, description, startDate, endDate, checkinTypeId, targetValue, targetUnit, frequency, isActive } = req.body;

    if (!name || !startDate || !endDate) {
        return res.status(400).json({ message: '挑战名称、开始日期和结束日期为必填项' });
    }

    try {
        const challenge = await Challenge.findOneAndUpdate(
            { _id: req.params.id, userId: req.user._id },
            { name, description, startDate, endDate, checkinTypeId, targetValue, targetUnit, frequency, isActive },
            { new: true, runValidators: true }
        ).populate('checkinTypeId', 'name'); // 填充关联打卡类型的 name 字段

        if (!challenge) {
            return res.status(404).json({ message: '挑战未找到或无权限更新' });
        }
        res.json(challenge);
    } catch (error) {
        console.error('更新挑战失败:', error.message);
        res.status(500).json({ message: '更新挑战失败', error: error.message });
    }
};

// @desc    删除挑战
// @route   DELETE /api/challenges/:id
// @access  Private
const deleteChallenge = async (req, res) => {
    try {
        const challenge = await Challenge.findOneAndDelete({ _id: req.params.id, userId: req.user._id });

        if (!challenge) {
            return res.status(404).json({ message: '挑战未找到或无权限删除' });
        }
        res.json({ message: '挑战删除成功' });
    } catch (error) {
        console.error('删除挑战失败:', error.message);
        res.status(500).json({ message: '删除挑战失败', error: error.message });
    }
};

module.exports = {
    createChallenge,
    getChallenges,
    getChallengeById,
    updateChallenge,
    deleteChallenge
};