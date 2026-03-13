# PAC-SAYAJIN

PAC-SAYAJIN e um jogo inspirado em Pac-Man, com tema Dragon Ball, ranking de pontuacao e integracao opcional com Supabase.

Este projeto foi feito usando **Codex GPT-5.4**.

## Jogar

Quando o GitHub Pages estiver habilitado neste repositorio, o jogo pode ser acessado em:

`https://jscaramal.github.io/pacsayajin/`

Se a pagina ainda nao estiver publicada, abra localmente o arquivo `index.html`.

## Controles

- `Setas` ou `WASD`: movimento
- `Espaco`: pausa
- `Start`: inicia a partida com o nick atual
- `Reiniciar`: reinicia o jogo

## Ranking

O ranking funciona de duas formas:

- `localStorage` como fallback local
- `Supabase` como backend online, quando configurado

As instrucoes de configuracao do banco estao em [SUPABASE.md](./SUPABASE.md).

## Publicacao

O repositorio foi preparado para publicar o jogo via GitHub Pages a partir do proprio `index.html`.

URL esperada:

`https://jscaramal.github.io/pacsayajin/`
