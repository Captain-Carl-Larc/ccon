const { default: mongoose } = require("mongoose");
const User = require("../models/user.model");

// Import necessary controllers
const registerUser = async (req, res) => {
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
    res.status(201).json({
      message: "User registered successfully",
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
  }
};

//login logic
const loginUser = async (req, res) => {
  const { email, password } = req.body;

  // Validate input
  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required" });
  }

  //go ahead and login
  //login logic
  const loginUser = async (req, res) => {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email and password are required" });
    }

    //goa head and login
    try {
      const user = await User.findOne({ email });
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      const isMatch = await user.comparePassword(password);
      if (!isMatch) {
        return res.status(401).json({ message: "Invalid credentials" });
      }
      // Generate a token or perform any other post-login logic here
      res.status(200).json({
        message: "Login successful",
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          token: null, // Placeholder for token, implement JWT or session logic as needed
        },
      });
    } catch (error) {
      console.error("Error logging in user:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  };
};

//GET USER PROFILE
const getUserProfile = async (req, res) => {
  const userId = req.params.id;

  if(!userId) {
    return res.status(400).json({ message: "User ID is required" });
  }

  if(!mongoose.Types.ObjectId.isValid(userId)) {
    return res.status(400).json({ message: "Invalid User ID" });
  }

  try {
    const user = await User.findById(userId)
      .select("-password") // Exclude password from the response
      .populate("followers following", "username email") // Populate followers and following with username and email
      .exec();
  } catch (error) {
    console.error("Error fetching user profile:", error);
    res.status(500).json({ message: "Internal server error" });
    
  }}

  //update user profile
  const updateProfile = async (req,res)=>{
    const userId = req.params.userId

    if(!userId) {
      return res.status(400).json({ message: "User ID is required" });
    }

    if(!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: "Invalid User ID" });
    }

    try {
        const { fullName, university, course, bio } = req.body;

        // perform update
        const updatedUser = await User.findByIdAndUpdate(
          userId,
          { fullName, university, course, bio },
          { new: true, runValidators: true }
        ).select("-password"); // Exclude password from the response

        res.status(200).json({
          message: "User profile updated successfully",
          user: {
            id: updatedUser._id,
            username: updatedUser.username,
            email: updatedUser.email,
            fullName: updatedUser.fullName,
            university: updatedUser.university,
            course: updatedUser.course,
            bio: updatedUser.bio,
          },
        });
    } catch (error) {
      console.error("Error updating user profile:", error);
      res.status(500).json({ message: "Internal server error" });
        
    }
  }

module.exports = { registerUser, loginUser, getUserProfile, updateProfile };
