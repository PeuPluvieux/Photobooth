# Custom Stickers

Place your custom sticker PNG files in this folder.

## Requirements
- **Format**: PNG with transparent background
- **Size**: 200-400 pixels recommended (will be scaled)
- **Style**: Icons, emojis, decorative elements

## Example Stickers
- Hearts, stars, sparkles
- Party decorations (balloons, confetti)
- Text overlays ("Happy Birthday", "Love")
- Props (hats, glasses, mustaches)

## Adding to Config
Edit `templates/config.json`:

```json
{
  "stickers": [
    {
      "id": "heart",
      "name": "Heart",
      "file": "stickers/heart.png"
    }
  ],
  "designThemes": [
    {
      "id": "love-theme",
      "name": "Love Theme",
      "stickers": ["stickers/heart.png", "stickers/sparkle.png"],
      "positions": [
        {"sticker": 0, "x": 0.05, "y": 0.05, "size": 0.1},
        {"sticker": 1, "x": 0.95, "y": 0.05, "size": 0.08}
      ]
    }
  ]
}
```

## Position Format
- `x` and `y`: Position as percentage (0.0 to 1.0)
  - 0.0 = left/top edge
  - 1.0 = right/bottom edge
  - 0.5 = center
- `size`: Size as percentage of canvas (0.1 = 10%)
- `sticker`: Index of sticker in the stickers array
