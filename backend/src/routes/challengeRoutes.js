// self-discipline-app/backend/src/routes/challengeRoutes.js
const express = require('express');
const { protect } = require('../middleware/authMiddleware'); // 引入认证中间件
const {
    createChallenge,
    getChallenges,
    getChallengeById,
    updateChallenge,
    deleteChallenge
} = require('../controllers/challengeController'); // 导入挑战控制器

const router = express.Router();

router.route('/')
    .post(protect, createChallenge) // 创建挑战
    .get(protect, getChallenges);  // 获取所有挑战

router.route('/:id')
    .get(protect, getChallengeById) // 获取单个挑战
    .put(protect, updateChallenge)  // 更新挑战
    .delete(protect, deleteChallenge); // 删除挑战

module.exports = router;