# TeamLMTD ERP - Complete Setup Guide

## For Complete Beginners | Mac Edition

**Time Required:** ~30 minutes for setup, then ongoing development

---

## Part 1: Understanding What We're Doing

### What is Claude Code?
Claude Code is a command-line tool that lets Claude write code directly on your computer. You describe what you want, Claude writes the code, creates files, and runs commands. It's like having a developer assistant who can actually type and execute things.

### What Will We Build?
A local development environment where:
1. You talk to Claude in your terminal
2. Claude writes the ERP code
3. You can see and test it in your browser at `localhost:3000`
4. When ready, deploy to the internet

### The Simple Truth
You don't need to know how to code. You need to know how to:
- Open Terminal
- Copy/paste commands
- Describe what you want in plain English

---

## Part 2: One-Time Setup (Do This Once)

### Step 1: Open Terminal

**How to find Terminal:**
1. Press `Cmd + Space` (opens Spotlight)
2. Type "Terminal"
3. Press Enter

You'll see a window with text. This is where you'll type commands.

> 💡 **Tip:** Right-click Terminal in your dock and select "Options > Keep in Dock" so it's always easy to find.

---

### Step 2: Install Homebrew (Mac's Package Manager)

Copy and paste this entire command, then press Enter:

```bash
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
```

- It will ask for your Mac password (you won't see characters as you type - that's normal)
- Follow any instructions it shows at the end
- This takes 2-5 minutes

**Verify it worked:**
```bash
brew --version
```
Should show something like "Homebrew 4.x.x"

---

### Step 3: Install Node.js

```bash
brew install node
```

**Verify:**
```bash
node --version
```
Should show "v20.x.x" or similar

---

### Step 4: Install pnpm (Better Package Manager)

```bash
npm install -g pnpm
```

**Verify:**
```bash
pnpm --version
```

---

### Step 5: Install Claude Code

```bash
npm install -g @anthropic-ai/claude-code
```

**Verify:**
```bash
claude --version
```

---

### Step 6: Authenticate Claude Code

```bash
claude auth
```

This will:
1. Open your browser
2. Ask you to log into your Anthropic/Claude account
3. Authorize Claude Code

Once done, you'll see "Authentication successful" in Terminal.

---

### Step 7: Install PostgreSQL (Database)

```bash
brew install postgresql@15
brew services start postgresql@15
```

**Verify it's running:**
```bash
brew services list
```
Should show "postgresql@15 started"

---

### Step 8: Install VS Code (Optional but Recommended)

This lets you SEE the code Claude writes:

```bash
brew install --cask visual-studio-code
```

Or download from: https://code.visualstudio.com/

---

## Part 3: Create Your Project

### Step 1: Create Project Folder

```bash
cd ~
mkdir Projects
cd Projects
mkdir teamlmtd-erp
cd teamlmtd-erp
```

You're now in: `/Users/[yourname]/Projects/teamlmtd-erp`

---

### Step 2: Start Claude Code

```bash
claude
```

You'll see Claude's interface in your terminal. Now you can talk to it!

---

### Step 3: Give Claude the Documentation

First, let's create a docs folder and add our specs. In the Claude Code session, type:

```
Create a /docs folder and I'll paste in our technical specifications
```

Then you can either:
- **Option A:** Upload the documentation files directly to Claude Code
- **Option B:** Copy/paste the content from each doc

---

## Part 4: Building With Claude Code

### How to Talk to Claude Code

Just type naturally! Here's the pattern:

```
You: [Describe what you want]
Claude: [Shows plan, asks clarification if needed]
You: [Approve or adjust]
Claude: [Writes code, creates files, runs commands]
```

### The Build Sequence

Copy and paste these prompts in order. Wait for Claude to finish each one before moving to the next.

---

#### Prompt 1: Project Setup

```
Initialize a new Next.js 14 project with TypeScript, Tailwind CSS, and the App Router. 
Use pnpm as the package manager.
Add these dependencies: prisma, @prisma/client, next-auth, zod, react-hook-form, @hookform/resolvers, zustand, @tanstack/react-query, lucide-react
Also set up shadcn/ui with the default configuration.
```

---

#### Prompt 2: Database Setup

```
Set up Prisma with PostgreSQL. Create the database schema based on our Technical Architecture doc (02_Technical_Architecture.md).

Include all these models:
- Organization (multi-tenant root)
- User (with PermissionLevel enum)
- Client
- Project  
- Brief (with BriefType and BriefStatus enums)
- TimeEntry
- RFP (with RFPStatus enum)
- Comment, Attachment, AuditLog

Remember: every model needs organizationId for multi-tenancy.

After creating the schema, run the migration and create the database.
```

---

#### Prompt 3: Seed Data

```
Create a seed file (prisma/seed.ts) with all 46 LMTD team members from our User Directory (06_User_Directory.md).

Include:
- The LMTD organization
- All users with correct departments, roles, and permission levels
- The 4 main clients: CCAD, DET, ADEK, ECD

Then run the seed to populate the database.
```

---

#### Prompt 4: Authentication

```
Set up NextAuth.js v5 with:
1. Google OAuth provider (for @teamlmtd.com domain)
2. Credentials provider (for freelancers with external emails)
3. Session includes: userId, organizationId, permissionLevel
4. Middleware that protects all /dashboard routes

Create the auth configuration and API routes.
```

---

#### Prompt 5: Layout & Navigation

