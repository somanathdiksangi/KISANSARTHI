// src/screens/App/LandDetailScreen.js
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
import { useRoute, useIsFocused } from '@react-navigation/native';
import { MapPin, Leaf, Search, TestTubeDiagonal, BarChartHorizontal, PlusCircle } from 'lucide-react-native'; // Added/updated icons

import { COLORS } from '../../theme/colors';
import * as api from '../../api/api';

import CustomHeader from '../../components/Common/CustomHeader';
import ActionCard from '../../components/FarmDetail/ActionCard';
import NPKCard from '../../components/FarmDetail/NPKCard';
import AlertCard from '../../components/Dashboard/AlertCard';
import SectionHeader from '../../components/Common/SectionHeader'; // Updated path

const LandDetailScreen = ({ navigation }) => {
    const route = useRoute();
    const landId = route.params?.landId ?? null;
    const isFocused = useIsFocused(); // To refresh data when screen is focused

    const [landDetails, setLandDetails] = useState(null);
    const [alerts, setAlerts] = useState([]);
    const [userData, setUserData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [refreshing, setRefreshing] = useState(false);

    const fetchData = useCallback(async (showLoadingIndicator = true) => {
        if (!landId) {
             setError("Land ID not provided.");
             setIsLoading(false);
             setRefreshing(false);
             return;
        }
        // Use loading indicator only on initial load or explicit refresh
        if (showLoadingIndicator && !refreshing) setIsLoading(true);
        setError(null);

        try {
            const [userRes, landRes, alertRes] = await Promise.all([
                api.getCurrentUser(),
                api.getLand(landId),
                api.getRecommendations({ land_id: landId, limit: 3, type:'alert' }), // Fetch only alerts type for this section
            ]);

            setUserData(userRes);
            setLandDetails(landRes);
            setAlerts(alertRes?.recommendations ?? []);
            console.log(alertRes)

        } catch (err) {
            console.error("Failed to fetch land details:", err);
            setError(err.message || "Failed to load details. Please try again.");
        } finally {
             if (showLoadingIndicator || refreshing) setIsLoading(false);
             setRefreshing(false);
        }
    }, [landId, refreshing]); // Depend on landId and refreshing

    useEffect(() => {
        fetchData(true); // Initial fetch
    }, [landId]); // Re-run if landId changes (shouldn't normally happen without navigating away)

     useEffect(() => {
        // Refresh data quietly when screen comes into focus
        if (isFocused) {
            fetchData(false);
        }
    }, [isFocused, fetchData]);

    const onRefresh = useCallback(() => {
        setRefreshing(true); // fetchData called via useEffect
    }, []);

    // --- Navigation Handlers ---
    const handleNotificationPress = () => Alert.alert("Navigate", "Go to Notifications");
    const handleCropSuggestion = () => navigation.navigate('CropSuggestion', { landId: landId });
    const handleDiagnoseDisease = () => navigation.navigate('Scan');
    const handleFertiliserRec = () => Alert.alert("Navigate", "Go to Fertiliser Recommendations (WIP)");
    const handleSoilMonitoring = () => Alert.alert("Navigate", "Go to Soil Monitoring History (WIP)");
    const handleViewMonitoring = () => handleSoilMonitoring();
    const handleAlertPress = (alert) => Alert.alert("Navigate", `View Alert: ${alert.title} (WIP)`);
    // --- NEW: Handler for Add Planting FAB ---
    const handleAddPlanting = () => {
        // Navigate to Crop Suggestion screen to select a crop first
        navigation.navigate('CropSuggestion', { landId: landId });
    };
    const handleManagePlanting = () => {
        // Navigate to a screen to view/edit the current planting details (e.g., mark as harvested)
        Alert.alert("Manage Planting", `Manage current planting (ID: ${landDetails?.current_planting?.id}) - WIP`);
    };

    // --- Render Logic ---
    // Loading and Error States (keep as before)
    if (isLoading && !landDetails) { // Show loading only if no data yet
        return ( <SafeAreaView style={styles.safeArea}><CustomHeader title="Loading..." /><View style={styles.center}><ActivityIndicator size="large" color={COLORS.primary} /></View></SafeAreaView> );
    }
    if (error && !landDetails) { // Show fatal error only if no data loaded
        return ( <SafeAreaView style={styles.safeArea}><CustomHeader title="Error" /><View style={styles.center}><Text style={styles.errorText}>{error}</Text><TouchableOpacity onPress={() => fetchData(true)} style={styles.retryButton}><Text style={styles.retryButtonText}>Retry</Text></TouchableOpacity></View></SafeAreaView> );
    }
    if (!landDetails) { // Handle case where landId was invalid or fetch failed quietly after initial load attempt
         return ( <SafeAreaView style={styles.safeArea}><CustomHeader title="Not Found" /><View style={styles.center}><Text>Could not load land details.</Text></View></SafeAreaView> );
    }

    // Data derived from landDetails
    const currentPlanting = landDetails.current_planting;
    const areaDisplay = `${landDetails.area || '--'} ${landDetails.area_unit || ''}`;
    const locationDisplay = `Farm: ${landDetails.farm_name || 'Unknown'} - ${landDetails.land_name || 'Unnamed Plot'}`;
    const farmTitle = currentPlanting?.crop?.crop_name
        ? `${currentPlanting.crop.crop_name}` // Just crop name for prominent title
        : 'No Crop Planted '; // Title when empty

    const latestReading = landDetails.latest_soil_reading;
    const userInitial = userData?.name ? userData.name.charAt(0).toUpperCase() : '?';

    return (
        <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
            <CustomHeader
                title={userData?.name ? `Hello, ${userData.name.split(' ')[0]}` : 'Details'}
                showBackButton={true}
                onNotificationPress={handleNotificationPress}
                profileInitial={userInitial}
            />
            {/* Display non-fatal errors */}
             {error && <Text style={styles.errorBanner}>{error}</Text>}

            <ScrollView
                 style={styles.scrollView}
                 contentContainerStyle={styles.scrollContentContainer}
                 refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary}/>
                }
            >
                {/* Top Info Section */}
                <View style={styles.topInfoContainer}>
                    <View style={styles.topLeftInfo}>
                        <Text style={styles.areaLabel}>Area</Text>
                        <Text style={styles.areaValue}>{areaDisplay}</Text>
                        <View style={styles.locationRow}>
                            <MapPin size={14} color={COLORS.textLight} style={styles.locationIcon} />
                            <Text style={styles.locationText} numberOfLines={2}>{locationDisplay}</Text>
                        </View>
                    </View>
                     {/* Prominent Title - Crop Name or "No Crop" */}
                     <View style={styles.topRightInfo}>
                        <Text style={[styles.farmTitle, !currentPlanting && styles.farmTitleEmpty]}>
                           {farmTitle}
                        </Text>
                        {/* Optional: Button to manage current planting */}
                        {currentPlanting && (
                             <TouchableOpacity onPress={handleManagePlanting} style={styles.manageButton}>
                                 <Text style={styles.manageButtonText}>Manage Planting</Text>
                             </TouchableOpacity>
                        )}
                    </View>
                </View>

                                 {/* Empty Planting State Message */}
                                 {!currentPlanting && !isLoading && (
                     <View style={styles.emptyPlantingContainer}>
                         <Leaf size={40} color={COLORS.placeholder} />
                        <Text style={styles.emptyPlantingText}>No active planting on this plot.</Text>
                        <Text style={styles.emptyPlantingSubText}>Select 'Add Planting' below to get started.</Text>
                    </View>
                 )}

                {/* Action Grid - Conditional Rendering */}
                <View style={styles.actionGridContainer}>
                    {currentPlanting && ( // Show suggestion only if NO crop
                         <View style={styles.actionGridRow}>
                            <ActionCard title="Crop Suggestion" onPress={handleCropSuggestion} imageUrl={'https://dummyjson.com/image/300x200/vegetables'}/>
                            <ActionCard title="Diagnosing Plant Disease" onPress={handleDiagnoseDisease} imageUrl={'https://dummyjson.com/image/300x200/leaf'}/>
                        </View>
                     )}
                     {currentPlanting && ( // Show fertiliser rec only if crop IS planted
                         <View style={styles.actionGridRow}>
                            <ActionCard title="Fertiliser Recommendation" onPress={handleFertiliserRec} imageUrl={'https://dummyjson.com/image/300x200/agriculture'}/>
                            <ActionCard title="Diagnosing Plant Disease" onPress={handleDiagnoseDisease} imageUrl={'https://dummyjson.com/image/300x200/leaf'}/>
                         </View>
                     )}
                    {/* Soil Monitoring is always available */}
                     <View style={styles.actionGridRow}>
                         {/* If only one card needed in a row, adjust styling or add placeholder */}
                        <ActionCard title="Soil Monitoring" onPress={handleSoilMonitoring} imageUrl={'https://dummyjson.com/image/300x200/dirt'}/>
                        <View style={styles.actionCardSpacer} />{/* Empty spacer to maintain layout */}
                    </View>
                 </View>

                {/* Current Soil Readings - Always show if available */}
                 {latestReading && (
                     <View style={styles.readingsSection}>
                        <SectionHeader title="Current Soil reading" onViewAll={handleViewMonitoring}/>
                        <View style={styles.npkContainer}>
                            <NPKCard label="Nitrogen" value={latestReading?.nitrogen_value} unit="ppm"/>
                            <NPKCard label="Phosphorus" value={latestReading?.phosphorus_value} unit="ppm"/>
                            <NPKCard label="Potassium" value={latestReading?.potassium_value} unit="ppm"/>
                        </View>
                         {/* Optionally add pH/Moisture cards here too */}
                          <View style={[styles.npkContainer, {marginTop: 10}]}>
                              <NPKCard label="pH" value={latestReading?.ph_value} unit=""/>
                              <NPKCard label="Moisture" value={latestReading?.moisture_value} unit="%"/>
                              <NPKCard label="Temp" value={latestReading?.temperature_value} unit="°C"/>
                          </View>
                    </View>
                 )}

                 {/* Recent Alerts - Always show if available */}
                 {alerts.length > 0 && (
                     <View style={styles.alertsSection}>
                        <SectionHeader title="Recent Alerts" />
                        {alerts.map(alert => (
                            <AlertCard key={`alert-${alert.id}`} alert={alert} onPress={handleAlertPress} />
                        ))}
                     </View>
                 )}

            </ScrollView>

             {/* Floating Action Button - Conditional Rendering */}
            {!currentPlanting && !isLoading && (
                <TouchableOpacity style={styles.fab} onPress={handleAddPlanting}>
                    <PlusCircle size={28} color={COLORS.white} fill={COLORS.primary} />
                    <Text style={styles.fabText}>Add Planting</Text>
                </TouchableOpacity>
             )}

        </SafeAreaView>
    );
};

