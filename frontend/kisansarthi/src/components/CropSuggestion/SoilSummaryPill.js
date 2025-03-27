import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS } from '../../theme/colors';

const SoilSummaryPill = ({ label, value }) => {
    const displayValue = value !== null && value !== undefined ? value : '--';
    return (
        <View style={styles.pill}>
            <Text style={styles.text}>{`${label}: ${displayValue}`}</Text>
        </View>
    );
};

const styles = StyleSheet.create({
    pill: {
        backgroundColor: COLORS.surface, // White or light background
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 15, // Pill shape
        marginHorizontal: 4,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    text: {
        fontSize: 13,
        color: COLORS.textMedium,
        fontWeight: '500',
    },
});

export default SoilSummaryPill;