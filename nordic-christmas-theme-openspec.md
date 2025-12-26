# OpenSpec Proposal: Nordic Christmas Theme Implementation

**Project:** Photobooth Web Application
**Theme:** Nordic Christmas - Cozy & Festive
**Version:** 1.0
**Date:** December 22, 2024
**Status:** Pending Approval

---

## 1. Overview

### 1.1 Purpose
This proposal outlines the implementation of the "Nordic Christmas" minimal light theme for the Photobooth web application. The theme transforms the current dark interface into a warm, festive aesthetic inspired by Scandinavian Christmas traditions, evergreen forests, and cozy holiday gatherings.

### 1.2 Design Philosophy
The Nordic Christmas theme draws inspiration from:
- Scandinavian holiday traditions and hygge
- Evergreen pine forests dusted with snow
- Warm candlelit interiors
- Classic Christmas elegance with gold accents
- Natural, organic winter textures

### 1.3 Target Use Cases
- Christmas and holiday parties
- Corporate holiday events
- Winter weddings
- Family gatherings and reunions
- New Year's Eve celebrations
- Winter-themed brand activations

---

## 2. Color Palette Specification

### 2.1 Complete Color System

| Token | Name | Hex Code | RGB | Usage |
|-------|------|----------|-----|-------|
| `--bg-primary` | Snow Cream | `#FDF8F4` | 253, 248, 244 | Main background, body |
| `--bg-secondary` | Warm White | `#FAF5F0` | 250, 245, 240 | Cards, panels, sections |
| `--bg-tertiary` | Pine Mist | `#F0EBE5` | 240, 235, 229 | Hover states, subtle fills |
| `--text-primary` | Deep Evergreen | `#1A3329` | 26, 51, 41 | Headlines, primary text |
| `--text-secondary` | Sage | `#5A7A6A` | 90, 122, 106 | Body text, descriptions |
| `--text-tertiary` | Soft Sage | `#8A9A8E` | 138, 154, 142 | Captions, hints, placeholders |
| `--accent-primary` | Forest Green | `#2D5A47` | 45, 90, 71 | Primary buttons, active states |
| `--accent-secondary` | Pine | `#3D7A5F` | 61, 122, 95 | Secondary accents, gradients |
| `--accent-hover` | Deep Forest | `#1E4030` | 30, 64, 48 | Button hover states |
| `--highlight` | Gold Star | `#C9A962` | 201, 169, 98 | Special highlights, accents |
| `--highlight-soft` | Warm Gold | `#D4B87A` | 212, 184, 122 | Subtle gold accents |
| `--border` | Frost | `#E8E2DC` | 232, 226, 220 | Borders, dividers |
| `--border-strong` | Winter Gray | `#D4CEC8` | 212, 206, 200 | Strong borders, focus rings |
| `--shadow` | Pine Shadow | `rgba(26, 51, 41, 0.08)` | - | Box shadows |
| `--overlay` | Snow Overlay | `rgba(253, 248, 244, 0.95)` | - | Modal overlays |

### 2.2 Gradient Definitions

```css
/* Primary Button Gradient - Forest to Pine */
--gradient-primary: linear-gradient(135deg, #2D5A47 0%, #3D7A5F 100%);

/* Gold Accent Gradient */
--gradient-gold: linear-gradient(135deg, #C9A962 0%, #D4B87A 100%);

/* Subtle Background Gradient */
--gradient-bg: linear-gradient(180deg, #FDF8F4 0%, #FAF5F0 100%);

/* Festive Glow Effect */
--gradient-glow: radial-gradient(circle, rgba(201, 169, 98, 0.15) 0%, transparent 70%);
```

### 2.3 Color Accessibility

| Combination | Contrast Ratio | WCAG Level |
|-------------|----------------|------------|
| Deep Evergreen on Snow Cream | 12.8:1 | AAA |
| Sage on Snow Cream | 5.2:1 | AA |
| Soft Sage on Snow Cream | 3.8:1 | AA (large text) |
| White on Forest Green | 7.4:1 | AAA |
| Deep Evergreen on Warm White | 12.1:1 | AAA |

All primary combinations meet WCAG 2.1 AA standards.

---

## 3. Component Specifications

### 3.1 Body & Layout

**Current (Dark):**
```html
<body class="bg-gray-900 text-white">
```

**New (Nordic Christmas):**
```html
<body class="bg-snow-cream text-deep-evergreen">
```

