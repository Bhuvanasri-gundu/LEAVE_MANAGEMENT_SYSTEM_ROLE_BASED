const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/roleAuth');
const upload = require('../middleware/upload');
const {
  applyLeave,
  getLeaves,
  updateLeaveStatus,
  verifyDocument,
  cancelLeave,
  conflictCheck,
} = require('../controllers/leaveController');

// All leave routes require authentication
router.use(protect);

router.get('/conflict-check', conflictCheck);
router.get('/', getLeaves);
router.post('/', upload.single('document'), applyLeave);
router.patch('/:id', authorize('Admin', 'Manager'), updateLeaveStatus);
router.patch('/:id/document-verify', authorize('Admin', 'Manager'), verifyDocument);
router.delete('/:id', cancelLeave);

module.exports = router;
