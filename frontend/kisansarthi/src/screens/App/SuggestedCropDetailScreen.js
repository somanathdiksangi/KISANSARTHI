// src/screens/App/SuggestedCropDetailScreen.js
import React from 'react';
import {
    StyleSheet,
    View,
    ScrollView,
    Text,
    TouchableOpacity,
    Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRoute } from '@react-navigation/native';
import { SlidersHorizontal, Languages, ArrowLeft } from 'lucide-react-native';
import farmImage_default from '../../../assets/farm_background.png'

import { COLORS } from '../../theme/colors';
import StarRating from '../../components/CropSuggestion/StarRating';
import SoilAnalysisCard from '../../components/CropDetail/SoilAnalysisCard';
import GrowingInfoCard from '../../components/CropDetail/GrowingInfoCard';
import RecommendationItem from '../../components/CropDetail/RecommendationItem';

const getDummyImageUrl = (seed) => `https://dummyjson.com/image/600x400/nature?${seed || Math.random()}`;

const SuggestedCropDetailScreen = ({ navigation }) => {
    const route = useRoute();
    const suggestion = route.params?.suggestion ?? null;
    const soilContext = route.params?.soilContext ?? {};

    const handleFilterPress = () => Alert.alert("Filter", "Filter/Sort options WIP.");
    const handleLanguagePress = () => Alert.alert("Language", "Language change WIP.");

    if (!suggestion || !suggestion.crop) {
        return (
            <SafeAreaView style={styles.safeArea}>
                 {/* Basic Header for error state */}
                <View style={styles.customHeader}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconButton}>
                        <ArrowLeft size={24} color={COLORS.textDark} />
                    </TouchableOpacity>
                     <Text style={styles.headerTitle} numberOfLines={1}>Error</Text>
                     <View style={{width: 50}}/>{/* Spacer */}
                 </View>
                <View style={styles.center}><Text>Crop suggestion details not available.</Text></View>
            </SafeAreaView>
        );
    }

    const cropDetails = suggestion.crop;
    const score = suggestion.match ?? suggestion.suitability_score ?? 0;
    const matchPercentage = Math.round(score * 100);
    const rating = score * 5;
    const imageUrl = cropDetails?.image_url || getDummyImageUrl(cropDetails.id);
    const description = suggestion.crop.description || 'No description available.';
    const explanation = suggestion.explanation || null;

    const currentPH = soilContext?.npkPh?.ph;
    const currentMoisture = soilContext?.npkPh?.moisture_value;

    const optimalPHRange = cropDetails?.optimal_ph_min && cropDetails?.optimal_ph_max
        ? `${cropDetails.optimal_ph_min} - ${cropDetails.optimal_ph_max}`
        : suggestion.details?.optimal_ph;

    const optimalMoistureRange = cropDetails?.optimal_moisture_range
        || suggestion.details?.optimal_moisture;

    const parseMultiline = (text) => {
        if (!text) return { main: '--', sub: null };
        const lines = text.split('\n');
        return { main: lines[0] || '--', sub: lines[1] || null };
    };
    const growingSeason = parseMultiline(suggestion.growing_season);
    const waterRequirement = parseMultiline(suggestion.water_requirement);
    const expectedYield = parseMultiline(suggestion.expected_yield);

    const recommendations = suggestion.recommendations || [];
    const getRecType = (text) => {
        const lowerText = text.toLowerCase();
        if (lowerText.includes('monitor') || lowerText.includes('check')) return 'warning';
        if (lowerText.includes('add') || lowerText.includes('maintain') || lowerText.includes('ensure')) return 'success';
        return 'info';
    };

    return (
        <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
            {/* Header */}
             <View style={styles.customHeader}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconButton}>
                    <ArrowLeft size={24} color={COLORS.textDark} />
                </TouchableOpacity>
                <Text style={styles.headerTitle} numberOfLines={1}>{cropDetails.crop_name}</Text>
                <View style={styles.headerRightIcons}>
                     <TouchableOpacity onPress={handleFilterPress} style={styles.iconButton}>
                         <SlidersHorizontal size={22} color={COLORS.textDark} />
                     </TouchableOpacity>
                     <TouchableOpacity onPress={handleLanguagePress} style={[styles.iconButton, {marginLeft: 5}]}>
                         <Languages size={24} color={COLORS.textDark} />
                     </TouchableOpacity>
                </View>
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent}>
                {/* Image */}
                <Image source={farmImage_default} style={styles.cropImage} />

                {/* Title and Score */}
                <View style={styles.titleContainer}>
                    <View style={styles.titleLeft}>
                        <Text style={styles.cropTitle}>{cropDetails.crop_name}</Text>
                        <Text style={styles.matchText}>({matchPercentage}% Match)</Text>
                    </View>
                     <View style={styles.ratingContainer}>
                        <Text style={styles.ratingLabel}>Suitability Score:</Text>
                        <StarRating rating={rating} size={22}/>
                    </View>
                </View>

                {/* Description & Explanation */}
                <Text style={styles.description}>{description}</Text>
                {explanation && <Text style={styles.explanation}>{explanation}</Text>}

                 {/* Soil Analysis Result */}
                 <View style={styles.section}>
                     <Text style={styles.sectionTitle}>Soil Analysis Result</Text>
                     <View style={styles.soilCardsRow}>
                        <SoilAnalysisCard
                            label="pH (Levels)"
                            currentValue={currentPH}
                            optimalValue={optimalPHRange}
                        />
                         <SoilAnalysisCard
                            label="Moisture"
                            currentValue={currentMoisture}
                            optimalValue={optimalMoistureRange}
                            unit="%"
                        />
                    </View>
                 </View>

                 {/* Growing Information */}
                 <View style={styles.section}>
                     <Text style={styles.sectionTitle}>Growing Information</Text>
                     <GrowingInfoCard
                        iconName="calendar"
                        title="Growing Season"
                        value={growingSeason.main}
                        subValue={growingSeason.sub}
                     />
                      <GrowingInfoCard
                        iconName="water"
                        title="Water Requirement"
                        value={waterRequirement.main}
                        subValue={waterRequirement.sub}
                     />
                      <GrowingInfoCard
                        iconName="yield"
                        title="Expected Yield"
                        value={expectedYield.main}
                        subValue={expectedYield.sub}
                     />
                 </View>

                 {/* Recommendation Section */}
                  <View style={[styles.section, styles.recommendationSection]}>
                     <Text style={[styles.sectionTitle, styles.recommendationTitle]}>Recommendation</Text>
                     {recommendations.length > 0 ? (
                         recommendations.map((recText, index) => (
                             <RecommendationItem key={index} text={recText} type={getRecType(recText)} />
                         ))
                     ) : (
                         <Text style={styles.noRecommendationsText}>No specific recommendations provided.</Text>
                     )}
                 </View>

            </ScrollView>
        </SafeAreaView>
    );
};

