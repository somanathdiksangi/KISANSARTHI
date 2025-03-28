// src/screens/App/ScanScreen.js
import React, { useState, useEffect, useRef } from 'react';
import {
    StyleSheet,
    Text,
    View,
    TouchableOpacity,
    ImageBackground,
    Alert,
    ActivityIndicator,
    Platform,
    Button // <-- Import Button for permission request
} from 'react-native';
// *** CHANGE 1: Import CameraView and useCameraPermissions ***
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import { FlipHorizontal, Zap, ZapOff, Image as ImageIcon, CircleUserRound } from 'lucide-react-native'; // Icons
import { useNavigation, useIsFocused, useRoute  } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { COLORS } from '../../theme/colors';
import * as api from '../../api/api'; // For initiating scan
import CustomHeader from '../../components/Common/CustomHeader'; // Assuming reusable header

const ScanScreen = () => {
    const navigation = useNavigation();
    const isFocused = useIsFocused(); // Re-activate camera when tab is focused
    const route = useRoute()
    // *** CHANGE 2: Use useCameraPermissions hook ***
    const [permission, requestPermission] = useCameraPermissions();

    // *** CHANGE 3: Use strings for camera facing direction ***
    const [facing, setFacing] = useState('back');
    // *** CHANGE 4: Use 'on'/'off' state for torch, matching enableTorch prop ***
    const [torchEnabled, setTorchEnabled] = useState(false); // Simpler boolean state

    const [capturedImage, setCapturedImage] = useState(null); // For preview state
    const [isProcessing, setIsProcessing] = useState(false);
    const cameraRef = useRef(null); // Ref remains the same

    // *** REMOVED: useEffect for manual permission request ***

    // Request Gallery Permissions (Optional) - Stays the same
    const requestGalleryPermission = async () => {
        // You might want to use useMediaLibraryPermissions() here too for consistency
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert('Permission Required', 'Sorry, we need camera roll permissions to make this work!');
            return false;
        }
        return true;
    };

    // *** CHANGE 5: Toggle logic for string state ***
    const toggleCameraFacing = () => {
        setFacing(current => (current === 'back' ? 'front' : 'back'));
    };

    // *** CHANGE 6: Toggle logic for boolean torch state ***
    const toggleTorch = () => {
        setTorchEnabled(current => !current);
    };

    // takePicture - Should work similarly with CameraView ref
    const takePicture = async () => {
        if (cameraRef.current && !isProcessing) {
            setIsProcessing(true);
            try {
                const options = { quality: 0.7, base64: false };
                const data = await cameraRef.current.takePictureAsync(options);
                setCapturedImage(data);
            } catch (error) {
                console.error("Failed to take picture:", error);
                Alert.alert("Error", `Could not capture image: ${error.message}`); // Display the error message
                setIsProcessing(false);
                return; // Exit the function if there's an error
            } finally {
                setIsProcessing(false); // Ensure isProcessing is always set to false
            }
        }
    };

     // pickImage - Stays the same
     const pickImage = async () => {
        const permissionGranted = await requestGalleryPermission();
        if (!permissionGranted) return;
        try {
            let result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: false,
                quality: 0.7,
            });
            if (!result.canceled && result.assets && result.assets.length > 0) {
                setCapturedImage(result.assets[0]);
            }
        } catch (error) {
            console.error("Failed to pick image:", error);
            Alert.alert("Error", "Could not select image from gallery.");
        }
    };

    // handleUseImage - Stays the same (API interaction logic)
    const handleUseImage = async () => {
        if (!capturedImage) {
            console.warn("No image to use!");
            return;
        }

        console.log('handleUseImage called. Captured Image URI:', capturedImage.uri); // <-- Log entry

        setIsProcessing(true);
        try {
            const formData = new FormData();
            const filename = capturedImage.uri.split('/').pop();
            const match = /\.(\w+)$/.exec(filename);
            const type = match ? `image/${match[1]}` : `image/jpeg`; // Ensure common types like jpg/png work

            const imagePayload = {
                uri: capturedImage.uri,
                name: filename,
                type: type,
            };

            // *** Log the exact payload being appended ***
            console.log('Appending to FormData:', imagePayload);
            formData.append('image', imagePayload); // Key 'image' must match backend expectation

            const landId = route.params?.landId ?? null;
            const plantingId = route.params?.plantingId ?? null;
            if (landId) {
                console.log('Appending land_id:', landId); // <-- Log other fields
                formData.append('land_id', landId);
            }
            if (plantingId) {
                 console.log('Appending planting_id:', plantingId); // <-- Log other fields
                formData.append('planting_id', plantingId);
            }

            // *** Log before making the actual call ***
            console.log('Calling api.scanPlantDisease...');

            // Pass FormData to the API function
            const response = await api.scanPlantDisease(formData);

            // *** Log the raw response ***
            console.log('API Response:', response);

            if (response && response.log_id) {
                 console.log('Scan successful, navigating with logId:', response.log_id);
                 setCapturedImage(null);
                 setIsProcessing(false);
                 navigation.navigate('DiseaseResult', { logId: response.log_id });
            } else {
                 console.error('Scan initiated but failed or log_id missing in response:', response);
                 throw new Error(response?.message || "Failed to initiate scan process. Log ID missing.");
            }

        } catch (error) {
             // *** Log the caught error ***
            console.error("Error in handleUseImage catch block:", error);
            // Log more details if available (e.g., from Axios)
            if (error.response) {
                console.error("Error Response Data:", error.response.data);
                console.error("Error Response Status:", error.response.status);
                console.error("Error Response Headers:", error.response.headers);
            } else if (error.request) {
                // The request was made but no response was received
                console.error("Error Request Data:", error.request);
                Alert.alert("Network Error", "Could not connect to the server. Please check your connection.");
            } else {
                // Something happened in setting up the request that triggered an Error
                console.error('Error Message:', error.message);
            }
            const errorMessage = error.response?.data?.message || error.message || "Could not send image for analysis.";
            Alert.alert("Scan Failed", errorMessage);
            setIsProcessing(false);
             // Decide if you want to keep the image for retry:
             // setCapturedImage(null);
        } finally {
            setIsProcessing(false);
        }
    };

    // handleRetake - Stays the same
    const handleRetake = () => {
        setCapturedImage(null);
        setIsProcessing(false);
    };


    // --- Render Logic ---

    // *** CHANGE 7: New Permission Handling Logic ***
    if (!permission) {
      // Permissions are still loading
      return <View style={styles.center}><ActivityIndicator color={COLORS.primary} /><Text style={{marginTop: 10}}>Requesting camera permission...</Text></View>;
    }

    if (!permission.granted) {
      // Permissions are not granted yet
      return (
        <View style={styles.center}>
          <Text style={{ textAlign: 'center', marginBottom: 20 }}>We need your permission to show the camera</Text>
          <Button onPress={requestPermission} title="Grant Permission" color={COLORS.primary}/>
          {/* Optionally add a button to go back or to settings */}
        </View>
      );
    }

    // Render Preview if image captured/selected - Stays the same
    if (capturedImage) {
        return (
            <ImageBackground source={{ uri: capturedImage.uri }} style={styles.fullScreen} resizeMode="contain">
                 <View style={styles.previewOverlay}>
                     {isProcessing ? (
                        <View style={styles.processingIndicator}>
                            <ActivityIndicator size="large" color={COLORS.white} />
                            <Text style={styles.processingText}>Analyzing...</Text>
                        </View>
                     ) : (
                        <View style={styles.previewButtons}>
                            <TouchableOpacity style={styles.previewButton} onPress={handleRetake} disabled={isProcessing}>
                                <Text style={styles.previewButtonText}>Retake</Text>
                            </TouchableOpacity>
<TouchableOpacity
    style={[styles.previewButton, styles.useButton]}
    onPress={() => {
        if (capturedImage) {
            handleUseImage();
        } else {
            Alert.alert("Error", "No image captured. Please try again.");
        }
    }}
    disabled={isProcessing}
>
    <Text style={[styles.previewButtonText, styles.useButtonText]}>Use Photo</Text>
</TouchableOpacity>
                        </View>
                    )}
                 </View>
            </ImageBackground>
        );
    }

    // Render Camera View only when focused - Stays the same logic
    if (!isFocused) {
       return <View style={styles.center}><Text>Camera paused</Text></View>;
    }

    return (
        <SafeAreaView style={styles.safeArea} edges={['top']}>
            {/* *** CHANGE 8: Use CameraView with new props *** */}
             <CameraView
                 style={styles.camera}
                 facing={facing}               // Use facing prop with string state
                 enableTorch={torchEnabled}     // Use enableTorch prop with boolean state
                 ref={cameraRef}
                 // ratio="16:9" // CameraView might handle ratio differently or automatically, check docs if needed
                 // mode="picture" // Explicitly set mode if needed, defaults often work
             >
                <View style={styles.controlsOverlay}>
                    {/* Top Controls: Flash, Flip */}
                    <View style={styles.topControls}>
                        {/* Torch Button */}
                         {/* *** CHANGE 9: Use toggleTorch and check torchEnabled state *** */}
                        <TouchableOpacity style={styles.controlButton} onPress={toggleTorch}>
                            {torchEnabled ? <Zap size={24} color={COLORS.white} /> : <ZapOff size={24} color={COLORS.white} />}
                        </TouchableOpacity>
                         {/* Flip Camera Button */}
                         {/* *** CHANGE 10: Use toggleCameraFacing *** */}
                        <TouchableOpacity style={styles.controlButton} onPress={toggleCameraFacing}>
                            <FlipHorizontal size={28} color={COLORS.white} />
                        </TouchableOpacity>
                    </View>

                    {/* Bottom Controls: Gallery, Capture */}
                    <View style={styles.bottomControls}>
                         <TouchableOpacity style={styles.controlButton} onPress={pickImage}>
                            <ImageIcon size={30} color={COLORS.white} />
                         </TouchableOpacity>
                        <TouchableOpacity style={styles.captureButtonOuter} onPress={takePicture} disabled={isProcessing}>
                            <View style={styles.captureButtonInner} />
                        </TouchableOpacity>
                        <View style={[styles.controlButton, { backgroundColor: 'transparent'}]}>
                             <View style={{ width: 30, height: 30}} />
                        </View>
                    </View>
                </View>
            </CameraView>
        </SafeAreaView>
    );
};

