# Advanced Implementation Patterns

This guide covers advanced patterns, hooks, and optimizations for production-ready MSAL integration.

## 🎣 Custom Hooks

### useAuthToken - Access Token Management

```typescript
// src/hooks/useAuthToken.ts
import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';

interface TokenInfo {
  accessToken: string | null;
  expiresIn: number | null;
  isExpired: boolean;
}

export const useAuthToken = (): TokenInfo => {
  const { accessToken } = useAuth();
  const [tokenInfo, setTokenInfo] = useState<TokenInfo>({
    accessToken: null,
    expiresIn: null,
    isExpired: true,
  });

  useEffect(() => {
    if (!accessToken) {
      setTokenInfo({
        accessToken: null,
        expiresIn: null,
        isExpired: true,
      });
      return;
    }

    // Decode JWT and check expiration
    try {
      const decoded = decodeJWT(accessToken);
      const now = Math.floor(Date.now() / 1000);
      const expiresIn = decoded.exp - now;
      
      setTokenInfo({
        accessToken,
        expiresIn,
        isExpired: expiresIn < 0,
      });
    } catch (error) {
      console.error('Failed to decode token:', error);
    }
  }, [accessToken]);

  return tokenInfo;
};

function decodeJWT(token: string) {
  const parts = token.split('.');
  if (parts.length !== 3) throw new Error('Invalid JWT');
  
  const decoded = JSON.parse(atob(parts[1]));
  return decoded;
}
```

### useAuthGuard - Protected Route Hook

```typescript
// src/hooks/useAuthGuard.ts
import { useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

export const useAuthGuard = (requiredScopes?: string[]) => {
  const { user, isLoading, refreshToken } = useAuth();

  useEffect(() => {
    if (!user || isLoading) return;

    // Optionally refresh token on component mount
    if (requiredScopes) {
      refreshToken(requiredScopes);
    }
  }, [user, isLoading, requiredScopes, refreshToken]);

  return {
    isAuthenticated: !!user,
    isLoading,
    user,
  };
};
```

### useAutoTokenRefresh - Automatic Token Refresh

```typescript
// src/hooks/useAutoTokenRefresh.ts
import { useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';

const TOKEN_REFRESH_BUFFER = 5 * 60 * 1000; // Refresh 5 mins before expiry

export const useAutoTokenRefresh = () => {
  const { user, accessToken, refreshToken } = useAuth();
  const refreshTimeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    if (!accessToken || !user) return;

    // Clear existing timeout
    if (refreshTimeoutRef.current) {
      clearTimeout(refreshTimeoutRef.current);
    }

    try {
      const decoded = decodeJWT(accessToken);
      const expiresAt = decoded.exp * 1000; // Convert to milliseconds
      const refreshAt = expiresAt - TOKEN_REFRESH_BUFFER;
      const timeUntilRefresh = refreshAt - Date.now();

      if (timeUntilRefresh > 0) {
        refreshTimeoutRef.current = setTimeout(async () => {
          console.log('Auto-refreshing token...');
          await refreshToken();
        }, timeUntilRefresh);
      } else {
        // Token already expired, refresh immediately
        refreshToken();
      }
    } catch (error) {
      console.error('Failed to set up auto refresh:', error);
    }

    return () => {
      if (refreshTimeoutRef.current) {
        clearTimeout(refreshTimeoutRef.current);
      }
    };
  }, [accessToken, user, refreshToken]);
};

function decodeJWT(token: string) {
  const parts = token.split('.');
  if (parts.length !== 3) throw new Error('Invalid JWT');
  return JSON.parse(atob(parts[1]));
}
```

## 🔐 Secure Token Storage

### Secure Storage Service

```typescript
// src/services/secureStorage.ts
import * as SecureStore from 'expo-secure-store';

interface StoredTokens {
  accessToken: string;
  refreshToken?: string;
  expiresAt: number;
}

export const secureStorage = {
  async saveTokens(tokens: StoredTokens): Promise<void> {
    try {
      await SecureStore.setItemAsync(
        'msal_tokens',
        JSON.stringify(tokens)
      );
    } catch (error) {
      console.error('Failed to save tokens:', error);
    }
  },

  async getTokens(): Promise<StoredTokens | null> {
    try {
      const stored = await SecureStore.getItemAsync('msal_tokens');
      if (!stored) return null;
      
      const tokens = JSON.parse(stored) as StoredTokens;
      
      // Check if token is expired
      if (tokens.expiresAt < Date.now()) {
        await secureStorage.clearTokens();
        return null;
      }
      
      return tokens;
    } catch (error) {
      console.error('Failed to retrieve tokens:', error);
      return null;
    }
  },

  async clearTokens(): Promise<void> {
    try {
      await SecureStore.deleteItemAsync('msal_tokens');
    } catch (error) {
      console.error('Failed to clear tokens:', error);
    }
  },
};
```

## 🛡️ Error Handling

### Auth Error Handler

