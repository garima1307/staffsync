const express = require('express');
const router = express.Router();
const {
  applyLeave,
  getMyLeaves,
  getAllLeaves,
  updateLeaveStatus,
  cancelLeave,
} = require('../controllers/leaveController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.route('/')
  .post(protect, applyLeave)
  .get(protect, authorize('hr', 'manager'), getAllLeaves);

router.get('/my', protect, getMyLeaves);
router.put('/:id', protect, authorize('hr', 'manager'), updateLeaveStatus);
router.delete('/:id', protect, cancelLeave);

module.exports = router;
