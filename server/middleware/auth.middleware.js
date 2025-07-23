//import json web token authentication middleware
const jwt = require("jsonwebtoken");
const User = require("../models/user.model");

// Middleware to authenticate user using JWT
const authMiddleware = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const token = authHeader.slice(7); // Remove "Bearer " prefix
  // Variables from environment
  const JWT_SECRET = process.env.JWT_SECRET;
  const JWT_EXPIRATION = process.env.JWT_EXPIRATION || "1h";

  if (!token) {
    return res
      .status(401)
      .json({ message: "Access denied. No token provided." });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = await User.findById(decoded.id).select("-password");
    if (!req.user) {
      return res.status(404).json({ message: "User not found." });
    }
    next();
  } catch (error) {
    console.error("Authentication error:", error);
    res.status(400).json({ message: "Invalid token." });
  }
};

module.exports = authMiddleware;
// This middleware can be used in routes to protect endpoints
// Example usage in a route file:
// const authMiddleware = require("../middleware/auth.middleware");
// router.get("/protected-route", authMiddleware, (req, res) => {
//   res.json({ message: "This is a protected route", user: req.user });
// });
// Ensure to add the JWT_SECRET and JWT_EXPIRATION in your .env file
// JWT_SECRET=your_jwt_secret_key
// JWT_EXPIRATION=1h // Optional, default is 1 hour
// You can adjust the expiration time as needed
// Make sure to install the jsonwebtoken package: npm install jsonwebtoken