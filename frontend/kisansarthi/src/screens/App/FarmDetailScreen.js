import React, { useState, useEffect, useCallback } from 'react';
import {
    StyleSheet,
    View,
    ScrollView,
    FlatList,
    ActivityIndicator,
    Text,
    TouchableOpacity,
    RefreshControl,
    Alert,
    Image, // For potential map snippet later
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRoute, useIsFocused } from '@react-navigation/native'; // isFocused to refresh on return
import { PlusCircle, MapPin, Server, Scaling } from 'lucide-react-native'; // Icons

import { COLORS } from '../../theme/colors';
import * as api from '../../api/api';

import CustomHeader from '../../components/Common/CustomHeader';
// Placeholder/New component for Land Plot Card
import LandPlotCard from '../../components/FarmDetail/LandPlotCard'; // We will create this next

const FarmDetailsScreen = ({ navigation }) => {
    const route = useRoute();
    const farmId = route.params?.farmId ?? null;
    const isFocused = useIsFocused(); // Hook to detect when screen becomes active

    const [farmDetails, setFarmDetails] = useState(null);
    const [landPlots, setLandPlots] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [refreshing, setRefreshing] = useState(false);

    const fetchData = useCallback(async (showLoadingIndicator = true) => {
        if (!farmId) {
             setError("Farm ID not provided.");
             setIsLoading(false);
             setRefreshing(false);
             return;
        }
        // Use loading indicator only on initial load or explicit refresh, not focus refresh
        if (showLoadingIndicator && !refreshing) setIsLoading(true);
        setError(null);

        try {
            // Fetch farm details and land plots concurrently
            const [farmRes, landsRes] = await Promise.all([
                api.getFarm(farmId),
                api.listLands(farmId, 100) // Fetch all lands for now, add pagination later if needed
            ]);

            setFarmDetails(farmRes);
            setLandPlots(landsRes?.lands ?? []);

        } catch (err) {
            console.error("Failed to fetch farm details/lands:", err);
            setError(err.message || "Failed to load farm data. Please try again.");
        } finally {
             if (showLoadingIndicator || refreshing) setIsLoading(false);
             setRefreshing(false);
        }
    }, [farmId, refreshing]);

    useEffect(() => {
        fetchData(true); // Fetch with loading indicator on initial mount/farmId change
    }, [farmId]); // Re-fetch if farmId changes

     useEffect(() => {
        // Re-fetch data without loading indicator when the screen comes into focus
        // Useful after adding/deleting a land plot
        if (isFocused) {
            console.log("FarmDetails focused, refreshing data quietly...");
            fetchData(false); // Fetch without setting isLoading=true
        }
    }, [isFocused, fetchData]); // Depend on isFocused and fetchData callback

    const onRefresh = useCallback(() => {
        setRefreshing(true); // fetchData will be called via useEffect
    }, []);

    // --- Calculated Summary Data ---
    const totalArea = landPlots.reduce((sum, plot) => sum + (plot.area || 0), 0).toFixed(1);
    // Assuming area_unit is consistent, otherwise more complex logic needed
    const areaUnit = landPlots.length > 0 ? landPlots[0].area_unit : '';
    const plotCount = landPlots.length;
    // Note: Device count isn't directly available from getFarm/listLands API calls.
    // We'd need another API call or backend modification. Showing plot count instead for now.

    // --- Navigation ---
    const handleAddLand = () => {
        navigation.navigate('AddLand', { farmId: farmId, farmName: farmDetails?.farm_name });
    };

    const handleLandPlotPress = (landId) => {
        navigation.navigate('LandDetail', { landId: landId }); // Navigate to the RENAMED screen
    };

    // --- Render ---
    const renderLandPlot = ({ item }) => (
        <LandPlotCard land={item} onPress={() => handleLandPlotPress(item.id)} />
    );

    const renderEmptyList = () => (
        <View style={styles.emptyContainer}>
            <Scaling size={60} color={COLORS.placeholder} />
            <Text style={styles.emptyText}>No land plots added to this farm yet.</Text>
            <Text style={styles.emptySubText}>Tap the button below to add your first plot.</Text>
        </View>
    );

    if (isLoading) {
        return (
            <SafeAreaView style={styles.safeArea}>
                <CustomHeader title="Loading Farm..." showBackButton={true}/>
                <View style={styles.center}><ActivityIndicator size="large" color={COLORS.primary} /></View>
            </SafeAreaView>
        );
    }

     if (error && !farmDetails) { // Show critical error if farm details failed
        return (
            <SafeAreaView style={styles.safeArea}>
                <CustomHeader title="Error" showBackButton={true}/>
                <View style={styles.center}>
                    <Text style={styles.errorText}>{error}</Text>
                    <TouchableOpacity onPress={() => fetchData(true)} style={styles.retryButton}>
                        <Text style={styles.retryButtonText}>Retry</Text>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        );
    }


    return (
        <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
             <CustomHeader title={farmDetails?.farm_name ?? 'Farm Details'} showBackButton={true} />
             {/* Display non-critical errors below header */}
             {error && <Text style={styles.errorBanner}>{error}</Text>}

            <FlatList
                data={landPlots}
                renderItem={renderLandPlot}
                keyExtractor={(item) => item.id.toString()}
                ListHeaderComponent={
                    // Farm Summary Section
                    <View style={styles.summaryContainer}>
                        {/* Address/Location Row */}
                        {farmDetails?.address && (
                             <View style={styles.infoRow}>
                                <MapPin size={16} color={COLORS.textMedium} style={styles.infoIcon} />
                                <Text style={styles.infoText} numberOfLines={2}>{farmDetails.address}</Text>
                            </View>
                         )}
                         {/* Stats Row */}
                         <View style={styles.statsRow}>
                             <View style={styles.statItem}>
                                 <Scaling size={18} color={COLORS.primary} />
                                 <Text style={styles.statValue}>{totalArea} {areaUnit}</Text>
                                 <Text style={styles.statLabel}>Total Area</Text>
                             </View>
                              <View style={styles.statItem}>
                                 <Server size={18} color={COLORS.primary} />
                                 <Text style={styles.statValue}>{plotCount}</Text>
                                 <Text style={styles.statLabel}>Land Plots</Text>
                             </View>
                             {/* Placeholder for Devices */}
                             {/* <View style={styles.statItem}>
                                 <Wifi size={18} color={COLORS.primary} />
                                 <Text style={styles.statValue}>?</Text>
                                 <Text style={styles.statLabel}>Devices</Text>
                             </View> */}
                         </View>
                        <Text style={styles.listTitle}>Land Plots</Text>
                    </View>
                }
                ListEmptyComponent={renderEmptyList}
                contentContainerStyle={styles.listContentContainer}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary}/>
                }
            />

            {/* Floating Action Button to Add Land */}
            <TouchableOpacity style={styles.fab} onPress={handleAddLand}>
                <PlusCircle size={30} color={COLORS.white} fill={COLORS.primary} />
                 <Text style={styles.fabText}>Add Land</Text>
            </TouchableOpacity>
        </SafeAreaView>
    );
};

