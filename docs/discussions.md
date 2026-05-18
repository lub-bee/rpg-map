# Log des discussions

> Ce fichier trace TOUTES les discussions ayant impacté le projet : discussions avec Ludo ET discussions internes entre agents.
> Format : `[DISC-XXX] — Date — Participants — Résumé — Impact`

---

## DISC-001 — 2026-05-18 — Ludo → PM

**Participants :** Ludo (product owner), PM (Claude)

**Résumé :** Demande de création du projet RPG Map Editor dans `dev/lubbee`. Définition de la philosophie UX (minimum de clics), des features (grille, murs, textures, éléments, arcs, cercles, export), des contraintes techniques (vanilla JS, sans backend, hébergement gratuit).

**Décisions issues :**
- [DEC-001](decisions.md#dec-001) — Rendu Canvas 2D
- [DEC-002](decisions.md#dec-002) — ES Modules sans bundler
- [DEC-003](decisions.md#dec-003) — Modèle graphe nodes/edges
- [DEC-004](decisions.md#dec-004) — GitHub Pages
- [DEC-006](decisions.md#dec-006) — Pas de build step

**Requirements créés :** REQ-001 à REQ-012

---

## DISC-002 — 2026-05-18 — Ludo → PM

**Participants :** Ludo, PM

**Résumé :** Correction de structure — le projet doit être dans un sous-dossier de `dev/lubbee/`, pas à la racine.

**Décision issue :**
- [DEC-005](decisions.md#dec-005) — Dossier `dev/lubbee/rpg-map/`

---

## DISC-003 — 2026-05-18 — Ludo → PM

**Participants :** Ludo, PM

**Résumé :** Clarification sur la portée de la traçabilité : les discussions internes entre agents doivent également être tracées dans la documentation, pas seulement les discussions avec Ludo.

**Impact :** Création de ce fichier `docs/discussions.md`. Mise à jour de la règle dans `CLAUDE.md` et dans le rôle du Doc Keeper.

**Requirement mis à jour :** Toutes les discussions (internes ou avec Ludo) sont référencées ici.

---

## DISC-004 — 2026-05-18 — Ludo → PM

**Participants :** Ludo, PM

**Résumé :** Réponses aux questions Q-001 à Q-006, et ajout de features core oubliées lors de la discussion initiale.

**Réponses aux questions :**
- Q-001 : GitHub `lub-bee`, repo public
- Q-002 : Export manuel uniquement (pas de localStorage)
- Q-003 : Multi-niveaux JSON complet, SVG/PNG mono-niveau par export
- Q-004 : Interface en anglais
- Q-005 : Grid customisable
- Q-006 : Créer un agent Marketing pour le naming

**Nouvelles features ajoutées :**
- Nodes libres pour décors (REQ-018)
- Système de layers avec Z-order (REQ-019)
- Placement rapide d'éléments et groupes prédéfinis (REQ-020)
- Areas nommées définies par murs fermés (REQ-021)
- Mur séparateur open (area-only, invisible) (REQ-022)
- Modes d'affichage Preview / Edit avec toggle area (REQ-023)

**Décisions issues :** DEC-007 à DEC-013

**Impact :** Plan de dev restructuré (7 → 10 phases), agent Marketing créé, requirements REQ-013 à REQ-023 ajoutés.

---

## DISC-005 — 2026-05-18 — Ludo → PM

**Participants :** Ludo, PM

**Résumé :** Ludo demande une solution pour reprendre le projet sans perte d'information après une compaction de contexte Claude. Il veut un prompt copy-paste unique capable de relancer toute la machine.

**Solution retenue :** Création de `RESUME.md` à la racine du projet. Ce fichier contient un prompt complet qui instruit Claude de lire les fichiers sources dans le bon ordre avant toute action. Le prompt ne duplique pas l'information — il bootstrappe la lecture des fichiers existants.

**Impact :**
- Création de `RESUME.md`
- Référence ajoutée dans `CLAUDE.md`
- Doc Keeper mis à jour : maintenir `RESUME.md` en cas de changement structurel

---

## DISC-006 — 2026-05-18 — PM (interne)

**Participants :** PM

**Résumé :** Tentative de création du repo GitHub `lub-bee/rpg-map` via gh CLI. Bloqué : gh est authentifié sous `realprompts-dev`, pas `lub-bee`. SSH fonctionne pour `lub-bee` mais ne donne pas accès à l'API GitHub.

**Action prise :** Remote configuré en SSH (`git@github.com:lub-bee/rpg-map.git`). Travail continue en local. Premier push bloqué tant que le repo n'est pas créé manuellement sur github.com/organizations/lub-bee (ou via le compte lub-bee).

**Blocage :** Ludo doit créer le repo `lub-bee/rpg-map` (public) sur GitHub avant le premier push.

---

## DISC-007 — 2026-05-18 — PM → Architect Agent / Frontend Agent (Phase 0)

**Participants :** PM, Architect Agent, Frontend Agent

**Résumé :** Dispatch parallèle Phase 0. Architect Agent produit schema.js, presets.js, events.js, state.js, history.js. Frontend Agent produit index.html et main.css.

**Décisions issues :** DEC-014 à DEC-019

**Impact :**
- 7 fichiers créés dans `src/`
- stub `src/js/main.js` ajouté par PM post-review
- Phase 0 validée, Phase 1 démarre

---

## DISC-008 — 2026-05-18 — PM → Canvas Agent / UI Agent (Phase 1)

**Participants :** PM, Canvas Agent, UI Agent

**Résumé :** Dispatch parallèle Phase 1. Canvas Agent produit coords.js, camera.js, grid.js. UI Agent produit toolbar.js, mode-toggle.js, statusbar.js.

**Correction post-review :** statusbar.js montrait gridSize comme zoom — corrigé par PM pour écouter l'event `camera:change` (DEC-022).

**Décisions issues :** DEC-020 à DEC-023

**Fichiers créés :** renderer.js (PM), main.js (mis à jour par PM)

---

## Template pour les discussions internes (agents)

```
## DISC-XXX — YYYY-MM-DD — [Agent A] → [Agent B]

**Participants :** [Agent A], [Agent B]

**Contexte :** [Phase ou tâche concernée]

**Résumé :** [Décision ou échange clé]

**Impact :** [Fichiers modifiés, décisions créées, requirements mis à jour]
```
