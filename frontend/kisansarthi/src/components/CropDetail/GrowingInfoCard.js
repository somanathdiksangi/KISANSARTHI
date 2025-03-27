import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS } from '../../theme/colors';
// Import specific icons as needed
import { CalendarDays, Droplets, TrendingUp } from 'lucide-react-native';

const GrowingInfoCard = ({ iconName, title, value, subValue }) => {
    // Map icon names to components
    const IconComponent = {
        calendar: CalendarDays,
        water: Droplets,
        yield: TrendingUp,
    }[iconName] || CalendarDays; // Default icon

    return (
        <View style={styles.card}>
             <View style={styles.header}>
                 <IconComponent size={18} color={COLORS.textMedium} style={styles.icon}/>
                <Text style={styles.title}>{title}</Text>
            </View>
            <Text style={styles.value}>{value || '--'}</Text>
            {subValue && <Text style={styles.subValue}>{subValue}</Text>}
        </View>
    );
};

const styles = StyleSheet.create({
    card: {
        backgroundColor: COLORS.surface,
        borderRadius: 10,
        padding: 15,
        marginBottom: 12,
         // Shadow
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.08,
        shadowRadius: 2,
        elevation: 1.5,
    },
     header: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    icon: {
        marginRight: 8,
    },
    title: {
        fontSize: 16,
        fontWeight: 'bold',
        color: COLORS.textDark,
    },
    value: {
        fontSize: 15,
        color: COLORS.textMedium,
        marginBottom: 4,
        fontWeight:'500',
    },
    subValue: {
        fontSize: 13,
        color: COLORS.textLight,
    },
});

export default GrowingInfoCard;