import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, Pressable } from 'react-native';
import * as Location from 'expo-location';
// @ts-ignore
import Paho from 'paho-mqtt';

type WorkoutScreenProps = {
    sport: 'tek' | 'kolesarjenje' | 'hoja';
    uporabnikId: number;
    mqttClient: Paho.Client | null;
    onFinishWorkout: (trajanjeSekunde: number) => void;
};

export default function WorkoutScreen({ sport, uporabnikId, mqttClient, onFinishWorkout }: WorkoutScreenProps) {
    const [seconds, setSeconds] = useState(0);
    const [location, setLocation] = useState<Location.LocationObject | null>(null);
    const [gpsError, setGpsError] = useState<string | null>(null);

    useEffect(() => {
        const interval = setInterval(() => {
            setSeconds((prev) => prev + 1);
        }, 1000);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        let locationSubscription: Location.LocationSubscription | null = null;

        async function startLocationTracking() {
            let { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                setGpsError('Dovoljenje za lokacijo je zavrnjeno.');
                return;
            }

            locationSubscription = await Location.watchPositionAsync(
                {
                    accuracy: Location.Accuracy.High,
                    timeInterval: 3000, 
                    distanceInterval: 1,  
                },
                (newLocation) => {
                    setLocation(newLocation);
                    
                    if (mqttClient && mqttClient.isConnected()) {
                        const payload = JSON.stringify({
                            uporabnik_id: uporabnikId,
                            latitude: newLocation.coords.latitude,
                            longitude: newLocation.coords.longitude,
                            hitrost: newLocation.coords.speed || 0
                        });

                        const message = new Paho.Message(payload);
                        message.destinationName = 'app/workouts/location';
                        mqttClient.send(message);
                        console.log('MQTT lokacija poslana:', payload);
                    }
                }
            );
        }

        startLocationTracking();

        return () => {
            if (locationSubscription) {
                locationSubscription.remove();
            }
        };
    }, [uporabnikId, mqttClient]);

    const formatTime = (totalSeconds: number) => {
        const hrs = Math.floor(totalSeconds / 3600);
        const mins = Math.floor((totalSeconds % 3600) / 60);
        const secs = totalSeconds % 60;
        return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.sportTitle}>{sport.toUpperCase()}</Text>
                <Text style={styles.dbInfo}>Uporabnik ID: #{uporabnikId}</Text>
            </View>

            <View style={styles.timerContainer}>
                <Text style={styles.timerLabel}>ČAS VADBE</Text>
                <Text style={styles.timerText}>{formatTime(seconds)}</Text>
            </View>

            <View style={styles.statsContainer}>
                <View style={styles.statBox}>
                    <Text style={styles.statLabel}>Spremljanje GPS lokacije v živo</Text>
                    {location ? (
                        <Text style={styles.statValue}>
                            Lat: {location.coords.latitude.toFixed(5)}, Lng: {location.coords.longitude.toFixed(5)}
                        </Text>
                    ) : (
                        <Text style={styles.statValueLoading}>
                            {gpsError ? gpsError : "Pridobivam GPS in sinhroniziram z bazo..."}
                        </Text>
                    )}
                </View>
            </View>

            <Pressable style={styles.finishButton} onPress={() => onFinishWorkout(seconds)}>
                <Text style={styles.finishButtonText}>Zaključi trening</Text>
            </Pressable>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#111827', padding: 24, justifyContent: 'space-between' },
    header: { marginTop: 40, alignItems: 'center' },
    sportTitle: { color: 'white', fontSize: 28, fontWeight: '800' },
    dbInfo: { color: '#6B7280', fontSize: 14, marginTop: 4 },
    timerContainer: { alignItems: 'center', justifyContent: 'center', backgroundColor: '#1F2937', paddingVertical: 40, borderRadius: 32 },
    timerLabel: { color: '#9CA3AF', fontSize: 14, fontWeight: '600', letterSpacing: 2, marginBottom: 8 },
    timerText: { color: 'white', fontSize: 54, fontWeight: 'bold', fontVariant: ['tabular-nums'] },
    statsContainer: { flexDirection: 'row', justifyContent: 'center', marginBottom: 20 },
    statBox: { alignItems: 'center' },
    statLabel: { color: '#9CA3AF', fontSize: 16 },
    statValue: { color: '#10B981', fontSize: 16, fontWeight: '700', marginTop: 4 },
    statValueLoading: { color: '#9CA3AF', fontSize: 14, marginTop: 4 },
    finishButton: { backgroundColor: '#EF4444', paddingVertical: 18, borderRadius: 16, alignItems: 'center', marginBottom: 20 },
    finishButtonText: { color: 'white', fontSize: 18, fontWeight: '700' },
});