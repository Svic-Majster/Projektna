import { useState } from 'react';
import {
    Alert,
    Button,
    StyleSheet,
    Text,
    TextInput,
    View,
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
        <Text style={styles.title}>Prijava</Text>

        <TextInput
        style={styles.input}
        placeholder="Email ali username"
        autoCapitalize="none"
        autoCorrect={false}
        value={identifier}
        onChangeText={setIdentifier}
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

        <Button
        title={submitting ? 'Prijava...' : 'Prijava'}
        onPress={handleLogin}
        disabled={submitting}
        />

        <View style={styles.spacer} />

        <Button title="Ustvari račun" onPress={onGoToRegister} />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
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
