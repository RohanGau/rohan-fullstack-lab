import express from 'express';
import {
  exchangeLegacyToken,
  getCurrentSession,
  loginWithCredentials,
  logoutSession,
  refreshAccessToken,
  validateAuthLogin,
  validateAuthLogout,
  validateAuthRefresh,
  validateAuthTokenExchange,
} from '../controllers/authController';
import { requireAuth } from '../middleware/requireAuth';

const router = express.Router();

// Exchange legacy admin token -> JWT access/refresh pair
router.post('/token', validateAuthTokenExchange, exchangeLegacyToken);

// Username/email + password login
router.post('/login', validateAuthLogin, loginWithCredentials);

// Refresh rotation
router.post('/refresh', validateAuthRefresh, refreshAccessToken);

// Session revocation
router.post('/logout', validateAuthLogout, logoutSession);

// Current session metadata
router.get('/me', requireAuth, getCurrentSession);

export default router;
