// self-discipline-app/backend/src/models/CheckinType.js
const mongoose = require('mongoose');

const CheckinTypeSchema = new mongoose.Schema({
    userId: { // 关联创建该打卡内容的用户
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', // 引用 User 模型
        required: true
    },
    name: { // 打卡类型名称，如 "阅读", "健身", "早起"
        type: String,
        required: true,
        trim: true,
        maxlength: 50
    },
    description: { // 打卡类型的描述
        type: String,
        trim: true,
        maxlength: 200
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('CheckinType', CheckinTypeSchema);