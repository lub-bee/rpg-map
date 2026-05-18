# Décisions architecturales

> Toute décision technique ou de design est loggée ici.
> Format : `[DEC-XXX] — Date — Titre — Décision — Raison`

---

## DEC-001 — 2026-05-18 — Rendu via Canvas 2D API

**Décision :** Utiliser l'API Canvas 2D du navigateur pour le rendu principal.

**Raison :** Contrainte vanilla JS sans dépendance. Canvas 2D permet le rendu de géométries complexes (arcs, lignes, textures), le WYSIWYG, et l'export image natif (`canvas.toDataURL()`). SVG en alternative pour l'export vectoriel.

---

## DEC-002 — 2026-05-18 — Architecture modulaire ES Modules

**Décision :** Utiliser les ES Modules natifs (import/export) sans bundler.

**Raison :** Vanilla JS pur, compatible GitHub Pages sans pipeline de build. Modules séparés par domaine : canvas, grid, entities, tools, export, ui.

---

## DEC-003 — 2026-05-18 — Structure de données : graphe de nodes

**Décision :** La carte est représentée comme un graphe de nodes + edges (murs).

**Raison :** Correspond au modèle mental de l'utilisateur (cliquer des points → les murs se créent entre eux). Facilite l'édition individuelle, le snap, et les exports.

Structure de base :
```json
{
  "nodes": [{ "id": "n1", "x": 0, "y": 0 }],
  "walls": [{ "id": "w1", "from": "n1", "to": "n2", "type": "straight", "texture": "stone", "elements": [] }],
  "rooms": [{ "id": "r1", "nodes": ["n1","n2","n3"] }]
}
```

---

## DEC-004 — 2026-05-18 — Hébergement GitHub Pages

**Décision :** Cible de déploiement = GitHub Pages.

**Raison :** Gratuit, statique, compatible vanilla JS, déploiement simple via branche `gh-pages` ou dossier `/docs`.

---

## DEC-005 — 2026-05-18 — Dossier projet dans dev/lubbee/rpg-map/

**Décision :** Le projet est dans `dev/lubbee/rpg-map/`, pas à la racine de `dev/lubbee/`.

**Raison :** `dev/lubbee/` est un workspace pouvant accueillir plusieurs projets.

---

## DEC-006 — 2026-05-18 — Pas de bundler, pas de build step

**Décision :** Le projet est servi tel quel (fichiers statiques), pas de transpilation, pas de minification en développement.

**Raison :** Simplicité maximale, compatible avec l'hébergement statique direct.

---

## DEC-007 — 2026-05-18 — Repo GitHub public sous `lub-bee`

**Décision :** Repo public sous le compte GitHub `lub-bee`, déployé via GitHub Pages.

**Raison :** GitHub Pages gratuit requiert un repo public. Clé SSH déjà enregistrée sur le compte.

---

## DEC-008 — 2026-05-18 — Pas de localStorage, export manuel uniquement

**Décision :** Aucune persistance automatique. L'utilisateur sauvegarde via export JSON et recharge via import JSON.

**Raison :** Simplicité de l'architecture, contrôle explicite de l'utilisateur sur ses données, conforme REQ-014.

---

## DEC-009 — 2026-05-18 — Multi-niveaux : JSON multi, SVG/PNG mono-niveau par export

**Décision :** Le JSON est la seule source multi-niveaux complète. SVG et PNG exportent un niveau à la fois (ou plusieurs si la mise en page reste lisible — décision finale à la Phase 9).

**Raison :** Un SVG multi-niveaux superposés serait illisible. Le JSON est le format maître, SVG/PNG sont des rendus de consultation.

---

## DEC-010 — 2026-05-18 — Grid size customisable, valeur initiale 64px

**Décision :** La taille de grille est configurable via l'UI. Valeur initiale de développement : 64px/case (standard RPG lisible, modifiable par l'utilisateur).

**Raison :** REQ-017 impose la customisabilité. 64px est le standard le plus courant en édition de cartes RPG pour la lisibilité.

---

## DEC-011 — 2026-05-18 — Layer Z-order : Openings < Floor < Walls < Furniture

**Décision :** Ordre de rendu fixe des layers : Openings (0), Floor (1), Walls (2), Furniture (3).

**Raison :** Correspond à la réalité physique d'une pièce vue du dessus. L'utilisateur ne choisit pas l'ordre entre layers, seulement le layer d'appartenance d'une entité.

---

## DEC-012 — 2026-05-18 — Détection d'area : algorithmique sur graphe de murs fermés

**Décision :** Les areas sont détectées automatiquement par analyse du graphe de murs (flood fill ou cycle detection dans le graphe de nodes). L'utilisateur nomme l'area après détection.

**Raison :** Évite à l'utilisateur de re-tracer la forme — les murs sont déjà là, l'area en est une propriété dérivée.

---

## DEC-013 — 2026-05-18 — Agent Marketing créé, chargé du naming de l'outil

**Décision :** L'outil n'a pas encore de nom final. L'agent Marketing est responsable de proposer le nom, la tagline et les assets de communication.

**Raison :** Ludo a délégué cette décision à l'agent Marketing via DISC-004.

---

## DEC-014 — 2026-05-18 — createId() : timestamp + random + compteur auto-incrémenté

**Décision :** `createId()` combine `Date.now().toString(36)` + 5 chars random + compteur incrémental.