// --- Styles ---
const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    errorText: {
        color: COLORS.error,
        textAlign: 'center',
        marginBottom: 15,
        fontSize: 16,
    },
     errorBanner: { // Non-critical error display
        backgroundColor: COLORS.errorLight,
        color: COLORS.error,
        padding: 10,
        textAlign: 'center',
        fontSize: 14,
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
     listContentContainer: {
        paddingBottom: 100, // Space for FAB
        flexGrow: 1, // Important for empty list centering
    },
     summaryContainer: {
        backgroundColor: COLORS.white,
        paddingHorizontal: 20,
        paddingVertical: 15,
        marginBottom: 10,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.border,
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 15,
    },
    infoIcon: {
        marginRight: 8,
    },
    infoText: {
        fontSize: 15,
        color: COLORS.textMedium,
        flex: 1, // Allow text to wrap
    },
    statsRow: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginBottom: 20,
    },
    statItem: {
        alignItems: 'center',
        paddingHorizontal: 10,
    },
    statValue: {
        fontSize: 18,
        fontWeight: 'bold',
        color: COLORS.textDark,
        marginTop: 5,
    },
    statLabel: {
        fontSize: 13,
        color: COLORS.textLight,
        marginTop: 2,
    },
     listTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: COLORS.textDark,
        marginTop: 10, // Space above list title within summary
    },
     emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 40,
        marginTop: 50, // Push down from summary header
    },
    emptyText: {
        fontSize: 18,
        fontWeight: '600',
        color: COLORS.textMedium,
        textAlign: 'center',
        marginTop: 20,
    },
    emptySubText: {
        fontSize: 15,
        color: COLORS.textLight,
        textAlign: 'center',
        marginTop: 10,
    },
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
        // Shadow
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

export default FarmDetailsScreen;