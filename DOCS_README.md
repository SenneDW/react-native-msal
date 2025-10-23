# React Native MSAL - Complete Implementation Documentation

Welcome! This folder contains comprehensive guides to help you implement Microsoft MSAL authentication in your Expo and React Native projects.

## 📚 Documentation Files

### 🚀 **Start Here**

#### **[QUICK_START.md](./QUICK_START.md)** ⭐
- **⏱️ Time: ~15 minutes**
- Perfect for getting started quickly
- Step-by-step instructions with code snippets
- Minimal setup to get authentication working
- **👉 Start here if you want the fastest path to implementation**

### 📖 **Comprehensive Guides**

#### **[EXPO_IMPLEMENTATION_GUIDE.md](./EXPO_IMPLEMENTATION_GUIDE.md)**
- **Complete guide for Expo projects**
- Azure Portal setup instructions
- Android signature hash generation
- File structure recommendations
- Auth Context pattern for state management
- Integration examples with screens
- Troubleshooting for Expo-specific issues
- **👉 Read this for complete Expo integration details**

#### **[ENVIRONMENT_SETUP.md](./ENVIRONMENT_SETUP.md)**
- **Security and environment variable best practices**
- Creating and managing `.env` files
- `app.config.js` configuration examples
- Environment-specific configurations (dev/staging/prod)
- CI/CD integration (GitHub Actions)
- Security best practices checklist
- **👉 Read this before deploying to production**

### 🔧 **Troubleshooting & Fixes**

#### **[DEPRECATION_FIX.md](./DEPRECATION_FIX.md)**
- **Fixing common MSAL errors and deprecation issues**
- Error: "Cannot read property 'createPublicClientApplication' of null"
- Native module linking solutions
- Platform-specific setup verification
- Complete troubleshooting checklist with error reference
- **👉 Read this if you're experiencing errors**

### ✅ **Implementation Checklist**

#### **[IMPLEMENTATION_CHECKLIST.md](./IMPLEMENTATION_CHECKLIST.md)**
- **Complete checklist to ensure nothing is missed**
- Azure Portal setup verification
- Platform-specific checks (iOS/Android)
- Build and testing steps
- Security verification
- Common issues fixed
- Testing scenarios
- Deployment checklist
- **👉 Use this to verify your implementation is complete**

### 💾 **Example Files**

Located in `/examples/`:

- **`msalService.ts`** - Ready-to-use MSAL service with all methods
- **`AuthContext.tsx`** - Auth context provider for state management
- **`ExampleApp.tsx`** - Complete example app implementation
- **`app.config.example.js`** - Example configuration file

## 🎯 Recommended Reading Order

### For Quick Implementation (15 minutes)
1. [QUICK_START.md](./QUICK_START.md) ← **Start here**
2. Copy files from `examples/`
3. Replace Client ID
4. Run and test

### For Complete Understanding (45 minutes)
1. [QUICK_START.md](./QUICK_START.md)
2. [EXPO_IMPLEMENTATION_GUIDE.md](./EXPO_IMPLEMENTATION_GUIDE.md)
3. [ENVIRONMENT_SETUP.md](./ENVIRONMENT_SETUP.md)
4. [IMPLEMENTATION_CHECKLIST.md](./IMPLEMENTATION_CHECKLIST.md)

### For Troubleshooting
1. [DEPRECATION_FIX.md](./DEPRECATION_FIX.md)
2. Check specific error in error reference table
3. Follow solution steps

### For Production Deployment
1. [ENVIRONMENT_SETUP.md](./ENVIRONMENT_SETUP.md)
2. [IMPLEMENTATION_CHECKLIST.md](./IMPLEMENTATION_CHECKLIST.md) - Security section
3. [DEPRECATION_FIX.md](./DEPRECATION_FIX.md) - Common issues

## 📋 Quick Reference

### File Locations to Create

