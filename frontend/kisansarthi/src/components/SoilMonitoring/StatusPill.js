import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS } from '../../theme/colors';

const StatusPill = ({ status }) => {
    let backgroundColor = COLORS.placeholder;
    let textColor = COLORS.textDark;
    let text = status ? status.charAt(0).toUpperCase() + status.slice(1) : 'Unknown';

    switch (status?.toLowerCase()) {
        case 'active':
        case 'online':
            backgroundColor = COLORS.secondaryLight; // Light Green
            textColor = COLORS.secondary; // Green
            text = 'Online';
            break;
        case 'inactive':
        case 'offline':
            backgroundColor = COLORS.errorLight; // Light Red/Orange
            textColor = COLORS.warning; // Amber/Orange Text
            text = 'Offline';
            break;
         case 'maintenance':
            backgroundColor = COLORS.profileInitialBackground; // Grey
            textColor = COLORS.textMedium;
            text = 'Maintenance';
            break;
        case 'error':
            backgroundColor = COLORS.errorLight; // Light Red
            textColor = COLORS.error; // Red Text
             text = 'Error';
             break;
    }

    return (
        <View style={[styles.pill, { backgroundColor }]}>
            <Text style={[styles.text, { color: textColor }]}>{text}</Text>
        </View>
    );
};

const styles = StyleSheet.create({
    pill: {
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 12,
        alignSelf: 'flex-start', // Don't take full width
    },
    text: {
        fontSize: 13,
        fontWeight: 'bold',
    },
});

export default StatusPill;