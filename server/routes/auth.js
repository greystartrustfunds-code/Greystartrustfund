import express from 'express';
import { signup, login, getProfile } from '../controllers/authController.js';
import { signupValidation, loginValidation } from '../middleware/validation.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.post('/signup', signupValidation, signup);
router.post('/login', loginValidation, login);
router.get('/profile', protect, getProfile);

export default router;