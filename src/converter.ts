import fs from 'fs/promises'; // For async file operations
import { createWriteStream } from 'fs'; // For write streams
import { format } from 'fast-csv';

interface KeeperRecord {
  title?: string;
  $type?: string;
  login?: string;
  password?: string;
  login_url?: string;
}

interface KeeperJson {
  shared_folders?: any[];
  records: KeeperRecord[];
}

export const jsonToCsv = async (jsonPath: string, csvPath: string): Promise<void> => {
  try {
    // Read JSON file asynchronously
    const data = await fs.readFile(jsonPath, 'utf8');

    // Parse JSON
    const jsonData: KeeperJson = JSON.parse(data);
    console.log('✅ Successfully parsed JSON file');

    // Ensure valid structure
    if (!jsonData.records || !Array.isArray(jsonData.records)) {
      throw new Error("Invalid JSON structure: 'records' array missing");
    }
    console.log(`✅ Found ${jsonData.records.length} records in JSON file`);

    // Convert JSON to CSV
    const csvStream = format({ headers: true });
    const writableStream = createWriteStream(csvPath); // ✅ Fixed here

    return new Promise((resolve, reject) => {
      writableStream.on('finish', () => {
        console.log('✅ Successfully wrote CSV file:', csvPath);
        resolve();
      });
      writableStream.on('error', (err) => {
        console.error('❌ Error writing CSV file:', err);
        reject(err);
      });

      csvStream.pipe(writableStream);

      jsonData.records.forEach((record) => {
        csvStream.write({
          Title: record.title ?? '',
          Notes: record.$type ?? '',
          Username: record.login ?? '',
          Password: record.password ?? '',
          Website: record.login_url ?? '',
        });
      });

      csvStream.end();
    });
  } catch (error) {
    console.error('❌ Error in jsonToCsv:', error);
    throw error; // Ensures proper error handling in calling functions
  }
};
