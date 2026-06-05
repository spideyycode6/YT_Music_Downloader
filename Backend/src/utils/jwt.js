import jwt from 'jsonwebtoken';
import config from '../config/config.js';

export const createAccessToken = (user) => jwt.sign(
  { id: user._id, email: user.email, name: user.name },
  config.jwtSecret,
  { expiresIn: config.jwtExpiresIn }
);

export const createRefreshToken = (user) => jwt.sign(
  { id: user._id },
  config.refreshTokenSecret,
  { expiresIn: config.refreshTokenExpiresIn }
);

export const verifyAccessToken = (token) => jwt.verify(token, config.jwtSecret);

export const verifyRefreshToken = (token) => jwt.verify(token, config.refreshTokenSecret);
