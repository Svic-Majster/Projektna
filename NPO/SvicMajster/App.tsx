import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useAuth } from './src/hooks/useAuth';
import LoginScreen from './src/screens/LoginScreen';
import RegisterScreen from './src/screens/RegisterScreen';
import HomeScreen from './src/screens/HomeScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import WorkoutScreen from './src/screens/WorkoutScreen';

export default function App() {
  const auth = useAuth();
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [screen, setScreen] = useState<'home' | 'profile' | 'workout'>('home');
  
  const [selectedSport, setSelectedSport] = useState<'tek' | 'kolesarjenje' | 'hoja'>('tek');
  const [activeTreningId, setActiveTreningId] = useState<number | null>(null);
  
  useEffect(() => {
    if (auth.user) {
      setScreen('home');
    }
  }, [auth.user]);

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

  if (screen === 'profile') {
    return (
      <ProfileScreen 
        user={auth.user}
        onGoBack={() => setScreen('home')}
        onLogout={auth.logout}
        onUpdateUser={auth.updateUser}
      />
    );
  }

  if (screen === 'workout') {
    return (
      <WorkoutScreen
        sport={selectedSport}
        treningId={activeTreningId || 0}
        onFinishWorkout={async (trajanjeSekunde) => {
          console.log(`Trening končan! ID: ${activeTreningId}, Čas: ${trajanjeSekunde}s`);
          
          // TODO: post trening end
          
          setScreen('home');
          setActiveTreningId(null);
        }}
      />
    );
  }

  return (
    <HomeScreen
      user={auth.user}
      onGoToProfile={() => setScreen('profile')}
      onStartWorkout={async (sport) => {
        console.log(`Zagon aktivnosti v bazi za šport: ${sport}`);
        
        // TODO: post trening start
        const simuliranIdIzBaze = Math.floor(Math.random() * 10000);
        
        setSelectedSport(sport);
        setActiveTreningId(simuliranIdIzBaze);
        setScreen('workout');
      }}
    />
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    backgroundColor: '#111827',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: 'white',
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