/**
 * App.tsx - Example Implementation
 * 
 * This is a complete example of how to use MSAL in your Expo app.
 * Copy and modify this file to match your project structure.
 */

import React from 'react';
import {
  View,
  ScrollView,
  Button,
  Text,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { AuthProvider, useAuth } from './src/context/AuthContext';

/**
 * Main login screen component
 */
const LoginScreen = () => {
  const { isLoading, user, accessToken, login, logout, refreshToken } = useAuth();

  const handleLogin = async () => {
    try {
      const result = await login(['user.read', 'mail.read']);
      if (result) {
        Alert.alert('Success', `Logged in as ${result.account.username}`);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to login. Please try again.');
    }
  };

  const handleLogout = async () => {
    try {
      const success = await logout();
      if (success) {
        Alert.alert('Success', 'Logged out successfully');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to logout');
    }
  };

  const handleRefreshToken = async () => {
    try {
      const success = await refreshToken(['user.read']);
      if (success) {
        Alert.alert('Success', 'Token refreshed successfully');
      } else {
        Alert.alert('Info', 'Token refresh failed - please login again');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to refresh token');
    }
  };

  if (isLoading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#0078d4" />
        <Text style={styles.loadingText}>Initializing MSAL...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.title}>Microsoft MSAL Auth</Text>
        <Text style={styles.subtitle}>React Native Expo Example</Text>
      </View>

      {!user ? (
        // Not logged in
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Not Logged In</Text>
          <Text style={styles.cardDescription}>
            Click below to authenticate with your Microsoft account
          </Text>
          <TouchableOpacity
            style={[styles.button, styles.buttonPrimary]}
            onPress={handleLogin}
            disabled={isLoading}
          >
            <Text style={styles.buttonText}>
              🔐 Login with Microsoft
            </Text>
          </TouchableOpacity>
        </View>
      ) : (
        // Logged in
        <View style={styles.card}>
          <Text style={styles.cardTitle}>✅ Logged In</Text>
          
          <View style={styles.userInfo}>
            <Text style={styles.label}>Username:</Text>
            <Text style={styles.value}>{user.username}</Text>
            
            <Text style={styles.label}>Tenant ID:</Text>
            <Text style={styles.value}>{user.tenantId}</Text>
            
            <Text style={styles.label}>Environment:</Text>
            <Text style={styles.value}>{user.environment}</Text>
          </View>

          {accessToken && (
            <View style={styles.tokenSection}>
              <Text style={styles.label}>Token Status:</Text>
              <View style={styles.tokenBadge}>
                <Text style={styles.tokenText}>✓ Access Token Available</Text>
              </View>
              <Text style={styles.tokenPreview}>
                {accessToken.substring(0, 50)}...
              </Text>
            </View>
          )}

          <TouchableOpacity
            style={[styles.button, styles.buttonSecondary]}
            onPress={handleRefreshToken}
            disabled={isLoading}
          >
            <Text style={styles.buttonText}>🔄 Refresh Token</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.buttonDanger]}
            onPress={handleLogout}
            disabled={isLoading}
          >
            <Text style={styles.buttonText}>🚪 Logout</Text>
          </TouchableOpacity>
        </View>
      )}

      <View style={styles.footer}>
        <Text style={styles.footerText}>
          Made with ❤️ using react-native-msal
        </Text>
      </View>
    </ScrollView>
  );
};

/**
 * Main App component
 */
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
    backgroundColor: '#f5f5f5',
  },
  content: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
  },
  header: {
    marginBottom: 30,
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#0078d4',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#666',
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#333',
  },
  cardDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 20,
    lineHeight: 20,
  },
  userInfo: {
    marginBottom: 20,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  label: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#999',
    marginTop: 12,
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  value: {
    fontSize: 14,
    color: '#333',
    fontFamily: 'Courier New',
  },
  tokenSection: {
    marginBottom: 20,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  tokenBadge: {
    backgroundColor: '#e8f5e9',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginVertical: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#4caf50',
  },
  tokenText: {
    color: '#2e7d32',
    fontWeight: '600',
    fontSize: 13,
  },
  tokenPreview: {
    fontSize: 11,
    color: '#999',
    fontFamily: 'Courier New',
    marginTop: 8,
  },
  button: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginBottom: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonPrimary: {
    backgroundColor: '#0078d4',
  },
  buttonSecondary: {
    backgroundColor: '#107c10',
  },
  buttonDanger: {
    backgroundColor: '#d13438',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  footerText: {
    fontSize: 12,
    color: '#999',
  },
});

export default App;
