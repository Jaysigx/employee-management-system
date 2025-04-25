export const isAdmin = (req, res, next) => {
  if (req.employee.role === 'Admin') {
    next();
  } else {
    res.status(403).json({ message: 'Admin access only' });
  }
};

export const isManager = (req, res, next) => {
  if (req.employee.role === 'Manager' || req.employee.role === 'Admin') {
    next();
  } else {
    res.status(403).json({ message: 'Manager access only' });
  }
};

// ✅ New middleware: Admin or Manager
export const isAdminOrManager = (req, res, next) => {
  if (req.employee.role === 'Admin' || req.employee.role === 'Manager') {
    next();
  } else {
    res.status(403).json({ message: 'Admin or Manager access only' });
  }
};
