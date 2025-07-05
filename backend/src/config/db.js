// self-discipline-app/backend/src/config/db.js
const mongoose = require('mongoose');


const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            // useCreateIndex: true, // Mongoose 6+ 不再需要
            // useFindAndModify: false // Mongoose 6+ 不再需要
        });
        console.log('MongoDB 连接成功！');
    } catch (err) {
        console.error('MongoDB 连接失败：', err.message);
        process.exit(1); // 退出应用
    }
};

module.exports = connectDB;