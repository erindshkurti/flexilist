import React from 'react';
import { ActivityIndicator, Image, Text, TouchableOpacity } from 'react-native';

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
        primary: "bg-[#1f2937] active:bg-[#111827]",
        secondary: "bg-gray-200 active:bg-gray-300 dark:bg-gray-800",
        outline: "border-2 border-[#1f2937] bg-transparent",
        google: "bg-white"
    };
    const textVariants = {
        primary: "text-white font-semibold text-lg",
        secondary: "text-black dark:text-white font-semibold text-lg",
        outline: "text-[#1f2937] font-semibold text-lg",
        google: "text-gray-700 font-semibold text-lg"
    };

    const inlineStyles = {
        primary: {
            backgroundColor: '#1f2937',
            padding: 16,
            borderRadius: 12,
            alignItems: 'center' as const,
            justifyContent: 'center' as const,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.2,
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
            borderColor: '#1f2937',
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
        outline: { color: '#1f2937', fontWeight: '600' as const, fontSize: 17 },
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
                <ActivityIndicator color={effectiveVariant === 'google' ? '#1f2937' : effectiveVariant === 'outline' ? '#1f2937' : 'white'} />
            ) : (
                <>
                    {effectiveVariant === 'google' && (
                        <Image source={require('../assets/images/google-icon.png')} style={{ width: 24, height: 24 }} />
                    )}
                    <Text className={textVariants[effectiveVariant]} style={textInlineStyles[effectiveVariant]}>{title}</Text>
                </>
            )}
        </TouchableOpacity>
    );
};
