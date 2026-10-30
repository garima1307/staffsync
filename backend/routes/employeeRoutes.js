const express = require('express');
const router = express.Router();
const {
  getEmployees,
  getEmployeeById,
  createEmployee,
  updateEmployee,
  deleteEmployee,
  getEmployeeStats,
} = require('../controllers/employeeController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.get('/stats/summary', protect, authorize('hr', 'manager'), getEmployeeStats);

router
  .route('/')
  .get(protect, authorize('hr', 'manager'), getEmployees)
  .post(protect, authorize('hr'), createEmployee);

router
  .route('/:id')
  .get(protect, getEmployeeById)
  .put(protect, updateEmployee)
  .delete(protect, authorize('hr'), deleteEmployee);

module.exports = router;
