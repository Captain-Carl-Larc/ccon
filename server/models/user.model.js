const mongoose = require("mongoose");
const bcryptjs = require('bcryptjs')
const Schema = mongoose.Schema; // Destructure Schema for cleaner code

const UserSchema = new Schema(
  {
    email: {
      type: String,
      required: [true, "Email is required"], // Custom error message
      unique: true,
      trim: true, // Removes whitespace from both ends of a string
      lowercase: true, // Stores the email in lowercase
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        "Please fill a valid email address",
      ], // Basic email regex validation
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [6, "Password must be at least 6 characters long"], // Minimum password length
      // Note: Password hashing will be done BEFORE saving to the database,
      // typically in a pre-save hook or service.
    },
    username: {
      type: String,
      required: [true, "Username is required"],
      unique: true,
      trim: true,
      minlength: [3, "Username must be at least 3 characters long"],
    },
    fullName: {
      type: String,
      trim: true,
    },
    university: {
      type: String,
      trim: true,
    },
    course: {
      type: String,
      trim: true,
    },
    yearOfStudy: {
      type: String, // Storing as String allows for flexible inputs like 'First Year', 'Sophomore', 'Final Year', 'PhD'
      trim: true,
    },
    profilePicture: {
      type: String, // Store as URL string
      validate: {
        validator: function (v) {
          return /^(https?|ftp):\/\/[^\s/$.?#].[^\s]*$/.test(v); // Basic URL validation
        },
        message: (props) =>
          `${props.value} is not a valid URL for profile picture!`,
      },
    },
    coverPhoto: {
      type: String, // Store as URL string
      validate: {
        validator: function (v) {
          return /^(https?|ftp):\/\/[^\s/$.?#].[^\s]*$/.test(v); // Basic URL validation
        },
        message: (props) =>
          `${props.value} is not a valid URL for cover photo!`,
      },
    },
    bio: {
      type: String,
      maxlength: [500, "Bio cannot be more than 500 characters"], // Limit bio length
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    role: {
      type: String,
      enum: ["student", "admin", "moderator"], // Only these values are allowed
      default: "student",
    },
    followers: [
      {
        type: Schema.Types.ObjectId,
        ref: "User", // References the 'User' model itself
      },
    ],
    following: [
      {
        type: Schema.Types.ObjectId,
        ref: "User", // References the 'User' model itself
      },
    ],
  },
  {
    timestamps: true, // Adds createdAt and updatedAt fields automatically
  }
);


//presave hook
UserSchema.pre("save", async function (next) {
  if (this.isModified("password")) {
    try {
      const salt = await bcryptjs.genSalt(10); // Generate a salt
      this.password = await bcryptjs.hash(this.password, salt); // Hash the password
      next(); // Proceed to save the user
    } catch (error) {
      next(error); // Pass any error to the next middleware
    }
  } else {
    next(); // If password is not modified, just proceed
  }
});

// Method to compare passwords
UserSchema.methods.comparePassword = async function (enteredPassword) {
  try {
    return await bcryptjs.compare(enteredPassword, this.password); // Compare the candidate password with the hashed password
  } catch (error) {
    throw new Error("Password comparison failed"); // Handle any errors during comparison
  }
};
// Export the model
module.exports = mongoose.model("User", UserSchema);
