import { useRef, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Pressable,
    StyleSheet,
    Text,
    TextInput,
    View,
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { faceLogin } from '../lib/api';
import type { User } from '../types/auth';

type Props = {
    onSuccess: (user: User) => void;
    onCancel: () => void;
};

export default function FaceLoginScreen({ onSuccess, onCancel }: Props) {
    const cameraRef = useRef<CameraView>(null);
    const [permission, requestPermission] = useCameraPermissions();
    const [identifier, setIdentifier] = useState('');
    const [busy, setBusy] = useState(false);

    // dovoljenje se se nalaga
    if (!permission) {
        return (
            <View style={styles.center}>
                <ActivityIndicator size="large" color="#2563EB" />
            </View>
        );
    }

    // brez dovoljenja za kamero
    if (!permission.granted) {
        return (
            <View style={styles.center}>
                <Text style={styles.info}>
                    Za prijavo z obrazom potrebujemo dostop do kamere.
                </Text>
                <Pressable style={styles.primaryButton} onPress={requestPermission}>
                    <Text style={styles.primaryButtonText}>Dovoli kamero</Text>
                </Pressable>
                <Pressable style={styles.secondaryButton} onPress={onCancel}>
                    <Text style={styles.secondaryButtonText}>Nazaj</Text>
                </Pressable>
            </View>
        );
    }

    const handleCapture = async () => {
        if (!identifier.trim()) {
            Alert.alert('Napaka', 'Vnesi email ali uporabnisko ime.');
            return;
        }
        if (!cameraRef.current || busy) return;

        setBusy(true);
        try {
            const photo = await cameraRef.current.takePictureAsync({ quality: 0.7 });
            if (!photo?.uri) throw new Error('Zajem slike ni uspel.');

            const data = await faceLogin(identifier.trim(), photo.uri);
            onSuccess(data.user);
        } catch (error) {
            Alert.alert(
                'Prijava ni uspela',
                error instanceof Error ? error.message : 'Poskusi znova.'
            );
        } finally {
            setBusy(false);
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Prijava z obrazom</Text>

            <TextInput
                style={styles.input}
                placeholder="Email ali uporabnisko ime"
                placeholderTextColor="#9CA3AF"
                autoCapitalize="none"
                autoCorrect={false}
                value={identifier}
                onChangeText={setIdentifier}
            />

            <View style={styles.cameraWrap}>
                <CameraView ref={cameraRef} style={StyleSheet.absoluteFill} facing="front" />
            </View>

            <Pressable
                style={({ pressed }) => [
                    styles.primaryButton,
                    pressed && styles.pressed,
                    busy && styles.disabled,
                ]}
                onPress={handleCapture}
                disabled={busy}
            >
                {busy ? (
                    <ActivityIndicator color="white" />
                ) : (
                    <Text style={styles.primaryButtonText}>Zajemi in se prijavi</Text>
                )}
            </Pressable>

            <Pressable style={styles.secondaryButton} onPress={onCancel}>
                <Text style={styles.secondaryButtonText}>Nazaj na navadno prijavo</Text>
            </Pressable>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#111827', padding: 24, justifyContent: 'center' },
    center: { flex: 1, backgroundColor: '#111827', padding: 24, justifyContent: 'center', alignItems: 'center', gap: 16 },
    title: { fontSize: 28, fontWeight: '800', color: 'white', textAlign: 'center', marginBottom: 24 },
    info: { color: '#9CA3AF', fontSize: 15, textAlign: 'center', marginBottom: 8 },
    input: {
        backgroundColor: '#1F2937', borderWidth: 1, borderColor: '#374151', borderRadius: 14,
        paddingHorizontal: 16, paddingVertical: 14, fontSize: 16, color: 'white', marginBottom: 16,
    },
    cameraWrap: {
        aspectRatio: 3 / 4, borderRadius: 20, overflow: 'hidden',
        backgroundColor: '#000', marginBottom: 20, borderWidth: 1, borderColor: '#374151',
    },
    primaryButton: {
        backgroundColor: '#2563EB', paddingVertical: 16, borderRadius: 14,
        alignItems: 'center', justifyContent: 'center',
    },
    pressed: { opacity: 0.8 },
    disabled: { backgroundColor: '#1D4ED8', opacity: 0.6 },
    primaryButtonText: { color: 'white', fontSize: 16, fontWeight: '700' },
    secondaryButton: { alignItems: 'center', paddingVertical: 12, marginTop: 8 },
    secondaryButtonText: { color: '#9CA3AF', fontSize: 15, fontWeight: '500' },
});
