// self-discipline-app/backend/src/models/User.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        trim: true // 移除字符串两端的空白字符
    },
    password: {
        type: String,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// 密码哈希预处理：在保存用户之前对密码进行哈希
UserSchema.pre('save', async function (next) {
    // 只有在密码被修改（或首次创建）时才进行哈希
    if (!this.isModified('password')) {
        return next();
    }
    const salt = await bcrypt.genSalt(10); // 生成盐值
    this.password = await bcrypt.hash(this.password, salt); // 哈希密码
    next();
});

// 实例方法：用于比较用户输入的密码和数据库中哈希后的密码
UserSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', UserSchema);