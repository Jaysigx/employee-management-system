import express from 'express';

import {
  approveEmployee,
  createEmployee,
  deleteEmployee,
  getEmployeeById,
  getEmployees,
  loginEmployee,
  updateEmployee,
} from '../controllers/employeeController.js';
import { protect } from '../middlewares/authMiddleware.js';
import {
  isAdmin,
  isManager,
} from '../middlewares/roleMiddleware.js';
import { upload } from '../middlewares/uploadMiddleware.js';

const router = express.Router();

// Public routes
router.post('/register', createEmployee);
router.post('/login', loginEmployee);
// router.post('/forgot-password', requestPasswordReset);
// router.post('/reset-password/:token', resetPassword);

// Protected routes
router.get('/', protect, isAdmin, getEmployees);                   // Admin only
router.get('/:id', protect, getEmployeeById);                      // Any logged-in user
router.put('/:id', protect, updateEmployee);                       // Role-checked inside controller
router.put('/:id/approve', protect, isManager, approveEmployee);   // Manager only
router.delete('/:id', protect, isAdmin, deleteEmployee);           // Admin only

// File Upload (resume or profile photo)
router.post('/:id/upload', protect, upload.single('file'), async (req, res) => {
  try {
    const employee = await import('../models/Employee.js').then(mod => mod.default.findById(req.params.id));
    if (!employee) return res.status(404).json({ message: 'Employee not found' });

    const filePath = req.file?.path;

    if (!filePath) {
      return res.status(400).json({ message: 'File not uploaded' });
    }

    const type = req.query.type;

    if (type === 'resume') {
      employee.resume = filePath;
    } else if (type === 'profile') {
      employee.profilePhoto = filePath;
    } else {
      return res.status(400).json({ message: 'Invalid upload type' });
    }

    await employee.save();

    res.json({
      message: `${type === 'resume' ? 'Resume' : 'Profile photo'} uploaded successfully.`,
      path: filePath,
    });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

export default router;
