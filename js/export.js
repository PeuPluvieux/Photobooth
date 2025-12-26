/**
 * Export Module
 * Handles downloading and sharing photos
 */

const Export = (function() {
    /**
     * Download canvas as image file
     */
    function downloadImage(canvas, filename = 'photobooth') {
        try {
            const timestamp = new Date().toISOString().slice(0, 19).replace(/[:-]/g, '');
            const fullFilename = `${filename}_${timestamp}.png`;

            console.log('Attempting to download:', fullFilename);
            console.log('Canvas:', canvas.width, 'x', canvas.height);

            // Create download link
            const link = document.createElement('a');
            link.download = fullFilename;

            // Convert canvas to data URL
            const dataUrl = canvas.toDataURL('image/png');
            console.log('Data URL created, length:', dataUrl.length);

            link.href = dataUrl;

            // Trigger download
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            console.log('Download link clicked');
            return fullFilename;
        } catch (error) {
            console.error('Download error details:', error);
            throw error;
        }
    }

    /**
     * Download canvas as JPEG (smaller file size)
     */
    function downloadImageJPEG(canvas, filename = 'photobooth', quality = 0.92) {
        const timestamp = new Date().toISOString().slice(0, 19).replace(/[:-]/g, '');
        const fullFilename = `${filename}_${timestamp}.jpg`;

        const link = document.createElement('a');
        link.download = fullFilename;
        link.href = canvas.toDataURL('image/jpeg', quality);

        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        return fullFilename;
    }

    /**
     * Check if Web Share API is available
     */
    function canShare() {
        return navigator.share !== undefined && navigator.canShare !== undefined;
    }

    /**
     * Share image using Web Share API
     */
    async function shareImage(canvas, title = 'My Photobooth Photo') {
        if (!canShare()) {
            throw new Error('Web Share API not supported');
        }

        try {
            const blob = await new Promise(resolve => {
                canvas.toBlob(resolve, 'image/png');
            });

            const file = new File([blob], 'photobooth.png', { type: 'image/png' });

            const shareData = {
                title: title,
                text: 'Check out my photobooth photo!',
                files: [file]
            };

            if (navigator.canShare(shareData)) {
                await navigator.share(shareData);
                return true;
            } else {
                // Fallback to sharing without file
                await navigator.share({
                    title: title,
                    text: 'Check out my photobooth photo!'
                });
                return true;
            }
        } catch (error) {
            if (error.name === 'AbortError') {
                // User cancelled - not an error
                return false;
            }
            throw error;
        }
    }

    /**
     * Copy image to clipboard
     */
    async function copyToClipboard(canvas) {
        try {
            const blob = await new Promise(resolve => {
                canvas.toBlob(resolve, 'image/png');
            });

            await navigator.clipboard.write([
                new ClipboardItem({
                    'image/png': blob
                })
            ]);

            return true;
        } catch (error) {
            console.error('Failed to copy to clipboard:', error);
            throw error;
        }
    }

    /**
     * Check if clipboard API is available
     */
    function canCopyToClipboard() {
        return navigator.clipboard && navigator.clipboard.write !== undefined;
    }

    /**
     * Get image as data URL
     */
    function getDataURL(canvas, type = 'image/png', quality = 0.92) {
        return canvas.toDataURL(type, quality);
    }

    /**
     * Get image as Blob
     */
    async function getBlob(canvas, type = 'image/png', quality = 0.92) {
        return new Promise(resolve => {
            canvas.toBlob(resolve, type, quality);
        });
    }

    return {
        downloadImage,
        downloadImageJPEG,
        canShare,
        shareImage,
        copyToClipboard,
        canCopyToClipboard,
        getDataURL,
        getBlob
    };
})();
