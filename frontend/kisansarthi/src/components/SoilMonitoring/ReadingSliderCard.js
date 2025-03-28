import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS } from '../../theme/colors';

// Define reasonable ranges (adjust as needed)
const RANGES = {
    ph: { min: 4, max: 9 },
    moisture: { min: 0, max: 100 },
};

// Helper to calculate percentage for slider
const calculatePercentage = (value, min, max) => {
    if (value === null || value === undefined || max === min) return 0;
    const percentage = ((value - min) / (max - min)) * 100;
    return Math.max(0, Math.min(100, percentage)); // Clamp between 0 and 100
};

const ReadingSliderCard = ({ label, value, unit = '', type }) => {
    const displayValue = value !== null && value !== undefined ? `${value}${unit}` : '--';
    const range = RANGES[type] || { min: 0, max: 100 }; // Default range if type unknown
    const percentage = calculatePercentage(value, range.min, range.max);

    // Determine color based on value (Example logic - adjust thresholds)
    let barColor = COLORS.primary;
    if (type === 'moisture') {
        if (value < 20) barColor = COLORS.warning; // Too dry
        else if (value > 80) barColor = COLORS.link; // Too wet
        else barColor = COLORS.secondary; // Good range
    } else if (type === 'ph') {
         if (value < 5.5 || value > 7.5) barColor = COLORS.warning; // Out of typical optimal range
         else barColor = COLORS.secondary; // Good range
    }


    return (
        <View style={styles.card}>
            <View style={styles.header}>
                <Text style={styles.label}>{label}</Text>
                <Text style={styles.value}>{displayValue}</Text>
            </View>
            <View style={styles.sliderBackground}>
                <View style={[styles.sliderForeground, { width: `${percentage}%`, backgroundColor: barColor }]} />
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    card: {
        backgroundColor: COLORS.surface,
        borderRadius: 10,
        padding: 15,
        marginBottom: 15,
         // Shadow
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.08,
        shadowRadius: 2,
        elevation: 1.5,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 10,
    },
    label: {
        fontSize: 15,
        fontWeight: '600',
        color: COLORS.textDark,
    },
    value: {
        fontSize: 15,
        fontWeight: 'bold',
        color: COLORS.textDark,
    },
    sliderBackground: {
        height: 8,
        backgroundColor: COLORS.border,
        borderRadius: 4,
        overflow: 'hidden', // Ensure foreground respects border radius
    },
    sliderForeground: {
        height: '100%',
        borderRadius: 4,
    },
});

export default ReadingSliderCard;