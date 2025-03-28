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
import { ArrowLeft, Pencil, Languages } from 'lucide-react-native'; // Header Icons
import { formatDistanceToNowStrict } from 'date-fns'; // For relative time

import { COLORS } from '../../theme/colors';
import * as api from '../../api/api';

// Import Components
import NPKCard from '../../components/FarmDetail/NPKCard'; // Reuse
import ReadingSliderCard from '../../components/SoilMonitoring/ReadingSliderCard'; // New
import StatusPill from '../../components/SoilMonitoring/StatusPill'; // New
import DeviceStatusCard from '../../components/SoilMonitoring/DeviceStatusCard'; // New

// Helper function for relative time
const formatTimeAgo = (isoString) => {
    if (!isoString) return 'Never';
    try {
        return formatDistanceToNowStrict(new Date(isoString), { addSuffix: true });
    } catch (e) {
        console.error("Error formatting time:", e);
        return 'Unknown';
    }
};

const SoilMonitoringScreen = ({ navigation }) => {
    const route = useRoute();
    const landId = route.params?.landId ?? null;
    const isFocused = useIsFocused();

    const [landDetails, setLandDetails] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [refreshing, setRefreshing] = useState(false);

    // Fetch data function (reuse pattern)
    const fetchData = useCallback(async (showLoadingIndicator = true) => {
        if (!landId) {
             setError("Land ID missing."); setIsLoading(false); setRefreshing(false); return;
        }
        if (showLoadingIndicator && !refreshing) setIsLoading(true);
        setError(null);

        try {
            // Only need land details, which includes readings and device
            const landRes = await api.getLand(landId);
            setLandDetails(landRes);
        } catch (err) {
            console.error("Failed to fetch soil monitoring data:", err);
            setError(err.message || "Failed to load monitoring data.");
        } finally {
             if (showLoadingIndicator || refreshing) setIsLoading(false);
             setRefreshing(false);
        }
    }, [landId, refreshing]);

    useEffect(() => { fetchData(true); }, [fetchData]); // Initial fetch
    useEffect(() => { if (isFocused) fetchData(false); }, [isFocused, fetchData]); // Refresh on focus

    const onRefresh = useCallback(() => { setRefreshing(true); }, []);

    // --- Action Handlers ---
    const handleEdit = () => Alert.alert("Edit", "Edit functionality WIP.");
    const handleLanguage = () => Alert.alert("Language", "Language change WIP.");
    const handleManageDevice = () => {
        if(landDetails?.assigned_device?.id){
             // Navigate to a specific device management screen if needed
             Alert.alert("Manage Device", `Manage Device ID: ${landDetails.assigned_device.id} (WIP)`);
             // Or navigate to LinkDevice screen for reassignment?
             // navigation.navigate('LinkDevice', { farmId: landDetails.farm_id, landId: landId, deviceId: landDetails.assigned_device.id });
        } else {
             // Navigate to LinkDevice screen to link one
             navigation.navigate('LinkDevice', { farmId: landDetails.farm_id, landId: landId });
        }
    };

    // --- Render Logic ---
    if (isLoading && !landDetails) { /* ... Loading state ... */ }
    if (error && !landDetails) { /* ... Fatal error state ... */ }
    if (!landDetails) { /* ... Not found state ... */ }

    const latestReading = landDetails?.latest_soil_reading;
    const device = landDetails?.assigned_device;
    const soilType = landDetails?.soil_type_detected || landDetails?.soil_type_manual;
    const lastReadingTime = latestReading?.timestamp || device?.last_seen_at;

    return (
        <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
             {/* Header */}
            <View style={styles.customHeader}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconButton}>
                    <ArrowLeft size={24} color={COLORS.textDark} />
                </TouchableOpacity>
                <Text style={styles.headerTitle} numberOfLines={1}>Soil Monitoring</Text>
                <View style={styles.headerRightIcons}>
                     <TouchableOpacity onPress={handleEdit} style={styles.iconButton}>
                         <Pencil size={20} color={COLORS.textDark} />
                     </TouchableOpacity>
                     <TouchableOpacity onPress={handleLanguage} style={[styles.iconButton, {marginLeft: 5}]}>
                         <Languages size={24} color={COLORS.textDark} />
                     </TouchableOpacity>
                </View>
            </View>
            {error && <Text style={styles.errorBanner}>{error}</Text>}

            <ScrollView
                contentContainerStyle={styles.scrollContent}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary}/>
                }
            >
                {/* Current Readings Section */}
                 <View style={styles.section}>
                     <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>Current Soil reading</Text>
                        {lastReadingTime && <Text style={styles.timestamp}>Updated {formatTimeAgo(lastReadingTime)}</Text>}
                    </View>
                     {latestReading ? (
                        <>
                            <View style={styles.npkContainer}>
                                <NPKCard label="Nitrogen" value={latestReading?.nitrogen_value} unit="ppm"/>
                                <NPKCard label="Phosphorus" value={latestReading?.phosphorus_value} unit="ppm"/>
                                <NPKCard label="Potassium" value={latestReading?.potassium_value} unit="ppm"/>
                            </View>
                             {/* Sliders */}
                             <ReadingSliderCard label="pH Levels" value={latestReading?.ph_value} type="ph" />
                             <ReadingSliderCard label="Moisture" value={latestReading?.moisture_value} unit="%" type="moisture" />
                            {/* Temps */}
                             <View style={styles.tempsContainer}>
                                 <NPKCard label="Soil Temperature" value={latestReading?.temperature_value} unit="°C"/>
                                 <NPKCard label="Air Temperature" value={latestReading?.air_temperature_value || '26'} unit="°C"/>
                                 {/* Add Humidity if available latestReading?.humidity_value */}
                             </View>
                             {/* Soil Type */}
                              <View style={styles.soilTypeContainer}>
                                 <Text style={styles.soilTypeLabel}>Detected Soil Type</Text>
                                 <Text style={styles.soilTypeValue}>{soilType || 'Not Available'}</Text>
                             </View>
                        </>
                     ) : (
                        <Text style={styles.noDataText}>No soil readings available.</Text>
                     )}
                 </View>

                  {/* Device Status Section */}
                  <View style={styles.section}>
                     <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>Device Status</Text>
                         {device?.status && <StatusPill status={device.status} />}
                    </View>
                    <Text style={styles.timestamp}>
                        Last Reading {formatTimeAgo(device?.last_seen_at)}
                    </Text>
                     {device ? (
                        <DeviceStatusCard device={device} />
                     ) : (
                        <Text style={styles.noDataText}>No device linked to this plot.</Text>
                     )}

                     <TouchableOpacity style={styles.manageButton} onPress={handleManageDevice}>
                        <Text style={styles.manageButtonText}>
                            {device ? 'Manage Device' : 'Link Device'}
                        </Text>
                    </TouchableOpacity>
                 </View>

            </ScrollView>
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
    // Header (reuse from previous screen)
    customHeader: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 15, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: COLORS.border, backgroundColor: COLORS.white },
    headerTitle: { flex: 1, fontSize: 18, fontWeight: '600', color: COLORS.textDark, textAlign: 'center', marginHorizontal: 10 },
    headerRightIcons: { flexDirection: 'row' },
    iconButton: { padding: 5 },
    // Scroll Content
    scrollContent: { paddingBottom: 40, paddingHorizontal: 15 },
    section: { marginTop: 20 },
     sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 5,
    },
    sectionTitle: { fontSize: 18, fontWeight: 'bold', color: COLORS.textDark },
    timestamp: { fontSize: 13, color: COLORS.textLight, marginBottom: 15 },
    npkContainer: { flexDirection: 'row', justifyContent: 'space-between', marginHorizontal: -5, marginBottom: 15 },
    tempsContainer: { flexDirection: 'row', justifyContent: 'space-between', marginHorizontal: -5, marginTop: 15 },
    soilTypeContainer: {
        backgroundColor: COLORS.surface, borderRadius: 10, padding: 15, marginTop: 15,
        shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.08, shadowRadius: 2, elevation: 1.5,
    },
    soilTypeLabel: { fontSize: 14, color: COLORS.textLight, marginBottom: 5 },
    soilTypeValue: { fontSize: 16, color: COLORS.textDark, fontWeight: '500' },
    noDataText: { fontSize: 15, color: COLORS.textMedium, textAlign: 'center', fontStyle: 'italic', paddingVertical: 20 },
    manageButton: {
        backgroundColor: COLORS.primary,
        paddingVertical: 14,
        borderRadius: 10,
        alignItems: 'center',
        marginTop: 10,
        // Shadow
        shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.2, shadowRadius: 4, elevation: 4,
    },
    manageButtonText: { color: COLORS.white, fontSize: 16, fontWeight: 'bold' },
});

export default SoilMonitoringScreen;