// --- Styles ---
const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: COLORS.background },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
    errorText: { color: COLORS.error, textAlign: 'center', marginBottom: 15, fontSize: 16 },
    errorBanner: { backgroundColor: COLORS.errorLight, color: COLORS.error, padding: 10, textAlign: 'center', fontSize: 14 },
    retryButton: { backgroundColor: COLORS.primary, paddingVertical: 10, paddingHorizontal: 20, borderRadius: 8, marginTop: 10 },
    retryButtonText: { color: COLORS.white, fontWeight: 'bold' },
    scrollView: { flex: 1 },
    scrollContentContainer: { paddingBottom: 100, paddingHorizontal: 0 }, // Remove horizontal padding here, add to sections
    topInfoContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        paddingVertical: 15,
        paddingHorizontal: 20, // Add padding here
        marginBottom: 15,
        backgroundColor: COLORS.white, // White background for top section
        borderBottomWidth: 1,
        borderBottomColor: COLORS.border,
    },
    topLeftInfo: {
        flex: 1, // Take available space
        marginRight: 10,
    },
    topRightInfo: {
        alignItems: 'flex-end',
        maxWidth: '45%', // Prevent title overlap
    },
    areaLabel: { fontSize: 13, color: COLORS.textLight, marginBottom: 2 },
    areaValue: { fontSize: 20, fontWeight: 'bold', color: COLORS.textDark, marginBottom: 5 },
    locationRow: { flexDirection: 'row', alignItems: 'center' },
    locationIcon: { marginRight: 4 },
    locationText: { fontSize: 13, color: COLORS.textLight, flexShrink: 1 },
    farmTitle: {
        fontSize: 22, // Larger title
        fontWeight: 'bold',
        color: COLORS.textDark,
        textAlign: 'right',
    },
     farmTitleEmpty: {
        color: COLORS.textMedium, // Grey out if no crop
        fontStyle: 'italic',
        fontSize: 18, // Slightly smaller when empty
    },
    manageButton: {
        marginTop: 5,
        paddingVertical: 4,
        paddingHorizontal: 8,
        backgroundColor: COLORS.primaryLight,
        borderRadius: 6,
    },
    manageButtonText: {
        color: COLORS.primary,
        fontSize: 13,
        fontWeight: '500',
    },
    // Action Grid Styling
    actionGridContainer: {
        paddingHorizontal: 15, // Padding for the grid container
        marginBottom: 15,
    },
    actionGridRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 10, // Space between rows of grid
    },
    actionCardSpacer: { // Takes space of a card when only one is needed in a row
         flex: 1,
         margin: 6,
    },
    // Empty Planting State
    emptyPlantingContainer: {
        alignItems: 'center',
        paddingVertical: 40,
        paddingHorizontal: 30,
        marginHorizontal: 15, // Match section padding
        backgroundColor: COLORS.surface, // White background like cards
        borderRadius: 12,
        marginBottom: 20,
         // Shadow
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.06,
        shadowRadius: 2,
        elevation: 1,
    },
    emptyPlantingText: {
        fontSize: 18,
        fontWeight: '600',
        color: COLORS.textMedium,
        textAlign: 'center',
        marginTop: 15,
    },
    emptyPlantingSubText: {
        fontSize: 14,
        color: COLORS.textLight,
        textAlign: 'center',
        marginTop: 8,
    },
    // Readings and Alerts Sections
    readingsSection: { marginTop: 10, paddingHorizontal: 15 }, // Added padding
    npkContainer: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 5 },
    alertsSection: { marginTop: 20, paddingHorizontal: 15 }, // Added padding
    // FAB styling (reuse from FarmDetailsScreen example)
    fab: {
        position: 'absolute',
        right: 20,
        bottom: 30,
        backgroundColor: COLORS.primary,
        borderRadius: 30,
        paddingVertical: 12,
        paddingHorizontal: 15,
        flexDirection: 'row',
        alignItems: 'center',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 6,
    },
    fabText: {
        color: COLORS.white,
        fontSize: 16,
        fontWeight: 'bold',
        marginLeft: 8,
    },
});

export default LandDetailScreen;