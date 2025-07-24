const express = require('express');
const router = express.Router();
const AuthMiddleware = require('../middleware/auth.middleware'); // Assuming you have an auth middleware for protected routes
// Import user controllers
const {
  registerUser,
  loginUser,
  getOwnProfile,
  updateProfile,
  followUser,
  getUserProfile,
  unfollowUser,
} = require("../controllers/user.controllers");

// User registration route
router.post('/auth/register', registerUser);

// User login route
router.post('/auth/login', loginUser);


// Get own profile route
router.get('/profile',AuthMiddleware, getOwnProfile);

// Update profile route
router.put('/profile',AuthMiddleware, updateProfile);

// Follow user route
router.post('/follow/:userId', followUser);

// Get user profile by username
router.get("/profile/:userId", getUserProfile);

// Unfollow user route
router.delete('/unfollow/:userId', unfollowUser);

// Export the router
module.exports = router;