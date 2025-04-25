import express from 'express';
import { 
  register, 
  login, 
  getCurrentUser, 
  updateProfile,
  getUserById
} from '../controllers/users.js';
import { auth } from '../middleware/auth.js';

const router = express.Router();


// Protected routes
router.get('/me', auth, getCurrentUser);
router.put('/me', auth, updateProfile);
// Public routes
router.post('/register', register);
router.post('/login', login);
router.get('/:id', getUserById);

export default router;