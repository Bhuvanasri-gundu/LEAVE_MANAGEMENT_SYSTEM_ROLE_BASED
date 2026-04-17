const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

const User = require('../models/User');
const Leave = require('../models/Leave');
const LeaveType = require('../models/LeaveType');
const Holiday = require('../models/Holiday');

const users = [
  {
    employeeId: 'EMP-001', firstName: 'John', middleName: 'A', lastName: 'Smith',
    email: 'john.smith@smartleave.com', password: 'password123', role: 'Employee',
    jobTitle: 'Software Engineer', employmentStatus: 'Full-Time Permanent',
    department: 'Engineering', supervisor: 'Sarah Johnson', phone: '+1 555-0101',
    joinDate: new Date('2022-03-15'), team: 'engineering',
  },
  {
    employeeId: 'EMP-002', firstName: 'Sarah', middleName: 'B', lastName: 'Johnson',
    email: 'sarah.johnson@smartleave.com', password: 'password123', role: 'Manager',
    jobTitle: 'Engineering Manager', employmentStatus: 'Full-Time Permanent',
    department: 'Engineering', supervisor: 'Michael Brown', phone: '+1 555-0102',
    joinDate: new Date('2020-06-01'), team: 'engineering',
  },
  {
    employeeId: 'EMP-003', firstName: 'Michael', middleName: 'C', lastName: 'Brown',
    email: 'michael.brown@smartleave.com', password: 'password123', role: 'Admin',
    jobTitle: 'VP Engineering', employmentStatus: 'Full-Time Permanent',
    department: 'Engineering', supervisor: 'CEO', phone: '+1 555-0103',
    joinDate: new Date('2019-01-10'), team: 'engineering',
  },
  {
    employeeId: 'EMP-004', firstName: 'Emily', middleName: '', lastName: 'Davis',
    email: 'emily.davis@smartleave.com', password: 'password123', role: 'Employee',
    jobTitle: 'HR Specialist', employmentStatus: 'Full-Time Permanent',
    department: 'Human Resources', supervisor: 'Lisa Anderson', phone: '+1 555-0104',
    joinDate: new Date('2021-07-20'), team: 'hr',
  },
  {
    employeeId: 'EMP-005', firstName: 'David', middleName: 'E', lastName: 'Wilson',
    email: 'david.wilson@smartleave.com', password: 'password123', role: 'Employee',
    jobTitle: 'QA Analyst', employmentStatus: 'Full-Time Permanent',
    department: 'Quality Assurance', supervisor: 'Sarah Johnson', phone: '+1 555-0105',
    joinDate: new Date('2022-09-12'), team: 'engineering',
  },
  {
    employeeId: 'EMP-006', firstName: 'Lisa', middleName: 'F', lastName: 'Anderson',
    email: 'lisa.anderson@smartleave.com', password: 'password123', role: 'Manager',
    jobTitle: 'HR Manager', employmentStatus: 'Full-Time Permanent',
    department: 'Human Resources', supervisor: 'Michael Brown', phone: '+1 555-0106',
    joinDate: new Date('2020-02-14'), team: 'hr',
  },
  {
    employeeId: 'EMP-007', firstName: 'James', middleName: '', lastName: 'Taylor',
    email: 'james.taylor@smartleave.com', password: 'password123', role: 'Employee',
    jobTitle: 'DevOps Engineer', employmentStatus: 'Full-Time Permanent',
    department: 'Engineering', supervisor: 'Sarah Johnson', phone: '+1 555-0107',
    joinDate: new Date('2023-01-05'), team: 'engineering',
  },
  {
    employeeId: 'EMP-008', firstName: 'Amanda', middleName: 'G', lastName: 'Martinez',
    email: 'amanda.martinez@smartleave.com', password: 'password123', role: 'Employee',
    jobTitle: 'UI/UX Designer', employmentStatus: 'Full-Time Contract',
    department: 'Design', supervisor: 'Sarah Johnson', phone: '+1 555-0108',
    joinDate: new Date('2023-04-18'), team: 'engineering',
  },
  {
    employeeId: 'EMP-009', firstName: 'Robert', middleName: 'H', lastName: 'Thomas',
    email: 'robert.thomas@smartleave.com', password: 'password123', role: 'Employee',
    jobTitle: 'Financial Analyst', employmentStatus: 'Full-Time Permanent',
    department: 'Finance', supervisor: 'Michael Brown', phone: '+1 555-0109',
    joinDate: new Date('2021-11-01'), team: 'finance',
  },
  {
    employeeId: 'EMP-010', firstName: 'Jennifer', middleName: '', lastName: 'Garcia',
    email: 'jennifer.garcia@smartleave.com', password: 'password123', role: 'Employee',
    jobTitle: 'Marketing Coordinator', employmentStatus: 'Part-Time',
    department: 'Marketing', supervisor: 'Lisa Anderson', phone: '+1 555-0110',
    joinDate: new Date('2023-06-22'), team: 'hr',
  },
  {
    employeeId: 'EMP-011', firstName: 'William', middleName: 'I', lastName: 'Lee',
    email: 'william.lee@smartleave.com', password: 'password123', role: 'Employee',
    jobTitle: 'Backend Developer', employmentStatus: 'Full-Time Permanent',
    department: 'Engineering', supervisor: 'Sarah Johnson', phone: '+1 555-0111',
    joinDate: new Date('2022-08-30'), team: 'engineering',
  },
  {
    employeeId: 'EMP-012', firstName: 'Jessica', middleName: 'J', lastName: 'Harris',
    email: 'jessica.harris@smartleave.com', password: 'password123', role: 'Employee',
    jobTitle: 'Recruiter', employmentStatus: 'Full-Time Permanent',
    department: 'Human Resources', supervisor: 'Lisa Anderson', phone: '+1 555-0112',
    joinDate: new Date('2021-04-10'), team: 'hr',
  },
];

