const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/roleAuth');
const { getLeaveTypes, addLeaveType } = require('../controllers/leaveTypeController');

router.get('/', protect, getLeaveTypes);
router.post('/', protect, authorize('Admin'), addLeaveType);

module.exports = router;
