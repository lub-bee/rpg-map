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