// Styles remain largely the same
const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: COLORS.black },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20, backgroundColor: COLORS.background },
    camera: { flex: 1 },
    controlsOverlay: {
        flex: 1,
        backgroundColor: 'transparent',
        justifyContent: 'space-between',
        paddingBottom: Platform.OS === 'ios' ? 50 : 40,
        paddingTop: Platform.OS === 'ios' ? 60 : 20,
    },
    topControls: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: 30,
    },
    bottomControls: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 30,
    },
    controlButton: {
        padding: 10,
        borderRadius: 50,
        backgroundColor: 'rgba(0,0,0,0.4)',
        justifyContent: 'center',
        alignItems: 'center',
        width: 50,
        height: 50,
    },
    captureButtonOuter: {
        borderWidth: 4,
        borderColor: 'rgba(255,255,255,0.9)',
        borderRadius: 50,
        padding: 4,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.2)',
    },
    captureButtonInner: {
        width: 65,
        height: 65,
        borderRadius: 35,
        backgroundColor: COLORS.white,
    },
    fullScreen: {
        flex: 1,
        justifyContent: 'flex-end',
        backgroundColor: COLORS.black,
    },
     previewOverlay: {
        backgroundColor: 'rgba(0,0,0,0.5)',
        paddingVertical: 40,
        paddingHorizontal: 20,
        borderTopLeftRadius: 10,
        borderTopRightRadius: 10,
    },
    previewButtons: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
    },
    previewButton: {
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        paddingVertical: 14,
        paddingHorizontal: 30,
        borderRadius: 25,
        minWidth: 120,
        alignItems: 'center',
    },
     useButton: {
        backgroundColor: COLORS.primary,
    },
    previewButtonText: {
        color: COLORS.textDark,
        fontSize: 16,
        fontWeight: 'bold',
    },
     useButtonText: {
        color: COLORS.white,
    },
     processingIndicator: {
        alignItems: 'center',
        justifyContent: 'center',
        height: 90,
    },
    processingText: {
        marginTop: 15,
        color: COLORS.white,
        fontSize: 16,
        fontWeight: '500',
    },
});

export default ScanScreen;