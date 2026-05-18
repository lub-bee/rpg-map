# RPG Map Editor — CLAUDE.md

**Point d'entrée principal : [PROJECT.md](PROJECT.md)**

> **Reprise après compaction ?** → Copier-coller le prompt dans [RESUME.md](RESUME.md)

## Navigation rapide

| Fichier | Rôle |
|---|---|
| [RESUME.md](RESUME.md) | **Prompt de reprise** — copy-paste après compaction de contexte |
| [PROJECT.md](PROJECT.md) | Vision, statut, navigation globale |
| [docs/requirements.md](docs/requirements.md) | Requirements complets (source de vérité) |
| [docs/decisions.md](docs/decisions.md) | Log des décisions architecturales |
| [docs/discussions.md](docs/discussions.md) | Log de toutes les discussions (Ludo + internes agents) |
| [docs/questions.md](docs/questions.md) | Questions en attente de réponse |
| [docs/plan/overview.md](docs/plan/overview.md) | Plan de dev complet |
| [agents/README.md](agents/README.md) | Team d'agents et leurs rôles |

## Règles absolues (non-négociables)

1. **Doc Keeper obligatoire** : tout changement de code → mise à jour doc dans le même commit. Sans exception.
2. **Toute décision** doit être loggée dans `docs/decisions.md` avec date et justification.
3. **Aucune doc outdated** : peu importe l'ordre reçu, la doc est toujours synchronisée.
4. **Tout tracer** : toutes les discussions (avec Ludo ET entre agents) → `docs/discussions.md`. Toute décision → `docs/decisions.md`. Tout requirement implicite issu d'une discussion → `docs/requirements.md`.
5. **WYSIWYG strict** : aucune divergence entre l'affichage éditeur et l'export.

## Lancer le projet localement

```bash
python3 -m http.server 8080 --directory src/
# puis ouvrir http://localhost:8080
```
