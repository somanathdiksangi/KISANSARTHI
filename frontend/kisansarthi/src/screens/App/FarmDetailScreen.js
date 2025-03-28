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
    ImageBackground,
    Image,
    Platform
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRoute, useIsFocused } from '@react-navigation/native';
import { PlusCircle, MapPin, Server, Scaling } from 'lucide-react-native';
import * as api from '../../api/api';
import CustomHeader from '../../components/Common/CustomHeader';
import LandPlotCard from '../../components/FarmDetail/LandPlotCard';
// import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated'; //Import Animated
import { BlurView } from 'expo-blur'; // Make sure you have expo-blur installed
import farmImage_default from '../../../assets/farm_background.png'

const COLORS = { // Adjusted Color Palette
    primary: '#33AACC', // A deeper, richer primary color
    secondary: '#03DAC5', // A vibrant accent color
    background: '#F7F9FC', // Light and airy background
    surface: '#FFFFFF', // Elevated surfaces
    textDark: '#212121',
    textMedium: '#757575',
    textLight: '#BDBDBD',
    placeholder: '#9E9E9E',
    error: '#B00020',
    errorLight: '#FCE4EC',
    border: '#E0E0E0',
    success: '#388E3C',
    successLight: '#E8F5E9',
    shadow: 'rgba(0, 0, 0, 0.1)',
    overlay: 'rgba(0, 0, 0, 0.4)',
    transparentWhite: 'rgba(255, 255, 255, 0.7)'
};

const FarmDetailsScreen = ({ navigation }) => {
    const route = useRoute();
    const farmId = route.params?.farmId ?? null;
    const isFocused = useIsFocused();

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
        if (showLoadingIndicator && !refreshing) setIsLoading(true);
        setError(null);

        try {
            const [farmRes, landsRes] = await Promise.all([
                api.getFarm(farmId),
                api.listLands(farmId, 100)
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
        fetchData(true);
    }, [farmId]);

    useEffect(() => {
        if (isFocused) {
            console.log("FarmDetails focused, refreshing data quietly...");
            fetchData(false);
        }
    }, [isFocused, fetchData]);

    const onRefresh = useCallback(() => {
        setRefreshing(true);
    }, []);

    const totalArea = landPlots.reduce((sum, plot) => sum + (plot.area || 0), 0).toFixed(1);
    const areaUnit = landPlots.length > 0 ? landPlots[0].area_unit : '';
    const plotCount = landPlots.length;

    const handleAddLand = () => {
        navigation.navigate('AddLand', { farmId: farmId, farmName: farmDetails?.farm_name });
    };

    const handleLandPlotPress = (landId) => {
        navigation.navigate('LandDetail', { landId: landId });
    };

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
                <CustomHeader title="Loading Farm..." showBackButton={true} />
                <View style={styles.center}><ActivityIndicator size="large" color={COLORS.primary} /></View>
            </SafeAreaView>
        );
    }

    if (error && !farmDetails) {
        return (
            <SafeAreaView style={styles.safeArea}>
                <CustomHeader title="Error" showBackButton={true} />
                <View style={styles.center}>
                    <Text style={styles.errorText}>{error}</Text>
                    <TouchableOpacity onPress={() => fetchData(true)} style={styles.retryButton}>
                        <Text style={styles.retryButtonText}>Retry</Text>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        );
    }

    const farmImage = farmDetails?.images?.[0]?.image_url;

    return (
        <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
            <CustomHeader title={farmDetails?.farm_name ?? 'Farm Details'} showBackButton={true} />
            {error && <Text style={styles.errorBanner}>{error}</Text>}

            <FlatList
                data={landPlots}
                renderItem={renderLandPlot}
                keyExtractor={(item) => item.id.toString()}
                ListHeaderComponent={
                    <View style={styles.summaryContainer}>
                       {farmImage || farmImage_default ? (
                            <ImageBackground
                                source={farmImage_default}
                                style={styles.farmImageBackground}
                                imageStyle={{ borderRadius: 12 }} // Round the corners
                            >
                                <BlurView intensity={30} style={StyleSheet.absoluteFill} tint="dark" />
                                <View style={styles.farmImageOverlay}>
                                    <Text style={styles.farmNameOnImage}>{farmDetails?.farm_name}</Text>
                                    {farmDetails?.address && (
                                        <View style={styles.infoRow}>
                                            <MapPin size={16} color={COLORS.transparentWhite} style={styles.infoIcon} />
                                            <Text style={[styles.infoText, { color: COLORS.transparentWhite }]}>{farmDetails.address}</Text>
                                        </View>
                                    )}
                                </View>
                            </ImageBackground>
                        ) : (
                            <View style={styles.noImagePlaceholder}>
                                 <Text style={styles.noImageText}>No Image Available</Text>
                            </View>
                        )}

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
                        </View>
                         <View style={styles.landPlotsTitleContainer}>
                             <Text style={styles.landPlotsTitle}>Land Plots</Text>
                        </View>

                    </View>
                }
                ListEmptyComponent={renderEmptyList}
                contentContainerStyle={styles.listContentContainer}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />
                }
            />

            <TouchableOpacity style={styles.fab} onPress={handleAddLand}>
                <Text style={styles.fabText}>+  Add Land</Text>
            </TouchableOpacity>
        </SafeAreaView>
    );
};

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
    errorBanner: {
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
        paddingBottom: 100,
        flexGrow: 1,
    },
    summaryContainer: {
        backgroundColor: COLORS.surface, // White surface
        borderRadius: 12,
        marginHorizontal: 16,
        marginTop: 16,
        marginBottom: 10,
        paddingBottom: 16,
        shadowColor: COLORS.shadow,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 6,
        elevation: 4,
    },
     farmImageBackground: {
        height: 200,
        justifyContent: 'flex-end',
        padding: 16,
        marginBottom: 16,
    },
    farmImageOverlay: {
        backgroundColor: COLORS.overlay,
        padding: 12,
        borderRadius: 8,
    },
    farmNameOnImage: {
        fontSize: 24,
        fontWeight: 'bold',
        color: COLORS.transparentWhite,
        marginBottom: 8,
        textShadowColor: COLORS.shadow,
        textShadowOffset: { width: 1, height: 1 },
        textShadowRadius: 3,
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    infoIcon: {
        marginRight: 8,
    },
    infoText: {
        fontSize: 15,
        flex: 1,
    },
    noImagePlaceholder: {
        height: 150,
        backgroundColor: COLORS.border,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 12,
        margin: 16,
    },
     noImageText: {
        fontSize: 16,
        color: COLORS.textMedium,
    },
    statsRow: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        paddingHorizontal: 20,
        marginBottom:10
    },
    statItem: {
        alignItems: 'center',
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
    landPlotsTitleContainer: {
        paddingHorizontal: 20,
        marginTop: 10,
    },
     landPlotsTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: COLORS.textDark,
        marginBottom: 10,
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 40,
        marginTop: 50,
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
        shadowColor: COLORS.shadow,
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