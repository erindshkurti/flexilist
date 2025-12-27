import { Button } from '@/components/Button';
import { useGoogleAuth } from '@/hooks/useGoogleAuth';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Alert, Image, Platform, StyleSheet, Text, View } from 'react-native';

export default function LoginScreen() {
    const { signIn } = useGoogleAuth();
    const [loading, setLoading] = useState(false);
    const router = useRouter();
    const [mousePosition, setMousePosition] = useState({ x: 50, y: 50 });

    useEffect(() => {
        if (Platform.OS === 'web') {
            const handleMouseMove = (e: MouseEvent) => {
                const x = (e.clientX / window.innerWidth) * 100;
                const y = (e.clientY / window.innerHeight) * 100;
                setMousePosition({ x, y });
            };

            window.addEventListener('mousemove', handleMouseMove);
            return () => window.removeEventListener('mousemove', handleMouseMove);
        }
    }, []);

    const handleSignIn = async () => {
        setLoading(true);
        try {
            await signIn();
            router.replace('/(tabs)');
        } catch (error: any) {
            Alert.alert("Login Failed", error.message);
        } finally {
            setLoading(false);
        }
    };

    const gradientStyle = Platform.OS === 'web' ? {
        background: `radial-gradient(circle at ${mousePosition.x}% ${mousePosition.y}%, #ffffff 0%, #fafafa 30%, #f5f5f5 60%, #f0f0f0 100%)`,
        transition: 'background 0.3s ease',
    } : {};

    return (
        <View style={styles.container}>
            <View style={[styles.gradient, gradientStyle as any]}>
                <View style={styles.content}>
                    {/* Title Section with Icon */}
                    <View style={styles.titleSection}>
                        <View style={styles.titleRow}>
                            <Image
                                source={require('../assets/images/logo.png')}
                                style={styles.logo}
                            />
                            <Text style={styles.title}>flexilist</Text>
                        </View>
                        <Text style={styles.subtitle}>Track anything, your way.</Text>
                    </View>

                    {/* Card Container */}
                    <View style={styles.card}>
                        <Text style={styles.cardTitle}>Welcome Back</Text>
                        <Text style={styles.cardSubtitle}>Sign in to continue to your lists</Text>

                        <View style={styles.buttonContainer}>
                            <Button
                                title="Sign in with Google"
                                onPress={handleSignIn}
                                loading={loading}
                            />
                        </View>
                    </View>

                    {/* Footer */}
                    <Text style={styles.footer}>Secure authentication powered by Google</Text>
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    gradient: {
        flex: 1,
        backgroundColor: '#f3f4f6',
    },
    content: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 24,
    },
    titleSection: {
        alignItems: 'center',
        marginBottom: 48,
    },
    titleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    title: {
        fontSize: 48,
        fontWeight: '800',
        fontFamily: 'PlusJakartaSans_800ExtraBold',
        color: '#1f2937',
        letterSpacing: -1,
    },
    logo: {
        width: 96,
        height: 96,
        marginRight: 16,
    },
    subtitle: {
        fontSize: 18,
        color: '#6b7280',
        marginTop: 8,
        fontWeight: '500',
        fontFamily: 'PlusJakartaSans_500Medium',
    },
    card: {
        backgroundColor: 'white',
        borderRadius: 24,
        padding: 40,
        width: '100%',
        maxWidth: 480,
        borderWidth: 1,
        borderColor: '#e5e7eb',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    cardTitle: {
        fontSize: 28,
        fontWeight: '700',
        fontFamily: 'PlusJakartaSans_700Bold',
        color: '#1f2937',
        marginBottom: 8,
        textAlign: 'center',
    },
    cardSubtitle: {
        fontSize: 15,
        color: '#6b7280',
        fontFamily: 'PlusJakartaSans_400Regular',
        marginBottom: 32,
        textAlign: 'center',
    },
    buttonContainer: {
        marginTop: 8,
    },
    footer: {
        marginTop: 32,
        fontSize: 13,
        color: '#9ca3af',
        fontFamily: 'PlusJakartaSans_400Regular',
        textAlign: 'center',
    },
});