```typescript
// src/services/authErrorHandler.ts
import { Alert } from 'react-native';

export enum AuthErrorType {
  USER_CANCELLED = 'USER_CANCELLED',
  TOKEN_EXPIRED = 'TOKEN_EXPIRED',
  NETWORK_ERROR = 'NETWORK_ERROR',
  INVALID_CONFIG = 'INVALID_CONFIG',
  ACCOUNT_NOT_FOUND = 'ACCOUNT_NOT_FOUND',
  UNKNOWN = 'UNKNOWN',
}

export class AuthError extends Error {
  constructor(
    public type: AuthErrorType,
    message: string,
    public originalError?: Error
  ) {
    super(message);
    this.name = 'AuthError';
  }
}

export const classifyAuthError = (error: unknown): AuthErrorType => {
  const errorStr = String(error).toLowerCase();

  if (errorStr.includes('cancelled') || errorStr.includes('user_cancelled')) {
    return AuthErrorType.USER_CANCELLED;
  }
  if (errorStr.includes('expired') || errorStr.includes('token_expired')) {
    return AuthErrorType.TOKEN_EXPIRED;
  }
  if (errorStr.includes('network') || errorStr.includes('timeout')) {
    return AuthErrorType.NETWORK_ERROR;
  }
  if (errorStr.includes('config') || errorStr.includes('invalid')) {
    return AuthErrorType.INVALID_CONFIG;
  }
  if (errorStr.includes('account') || errorStr.includes('not_found')) {
    return AuthErrorType.ACCOUNT_NOT_FOUND;
  }

  return AuthErrorType.UNKNOWN;
};

export const handleAuthError = (error: unknown): void => {
  const errorType = classifyAuthError(error);
  const errorMessage = error instanceof Error ? error.message : String(error);

  console.error(`Auth Error [${errorType}]:`, errorMessage);

  // Only show user-facing alerts for relevant errors
  switch (errorType) {
    case AuthErrorType.USER_CANCELLED:
      // Don't alert - user intentionally cancelled
      break;
    case AuthErrorType.NETWORK_ERROR:
      Alert.alert('Network Error', 'Please check your internet connection');
      break;
    case AuthErrorType.INVALID_CONFIG:
      Alert.alert(
        'Configuration Error',
        'Please check your MSAL configuration'
      );
      break;
    case AuthErrorType.TOKEN_EXPIRED:
      Alert.alert('Session Expired', 'Please log in again');
      break;
    default:
      Alert.alert('Error', 'An unexpected error occurred');
  }
};
```

## 🔄 Account Switching

### Multi-Account Provider

```typescript
// src/context/MultiAccountContext.tsx
import React, { createContext, useContext, useState } from 'react';
import { MSALAccount } from 'react-native-msal';
import { getAccounts, getAccount, loginSilent } from '../services/msalService';

interface MultiAccountContextType {
  accounts: MSALAccount[];
  currentAccount: MSALAccount | null;
  switchAccount: (account: MSALAccount) => Promise<boolean>;
  addAccount: (scopes: string[]) => Promise<MSALAccount | null>;
  removeAccountFromList: (account: MSALAccount) => Promise<boolean>;
  loadAccounts: () => Promise<void>;
}

const MultiAccountContext = createContext<MultiAccountContextType | undefined>(
  undefined
);

export const MultiAccountProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [accounts, setAccounts] = useState<MSALAccount[]>([]);
  const [currentAccount, setCurrentAccount] = useState<MSALAccount | null>(null);

  const loadAccounts = async () => {
    try {
      const loadedAccounts = await getAccounts();
      setAccounts(loadedAccounts);
      if (loadedAccounts.length > 0) {
        setCurrentAccount(loadedAccounts[0]);
      }
    } catch (error) {
      console.error('Failed to load accounts:', error);
    }
  };

  const switchAccount = async (account: MSALAccount): Promise<boolean> => {
    try {
      const result = await loginSilent(account);
      if (result) {
        setCurrentAccount(account);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Failed to switch account:', error);
      return false;
    }
  };

  const removeAccountFromList = async (
    account: MSALAccount
  ): Promise<boolean> => {
    try {
      // Your remove account logic here
      const newAccounts = accounts.filter((a) => a.identifier !== account.identifier);
      setAccounts(newAccounts);

      if (currentAccount?.identifier === account.identifier) {
        setCurrentAccount(newAccounts[0] || null);
      }
      return true;
    } catch (error) {
      console.error('Failed to remove account:', error);
      return false;
    }
  };

  return (
    <MultiAccountContext.Provider
      value={{
        accounts,
        currentAccount,
        switchAccount,
        addAccount: async () => null, // Implement as needed
        removeAccountFromList,
        loadAccounts,
      }}
    >
      {children}
    </MultiAccountContext.Provider>
  );
};

export const useMultiAccount = () => {
  const context = useContext(MultiAccountContext);
  if (!context) {
    throw new Error('useMultiAccount must be used within MultiAccountProvider');
  }
  return context;
};
```

## 📡 API Integration with MSAL

### Protected API Service