const leaveTypes = [
  { name: 'Annual Leave', daysPerYear: 20, situational: false },
  { name: 'Sick Leave', daysPerYear: 12, situational: true },
  { name: 'Personal Leave', daysPerYear: 5, situational: false },
  { name: 'Maternity Leave', daysPerYear: 90, situational: true },
  { name: 'Paternity Leave', daysPerYear: 10, situational: true },
  { name: 'Bereavement Leave', daysPerYear: 5, situational: true },
  { name: 'Unpaid Leave', daysPerYear: 30, situational: false },
];

const holidays = [
  { name: "New Year's Day", date: new Date('2026-01-01'), recurring: true, length: 'Full Day' },
  { name: 'Martin Luther King Jr. Day', date: new Date('2026-01-19'), recurring: true, length: 'Full Day' },
  { name: "Presidents' Day", date: new Date('2026-02-16'), recurring: true, length: 'Full Day' },
  { name: 'Memorial Day', date: new Date('2026-05-25'), recurring: true, length: 'Full Day' },
  { name: 'Independence Day', date: new Date('2026-07-04'), recurring: true, length: 'Full Day' },
  { name: 'Labor Day', date: new Date('2026-09-07'), recurring: true, length: 'Full Day' },
  { name: 'Thanksgiving Day', date: new Date('2026-11-26'), recurring: true, length: 'Full Day' },
  { name: 'Christmas Day', date: new Date('2026-12-25'), recurring: true, length: 'Full Day' },
  { name: 'Company Foundation Day', date: new Date('2026-03-15'), recurring: true, length: 'Half Day' },
];

