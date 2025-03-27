import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { ArrowLeft, Bell } from 'lucide-react-native'; // Keep Bell for consistency? Or remove?
import { useNavigation } from '@react-navigation/native';
import { COLORS } from '../../theme/colors';

// Props: title, showBackButton, onNotificationPress (optional), profileInitial (optional)
const CustomHeader = ({ title, showBackButton = true, onNotificationPress, profileInitial }) => {
    const navigation = useNavigation();

    return (
        <View style={styles.headerContainer}>
            {/* Left Side */}
            <View style={styles.leftContainer}>
                {showBackButton && (
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconButton}>
                        <ArrowLeft size={24} color={COLORS.textDark} />
                    </TouchableOpacity>
                )}
            </View>

            {/* Center Title */}
            <Text style={styles.headerTitle} numberOfLines={1}>{title}</Text>

            {/* Right Side (Example with Notification and Profile) */}
            <View style={styles.rightContainer}>
                {onNotificationPress && (
                     <TouchableOpacity onPress={onNotificationPress} style={[styles.iconButton, styles.rightIcon]}>
                         <Bell size={24} color={COLORS.textDark} />
                     </TouchableOpacity>
                )}
                {profileInitial && (
                    <View style={styles.profileInitialCircle}>
                        <Text style={styles.profileInitialText}>{profileInitial}</Text>
                    </View>
                )}
                 {/* Add spacer if only one icon */}
                 {!onNotificationPress && profileInitial && <View style={{width: 34}} />}
                 {onNotificationPress && !profileInitial && <View style={{width: 34}} />}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
     headerContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 15, // Consistent padding
        paddingVertical: 12,
        backgroundColor: COLORS.headerBackground, // White background
        borderBottomWidth: 1,
        borderBottomColor: COLORS.border,
        width: '100%',
    },
    leftContainer: {
        minWidth: 40, // Ensure space even if no back button
        flexDirection: 'row',
        alignItems: 'center',
    },
    rightContainer: {
         minWidth: 40, // Ensure space for alignment
         flexDirection: 'row',
         alignItems: 'center',
         justifyContent: 'flex-end',
    },
    iconButton: {
        padding: 5,
    },
    rightIcon: {
       marginLeft: 10,
    },
    headerTitle: {
        flex: 1, // Allow title to take space but shrink
        fontSize: 18,
        fontWeight: '600',
        color: COLORS.textDark,
        textAlign: 'center', // Center the title
        marginHorizontal: 5, // Prevent touching icons directly
    },
    profileInitialCircle: {
        width: 32, // Slightly smaller for header consistency
        height: 32,
        borderRadius: 16,
        backgroundColor: COLORS.profileInitialBackground,
        justifyContent: 'center',
        alignItems: 'center',
        marginLeft: 10, // Space from notification icon
    },
    profileInitialText: {
        fontSize: 14, // Smaller font
        fontWeight: 'bold',
        color: COLORS.textDark,
    },
});

export default CustomHeader;