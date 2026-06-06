import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, Text, View, Pressable, Modal, Alert } from 'react-native'; // DODANO: Alert
import * as Location from 'expo-location';
// @ts-ignore
import Paho from 'paho-mqtt';

type WorkoutScreenProps = {
    sport: 'tek' | 'kolesarjenje' | 'hoja';
    uporabnikId: number;
    mqttClient: Paho.Client | null;
    onFinishWorkout: (trajanjeSekunde: number, razdaljaKm: number) => void;
};

const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371;
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos((lat1 * Math.PI) / 180) *
            Math.cos((lat2 * Math.PI) / 180) *
            Math.sin(dLon / 2) *
            Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
};

export default function WorkoutScreen({ sport, uporabnikId, mqttClient, onFinishWorkout }: WorkoutScreenProps) {
    const [seconds, setSeconds] = useState(0);
    const [location, setLocation] = useState<Location.LocationObject | null>(null);
    const [gpsError, setGpsError] = useState<string | null>(null);
    const [skupnaRazdaljaKm, setSkupnaRazdaljaKm] = useState<number>(0);
    const zadnjaKoord = useRef<{ latitude: number; longitude: number } | null>(null);

    const [isCountingDown, setIsCountingDown] = useState(true);
    const [countdownText, setCountdownText] = useState('3');

    useEffect(() => {
        if (!isCountingDown) return;

        const timer = setTimeout(() => {
            if (countdownText === '3') {
                setCountdownText('2');
            } else if (countdownText === '2') {
                setCountdownText('1');
            } else if (countdownText === '1') {
                setCountdownText('GO!');
            } else if (countdownText === 'GO!') {
                setIsCountingDown(false);
            }
        }, 1000);

        return () => clearTimeout(timer);
    }, [isCountingDown, countdownText]);

    useEffect(() => {
        if (isCountingDown) return;

        const interval = setInterval(() => {
            setSeconds((prev) => prev + 1);
        }, 1000);
        return () => clearInterval(interval);
    }, [isCountingDown]);

    useEffect(() => {
        if (isCountingDown) return;
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
                    const { latitude, longitude, speed } = newLocation.coords;

                    if (zadnjaKoord.current) {
                        const premik = calculateDistance(
                            zadnjaKoord.current.latitude,
                            zadnjaKoord.current.longitude,
                            latitude,
                            longitude
                        );
                        setSkupnaRazdaljaKm((prev) => prev + premik);
                    }

                    zadnjaKoord.current = { latitude, longitude };
                    
                    if (mqttClient && mqttClient.isConnected()) {
                        const payload = JSON.stringify({
                            uporabnik_id: uporabnikId,
                            latitude: latitude,
                            longitude: longitude,
                            hitrost: speed || 0
                        });

                        const message = new Paho.Message(payload);
                        message.destinationName = 'app/workouts/location';
                        mqttClient.send(message);
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
    }, [uporabnikId, mqttClient, isCountingDown]);

    const formatTime = (totalSeconds: number) => {
        const hrs = Math.floor(totalSeconds / 3600);
        const mins = Math.floor((totalSeconds % 3600) / 60);
        const secs = totalSeconds % 60;
        return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const formatRazdalja = (km: number) => {
        const metri = km * 1000;
        if (metri < 1000) {
            return `${Math.round(metri)} m`;
        }
        return `${km.toFixed(2)} km`;
    };

    const handleFinishPress = () => {
        Alert.alert(
            "Zaključek treninga",
            "Ali si prepričan, da želiš zaključiti trening?",
            [
                { text: "Prekliči", style: "cancel" },
                { 
                    text: "Da", 
                    style: "destructive",
                    onPress: () => onFinishWorkout(seconds, parseFloat(skupnaRazdaljaKm.toFixed(4))) 
                }
            ]
        );
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

            <View style={styles.distanceContainer}>
                <Text style={styles.distanceLabel}>OPRAVLJENA RAZDALJA</Text>
                <Text style={styles.distanceText}>{formatRazdalja(skupnaRazdaljaKm)}</Text>
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

            <Pressable 
                style={styles.finishButton} 
                onPress={handleFinishPress}
            >
                <Text style={styles.finishButtonText}>Zaključi trening</Text>
            </Pressable>

            <Modal visible={isCountingDown} transparent={true} animationType="fade">
                <View style={styles.countdownOverlay}>
                    <Text style={[
                        styles.countdownText,
                        countdownText === 'GO!' && styles.countdownGoText
                    ]}>
                        {countdownText}
                    </Text>
                </View>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#111827', padding: 24, justifyContent: 'space-between' },
    header: { marginTop: 40, alignItems: 'center' },
    sportTitle: { color: 'white', fontSize: 28, fontWeight: '800' },
    dbInfo: { color: '#6B7280', fontSize: 14, marginTop: 4 },
    timerContainer: { alignItems: 'center', justifyContent: 'center', backgroundColor: '#1F2937', paddingVertical: 30, borderRadius: 32 },
    timerLabel: { color: '#9CA3AF', fontSize: 14, fontWeight: '600', letterSpacing: 2, marginBottom: 8 },
    timerText: { color: 'white', fontSize: 54, fontWeight: 'bold', fontVariant: ['tabular-nums'] },
    distanceContainer: { alignItems: 'center', justifyContent: 'center', backgroundColor: '#1F2937', paddingVertical: 24, borderRadius: 32, marginTop: -10 },
    distanceLabel: { color: '#9CA3AF', fontSize: 14, fontWeight: '600', letterSpacing: 2, marginBottom: 4 },
    distanceText: { color: '#10B981', fontSize: 42, fontWeight: 'bold' },
    statsContainer: { flexDirection: 'row', justifyContent: 'center', marginBottom: 10 },
    statBox: { alignItems: 'center' },
    statLabel: { color: '#9CA3AF', fontSize: 14 },
    statValue: { color: '#6B7280', fontSize: 14, fontWeight: '600', marginTop: 4 },
    statValueLoading: { color: '#9CA3AF', fontSize: 14, marginTop: 4 },
    finishButton: { backgroundColor: '#EF4444', paddingVertical: 18, borderRadius: 16, alignItems: 'center', marginBottom: 20 },
    finishButtonText: { color: 'white', fontSize: 18, fontWeight: '700' },
    countdownOverlay: { flex: 1, backgroundColor: 'rgba(17, 24, 39, 0.95)', justifyContent: 'center', alignItems: 'center' },
    countdownText: { color: 'white', fontSize: 90, fontWeight: '900' },
    countdownGoText: { color: '#10B981' }
});