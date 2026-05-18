# Plan de développement — RPG Map Editor

> Dernière mise à jour : 2026-05-18 (restructuré après DISC-004)
> PM : Claude (agent pm)

---

## Vue d'ensemble des phases

| # | Phase | Objectif | Statut |
|---|---|---|---|
| 0 | Setup & Architecture | Scaffolding, modèle de données complet | ⏳ En attente |
| 1 | Canvas, Grid & Display Modes | Rendu, grille, zoom/pan, modes Preview/Edit | ⏳ En attente |
| 2 | Nodes & Walls | Outil dessin mur, nodes libres, snap | ⏳ En attente |
| 3 | Layers System | Z-order rendu, layer panel, stacking | ⏳ En attente |
| 4 | Textures & Wall Elements | Textures, portes/fenêtres sur murs | ⏳ En attente |
| 5 | Decor Elements & Groups | Éléments de décor, groupes prédéfinis | ⏳ En attente |
| 6 | Areas | Détection auto, naming, separator walls, overlay | ⏳ En attente |
| 7 | Advanced Geometry | Arcs, cercles, snap arc | ⏳ En attente |
| 8 | Entity Editor | Sélection, déplacement, suppression, undo/redo | ⏳ En attente |
| 9 | Export | JSON multi-niveaux, SVG, PNG | ⏳ En attente |
| 10 | Polish & Deploy | UX, marketing assets, GitHub Pages | ⏳ En attente |

---

## Phase 0 — Setup & Architecture

**Objectif :** Poser les fondations — structure de fichiers, modèle de données, bus d'événements, store.

### Modèle de données JSON (carte complète)

```json
{
  "meta": { "name": "My Map", "gridSize": 64, "created": "...", "modified": "..." },
  "levels": [
    {
      "id": "lvl_0",
      "name": "Ground Floor",
      "nodes": [
        { "id": "n1", "x": 3, "y": 2 }
      ],
      "walls": [
        {
          "id": "w1", "from": "n1", "to": "n2",
          "type": "straight|arc|separator",
          "texture": "stone|wood|glass|water|fire|grid",
          "elements": [
            { "id": "e1", "type": "door|window|opening|secret", "offset": 0.5 }
          ]
        }
      ],
      "decorNodes": [
        {
          "id": "dn1", "x": 5, "y": 4,
          "layer": "furniture",
          "elementType": "table",
          "children": ["dn2", "dn3"]
        }
      ],
      "areas": [
        { "id": "a1", "name": "Kitchen", "nodeIds": ["n1","n2","n3","n4"], "color": "#ffcc8844" }
      ]
    }
  ]
}
```

### Livrables
- `src/index.html` — page unique, layout HTML
- `src/css/main.css` — styles de base (toolbar, panels, canvas)
- `src/js/core/state.js` — store centralisé (carte en mémoire)
- `src/js/core/events.js` — bus d'événements (publish/subscribe)
- `src/js/core/history.js` — undo/redo (command pattern)
- `src/js/data/schema.js` — constantes et helpers du modèle
- `src/js/data/presets.js` — groupes prédéfinis (Dining Set, etc.)

### Critères de validation
- `state.js` expose `getState()`, `dispatch(action)`, `subscribe(fn)`
- `history.js` supporte undo/redo sur toute action
- Le schéma JSON représente une carte multi-niveaux valide

---

## Phase 1 — Canvas, Grid & Display Modes

**Objectif :** Un canvas fonctionnel avec grille, zoom/pan, et les deux modes d'affichage.

### Livrables
- `src/js/canvas/renderer.js` — boucle RAF (requestAnimationFrame), dispatcher de rendu par layer
- `src/js/canvas/grid.js` — rendu grille (customisable, masquable en Preview)
- `src/js/canvas/camera.js` — zoom (molette) + pan (espace+drag ou bouton milieu)
- `src/js/canvas/coords.js` — conversions screen ↔ world ↔ grid
- `src/js/ui/mode-toggle.js` — bouton Preview / Edit
- `src/js/ui/toolbar.js` — barre d'outils principale

### Critères de validation
- Grille visible en Edit, masquée en Preview
- Zoom/pan fluide, pas de drift
- Toggle Preview/Edit sans rechargement
- Taille de grille customisable via input UI

---

