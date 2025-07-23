const User = require('../models/user.model');

// Import necessary controllers
const registerUser = async (req,res) => {
    const { username, email, password } = req.body;

// Validate input
if (!username || !email || !password) {
    return res.status(400).json({ message: "All fields are required" });
  }

  //attempt to create a new user
  try {
    const newUser = new User({
      username,
      email,
      password, // Password will be hashed in the pre-save hook
    });

    await newUser.save();
    res.status(201).json({ message: "User registered successfully" ,
        user: {
            id: newUser._id,
            username: newUser.username,
            email: newUser.email,
        },
    });
    //generate a token or perform any other post-registration logic here
  } catch (error) {
    console.error("Error registering user:", error);
    res.status(500).json({ message: "Internal server error" }); 
}}






module.exports = {registerUser};