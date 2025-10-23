import { NativeModules } from 'react-native';

import type {
  MSALResult,
  MSALInteractiveParams,
  MSALSilentParams,
  MSALSignoutParams,
  MSALAccount,
  MSALConfiguration,
} from './types';

type RNMSALNativeModule = {
  createPublicClientApplication(config: MSALConfiguration): Promise<void>;
  acquireToken(params: MSALInteractiveParams): Promise<MSALResult | undefined>;
  acquireTokenSilent(params: MSALSilentParams): Promise<MSALResult | undefined>;
  getAccounts(): Promise<MSALAccount[]>;
  getAccount(accountIdentifier: string): Promise<MSALAccount | undefined>;
  removeAccount(account: MSALAccount): Promise<boolean>;
  signout(params: MSALSignoutParams): Promise<boolean>;
};

const RNMSAL = NativeModules.RNMSAL;

if (!RNMSAL) {
  throw new Error(
    'Native module RNMSAL is not available. ' +
    'Please ensure you have linked the native module correctly. ' +
    'Run: npx react-native link react-native-msal (or use Expo config plugin for Expo projects)'
  );
}

export default RNMSAL as RNMSALNativeModule;
