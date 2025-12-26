/**
 * Capture Module
 * Handles countdown timer, flash effect, and photo capture (single and multi-shot)
 */

const Capture = (function() {
    let countdownSeconds = 3;
    let isCapturing = false;
    let countdownInterval = null;

    // DOM elements
    let countdownDisplay = null;
    let flashEffect = null;
    let shotIndicator = null;

    // Audio
    let shutterSound = null;

    /**
     * Initialize capture module
     */
    function init(elements) {
        countdownDisplay = elements.countdownDisplay;
        flashEffect = elements.flashEffect;
        shotIndicator = elements.shotIndicator;

        // Create shutter sound
        shutterSound = createShutterSound();
    }

    /**
     * Create shutter sound using Web Audio API
     */
    function createShutterSound() {
        try {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();

            return function playShutter() {
                const oscillator = audioContext.createOscillator();
                const gainNode = audioContext.createGain();

                oscillator.connect(gainNode);
                gainNode.connect(audioContext.destination);

                oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
                oscillator.frequency.exponentialRampToValueAtTime(200, audioContext.currentTime + 0.1);

                gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
                gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);

                oscillator.start(audioContext.currentTime);
                oscillator.stop(audioContext.currentTime + 0.1);
            };
        } catch (e) {
            console.warn('Web Audio API not supported');
            return () => {};
        }
    }

    /**
     * Set countdown duration
     */
    function setCountdown(seconds) {
        countdownSeconds = seconds;
    }

    /**
     * Get current countdown setting
     */
    function getCountdown() {
        return countdownSeconds;
    }

    /**
     * Start single capture with countdown
     */
    function startCapture(onComplete) {
        if (isCapturing) return;
        isCapturing = true;

        if (countdownSeconds === 0) {
            triggerCapture(onComplete);
        } else {
            let remaining = countdownSeconds;
            showCountdown(remaining);

            countdownInterval = setInterval(() => {
                remaining--;

                if (remaining <= 0) {
                    clearInterval(countdownInterval);
                    hideCountdown();
                    triggerCapture(onComplete);
                } else {
                    showCountdown(remaining);
                }
            }, 1000);
        }
    }

    /**
     * Start multi-shot capture for photo strips
     * @param {number} totalShots - Number of shots to capture
     * @param {function} onEachShot - Callback after each shot (receives shot index)
     * @param {function} onAllComplete - Callback after all shots complete
     */
    function startMultiCapture(totalShots, onEachShot, onAllComplete) {
        if (isCapturing) return;
        isCapturing = true;

        let currentShot = 0;
        const delayBetweenShots = 1500; // 1.5 seconds between shots

        function captureNextShot() {
            if (currentShot >= totalShots) {
                // All shots complete
                isCapturing = false;
                hideShotIndicator();
                if (onAllComplete) onAllComplete();
                return;
            }

            // Show shot indicator
            showShotIndicator(currentShot + 1, totalShots);

            // Use countdown for each shot
            if (countdownSeconds === 0) {
                triggerCaptureWithCallback(() => {
                    if (onEachShot) onEachShot(currentShot);
                    currentShot++;

                    // Delay before next shot
                    setTimeout(captureNextShot, delayBetweenShots);
                });
            } else {
                let remaining = countdownSeconds;
                showCountdown(remaining);

                countdownInterval = setInterval(() => {
                    remaining--;

                    if (remaining <= 0) {
                        clearInterval(countdownInterval);
                        hideCountdown();

                        triggerCaptureWithCallback(() => {
                            if (onEachShot) onEachShot(currentShot);
                            currentShot++;

                            // Delay before next shot
                            setTimeout(captureNextShot, delayBetweenShots);
                        });
                    } else {
                        showCountdown(remaining);
                    }
                }, 1000);
            }
        }

        // Start the capture sequence
        captureNextShot();
    }

    /**
     * Cancel ongoing capture
     */
    function cancelCapture() {
        if (countdownInterval) {
            clearInterval(countdownInterval);
            countdownInterval = null;
        }
        hideCountdown();
        hideShotIndicator();
        isCapturing = false;
    }

    /**
     * Show countdown number
     */
    function showCountdown(number) {
        if (!countdownDisplay) return;

        const numberEl = countdownDisplay.querySelector('.countdown-number');
        if (numberEl) {
            numberEl.textContent = number;
            numberEl.classList.remove('countdown-animate');
            void numberEl.offsetWidth;
            numberEl.classList.add('countdown-animate');
        }

        countdownDisplay.classList.remove('hidden');
    }

    /**
     * Hide countdown display
     */
    function hideCountdown() {
        if (countdownDisplay) {
            countdownDisplay.classList.add('hidden');
        }
    }

    /**
     * Show shot indicator for multi-shot mode
     */
    function showShotIndicator(current, total) {
        if (!shotIndicator) return;

        const textEl = shotIndicator.querySelector('.shot-text');
        if (textEl) {
            textEl.textContent = `Photo ${current} of ${total}`;
        }

        shotIndicator.classList.remove('hidden');
    }

    /**
     * Hide shot indicator
     */
    function hideShotIndicator() {
        if (shotIndicator) {
            shotIndicator.classList.add('hidden');
        }
    }

    /**
     * Trigger the actual capture
     */
    function triggerCapture(onComplete) {
        triggerCaptureWithCallback(() => {
            isCapturing = false;
            if (onComplete) onComplete();
        });
    }

    /**
     * Trigger capture with callback (for multi-shot)
     */
    function triggerCaptureWithCallback(callback) {
        // Play sound
        if (shutterSound) {
            shutterSound();
        }

        // Show flash
        showFlash();

        // Small delay for flash effect, then complete
        setTimeout(callback, 150);
    }

    /**
     * Show flash effect
     */
    function showFlash() {
        if (!flashEffect) return;

        flashEffect.classList.remove('hidden');
        flashEffect.style.opacity = '1';

        requestAnimationFrame(() => {
            flashEffect.style.transition = 'opacity 300ms ease-out';
            flashEffect.style.opacity = '0';

            setTimeout(() => {
                flashEffect.classList.add('hidden');
                flashEffect.style.transition = '';
            }, 300);
        });
    }

    /**
     * Check if currently capturing
     */
    function isBusy() {
        return isCapturing;
    }

    return {
        init,
        setCountdown,
        getCountdown,
        startCapture,
        startMultiCapture,
        cancelCapture,
        isBusy
    };
})();
