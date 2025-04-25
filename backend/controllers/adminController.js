import Employee from '../models/Employee.js';
import ManagerLog from '../models/ManagerLog.js';

export const getManagerLogs = async (req, res) => {
  try {
    const { manager, action, from, to, field } = req.query;

    let filter = {};

    // 🔍 Filter by manager name
    if (manager) {
      const matchingManagers = await Employee.find({
        role: 'Manager',
        $or: [
          { firstName: new RegExp(manager, 'i') },
          { lastName: new RegExp(manager, 'i') },
        ]
      }).select('_id');

      const ids = matchingManagers.map((m) => m._id);
      filter.manager = { $in: ids };
    }

    // 🔍 Filter by action
    if (action) {
      filter.action = new RegExp(action, 'i');
    }

    // 🔍 Filter by date range
    if (from || to) {
      filter.timestamp = {};
      if (from) filter.timestamp.$gte = new Date(from);
      if (to) filter.timestamp.$lte = new Date(to);
    }

    // Fetch logs with filters
    let logs = await ManagerLog.find(filter)
      .populate('manager', 'firstName lastName email')
      .populate('targetEmployee', 'firstName lastName email')
      .sort({ timestamp: -1 });

    // 🔍 Additional filter: by changed field (e.g. "occupation")
    if (field) {
      logs = logs.filter(log => log.changes && Object.keys(log.changes).includes(field));
    }

    res.json({ count: logs.length, logs });
  } catch (err) {
    res.status(500).json({ message: 'Failed to retrieve logs', error: err.message });
  }
};
