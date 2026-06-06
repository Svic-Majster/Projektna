import React, { useState, useEffect } from 'react';
import {
    View, Text, StyleSheet, Pressable,
    ScrollView, ActivityIndicator
} from 'react-native';
import { getUserGroups, getGroupLeaderboard } from '../lib/api';

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
    const [groups, setGroups] = useState<any[]>([]);
    const [selectedGroup, setSelectedGroup] = useState<any>(null);
    const [leaderboard, setLeaderboard] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');

    useEffect(() => {
        loadGroups();
    }, []);

    async function loadGroups() {
        setLoading(true);
        try {
            const data = await getUserGroups(user.id);
            setGroups(data);
            if (data.length > 0) {
                setSelectedGroup(data[0]);
                await loadLeaderboard(data[0].id);
            }
        } catch (err: any) {
            setMessage(err.message);
        } finally {
            setLoading(false);
        }
    }

    async function loadLeaderboard(groupId: number) {
        setLoading(true);
        try {
            const data = await getGroupLeaderboard(groupId);
            setLeaderboard(data);
        } catch (err: any) {
            setMessage(err.message);
        } finally {
            setLoading(false);
        }
    }

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <Pressable onPress={onGoBack} style={styles.backBtn}>
                    <Text style={styles.backBtnText}>← Nazaj</Text>
                </Pressable>
                <Text style={styles.title}>Skupine</Text>
                <View style={{ width: 70 }} />
            </View>

            {/* Tabs */}
            <View style={styles.tabs}>
                {(['leaderboard', 'join', 'create'] as const).map((t) => (
                    <Pressable
                        key={t}
                        style={[styles.tab, tab === t && styles.tabActive]}
                        onPress={() => setTab(t)}
                    >
                        <Text style={[styles.tabText, tab === t && styles.tabTextActive]}>
                            {t === 'leaderboard' ? 'Lestvica' : t === 'join' ? 'Pridruži se' : 'Ustvari'}
                        </Text>
                    </Pressable>
                ))}
            </View>

            {/* Message */}
            {message ? <Text style={styles.message}>{message}</Text> : null}

            {/* Content */}
            {loading ? (
                <ActivityIndicator color="#2563EB" style={{ marginTop: 48 }} />
            ) : (
                <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>

                    {/* LESTVICA TAB */}
                    {tab === 'leaderboard' && (
                        groups.length === 0 ? (
                            <View style={styles.emptyCard}>
                                <Text style={styles.emptyTitle}>Nisi v nobeni skupini</Text>
                                <Text style={styles.emptySubtitle}>Pridruži se ali ustvari skupino.</Text>
                            </View>
                        ) : (
                            <>
                                {/* Izbira skupine */}
                                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.groupPicker}>
                                    {groups.map((g) => (
                                        <Pressable
                                            key={g.id}
                                            style={[styles.groupChip, selectedGroup?.id === g.id && styles.groupChipActive]}
                                            onPress={() => {
                                                setSelectedGroup(g);
                                                loadLeaderboard(g.id);
                                            }}
                                        >
                                            <Text style={[styles.groupChipText, selectedGroup?.id === g.id && styles.groupChipTextActive]}>
                                                {g.ime_skupine}
                                            </Text>
                                        </Pressable>
                                    ))}
                                </ScrollView>

                                {/* Leaderboard card */}
                                {leaderboard && (
                                    <View style={styles.card}>
                                        <View style={styles.cardHeader}>
                                            <Text style={styles.cardTitle}>{leaderboard.ime_skupine}</Text>
                                            <View style={styles.codeBox}>
                                                <Text style={styles.codeLabel}>Koda</Text>
                                                <Text style={styles.codeValue}>{leaderboard.koda_za_pridruzitev}</Text>
                                            </View>
                                        </View>

                                        {leaderboard.clani?.map((clan: any, index: number) => (
                                            <View
                                                key={clan.id}
                                                style={[
                                                    styles.memberRow,
                                                    index === 0 && styles.memberRowFirst,
                                                    clan.id === user.id && styles.memberRowMe,
                                                ]}
                                            >
                                                <Text style={[styles.rank, index === 0 && styles.rankFirst]}>
                                                    #{index + 1}
                                                </Text>
                                                <View style={styles.memberInfo}>
                                                    <View style={styles.memberNameRow}>
                                                        <Text style={styles.memberName}>{clan.ime} {clan.priimek}</Text>
                                                        {leaderboard.owner_id === clan.id && (
                                                            <View style={styles.ownerBadge}>
                                                                <Text style={styles.ownerBadgeText}>OWNER</Text>
                                                            </View>
                                                        )}
                                                        {clan.id === user.id && (
                                                            <View style={styles.meBadge}>
                                                                <Text style={styles.meBadgeText}>TI</Text>
                                                            </View>
                                                        )}
                                                    </View>
                                                    <Text style={styles.memberUsername}>@{clan.username}</Text>
                                                </View>
                                                <Text style={[styles.xp, index === 0 && styles.xpFirst]}>
                                                    {clan.skupni_xp} XP
                                                </Text>
                                            </View>
                                        ))}
                                    </View>
                                )}
                            </>
                        )
                    )}

                    {/* PRIDRUŽI SE TAB */}
                    {tab === 'join' && (
                        <View style={styles.card}>
                            <Text style={styles.cardTitle}>Pridruži se skupini</Text>
                            <Text style={styles.cardSubtitle}>Kmalu bo prikazano tukaj.</Text>
                        </View>
                    )}

                    {/* USTVARI TAB */}
                    {tab === 'create' && (
                        <View style={styles.card}>
                            <Text style={styles.cardTitle}>Ustvari skupino</Text>
                            <Text style={styles.cardSubtitle}>Kmalu bo prikazano tukaj.</Text>
                        </View>
                    )}

                    <View style={{ height: 40 }} />
                </ScrollView>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#111827',
    },
    header: {
        marginTop: 52,
        paddingHorizontal: 24,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    backBtn: {
        paddingVertical: 6,
        paddingRight: 12,
    },
    backBtnText: {
        color: '#9CA3AF',
        fontSize: 16,
    },
    title: {
        color: 'white',
        fontSize: 22,
        fontWeight: '800',
        letterSpacing: 0.3,
    },
    tabs: {
        flexDirection: 'row',
        paddingHorizontal: 24,
        gap: 8,
        marginBottom: 20,
    },
    tab: {
        flex: 1,
        paddingVertical: 10,
        borderRadius: 12,
        backgroundColor: '#1F2937',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#374151',
    },
    tabActive: {
        backgroundColor: '#2563EB',
        borderColor: '#2563EB',
    },
    tabText: {
        color: '#6B7280',
        fontSize: 13,
        fontWeight: '600',
    },
    tabTextActive: {
        color: 'white',
    },
    message: {
        color: '#2563EB',
        textAlign: 'center',
        marginBottom: 12,
        fontSize: 14,
        fontWeight: '500',
        paddingHorizontal: 24,
    },
    content: {
        paddingHorizontal: 24,
    },
    emptyCard: {
        backgroundColor: '#1F2937',
        borderRadius: 20,
        padding: 40,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#374151',
    },
    emptyTitle: {
        color: 'white',
        fontSize: 18,
        fontWeight: '700',
        marginBottom: 8,
    },
    emptySubtitle: {
        color: '#6B7280',
        fontSize: 14,
        textAlign: 'center',
    },
    groupPicker: {
        marginBottom: 16,
    },
    groupChip: {
        paddingHorizontal: 18,
        paddingVertical: 8,
        borderRadius: 20,
        backgroundColor: '#1F2937',
        marginRight: 8,
        borderWidth: 1,
        borderColor: '#374151',
    },
    groupChipActive: {
        backgroundColor: '#2563EB',
        borderColor: '#2563EB',
    },
    groupChipText: {
        color: '#9CA3AF',
        fontSize: 14,
        fontWeight: '600',
    },
    groupChipTextActive: {
        color: 'white',
    },
    card: {
        backgroundColor: '#1F2937',
        borderRadius: 20,
        padding: 20,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: '#374151',
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 16,
    },
    cardTitle: {
        color: 'white',
        fontSize: 20,
        fontWeight: '800',
        flex: 1,
    },
    cardSubtitle: {
        color: '#6B7280',
        fontSize: 14,
        marginTop: 6,
    },
    codeBox: {
        backgroundColor: '#0f1e3a',
        borderRadius: 10,
        paddingHorizontal: 12,
        paddingVertical: 6,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#1e3a5f',
    },
    codeLabel: {
        color: '#6B7280',
        fontSize: 10,
        fontWeight: '600',
        letterSpacing: 0.5,
        marginBottom: 2,
    },
    codeValue: {
        color: '#60A5FA',
        fontSize: 14,
        fontWeight: '800',
        letterSpacing: 1,
    },
    memberRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 14,
        borderBottomWidth: 1,
        borderBottomColor: '#374151',
    },
    memberRowFirst: {
        backgroundColor: '#1e2d1a',
        borderRadius: 12,
        paddingHorizontal: 10,
        borderBottomWidth: 0,
        marginBottom: 4,
    },
    memberRowMe: {
        backgroundColor: '#0f1e3a',
        borderRadius: 12,
        paddingHorizontal: 10,
        borderBottomWidth: 0,
        marginBottom: 4,
    },
    rank: {
        color: '#6B7280',
        fontSize: 15,
        fontWeight: '700',
        width: 36,
    },
    rankFirst: {
        color: '#F59E0B',
    },
    memberInfo: {
        flex: 1,
    },
    memberNameRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        flexWrap: 'wrap',
    },
    memberName: {
        color: 'white',
        fontSize: 15,
        fontWeight: '700',
    },
    memberUsername: {
        color: '#6B7280',
        fontSize: 13,
        marginTop: 2,
    },
    ownerBadge: {
        backgroundColor: '#422006',
        borderRadius: 6,
        paddingHorizontal: 6,
        paddingVertical: 2,
    },
    ownerBadgeText: {
        color: '#F59E0B',
        fontSize: 10,
        fontWeight: '800',
        letterSpacing: 0.5,
    },
    meBadge: {
        backgroundColor: '#1e3a5f',
        borderRadius: 6,
        paddingHorizontal: 6,
        paddingVertical: 2,
    },
    meBadgeText: {
        color: '#60A5FA',
        fontSize: 10,
        fontWeight: '800',
        letterSpacing: 0.5,
    },
    xp: {
        color: '#60A5FA',
        fontSize: 15,
        fontWeight: '700',
    },
    xpFirst: {
        color: '#F59E0B',
    },
});
