# Requirements — RPG Map Editor

> Source de vérité. Toute décision issue d'une discussion avec Ludo est tracée ici.
> Dernière mise à jour : 2026-05-18

---

## REQ-001 — Philosophie UX : minimum de clics

**Source :** Discussion initiale Ludo, 2026-05-18

L'outil doit permettre de créer du contenu avec le minimum de clics possible.

Séquence de création d'une pièce / zone :
1. Sélectionner l'outil mur
2. Cliquer → placer node A (point de départ)
3. Cliquer → placer node B (mur A→B généré automatiquement)
4. Cliquer → placer node C (mur B→C généré automatiquement)
5. ... répéter ...
6. Cliquer sur node A → forme fermée (mur N→A généré)

**Contrainte :** pas de confirmation, pas de double-clic, pas de drag obligatoire.

---

## REQ-002 — Grille carrée avec snap

**Source :** Discussion initiale Ludo, 2026-05-18

- L'éditeur affiche une grille carrée visible.
- Les nodes se placent sur les intersections de la grille (snap automatique).
- La grille est visible à l'écran et dans l'export (WYSIWYG).

---

## REQ-003 — Types de murs

**Source :** Discussion initiale Ludo, 2026-05-18

Support des géométries suivantes :
- Mur droit sur la grille (horizontal / vertical)
- Mur diagonal
- Mur à angle libre (non-aligné grille)
- Mur en arc de cercle
- Mur circulaire complet

Pour les arcs et cercles :
- Le centre doit pouvoir snapper sur la grille
- Les points de l'arc doivent pouvoir snapper sur la grille

---

## REQ-004 — Textures de mur

**Source :** Discussion initiale Ludo, 2026-05-18

Chaque segment de mur peut avoir une texture parmi :
- Grille (défaut)
- Pierre
- Bois
- Verre
- Eau
- Feu
- (extensible)

---

## REQ-005 — Éléments sur les murs

**Source :** Discussion initiale Ludo, 2026-05-18

Un mur peut recevoir des éléments positionnés sur son segment :
- Fenêtre
- Porte
- Ouverture
- Passage secret
- Tapis
- (extensible)

---

## REQ-006 — Toutes les entités sont éditables

**Source :** Discussion initiale Ludo, 2026-05-18

Après placement, toute entité (node, mur, élément) peut être sélectionnée et éditée :
- Changer sa texture / type
- Déplacer
- Supprimer

---

## REQ-007 — Fonctionne sans base de données

**Source :** Discussion initiale Ludo, 2026-05-18

- Aucun backend requis.
- L'application fonctionne entièrement côté client.
- Sauvegarde possible via localStorage et/ou export fichier.

---

## REQ-008 — Export

**Source :** Discussion initiale Ludo, 2026-05-18

Formats d'export supportés :
- **JSON** : données structurées de la carte (nodes, murs, éléments)
- **SVG** : image vectorielle de la carte
- **Image** (PNG/JPEG) : rendu raster

---

## REQ-009 — WYSIWYG strict

**Source :** Discussion initiale Ludo, 2026-05-18

Ce que l'utilisateur voit dans l'éditeur EST le résultat final. Aucune variation entre l'affichage éditeur et le fichier généré (SVG ou image).

---

## REQ-010 — Vanilla JS, zéro dépendance

**Source :** Discussion initiale Ludo, 2026-05-18

- Vanilla JavaScript uniquement (ES Modules autorisés).
- Pas de framework (pas de React, Vue, etc.).
- Pas de bibliothèque externe.
- HTML + CSS pour l'interface.

---

## REQ-011 — Hébergement statique gratuit

**Source :** Discussion initiale Ludo, 2026-05-18

Le projet doit être déployable sur un hébergement statique gratuit (GitHub Pages cible préférée).

---

## REQ-012 — Types de lieux supportés

**Source :** Discussion initiale Ludo, 2026-05-18

L'outil doit permettre de créer des cartes pour :
- Maison
- Château
- Fort
- Taverne
- Et tout autre lieu RPG similaire

*(L'outil est générique, les types de lieux sont des suggestions d'usage, pas des modes.)*

---

---

## REQ-013 — Déploiement GitHub Pages, compte lub-bee, repo public

**Source :** DISC-004, Ludo, 2026-05-18

