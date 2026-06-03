import { useState } from 'react';
import {
    Alert,
    Pressable,
    StyleSheet,
    Text,
    TextInput,
    View,
    ActivityIndicator
} from 'react-native';
import type { AuthResult } from '../types/auth';

type Props = {
    onSubmit: (payload: { identifier: string; geslo: string }) => Promise<AuthResult>;
    onGoToRegister: () => void;
};

export default function LoginScreen({ onSubmit, onGoToRegister }: Props) {
    const [identifier, setIdentifier] = useState('');
    const [geslo, setGeslo] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const handleLogin = async () => {
        if (!identifier.trim() || !geslo.trim()) {
            Alert.alert('Napaka', 'Vnesi email ali username ter geslo.');
            return;
        }

        setSubmitting(true);

        const result = await onSubmit({
            identifier: identifier.trim(),
            geslo,
        });

        setSubmitting(false);

        if (!result.success) {
            Alert.alert('Prijava ni uspela', result.message || 'Poskusi znova.');
        }
    };

    return (
        <View style={styles.container}>
            <View style={styles.headerContainer}>
                <Text style={styles.title}>Pozdravljen nazaj</Text>
                <Text style={styles.subtitle}>Vpiši se v svoj račun ŠvicMajster</Text>
            </View>

            <View style={styles.formContainer}>
                <TextInput
                    style={styles.input}
                    placeholder="Email ali uporabniško ime"
                    placeholderTextColor="#9CA3AF"
                    autoCapitalize="none"
                    autoCorrect={false}
                    value={identifier}
                    onChangeText={setIdentifier}
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

                <Pressable 
                    style={({ pressed }) => [styles.primaryButton, pressed && styles.buttonPressed, submitting && styles.buttonDisabled]} 
                    onPress={handleLogin}
                    disabled={submitting}
                >
                    {submitting ? (
                        <ActivityIndicator size="small" color="white" />
                    ) : (
                        <Text style={styles.primaryButtonText}>Prijava</Text>
                    )}
                </Pressable>

                <Pressable style={styles.secondaryButton} onPress={onGoToRegister}>
                    <Text style={styles.secondaryButtonText}>Še nimaš računa? Ustvari ga tukaj</Text>
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