import { useState } from 'react';
import {
    Pressable,
    StyleSheet,
    ScrollView,
    Text,
    TextInput,
    View,
} from 'react-native';
import { updateUserProfile } from '../lib/api';

type ProfileScreenProps = {
    user: {
        id: number;
        ime: string;
        priimek: string;
        email: string;
        username: string;
        skupni_xp?: number;

    };
    onGoBack: () => void;
    onLogout: () => void;
    onUpdateUser: (updated: any) => Promise<void>;
};

export default function ProfileScreen({
    user,
    onGoBack,
    onLogout,
    onUpdateUser
}: ProfileScreenProps) {
    const [ime, setIme] = useState(user.ime);
    const [priimek, setPriimek] = useState(user.priimek);
    const [username, setUsername] = useState(user.username);
    const [isSaving, setIsSaving] = useState(false);
    const [message, setMessage] = useState('');
    const [messageType, setMessageType] = useState<'success' | 'error' | 'info'>('info');
    const [original] = useState({ ime: user.ime, priimek: user.priimek, username: user.username });

    const handleSave = async () => {
        if (isSaving) return;

        if (!ime.trim() || !priimek.trim() || !username.trim()) {
            setMessage('Vsa polja morajo biti izpolnjena.');
            setMessageType('error');
            return;
        }

        if (ime === original.ime && priimek === original.priimek && username === original.username) {
            setMessage('Ni sprememb za shraniti.');
            setMessageType('info');
            return;
        }

        setIsSaving(true);
        setMessage('');

        try {
            const updated = await updateUserProfile(user.id, {
                ime: ime.trim(),
                priimek: priimek.trim(),
                username: username.trim(),
            });

            await onUpdateUser({ ...user, ...updated });

            setMessage('Profil uspešno posodobljen!');
            setMessageType('success');
            setTimeout(() => setMessage(''), 3000);
        } catch (err: any) {
            setMessage(err.message || 'Napaka pri shranjevanju.');
            setMessageType('error');
        } finally {
            setIsSaving(false);
        }
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

                <View style={styles.emailCard}>
                    <Text style={styles.label}>XP točke</Text>
                    <Text style={styles.emailValue}>{user.skupni_xp ?? 0}</Text>
                    <Text style={styles.emailHint}>
                        XP točk ni mogoče spremeniti ročno.
                    </Text>
                </View>

                <Pressable
                    style={[styles.saveButton, isSaving && { opacity: 0.6 }]}
                    onPress={handleSave}
                    disabled={isSaving}
                >
                    <Text style={styles.primaryButtonText}>
                        {isSaving ? 'Shranjujem...' : 'Shrani spremembe'}
                    </Text>
                </Pressable>

                <Pressable style={styles.faceButton} onPress={() => { }}>
                    <Text style={styles.secondaryButtonText}>Dodaj Face ID</Text>
                </Pressable>

                <Pressable style={styles.logoutButton} onPress={onLogout}>
                    <Text style={styles.primaryButtonText}>Odjava</Text>
                </Pressable>

                {message ? (
                    <Text style={[
                        styles.message,
                        messageType === 'success' && { color: '#2563EB' },
                        messageType === 'error' && { color: '#DC2626' },
                    ]}>
                        {message}
                    </Text>
                ) : null}
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
        fontSize: 16,
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
        fontSize: 12,
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