- Compte GitHub : `lub-bee`
- Repo public (requis pour GitHub Pages gratuit)
- Clé SSH enregistrée sur le compte

---

## REQ-014 — Export manuel uniquement, pas de localStorage

**Source :** DISC-004, Ludo, 2026-05-18

Aucune sauvegarde automatique en localStorage. L'utilisateur sauvegarde via le bouton d'export (JSON). Au rechargement, l'éditeur repart vide — sauf si l'utilisateur importe un fichier JSON.

---

## REQ-015 — Multi-niveaux : JSON multi, SVG/PNG mono ou multi si lisible

**Source :** DISC-004, Ludo, 2026-05-18

- Le JSON stocke tous les niveaux/étages dans un seul fichier.
- L'export SVG produit un niveau par page (ou plusieurs niveaux par page si la mise en page reste lisible).
- L'export PNG produit un niveau par image (ou plusieurs niveaux si lisible).
- L'utilisateur choisit quel(s) niveau(x) exporter en SVG/PNG.

---

## REQ-016 — Interface en anglais

**Source :** DISC-004, Ludo, 2026-05-18

Toute l'interface utilisateur est en anglais : labels, tooltips, panneaux, messages d'erreur.

---

## REQ-017 — Taille de grille customisable

**Source :** DISC-004, Ludo, 2026-05-18

La taille des cases de la grille est configurable par l'utilisateur (slider ou input dans l'UI). Pas de valeur par défaut imposée dans les requirements — l'Architect décide de la valeur initiale raisonnable.

---

## REQ-018 — Nodes libres pour éléments de décors

**Source :** DISC-004, Ludo, 2026-05-18

Des nodes "libres" (non attachés à des murs) peuvent être placés pour positionner des éléments de décor : tapis, meubles, chandelles, etc. Ils snappent sur la grille comme les nodes de mur.

---

## REQ-019 — Système de layers

**Source :** DISC-004, Ludo, 2026-05-18

Chaque entité appartient à un layer. Les layers définissent l'ordre de rendu (Z-order) :

| Layer | Contenu | Z-order |
|---|---|---|
| Openings | Passages, portes ouvertes dans le sol | 0 (bas) |
| Floor | Revêtements de sol, tapis | 1 |
| Walls | Murs, structures | 2 |
| Furniture | Meubles, objets, décorations | 3 (haut) |

Plusieurs éléments peuvent se stacker sur un même emplacement (ex : bougie sur table sur tapis = 3 entités sur le layer Furniture).

---

## REQ-020 — Placement rapide : éléments et groupes prédéfinis

**Source :** DISC-004, Ludo, 2026-05-18

Un bouton/outil permet de placer en un clic :
- Un élément de décor seul (table, chaise, tapis, bougie...)
- Un groupe prédéfini (ex : "Dining Set" = table + 4 chaises + bougie + tapis)

Les groupes prédéfinis sont définis dans les données de l'app et extensibles.

---

## REQ-021 — Areas (zones)

**Source :** DISC-004, Ludo, 2026-05-18

Une area est une zone nommée définie par des murs fermés. Exemples : Room, Garden, Corridor, Bedroom.

- Les areas sont nommées par l'utilisateur.
- Les areas peuvent être affichées ou masquées selon le mode d'affichage.
- Une area est automatiquement détectable lorsqu'un périmètre de murs forme une forme fermée.

---

## REQ-022 — Mur séparateur ouvert (area-only)

**Source :** DISC-004, Ludo, 2026-05-18

Un type de mur "open separator" peut être tracé pour délimiter des areas sans affichage visuel dans le rendu normal. Ce mur est visible uniquement quand l'affichage des areas est activé (contour ou remplissage de couleur d'area).

---

## REQ-023 — Modes d'affichage : Preview / Edit

**Source :** DISC-004, Ludo, 2026-05-18

L'éditeur supporte deux modes d'affichage :

| Mode | Description |
|---|---|
| **Edit** | Mode éditeur complet — grille, nodes, handles, outils visibles |
| **Preview** | Mode rendu final — grille masquée, handles masqués, WYSIWYG |

Dans chacun des deux modes, l'utilisateur peut activer/désactiver l'affichage des areas (overlay de couleur ou contour par area nommée).

---

## Questions ouvertes impactant les requirements

Voir [docs/questions.md](questions.md) — toutes les questions initiales sont répondues.
