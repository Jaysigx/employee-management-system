import express from 'express';

import { getManagerLogs } from '../controllers/adminController.js';
import { getEmployeeUpdateLogs } from '../controllers/employeeLogController.js';
import { protect } from '../middlewares/authMiddleware.js';
import {
  isAdmin,
  isAdminOrManager,
} from '../middlewares/roleMiddleware.js';

const router = express.Router();

// Admin-only: Manager activity logs
router.get('/manager-logs', protect, isAdmin, getManagerLogs);

// Admin + Manager: Employee self-update logs
router.get('/employee-update-logs', protect, isAdminOrManager, getEmployeeUpdateLogs);

export default router;
