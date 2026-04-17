const User = require('../models/User');

// GET /api/employees
exports.getEmployees = async (req, res) => {
  try {
    const employees = await User.find().select('-password').sort({ employeeId: 1 });

    const data = employees.map((e) => ({
      id: e.employeeId,
      firstName: e.firstName,
      middleName: e.middleName,
      lastName: e.lastName,
      jobTitle: e.jobTitle,
      employmentStatus: e.employmentStatus,
      subUnit: e.subUnit || e.department || 'Engineering',
      supervisor: e.supervisor,
      email: e.email,
      phone: e.phone,
      joinDate: e.joinDate ? e.joinDate.toISOString().split('T')[0] : '',
      profileImage: e.profileImage,
      role: e.role,
      team: e.team,
    }));

    res.json({ data });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/employees/:id
exports.getEmployeeById = async (req, res) => {
  try {
    const emp = await User.findOne({ employeeId: req.params.id }).select('-password');
    if (!emp) return res.status(404).json({ message: 'Employee not found' });

    res.json({
      data: {
        id: emp.employeeId,
        firstName: emp.firstName,
        middleName: emp.middleName,
        lastName: emp.lastName,
        jobTitle: emp.jobTitle,
        employmentStatus: emp.employmentStatus,
        subUnit: emp.subUnit || emp.department || 'Engineering',
        supervisor: emp.supervisor,
        email: emp.email,
        phone: emp.phone,
        joinDate: emp.joinDate ? emp.joinDate.toISOString().split('T')[0] : '',
        profileImage: emp.profileImage,
        role: emp.role,
        team: emp.team,
      },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// POST /api/employees
exports.addEmployee = async (req, res) => {
  try {
    let { employeeId, firstName, lastName, email, password, role, department, jobTitle, supervisor, team, subUnit } = req.body;

    // Validate subUnit is provided
    if (!subUnit) {
      return res.status(400).json({ message: 'Department (subUnit) is required' });
    }

    // Auto-generate employeeId if not provided
    if (!employeeId) {
      const lastEmployee = await User.findOne().sort({ employeeId: -1 });
      let nextNum = 1;
      if (lastEmployee && lastEmployee.employeeId) {
        const match = lastEmployee.employeeId.match(/\d+$/);
        if (match) {
          nextNum = parseInt(match[0]) + 1;
        }
      }
      employeeId = `EMP-${String(nextNum).padStart(3, '0')}`;
    }

    // Check if email already exists
    const emailExists = await User.findOne({ email });
    if (emailExists) {
      return res.status(400).json({ message: 'Email already exists' });
    }

    // Check if employeeId already exists
    const idExists = await User.findOne({ employeeId });
    if (idExists) {
      return res.status(400).json({ message: 'Employee ID already exists' });
    }

    const user = await User.create({
      employeeId,
      firstName,
      lastName,
      email,
      password: password || 'password123',
      role: role || 'Employee',
      department: department || subUnit,
      jobTitle: jobTitle || '',
      supervisor: supervisor || '',
      team: team || '',
      subUnit: subUnit,
    });

    res.status(201).json({
      data: {
        id: user.employeeId,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// PUT /api/employees/:id
exports.updateEmployee = async (req, res) => {
  try {
    const { firstName, lastName, email, jobTitle, subUnit, supervisor, team, role, phone, employmentStatus } = req.body;
    const employeeId = req.params.id;

    // Find the employee by employeeId
    const user = await User.findOne({ employeeId });
    if (!user) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    // Check if new email is already used by someone else
    if (email && email !== user.email) {
      const emailExists = await User.findOne({ email });
      if (emailExists) {
        return res.status(400).json({ message: 'Email already in use by another employee' });
      }
    }

    // Update allowed fields
    if (firstName) user.firstName = firstName;
    if (lastName) user.lastName = lastName;
    if (email) user.email = email;
    if (jobTitle !== undefined) user.jobTitle = jobTitle;
    if (subUnit !== undefined) {
      user.subUnit = subUnit;
      user.department = subUnit;
    }
    if (supervisor !== undefined) user.supervisor = supervisor;
    if (team !== undefined) user.team = team;
    if (role) user.role = role;
    if (phone !== undefined) user.phone = phone;
    if (employmentStatus) user.employmentStatus = employmentStatus;

    await user.save();

    res.json({
      data: {
        id: user.employeeId,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        jobTitle: user.jobTitle,
        subUnit: user.subUnit || user.department,
        supervisor: user.supervisor,
        team: user.team,
        role: user.role,
        phone: user.phone,
        employmentStatus: user.employmentStatus,
      },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// DELETE /api/employees/:id
exports.deleteEmployee = async (req, res) => {
  try {
    const emp = await User.findOneAndDelete({ employeeId: req.params.id });
    if (!emp) return res.status(404).json({ message: 'Employee not found' });
    res.json({ data: { success: true, id: req.params.id } });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/employees/:id/badges — computed dynamically
exports.getBadges = async (req, res) => {
  try {
    const Leave = require('../models/Leave');
    const emp = await User.findOne({ employeeId: req.params.id });
    if (!emp) return res.status(404).json({ message: 'Employee not found' });

    const myLeaves = await Leave.find({ employee: emp._id });
    const badges = [];

    const sickUsed = myLeaves
      .filter((l) => l.leaveType === 'Sick Leave' && ['Approved', 'Taken'].includes(l.status))
      .reduce((s, l) => s + l.duration, 0);

    const annualUsed = myLeaves
      .filter((l) => l.leaveType === 'Annual Leave' && ['Approved', 'Taken'].includes(l.status))
      .reduce((s, l) => s + l.duration, 0);

    const personalUsed = myLeaves
      .filter((l) => l.leaveType === 'Personal Leave' && ['Approved', 'Taken'].includes(l.status))
      .reduce((s, l) => s + l.duration, 0);

    // Perfect Attendance
    if (sickUsed === 0) {
      badges.push({ name: 'Perfect Attendance', desc: 'No sick leaves taken!' });
    }

    // Balanced Usage
    if (annualUsed > 0 && (sickUsed > 0 || personalUsed > 0)) {
      badges.push({ name: 'Balanced Usage', desc: 'Balanced leave types.' });
    }

    // Early Planner
    const hasEarly = myLeaves.some((l) => {
      if (!l.appliedDate || !l.fromDate) return false;
      return (new Date(l.fromDate) - new Date(l.appliedDate)) / (1000 * 60 * 60 * 24) >= 3;
    });
    if (hasEarly) {
      badges.push({ name: 'Early Planner', desc: 'Applied ≥ 3 days early.' });
    }

    // Frequent Leave
    if (myLeaves.length > 5) {
      badges.push({ name: 'Frequent Leave', desc: 'Vocal about time off!' });
    }

    res.json({ data: badges, count: badges.length });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
