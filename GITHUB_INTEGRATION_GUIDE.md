# Using react-native-msal from GitHub in Your App

This guide explains how to use the `react-native-msal` package from the GitHub repository directly in your Expo app.

## Installation

In your `package.json`, add:

```json
{
  "dependencies": {
    "react-native-msal": "https://github.com/SenneDW/react-native-msal"
  }
}
```

Then install:
```bash
npm install
# or
yarn install
```

Or install directly:
```bash
npm install https://github.com/SenneDW/react-native-msal
# or
yarn add https://github.com/SenneDW/react-native-msal
```

## Configuration

### 1. Update your `app.json` or `app.config.js`

```json
{
  "expo": {
    "plugins": [
      [
        "react-native-msal",
        {
          "androidPackageSignatureHash": "YOUR_SIGNATURE_HASH_HERE"
        }
      ]
    ]
  }
}
```

### 2. Get Android Signature Hash

```bash
keytool -list -v -keystore ~/.android/debug.keystore \
  -alias androiddebugkey -storepass android -keypass android | grep SHA1
```

## Quick Setup in Your App

### Step 1: Create MSAL Service

Create `src/services/msalService.ts`:

```typescript
import { PublicClientApplication } from 'react-native-msal';

const msalConfig = {
  auth: {
    clientId: 'YOUR_CLIENT_ID',
    authority: 'https://login.microsoftonline.com/common',
  },
};

export const pca = new PublicClientApplication(msalConfig);

export const initializeMSAL = async () => {
  try {
    await pca.init();
    console.log('MSAL initialized');
    return true;
  } catch (error) {
    console.error('MSAL init failed:', error);
    return false;
  }
};

export const login = async (scopes: string[] = ['user.read']) => {
  try {
    return await pca.acquireToken({ scopes });
  } catch (error) {
    console.error('Login failed:', error);
    return undefined;
  }
};

export const logout = async (account: any) => {
  try {
    await pca.signOut({ account, signoutFromBrowser: true });
    return true;
  } catch (error) {
    console.error('Logout failed:', error);
    return false;
  }
};

export const getAccounts = async () => {
  try {
    return await pca.getAccounts();
  } catch (error) {
    console.error('Get accounts failed:', error);
    return [];
  }
};
```

### Step 2: Create Auth Context

Create `src/context/AuthContext.tsx`:

```typescript
import React, { createContext, useContext, useEffect, useState } from 'react';
import { initializeMSAL, login, logout, getAccounts } from '../services/msalService';

const AuthContext = createContext<any>(null);

export const AuthProvider = ({ children }: any) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [accessToken, setAccessToken] = useState<string | null>(null);

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

### Step 3: Use in Your App

```typescript
import React from 'react';
import { View, Button, Text, ActivityIndicator } from 'react-native';
import { AuthProvider, useAuth } from './src/context/AuthContext';

const LoginScreen = () => {
  const { user, isLoading, login, logout } = useAuth();

  if (isLoading) return <ActivityIndicator />;

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      {user ? (
        <>
          <Text>Welcome, {user.username}!</Text>
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
};

export default function App() {
  return (
    <AuthProvider>
      <LoginScreen />
    </AuthProvider>
  );
}
```

## Build and Run

```bash
# Clean and rebuild
npx expo prebuild --clean

# Run on iOS
npx expo run:ios

# Run on Android
npx expo run:android
```

## Troubleshooting

### "Cannot find module 'react-native-msal'"

```bash
# Clear and reinstall
rm -rf node_modules package-lock.json
npm install
npx expo prebuild --clean
```

### "Native module RNMSAL is not available"

```bash
# Rebuild native modules
npx expo prebuild --clean
npx expo run:ios  # or android
```

### "redirect_uri_mismatch"

1. Make sure redirect URIs are registered in Azure Portal
2. Check bundle ID matches your Azure registration
3. Verify Android signature hash is correct

## Environment Variables

Create `.env`:

```
MSAL_CLIENT_ID=your-client-id
MSAL_AUTHORITY=https://login.microsoftonline.com/common
ANDROID_PACKAGE_SIGNATURE_HASH=your-hash
```

Then update `app.json`:

```json
{
  "expo": {
    "plugins": [
      [
        "react-native-msal",
        {
          "androidPackageSignatureHash": "${ANDROID_PACKAGE_SIGNATURE_HASH}"
        }
      ]
    ],
    "extra": {
      "msal": {
        "clientId": "${MSAL_CLIENT_ID}",
        "authority": "${MSAL_AUTHORITY}"
      }
    }
  }
}
```

## API Reference

### Main Methods

```typescript
// Initialize MSAL
await pca.init();

// Interactive login
const result = await pca.acquireToken({ scopes: ['user.read'] });

// Silent login (cached)
const result = await pca.acquireTokenSilent({
  account: result.account,
  scopes: ['user.read'],
});

// Get all accounts
const accounts = await pca.getAccounts();

// Logout
await pca.signOut({ account, signoutFromBrowser: true });
```

### Response Types

```typescript
interface MSALResult {
  accessToken: string;
  account: MSALAccount;
  expiresOn: number;
  idToken?: string;
  scopes: string[];
  tenantId?: string;
}

interface MSALAccount {
  identifier: string;
  environment?: string;
  tenantId: string;
  username: string;
  claims?: object;
}
```

## Common Scopes

```typescript
const scopes = [
  'user.read',           // Read user profile
  'mail.read',           // Read emails
  'calendar.read',       // Read calendar
  'Files.Read.All',      // Read files
];
```

## Security Best Practices

1. **Never hardcode Client ID** - Use environment variables
2. **Store tokens securely** - Use expo-secure-store or similar
3. **Implement token refresh** - Refresh before expiration
4. **Handle errors gracefully** - Show user-friendly messages
5. **Use HTTPS** - All redirect URIs should be HTTPS or native schemes

## What the Package Includes

The `react-native-msal` package provides:

- ✅ Native MSAL integration for iOS (via CocoaPods)
- ✅ Native MSAL integration for Android (via Gradle)
- ✅ JavaScript/TypeScript wrapper
- ✅ Expo config plugin for automatic native setup
- ✅ Token caching and management
- ✅ Multi-account support
- ✅ Browser-based OAuth flow

## Next Steps

1. Register your app in Azure Portal
2. Get your Client ID
3. Add redirect URIs to Azure registration
4. Install the package from GitHub
5. Update `app.json` with your config
6. Implement the code examples above
7. Build and test on device

## Resources

- [react-native-msal GitHub](https://github.com/SenneDW/react-native-msal)
- [Azure AD Documentation](https://learn.microsoft.com/azure/active-directory/)
- [Microsoft MSAL Overview](https://learn.microsoft.com/azure/active-directory/develop/msal-overview)
- [Expo Documentation](https://docs.expo.dev/)

---

**Last Updated:** October 23, 2025
