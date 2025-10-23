# 🎯 YOUR GITHUB SETUP - Complete Instructions

Since you're using:
```json
"react-native-msal": "https://github.com/SenneDW/react-native-msal"
```

Here's exactly what to do in your React Native Expo app.

---

## ⚡ 5-Minute Setup

### 1. Install the Package

```bash
npm install
# or if not in package.json yet:
npm install https://github.com/SenneDW/react-native-msal
```

### 2. Update `app.json`

```json
{
  "expo": {
    "plugins": [
      [
        "react-native-msal",
        {
          "androidPackageSignatureHash": "Xo8WBi6jzSxKDVR4drqm84yr9iU="
        }
      ]
    ]
  }
}
```

Replace the signature hash with your own (see below).

### 3. Copy These Files from This Repository

Copy from `examples/` folder into your project:

```bash
cp examples/msalService.ts your-app/src/services/
cp examples/AuthContext.tsx your-app/src/context/
```

Or manually create them using the code below.

### 4. Update Your `App.tsx`

```typescript
import { AuthProvider } from './src/context/AuthContext';
import YourScreens from './src/screens/YourScreens';

export default function App() {
  return (
    <AuthProvider>
      <YourScreens />
    </AuthProvider>
  );
}
```

### 5. Build and Run

```bash
npx expo prebuild --clean
npx expo run:ios    # or run:android
```

---

## 📖 Complete Code Examples

### `src/services/msalService.ts`

```typescript
import { PublicClientApplication } from 'react-native-msal';

const msalConfig = {
  auth: {
    clientId: 'YOUR_CLIENT_ID_HERE',  // Get from Azure Portal
    authority: 'https://login.microsoftonline.com/common',
  },
};

export const pca = new PublicClientApplication(msalConfig);

export const initializeMSAL = async () => {
  try {
    await pca.init();
    console.log('✅ MSAL initialized');
    return true;
  } catch (error) {
    console.error('❌ MSAL init failed:', error);
    return false;
  }
};

export const login = async (scopes = ['user.read']) => {
  try {
    const result = await pca.acquireToken({ scopes });
    console.log('✅ Login successful');
    return result;
  } catch (error) {
    console.error('❌ Login failed:', error);
    return undefined;
  }
};

export const logout = async (account) => {
  try {
    await pca.signOut({ account, signoutFromBrowser: true });
    console.log('✅ Logout successful');
    return true;
  } catch (error) {
    console.error('❌ Logout failed:', error);
    return false;
  }
};

export const getAccounts = async () => {
  try {
    return await pca.getAccounts();
  } catch (error) {
    console.error('❌ Get accounts failed:', error);
    return [];
  }
};
```

### `src/context/AuthContext.tsx`

```typescript
import React, { createContext, useContext, useEffect, useState } from 'react';
import { initializeMSAL, login, logout, getAccounts } from '../services/msalService';

const AuthContext = createContext<any>(null);

export const AuthProvider = ({ children }: any) => {
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [accessToken, setAccessToken] = useState<string | null>(null);

  // Initialize on app start
  useEffect(() => {
    const init = async () => {
      try {
        const initialized = await initializeMSAL();
        if (initialized) {
          const accounts = await getAccounts();
          if (accounts.length > 0) {
            setUser(accounts[0]);
          }
        }
      } finally {
        setIsLoading(false);
      }
    };

    init();
  }, []);

  const handleLogin = async (scopes?: string[]) => {
    setIsLoading(true);
    try {
      const result = await login(scopes);
      if (result) {
        setUser(result.account);
        setAccessToken(result.accessToken);
        return result;
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    setIsLoading(true);
    try {
      if (user) {
        await logout(user);
        setUser(null);
        setAccessToken(null);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        accessToken,
        login: handleLogin,
        logout: handleLogout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
```

### In Your Screen

```typescript
import { View, Button, Text, ActivityIndicator } from 'react-native';
import { useAuth } from '../context/AuthContext';

export default function LoginScreen() {
  const { user, isLoading, login, logout } = useAuth();

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      {user ? (
        <>
          <Text style={{ fontSize: 18, marginBottom: 20 }}>
            Welcome, {user.username}!
          </Text>
          <Button title="Logout" onPress={logout} />
        </>
      ) : (
        <Button 
          title="Login with Microsoft" 
          onPress={() => login(['user.read'])} 
        />
      )}
    </View>
  );
}
```

---

## 🔑 Getting Your Client ID & Hash

### Step 1: Azure Portal

1. Go to https://portal.azure.com
2. Search for "App registrations"
3. Click "New registration"
4. Enter your app name
5. Click "Register"
6. Copy your **Application (Client) ID** ← Use this

### Step 2: Android Signature Hash

```bash
keytool -list -v -keystore ~/.android/debug.keystore \
  -alias androiddebugkey -storepass android -keypass android | grep SHA1
```

You'll see: `SHA1: Xo8WBi6jzSxKDVR4drqm84yr9iU=`

Copy this into `app.json` and use for redirect URI.

### Step 3: Add Redirect URIs to Azure

In your app registration, go to **Authentication** and add:

- **iOS**: `msauth.com.yourcompany.yourapp://auth`
- **Android**: `msauth://com.yourcompany.yourapp/Xo8WBi6jzSxKDVR4drqm84yr9iU%3D`

(Replace `com.yourcompany.yourapp` with your bundle/package name)

---

## 📋 Checklist

- [ ] Installed package: `npm install`
- [ ] Updated `app.json` with MSAL plugin
- [ ] Got Client ID from Azure
- [ ] Got Android signature hash
- [ ] Added redirect URIs to Azure
- [ ] Created `src/services/msalService.ts`
- [ ] Created `src/context/AuthContext.tsx`
- [ ] Updated `App.tsx` with AuthProvider
- [ ] Replaced Client ID placeholder
- [ ] Ran `npx expo prebuild --clean`
- [ ] Ran `npx expo run:ios` (or android)
- [ ] Tested login
- [ ] Tested logout

---

## 📚 Additional Guides

If you need more help:

- **GitHub Setup Guide**: `GITHUB_INTEGRATION_GUIDE.md`
- **Quick Reference**: `GITHUB_QUICK_REFERENCE.md` 
- **Troubleshooting**: `DEPRECATION_FIX.md`
- **Full Walkthrough**: `EXPO_IMPLEMENTATION_GUIDE.md`
- **Advanced Features**: `ADVANCED_PATTERNS.md`

---

## 🐛 Common Issues

| Issue | Solution |
|-------|----------|
| "Native module not available" | `npx expo prebuild --clean` |
| "redirect_uri_mismatch" | Check redirect URI matches Azure exactly |
| "Module not found" | `npm install` then `npx expo prebuild --clean` |
| App closes on login | Verify bundle ID matches Azure registration |
| Login button does nothing | Check Client ID is correct |

---

## 🎉 That's It!

Your app now has Microsoft authentication. Users can:
- ✅ Login with their Microsoft account
- ✅ See their user information
- ✅ Logout
- ✅ Automatic token refresh

---

**Ready?** → Open `GITHUB_QUICK_REFERENCE.md` for a quick copy-paste reference

**Need more details?** → Open `GITHUB_INTEGRATION_GUIDE.md` for complete setup

**Having issues?** → Open `DEPRECATION_FIX.md` for troubleshooting

---

Created: October 23, 2025
Status: Ready to use ✅
