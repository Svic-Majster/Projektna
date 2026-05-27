import {
    Pressable,
    StyleSheet,
    Text,
    View,
} from 'react-native';

type ProfileScreenProps = {
    user: {
        ime: string;
        priimek: string;
        email: string;
        username: string;
    };
    onGoBack: () => void;
    onLogout: () => void;
};

export default function ProfileScreen({
    user,
    onGoBack,
    onLogout,
}: ProfileScreenProps) {
    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Pressable onPress={onGoBack}>
                    <Text style={styles.backButton}>←</Text>
                </Pressable>

                <Text style={styles.headerTitle}>Profil</Text>

                <View style={styles.placeholder} />
            </View>

            <View style={styles.content}>
                <View style={styles.avatar}>
                    <Text style={styles.avatarText}>
                        {user.ime.charAt(0)}
                    </Text>
                </View>

                <Text style={styles.name}>
                    {user.ime} {user.priimek}
                </Text>

                <Text style={styles.username}>
                    @{user.username}
                </Text>

                <View style={styles.infoCard}>
                    <Text style={styles.label}>Email</Text>
                    <Text style={styles.value}>{user.email}</Text>
                </View>

                <View style={styles.infoCard}>
                    <Text style={styles.label}>Uporabniško ime</Text>
                    <Text style={styles.value}>{user.username}</Text>
                </View>
                <Pressable
                    style={styles.faceButton}
                    onPress={() => { }}
                >
                    <Text style={styles.faceButtonText}>Dodaj Face ID</Text>
                </Pressable>

                <Pressable
                    style={styles.logoutButton}
                    onPress={onLogout}
                >
                    <Text style={styles.logoutText}>Odjava</Text>
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
    backButton: {
        color: 'white',
        fontSize: 28,
        fontWeight: '700',
    },
    headerTitle: {
        color: 'white',
        fontSize: 22,
        fontWeight: '700',
    },
    placeholder: {
        width: 28,
    },
    content: {
        flex: 1,
        alignItems: 'center',
        marginTop: 40,
    },
    avatar: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: '#2563EB',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
    },
    avatarText: {
        color: 'white',
        fontSize: 40,
        fontWeight: '700',
    },
    name: {
        color: 'white',
        fontSize: 28,
        fontWeight: '700',
    },
    username: {
        color: '#9CA3AF',
        fontSize: 16,
        marginTop: 6,
        marginBottom: 32,
    },
    infoCard: {
        width: '100%',
        backgroundColor: '#1F2937',
        padding: 18,
        borderRadius: 16,
        marginBottom: 16,
    },
    label: {
        color: '#9CA3AF',
        fontSize: 14,
        marginBottom: 6,
    },
    value: {
        color: 'white',
        fontSize: 18,
        fontWeight: '600',
    },
    logoutButton: {
        marginTop: 24,
        width: '100%',
        backgroundColor: '#DC2626',
        paddingVertical: 16,
        borderRadius: 16,
        alignItems: 'center',
    },
    logoutText: {
        color: 'white',
        fontSize: 18,
        fontWeight: '700',
    },

    faceButton: {
        marginTop: 24,
        width: '100%',
        backgroundColor: '#2563EB',
        paddingVertical: 16,
        borderRadius: 16,
        alignItems: 'center',
    },
    faceButtonText: {
        color: 'white',
        fontSize: 18,
        fontWeight: '700',
    },
});