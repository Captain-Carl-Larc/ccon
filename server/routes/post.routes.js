const express = require('express');
const router = express.Router();
const AuthMiddleware = require('../middleware/auth.middleware'); // Assuming you have an auth middleware for protected routes
const adminAuthMiddleware = require('../middleware/admin.auth.middleware'); // Middleware for admin access

const {
  createPost,
  seeAllPosts,
} = require('../controllers/blog.controllers');

// Route to create a new post (protected route)
router.post('/create', AuthMiddleware, createPost);

// Route to see all posts (public route)
router.get('/all', seeAllPosts);



// Export the router
module.exports = router;