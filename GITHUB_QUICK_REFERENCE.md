# Quick Reference - GitHub Installation

For using `react-native-msal` from GitHub in your app.

## Installation

```bash
npm install https://github.com/SenneDW/react-native-msal
```

Or in `package.json`:
```json
{
  "dependencies": {
    "react-native-msal": "https://github.com/SenneDW/react-native-msal"
  }
}
```

## Quick Setup

### 1. Configure `app.json`

```json
{
  "expo": {
    "plugins": [
      [
        "react-native-msal",
        {
          "androidPackageSignatureHash": "YOUR_HASH_HERE"
        }
      ]
    ]
  }
}
```

### 2. Create `src/services/msalService.ts`

```typescript
import { PublicClientApplication } from 'react-native-msal';

export const pca = new PublicClientApplication({
  auth: {
    clientId: 'YOUR_CLIENT_ID',
    authority: 'https://login.microsoftonline.com/common',
  },
});

export const initializeMSAL = async () => {
  try {
    await pca.init();
    return true;
  } catch (error) {
    console.error('MSAL init failed:', error);
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
    return [];
  }
};
```

### 3. Create `src/context/AuthContext.tsx`

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

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
```

### 4. Use in Your App

```typescript
import { AuthProvider, useAuth } from './src/context/AuthContext';

const LoginScreen = () => {
  const { user, login, logout } = useAuth();
  
  return (
    <Button
      title={user ? 'Logout' : 'Login'}
      onPress={user ? logout : () => login(['user.read'])}
    />
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

### 5. Build & Run

```bash
npx expo prebuild --clean
npx expo run:ios    # or run:android
```

## Common Commands

```bash
# Get Android hash (for redirect URI)
keytool -list -v -keystore ~/.android/debug.keystore \
  -alias androiddebugkey -storepass android -keypass android | grep SHA1

# Reinstall if issues
rm -rf node_modules && npm install
npx expo prebuild --clean

# Check setup
npx react-native doctor
```

## API Quick Reference

```typescript
// Initialize
await pca.init();

// Login
const result = await pca.acquireToken({ scopes: ['user.read'] });
// Returns: { accessToken, account, expiresOn, idToken, scopes }

// Silent login
const result = await pca.acquireTokenSilent({ account, scopes });

// Get accounts
const accounts = await pca.getAccounts();

// Logout
await pca.signOut({ account, signoutFromBrowser: true });

// Get specific account
const account = await pca.getAccount(identifier);

// Remove account
await pca.removeAccount(account);
```

## Key Properties

```typescript
interface MSALResult {
  accessToken: string;        // Use in API calls
  account: MSALAccount;       // User info
  expiresOn: number;          // Expiration timestamp
  idToken?: string;           // Identity token
  scopes: string[];           // Granted scopes
  tenantId?: string;          // Tenant ID
}

interface MSALAccount {
  identifier: string;         // Unique ID
  environment: string;        // Login.microsoftonline.com
  tenantId: string;          // Tenant ID
  username: string;           // User email
  claims?: object;            // Token claims
}
```

## Common Scopes

```typescript
'user.read'              // User profile
'mail.read'              // Read emails
'calendar.read'          // Read calendar
'Files.Read.All'         // Read OneDrive files
'Calendars.ReadWrite'    // Write calendar
```

## Azure Setup

1. Go to [portal.azure.com](https://portal.azure.com)
2. Create app registration
3. Copy **Client ID**
4. Add redirect URIs:
   - iOS: `msauth.com.yourcompany.app://auth`
   - Android: `msauth://com.yourcompany.app/SIGNATURE_HASH`

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Native module not available | `npx expo prebuild --clean` |
| redirect_uri_mismatch | Check redirect URI in Azure matches exactly |
| Module not found | `rm -rf node_modules && npm install` |
| App crashes on login | Verify bundle ID matches Azure registration |

## Error Handling

```typescript
try {
  const result = await pca.acquireToken({ scopes });
  if (result) {
    console.log('Login successful:', result.account.username);
  }
} catch (error) {
  console.error('Error:', error);
  // Handle different error types:
  // USER_CANCELLED, TOKEN_EXPIRED, NETWORK_ERROR, etc.
}
```

## More Information

- Full guide: [GITHUB_INTEGRATION_GUIDE.md](./GITHUB_INTEGRATION_GUIDE.md)
- Troubleshooting: [DEPRECATION_FIX.md](./DEPRECATION_FIX.md)
- Advanced features: [ADVANCED_PATTERNS.md](./ADVANCED_PATTERNS.md)
- GitHub: https://github.com/SenneDW/react-native-msal

---

**Last Updated:** October 23, 2025
