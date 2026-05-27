import {
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
};

export default function HomeScreen({
    user,
    onGoToProfile,
}: HomeScreenProps) {
    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.logo}>SvicMajster</Text>

                <Pressable onPress={onGoToProfile}>
                    <Text style={styles.profile}>👤</Text>
                </Pressable>
            </View>

            <View style={styles.content}>
                <Text style={styles.welcome}>Pozdravljen, {user.ime}!</Text>
                <Text style={styles.subtitle}>Pripravljen na nov trening?</Text>

                <View style={styles.card}>
                    <Text style={styles.cardTitle}>Današnji cilj</Text>
                    <Text style={styles.cardText}>
                        Začni trening in spremljaj svojo aktivnost.
                    </Text>
                </View>

                <View style={styles.card}>
                    <Text style={styles.cardTitle}>Leaderboard</Text>
                    <Text style={styles.cardText}>
                        Tvoja lestvica bo prikazana tukaj.
                    </Text>
                </View>

                <Pressable style={styles.startButton}>
                    <Text style={styles.startButtonText}>
                        Začni trening
                    </Text>
                </Pressable>
            </View>
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
        marginTop: 32,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    logo: {
        color: 'white',
        fontSize: 24,
        fontWeight: '700',
    },
    profile: {
        fontSize: 28,
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
        width: '80%',
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
});