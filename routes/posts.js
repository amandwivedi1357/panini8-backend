import express from 'express';
import { 
  createPost, 
  getPosts, 
  getPostById, 
  updatePost, 
  deletePost,
  likePost,
  unlikePost,
  getPostsByUser
} from '../controllers/posts.js';
import { auth, optional } from '../middleware/auth.js';

const router = express.Router();

// Public routes with optional auth
router.get('/', optional, getPosts);
router.get('/:id', optional, getPostById);
router.get('/user/:userId', optional, getPostsByUser);

// Protected routes
router.post('/', auth, createPost);
router.put('/:id', auth, updatePost);
router.delete('/:id', auth, deletePost);
router.post('/:id/like', auth, likePost);
router.delete('/:id/like', auth, unlikePost);

export default router;