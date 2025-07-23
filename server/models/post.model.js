const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// --- Embedded Comment Schema ---
// This schema will be used for documents embedded directly within the Post document.
const CommentSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User", // References the User model
      required: true,
    },
    text: {
      type: String,
      required: [true, "Comment text is required"],
      trim: true,
      maxlength: [500, "Comment cannot be more than 500 characters"],
    },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt for each comment
  }
);

// --- Main Post Schema ---
const PostSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User", // References the User model (the author of the post)
      required: [true, "User (author) is required for the post"],
    },
    contentType: {
      type: String,
      enum: ["text", "image", "video", "reel"], // Allowed content types
      required: [true, "Content type is required"],
    },
    text: {
      type: String,
      trim: true,
      maxlength: [2000, "Post text cannot exceed 2000 characters"], // Example limit
    },
    imageUrls: [
      {
        type: String,
        validate: {
          validator: function (v) {
            return /^(https?|ftp):\/\/[^\s/$.?#].[^\s]*$/.test(v); // Basic URL validation
          },
          message: (props) => `${props.value} is not a valid URL for an image!`,
        },
      },
    ],
    videoUrl: {
      type: String,
      validate: {
        validator: function (v) {
          return /^(https?|ftp):\/\/[^\s/$.?#].[^\s]*$/.test(v); // Basic URL validation
        },
        message: (props) => `${props.value} is not a valid URL for a video!`,
      },
    },
    likes: [
      {
        type: Schema.Types.ObjectId,
        ref: "User", // Users who liked this post
      },
    ],
    // likesCount and commentsCount are 'derived/redundant' as you mentioned.
    // They can be maintained efficiently using Mongoose middleware (pre/post save/update)
    // or by simply calculating array lengths on retrieval if performance is not a critical concern
    // for every single read. For very high-traffic applications, maintaining them explicitly
    // and updating them atomically in the database can be beneficial.
    likesCount: {
      type: Number,
      default: 0,
    },
    comments: [CommentSchema], // Embeds the CommentSchema directly
    commentsCount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt fields for the Post document
  }
);

// --- Mongoose Middleware for likesCount and commentsCount (Optional but Recommended) ---
// This ensures that likesCount and commentsCount are always in sync with the array lengths.
// You might want to adjust this based on your specific update logic (e.g., if you
// use $push/$pull directly, you might need pre/post hooks for those as well).

// Post-save hook to update counts when likes/comments array changes (for simplicity here)
// For robust, real-time updates, you might trigger these on $push/$pull operations
// directly or in a dedicated service/controller logic.
PostSchema.pre("save", function (next) {
  if (this.isModified("likes")) {
    this.likesCount = this.likes.length;
  }
  if (this.isModified("comments")) {
    this.commentsCount = this.comments.length;
  }
  next();
});

// Alternatively, you can have a separate function to update these counts
// and call it whenever likes or comments are added/removed.

// Export the Post model
module.exports = mongoose.model("Post", PostSchema);
