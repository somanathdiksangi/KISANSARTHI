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
import { useRoute } from '@react-navigation/native';

import { COLORS } from '../../theme/colors';
import * as api from '../../api/api'; // Ensure saveManualSoilReading is exported
import CustomHeader from '../../components/Common/CustomHeader';

const ManualSoilInputScreen = ({ navigation }) => {
    const route = useRoute();
    const landId = route.params?.landId ?? null;
    const landName = route.params?.landName ?? 'Plot';
    const farmId = route.params?.farmId ?? null; // Need farmId if API requires it

    // State for each input field
    const [nitrogen, setNitrogen] = useState('');
    const [phosphorus, setPhosphorus] = useState('');
    const [potassium, setPotassium] = useState('');
    const [ph, setPh] = useState('');
    const [moisture, setMoisture] = useState('');
    const [temperature, setTemperature] = useState('');
    const [humidity, setHumidity] = useState(''); // Optional

    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    // Helper function to parse input as float, returning null if invalid
    const parseFloatInput = (value) => {
        const parsed = parseFloat(value);
        return isNaN(parsed) ? null : parsed;
    };

    const handleSaveReadings = async () => {
        setError(null);
        if (!landId) {
            setError("Land ID is missing. Cannot save readings."); return;
        }
        // Optional: Add more specific validation (e.g., ranges) if needed

        // Prepare data for API
        const readingData = {
            nitrogen_value: parseFloatInput(nitrogen),
            phosphorus_value: parseFloatInput(phosphorus),
            potassium_value: parseFloatInput(potassium),
            ph_value: parseFloatInput(ph),
            moisture_value: parseFloatInput(moisture),
            temperature_value: parseFloatInput(temperature),
            humidity_value: parseFloatInput(humidity), // Include if humidity input exists
        };

        // Simple check if at least one value was entered (optional)
        const hasValue = Object.values(readingData).some(v => v !== null);
        if (!hasValue) {
             setError("Please enter at least one soil reading value.");
             return;
        }

        setIsLoading(true);
        try {
            console.log(`Saving manual readings for Land ${landId}:`, readingData);
            await api.saveManualSoilReading(landId, readingData);

            Alert.alert("Success", "Manual soil readings saved successfully!");
            // Navigate back to Farm Details screen after saving
            // Need to figure out how many screens to pop. If coming from AddLand->Manual, pop 2?
            // Find the FarmDetails route and go back there.
             navigation.pop(2); // Go back two screens (ManualInput -> AddLand -> FarmDetails)


        } catch (err) {
            console.error("Failed to save manual readings:", err);
            setError(err.message || 'An error occurred while saving the readings.');
            setIsLoading(false);
        }
        // No setIsLoading(false) here if navigation happens on success
    };

    return (
        <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
             <CustomHeader title={`Manual Input for ${landName}`} showBackButton={true} />
            <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                style={styles.container}
                 keyboardVerticalOffset={Platform.OS === "ios" ? 60 : -100} // Adjust offset
            >
                <ScrollView
                    contentContainerStyle={styles.scrollContent}
                    keyboardShouldPersistTaps="handled"
                >
                    <Text style={styles.instructionText}>
                        Enter the initial soil readings for this plot. Leave fields blank if unknown.
                    </Text>

                    {/* Input Fields Grid (Example: 2 columns) */}
                     <View style={styles.inputRow}>
                         <View style={styles.formGroupHalf}>
                            <Text style={styles.label}>Nitrogen (ppm)</Text>
                            <TextInput style={styles.input} value={nitrogen} onChangeText={setNitrogen} keyboardType="numeric" placeholder="e.g., 120" />
                        </View>
                         <View style={styles.formGroupHalf}>
                            <Text style={styles.label}>Phosphorus (ppm)</Text>
                            <TextInput style={styles.input} value={phosphorus} onChangeText={setPhosphorus} keyboardType="numeric" placeholder="e.g., 45" />
                        </View>
                    </View>

                    <View style={styles.inputRow}>
                         <View style={styles.formGroupHalf}>
                            <Text style={styles.label}>Potassium (ppm)</Text>
                            <TextInput style={styles.input} value={potassium} onChangeText={setPotassium} keyboardType="numeric" placeholder="e.g., 80" />
                        </View>
                         <View style={styles.formGroupHalf}>
                            <Text style={styles.label}>pH</Text>
                            <TextInput style={styles.input} value={ph} onChangeText={setPh} keyboardType="numeric" placeholder="e.g., 6.5" />
                        </View>
                    </View>

                    <View style={styles.inputRow}>
                         <View style={styles.formGroupHalf}>
                            <Text style={styles.label}>Moisture (%)</Text>
                            <TextInput style={styles.input} value={moisture} onChangeText={setMoisture} keyboardType="numeric" placeholder="e.g., 35" />
                        </View>
                         <View style={styles.formGroupHalf}>
                            <Text style={styles.label}>Temperature (°C)</Text>
                            <TextInput style={styles.input} value={temperature} onChangeText={setTemperature} keyboardType="numeric" placeholder="e.g., 22" />
                        </View>
                    </View>

                    {/* Optional Humidity */}
                     <View style={styles.formGroup}>
                        <Text style={styles.label}>Air Humidity (%)</Text>
                        <TextInput style={styles.input} value={humidity} onChangeText={setHumidity} keyboardType="numeric" placeholder="e.g., 60" />
                    </View>

                    {/* Error Display */}
                    {error && <Text style={styles.errorText}>{error}</Text>}

                     <View style={{flex: 1, minHeight: 50}} />

                </ScrollView>
                 {/* Buttons */}
                <View style={styles.buttonContainer}>
                    <TouchableOpacity
                        style={[styles.actionButton, styles.saveButton, isLoading && styles.buttonDisabled]}
                        onPress={handleSaveReadings}
                        disabled={isLoading}
                    >
                        {isLoading ? (
                           <ActivityIndicator color={COLORS.white} />
                        ) : (
                           <Text style={[styles.actionButtonText, styles.saveButtonText]}>Save Readings</Text>
                        )}
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.actionButton, styles.cancelButton]}
                        onPress={() => navigation.goBack()} // Just go back one screen (to AddLand potentially)
                        disabled={isLoading}
                    >
                        <Text style={[styles.actionButtonText, styles.cancelButtonText]}>Cancel</Text>
                    </TouchableOpacity>
                </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

