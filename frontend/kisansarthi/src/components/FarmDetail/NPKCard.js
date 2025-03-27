import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS } from '../../theme/colors';

const NPKCard = ({ label, value, unit = 'ppm' }) => {
    const displayValue = value !== null && value !== undefined ? value : '--'; // Handle null/undefined

    return (
        <View style={styles.card}>
            <Text style={styles.label}>{label}</Text>
            <Text style={styles.value}>{displayValue}</Text>
            <Text style={styles.unit}>{unit}</Text>
        </View>
    );
};

const styles = StyleSheet.create({
    card: {
        flex: 1, // Allow cards to share space equally
        backgroundColor: COLORS.surface,
        borderRadius: 10,
        paddingVertical: 15,
        paddingHorizontal: 10,
        marginHorizontal: 5, // Space between cards
        alignItems: 'center',
        // Shadow
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.08,
        shadowRadius: 2,
        elevation: 1.5,
    },
    label: {
        fontSize: 13,
        color: COLORS.textLight,
        marginBottom: 5,
    },
    value: {
        fontSize: 22,
        fontWeight: 'bold',
        color: COLORS.textDark,
        marginBottom: 2,
    },
    unit: {
        fontSize: 12,
        color: COLORS.textMedium,
    },
});

export default NPKCard;