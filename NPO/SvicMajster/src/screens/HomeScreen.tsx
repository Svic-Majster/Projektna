import { Button, StyleSheet, Text, View } from 'react-native';

export default function HomeScreen() {
    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.logo}>SvicMajster</Text>
                <Text style={styles.profile}>👤</Text>
            </View>

            <View style={styles.content}>
                <Text style={styles.title}>Začetni zaslon</Text>

                <View style={styles.startButton}>
                    <Button title="Začni trening" onPress={() => { }} />
                </View>
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
    title: {
        color: 'white',
        fontSize: 22,
        fontWeight: '600',
    },

    startButton: {
        marginTop: 24,
        width: '80%',
    },
});