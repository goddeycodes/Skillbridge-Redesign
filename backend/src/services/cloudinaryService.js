// services/cloudinaryService.js
//
// Thin wrapper around Cloudinary for skill/session material uploads.
// Requires the `cloudinary` npm package: npm install cloudinary
//
// Handles video, image, and document uploads with one API — this is the
// main reason Cloudinary over raw S3 for this use case: resource_type
// 'auto' figures out video vs image vs raw file, no separate pipeline per
// file type, and it gives back a ready-to-use secure_url immediately.

const cloudinary = require('cloudinary').v2;

let configured = false;

const init = () => {
  const { CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET } = process.env;
  if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_API_KEY || !CLOUDINARY_API_SECRET) {
    console.warn('Cloudinary disabled — set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET in .env');
    return;
  }
  cloudinary.config({
    cloud_name: CLOUDINARY_CLOUD_NAME,
    api_key:    CLOUDINARY_API_KEY,
    api_secret: CLOUDINARY_API_SECRET,
  });
  configured = true;
};

const isConfigured = () => configured;

const uploadBuffer = (buffer, { folder, resourceType = 'auto' }) =>
  new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder, resource_type: resourceType },
      (err, result) => (err ? reject(err) : resolve(result))
    );
    stream.end(buffer);
  });

/** Best-effort — a failed Cloudinary delete shouldn't block removing our own record of it. */
const destroy = async (publicId, resourceType = 'auto') => {
  try {
    await cloudinary.uploader.destroy(publicId, { resource_type: resourceType });
  } catch (err) {
    console.warn('cloudinaryService.destroy failed (non-fatal):', err.message);
  }
};

module.exports = { init, isConfigured, uploadBuffer, destroy };