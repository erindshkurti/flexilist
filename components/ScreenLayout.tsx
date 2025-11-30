import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { Platform, SafeAreaView, View } from 'react-native';

interface ScreenLayoutProps {
    children: React.ReactNode;
    className?: string;
}

export const ScreenLayout = ({ children, className }: ScreenLayoutProps) => {
    const Container = Platform.OS === 'web' ? View : SafeAreaView;

    return (
        <Container className={`flex-1 bg-white dark:bg-black ${className}`}>
            <StatusBar style="auto" />
            <View className="flex-1 px-4 py-2">
                {children}
            </View>
        </Container>
    );
};
