/**
 * Template Builder Module
 * Handles template customization and preview
 */

const Builder = (function() {
    // Current configuration
    const config = {
        orientation: 'portrait',  // portrait | landscape
        shots: 1,                 // 1 | 3 | 4
        color: '#ffffff',
        borderStyle: 'solid',     // solid | double | glow | polaroid | filmstrip | rounded
        design: 'none',           // none | hearts | stars | party | birthday | wedding | christmas | halloween | floral | vintage | gradient | minimal
        customFrame: null,        // Custom frame image path
        customStickers: []        // Array of custom sticker configs
    };

    // Custom templates loaded from config.json
    let customTemplates = {
        frames: [],
        stickers: [],
        backgrounds: [],
        designThemes: []
    };

    // Preloaded images cache
    const imageCache = {};

    // Design decorations (emoji-based for now)
    const designs = {
        none: { decorations: [] },
        hearts: {
            decorations: ['💕', '❤️', '💗', '💖', '💝'],
            positions: ['top-left', 'top-right', 'bottom-left', 'bottom-right']
        },
        stars: {
            decorations: ['✨', '⭐', '🌟', '💫', '✧'],
            positions: ['top-left', 'top-right', 'bottom-left', 'bottom-right', 'top-center']
        },
        party: {
            decorations: ['🎉', '🎊', '🎈', '🎁', '🥳'],
            positions: ['top-left', 'top-right', 'bottom-left', 'bottom-right']
        },
        birthday: {
            decorations: ['🎂', '🎈', '🎁', '🎊', '🥳'],
            positions: ['top-center', 'bottom-left', 'bottom-right']
        },
        wedding: {
            decorations: ['💒', '💍', '🤍', '🕊️', '💐'],
            positions: ['top-center', 'bottom-left', 'bottom-right']
        },
        christmas: {
            decorations: ['🎄', '🎅', '⛄', '🎁', '❄️'],
            positions: ['top-left', 'top-right', 'bottom-left', 'bottom-right']
        },
        halloween: {
            decorations: ['🎃', '👻', '🦇', '🕷️', '💀'],
            positions: ['top-left', 'top-right', 'bottom-left', 'bottom-right']
        },
        floral: {
            decorations: ['🌸', '🌺', '🌷', '🌹', '🌻'],
            positions: ['top-left', 'top-right', 'bottom-left', 'bottom-right']
        },
        vintage: {
            decorations: ['📷', '🎞️', '📽️'],
            positions: ['bottom-center'],
            filter: 'sepia'
        },
        gradient: {
            decorations: [],
            backgroundGradient: true
        },
        minimal: {
            decorations: [],
            thinBorder: true
        }
    };

    // DOM elements
    let previewEl = null;

    /**
     * Initialize builder
     */
    async function init(previewElement) {
        previewEl = previewElement;
        await loadCustomTemplates();
        updatePreview();
    }

    /**
     * Load custom templates from config.json
     */
    async function loadCustomTemplates() {
        try {
            const response = await fetch('templates/config.json');
            if (response.ok) {
                customTemplates = await response.json();
                console.log('Loaded custom templates:', customTemplates);

                // Preload frame images
                for (const frame of customTemplates.frames || []) {
                    await preloadImage('templates/' + frame.file);
                }

                // Preload sticker images
                for (const sticker of customTemplates.stickers || []) {
                    await preloadImage('templates/' + sticker.file);
                }

                // Add custom design themes to designs object
                for (const theme of customTemplates.designThemes || []) {
                    designs[theme.id] = {
                        decorations: [],
                        customFrame: theme.frame ? 'templates/' + theme.frame : null,
                        customStickers: theme.stickers ? theme.stickers.map(s => 'templates/' + s) : [],
                        stickerPositions: theme.positions || []
                    };
                }
            }
        } catch (e) {
            console.log('No custom templates found, using defaults');
        }
    }

    /**
     * Preload an image and cache it
     */
    function preloadImage(src) {
        return new Promise((resolve) => {
            if (imageCache[src]) {
                resolve(imageCache[src]);
                return;
            }
            const img = new Image();
            img.onload = () => {
                imageCache[src] = img;
                resolve(img);
            };
            img.onerror = () => {
                console.warn('Failed to load image:', src);
                resolve(null);
            };
            img.src = src;
        });
    }

    /**
     * Get cached image
     */
    function getCachedImage(src) {
        return imageCache[src] || null;
    }

    /**
     * Get all custom frames
     */
    function getCustomFrames() {
        return customTemplates.frames || [];
    }

    /**
     * Get all custom stickers
     */
    function getCustomStickers() {
        return customTemplates.stickers || [];
    }

    /**
     * Set custom frame
     */
    function setCustomFrame(framePath) {
        config.customFrame = framePath;
        updatePreview();
    }

    /**
     * Set orientation
     */
    function setOrientation(orientation) {
        config.orientation = orientation;
        updatePreview();
    }

    /**
     * Set number of shots
     */
    function setShots(shots) {
        config.shots = parseInt(shots, 10);
        updatePreview();
    }

    /**
     * Set color
     */
    function setColor(color) {
        config.color = color;
        updatePreview();
    }

    /**
     * Set border style
     */
    function setBorderStyle(style) {
        config.borderStyle = style;
        updatePreview();
    }

    /**
     * Set design theme
     */
    function setDesign(design) {
        config.design = design;
        updatePreview();
    }

    /**
     * Get current config
     */
    function getConfig() {
        return { ...config };
    }

    /**
     * Generate template object from current config
     */
    function generateTemplate() {
        const isRainbow = config.color === 'rainbow';
        const borderWidth = config.borderStyle === 'minimal' ? 8 : (config.shots > 1 ? 25 : 35);
        const designData = designs[config.design] || { decorations: [] };

        return {
            id: 'custom',
            name: 'Custom Template',
            layout: config.shots > 1 ? 'strip' : 'single',
            shots: config.shots,
            orientation: config.orientation,
            borderColor: isRainbow ? 'linear-gradient(45deg, #ff6b6b, #feca57, #48dbfb, #ff9ff3)' : config.color,
            borderWidth: borderWidth,
            borderRadius: config.borderStyle === 'rounded' ? 20 : 0,
            photoGap: 12,
            style: config.borderStyle === 'glow' ? 'glow' :
                   config.borderStyle === 'double' ? 'double' :
                   config.borderStyle === 'filmstrip' ? 'filmstrip' :
                   config.borderStyle === 'polaroid' ? 'polaroid' :
                   isRainbow ? 'gradient' : 'solid',
            design: config.design,
            designData: designData,
            customFrame: config.customFrame || designData.customFrame || null,
            customStickers: designData.customStickers || [],
            stickerPositions: designData.stickerPositions || [],
            shadowColor: isRainbow ? 'rgba(255,107,107,0.4)' :
                         config.borderStyle === 'glow' ? config.color :
                         'rgba(0,0,0,0.3)',
            glowIntensity: config.borderStyle === 'glow' ? 20 : 0,
            sprocketColor: '#ffffff',
            borderBottom: config.borderStyle === 'polaroid' ? 80 : undefined,
            innerBorderColor: config.borderStyle === 'double' ? adjustColor(config.color, -30) : null,
            innerBorderWidth: config.borderStyle === 'double' ? 3 : 0
        };
    }

    /**
     * Adjust color brightness
     */
    function adjustColor(color, amount) {
        if (color === 'rainbow' || color.includes('gradient')) return color;

        const hex = color.replace('#', '');
        const r = Math.max(0, Math.min(255, parseInt(hex.substr(0, 2), 16) + amount));
        const g = Math.max(0, Math.min(255, parseInt(hex.substr(2, 2), 16) + amount));
        const b = Math.max(0, Math.min(255, parseInt(hex.substr(4, 2), 16) + amount));

        return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
    }

    /**
     * Update preview display
     */
    function updatePreview() {
        if (!previewEl) return;

        const isPortrait = config.orientation === 'portrait';
        const width = isPortrait ? 280 : 373;
        const height = isPortrait ? 373 : 280;

        previewEl.style.width = `${width}px`;
        previewEl.style.height = `${height}px`;

        // Generate preview HTML
        const template = generateTemplate();
        previewEl.innerHTML = generatePreviewHTML(template, width, height);
    }

    /**
     * Generate preview HTML
     */
    function generatePreviewHTML(template, width, height) {
        const padding = Math.min(template.borderWidth, 25);
        const isRainbow = config.color === 'rainbow';

        // Calculate photo slots
        const shots = template.shots;
        const isStrip = shots > 1;
        const gap = 8;

        let photoSlotsHTML = '';
        if (isStrip) {
            const slotHeight = (height - padding * 2 - gap * (shots - 1)) / shots;
            for (let i = 0; i < shots; i++) {
                const top = padding + i * (slotHeight + gap);
                photoSlotsHTML += `
                    <div style="
                        position: absolute;
                        left: ${padding}px;
                        right: ${padding}px;
                        top: ${top}px;
                        height: ${slotHeight}px;
                        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                        border-radius: 4px;
                    "></div>
                `;
            }
        } else {
            const photoTop = template.borderStyle === 'polaroid' ? padding : padding;
            const photoBottom = template.borderStyle === 'polaroid' ? 60 : padding;
            photoSlotsHTML = `
                <div style="
                    position: absolute;
                    left: ${padding}px;
                    right: ${padding}px;
                    top: ${photoTop}px;
                    bottom: ${photoBottom}px;
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    border-radius: ${template.borderRadius / 2}px;
                "></div>
            `;
        }

        // Build frame styles
        let frameStyle = '';
        let backgroundStyle = '';

        if (isRainbow) {
            backgroundStyle = 'background: linear-gradient(45deg, #ff6b6b, #feca57, #48dbfb, #ff9ff3);';
        } else if (template.style === 'glow') {
            backgroundStyle = `background: #111; box-shadow: inset 0 0 ${template.glowIntensity}px ${template.borderColor}, 0 0 ${template.glowIntensity}px ${template.borderColor};`;
        } else {
            backgroundStyle = `background: ${template.borderColor};`;
        }

        frameStyle = `
            position: absolute;
            inset: 0;
            ${backgroundStyle}
            border-radius: ${template.borderRadius}px;
        `;

        // Inner border for double style
        let innerBorderHTML = '';
        if (template.style === 'double' && template.innerBorderColor) {
            innerBorderHTML = `
                <div style="
                    position: absolute;
                    inset: ${padding - 5}px;
                    border: 3px solid ${template.innerBorderColor};
                    border-radius: ${template.borderRadius}px;
                    pointer-events: none;
                "></div>
            `;
        }

        // Filmstrip sprockets
        let sprocketsHTML = '';
        if (template.style === 'filmstrip') {
            const sprocketCount = Math.max(8, shots * 3);
            let leftSprockets = '';
            let rightSprockets = '';
            for (let i = 0; i < sprocketCount; i++) {
                leftSprockets += '<div style="width: 8px; height: 5px; background: #fff; border-radius: 1px;"></div>';
                rightSprockets += '<div style="width: 8px; height: 5px; background: #fff; border-radius: 1px;"></div>';
            }
            sprocketsHTML = `
                <div style="position: absolute; left: 4px; top: 0; bottom: 0; width: 12px; display: flex; flex-direction: column; justify-content: space-evenly; padding: 8px 0;">
                    ${leftSprockets}
                </div>
                <div style="position: absolute; right: 4px; top: 0; bottom: 0; width: 12px; display: flex; flex-direction: column; justify-content: space-evenly; padding: 8px 0;">
                    ${rightSprockets}
                </div>
            `;
        }

        // Design decorations
        let decorationsHTML = '';
        const designData = designs[config.design];
        if (designData && designData.decorations.length > 0) {
            const positions = {
                'top-left': 'top: 2px; left: 5px;',
                'top-right': 'top: 2px; right: 5px;',
                'top-center': 'top: 2px; left: 50%; transform: translateX(-50%);',
                'bottom-left': 'bottom: 2px; left: 5px;',
                'bottom-right': 'bottom: 2px; right: 5px;',
                'bottom-center': 'bottom: 5px; left: 50%; transform: translateX(-50%);'
            };

            designData.positions.forEach((pos, i) => {
                const emoji = designData.decorations[i % designData.decorations.length];
                decorationsHTML += `
                    <span style="position: absolute; ${positions[pos]} font-size: 16px; z-index: 10;">
                        ${emoji}
                    </span>
                `;
            });
        }

        // Gradient overlay for gradient design
        let gradientOverlay = '';
        if (config.design === 'gradient') {
            gradientOverlay = `
                <div style="
                    position: absolute;
                    inset: 0;
                    background: linear-gradient(135deg, rgba(255,107,107,0.3) 0%, rgba(254,202,87,0.3) 50%, rgba(72,219,251,0.3) 100%);
                    border-radius: ${template.borderRadius}px;
                    pointer-events: none;
                "></div>
            `;
        }

        return `
            <div style="${frameStyle}">
                ${photoSlotsHTML}
                ${innerBorderHTML}
                ${sprocketsHTML}
                ${decorationsHTML}
                ${gradientOverlay}
            </div>
        `;
    }

    return {
        init,
        setOrientation,
        setShots,
        setColor,
        setBorderStyle,
        setDesign,
        setCustomFrame,
        getConfig,
        generateTemplate,
        updatePreview,
        getCustomFrames,
        getCustomStickers,
        getCachedImage,
        preloadImage
    };
})();
