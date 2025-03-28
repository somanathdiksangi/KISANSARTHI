import React, { createContext, useState, useEffect, useContext, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ActivityIndicator, View } from 'react-native'; // For loading indicator
import * as api from '../api/api'; // Import your API functions
import { COLORS } from '../theme/colors';

// Key for storing the auth token
const AUTH_TOKEN_KEY = 'userAuthToken'; // Ensure this matches api.js if defined there

// Create the context
const AuthContext = createContext({
    userToken: null,
    isLoading: true,
    login: async (token) => {}, // Function placeholder
    logout: async () => {},    // Function placeholder
});

// Create the provider component
export const AuthProvider = ({ children }) => {
    const [userToken, setUserToken] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    // Check token on initial load
    useEffect(() => {
        const bootstrapAsync = async () => {
            let token = null;
            try {
                token = await AsyncStorage.getItem(AUTH_TOKEN_KEY);
                // Optional: Verify token validity with backend here
            } catch (e) {
                console.error('Restoring token failed', e);
            }
            setUserToken(token);
            setIsLoading(false);
        };
        bootstrapAsync();
    }, []);

    const authContextValue = React.useMemo(
        () => ({
            userToken,
            isLoading,
            login: async (token) => {
                try {
                    await AsyncStorage.setItem(AUTH_TOKEN_KEY, token);
                    setUserToken(token); // Update state
                } catch (e) {
                    console.error('Failed to save token after login', e);
                }
            },
            logout: async () => {
                try {
                    await AsyncStorage.removeItem(AUTH_TOKEN_KEY);
                    setUserToken(null); // Update state
                } catch (e) {
                    console.error('Failed to remove token on logout', e);
                }
            },
        }),
        [userToken, isLoading]
    );

    // Show loading indicator while checking token
    if (isLoading) {
        return (
             <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.background }}>
                 <ActivityIndicator size="large" color={COLORS.primary} />
            </View>
        );
    }

    return (
        <AuthContext.Provider value={authContextValue}>
            {children}
        </AuthContext.Provider>
    );
};

// Custom hook to use the auth context
export const useAuth = () => {
    return useContext(AuthContext);
};