```typescript
// src/services/apiService.ts
import { useAuth } from '../context/AuthContext';

interface ApiOptions {
  scopes?: string[];
  retryCount?: number;
}

export const useProtectedApi = () => {
  const { accessToken, refreshToken } = useAuth();

  const request = async <T,>(
    url: string,
    options: RequestInit & ApiOptions = {}
  ): Promise<T> => {
    const { scopes = ['user.read'], retryCount = 1, ...fetchOptions } = options;

    if (!accessToken) {
      throw new Error('No access token available. User may not be logged in.');
    }

    const headers = {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
      ...fetchOptions.headers,
    };

    try {
      const response = await fetch(url, {
        ...fetchOptions,
        headers,
      });

      // If 401 (Unauthorized), try to refresh token and retry
      if (response.status === 401 && retryCount > 0) {
        const refreshed = await refreshToken(scopes);
        if (refreshed) {
          return request<T>(url, {
            ...options,
            retryCount: retryCount - 1,
          });
        }
      }

      if (!response.ok) {
        throw new Error(`API error: ${response.status} ${response.statusText}`);
      }

      return response.json();
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  };

  return { request };
};

// Usage in component
export const useUserProfile = () => {
  const { request } = useProtectedApi();

  return async () => {
    return request('/me', {
      scopes: ['user.read'],
    });
  };
};
```

## 🧪 Testing Utilities

### Mock MSAL Service

```typescript
// src/__mocks__/msalService.ts
import { MSALResult, MSALAccount } from 'react-native-msal';

export const mockAccount: MSALAccount = {
  identifier: 'test-user-id',
  environment: 'login.microsoftonline.com',
  tenantId: 'test-tenant-id',
  username: 'test@example.com',
};

export const mockTokenResult: MSALResult = {
  accessToken: 'mock-token',
  account: mockAccount,
  expiresOn: Date.now() + 3600000,
  idToken: 'mock-id-token',
  scopes: ['user.read'],
  tenantId: 'test-tenant-id',
};

export const msalServiceMock = {
  initializeMSAL: jest.fn().mockResolvedValue(true),
  login: jest.fn().mockResolvedValue(mockTokenResult),
  loginSilent: jest.fn().mockResolvedValue(mockTokenResult),
  logout: jest.fn().mockResolvedValue(true),
  getAccounts: jest.fn().mockResolvedValue([mockAccount]),
  getAccount: jest.fn().mockResolvedValue(mockAccount),
  removeAccount: jest.fn().mockResolvedValue(true),
};
```

## 📊 Analytics & Logging

### Auth Analytics Service

```typescript
// src/services/authAnalytics.ts
enum AuthEvent {
  LOGIN_STARTED = 'auth_login_started',
  LOGIN_SUCCESS = 'auth_login_success',
  LOGIN_FAILED = 'auth_login_failed',
  LOGOUT_SUCCESS = 'auth_logout_success',
  TOKEN_REFRESH_SUCCESS = 'auth_token_refresh_success',
  TOKEN_REFRESH_FAILED = 'auth_token_refresh_failed',
}

export const authAnalytics = {
  logEvent: (event: AuthEvent, properties?: Record<string, unknown>) => {
    // Send to analytics service (Firebase, Mixpanel, etc.)
    console.log(`[Analytics] ${event}`, properties);
  },

  logLoginStarted: () => {
    authAnalytics.logEvent(AuthEvent.LOGIN_STARTED);
  },

  logLoginSuccess: (username: string) => {
    authAnalytics.logEvent(AuthEvent.LOGIN_SUCCESS, { username });
  },

  logLoginFailed: (error: string) => {
    authAnalytics.logEvent(AuthEvent.LOGIN_FAILED, { error });
  },

  logLogoutSuccess: () => {
    authAnalytics.logEvent(AuthEvent.LOGOUT_SUCCESS);
  },

  logTokenRefreshSuccess: () => {
    authAnalytics.logEvent(AuthEvent.TOKEN_REFRESH_SUCCESS);
  },

  logTokenRefreshFailed: (error: string) => {
    authAnalytics.logEvent(AuthEvent.TOKEN_REFRESH_FAILED, { error });
  },
};
```

## 🎯 B2C Configuration

### B2C MSAL Config

```typescript
// src/config/b2cConfig.ts
import { MSALConfiguration } from 'react-native-msal';

export const b2cConfig: MSALConfiguration = {
  auth: {
    clientId: 'YOUR_B2C_CLIENT_ID',
    authority: 'https://YOUR_TENANT.b2clogin.com/YOUR_TENANT.onmicrosoft.com/B2C_1_susi',
  },
};

export const b2cScopes = [
  'https://YOUR_TENANT.onmicrosoft.com/api/read',
  'https://YOUR_TENANT.onmicrosoft.com/api/write',
];
```

---

## Resources

- [MSAL Advanced Scenarios](https://learn.microsoft.com/azure/active-directory/develop/scenario-protected-web-api-overview)
- [React Best Practices](https://reactnative.dev/)
- [Token Refresh Best Practices](https://learn.microsoft.com/en-us/azure/active-directory/develop/v2-oauth2-auth-code-flow)

**Last Updated:** October 23, 2025
