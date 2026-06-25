import { Router } from "express";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import { upload, gfs, conn, gridFSBucket } from "../gridfsConfig.js";
import { protect } from "../middleware/authMiddleware.js";

dotenv.config();

const router = Router();
router.use(cookieParser());

router.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

router.get("/fetchAllFiles", protect, async (req, res) => {
  try {
    const files = await conn.db.collection("uploads.files").find().toArray();

    const formattedFiles = files.map((file) => ({
      id: file._id,
      filename: file.filename,
      contentType: file.contentType,
      length: file.length,
      uploadDate: file.uploadDate,
      url: `/file/${file.filename}`,
    }));

    res.status(200).json({
      success: true,
      count: formattedFiles.length,
      data: formattedFiles,
    });
  } catch (error) {
    console.error("❌ Error fetching files:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch files",
      error: error.message,
    });
  }
});

const deleteFileFromGridFS = async (fileUrl) => {
  try {
    if (!fileUrl) {
      throw new Error("File URL is required");
    }

    const fileName = fileUrl.split("/file/").pop();
    if (!fileName) {
      throw new Error("Invalid file URL format");
    }

    const file = await conn.db
      .collection("uploads.files")
      .findOne({ filename: fileName });

    if (!file) {
      console.warn(`⚠ File not found in GridFS: ${fileName}`);
      return { success: false, message: "File not found" };
    }

    await gridFSBucket.delete(file._id);

    console.log(`✅ Deleted file: ${fileName}`);
    return { success: true, message: "File deleted successfully" };
  } catch (error) {
    console.error("❌ Error deleting file:", error);
    return { success: false, message: "Failed to delete file", error };
  }
};

router.post("/uploadProfilePic", upload.single("profilePic"), (req, res) => {
  if (!req.file) {
    console.error("No file uploaded");
    return res.status(400).json({ error: "No file uploaded" });
  }

  console.log("File uploaded successfully:", req.file);
  res.json({
    message: "File uploaded successfully",
    fileUrl: `/file/${req.file.filename}`,
    // fileId: req.file.id,
  });
});

router.post("/uploadFile", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "No file uploaded" });

    const fileData = {
      fileName: req.file.filename,
      fileUrl: `/file/${req.file.filename}`,
    };

    res.status(200).json(fileData);
  } catch (error) {
    console.error("File upload error:", error);
    res.status(500).json({ error: "File upload failed" });
  }
});

router.delete("/deletefile", protect, async (req, res) => {
  const { fileUrl } = req.body;

  if (!fileUrl) {
    return res.status(400).json({ message: "File URL is required" });
  }

  const result = await deleteFileFromGridFS(fileUrl);
  res.status(result.success ? 200 : 500).json(result);
});

router.get("/file/:filename", async (req, res) => {
  try {
    const file = await gfs.find({ filename: req.params.filename }).toArray();
    if (!file || file.length === 0)
      return res.status(404).json({ error: "File not found" });

    gfs.openDownloadStreamByName(req.params.filename).pipe(res);
  } catch (error) {
    console.error("❌ Error retrieving file:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

export default router;

export { deleteFileFromGridFS };
