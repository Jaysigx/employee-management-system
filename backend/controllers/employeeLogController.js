import Employee from '../models/Employee.js';
import EmployeeUpdateLog from '../models/EmployeeUpdateLog.js';

export const getEmployeeUpdateLogs = async (req, res) => {
  try {
    const { employee, field, from, to } = req.query;

    let filter = {};

    // 🔍 Filter by employee name (first or last)
    if (employee) {
      const matches = await Employee.find({
        $or: [
          { firstName: new RegExp(employee, 'i') },
          { lastName: new RegExp(employee, 'i') }
        ]
      }).select('_id');
      filter.employee = { $in: matches.map(e => e._id) };
    }

    // 🔍 Filter by date range
    if (from || to) {
      filter.timestamp = {};
      if (from) filter.timestamp.$gte = new Date(from);
      if (to) filter.timestamp.$lte = new Date(to);
    }

    // Fetch logs based on current filters
    let logs = await EmployeeUpdateLog.find(filter)
      .populate('employee', 'firstName lastName email')
      .sort({ timestamp: -1 });

    // 🔍 Filter by changed field (e.g., "email", "address", etc.)
    if (field) {
      logs = logs.filter(log => log.changes && Object.keys(log.changes).includes(field));
    }

    res.json({ count: logs.length, logs });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch logs', error: err.message });
  }
};
