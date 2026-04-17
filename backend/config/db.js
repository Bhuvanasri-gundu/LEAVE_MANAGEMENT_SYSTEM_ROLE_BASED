const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });
    console.log(`✅ MongoDB Connected Successfully`);
    console.log(`   Host: ${conn.connection.host}`);
    console.log(`   Database: ${conn.connection.name}\n`);
    return conn;
  } catch (error) {
    console.error(`❌ MongoDB Connection Error: ${error.message}`);
    if (error.name === 'MongoServerSelectionError') {
      console.error("   → Unable to reach MongoDB server. Check your MONGO_URI and internet connection.");
    } else if (error.name === 'MongoAuthenticationError') {
      console.error("   → Authentication failed. Check your username and password.");
    }
    process.exit(1);
  }
};

module.exports = connectDB;