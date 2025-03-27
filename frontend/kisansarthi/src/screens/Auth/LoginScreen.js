import React, { useState, useRef } from 'react';
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
import { ArrowLeft, Phone } from 'lucide-react-native'; // Icons

import { COLORS } from '../../theme/colors';
import * as api from '../../api/api';

const LoginScreen = ({ navigation }) => {
    const [phoneNumber, setPhoneNumber] = useState('');
    const [otp, setOtp] = useState('');
    const [showOtpInput, setShowOtpInput] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    // Optional: Store verification ID if needed by backend
    // const [verificationId, setVerificationId] = useState(null);

    const otpInputRef = useRef(null); // To focus OTP input

    const handleGoToRegister = () => {
        navigation.navigate('Register');
    };

    const handleBackToPhoneInput = () => {
        setShowOtpInput(false);
        setOtp('');
        setError(null);
        // setVerificationId(null); // Reset if used
    };

    const handleRequestOtp = async () => {
        setError(null);
        if (!phoneNumber.trim() || !/^\+?[0-9\s-]{10,}$/.test(phoneNumber)) {
            setError('Please enter a valid phone number.');
            return;
        }
        setIsLoading(true);
        try {
            console.log(`Requesting OTP for ${phoneNumber}`);
            const response = await api.requestOtp(phoneNumber);
            console.log('OTP Request response:', response); // Log backend response
            // Assuming success if no error is thrown
            // setVerificationId(response?.verificationId); // Store if backend sends it
            setShowOtpInput(true);
            // Optional: Focus OTP input after a short delay
            setTimeout(() => otpInputRef.current?.focus(), 100);

        } catch (err) {
            console.error('OTP Request failed:', err);
            setError(err.message || 'Failed to send OTP. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleVerifyOtp = async () => {
        setError(null);
        if (!otp.trim() || otp.length < 4) { // Assuming OTP is at least 4 digits
            setError('Please enter the received OTP code.');
            return;
        }
        setIsLoading(true);
        try {
            console.log(`Verifying OTP ${otp} for ${phoneNumber}`);
            const response = await api.verifyOtp(phoneNumber, otp /*, verificationId*/); // Pass verificationId if needed
            console.log('OTP Verification successful:', response);

            if (response && response.token) {
                await api.storeAuthToken(response.token);
                // Navigate to the main app tabs, replacing the auth stack
                navigation.replace('AppTabs');
            } else {
                 setError('Login completed, but no token received.');
            }

        } catch (err) {
            console.error('OTP Verification failed:', err);
             if (err.status === 401 || err.status === 400) { // Specific errors for invalid OTP
                 setError('Invalid OTP code. Please try again.');
             } else {
                 setError(err.message || 'Failed to verify OTP. Please try again.');
             }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                style={styles.container}
                keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
            >
                <ScrollView contentContainerStyle={styles.scrollContent}>
                    {/* Optional Back Button when showing OTP */}
                    {showOtpInput && (
                        <TouchableOpacity style={styles.backButton} onPress={handleBackToPhoneInput}>
                            <ArrowLeft size={24} color={COLORS.textDark} />
                        </TouchableOpacity>
                    )}

                    <Text style={styles.title}>
                        {showOtpInput ? 'Enter OTP' : 'Welcome Back!'}
                    </Text>
                    <Text style={styles.subtitle}>
                        {showOtpInput
                            ? `We've sent an OTP to ${phoneNumber}. Please enter it below.`
                            : 'Login using your phone number to continue.'}
                    </Text>

                    <View style={styles.inputContainer}>
                        {/* Phone Number Input (Phase 1) */}
                        {!showOtpInput && (
                            <View style={styles.phoneInputWrapper}>
                                <Phone size={20} color={COLORS.placeholder} style={styles.inputIcon} />
                                <TextInput
                                    style={[styles.input, styles.phoneInput]}
                                    placeholder="Phone number"
                                    placeholderTextColor={COLORS.placeholder}
                                    value={phoneNumber}
                                    onChangeText={setPhoneNumber}
                                    keyboardType="phone-pad"
                                    textContentType="telephoneNumber"
                                    autoFocus={true} // Focus on mount
                                />
                            </View>
                        )}

                        {/* OTP Input (Phase 2) */}
                        {showOtpInput && (
                            <TextInput
                                ref={otpInputRef}
                                style={styles.input}
                                placeholder="Enter OTP"
                                placeholderTextColor={COLORS.placeholder}
                                value={otp}
                                onChangeText={setOtp}
                                keyboardType="number-pad"
                                maxLength={6} // Assuming 6-digit OTP
                                textContentType="oneTimeCode" // Helps with autofill OTP
                            />
                        )}
                    </View>

                    {/* Error Message Display */}
                    {error && <Text style={styles.errorText}>{error}</Text>}

                    {/* Action Button (Send OTP / Verify OTP) */}
                    <TouchableOpacity
                        style={[styles.button, isLoading && styles.buttonDisabled]}
                        onPress={showOtpInput ? handleVerifyOtp : handleRequestOtp}
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <ActivityIndicator size="small" color={COLORS.white} />
                        ) : (
                            <Text style={styles.buttonText}>
                                {showOtpInput ? 'Verify OTP' : 'Send OTP'}
                            </Text>
                        )}
                    </TouchableOpacity>

                    {/* Optional: Resend OTP Link */}
                    {showOtpInput && (
                        <TouchableOpacity style={styles.resendContainer} onPress={handleRequestOtp} disabled={isLoading}>
                             <Text style={styles.resendText}>Didn't receive code? Resend OTP</Text>
                        </TouchableOpacity>
                    )}

                     {/* Separator and Register Link */}
                     {!showOtpInput && (
                         <>
                            <Text style={styles.orText}>or</Text>
                            <View style={styles.registerContainer}>
                                <Text style={styles.registerPrompt}>Don't have an account? </Text>
                                <TouchableOpacity onPress={handleGoToRegister}>
                                    <Text style={styles.registerLink}>Register</Text>
                                </TouchableOpacity>
                            </View>
                        </>
                     )}
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

// --- Styles (Adapt from RegisterScreen styles) ---
const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    container: {
        flex: 1,
    },
    scrollContent: {
        flexGrow: 1,
        paddingHorizontal: 25,
        paddingTop: 60, // More space at top
        paddingBottom: 40,
        justifyContent: 'center',
    },
     backButton: {
        position: 'absolute',
        top: 15, // Adjust based on safe area
        left: 15,
        padding: 10,
        zIndex: 1, // Ensure it's clickable
    },
    title: {
        fontSize: 26,
        fontWeight: 'bold',
        color: COLORS.textDark,
        textAlign: 'left',
        marginBottom: 10,
        marginTop: 30, // Space below back button
    },
    subtitle: {
        fontSize: 16,
        color: COLORS.textLight,
        textAlign: 'left',
        marginBottom: 40, // More space before input
        lineHeight: 22,
    },
    inputContainer: {
        width: '100%',
        marginBottom: 15,
    },
     phoneInputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: COLORS.border,
        borderRadius: 12,
        backgroundColor: COLORS.white,
        paddingHorizontal: 15,
        marginBottom: 15,
    },
    inputIcon: {
        marginRight: 10,
    },
    input: {
        // Common styles for both inputs
        paddingVertical: 12,
        fontSize: 16,
        color: COLORS.textDark,
        width: '100%',
    },
    phoneInput: {
        // Specific styles if phone input needs different styling than OTP
        flex: 1, // Take remaining space in wrapper
        borderWidth: 0, // Remove border as it's on the wrapper
        paddingHorizontal: 0, // Remove padding as it's on the wrapper
    },
    button: { // Reuse button styles
        backgroundColor: COLORS.primary,
        paddingVertical: 15,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
        marginTop: 10,
        minHeight: 50,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 3.84,
        elevation: 3,
    },
     buttonDisabled: {
        backgroundColor: '#A8DDE0',
    },
    buttonText: {
        color: COLORS.white,
        fontSize: 18,
        fontWeight: '600',
    },
    errorText: {
        color: COLORS.error,
        fontSize: 14,
        textAlign: 'center',
        marginBottom: 10,
        marginTop: 5,
    },
    orText: {
        fontSize: 14,
        color: COLORS.textLight,
        textAlign: 'center',
        marginVertical: 25,
    },
     registerContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 30,
    },
    registerPrompt: {
        fontSize: 15,
        color: COLORS.textLight,
    },
    registerLink: {
        fontSize: 15,
        color: COLORS.primary,
        fontWeight: '600',
    },
    resendContainer: {
         marginTop: 20,
         alignItems: 'center',
     },
     resendText: {
         fontSize: 14,
         color: COLORS.link,
     },
});

export default LoginScreen;