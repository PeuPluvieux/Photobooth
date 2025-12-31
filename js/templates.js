/**
 * Templates Module
 * Manages template definitions, rendering, and selection
 * Integrates default templates with custom user-created templates from localStorage
 */

const Templates = (function() {
    // Default template definitions - built-in 2-photo and 3-photo strips
    const defaultTemplates = [
        // === 2-PHOTO TEMPLATE (Instagram Story Size) ===
        {
            id: '2-picture',
            name: '2 Photo Strip',
            category: 'strip',
            layout: 'strip',
            shots: 2,
            frameImage: 'templates/frames/Merry Christmas 2.png',
            frameWidth: 1080,
            frameHeight: 1920,
            // Exact photo slot positions (x, y, width, height)
            photoSlots: [
                { x: 130, y: 310, width: 830, height: 525 },   // Top photo
                { x: 133, y: 970, width: 830, height: 525 }    // Bottom photo
            ],
            style: 'custom-frame',
            isDefault: true,
            isCustom: false
        },
        // === 3-PHOTO TEMPLATE (Instagram Story Size) ===
        {
            id: '3-picture',
            name: '3 Photo Strip',
            category: 'strip',
            layout: 'strip',
            shots: 3,
            frameImage: 'templates/frames/Merry Christmas 3.png',
            frameWidth: 1080,
            frameHeight: 1920,
            // Exact photo slot positions (x, y, width, height)
            photoSlots: [
                { x: 130, y: 230, width: 600, height: 380 },   // Top photo
                { x: 380, y: 700, width: 605, height: 385 },   // Middle photo
                { x: 225, y: 1175, width: 595, height: 380 }   // Bottom photo
            ],
            style: 'custom-frame',
            isDefault: true,
            isCustom: false
        }
    ];

    let selectedTemplateId = null;

    /**
     * Get all templates (defaults + custom from localStorage)
     * @returns {Array} Array of all templates
     */
    function getAll() {
        const customTemplates = TemplateStorage.getAll();
        return [...defaultTemplates, ...customTemplates];
    }

    /**
     * Get only default templates
     * @returns {Array} Array of default templates
     */
    function getDefaults() {
        return defaultTemplates;
    }

    /**
     * Get only custom templates
     * @returns {Array} Array of custom templates from localStorage
     */
    function getCustom() {
        return TemplateStorage.getAll();
    }

    /**
     * Get templates by category
     * @param {string} category - Template category
     * @returns {Array} Filtered templates
     */
    function getByCategory(category) {
        return getAll().filter(t => t.category === category);
    }

    /**
     * Get templates by shot count
     * @param {number} shots - Number of photos (2 or 3)
     * @returns {Array} Filtered templates
     */
    function getByShots(shots) {
        return getAll().filter(t => t.shots === shots);
    }

    /**
     * Get template by ID (checks custom first, then defaults)
     * @param {string} id - Template ID
     * @returns {Object|null} Template object or null
     */
    function getById(id) {
        // Check custom templates first
        const custom = TemplateStorage.getById(id);
        if (custom) return custom;

        // Check default templates
        return defaultTemplates.find(t => t.id === id) || null;
    }

    /**
     * Set selected template
     * @param {string} id - Template ID to select
     * @returns {Object|null} Selected template
     */
    function select(id) {
        selectedTemplateId = id;
        return getById(id);
    }

    /**
     * Get currently selected template
     * @returns {Object|null} Currently selected template
     */
    function getSelected() {
        return selectedTemplateId ? getById(selectedTemplateId) : null;
    }

    /**
     * Delete a custom template
     * @param {string} id - Template ID to delete
     * @throws {Error} If trying to delete a default template
     * @returns {boolean} True if deleted successfully
     */
    function deleteTemplate(id) {
        const template = getById(id);

        if (!template) {
            throw new Error('Template not found');
        }

        if (template.isDefault) {
            throw new Error('Cannot delete default templates');
        }

        // Delete from localStorage
        const result = TemplateStorage.remove(id);

        // If currently selected, clear selection
        if (selectedTemplateId === id) {
            selectedTemplateId = null;
        }

        return result;
    }

    /**
     * Save a custom template
     * @param {Object} template - Template object to save
     * @returns {Object} Saved template with generated ID
     */
    function saveTemplate(template) {
        return TemplateStorage.save(template);
    }

    /**
     * Update an existing custom template
     * @param {string} id - Template ID
     * @param {Object} updates - Template updates
     * @returns {Object} Updated template
     */
    function updateTemplate(id, updates) {
        const template = getById(id);

        if (!template) {
            throw new Error('Template not found');
        }

        if (template.isDefault) {
            throw new Error('Cannot edit default templates');
        }

        return TemplateStorage.update(id, updates);
    }

    return {
        getAll,
        getDefaults,
        getCustom,
        getByCategory,
        getByShots,
        getById,
        select,
        getSelected,
        deleteTemplate,
        saveTemplate,
        updateTemplate
    };
})();
