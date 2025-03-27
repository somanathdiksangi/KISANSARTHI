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
import { Picker } from '@react-native-picker/picker'; // Use Picker component

import { COLORS } from '../../theme/colors';
import * as api from '../../api/api';
import CustomHeader from '../../components/Common/CustomHeader'; // Reuse header
import { useRoute } from '@react-navigation/native';

const AddLandScreen = ({ navigation }) => {
    const route = useRoute();
    const farmId = route.params?.farmId ?? null;
    const farmName = route.params?.farmName ?? 'Farm';

    const [landName, setLandName] = useState('');
    const [area, setArea] = useState('');
    const [areaUnit, setAreaUnit] = useState('acres'); // Default unit
    const [soilType, setSoilType] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleSaveLand = async () => {
        setError(null);
        if (!farmId) {
            setError("Farm ID is missing. Cannot save land.");
            return;
        }
        if (!landName.trim()) {
            setError('Land Name is required.');
            return;
        }
         const areaNum = parseFloat(area);
        if (isNaN(areaNum) || areaNum <= 0) {
            setError('Please enter a valid positive number for Area.');
            return;
        }

        setIsLoading(true);
        try {
            const landData = {
                land_name: landName,
                area: areaNum,
                area_unit: areaUnit,
                soil_type_manual: soilType || null,
            };
            console.log(`Saving Land for Farm ${farmId}:`, landData);
            const newLand = await api.createLand(farmId, landData);
            console.log('Land created:', newLand);

            Alert.alert(
                "Land Added Successfully!",
                `"${landName}" created. How would you like to add initial soil data?`,
                [
                    {
                        text: "Enter Manually", // New Option
                        style: "default",
                        onPress: () => {
                            // Navigate to Manual Soil Input Screen
                            navigation.replace('ManualSoilInput', { // Use replace to remove AddLand from stack
                                landId: newLand.id,
                                landName: newLand.land_name,
                                farmId: farmId,
                            });
                        },
                    },
                     {
                        text: "Link Device", // Existing Option
                        style: "default",
                        onPress: () => {
                            // Navigate to Link Device Screen
                            navigation.replace('LinkDevice', { // Use replace
                                farmId: farmId,
                                landId: newLand.id, // Pass the new land ID
                                landName: newLand.land_name,
                            });
                        },
                    },
                    {
                        text: "Skip for Now", // Changed "Later" to "Skip"
                        style: "cancel",
                        onPress: () => navigation.goBack() // Just go back if skipping
                    },
                ],
                 { cancelable: false } // Prevent dismissing alert by tapping outside
            );
            // Note: navigation.goBack() is called within the Alert handlers

        } catch (err) {
            console.error("Failed to save land:", err);
            setError(err.message || 'An error occurred while saving the land plot.');
            setIsLoading(false); // Ensure loading stops on error
        }
        // setIsLoading(false); // Moved inside success/error logic
    };

    return (
        <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
             <CustomHeader title={`Add Land to ${farmName}`} showBackButton={true} />
            <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                style={styles.container}
                keyboardVerticalOffset={Platform.OS === "ios" ? 80 : -100}
            >
                <ScrollView
                    contentContainerStyle={styles.scrollContent}
                    keyboardShouldPersistTaps="handled"
                >
                     {/* Form Fields */}
                    <View style={styles.formGroup}>
                        <Text style={styles.label}>Land Name / Identifier*</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="e.g., North Field, Plot 3A"
                            placeholderTextColor={COLORS.placeholder}
                            value={landName}
                            onChangeText={setLandName}
                            autoCapitalize="words"
                        />
                    </View>

                     <View style={styles.areaRow}>
                        <View style={[styles.formGroup, styles.areaInputGroup]}>
                            <Text style={styles.label}>Area*</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="e.g., 5.5"
                                placeholderTextColor={COLORS.placeholder}
                                value={area}
                                onChangeText={setArea}
                                keyboardType="numeric"
                            />
                        </View>
                        <View style={[styles.formGroup, styles.areaUnitGroup]}>
                             <Text style={styles.label}>Unit*</Text>
                             {/* Picker for Area Unit */}
                             <View style={styles.pickerContainer}>
                                <Picker
                                    selectedValue={areaUnit}
                                    onValueChange={(itemValue) => setAreaUnit(itemValue)}
                                    style={styles.picker}
                                    itemStyle={styles.pickerItem} // Style items if needed (iOS)
                                    mode="dropdown" // Android style
                                >
                                    <Picker.Item label="Acres" value="acres" />
                                    <Picker.Item label="Hectares" value="hectares" />
                                    {/* Add other units if needed */}
                                </Picker>
                             </View>
                        </View>
                    </View>


                    <View style={styles.formGroup}>
                        <Text style={styles.label}>Initial Soil Type (Optional)</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="e.g., Clay, Loam, Sandy Loam"
                            placeholderTextColor={COLORS.placeholder}
                            value={soilType}
                            onChangeText={setSoilType}
                            autoCapitalize="words"
                        />
                    </View>

                    {/* Error Display */}
                    {error && <Text style={styles.errorText}>{error}</Text>}

                     {/* Spacer */}
                     <View style={{flex: 1, minHeight: 50}} />

                </ScrollView>
                 {/* Buttons Container */}
                <View style={styles.buttonContainer}>
                     {/* Reusing styles from AddFarmScreen */}
                    <TouchableOpacity
                        style={[styles.actionButton, styles.saveButton, isLoading && styles.buttonDisabled]}
                        onPress={handleSaveLand}
                        disabled={isLoading}
                    >
                        {isLoading ? (
                           <ActivityIndicator color={COLORS.white} />
                        ) : (
                           <Text style={[styles.actionButtonText, styles.saveButtonText]}>Save Land</Text>
                        )}
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.actionButton, styles.cancelButton]}
                        onPress={() => navigation.goBack()}
                        disabled={isLoading}
                    >
                        <Text style={[styles.actionButtonText, styles.cancelButtonText]}>Cancel</Text>
                    </TouchableOpacity>
                </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

