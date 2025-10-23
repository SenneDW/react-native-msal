# Quick Start Guide - React Native MSAL with Expo

**⏱️ Time to implement: ~15 minutes**

## Step 1: Get Your Azure Client ID (2 min)

1. Go to [Azure Portal](https://portal.azure.com)
2. Navigate to **Azure Active Directory → App registrations → New registration**
3. Name your app (e.g., "MyApp")
4. Register the app
5. Copy your **Application (Client) ID** - you'll need this

## Step 2: Configure Redirect URIs (2 min)

In your Azure app registration:

1. Go to **Authentication**
2. Add these redirect URIs:
   - **iOS**: `msauth.com.yourcompany.yourapp://auth`
   - **Android**: `msauth://com.yourcompany.yourapp/{SIGNATURE_HASH}`

   > Replace `com.yourcompany.yourapp` with your bundle/package name

## Step 3: Get Android Signature Hash (1 min)

Open terminal and run:

```bash
keytool -list -v -keystore ~/.android/debug.keystore -alias androiddebugkey -storepass android -keypass android | grep SHA1
```

You'll see: `SHA1: Xo8WBi6jzSxKDVR4drqm84yr9iU=`

Use this in your redirect URI and `app.json`

## Step 4: Install Package (1 min)

```bash
npm install react-native-msal
```

Or with Yarn:
```bash
yarn add react-native-msal
```

## Step 5: Configure app.json (2 min)

Update your `app.json`:

```json
{
  "expo": {
    "name": "MyApp",
    "slug": "myapp",
    "ios": {
      "bundleIdentifier": "com.yourcompany.myapp"
    },
    "android": {
      "package": "com.yourcompany.myapp"
    },
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

## Step 6: Create MSAL Service (3 min)

Create `src/services/msalService.ts`:

```typescript
import { PublicClientApplication } from 'react-native-msal';

const msalConfig = {
  auth: {
    clientId: 'YOUR_CLIENT_ID_HERE',
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
    return await pca.acquireToken({ scopes });
  } catch (error) {
    console.error('Login failed:', error);
  }
};

export const logout = async (account) => {
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

## Step 7: Create Auth Context (2 min)

Create `src/context/AuthContext.tsx`:

```typescript
import React, { createContext, useContext, useEffect, useState } from 'react';
import { initializeMSAL, login, logout, getAccounts } from '../services/msalService';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const initialized = await initializeMSAL();
      if (initialized) {
        const accounts = await getAccounts();
        if (accounts.length > 0) setUser(accounts[0]);
      }
      setIsLoading(false);
    })();
  }, []);

  const handleLogin = async (scopes) => {
    const result = await login(scopes);
    if (result) setUser(result.account);
    return result;
  };

  const handleLogout = async () => {
    if (user) {
      await logout(user);
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login: handleLogin, logout: handleLogout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
```

## Step 8: Use in Your App (2 min)

Update `App.tsx`:

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
        <Button title="Login" onPress={() => login(['user.read'])} />
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

## Step 9: Build and Run

```bash
# Clean and rebuild
npx expo prebuild --clean

# Run on iOS
npx expo run:ios

# Or run on Android
npx expo run:android
```

## 🎉 Done!

Your app now has Microsoft authentication!

## Troubleshooting

| Problem | Solution |
|---------|----------|
| "Native module not available" | Run `npx expo prebuild --clean` and rebuild |
| "redirect_uri_mismatch" | Check redirect URI matches exactly in Azure portal |
| "Module not found" | Run `npm install` and ensure all dependencies installed |
| App closes on login | Check bundle ID matches Azure registration |

## Next: Security Best Practices

1. **Never hardcode credentials** - Use environment variables:
   ```bash
   MSAL_CLIENT_ID=your-client-id npx expo start
   ```

2. **Store tokens securely** - Consider using `expo-secure-store`

3. **Refresh tokens automatically** - Implement token refresh before expiration

4. **Handle errors gracefully** - Add proper error boundaries

## Common Scopes

```typescript
// Microsoft Graph
['user.read']           // Read user profile
['mail.read']           // Read emails
['calendar.read']       // Read calendar
['Files.Read.All']      // Read all files
['Calendars.ReadWrite'] // Write to calendar
```

## Resources

- [Full Implementation Guide](./EXPO_IMPLEMENTATION_GUIDE.md)
- [Deprecation & Troubleshooting](./DEPRECATION_FIX.md)
- [Azure MSAL Docs](https://learn.microsoft.com/azure/active-directory/develop/msal-overview)
- [React Native MSAL GitHub](https://github.com/stashenergy/react-native-msal)
