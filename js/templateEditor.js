/**
 * Template Editor Module
 * Interactive canvas-based editor for positioning photo slots with drag/resize
 */

const TemplateEditor = (function() {
    let state = {
        frameImage: null,
        frameWidth: 0,
        frameHeight: 0,
        shotCount: 2,
        photoSlots: [],
        editingSlotIndex: -1,
        templateName: '',
        templateId: null, // null for new, ID for edit
        createdAt: null
    };

    let elements = {};
    let canvas = null;
    let ctx = null;
    let scale = 1; // Scale factor for display

    // Drag/resize state
    let isDragging = false;
    let isResizing = false;
    let dragStart = { x: 0, y: 0 };
    let activeSlot = null;
    let resizeHandle = null;

    const HANDLE_SIZE = 12;
    const MIN_SLOT_SIZE = 50;

    /**
     * Initialize the template editor
     */
    function init() {
        cacheElements();
        bindEvents();
    }

    /**
     * Cache DOM elements
     */
    function cacheElements() {
        elements.editorCanvas = document.getElementById('editor-canvas');
        elements.fileInput = document.getElementById('frame-upload');
        elements.btnUpload = document.getElementById('btn-upload-frame');
        elements.templateName = document.getElementById('template-name');
        elements.shotCountSelect = document.getElementById('shot-count');
        elements.btnSaveTemplate = document.getElementById('btn-save-template');
        elements.btnCancelEditor = document.getElementById('btn-cancel-editor');
        elements.framePreviewContainer = document.getElementById('frame-preview-container');
        elements.framePreviewImg = document.getElementById('frame-preview-img');
        elements.frameDimensions = document.getElementById('frame-dimensions');
        elements.slotList = document.getElementById('slot-list');
        elements.btnResetSlots = document.getElementById('btn-reset-slots');

        if (elements.editorCanvas) {
            canvas = elements.editorCanvas;
            ctx = canvas.getContext('2d');
        }
    }

    /**
     * Bind event handlers
     */
    function bindEvents() {
        if (!elements.fileInput) return;

        // File upload
        elements.btnUpload?.addEventListener('click', () => {
            elements.fileInput.click();
        });

        elements.fileInput.addEventListener('change', handleFileUpload);

        // Canvas mouse events
        if (canvas) {
            canvas.addEventListener('mousedown', handleMouseDown);
            canvas.addEventListener('mousemove', handleMouseMove);
            canvas.addEventListener('mouseup', handleMouseUp);
            canvas.addEventListener('mouseleave', handleMouseUp);

            // Touch events for mobile
            canvas.addEventListener('touchstart', handleTouchStart, { passive: false });
            canvas.addEventListener('touchmove', handleTouchMove, { passive: false });
            canvas.addEventListener('touchend', handleTouchEnd);
        }

        // UI controls
        elements.shotCountSelect?.addEventListener('change', handleShotCountChange);
        elements.btnSaveTemplate?.addEventListener('click', saveTemplate);
        elements.btnCancelEditor?.addEventListener('click', cancelEditor);
        elements.btnResetSlots?.addEventListener('click', () => {
            initializeDefaultSlots(state.shotCount);
            renderEditor();
            updateSlotList();
        });

        elements.templateName?.addEventListener('input', (e) => {
            state.templateName = e.target.value;
        });
    }

    /**
     * Handle file upload
     */
    async function handleFileUpload(event) {
        const file = event.target.files[0];
        if (!file) return;

        try {
            // Process upload
            const imageData = await TemplateUploader.processUpload(file);

            // Show preview
            elements.framePreviewImg.src = imageData.dataUrl;
            elements.framePreviewContainer.classList.remove('hidden');
            elements.frameDimensions.textContent = `${imageData.width} x ${imageData.height} pixels (${TemplateUploader.formatFileSize(file.size)})`;

            // Show warning if needed
            if (imageData.sizeWarning) {
                alert(imageData.sizeWarning);
            }

            // Load into editor
            loadFrameImage(imageData);

        } catch (error) {
            alert('Upload Error: ' + error.message);
            console.error('Upload error:', error);
        }
    }

    /**
     * Load frame image into editor
     */
    function loadFrameImage(imageData) {
        state.frameImage = imageData.image;
        state.frameWidth = imageData.width;
        state.frameHeight = imageData.height;

        // Initialize default slots
        initializeDefaultSlots(state.shotCount);

        // Render editor
        renderEditor();
        updateSlotList();
    }

    /**
     * Initialize default photo slots with smart positioning
     */
    function initializeDefaultSlots(shotCount) {
        state.photoSlots = [];
        state.shotCount = shotCount;

        const margin = Math.floor(state.frameWidth * 0.12); // 12% margin
        const slotWidth = Math.floor(state.frameWidth * 0.77); // 77% of frame width
        const gap = Math.floor(state.frameHeight * 0.04); // 4% gap between slots

        const availableHeight = state.frameHeight - (2 * margin);
        const totalGapHeight = gap * (shotCount - 1);
        const slotHeight = Math.floor((availableHeight - totalGapHeight) / shotCount);

        for (let i = 0; i < shotCount; i++) {
            state.photoSlots.push({
                x: margin,
                y: margin + (i * (slotHeight + gap)),
                width: slotWidth,
                height: slotHeight
            });
        }
    }

    /**
     * Render editor canvas
     */
    function renderEditor() {
        if (!canvas || !state.frameImage) return;

        // Calculate scale to fit canvas in container
        const container = canvas.parentElement;
        const containerWidth = container.offsetWidth - 40; // Padding
        const containerHeight = Math.min(600, window.innerHeight * 0.5);

        scale = Math.min(
            containerWidth / state.frameWidth,
            containerHeight / state.frameHeight,
            1 // Don't scale up
        );

        canvas.width = state.frameWidth * scale;
        canvas.height = state.frameHeight * scale;

        // Clear canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Draw frame image
        ctx.drawImage(state.frameImage, 0, 0, canvas.width, canvas.height);

        // Draw photo slots
        state.photoSlots.forEach((slot, index) => {
            drawPhotoSlot(slot, index);
        });
    }

    /**
     * Draw a photo slot overlay
     */
    function drawPhotoSlot(slot, index) {
        const x = slot.x * scale;
        const y = slot.y * scale;
        const w = slot.width * scale;
        const h = slot.height * scale;

        const isActive = state.editingSlotIndex === index;

        // Draw semi-transparent fill
        ctx.fillStyle = isActive ? 'rgba(46, 125, 50, 0.4)' : 'rgba(76, 175, 80, 0.3)';
        ctx.fillRect(x, y, w, h);

        // Draw border
        ctx.strokeStyle = isActive ? '#2e7d32' : '#4caf50';
        ctx.lineWidth = isActive ? 3 : 2;
        ctx.strokeRect(x, y, w, h);

        // Draw label
        ctx.fillStyle = '#ffffff';
        ctx.font = `bold ${Math.max(14, 16 * scale)}px Arial`;
        ctx.shadowColor = 'rgba(0, 0, 0, 0.8)';
        ctx.shadowBlur = 4;
        ctx.fillText(`Photo ${index + 1}`, x + 10, y + 25);
        ctx.shadowBlur = 0;

        // Draw dimensions
        ctx.font = `${Math.max(11, 12 * scale)}px Arial`;
        ctx.fillText(`${slot.width} x ${slot.height}`, x + 10, y + h - 10);

        // Draw resize handles if active
        if (isActive) {
            drawResizeHandles(x, y, w, h);
        }
    }

    /**
     * Draw resize handles on active slot
     */
    function drawResizeHandles(x, y, w, h) {
        const handleSize = HANDLE_SIZE;

        ctx.fillStyle = '#ffffff';
        ctx.strokeStyle = '#2e7d32';
        ctx.lineWidth = 2;

        // Corner handles
        const handles = [
            { x: x - handleSize/2, y: y - handleSize/2, type: 'tl' },
            { x: x + w - handleSize/2, y: y - handleSize/2, type: 'tr' },
            { x: x - handleSize/2, y: y + h - handleSize/2, type: 'bl' },
            { x: x + w - handleSize/2, y: y + h - handleSize/2, type: 'br' }
        ];

        handles.forEach(handle => {
            ctx.fillRect(handle.x, handle.y, handleSize, handleSize);
            ctx.strokeRect(handle.x, handle.y, handleSize, handleSize);
        });
    }

    /**
     * Handle mouse down
     */
    function handleMouseDown(e) {
        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        // Check if clicked on resize handle first
        if (state.editingSlotIndex !== -1) {
            const handleHit = checkResizeHandleHit(x, y, state.editingSlotIndex);
            if (handleHit) {
                isResizing = true;
                activeSlot = state.editingSlotIndex;
                resizeHandle = handleHit;
                dragStart = { x, y };
                canvas.style.cursor = getCursorForHandle(handleHit);
                return;
            }
        }

        // Check if clicked on any slot
        for (let i = state.photoSlots.length - 1; i >= 0; i--) {
            const slot = state.photoSlots[i];
            const sx = slot.x * scale;
            const sy = slot.y * scale;
            const sw = slot.width * scale;
            const sh = slot.height * scale;

            if (x >= sx && x <= sx + sw && y >= sy && y <= sy + sh) {
                isDragging = true;
                activeSlot = i;
                state.editingSlotIndex = i;
                dragStart = { x: x - sx, y: y - sy };
                canvas.style.cursor = 'move';
                renderEditor();
                updateSlotList();
                return;
            }
        }

        // Clicked outside - deselect
        state.editingSlotIndex = -1;
        renderEditor();
        updateSlotList();
    }

    /**
     * Handle mouse move
     */
    function handleMouseMove(e) {
        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        if (isDragging && activeSlot !== null) {
            // Move slot
            const newX = (x - dragStart.x) / scale;
            const newY = (y - dragStart.y) / scale;

            // Constrain to frame boundaries
            state.photoSlots[activeSlot].x = Math.max(0, Math.min(newX, state.frameWidth - state.photoSlots[activeSlot].width));
            state.photoSlots[activeSlot].y = Math.max(0, Math.min(newY, state.frameHeight - state.photoSlots[activeSlot].height));

            renderEditor();
            updateSlotList();
        } else if (isResizing && activeSlot !== null) {
            // Resize slot
            resizeSlot(x, y);
            renderEditor();
            updateSlotList();
        } else {
            // Update cursor based on hover
            updateCursor(x, y);
        }
    }

    /**
     * Handle mouse up
     */
    function handleMouseUp(e) {
        isDragging = false;
        isResizing = false;
        activeSlot = null;
        resizeHandle = null;
        canvas.style.cursor = 'default';
    }

    /**
     * Handle touch start
     */
    function handleTouchStart(e) {
        e.preventDefault();
        const touch = e.touches[0];
        const mouseEvent = new MouseEvent('mousedown', {
            clientX: touch.clientX,
            clientY: touch.clientY
        });
        canvas.dispatchEvent(mouseEvent);
    }

    /**
     * Handle touch move
     */
    function handleTouchMove(e) {
        e.preventDefault();
        const touch = e.touches[0];
        const mouseEvent = new MouseEvent('mousemove', {
            clientX: touch.clientX,
            clientY: touch.clientY
        });
        canvas.dispatchEvent(mouseEvent);
    }

    /**
     * Handle touch end
     */
    function handleTouchEnd(e) {
        e.preventDefault();
        const mouseEvent = new MouseEvent('mouseup', {});
        canvas.dispatchEvent(mouseEvent);
    }

    /**
     * Check if cursor is over a resize handle
     */
    function checkResizeHandleHit(x, y, slotIndex) {
        const slot = state.photoSlots[slotIndex];
        const sx = slot.x * scale;
        const sy = slot.y * scale;
        const sw = slot.width * scale;
        const sh = slot.height * scale;

        const tolerance = HANDLE_SIZE / 2 + 3;

        if (Math.abs(x - sx) < tolerance && Math.abs(y - sy) < tolerance) return 'tl';
        if (Math.abs(x - (sx + sw)) < tolerance && Math.abs(y - sy) < tolerance) return 'tr';
        if (Math.abs(x - sx) < tolerance && Math.abs(y - (sy + sh)) < tolerance) return 'bl';
        if (Math.abs(x - (sx + sw)) < tolerance && Math.abs(y - (sy + sh)) < tolerance) return 'br';

        return null;
    }

    /**
     * Resize slot based on handle
     */
    function resizeSlot(x, y) {
        const slot = state.photoSlots[activeSlot];
        const newX = x / scale;
        const newY = y / scale;

        const originalX = slot.x;
        const originalY = slot.y;
        const originalRight = slot.x + slot.width;
        const originalBottom = slot.y + slot.height;

        switch (resizeHandle) {
            case 'br': // Bottom-right
                slot.width = Math.max(MIN_SLOT_SIZE, Math.min(newX - slot.x, state.frameWidth - slot.x));
                slot.height = Math.max(MIN_SLOT_SIZE, Math.min(newY - slot.y, state.frameHeight - slot.y));
                break;

            case 'tr': // Top-right
                slot.width = Math.max(MIN_SLOT_SIZE, Math.min(newX - slot.x, state.frameWidth - slot.x));
                slot.y = Math.max(0, Math.min(newY, originalBottom - MIN_SLOT_SIZE));
                slot.height = originalBottom - slot.y;
                break;

            case 'bl': // Bottom-left
                slot.x = Math.max(0, Math.min(newX, originalRight - MIN_SLOT_SIZE));
                slot.width = originalRight - slot.x;
                slot.height = Math.max(MIN_SLOT_SIZE, Math.min(newY - slot.y, state.frameHeight - slot.y));
                break;

            case 'tl': // Top-left
                slot.x = Math.max(0, Math.min(newX, originalRight - MIN_SLOT_SIZE));
                slot.y = Math.max(0, Math.min(newY, originalBottom - MIN_SLOT_SIZE));
                slot.width = originalRight - slot.x;
                slot.height = originalBottom - slot.y;
                break;
        }
    }

    /**
     * Update cursor based on hover position
     */
    function updateCursor(x, y) {
        if (state.editingSlotIndex !== -1) {
            const handleHit = checkResizeHandleHit(x, y, state.editingSlotIndex);
            if (handleHit) {
                canvas.style.cursor = getCursorForHandle(handleHit);
                return;
            }
        }

        // Check if over any slot
        for (let i = state.photoSlots.length - 1; i >= 0; i--) {
            const slot = state.photoSlots[i];
            const sx = slot.x * scale;
            const sy = slot.y * scale;
            const sw = slot.width * scale;
            const sh = slot.height * scale;

            if (x >= sx && x <= sx + sw && y >= sy && y <= sy + sh) {
                canvas.style.cursor = 'move';
                return;
            }
        }

        canvas.style.cursor = 'default';
    }

    /**
     * Get cursor style for resize handle
     */
    function getCursorForHandle(handle) {
        switch (handle) {
            case 'tl': case 'br': return 'nwse-resize';
            case 'tr': case 'bl': return 'nesw-resize';
            default: return 'default';
        }
    }

    /**
     * Update slot list display
     */
    function updateSlotList() {
        if (!elements.slotList) return;

        elements.slotList.innerHTML = state.photoSlots.map((slot, index) => `
            <div class="flex items-center justify-between text-sm p-2 rounded ${state.editingSlotIndex === index ? 'bg-green-50 border border-green-300' : 'bg-gray-50'}">
                <span class="font-medium">Photo ${index + 1}</span>
                <span class="text-gray-600">x:${slot.x}, y:${slot.y}, ${slot.width}×${slot.height}</span>
            </div>
        `).join('');
    }

    /**
     * Handle shot count change
     */
    function handleShotCountChange(e) {
        const newCount = parseInt(e.target.value);
        if (confirm(`Change to ${newCount} photos? This will reset slot positions.`)) {
            state.shotCount = newCount;
            initializeDefaultSlots(newCount);
            renderEditor();
            updateSlotList();
        } else {
            e.target.value = state.shotCount;
        }
    }

    /**
     * Save template
     */
    async function saveTemplate() {
        // Validate
        if (!state.templateName || !state.frameImage) {
            alert('Please provide a template name and frame image');
            return;
        }

        if (state.templateName.length < 1 || state.templateName.length > 50) {
            alert('Template name must be between 1 and 50 characters');
            return;
        }

        // Create template object
        const template = {
            id: state.templateId || `custom-${Date.now()}`,
            name: state.templateName,
            shots: state.shotCount,
            frameImageData: elements.framePreviewImg.src, // Data URL
            frameImage: elements.framePreviewImg.src, // For runtime use
            frameWidth: state.frameWidth,
            frameHeight: state.frameHeight,
            photoSlots: JSON.parse(JSON.stringify(state.photoSlots)), // Deep copy
            style: 'custom-frame',
            category: 'strip',
            layout: 'strip',
            isCustom: true
        };

        try {
            if (state.templateId) {
                template.createdAt = state.createdAt;
                await TemplateStorage.update(state.templateId, template);
                alert('Template updated successfully!');
            } else {
                await TemplateStorage.save(template);
                alert('Template saved successfully!');
            }

            // Return to template selection
            if (typeof App !== 'undefined' && App.showScreen) {
                App.showScreen('templates');
            }
            resetEditor();
        } catch (error) {
            alert(`Failed to save template: ${error.message}`);
            console.error('Save error:', error);
        }
    }

    /**
     * Cancel editing
     */
    function cancelEditor() {
        if (confirm('Discard changes and return to template selection?')) {
            if (typeof App !== 'undefined' && App.showScreen) {
                App.showScreen('templates');
            }
            resetEditor();
        }
    }

    /**
     * Reset editor state
     */
    function resetEditor() {
        state = {
            frameImage: null,
            frameWidth: 0,
            frameHeight: 0,
            shotCount: 2,
            photoSlots: [],
            editingSlotIndex: -1,
            templateName: '',
            templateId: null,
            createdAt: null
        };

        if (elements.templateName) elements.templateName.value = '';
        if (elements.shotCountSelect) elements.shotCountSelect.value = '2';
        if (elements.fileInput) elements.fileInput.value = '';
        if (elements.framePreviewContainer) elements.framePreviewContainer.classList.add('hidden');
        if (canvas) ctx.clearRect(0, 0, canvas.width, canvas.height);
        if (elements.slotList) elements.slotList.innerHTML = '';
    }

    /**
     * Load template for editing
     */
    function loadTemplate(templateId) {
        const template = TemplateStorage.getById(templateId);
        if (!template) {
            alert('Template not found');
            return;
        }

        state.templateId = template.id;
        state.templateName = template.name;
        state.shotCount = template.shots;
        state.frameWidth = template.frameWidth;
        state.frameHeight = template.frameHeight;
        state.photoSlots = JSON.parse(JSON.stringify(template.photoSlots));
        state.createdAt = template.createdAt;

        // Update UI
        if (elements.templateName) elements.templateName.value = template.name;
        if (elements.shotCountSelect) elements.shotCountSelect.value = template.shots.toString();

        // Load image
        const img = new Image();
        img.onload = () => {
            state.frameImage = img;
            elements.framePreviewImg.src = template.frameImageData;
            elements.framePreviewContainer.classList.remove('hidden');
            elements.frameDimensions.textContent = `${template.frameWidth} x ${template.frameHeight} pixels`;
            renderEditor();
            updateSlotList();
        };
        img.src = template.frameImageData;
    }

    /**
     * Public API
     */
    return {
        init,
        loadFrameImage,
        loadTemplate,
        resetEditor,
        saveTemplate,
        getState: () => ({ ...state })
    };
})();
