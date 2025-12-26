/**
 * Templates Module
 * Manages template definitions, rendering, and selection
 */

const Templates = (function() {
    // Template definitions - only 2 templates for 2-photo and 3-photo strips
    const templateList = [
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
            style: 'custom-frame'
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
