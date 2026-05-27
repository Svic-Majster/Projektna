import { useState } from 'react';
import {
  ActivityIndicator,
  Button,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useAuth } from './src/hooks/useAuth';
import LoginScreen from './src/screens/LoginScreen';
import RegisterScreen from './src/screens/RegisterScreen';
import HomeScreen from './src/screens/HomeScreen';

export default function App() {
  const auth = useAuth();
  const [mode, setMode] = useState<'login' | 'register'>('login');

  if (auth.loading) {
    return (
      <View style={styles.center}>
      <ActivityIndicator size="large" />
      <Text style={styles.loadingText}>Nalagam uporabnika...</Text>
      </View>
    );
  }

  if (!auth.user) {
    return mode === 'login' ? (
      <LoginScreen
      onSubmit={auth.login}
      onGoToRegister={() => setMode('register')}
      />
    ) : (
      <RegisterScreen
      onSubmit={auth.register}
      onGoToLogin={() => setMode('login')}
      />
    );
  }

  return <HomeScreen />;
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    marginTop: 6,
  },
  spacer: {
    height: 16,
  },
});
