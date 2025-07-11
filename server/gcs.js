// gcs.js
// ──────────────────────────────────────────────────────────────────────────────
const { Storage } = require('@google-cloud/storage');
const path = require('path');
const fs = require('fs');

// If you opted to store the key JSON in an env var, write it out on startup:
if (process.env.GOOGLE_CLOUD_KEYFILE_JSON) {
  const keyPath = path.join(__dirname, 'gcp-keyfile.json');
  fs.writeFileSync(keyPath, process.env.GOOGLE_CLOUD_KEYFILE_JSON, 'utf8');
  process.env.GOOGLE_CLOUD_KEYFILE = keyPath;
}

const storage = new Storage({
  projectId: process.env.GOOGLE_PROJECT_ID,
  keyFilename: process.env.GOOGLE_CLOUD_KEYFILE,
});

const bucket = storage.bucket(process.env.GOOGLE_STORAGE_BUCKET);

module.exports = bucket;
