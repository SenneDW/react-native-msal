# Visual Implementation Flow

This document shows the complete flow and interaction between components.

## 🔄 Authentication Flow

```
┌─────────────────────────────────────────────────────────────┐
│                     User Opens App                          │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
        ┌────────────────────────────┐
        │  App Component Renders     │
        │  with AuthProvider         │
        └─────────────┬──────────────┘
                     │
                     ▼
        ┌────────────────────────────┐
        │  useEffect in AuthContext  │
        │  Initializes MSAL          │
        └─────────────┬──────────────┘
                     │
                     ├──────────────────┐
                     ▼                  ▼
          ✅ Success              ❌ Failure
          │                       │
          ▼                       ▼
    Check for             Display error
    cached accounts       Show login screen
          │                     │
          ├───────────┬─────────┘
          │           │
       Found       Not found
       Cached      Or empty
       Accounts    │
          │        │
          ▼        ▼
    Update       Show login
    User state   Screen
          │
          └─────────────┬──────────────┘
                        │
                        ▼
             ┌──────────────────────┐
             │  User Sees Screen    │
             │ (Logged In or Login) │
             └──────────────────────┘
```

## 🗂️ File Architecture

```
Your React Native Expo Project
│
├── 📄 app.config.js (or app.json)
│   └─ Configures MSAL plugin & bundle IDs
│
├── 📄 App.tsx (Main Component)
│   └─ Wraps app with AuthProvider
│
├── 📁 src/
│   │
│   ├── 📁 services/
│   │   └── 📄 msalService.ts
│   │       ├─ Initializes MSAL instance
│   │       ├─ Provides login() method
│   │       ├─ Provides logout() method
│   │       ├─ Provides getAccounts() method
│   │       └─ Provides loginSilent() method
│   │
│   ├── 📁 context/
│   │   └── 📄 AuthContext.tsx
│   │       ├─ Manages authentication state
│   │       ├─ Provides user object
│   │       ├─ Provides access token
│   │       ├─ Provides loading state
│   │       └─ useAuth() hook for easy access
│   │
│   ├── 📁 screens/
│   │   └── 📄 LoginScreen.tsx
│   │       ├─ Uses useAuth hook
│   │       ├─ Shows login button if not authenticated
│   │       ├─ Shows user info if authenticated
│   │       └─ Shows logout button
│   │
│   ├── 📁 config/
│   │   └── 📄 msal.config.ts (Optional)
│   │       └─ Centralized configuration
│   │
│   └── 📁 types/
│       └── 📄 auth.types.ts (Optional)
│           └─ TypeScript type definitions
│
├── 📄 .env (Development only)
│   ├─ MSAL_CLIENT_ID
│   ├─ MSAL_AUTHORITY
│   └─ ANDROID_PACKAGE_SIGNATURE_HASH
│
├── 📄 .gitignore (Make sure .env is listed)
│
└── 📄 package.json
    └─ Contains: react-native-msal dependency
```

## 🔗 Component Relationship Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                        App.tsx                              │
│  ┌─────────────────────────────────────────────────────┐   │
│  │          AuthProvider (Context Provider)             │   │
│  │  ┌────────────────────────────────────────────────┐  │   │
│  │  │       LoginScreen.tsx                          │  │   │
│  │  │  - Uses useAuth() hook                        │  │   │
│  │  │  - Calls auth.login()                         │  │   │
│  │  │  - Accesses auth.user                         │  │   │
│  │  │  - Calls auth.logout()                        │  │   │
│  │  └────────────────────────────────────────────────┘  │   │
│  │                      ▲                                │   │
│  │                      │                                │   │
│  │              useAuth() hook returns:                  │   │
│  │              { user, login, logout,                  │   │
│  │                accessToken, isLoading }             │   │
│  │                      │                                │   │
│  │                      ▼                                │   │
│  │  ┌────────────────────────────────────────────────┐  │   │
│  │  │       AuthContext State Management             │  │   │
│  │  │  - user: MSALAccount | null                   │  │   │
│  │  │  - accessToken: string | null                 │  │   │
│  │  │  - isLoading: boolean                         │  │   │
│  │  │  - login(): Promise<MSALResult>              │  │   │
│  │  │  - logout(): Promise<boolean>                │  │   │
│  │  │  - refreshToken(): Promise<boolean>          │  │   │
│  │  └────────────────────────────────────────────────┘  │   │
│  │                      ▲                                │   │
│  │                      │                                │   │
│  │            Calls MSAL service methods                │   │
│  │                      │                                │   │
│  │                      ▼                                │   │
│  │  ┌────────────────────────────────────────────────┐  │   │
│  │  │         msalService.ts                         │  │   │
│  │  │  - initializeMSAL()                            │  │   │
│  │  │  - login()                                     │  │   │
│  │  │  - loginSilent()                              │  │   │
│  │  │  - logout()                                    │  │   │
│  │  │  - getAccounts()                              │  │   │
│  │  │  - removeAccount()                            │  │   │
│  │  └────────────────────────────────────────────────┘  │   │
│  │                      ▲                                │   │
│  │                      │                                │   │
│  │            Uses MSAL public client                   │   │
│  │                      │                                │   │
│  │                      ▼                                │   │
│  │  ┌────────────────────────────────────────────────┐  │   │
│  │  │      react-native-msal Package                │  │   │
│  │  │  - PublicClientApplication class              │  │   │
│  │  │  - Native MSAL module (iOS/Android)           │  │   │
│  │  │  - Browser-based auth (web)                   │  │   │
│  │  └────────────────────────────────────────────────┘  │   │
│  │                      ▲                                │   │
│  │                      │                                │   │
│  │                 Authenticates with                   │   │
│  │                      │                                │   │
│  │                      ▼                                │   │
│  │        ┌──────────────────────────┐                 │   │
│  │        │   Azure AD / Microsoft   │                 │   │
│  │        │   Login Portal           │                 │   │
│  │        └──────────────────────────┘                 │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

