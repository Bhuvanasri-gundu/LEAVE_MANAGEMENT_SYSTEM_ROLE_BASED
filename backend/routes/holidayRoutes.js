const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/roleAuth');
const { getHolidays, addHoliday } = require('../controllers/holidayController');

router.get('/', protect, getHolidays);
router.post('/', protect, authorize('Admin'), addHoliday);

module.exports = router;
