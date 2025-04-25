import Post from '../models/Post.js';

// Create a new post
export const createPost = async (req, res) => {
  try {
    const { title, content, tags, coverImage } = req.body;
    
    const post = new Post({
      title,
      content,
      tags: tags || [],
      coverImage,
      author: req.userId
    });

    await post.save();

    // Populate author details
    await post.populate('author', 'username name avatar');

    res.status(201).json({ 
      message: 'Post created successfully',
      post
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all posts with pagination
export const getPosts = async (req, res) => {
  try {
    const { page = 1, limit = 10, tag } = req.query;
    
    const query = tag ? { tags: tag } : {};
    
    const options = {
      page: parseInt(page, 10),
      limit: parseInt(limit, 10),
      sort: { createdAt: -1 },
      populate: { path: 'author', select: 'username name avatar' }
    };

    const posts = await Post.find(query)
      .skip((options.page - 1) * options.limit)
      .limit(options.limit)
      .sort(options.sort)
      .populate(options.populate);

    const total = await Post.countDocuments(query);

    res.status(200).json({
      posts,
      totalPages: Math.ceil(total / options.limit),
      currentPage: options.page,
      totalPosts: total
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get a single post by ID
export const getPostById = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id)
      .populate('author', 'username name avatar')
      .populate({
        path: 'comments',
        options: { sort: { createdAt: -1 } },
        populate: { path: 'author', select: 'username name avatar' }
      });

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    res.status(200).json({ post });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update a post
export const updatePost = async (req, res) => {
  try {
    const { title, content, tags, coverImage } = req.body;
    
    const post = await Post.findById(req.params.id);
    
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    // Check if user is the author
    if (post.author.toString() !== req.userId) {
      return res.status(403).json({ message: 'Not authorized to update this post' });
    }

    // Update fields
    if (title) post.title = title;
    if (content) post.content = content;
    if (tags) post.tags = tags;
    if (coverImage) post.coverImage = coverImage;

    await post.save();
    await post.populate('author', 'username name avatar');

    res.status(200).json({ 
      message: 'Post updated successfully',
      post 
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete a post
export const deletePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    // Check if user is the author
    if (post.author.toString() !== req.userId) {
      return res.status(403).json({ message: 'Not authorized to delete this post' });
    }

    await post.deleteOne();

    res.status(200).json({ message: 'Post deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Like a post
export const likePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    await post.like(req.userId);

    res.status(200).json({ 
      message: 'Post liked successfully',
      likesCount: post.likesCount,
      liked: true
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Unlike a post
export const unlikePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    await post.unlike(req.userId);

    res.status(200).json({ 
      message: 'Post unliked successfully',
      likesCount: post.likesCount,
      liked: false
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get posts by user ID
export const getPostsByUser = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    
    const options = {
      page: parseInt(page, 10),
      limit: parseInt(limit, 10),
      sort: { createdAt: -1 },
      populate: { path: 'author', select: 'username name avatar' }
    };

    const posts = await Post.find({ author: req.params.userId })
      .skip((options.page - 1) * options.limit)
      .limit(options.limit)
      .sort(options.sort)
      .populate(options.populate);

    const total = await Post.countDocuments({ author: req.params.userId });

    res.status(200).json({
      posts,
      totalPages: Math.ceil(total / options.limit),
      currentPage: options.page,
      totalPosts: total
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};