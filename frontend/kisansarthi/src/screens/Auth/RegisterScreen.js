import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity, // Using TouchableOpacity for simplicity, Pressable is also good
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
  Alert,
  Linking,
} from "react-native";
import { Check, Languages } from "lucide-react-native"; // Icon library
import * as WebBrowser from "expo-web-browser";
import { useAuth } from '../../context/AuthContext';

import { COLORS } from "../../theme/colors"; // Import defined colors
import * as api from "../../api/api"; // Import all API functions

// Navigation prop will be provided by React Navigation
const RegisterScreen = ({ navigation }) => {
  const [name, setName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [password, setPassword] = useState(""); // Added Password field
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const { login } = useAuth();

  const handleLoginPress = () => {
    // Navigate to Login Screen - Placeholder action
    navigation.navigate('Login');
    // console.log("Navigate to Login");
    // Alert.alert(
    //   "Navigation",
    //   "Navigate to Login Screen (Not implemented yet)."
    // );
  };

  const handleLanguageChange = () => {
    // Placeholder for language change logic
    Alert.alert("Language", "Language change feature to be implemented.");
  };

  const handleTermsPress = async () => {
    // Replace with your actual Terms URL
    await WebBrowser.openBrowserAsync("https://example.com/terms");
  };

  const handlePrivacyPress = async () => {
    // Replace with your actual Privacy Policy URL
    await WebBrowser.openBrowserAsync("https://example.com/privacy");
  };

  const handleRegister = async () => {
    setError(null); // Clear previous errors

    // Basic Validation
    if (!name.trim()) {
      setError("Please enter your first name.");
      return;
    }
    // Basic phone validation (can be improved)
    if (!phoneNumber.trim() || !/^\+?[0-9\s-]{10,}$/.test(phoneNumber)) {
      setError("Please enter a valid phone number.");
      return;
    }
    if (!password) {
      // Check password
      setError("Please enter a password.");
      return;
    }
    if (password.length < 6) {
      // Example: minimum length
      setError("Password must be at least 6 characters long.");
      return;
    }
    if (!agreedToTerms) {
      setError("You must agree to the Terms & Conditions and Privacy Policy.");
      return;
    }

    setIsLoading(true);
      const userData = {
        name: name,
        phone_number: phoneNumber,
        password: password,
        // NOTE: Email is required by the backend API but not in this UI.
        // The backend might need adjustment, or the UI needs an email field.
        // For now, sending without email - expect potential backend error depending on its validation.
        // A dummy email could be sent if needed temporarily for testing:
        // email: `${phoneNumber.replace(/[^0-9]/g, '')}@example.com`
      };

        setIsLoading(true);
        try {
            const response = await api.register(userData);
            if (response && response.token) {
                 // ++ Use context login function ++
                await login(response.token);
                // No need to manually navigate
            } else {
                 setError('Registration completed, but no token received.');
                 setIsLoading(false); // Stop loading on error
            }
        } catch (err) {
            // ... error handling ...
             setIsLoading(false); // Stop loading on error
        }
         // No finally setIsLoading here if login triggers navigation
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.container}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20} // Adjust offset if needed
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {/* Language Change Button */}
          <TouchableOpacity
            style={styles.langButton}
            onPress={handleLanguageChange}
          >
            <Languages size={24} color={COLORS.textDark} />
            <Text style={styles.langButtonText}>Language</Text>
          </TouchableOpacity>

          {/* Header Text */}
          <Text style={styles.title}>Welcome to Framfresh</Text>
          <Text style={styles.subtitle}>
            Create an account to connect your farm to your phone and monitor it
            from anywhere at anytime.
          </Text>

          {/* Form Inputs */}
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="First name"
              placeholderTextColor={COLORS.placeholder}
              value={name}
              onChangeText={setName}
              autoCapitalize="words"
              textContentType="name" // Helps with autofill
            />
            <TextInput
              style={styles.input}
              placeholder="Phone number"
              placeholderTextColor={COLORS.placeholder}
              value={phoneNumber}
              onChangeText={setPhoneNumber}
              keyboardType="phone-pad"
              textContentType="telephoneNumber" // Helps with autofill
            />
            <TextInput // Added Password Field
              style={styles.input}
              placeholder="Password"
              placeholderTextColor={COLORS.placeholder}
              value={password}
              onChangeText={setPassword}
              secureTextEntry // Hides password input
              textContentType="newPassword" // Helps with password managers
            />
          </View>

          {/* Error Message Display */}
          {error && <Text style={styles.errorText}>{error}</Text>}

          {/* Register Button */}
          <TouchableOpacity
            style={[styles.button, isLoading && styles.buttonDisabled]}
            onPress={handleRegister}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator size="small" color={COLORS.white} />
            ) : (
              <Text style={styles.buttonText}>Register</Text>
            )}
          </TouchableOpacity>

          {/* "Or" Separator */}
          <Text style={styles.orText}>or</Text>

          {/* Login Link */}
          <View style={styles.loginContainer}>
            <Text style={styles.loginPrompt}>Already have an account? </Text>
            {/* Updated onPress */}
            <TouchableOpacity onPress={handleLoginPress}>
              <Text style={styles.loginLink}>Login</Text>
            </TouchableOpacity>
          </View>
          {/* Terms Agreement Checkbox */}
          <View style={styles.termsContainer}>
            <TouchableOpacity
              style={[
                styles.checkboxBase,
                agreedToTerms && styles.checkboxChecked,
              ]}
              onPress={() => setAgreedToTerms(!agreedToTerms)}
            >
              {agreedToTerms && <Check size={16} color={COLORS.white} />}
            </TouchableOpacity>
            <Text style={styles.termsText}>
              By continuing, you agree to Framfresh's{" "}
              <Text style={styles.linkText} onPress={handleTermsPress}>
                Terms & Conditions
              </Text>{" "}
              and{" "}
              <Text style={styles.linkText} onPress={handlePrivacyPress}>
                Privacy Policy
              </Text>
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

