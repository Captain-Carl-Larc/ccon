const User = require("../models/user.model");
const jwt = require("jsonwebtoken");


const adminAuthMiddleware = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const token = authHeader.slice(7); // Remove "Bearer " prefix
  const JWT_SECRET = process.env.JWT_SECRET;

  if (!token) {
    return res.status(401).json({ message: "Access denied. No token provided." });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(decoded.id).select("-password");
// Check if user exists
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    // Check if the user has admin role
    if (user.role !== "admin") {
      return res.status(403).json({ message: "Forbidden: Admin access required." });
    }

    req.user = user; // Attach user to request object
    next();
  } catch (error) {
    console.error("Authentication error:", error);
    res.status(400).json({ message: "Invalid token." });
  }
}

module.exports = adminAuthMiddleware;