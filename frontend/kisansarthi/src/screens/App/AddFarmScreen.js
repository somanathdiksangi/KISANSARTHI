import React, { useState } from 'react';
import {
    StyleSheet,
    Text,
    View,
    TextInput,
    TouchableOpacity,
    SafeAreaView,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    ActivityIndicator,
    Alert,
} from 'react-native';
import { ArrowLeft, MapPin } from 'lucide-react-native';
import * as Location from 'expo-location';

import { COLORS } from '../../theme/colors';
import * as api from '../../api/api';

const AddFarmScreen = ({ navigation }) => {
    const [farmName, setFarmName] = useState('');
    const [address, setAddress] = useState('');
    const [locationText, setLocationText] = useState(''); // User-editable location text
    const [latitude, setLatitude] = useState(null);
    const [longitude, setLongitude] = useState(null);
    const [isFetchingLocation, setIsFetchingLocation] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleGoBack = () => {
        navigation.goBack();
    };

    const handleGetLocation = async () => {
        setError(null); // Clear previous location errors
        setIsFetchingLocation(true);
        try {
            let { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                setError('Permission to access location was denied. Please enable it in settings.');
                setIsFetchingLocation(false);
                return;
            }

            let location = await Location.getCurrentPositionAsync({});
            setLatitude(location.coords.latitude);
            setLongitude(location.coords.longitude);
            setLocationText(`Lat: ${location.coords.latitude.toFixed(4)}, Lon: ${location.coords.longitude.toFixed(4)}`); // Update display text

            // Optional: Reverse geocode to get an address hint (requires internet)
            try {
                 let geocoded = await Location.reverseGeocodeAsync({
                     latitude: location.coords.latitude,
                     longitude: location.coords.longitude,
                 });
                 if (geocoded && geocoded.length > 0) {
                     const addr = geocoded[0];
                     // Construct a simple address string if main address field is empty
                     if (!address.trim()) {
                        setAddress(`${addr.street || ''}${addr.street?', ':''}${addr.city || ''}${addr.city?', ':''}${addr.region || ''} ${addr.postalCode || ''}`.trim().replace(/^, /,'').replace(/, ,/g, ','));
                     }
                 }
             } catch (geoError) {
                 console.warn("Reverse geocoding failed:", geoError);
                 // Non-critical error, just proceed with coordinates
             }

        } catch (err) {
            console.error("Failed to get location:", err);
            setError('Failed to get current location. Please ensure location services are enabled.');
        } finally {
            setIsFetchingLocation(false);
        }
    };


    const handleSaveFarm = async () => {
        setError(null);
        if (!farmName.trim()) {
            setError('Farm Name is required.');
            return;
        }

        setIsLoading(true);
        try {
            const farmData = {
                farm_name: farmName,
                address: address || null, // Send null if empty
                location_latitude: latitude,
                location_longitude: longitude,
            };
            console.log("Saving Farm:", farmData);
            await api.createFarm(farmData);

            Alert.alert("Success", "Farm added successfully!");
            // Optionally pass a parameter back to indicate success/refresh needed
            navigation.goBack();


        } catch (err) {
            console.error("Failed to save farm:", err);
            setError(err.message || 'An error occurred while saving the farm.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            {/* Custom Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={handleGoBack} style={styles.backButton}>
                    <ArrowLeft size={24} color={COLORS.textDark} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Add New Farm</Text>
                <View style={{ width: 34 }} /> {/* Spacer for balance */}
            </View>

            <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                style={styles.container}
                keyboardVerticalOffset={Platform.OS === "ios" ? 0 : -150} // Adjust offset if needed
            >
                <ScrollView
                    contentContainerStyle={styles.scrollContent}
                    keyboardShouldPersistTaps="handled" // Allow taps outside inputs to dismiss keyboard
                >
                    {/* Instruction text - Corrected for adding farm */}
                    <Text style={styles.instructionText}>
                        Enter the details for your new farm below.
                    </Text>

                    {/* Form Fields */}
                    <View style={styles.formGroup}>
                        <Text style={styles.label}>Farm Name</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Enter farm name"
                            placeholderTextColor={COLORS.placeholder}
                            value={farmName}
                            onChangeText={setFarmName}
                            autoCapitalize="words"
                        />
                    </View>

                    <View style={styles.formGroup}>
                        <Text style={styles.label}>Address</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Enter farm address (optional)"
                            placeholderTextColor={COLORS.placeholder}
                            value={address}
                            onChangeText={setAddress}
                            textContentType="fullStreetAddress"
                        />
                    </View>

                    <View style={styles.formGroup}>
                        <Text style={styles.label}>Location</Text>
                        <View style={styles.locationInputContainer}>
                             <TextInput
                                style={[styles.input, styles.locationInput]}
                                placeholder="Latitude, Longitude or tap button"
                                placeholderTextColor={COLORS.placeholder}
                                value={locationText} // Display fetched or manually entered text
                                onChangeText={setLocationText} // Allow manual editing
                                // Consider disabling manual edit if only using button: editable={false}
                            />
                             <TouchableOpacity
                                onPress={handleGetLocation}
                                style={styles.locationButton}
                                disabled={isFetchingLocation}
                            >
                                {isFetchingLocation ? (
                                    <ActivityIndicator size="small" color={COLORS.primary} />
                                ) : (
                                    <MapPin size={20} color={COLORS.primary} />
                                )}
                            </TouchableOpacity>
                        </View>
                        <Text style={styles.locationHint}>Tap the pin to get current location (optional).</Text>
                    </View>

                    {/* Error Display */}
                    {error && <Text style={styles.errorText}>{error}</Text>}

                    {/* Spacer to push buttons down */}
                     <View style={{flex: 1}} />

                </ScrollView>
            </KeyboardAvoidingView>

             {/* Buttons Container (outside ScrollView but inside SafeArea) */}
            <View style={styles.buttonContainer}>
                <TouchableOpacity
                    style={[styles.actionButton, styles.saveButton, isLoading && styles.buttonDisabled]}
                    onPress={handleSaveFarm}
                    disabled={isLoading}
                >
                    {isLoading ? (
                       <ActivityIndicator color={COLORS.white} />
                    ) : (
                       <Text style={[styles.actionButtonText, styles.saveButtonText]}>Save Farm</Text>
                    )}
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.actionButton, styles.cancelButton]}
                    onPress={handleGoBack}
                    disabled={isLoading}
                >
                    <Text style={[styles.actionButtonText, styles.cancelButtonText]}>Cancel</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: COLORS.background,
        paddingTop: 40
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 5,
        backgroundColor: COLORS.white,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.border,
        shadowColor: '#000',
        shadowOpacity: 0.05,
        shadowRadius: 6,
        elevation: 2,
    },
    backButton: {
        padding: 12,
        backgroundColor: COLORS.lightGray,
        borderRadius: 50,
    },
    headerTitle: {
        fontSize: 22,
        fontWeight: '700',
        color: COLORS.textDark,
    },
    container: {
        flex: 1,
    },
    scrollContent: {
        flexGrow: 1,
        paddingHorizontal: 24,
        paddingVertical: 24,
    },
    instructionText: {
        fontSize: 16,
        color: COLORS.textMedium,
        marginBottom: 24,
        lineHeight: 22,
    },
    formGroup: {
        marginBottom: 24,
    },
    label: {
        fontSize: 16,
        fontWeight: '600',
        color: COLORS.textDark,
        marginBottom: 10,
    },
    input: {
        backgroundColor: COLORS.white,
        borderWidth: 1,
        borderColor: COLORS.border,
        borderRadius: 14,
        paddingHorizontal: 16,
        paddingVertical: 14,
        fontSize: 16,
        color: COLORS.textDark,
        shadowColor: '#000',
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    inputFocused: {
        borderColor: COLORS.primary,
        shadowOpacity: 0.1,
    },
    locationInputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    locationInput: {
        flex: 1,
        paddingRight: 50,
    },
    locationButton: {
        position: 'absolute',
        right: 12,
        top: 8,
        bottom: 8,
        backgroundColor: COLORS.primaryLight,
        borderRadius: 24,
        padding: 10,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 3,
    },
    locationHint: {
        fontSize: 13,
        color: COLORS.textLight,
        marginTop: 5,
    },
    errorText: {
        color: COLORS.error,
        fontSize: 14,
        textAlign: 'center',
        marginVertical: 12,
        backgroundColor: '#FDEDEE',
        padding: 12,
        borderRadius: 10,
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: 24,
        paddingVertical: 20,
        backgroundColor: COLORS.white,
        borderTopWidth: 1,
        borderTopColor: COLORS.border,
    },
    actionButton: {
        flex: 1,
        paddingVertical: 16,
        borderRadius: 14,
        alignItems: 'center',
        justifyContent: 'center',
        marginHorizontal: 8,
        elevation: 4,
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowRadius: 8,
    },
    saveButton: {
        backgroundColor: COLORS.primary,
    },
    cancelButton: {
        backgroundColor: COLORS.white,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    buttonDisabled: {
        opacity: 0.5,
    },
    actionButtonText: {
        fontSize: 16,
        fontWeight: '600',
    },
    saveButtonText: {
        color: COLORS.white,
    },
    cancelButtonText: {
        color: COLORS.textDark,
    },
});

export default AddFarmScreen;
