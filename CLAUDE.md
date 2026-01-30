# Todo Discord Bot - Home Assistant Add-on

## Proyecto
Bot de Discord (Cluco) para gestionar tareas via slash commands. Desplegado como add-on de Home Assistant.

## Comandos
| Comando | Descripción |
|---------|-------------|
| `/todo` | Lista todas las tareas pendientes con fecha |
| `/stats` | Muestra las tareas pendientes del usuario de Discord |
| `/ask <pregunta>` | Pregunta sobre tus tareas o **crea nuevas** usando IA (Claude Haiku + Tool Use) |

### Crear tareas con `/ask` (Tool Use)
El comando `/ask` puede crear tareas cuando detecta frases como:
- `Crear tarea: revisar PR`
- `Nueva tarea para mañana: enviar reporte`
- `Tarea para Adriana: preparar demo`
- `Nueva tarea para cliente PUCP proyecto GOGO: hacer entrega`

**Comportamiento:**
- Si no especifica asignado → asigna al usuario que pregunta
- Convierte fechas relativas ("mañana", "pasado mañana") a YYYY-MM-DD
- Si especifica proyecto/cliente → los crea automáticamente si no existen
- Si no especifica proyecto → usa el proyecto por defecto

## Estructura
```
bot/
├── .github/workflows/deploy.yml   # CI/CD → ghcr.io
├── repository.yaml                # Config del repo HA
└── todo-discord-bot/              # Código del bot
    ├── commands/
    │   ├── todo.ts                # Comando /todo
    │   ├── stats.ts               # Comando /stats
    │   └── ask.ts                 # Comando /ask (IA)
    ├── lib/supabase.ts            # Cliente Supabase
    ├── index.ts                   # Entry point
    ├── register-commands.ts       # Registro de slash commands
    ├── config.yaml                # Config del add-on (versión aquí)
    ├── Dockerfile
    └── run.sh
```

## Stack
- Runtime: Bun
- Discord: discord.js
- Database: Supabase
- Shared Package: `@jomavicuna/todo-shared` (GitHub Packages)
- Deploy: GitHub Actions → ghcr.io → Home Assistant

**IDs (Supabase, Discord):** Ver `../constants.md`

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
version: "1.10.3"  # Incrementar versión (actual: 1.10.3)
```

El CI extrae la versión automáticamente de `config.yaml`, no necesitas editar `deploy.yml`.

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
- Probar `/todo`, `/stats` o `/ask` en Discord

---

## Workflow: Agregar columna a Supabase

Cuando agregas una columna nueva a la BD, el bot **no la detecta automáticamente**. Sigue este flujo según lo que necesites:

### Solo guardar datos (sin mostrar en Discord)
No necesitas cambiar nada en el bot. La columna existe en la BD y puedes escribir/leer desde otros clientes.

### Mostrar nuevos datos en Discord

```
Supabase (columna) → Tipos (opcional) → Query → Display → Deploy
```

**Paso a paso:**

1. **Agregar columna en Supabase**
   ```sql
   ALTER TABLE todo ADD COLUMN mi_campo text;
   ```

2. **Actualizar tipos** (recomendado para type-safety)
   ```bash
   # Editar todo/shared-npm/src/types.ts
   # Bump version en package.json
   # Push a main (auto-publish)

   # Luego en el bot:
   GITHUB_TOKEN=$(gh auth token) npm update @jomavicuna/todo-shared
   ```

3. **Actualizar query** en `lib/supabase.ts`
   ```typescript
   // Agregar el campo al .select()
   .select("id, title, due_date, mi_campo, ...")
   ```

4. **Actualizar display** en `commands/todo.ts` o `stats.ts`
   ```typescript
   // Usar el nuevo campo en el formato
   const miCampo = todo.mi_campo ?? "N/A";
   return `${todo.title} - ${miCampo}`;
   ```

5. **Deploy**
   ```bash
   # Bump version en config.yaml
   git add -A && git commit -m "feat: mostrar mi_campo" && git push
   # Esperar Actions → Update en HA
   ```

### Resumen rápido

| Quiero... | Archivos a editar |
|-----------|-------------------|
| Solo guardar | Nada |
| Mostrar en `/todo` | `lib/supabase.ts` + `commands/todo.ts` |
| Mostrar en `/stats` | `lib/supabase.ts` + `commands/stats.ts` |
| Type-safety | `@jomavicuna/todo-shared` |

---

## Instrucciones para Claude

**Repo separado:** Este bot está en `jomavicuna/todo-discord-bot`.

**Shared Package:** `@jomavicuna/todo-shared` - Ver contenido en `../CLAUDE.md` sección Shared Packages.

Cuando modifiques el schema de Supabase:
1. Actualizar tipos en `@jomavicuna/todo-shared` (publicar nueva versión)
2. Actualizar dependencia en el bot si es necesario
3. Verificar que las queries sigan funcionando con el nuevo schema
4. Bump de versión en `config.yaml`

Cuando agregues nuevas funcionalidades compartidas:
1. Agregar al package `@jomavicuna/todo-shared`
2. Publicar nueva versión del package
3. Actualizar el bot con la nueva versión

## Notas
- **Restart ≠ Update**: Restart solo reinicia el container existente. Para código nuevo, necesitas Update.
- **Versión obligatoria**: Si no cambias la versión en config.yaml, HA no detectará el update.
- **GitHub Actions**: El build tarda ~45-60 segundos. Esperar a que termine antes de buscar update en HA.
- **Arquitectura**: El bot corre en `aarch64` (Home Assistant Green).
- **Sincronizar tipos:** Si cambia el schema en Supabase, actualizar también `../supabase/CLAUDE.md`.

---

## ⚠️ Actualizar Dependencias (IMPORTANTE)

El Dockerfile usa `--frozen-lockfile`, lo que significa que `bun.lock` debe estar actualizado. **Si solo editas `package.json` sin actualizar `bun.lock`, el build fallará.**

### Workflow correcto para actualizar dependencias

```bash
cd /Users/vicuna/sv/todo/discord/bot/todo-discord-bot

