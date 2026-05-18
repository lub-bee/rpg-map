# Team d'agents — RPG Map Editor

> Chaque agent est défini dans son propre fichier. Ces fichiers sont les prompts utilisés pour spawner les agents Claude Code.

## Composition de la team

| Agent | Fichier | Rôle |
|---|---|---|
| PM | [pm.md](pm.md) | Coordination, suivi des phases, décisions produit |
| Architect | [architect.md](architect.md) | Décisions techniques, structure du code, interfaces |
| Frontend Dev | [frontend-dev.md](frontend-dev.md) | Implémentation vanilla JS, Canvas, UI |
| Doc Keeper | [doc-keeper.md](doc-keeper.md) | Synchronisation doc ↔ code, règle non-négociable |
| QA | [qa.md](qa.md) | Validation des critères, tests cross-browser, WYSIWYG |
| Marketing | [marketing.md](marketing.md) | Naming, README public, landing page, feature copy |

## Règle de collaboration

- Toute décision passe par l'Architect et est loggée dans `docs/decisions.md`.
- Tout code produit par Frontend Dev est suivi d'une passe Doc Keeper.
- Le PM valide la fin de chaque phase avant de passer à la suivante.
- Le QA valide les critères de chaque phase avant que le PM ne la clôture.

## Comment spawner un agent

Dans Claude Code, spawner via le tool `Agent` avec le contenu du fichier `.md` correspondant comme prompt système, ou utiliser directement le fichier comme référence lors du dispatch.
