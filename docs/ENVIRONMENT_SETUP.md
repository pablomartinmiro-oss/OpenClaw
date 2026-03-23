# Atlas CRM - Environment Setup Guide

## Required Environment Variables

### Database & Cache
```env
DATABASE_URL=postgresql://user:pass@host:5432/dbname
REDIS_URL=redis://user:pass@host:6379
```

### Authentication (NextAuth v5)
```env
AUTH_URL=https://your-domain.com
AUTH_SECRET=your-random-secret-min-32-chars
```

### GoHighLevel OAuth
```env
GHL_CLIENT_ID=your-ghl-app-client-id
GHL_CLIENT_SECRET=your-ghl-app-client-secret
GHL_REDIRECT_URI=https://your-domain.com/api/crm/oauth/callback
GHL_WEBHOOK_SECRET=your-webhook-signing-secret
```

### Encryption (AES-256-GCM)
```env
ENCRYPTION_KEY=your-32-byte-encryption-key
```

### Email (Resend)
```env
RESEND_API_KEY=re_xxxxxxxx
EMAIL_FROM=noreply@your-domain.com
```

### AI (Claude)
```env
ANTHROPIC_API_KEY=sk-ant-api03-xxxxxxxx
```

### Features
```env
ENABLE_MOCK_GHL=false
ENABLE_NOTIFICATIONS=true
LOG_LEVEL=info
```

## Setting Up GHL Integration

### 1. Create GHL App
1. Go to https://marketplace.gohighlevel.com
2. Click "Create App"
3. Set redirect URI: `https://your-domain.com/api/crm/oauth/callback`
4. Enable scopes:
   - contacts.readonly
   - contacts.write
   - conversations.readonly
   - conversations.write
   - opportunities.readonly
   - opportunities.write
   - locations.readonly
   - users.readonly

### 2. Configure Webhooks
1. In GHL app settings, add webhook URL:
   `https://your-domain.com/api/crm/webhooks`
2. Enable events:
   - contact.create
   - contact.update
   - contact.delete
   - opportunity.create
   - opportunity.update
   - opportunity.delete
   - conversation.create
   - conversation.update

### 3. Get Credentials
1. Copy Client ID and Client Secret
2. Copy Webhook Secret
3. Add to environment variables

## Railway Setup

### 1. Create Project
```bash
railway login
railway init
```

### 2. Add PostgreSQL
```bash
railway add --database postgres
```

### 3. Add Redis
```bash
railway add --database redis
```

### 4. Set Environment Variables
```bash
railway variables set AUTH_SECRET="xxx"
railway variables set GHL_CLIENT_ID="xxx"
# ... etc
```

### 5. Deploy
```bash
./scripts/deploy-railway.sh
```

## Cron Jobs (Railway)

Add these in Railway dashboard:

1. **Sync Job** - Every 5 minutes
   - URL: `/api/cron/sync`
   - Method: GET
   
2. **Quote Reminders** - Daily at 9am Europe/Madrid
   - URL: `/api/cron/quote-reminders`
   - Method: GET
   - Schedule: `0 9 * * *`

## Post-Deployment Checklist

- [ ] Database migrations ran successfully
- [ ] Catalog seeded (click button in Settings)
- [ ] GHL OAuth connected
- [ ] Webhooks receiving events
- [ ] Email sending working
- [ ] Cron jobs configured
- [ ] Health check endpoint responding

## Troubleshooting

### Database connection errors
- Check DATABASE_URL format
- Verify Railway Postgres is running
- Check firewall rules

### GHL OAuth fails
- Verify redirect URI matches exactly
- Check Client ID/Secret
- Ensure scopes are enabled

### Webhooks not receiving
- Check GHL_WEBHOOK_SECRET matches
- Verify webhook URL is accessible
- Check logs for signature validation errors

### Build fails
- Check all env vars are set
- Verify Node.js version (18+)
- Check for TypeScript errors
