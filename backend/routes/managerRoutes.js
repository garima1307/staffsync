const express = require('express');
const router = express.Router();
const {
  getManagers,
  getMyTeam,
  assignTeamMember,
} = require('../controllers/managerController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.get('/', protect, authorize('hr'), getManagers);
router.get('/team', protect, authorize('manager'), getMyTeam);
router.put('/assign', protect, authorize('hr'), assignTeamMember);

module.exports = router;
