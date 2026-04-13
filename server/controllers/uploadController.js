const asyncHandler = require("express-async-handler");
const streamifier = require("streamifier");

const { cloudinary } = require("../config/cloudinary");
const { apiSuccess } = require("../utils/apiResponse");

const uploadToCloudinary = asyncHandler(async (req, res) => {
  if (!req.file) {
    res.status(400);
    throw new Error("No file uploaded");
  }
  if (!cloudinary?.config) {
    res.status(500);
    throw new Error("Cloudinary is not configured");
  }

  const result = await new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: "resolvr", resource_type: "auto" },
      (error, uploadResult) => {
        if (error) reject(error);
        else resolve(uploadResult);
      }
    );
    streamifier.createReadStream(req.file.buffer).pipe(stream);
  });

  return apiSuccess(res, {
    statusCode: 201,
    data: { url: result.secure_url, filename: req.file.originalname },
    message: "Uploaded",
  });
});

module.exports = { uploadToCloudinary };

