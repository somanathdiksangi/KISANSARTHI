import React, { useState, useEffect } from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { ActivityIndicator, View, Text } from "react-native";

import RegisterScreen from "../screens/Auth/RegisterScreen";
import LoginScreen from "../screens/Auth/LoginScreen";
import BottomTabNavigator from "./BottomTabNavigator";
import AddFarmScreen from "../screens/App/AddFarmScreen";
import FarmDetailScreen from "../screens/App/FarmDetailScreen";
import AddLandScreen from "../screens/App/AddLandScreen";
import LinkDeviceScreen from "../screens/App/LinkDeviceScreen";
import LandDetailScreen from "../screens/App/LandDetailScreen";
import CropSuggestionScreen from "../screens/App/CropSuggestionScreen";
import ManualSoilInputScreen from '../screens/App/ManualSoilInputScreen';
import SuggestedCropDetailScreen from '../screens/App/SuggestedCropDetailScreen';
import FertilizerRecommendationScreen from '../screens/App/FertilizerRecommendationScreen';
import MarketValueScreen from '../screens/App/MarketValueScreen'; 
import SoilMonitoringScreen from '../screens/App/SoilMonitoringScreen';
import DiseaseResultScreen from '../screens/App/DiseaseResultScreen';
import { useAuth } from '../context/AuthContext'; 
import { getAuthToken } from "../api/api";
import { COLORS } from "../theme/colors";

// const TempLoginScreen = () => <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}><Text>Login Screen</Text></View>;

const Stack = createNativeStackNavigator();

const AppNavigator = () => {
  const { userToken, isLoading } = useAuth();

      // Loading state is now handled by AuthProvider wrapper in App.js
      if (isLoading) {
        // AuthProvider shows loading indicator, so this might not be strictly needed,
        // but can be a fallback or used if AuthProvider logic changes.
        // Returning null is cleaner here if AuthProvider handles loading UI.
        return null;
     }

  useEffect(() => {
    const checkToken = async () => {
      let token = null;
      try {
        token = await getAuthToken();
      } catch (e) {
        console.error("Failed to get auth token", e);
      }
      setUserToken(token);
      setIsLoading(false);
    };
    checkToken();
  }, []);

  if (isLoading) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: COLORS.background,
        }}
      >
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <>
      {" "}
      {/* Use a fragment to wrap the conditional content */}
      {userToken == null ? (
        <Stack.Navigator
          screenOptions={{
            headerShown: false,
          }}
        >
          <Stack.Group>
            <Stack.Screen name="Register" component={RegisterScreen} />
            <Stack.Screen name="Login" component={LoginScreen} />
          </Stack.Group>
        </Stack.Navigator>
      ) : (
        <Stack.Navigator
          screenOptions={{
            headerShown: false,
          }}
        >
          <Stack.Screen name="AppTabs" component={BottomTabNavigator} />
          <Stack.Screen name="AddFarm" component={AddFarmScreen} />
          <Stack.Screen name="FarmDetails" component={FarmDetailScreen} />
          <Stack.Screen name="AddLand" component={AddLandScreen} />
          <Stack.Screen name="LinkDevice" component={LinkDeviceScreen} />
          <Stack.Screen name="LandDetail" component={LandDetailScreen} />
          <Stack.Screen name="ManualSoilInput" component={ManualSoilInputScreen} />
          <Stack.Screen name="SuggestedCropDetail" component={SuggestedCropDetailScreen} />
          <Stack.Screen name="FertilizerRecommendation" component={FertilizerRecommendationScreen} />
          <Stack.Screen name="MarketValue" component={MarketValueScreen} />
          <Stack.Screen name="SoilMonitoring" component={SoilMonitoringScreen} />
          <Stack.Screen name="DiseaseResult" component={DiseaseResultScreen} />
          <Stack.Screen
            name="CropSuggestion"
            component={CropSuggestionScreen}
          />
        </Stack.Navigator>
      )}
    </>
  );
};

export default AppNavigator;
