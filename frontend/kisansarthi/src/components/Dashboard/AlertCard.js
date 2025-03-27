import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { AlertTriangle } from 'lucide-react-native'; // Or other relevant icon
import { COLORS } from '../../theme/colors';

// Function to format time difference (simplified)
const formatTimeAgo = (timestamp) => {
    // Placeholder logic - use a library like 'date-fns' or 'moment' in production
    return timestamp ? "2h ago" : "Recently";
};

const AlertCard = ({ alert, onPress }) => {
    const title = alert?.title ?? 'Alert';
    const subtitle = alert?.reasoning ?? alert?.details ?? 'No details'; // Example logic
    const time = formatTimeAgo(alert?.recommendation_date);

    return (
        <TouchableOpacity style={styles.card} onPress={() => onPress(alert)}>
            <View style={styles.iconContainer}>
                <AlertTriangle size={22} color={COLORS.warning} />
            </View>
            <View style={styles.textContainer}>
                <Text style={styles.title} numberOfLines={1}>{title}</Text>
                <Text style={styles.subtitle} numberOfLines={1}>{subtitle}</Text>
            </View>
            <Text style={styles.time}>{time}</Text>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    card: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.surface,
        borderRadius: 10,
        padding: 12,
        marginBottom: 10,
        // Shadow
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.08,
        shadowRadius: 2,
        elevation: 1.5,
    },
    iconContainer: {
        marginRight: 12,
        // backgroundColor: COLORS.errorLight, // Optional background for icon
        // padding: 5,
        // borderRadius: 15,
    },
    textContainer: {
        flex: 1, // Take available space
        marginRight: 10,
    },
    title: {
        fontSize: 15,
        fontWeight: '600',
        color: COLORS.textDark,
        marginBottom: 2,
    },
    subtitle: {
        fontSize: 13,
        color: COLORS.textLight,
    },
    time: {
        fontSize: 12,
        color: COLORS.textLight,
        marginLeft: 'auto', // Push time to the right
    },
});

export default AlertCard;