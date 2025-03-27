import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Bell } from 'lucide-react-native';
import { COLORS } from '../../theme/colors';

// Assume userName is passed as a prop, potentially fetched in the parent screen
const DashboardHeader = ({ userName, onNotificationPress }) => {
    const profileInitial = userName ? userName.charAt(0).toUpperCase() : '?';

    return (
        <View style={styles.headerContainer}>
            <View style={styles.profileContainer}>
                <View style={styles.profileInitialCircle}>
                    <Text style={styles.profileInitialText}>{profileInitial}</Text>
                </View>
                <Text style={styles.greetingText}>Hello, {userName || 'User'}</Text>
            </View>
            <TouchableOpacity onPress={onNotificationPress} style={styles.iconButton}>
                <Bell size={24} color={COLORS.textDark} />
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    headerContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 15,
        backgroundColor: COLORS.headerBackground, // White background
        borderBottomWidth: 1,
        borderBottomColor: COLORS.border,
        width: '100%', // Ensure full width
    },
    profileContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    profileInitialCircle: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: COLORS.profileInitialBackground,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    profileInitialText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: COLORS.textDark,
    },
    greetingText: {
        fontSize: 18,
        fontWeight: '600',
        color: COLORS.textDark,
    },
    iconButton: {
        padding: 5, // Add padding for easier tapping
    },
});

export default DashboardHeader;