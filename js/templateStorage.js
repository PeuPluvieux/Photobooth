/**
 * Template Storage Module
 * Manages localStorage persistence for custom templates
 * Provides CRUD operations with validation and quota management
 */

const TemplateStorage = (function() {
    const STORAGE_KEY = 'photobooth_custom_templates';
    const VERSION_KEY = 'photobooth_storage_version';
    const STORAGE_VERSION = 1;
    const MAX_TEMPLATES = 20;
    const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB in base64

    /**
     * Initialize storage with version check
     */
    function init() {
        const version = localStorage.getItem(VERSION_KEY);
        if (!version || parseInt(version) < STORAGE_VERSION) {
            // Future migration logic here
            localStorage.setItem(VERSION_KEY, STORAGE_VERSION.toString());
        }
    }

    /**
     * Get all custom templates from localStorage
     * @returns {Array} Array of template objects
     */
    function getAll() {
        try {
            const data = localStorage.getItem(STORAGE_KEY);
            if (!data) return [];

            const templates = JSON.parse(data);
            return Array.isArray(templates) ? templates : [];
        } catch (error) {
            console.error('Failed to load templates from localStorage:', error);
            return [];
        }
    }

    /**
     * Get template by ID
     * @param {string} id - Template ID
     * @returns {Object|null} Template object or null if not found
     */
    function getById(id) {
        const templates = getAll();
        return templates.find(t => t.id === id) || null;
    }

    /**
     * Save new template to localStorage
     * @param {Object} template - Template object to save
     * @returns {Object} Saved template with generated ID
     * @throws {Error} If validation fails or quota exceeded
     */
    function save(template) {
        // Validate template
        validateTemplate(template);

        // Check template limit
        const templates = getAll();
        if (templates.length >= MAX_TEMPLATES) {
            throw new Error(`Maximum ${MAX_TEMPLATES} templates allowed. Please delete some templates first.`);
        }

        // Generate ID and timestamps
        const newTemplate = {
            ...template,
            id: template.id || `custom-${Date.now()}`,
            isCustom: true,
            isDefault: false,
            createdAt: Date.now(),
            updatedAt: Date.now()
        };

        // Add to templates array
        templates.push(newTemplate);

        // Save to localStorage
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(templates));
            return newTemplate;
        } catch (error) {
            if (error.name === 'QuotaExceededError') {
                throw new Error('Storage quota exceeded. Please delete some templates or use smaller images.');
            }
            throw new Error('Failed to save template: ' + error.message);
        }
    }

    /**
     * Update existing template
     * @param {string} id - Template ID
     * @param {Object} updates - Template updates
     * @returns {Object} Updated template
     * @throws {Error} If template not found or validation fails
     */
    function update(id, updates) {
        const templates = getAll();
        const index = templates.findIndex(t => t.id === id);

        if (index === -1) {
            throw new Error('Template not found');
        }

        // Merge updates with existing template
        const updatedTemplate = {
            ...templates[index],
            ...updates,
            id: id, // Preserve ID
            isCustom: true, // Preserve custom flag
            createdAt: templates[index].createdAt, // Preserve creation date
            updatedAt: Date.now()
        };

        // Validate updated template
        validateTemplate(updatedTemplate);

        // Update in array
        templates[index] = updatedTemplate;

        // Save to localStorage
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(templates));
            return updatedTemplate;
        } catch (error) {
            if (error.name === 'QuotaExceededError') {
                throw new Error('Storage quota exceeded. Please use a smaller image.');
            }
            throw new Error('Failed to update template: ' + error.message);
        }
    }

    /**
     * Delete template by ID
     * @param {string} id - Template ID
     * @returns {boolean} True if deleted successfully
     * @throws {Error} If template not found
     */
    function remove(id) {
        const templates = getAll();
        const index = templates.findIndex(t => t.id === id);

        if (index === -1) {
            throw new Error('Template not found');
        }

        // Remove from array
        templates.splice(index, 1);

        // Save to localStorage
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(templates));
            return true;
        } catch (error) {
            throw new Error('Failed to delete template: ' + error.message);
        }
    }

    /**
     * Validate template object
     * @param {Object} template - Template to validate
     * @throws {Error} If validation fails
     */
    function validateTemplate(template) {
        // Required fields
        if (!template.name || typeof template.name !== 'string') {
            throw new Error('Template name is required');
        }

        if (template.name.length < 1 || template.name.length > 50) {
            throw new Error('Template name must be between 1 and 50 characters');
        }

        if (!template.shots || ![2, 3].includes(template.shots)) {
            throw new Error('Template must have 2 or 3 photo slots');
        }

        if (!template.frameImageData || typeof template.frameImageData !== 'string') {
            throw new Error('Template frame image is required');
        }

        // Check image data URL format
        if (!template.frameImageData.startsWith('data:image/png;base64,')) {
            throw new Error('Frame image must be a PNG data URL');
        }

        // Check base64 size (approximate)
        const base64Length = template.frameImageData.length;
        if (base64Length > MAX_FILE_SIZE * 1.37) { // Base64 is ~37% larger than binary
            throw new Error('Frame image is too large (max 5MB)');
        }

        if (!template.frameWidth || !template.frameHeight) {
            throw new Error('Template dimensions are required');
        }

        if (template.frameWidth < 500 || template.frameHeight < 500) {
            throw new Error('Template dimensions must be at least 500x500 pixels');
        }

        if (!Array.isArray(template.photoSlots) || template.photoSlots.length !== template.shots) {
            throw new Error(`Template must have exactly ${template.shots} photo slots`);
        }

        // Validate each photo slot
        template.photoSlots.forEach((slot, index) => {
            if (typeof slot.x !== 'number' || typeof slot.y !== 'number' ||
                typeof slot.width !== 'number' || typeof slot.height !== 'number') {
                throw new Error(`Photo slot ${index + 1} has invalid coordinates`);
            }

            if (slot.width < 50 || slot.height < 50) {
                throw new Error(`Photo slot ${index + 1} is too small (minimum 50x50 pixels)`);
            }

            // Check if slot is within frame bounds
            if (slot.x < 0 || slot.y < 0 ||
                slot.x + slot.width > template.frameWidth ||
                slot.y + slot.height > template.frameHeight) {
                throw new Error(`Photo slot ${index + 1} is outside frame boundaries`);
            }
        });

        return true;
    }

    /**
     * Clear all custom templates
     * @returns {boolean} True if cleared successfully
     */
    function clearAll() {
        try {
            localStorage.removeItem(STORAGE_KEY);
            return true;
        } catch (error) {
            throw new Error('Failed to clear templates: ' + error.message);
        }
    }

    /**
     * Export templates as JSON string
     * @returns {string} JSON string of all templates
     */
    function exportTemplates() {
        const templates = getAll();
        return JSON.stringify(templates, null, 2);
    }

    /**
     * Import templates from JSON string
     * @param {string} jsonData - JSON string of templates
     * @returns {number} Number of templates imported
     * @throws {Error} If import fails
     */
    function importTemplates(jsonData) {
        try {
            const importedTemplates = JSON.parse(jsonData);

            if (!Array.isArray(importedTemplates)) {
                throw new Error('Invalid template data format');
            }

            // Validate each template
            importedTemplates.forEach((template, index) => {
                try {
                    validateTemplate(template);
                } catch (error) {
                    throw new Error(`Template ${index + 1} validation failed: ${error.message}`);
                }
            });

            // Get existing templates
            const existingTemplates = getAll();

            // Check total count
            if (existingTemplates.length + importedTemplates.length > MAX_TEMPLATES) {
                throw new Error(`Import would exceed maximum ${MAX_TEMPLATES} templates`);
            }

            // Merge and save
            const allTemplates = [...existingTemplates, ...importedTemplates];
            localStorage.setItem(STORAGE_KEY, JSON.stringify(allTemplates));

            return importedTemplates.length;
        } catch (error) {
            throw new Error('Failed to import templates: ' + error.message);
        }
    }

    /**
     * Check if localStorage is available
     * @returns {boolean} True if localStorage is available
     */
    function isStorageAvailable() {
        try {
            const test = '__storage_test__';
            localStorage.setItem(test, test);
            localStorage.removeItem(test);
            return true;
        } catch (error) {
            return false;
        }
    }

    /**
     * Get storage usage information
     * @returns {Object} Storage usage stats
     */
    function getStorageInfo() {
        const templates = getAll();
        const dataSize = localStorage.getItem(STORAGE_KEY)?.length || 0;

        return {
            templateCount: templates.length,
            maxTemplates: MAX_TEMPLATES,
            dataSize: dataSize,
            dataSizeKB: (dataSize / 1024).toFixed(2),
            available: MAX_TEMPLATES - templates.length
        };
    }

    // Initialize on module load
    init();

    /**
     * Public API
     */
    return {
        getAll,
        getById,
        save,
        update,
        remove,
        validateTemplate,
        clearAll,
        exportTemplates,
        importTemplates,
        isStorageAvailable,
        getStorageInfo,
        MAX_TEMPLATES,
        MAX_FILE_SIZE
    };
})();
