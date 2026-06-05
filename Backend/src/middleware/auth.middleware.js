import jwt from 'jsonwebtoken';
import config from '../config/config.js';
import UserModel from '../model/user.model.js';

const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization || '';
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;

    if (!token) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const decoded = jwt.verify(token, config.jwtSecret);
    const user = await UserModel.findById(decoded.id).select('-password -refreshToken');

    if (!user) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ success: false, message: 'Invalid or expired token' });
  }
};

export default authMiddleware;
