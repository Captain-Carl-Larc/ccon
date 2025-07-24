const express = require("express");
const router = express.Router();
const AuthMiddleware = require("../middleware/auth.middleware"); // Assuming you have an auth middleware for protected routes
const adminAuthMiddleware = require("../middleware/admin.auth.middleware"); // Middleware for admin access

const {
  createPost,
  deletePost,
  getPostsOfUserById,
  seeAllPosts,
  getOwnPosts,
  getSinglePost,
} = require("../controllers/blog.controllers");

// Route to create a new post (protected route)
router.post("/create", AuthMiddleware, createPost);

// Route to see all posts (public route)
router.get("/all", seeAllPosts);

// Route to get posts of the logged-in user (protected route)
router.get("/own", AuthMiddleware, getOwnPosts);

// Route to get posts of a user by ID (private route)
router.get("/user/:id", AuthMiddleware, getPostsOfUserById);

// Route to get a single post by ID (private route)
router.get("/post/:id", AuthMiddleware, getSinglePost);

// Route to delete a post (protected route, admin access)
router.delete("/delete/:id", AuthMiddleware, adminAuthMiddleware, deletePost);
// Export the router
module.exports = router;
