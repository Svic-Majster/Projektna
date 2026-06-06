import { useRef, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Pressable,
    StyleSheet,
    Text,
    View,
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { faceEnroll } from '../lib/api';

type Props = {
    userId: number;
    onDone: () => void;
    onCancel: () => void;
};

// vodeni zajem iz treh smeri (kot pri orv zajem_obrazov)
const STEPS = [
    { key: 'naravnost', navodilo: 'Glej naravnost v kamero' },
    { key: 'levo', navodilo: 'Obrni glavo rahlo v levo' },
    { key: 'desno', navodilo: 'Obrni glavo rahlo v desno' },
];

export default function FaceEnrollScreen({ userId, onDone, onCancel }: Props) {
    const cameraRef = useRef<CameraView>(null);
    const [permission, requestPermission] = useCameraPermissions();
    const [stepIndex, setStepIndex] = useState(0);
    const [uris, setUris] = useState<string[]>([]);
    const [busy, setBusy] = useState(false);

    if (!permission) {
        return (
            <View style={styles.center}>
                <ActivityIndicator size="large" color="#2563EB" />
            </View>
        );
    }

    if (!permission.granted) {
        return (
            <View style={styles.center}>
                <Text style={styles.info}>
                    Za registracijo obraza potrebujemo dostop do kamere.
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

    const step = STEPS[stepIndex];
    const isLast = stepIndex === STEPS.length - 1;

    const handleCapture = async () => {
        if (!cameraRef.current || busy) return;

        setBusy(true);
        try {
            const photo = await cameraRef.current.takePictureAsync({ quality: 0.7 });
            if (!photo?.uri) throw new Error('Zajem slike ni uspel.');

            const nextUris = [...uris, photo.uri];

            if (!isLast) {
                // pojdi na naslednjo smer
                setUris(nextUris);
                setStepIndex(stepIndex + 1);
            } else {
                // zadnji korak -> poslji vse slike na streznik
                const data = await faceEnroll(userId, nextUris);
                Alert.alert(
                    'Obraz registriran',
                    `Uporabljenih slik: ${data.uporabljenih_slik}, preskocenih: ${data.preskocenih_slik}.`
                );
                onDone();
            }
        } catch (error) {
            Alert.alert(
                'Napaka',
                error instanceof Error ? error.message : 'Poskusi znova.'
            );
        } finally {
            setBusy(false);
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Registracija obraza</Text>
            <Text style={styles.stepCount}>
                Korak {stepIndex + 1} / {STEPS.length}
            </Text>
            <Text style={styles.navodilo}>{step.navodilo}</Text>

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
                    <Text style={styles.primaryButtonText}>
                        {isLast ? 'Zajemi in zakljuci' : 'Zajemi'}
                    </Text>
                )}
            </Pressable>

            <Pressable style={styles.secondaryButton} onPress={onCancel}>
                <Text style={styles.secondaryButtonText}>Preklici</Text>
            </Pressable>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#111827', padding: 24, justifyContent: 'center' },
    center: { flex: 1, backgroundColor: '#111827', padding: 24, justifyContent: 'center', alignItems: 'center', gap: 16 },
    title: { fontSize: 28, fontWeight: '800', color: 'white', textAlign: 'center' },
    stepCount: { color: '#2563EB', fontSize: 14, fontWeight: '700', textAlign: 'center', marginTop: 8 },
    navodilo: { color: '#9CA3AF', fontSize: 16, textAlign: 'center', marginTop: 4, marginBottom: 20 },
    info: { color: '#9CA3AF', fontSize: 15, textAlign: 'center', marginBottom: 8 },
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
