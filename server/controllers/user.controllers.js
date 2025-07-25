const { default: mongoose } = require("mongoose");
const User = require("../models/user.model");
const bcryptjs = require("bcryptjs");
const jwt = require("jsonwebtoken");

// Import necessary controllers
const registerUser = async (req, res) => {
  const { username, email, password } = req.body;

  // Validate input
  if (!username || !email || !password) {
    return res.status(400).json({ message: "All fields are required" });
  }

  // Check if the user already exists
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return res.status(400).json({ message: "User already exists" });
  }

  //attempt to create a new user
  try {
    const newUser = new User({
      username,
      email,
      password, // Password will be hashed in the pre-save hook
    });

    await newUser.save();
     const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET, {
       expiresIn: "1h",
     });
    res.status(201).json({
      message: "User registered successfully",
      user: {
        id: newUser._id,
        username: newUser.username,
        email: newUser.email,
        token: token, // Placeholder for token, implement JWT or session logic as needed
      },
    });
    //generate a token or perform any other post-registration logic here
  } catch (error) {
    console.error("Error registering user:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

//go ahead and login
//login logic
const loginUser = async (req, res) => {
  const { email, password } = req.body;

  // Validate input
  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required" });
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
    // Generate a token after successful login
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });
    res.status(200).json({
      message: "Login successful",
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        token: token, // Placeholder for token, implement JWT or session logic as needed
      },
    });
  } catch (error) {
    console.error("Error logging in user:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
//ADMIN CONTROLLER TO GET ALL USERS
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password"); // Exclude password from the response
    if (users.length === 0) {
      return res.status(404).json({ message: "No users found" });
    }
    // Return the list of users
    
    res.status(200).json(users);
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
//GET USER PROFILE
const getOwnProfile = async (req, res) => {
  const userId = req.user._id;

  if (!userId) {
    return res.status(400).json({ message: "User ID is required" });
  }

  if (!mongoose.Types.ObjectId.isValid(userId)) {
    return res.status(400).json({ message: "Invalid User ID" });
  }

  try {
    const user = await User.findById(userId)
      .select("-password") // Exclude password from the response
      .populate("followers following", "username email") // Populate followers and following with username and email
      .exec();
      if(!user) {
        return res.status(404).json({ message: "User not found" });
      }
    res.status(200).json({
      message: "User profile fetched successfully",
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        fullName: user.fullName,
        university: user.university,
        course: user.course,
        bio: user.bio,
        role: user.role,
        isVerified: user.isVerified,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
        followers: user.followers,
        following: user.following,
        profilePicture: user.profilePicture,
        coverPhoto: user.coverPhoto,
        followersCount: user.followers.length,
        followingCount: user.following.length,
      },
    });
  } catch (error) {
    console.error("Error fetching user profile:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

//update user profile
const updateProfile = async (req, res) => {
  const userId = req.user._id;

  if (!userId) {
    return res.status(400).json({ message: "User ID is required" });
  }

  if (!mongoose.Types.ObjectId.isValid(userId)) {
    return res.status(400).json({ message: "Invalid User ID" });
  }

  try {
    const { fullName, university, course, bio ,role,email,username,password} = req.body;

    //check email and username
    const existingUser = await User.find({ $or: [{ email }, { username }] });
    if (existingUser.length > 0) {
      //check if the email and username belongs to current user
      const isCurrentUser = existingUser.some(
        (user) => user._id.toString() === userId.toString()
      );
      if (!isCurrentUser) {
        return res.status(400).json({
          message: "Email or username already exists",
        });
      }
    }

    // perform update
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { fullName, university, course, bio,role, email, username, password }, // Password will be hashed in the pre-save hook
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
};

//get a user's profile
const getUserProfile = async (req, res) => {
  const userId = req.params.id;

  if (!userId) {
    return res.status(400).json({ message: "User ID is required" });
  }

  if (!mongoose.Types.ObjectId.isValid(userId)) {
    return res.status(400).json({ message: "Invalid User ID" });
  }

  try {
    const user = await User.findById(userId)
      .select("-password") // Exclude password from the response
      .populate("followers following", "username email fullName") // Populate followers and following with username and email
      .exec();

      // Check if user exists
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Return user profile data
    res.status(200).json({
      id: user._id,
      username: user.username,
      email: user.email,
      fullname: user.fullName,
      university: user.university,
      course: user.course,
      bio: user.bio,
      profilePicture: user.profilePicture,
      coverPhoto: user.coverPhoto,
      followersCount: user.followers.length,
      followingCount: user.following.length,
    });
  } catch (error) {
    console.error("Error fetching user profile:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

//follow user
const followUser = async (req, res) => {
  const userIdToFollow = req.params.userId;
  const currentUserId = req.user.id; // Assuming you have user ID from auth middleware


  //check if userIdToFollow and currentUserId are provided
  if (!userIdToFollow || !currentUserId) {
    return res.status(400).json({ message: "User ID is required" });
  }
  //check the id
  if (!mongoose.Types.ObjectId.isValid(userIdToFollow)) {
    res.status(400).json({
      message: `${userIdToFollow} is an invalid id.`,
    });
  }
  if (!mongoose.Types.ObjectId.isValid(currentUserId)) {
    res.status(400).json({
      message: `${currentUserId} is an invalid id.`,
    });
  }

  //check if the user is trying to follow themselves
  if (userIdToFollow === currentUserId) {
    return res.status(400).json({ message: "You cannot follow yourself" });
  }

  //try catch block to handle errors
  try {
    //get existing values of the user
    const currentUser = await User.findById(currentUserId);
    const userToFollow = await User.findById(userIdToFollow);

    //see if both users exist
    if (!currentUser || !userToFollow) {
      return res.status(404).json({ message: "User not found" });
    }

    //check if the user is already following
    if (currentUser.following.includes(userIdToFollow)) {
      return res
        .status(400)
        .json({ message: "You are already following this user" });
    }

    //add the user to the following list
    currentUser.following.push(userIdToFollow);
    userToFollow.followers.push(currentUserId);
    await currentUser.save();
    await userToFollow.save();
    res.status(200).json({
      message: `You are now following ${userToFollow.username}`,
      followingCount: currentUser.following.length,
      followersCount: userToFollow.followers.length,
    });
  } catch (error) {
    console.error("Error following user:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

//unfollow user
const unfollowUser = async (req, res) => {
  const userIdToUnfollow = req.params.userId;
  const currentUserId = req.user._id; // Assuming you have user ID from auth middleware

  //check the id
  if (!mongoose.Types.ObjectId.isValid(userIdToUnfollow)) {
    return res.status(400).json({
      message: `${userIdToUnfollow} is an invalid id.`,
    });
  }
  if (!mongoose.Types.ObjectId.isValid(currentUserId)) {
    return res.status(400).json({
      message: `${currentUserId} is an invalid id.`,
    });
  }

  //check if the user is trying to unfollow themselves
  if (userIdToUnfollow === currentUserId) {
    return res.status(400).json({ message: "You cannot unfollow yourself" });
  }
  //try catch block to handle errors
  try {
    //get existing values of the user
    const currentUser = await User.findById(currentUserId);
    const userToUnfollow = await User.findById(userIdToUnfollow);
    //see if both users exist
    if (!currentUser || !userToUnfollow) {
      return res.status(404).json({ message: "User not found" });
    }

    //check if the user is already following
    if (!currentUser.following.includes(userIdToUnfollow)) {
      return res
        .status(400)
        .json({ message: "You are not following this user" });
    }
    //remove the user from the following list
    currentUser.following.pull(userIdToUnfollow);
    userToUnfollow.followers.pull(currentUserId);
    await currentUser.save();
    await userToUnfollow.save();
    res.status(200).json({
      message: `You have unfollowed ${userToUnfollow.username}`,
      followingCount: currentUser.following.length,
      followersCount: userToUnfollow.followers.length,
    });
  } catch (error) {
    console.error("Error unfollowing user:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = {
  registerUser,
  loginUser,
  getOwnProfile,
  updateProfile,
  followUser,
  getUserProfile,
  unfollowUser,
  getAllUsers,
};
