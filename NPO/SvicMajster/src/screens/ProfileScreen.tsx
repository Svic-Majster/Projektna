import { useState } from 'react';
import {
    Pressable,
    StyleSheet,
    ScrollView,
    Text,
    TextInput,
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
    const [ime, setIme] = useState(user.ime);
    const [priimek, setPriimek] = useState(user.priimek);
    const [username, setUsername] = useState(user.username);
    const [message, setMessage] = useState('');

    const handleSave = () => {
        setMessage('Shranjevanje profila bo dodano v naslednji fazi.');
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Pressable onPress={onGoBack}>
                    <Text style={styles.backButton}>←</Text>
                </Pressable>

                <Text style={styles.headerTitle}>Profil</Text>

                <View style={styles.placeholder} />
            </View>

            <ScrollView
                style={styles.content}
                contentContainerStyle={styles.contentContainer}
                showsVerticalScrollIndicator={false}
            >
                <View style={styles.avatar}>
                    <Text style={styles.avatarText}>
                        {ime.charAt(0).toUpperCase()}
                    </Text>
                </View>

                <Text style={styles.name}>
                    {ime} {priimek}
                </Text>

                <Text style={styles.username}>@{username}</Text>

                <View style={styles.sectionCard}>
                    <Text style={styles.sectionTitle}>Podatki profila</Text>
                    <Text style={styles.sectionSubtitle}>Uredi svoje podatke</Text>

                    <View style={styles.fieldGroup}>
                        <Text style={styles.label}>Ime</Text>
                        <TextInput
                            style={styles.input}
                            value={ime}
                            onChangeText={setIme}
                            placeholder="Ime"
                            placeholderTextColor="#6B7280"
                        />
                    </View>

                    <View style={styles.fieldGroup}>
                        <Text style={styles.label}>Priimek</Text>
                        <TextInput
                            style={styles.input}
                            value={priimek}
                            onChangeText={setPriimek}
                            placeholder="Priimek"
                            placeholderTextColor="#6B7280"
                        />
                    </View>

                    <View style={styles.fieldGroup}>
                        <Text style={styles.label}>Uporabniško ime</Text>
                        <TextInput
                            style={styles.input}
                            value={username}
                            onChangeText={setUsername}
                            placeholder="Uporabniško ime"
                            placeholderTextColor="#6B7280"
                            autoCapitalize="none"
                        />
                    </View>
                </View>

                <View style={styles.emailCard}>
                    <Text style={styles.label}>E-pošta</Text>
                    <Text style={styles.emailValue}>{user.email}</Text>
                    <Text style={styles.emailHint}>
                        E-pošte trenutno ni mogoče spremeniti.
                    </Text>
                </View>

                <Pressable style={styles.saveButton} onPress={handleSave}>
                    <Text style={styles.primaryButtonText}>Shrani spremembe</Text>
                </Pressable>

                <Pressable style={styles.faceButton} onPress={() => { }}>
                    <Text style={styles.secondaryButtonText}>Dodaj Face ID</Text>
                </Pressable>

                <Pressable style={styles.logoutButton} onPress={onLogout}>
                    <Text style={styles.primaryButtonText}>Odjava</Text>
                </Pressable>

                {message ? <Text style={styles.message}>{message}</Text> : null}
            </ScrollView>
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
        fontSize: 36,
        fontWeight: '700',
    },
    headerTitle: {
        color: 'white',
        fontSize: 28,
        fontWeight: '700',
    },
    placeholder: {
        width: 36,
    },
    content: {
        flex: 1,
        marginTop: 36,
    },
    contentContainer: {
        alignItems: 'center',
        paddingBottom: 32,
    },
    avatar: {
        width: 112,
        height: 112,
        borderRadius: 56,
        backgroundColor: '#2563EB',
        justifyContent: 'center',
        alignItems: 'center',
    },
    avatarText: {
        color: 'white',
        fontSize: 48,
        fontWeight: '700',
    },
    name: {
        color: 'white',
        fontSize: 30,
        fontWeight: '700',
        marginTop: 18,
    },
    username: {
        color: '#9CA3AF',
        fontSize: 18,
        marginTop: 6,
        marginBottom: 28,
    },
    sectionCard: {
        width: '100%',
        backgroundColor: '#1F2937',
        borderRadius: 18,
        padding: 18,
        marginBottom: 16,
    },
    sectionTitle: {
        color: 'white',
        fontSize: 22,
        fontWeight: '700',
    },
    sectionSubtitle: {
        color: '#9CA3AF',
        fontSize: 16,
        marginTop: 6,
        marginBottom: 18,
    },
    fieldGroup: {
        marginBottom: 16,
    },
    label: {
        color: '#9CA3AF',
        fontSize: 15,
        marginBottom: 8,
    },
    input: {
        color: 'white',
        fontSize: 18,
        fontWeight: '600',
        backgroundColor: '#111827',
        borderWidth: 1,
        borderColor: '#374151',
        borderRadius: 14,
        paddingHorizontal: 16,
        paddingVertical: 12,
    },
    emailCard: {
        width: '100%',
        backgroundColor: '#1F2937',
        borderRadius: 18,
        padding: 18,
        marginBottom: 18,
    },
    emailValue: {
        color: 'white',
        fontSize: 18,
        fontWeight: '600',
    },
    emailHint: {
        color: '#9CA3AF',
        fontSize: 14,
        marginTop: 8,
    },
    saveButton: {
        width: '100%',
        backgroundColor: '#2563EB',
        paddingVertical: 16,
        borderRadius: 16,
        alignItems: 'center',
        marginBottom: 12,
    },
    faceButton: {
        width: '100%',
        backgroundColor: '#1F2937',
        paddingVertical: 16,
        borderRadius: 16,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#374151',
        marginBottom: 12,
    },
    logoutButton: {
        width: '100%',
        backgroundColor: '#DC2626',
        paddingVertical: 16,
        borderRadius: 16,
        alignItems: 'center',
    },
    primaryButtonText: {
        color: 'white',
        fontSize: 18,
        fontWeight: '700',
    },
    secondaryButtonText: {
        color: 'white',
        fontSize: 18,
        fontWeight: '700',
    },
    message: {
        color: '#9CA3AF',
        fontSize: 14,
        marginTop: 12,
        textAlign: 'center',
    },
});