```
Create the main dashboard layout with:
1. Sidebar navigation with these items:
   - Dashboard (home icon)
   - Briefs (file icon)
   - Resources (calendar icon)
   - Time (clock icon)
   - Clients (users icon)
   - RFP (trending-up icon) - only visible to LEADERSHIP+
   - Analytics (bar-chart icon) - only visible to LEADERSHIP+
   - Settings (settings icon)

2. Top header with:
   - Search bar
   - Global timer component (placeholder)
   - Notifications bell
   - User avatar dropdown

Use our brand colors: Primary #52EDC7, Dark #1BA098
Use shadcn/ui components and lucide-react icons.
```

---

#### Prompt 6: Brief Submission Form

```
Create the brief submission system based on 03_Briefing_System.md:

1. A BriefTypeSelector page at /dashboard/briefs/new that shows 7 cards for each brief type
2. A DynamicForm component that renders forms from config files
3. The Video Shoot form as the first implementation with all fields from the spec
4. Form validation using Zod
5. Quality score calculation that updates in real-time
6. Submit action that creates the brief in the database

Make the form config-driven so we can easily add the other 6 types.
```

---

#### Prompt 7: Briefs List & Detail

```
Create the briefs management pages:

1. /dashboard/briefs - List all briefs with:
   - Filters: type, status, client, assignee
   - Search by title
   - Sortable columns
   - Click to view detail

2. /dashboard/briefs/[id] - Brief detail page with:
   - All form data displayed
   - Status badge with change dropdown
   - Assignment section
   - Comments thread
   - Activity history
   - Timer start button
```

---

### Keep Going...

Continue with similar prompts for:
- Resource Planning (Kanban, Gantt)
- Time Tracking
- RFP Management
- Client Portal

---

## Part 5: Running Your App

### Start Development Server

In your project folder:

```bash
pnpm dev
```

Then open your browser to: **http://localhost:3000**

### Stop the Server

Press `Ctrl + C` in Terminal

### Useful Commands

| Command | What it does |
|---------|--------------|
| `pnpm dev` | Start the app locally |
| `pnpm build` | Build for production |
| `pnpm db:studio` | Open database viewer |
| `pnpm db:push` | Push schema changes |
| `pnpm db:seed` | Re-run seed data |

---

## Part 6: When Things Go Wrong

### "Command not found"

The tool isn't installed. Re-run the install command.

### "Permission denied"

Add `sudo` before the command (uses admin privileges):
```bash
sudo [command]
```

### "Port 3000 already in use"

Something else is using that port. Either:
```bash
# Find and kill it
lsof -i :3000
kill -9 [PID from above]

# Or use different port
pnpm dev -- -p 3001
```

### Database errors

```bash
# Reset everything
pnpm db:push --force-reset
pnpm db:seed
```

### Claude Code seems stuck

Press `Ctrl + C` to cancel, then try again with a simpler prompt.

### Need to start fresh

```bash
cd ~/Projects
rm -rf teamlmtd-erp
mkdir teamlmtd-erp
cd teamlmtd-erp
claude
```

---

## Part 7: Daily Workflow

### Starting Your Day

```bash
# 1. Open Terminal
cd ~/Projects/teamlmtd-erp

# 2. Start Claude Code
claude

# 3. In another Terminal tab (Cmd+T), start the app
pnpm dev

# 4. Open VS Code to see files (optional)
code .
```

### Talking to Claude Code

**Good prompts:**
- "Add a deadline date picker to the brief form"
- "The status dropdown isn't saving. Can you check the API route?"
- "Create the Kanban board based on 04_Resource_Planning.md"

**Bad prompts:**
- "Make it work" (too vague)
- "Build everything" (too broad)
- "Fix it" (fix what?)

### Saving Your Work

Claude Code doesn't auto-save to the cloud. Use Git:

```bash
# First time setup
git init
git add .
git commit -m "Initial commit"

# After making changes
git add .
git commit -m "Added brief submission form"
```

---

## Part 8: Deployment (When Ready)

### Option 1: Vercel (Recommended - Easiest)

1. Go to https://vercel.com
2. Sign up with GitHub
3. Push your code to GitHub
4. Import project in Vercel
5. Add environment variables
6. Deploy!

### Option 2: Local Network (For Testing)

To let others on your WiFi see it:

```bash
pnpm dev -- -H 0.0.0.0
```

Then share your local IP (find it in System Preferences > Network)

---

## Quick Reference Card

### Terminal Commands You'll Use

| Action | Command |
|--------|---------|
| Go to project | `cd ~/Projects/teamlmtd-erp` |
| Start Claude Code | `claude` |
| Start app | `pnpm dev` |
| Stop app | `Ctrl + C` |
| View database | `pnpm db:studio` |
| Open in VS Code | `code .` |

### Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Cmd + Space` | Open Spotlight (find Terminal) |
| `Cmd + T` | New Terminal tab |
| `Cmd + W` | Close Terminal tab |
| `Ctrl + C` | Stop current command |
| `Cmd + K` | Clear Terminal |
| Up Arrow | Previous command |

---

## You've Got This! 🚀

Remember:
1. **You don't need to understand the code** - Claude handles that
2. **Be specific in your prompts** - The clearer you are, the better the results
3. **One thing at a time** - Don't ask for everything at once
4. **It's okay to fail** - Just try again or ask Claude to fix it
5. **Reference the docs** - Point Claude to our spec documents

The documentation we created together IS your roadmap. Just feed it to Claude Code piece by piece.

---

*Questions? Just ask Claude (the chat one) or Claude Code (the terminal one)!*
