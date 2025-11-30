import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { ActivityIndicator, Text, TouchableOpacity } from 'react-native';

interface ButtonProps {
    onPress: () => void;
    title: string;
    loading?: boolean;
    variant?: 'primary' | 'secondary' | 'outline' | 'google';
    className?: string;
}

export const Button = ({ onPress, title, loading, variant = 'primary', className }: ButtonProps) => {
    const baseStyle = "p-4 rounded-xl items-center justify-center";
    const variants = {
        primary: "bg-blue-600 active:bg-blue-700",
        secondary: "bg-gray-200 active:bg-gray-300 dark:bg-gray-800",
        outline: "border-2 border-blue-600 bg-transparent",
        google: "bg-white"
    };
    const textVariants = {
        primary: "text-white font-semibold text-lg",
        secondary: "text-black dark:text-white font-semibold text-lg",
        outline: "text-blue-600 font-semibold text-lg",
        google: "text-gray-700 font-semibold text-lg"
    };

    const inlineStyles = {
        primary: {
            backgroundColor: '#2563EB',
            padding: 16,
            borderRadius: 12,
            alignItems: 'center' as const,
            justifyContent: 'center' as const,
            shadowColor: '#2563EB',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.3,
            shadowRadius: 8,
            elevation: 4,
        },
        secondary: {
            backgroundColor: '#E5E7EB',
            padding: 16,
            borderRadius: 12,
            alignItems: 'center' as const,
            justifyContent: 'center' as const
        },
        outline: {
            borderWidth: 2,
            borderColor: '#2563EB',
            backgroundColor: 'transparent',
            padding: 16,
            borderRadius: 12,
            alignItems: 'center' as const,
            justifyContent: 'center' as const
        },
        google: {
            backgroundColor: 'white',
            padding: 16,
            borderRadius: 12,
            alignItems: 'center' as const,
            justifyContent: 'center' as const,
            flexDirection: 'row' as const,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 8,
            elevation: 3,
            borderWidth: 1,
            borderColor: '#e5e7eb',
        }
    };

    const textInlineStyles = {
        primary: { color: 'white', fontWeight: '600' as const, fontSize: 17 },
        secondary: { color: 'black', fontWeight: '600' as const, fontSize: 17 },
        outline: { color: '#2563EB', fontWeight: '600' as const, fontSize: 17 },
        google: { color: '#1f2937', fontWeight: '600' as const, fontSize: 17, marginLeft: 12 }
    };

    // Default to google variant for "Sign in with Google"
    const effectiveVariant = title.includes('Google') ? 'google' : variant;

    return (
        <TouchableOpacity
            onPress={onPress}
            disabled={loading}
            className={`${baseStyle} ${variants[effectiveVariant]} ${className} ${loading ? 'opacity-70' : ''}`}
            style={inlineStyles[effectiveVariant]}
            activeOpacity={0.8}
        >
            {loading ? (
                <ActivityIndicator color={effectiveVariant === 'google' ? '#2563EB' : effectiveVariant === 'outline' ? '#2563EB' : 'white'} />
            ) : (
                <>
                    {effectiveVariant === 'google' && (
                        <Ionicons name="logo-google" size={24} color="#4285F4" />
                    )}
                    <Text className={textVariants[effectiveVariant]} style={textInlineStyles[effectiveVariant]}>{title}</Text>
                </>
            )}
        </TouchableOpacity>
    );
};
