# How to View Server Logs for Whop Authentication Debugging

## Production Logs (Vercel)

1. **Via Vercel Dashboard:**
   - Go to: https://vercel.com/dashboard
   - Select your `barrels_pwa` project
   - Click "Logs" or "Functions" → "Logs"
   - Filter by time: "Last 15 minutes"
   - Search for: `[Login Page]` or `[Whop Auth]`

2. **Via Vercel CLI:**
   ```bash
   vercel logs catchbarrels.app --follow
   ```

## What to Look For

### Successful Flow:
```
[Login Page] Starting login page load...
[Login Page] Whop detection: { hasWhopToken: true, hasWhopReferer: true }
[Login Page] Detected Whop iframe request, attempting automatic authentication...
[Login Page] Step 1: Verifying Whop token...
[Whop Auth] Token present: true
[Whop Auth] Validation result: { userId: '...', appId: '...' }
[Login Page] Step 2: Checking Whop access...
[Login Page] Step 3: Finding or creating user...
[Login Page] Step 4: Syncing Whop membership...
[Login Page] Step 5: Redirecting...
[Login Page] Redirecting to dashboard
```

### Failed Authentication:
```
[Login Page] Starting login page load...
[Login Page] Whop detection: { hasWhopToken: true, hasWhopReferer: true }
[Login Page] Detected Whop iframe request, attempting automatic authentication...
[Login Page] Step 1: Verifying Whop token...
[Whop Auth] Token present: true
[Whop Auth] Token validation failed: [ERROR MESSAGE HERE]
[Login Page] Whop authentication error: [ERROR DETAILS]
```

### Failed Access Check:
```
[Login Page] Step 1: Verifying Whop token...
[Whop Auth] Token present: true
[Whop Auth] Validation result: { userId: '...', appId: '...' }
[Login Page] Step 2: Checking Whop access...
[Whop Auth] Checking access for userId=... experience=default
[Whop Auth] Fetching memberships from Whop API...
[Whop Auth] Memberships API returned: { data: [] }
[Whop Auth] No valid membership found
[Login Page] Access check failed
```

## Key Error Patterns

1. **"Token validation failed"** → Issue with WHOP_API_KEY or token format
2. **"No valid membership found"** → User doesn't have active subscription
3. **"User creation failed"** → Database/Prisma error
4. **"Membership sync failed"** → Whop API connection issue

## Common Issues & Quick Fixes

### Issue 1: "No valid membership found"
**Cause:** User account in Whop doesn't have an active CatchBarrels subscription
**Fix:** 
1. Go to Whop Business Dashboard
2. Verify the test account has an active subscription
3. Try with a different Whop account that has a subscription

### Issue 2: "Token validation failed"
**Cause:** WHOP_API_KEY or WHOP_APP_ID mismatch
**Fix:**
1. Verify environment variables are correct in production
2. Check Whop Developer Dashboard for correct API key
3. Redeploy if env vars were updated

### Issue 3: "User creation failed"
**Cause:** Database connection issue or Prisma error
**Fix:**
1. Check DATABASE_URL is correct in production
2. Verify Prisma schema is migrated
3. Check database connection logs

## Next Steps

Based on the error pattern, send me:
- The exact error message from logs
- The log entries with timestamps
- Which step is failing (Step 1, 2, 3, 4, or 5)
- Your Whop account email (to verify subscription status)