// --- Styles ---
const styles = StyleSheet.create({
    // ... (keep safeArea, center, errorText) ...
    // Custom Header specific styles (reuse from CropSuggestionScreen)
    customHeader: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 15, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: COLORS.border, backgroundColor: COLORS.white },
    headerTitle: { flex: 1, fontSize: 18, fontWeight: '600', color: COLORS.textDark, textAlign: 'center', marginHorizontal: 10 },
    headerRightIcons: { flexDirection: 'row' },
    iconButton: { padding: 5 },
    // ScrollView content
    scrollContent: { paddingBottom: 40 },
    cropImage: { width: '100%', height: 220, backgroundColor: COLORS.border },
    titleContainer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', paddingHorizontal: 20, marginTop: 15, marginBottom: 8 },
    titleLeft: { flexShrink: 1, marginRight: 10 },
    cropTitle: { fontSize: 24, fontWeight: 'bold', color: COLORS.textDark },
    matchText: { fontSize: 14, fontWeight: '500', color: COLORS.secondary, marginTop: 2 },
    ratingContainer: { alignItems: 'flex-end', paddingTop: 5 }, // Add padding to align better
    ratingLabel: { fontSize: 12, color: COLORS.textLight, marginBottom: 3 },
    description: { fontSize: 15, color: COLORS.textMedium, lineHeight: 22, paddingHorizontal: 20, marginBottom: 10 }, // Description first
    explanation: { fontSize: 14, fontWeight: '600', color: COLORS.textDark, lineHeight: 20, paddingHorizontal: 20, marginBottom: 25 }, // Explanation below description
    section: { marginBottom: 25, paddingHorizontal: 15 },
    sectionTitle: { fontSize: 18, fontWeight: 'bold', color: COLORS.textDark, marginBottom: 15 },
    soilCardsRow: { flexDirection: 'row', marginHorizontal: -5 },
    recommendationSection: { backgroundColor: COLORS.primaryLight, borderRadius: 12, padding: 15, marginHorizontal: 15 },
    recommendationTitle: { marginBottom: 12, color: COLORS.primaryDark },
    noRecommendationsText: { fontSize: 15, color: COLORS.textMedium, fontStyle: 'italic', textAlign: 'center', paddingVertical: 10 },
});

export default SuggestedCropDetailScreen;