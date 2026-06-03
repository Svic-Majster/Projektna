import React, { useState } from 'react';
import {
    Modal,
    Pressable,
    StyleSheet,
    Text,
    View,
} from 'react-native';

type HomeScreenProps = {
    user: {
        ime: string;
        priimek: string;
        email: string;
        username: string;
    };
    onGoToProfile: () => void;
    onStartWorkout?: (type: 'tek' | 'kolesarjenje' | 'hoja') => void;
};

export default function HomeScreen({
    user,
    onGoToProfile,
    onStartWorkout,
}: HomeScreenProps) {
    const [menuVisible, setMenuVisible] = useState(false);

    const handleSelectSport = (sport: 'tek' | 'kolesarjenje' | 'hoja') => {
        setMenuVisible(false);
        console.log(`Izbran šport: ${sport}`);
        
        if (onStartWorkout) {
            onStartWorkout(sport);
        }
    };

    const prvaCrka = user.ime ? user.ime.charAt(0).toUpperCase() : 'U';

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.logo}>SvicMajster</Text>

                <Pressable 
                    style={({ pressed }) => [
                        styles.profileAvatar, 
                        pressed && styles.profileAvatarPressed
                    ]} 
                    onPress={onGoToProfile}
                >
                    <Text style={styles.profileAvatarText}>{prvaCrka}</Text>
                </Pressable>
            </View>

            <View style={styles.content}>
                <Text style={styles.welcome}>Pozdravljen, {user.ime}!</Text>
                <Text style={styles.subtitle}>Pripravljen na nov trening?</Text>

                <View style={styles.card}>
                    <Text style={styles.cardTitle}>Leaderboard</Text>
                    <Text style={styles.cardText}>
                        Tvoja lestvica bo prikazana tukaj.
                    </Text>
                </View>
                
                <Pressable 
                    style={styles.startButton}
                    onPress={() => setMenuVisible(true)}
                >
                    <Text style={styles.startButtonText}>
                        Začni trening
                    </Text>
                </Pressable>
            </View>

            <Modal
                animationType="fade"
                transparent={true}
                visible={menuVisible}
                onRequestClose={() => setMenuVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Izberi vrsto aktivnosti</Text>
                        
                        <Pressable 
                            style={styles.sportButton} 
                            onPress={() => handleSelectSport('tek')}
                        >
                            <Text style={styles.sportButtonText}>Tek</Text>
                        </Pressable>

                        <Pressable 
                            style={styles.sportButton} 
                            onPress={() => handleSelectSport('kolesarjenje')}
                        >
                            <Text style={styles.sportButtonText}>Kolesarjenje</Text>
                        </Pressable>

                        <Pressable 
                            style={styles.sportButton} 
                            onPress={() => handleSelectSport('hoja')}
                        >
                            <Text style={styles.sportButtonText}>Hoja</Text>
                        </Pressable>

                        <Pressable 
                            style={styles.closeButton} 
                            onPress={() => setMenuVisible(false)}
                        >
                            <Text style={styles.closeButtonText}>Prekliči</Text>
                        </Pressable>
                    </View>
                </View>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#111827',
        padding: 24,
    },
    header: {
        marginTop: 40,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    logo: {
        color: 'white',
        fontSize: 24,
        fontWeight: '800',
        letterSpacing: 0.5,
    },
    profileAvatar: {
        width: 42,
        height: 42,
        borderRadius: 21,
        backgroundColor: '#2563EB',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1.5,
        borderColor: '#3b82f6',
        shadowColor: '#2563EB',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 3,
    },
    profileAvatarPressed: {
        opacity: 0.85,
        backgroundColor: '#1d4ed8',
    },
    profileAvatarText: {
        color: 'white',
        fontSize: 16,
        fontWeight: '700',
    },
    content: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    welcome: {
        color: 'white',
        fontSize: 28,
        fontWeight: '700',
    },
    subtitle: {
        color: '#9CA3AF',
        fontSize: 16,
        marginTop: 8,
        marginBottom: 24,
    },
    startButton: {
        marginTop: 12,
        marginBottom: 16,
        width: '100%',
        backgroundColor: '#2563EB',
        paddingVertical: 16,
        borderRadius: 16,
        alignItems: 'center',
    },
    startButtonText: {
        color: 'white',
        fontSize: 18,
        fontWeight: '700',
    },
    card: {
        backgroundColor: '#1F2937',
        padding: 18,
        borderRadius: 16,
        marginBottom: 16,
        width: '100%',
    },
    cardTitle: {
        color: 'white',
        fontSize: 18,
        fontWeight: '700',
        marginBottom: 6,
    },
    cardText: {
        color: '#D1D5DB',
        fontSize: 14,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.75)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 24,
    },
    modalContent: {
        backgroundColor: '#1F2937',
        borderRadius: 24,
        padding: 24,
        width: '100%',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#374151',
    },
    modalTitle: {
        color: 'white',
        fontSize: 20,
        fontWeight: '700',
        marginBottom: 20,
    },
    sportButton: {
        width: '100%',
        paddingVertical: 16,
        borderRadius: 14,
        backgroundColor: '#2563EB',
        alignItems: 'center',
        marginBottom: 12,
    },
    sportButtonText: {
        color: 'white',
        fontSize: 18,
        fontWeight: '600',
    },
    closeButton: {
        marginTop: 8,
        paddingVertical: 12,
    },
    closeButtonText: {
        color: '#9CA3AF',
        fontSize: 16,
        fontWeight: '500',
    },
});