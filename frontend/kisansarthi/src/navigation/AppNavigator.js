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
import { getAuthToken } from "../api/api";
import { COLORS } from "../theme/colors";

// const TempLoginScreen = () => <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}><Text>Login Screen</Text></View>;

const Stack = createNativeStackNavigator();

const AppNavigator = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [userToken, setUserToken] = useState(null);

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
