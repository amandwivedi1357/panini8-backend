import Comment from '../models/Comment.js';
import Post from '../models/Post.js';

// Create a new comment
export const createComment = async (req, res) => {
  try {
    const { content, postId, parentId } = req.body;
    
    // Check if post exists
    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }
    
    const comment = new Comment({
      content,
      post: postId,
      author: req.userId,
      parent: parentId || null
    });

    await comment.save();
    
    // Populate author details
    await comment.populate('author', 'username name avatar');

    res.status(201).json({ 
      message: 'Comment added successfully',
      comment
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get comments for a post
export const getCommentsByPost = async (req, res) => {
  try {
    const { postId } = req.params;
    const { page = 1, limit = 20 } = req.query;
    
    const options = {
      page: parseInt(page, 10),
      limit: parseInt(limit, 10),
      sort: { createdAt: -1 }
    };

    const comments = await Comment.find({ post: postId, parent: null })
      .skip((options.page - 1) * options.limit)
      .limit(options.limit)
      .sort(options.sort)
      .populate('author', 'username name avatar')
      .populate({
        path: 'parent',
        populate: { path: 'author', select: 'username name avatar' }
      });

    const total = await Comment.countDocuments({ post: postId, parent: null });

    res.status(200).json({
      comments,
      totalPages: Math.ceil(total / options.limit),
      currentPage: options.page,
      totalComments: total
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update a comment
export const updateComment = async (req, res) => {
  try {
    const { content } = req.body;
    
    const comment = await Comment.findById(req.params.id);
    
    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }

    // Check if user is the author
    if (comment.author.toString() !== req.userId) {
      return res.status(403).json({ message: 'Not authorized to update this comment' });
    }

    comment.content = content;
    await comment.save();
    
    // Populate author details
    await comment.populate('author', 'username name avatar');

    res.status(200).json({ 
      message: 'Comment updated successfully',
      comment
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete a comment
export const deleteComment = async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);
    
    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }

    // Check if user is the author
    if (comment.author.toString() !== req.userId) {
      return res.status(403).json({ message: 'Not authorized to delete this comment' });
    }

    await comment.deleteOne();

    res.status(200).json({ message: 'Comment deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Like a comment
export const likeComment = async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);
    
    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }

    await comment.like(req.userId);

    res.status(200).json({ 
      message: 'Comment liked successfully',
      likesCount: comment.likesCount,
      liked: true
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Unlike a comment
export const unlikeComment = async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);
    
    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }

    await comment.unlike(req.userId);

    res.status(200).json({ 
      message: 'Comment unliked successfully',
      likesCount: comment.likesCount,
      liked: false
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};