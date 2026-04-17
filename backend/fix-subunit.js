/**
 * Fix missing subUnit for existing users
 * Sets subUnit to department if it exists, otherwise defaults to 'Engineering'
 */

const mongoose = require('mongoose');
require('dotenv').config();

// Connect to DB
const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/smartleave-dev';

const User = require('./models/User');
const Leave = require('./models/Leave');

async function fixSubUnit() {
  try {
    console.log('🔧 Connecting to MongoDB...');
    await mongoose.connect(uri);
    console.log('✅ Connected to MongoDB');

    // Fix Users - ensure all have subUnit
    console.log('\n📝 Fixing User subUnit field...');
    const updateUsersResult = await User.updateMany(
      { subUnit: { $exists: false } },
      [
        {
          $set: {
            subUnit: {
              $cond: [
                { $ne: ['$department', ''] },
                '$department',
                'Engineering'
              ]
            }
          }
        }
      ],
      { updatePipeline: true }
    );
    console.log(`✅ Updated ${updateUsersResult.modifiedCount} users`);

    // Also set default for empty subUnit
    const emptySubUnitResult = await User.updateMany(
      { $or: [{ subUnit: '' }, { subUnit: null }] },
      { $set: { subUnit: 'Engineering' } }
    );
    console.log(`✅ Set default subUnit for ${emptySubUnitResult.modifiedCount} users`);

    // Fix Leaves - populate subUnit from employee's subUnit
    console.log('\n📝 Fixing Leave subUnit field...');
    const users = await User.find();
    
    for (const user of users) {
      await Leave.updateMany(
        { employee: user._id, subUnit: { $in: [null, ''] } },
        { $set: { subUnit: user.subUnit || user.department || 'Engineering' } }
      );
    }

    const allLeaves = await Leave.find();
    const leavesWithoutSubUnit = allLeaves.filter(l => !l.subUnit);
    console.log(`✅ Fixed ${allLeaves.length - leavesWithoutSubUnit.length} leaves`);

    if (leavesWithoutSubUnit.length > 0) {
      console.log(`⚠️  ${leavesWithoutSubUnit.length} leaves still missing subUnit - setting to Engineering`);
      await Leave.updateMany(
        { subUnit: { $in: [null, ''] } },
        { $set: { subUnit: 'Engineering' } }
      );
    }

    console.log('\n✅ All fixes completed!');
    
    const userStats = await User.countDocuments();
    const leaveStats = await Leave.countDocuments();
    console.log(`📊 Database stats:`);
    console.log(`   - Users: ${userStats}`);
    console.log(`   - Leaves: ${leaveStats}`);

    process.exit(0);
  } catch (err) {
    console.error('❌ Error:', err.message);
    process.exit(1);
  }
}

fixSubUnit();
