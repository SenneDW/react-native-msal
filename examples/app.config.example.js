/**
 * app.json Configuration Example
 * 
 * This shows how to configure your Expo project for MSAL.
 * Copy the relevant parts into your app.json or app.config.js
 */

// Option 1: app.json format
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
    "icon": "./assets/icon.png",
    "splash": {
      "image": "./assets/splash.png",
      "resizeMode": "contain",
      "backgroundColor": "#ffffff"
    },
    "ios": {
      "supportsTabletMode": true,
      "bundleIdentifier": "com.example.myapp"
    },
    "android": {
      "package": "com.example.myapp",
      "versionCode": 1
    },
    "web": {
      "favicon": "./assets/favicon.png"
    },
    // ⚠️ IMPORTANT: Add the MSAL plugin configuration
    "plugins": [
      [
        "react-native-msal",
        {
          // Get this from: keytool -list -v -keystore ~/.android/debug.keystore | grep SHA1
          "androidPackageSignatureHash": "Xo8WBi6jzSxKDVR4drqm84yr9iU="
        }
      ]
    ],
    "extra": {
      // Store configuration separately for easier management
      "msal": {
        "clientId": "YOUR_CLIENT_ID_HERE",
        "authority": "https://login.microsoftonline.com/common"
      }
    }
  }
}

/*
  Option 2: app.config.js format (more flexible)
  Create a file named app.config.js instead of app.json
*/

module.exports = {
  expo: {
    name: 'MyApp',
    slug: 'myapp',
    version: '1.0.0',
    scheme: 'myapp',
    platforms: ['ios', 'android', 'web'],
    icon: './assets/icon.png',
    splash: {
      image: './assets/splash.png',
      resizeMode: 'contain',
      backgroundColor: '#ffffff',
    },
    ios: {
      supportsTabletMode: true,
      bundleIdentifier: 'com.example.myapp',
    },
    android: {
      package: 'com.example.myapp',
      versionCode: 1,
    },
    web: {
      favicon: './assets/favicon.png',
    },
    plugins: [
      [
        'react-native-msal',
        {
          androidPackageSignatureHash: process.env.ANDROID_SIGNATURE_HASH || 'Xo8WBi6jzSxKDVR4drqm84yr9iU=',
        },
      ],
    ],
    extra: {
      msal: {
        clientId: process.env.MSAL_CLIENT_ID || 'YOUR_CLIENT_ID_HERE',
        authority: 'https://login.microsoftonline.com/common',
      },
    },
  },
};

/*
  IMPORTANT CONFIGURATION NOTES:

  1. Bundle Identifier (iOS):
     - Must match the bundle ID registered in Azure Portal
     - Format: com.company.appname
     - Example: com.example.myapp

  2. Package Name (Android):
     - Must match the package name registered in Azure Portal
     - Format: com.company.appname
     - Example: com.example.myapp

  3. Android Package Signature Hash:
     - Required for MSAL on Android
     - Get from: keytool -list -v -keystore ~/.android/debug.keystore -alias androiddebugkey -storepass android -keypass android | grep SHA1
     - Format: Base64 encoded (e.g., Xo8WBi6jzSxKDVR4drqm84yr9iU=)

  4. Redirect URIs (must be registered in Azure Portal):
     - iOS: msauth.com.example.myapp://auth
     - Android: msauth://com.example.myapp/Xo8WBi6jzSxKDVR4drqm84yr9iU%3D

  5. Client ID:
     - Get from Azure App Registration
     - Should be a GUID like: 12345678-1234-1234-1234-123456789abc

  6. Authority URL:
     - Common: https://login.microsoftonline.com/common
     - Specific tenant: https://login.microsoftonline.com/{tenant-id}
     - B2C: https://{your-tenant}.b2clogin.com/{your-tenant}.onmicrosoft.com/
*/
