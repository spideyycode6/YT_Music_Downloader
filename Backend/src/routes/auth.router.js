import { Router } from 'express';
import passport from '../config/passport.js';
import { login, logout, me, refresh, register } from '../controller/auth.controller.js';
import authMiddleware from '../middleware/auth.middleware.js';

const router = Router();

 
/**
 * @routes
 * @description Register a new user
 * @access Public
 * @body {string} name - The name of the user
 * @body {string} email - The email of the user
 * @body {string} password - The password of the user
 * @returns {object} 201 - User registered successfully
 * @returns {object} 400 - Invalid request body
 * @returns {object} 409 - Email already registered
 * @route /api/auth/register
 */
router.post('/register', register);

/**
 * @routes
 * @route /api/auth/login
 * @description Login a user
 * @access Public
 * @body {string} email - The email of the user
 * @body {string} password - The password of the user
 * @returns {object} 200 - Login successful
 * @returns {object} 400 - Invalid request body
 * @returns {object} 401 - Invalid credentials
 */
router.post('/login', login);

/**
 * @routes
 * @description Refresh a token
 * @access Public
 * @returns {object} 200 - Token refreshed successfully
 * @returns {object} 401 - Invalid or expired token
 */
router.post('/refresh', refresh);

/**
 * @routes
 * @description Get the current user
 * @access Private
 * @returns {object} 200 - User retrieved successfully
 * @returns {object} 401 - Unauthorized
 */
router.get('/me', authMiddleware, me);

/**
 * @routes
 * @description Logout a user
 * @access Private
 * @returns {object} 200 - Logout successful
 * @returns {object} 401 - Unauthorized
 */
router.post('/logout', logout);

/**
 * @routes
 * @description Google OAuth login
 * @access Public
 * @returns {object} 200 - Google OAuth login successful
 * @returns {object} 401 - Unauthorized

/**
 * @routes
 * @description Google OAuth callback
 * @access Public
 * @returns {object} 200 - Google OAuth callback successful
 * @returns {object} 401 - Unauthorized
 */
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
router.get('/google/callback', passport.authenticate('google', { failureRedirect: '/login' }), (req, res) => {
  res.json({ success: true, message: 'Google OAuth login successful', user: req.user });
});

export default router;
