# Implementation Checklist

Use this checklist to ensure you've completed all setup steps correctly.

## Azure Portal Setup
- [ ] Created app registration in Azure Portal
- [ ] Copied Client ID (Application ID)
- [ ] Added iOS redirect URI: `msauth.com.yourcompany.yourapp://auth`
- [ ] Added Android redirect URI: `msauth://com.yourcompany.yourapp/{HASH}`
- [ ] Verified API permissions are configured

## Android Setup
- [ ] Generated/verified Android signature hash using keytool
- [ ] Hash matches in Azure redirect URI
- [ ] Updated `app.json` with correct `androidPackageSignatureHash`
- [ ] Updated `app.json` with correct Android `package` name
- [ ] Package name matches Azure registration

## iOS Setup
- [ ] Updated `app.json` with correct iOS `bundleIdentifier`
- [ ] Bundle identifier matches Azure registration
- [ ] Bundle identifier matches redirect URI

## Project Setup
- [ ] Installed `react-native-msal`: `npm install react-native-msal`
- [ ] Updated `app.json` with plugin configuration
- [ ] Created `src/services/msalService.ts`
- [ ] Created `src/context/AuthContext.tsx`
- [ ] Updated `App.tsx` to use AuthProvider
- [ ] Replaced placeholder Client ID in msalService

## Build & Test
- [ ] Ran `npx expo prebuild --clean`
- [ ] Tested iOS build: `npx expo run:ios`
- [ ] Tested Android build: `npx expo run:android`
- [ ] Verified login works interactively
- [ ] Verified token is received
- [ ] Verified logout works
- [ ] Verified silent token refresh works

## File Structure
```
your-project/
├── app.json (or app.config.js)
├── App.tsx
├── src/
│   ├── services/
│   │   └── msalService.ts
│   ├── context/
│   │   └── AuthContext.tsx
│   └── screens/
│       └── LoginScreen.tsx
└── package.json
```

## Environment Variables (Optional but Recommended)
- [ ] Created `.env` file
- [ ] Added `MSAL_CLIENT_ID` to `.env`
- [ ] Updated `msalService.ts` to read from environment variable
- [ ] Updated `app.json` to read from environment variable

## Security Checklist
- [ ] **NOT** hardcoding Client ID in version control
- [ ] Using environment variables for sensitive data
- [ ] Tested that app handles token expiration
- [ ] Verified refresh token logic works
- [ ] Tested logout clears all tokens
- [ ] Confirmed HTTPS/native redirect URIs (not HTTP)

## Common Issues Fixed
- [ ] Verified app builds without errors
- [ ] Resolved any module linking issues
- [ ] Confirmed native modules are available
- [ ] Tested on both platforms (iOS and Android)
- [ ] Handled deep link routing correctly

## Additional Features (Optional)
- [ ] Implemented automatic token refresh
- [ ] Added secure token storage (expo-secure-store)
- [ ] Implemented error boundaries
- [ ] Added loading states
- [ ] Implemented remember me functionality
- [ ] Added B2C support (if needed)

## Testing Checklist
- [ ] [x] First-time login works
- [ ] [x] Logout and login again
- [ ] [x] Close app and reopen (cached session)
- [ ] [x] Force refresh token works
- [ ] [x] Multiple account switching (if implemented)
- [ ] [x] Expired token handling
- [ ] [x] Network error handling
- [ ] [x] Tested on physical device (not just emulator)

## Deployment Checklist
- [ ] App builds successfully in release mode
- [ ] Production client ID configured
- [ ] Production redirect URIs registered
- [ ] Verified token refresh works in production
- [ ] Error logging configured
- [ ] Monitoring/analytics configured
- [ ] Privacy policy includes OAuth details
- [ ] Terms of service updated if needed

## Documentation
- [ ] Added comments to explain MSAL flow
- [ ] Documented available scopes
- [ ] Created internal documentation for team
- [ ] Documented troubleshooting steps
- [ ] Created runbook for common issues

---

## Quick Verification

Run these commands to verify setup:

```bash
# Check if package installed
npm list react-native-msal

# Verify app.json syntax
npx expo publish --dry-run

# List prebuild dependencies
npx expo prebuild --dry-run

# Check native module linking
npx react-native doctor
```

## Support & Help

If you encounter issues:
1. Check the [DEPRECATION_FIX.md](./DEPRECATION_FIX.md) guide
2. Review [EXPO_IMPLEMENTATION_GUIDE.md](./EXPO_IMPLEMENTATION_GUIDE.md)
3. See [QUICK_START.md](./QUICK_START.md) for step-by-step instructions
4. Check [Azure MSAL Documentation](https://learn.microsoft.com/azure/active-directory/develop/msal-overview)
5. Visit [react-native-msal GitHub Issues](https://github.com/stashenergy/react-native-msal/issues)

---

**Last Updated:** October 23, 2025
