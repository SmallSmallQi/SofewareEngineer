// self-discipline-app/backend/src/controllers/checkinRecordController.js
const CheckinRecord = require('../models/CheckinRecord');
const CheckinType = require('../models/CheckinType'); // 可能需要验证 checkinTypeId
const Challenge = require('../models/Challenge'); // 可能需要更新挑战进度

// @desc    创建新的打卡记录
// @route   POST /api/checkins
// @access  Private
const createCheckinRecord = async (req, res) => {
    const { checkinTypeId, challengeId, value, unit, notes, checkinDate } = req.body;

    // 基本验证
    if (!checkinTypeId) {
        return res.status(400).json({ message: '打卡内容类型为必填项' });
    }

    try {
        // 验证 checkinTypeId 是否有效且属于当前用户
        const checkinType = await CheckinType.findOne({ _id: checkinTypeId, userId: req.user._id });
        if (!checkinType) {
            return res.status(404).json({ message: '打卡内容类型未找到或无权限。' });
        }

        const newRecord = new CheckinRecord({
            userId: req.user._id,
            checkinTypeId,
            challengeId: challengeId || null,
            value: value || 1, // 默认值为1
            unit,
            notes,
            checkinDate: checkinDate ? new Date(checkinDate) : new Date() // 允许指定打卡日期，否则默认为当前日期
        });

        const createdRecord = await newRecord.save();

        // TODO: 如果有 challengeId，更新对应挑战的 currentProgress
        if (challengeId) {
            // 确保挑战存在且属于当前用户
            const challenge = await Challenge.findOne({ _id: challengeId, userId: req.user._id });
            if (challenge) {
                challenge.currentProgress += (value || 1); // 累加打卡值
                await challenge.save();
            } else {
                console.warn(`Attempted to update non-existent or unauthorized challenge ID: ${challengeId}`);
            }
        }

        res.status(201).json(createdRecord);
    } catch (error) {
        console.error('创建打卡记录失败:', error.message);
        res.status(500).json({ message: '创建打卡记录失败', error: error.message });
    }
};

// @desc    获取用户所有打卡记录
// @route   GET /api/checkins
// @access  Private
const getCheckinRecords = async (req, res) => {
    // 可以添加查询参数来过滤，例如按日期范围、按打卡类型、按挑战
    const { startDate, endDate, checkinTypeId, challengeId } = req.query;
    let query = { userId: req.user._id };

    if (startDate) {
        query.checkinDate = { ...query.checkinDate, $gte: new Date(startDate) };
    }
    if (endDate) {
        // 结束日期通常需要包含当天，所以加一天再用 $lt
        const end = new Date(endDate);
        end.setDate(end.getDate() + 1);
        query.checkinDate = { ...query.checkinDate, $lt: end };
    }
    if (checkinTypeId) {
        query.checkinTypeId = checkinTypeId;
    }
    if (challengeId) {
        query.challengeId = challengeId;
    }

    try {
        const records = await CheckinRecord.find(query)
            .populate('checkinTypeId', 'name') // 填充关联打卡类型的名称
            .populate('challengeId', 'name')   // 填充关联挑战的名称
            .sort({ checkinDate: -1, createdAt: -1 }); // 先按打卡日期倒序，再按创建时间倒序

        res.json(records);
    } catch (error) {
        console.error('获取打卡记录失败:', error.message);
        res.status(500).json({ message: '获取打卡记录失败', error: error.message });
    }
};

// @desc    获取单个打卡记录详情
// @route   GET /api/checkins/:id
// @access  Private
const getCheckinRecordById = async (req, res) => {
    try {
        const record = await CheckinRecord.findOne({ _id: req.params.id, userId: req.user._id })
            .populate('checkinTypeId', 'name')
            .populate('challengeId', 'name');

        if (!record) {
            return res.status(404).json({ message: '打卡记录未找到或无权限访问' });
        }
        res.json(record);
    } catch (error) {
        console.error('获取打卡记录详情失败:', error.message);
        res.status(500).json({ message: '获取打卡记录详情失败', error: error.message });
    }
};

// @desc    更新打卡记录
// @route   PUT /api/checkins/:id
// @access  Private
const updateCheckinRecord = async (req, res) => {
    const { checkinTypeId, challengeId, value, unit, notes, checkinDate } = req.body;

    try {
        // 验证 checkinTypeId 是否有效且属于当前用户 (如果更新了)
        if (checkinTypeId) {
            const checkinType = await CheckinType.findOne({ _id: checkinTypeId, userId: req.user._id });
            if (!checkinType) {
                return res.status(404).json({ message: '打卡内容类型未找到或无权限。' });
            }
        }

        const record = await CheckinRecord.findOneAndUpdate(
            { _id: req.params.id, userId: req.user._id },
            { checkinTypeId, challengeId, value, unit, notes, checkinDate: checkinDate ? new Date(checkinDate) : undefined },
            { new: true, runValidators: true }
        )
        .populate('checkinTypeId', 'name')
        .populate('challengeId', 'name');

        if (!record) {
            return res.status(404).json({ message: '打卡记录未找到或无权限更新' });
        }
        res.json(record);
    } catch (error) {
        console.error('更新打卡记录失败:', error.message);
        res.status(500).json({ message: '更新打卡记录失败', error: error.message });
    }
};

// @desc    删除打卡记录
// @route   DELETE /api/checkins/:id
// @access  Private
const deleteCheckinRecord = async (req, res) => {
    try {
        const record = await CheckinRecord.findOneAndDelete({ _id: req.params.id, userId: req.user._id });

        if (!record) {
            return res.status(404).json({ message: '打卡记录未找到或无权限删除' });
        }
        res.json({ message: '打卡记录删除成功' });
    } catch (error) {
        console.error('删除打卡记录失败:', error.message);
        res.status(500).json({ message: '删除打卡记录失败', error: error.message });
    }
};

module.exports = {
    createCheckinRecord,
    getCheckinRecords,
    getCheckinRecordById,
    updateCheckinRecord,
    deleteCheckinRecord
};