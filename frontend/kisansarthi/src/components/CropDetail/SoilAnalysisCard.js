import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS } from '../../theme/colors';

const SoilAnalysisCard = ({ label, currentValue, optimalValue, unit = '' }) => {
    const displayCurrent = currentValue !== null && currentValue !== undefined ? `${currentValue}${unit}` : '--';
    const displayOptimal = optimalValue || '--';

    return (
        <View style={styles.card}>
            <Text style={styles.label}>{label}</Text>
            <View style={styles.row}>
                <Text style={styles.subLabel}>Current {label.split(' ')[0]}:</Text>
                <Text style={styles.value}>{displayCurrent}</Text>
            </View>
            <View style={[styles.row, styles.optimalRow]}>
                <Text style={[styles.subLabel, styles.optimalLabel]}>Optimal {label.split(' ')[0]}:</Text>
                <Text style={[styles.value, styles.optimalValue]}>{displayOptimal}</Text>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    card: {
        flex: 1, // Share space in a row
        backgroundColor: COLORS.surface,
        borderRadius: 10,
        padding: 15,
        marginHorizontal: 5,
         // Shadow
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.08,
        shadowRadius: 2,
        elevation: 1.5,
    },
    label: {
        fontSize: 15,
        fontWeight: 'bold',
        color: COLORS.textDark,
        marginBottom: 10,
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 5,
    },
    subLabel: {
        fontSize: 14,
        color: COLORS.textMedium,
    },
    value: {
        fontSize: 14,
        fontWeight: '600',
        color: COLORS.textDark,
    },
    optimalRow: {
        // Optional styling for optimal row if needed
        marginTop: 2,
    },
    optimalLabel: {
        color: COLORS.secondary, // Green color for optimal label
        fontWeight: '600',
    },
    optimalValue: {
        color: COLORS.secondary, // Green color for optimal value
        fontWeight: '600',
    },
});

export default SoilAnalysisCard;