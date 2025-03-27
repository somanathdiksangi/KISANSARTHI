import React, { useState, useEffect, useCallback } from 'react';
import {
    StyleSheet,
    View,
    FlatList, // Use FlatList for performance
    ActivityIndicator,
    Text,
    TouchableOpacity,
    RefreshControl,
    Alert,
    Platform,
} from 'react-native';
import { ArrowLeft } from 'lucide-react-native';
import { ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRoute } from '@react-navigation/native';
import { SlidersHorizontal, Languages } from 'lucide-react-native'; // Icons for header
import * as Haptics from 'expo-haptics'; // For feedback on selection

import { COLORS } from '../../theme/colors';
import * as api from '../../api/api';

// Import Components
import CustomHeader from '../../components/Common/CustomHeader';
import SoilSummaryPill from '../../components/CropSuggestion/SoilSummaryPill';
import CropSuggestionCard from '../../components/CropSuggestion/CropSuggestionCard';

// Helper to format date
const formatDate = (isoString) => {
    if (!isoString) return '';
    try {
        return new Date(isoString).toLocaleDateString('en-US', {
            year: 'numeric', month: 'long', day: 'numeric'
        });
    } catch (e) {
        return 'Invalid Date';
    }
};

const CropSuggestionScreen = ({ navigation }) => {
    const route = useRoute();
    const landId = route.params?.landId ?? null;

    const [suggestions, setSuggestions] = useState([]);
    const [soilContext, setSoilContext] = useState({ timestamp: null, npkPh: null }); // Store context from API
    const [isLoading, setIsLoading] = useState(true);
    const [isSelecting, setIsSelecting] = useState(false); // Loading state for planting action
    const [error, setError] = useState(null);
    const [refreshing, setRefreshing] = useState(false);

    const fetchData = useCallback(async () => {
        if (!landId) {
             setError("Land ID not provided.");
             setIsLoading(false);
             setRefreshing(false);
             return;
        }
        if (!refreshing) setIsLoading(true);
        setError(null);

        try {
            const response = await api.getCropSuggestions(landId);
            setSuggestions(response?.suggestions ?? []);

            // Store context data from response (assuming API provides it)
            // Adjust keys based on your actual API response structure
            const contextNpkPh = response?.details || response?.soil_conditions; // Example keys
            setSoilContext({
                timestamp: response?.based_on_reading_ts,
                npkPh: {
                    n: contextNpkPh?.nitrogen_value,
                    p: contextNpkPh?.phosphorus_value,
                    k: contextNpkPh?.potassium_value,
                    ph: contextNpkPh?.ph_value,
                }
            });

        } catch (err) {
            console.error("Failed to fetch crop suggestions:", err);
            setError(err.message || "Failed to load suggestions. Please try again.");
        } finally {
             setIsLoading(false);
             setRefreshing(false);
        }
    }, [landId, refreshing]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const onRefresh = useCallback(() => {
        setRefreshing(true);
    }, []);

    // --- Action Handlers ---
    const handleFilterPress = () => Alert.alert("Filter", "Filtering options to be implemented.");
    const handleLanguagePress = () => Alert.alert("Language", "Language change to be implemented.");

    const handleViewDetails = (crop) => {
        // Navigate to a Crop Information screen (to be created)
        // navigation.navigate('CropInfo', { cropId: crop.id });
        Alert.alert("View Details", `Show details for ${crop?.crop_name} (Not implemented yet).`);
    };

    const handleSelectCrop = (crop) => {
        if (!crop || !crop.id) return;

        Alert.alert(
            "Confirm Planting",
            `Do you want to select "${crop.crop_name}" for planting on this plot?`,
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Select",
                    style: "default", // or "destructive" if it replaces something
                    onPress: async () => {
                        setIsSelecting(true);
                        setError(null); // Clear previous errors before trying
                        try {
                            // Call API to start planting
                            await api.startPlanting(landId, {
                                crop_id: crop.id,
                                planting_date: new Date().toISOString().split('T')[0], // Use today's date
                                // Add expected_harvest_date or notes if needed/available
                            });

                            // Provide haptic feedback on success
                            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

                            Alert.alert("Success", `"${crop.crop_name}" selected for planting!`);
                            // Navigate back to FarmDetail, potentially passing a flag to refresh data
                            navigation.goBack();

                        } catch (err) {
                             console.error("Failed to start planting:", err);
                             Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
                             setError(err.message || `Failed to select ${crop.crop_name}.`);
                             // Show error in an alert as well
                             Alert.alert("Error", err.message || `Failed to select ${crop.crop_name}.`);
                        } finally {
                            setIsSelecting(false);
                        }
                    },
                },
            ]
        );
    };

    // --- Render List Header ---
    const renderListHeader = () => (
        <View style={styles.headerContainer}>
            {soilContext.timestamp && (
                 <Text style={styles.contextText}>
                     Based on soil from {formatDate(soilContext.timestamp)}
                 </Text>
            )}
             <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.pillsContainer}>
                {soilContext.npkPh?.n !== undefined && <SoilSummaryPill label="N" value={soilContext.npkPh.n} />}
                {soilContext.npkPh?.p !== undefined && <SoilSummaryPill label="P" value={soilContext.npkPh.p} />}
                {soilContext.npkPh?.k !== undefined && <SoilSummaryPill label="K" value={soilContext.npkPh.k} />}
                {soilContext.npkPh?.ph !== undefined && <SoilSummaryPill label="pH" value={soilContext.npkPh.ph} />}
            </ScrollView>
             {/* Display overall error below pills if it occurred during selection */}
            {error && <Text style={styles.errorTextGlobal}>{error}</Text>}
        </View>
    );

    // --- Render List Empty ---
    const renderEmptyList = () => (
         <View style={styles.center}>
            {isLoading ? (
                <ActivityIndicator size="large" color={COLORS.primary} />
             ) : error ? (
                 <>
                    <Text style={styles.errorText}>{error}</Text>
                    <TouchableOpacity onPress={fetchData} style={styles.retryButton}>
                        <Text style={styles.retryButtonText}>Retry</Text>
                    </TouchableOpacity>
                 </>
             ) : (
                 <Text style={styles.emptyText}>No crop suggestions available for this plot.</Text>
             )}
         </View>
    );


    return (
        <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
            {/* Custom Header with specific icons */}
             <View style={styles.customHeader}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconButton}>
                    <ArrowLeft size={24} color={COLORS.textDark} />
                </TouchableOpacity>
                <Text style={styles.headerTitle} numberOfLines={1}>Crop Suggestion</Text>
                <View style={styles.headerRightIcons}>
                     <TouchableOpacity onPress={handleFilterPress} style={styles.iconButton}>
                         <SlidersHorizontal size={22} color={COLORS.textDark} />
                     </TouchableOpacity>
                     <TouchableOpacity onPress={handleLanguagePress} style={[styles.iconButton, {marginLeft: 5}]}>
                         <Languages size={24} color={COLORS.textDark} />
                     </TouchableOpacity>
                </View>
            </View>

            <FlatList
                data={suggestions}
                renderItem={({ item }) => (
                    <CropSuggestionCard
                        suggestion={item}
                        onSelect={handleSelectCrop}
                        onViewDetails={handleViewDetails}
                    />
                )}
                keyExtractor={(item) => item.crop.id.toString()}
                ListHeaderComponent={renderListHeader}
                ListEmptyComponent={renderEmptyList}
                contentContainerStyle={styles.listContentContainer}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary}/>
                }
                // Disable interaction while selecting a crop
                scrollEnabled={!isSelecting}
                pointerEvents={isSelecting ? 'none' : 'auto'}
            />
             {/* Global loading indicator for planting selection */}
             {isSelecting && (
                <View style={styles.selectionOverlay}>
                    <ActivityIndicator size="large" color={COLORS.primary} />
                    <Text style={styles.selectionText}>Selecting Crop...</Text>
                </View>
             )}
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    // Custom Header specific styles
    customHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 15,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.border,
        backgroundColor: COLORS.white,
    },
     headerTitle: {
        flex: 1,
        fontSize: 18,
        fontWeight: '600',
        color: COLORS.textDark,
        textAlign: 'center',
        marginHorizontal: 10,
    },
     headerRightIcons: {
        flexDirection: 'row',
     },
     iconButton: {
        padding: 5,
    },
     // Content styles
    listContentContainer: {
        paddingHorizontal: 15,
        paddingTop: 10,
        paddingBottom: 30,
        flexGrow: 1, // Ensure empty component can fill space
    },
     headerContainer: {
        marginBottom: 15,
        paddingHorizontal: 5, // Align with card padding
    },
    contextText: {
        fontSize: 13,
        color: COLORS.textMedium,
        marginBottom: 10,
        textAlign: 'left', // Align with pills
    },
     pillsContainer: {
        paddingBottom: 5, // Space below pills if they wrap
        marginBottom: 10,
    },
    center: { // Centering style for empty/loading/error state
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
        marginTop: 50, // Push down from header
    },
     emptyText: {
        fontSize: 16,
        color: COLORS.textMedium,
        textAlign: 'center',
    },
    errorText: {
        color: COLORS.error,
        textAlign: 'center',
        marginBottom: 15,
        fontSize: 16,
    },
     errorTextGlobal: { // Error shown below pills
        color: COLORS.error,
        fontSize: 14,
        textAlign: 'center',
        marginTop: 10,
    },
    retryButton: {
        backgroundColor: COLORS.primary,
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 8,
        marginTop: 10,
    },
    retryButtonText: {
        color: COLORS.white,
        fontWeight: 'bold',
    },
    // Selection Overlay
     selectionOverlay: {
        ...StyleSheet.absoluteFillObject, // Cover entire screen
        backgroundColor: 'rgba(255, 255, 255, 0.8)', // Semi-transparent white
        justifyContent: 'center',
        alignItems: 'center',
    },
    selectionText: {
        marginTop: 10,
        fontSize: 16,
        color: COLORS.textDark,
        fontWeight: '500',
    },
});

export default CropSuggestionScreen;