# TeamLMTD ERP - Quick Reference Cheat Sheet

**Print this and keep it handy!**

---

## 🚀 Daily Startup

```bash
# 1. Open Terminal (Cmd + Space, type "Terminal")

# 2. Go to project
cd ~/Projects/teamlmtd-erp

# 3. Start Claude Code (Tab 1)
claude

# 4. Open new tab (Cmd + T), start app (Tab 2)
pnpm dev

# 5. Open browser to: http://localhost:3000
```

---

## 💬 Talking to Claude Code

### Good Prompts ✅
- "Create the [component] based on [doc file]"
- "Add [field] to the [form] with validation for [requirement]"
- "The [thing] isn't working. Here's the error: [paste error]"
- "Refactor [file] to use [pattern] like we did in [other file]"

### Bad Prompts ❌
- "Make it work"
- "Build everything"
- "Fix it"
- "Do the thing"

---

## 🛠 Common Commands

| What You Want | Command |
|--------------|---------|
| Start the app | `pnpm dev` |
| Stop the app | `Ctrl + C` |
| Start Claude Code | `claude` |
| View database | `pnpm db:studio` |
| Reset database | `pnpm db:push --force-reset && pnpm db:seed` |
| Open in VS Code | `code .` |
| Save changes | `git add . && git commit -m "message"` |

---

## 🔧 When Things Break

### "Port 3000 in use"
```bash
lsof -i :3000
kill -9 [the PID number]
pnpm dev
```

### "Module not found"
```bash
pnpm install
```

### "Database error"
```bash
pnpm db:push --force-reset
pnpm db:seed
```

### "Claude Code stuck"
Press `Ctrl + C`, then try a simpler prompt

### "Permission denied"
Add `sudo` before the command

---

## 📁 Key Files

| File | What It Is |
|------|------------|
| `CLAUDE.md` | Instructions for Claude Code |
| `/docs/*.md` | Your specifications |
| `/prisma/schema.prisma` | Database structure |
| `/prisma/seed.ts` | Test data |
| `/config/forms/*.ts` | Form configurations |
| `/src/app/(dashboard)/*` | Main pages |

---

## 🎨 Brand Colors

| Color | Hex | Use For |
|-------|-----|---------|
| Primary | `#52EDC7` | Buttons, links, accents |
| Dark | `#1BA098` | Headings, hover states |
| Background | `#F9FAFB` | Page background |
| Text | `#111827` | Body text |

---

## 📱 Keyboard Shortcuts

| Keys | Action |
|------|--------|
| `Cmd + Space` | Open Spotlight |
| `Cmd + T` | New Terminal tab |
| `Cmd + W` | Close tab |
| `Ctrl + C` | Stop command |
| `Cmd + K` | Clear Terminal |
| `↑` | Previous command |

---

## 🏗 Build Order (Phases)

1. ✅ Foundation (Auth, Layout, Database)
2. ⬜ Briefing System (7 forms)
3. ⬜ Resource Planning (Kanban, Gantt)
4. ⬜ Time Tracking (Timer, Timesheets)
5. ⬜ RFP + Client Portal
6. ⬜ Integrations (Slack, Google)

---

## 📞 Getting Help

1. **Ask Claude Code** - It can debug its own code
2. **Ask Claude Chat** - For explanations and planning
3. **Google the error** - Copy/paste exact error message
4. **Check the docs** - Your `/docs` folder has the answers

---

*Keep building! 🚀*