# 1. Editar package.json con las nuevas versiones

# 2. Obtener token de GitHub para autenticar con GitHub Packages
export GITHUB_TOKEN=$(op item get vagqtgd5rjqmhvdh2cc5h7xh4q --fields credential)

# 3. Actualizar bun.lock
GITHUB_TOKEN=$GITHUB_TOKEN bun install

# 4. Bump versión en config.yaml

# 5. Commit TODO (package.json + bun.lock + config.yaml)
git add -A && git commit -m "chore: update dependencies" && git push
```

### Error común: `@jomavicuna/todo-shared` no encontrado

Si ves error `401` o `failed to resolve` para `@jomavicuna/todo-shared`:

1. **Verificar que la versión exista** en GitHub Packages:
   - Ir a https://github.com/jomavicuna/todo-shared/packages
   - Confirmar que la versión solicitada está publicada

2. **Si la versión no existe**, tienes dos opciones:
   - Publicar la versión desde `todo/shared-npm/` (requiere GitHub Actions)
   - Usar una versión que sí exista (ej: `^1.0.0`)

3. **Versiones disponibles conocidas:** `1.0.0` (verificada funcional)

### Lección aprendida (2026-01-22)

Se intentó actualizar `@jomavicuna/todo-shared` de `^1.0.0` a `^1.2.0`, pero la versión 1.2.0 nunca fue publicada a GitHub Packages (solo existía localmente en `shared-npm/package.json`). El build falló con error 401. Solución: revertir a `^1.0.0`.

## Credenciales
Configuradas en Home Assistant Add-on → Configuration:
- `discord_token`: Token del bot Discord
- `supabase_url`: URL del proyecto Supabase
- `supabase_anon_key`: Anon key de Supabase

## Thread Tracking

El bot trackea actividad en threads de Discord para mostrar información actualizada.

### Cache
- **TTL:** 5 minutos
- **Funciones:**
  - `loadThreadCache()` - Carga threads desde Supabase al iniciar
  - `isThreadTracked(threadId)` - Verifica si un thread está en cache
  - `updateThreadActivity(threadId, discordUserId)` - Actualiza actividad

### Campos Trackeados
| Campo | Descripción |
|-------|-------------|
| `last_activity_at` | Timestamp del último mensaje |
| `last_message_by_discord_id` | ID de Discord del último usuario que escribió |

### Flujo
1. Bot detecta mensaje en thread trackeado
2. Verifica cache (`isThreadTracked`)
3. Si existe, actualiza `last_activity_at` y `last_message_by_discord_id` en Supabase
4. Cache se refresca cada 5 minutos

---

## Links
- Repo: https://github.com/jomavicuna/todo-discord-bot
- Shared Package: https://github.com/jomavicuna/todo-shared
- Actions: https://github.com/jomavicuna/todo-discord-bot/actions
- Supabase: https://supabase.com/dashboard/project/bqchuxhrbbikkoibdtsp
- Home Assistant Add-on: http://homeassistant.local:8123/hassio/addon/cc88d9a6_todo-discord-bot/info
