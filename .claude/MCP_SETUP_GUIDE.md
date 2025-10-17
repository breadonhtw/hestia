# Supabase MCP Setup Guide

**Status**: Configuration file created, awaiting access token

---

## Step 1: Get Your Supabase Access Token

### Instructions:

1. **Open Supabase Dashboard**
   - Go to: https://supabase.com/dashboard

2. **Navigate to Access Tokens**
   - Click your **profile icon** (bottom left) → **Access Tokens**
   - Or visit: https://supabase.com/dashboard/account/tokens

3. **Generate New Token**
   - Click **Generate new token**
   - Name: `claude-mcp-hestia` (or your preference)
   - Set appropriate scopes (suggested: "all")
   - Click **Generate**

4. **Copy the Token**
   - Token appears as: `sbp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`
   - Copy it immediately (only shown once)

---

## Step 2: Update `.claude/mcp.json`

**File**: `.claude/mcp.json` (already created)

### Replace `YOUR_ACCESS_TOKEN_HERE` with your actual token:

```json
{
  "mcpServers": {
    "supabase-dev": {
      "command": "npx",
      "args": ["@modelcontextprotocol/server-supabase"],
      "env": {
        "SUPABASE_ACCESS_TOKEN": "sbp_xxxxxxxxxxxxx"
      }
    },
    "supabase-prod": {
      "command": "npx",
      "args": ["@modelcontextprotocol/server-supabase"],
      "env": {
        "SUPABASE_ACCESS_TOKEN": "sbp_xxxxxxxxxxxxx",
        "READONLY": "true"
      }
    }
  }
}
```

### Security Note:
- ✅ `.claude/mcp.json` is in `.gitignore` - won't be committed
- ✅ Token stays local only
- ✅ Never hardcode tokens in source files
- ✅ Production MCP runs in `READONLY` mode for safety

---

## Step 3: Restart Claude Code

After updating `.claude/mcp.json`:

1. **Restart Claude Code**
   - Close and reopen Claude Code CLI
   - Or run: `/help` to trigger reconnection

2. **Verify Connection**
   - Claude Code will auto-discover the MCP
   - You'll see "mcp" in available tools

---

## Step 4: Test the Connection

Once connected, I can help you:

### Database Management
```
"Query the artisans table in production"
→ I'll use Supabase MCP to run SQL query

"Show schema differences between dev and prod"
→ I'll compare both databases

"Generate a migration for the collections table"
→ I'll create SQL migration script
```

### Project Management
```
"Create a new dev Supabase project"
→ I'll set it up via MCP

"Sync schema from production to development"
→ I'll pull prod schema, push to dev

"List all database backups"
→ I'll retrieve backup information
```

### Schema & Types
```
"Generate TypeScript types for artisans table"
→ I'll use MCP to extract and generate types

"Create gallery_images table with indexes"
→ I'll generate optimized DDL

"Add indexes to improve query performance"
→ I'll suggest and apply indexes
```

---

## MCP Server Details

### supabase-dev
- **Purpose**: Full access to development database
- **Mode**: Read/Write
- **Use Case**: Schema changes, data manipulation, testing
- **Access Control**: Your access token permissions apply
- **Safe**: Dev data is separate from production

### supabase-prod
- **Purpose**: Safe read-only access to production database
- **Mode**: Read Only (READONLY=true)
- **Use Case**: Queries, reporting, debugging (NO writes possible)
- **Access Control**: Restricted to SELECT only
- **Safe**: Prevents accidental data modifications

---

## Troubleshooting

### "MCP server not found"
- Verify `.claude/mcp.json` exists in `.claude/` directory
- Check token is correct (starts with `sbp_`)
- Restart Claude Code

### "Authentication failed"
- Token may have expired - generate a new one
- Check token has correct permissions
- Verify no typos in token string

### "Connection timeout"
- Verify internet connection
- Check Supabase status: https://status.supabase.io/
- Try restarting Claude Code

### "Read-only error on prod MCP"
- This is intentional! Production MCP is read-only
- Use dev MCP for writes: `supabase-dev`
- Contact admin if you need to modify production

---

## What's Next?

Once MCP is connected, I can immediately help with:

1. **Create Development Supabase Project**
   - New project setup
   - Schema sync from production
   - Environment configuration

2. **Set Up Dev Database**
   - Import production schema
   - Generate test data
   - Validate migrations

3. **Database Migrations**
   - Auto-generate migration files
   - Preview changes before applying
   - Rollback procedures

4. **Documentation**
   - Auto-generate database docs
   - Schema diagrams
   - Query optimization suggestions

---

## Security Checklist

- ✅ `.claude/mcp.json` added to `.gitignore`
- ✅ Token is personal (not shared)
- ✅ Production MCP set to read-only
- ✅ Development MCP has full access
- ✅ Token rotatable in Supabase dashboard
- ✅ MCP config file not committed to git

---

## File Reference

| File | Status | Purpose |
|------|--------|---------|
| `.claude/mcp.json` | ✅ Created | MCP configuration with placeholders |
| `.gitignore` | ✅ Updated | Excludes mcp.json from version control |
| This guide | ✅ Created | Setup instructions |

---

## When Complete

After adding your access token:

1. Restart Claude Code
2. Tell me: "MCP is ready"
3. I'll verify connection and we can proceed with:
   - Creating dev Supabase project
   - Syncing schemas
   - Setting up environment-specific configurations

---

**Questions?** Let me know if you need help at any step!