## Phase 2 — Nodes & Walls

**Objectif :** Outil de dessin mur + nodes libres, avec snap sur grille.

### Livrables
- `src/js/canvas/snap.js` — snap sur intersections de grille
- `src/js/tools/wall-tool.js` — outil mur (clic → node, auto-mur, fermeture sur node A)
- `src/js/tools/free-node-tool.js` — outil node libre (pour décors)
- `src/js/entities/node.js` — entité node (mur ou libre)
- `src/js/entities/wall.js` — entité mur droit
- Rendu preview du mur en cours (ligne ghost sous le curseur)
- Highlight du node A pour fermeture de forme

### Critères de validation
- Créer une pièce rectangulaire en 5 clics
- Preview du mur en cours visible sous le curseur
- Snap visuel sur les intersections de grille
- Forme fermée correctement au clic sur node A
- Node libre placé sur la grille sans créer de mur

---

## Phase 3 — Layers System

**Objectif :** Rendu ordonné par layers, panel de sélection du layer actif.

### Livrables
- `src/js/canvas/layer-renderer.js` — rendu en ordre Z : Openings → Floor → Walls → Furniture
- `src/js/ui/layer-panel.js` — sélecteur de layer actif + toggle visibilité par layer
- Attribution automatique du layer selon l'outil actif

### Z-order de rendu

```
Openings  (z=0) — passages au sol
Floor     (z=1) — revêtements, tapis de sol
Walls     (z=2) — murs, structures
Furniture (z=3) — meubles, objets, décors
```

### Critères de validation
- Les layers sont rendus dans le bon ordre (Furniture au-dessus de Walls)
- Activer/désactiver un layer masque/affiche ses entités
- L'outil actif préassocie le bon layer à l'entité créée

---

## Phase 4 — Textures & Wall Elements

**Objectif :** Textures sur les murs, éléments positionnés sur les segments.

### Livrables
- `src/js/canvas/textures.js` — patterns Canvas pour chaque texture
- `src/js/entities/wall-element.js` — élément sur mur (offset 0–1 sur le segment)
- `src/js/ui/texture-panel.js` — sélecteur de texture
- `src/js/ui/element-panel.js` — sélecteur d'élément à ajouter sur un mur sélectionné

**Textures :** Grid (défaut), Stone, Wood, Glass, Water, Fire

**Éléments de mur :** Door, Window, Opening, Secret Passage, Carpet strip

### Critères de validation
- Sélectionner un mur → changer texture → rendu immédiat
- Ajouter une porte → visible sur le segment au bon offset
- WYSIWYG : identique en Edit et Preview

---

## Phase 5 — Decor Elements & Groups

**Objectif :** Placer des éléments de décor et groupes prédéfinis via nodes libres.

### Livrables
- `src/js/data/presets.js` — catalogue de groupes prédéfinis
- `src/js/tools/decor-tool.js` — outil placement décor (sélectionner + cliquer pour placer)
- `src/js/ui/decor-panel.js` — panneau de sélection élément/groupe
- `src/js/canvas/decor-renderer.js` — rendu des éléments de décor (icônes ou formes simples)

**Groupes prédéfinis exemples :**
- Dining Set : table + 4 chairs + candle + rug
- Bed : bed frame + pillow + nightstand
- Fireplace : fireplace + rug + 2 chairs

### Critères de validation
- Placer un élément seul en 2 clics (outil → placement)
- Placer un groupe → tous les sous-éléments placés correctement relativement
- Les éléments snappent sur la grille
- Les éléments sont sur le bon layer (Furniture par défaut)

---

## Phase 6 — Areas

**Objectif :** Zones nommées, mur séparateur invisible, overlay d'affichage.

### Livrables
- `src/js/entities/area.js` — entité area (liste de node IDs + nom + couleur)
- `src/js/tools/area-tool.js` — outil de naming/création d'area (clic dans une zone fermée)
- `src/js/tools/separator-wall-tool.js` — outil mur séparateur (area-only, invisible)
- `src/js/canvas/area-renderer.js` — rendu overlay coloré des areas
- `src/js/ui/area-panel.js` — liste des areas, toggle visibilité, renommage
- Détection auto des zones fermées (flood fill ou cycle detection sur graphe)

