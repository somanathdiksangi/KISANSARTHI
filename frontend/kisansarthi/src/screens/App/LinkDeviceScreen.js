import React, { useState, useEffect, useCallback } from 'react';
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
import { Picker } from '@react-native-picker/picker';
import { Barcode } from 'lucide-react-native'; // Icon for QR Scan button
// Expo Barcode Scanner (Install if implementing QR Scan)
// import { BarCodeScanner } from 'expo-barcode-scanner';

import { COLORS } from '../../theme/colors';
import * as api from '../../api/api';
import CustomHeader from '../../components/Common/CustomHeader';
import { useRoute } from '@react-navigation/native';

const LinkDeviceScreen = ({ navigation }) => {
    const route = useRoute();
    const farmId = route.params?.farmId ?? null;
    const preSelectedLandId = route.params?.landId ?? null; // Land ID passed from AddLand

    const [hardwareId, setHardwareId] = useState('');
    const [deviceName, setDeviceName] = useState('');
    const [assignedLandId, setAssignedLandId] = useState(preSelectedLandId); // Initialize with pre-selected
    const [availableLands, setAvailableLands] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isFetchingLands, setIsFetchingLands] = useState(false);
    const [error, setError] = useState(null);

    // --- State and handlers for QR Scanner (Optional) ---
    // const [hasPermission, setHasPermission] = useState(null);
    // const [showScanner, setShowScanner] = useState(false);
    // const [scanned, setScanned] = useState(false);

    // Fetch available lands for assignment dropdown
    const fetchLands = useCallback(async () => {
        if (!farmId) return;
        setIsFetchingLands(true);
        try {
            const landsRes = await api.listLands(farmId, 1000); // Fetch all lands for dropdown
            setAvailableLands(landsRes?.lands ?? []);
             // Ensure preSelectedLandId is valid, otherwise default to null/first option
             if (preSelectedLandId && !landsRes?.lands?.some(l => l.id === preSelectedLandId)) {
                setAssignedLandId(null);
             } else {
                 setAssignedLandId(preSelectedLandId); // Keep pre-selected if valid
             }
        } catch (err) {
            console.error("Failed to fetch lands for assignment:", err);
            setError("Could not load land plots for assignment.");
        } finally {
            setIsFetchingLands(false);
        }
    }, [farmId, preSelectedLandId]);

    useEffect(() => {
        fetchLands();
    }, [fetchLands]);

    // --- QR Scanner Logic (Optional) ---
    // useEffect(() => {
    //     (async () => {
    //         const { status } = await BarCodeScanner.requestPermissionsAsync();
    //         setHasPermission(status === 'granted');
    //     })();
    // }, []);
    //
    // const handleBarCodeScanned = ({ type, data }) => {
    //     setScanned(true);
    //     setShowScanner(false);
    //     setHardwareId(data); // Set hardware ID from scanned data
    //     Alert.alert(`QR Code Scanned!`, `Device ID: ${data}`, [{ text: 'OK' }]);
    // };
    //
    // if (showScanner) {
    //     if (hasPermission === null) {
    //         return <SafeAreaView style={styles.safeArea}><Text>Requesting camera permission...</Text></SafeAreaView>;
    //     }
    //     if (hasPermission === false) {
    //         return <SafeAreaView style={styles.safeArea}><Text>No access to camera. Please grant permission in settings.</Text></SafeAreaView>;
    //     }
    //     return (
    //         <SafeAreaView style={styles.safeArea}>
    //              <BarCodeScanner
    //                 onBarCodeScanned={scanned ? undefined : handleBarCodeScanned}
    //                 style={StyleSheet.absoluteFillObject}
    //             />
    //             <TouchableOpacity style={styles.closeScannerButton} onPress={() => { setShowScanner(false); setScanned(false); }}>
    //                  <Text style={styles.closeScannerText}>Cancel Scan</Text>
    //              </TouchableOpacity>
    //              {scanned && <Button title={'Tap to Scan Again'} onPress={() => setScanned(false)} />}
    //         </SafeAreaView>
    //     );
    // }
    // --- End QR Scanner Logic ---

    const handleLinkDevice = async () => {
        setError(null);
        if (!farmId) {
            setError("Farm ID is missing."); return;
        }
        if (!hardwareId.trim()) {
            setError('Hardware Device ID is required.'); return;
        }

        setIsLoading(true);
        try {
            const deviceData = {
                hardware_unique_id: hardwareId,
                farm_id: farmId,
                device_name: deviceName || null,
                assigned_land_id: assignedLandId || null, // Send null if "None" selected
            };
            console.log("Registering device:", deviceData);
            await api.registerHardwareDevice(deviceData);

            Alert.alert("Success", "Device linked successfully!");
            // Navigate back twice if coming from AddLand -> LinkDevice flow
            if (preSelectedLandId) {
                 // Find the FarmDetails route in the stack and go back there
                 navigation.pop(2); // Go back two screens
            } else {
                 navigation.goBack(); // Just go back one screen
            }

        } catch (err) {
            console.error("Failed to link device:", err);
            // Handle specific errors like duplicate HW ID (409) or land already assigned
            if (err.status === 409) {
                 setError(err.message || "Device ID already registered or Land already assigned.");
            } else {
                 setError(err.message || 'An error occurred while linking the device.');
            }
             setIsLoading(false);
        }
       // setIsLoading(false); // Handled in success/error paths
    };

    return (
        <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
             <CustomHeader title="Link New Device" showBackButton={true} />
            <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                style={styles.container}
            >
                <ScrollView
                    contentContainerStyle={styles.scrollContent}
                    keyboardShouldPersistTaps="handled"
                >
                    <Text style={styles.instructionText}>
                        Enter the Unique ID found on your device or scan the QR code. Then assign it to a plot.
                    </Text>

                    {/* Hardware ID */}
                    <View style={styles.formGroup}>
                        <Text style={styles.label}>Hardware Device ID*</Text>
                        <View style={styles.idInputContainer}>
                            <TextInput
                                style={[styles.input, styles.idInput]}
                                placeholder="Enter or scan device ID"
                                placeholderTextColor={COLORS.placeholder}
                                value={hardwareId}
                                onChangeText={setHardwareId}
                                autoCapitalize="none"
                            />
                            {/* Optional Scan Button */}
                             <TouchableOpacity
                                style={styles.scanButton}
                                // onPress={() => { setScanned(false); setShowScanner(true); }} // Enable Scanner
                                onPress={() => Alert.alert("Scanner", "QR Code scanner not implemented yet.")}
                             >
                                 <Barcode size={24} color={COLORS.primary} />
                             </TouchableOpacity>
                        </View>
                    </View>

                    {/* Device Name (Optional) */}
                    <View style={styles.formGroup}>
                        <Text style={styles.label}>Device Name (Optional)</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="e.g., North Field Monitor"
                            placeholderTextColor={COLORS.placeholder}
                            value={deviceName}
                            onChangeText={setDeviceName}
                            autoCapitalize="words"
                        />
                    </View>

                    {/* Assign to Plot */}
                     <View style={styles.formGroup}>
                        <Text style={styles.label}>Assign the Device to a Plot:</Text>
                         {isFetchingLands ? (
                            <ActivityIndicator color={COLORS.primary} style={{marginTop: 10}}/>
                         ) : (
                            <View style={styles.pickerContainer}>
                                <Picker
                                    selectedValue={assignedLandId}
                                    onValueChange={(itemValue) => setAssignedLandId(itemValue)}
                                    style={styles.picker}
                                    itemStyle={styles.pickerItem}
                                    mode="dropdown"
                                    enabled={availableLands.length > 0} // Disable if no lands
                                >
                                    <Picker.Item label="-- Do Not Assign Yet --" value={null} />
                                    {availableLands.map(land => (
                                        <Picker.Item key={land.id} label={`${land.land_name} (${land.area} ${land.area_unit})`} value={land.id} />
                                    ))}
                                </Picker>
                            </View>
                         )}
                    </View>

                    {/* Error Display */}
                    {error && <Text style={styles.errorText}>{error}</Text>}

                    <View style={{flex: 1, minHeight: 50}} />

                </ScrollView>
                {/* Buttons */}
                <View style={styles.buttonContainer}>
                     <TouchableOpacity
                        style={[styles.actionButton, styles.saveButton, isLoading && styles.buttonDisabled]}
                        onPress={handleLinkDevice}
                        disabled={isLoading || isFetchingLands}
                    >
                        {isLoading ? (
                           <ActivityIndicator color={COLORS.white} />
                        ) : (
                           <Text style={[styles.actionButtonText, styles.saveButtonText]}>Link Device</Text>
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

// --- Styles (adapt from previous forms) ---
const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: COLORS.background },
    container: { flex: 1 },
    scrollContent: { flexGrow: 1, paddingHorizontal: 20, paddingTop: 20, paddingBottom: 20 },
    instructionText: { fontSize: 15, color: COLORS.textMedium, marginBottom: 25, textAlign: 'left' },
    formGroup: { marginBottom: 20 },
    label: { fontSize: 15, fontWeight: '600', color: COLORS.textDark, marginBottom: 8 },
    input: { backgroundColor: COLORS.white, borderWidth: 1, borderColor: COLORS.border, borderRadius: 10, paddingHorizontal: 15, paddingVertical: 12, fontSize: 16, color: COLORS.textDark, width: '100%' },
     idInputContainer: { flexDirection: 'row', alignItems: 'center', position: 'relative' },
    idInput: { flex: 1, paddingRight: 50 }, // Space for scan button
    scanButton: { position: 'absolute', right: 0, top: 0, bottom: 0, justifyContent: 'center', paddingHorizontal: 12 },
    pickerContainer: { backgroundColor: COLORS.white, borderWidth: 1, borderColor: COLORS.border, borderRadius: 10, height: Platform.OS === 'ios' ? undefined : 50, justifyContent: 'center' },
    picker: { height: Platform.OS === 'ios' ? 150 : 50 },
    pickerItem: { /* iOS only */ },
    errorText: { color: COLORS.error, fontSize: 14, textAlign: 'center', marginTop: 10, marginBottom: 10 },
    buttonContainer: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 15, borderTopWidth: 1, borderTopColor: COLORS.border, backgroundColor: COLORS.white },
    actionButton: { flex: 1, paddingVertical: 14, borderRadius: 10, alignItems: 'center', justifyContent: 'center', marginHorizontal: 5, minHeight: 48 },
    saveButton: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
    cancelButton: { backgroundColor: COLORS.white, borderWidth: 1, borderColor: COLORS.border },
    buttonDisabled: { opacity: 0.6 },
    actionButtonText: { fontSize: 16, fontWeight: '600' },
    saveButtonText: { color: COLORS.white },
    cancelButtonText: { color: COLORS.textDark },
    // Scanner specific styles (optional)
    // closeScannerButton: { position: 'absolute', top: 40, left: 20, backgroundColor: 'rgba(0,0,0,0.5)', padding: 10, borderRadius: 5 },
    // closeScannerText: { color: 'white', fontSize: 16 },
});

export default LinkDeviceScreen;