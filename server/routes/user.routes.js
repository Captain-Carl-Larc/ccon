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
  getAllUsers,
} = require("../controllers/user.controllers");

// User registration route
router.post('/auth/register', registerUser);

// User login route
router.post('/auth/login', loginUser);

// Get all users route
router.get('/all', AuthMiddleware, getAllUsers);

// Get own profile route
router.get('/profile',AuthMiddleware, getOwnProfile);

// Update profile route
router.put('/profile',AuthMiddleware, updateProfile);

// Follow user route
router.post('/follow/:userId',AuthMiddleware, followUser);

// Get user profile by id
router.get("/profile/:id", AuthMiddleware,getUserProfile);

// Unfollow user route
router.delete('/unfollow/:userId',AuthMiddleware, unfollowUser);

// Export the router
module.exports = router;