import React, { useState, useEffect, useCallback } from 'react';
import {
    StyleSheet,
    View,
    ScrollView,
    ActivityIndicator,
    Text,
    TouchableOpacity,
    RefreshControl,
    Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRoute } from '@react-navigation/native'; // To get params
import { MapPin } from 'lucide-react-native';

import { COLORS } from '../../theme/colors';
import * as api from '../../api/api';

// Import Components
import CustomHeader from '../../components/Common/CustomHeader';
import ActionCard from '../../components/FarmDetail/ActionCard';
import NPKCard from '../../components/FarmDetail/NPKCard';
import AlertCard from '../../components/Dashboard/AlertCard'; // Reuse from Dashboard
import SectionHeader from '../../components/Common/SectionHeader';

const FarmDetailScreen = ({ navigation }) => {
    const route = useRoute();
    // Assume landId is passed, default to null if not found
    const landId = route.params?.landId ?? null;

    const [landDetails, setLandDetails] = useState(null);
    const [alerts, setAlerts] = useState([]);
    const [userData, setUserData] = useState(null); // For header profile initial
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [refreshing, setRefreshing] = useState(false);

    const fetchData = useCallback(async () => {
        if (!landId) {
             setError("Land ID not provided to detail screen.");
             setIsLoading(false);
             setRefreshing(false);
             return;
        }
        if (!refreshing) setIsLoading(true);
        setError(null);

        try {
            const [userRes, landRes, alertRes] = await Promise.all([
                api.getCurrentUser(),
                api.getFarm(landId),
                api.getRecommendations({ land_id: landId, limit: 3 }), // Fetch alerts/recs for this land
            ]);

            setUserData(userRes);
            setLandDetails(landRes);
            // Filter for alerts if needed, or just display recent recommendations
            setAlerts(alertRes?.recommendations?.filter(r => r.title?.toLowerCase().includes('low') || r.title?.toLowerCase().includes('alert')) ?? []); // Example filter

        } catch (err) {
            console.error("Failed to fetch farm/land details:", err);
            setError(err.message || "Failed to load details. Please try again.");
        } finally {
             setIsLoading(false);
             setRefreshing(false);
        }
    }, [landId, refreshing]); // Depend on landId and refreshing

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const onRefresh = useCallback(() => {
        setRefreshing(true);
    }, []);

    // --- Navigation Handlers ---
    const handleNotificationPress = () => Alert.alert("Navigate", "Go to Notifications");
    const handleCropSuggestion = () => {
        if (!landId) {
            Alert.alert("Error", "Cannot get suggestions. Land ID is missing.");
            return;
        }
        // ++ Navigate to CropSuggestion with landId ++
        navigation.navigate('CropSuggestion', { landId: landId });
        // -- Remove Alert --
        // Alert.alert("Navigate", "Go to Crop Suggestions");
    };

    const handleDiagnoseDisease = () => navigation.navigate('Scan'); // Navigate to Scan Tab
    const handleFertiliserRec = () => Alert.alert("Navigate", "Go to Fertiliser Recommendations");
    const handleSoilMonitoring = () => Alert.alert("Navigate", "Go to Soil Monitoring History");
    const handleViewMonitoring = () => handleSoilMonitoring(); // Same action
    const handleAlertPress = (alert) => Alert.alert("Navigate", `View Alert: ${alert.title}`);

    // --- Render Logic ---
    if (isLoading) {
        return (
            <SafeAreaView style={styles.safeArea}>
                <CustomHeader title="Loading..." />
                <View style={styles.center}>
                    <ActivityIndicator size="large" color={COLORS.primary} />
                </View>
            </SafeAreaView>
        );
    }

    if (error) {
        return (
            <SafeAreaView style={styles.safeArea}>
                <CustomHeader title="Error" />
                <View style={styles.center}>
                    <Text style={styles.errorText}>{error}</Text>
                    <TouchableOpacity onPress={fetchData} style={styles.retryButton}>
                        <Text style={styles.retryButtonText}>Retry</Text>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        );
    }

    if (!landDetails) {
         return ( // Handle case where landId was invalid or fetch failed quietly
            <SafeAreaView style={styles.safeArea}>
                <CustomHeader title="Not Found" />
                <View style={styles.center}>
                    <Text>Could not load land details.</Text>
                </View>
            </SafeAreaView>
        );
    }

    // Data derived from landDetails
    const areaDisplay = `${landDetails.area || '--'} ${landDetails.area_unit || ''}`;
    const locationDisplay = `Farm: ${landDetails.farm_name || 'Unknown'} - ${landDetails.land_name || 'Unnamed Plot'}`;
    const farmTitle = landDetails.current_planting?.crop?.crop_name
        ? `${landDetails.current_planting.crop.crop_name} Farm` // Or just the crop name
        : landDetails.land_name || 'Farm Details';

    const latestReading = landDetails.latest_soil_reading;
    const userInitial = userData?.name ? userData.name.charAt(0).toUpperCase() : '?';

    return (
        <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
            <CustomHeader
                title={userData?.name ? `Hello, ${userData.name.split(' ')[0]}` : 'Details'} // Header like mockup
                showBackButton={true}
                onNotificationPress={handleNotificationPress}
                profileInitial={userInitial} // Pass initial for header
            />
            <ScrollView
                 style={styles.scrollView}
                 contentContainerStyle={styles.scrollContentContainer}
                 refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary}/>
                }
            >
                {/* Top Info Section */}
                <View style={styles.topInfoContainer}>
                    <View>
                        <Text style={styles.areaLabel}>Area</Text>
                        <Text style={styles.areaValue}>{areaDisplay}</Text>
                        <View style={styles.locationRow}>
                            <MapPin size={14} color={COLORS.textLight} style={styles.locationIcon} />
                            <Text style={styles.locationText}>{locationDisplay}</Text>
                        </View>
                    </View>
                    <Text style={styles.farmTitle}>{farmTitle}</Text>
                </View>

                {/* Action Grid */}
                <View style={styles.actionGrid}>
                    <ActionCard title="Crop Suggestion" onPress={handleCropSuggestion} />
                    <ActionCard title="Diagnosing Plant Disease" onPress={handleDiagnoseDisease} />
                </View>
                 <View style={styles.actionGrid}>
                    <ActionCard title="Fertiliser Recommendation" onPress={handleFertiliserRec} />
                    <ActionCard title="Soil Monitoring" onPress={handleSoilMonitoring} />
                </View>

                {/* Current Soil Readings */}
                <View style={styles.readingsSection}>
                    <SectionHeader title="Current Soil reading" onViewAll={handleViewMonitoring}/>
                    <View style={styles.npkContainer}>
                         <NPKCard label="Nitrogen" value={latestReading?.nitrogen_value} unit="ppm"/>
                         <NPKCard label="Phosphorus" value={latestReading?.phosphorus_value} unit="ppm"/>
                         <NPKCard label="Potassium" value={latestReading?.potassium_value} unit="ppm"/>
                         {/* Add pH, Moisture etc. if needed */}
                    </View>
                </View>

                 {/* Recent Alerts */}
                 {alerts.length > 0 && (
                     <View style={styles.alertsSection}>
                        {/* Using same SectionHeader component */}
                        <SectionHeader title="Recent Alerts" />
                        {alerts.map(alert => (
                            <AlertCard key={`alert-${alert.id}`} alert={alert} onPress={handleAlertPress} />
                        ))}
                     </View>
                 )}

            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    center: { // Centering style for loading/error
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    errorText: {
        color: COLORS.error,
        textAlign: 'center',
        marginBottom: 15,
    },
    retryButton: {
        backgroundColor: COLORS.primary,
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 8,
    },
    retryButtonText: {
        color: COLORS.white,
        fontWeight: 'bold',
    },
    scrollView: {
        flex: 1,
    },
    scrollContentContainer: {
        paddingBottom: 30,
        paddingHorizontal: 15,
    },
    topInfoContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start', // Align items to the top
        paddingVertical: 15,
        paddingHorizontal: 5, // Slight inner padding
        marginBottom: 10,
    },
    areaLabel: {
        fontSize: 13,
        color: COLORS.textLight,
        marginBottom: 2,
    },
    areaValue: {
        fontSize: 20,
        fontWeight: 'bold',
        color: COLORS.textDark,
        marginBottom: 5,
    },
    locationRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    locationIcon: {
        marginRight: 4,
    },
    locationText: {
        fontSize: 13,
        color: COLORS.textLight,
        flexShrink: 1, // Allow text to wrap/shrink if long
    },
    farmTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: COLORS.textDark,
        textAlign: 'right',
        maxWidth: '50%', // Prevent title from overlapping too much
    },
    actionGrid: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 10, // Space between rows of grid
    },
     readingsSection: {
        marginTop: 20, // Space above readings
    },
    npkContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 5, // Space below section header
    },
    alertsSection: {
        marginTop: 20, // Space above alerts
    },
    // Reusing SectionHeader style from DashboardScreen styles example
});

export default FarmDetailScreen;