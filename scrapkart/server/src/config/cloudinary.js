const cloudinary = require('cloudinary').v2;

let cloudinaryConfigured = false;

const getCloudinaryConfigFromUrl = () => {
  const cloudinaryUrl = process.env.CLOUDINARY_URL;
  if (!cloudinaryUrl) {
    return null;
  }

  try {
    const parsedUrl = new URL(cloudinaryUrl);
    return {
      cloud_name: parsedUrl.hostname,
      api_key: decodeURIComponent(parsedUrl.username),
      api_secret: decodeURIComponent(parsedUrl.password),
    };
  } catch (error) {
    console.error('Invalid CLOUDINARY_URL format. Expected cloudinary://<api_key>:<api_secret>@<cloud_name>');
    return null;
  }
};

const configureCloudinary = () => {
  if (cloudinaryConfigured) {
    return cloudinary;
  }

  const fromUrl = getCloudinaryConfigFromUrl();
  const config = fromUrl || {
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  };

  if (!config.cloud_name || !config.api_key || !config.api_secret) {
    throw new Error('Cloudinary is not configured. Set CLOUDINARY_URL or CLOUDINARY_CLOUD_NAME/CLOUDINARY_API_KEY/CLOUDINARY_API_SECRET');
  }

  cloudinary.config(config);
  cloudinaryConfigured = true;

  return cloudinary;
};

module.exports = {
  configureCloudinary,
};
