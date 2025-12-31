/**
 * Crop Calculator Module
 * Provides centralized crop calculation logic to ensure preview and final output match exactly
 *
 * This is the single source of truth for all crop calculations in the photobooth app.
 * Both the camera preview overlay and the final canvas rendering use these functions
 * to ensure the user sees exactly what will be captured.
 */

const CropCalculator = (function() {
    /**
     * Calculate crop region for a photo slot
     * Used by canvas rendering to crop source images to fit photo slots
     *
     * @param {Object} slot - Photo slot definition { x, y, width, height }
     * @param {number} sourceWidth - Source image/video width in pixels
     * @param {number} sourceHeight - Source image/video height in pixels
     * @returns {Object} Crop coordinates { sx, sy, sw, sh }
     */
    function calculateCropRegion(slot, sourceWidth, sourceHeight) {
        const slotAspect = slot.width / slot.height;
        const sourceAspect = sourceWidth / sourceHeight;

        let sx, sy, sw, sh;

        if (sourceAspect > slotAspect) {
            // Source is wider than slot - crop from sides
            sh = sourceHeight;
            sw = sh * slotAspect;
            sx = (sourceWidth - sw) / 2;
            sy = 0;
        } else {
            // Source is taller than slot - crop from top/bottom
            sw = sourceWidth;
            sh = sw / slotAspect;
            sx = 0;
            sy = (sourceHeight - sh) / 2;
        }

        return { sx, sy, sw, sh };
    }

    /**
     * Calculate preview overlay dimensions for camera container
     * Used by camera preview to show crop area to user
     *
     * @param {Object} slot - Photo slot definition { x, y, width, height }
     * @param {number} containerWidth - Camera container width in pixels
     * @param {number} containerHeight - Camera container height in pixels
     * @returns {Object} Overlay box position { x, y, width, height }
     */
    function calculatePreviewOverlay(slot, containerWidth, containerHeight) {
        const slotAspect = slot.width / slot.height;
        const containerAspect = containerWidth / containerHeight;

        let cropWidth, cropHeight, cropX, cropY;

        if (containerAspect > slotAspect) {
            // Container is wider than slot - center horizontally
            cropHeight = containerHeight;
            cropWidth = cropHeight * slotAspect;
            cropX = (containerWidth - cropWidth) / 2;
            cropY = 0;
        } else {
            // Container is taller than slot - center vertically
            cropWidth = containerWidth;
            cropHeight = cropWidth / slotAspect;
            cropX = 0;
            cropY = (containerHeight - cropHeight) / 2;
        }

        return {
            x: cropX,
            y: cropY,
            width: cropWidth,
            height: cropHeight
        };
    }

    /**
     * Public API
     */
    return {
        calculateCropRegion,
        calculatePreviewOverlay
    };
})();
