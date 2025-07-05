// self-discipline-app/backend/src/models/Challenge.js
const mongoose = require('mongoose');

const ChallengeSchema = new mongoose.Schema({
    userId: { // 关联创建该挑战的用户
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', // 引用 User 模型
        required: true
    },
    checkinTypeId: { // 挑战关联的打卡内容类型 (可选，如果一个挑战针对某个特定打卡类型)
        type: mongoose.Schema.Types.ObjectId,
        ref: 'CheckinType', // 引用 CheckinType 模型
        required: false // 可以是通用挑战，不强制关联特定打卡类型
    },
    name: { // 挑战名称，如 "30天阅读挑战"
        type: String,
        required: true,
        trim: true,
        maxlength: 100
    },
    description: { // 挑战描述
        type: String,
        trim: true,
        maxlength: 500
    },
    startDate: { // 挑战开始日期
        type: Date,
        required: true
    },
    endDate: { // 挑战结束日期
        type: Date,
        required: true
    },
    targetValue: { // 挑战目标值，例如 "阅读30本书", "健身10次"
        type: Number,
        required: false, // 对于某些挑战可能没有具体数值目标
        default: 0
    },
    targetUnit: { // 目标单位，例如 "天", "次", "本书", "小时"
        type: String,
        trim: true,
        maxlength: 20,
        required: false
    },
    frequency: { // 打卡频率，如 "daily", "weekly", "3-times-a-week"
        type: String,
        enum: ['daily', 'weekly', 'custom'], // 示例值，可扩展
        default: 'daily'
    },
    currentProgress: { // 当前挑战进度 (例如，已打卡次数)
        type: Number,
        default: 0
    },
    isActive: { // 挑战是否活跃
        type: Boolean,
        default: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

ChallengeSchema.pre('save', function(next) {
    this.updatedAt = Date.now();
    next();
});

module.exports = mongoose.model('Challenge', ChallengeSchema);