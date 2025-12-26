/**
 * Camera Module
 * Handles camera access, device enumeration, and stream management
 */

const Camera = (function() {
    let currentStream = null;
    let videoElement = null;
    let isMirrored = true;
    let availableCameras = [];

    /**
     * Initialize camera module with video element
     */
    function init(videoEl) {
        videoElement = videoEl;
    }

    /**
     * Get list of available video input devices
     */
    async function getAvailableCameras() {
        try {
            // First request permission to enumerate devices properly
            await navigator.mediaDevices.getUserMedia({ video: true });

            const devices = await navigator.mediaDevices.enumerateDevices();
            availableCameras = devices.filter(device => device.kind === 'videoinput');

            return availableCameras.map((device, index) => ({
                deviceId: device.deviceId,
                label: device.label || `Camera ${index + 1}`
            }));
        } catch (error) {
            console.error('Error enumerating cameras:', error);
            throw error;
        }
    }

    /**
     * Start camera stream with specified device
     */
    async function startCamera(deviceId = null) {
        try {
            // Stop any existing stream
            stopCamera();

            const constraints = {
                video: {
                    width: { ideal: 1920 },
                    height: { ideal: 1080 },
                    facingMode: deviceId ? undefined : 'user'
                },
                audio: false
            };

            if (deviceId) {
                constraints.video.deviceId = { exact: deviceId };
            }

            currentStream = await navigator.mediaDevices.getUserMedia(constraints);

            if (videoElement) {
                videoElement.srcObject = currentStream;
                await videoElement.play();
                updateMirror();
            }

            return currentStream;
        } catch (error) {
            console.error('Error starting camera:', error);
            throw error;
        }
    }

    /**
     * Switch to a different camera
     */
    async function switchCamera(deviceId) {
        return await startCamera(deviceId);
    }

    /**
     * Stop the current camera stream
     */
    function stopCamera() {
        if (currentStream) {
            currentStream.getTracks().forEach(track => track.stop());
            currentStream = null;
        }
        if (videoElement) {
            videoElement.srcObject = null;
        }
    }

    /**
     * Toggle mirror mode
     */
    function toggleMirror() {
        isMirrored = !isMirrored;
        updateMirror();
        return isMirrored;
    }

    /**
     * Apply mirror transform to video
     */
    function updateMirror() {
        if (videoElement) {
            videoElement.style.transform = isMirrored ? 'scaleX(-1)' : 'scaleX(1)';
        }
    }

    /**
     * Get current mirror state
     */
    function getMirrorState() {
        return isMirrored;
    }

    /**
     * Set mirror state
     */
    function setMirror(mirrored) {
        isMirrored = mirrored;
        updateMirror();
    }

    /**
     * Get video dimensions
     */
    function getVideoDimensions() {
        if (!videoElement) return { width: 0, height: 0 };
        return {
            width: videoElement.videoWidth,
            height: videoElement.videoHeight
        };
    }

    /**
     * Get current stream
     */
    function getStream() {
        return currentStream;
    }

    /**
     * Get video element
     */
    function getVideoElement() {
        return videoElement;
    }

    /**
     * Check if camera is currently active
     */
    function isActive() {
        return currentStream !== null && currentStream.active;
    }

    return {
        init,
        getAvailableCameras,
        startCamera,
        switchCamera,
        stopCamera,
        toggleMirror,
        getMirrorState,
        setMirror,
        getVideoDimensions,
        getStream,
        getVideoElement,
        isActive
    };
})();
