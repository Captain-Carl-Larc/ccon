//imports
const express = require("express");
const dotenv = require("dotenv");
const connectDb = require("./config/db"); // Assuming './config/db.js' contains your connectDb function

// Load environment variables from .env file
dotenv.config();

// Initialize express app
const app = express();

// Middleware to parse JSON request bodies
app.use(express.json());

// Variables from environment
const PORT = process.env.PORT || 5000; // Provide a default port in case PORT is not set
const mongoUri = process.env.MONGO_URI;

// --- Best Practice: Connect to DB first, then start server ---
const startServer = async () => {
  try {
    // Ensure mongoUri is defined before attempting to connect
    if (!mongoUri) {
      console.error(
        "Error: MONGO_URI is not defined in environment variables."
      );
      process.exit(1); // Exit if critical variable is missing
    }

    // Attempt to connect to the database
    await connectDb(mongoUri);
    console.log("Database connection successful. Starting server...");

    // Only start the server if the database connection is successful
    app.listen(PORT, () => {
      console.log(`app running at port ${PORT}`)
    });
  } catch (error) {
    // Catch any errors during database connection or server startup
    console.error(`Server startup error: ${error.message}`);
    process.exit(1); // Exit the process if server fails to start
  }
};

// Call the function to start the server
startServer();


