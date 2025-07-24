const Post = require("../models/post.model");
const User = require("../models/user.model");

// Create a new post
const createPost = async (req, res) => {
  try {
    const { contentType } = req.body;
    const userId = req.user.id; // Assuming user ID is stored in req.user after authentication

    // Validate content type
    if (!["text", "image", "video", "reel"].includes(contentType)) {
      return res.status(400).json({ message: "Invalid content type" });
    }

    // Validate content based on type
    let postData = { user: userId, contentType };
    if (contentType === "text") {
      postData.text = req.body.text;
      if (!content || content.length > 2000) {
        return res
          .status(400)
          .json({
            message:
              "Text content is required and cannot exceed 2000 characters",
          });
      }
    } else if (contentType === "image") {
      postData.imageUrls = req.body.imageUrls;
      if (
        !Array.isArray(content) ||
        content.length === 0 ||
        !content.every((url) => /^https?:\/\/.+\.(jpg|jpeg|png|gif)$/.test(url))
      ) {
        return res
          .status(400)
          .json({ message: "Image URLs are required and must be valid" });
      }
    } else if (contentType === "video") {
      postData.videoUrl = req.body.videoUrl;
      if (!content || !/^https?:\/\/.+\.(mp4|webm|ogg)$/.test(content)) {
        return res
          .status(400)
          .json({ message: "Video URL is required and must be valid" });
      }
    } else if (contentType === "reel") {
      postData.reelUrl = req.body.reelUrl;
      if (!content || !/^https?:\/\/.+\.(mp4|webm|ogg)$/.test(content)) {
        return res
          .status(400)
          .json({ message: "Reel URL is required and must be valid" });
      }
    } else {
      return res.status(400).json({ message: "Invalid content type" });
    }

    const newPost = new Post({
      content,
      user: userId,
    });

    await newPost.save();
    res.status(201).json(newPost);
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
    res.status(200).json(posts);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching posts", error: error.message });
  }
};

//export the controller functions
module.exports = {
    createPost,
  seeAllPosts,
};
