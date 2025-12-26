# Custom Frame Templates

Place your custom frame PNG files in this folder.

## Requirements

### Single Photo Frames
- **Portrait**: 1200 x 1600 pixels
- **Landscape**: 1600 x 1200 pixels

### Photo Strip Frames
- **3-shot strip**: 600 x 1800 pixels
- **4-shot strip**: 600 x 2400 pixels

## File Format
- PNG with transparency (transparent center for photo area)
- The frame border/decoration should be around the edges
- Leave the center transparent where the photo will appear

## Example Structure
```
frames/
  gold-ornate.png      <- Single portrait frame
  floral-border.png    <- Single portrait frame
  strip-3-hearts.png   <- 3-photo strip frame
  strip-4-classic.png  <- 4-photo strip frame
```

## Adding to Config
Edit `templates/config.json` and add your frame:

```json
{
  "frames": [
    {
      "id": "my-frame",
      "name": "My Custom Frame",
      "file": "frames/my-frame.png",
      "orientation": "portrait",
      "shots": 1
    }
  ]
}
```
