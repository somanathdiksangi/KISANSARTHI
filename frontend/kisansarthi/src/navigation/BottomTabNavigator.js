import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Home, ScanLine, BarChart3 } from 'lucide-react-native'; // Icons

import DashboardScreen from '../screens/App/DashboardScreen';
// Import other tab screens when created
// import ScanScreen from '../screens/App/ScanScreen';
// import AnalyticsScreen from '../screens/App/AnalyticsScreen';
import { COLORS } from '../theme/colors';
import { Platform } from 'react-native';

const Tab = createBottomTabNavigator();

// Temporary placeholder screens
const ScanScreen = () => <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}><Text>Scan Screen</Text></View>;
const AnalyticsScreen = () => <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}><Text>Analytics Screen</Text></View>;


const BottomTabNavigator = () => {
    return (
        <Tab.Navigator
            screenOptions={({ route }) => ({
                headerShown: false, // We have custom headers in screens
                tabBarIcon: ({ focused, color, size }) => {
                    let IconComponent = Home; // Default icon

                    if (route.name === 'Dashboard') {
                        IconComponent = Home;
                    } else if (route.name === 'Scan') {
                        IconComponent = ScanLine;
                    } else if (route.name === 'Analytics') {
                        IconComponent = BarChart3;
                    }

                    // Adjust size and color based on focus state
                    return <IconComponent size={focused ? size + 2 : size} color={color} />;
                },
                tabBarActiveTintColor: COLORS.primary, // Color for active tab
                tabBarInactiveTintColor: COLORS.textLight, // Color for inactive tabs
                tabBarStyle: {
                    backgroundColor: COLORS.white,
                    borderTopWidth: 1,
                    borderTopColor: COLORS.border,
                    height: Platform.OS === 'ios' ? 90 : 65, // Adjust height
                    paddingBottom: Platform.OS === 'ios' ? 30 : 5, // Adjust padding for notch/android
                    paddingTop: 5,
                },
                tabBarLabelStyle: {
                    fontSize: 11,
                    fontWeight: '500',
                    // marginBottom: 5, // Adjust label position
                },
            })}
        >
            <Tab.Screen
                name="Dashboard"
                component={DashboardScreen}
                options={{ tabBarLabel: 'Home' }} // Label shown in the tab bar
            />
            <Tab.Screen
                name="Scan"
                component={ScanScreen} // Replace with actual ScanScreen later
            />
            <Tab.Screen
                name="Analytics"
                component={AnalyticsScreen} // Replace with actual AnalyticsScreen later
            />
        </Tab.Navigator>
    );
};

export default BottomTabNavigator;