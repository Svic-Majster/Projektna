import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, Pressable } from 'react-native';

type WorkoutScreenProps = {
    sport: 'tek' | 'kolesarjenje' | 'hoja';
    treningId: number;
    onFinishWorkout: (trajanjeSekunde: number) => void;
};

export default function WorkoutScreen({ sport, treningId, onFinishWorkout }: WorkoutScreenProps) {
    const [seconds, setSeconds] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setSeconds((prev) => prev + 1);
        }, 1000);

        return () => clearInterval(interval);
    }, []);

    const formatTime = (totalSeconds: number) => {
        const hrs = Math.floor(totalSeconds / 3600);
        const mins = Math.floor((totalSeconds % 3600) / 60);
        const secs = totalSeconds % 60;
        return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.sportTitle}>
                    {sport.toUpperCase()}
                </Text>
                <Text style={styles.dbInfo}>ID Treninga v bazi: #{treningId}</Text>
            </View>

            <View style={styles.timerContainer}>
                <Text style={styles.timerLabel}>ČAS VADBE</Text>
                <Text style={styles.timerText}>{formatTime(seconds)}</Text>
            </View>

            {/* TODO: gps razdalija pa other info*/}
            <View style={styles.statsContainer}>
                <View style={styles.statBox}>
                    <Text style={styles.statLabel}>Razdalja</Text>
                    <Text style={styles.statValue}>0.00 km</Text>
                </View>
            </View>

            <Pressable 
                style={styles.finishButton} 
                onPress={() => onFinishWorkout(seconds)}
            >
                <Text style={styles.finishButtonText}>Zaključi trening</Text>
            </Pressable>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#111827',
        padding: 24,
        justifyContent: 'space-between',
    },
    header: {
        marginTop: 40,
        alignItems: 'center',
    },
    sportTitle: {
        color: 'white',
        fontSize: 28,
        fontWeight: '800',
        letterSpacing: 1,
    },
    dbInfo: {
        color: '#6B7280',
        fontSize: 14,
        marginTop: 4,
    },
    timerContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#1F2937',
        paddingVertical: 40,
        borderRadius: 32,
        borderWidth: 1,
        borderColor: '#374151',
    },
    timerLabel: {
        color: '#9CA3AF',
        fontSize: 14,
        fontWeight: '600',
        letterSpacing: 2,
        marginBottom: 8,
    },
    timerText: {
        color: 'white',
        fontSize: 54,
        fontWeight: 'bold',
        fontVariant: ['tabular-nums'],
    },
    statsContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginBottom: 20,
    },
    statBox: {
        alignItems: 'center',
    },
    statLabel: {
        color: '#9CA3AF',
        fontSize: 16,
    },
    statValue: {
        color: 'white',
        fontSize: 24,
        fontWeight: '700',
        marginTop: 4,
    },
    finishButton: {
        backgroundColor: '#EF4444',
        paddingVertical: 18,
        borderRadius: 16,
        alignItems: 'center',
        marginBottom: 20,
        shadowColor: '#EF4444',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 6,
        elevation: 5,
    },
    finishButtonText: {
        color: 'white',
        fontSize: 18,
        fontWeight: '700',
    },
});