import React, { useState, useEffect, useCallback } from "react";
import {
  StyleSheet,
  View,
  ScrollView,
  ActivityIndicator,
  Text,
  TouchableOpacity,
  RefreshControl,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context"; // Use edge-to-edge safe area

import { COLORS } from "../../theme/colors";
import * as api from "../../api/api";

import DashboardHeader from "../../components/Dashboard/DashboardHeader";
import EmptyDashboard from "../../components/Dashboard/EmptyDashboard";
import FarmCard from "../../components/Dashboard/FarmCard";
import AlertCard from "../../components/Dashboard/AlertCard";
import TipCard from "../../components/Dashboard/TipCard";
import SectionHeader from "../../components/Common/SectionHeader";

const DashboardScreen = ({ navigation }) => {
  const [userData, setUserData] = useState(null);
  const [farms, setFarms] = useState([]);
  const [alerts, setAlerts] = useState([]); // Use recommendations for alerts for now
  const [tips, setTips] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = useCallback(async () => {
    // Don't set loading true on refresh, use refreshing state
    if (!refreshing) {
      setIsLoading(true);
    }
    setError(null);

    try {
      // Fetch data concurrently
      const [userRes, farmsRes] = await Promise.all([
        api.getCurrentUser(),
        api.listFarms(5), // Limit farms displayed initially if needed
        // TODO: Add specific alert fetching if backend supports it
        // For now, reuse recommendations or fetch all types
      ]);

      setUserData(userRes);
      setFarms(farmsRes?.farms ?? []);
      console.log(farmsRes);
      if (farmsRes?.farms.length != 0) {
        recommendationsRes = await api.getRecommendations({
          type: "weekly_tip",
          limit: 3,
          is_read: false,
        });
        const allRecs = recommendationsRes?.recommendations ?? [];
        // Separate recommendations into alerts and tips (example logic)
        // Assuming alerts might be a different type or identified by title pattern
        const fetchedAlerts = allRecs.filter(
          (rec) =>
            rec.title?.toLowerCase().includes("alert") ||
            rec.title?.toLowerCase().includes("low")
        ); // Example filter
        const fetchedTips = allRecs.filter(
          (rec) => !fetchedAlerts.includes(rec)
        );

        setAlerts(fetchedAlerts.slice(0, 2)); // Show max 2 recent alerts
        setTips(fetchedTips.slice(0, 2)); // Show max 2 recent tips
      }
    } catch (err) {
      console.error("Failed to fetch dashboard data:", err);
      setError(err.message || "Failed to load data. Please try again.");
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  }, [refreshing]); // Depend on refreshing state

  useEffect(() => {
    fetchData();
  }, [fetchData]); // Run fetchData when component mounts or refresh state changes

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    // fetchData will be triggered by the useEffect dependency change
  }, []);

  // --- Navigation Handlers ---
  const handleNotificationPress = () => {
    // navigation.navigate('Notifications');
    Alert.alert(
      "Navigate",
      "Go to Notifications Screen (Not implemented yet)."
    );
  };

  const handleAddFarmPress = () => {
    // navigation.navigate('AddFarm');
    navigation.navigate("AddFarm");
  };

  const handleFarmPress = (farmId) => {
    // Pass farmId now
    if (!farmId) return;
    // ++ Navigate to the NEW FarmDetails screen ++
    navigation.navigate("FarmDetails", { farmId: farmId });
  };

  const handleViewAllAlerts = () => {
    // navigation.navigate('AlertsList');
    Alert.alert(
      "Navigate",
      "Go to View All Alerts Screen (Not implemented yet)."
    );
  };

  const handleAlertPress = (alert) => {
    // navigation.navigate('AlertDetail', { alertId: alert.id });
    Alert.alert(
      "Navigate",
      `Go to Alert Detail Screen for Alert ID: ${alert.id} (Not implemented yet).`
    );
  };

  const handleViewAllTips = () => {
    // navigation.navigate('TipsList');
    Alert.alert(
      "Navigate",
      "Go to View All Tips Screen (Not implemented yet)."
    );
  };

  const handleTipPress = (tip) => {
    // navigation.navigate('TipDetail', { tipId: tip.id });
    Alert.alert(
      "Navigate",
      `Go to Tip Detail Screen for Tip ID: ${tip.id} (Not implemented yet).`
    );
  };

  // --- Render Content ---
  const renderContent = () => {
    if (isLoading) {
      return (
        <ActivityIndicator
          size="large"
          color={COLORS.primary}
          style={styles.center}
        />
      );
    }
    if (error) {
      return <Text style={[styles.center, styles.errorText]}>{error}</Text>;
    }
    if (farms.length === 0) {
      return <EmptyDashboard onAddFarmPress={handleAddFarmPress} />;
    }

    // Populated Dashboard
    return (
      <View style={styles.populatedContent}>
        {/* Your Farms Section */}
        <SectionHeader title="Your Farms" />
        <View style={styles.sectionContent}>
          {farms.map((farm) => (
            // Assuming farm object here *is* the farm, pass farm.id
            <FarmCard
              key={farm.id}
              farm={farm}
              onPress={() => handleFarmPress(farm.id)}
            />
          ))}
          {/* TODO: Add "View All Farms" if applicable */}
        </View>

        {/* Recent Alerts Section */}
        {alerts.length > 0 && (
          <>
            <SectionHeader
              title="Recent Alerts"
              onViewAll={handleViewAllAlerts}
            />
            <View style={styles.sectionContent}>
              {alerts.map((alert) => (
                <AlertCard
                  key={`alert-${alert.id}`}
                  alert={alert}
                  onPress={handleAlertPress}
                />
              ))}
            </View>
          </>
        )}

        {/* Courses & Tips Section */}
        {tips.length > 0 && (
          <>
            <SectionHeader
              title="Courses & Tips"
              onViewAll={handleViewAllTips}
            />
            <View style={styles.sectionContent}>
              {tips.map((tip) => (
                <TipCard
                  key={`tip-${tip.id}`}
                  tip={tip}
                  onPress={handleTipPress}
                />
              ))}
            </View>
          </>
        )}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "left", "right"]}>
      {/* Keep bottom edge for potential bottom tabs */}
      <DashboardHeader
        userName={userData?.name}
        onNotificationPress={handleNotificationPress}
      />
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContentContainer}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={COLORS.primary}
          />
        }
      >
        {renderContent()}
      </ScrollView>
      {/* Bottom Tab Navigator will be placed here by the navigator setup */}
    </SafeAreaView>
  );
};

// // Helper component for section headers
// const SectionHeader = ({ title, onViewAll }) => (
//     <View style={styles.sectionHeader}>
//         <Text style={styles.sectionTitle}>{title}</Text>
//         {onViewAll && (
//             <TouchableOpacity onPress={onViewAll}>
//                 <Text style={styles.viewAll}>View All</Text>
//             </TouchableOpacity>
//         )}
//     </View>
// );

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background, // Use the light grey background
  },
  scrollView: {
    flex: 1,
  },
  scrollContentContainer: {
    flexGrow: 1, // Ensure content can grow to fill space, important for centering empty state
    paddingBottom: 30, // Add padding at the bottom
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  errorText: {
    color: COLORS.error,
    textAlign: "center",
  },
  // Styles for the populated dashboard content
  populatedContent: {
    paddingHorizontal: 15, // Add horizontal padding for sections
    paddingTop: 10,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 20, // Space above section title
    marginBottom: 12,
    paddingHorizontal: 5, // Slight inner padding for alignment
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: COLORS.textDark,
  },
  viewAll: {
    fontSize: 14,
    color: COLORS.link,
    fontWeight: "500",
  },
  sectionContent: {
    // Styles for the container holding cards within a section
  },
});

export default DashboardScreen;
