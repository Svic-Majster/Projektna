import { useState } from 'react';
import {
    Alert,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View,
    ActivityIndicator
} from 'react-native';
import type { AuthResult } from '../types/auth';

type Props = {
    onSubmit: (payload: {
        ime: string;
        priimek: string;
        username: string;
        email: string;
        geslo: string;
    }) => Promise<AuthResult>;
    onGoToLogin: () => void;
};

export default function RegisterScreen({ onSubmit, onGoToLogin }: Props) {
    const [ime, setIme] = useState('');
    const [priimek, setPriimek] = useState('');
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [geslo, setGeslo] = useState('');
    const [potrdiGeslo, setPotrdiGeslo] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const handleRegister = async () => {
        if (!ime.trim() || !priimek.trim() || !username.trim() || !email.trim() || !geslo.trim() || !potrdiGeslo.trim()) {
            Alert.alert('Napaka', 'Izpolni vsa polja.');
            return;
        }

        if (geslo !== potrdiGeslo) {
            Alert.alert('Napaka', 'Gesli se ne ujemata.');
            return;
        }

        setSubmitting(true);

        const result = await onSubmit({
            ime: ime.trim(),
            priimek: priimek.trim(),
            username: username.trim(),
            email: email.trim().toLowerCase(),
            geslo,
        });

        setSubmitting(false);

        if (!result.success) {
            Alert.alert('Registracija ni uspela', result.message || 'Poskusi znova.');
            return;
        }

        Alert.alert('Uspeh', result.message || 'Račun je ustvarjen.');
        onGoToLogin();
    };

    return (
        <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
            <View style={styles.headerContainer}>
                <Text style={styles.title}>Ustvari račun</Text>
                <Text style={styles.subtitle}>Registriraj se za začetek sledenja vadbam</Text>
            </View>

            <View style={styles.formContainer}>
                <TextInput
                    style={styles.input}
                    placeholder="Ime"
                    placeholderTextColor="#9CA3AF"
                    value={ime}
                    onChangeText={setIme}
                />

                <TextInput
                    style={styles.input}
                    placeholder="Priimek"
                    placeholderTextColor="#9CA3AF"
                    value={priimek}
                    onChangeText={setPriimek}
                />

                <TextInput
                    style={styles.input}
                    placeholder="Uporabniško ime"
                    placeholderTextColor="#9CA3AF"
                    autoCapitalize="none"
                    autoCorrect={false}
                    value={username}
                    onChangeText={setUsername}
                />

                <TextInput
                    style={styles.input}
                    placeholder="E-poštni naslov"
                    placeholderTextColor="#9CA3AF"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                    value={email}
                    onChangeText={setEmail}
                />

                <TextInput
                    style={styles.input}
                    placeholder="Geslo"
                    placeholderTextColor="#9CA3AF"
                    secureTextEntry
                    autoCapitalize="none"
                    autoCorrect={false}
                    value={geslo}
                    onChangeText={setGeslo}
                />

                <TextInput
                    style={styles.input}
                    placeholder="Potrdi geslo"
                    placeholderTextColor="#9CA3AF"
                    secureTextEntry
                    autoCapitalize="none"
                    autoCorrect={false}
                    value={potrdiGeslo}
                    onChangeText={setPotrdiGeslo}
                />

                <Pressable 
                    style={({ pressed }) => [styles.primaryButton, pressed && styles.buttonPressed, submitting && styles.buttonDisabled]} 
                    onPress={handleRegister}
                    disabled={submitting}
                >
                    {submitting ? (
                        <ActivityIndicator size="small" color="white" />
                    ) : (
                        <Text style={styles.primaryButtonText}>Registracija</Text>
                    )}
                </Pressable>

                <Pressable style={styles.secondaryButton} onPress={onGoToLogin}>
                    <Text style={styles.secondaryButtonText}>Že imaš račun? Prijavi se</Text>
                </Pressable>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flexGrow: 1,
        backgroundColor: '#111827',
        padding: 24,
        justifyContent: 'center',
    },
    headerContainer: {
        marginBottom: 32,
        alignItems: 'center',
    },
    title: {
        fontSize: 32,
        fontWeight: '800',
        color: 'white',
        letterSpacing: 0.5,
    },
    subtitle: {
        fontSize: 14,
        color: '#9CA3AF',
        marginTop: 8,
        textAlign: 'center',
    },
    formContainer: {
        gap: 16,
    },
    input: {
        backgroundColor: '#1F2937',
        borderWidth: 1,
        borderColor: '#374151',
        borderRadius: 14,
        paddingHorizontal: 16,
        paddingVertical: 14,
        fontSize: 16,
        color: 'white',
    },
    primaryButton: {
        backgroundColor: '#2563EB',
        paddingVertical: 16,
        borderRadius: 14,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 8,
        shadowColor: '#2563EB',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 4,
    },
    buttonPressed: {
        opacity: 0.8,
    },
    buttonDisabled: {
        backgroundColor: '#1D4ED8',
        opacity: 0.6,
    },
    primaryButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: '700',
    },
    secondaryButton: {
        alignItems: 'center',
        paddingVertical: 12,
        marginTop: 8,
    },
    secondaryButtonText: {
        color: '#9CA3AF',
        fontSize: 15,
        fontWeight: '500',
    },
});