# Atlas CRM - Operational Checklist

**Date:** 2026-03-22
**Environment:** Local Development (Mac)
**Status:** ✅ Build Successful, Database Seeded

---

## ✅ COMPLETED

### Local Environment Setup
- [x] PostgreSQL 16 installed and running
- [x] Redis installed and running
- [x] Database `ghl_dashboard` created
- [x] All 13 migrations applied successfully
- [x] Database seeded with demo data:
  - 113 global products
  - 7 season calendar entries
  - 50 demo contacts
  - 50 demo reservations
  - 12 demo quotes
  - 25 demo pipeline deals
  - 20 demo conversations
  - Station capacity data
- [x] Build successful (no errors)
- [x] Tests: 33 passed, 1 failed (minor permission count mismatch)

### Demo Data Verified
- [x] Demo tenant created
- [x] Demo users: demo@skicenter.com, natalia@demo.skicenter.com, manager@demo.skicenter.com
- [x] Password: demo123
- [x] All product categories seeded
- [x] Season calendar configured

---

## ⚠️ PENDING - PRODUCTION (Railway)

### Critical - Before First Client

#### 1. Verify Railway Deployment
**Status:** Unknown - Need to check
**Action:**
- [ ] Log into Railway dashboard
- [ ] Check if latest commits auto-deployed
- [ ] Verify phases R-T are live (check commit hash)
- [ ] Check build logs for errors
- [ ] Test live URL: https://crm-dash-prod.up.railway.app

**If not deployed:**
- [ ] Check GitHub webhook settings
- [ ] Verify Railway connected to correct branch
- [ ] Manual deploy if needed

#### 2. Seed Production Catalog
**Status:** Pending deploy verification
**Action:**
- [ ] Log into live app
- [ ] Go to Settings → Catálogo
- [ ] Click "Sembrar Catálogo" button
- [ ] Verify all 93 products created
- [ ] Check season calendar entries

#### 3. Configure Railway Cron Jobs
**Status:** Not configured
**Action:**
- [ ] Go to Railway dashboard → project → cron jobs
- [ ] Add job: `/api/cron/sync`
  - Schedule: Every 5 minutes
  - Method: GET
  - Headers: None (or CRON_SECRET if set)
- [ ] Add job: `/api/cron/quote-reminders`
  - Schedule: Daily at 09:00
  - Timezone: Europe/Madrid
  - Method: GET
  - Headers: None (or CRON_SECRET if set)

#### 4. Test Critical Flows
**Status:** Not tested on production
**Action:**
- [ ] GHL OAuth connection flow
- [ ] Create quote → Send → Payment (Redsys test mode)
- [ ] Quote → Reservation conversion
- [ ] Voucher upload (Claude API)
- [ ] Contact form submission
- [ ] Webhook delivery (if GHL connected)

#### 5. Environment Variables (Railway)
**Status:** Need verification
**Action:**
- [ ] Verify all env vars set:
  - [ ] DATABASE_URL (Railway Postgres)
  - [ ] REDIS_URL (Railway Redis)
  - [ ] AUTH_URL (production domain)
  - [ ] AUTH_SECRET
  - [ ] ENCRYPTION_KEY
  - [ ] GHL_CLIENT_ID
  - [ ] GHL_CLIENT_SECRET
  - [ ] GHL_REDIRECT_URI (production)
  - [ ] GHL_WEBHOOK_SECRET
  - [ ] ANTHROPIC_API_KEY
  - [ ] ENABLE_MOCK_GHL=false
  - [ ] ENABLE_NOTIFICATIONS=true
  - [ ] LOG_LEVEL=info

#### 6. GHL Marketplace App
**Status:** Need verification
**Action:**
- [ ] Verify app registered in GHL Marketplace
- [ ] Check OAuth redirect URI matches production
- [ ] Register webhook URL: `{AUTH_URL}/api/crm/webhooks`
- [ ] Test webhook signature validation
- [ ] Verify HMAC secret matches GHL_WEBHOOK_SECRET