// --- Styles (adapt from AddFarmScreen, adding picker styles) ---
const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: COLORS.background, paddingTop: 40 },
    container: { flex: 1 },
    scrollContent: { flexGrow: 1, paddingHorizontal: 20, paddingTop: 20, paddingBottom: 20 },
    formGroup: { marginBottom: 20 },
    label: { fontSize: 15, fontWeight: '600', color: COLORS.textDark, marginBottom: 8 },
    input: { backgroundColor: COLORS.white, borderWidth: 1, borderColor: COLORS.border, borderRadius: 10, paddingHorizontal: 15, paddingVertical: 12, fontSize: 16, color: COLORS.textDark, width: '100%' },
    areaRow: { flexDirection: 'row', justifyContent: 'space-between' },
    areaInputGroup: { flex: 0.6, marginRight: 10 }, // Adjust flex proportions
    areaUnitGroup: { flex: 0.4 },
    pickerContainer: {
        backgroundColor: COLORS.white,
        borderWidth: 1,
        borderColor: COLORS.border,
        borderRadius: 10,
        height: Platform.OS === 'ios' ? undefined : 50, // Height for Android picker container
        justifyContent: 'center', // Center picker text vertically on Android
    },
    picker: {
        // width: '100%', // Redundant with container
        height: Platform.OS === 'ios' ? 150 : 50, // iOS needs height for wheel picker
        // color: COLORS.textDark, // Set color if needed
        // backgroundColor: 'transparent', // Ensure container bg shows
    },
    pickerItem: {
        // iOS only: style individual items if needed
        // height: 120,
    },
    errorText: { color: COLORS.error, fontSize: 14, textAlign: 'center', marginTop: 10, marginBottom: 10 },
    buttonContainer: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 15, borderTopWidth: 1, borderTopColor: COLORS.border, backgroundColor: COLORS.white },
    actionButton: { flex: 1, paddingVertical: 14, borderRadius: 10, alignItems: 'center', justifyContent: 'center', marginHorizontal: 5, minHeight: 48 },
    saveButton: { backgroundColor: COLORS.primary, borderColor: COLORS.primary }, // Use primary color for land save
    cancelButton: { backgroundColor: COLORS.white, borderWidth: 1, borderColor: COLORS.border },
    buttonDisabled: { opacity: 0.6 },
    actionButtonText: { fontSize: 16, fontWeight: '600' },
    saveButtonText: { color: COLORS.white },
    cancelButtonText: { color: COLORS.textDark },
});

export default AddLandScreen;