### Critères de validation
- Tracer un périmètre fermé → cliquer dedans → nommer l'area
- Le mur séparateur n'apparaît pas en Preview mais délimite une area
- Toggle area overlay en Edit et en Preview indépendamment
- Plusieurs areas adjacentes sont correctement différenciées (couleurs distinctes)

---

## Phase 7 — Advanced Geometry

**Objectif :** Murs en arc de cercle et cercles complets.

### Livrables
- `src/js/tools/arc-tool.js` — outil arc (3 clics : A, B, centre)
- `src/js/entities/arc-wall.js` — entité mur arc
- `src/js/canvas/snap-arc.js` — snap centre + points A/B sur grille
- Rendu arc + cercle + textures applicables sur arcs

### Critères de validation
- Dessiner un arc en 3 clics (A, B, centre)
- Dessiner un cercle complet
- Snap du centre sur grille
- Snap des points A/B sur grille
- Textures et éléments applicables sur arcs (Phase 4)

---

## Phase 8 — Entity Editor

**Objectif :** Sélection, édition, déplacement, suppression de toute entité. Undo/redo.

### Livrables
- `src/js/tools/select-tool.js` — outil sélection (clic ou rectangle de sélection)
- `src/js/ui/inspector.js` — panneau propriétés de l'entité sélectionnée
- Drag de nodes (les murs suivent)
- Suppression (Delete/Backspace)
- Undo/redo (Ctrl+Z / Ctrl+Y) — basé sur `core/history.js`
- Sélection multiple (Shift+clic)

### Critères de validation
- Sélectionner un node → le déplacer → les murs connectés suivent
- Supprimer un node → les murs orphelins gérés proprement
- Undo/redo fonctionne sur toutes les actions (dessin, déplacement, suppression, texture, élément)
- Inspector affiche et édite les propriétés de l'entité sélectionnée
- Sélection multiple → déplacement groupé

---

## Phase 9 — Export

**Objectif :** Export JSON multi-niveaux, SVG mono-niveau, PNG mono-niveau. Import JSON.

### Livrables
- `src/js/export/json-exporter.js` — sérialisation complète (tous niveaux)
- `src/js/export/json-importer.js` — désérialisation + chargement en state
- `src/js/export/svg-exporter.js` — rendu SVG d'un niveau (vectoriel, WYSIWYG)
- `src/js/export/image-exporter.js` — rendu PNG via canvas.toDataURL()
- `src/js/ui/export-panel.js` — UI d'export (format, niveau, résolution)

### Critères de validation
- Export JSON → import → carte identique bit-à-bit
- Export SVG → ouvrable dans navigateur et Inkscape, identique à Preview
- Export PNG → haute résolution, identique à Preview
- Choix du niveau à exporter en SVG/PNG
- WYSIWYG vérifié sur les 3 formats

---

## Phase 10 — Polish & Deploy

**Objectif :** UX finale, assets marketing, déploiement GitHub Pages.

### Livrables
- Nom de l'outil + favicon + `<title>` + `<meta description>` (→ agent Marketing)
- `README.md` public orienté utilisateur final (→ agent Marketing)
- Raccourcis clavier complets + aide intégrée (tooltip ou panneau ?)
- Niveaux : UI multi-niveau (ajouter/supprimer/renommer/réordonner niveaux)
- Tests cross-browser : Chrome, Firefox, Safari (desktop)
- Repo GitHub configuré sous `lub-bee`
- GitHub Pages activé
- URL publique fonctionnelle

### Critères de validation
- App accessible sur URL publique GitHub Pages
- Fonctionne sur Chrome, Firefox, Safari desktop
- Aucune erreur console en usage normal
- Flow REQ-001 à REQ-023 intégralement validé par QA
- README public lisible et complet

---

## Conventions de développement

- Un fichier = une responsabilité claire
- ES Modules natifs (`import`/`export`), pas de bundler
- Nommage : camelCase variables/fonctions, PascalCase classes, kebab-case fichiers
- Constantes de layer : `LAYER = { OPENINGS: 0, FLOOR: 1, WALLS: 2, FURNITURE: 3 }`
- Coordonnées internes en unités grille (pas en pixels) — conversion à la volée au rendu
- Commit par phase ou sous-tâche significative
- Doc Keeper intervient sur chaque modification significative
