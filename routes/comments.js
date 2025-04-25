import express from 'express';
import { 
  createComment, 
  getCommentsByPost, 
  updateComment, 
  deleteComment,
  likeComment,
  unlikeComment
} from '../controllers/comments.js';
import { auth, optional } from '../middleware/auth.js';

const router = express.Router();

// Public routes with optional auth
router.get('/post/:postId', optional, getCommentsByPost);

// Protected routes
router.post('/', auth, createComment);
router.put('/:id', auth, updateComment);
router.delete('/:id', auth, deleteComment);
router.post('/:id/like', auth, likeComment);
router.delete('/:id/like', auth, unlikeComment);

export default router;