## 📱 Data Flow: Login Process

```
┌──────────────────────────────────────────────────────────────┐
│                    User Clicks Login Button                  │
└─────────────────────┬────────────────────────────────────────┘
                      │
                      ▼
          ┌───────────────────────┐
          │ auth.login(['user.read'])
          └────────────┬──────────┘
                       │
                       ▼
    ┌──────────────────────────────┐
    │ msalService.login()          │
    │ calls pca.acquireToken()     │
    └──────────┬───────────────────┘
               │
               ▼
    ┌──────────────────────────────┐
    │ Browser Opens for OAuth Flow │
    │ (User enters credentials)    │
    └──────────┬───────────────────┘
               │
      ┌────────┴─────────┐
      │                  │
      ▼                  ▼
   ✅ Success        ❌ User Cancels
      │                  │
      ▼                  ▼
Returns            Returns undefined
MSALResult        or throws error
      │                  │
      ▼                  ▼
AuthContext         Display error
updates:            in UI
- user
- accessToken
      │
      ▼
LoginScreen
re-renders
with user data
```

## 📱 Data Flow: Logout Process

```
┌──────────────────────────────────────────────────────────────┐
│                  User Clicks Logout Button                   │
└─────────────────────┬────────────────────────────────────────┘
                      │
                      ▼
          ┌───────────────────────┐
          │ auth.logout()         │
          └────────────┬──────────┘
                       │
                       ▼
    ┌──────────────────────────────┐
    │ msalService.logout(user)     │
    │ calls pca.signOut()          │
    └──────────┬───────────────────┘
               │
               ▼
    ┌──────────────────────────────┐
    │ Clears tokens from cache     │
    │ (iOS: may open browser)      │
    └──────────┬───────────────────┘
               │
      ┌────────┴─────────┐
      │                  │
      ▼                  ▼
   ✅ Success        ❌ Error
      │                  │
      ▼                  ▼
AuthContext         Retry or
updates:            display error
- user = null
- token = null
      │
      ▼
LoginScreen
re-renders
back to login form
```

## 🔐 Token Management Flow

```
┌────────────────────────────────────────────────────────────┐
│            Silent Token Refresh (Automatic)                │
└────────────────┬─────────────────────────────────────────┘
                 │
        ┌────────▼──────────┐
        │ Check token       │
        │ expiration time   │
        └────────┬──────────┘
                 │
       ┌─────────┴──────────┐
       │                    │
    Expired            Not Expired
       │                    │
       ▼                    ▼
┌─────────────┐    ┌─────────────┐
│ Call        │    │ Use current │
│ loginSilent │    │ token       │
└──────┬──────┘    └─────────────┘
       │
  ┌────┴────┐
  │          │
  ▼          ▼
Success    Failure
  │          │
  │          ▼
  │     ┌──────────────┐
  │     │ User needs   │
  │     │ to login     │
  │     │ again        │
  │     └──────────────┘
  │
  ▼
Update token
in context
```

## 🌳 Component Render Tree

```
<App>
  └─ <AuthProvider>
     ├─ State: { user, isLoading, accessToken }
     ├─ Effect: Initialize MSAL on mount
     └─ <LoginScreen>
        ├─ Reads: useAuth() hook
        ├─ useAuth returns auth context
        ├─ Shows loading spinner if isLoading
        ├─ Shows login button if no user
        └─ Shows logout button & user info if logged in
           └─ Displays:
              ├─ Username
              ├─ Tenant ID
              ├─ Refresh button
              └─ Logout button
```

## 🔄 MSAL Service State Machine

```
                    ┌─────────────┐
                    │ Not Started │
                    └──────┬──────┘
                           │
                   init() called
                           │
                           ▼
                    ┌─────────────┐
                    │ Initializing│
                    └──────┬──────┘
                           │
              ┌────────────┴────────────┐
              │                         │
              ▼                         ▼
        ✅ Success              ❌ Failed
              │                         │
              ▼                         ▼
        ┌──────────┐            ┌──────────┐
        │Initialized
        │           │            │  Error  │
        │           │            │  State  │
        └─────┬─────┘            └──────────┘
              │
    ┌─────────┼─────────┐
    │         │         │
    ▼         ▼         ▼
 login() getAccounts() logout()
    │         │         │
    └─────┬───┴─────────┘
          │
          ▼
   ┌────────────────┐
   │ Token Obtained │
   │ or            │
   │ No action      │
   └────────────────┘
```

## 🎯 Key Integration Points

```
Azure Portal ──────────────────────────────── Your App
     │                                          │
     ├─ Client ID ────────────────────────► app.config.js
     │
     ├─ Redirect URIs  ─────────────────► app.config.js
     │                                  (bundleId)
     │
     └─ Authority URL ────────────────► msalService.ts
                                      (MSALConfiguration)
```

---

**Visual Guide Version:** 1.0  
**Last Updated:** October 23, 2025
