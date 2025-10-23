# React Native MSAL - Expo Implementation Guide

Complete step-by-step guide to implement Microsoft MSAL authentication in your Expo project.

## Prerequisites

- Expo CLI: `npm install -g expo-cli`
- Xcode (for iOS development)
- Android Studio (for Android development)
- Azure App Registration with redirect URIs configured

## Step 1: Azure Portal Setup

### Register Your Application

1. Go to [Azure Portal](https://portal.azure.com)
2. Navigate to **Azure Active Directory > App registrations > New registration**
3. Enter your app name and register
4. In **Redirect URIs**, add both platforms:

   **iOS:**
   ```
   msauth.com.yourcompany.yourapp://auth
   ```
   
   **Android:**
   ```
   msauth://com.yourcompany.yourapp/Xo8WBi6jzSxKDVR4drqm84yr9iU%3D
   ```
   
   > Replace `Xo8WBi6jzSxKDVR4drqm84yr9iU=` with your Android package signature hash (see Step 3)

5. Copy your **Client ID** (Application ID) - you'll need this later

## Step 2: Get Android Package Signature Hash

Run this command in your terminal:

```bash
# For debug builds
keytool -list -v -keystore ~/.android/debug.keystore -alias androiddebugkey -storepass android -keypass android | grep "SHA1"
```

This outputs something like:
```
SHA1: Xo8WBi6jzSxKDVR4drqm84yr9iU=
```

Use this hash in your Azure portal redirect URI and in `app.json`.

## Step 3: Install Package

```bash
npm install react-native-msal
# or
yarn add react-native-msal
```

## Step 4: Configure app.json

Update your `app.json` (or `app.config.js`/`app.config.ts`):

```jsonc
{
  "expo": {
    "name": "MyApp",
    "slug": "myapp",
    "version": "1.0.0",
    "scheme": "myapp",
    "platforms": [
      "ios",
      "android",
      "web"
    ],
    "ios": {
      "supportsTabletMode": true,
      "bundleIdentifier": "com.yourcompany.myapp"
    },
    "android": {
      "package": "com.yourcompany.myapp"
    },
    "plugins": [
      [
        "react-native-msal",
        {
          "androidPackageSignatureHash": "Xo8WBi6jzSxKDVR4drqm84yr9iU=" // Replace with your hash
        }
      ]
    ]
  }
}
```

## Step 5: Create MSAL Service

Create a file `src/services/msalService.ts`:

```typescript
import { PublicClientApplication } from 'react-native-msal';
import type { 
  MSALConfiguration, 
  MSALResult, 
  MSALAccount 
} from 'react-native-msal';

const msalConfig: MSALConfiguration = {
  auth: {
    clientId: 'YOUR_CLIENT_ID_HERE', // From Azure Portal
    authority: 'https://login.microsoftonline.com/common',
  },
};

export const pca = new PublicClientApplication(msalConfig);

export const initializeMSAL = async () => {
  try {
    await pca.init();
    console.log('✅ MSAL initialized successfully');
    return true;
  } catch (error) {
    console.error('❌ MSAL initialization failed:', error);
    return false;
  }
};

export const login = async (scopes: string[]): Promise<MSALResult | undefined> => {
  try {
    const result = await pca.acquireToken({ scopes });
    if (result) {
      console.log('✅ Login successful');
      return result;
    }
  } catch (error) {
    console.error('❌ Login failed:', error);
  }
};

export const loginSilent = async (
  account: MSALAccount,
  scopes: string[]
): Promise<MSALResult | undefined> => {
  try {
    const result = await pca.acquireTokenSilent({
      account,
      scopes,
      forceRefresh: false,
    });
    if (result) {
      console.log('✅ Silent login successful');
      return result;
    }
  } catch (error) {
    console.error('❌ Silent login failed:', error);
  }
};

export const getAccounts = async (): Promise<MSALAccount[]> => {
  try {
    const accounts = await pca.getAccounts();
    console.log(`✅ Found ${accounts.length} account(s)`);
    return accounts;
  } catch (error) {
    console.error('❌ Get accounts failed:', error);
    return [];
  }
};

export const logout = async (account: MSALAccount): Promise<boolean> => {
  try {
    await pca.signOut({
      account,
      signoutFromBrowser: true,
    });
    console.log('✅ Logout successful');
    return true;
  } catch (error) {
    console.error('❌ Logout failed:', error);
    return false;
  }
};
```

## Step 6: Create Auth Context (Optional but Recommended)

Create `src/context/AuthContext.tsx`:

```typescript
import React, { createContext, useContext, useEffect, useState } from 'react';
import type { MSALAccount, MSALResult } from 'react-native-msal';
import { 
  initializeMSAL, 
  login, 
  loginSilent, 
  logout, 
  getAccounts 
} from '../services/msalService';

interface AuthContextType {
  isInitialized: boolean;
  isLoading: boolean;
  user: MSALAccount | null;
  accessToken: string | null;
  login: (scopes: string[]) => Promise<MSALResult | undefined>;
  logout: () => Promise<boolean>;
  refreshToken: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ 
  children 
}) => {
  const [isInitialized, setIsInitialized] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<MSALAccount | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);

  // Initialize MSAL on app start
  useEffect(() => {
    const init = async () => {
      try {
        const initialized = await initializeMSAL();
        setIsInitialized(initialized);
        
        if (initialized) {
          // Check if user is already logged in
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

  const handleLogin = async (scopes: string[]) => {
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
        const success = await logout(user);
        if (success) {
          setUser(null);
          setAccessToken(null);
          return true;
        }
      }
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefreshToken = async () => {
    if (!user) return false;
    
    try {
      const result = await loginSilent(user, ['user.read']);
      if (result) {
        setAccessToken(result.accessToken);
        return true;
      }
    } catch (error) {
      console.error('Token refresh failed:', error);
    }
    return false;
  };

  return (
    <AuthContext.Provider
      value={{
        isInitialized,
        isLoading,
        user,
        accessToken,
        login: handleLogin,
        logout: handleLogout,
        refreshToken: handleRefreshToken,
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

## Step 7: Use in Your App

Update your `App.tsx`:

```typescript
import React from 'react';
import { View, Button, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { AuthProvider, useAuth } from './src/context/AuthContext';

const LoginScreen = () => {
  const { isLoading, user, login, logout, accessToken } = useAuth();

  const handleLogin = async () => {
    await login(['user.read']);
  };

  const handleLogout = async () => {
    await logout();
  };

  if (isLoading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {user ? (
        <>
          <Text style={styles.title}>Welcome, {user.username}!</Text>
          <Text style={styles.subtitle}>Tenant: {user.tenantId}</Text>
          {accessToken && (
            <Text style={styles.token}>Token received ✅</Text>
          )}
          <Button title="Logout" onPress={handleLogout} />
        </>
      ) : (
        <>
          <Text style={styles.title}>Microsoft Login</Text>
          <Button title="Login with Microsoft" onPress={handleLogin} />
        </>
      )}
    </View>
  );
};

const App = () => {
  return (
    <AuthProvider>
      <LoginScreen />
    </AuthProvider>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 20,
  },
  token: {
    fontSize: 14,
    color: 'green',
    marginBottom: 20,
  },
});

export default App;
```

## Step 8: Build and Run

### iOS:
```bash
npx expo prebuild --clean
npx expo run:ios
```

### Android:
```bash
npx expo prebuild --clean
npx expo run:android
```

## Step 9: Test the Flow

1. **Initial Load**: App initializes MSAL
2. **Click Login**: Opens browser for authentication
3. **Grant Permissions**: User approves scopes
4. **Success**: Access token received, user info displayed
5. **Click Logout**: Clears tokens and returns to login screen

## Troubleshooting

### "Native module RNMSAL is not available"
```bash
# Clear and rebuild
rm -rf node_modules .expo ios android
npm install
npx expo prebuild --clean
npx expo run:ios  # or android
```

### "redirect_uri_mismatch"
- Verify redirect URI matches exactly in Azure Portal
- Check `app.json` bundle identifier matches Azure registration
- Ensure Android signature hash is correct

### "AADSTS50058: Silent sign-in request failed"
- User needs to login interactively first
- Try `pca.acquireToken()` instead of `acquireTokenSilent()`

### "Cannot read property 'createPublicClientApplication' of null"
- Native modules not linked correctly
- Run `npx expo prebuild --clean`
- Rebuild the app

## Common Scopes

```typescript
// Microsoft Graph API
const scopes = [
  'user.read',                    // Read basic profile
  'mail.read',                    // Read emails
  'calendar.read',                // Read calendar
  'Files.Read.All',               // Read all files
];
```

## Next Steps

- Add token refresh logic before expiration
- Implement secure token storage
- Add error boundary UI components
- Implement role-based access control
- Set up API calls with token in headers

## Resources

- [Azure MSAL Documentation](https://learn.microsoft.com/en-us/azure/active-directory/develop/msal-overview)
- [React Native MSAL GitHub](https://github.com/stashenergy/react-native-msal)
- [Microsoft Graph API Scopes](https://learn.microsoft.com/en-us/graph/permissions-reference)
- [Expo Config Plugin Documentation](https://docs.expo.dev/config-plugins/introduction/)
