import fs from "fs/promises"; // For async file operations
import { createWriteStream } from "fs"; // For write streams
import { format } from "fast-csv";

interface Folder {
  shared_folder: string;
  can_edit: boolean;
  can_share: boolean;
}

interface KeeperRecord {
  title?: string;
  $type?: string;
  login?: string;
  password?: string;
  login_url?: string;
  folders?: Folder[];
}

interface KeeperJson {
  shared_folders?: any[];
  records: KeeperRecord[];
}

export const jsonToCsv = async (jsonPath: string, csvPath: string): Promise<void> => {
  try {
    // Read JSON file asynchronously
    const data = await fs.readFile(jsonPath, "utf8");

    // Parse JSON
    const jsonData: KeeperJson = JSON.parse(data);
    console.log("✅ Successfully parsed JSON file");

    // Ensure valid structure
    if (!jsonData.records || !Array.isArray(jsonData.records)) {
      throw new Error("Invalid JSON structure: 'records' array missing");
    }
    console.log(`✅ Found ${jsonData.records.length} records in JSON file`);

    // Convert JSON to CSV
    const csvStream = format({ headers: true });
    const writableStream = createWriteStream(csvPath);

    return new Promise((resolve, reject) => {
      writableStream.on("finish", () => {
        console.log("✅ Successfully wrote CSV file:", csvPath);
        resolve();
      });
      writableStream.on("error", (err) => {
        console.error("❌ Error writing CSV file:", err);
        reject(err);
      });

      csvStream.pipe(writableStream);

      // Title,Url,Username,Password,OTPAuth,Favorite,Archived,Tags,Notes

      jsonData.records.forEach((record) => {
        csvStream.write({
          Title: record.title ?? "",
          Url: record.login_url ?? "",
          Username: record.login ?? "",
          Password: record.password ?? "",
          OTPAuth: "",
          Favorite: false, // REVIEW Are these needed?
          Archived: false, // REVIEW Are these needed?
          Tags: record.folders?.map((obj) => obj.shared_folder).join(";") ?? "",
          Notes: record.$type ?? "",
        });
      });

      csvStream.end();
    });
  } catch (error) {
    console.error("❌ Error in jsonToCsv:", error);
    throw error;
  }
};
