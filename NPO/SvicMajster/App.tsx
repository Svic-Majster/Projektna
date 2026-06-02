import { useEffect, useState, useRef } from 'react';
import { ActivityIndicator, StyleSheet, Text, View, Alert } from 'react-native';
import { useAuth } from './src/hooks/useAuth';
import LoginScreen from './src/screens/LoginScreen';
import RegisterScreen from './src/screens/RegisterScreen';
import HomeScreen from './src/screens/HomeScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import WorkoutScreen from './src/screens/WorkoutScreen';
// @ts-ignore
import Paho from 'paho-mqtt';

const MQTT_HOST = process.env.EXPO_PUBLIC_MQTT_HOST || '127.0.0.1';
const MQTT_PORT = Number(process.env.EXPO_PUBLIC_MQTT_PORT) || 9001;
const MQTT_USER = process.env.EXPO_PUBLIC_MQTT_USER || '';
const MQTT_PASSWORD = process.env.EXPO_PUBLIC_MQTT_PASSWORD || '';

export default function App() {
  const auth = useAuth();
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [screen, setScreen] = useState<'home' | 'profile' | 'workout'>('home');
  
  const [selectedSport, setSelectedSport] = useState<'tek' | 'kolesarjenje' | 'hoja'>('tek');
  
  const mqttClientRef = useRef<Paho.Client | null>(null);
  const [mqttConnected, setMqttConnected] = useState(false);

  useEffect(() => {
    if (!auth.user) return;

    const clientId = `SvicMajsterApp_${Math.random().toString(16).substr(2, 8)}`;
    const client = new Paho.Client(MQTT_HOST, MQTT_PORT, clientId);
    mqttClientRef.current = client;

    client.connect({
      userName: MQTT_USER,
      password: MQTT_PASSWORD,
      onSuccess: () => {
        console.log('App.tsx: Telefon uspešno povezan na Mosquitto!');
        setMqttConnected(true);
      },
      onFailure: (err: any) => {
        console.error('App.tsx: MQTT povezava je spodletela:', err);
        setMqttConnected(false);
      },
      useSSL: false,
      reconnect: true
    });

    return () => {
      if (client.isConnected()) {
        client.disconnect();
      }
    };
  }, [auth.user]);

  if (auth.loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#2563EB" />
        <Text style={styles.loadingText}>Nalagam uporabnika...</Text>
      </View>
    );
  }

  if (!auth.user) {
    return mode === 'login' ? (
      <LoginScreen onSubmit={auth.login} onGoToRegister={() => setMode('register')} />
    ) : (
      <RegisterScreen onSubmit={auth.register} onGoToLogin={() => setMode('login')} />
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
    const trenutniUporabnikId = auth.user?.id || (auth.user as any)?.uporabnik_id;

    return (
      <WorkoutScreen
        sport={selectedSport}
        uporabnikId={trenutniUporabnikId}
        mqttClient={mqttClientRef.current}
        onFinishWorkout={(trajanjeSekunde) => {
          if (mqttClientRef.current && mqttClientRef.current.isConnected()) {
            const payload = JSON.stringify({ uporabnik_id: trenutniUporabnikId });
            const message = new Paho.Message(payload);
            message.destinationName = 'app/workouts/stop';
            mqttClientRef.current.send(message);

            console.log('MQTT stop signal poslan za uporabnika:', payload);
          } else {
            Alert.alert("Opozorilo", "Trening se bo zaključil lokalno, ker MQTT strežnik ni dosegljiv.");
          }

          Alert.alert("Trening uspešno končan!", "Podatki so poslani na obdelavo.");
          setScreen('home');
        }}
      />
    );
  }

  return (
    <HomeScreen
      user={auth.user}
      onGoToProfile={() => setScreen('profile')}
      onStartWorkout={(sport) => {
        if (!mqttConnected || !mqttClientRef.current?.isConnected()) {
          Alert.alert("Napaka", "MQTT strežnik trenutno ni dosegljiv. Preveri povezavo.");
          return;
        }

        const uporabnik_id = auth.user?.id || (auth.user as any)?.uporabnik_id;

        if (!uporabnik_id) {
          Alert.alert("Napaka", "Uporabnik nima veljavnega ID-ja.");
          return;
        }

        const payload = JSON.stringify({
          uporabnik_id: uporabnik_id,
          vrsta_workouta: sport,
        });

        const message = new Paho.Message(payload);
        message.destinationName = 'app/workouts/start';
        mqttClientRef.current.send(message);
        console.log('MQTT start signal poslan:', payload);

        setSelectedSport(sport);
        setScreen('workout');
      }}
    />
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24, backgroundColor: '#111827' },
  loadingText: { marginTop: 12, fontSize: 16, color: 'white' },
});