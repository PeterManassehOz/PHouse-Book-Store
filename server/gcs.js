// gcs.js
const { Storage } = require('@google-cloud/storage');

let credentials;
try {
  credentials = JSON.parse(process.env.GOOGLE_CLOUD_KEYFILE_JSON);
} catch (err) {
  console.error("❌ GOOGLE_CLOUD_KEYFILE_JSON is not set or is invalid.");
  process.exit(1);
}

const storage = new Storage({
  projectId: process.env.GOOGLE_PROJECT_ID,
  credentials,
});

const bucket = storage.bucket(process.env.GOOGLE_STORAGE_BUCKET);

module.exports = bucket;
