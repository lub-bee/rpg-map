# Cartomancer

**Draw your dungeon. One click at a time.**

Cartomancer is a browser-based RPG map editor built for game masters and tabletop players. No account, no install, no backend — open the page and start drawing. Click to place nodes, walls appear automatically, and your map is ready to export in seconds.

## Features

- 🗺️ **Click-to-draw walls** — place nodes one by one, walls connect automatically; close a shape by clicking the first node
- 📐 **Straight, diagonal, arc, and circle walls** — full geometric flexibility on a snapping grid
- 🧱 **Wall textures** — stone, wood, glass, water, fire, and more per segment
- 🚪 **Wall elements** — add doors, windows, openings, and secret passages directly on walls
- 🪑 **Decor objects** — place furniture, candles, rugs and other items as single pieces or preset groups (e.g. "Dining Set")
- 🏷️ **Named areas** — define and label rooms, corridors, gardens; toggle area overlay on/off
- 📚 **Layers** — Openings / Floor / Walls / Furniture with proper Z-ordering
- 🔍 **Edit & Preview modes** — switch between editor view (grid, handles) and final render (WYSIWYG)
- ↩️ **Undo / Redo** — full history
- 💾 **No auto-save** — you control when to save; export to JSON and reload later

## How to use

1. **Pick a tool** from the toolbar — `Wall` to draw walls, `Arc` for curved walls, `Decor` for furniture, `Area` to name zones.
2. **Click on the canvas** to place the first node — it snaps to the grid automatically.
3. **Keep clicking** to extend the wall; each click adds a new segment from the last node.
4. **Close a room** by clicking back on the first node — the shape seals itself.
5. **Select any element** with the `Select` tool to change its texture, add wall elements (doors, windows), or delete it.
6. **Toggle Preview** (Tab) to see your final map, then **export** when ready.

## Export formats

| Format | Description |
|--------|-------------|
| **JSON** | Full map data — nodes, walls, elements, areas, layers. Reload it later to keep editing. |
| **SVG** | Scalable vector image, ideal for virtual tabletops or print. One page per level. |
| **PNG** | Raster image for sharing, streaming, or inserting into documents. One image per level. |

## Keyboard shortcuts

| Key | Action |
|-----|--------|
| `W` | Wall tool |
| `A` | Arc tool |
| `S` | Select tool |
| `D` | Decor tool |
| `Tab` | Toggle Edit / Preview mode |
| `Ctrl+Z` | Undo |
| `Ctrl+Shift+Z` | Redo |
| `Escape` | Cancel current action |

## Self-hosted / Local

No build step required.

```bash
python3 -m http.server 8080 --directory src/
```

Then open [http://localhost:8080](http://localhost:8080).

## License

MIT — see [LICENSE](LICENSE).
