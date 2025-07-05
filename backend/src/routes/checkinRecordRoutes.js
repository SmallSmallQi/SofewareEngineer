// self-discipline-app/backend/src/routes/checkinRecordRoutes.js
const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const {
    createCheckinRecord,
    getCheckinRecords,
    getCheckinRecordById,
    updateCheckinRecord,
    deleteCheckinRecord
} = require('../controllers/checkinRecordController');

const router = express.Router();

router.route('/')
    .post(protect, createCheckinRecord)
    .get(protect, getCheckinRecords);

router.route('/:id')
    .get(protect, getCheckinRecordById)
    .put(protect, updateCheckinRecord)
    .delete(protect, deleteCheckinRecord);

module.exports = router;