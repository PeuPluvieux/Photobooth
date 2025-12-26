/**
 * Main App Controller
 * Manages app state and screen transitions
 */

const App = (function() {
    // State
    const state = {
        currentScreen: 'landing',
        selectedTemplate: null,
        capturedCanvas: null,
        capturedFrames: [],
        isStripMode: false
    };

    // DOM Elements
    const elements = {};

    /**
     * Initialize the application
     */
    function init() {
        cacheElements();

        Camera.init(elements.cameraPreview);
        Capture.init({
            countdownDisplay: elements.countdownDisplay,
            flashEffect: elements.flashEffect,
            shotIndicator: elements.shotIndicator
        });

        // Bind template selection
        bindTemplateSelection();

        bindEvents();
        updateShareButton();

        console.log('Photobooth app initialized');
    }

    /**
     * Cache DOM elements
     */
    function cacheElements() {
        elements.screens = {
            landing: document.getElementById('screen-landing'),
            templates: document.getElementById('screen-templates'),
            camera: document.getElementById('screen-camera'),
            review: document.getElementById('screen-review')
        };

        elements.btnStart = document.getElementById('btn-start');
        elements.btnBackLanding = document.getElementById('btn-back-landing');
        elements.btnBackTemplates = document.getElementById('btn-back-templates');
        elements.btnCapture = document.getElementById('btn-capture');
        elements.btnRetake = document.getElementById('btn-retake');
        elements.btnDownload = document.getElementById('btn-download');
        elements.btnShare = document.getElementById('btn-share');
        elements.btnNewPhoto = document.getElementById('btn-new-photo');
        elements.btnMirror = document.getElementById('btn-mirror');
        elements.btnCloseError = document.getElementById('btn-close-error');

        elements.cameraSelect = document.getElementById('camera-select');
        elements.cameraPreview = document.getElementById('camera-preview');
        elements.cameraContainer = document.getElementById('camera-container');
        elements.templateOverlay = document.getElementById('template-overlay');
        elements.countdownDisplay = document.getElementById('countdown-display');
        elements.flashEffect = document.getElementById('flash-effect');
        elements.shotIndicator = document.getElementById('shot-indicator');
        elements.capturedThumbnails = document.getElementById('captured-thumbnails');
        elements.resultCanvas = document.getElementById('result-canvas');
        elements.errorModal = document.getElementById('error-modal');
        elements.errorMessage = document.getElementById('error-message');
        elements.timerButtons = document.querySelectorAll('.timer-btn');
        elements.modeIndicator = document.getElementById('mode-indicator');
    }

    /**
     * Bind template selection event listeners
     */
    function bindTemplateSelection() {
        // Template choice buttons
        document.querySelectorAll('.template-choice-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const templateId = btn.dataset.templateId;
                Templates.select(templateId);
                startCameraScreen();
            });
        });
    }


    /**
     * Bind event listeners
     */
    function bindEvents() {
        elements.btnStart.addEventListener('click', () => showScreen('templates'));
        elements.btnBackLanding.addEventListener('click', () => showScreen('landing'));
        elements.btnBackTemplates.addEventListener('click', () => {
            Camera.stopCamera();
            Capture.cancelCapture();
            state.capturedFrames = [];
            showScreen('templates');
        });

        elements.btnCapture.addEventListener('click', capturePhoto);

        elements.btnRetake.addEventListener('click', retakePhoto);
        elements.btnDownload.addEventListener('click', downloadPhoto);
        elements.btnShare.addEventListener('click', sharePhoto);
        elements.btnNewPhoto.addEventListener('click', () => {
            showScreen('templates');
            state.capturedCanvas = null;
            state.capturedFrames = [];
        });

        elements.btnMirror.addEventListener('click', toggleMirror);
        elements.cameraSelect.addEventListener('change', switchCamera);

        elements.timerButtons.forEach(btn => {
            btn.addEventListener('click', () => selectTimer(btn));
        });

        elements.btnCloseError.addEventListener('click', () => {
            elements.errorModal.classList.add('hidden');
            startCameraScreen();
        });
    }

    /**
     * Show a specific screen
     */
    function showScreen(screenName) {
        Object.values(elements.screens).forEach(screen => {
            screen.classList.add('hidden');
        });

        elements.screens[screenName].classList.remove('hidden');
        state.currentScreen = screenName;
    }

    /**
     * Start camera screen
     */
    async function startCameraScreen() {
        // Get selected template
        state.selectedTemplate = Templates.getSelected();
        if (!state.selectedTemplate) {
            console.error('No template selected');
            return;
        }
        state.isStripMode = state.selectedTemplate.shots > 1;

        showScreen('camera');
        state.capturedFrames = [];
        updateCapturedThumbnails();

        try {
            const cameras = await Camera.getAvailableCameras();
            populateCameraSelect(cameras);

            await Camera.startCamera();

            updateTemplateOverlay();
            updateModeIndicator();
        } catch (error) {
            console.error('Camera error:', error);
            showError(getCameraErrorMessage(error));
        }
    }

    /**
     * Update mode indicator
     */
    function updateModeIndicator() {
        if (!elements.modeIndicator) return;

        const template = state.selectedTemplate;
        if (template && template.shots > 1) {
            elements.modeIndicator.textContent = `${template.shots}-Photo Strip`;
            elements.modeIndicator.classList.remove('hidden');
        } else {
            elements.modeIndicator.classList.add('hidden');
        }
    }

    /**
     * Populate camera select dropdown
     */
    function populateCameraSelect(cameras) {
        elements.cameraSelect.innerHTML = cameras.map((camera, index) => `
            <option value="${camera.deviceId}">${camera.label}</option>
        `).join('');
    }

    /**
     * Switch camera
     */
    async function switchCamera() {
        const deviceId = elements.cameraSelect.value;
        try {
            await Camera.switchCamera(deviceId);
        } catch (error) {
            console.error('Error switching camera:', error);
        }
    }

    /**
     * Toggle mirror mode
     */
    function toggleMirror() {
        const isMirrored = Camera.toggleMirror();
        elements.btnMirror.classList.toggle('bg-forest', isMirrored);
        elements.btnMirror.classList.toggle('bg-warm-white/50', !isMirrored);
    }

    /**
     * Select timer duration
     */
    function selectTimer(selectedBtn) {
        elements.timerButtons.forEach(btn => {
            btn.classList.remove('bg-forest');
            btn.classList.add('bg-warm-white');
        });

        selectedBtn.classList.remove('bg-warm-white');
        selectedBtn.classList.add('bg-forest');

        Capture.setCountdown(parseInt(selectedBtn.dataset.seconds, 10));
    }

    /**
     * Update template overlay on camera preview
     */
    function updateTemplateOverlay() {
        const template = state.selectedTemplate;
        if (!template) return;

        const overlay = elements.templateOverlay;
        overlay.style.cssText = '';
        overlay.innerHTML = '';

        // For custom frames with photo slots, show first photo's crop area
        if (template.style === 'custom-frame' && template.photoSlots) {
            updateCurrentShotOverlay(0);
            return;
        }

        applyTemplateOverlay(overlay, template);
    }

    /**
     * Update overlay to show current shot's crop area
     */
    function updateCurrentShotOverlay(shotIndex) {
        const template = state.selectedTemplate;
        if (!template || !template.photoSlots || !template.photoSlots[shotIndex]) return;

        const overlay = elements.templateOverlay;
        const slot = template.photoSlots[shotIndex];

        // Get camera container dimensions
        const container = elements.cameraContainer;
        const containerWidth = container.offsetWidth;
        const containerHeight = container.offsetHeight;

        // Calculate aspect ratio of the photo slot
        const slotAspect = slot.width / slot.height;
        const containerAspect = containerWidth / containerHeight;

        let cropWidth, cropHeight, cropX, cropY;

        // Calculate crop box to match slot aspect ratio, centered in container
        if (containerAspect > slotAspect) {
            // Container is wider - crop width based on height
            cropHeight = containerHeight;
            cropWidth = cropHeight * slotAspect;
            cropX = (containerWidth - cropWidth) / 2;
            cropY = 0;
        } else {
            // Container is taller - crop height based on width
            cropWidth = containerWidth;
            cropHeight = cropWidth / slotAspect;
            cropX = 0;
            cropY = (containerHeight - cropHeight) / 2;
        }

        // Show crop box with darkened outside area
        overlay.innerHTML = `
            <div style="
                position: absolute;
                left: ${cropX}px;
                top: ${cropY}px;
                width: ${cropWidth}px;
                height: ${cropHeight}px;
                border: 3px solid rgba(255, 255, 255, 0.9);
                box-shadow: 0 0 0 2000px rgba(0, 0, 0, 0.5);
                display: flex;
                align-items: center;
                justify-content: center;
                pointer-events: none;
            ">
                <div style="
                    background: rgba(255, 255, 255, 0.9);
                    color: #1A3329;
                    padding: 8px 20px;
                    border-radius: 20px;
                    font-weight: bold;
                    font-size: 16px;
                    box-shadow: 0 2px 10px rgba(0,0,0,0.3);
                ">Photo ${shotIndex + 1} Crop Area</div>
            </div>
        `;
    }

    /**
     * Apply template overlay styles
     */
    function applyTemplateOverlay(overlay, template) {
        const padding = template.borderWidth || 40;
        const isStrip = template.shots > 1;
        const shots = template.shots || 1;

        overlay.style.position = 'absolute';
        overlay.style.inset = '0';
        overlay.style.pointerEvents = 'none';

        const frameSize = Math.min(padding, 30);

        if (isStrip) {
            applyStripOverlay(overlay, template, shots, frameSize);
        } else {
            applySingleOverlay(overlay, template, frameSize);
        }

        // Add design decorations preview
        if (template.design && template.design !== 'none') {
            overlay.innerHTML += generateDecorationOverlay(template.design);
        }
    }

    /**
     * Generate decoration overlay HTML
     */
    function generateDecorationOverlay(design) {
        const decorations = {
            hearts: [{ emoji: '💕', pos: 'tl' }, { emoji: '❤️', pos: 'tr' }, { emoji: '💗', pos: 'bl' }, { emoji: '💖', pos: 'br' }],
            stars: [{ emoji: '✨', pos: 'tl' }, { emoji: '⭐', pos: 'tr' }, { emoji: '🌟', pos: 'bl' }, { emoji: '💫', pos: 'br' }],
            party: [{ emoji: '🎉', pos: 'tl' }, { emoji: '🎊', pos: 'tr' }, { emoji: '🎈', pos: 'bl' }, { emoji: '🥳', pos: 'br' }],
            birthday: [{ emoji: '🎂', pos: 'tc' }, { emoji: '🎈', pos: 'bl' }, { emoji: '🎁', pos: 'br' }],
            wedding: [{ emoji: '💒', pos: 'tc' }, { emoji: '💍', pos: 'bl' }, { emoji: '💐', pos: 'br' }],
            christmas: [{ emoji: '🎄', pos: 'tl' }, { emoji: '🎅', pos: 'tr' }, { emoji: '⛄', pos: 'bl' }, { emoji: '🎁', pos: 'br' }],
            halloween: [{ emoji: '🎃', pos: 'tl' }, { emoji: '👻', pos: 'tr' }, { emoji: '🦇', pos: 'bl' }, { emoji: '💀', pos: 'br' }],
            floral: [{ emoji: '🌸', pos: 'tl' }, { emoji: '🌺', pos: 'tr' }, { emoji: '🌷', pos: 'bl' }, { emoji: '🌹', pos: 'br' }],
            vintage: [{ emoji: '📷', pos: 'bc' }]
        };

        const items = decorations[design];
        if (!items) return '';

        const positions = {
            'tl': 'top: 5px; left: 8px;',
            'tr': 'top: 5px; right: 8px;',
            'tc': 'top: 5px; left: 50%; transform: translateX(-50%);',
            'bl': 'bottom: 5px; left: 8px;',
            'br': 'bottom: 5px; right: 8px;',
            'bc': 'bottom: 8px; left: 50%; transform: translateX(-50%);'
        };

        return items.map(item => `
            <span style="position: absolute; ${positions[item.pos]} font-size: 20px; z-index: 10; text-shadow: 0 2px 4px rgba(0,0,0,0.3);">
                ${item.emoji}
            </span>
        `).join('');
    }

    /**
     * Apply strip overlay with multiple slots
     */
    function applyStripOverlay(overlay, template, shots, frameSize) {
        // For custom frames with photoSlots, show the actual frame as overlay
        if (template.style === 'custom-frame' && template.frameImage) {
            const cameraContainer = elements.cameraContainer;
            const containerWidth = cameraContainer.offsetWidth;
            const containerHeight = cameraContainer.offsetHeight;

            // Calculate scale to fit frame in camera preview
            const scaleX = containerWidth / template.frameWidth;
            const scaleY = containerHeight / template.frameHeight;
            const scale = Math.min(scaleX, scaleY);

            // Calculate scaled dimensions
            const scaledFrameWidth = template.frameWidth * scale;
            const scaledFrameHeight = template.frameHeight * scale;
            const offsetX = (containerWidth - scaledFrameWidth) / 2;
            const offsetY = (containerHeight - scaledFrameHeight) / 2;

            // Show the actual frame image as semi-transparent overlay
            overlay.innerHTML = `
                <div style="
                    position: absolute;
                    left: ${offsetX}px;
                    top: ${offsetY}px;
                    width: ${scaledFrameWidth}px;
                    height: ${scaledFrameHeight}px;
                    background-image: url('${template.frameImage}');
                    background-size: contain;
                    background-repeat: no-repeat;
                    background-position: center;
                    opacity: 0.5;
                    pointer-events: none;
                "></div>
            `;
            return;
        }

        // Original overlay for non-custom frames
        const gap = 8;
        const slotHeight = `calc((100% - ${frameSize * 2}px - ${gap * (shots - 1)}px) / ${shots})`;

        let html = '';
        for (let i = 0; i < shots; i++) {
            const topOffset = `calc(${frameSize}px + ${i} * (${slotHeight} + ${gap}px))`;
            html += `
                <div style="
                    position: absolute;
                    left: ${frameSize}px;
                    right: ${frameSize}px;
                    top: ${topOffset};
                    height: ${slotHeight};
                    border: 2px dashed rgba(255,255,255,0.5);
                    border-radius: 4px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                ">
                    <span style="
                        background: rgba(0,0,0,0.5);
                        padding: 4px 12px;
                        border-radius: 12px;
                        font-size: 12px;
                        color: rgba(255,255,255,0.8);
                    ">${i + 1}</span>
                </div>
            `;
        }

        overlay.innerHTML = html;

        // Apply frame border
        const isRainbow = template.borderColor && template.borderColor.includes('gradient');

        switch (template.style) {
            case 'glow':
                overlay.style.border = `${frameSize / 3}px solid ${template.borderColor}`;
                overlay.style.boxShadow = `0 0 ${template.glowIntensity}px ${template.shadowColor}, inset 0 0 ${template.glowIntensity}px ${template.shadowColor}`;
                break;
            case 'gradient':
                overlay.style.border = `${frameSize}px solid transparent`;
                overlay.style.background = `linear-gradient(#000, #000) padding-box, linear-gradient(180deg, #ff6b6b, #feca57, #48dbfb, #ff9ff3) border-box`;
                break;
            default:
                if (isRainbow) {
                    overlay.style.border = `${frameSize}px solid transparent`;
                    overlay.style.background = `linear-gradient(#000, #000) padding-box, linear-gradient(45deg, #ff6b6b, #feca57, #48dbfb, #ff9ff3) border-box`;
                } else {
                    overlay.style.boxShadow = `
                        inset ${frameSize}px 0 0 0 ${template.borderColor},
                        inset -${frameSize}px 0 0 0 ${template.borderColor},
                        inset 0 ${frameSize}px 0 0 ${template.borderColor},
                        inset 0 -${frameSize}px 0 0 ${template.borderColor}
                    `;
                }
        }
    }

    /**
     * Apply single photo overlay
     */
    function applySingleOverlay(overlay, template, frameSize) {
        const isRainbow = template.borderColor && template.borderColor.includes('gradient');

        switch (template.style) {
            case 'polaroid':
                overlay.style.boxShadow = `
                    inset ${frameSize}px 0 0 0 ${template.borderColor},
                    inset -${frameSize}px 0 0 0 ${template.borderColor},
                    inset 0 ${frameSize}px 0 0 ${template.borderColor},
                    inset 0 -${frameSize * 2.5}px 0 0 ${template.borderColor}
                `;
                break;

            case 'gradient':
                overlay.style.border = `${frameSize}px solid transparent`;
                overlay.style.background = `linear-gradient(#000, #000) padding-box, ${template.borderColor} border-box`;
                break;

            case 'glow':
                overlay.style.border = `${frameSize / 3}px solid ${template.borderColor}`;
                overlay.style.boxShadow = `
                    0 0 ${template.glowIntensity}px ${template.shadowColor},
                    inset 0 0 ${template.glowIntensity}px ${template.shadowColor}
                `;
                break;

            case 'filmstrip':
                overlay.style.borderLeft = `${frameSize * 1.5}px solid ${template.borderColor}`;
                overlay.style.borderRight = `${frameSize * 1.5}px solid ${template.borderColor}`;
                overlay.style.borderTop = `${frameSize}px solid ${template.borderColor}`;
                overlay.style.borderBottom = `${frameSize}px solid ${template.borderColor}`;
                overlay.innerHTML = createSprocketHoles();
                break;

            default:
                if (isRainbow) {
                    overlay.style.border = `${frameSize}px solid transparent`;
                    overlay.style.background = `linear-gradient(#000, #000) padding-box, linear-gradient(45deg, #ff6b6b, #feca57, #48dbfb, #ff9ff3) border-box`;
                } else {
                    overlay.style.boxShadow = `
                        inset ${frameSize}px 0 0 0 ${template.borderColor},
                        inset -${frameSize}px 0 0 0 ${template.borderColor},
                        inset 0 ${frameSize}px 0 0 ${template.borderColor},
                        inset 0 -${frameSize}px 0 0 ${template.borderColor}
                    `;
                }

                if (template.innerBorderColor) {
                    overlay.style.border = `${template.innerBorderWidth || 2}px solid ${template.innerBorderColor}`;
                    overlay.style.margin = `${frameSize - 2}px`;
                }
                break;
        }

        // Add rounded corners if applicable
        if (template.borderRadius) {
            overlay.style.borderRadius = `${template.borderRadius}px`;
        }
    }

    /**
     * Create sprocket holes HTML for filmstrip
     */
    function createSprocketHoles() {
        let html = '<div style="position: absolute; left: 5px; top: 0; bottom: 0; width: 20px; display: flex; flex-direction: column; justify-content: space-evenly; padding: 10px 0;">';
        for (let i = 0; i < 10; i++) {
            html += '<div style="width: 12px; height: 8px; background: rgba(255,255,255,0.8); border-radius: 2px;"></div>';
        }
        html += '</div>';

        html += '<div style="position: absolute; right: 5px; top: 0; bottom: 0; width: 20px; display: flex; flex-direction: column; justify-content: space-evenly; padding: 10px 0;">';
        for (let i = 0; i < 10; i++) {
            html += '<div style="width: 12px; height: 8px; background: rgba(255,255,255,0.8); border-radius: 2px;"></div>';
        }
        html += '</div>';

        return html;
    }

    /**
     * Capture photo (single or multi-shot)
     */
    function capturePhoto() {
        if (Capture.isBusy()) return;

        const template = state.selectedTemplate;
        const shots = template.shots || 1;

        if (shots > 1) {
            captureStrip(shots);
        } else {
            captureSingle();
        }
    }

    /**
     * Capture single photo
     */
    function captureSingle() {
        Capture.startCapture(() => {
            const canvas = CanvasCompositor.composite(
                Camera.getVideoElement(),
                state.selectedTemplate,
                Camera.getMirrorState()
            );

            state.capturedCanvas = canvas;

            displayResult(canvas);
            Camera.stopCamera();
            showScreen('review');
        });
    }

    /**
     * Capture multi-shot strip
     */
    function captureStrip(totalShots) {
        state.capturedFrames = [];

        Capture.startMultiCapture(
            totalShots,
            (shotIndex) => {
                const frame = CanvasCompositor.captureFrame(
                    Camera.getVideoElement(),
                    Camera.getMirrorState()
                );
                state.capturedFrames.push(frame);
                updateCapturedThumbnails();

                // Update overlay to show next shot's crop area
                if (shotIndex < totalShots - 1) {
                    updateCurrentShotOverlay(shotIndex + 1);
                }
            },
            async () => {
                console.log('Compositing photos...');
                const canvas = await CanvasCompositor.compositeStrip(
                    state.capturedFrames,
                    state.selectedTemplate,
                    false
                );

                console.log('Canvas created:', canvas ? 'Success' : 'Failed',
                            canvas ? `${canvas.width}x${canvas.height}` : '');

                state.capturedCanvas = canvas;

                displayResult(canvas);
                Camera.stopCamera();
                showScreen('review');
            }
        );

        // Show overlay for first shot
        updateCurrentShotOverlay(0);
    }

    /**
     * Update captured thumbnails display
     */
    function updateCapturedThumbnails() {
        if (!elements.capturedThumbnails) return;

        const template = state.selectedTemplate;
        if (!template || template.shots <= 1) {
            elements.capturedThumbnails.classList.add('hidden');
            return;
        }

        elements.capturedThumbnails.classList.remove('hidden');

        const totalShots = template.shots;
        let html = '';

        for (let i = 0; i < totalShots; i++) {
            if (i < state.capturedFrames.length) {
                const frame = state.capturedFrames[i];
                const dataUrl = frame.toDataURL('image/jpeg', 0.5);
                html += `
                    <div class="w-12 h-12 rounded-lg overflow-hidden border-2 border-green-500">
                        <img src="${dataUrl}" class="w-full h-full object-cover" alt="Shot ${i + 1}">
                    </div>
                `;
            } else {
                html += `
                    <div class="w-12 h-12 rounded-lg border-2 border-dashed border-gray-500 flex items-center justify-center">
                        <span class="text-gray-500 text-sm">${i + 1}</span>
                    </div>
                `;
            }
        }

        elements.capturedThumbnails.innerHTML = html;
    }

    /**
     * Display captured result
     */
    function displayResult(sourceCanvas) {
        const resultCanvas = elements.resultCanvas;
        const ctx = resultCanvas.getContext('2d');

        resultCanvas.width = sourceCanvas.width;
        resultCanvas.height = sourceCanvas.height;

        ctx.drawImage(sourceCanvas, 0, 0);
    }

    /**
     * Retake photo
     */
    async function retakePhoto() {
        state.capturedCanvas = null;
        state.capturedFrames = [];
        await startCameraScreen();
    }

    /**
     * Download photo
     */
    function downloadPhoto() {
        if (!state.capturedCanvas) {
            console.error('No canvas to download');
            alert('Error: No photo to download. Please capture a photo first.');
            return;
        }

        try {
            const filename = state.isStripMode ? 'Tanggera_Photobooth' : 'Tanggera_Photo';
            const downloadedFile = Export.downloadImage(state.capturedCanvas, filename);
            console.log('Download initiated:', downloadedFile);
        } catch (error) {
            console.error('Download error:', error);
            alert('Error downloading photo. Please try again.');
        }
    }

    /**
     * Share photo
     */
    async function sharePhoto() {
        if (!state.capturedCanvas) return;

        try {
            await Export.shareImage(state.capturedCanvas);
        } catch (error) {
            console.error('Share error:', error);
            downloadPhoto();
        }
    }

    /**
     * Update share button visibility
     */
    function updateShareButton() {
        if (!Export.canShare()) {
            elements.btnShare.style.display = 'none';
            elements.btnDownload.classList.remove('flex-1');
            elements.btnDownload.classList.add('w-full');
        }
    }

    /**
     * Show error modal
     */
    function showError(message) {
        elements.errorMessage.textContent = message;
        elements.errorModal.classList.remove('hidden');
        showScreen('templates');
    }

    /**
     * Get user-friendly camera error message
     */
    function getCameraErrorMessage(error) {
        if (error.name === 'NotAllowedError') {
            return 'Camera access was denied. Please allow camera access in your browser settings and try again.';
        } else if (error.name === 'NotFoundError') {
            return 'No camera found. Please connect a camera and try again.';
        } else if (error.name === 'NotReadableError') {
            return 'Camera is in use by another application. Please close other apps using the camera and try again.';
        } else if (error.name === 'OverconstrainedError') {
            return 'Camera does not support the required settings. Please try a different camera.';
        } else {
            return `Camera error: ${error.message}. Please try again.`;
        }
    }

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    return {
        showScreen,
        getState: () => ({ ...state })
    };
})();
