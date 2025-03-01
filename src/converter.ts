import fs from 'fs';
import { format } from 'fast-csv';

interface KeeperRecord {
  title?: string;
  $type?: string;
  login?: string;
  password?: string;
  login_url?: string;
}

interface KeeperJson {
  shared_folders?: any[]; // Assuming it's not used
  records: KeeperRecord[];
}

export const jsonToCsv = (jsonPath: string, csvPath: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    fs.readFile(jsonPath, 'utf8', (err, data) => {
      if (err) {
        console.error('❌ Error reading file:', err);
        return reject(err);
      }

      let jsonData: KeeperJson;
      try {
        jsonData = JSON.parse(data);
        console.log('✅ Successfully parsed JSON file');
      } catch (parseError) {
        console.error('❌ Invalid JSON format:', parseError);
        return reject(new Error('Invalid JSON format'));
      }

      if (!jsonData.records || !Array.isArray(jsonData.records)) {
        console.error("❌ Invalid JSON structure: 'records' array missing");
        return reject(new Error("Invalid JSON structure: 'records' array missing"));
      }

      console.log(`✅ Found ${jsonData.records.length} records in JSON file`);

      const csvStream = format({ headers: true });
      const writableStream = fs.createWriteStream(csvPath);

      writableStream.on('finish', () => {
        console.log('✅ Successfully wrote CSV file:', csvPath);
        resolve();
      });
      writableStream.on('error', (err) => {
        console.error('❌ Error writing CSV file:', err);
        reject(err);
      });

      csvStream.pipe(writableStream);

      jsonData.records.forEach((record: KeeperRecord) => {
        csvStream.write({
          title: record.title ?? '',
          type: record.$type ?? '',
          login: record.login ?? '',
          password: record.password ?? '',
          login_url: record.login_url ?? '',
        });
      });

      csvStream.end();
    });
  });
};
