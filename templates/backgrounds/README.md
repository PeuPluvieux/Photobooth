# Custom Backgrounds

Place your custom background files in this folder.

## Requirements
- **Format**: PNG or JPG
- **Size**: At least 1600 x 1600 pixels
- **Style**: Patterns, textures, solid colors with effects

## Use Cases
- Textured paper backgrounds
- Gradient overlays
- Pattern backgrounds (confetti, dots, etc.)
- Event-themed backgrounds

## Adding to Config
Edit `templates/config.json`:

```json
{
  "backgrounds": [
    {
      "id": "confetti",
      "name": "Confetti Party",
      "file": "backgrounds/confetti.png"
    }
  ]
}
```

Note: Background support is for future enhancement. Currently, the builder uses solid colors for frame backgrounds.
