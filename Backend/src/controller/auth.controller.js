import bcrypt from 'bcryptjs';
import UserModel from '../model/user.model.js';
import { createAccessToken, createRefreshToken, verifyRefreshToken } from '../utils/jwt.js';

const setRefreshCookie = (res, token) => {
  res.cookie('refreshToken', token, {
    httpOnly: true,
    sameSite: 'none',
    secure: true,
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
};

export const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Name, email and password are required' });
    }

    const existing = await UserModel.findOne({ email });
    if (existing) {
      return res.status(409).json({ success: false, message: 'Email already registered' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await UserModel.create({ name, email, password: hashedPassword });

    const accessToken = createAccessToken(user);
    const refreshToken = createRefreshToken(user);
    user.refreshToken = refreshToken;
    await user.save();

    setRefreshCookie(res, refreshToken);

    return res.status(201).json({
      success: true,
      message: 'User registered successfully',
      user: { id: user._id, name: user.name, email: user.email },
      accessToken,
    });
  } catch {
    return res.status(500).json({ success: false, message: 'Registration failed' });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required' });
    }

    const user = await UserModel.findOne({ email });
    if (!user || !user.password) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const accessToken = createAccessToken(user);
    const refreshToken = createRefreshToken(user);
    user.refreshToken = refreshToken;
    await user.save();

    setRefreshCookie(res, refreshToken);

    return res.status(200).json({
      success: true,
      message: 'Login successful',
      user: { id: user._id, name: user.name, email: user.email },
      accessToken,
    });
  } catch {
    return res.status(500).json({ success: false, message: 'Login failed' });
  }
};

export const refresh = async (req, res) => {
  try {
    const refreshToken = req.cookies.refreshToken || req.body.refreshToken;
    if (!refreshToken) {
      return res.status(401).json({ success: false, message: 'Refresh token is required' });
    }

    const decoded = verifyRefreshToken(refreshToken);
    const user = await UserModel.findById(decoded.id);
    if (!user || user.refreshToken !== refreshToken) {
      return res.status(401).json({ success: false, message: 'Invalid refresh token' });
    }

    const accessToken = createAccessToken(user);
    return res.status(200).json({ success: true, accessToken });
  } catch (error) {
    return res.status(401).json({ success: false, message: 'Invalid or expired refresh token' });
  }
};

export const me = async (req, res) => {
  return res.status(200).json({ success: true, user: req.user });
};

export const logout = async (req, res) => {
  try {
    const refreshToken = req.cookies.refreshToken;
    if (refreshToken) {
      try {
        const decoded = verifyRefreshToken(refreshToken);
        await UserModel.findByIdAndUpdate(decoded.id, { refreshToken: '' });
      } catch {
        // ignore invalid refresh token and still clear cookie
      }
    }

    res.clearCookie('refreshToken');
    return res.status(200).json({ success: true, message: 'Logged out successfully' });
  } catch (error) {
    res.clearCookie('refreshToken');
    return res.status(200).json({ success: true, message: 'Logged out successfully' });
  }
};
