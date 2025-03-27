import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { CheckCircle2, AlertCircle } from 'lucide-react-native'; // Icons for recommendations
import { COLORS } from '../../theme/colors';

const RecommendationItem = ({ text, type = 'info' }) => { // Types: 'success', 'warning', 'info'
    let IconComponent = CheckCircle2;
    let iconColor = COLORS.secondary; // Default green

    if (type === 'warning') {
        IconComponent = AlertCircle;
        iconColor = COLORS.warning; // Amber/Yellow
    } else if (type === 'info') {
        // Maybe use a different icon or color for neutral info
         IconComponent = CheckCircle2; // Keep check for now
         iconColor = COLORS.primary; // Or a neutral color
    }

    return (
        <View style={styles.item}>
            <IconComponent size={20} color={iconColor} style={styles.icon} />
            <Text style={styles.text}>{text}</Text>
        </View>
    );
};

const styles = StyleSheet.create({
    item: {
        flexDirection: 'row',
        alignItems: 'flex-start', // Align icon to top of text if it wraps
        marginBottom: 10,
    },
    icon: {
        marginRight: 10,
        marginTop: 2, // Align icon slightly lower if text is single line
    },
    text: {
        flex: 1, // Allow text to wrap
        fontSize: 15,
        color: COLORS.textMedium,
        lineHeight: 21, // Improve readability for wrapped text
    },
});

export default RecommendationItem;