**Raison :** Garantit l'unicité même si deux IDs sont générés dans la même milliseconde sans dépendance externe (pas de crypto.randomUUID pour la compat large).

---

## DEC-015 — 2026-05-18 — Types furniture comme chaînes libres (non énumérés dans ELEMENT_TYPE)

**Décision :** `ELEMENT_TYPE` contient uniquement les types d'éléments de mur (door, window, opening, secret, carpet). Les types de décors/meubles (table, chair, bed...) sont des chaînes libres dans `presets.js` et `decorNodes`.

**Raison :** Les meubles sont extensibles et gérés par le renderer Phase 5. Les typer dans une enum maintenant créerait une enum incomplète et trompeuse.

---

## DEC-016 — 2026-05-18 — UPDATE_ENTITY : scan toutes les collections

**Décision :** L'action `UPDATE_ENTITY` passe sur `nodes`, `walls`, `decorNodes` et `areas` en une seule passe pour trouver l'entité par ID.

**Raison :** Simplifie l'API — l'appelant n'a pas à savoir dans quelle collection vit l'entité. Overhead négligeable sur les tailles de cartes attendues.

---

## DEC-017 — 2026-05-18 — history.js : snapshot de `map` uniquement, pas de `ui`

**Décision :** Undo/redo ne restaure que `state.map`, pas `state.ui`.

**Raison :** L'undo est une opération sur les données de la carte, pas sur l'état de l'interface (outil actif, sélection...). Restaurer l'UI serait déstabilisant pour l'utilisateur.

---

## DEC-018 — 2026-05-18 — data-* attributes sur les boutons toolbar

**Décision :** Boutons toolbar annotés avec `data-tool`, `data-mode`, `data-action` pour le binding JS.

**Raison :** Évite le couplage sur des IDs internes — les modules JS branchent leurs event listeners via `querySelectorAll('[data-tool]')` etc.

---

## DEC-019 — 2026-05-18 — Classes CSS utilitaires ajoutées

**Décision :** Classes `.panel-title`, `.panel-list`, `.panel-placeholder`, `.swatches`, `.mode-btn` ajoutées dans le HTML et le CSS.

**Raison :** Nécessaires pour cibler les éléments de manière stable depuis le CSS et le JS futur, sans couplage sur la structure DOM.

---

## DEC-020 — 2026-05-18 — Camera gérée en closure dans attachCameraControls, events sur window

**Décision :** `attachCameraControls` stocke la camera en closure locale. `mousemove`/`mouseup`/`keydown`/`keyup` écoutent sur `window` (pas sur le canvas).

**Raison :** Le drag reste actif si la souris sort du canvas — comportement attendu pour le pan.

---

## DEC-021 — 2026-05-18 — renderer.js expose addLayerRenderer() pour les phases suivantes

**Décision :** Le renderer expose `addLayerRenderer(fn)` — les modules Phase 2+ s'y enregistrent pour dessiner leurs entités, sans modifier renderer.js.

**Raison :** Découplage : chaque phase ajoute son rendu sans toucher au coordinateur central.

---

## DEC-022 — 2026-05-18 — Statusbar zoom via event camera:change (pas via state)

**Décision :** Le zoom réel (camera.zoom) est émis via `emit('camera:change', camera)` par le renderer. La statusbar écoute cet event — pas le state.

**Raison :** Le zoom de la camera n'est pas dans le state Redux (c'est un état UI de rendu pur). Passer par le bus d'events évite de polluer le state avec une valeur éphémère.

---

## DEC-023 — 2026-05-18 — Grille visible en Edit uniquement

**Décision :** La grille est dessinée uniquement si `state.ui.mode === DISPLAY_MODE.EDIT`.

**Raison :** REQ-023 — mode Preview = WYSIWYG pur, sans artefacts d'édition.

---

## DEC-024 — 2026-05-18 — drawNodes signature : originNodeId param explicite

**Décision :** `drawNodes(ctx, nodes, camera, state, originNodeId = null)` — l'ID du node origine (pour le highlight de fermeture de forme) est passé en paramètre, pas lu depuis le tool state.

**Raison :** `node.js` n'a pas connaissance du wall-tool state. Le highlight origin est géré par wall-tool via son propre addLayerRenderer.

---

## DEC-025 — 2026-05-18 — Tool listeners toujours attachés, activation par garde interne

**Décision :** Tous les outils sont initialisés une fois (listeners attachés). Chaque outil vérifie `getState().ui.activeTool` en début de handler pour s'activer/désactiver.

**Raison :** Simplifie le cycle de vie — pas de detach/reattach à chaque changement d'outil. Overhead négligeable.

---

## DEC-026 — 2026-05-18 — History commands : snapshot des entités en closure

**Décision :** Les nodes/walls créés sont capturés en closure dans la commande history, pas relus depuis le state.

**Raison :** Garantit que le undo cible le bon ID même si le state a évolué entre création et annulation.

---

## DEC-027 — 2026-05-18 — entities-renderer.js : module séparé pour le rendu des entités du state

**Décision :** Le rendu des nodes et walls existants est dans `entities-renderer.js` (addLayerRenderer), distinct du rendu preview du wall-tool.

**Raison :** Séparation claire : entités persistées (entities-renderer) vs état temporaire de l'outil (tool's own renderer).
