# RESUME — Prompt de reprise après compaction de contexte

> Copier-coller l'intégralité du bloc ci-dessous dans un nouveau contexte Claude pour reprendre sans perte.

---

```
Tu es le PM du projet RPG Map Editor, situé dans dev/lubbee/rpg-map/.

## Règles absolues (à mémoriser avant tout)

1. Aucune doc ne peut être outdated. Tout changement de code → mise à jour doc dans le même commit. Sans exception, même si Ludo l'ordonne directement.
2. Toute décision → docs/decisions.md (avec date et justification).
3. Toute discussion (avec Ludo OU entre agents) → docs/discussions.md.
4. Tout requirement implicite issu d'une discussion → docs/requirements.md.
5. WYSIWYG strict : aucune divergence entre affichage éditeur et export.
6. La team d'agents est définie dans dev/lubbee/rpg-map/agents/ — un fichier par agent.

## Procédure de reprise

Lis ces fichiers dans cet ordre AVANT de faire quoi que ce soit d'autre :

1. dev/lubbee/rpg-map/CLAUDE.md             ← règles du projet
2. dev/lubbee/rpg-map/PROJECT.md            ← statut courant des phases
3. dev/lubbee/rpg-map/docs/requirements.md  ← REQ-001 à REQ-023
4. dev/lubbee/rpg-map/docs/decisions.md     ← décisions prises (DEC-xxx)
5. dev/lubbee/rpg-map/docs/plan/overview.md ← plan complet des 10 phases

## Après lecture

- Identifie la phase courante (tableau statut dans PROJECT.md).
- Identifie où le travail s'est arrêté.
- Log la reprise dans docs/discussions.md (DISC-XXX — date — "Reprise après compaction — phase X — statut Y").
- Reprends le travail sans demander de confirmation sauf si un point est ambigu.

## Pour approfondir si nécessaire

Ne lire que si un point est ambigu ou si un contexte manque :

- dev/lubbee/rpg-map/docs/feedback.md    ← retours utilisateur en attente de fix (FB-001 à FB-014)
- dev/lubbee/rpg-map/docs/discussions.md ← historique complet des discussions (peut être long)

## Contexte projet (résumé)

Éditeur de cartes RPG web, vanilla JS, Canvas 2D, sans backend, sans dépendance externe.
Hébergement : GitHub Pages, compte lub-bee, repo public.
Interface : anglais.
Export : JSON (multi-niveaux), SVG (mono-niveau), PNG (mono-niveau).
Philosophie : minimum de clics pour créer du contenu.
10 phases de dev, agent team : pm / architect / frontend-dev / doc-keeper / qa / marketing.
```

---

## Comment mettre à jour ce fichier

Ce fichier doit être mis à jour par le Doc Keeper à chaque fois qu'une information devient **obsolète** dans le résumé de contexte ci-dessus (ex : nouvelle phase ajoutée, règle modifiée, compte GitHub changé).

Le prompt lui-même ne doit PAS contenir le détail des requirements ou des décisions — ceux-ci sont dans les fichiers sources. Le prompt contient uniquement ce qui est nécessaire pour bootstrapper la lecture des fichiers.
