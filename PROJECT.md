# RPG Map Editor — Projet

## Vision

Outil web de création de cartes RPG (maisons, châteaux, forts, tavernes...) avec une philosophie **minimum de clics** :

```
1. Click → sélectionner outil mur
2. Click → placer node A
3. Click → placer node B (mur A→B créé)
4. Click → placer node C (mur B→C créé)
...
N. Click sur A → forme fermée
```

Tous les éléments sont éditables après placement. Export JSON / SVG / Image. Fonctionne sans serveur, sans base de données. Vanilla JS. Hébergement statique gratuit.

## Statut courant

| Phase | Nom | Statut |
|---|---|---|
| 0 | Setup & Architecture | ✅ Livré |
| 1 | Canvas, Grid & Display Modes | ✅ Livré |
| 2 | Nodes & Walls | ✅ Livré |
| 3 | Layers System | 🟡 En cours |
| 4 | Textures & Wall Elements | ⏳ En attente |
| 5 | Decor Elements & Groups | ⏳ En attente |
| 6 | Areas | ⏳ En attente |
| 7 | Advanced Geometry (arcs, circles) | ⏳ En attente |
| 8 | Entity Editor | ⏳ En attente |
| 9 | Export (JSON / SVG / PNG) | ⏳ En attente |
| 10 | Polish & Deploy | ⏳ En attente |

## Stack technique

- Vanilla JS (ES Modules, pas de framework)
- Canvas 2D API pour le rendu
- Zéro dépendance externe
- HTML + CSS pour l'UI
- GitHub Pages (hébergement gratuit)

## Liens

- [Requirements complets](docs/requirements.md)
- [Plan de développement](docs/plan/overview.md)
- [Décisions architecturales](docs/decisions.md)
- [Discussions (Ludo + internes)](docs/discussions.md)
- [Questions ouvertes](docs/questions.md)
- [Team d'agents](agents/README.md)
