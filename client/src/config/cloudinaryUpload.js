export const uploadToCloudinary = async (file, options = {}) => {
  const {
    folder = 'uploads',
    resourceType = 'auto',
    uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET,
    onProgress = null,
    quality = 'auto:good',
    fetchFormat = 'auto', 
  } = options;

  const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;

  if (!cloudName) {
    throw new Error('Cloudinary cloud name is not configured');
  }

  if (!uploadPreset) {
    throw new Error('Cloudinary upload preset is not configured');
  }

  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', uploadPreset);
  formData.append('folder', folder);
  
  if (resourceType === 'image') {
    formData.append('quality', quality);
    formData.append('fetch_format', fetchFormat);
    formData.append('transformation', 'q_auto,f_auto');
  }

  try {
    const xhr = new XMLHttpRequest();
    const url = `https://api.cloudinary.com/v1_1/${cloudName}/${resourceType}/upload`;

    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        xhr.abort();
        reject(new Error('Upload timeout - file may be too large'));
      }, 300000);

      if (onProgress) {
        xhr.upload.addEventListener('progress', (e) => {
          if (e.lengthComputable) {
            const percentComplete = (e.loaded / e.total) * 100;
            onProgress(Math.round(percentComplete));
          }
        });
      }

      xhr.addEventListener('load', () => {
        clearTimeout(timeout);
        if (xhr.status === 200) {
          const response = JSON.parse(xhr.responseText);
          resolve({
            success: true,
            url: response.secure_url,
            publicId: response.public_id,
            format: response.format,
            resourceType: response.resource_type,
            bytes: response.bytes,
            createdAt: response.created_at,
          });
        } else {
          reject(new Error(`Upload failed with status: ${xhr.status}`));
        }
      });

      xhr.addEventListener('error', () => {
        clearTimeout(timeout);
        reject(new Error('Network error during upload'));
      });

      xhr.addEventListener('abort', () => {
        clearTimeout(timeout);
        reject(new Error('Upload was aborted'));
      });

      xhr.open('POST', url);
      xhr.send(formData);
    });
  } catch (error) {
    throw new Error(`Cloudinary upload failed: ${error.message}`);
  }
};

export const uploadCSVToCloudinary = async (csvFile, onProgress = null) => {
  return uploadToCloudinary(csvFile, {
    folder: 'csvFiles',
    resourceType: 'raw',
    onProgress,
  });
};

export const uploadImageToCloudinary = async (imageFile, onProgress = null) => {
  return uploadToCloudinary(imageFile, {
    folder: 'questionImages',
    resourceType: 'image',
    onProgress,
    quality: 'auto:good',
    fetchFormat: 'auto',
  });
};

export const uploadMultipleToCloudinary = async (files, options = {}) => {
  const { concurrency = 3 } = options; 
  const fileArray = Array.from(files);
  const results = [];
  
  for (let i = 0; i < fileArray.length; i += concurrency) {
    const batch = fileArray.slice(i, i + concurrency);
    const batchPromises = batch.map(file => 
      uploadToCloudinary(file, options)
    );
    
    const batchResults = await Promise.allSettled(batchPromises);
    results.push(...batchResults);
  }
  
  return results
    .filter(result => result.status === 'fulfilled')
    .map(result => result.value);
};

export const compressAndUploadImage = async (imageFile, onProgress = null) => {
  if (imageFile.size > 1024 * 1024) {
    try {
      const compressedFile = await compressImage(imageFile);
      return uploadImageToCloudinary(compressedFile, onProgress);
    } catch (error) {
      console.warn('Compression failed, uploading original:', error);
      return uploadImageToCloudinary(imageFile, onProgress);
    }
  }
  
  return uploadImageToCloudinary(imageFile, onProgress);
};

const compressImage = (file, maxWidth = 1920, maxHeight = 1080, quality = 0.8) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      const img = new Image();
      
      img.onload = () => {
        const canvas = document.createElement('canvas');
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
        
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        
        canvas.toBlob(
          (blob) => {
            if (blob) {
              const compressedFile = new File([blob], file.name, {
                type: 'image/jpeg',
                lastModified: Date.now(),
              });
              resolve(compressedFile);
            } else {
              reject(new Error('Canvas to Blob conversion failed'));
            }
          },
          'image/jpeg',
          quality
        );
      };
      
      img.onerror = () => reject(new Error('Image load failed'));
      img.src = e.target.result;
    };
    
    reader.onerror = () => reject(new Error('File read failed'));
    reader.readAsDataURL(file);
  });
};