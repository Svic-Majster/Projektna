import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';

type GroupsScreenProps = {
    user: {
        id: number;
        ime: string;
        priimek: string;
        username: string;
    };
    onGoBack: () => void;
};

export default function GroupsScreen({ user, onGoBack }: GroupsScreenProps) {
    const [tab, setTab] = useState<'leaderboard' | 'join' | 'create'>('leaderboard');

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Pressable onPress={onGoBack}>
                    <Text style={styles.backButton}>← Nazaj</Text>
                </Pressable>
                <Text style={styles.title}>Skupine</Text>
                <View style={{ width: 60 }} />
            </View>

            <View style={styles.tabs}>
                <Pressable
                    style={[styles.tab, tab === 'leaderboard' && styles.tabActive]}
                    onPress={() => setTab('leaderboard')}
                >
                    <Text style={[styles.tabText, tab === 'leaderboard' && styles.tabTextActive]}>
                        Lestvica
                    </Text>
                </Pressable>
                <Pressable
                    style={[styles.tab, tab === 'join' && styles.tabActive]}
                    onPress={() => setTab('join')}
                >
                    <Text style={[styles.tabText, tab === 'join' && styles.tabTextActive]}>
                        Pridruži se
                    </Text>
                </Pressable>
                <Pressable
                    style={[styles.tab, tab === 'create' && styles.tabActive]}
                    onPress={() => setTab('create')}
                >
                    <Text style={[styles.tabText, tab === 'create' && styles.tabTextActive]}>
                        Ustvari
                    </Text>
                </Pressable>
            </View>

            <ScrollView style={styles.content}>
                {tab === 'leaderboard' && (
                    <View style={styles.card}>
                        <Text style={styles.cardTitle}>Lestvica</Text>
                        <Text style={styles.cardSubtitle}>Kmalu bo prikazana tukaj.</Text>
                    </View>
                )}
                {tab === 'join' && (
                    <View style={styles.card}>
                        <Text style={styles.cardTitle}>Pridruži se skupini</Text>
                        <Text style={styles.cardSubtitle}>Kmalu bo prikazana tukaj.</Text>
                    </View>
                )}
                {tab === 'create' && (
                    <View style={styles.card}>
                        <Text style={styles.cardTitle}>Ustvari skupino</Text>
                        <Text style={styles.cardSubtitle}>Kmalu bo prikazana tukaj.</Text>
                    </View>
                )}
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#111827' },
    header: {
        marginTop: 52,
        paddingHorizontal: 24,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    backButton: { color: '#9CA3AF', fontSize: 16 },
    title: { color: 'white', fontSize: 20, fontWeight: '700' },
    tabs: {
        flexDirection: 'row',
        paddingHorizontal: 24,
        marginBottom: 16,
        gap: 8,
    },
    tab: {
        flex: 1,
        paddingVertical: 10,
        borderRadius: 10,
        backgroundColor: '#1F2937',
        alignItems: 'center',
    },
    tabActive: { backgroundColor: '#2563EB' },
    tabText: { color: '#9CA3AF', fontSize: 13, fontWeight: '600' },
    tabTextActive: { color: 'white' },
    content: { paddingHorizontal: 24 },
    card: {
        backgroundColor: '#1F2937',
        borderRadius: 16,
        padding: 20,
        marginBottom: 16,
    },
    cardTitle: { color: 'white', fontSize: 20, fontWeight: '700', marginBottom: 4 },
    cardSubtitle: { color: '#9CA3AF', fontSize: 14 },
});