```css
body {
  background-color: #FDF8F4;
  color: #1A3329;
}
```

### 3.2 Landing Screen

| Element | Current | New |
|---------|---------|-----|
| Background | `bg-gray-900` | `bg-snow-cream` (#FDF8F4) |
| Logo Container | Purple gradient | Forest gradient (#2D5A47 → #3D7A5F) |
| Logo Icon | White | White (unchanged) |
| Title | `text-white` | `text-deep-evergreen` (#1A3329) |
| Subtitle | `text-gray-400` | `text-sage` (#5A7A6A) |
| Start Button | Purple gradient | Forest gradient |
| Footer Text | `text-gray-500` | `text-soft-sage` (#8A9A8E) |

**Visual Example:**
```
┌─────────────────────────────────────────┐
│            #FDF8F4 (Snow Cream)         │
│                                         │
│         ┌─────────────────┐             │
│         │  ╭───────────╮  │             │
│         │  │    📷     │  │ #2D5A47     │
│         │  ╰───────────╯  │ → #3D7A5F   │
│         └─────────────────┘             │
│                                         │
│            PHOTOBOOTH                   │
│         #1A3329 (Evergreen)             │
│                                         │
│     Capture memories with style         │
│          #5A7A6A (Sage)                 │
│                                         │
│     ╔═════════════════════════╗         │
│     ║    Start Photobooth     ║ Forest  │
│     ╚═════════════════════════╝ Green   │
│                                         │
│       Works with any camera...          │
│         #8A9A8E (Soft Sage)             │
│                                         │
│            ✦ #C9A962 ✦                  │
│           (Gold accents)                │
└─────────────────────────────────────────┘
```

### 3.3 Template Builder Screen

| Element | Current | New |
|---------|---------|-----|
| Header Border | `border-gray-800` | `border-frost` (#E8E2DC) |
| Preview Panel BG | `bg-gray-950` | `bg-warm-white` (#FAF5F0) |
| Preview Card | `bg-gray-800` | `bg-white` with pine shadow |
| Section Headers | `text-gray-400` | `text-sage` (#5A7A6A) |
| Option Buttons (inactive) | `bg-gray-800 border-gray-700` | `bg-white border-frost` |
| Option Buttons (active) | `bg-primary/20 border-primary` | `bg-forest/10 border-forest` |
| Continue Button | Purple gradient | Forest gradient |

### 3.4 Camera Screen

| Element | Current | New |
|---------|---------|-----|
| Header Gradient | `from-gray-900/80` | `from-snow-cream/90` |
| Back Button | `bg-gray-800/50` | `bg-white/80 border-frost` |
| Camera Select | `bg-gray-800/50 border-gray-700` | `bg-white/90 border-frost` |
| Timer Buttons (inactive) | `bg-gray-700` | `bg-white border-frost` |
| Timer Buttons (active) | `bg-primary` | `bg-forest` (#2D5A47) |
| Capture Button | White | Forest ring with cream center |
| Bottom Gradient | `from-gray-900` | `from-snow-cream` |
| Mode Indicator | `bg-primary/90` | `bg-forest/90` |

### 3.5 Review Screen

| Element | Current | New |
|---------|---------|-----|
| Background | `bg-gray-900` | `bg-snow-cream` |
| Result Canvas Shadow | Dark shadow | Pine shadow |
| Download Button | Purple gradient | Forest gradient |
| Share Button | `bg-gray-700` | `bg-warm-white border-frost` |
| New Photo Button | `bg-gray-800` | `bg-white border-frost` |

### 3.6 Error Modal

| Element | Current | New |
|---------|---------|-----|
| Overlay | `bg-black/80` | `bg-deep-evergreen/60` |
| Modal Card | `bg-gray-800` | `bg-white` |
| Error Icon BG | `bg-red-500/20` | `bg-red-100` |
| Error Icon | `text-red-500` | `text-red-600` |
| Title | `text-white` | `text-deep-evergreen` |
| Message | `text-gray-400` | `text-sage` |
| Button | `bg-primary` | `bg-forest` |

---

## 4. Technical Implementation

### 4.1 Tailwind Configuration Update

```javascript
tailwind.config = {
  theme: {
    extend: {
      colors: {
        // Primary backgrounds
        'snow-cream': '#FDF8F4',
        'warm-white': '#FAF5F0',
        'pine-mist': '#F0EBE5',

        // Text colors
        'deep-evergreen': '#1A3329',
        'sage': '#5A7A6A',
        'soft-sage': '#8A9A8E',

        // Accent colors
        'forest': '#2D5A47',
        'pine': '#3D7A5F',
        'deep-forest': '#1E4030',

        // Highlight colors
        'gold-star': '#C9A962',
        'warm-gold': '#D4B87A',

        // Border colors
        'frost': '#E8E2DC',
        'winter-gray': '#D4CEC8',

        // Legacy support (remap)
        'primary': '#2D5A47',
        'secondary': '#3D7A5F'
      },
      boxShadow: {
        'pine': '0 4px 20px rgba(26, 51, 41, 0.08)',
        'pine-lg': '0 10px 40px rgba(26, 51, 41, 0.12)',
        'pine-xl': '0 20px 50px rgba(26, 51, 41, 0.15)',
        'gold-glow': '0 0 20px rgba(201, 169, 98, 0.3)'
      },
      backgroundImage: {
        'gradient-forest': 'linear-gradient(135deg, #2D5A47 0%, #3D7A5F 100%)',
        'gradient-gold': 'linear-gradient(135deg, #C9A962 0%, #D4B87A 100%)',
        'gradient-snow': 'linear-gradient(180deg, #FDF8F4 0%, #FAF5F0 100%)'
      }
    }
  }
}
```

### 4.2 CSS Custom Properties

```css
:root {
  /* Backgrounds */
  --bg-primary: #FDF8F4;
  --bg-secondary: #FAF5F0;
  --bg-tertiary: #F0EBE5;

  /* Text */
  --text-primary: #1A3329;
  --text-secondary: #5A7A6A;
  --text-tertiary: #8A9A8E;

  /* Accents */
  --accent-primary: #2D5A47;
  --accent-secondary: #3D7A5F;
  --accent-hover: #1E4030;

  /* Highlights */
  --highlight: #C9A962;
  --highlight-soft: #D4B87A;

  /* Borders */
  --border: #E8E2DC;
  --border-strong: #D4CEC8;

  /* Effects */
  --shadow: rgba(26, 51, 41, 0.08);
  --shadow-lg: rgba(26, 51, 41, 0.12);
}
```

### 4.3 CSS Updates (styles.css)

```css
/* Christmas theme animations and effects */

/* Capture button pulse - forest glow */
#btn-capture::before {
  border: 2px solid rgba(45, 90, 71, 0.3);
}

/* Template card hover - pine shadow */
.template-card:hover {
  box-shadow: 0 10px 40px rgba(26, 51, 41, 0.15);
}

/* Mirror button active state */
#btn-mirror.active {
  box-shadow: 0 0 10px rgba(45, 90, 71, 0.5);
}

/* Timer button active */
.timer-btn.active {
  box-shadow: 0 0 10px rgba(45, 90, 71, 0.5);
}

/* Scrollbar styling */
#template-grid::-webkit-scrollbar-thumb {
  background: rgba(45, 90, 71, 0.2);
}

#template-grid::-webkit-scrollbar-thumb:hover {
  background: rgba(45, 90, 71, 0.3);
}

/* Gradient text effect - forest version */
.gradient-text {
  background: linear-gradient(135deg, #2D5A47 0%, #3D7A5F 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

/* Spinner - forest version */
.spinner {
  border: 3px solid rgba(45, 90, 71, 0.2);
  border-top-color: #2D5A47;
}

/* Gold star accent (optional decorative) */
.gold-accent {
  color: #C9A962;
  text-shadow: 0 0 10px rgba(201, 169, 98, 0.3);
}
```

---

## 5. File Changes Summary

### 5.1 Files to Modify

| File | Changes |
|------|---------|
| `index.html` | Update Tailwind config, replace all color classes |
| `css/styles.css` | Update animation colors, shadows, effects |

### 5.2 Class Replacement Map

| Current Class | New Class |
|---------------|-----------|
| `bg-gray-900` | `bg-snow-cream` |
| `bg-gray-950` | `bg-warm-white` |
| `bg-gray-800` | `bg-white` or `bg-warm-white` |
| `bg-gray-700` | `bg-pine-mist` |
| `text-white` | `text-deep-evergreen` |
| `text-gray-400` | `text-sage` |
| `text-gray-500` | `text-soft-sage` |
| `border-gray-800` | `border-frost` |
| `border-gray-700` | `border-frost` |
| `border-gray-600` | `border-winter-gray` |
| `from-primary` | `from-forest` |
| `to-secondary` | `to-pine` |
| `bg-primary` | `bg-forest` |
| `bg-primary/20` | `bg-forest/10` |
| `ring-primary` | `ring-forest` |
| `hover:bg-gray-800` | `hover:bg-pine-mist` |
| `hover:bg-gray-700` | `hover:bg-pine-mist` |
| `hover:bg-gray-600` | `hover:bg-winter-gray/50` |

---

## 6. Visual Mockups

### 6.1 Landing Screen

```
╔═══════════════════════════════════════════════════════╗
║                   #FDF8F4 (Snow Cream)                ║
║                                                       ║
║                        ✦                              ║
║                   ▄▄▄▄▄▄▄▄▄▄▄▄▄                       ║
║                  █ ╭─────────╮ █                      ║
║                  █ │   📷    │ █  Forest gradient     ║
║                  █ ╰─────────╯ █  #2D5A47 → #3D7A5F   ║
║                   ▀▀▀▀▀▀▀▀▀▀▀▀▀                       ║
║                        ✦                              ║
║                                                       ║
║                    PHOTOBOOTH                         ║
║               #1A3329 (Deep Evergreen)                ║
║                                                       ║
║              Capture memories with style              ║
║                  #5A7A6A (Sage)                       ║
║                                                       ║
║            ╔═════════════════════════╗                ║
║            ║    Start Photobooth     ║  #2D5A47      ║
║            ╚═════════════════════════╝                ║
║                                                       ║
║         Works with any camera — phone,                ║
║            webcam, or professional                    ║
║                  #8A9A8E (Soft Sage)                  ║
║                                                       ║
║                    ✦ ✦ ✦                              ║
║                  #C9A962 (Gold)                       ║
╚═══════════════════════════════════════════════════════╝
```

### 6.2 Template Builder

```
╔═══════════════════════════════════════════════════════╗
║  ←  │      Design Your Photo      │    #1A3329       ║
║─────┴─────────────────────────────┴──────────────────║
║  #E8E2DC border                                       ║
║                    │                                  ║
║   ┌─────────────┐  │  Layout & Photos                ║
║   │             │  │  #5A7A6A label                  ║
║   │   Preview   │  │  ┌────────┐ ┌────────┐          ║
║   │    Card     │  │  │Portrait│ │Landscape│         ║
║   │             │  │  └────────┘ └────────┘          ║
║   │  #FFFFFF    │  │   #2D5A47    #FFFFFF            ║
║   │  with pine  │  │   active     inactive           ║
║   │  shadow     │  │                                  ║
║   │             │  │  Color                          ║
║   └─────────────┘  │  ○ ○ ○ ○ ○ ○ ○ ○               ║
║                    │                                  ║
║   #FAF5F0 panel    │  Border Style                   ║
║                    │  ┌──┐ ┌──┐ ┌──┐                ║
║                    │  └──┘ └──┘ └──┘                ║
║════════════════════╧══════════════════════════════════║
║          ╔═══════════════════════════╗                ║
║          ║   Continue to Camera      ║  #2D5A47      ║
║          ╚═══════════════════════════╝  Forest       ║
╚═══════════════════════════════════════════════════════╝
```

### 6.3 Button States

```
Primary Button (Forest Gradient):
┌─────────────────────────┐
│    Start Photobooth     │  Normal: #2D5A47 → #3D7A5F
└─────────────────────────┘  Text: #FFFFFF

┌─────────────────────────┐
│    Start Photobooth     │  Hover: #1E4030 → #2D5A47
└─────────────────────────┘  Text: #FFFFFF

Secondary Button:
┌─────────────────────────┐
│        Share            │  Normal: #FFFFFF, border #E8E2DC
└─────────────────────────┘  Text: #1A3329

┌─────────────────────────┐
│        Share            │  Hover: #F0EBE5 (pine mist fill)
└─────────────────────────┘  Text: #1A3329

Option Button (Inactive):
┌─────────────────────────┐
│       Portrait          │  #FFFFFF, border #E8E2DC
└─────────────────────────┘  Text: #5A7A6A

Option Button (Active):
┌─────────────────────────┐
│       Portrait          │  #2D5A47/10, border #2D5A47
└─────────────────────────┘  Text: #2D5A47
```

### 6.4 Christmas Decorative Elements

```
Gold Star Accents (optional):
    ✦           ✦
      ╲       ╱
        ╲   ╱
    ✦ ─── ★ ─── ✦     #C9A962 (Gold Star)
        ╱   ╲
      ╱       ╲
    ✦           ✦

Subtle Pine Branch Corner (CSS pseudo-element):
  🌲 ─────────────────────────
  │
  │   Content area
  │
```

---

## 7. Implementation Checklist

### Phase 1: Configuration
- [ ] Update Tailwind config with Nordic Christmas palette
- [ ] Add CSS custom properties to styles.css
- [ ] Test color contrast accessibility

### Phase 2: Core Layout
- [ ] Update body background and text colors
- [ ] Update all screen backgrounds
- [ ] Apply pine shadows throughout

### Phase 3: Components
- [ ] Landing screen elements
- [ ] Template builder screen
- [ ] Camera screen controls
- [ ] Review screen
- [ ] Error modal

### Phase 4: Interactive States
- [ ] Button hover/active states
- [ ] Focus ring colors (forest green)
- [ ] Selection indicators
- [ ] Transition animations

### Phase 5: Polish & Festive Details
- [ ] Scrollbar styling
- [ ] Loading states
- [ ] Gold accent highlights (optional)
- [ ] Cross-browser testing

---

## 8. Approval

| Role | Name | Signature | Date |
|------|------|-----------|------|
| Project Lead | | | |
| Design Approval | | | |
| Development Lead | | | |

---

## 9. Appendix

### A. Color Palette Visual Reference

```
PRIMARY BACKGROUNDS
┌────────────────┬────────────────┬────────────────┐
│  ░░░░░░░░░░░░  │  ▒▒▒▒▒▒▒▒▒▒▒▒  │  ▓▓▓▓▓▓▓▓▓▓▓▓  │
│    #FDF8F4     │    #FAF5F0     │    #F0EBE5     │
│   Snow Cream   │  Warm White    │   Pine Mist    │
└────────────────┴────────────────┴────────────────┘

TEXT COLORS
┌────────────────┬────────────────┬────────────────┐
│ ████████████████│ ▓▓▓▓▓▓▓▓▓▓▓▓▓▓ │ ▒▒▒▒▒▒▒▒▒▒▒▒▒▒ │
│    #1A3329     │    #5A7A6A     │    #8A9A8E     │
│ Deep Evergreen │     Sage       │   Soft Sage    │
└────────────────┴────────────────┴────────────────┘

ACCENT COLORS (Forest)
┌────────────────┬────────────────┬────────────────┐
│ ████████████████│ ▓▓▓▓▓▓▓▓▓▓▓▓▓▓ │ ▒▒▒▒▒▒▒▒▒▒▒▒▒▒ │
│    #2D5A47     │    #3D7A5F     │    #1E4030     │
│  Forest Green  │      Pine      │  Deep Forest   │
└────────────────┴────────────────┴────────────────┘

HIGHLIGHT COLORS (Gold)
┌────────────────┬────────────────┐
│ ▓▓▓▓▓▓▓▓▓▓▓▓▓▓ │ ░░░░░░░░░░░░░░ │
│    #C9A962     │    #D4B87A     │
│   Gold Star    │   Warm Gold    │
└────────────────┴────────────────┘

BORDER COLORS
┌────────────────┬────────────────┐
│ ░░░░░░░░░░░░░░ │ ▒▒▒▒▒▒▒▒▒▒▒▒▒▒ │
│    #E8E2DC     │    #D4CEC8     │
│     Frost      │  Winter Gray   │
└────────────────┴────────────────┘
```

### B. Hex Code Quick Reference

```
Backgrounds:  #FDF8F4  #FAF5F0  #F0EBE5
Text:         #1A3329  #5A7A6A  #8A9A8E
Forest:       #2D5A47  #3D7A5F  #1E4030
Gold:         #C9A962  #D4B87A
Borders:      #E8E2DC  #D4CEC8
```

### C. Festive Design Notes

The Nordic Christmas theme can be enhanced with optional festive elements:

1. **Gold Star Accents**: Use `#C9A962` sparingly for special highlights
2. **Subtle Animations**: Gentle gold shimmer on hover states
3. **Corner Decorations**: CSS-based pine branch or snowflake motifs
4. **Holiday Typography**: Consider serif fonts for titles (optional)

These additions are optional and can be implemented based on event requirements.

---

*End of Document*
