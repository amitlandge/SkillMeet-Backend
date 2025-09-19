import cloudinary from "cloudinary";

export const uploadImageToCloudinary = async (fileBuffer) => {
  return new Promise((resolve, reject) => {
    cloudinary.v2.uploader
      .upload_stream({ resource_type: "image" }, (error, result) => {
        if (error) reject(error);
        else resolve(result);
      })
      .end(fileBuffer);
  });
};
