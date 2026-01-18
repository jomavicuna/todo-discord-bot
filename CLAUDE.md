# Todo Discord Bot - Home Assistant Add-on

## Proyecto
Bot de Discord para gestionar tareas via slash commands (`/todo`). Desplegado como add-on de Home Assistant.

## Estructura
```
todo-discord-bot/
├── .github/workflows/deploy.yml   # CI/CD → ghcr.io
├── repository.yaml                # Config del repo HA
└── todo-discord-bot/              # Código del bot
    ├── commands/todo.ts           # Comando /todo
    ├── lib/supabase.ts            # Cliente Supabase
    ├── index.ts                   # Entry point
    ├── config.yaml                # Config del add-on (versión aquí)
    ├── Dockerfile
    └── run.sh
```

## Stack
- Runtime: Bun
- Discord: discord.js
- Database: Supabase
- Deploy: GitHub Actions → ghcr.io → Home Assistant

---

## Workflow: Actualizar el bot en Home Assistant

### 1. Hacer cambios en el código
```bash
cd /Users/vicuna/sv/todo/discord/bot/todo-discord-bot
# Editar archivos (commands/todo.ts, lib/supabase.ts, etc.)
```

### 2. Bump de versión (IMPORTANTE)
Editar `todo-discord-bot/config.yaml`:
```yaml
version: "1.2.0"  # Incrementar versión
```

Editar `.github/workflows/deploy.yml` - actualizar tags:
```yaml
tags: |
  ghcr.io/${{ github.repository }}/aarch64-todo-discord-bot:${{ github.sha }}
  ghcr.io/${{ github.repository }}/aarch64-todo-discord-bot:latest
  ghcr.io/${{ github.repository }}/aarch64-todo-discord-bot:1.2.0  # Nueva versión
```
(Hacer lo mismo para amd64)

### 3. Commit y push
```bash
git add -A
git commit -m "feat: descripción del cambio"
git push
```

### 4. Esperar GitHub Actions (~45-60s)
Verificar en: https://github.com/jomavicuna/todo-discord-bot/actions

O con CLI:
```bash
gh run list --repo jomavicuna/todo-discord-bot --limit 1
```

### 5. Actualizar en Home Assistant
1. **Settings → Add-ons → Add-on Store**
2. Click **⋮** (menú) → **Check for updates**
3. Volver a **Todo Discord Bot**
4. Click **Update** (debería mostrar nueva versión)
5. Click **Start**

### 6. Verificar
- Revisar **Log** en HA para confirmar "Bot listo como Cluco#7896"
- Probar `/todo` en Discord

---

## Notas
- **Restart ≠ Update**: Restart solo reinicia el container existente. Para código nuevo, necesitas Update.
- **Versión obligatoria**: Si no cambias la versión en config.yaml, HA no detectará el update.
- **GitHub Actions**: El build tarda ~45-60 segundos. Esperar a que termine antes de buscar update en HA.
- **Arquitectura**: El bot corre en `aarch64` (Home Assistant Green).

## Credenciales
Configuradas en Home Assistant Add-on → Configuration:
- `discord_token`: Token del bot Discord
- `supabase_url`: URL del proyecto Supabase
- `supabase_anon_key`: Anon key de Supabase

## Links
- Repo: https://github.com/jomavicuna/todo-discord-bot
- Actions: https://github.com/jomavicuna/todo-discord-bot/actions
- Supabase: https://supabase.com/dashboard/project/bqchuxhrbbikkoibdtsp