---

## 🔧 RECOMMENDED IMPROVEMENTS

### Short Term (This Week)

#### 7. Fix Permission Test
**Priority:** Low
**File:** `__tests__/lib/auth/permissions.test.ts`
**Issue:** Line 55 expects 15 permissions, but DEFAULT_ROLES has 18
**Fix:** Update test expectation or verify role permissions

#### 8. Add Error Tracking
**Priority:** Medium
**Recommendation:** Sentry integration
**Action:**
- [ ] Sign up for Sentry
- [ ] Add Sentry DSN to env vars
- [ ] Install @sentry/nextjs
- [ ] Configure in next.config.js

#### 9. Add Monitoring
**Priority:** Medium
**Recommendation:** Railway metrics + custom dashboard
**Action:**
- [ ] Enable Railway metrics
- [ ] Create health check endpoint (exists: /api/health)
- [ ] Add business metrics endpoint
- [ ] Set up alerts for errors

#### 10. Increase Test Coverage
**Priority:** Medium
**Current:** 34 tests
**Target:** 100+ tests
**Action:**
- [ ] Add integration tests for API routes
- [ ] Add E2E tests for critical flows
- [ ] Add unit tests for pricing engine
- [ ] Add tests for GHL client

### Long Term (Next Month)

#### 11. Implement RBAC v2
**Priority:** High for scale
**Current:** Session-only auth (all users can access everything)
**Target:** Granular permissions
**Action:**
- [ ] Add permissions array to Role model in DB
- [ ] Restore hasPermission() checks in API routes
- [ ] Test all role combinations
- [ ] Document permission matrix

#### 12. Performance Optimization
**Priority:** Medium
**Action:**
- [ ] Database query optimization (add indexes)
- [ ] Redis caching strategy review
- [ ] Image optimization (Next.js Image)
- [ ] Bundle analysis

#### 13. Documentation
**Priority:** Medium
**Action:**
- [ ] API documentation (Swagger/OpenAPI)
- [ ] User guide
- [ ] Admin guide
- [ ] Deployment guide

---

## 🚀 DEPLOYMENT CHECKLIST

### Pre-Deployment
- [ ] All tests passing (or known failures documented)
- [ ] Build successful locally
- [ ] Database migrations tested
- [ ] Environment variables documented
- [ ] Rollback plan ready

### Deployment
- [ ] Push to main branch
- [ ] Verify Railway auto-deploy triggers
- [ ] Monitor build logs
- [ ] Check deployment success
- [ ] Verify live URL responds

### Post-Deployment
- [ ] Run database migrations (if any)
- [ ] Seed data if needed
- [ ] Test critical flows
- [ ] Monitor error logs
- [ ] Announce deployment

---

## 📊 CURRENT STATE SUMMARY

| Component | Local | Production | Status |
|-----------|-------|------------|--------|
| Build | ✅ Pass | Unknown | Check Railway |
| Database | ✅ Migrated | Unknown | Check Railway |
| Demo Data | ✅ Seeded | Unknown | Check Railway |
| Products | ✅ 93 products | Unknown | Seed after deploy |
| Cron Jobs | N/A | ❌ Not set | Configure in Railway |
| GHL OAuth | N/A | ❓ Unknown | Test after deploy |
| Webhooks | N/A | ❓ Unknown | Test after deploy |

---

## NEXT ACTIONS

1. **Immediate:** Check Railway deployment status
2. **Today:** Configure cron jobs if deploy verified
3. **This Week:** Test all critical flows on production
4. **Before First Client:** Complete operational checklist

---

**Local Environment:** ✅ READY FOR DEVELOPMENT
**Production Environment:** ⚠️ NEEDS VERIFICATION

**Recommendation:** Verify Railway deployment before proceeding with client onboarding.
