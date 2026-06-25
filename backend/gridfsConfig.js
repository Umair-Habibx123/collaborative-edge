// gridFs.js
import mongoose from "mongoose";
import { GridFSBucket } from "mongodb";
import { GridFsStorage } from "multer-gridfs-storage";
import multer from "multer";
import dotenv from "dotenv";

dotenv.config();

const mongoURI = process.env.MONGO_URI;
const conn = mongoose.createConnection(mongoURI);

let gfs, gridFSBucket;
conn.once("open", () => {
  gridFSBucket = new GridFSBucket(conn.db, {
    bucketName: "uploads",
  });
  gfs = gridFSBucket;
  console.log("MongoDB connected and GridFS initialized");
});

const storage = new GridFsStorage({
  url: mongoURI,
  file: (req, file) => {
    return {
      filename: `${Date.now()}-${file.originalname}`,
      bucketName: "uploads", 
    };
  },
});

const upload = multer({ storage });

export { upload, gfs, conn, gridFSBucket }; // Export the connection as well