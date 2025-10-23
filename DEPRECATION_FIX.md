# React Native MSAL Deprecation Fix

## Issue
The error `TypeError: Cannot read property 'createPublicClientApplication' of null` indicates that the native MSAL module is not properly linked or initialized.

## Root Causes
1. **Native module not linked**: The React Native native bridge is not connected
2. **Missing platform configuration**: iOS or Android setup incomplete
3. **Outdated dependencies**: MSAL packages need updating

## Solutions

### Solution 1: Fix Native Module Linking (Recommended)

#### For Expo Projects:
```bash
# Add the Expo config plugin (already in package.json)
npx expo prebuild --clean
npx expo run:ios
# or
npx expo run:android
```

#### For Non-Expo Projects:

**iOS:**
```bash
cd ios
pod install
cd ..
npx react-native run-ios
```

**Android:**
```bash
cd android
./gradlew clean
cd ..
npx react-native run-android
```

### Solution 2: Verify Platform Configuration

**iOS Setup (ios/YourAppName/Info.plist):**
```xml
<key>CFBundleURLTypes</key>
<array>
  <dict>
    <key>CFBundleURLSchemes</key>
    <array>
      <string>msauth.$(PRODUCT_BUNDLE_IDENTIFIER)</string>
    </array>
  </dict>
</array>
<key>LSApplicationQueriesSchemes</key>
<array>
  <string>msauth</string>
  <string>msauthv2</string>
</array>
```

**Android Setup (android/app/src/main/AndroidManifest.xml):**
```xml
<queries>
  <package android:name="com.azure.authenticator" />
  <package android:name="com.microsoft.windowsintune.companyportal" />
</queries>
```

### Solution 3: Update Dependencies

```bash
npm install --save @azure/msal-browser@^3.15.0 @azure/msal-common@^14.15.0
npm install
cd ios && pod install && cd ..
```

### Solution 4: Proper Initialization in Your App

```typescript
import { PublicClientApplication } from 'react-native-msal';

const config = {
  auth: {
    clientId: 'YOUR_CLIENT_ID',
    authority: 'https://login.microsoftonline.com/YOUR_TENANT_ID',
  },
};

const pca = new PublicClientApplication(config);

// IMPORTANT: Always initialize before use
try {
  await pca.init();
  console.log('MSAL initialized successfully');
} catch (error) {
  console.error('MSAL initialization failed:', error);
  // Check native module linking and platform configuration
}
```

## Troubleshooting Checklist

- [ ] Run `npx react-native doctor` to diagnose setup issues
- [ ] Verify native module is linked: 
  - iOS: Check if RNMSAL appears in Xcode project
  - Android: Check `RNMSALModule` is registered in `MainApplication.java`
- [ ] Confirm platform-specific setup files exist and are configured
- [ ] Clear build caches:
  - `rm -rf ios/Pods node_modules && npm install && cd ios && pod install && cd ..`
  - `cd android && ./gradlew clean && cd ..`
- [ ] Rebuild the app for your platform
- [ ] Check app logs for detailed error messages
- [ ] Verify client ID and authority URL are correct

## Error Messages

| Error | Cause | Solution |
|-------|-------|----------|
| `Cannot read property 'createPublicClientApplication' of null` | Native module not linked | Re-link native modules and rebuild |
| `Module not found: RNMSAL` | Native code not compiled | Rebuild for your platform |
| `Invalid authority URL` | Configuration error | Verify client ID and tenant ID |
| `redirect_uri_mismatch` | Redirect URI not registered | Register redirect URI in Azure portal |

## Dependencies Updated

- `@azure/msal-browser`: ^3.15.0 (latest)
- `@azure/msal-common`: ^14.15.0 (latest)
- `@expo/config-plugins`: ^7.0.0 (latest)

## Next Steps

1. Apply the appropriate solution based on your setup (Expo or native)
2. Rebuild your app completely
3. Test MSAL initialization
4. Check browser/logcat logs for detailed error information
5. If issues persist, verify all platform configuration files
