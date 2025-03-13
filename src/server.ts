import express from "express";
import { jsonToCsv } from "./converter";
import fs from "fs";
import multer from "multer";

const app = express();
const PORT = 3000;

// Configure multer for file uploads
const upload = multer({ dest: "uploads/" });

// Serve frontend files
app.use(express.static("public"));

// File upload endpoint
app.post("/upload", upload.single("file"), async (req, res): Promise<void> => {
  if (!req.file) {
    res.status(400).json({ error: "No file uploaded" });
    return;
  }

  const jsonFilePath = req.file.path; // JSON file path (without extension)
  const csvFilePath = `${jsonFilePath}.csv`; // Output CSV file

  try {
    await jsonToCsv(jsonFilePath, csvFilePath);

    // Send the file for download
    res.download(csvFilePath, "converted.csv", (err) => {
      if (err) {
        console.error("❌ Error during file download:", err);
      }

      // Safely delete files after the download completes
      try {
        if (fs.existsSync(jsonFilePath)) {
          fs.unlinkSync(jsonFilePath); // Delete original JSON file
        }
        if (fs.existsSync(csvFilePath)) {
          fs.unlinkSync(csvFilePath); // Delete CSV file
        }
        console.log("✅ Successfully deleted temporary files");
      } catch (deleteError) {
        console.error("❌ Error deleting files:", deleteError);
      }
    });
  } catch (error) {
    console.error("❌ Conversion failed:", error);
    res.status(500).json({ error: "Conversion failed" });
  }
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
