import { useState } from 'react';
import {
    Alert,
    Button,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View,
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
        <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>Registracija</Text>

        <TextInput
        style={styles.input}
        placeholder="Ime"
        value={ime}
        onChangeText={setIme}
        />

        <TextInput
        style={styles.input}
        placeholder="Priimek"
        value={priimek}
        onChangeText={setPriimek}
        />

        <TextInput
        style={styles.input}
        placeholder="Username"
        autoCapitalize="none"
        autoCorrect={false}
        value={username}
        onChangeText={setUsername}
        />

        <TextInput
        style={styles.input}
        placeholder="Email"
        keyboardType="email-address"
        autoCapitalize="none"
        autoCorrect={false}
        value={email}
        onChangeText={setEmail}
        />

        <TextInput
        style={styles.input}
        placeholder="Geslo"
        secureTextEntry
        autoCapitalize="none"
        autoCorrect={false}
        value={geslo}
        onChangeText={setGeslo}
        />

        <TextInput
        style={styles.input}
        placeholder="Potrdi geslo"
        secureTextEntry
        autoCapitalize="none"
        autoCorrect={false}
        value={potrdiGeslo}
        onChangeText={setPotrdiGeslo}
        />

        <Button
        title={submitting ? 'Registracija...' : 'Registracija'}
        onPress={handleRegister}
        disabled={submitting}
        />

        <View style={styles.spacer} />

        <Button title="Nazaj na prijavo" onPress={onGoToLogin} />
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flexGrow: 1,
        justifyContent: 'center',
        padding: 24,
        gap: 12,
    },
    title: {
        fontSize: 28,
        fontWeight: '700',
        marginBottom: 12,
    },
    input: {
        borderWidth: 1,
        borderColor: '#D0D5DD',
        borderRadius: 10,
        paddingHorizontal: 14,
        paddingVertical: 12,
        backgroundColor: '#FFFFFF',
    },
    spacer: {
        height: 8,
    },
});
