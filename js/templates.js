/**
 * Templates Module
 * Manages template definitions, rendering, and selection
 */

const Templates = (function() {
    // Template definitions - only 2 templates for 2-photo and 3-photo strips
    const templateList = [
        // === 2-PHOTO TEMPLATE ===
        {
            id: '2-picture',
            name: '2 Photo Strip',
            category: 'strip',
            layout: 'strip',
            shots: 2,
            frameImage: 'templates/frames/2 picture.png',
            frameWidth: 707,
            frameHeight: 2000,
            // Exact photo slot positions (x, y, width, height)
            photoSlots: [
                { x: 46, y: 182, width: 614, height: 713 },   // Top photo (red border)
                { x: 46, y: 937, width: 614, height: 712 }    // Bottom photo (yellow border)
            ],
            style: 'custom-frame'
        },
        // === 3-PHOTO TEMPLATE ===
        {
            id: '3-picture',
            name: '3 Photo Strip',
            category: 'strip',
            layout: 'strip',
            shots: 3,
            frameImage: 'templates/frames/3 picture.png',
            frameWidth: 707,
            frameHeight: 2000,
            // Exact photo slot positions (x, y, width, height)
            photoSlots: [
                { x: 46, y: 180, width: 613, height: 458 },   // Top photo (red border)
                { x: 46, y: 688, width: 613, height: 456 },   // Middle photo (cyan border)
                { x: 46, y: 1192, width: 613, height: 456 }   // Bottom photo (yellow border)
            ],
            style: 'custom-frame'
        }
    ];

    let selectedTemplateId = null;

    /**
     * Get all templates
     */
    function getAll() {
        return templateList;
    }

    /**
     * Get templates by category
     */
    function getByCategory(category) {
        return templateList.filter(t => t.category === category);
    }

    /**
     * Get templates by shot count
     */
    function getByShots(shots) {
        return templateList.filter(t => t.shots === shots);
    }

    /**
     * Get template by ID
     */
    function getById(id) {
        return templateList.find(t => t.id === id);
    }

    /**
     * Set selected template
     */
    function select(id) {
        selectedTemplateId = id;
        return getById(id);
    }

    /**
     * Get currently selected template
     */
    function getSelected() {
        return selectedTemplateId ? getById(selectedTemplateId) : null;
    }

    return {
        getAll,
        getByCategory,
        getByShots,
        getById,
        select,
        getSelected
    };
})();
