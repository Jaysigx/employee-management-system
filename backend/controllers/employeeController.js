// ==================== UPDATE EMPLOYEE ====================
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

import Employee from '../models/Employee.js';
import EmployeeUpdateLog from '../models/EmployeeUpdateLog.js';
import ManagerLog from '../models/ManagerLog.js';

// Generate token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "1d" });
};

// ==================== REGISTER ====================
export const createEmployee = async (req, res) => {
  try {
    const { email, password, ...rest } = req.body;

    const existing = await Employee.findOne({ email });
    if (existing)
      return res.status(400).json({ message: "Employee already exists" });

    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;
    if (!passwordRegex.test(password)) {
      return res.status(400).json({
        message:
          "Password must include uppercase, lowercase, number, special char, and be at least 8 characters.",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newEmployee = new Employee({
      email,
      password: hashedPassword,
      ...rest,
    });

    await newEmployee.save();

    const token = generateToken(newEmployee._id);

    res.status(201).json({
      token,
      employee: {
        id: newEmployee._id,
        firstName: newEmployee.firstName,
        lastName: newEmployee.lastName,
        email: newEmployee.email,
        role: newEmployee.role,
        approved: newEmployee.approved,
      },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ==================== LOGIN ====================
export const loginEmployee = async (req, res) => {
  try {
    const { email, password } = req.body;

    const employee = await Employee.findOne({ email });
    if (!employee)
      return res.status(401).json({ message: "Invalid email or password" });

    if (!employee.approved) {
      return res
        .status(403)
        .json({ message: "Account not yet approved by manager" });
    }

    const isMatch = await bcrypt.compare(password, employee.password);
    if (!isMatch)
      return res.status(401).json({ message: "Invalid email or password" });

    const token = generateToken(employee._id);

    res.json({
      token,
      employee: {
        id: employee._id,
        firstName: employee.firstName,
        lastName: employee.lastName,
        email: employee.email,
        role: employee.role,
        approved: employee.approved,
      },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ==================== GET ALL EMPLOYEES ====================
export const getEmployees = async (req, res) => {
  try {
    const employees = await Employee.find({
      employmentStatus: { $ne: "terminated" },
    }).select("-password");

    res.json(employees);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ==================== GET EMPLOYEE BY ID ====================
export const getEmployeeById = async (req, res) => {
  try {
    const employee = await Employee.findById(req.params.id).select("-password");
    if (!employee)
      return res.status(404).json({ message: "Employee not found" });
    res.json(employee);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const updateEmployee = async (req, res) => {
  try {
    const employee = await Employee.findById(req.params.id);
    if (!employee) return res.status(404).json({ message: 'Employee not found' });

    const isSelf = req.employee._id.toString() === employee._id.toString();
    const isManager = req.employee.role === 'Manager';
    const isAdmin = req.employee.role === 'Admin';

    const updates = req.body;

    // Admin-only fields
    const adminOnlyKeys = ['role', 'approved'];
    if (!isAdmin) {
      const tryingToUpdateAdminFields = Object.keys(updates).filter(field =>
        adminOnlyKeys.includes(field)
      );
      if (tryingToUpdateAdminFields.length > 0) {
        return res.status(403).json({
          message: `Only Admin can update: ${tryingToUpdateAdminFields.join(', ')}`,
          allowedOnlyByAdmin: adminOnlyKeys,
        });
      }
    }

    // Manager can't update their own sensitive fields
    const managerSelfRestricted = ['occupation', 'employmentStatus', 'workLocation'];
    if (isManager && isSelf) {
      const violating = Object.keys(updates).filter(field =>
        managerSelfRestricted.includes(field)
      );
      if (violating.length > 0) {
        return res.status(403).json({
          message: `Managers cannot update their own admin-level field(s): ${violating.join(', ')}`,
          allowedOnlyByAdmin: managerSelfRestricted,
        });
      }
    }

    // Employees can only update themselves
    const employeeAllowedFields = ['emergencyContact', 'profilePhoto', 'resume', 'address', 'email', 'password'];
    if (req.employee.role === 'Employee') {
      if (!isSelf) {
        return res.status(403).json({ message: 'You can only update your own profile' });
      }
      const disallowed = Object.keys(updates).filter(
        (key) => !employeeAllowedFields.includes(key)
      );
      if (disallowed.length > 0) {
        return res.status(403).json({
          message: `You cannot update: ${disallowed.join(', ')}`,
          allowedFields: employeeAllowedFields,
        });
      }
      if (updates.password) {
        updates.password = await bcrypt.hash(updates.password, 10);
      }
    }

    // Track changed fields
    const changedFields = {};
    for (let key in updates) {
      if (key === 'password') {
        if (isSelf || isManager || isAdmin) {
          employee.password = await bcrypt.hash(updates.password, 10);
        }
        continue;
      }
      if (key !== 'role' && key !== 'approved') {
        const current = JSON.stringify(employee[key]);
        const incoming = JSON.stringify(updates[key]);
        if (current !== incoming) {
          changedFields[key] = {
            from: employee[key],
            to: updates[key],
          };
          employee[key] = updates[key];
        }
      }
    }

    await employee.save();

    // Log manager updates
    if (isManager && !isSelf && Object.keys(changedFields).length > 0) {
      await ManagerLog.create({
        manager: req.employee._id,
        targetEmployee: employee._id,
        action: 'Updated employee profile',
        changes: changedFields,
      });
    }

    // Log employee self-updates
    if (req.employee.role === 'Employee' && isSelf && Object.keys(changedFields).length > 0) {
      await EmployeeUpdateLog.create({
        employee: req.employee._id,
        changes: changedFields
      });
    }

    res.json({
      message: 'Employee updated successfully',
      employee: { ...employee._doc, password: undefined },
    });

  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};


// ==================== DELETE EMPLOYEE (ADMIN) ====================
export const deleteEmployee = async (req, res) => {
  try {
    const employee = await Employee.findById(req.params.id);

    if (!employee) {
      return res.status(404).json({ message: "Employee not found" });
    }

    employee.employmentStatus = "terminated";
    await employee.save();

    res.json({ message: "Employee marked as terminated (soft deleted)." });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// ==================== APPROVE EMPLOYEE (MANAGER) ====================
export const approveEmployee = async (req, res) => {
  try {
    const employee = await Employee.findByIdAndUpdate(
      req.params.id,
      { approved: true },
      { new: true }
    ).select("-password");

    if (!employee)
      return res.status(404).json({ message: "Employee not found" });

    res.json({ message: "Employee approved successfully", employee });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};
