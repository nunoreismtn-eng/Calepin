# Calepin · Le français de la pierre

Francês profissional para a pedra natural de luxo, ao estilo Pimsleur: o professor diz em português o que queres dizer, respondes em francês em voz alta e ouves a versão nativa.

- `src/content.js` — o curso: 16 lições em 4 módulos (diálogo, frases com construção por partes, exercícios, conversa, notas) e o glossário técnico.
- `src/engine.js` — vozes (Web Speech API), guião das lições com recordação em intervalos crescentes, revisão espaçada (caixas de Leitner) e verificação da pronúncia.
- `src/app.js`, `src/styles.css`, `src/shell.html` — a app.
- `build.py` — gera a página do artefacto (com os dados de `private.json`, que não vai para o repositório) e o site público em `site/`, publicado em `francais/` no ramo `main`.
- `test/` — testes no Chromium com vozes simuladas.

App: https://nunoreismtn-eng.github.io/estudio-veio/francais/