const seedDatabase = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('📦 Connected to MongoDB for seeding...\n');

    await User.deleteMany({});
    await Leave.deleteMany({});
    await LeaveType.deleteMany({});
    await Holiday.deleteMany({});
    console.log('🗑️  Cleared existing data');

    // Use create() in a loop so Mongoose pre('save') password hashing runs
    const createdUsers = [];
    for (const userData of users) {
      const u = await User.create(userData);
      createdUsers.push(u);
    }
    console.log(`✅ Seeded ${createdUsers.length} users (passwords hashed)`);

    const userMap = {};
    createdUsers.forEach((u) => { userMap[u.employeeId] = u; });

    const createdLeaveTypes = await LeaveType.insertMany(leaveTypes);
    console.log(`✅ Seeded ${createdLeaveTypes.length} leave types`);

    const createdHolidays = await Holiday.insertMany(holidays);
    console.log(`✅ Seeded ${createdHolidays.length} holidays`);

    const leaves = [
      {
        employee: userMap['EMP-001']._id, employeeName: 'John Smith', employeeId: 'EMP-001',
        leaveType: 'Annual Leave', fromDate: new Date('2026-04-01'), toDate: new Date('2026-04-05'),
        duration: 5, status: 'Pending', comments: 'Family vacation', appliedDate: new Date('2026-03-25'),
        document: { originalName: null, url: null }, documentStatus: 'None',
      },
      {
        employee: userMap['EMP-005']._id, employeeName: 'David Wilson', employeeId: 'EMP-005',
        leaveType: 'Sick Leave', fromDate: new Date('2026-03-28'), toDate: new Date('2026-03-28'),
        duration: 1, status: 'Approved', comments: 'Medical appointment', appliedDate: new Date('2026-03-27'),
        document: { originalName: 'medical_cert.pdf', url: '/uploads/sample.pdf' }, documentStatus: 'Verified',
      },
      {
        employee: userMap['EMP-008']._id, employeeName: 'Amanda Martinez', employeeId: 'EMP-008',
        leaveType: 'Personal Leave', fromDate: new Date('2026-04-10'), toDate: new Date('2026-04-11'),
        duration: 2, status: 'Pending', comments: 'Personal matter', appliedDate: new Date('2026-03-26'),
        document: { originalName: null, url: null }, documentStatus: 'None',
      },
      {
        employee: userMap['EMP-002']._id, employeeName: 'Sarah Johnson', employeeId: 'EMP-002',
        leaveType: 'Annual Leave', fromDate: new Date('2026-05-01'), toDate: new Date('2026-05-10'),
        duration: 8, status: 'Scheduled', comments: 'Spring break trip', appliedDate: new Date('2026-03-20'),
        document: { originalName: null, url: null }, documentStatus: 'None',
      },
      {
        employee: userMap['EMP-007']._id, employeeName: 'James Taylor', employeeId: 'EMP-007',
        leaveType: 'Sick Leave', fromDate: new Date('2026-03-30'), toDate: new Date('2026-03-30'),
        duration: 1, status: 'Taken', comments: 'Feeling unwell', appliedDate: new Date('2026-03-30'),
        document: { originalName: 'note.jpg', url: '/uploads/sample.jpg' }, documentStatus: 'Pending',
      },
      {
        employee: userMap['EMP-004']._id, employeeName: 'Emily Davis', employeeId: 'EMP-004',
        leaveType: 'Maternity Leave', fromDate: new Date('2026-06-01'), toDate: new Date('2026-09-01'),
        duration: 66, status: 'Approved', comments: 'Maternity leave', appliedDate: new Date('2026-03-15'),
        document: { originalName: null, url: null }, documentStatus: 'None',
      },
      {
        employee: userMap['EMP-011']._id, employeeName: 'William Lee', employeeId: 'EMP-011',
        leaveType: 'Annual Leave', fromDate: new Date('2026-04-15'), toDate: new Date('2026-04-18'),
        duration: 4, status: 'Rejected', comments: 'Travel plans', appliedDate: new Date('2026-03-22'),
        document: { originalName: null, url: null }, documentStatus: 'None',
      },
      {
        employee: userMap['EMP-010']._id, employeeName: 'Jennifer Garcia', employeeId: 'EMP-010',
        leaveType: 'Personal Leave', fromDate: new Date('2026-04-08'), toDate: new Date('2026-04-08'),
        duration: 1, status: 'Cancelled', comments: 'Changed plans', appliedDate: new Date('2026-03-24'),
        document: { originalName: null, url: null }, documentStatus: 'None',
      },
      {
        employee: userMap['EMP-001']._id, employeeName: 'John Smith', employeeId: 'EMP-001',
        leaveType: 'Sick Leave', fromDate: new Date('2026-03-15'), toDate: new Date('2026-03-15'),
        duration: 1, status: 'Taken', comments: 'Flu', appliedDate: new Date('2026-03-15'),
        document: { originalName: 'doc.png', url: '/uploads/sample.png' }, documentStatus: 'Verified',
      },
      {
        employee: userMap['EMP-009']._id, employeeName: 'Robert Thomas', employeeId: 'EMP-009',
        leaveType: 'Annual Leave', fromDate: new Date('2026-04-20'), toDate: new Date('2026-04-25'),
        duration: 4, status: 'Pending', comments: 'Family event', appliedDate: new Date('2026-03-28'),
        document: { originalName: null, url: null }, documentStatus: 'None',
      },
    ];

    const createdLeaves = await Leave.insertMany(leaves);
    console.log(`✅ Seeded ${createdLeaves.length} leave requests`);

    console.log('\n🎉 Database seeded successfully!');
    console.log('\n📋 Login credentials (all passwords: "password123"):');
    console.log('   Admin    → michael.brown@smartleave.com');
    console.log('   Manager  → sarah.johnson@smartleave.com');
    console.log('   Employee → john.smith@smartleave.com\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding error:', error.message);
    process.exit(1);
  }
};

seedDatabase();
