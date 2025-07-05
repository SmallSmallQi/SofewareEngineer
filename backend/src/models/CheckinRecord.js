// self-discipline-app/backend/src/models/CheckinRecord.js
const mongoose = require('mongoose');

const CheckinRecordSchema = new mongoose.Schema({
    userId: { // 关联打卡记录的用户
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    checkinTypeId: { // 关联的打卡内容类型
        type: mongoose.Schema.Types.ObjectId,
        ref: 'CheckinType',
        required: true
    },
    challengeId: { // 关联的挑战 (可选，如果这次打卡是某个挑战的一部分)
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Challenge',
        required: false
    },
    value: { // 打卡值 (例如，阅读了多少页，健身了多少分钟，或者简单的1表示完成)
        type: Number,
        default: 1 // 默认为1，表示完成一次
    },
    unit: { // 值的单位 (例如 "页", "分钟", "次")
        type: String,
        trim: true,
        maxlength: 20,
        required: false
    },
    notes: { // 备注
        type: String,
        trim: true,
        maxlength: 200
    },
    checkinDate: { // 打卡日期 (精确到天)
        type: Date,
        required: true,
        default: Date.now // 默认为当前日期
    },
    createdAt: { // 记录创建时间 (精确到毫秒)
        type: Date,
        default: Date.now
    }
});

// 为 checkinDate 添加索引，方便按日期查询
CheckinRecordSchema.index({ userId: 1, checkinDate: -1 });

module.exports = mongoose.model('CheckinRecord', CheckinRecordSchema);