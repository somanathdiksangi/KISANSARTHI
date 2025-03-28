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
  Image,
  Linking  // Import Image
} from "react-native";
import { Plus } from 'lucide-react-native';
import { SafeAreaView } from "react-native-safe-area-context";

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
  const [alerts, setAlerts] = useState([]);
  const [courses, setCourses] = useState([]);
  const [tips, setTips] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = useCallback(async () => {
    if (!refreshing) {
      setIsLoading(true);
    }
    setError(null);

    try {
      const [userRes, farmsRes, coursesRes] = await Promise.all([
        api.getCurrentUser(),
        api.listFarms(5),
        api.getCourses(5) // Fetch courses
      ]);

      setUserData(userRes);
      setFarms(farmsRes?.farms ?? []);
      setCourses(coursesRes?.courses ?? []);  // Set the courses data
      console.log(farmsRes);
      if (farmsRes?.farms.length != 0) {
        recommendationsRes = await api.getRecommendations({
          type: "alert",
          limit: 3,
          is_read: false,
        });
        const allRecs = recommendationsRes?.recommendations ?? [];

        const fetchedAlerts = allRecs.filter(
          (rec) =>
            rec.recommendation_type?.toLowerCase().includes("alert") ||
            rec.recommendation_type?.toLowerCase().includes("low")
        );
        const fetchedTips = allRecs.filter(
          (rec) => !fetchedAlerts.includes(rec)
        );

        setAlerts(fetchedAlerts.slice(0, 2));
        setTips(fetchedTips.slice(0, 2));
      }
    } catch (err) {
      console.error("Failed to fetch dashboard data:", err);
      setError(err.message || "Failed to load data. Please try again.");
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  }, [refreshing]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
  }, []);

  // --- Navigation Handlers ---
  const handleNotificationPress = () => {
    Alert.alert(
      "Navigate",
      "Go to Notifications Screen (Not implemented yet)."
    );
  };

  const handleAddFarmPress = () => {
    navigation.navigate("AddFarm");
  };

  const handleFarmPress = (farmId) => {
    if (!farmId) return;
    navigation.navigate("FarmDetails", { farmId: farmId });
  };

  const handleViewAllAlerts = () => {
    Alert.alert(
      "Navigate",
      "Go to View All Alerts Screen (Not implemented yet)."
    );
  };

  const handleAlertPress = (alert) => {
    Alert.alert(
      "Navigate",
      `Go to Alert Detail Screen for Alert ID: ${alert.id} (Not implemented yet).`
    );
  };

  const handleViewAllTips = () => {
    Alert.alert(
      "Navigate",
      "Go to View All Tips Screen (Not implemented yet)."
    );
  };

  const handleTipPress = (tip) => {
    Alert.alert(
      "Navigate",
      `Go to Tip Detail Screen for Tip ID: ${tip.id} (Not implemented yet).`
    );
  };

  const handleCoursePress = (course) => {
      // Handle course navigation (e.g., open link, show details)
      Alert.alert(
          "Navigate",
          `Go to Course Link: ${course.link} (Not implemented yet).`
      );
  };

    const getYoutubeThumbnail = (url) => {
        const videoId = url.match(/(?:https?:\/{2})?(?:w{3}\.)?youtu(?:be)?\.(?:com|be)\/(?:watch\?v=)?([^&]+)/)?.[1];
        return videoId ? `https://img.youtube.com/vi/${videoId}/0.jpg` : null;
    };

  // --- Course Card Component ---
  const CourseCard = ({ course }) => {
    const thumbnail = getYoutubeThumbnail(course.link);

    const handlePress = async () => {
        try {
            // Attempt to open the link in the YouTube app
            const supported = await Linking.canOpenURL(`youtube://${course.link}`);

            if (supported) {
                await Linking.openURL(`youtube://${course.link}`);
            } else {
                // If YouTube app is not available, open in the browser
                await Linking.openURL(course.link);
            }
        } catch (error) {
            console.error("An error occurred opening the link:", error);
            // Optionally, show an error message to the user
        }
    };

    return (
        <TouchableOpacity style={styles.courseCard} onPress={handlePress}>
            {thumbnail ? (
                <Image source={{ uri: thumbnail }} style={styles.courseThumbnail} />
            ) : (
                <View style={styles.noThumbnailPlaceholder}>
                    <Text style={styles.noThumbnailText}>No Thumbnail</Text>
                </View>
            )}
            <View style={styles.courseInfo}>
                <Text style={styles.courseDescription} numberOfLines={2}>{course.Description}</Text>
                <Text style={styles.courseViews}>Views: {course.Views}</Text>
            </View>
        </TouchableOpacity>
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
            <FarmCard
              key={farm.id}
              farm={farm}
              onPress={() => handleFarmPress(farm.id)}
            />
          ))}
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

         {/* Courses Section */}
         {courses.length > 0 && (
            <>
                <SectionHeader title="Courses" />
                <View style={styles.sectionContent}>
                    {courses.map((course) => (
                        <CourseCard
                            key={`course-${course.id}`}
                            course={course}
                            onPress={handleCoursePress}
                        />
                    ))}
                </View>
            </>
        )}

        {/* Tips Section */}
        {tips.length > 0 && (
          <>
            <SectionHeader
              title="Tips"
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
        <TouchableOpacity style={styles.button} onPress={handleAddFarmPress}>
          <Plus size={18} color={COLORS.white} style={styles.buttonIcon} />
          <Text style={styles.buttonText}>Add Farm</Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "left", "right"]}>
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
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollContentContainer: {
    flexGrow: 1,
    paddingBottom: 30,
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  errorText: {
    color: COLORS.error,
    fontSize: 14,
    textAlign: "center",
    marginBottom: 12,
    backgroundColor: "#FEE2E2",
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.error,
  },
  populatedContent: {
    paddingHorizontal: 20,
    paddingTop: 15,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
    marginTop: 10,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: COLORS.textDark,
  },
  viewAll: {
    fontSize: 14,
    color: COLORS.link,
    fontWeight: "500",
    textDecorationLine: "underline",
  },
  sectionContent: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 16,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
    marginBottom: 20,
  },
  button: {
    flexDirection: 'row',
    backgroundColor: COLORS.primary,
    paddingVertical: 14,
    paddingHorizontal: 40,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 5,
    transition: 'background-color 0.3s',
  },
  buttonIcon: {
    marginRight: 10,
  },
  buttonText: {
    color: COLORS.white,
    fontSize: 18,
    fontWeight: 'bold',
  },
  buttonPressed: {
    backgroundColor: COLORS.primaryDark,
    transform: [{ scale: 0.98 }],
  },
  '@media (max-width: 400)': {
    sectionTitle: {
      fontSize: 18,
    },
    button: {
      paddingHorizontal: 30,
    },
  },
    // Course Styles
    courseCard: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
        borderRadius: 8,
        backgroundColor: COLORS.surface, // Use a subtle background
        shadowColor: COLORS.shadow,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
        overflow: 'hidden', // Clip content to rounded borders
    },
    courseThumbnail: {
        width: 100,
        height: 100,
        resizeMode: 'cover',
    },
    courseInfo: {
        flex: 1,
        padding: 10,
    },
    courseTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: COLORS.textDark,
    },
    courseDescription: {
        fontSize: 14,
        color: COLORS.textMedium,
    },
    courseViews: {
        fontSize: 12,
        color: COLORS.textLight,
        marginTop: 5,
    },
    noThumbnailPlaceholder: {
        width: 100,
        height: 100,
        backgroundColor: COLORS.border,
        justifyContent: 'center',
        alignItems: 'center',
    },
    noThumbnailText: {
        fontSize: 12,
        color: COLORS.textMedium,
    },
});

export default DashboardScreen;