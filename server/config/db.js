//imports
const mongoose = require("mongoose");

const connectDb = async (mongoUri) => {
  try {
    await mongoose
      .connect(mongoUri)
      console.log("mongodb connection successful");
      
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};


module.exports= connectDb