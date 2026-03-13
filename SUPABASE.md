# Supabase

1. Crie um projeto em `https://supabase.com`.
2. No SQL Editor, execute [database/supabase.sql](/c:/Git/pacsayajin/database/supabase.sql).
3. Em `Project Settings > API`, copie:
   - `Project URL`
   - `anon public key`
4. Preencha [src/config/supabase-config.js](/c:/Git/pacsayajin/src/config/supabase-config.js):

```js
export const SUPABASE_URL = "https://SEU-PROJETO.supabase.co";
export const SUPABASE_ANON_KEY = "SUA_ANON_KEY";
export const SUPABASE_RANKING_TABLE = "ranking";
```

Com isso, o jogo passa a:
- carregar o ranking online ao abrir;
- salvar nova pontuacao no Supabase ao terminar a partida;
- manter `localStorage` como fallback se o Supabase nao estiver configurado ou falhar.
