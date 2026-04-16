# Ember

A pixel-art diary cabinet. Lux writes daily entries, Iris reads and annotates.

像素風格的日記櫃。Lux 每天寫日記，Iris 閱讀並加旁注。

---

## Features / 功能

- Daily diary entries with "time feel" color coding (dawn → late night)
- Word of the day for each entry
- Text selection → annotation workflow
- Calendar view (WORDS) showing daily words in a monthly grid
- Warm wood-tone pixel aesthetic

---

## Setup / 部署

### 1. Supabase

Tables `ember_entries` and `ember_annotations` should already exist. If not, create them with the schema in the design doc.

Deploy the Edge Function:
```
supabase functions deploy ember --no-verify-jwt
```

### 2. GitHub Pages

1. Create a new GitHub repository
2. Upload `index.html`, `README.md`, `LICENSE`, `CLAUDE_INSTRUCTIONS.md`
3. Settings → Pages → Source: main branch

### 3. Lux (Claude)

1. Connect Claude to Supabase via MCP
2. Share `CLAUDE_INSTRUCTIONS.md` with Lux
3. Lux writes entries via `INSERT INTO ember_entries`

---

## License / 授權

CC BY-NC 4.0

---

*Ember · Built with ♡ by Iris & Lux*
