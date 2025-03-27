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
import { useRoute } from '@react-navigation/native';
import { SlidersHorizontal, Languages, ArrowLeft, AlertTriangle as DisclaimerIcon } from 'lucide-react-native'; // Icons

import { COLORS } from '../../theme/colors';
import * as api from '../../api/api';

// Import Components
import NPKCard from '../../components/FarmDetail/NPKCard'; // Reuse from LandDetail
import FertilizerRecCard from '../../components/FertilizerRec/FertilizerRecCard'; // New Card

// Helper to format date (reuse from CropSuggestionScreen if moved to utils)
const formatDate = (isoString) => {
    if (!isoString) return '';
    try {
        return new Date(isoString).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    } catch (e) { return 'Invalid Date'; }
};

const FertilizerRecommendationScreen = ({ navigation }) => {
    const route = useRoute();
    const landId = route.params?.landId ?? null;

    const [recommendations, setRecommendations] = useState([]);
    const [landDetails, setLandDetails] = useState(null); // To get area/name/latest readings
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [refreshing, setRefreshing] = useState(false);

    const fetchData = useCallback(async (showLoadingIndicator = true) => {
        if (!landId) {
             setError("Land ID not provided.");
             setIsLoading(false); setRefreshing(false); return;
        }
        if (showLoadingIndicator && !refreshing) setIsLoading(true);
        setError(null);

        try {
            // Fetch land details (for context) and recommendations concurrently
            const [landRes, recRes] = await Promise.all([
                api.getLand(landId), // Get context like area, name, latest NPK
                api.getFertilizerRecommendations(landId),
            ]);

            setLandDetails(landRes); // Store land details
            setRecommendations(recRes?.recommendations ?? []); // Store recommendations

        } catch (err) {
            console.error("Failed to fetch fertilizer recommendations:", err);
            setError(err.message || "Failed to load recommendations.");
        } finally {
             if (showLoadingIndicator || refreshing) setIsLoading(false);
             setRefreshing(false);
        }
    }, [landId, refreshing]);

    useEffect(() => {
        fetchData(true); // Initial fetch
    }, [fetchData]);

    const onRefresh = useCallback(() => {
        setRefreshing(true); // fetchData called via useEffect
    }, []);

    // --- Action Handlers ---
    const handleFilterPress = () => Alert.alert("Filter", "Filter/Sort options WIP.");
    const handleLanguagePress = () => Alert.alert("Language", "Language change WIP.");

    // --- Render Logic ---
    if (isLoading && !landDetails) { // Loading state before any data is available
        return ( <SafeAreaView style={styles.safeArea}><View style={styles.customHeader}><TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconButton}><ArrowLeft size={24} color={COLORS.textDark} /></TouchableOpacity><Text style={styles.headerTitle}>Loading...</Text><View style={{width: 50}} /></View><View style={styles.center}><ActivityIndicator size="large" color={COLORS.primary} /></View></SafeAreaView> );
    }
     if (error && !landDetails) { // Fatal error state
        return ( <SafeAreaView style={styles.safeArea}><View style={styles.customHeader}><TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconButton}><ArrowLeft size={24} color={COLORS.textDark} /></TouchableOpacity><Text style={styles.headerTitle}>Error</Text><View style={{width: 50}} /></View><View style={styles.center}><Text style={styles.errorText}>{error}</Text><TouchableOpacity onPress={() => fetchData(true)} style={styles.retryButton}><Text style={styles.retryButtonText}>Retry</Text></TouchableOpacity></View></SafeAreaView> );
    }
     if (!landDetails) { // Handle case where landId was invalid but no error thrown explicitly
         return ( <SafeAreaView style={styles.safeArea}><View style={styles.customHeader}><TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconButton}><ArrowLeft size={24} color={COLORS.textDark} /></TouchableOpacity><Text style={styles.headerTitle}>Not Found</Text><View style={{width: 50}} /></View><View style={styles.center}><Text>Could not load land details.</Text></View></SafeAreaView> );
    }

    // Derived data from landDetails for display
    const areaDisplay = `${landDetails.area || '--'} ${landDetails.area_unit || ''}`;
    const farmTitle = landDetails.current_planting?.crop?.crop_name
        ? `${landDetails.current_planting.crop.crop_name} Farm`
        : landDetails.land_name || 'Farm Details'; // Fallback title
    const latestReading = landDetails.latest_soil_reading;
    const analysisDate = latestReading?.timestamp ? formatDate(latestReading.timestamp) : null;


    return (
        <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
            {/* Header */}
            <View style={styles.customHeader}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconButton}>
                    <ArrowLeft size={24} color={COLORS.textDark} />
                </TouchableOpacity>
                <Text style={styles.headerTitle} numberOfLines={1}>Fertiliser Recommendation</Text>
                <View style={styles.headerRightIcons}>
                     <TouchableOpacity onPress={handleFilterPress} style={styles.iconButton}>
                         <SlidersHorizontal size={22} color={COLORS.textDark} />
                     </TouchableOpacity>
                     <TouchableOpacity onPress={handleLanguagePress} style={[styles.iconButton, {marginLeft: 5}]}>
                         <Languages size={24} color={COLORS.textDark} />
                     </TouchableOpacity>
                </View>
            </View>
             {/* Display non-fatal errors below header */}
             {error && <Text style={styles.errorBanner}>{error}</Text>}

            <ScrollView
                contentContainerStyle={styles.scrollContent}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary}/>
                }
            >
                 {/* Top Info Section */}
                <View style={styles.topInfoContainer}>
                    <View style={styles.topLeftInfo}>
                        <Text style={styles.areaLabel}>Area</Text>
                        <Text style={styles.areaValue}>{areaDisplay}</Text>
                    </View>
                    <Text style={styles.farmTitle} numberOfLines={2}>{farmTitle}</Text>
                </View>

                {/* Soil Analysis Results Section */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Soil Analysis Results</Text>
                    {analysisDate && <Text style={styles.analysisDate}>Based on soil from {analysisDate}</Text>}
                    {latestReading ? (
                        <View style={styles.npkContainer}>
                            <NPKCard label="Nitrogen" value={latestReading?.nitrogen_value} unit="ppm"/>
                            <NPKCard label="Phosphorus" value={latestReading?.phosphorus_value} unit="ppm"/>
                            <NPKCard label="Potassium" value={latestReading?.potassium_value} unit="ppm"/>
                        </View>
                     ) : (
                        <Text style={styles.noDataText}>No recent soil data available.</Text>
                     )}
                </View>

                {/* Recommendations List */}
                <View style={styles.section}>
                <Text style={styles.sectionTitle}>Recommended Fertilizer</Text>

                     {/* Optional: Add a title like "Recommendations" if needed */}
                     {isLoading && recommendations.length === 0 && <ActivityIndicator color={COLORS.primary} style={{marginTop: 20}}/>}
                    {!isLoading && recommendations.length === 0 && !error && (
                        <Text style={styles.noDataText}>No specific fertilizer recommendations at this time.</Text>
                     )}
                    {recommendations.map((rec, index) => (
                        <FertilizerRecCard key={`rec-${index}`} recommendation={rec} />
                    ))}
                </View>

                {/* Disclaimer */}
                <View style={styles.disclaimerBox}>
                     <DisclaimerIcon size={18} color={COLORS.warning} style={styles.disclaimerIcon}/>
                    <Text style={styles.disclaimerText}>
                        Adjust amounts based on specific product labels and local conditions.
                    </Text>
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
    scrollContent: { paddingBottom: 40 },
    // Top Info (reuse styles from LandDetail, potentially adjust)
    topInfoContainer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', paddingVertical: 15, paddingHorizontal: 20, marginBottom: 0, backgroundColor: COLORS.white, borderBottomWidth: 1, borderBottomColor: COLORS.border },
    topLeftInfo: { flexShrink: 1, marginRight: 10 },
    areaLabel: { fontSize: 13, color: COLORS.textLight, marginBottom: 2 },
    areaValue: { fontSize: 20, fontWeight: 'bold', color: COLORS.textDark },
    farmTitle: { fontSize: 18, fontWeight: 'bold', color: COLORS.textDark, textAlign: 'right', maxWidth: '55%' },
    // Sections
    section: { marginTop: 20, paddingHorizontal: 15 },
    sectionTitle: { fontSize: 18, fontWeight: 'bold', color: COLORS.textDark, marginBottom: 10 },
    analysisDate: { fontSize: 13, color: COLORS.textMedium, marginBottom: 15 },
    npkContainer: { flexDirection: 'row', justifyContent: 'space-between', marginHorizontal: -5 }, // Counteract NPKCard margin
    noDataText: { fontSize: 15, color: COLORS.textMedium, textAlign: 'center', fontStyle: 'italic', paddingVertical: 20 },
    // Disclaimer
    disclaimerBox: {
        flexDirection: 'row',
        backgroundColor: '#FFF9C4', // Light yellow background
        borderRadius: 8,
        paddingVertical: 12,
        paddingHorizontal: 15,
        marginHorizontal: 15,
        marginTop: 20,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: COLORS.warning, // Amber border
    },
    disclaimerIcon: {
         marginRight: 10,
    },
    disclaimerText: {
        flex: 1,
        fontSize: 13,
        color: '#795548', // Darker text color for yellow background
        lineHeight: 18,
    },
});

export default FertilizerRecommendationScreen;