```
your-project/
├── app.json (or app.config.js)
├── App.tsx
├── .env (development only)
├── src/
│   ├── services/
│   │   └── msalService.ts          ← Copy from examples/
│   ├── context/
│   │   └── AuthContext.tsx          ← Copy from examples/
│   ├── screens/
│   │   └── LoginScreen.tsx          ← Create your own
│   ├── config/
│   │   └── msal.config.ts           ← Create if using app.config.js
│   └── types/
│       └── auth.types.ts            ← Optional type definitions
└── package.json
```

### Common Commands

```bash
# Install
npm install react-native-msal

# Generate Android hash
keytool -list -v -keystore ~/.android/debug.keystore -alias androiddebugkey -storepass android -keypass android | grep SHA1

# Build
npx expo prebuild --clean

# Run iOS
npx expo run:ios

# Run Android
npx expo run:android

# Verify setup
npx expo doctor
npx react-native doctor
```

## 🆘 Common Issues Quick Fix

| Issue | Solution |
|-------|----------|
| "Native module not available" | Run `npx expo prebuild --clean` |
| "redirect_uri_mismatch" | Check redirect URI exactly matches Azure portal |
| App closes on login | Verify bundle ID matches Azure registration |
| "MSAL_CLIENT_ID is not set" | Create `.env` file or update `app.json` |
| Token not received | Check scopes are correct |
| Logout not working | Ensure account parameter is passed to signOut |

## 🔑 Key Configuration Values

You'll need these from Azure:

- **Client ID**: GUID from app registration (e.g., `12345678-1234-1234-1234-123456789abc`)
- **Authority URL**: `https://login.microsoftonline.com/common` or your tenant ID
- **Redirect URIs**: 
  - iOS: `msauth.com.yourcompany.yourapp://auth`
  - Android: `msauth://com.yourcompany.yourapp/{HASH}`

## 📚 External Resources

- [Azure MSAL Documentation](https://learn.microsoft.com/en-us/azure/active-directory/develop/msal-overview)
- [React Native MSAL GitHub](https://github.com/stashenergy/react-native-msal)
- [Microsoft Graph API](https://learn.microsoft.com/en-us/graph/overview)
- [Expo Documentation](https://docs.expo.dev/)
- [React Native Documentation](https://reactnative.dev/)

## ✨ Features Covered

✅ Azure authentication setup  
✅ Expo config plugin integration  
✅ Interactive login flow  
✅ Silent token refresh  
✅ Logout functionality  
✅ Multiple account management  
✅ Token caching  
✅ Error handling  
✅ Environment variables  
✅ Security best practices  
✅ CI/CD integration  
✅ Production deployment  

## 🐛 Troubleshooting Steps

1. **Check setup is complete** → Use [IMPLEMENTATION_CHECKLIST.md](./IMPLEMENTATION_CHECKLIST.md)
2. **Check error message** → See [DEPRECATION_FIX.md](./DEPRECATION_FIX.md) error table
3. **Follow solution steps** → Click solution link
4. **Verify native modules** → Run `npx react-native doctor`
5. **Clear and rebuild** → `npx expo prebuild --clean && npx expo run:ios/android`

## 📝 Notes

- These guides are for Expo and React Native projects
- Examples use TypeScript (convert to JavaScript if needed)
- All commands assume Node.js and npm are installed
- Always use your actual Client ID from Azure Portal
- Never commit sensitive values to git

## 🎓 What You'll Learn

- How to register an app in Azure Portal
- Setting up native module linking with Expo
- Implementing OAuth 2.0 flow in React Native
- Managing authentication state with React Context
- Handling tokens securely
- Troubleshooting common MSAL issues
- Production-ready implementation patterns

## 💡 Tips

- Start with [QUICK_START.md](./QUICK_START.md) for fastest results
- Use example files as templates
- Test on physical devices before production
- Keep different Client IDs for dev/staging/production
- Monitor token expiration and refresh proactively
- Add error boundaries for better UX

---

**Last Updated:** October 23, 2025  
**Version:** 1.0  
**Status:** Production Ready

For the most current information, visit:
- [react-native-msal on npm](https://www.npmjs.com/package/react-native-msal)
- [GitHub Repository](https://github.com/stashenergy/react-native-msal)
