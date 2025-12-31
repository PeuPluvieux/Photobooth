/**
 * Template Uploader Module
 * Handles file upload, validation, and image processing for custom templates
 */

const TemplateUploader = (function() {
    const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
    const ALLOWED_TYPES = ['image/png'];
    const RECOMMENDED_WIDTH = 1080;
    const RECOMMENDED_HEIGHT = 1920;
    const MIN_DIMENSION = 500;
    const MAX_DIMENSION = 4000;

    /**
     * Validate uploaded file
     * @param {File} file - File object from input
     * @throws {Error} If validation fails
     * @returns {boolean} True if valid
     */
    function validateFile(file) {
        if (!file) {
            throw new Error('No file selected');
        }

        // Check file type
        if (!ALLOWED_TYPES.includes(file.type)) {
            throw new Error('Only PNG files are allowed. Please convert your image to PNG format.');
        }

        // Check file size
        if (file.size > MAX_FILE_SIZE) {
            const sizeMB = (file.size / (1024 * 1024)).toFixed(2);
            throw new Error(`File is too large (${sizeMB}MB). Maximum size is 5MB.`);
        }

        return true;
    }

    /**
     * Load image from file
     * @param {File} file - File object
     * @returns {Promise<Object>} Object with image, dataUrl, width, height
     */
    function loadImage(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();

            reader.onload = (e) => {
                const img = new Image();

                img.onload = () => {
                    // Validate dimensions
                    if (img.width < MIN_DIMENSION || img.height < MIN_DIMENSION) {
                        reject(new Error(`Image is too small (${img.width}x${img.height}). Minimum size is ${MIN_DIMENSION}x${MIN_DIMENSION} pixels.`));
                        return;
                    }

                    if (img.width > MAX_DIMENSION || img.height > MAX_DIMENSION) {
                        reject(new Error(`Image is too large (${img.width}x${img.height}). Maximum size is ${MAX_DIMENSION}x${MAX_DIMENSION} pixels.`));
                        return;
                    }

                    resolve({
                        image: img,
                        dataUrl: e.target.result,
                        width: img.width,
                        height: img.height,
                        aspectRatio: img.width / img.height
                    });
                };

                img.onerror = () => {
                    reject(new Error('Invalid or corrupt image file. Please try another image.'));
                };

                img.src = e.target.result;
            };

            reader.onerror = () => {
                reject(new Error('Failed to read file. Please try again.'));
            };

            reader.readAsDataURL(file);
        });
    }

    /**
     * Process file upload (validate + load)
     * @param {File} file - File object
     * @returns {Promise<Object>} Processed image data
     */
    async function processUpload(file) {
        // Validate file
        validateFile(file);

        // Load and validate image
        const imageData = await loadImage(file);

        // Add recommendations
        imageData.isRecommendedSize = (
            imageData.width === RECOMMENDED_WIDTH &&
            imageData.height === RECOMMENDED_HEIGHT
        );

        imageData.sizeWarning = null;
        if (imageData.width < RECOMMENDED_WIDTH || imageData.height < RECOMMENDED_HEIGHT) {
            imageData.sizeWarning = `Image is smaller than recommended Instagram Story size (${RECOMMENDED_WIDTH}x${RECOMMENDED_HEIGHT}). Photos may appear pixelated.`;
        } else if (imageData.width > RECOMMENDED_WIDTH * 2 || imageData.height > RECOMMENDED_HEIGHT * 2) {
            imageData.sizeWarning = `Image is very large. Consider using ${RECOMMENDED_WIDTH}x${RECOMMENDED_HEIGHT} for optimal performance.`;
        }

        return imageData;
    }

    /**
     * Get file size in human-readable format
     * @param {number} bytes - File size in bytes
     * @returns {string} Formatted size string
     */
    function formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';

        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));

        return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
    }

    /**
     * Create thumbnail from image
     * @param {Image} img - Image element
     * @param {number} maxWidth - Maximum thumbnail width
     * @param {number} maxHeight - Maximum thumbnail height
     * @returns {string} Thumbnail data URL
     */
    function createThumbnail(img, maxWidth = 200, maxHeight = 200) {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        // Calculate thumbnail dimensions maintaining aspect ratio
        let width = img.width;
        let height = img.height;

        if (width > height) {
            if (width > maxWidth) {
                height = (height * maxWidth) / width;
                width = maxWidth;
            }
        } else {
            if (height > maxHeight) {
                width = (width * maxHeight) / height;
                height = maxHeight;
            }
        }

        canvas.width = width;
        canvas.height = height;

        ctx.drawImage(img, 0, 0, width, height);

        return canvas.toDataURL('image/png');
    }

    /**
     * Compress image if needed
     * @param {Image} img - Image element
     * @param {number} maxWidth - Maximum width
     * @param {number} maxHeight - Maximum height
     * @returns {string} Compressed image data URL
     */
    function compressImage(img, maxWidth = RECOMMENDED_WIDTH, maxHeight = RECOMMENDED_HEIGHT) {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        let width = img.width;
        let height = img.height;

        // Only compress if larger than max dimensions
        if (width > maxWidth || height > maxHeight) {
            const aspectRatio = width / height;

            if (width > height) {
                width = maxWidth;
                height = width / aspectRatio;
            } else {
                height = maxHeight;
                width = height * aspectRatio;
            }
        }

        canvas.width = width;
        canvas.height = height;

        ctx.drawImage(img, 0, 0, width, height);

        return canvas.toDataURL('image/png', 0.9);
    }

    /**
     * Check if image has transparency
     * @param {Image} img - Image element
     * @returns {Promise<boolean>} True if image has transparency
     */
    function hasTransparency(img) {
        return new Promise((resolve) => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');

            canvas.width = img.width;
            canvas.height = img.height;

            ctx.drawImage(img, 0, 0);

            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            const data = imageData.data;

            // Check alpha channel
            for (let i = 3; i < data.length; i += 4) {
                if (data[i] < 255) {
                    resolve(true);
                    return;
                }
            }

            resolve(false);
        });
    }

    /**
     * Public API
     */
    return {
        processUpload,
        validateFile,
        loadImage,
        formatFileSize,
        createThumbnail,
        compressImage,
        hasTransparency,
        MAX_FILE_SIZE,
        ALLOWED_TYPES,
        RECOMMENDED_WIDTH,
        RECOMMENDED_HEIGHT
    };
})();
