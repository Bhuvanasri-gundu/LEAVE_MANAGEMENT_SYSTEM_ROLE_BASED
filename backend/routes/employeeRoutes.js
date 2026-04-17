const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/roleAuth');
const {
  getEmployees,
  getEmployeeById,
  addEmployee,
  updateEmployee,
  deleteEmployee,
  getBadges,
} = require('../controllers/employeeController');

router.use(protect);

router.get('/', getEmployees);
router.get('/:id', getEmployeeById);
router.get('/:id/badges', getBadges);
router.post('/', authorize('Admin'), addEmployee);
router.put('/:id', authorize('Admin'), updateEmployee);
router.delete('/:id', authorize('Admin'), deleteEmployee);

module.exports = router;
