/**
 * Canvas Module
 * Handles photo compositing with template overlays
 */

const CanvasCompositor = (function() {
    // Default dimensions (portrait)
    const OUTPUT_WIDTH = 1200;
    const OUTPUT_HEIGHT = 1600;
    const STRIP_WIDTH = 600;
    const STRIP_HEIGHT = 1800;

    // Landscape dimensions
    const LANDSCAPE_WIDTH = 1600;
    const LANDSCAPE_HEIGHT = 1200;
    const LANDSCAPE_STRIP_WIDTH = 1800;
    const LANDSCAPE_STRIP_HEIGHT = 600;

    // Design decorations (emoji positions and content)
    const designDecorations = {
        none: [],
        hearts: [
            { emoji: '💕', pos: 'top-left' },
            { emoji: '❤️', pos: 'top-right' },
            { emoji: '💗', pos: 'bottom-left' },
            { emoji: '💖', pos: 'bottom-right' }
        ],
        stars: [
            { emoji: '✨', pos: 'top-left' },
            { emoji: '⭐', pos: 'top-right' },
            { emoji: '🌟', pos: 'bottom-left' },
            { emoji: '💫', pos: 'bottom-right' },
            { emoji: '✧', pos: 'top-center' }
        ],
        party: [
            { emoji: '🎉', pos: 'top-left' },
            { emoji: '🎊', pos: 'top-right' },
            { emoji: '🎈', pos: 'bottom-left' },
            { emoji: '🥳', pos: 'bottom-right' }
        ],
        birthday: [
            { emoji: '🎂', pos: 'top-center' },
            { emoji: '🎈', pos: 'bottom-left' },
            { emoji: '🎁', pos: 'bottom-right' }
        ],
        wedding: [
            { emoji: '💒', pos: 'top-center' },
            { emoji: '💍', pos: 'bottom-left' },
            { emoji: '💐', pos: 'bottom-right' }
        ],
        christmas: [
            { emoji: '🎄', pos: 'top-left' },
            { emoji: '🎅', pos: 'top-right' },
            { emoji: '⛄', pos: 'bottom-left' },
            { emoji: '🎁', pos: 'bottom-right' }
        ],
        halloween: [
            { emoji: '🎃', pos: 'top-left' },
            { emoji: '👻', pos: 'top-right' },
            { emoji: '🦇', pos: 'bottom-left' },
            { emoji: '💀', pos: 'bottom-right' }
        ],
        floral: [
            { emoji: '🌸', pos: 'top-left' },
            { emoji: '🌺', pos: 'top-right' },
            { emoji: '🌷', pos: 'bottom-left' },
            { emoji: '🌹', pos: 'bottom-right' }
        ],
        vintage: [
            { emoji: '📷', pos: 'bottom-center' }
        ],
        gradient: [],
        minimal: []
    };

    /**
     * Composite single photo with template frame
     */
    function composite(videoElement, template, isMirrored) {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        canvas.width = OUTPUT_WIDTH;
        canvas.height = OUTPUT_HEIGHT;

        // Calculate photo area based on template
        const photoArea = calculatePhotoArea(template);

        // Fill background
        ctx.fillStyle = '#000000';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Draw the frame background first
        drawFrameBackground(ctx, template, canvas.width, canvas.height);

        // Draw the photo
        drawPhotoToArea(ctx, videoElement, photoArea, isMirrored, canvas.width);

        // Draw frame overlay on top
        drawFrameOverlay(ctx, template, canvas.width, canvas.height, photoArea);

        return canvas;
    }

    /**
     * Composite multiple photos into a strip layout
     */
    async function compositeStrip(capturedImages, template, isMirrored) {
        // Check if using custom frame image
        if (template.style === 'custom-frame' && template.frameImage) {
            return await compositeWithCustomFrame(capturedImages, template, isMirrored);
        }

        // Original programmatic frame rendering
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        const shots = template.shots || capturedImages.length;

        canvas.width = STRIP_WIDTH;
        canvas.height = STRIP_HEIGHT;

        // Fill background
        ctx.fillStyle = '#000000';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Draw the frame background first
        drawFrameBackground(ctx, template, canvas.width, canvas.height);

        // Calculate photo areas for strip
        const photoAreas = calculateStripPhotoAreas(template, shots, canvas.width, canvas.height);

        // Draw each captured image
        capturedImages.forEach((imgData, index) => {
            if (index < photoAreas.length) {
                drawImageToArea(ctx, imgData, photoAreas[index], isMirrored, canvas.width);
            }
        });

        // Draw frame overlay on top
        drawStripFrameOverlay(ctx, template, canvas.width, canvas.height, photoAreas);

        return canvas;
    }

    /**
     * Composite photos with custom frame image overlay
     */
    async function compositeWithCustomFrame(capturedImages, template, isMirrored) {
        return new Promise((resolve, reject) => {
            const frameImg = new Image();

            frameImg.onload = () => {
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');

                // Use template's defined frame dimensions
                canvas.width = template.frameWidth || frameImg.width;
                canvas.height = template.frameHeight || frameImg.height;

                // Fill white background
                ctx.fillStyle = '#ffffff';
                ctx.fillRect(0, 0, canvas.width, canvas.height);

                // Use exact photo slot positions from template
                const photoSlots = template.photoSlots || [];

                // Draw each captured image into its designated slot
                capturedImages.forEach((imgData, index) => {
                    if (index < photoSlots.length) {
                        drawImageToArea(ctx, imgData, photoSlots[index], isMirrored, canvas.width);
                    }
                });

                // Draw the custom frame image on top
                ctx.drawImage(frameImg, 0, 0, canvas.width, canvas.height);

                resolve(canvas);
            };

            frameImg.onerror = () => {
                console.error('Failed to load frame image:', template.frameImage);
                // Fallback to basic rendering without frame
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');
                canvas.width = STRIP_WIDTH;
                canvas.height = STRIP_HEIGHT;

                const shots = template.shots || capturedImages.length;
                ctx.fillStyle = '#ffffff';
                ctx.fillRect(0, 0, canvas.width, canvas.height);

                const photoAreas = calculateStripPhotoAreas(template, shots, canvas.width, canvas.height);
                capturedImages.forEach((imgData, index) => {
                    if (index < photoAreas.length) {
                        drawImageToArea(ctx, imgData, photoAreas[index], isMirrored, canvas.width);
                    }
                });

                resolve(canvas);
            };

            frameImg.src = template.frameImage;
        });
    }

    /**
     * Calculate photo areas for strip layout
     */
    function calculateStripPhotoAreas(template, shots, canvasWidth, canvasHeight) {
        const padding = template.borderWidth || 25;
        const gap = template.photoGap || 12;

        let sidePadding = padding;
        if (template.style === 'filmstrip') {
            sidePadding = padding + 25;
        }

        const photoWidth = canvasWidth - (sidePadding * 2);
        const totalGapHeight = gap * (shots - 1);
        const availableHeight = canvasHeight - (padding * 2) - totalGapHeight;
        const photoHeight = availableHeight / shots;

        const areas = [];
        for (let i = 0; i < shots; i++) {
            areas.push({
                x: sidePadding,
                y: padding + (i * (photoHeight + gap)),
                width: photoWidth,
                height: photoHeight
            });
        }

        return areas;
    }

    /**
     * Calculate photo area dimensions based on template (single photo)
     */
    function calculatePhotoArea(template) {
        const padding = template.borderWidth || 40;
        const bottomPadding = template.borderBottom || padding;

        let sidePadding = padding;
        if (template.style === 'filmstrip') {
            sidePadding = padding + 30;
        }

        if (template.style === 'triple' && template.outerBorderWidth) {
            sidePadding += template.outerBorderWidth;
        }

        return {
            x: sidePadding,
            y: padding,
            width: OUTPUT_WIDTH - (sidePadding * 2),
            height: OUTPUT_HEIGHT - padding - bottomPadding
        };
    }

    /**
     * Draw photo from video element to specified area
     */
    function drawPhotoToArea(ctx, videoElement, photoArea, isMirrored, canvasWidth) {
        ctx.save();

        if (isMirrored) {
            ctx.translate(canvasWidth, 0);
            ctx.scale(-1, 1);
        }

        const videoAspect = videoElement.videoWidth / videoElement.videoHeight;
        const areaAspect = photoArea.width / photoArea.height;

        let sx, sy, sw, sh;

        if (videoAspect > areaAspect) {
            sh = videoElement.videoHeight;
            sw = sh * areaAspect;
            sx = (videoElement.videoWidth - sw) / 2;
            sy = 0;
        } else {
            sw = videoElement.videoWidth;
            sh = sw / areaAspect;
            sx = 0;
            sy = (videoElement.videoHeight - sh) / 2;
        }

        const dx = isMirrored ? canvasWidth - photoArea.x - photoArea.width : photoArea.x;

        ctx.drawImage(
            videoElement,
            sx, sy, sw, sh,
            dx, photoArea.y, photoArea.width, photoArea.height
        );

        ctx.restore();
    }

    /**
     * Draw captured image data to specified area
     */
    function drawImageToArea(ctx, imgData, photoArea, isMirrored, canvasWidth) {
        ctx.save();

        // imgData is an ImageData or canvas from a previous capture
        const sourceWidth = imgData.width;
        const sourceHeight = imgData.height;

        const sourceAspect = sourceWidth / sourceHeight;
        const areaAspect = photoArea.width / photoArea.height;

        let sx, sy, sw, sh;

        if (sourceAspect > areaAspect) {
            sh = sourceHeight;
            sw = sh * areaAspect;
            sx = (sourceWidth - sw) / 2;
            sy = 0;
        } else {
            sw = sourceWidth;
            sh = sw / areaAspect;
            sx = 0;
            sy = (sourceHeight - sh) / 2;
        }

        ctx.drawImage(
            imgData,
            sx, sy, sw, sh,
            photoArea.x, photoArea.y, photoArea.width, photoArea.height
        );

        ctx.restore();
    }

    /**
     * Capture frame from video to a temporary canvas
     */
    function captureFrame(videoElement, isMirrored) {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        canvas.width = videoElement.videoWidth;
        canvas.height = videoElement.videoHeight;

        if (isMirrored) {
            ctx.translate(canvas.width, 0);
            ctx.scale(-1, 1);
        }

        ctx.drawImage(videoElement, 0, 0);

        return canvas;
    }

    /**
     * Draw frame background
     */
    function drawFrameBackground(ctx, template, width, height) {
        ctx.save();

        if (template.style === 'gradient' && template.borderColor.includes('gradient')) {
            const gradient = ctx.createLinearGradient(0, 0, 0, height);

            // Parse gradient colors from template
            if (template.borderColor.includes('#ff7e5f')) {
                // Sunset
                gradient.addColorStop(0, '#ff7e5f');
                gradient.addColorStop(1, '#feb47b');
            } else if (template.borderColor.includes('#2193b0')) {
                // Ocean
                gradient.addColorStop(0, '#2193b0');
                gradient.addColorStop(1, '#6dd5ed');
            } else if (template.borderColor.includes('#134e5e')) {
                // Forest
                gradient.addColorStop(0, '#134e5e');
                gradient.addColorStop(1, '#71b280');
            } else {
                // Default rainbow
                gradient.addColorStop(0, '#ff6b6b');
                gradient.addColorStop(0.33, '#feca57');
                gradient.addColorStop(0.66, '#48dbfb');
                gradient.addColorStop(1, '#ff9ff3');
            }
            ctx.fillStyle = gradient;
        } else if (template.style === 'glow') {
            ctx.fillStyle = '#111111';
        } else {
            ctx.fillStyle = template.borderColor;
        }

        if (template.borderRadius > 0) {
            roundRect(ctx, 0, 0, width, height, template.borderRadius * 2);
            ctx.fill();
        } else {
            ctx.fillRect(0, 0, width, height);
        }

        if (template.style === 'triple' && template.outerBorderColor) {
            ctx.strokeStyle = template.outerBorderColor;
            ctx.lineWidth = template.outerBorderWidth * 2;
            ctx.strokeRect(
                template.outerBorderWidth,
                template.outerBorderWidth,
                width - template.outerBorderWidth * 2,
                height - template.outerBorderWidth * 2
            );
        }

        ctx.restore();
    }

    /**
     * Draw frame overlay elements for single photo
     */
    function drawFrameOverlay(ctx, template, width, height, photoArea) {
        ctx.save();

        if (template.innerBorderColor && template.innerBorderWidth) {
            ctx.strokeStyle = template.innerBorderColor;
            ctx.lineWidth = template.innerBorderWidth * 2;
            ctx.strokeRect(
                photoArea.x - template.innerBorderWidth,
                photoArea.y - template.innerBorderWidth,
                photoArea.width + template.innerBorderWidth * 2,
                photoArea.height + template.innerBorderWidth * 2
            );
        }

        if (template.style === 'glow') {
            ctx.strokeStyle = template.borderColor;
            ctx.lineWidth = template.borderWidth;
            ctx.shadowColor = template.shadowColor;
            ctx.shadowBlur = template.glowIntensity * 2;
            ctx.strokeRect(
                photoArea.x - template.borderWidth / 2,
                photoArea.y - template.borderWidth / 2,
                photoArea.width + template.borderWidth,
                photoArea.height + template.borderWidth
            );
            ctx.shadowBlur = 0;
        }

        if (template.style === 'filmstrip') {
            drawFilmstripSprockets(ctx, template, width, height);
        }

        // Draw custom frame overlay if available
        if (template.customFrame) {
            drawCustomFrame(ctx, template, width, height);
        }

        // Draw design decorations
        if (template.design && template.design !== 'none') {
            drawDesignDecorations(ctx, template, width, height);
        }

        ctx.restore();
    }

    /**
     * Draw design decorations (emojis or custom stickers)
     */
    function drawDesignDecorations(ctx, template, width, height) {
        // First, draw custom stickers if available
        if (template.customStickers && template.customStickers.length > 0 &&
            template.stickerPositions && template.stickerPositions.length > 0) {
            drawCustomStickers(ctx, template, width, height);
            return; // If custom stickers exist, skip emoji decorations
        }

        // Otherwise, draw emoji decorations
        const decorations = designDecorations[template.design];
        if (!decorations || decorations.length === 0) return;

        const fontSize = Math.min(width, height) * 0.08;
        ctx.font = `${fontSize}px Arial`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        const padding = template.borderWidth || 30;
        const margin = padding * 0.3;

        decorations.forEach(dec => {
            let x, y;

            switch (dec.pos) {
                case 'top-left':
                    x = padding / 2 + margin;
                    y = padding / 2 + margin;
                    break;
                case 'top-right':
                    x = width - padding / 2 - margin;
                    y = padding / 2 + margin;
                    break;
                case 'top-center':
                    x = width / 2;
                    y = padding / 2 + margin;
                    break;
                case 'bottom-left':
                    x = padding / 2 + margin;
                    y = height - padding / 2 - margin;
                    break;
                case 'bottom-right':
                    x = width - padding / 2 - margin;
                    y = height - padding / 2 - margin;
                    break;
                case 'bottom-center':
                    x = width / 2;
                    y = height - padding / 2 - margin;
                    break;
                default:
                    return;
            }

            ctx.fillText(dec.emoji, x, y);
        });
    }

    /**
     * Draw custom sticker images
     */
    function drawCustomStickers(ctx, template, width, height) {
        template.stickerPositions.forEach(pos => {
            const stickerSrc = template.customStickers[pos.sticker];
            if (!stickerSrc) return;

            // Get cached image from Builder
            const img = Builder.getCachedImage(stickerSrc);
            if (!img) return;

            // Calculate position and size
            const x = pos.x * width;
            const y = pos.y * height;
            const size = pos.size * Math.min(width, height);

            ctx.drawImage(img, x - size / 2, y - size / 2, size, size);
        });
    }

    /**
     * Draw custom frame overlay image
     */
    function drawCustomFrame(ctx, template, width, height) {
        if (!template.customFrame) return;

        // Get cached image from Builder
        const img = Builder.getCachedImage(template.customFrame);
        if (!img) return;

        // Draw the frame overlay (scaled to fit canvas)
        ctx.drawImage(img, 0, 0, width, height);
    }

    /**
     * Draw frame overlay elements for strip layout
     */
    function drawStripFrameOverlay(ctx, template, width, height, photoAreas) {
        ctx.save();

        // Draw inner borders around each photo
        if (template.innerBorderColor && template.innerBorderWidth) {
            ctx.strokeStyle = template.innerBorderColor;
            ctx.lineWidth = template.innerBorderWidth * 2;

            photoAreas.forEach(area => {
                ctx.strokeRect(
                    area.x - template.innerBorderWidth,
                    area.y - template.innerBorderWidth,
                    area.width + template.innerBorderWidth * 2,
                    area.height + template.innerBorderWidth * 2
                );
            });
        }

        // Glow effect around each photo
        if (template.style === 'glow') {
            ctx.strokeStyle = template.borderColor;
            ctx.lineWidth = template.borderWidth / 2;
            ctx.shadowColor = template.shadowColor;
            ctx.shadowBlur = template.glowIntensity;

            photoAreas.forEach(area => {
                ctx.strokeRect(
                    area.x - template.borderWidth / 4,
                    area.y - template.borderWidth / 4,
                    area.width + template.borderWidth / 2,
                    area.height + template.borderWidth / 2
                );
            });
            ctx.shadowBlur = 0;
        }

        if (template.style === 'filmstrip') {
            drawFilmstripSprockets(ctx, template, width, height);
        }

        // Draw custom frame overlay if available
        if (template.customFrame) {
            drawCustomFrame(ctx, template, width, height);
        }

        // Draw design decorations
        if (template.design && template.design !== 'none') {
            drawDesignDecorations(ctx, template, width, height);
        }

        ctx.restore();
    }

    /**
     * Draw filmstrip sprocket holes
     */
    function drawFilmstripSprockets(ctx, template, width, height) {
        const sprocketWidth = 16;
        const sprocketHeight = 10;
        const sprocketGap = 20;
        const leftX = 8;
        const rightX = width - leftX - sprocketWidth;

        ctx.fillStyle = template.sprocketColor || '#ffffff';

        const numSprockets = Math.floor((height - 20) / (sprocketHeight + sprocketGap));

        for (let i = 0; i < numSprockets; i++) {
            const y = 10 + i * (sprocketHeight + sprocketGap);

            roundRect(ctx, leftX, y, sprocketWidth, sprocketHeight, 2);
            ctx.fill();

            roundRect(ctx, rightX, y, sprocketWidth, sprocketHeight, 2);
            ctx.fill();
        }
    }

    /**
     * Helper to draw rounded rectangle
     */
    function roundRect(ctx, x, y, width, height, radius) {
        ctx.beginPath();
        ctx.moveTo(x + radius, y);
        ctx.lineTo(x + width - radius, y);
        ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
        ctx.lineTo(x + width, y + height - radius);
        ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
        ctx.lineTo(x + radius, y + height);
        ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
        ctx.lineTo(x, y + radius);
        ctx.quadraticCurveTo(x, y, x + radius, y);
        ctx.closePath();
    }

    /**
     * Convert canvas to blob
     */
    function toBlob(canvas, type = 'image/png', quality = 0.92) {
        return new Promise((resolve) => {
            canvas.toBlob(resolve, type, quality);
        });
    }

    /**
     * Convert canvas to data URL
     */
    function toDataURL(canvas, type = 'image/png', quality = 0.92) {
        return canvas.toDataURL(type, quality);
    }

    /**
     * Check if template is a strip layout
     */
    function isStripLayout(template) {
        return template.layout === 'strip' || template.shots > 1;
    }

    /**
     * Get output dimensions for a template
     */
    function getOutputDimensions(template) {
        if (isStripLayout(template)) {
            return { width: STRIP_WIDTH, height: STRIP_HEIGHT };
        }
        return { width: OUTPUT_WIDTH, height: OUTPUT_HEIGHT };
    }

    return {
        composite,
        compositeStrip,
        captureFrame,
        calculatePhotoArea,
        calculateStripPhotoAreas,
        isStripLayout,
        getOutputDimensions,
        toBlob,
        toDataURL,
        OUTPUT_WIDTH,
        OUTPUT_HEIGHT,
        STRIP_WIDTH,
        STRIP_HEIGHT
    };
})();
