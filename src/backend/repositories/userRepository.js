import { connectDB } from "@/backend/database/connectDB";
import User from "@/backend/models/User";

export async function findUserByEmail(email, options = {}) {
  await connectDB();
  const query = User.findOne({ email: email.toLowerCase().trim() });
  
  if (options.includePassword) {
    query.select("+password");
  }
  
  return query.lean().exec();
}

export async function findUserById(userId, options = {}) {
  await connectDB();
  const query = User.findById(userId);
  
  if (options.includePassword) {
    query.select("+password");
  }
  
  return query.lean().exec();
}

export async function createUser(data) {
  await connectDB();
  const user = new User(data);
  await user.save();
  
  // Return plain object without password
  const userObj = user.toObject();
  delete userObj.password;
  return userObj;
}

export async function updateUserById(userId, data) {
  await connectDB();
  return User.findByIdAndUpdate(userId, data, { new: true }).lean().exec();
}
