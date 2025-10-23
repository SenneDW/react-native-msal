# Environment Variables Setup

Best practices for managing sensitive configuration in your Expo project.

## Step 1: Create .env File

In your project root, create a `.env` file:

```bash
# .env (DEVELOPMENT)
MSAL_CLIENT_ID=12345678-1234-1234-1234-123456789abc
MSAL_AUTHORITY=https://login.microsoftonline.com/common
ANDROID_PACKAGE_SIGNATURE_HASH=Xo8WBi6jzSxKDVR4drqm84yr9iU=
```

## Step 2: Install dotenv (Optional)

```bash
npm install dotenv
# or
npm install expo-constants
```

## Step 3: Create Config File

Create `src/config/msal.config.ts`:

```typescript
import Constants from 'expo-constants';

// Read from environment variables or use defaults
const config = {
  clientId: Constants.expoConfig?.extra?.msal?.clientId || 'YOUR_CLIENT_ID_HERE',
  authority: Constants.expoConfig?.extra?.msal?.authority || 'https://login.microsoftonline.com/common',
  androidSignatureHash: Constants.expoConfig?.extra?.msal?.androidSignatureHash || 'YOUR_HASH_HERE',
};

export default config;
```

## Step 4: Update app.json or app.config.js

### Option A: app.json with Environment Variables

```json
{
  "expo": {
    "name": "MyApp",
    "slug": "myapp",
    "extra": {
      "msal": {
        "clientId": "YOUR_CLIENT_ID_HERE",
        "authority": "https://login.microsoftonline.com/common",
        "androidSignatureHash": "YOUR_HASH_HERE"
      }
    }
  }
}
```

### Option B: app.config.js (Recommended)

Create `app.config.js`:

```javascript
import 'dotenv/config';

export default {
  expo: {
    name: 'MyApp',
    slug: 'myapp',
    version: '1.0.0',
    scheme: 'myapp',
    ios: {
      bundleIdentifier: 'com.yourcompany.myapp',
    },
    android: {
      package: 'com.yourcompany.myapp',
    },
    plugins: [
      [
        'react-native-msal',
        {
          androidPackageSignatureHash: process.env.ANDROID_PACKAGE_SIGNATURE_HASH || 'YOUR_HASH_HERE',
        },
      ],
    ],
    extra: {
      msal: {
        clientId: process.env.MSAL_CLIENT_ID || 'YOUR_CLIENT_ID_HERE',
        authority: process.env.MSAL_AUTHORITY || 'https://login.microsoftonline.com/common',
        androidSignatureHash: process.env.ANDROID_PACKAGE_SIGNATURE_HASH || 'YOUR_HASH_HERE',
      },
    },
  },
};
```

## Step 5: Update msalService.ts

```typescript
import Constants from 'expo-constants';
import { PublicClientApplication } from 'react-native-msal';

const clientId = Constants.expoConfig?.extra?.msal?.clientId;
const authority = Constants.expoConfig?.extra?.msal?.authority;

if (!clientId) {
  throw new Error(
    'MSAL_CLIENT_ID is not set. Please configure it in app.config.js or .env'
  );
}

const msalConfig = {
  auth: {
    clientId,
    authority,
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
```

## Step 6: Add to .gitignore

Make sure you **never commit** sensitive values:

```gitignore
# Environment variables
.env
.env.local
.env.*.local

# Expo
.expo/
dist/
```

## Step 7: Running with Environment Variables

### Development

```bash
# Using .env file (automatically loaded with app.config.js)
npx expo prebuild --clean
npx expo run:ios

# Or with explicit variables
MSAL_CLIENT_ID=your-id npx expo start
```

### Production

```bash
# Use different values for production
MSAL_CLIENT_ID=prod-client-id \
MSAL_AUTHORITY=https://login.microsoftonline.com/your-tenant-id \
ANDROID_PACKAGE_SIGNATURE_HASH=prod-hash \
npx expo prebuild --clean
npx expo run:ios
```

## Environment-Specific Configs

Create separate environment files:

```bash
# .env.development
MSAL_CLIENT_ID=dev-client-id
MSAL_AUTHORITY=https://login.microsoftonline.com/common

# .env.production
MSAL_CLIENT_ID=prod-client-id
MSAL_AUTHORITY=https://login.microsoftonline.com/prod-tenant-id

# .env.staging
MSAL_CLIENT_ID=staging-client-id
MSAL_AUTHORITY=https://login.microsoftonline.com/staging-tenant-id
```

Then load the appropriate one:

```javascript
// app.config.js
const env = process.env.APP_ENV || 'development';
require(`dotenv`).config({ path: `.env.${env}` });
```

## Using with CI/CD (GitHub Actions)

Create `.github/workflows/build.yml`:

```yaml
name: Build

on: [push]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
      - run: npm install
      - run: npx expo prebuild --clean
        env:
          MSAL_CLIENT_ID: ${{ secrets.MSAL_CLIENT_ID }}
          MSAL_AUTHORITY: ${{ secrets.MSAL_AUTHORITY }}
          ANDROID_PACKAGE_SIGNATURE_HASH: ${{ secrets.ANDROID_SIGNATURE_HASH }}
```

## Security Best Practices

✅ **DO:**
- Store sensitive values in environment variables
- Use `.env` files for local development only
- Use GitHub Secrets for CI/CD
- Use Azure Key Vault for production secrets
- Rotate tokens and secrets regularly
- Use different client IDs for dev/staging/prod

❌ **DON'T:**
- Commit `.env` files to git
- Hardcode sensitive values in source code
- Share `.env` files in messages
- Use same Client ID for multiple environments
- Log sensitive values
- Commit production credentials

## Accessing Environment Variables in Components

```typescript
import Constants from 'expo-constants';

export const MyComponent = () => {
  const clientId = Constants.expoConfig?.extra?.msal?.clientId;
  
  return <Text>{`App configured with: ${clientId}`}</Text>;
};
```

## Troubleshooting

### Environment variables not loaded

```bash
# Clear cache and rebuild
rm -rf node_modules
npm install
npx expo prebuild --clean
npx expo run:ios
```

### "MSAL_CLIENT_ID is not set" error

1. Check `.env` file exists in project root
2. Check `app.config.js` reads from correct environment variable
3. Verify `process.env.MSAL_CLIENT_ID` is set before running

### Different values on different machines

1. Create `.env.local` for local overrides (add to .gitignore)
2. Use app.config.js for consistency
3. Document expected values in README

## Reference

- [Expo Config Plugin Documentation](https://docs.expo.dev/config-plugins/introduction/)
- [Expo Constants](https://docs.expo.dev/versions/latest/sdk/constants/)
- [dotenv Package](https://www.npmjs.com/package/dotenv)
- [GitHub Secrets](https://docs.github.com/en/actions/security-guides/encrypted-secrets)
- [Azure Key Vault](https://azure.microsoft.com/services/key-vault/)

---

**Last Updated:** October 23, 2025
