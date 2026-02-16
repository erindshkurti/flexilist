import { Ionicons } from '@expo/vector-icons';
import React, { useRef } from 'react';
import { Animated, StyleSheet, Text } from 'react-native';
import { RectButton } from 'react-native-gesture-handler';
import Swipeable from 'react-native-gesture-handler/Swipeable';

interface SwipeableItemProps {
    children: React.ReactNode;
    onEdit: () => void;
    onDelete: () => void;
}

export const SwipeableItem = ({ children, onEdit, onDelete }: SwipeableItemProps) => {
    const swipeableRef = useRef<Swipeable>(null);

    const renderLeftActions = (progress: Animated.AnimatedInterpolation<number>, dragX: Animated.AnimatedInterpolation<number>) => {
        const trans = dragX.interpolate({
            inputRange: [0, 50, 100, 101],
            outputRange: [-20, 0, 0, 1],
        });

        return (
            <RectButton style={styles.leftAction} onPress={() => {
                swipeableRef.current?.close();
                onEdit();
            }}>
                <Animated.View
                    style={[
                        styles.actionText,
                        {
                            transform: [{ translateX: trans }],
                        },
                    ]}>
                    <Ionicons name="pencil" size={24} color="white" />
                    <Text style={styles.actionLabel}>Edit</Text>
                </Animated.View>
            </RectButton>
        );
    };

    const renderRightActions = (progress: Animated.AnimatedInterpolation<number>, dragX: Animated.AnimatedInterpolation<number>) => {
        const trans = dragX.interpolate({
            inputRange: [-101, -100, -50, 0],
            outputRange: [-1, 0, 0, 20],
        });

        return (
            <RectButton style={styles.rightAction} onPress={() => {
                swipeableRef.current?.close();
                onDelete();
            }}>
                <Animated.View
                    style={[
                        styles.actionText,
                        {
                            transform: [{ translateX: trans }],
                        },
                    ]}>
                    <Ionicons name="trash-outline" size={24} color="white" />
                    <Text style={styles.actionLabel}>Delete</Text>
                </Animated.View>
            </RectButton>
        );
    };

    return (
        <Swipeable
            ref={swipeableRef}
            renderLeftActions={renderLeftActions}
            renderRightActions={renderRightActions}
            friction={2}
            leftThreshold={30}
            rightThreshold={30}
            overshootLeft={false}
            overshootRight={false}
        >
            {children}
        </Swipeable>
    );
};

const styles = StyleSheet.create({
    leftAction: {
        minWidth: 100,
        backgroundColor: '#3b82f6', // blue-500
        justifyContent: 'center',
        alignItems: 'flex-start', // Align content to the left side
        paddingLeft: 20,
        marginBottom: 12,
        borderRadius: 16,
        marginRight: -16, // pull under the item slightly
    },
    rightAction: {
        minWidth: 100,
        backgroundColor: '#ef4444', // red-500
        justifyContent: 'center',
        alignItems: 'flex-end',
        paddingRight: 20,
        marginBottom: 12,
        borderRadius: 16,
        marginLeft: -16, // pull under the item slightly
    },
    actionText: {
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'transparent',
        padding: 10,
    },
    actionLabel: {
        color: 'white',
        fontSize: 12,
        fontFamily: 'PlusJakartaSans_600SemiBold',
        marginTop: 4,
    }
});
