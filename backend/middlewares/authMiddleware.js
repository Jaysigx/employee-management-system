import jwt from 'jsonwebtoken';

import Employee from '../models/Employee.js';

export const protect = async (req, res, next) => {
  let token;

  try {
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith('Bearer')) {
      token = authHeader.split(' ')[1];

      // Decode the token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Get user info excluding password
      const employee = await Employee.findById(decoded.id).select('-password');

      if (!employee) {
        return res.status(401).json({ message: 'User not found' });
      }

      req.employee = employee;
      next();
    } else {
      return res.status(401).json({ message: 'Not authorized, token missing' });
    }
  } catch (err) {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
};
