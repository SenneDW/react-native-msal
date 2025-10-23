/**
 * MSAL Service
 * 
 * This is a ready-to-use service for managing Microsoft authentication in your Expo project.
 * Copy this file to: src/services/msalService.ts
 */

import { PublicClientApplication } from 'react-native-msal';
import type { 
  MSALConfiguration, 
  MSALResult, 
  MSALAccount,
  MSALInteractiveParams,
} from 'react-native-msal';

// ⚠️ IMPORTANT: Replace with your actual Client ID from Azure Portal
const CLIENT_ID = 'YOUR_CLIENT_ID_HERE';

const msalConfig: MSALConfiguration = {
  auth: {
    clientId: CLIENT_ID,
    authority: 'https://login.microsoftonline.com/common',
  },
};

// Initialize MSAL instance
export const pca = new PublicClientApplication(msalConfig);

/**
 * Initialize MSAL
 * Call this once when your app starts
 */
export const initializeMSAL = async (): Promise<boolean> => {
  try {
    await pca.init();
    console.log('✅ MSAL initialized successfully');
    return true;
  } catch (error) {
    console.error('❌ MSAL initialization failed:', error);
    return false;
  }
};

/**
 * Interactive login
 * Opens the browser for user to authenticate
 */
export const login = async (
  scopes: string[] = ['user.read']
): Promise<MSALResult | undefined> => {
  try {
    const params: MSALInteractiveParams = { scopes };
    const result = await pca.acquireToken(params);
    
    if (result) {
      console.log('✅ Login successful');
      console.log('User:', result.account.username);
    }
    
    return result;
  } catch (error) {
    console.error('❌ Login failed:', error);
    return undefined;
  }
};

/**
 * Silent login
 * Attempts to get a token without user interaction
 */
export const loginSilent = async (
  account: MSALAccount,
  scopes: string[] = ['user.read']
): Promise<MSALResult | undefined> => {
  try {
    const result = await pca.acquireTokenSilent({
      account,
      scopes,
      forceRefresh: false,
    });
    
    if (result) {
      console.log('✅ Silent login successful');
    }
    
    return result;
  } catch (error) {
    console.error('❌ Silent login failed (user may need to login interactively):', error);
    return undefined;
  }
};

/**
 * Get all authenticated accounts
 */
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

/**
 * Get specific account by identifier
 */
export const getAccount = async (
  accountIdentifier: string
): Promise<MSALAccount | undefined> => {
  try {
    const account = await pca.getAccount(accountIdentifier);
    console.log('✅ Account retrieved');
    return account;
  } catch (error) {
    console.error('❌ Get account failed:', error);
    return undefined;
  }
};

/**
 * Logout - removes tokens from cache
 */
export const logout = async (account: MSALAccount): Promise<boolean> => {
  try {
    await pca.signOut({
      account,
      signoutFromBrowser: true, // iOS: also sign out from browser
    });
    console.log('✅ Logout successful');
    return true;
  } catch (error) {
    console.error('❌ Logout failed:', error);
    return false;
  }
};

/**
 * Remove account from cache
 */
export const removeAccount = async (account: MSALAccount): Promise<boolean> => {
  try {
    await pca.removeAccount(account);
    console.log('✅ Account removed');
    return true;
  } catch (error) {
    console.error('❌ Remove account failed:', error);
    return false;
  }
};
