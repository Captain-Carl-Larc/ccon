const mongoose = require("mongoose");
const Post = require("../models/post.model");
const User = require("../models/user.model");

// Create a new post
const createPost = async (req, res) => {
  try {
    // Extract  content type from request body
    const { contentType } = req.body;
    const userId = req.user._id; // Assuming user ID is stored in req.user after authentication

    // Validate content type
    if (!["text", "image", "video", "reel"].includes(contentType)) {
      return res.status(400).json({ message: "Invalid content type" });
    }

    // Validate content based on type
    let postData = { user: userId, contentType };
    if (contentType === "text") {
      const textContent = req.body.text;

      if (
        !textContent ||
        textContent.length > 2000 ||
        typeof textContent !== "string"
      ) {
        return res.status(400).json({
          message: "Text content is required and cannot exceed 2000 characters",
        });
      }
      postData.text = textContent;
    } else if (contentType === "image") {
      const imageUrls = req.body.imageUrls;
      if (
        !Array.isArray(imageUrls) ||
        imageUrls.length === 0 ||
        !imageUrls.every((url) =>
          /^https?:\/\/.+\.(jpg|jpeg|png|gif)$/.test(url)
        )
      ) {
        return res
          .status(400)
          .json({ message: "Image URLs are required and must be valid" });
      }
      postData.imageUrls = imageUrls;
    } else if (contentType === "video") {
      const videoUrl = req.body.videoUrl;
      if (!videoUrl || !/^https?:\/\/.+\.(mp4|webm|ogg)$/.test(videoUrl)) {
        return res
          .status(400)
          .json({ message: "Video URL is required and must be valid" });
      }
      postData.videoUrl = videoUrl;
    } else if (contentType === "reel") {
      const reelContent = req.body.reelUrl;
      if (
        !reelContent ||
        !/^https?:\/\/.+\.(mp4|webm|ogg)$/.test(reelContent)
      ) {
        return res
          .status(400)
          .json({ message: "Reel URL is required and must be valid" });
      }
      postData.videoUrl = reelContent;
    } else {
      return res.status(400).json({ message: "Invalid content type" });
    }

    const newPost = new Post(postData);

    await newPost.save();
    res.status(201).json(newPost);

    // Optionally, you can also update the user's posts array if needed
    await User.findByIdAndUpdate(
      userId,
      { $push: { posts: newPost._id } },
      { new: true }
    );
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error creating post", error: error.message });
  }
};

//see all posts
const seeAllPosts = async (req, res) => {
  try {
    const posts = await Post.find()
      .populate("user", "username profilePicture")
      .sort({ createdAt: -1 });

    // Check if posts are found
    if (!posts || posts.length === 0) {
      return res.status(404).json({ message: "No posts found" });
    }
    res.status(200).json(posts);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching posts", error: error.message });
  }
};

//GET POSTS OF A USER WHO IS LOGGED IN
const getOwnPosts = async (req, res) => {
  try {
    const userId = req.user._id; // Assuming user ID is stored in req.user after authentication

    if (!userId) {
      return res.status(400).json({ message: "User ID is required" });
    }

    const posts = await Post.find({ user: userId })
      .populate("user", "username profilePicture")
      .sort({ createdAt: -1 });

    // Check if posts are found
    if (!posts || posts.length === 0) {
      return res.status(404).json({ message: "No posts found for this user" });
    }
    res.status(200).json(posts);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching user's posts", error: error.message });
  }
};

//GET USER POSTS BY ID
const getPostsOfUserById = async (req, res) => {
  const userId = req.params.id; // Get user ID from request parameters

  //validate id presence
  if (!userId.trim()) {
    return res.status(400).json({ message: "User ID is required" });
  }
  //validate id type
  if (!mongoose.Types.ObjectId.isValid(userId)) {
    return res.status(400).json({ message: "Invalid user ID" });
  }

  try {
    const posts = await Post.find({ user: userId })
      .populate("user", "username profilePicture")
      .sort({ createdAt: -1 });

    // Check if posts are found
    if (!posts || posts.length === 0) {
      return res.status(404).json({ message: "No posts found for this user" });
    }

    res.status(200).json(posts);
  } catch (error) {
    console.error("Error fetching user's posts:", error);
    res
      .status(500)
      .json({ message: "Error fetching user's posts", error: error.message });
  }
};

//GET POST BY ITS ID
const getSinglePost = async (req, res) => {
  const postId = req.params.id; // Get post ID from request parameters

  if (!postId.trim()) {
    return res.status(400).json({ message: "Post ID is required" });
  }
  //validate id type
  if (!mongoose.Types.ObjectId.isValid(postId)) {
    return res.status(400).json({ message: "Invalid post ID" });
  }

  try {
    const post = await Post.findById(postId)
      .populate("user", "username profilePicture")
      .populate("comments.user", "username profilePicture")
      .sort({ createdAt: -1 });

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    res.status(200).json(post);
  } catch (error) {
    console.error("Error fetching post:", error);
    res
      .status(500)
      .json({ message: "Error fetching post", error: error.message });
  }
};

//LIKE POST
// const likePost = async(req,res)=>{
//     const postId = req.params.id; // Get post ID from request parameters
//     const userId = req.user._id; // Assuming user ID is stored in req.user after authentication

//     if(!postId.trim()) {
//       return res.status(400).json({ message: "Post ID is required" });
//     }
//     //validate id type
//     if(!mongoose.Types.ObjectId.isValid(postId)){
//         return res.status(400).json({message:"Invalid post ID"})
//     }

//     try {
//         const post = await Post.findById(postId);
//         if (!post) {
//             return res.status(404).json({ message: "Post not found" });
//         }

//         // Check if the user has already liked the post
//         if (post.likes.includes(userId)) {
//             return res.status(400).json({ message: "You have already liked this post" });
//         }

//         // Add the user's ID to the likes array
//         post.likes.push(userId);
//         await post.save();

//         res.status(200).json({ message: "Post liked successfully", post });
//     } catch (error) {
//         console.error("Error liking post:", error);
//         res.status(500).json({ message: "Error liking post", error: error.message });
//     }
// }

//ADMIN DELETE POST
const deletePost = async (req, res) => {
  const postId = req.params.id; // Get post ID from request parameters
  if (!postId.trim()) {
    return res.status(400).json({ message: "Post ID is required" });
  }
  //validate id type
  if (!mongoose.Types.ObjectId.isValid(postId)) {
    return res.status(400).json({ message: "Invalid post ID" });
  }

  try {
    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    const deletedPost = await Post.findByIdAndDelete(postId);
    if (!deletedPost) {
      return res
        .status(404)
        .json({ message: "Post not found or already deleted" });
    }
    res
      .status(200)
      .json({ message: "Post deleted successfully", post: deletedPost });
  } catch (error) {
    console.error("Error deleting post:", error);
    res
      .status(500)
      .json({ message: "Error deleting post", error: error.message });
  }
};
//export the controller functions
module.exports = {
  createPost,
  seeAllPosts,
  getOwnPosts,
  getPostsOfUserById,
  getSinglePost,
  deletePost,
};
