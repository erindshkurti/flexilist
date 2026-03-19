import { Ionicons } from '@expo/vector-icons';
import React, { useRef } from 'react';
import { Animated, StyleSheet, Text } from 'react-native';
import { RectButton, Swipeable } from 'react-native-gesture-handler';

interface SwipeableItemProps {
    children: React.ReactNode;
    onEdit: () => void;
    onDelete: () => void;
    marginBottom?: number;
    borderRadius?: number;
    // Configurable left action (defaults to Edit)
    leftIcon?: React.ComponentProps<typeof Ionicons>['name'];
    leftLabel?: string;
    leftColor?: string;
}

export const SwipeableItem = ({
    children,
    onEdit,
    onDelete,
    marginBottom = 12,
    borderRadius = 16,
    leftIcon = 'pencil',
    leftLabel = 'Edit',
    leftColor = '#3b82f6',
}: SwipeableItemProps) => {
    const swipeableRef = useRef<Swipeable>(null);

    const renderLeftActions = (progress: Animated.AnimatedInterpolation<number>, dragX: Animated.AnimatedInterpolation<number>) => {
        const trans = dragX.interpolate({
            inputRange: [0, 50, 100, 101],
            outputRange: [-20, 0, 0, 1],
        });

        return (
            <RectButton
                shouldActivateOnStart={true}
                style={[styles.leftAction, { backgroundColor: leftColor, marginBottom, borderRadius, borderTopRightRadius: 0, borderBottomRightRadius: 0 }]}
                onPress={() => {
                    swipeableRef.current?.close();
                    onEdit();
                }}
            >
                <Animated.View
                    style={[
                        styles.actionText,
                        {
                            transform: [{ translateX: trans }],
                        },
                    ]}>
                    <Ionicons name={leftIcon} size={24} color="white" />
                    <Text style={styles.actionLabel}>{leftLabel}</Text>
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
            <RectButton
                shouldActivateOnStart={true}
                style={[styles.rightAction, { marginBottom, borderRadius, borderTopLeftRadius: 0, borderBottomLeftRadius: 0 }]}
                onPress={() => {
                    swipeableRef.current?.close();
                    onDelete();
                }}
            >
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
            containerStyle={{ overflow: 'visible' }}
            childrenContainerStyle={{ overflow: 'visible' }}
        >
            {children}
        </Swipeable>
    );
};

const styles = StyleSheet.create({
    leftAction: {
        minWidth: 120,
        justifyContent: 'center',
        alignItems: 'flex-start',
        paddingLeft: 20,
        marginBottom: 12,
        borderRadius: 16,
        borderTopRightRadius: 0,
        borderBottomRightRadius: 0,
        marginRight: -36,
    },
    rightAction: {
        minWidth: 120,
        backgroundColor: '#ef4444',
        justifyContent: 'center',
        alignItems: 'flex-end',
        paddingRight: 20,
        marginBottom: 12,
        borderRadius: 16,
        borderTopLeftRadius: 0,
        borderBottomLeftRadius: 0,
        marginLeft: -36,
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
