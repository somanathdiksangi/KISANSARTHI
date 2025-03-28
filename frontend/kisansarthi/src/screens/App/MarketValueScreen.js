import React, { useState, useEffect } from 'react';
import {
    StyleSheet,
    View,
    Text,
    ActivityIndicator,
    FlatList,
    TouchableOpacity,
    Linking
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS } from '../../theme/colors';
import CustomHeader from '../../components/Common/CustomHeader';  // Assuming you have this
import { useRoute } from '@react-navigation/native';

const API_KEY = "579b464db66ec23bdd000001cdd3946e44ce4aad7209ff7b23ac571b"

const MarketValueScreen = ({ navigation }) => {
    const [marketData, setMarketData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    const route = useRoute();
    const cropName = route.params?.cropName ?? 'Rice';  // Default to "Rice" if no crop name is passed

    useEffect(() => {
        const fetchMarketData = async () => {
            setIsLoading(true);
            setError(null);

            const url = `https://api.data.gov.in/resource/35985678-0d79-46b4-9ed6-6f13308a1d24?api-key=${API_KEY}&format=json&limit=5&filters%5BDistrict.keyword%5D=Mumbai&filters%5BState.keyword%5D=Maharashtra&filters%5BCommodity.keyword%5D=${cropName}`;

            try {
                const response = await fetch(url);
                const data = await response.json();

                if (data.status === 'ok') {
                    setMarketData(data);
                } else {
                    setError("Failed to fetch market data: " + (data.message || "Unknown error"));
                }
            } catch (err) {
                console.error("Error fetching market data:", err);
                setError("Failed to fetch market data. Please check your connection.");
            } finally {
                setIsLoading(false);
            }
        };

        fetchMarketData();
    }, [cropName]);

    const renderItem = ({ item }) => (
        <View style={styles.marketItem}>
            <Text style={styles.marketText}>
                <Text style={styles.bold}>Crop:</Text> {item.Commodity}
            </Text>
            <Text style={styles.marketText}>
                <Text style={styles.bold}>Market:</Text> {item.Market}
            </Text>
            <Text style={styles.marketText}>
                <Text style={styles.bold}>Variety:</Text> {item.Variety}
            </Text>
            <Text style={styles.marketText}>
                <Text style={styles.bold}>Arrival Date:</Text> {item.Arrival_Date}
            </Text>
            <Text style={styles.marketText}>
                <Text style={styles.bold}>Modal Price:</Text> {item.Modal_Price}
            </Text>
        </View>
    );

    const openDataGov = () => {
        Linking.openURL('https://data.gov.in/');
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <CustomHeader title={`Market Value for ${cropName}`} showBackButton={true} />

            {isLoading ? (
                <View style={styles.center}>
                    <ActivityIndicator size="large" color={COLORS.primary} />
                </View>
            ) : error ? (
                <View style={styles.center}>
                    <Text style={styles.errorText}>{error}</Text>
                </View>
            ) : marketData && marketData.records && marketData.records.length > 0 ? (
                <FlatList
                    data={marketData.records}
                    renderItem={renderItem}
                    keyExtractor={(item, index) => index.toString()}
                    contentContainerStyle={styles.listContentContainer}
                />
            ) : (
                <View style={styles.center}>
                    <Text style={styles.infoText}>No market data available for {cropName} in Maharashtra.</Text>
                </View>
            )}
            <TouchableOpacity style={styles.footer} onPress={openDataGov}>
                <Text style={styles.footerText}>
                    Data from <Text style={styles.bold}>data.gov.in</Text>
                </Text>
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
        fontSize: 16,
        textAlign: 'center',
    },
    infoText: {
        fontSize: 16,
        color: COLORS.textMedium,
        textAlign: 'center',
    },
    listContentContainer: {
        padding: 20,
    },
    marketItem: {
        backgroundColor: COLORS.white,
        padding: 15,
        borderRadius: 8,
        marginBottom: 15,
        shadowColor: COLORS.shadow,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    marketText: {
        fontSize: 15,
        color: COLORS.textDark,
        marginBottom: 5,
    },
    bold: {
        fontWeight: 'bold',
    },
    footer: {
        padding: 15,
        alignItems: 'center',
    },
    footerText: {
        fontSize: 14,
        color: COLORS.textLight,
    },
});

export default MarketValueScreen;