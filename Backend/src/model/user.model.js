import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, default: '' },
  googleId: { type: String, default: '' },
  avatar: { type: String, default: '' },
  refreshToken: { type: String, default: '' },
}, { timestamps: true });

const UserModel = mongoose.model('User', userSchema);

export default UserModel;