// --- Styles (adapt from other forms) ---
const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: COLORS.background },
    container: { flex: 1 },
    scrollContent: { flexGrow: 1, paddingHorizontal: 20, paddingTop: 20, paddingBottom: 20 },
    instructionText: { fontSize: 15, color: COLORS.textMedium, marginBottom: 25, textAlign: 'left' },
    formGroup: { marginBottom: 20 },
    formGroupHalf: { flex: 1, marginBottom: 20 }, // Takes half width
    inputRow: { flexDirection: 'row', justifyContent: 'space-between', gap: 15 }, // Add gap between inputs
    label: { fontSize: 15, fontWeight: '600', color: COLORS.textDark, marginBottom: 8 },
    input: { backgroundColor: COLORS.white, borderWidth: 1, borderColor: COLORS.border, borderRadius: 10, paddingHorizontal: 15, paddingVertical: 12, fontSize: 16, color: COLORS.textDark, width: '100%' },
    errorText: { color: COLORS.error, fontSize: 14, textAlign: 'center', marginTop: 10, marginBottom: 10 },
    buttonContainer: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 15, borderTopWidth: 1, borderTopColor: COLORS.border, backgroundColor: COLORS.white },
    actionButton: { flex: 1, paddingVertical: 14, borderRadius: 10, alignItems: 'center', justifyContent: 'center', marginHorizontal: 5, minHeight: 48 },
    saveButton: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
    cancelButton: { backgroundColor: COLORS.white, borderWidth: 1, borderColor: COLORS.border },
    buttonDisabled: { opacity: 0.6 },
    actionButtonText: { fontSize: 16, fontWeight: '600' },
    saveButtonText: { color: COLORS.white },
    cancelButtonText: { color: COLORS.textDark },
});

export default ManualSoilInputScreen;