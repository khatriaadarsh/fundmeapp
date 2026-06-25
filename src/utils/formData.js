// src/utils/formData.js
//
// Helper to build FormData for React Native multipart uploads.
// Skips null/undefined fields automatically.
// Detects RN file objects (with .uri) and formats them properly.

export const buildFormData = (fields) => {
  const fd = new FormData();

  Object.entries(fields).forEach(([key, value]) => {
    if (value === null || value === undefined || value === '') return;

    // React Native file: { uri, type, name }
    if (typeof value === 'object' && value.uri) {
      fd.append(key, {
        uri:  value.uri,
        type: value.type || 'image/jpeg',
        name: value.name || `file_${Date.now()}.jpg`,
      });
      return;
    }

    fd.append(key, String(value));
  });

  return fd;
};

/** Convert a picked image URI into an RN file object. */
export const fileFromUri = (uri, name) => {
  if (!uri) return null;
  const ext  = (uri.split('.').pop() || 'jpg').toLowerCase();
  const type = ext === 'png' ? 'image/png' : 'image/jpeg';
  return { uri, type, name: name || `upload_${Date.now()}.${ext}` };
};