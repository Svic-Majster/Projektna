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

  return (
    <View style={styles.center}>
    <Text style={styles.title}>Prijavljen si</Text>
    <Text style={styles.subtitle}>
    {auth.user.ime} {auth.user.priimek}
    </Text>
    <Text style={styles.subtitle}>{auth.user.email}</Text>
    <Text style={styles.subtitle}>@{auth.user.username}</Text>

    <View style={styles.spacer} />

    <Button title="Odjava" onPress={auth.logout} />
    </View>
  );
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
