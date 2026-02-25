import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { storage } from "../config/firebase";

export const uploadToFirebase = async (file, options = {}) => {
  const {
    folder = "uploads",
    onProgress = null,
  } = options;

  if (!file) throw new Error("No file provided");

  const timestamp = Date.now();
  const sanitizedName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
  const filePath = `${folder}/${timestamp}_${sanitizedName}`;
  const storageRef = ref(storage, filePath);

  return new Promise((resolve, reject) => {
    const uploadTask = uploadBytesResumable(storageRef, file);

    const timeout = setTimeout(() => {
      uploadTask.cancel();
      reject(new Error("Upload timeout - file may be too large"));
    }, 300000);

    uploadTask.on(
      "state_changed",
      (snapshot) => {
        if (onProgress) {
          const percentComplete = Math.round(
            (snapshot.bytesTransferred / snapshot.totalBytes) * 100
          );
          onProgress(percentComplete);
        }
      },
      (error) => {
        clearTimeout(timeout);
        switch (error.code) {
          case "storage/canceled":
            reject(new Error("Upload was aborted"));
            break;
          case "storage/unauthorized":
            reject(new Error("Unauthorized - check Firebase Storage rules"));
            break;
          default:
            reject(new Error(`Upload failed: ${error.message}`));
        }
      },
      async () => {
        clearTimeout(timeout);
        try {
          const url = await getDownloadURL(uploadTask.snapshot.ref);
          resolve({
            success: true,
            url,
            publicId: filePath,
            format: file.name.split(".").pop(),
            resourceType: file.type.split("/")[0],
            bytes: file.size,
            createdAt: new Date().toISOString(),
          });
        } catch (error) {
          reject(new Error(`Failed to get download URL: ${error.message}`));
        }
      }
    );
  });
};

export const uploadCSVToFirebase = async (csvFile, onProgress = null) => {
  return uploadToFirebase(csvFile, {
    folder: "csvFiles",
    onProgress,
  });
};

export const uploadImageToFirebase = async (imageFile, onProgress = null) => {
  return uploadToFirebase(imageFile, {
    folder: "questionImages",
    onProgress,
  });
};

export const uploadMultipleToFirebase = async (files, options = {}) => {
  const { concurrency = 3 } = options;
  const fileArray = Array.from(files);
  const results = [];

  for (let i = 0; i < fileArray.length; i += concurrency) {
    const batch = fileArray.slice(i, i + concurrency);
    const batchPromises = batch.map((file) => uploadToFirebase(file, options));
    const batchResults = await Promise.allSettled(batchPromises);
    results.push(...batchResults);
  }

  return results
    .filter((result) => result.status === "fulfilled")
    .map((result) => result.value);
};

export const compressAndUploadImage = async (imageFile, onProgress = null) => {
  if (imageFile.size > 1024 * 1024) {
    try {
      const compressedFile = await compressImage(imageFile);
      return uploadImageToFirebase(compressedFile, onProgress);
    } catch (error) {
      console.warn("Compression failed, uploading original:", error);
      return uploadImageToFirebase(imageFile, onProgress);
    }
  }
  return uploadImageToFirebase(imageFile, onProgress);
};

const compressImage = (file, maxWidth = 1920, maxHeight = 1080, quality = 0.8) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      const img = new Image();

      img.onload = () => {
        const canvas = document.createElement("canvas");
        let { width, height } = img;

        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }
        if (height > maxHeight) {
          width = (width * maxHeight) / height;
          height = maxHeight;
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            if (blob) {
              const compressedFile = new File([blob], file.name, {
                type: "image/jpeg",
                lastModified: Date.now(),
              });
              resolve(compressedFile);
            } else {
              reject(new Error("Canvas to Blob conversion failed"));
            }
          },
          "image/jpeg",
          quality
        );
      };

      img.onerror = () => reject(new Error("Image load failed"));
      img.src = e.target.result;
    };

    reader.onerror = () => reject(new Error("File read failed"));
    reader.readAsDataURL(file);
  });
};