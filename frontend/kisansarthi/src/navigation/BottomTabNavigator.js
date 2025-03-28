// src/navigation/BottomTabNavigator.js
import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Home, ScanLine, User } from 'lucide-react-native'; // Changed BarChart3 to User
import { Platform, View, Text } from 'react-native'; // Added View, Text for placeholder

import DashboardScreen from '../screens/App/DashboardScreen';
// ++ Import ProfileScreen ++
import ProfileScreen from '../screens/App/ProfileScreen'; // We'll create this next
// -- Remove AnalyticsScreen imports/placeholders --
// import AnalyticsScreen from '../screens/App/AnalyticsScreen';
import { COLORS } from '../theme/colors';

const Tab = createBottomTabNavigator();

// Temporary placeholder screen
const ScanScreen = () => <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}><Text>Scan Screen</Text></View>;
// Removed AnalyticsScreen placeholder

const BottomTabNavigator = () => {
    return (
        <Tab.Navigator
            screenOptions={({ route }) => ({
                headerShown: false,
                tabBarIcon: ({ focused, color, size }) => {
                    let IconComponent;

                    if (route.name === 'Dashboard') {
                        IconComponent = Home;
                    } else if (route.name === 'Scan') {
                        IconComponent = ScanLine;
                    } else if (route.name === 'Profile') { // ++ Changed from Analytics ++
                        IconComponent = User; // ++ Use User icon ++
                    } else {
                         IconComponent = Home; // Fallback
                    }

                    return <IconComponent size={focused ? size + 2 : size} color={color} />;
                },
                tabBarActiveTintColor: COLORS.primary,
                tabBarInactiveTintColor: COLORS.textLight,
                tabBarStyle: {
                    backgroundColor: COLORS.white, borderTopWidth: 1, borderTopColor: COLORS.border,
                    height: Platform.OS === 'ios' ? 90 : 65, paddingBottom: Platform.OS === 'ios' ? 30 : 5, paddingTop: 5,
                },
                tabBarLabelStyle: { fontSize: 11, fontWeight: '500' },
            })}
        >
            <Tab.Screen
                name="Dashboard"
                component={DashboardScreen}
                options={{ tabBarLabel: 'Home' }}
            />
            <Tab.Screen
                name="Scan"
                component={ScanScreen}
            />
            {/* ++ Changed Analytics to Profile ++ */}
            <Tab.Screen
                name="Profile"
                component={ProfileScreen} // Use the new screen component
                options={{ tabBarLabel: 'Profile' }} // Update label
            />
        </Tab.Navigator>
    );
};

export default BottomTabNavigator;