// --- Styles ---
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
    marginTop: 20
  },
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1, // Allows content to scroll if needed
    paddingHorizontal: 25,
    paddingTop: 30, // Adjust as needed
    paddingBottom: 40,
    justifyContent: "center", // Center vertically if content is short
  },
  langButton: {
    position: "absolute",
    top: 15, // Adjust position relative to safe area/header if present
    right: 20,
    flexDirection: "row",
    alignItems: "center",
    padding: 5,
  },
  langButtonText: {
    marginLeft: 5,
    fontSize: 14,
    color: COLORS.textDark,
  },
  title: {
    fontSize: 26,
    fontWeight: "bold",
    color: COLORS.textDark,
    textAlign: "left", // Match image alignment
    marginBottom: 10,
    marginTop: 50, // Add space below language button
  },
  subtitle: {
    fontSize: 16,
    color: COLORS.textLight,
    textAlign: "left",
    marginBottom: 30,
    lineHeight: 22,
  },
  inputContainer: {
    width: "100%",
    marginBottom: 15,
  },
  input: {
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12, // Rounded corners
    paddingHorizontal: 15,
    paddingVertical: 12, // Adjust for comfortable height
    fontSize: 16,
    color: COLORS.textDark,
    marginBottom: 15, // Space between inputs
    width: "100%",
  },
  button: {
    backgroundColor: COLORS.primary,
    paddingVertical: 15,
    borderRadius: 12, // Rounded corners
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    marginTop: 10,
    minHeight: 50, // Ensure button has a good minimum height
    // Subtle Shadow (optional, platform-specific)
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3.84,
    elevation: 3,
  },
  buttonDisabled: {
    backgroundColor: "#A8DDE0", // Lighter shade when disabled
  },
  buttonText: {
    color: COLORS.white,
    fontSize: 18,
    fontWeight: "600", // Semi-bold
  },
  orText: {
    fontSize: 14,
    color: COLORS.textLight,
    textAlign: "center",
    marginVertical: 20,
  },
  loginContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 30,
  },
  loginPrompt: {
    fontSize: 15,
    color: COLORS.textLight,
  },
  loginLink: {
    fontSize: 15,
    color: COLORS.primary, // Use primary color for link
    fontWeight: "600",
  },
  termsContainer: {
    flexDirection: "row",
    alignItems: "flex-start", // Align checkbox to top of text
    width: "100%",
    marginTop: 20,
  },
  checkboxBase: {
    width: 22,
    height: 22,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
    borderWidth: 1.5,
    borderColor: COLORS.primary,
    borderRadius: 4,
    backgroundColor: COLORS.white,
  },
  checkboxChecked: {
    backgroundColor: COLORS.primary,
  },
  termsText: {
    flex: 1, // Allow text to wrap
    fontSize: 13,
    color: COLORS.textLight,
    lineHeight: 18,
  },
  linkText: {
    color: COLORS.primary, // Use primary color for links within text
    textDecorationLine: "underline",
    fontWeight: "500",
  },
  errorText: {
    color: COLORS.error,
    fontSize: 14,
    textAlign: "center",
    marginBottom: 10,
    marginTop: 5,
  },
});

export default RegisterScreen;
