import React, { useState, useEffect } from 'react';
import {
    StyleSheet,
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    ActivityIndicator,
    Alert,
    SafeAreaView,
} from 'react-native';
import { UserCircle, Mail, Phone, LogOut } from 'lucide-react-native'; // Icons

import { useAuth } from '../../context/AuthContext'; // Import useAuth hook
import * as api from '../../api/api'; // Import API functions
import { COLORS } from '../../theme/colors';
import CustomHeader from '../../components/Common/CustomHeader'; // Reuse header

const ProfileScreen = ({ navigation }) => {
    const { logout } = useAuth(); // Get logout function from context
    const [userData, setUserData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchUserData = async () => {
            setIsLoading(true);
            setError(null);
            try {
                const data = await api.getCurrentUser();
                setUserData(data);
            } catch (err) {
                console.error("Failed to fetch user data:", err);
                setError(err.message || "Could not load profile.");
            } finally {
                setIsLoading(false);
            }
        };
        fetchUserData();
    }, []); // Fetch data on mount

    const handleLogout = () => {
        Alert.alert(
            "Confirm Logout",
            "Are you sure you want to logout?",
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Logout",
                    style: "destructive",
                    onPress: async () => {
                        await logout(); // Call logout from AuthContext
                        // Navigation will automatically switch via AppNavigator reacting to context change
                    },
                },
            ]
        );
    };

    const renderContent = () => {
        if (isLoading) {
            return <ActivityIndicator size="large" color={COLORS.primary} style={styles.center} />;
        }
        if (error) {
            return <Text style={[styles.center, styles.errorText]}>{error}</Text>;
        }
        if (!userData) {
            return <Text style={styles.center}>Could not load user data.</Text>;
        }

        return (
            <View style={styles.content}>
                {/* User Info Section */}
                <View style={styles.infoSection}>
                     <View style={styles.infoRow}>
                         <UserCircle size={22} color={COLORS.textMedium} style={styles.infoIcon} />
                         <View style={styles.infoTextContainer}>
                             <Text style={styles.infoLabel}>Name</Text>
                            <Text style={styles.infoValue}>{userData.name || 'N/A'}</Text>
                         </View>
                     </View>
                     <View style={styles.separator} />
                     <View style={styles.infoRow}>
                         <Mail size={22} color={COLORS.textMedium} style={styles.infoIcon} />
                         <View style={styles.infoTextContainer}>
                             <Text style={styles.infoLabel}>Email</Text>
                            <Text style={styles.infoValue}>{userData.email || 'N/A'}</Text>
                        </View>
                    </View>
                    <View style={styles.separator} />
                    <View style={styles.infoRow}>
                         <Phone size={22} color={COLORS.textMedium} style={styles.infoIcon} />
                         <View style={styles.infoTextContainer}>
                             <Text style={styles.infoLabel}>Phone</Text>
                             <Text style={styles.infoValue}>{userData.phone_number || 'N/A'}</Text>
                        </View>
                    </View>
                </View>

                {/* Logout Button */}
                <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
                    <LogOut size={20} color={COLORS.error} style={styles.logoutIcon} />
                    <Text style={styles.logoutButtonText}>Logout</Text>
                </TouchableOpacity>
            </View>
        );
    };

    return (
        <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
            <CustomHeader title="Profile" showBackButton={false} />
            <ScrollView contentContainerStyle={styles.scrollContent}>
                {renderContent()}
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: COLORS.background,
        marginTop: 40
    },
    scrollContent: {
        flexGrow: 1,
        padding: 20,
    },
    center: { // For loading/error
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    errorText: {
        color: COLORS.error,
        textAlign: 'center',
        fontSize: 16,
    },
    content: {
        flex: 1,
    },
    infoSection: {
        backgroundColor: COLORS.white,
        borderRadius: 12,
        paddingVertical: 10, // Padding inside the white box
        marginBottom: 30,
         // Shadow
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 2,
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 15,
        paddingVertical: 15, // Padding between rows
    },
    infoIcon: {
        marginRight: 15,
    },
    infoTextContainer: {
        flex: 1,
    },
    infoLabel: {
        fontSize: 13,
        color: COLORS.textLight,
        marginBottom: 3,
    },
    infoValue: {
        fontSize: 16,
        color: COLORS.textDark,
        fontWeight: '500',
    },
    separator: {
        height: 1,
        backgroundColor: COLORS.border,
        marginHorizontal: 15, // Indent separator slightly
    },
    logoutButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: COLORS.errorLight, // Light red background
        paddingVertical: 14,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: COLORS.error, // Red border
    },
    logoutIcon: {
        marginRight: 10,
    },
    logoutButtonText: {
        color: COLORS.error, // Red text
        fontSize: 16,
        fontWeight: '600',
    },
});

export default ProfileScreen;