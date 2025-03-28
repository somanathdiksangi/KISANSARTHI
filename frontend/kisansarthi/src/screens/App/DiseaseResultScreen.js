// src/screens/App/DiseaseResultScreen.js
import React, { useState, useEffect, useCallback } from 'react';
import {
    StyleSheet,
    View,
    ScrollView,
    ActivityIndicator,
    Text,
    TouchableOpacity,
    Image,
    Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRoute } from '@react-navigation/native';
import { ArrowLeft, Languages, Clock, MapPin, AlertTriangle as WarningIcon } from 'lucide-react-native'; // Icons
import { formatDistanceToNowStrict } from 'date-fns'; // For relative time (if needed)

import { COLORS } from '../../theme/colors';
import * as api from '../../api/api';

// Import Components
import RecommendationItem from '../../components/CropDetail/RecommendationItem'; // Reuse this for remedies
import SectionHeader from '../../components/Common/SectionHeader'; // Reuse if needed for structure

// Helper to format date/time
const formatFullDateTime = (isoString) => {
    if (!isoString) return 'Unknown time';
    try {
        return new Date(isoString).toLocaleString('en-US', {
            year: 'numeric', month: 'long', day: 'numeric', hour: 'numeric', minute: '2-digit'
        });
    } catch (e) { return 'Invalid Date'; }
};

const DiseaseResultScreen = ({ navigation }) => {
    const route = useRoute();
    const logId = route.params?.logId ?? null;

    const [logData, setLogData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [pollIntervalId, setPollIntervalId] = useState(null);

    const fetchData = useCallback(async () => {
        if (!logId) {
             setError("Diagnosis log ID not provided."); setIsLoading(false); return;
        }
        // No need to set loading true on poll
        // setIsLoading(true);
        setError(null);

        try {
            const data = await api.getDiagnosisLog(logId);
            setLogData(data);

            // Stop polling if completed or failed
            if (data.processing_status !== 'pending') {
                 if(pollIntervalId) clearInterval(pollIntervalId);
                 setPollIntervalId(null);
                 setIsLoading(false); // Final state, stop loading indicator
            } else {
                 // Still pending, ensure loading indicator is shown
                 setIsLoading(true);
            }

        } catch (err) {
            console.error("Failed to fetch diagnosis log:", err);
            setError(err.message || "Failed to load diagnosis result.");
            setIsLoading(false); // Stop loading on error
            if(pollIntervalId) clearInterval(pollIntervalId); // Stop polling on error
            setPollIntervalId(null);
        }
    }, [logId, pollIntervalId]);

    // Initial Fetch and Polling Logic
    useEffect(() => {
        if (logId) {
            fetchData(); // Initial fetch

            // Set up polling if status might be pending initially
            const intervalId = setInterval(() => {
                 setLogData(prevData => {
                    // Only poll if the previous state was pending
                    if (prevData?.processing_status === 'pending') {
                        console.log("Polling for diagnosis results...");
                        fetchData(); // Re-fetch data
                    } else {
                        // If status changed, clear interval from within
                        clearInterval(intervalId);
                        setPollIntervalId(null);
                    }
                    return prevData; // Return previous data while fetching
                });
            }, 5000); // Poll every 5 seconds

            setPollIntervalId(intervalId); // Store interval ID

            // Clear interval on component unmount
            return () => {
                if (intervalId) clearInterval(intervalId);
            };
        }
    }, [logId]); // Run only when logId changes


    // --- Action Handlers ---
    const handleLanguage = () => Alert.alert("Language", "Language change WIP.");


    // --- Render Logic ---
     const renderContent = () => {
        if (isLoading) {
            return <View style={styles.center}><ActivityIndicator size="large" color={COLORS.primary} /><Text style={styles.loadingText}>Analyzing Image...</Text></View>;
        }
        if (error) {
            return <View style={styles.center}><Text style={styles.errorText}>{error}</Text></View>;
        }
        if (!logData) {
            return <View style={styles.center}><Text>No diagnosis data found.</Text></View>;
        }

        const { processing_status, detected_disease, context_info, remedies, image_storage_url, scan_timestamp, confidence_score } = logData;

        if (processing_status === 'failed') {
             return <View style={styles.center}><Text style={styles.errorText}>Analysis failed. Please try again.</Text></View>;
        }
        if (processing_status === 'no_disease_detected') {
            return <View style={styles.center}><Image source={{uri: image_storage_url}} style={styles.resultImage} /><Text style={styles.noDiseaseText}>No disease detected in the image.</Text></View>;
        }
        if (processing_status === 'pending') {
             // This state should ideally be covered by isLoading, but as a fallback:
             return <View style={styles.center}><ActivityIndicator size="large" color={COLORS.primary} /><Text style={styles.loadingText}>Analysis still in progress...</Text></View>;
        }
        if (processing_status !== 'completed' || !detected_disease) {
             return <View style={styles.center}><Text>Analysis complete, but no specific disease was identified.</Text></View>;
        }

        // --- Display Completed Result ---
        const confidencePercent = confidence_score ? `${Math.round(confidence_score * 100)}%` : null;
        const locationContext = context_info ? `Farm: ${context_info.farm_name || '?'} - ${context_info.land_name || '?'} ${context_info.crop_name ? `(${context_info.crop_name})` : ''}` : 'Unknown Location';

        // Group remedies by type
        const groupedRemedies = remedies.reduce((acc, remedy) => {
            const type = remedy.remedy_type || 'Other';
            if (!acc[type]) acc[type] = [];
            acc[type].push(remedy);
            return acc;
        }, {});


        return (
            <ScrollView contentContainerStyle={styles.scrollContent}>
                {/* Image and Context */}
                <View style={styles.imageContainer}>
                     <Image source={{uri: image_storage_url}} style={styles.resultImage} />
                     <View style={styles.imageOverlay}>
                         <View style={styles.imageTextRow}>
                             <Clock size={14} color={COLORS.white} style={styles.overlayIcon}/>
                            <Text style={styles.imageOverlayText}>Scanned on {formatFullDateTime(scan_timestamp)}</Text>
                         </View>
                         <View style={styles.imageTextRow}>
                              <MapPin size={14} color={COLORS.white} style={styles.overlayIcon}/>
                            <Text style={styles.imageOverlayText}>{locationContext}</Text>
                         </View>
                     </View>
                </View>

                {/* Disease Info */}
                 <View style={styles.section}>
                    <Text style={styles.diseaseTitle}>{detected_disease.disease_name}</Text>
                    {confidencePercent && (
                         <View style={styles.confidencePill}>
                            <Text style={styles.confidenceText}>{confidencePercent} Confidence</Text>
                        </View>
                    )}

                    <Text style={styles.subHeader}>Description</Text>
                    <Text style={styles.description}>{detected_disease.description || 'No description available.'}</Text>

                     <Text style={styles.subHeader}>Symptoms</Text>
                     {/* Assume symptoms is a string with bullets or newline separated */}
                     {detected_disease.symptoms ? (
                         detected_disease.symptoms.split(/[\n•-]/).map((symptom, index) => {
                            const trimmed = symptom.trim();
                            return trimmed ? <Text key={index} style={styles.symptomItem}>• {trimmed}</Text> : null;
                         })
                     ) : (
                         <Text style={styles.description}>No specific symptoms listed.</Text>
                     )}
                 </View>

                 {/* Recommended Remedies */}
                  <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Recommended Remedies</Text>
                     {Object.keys(groupedRemedies).length > 0 ? (
                         Object.entries(groupedRemedies).map(([type, remedyList]) => (
                             <View key={type} style={styles.remedyGroup}>
                                {remedyList.map((remedy, index) => (
                                    <View key={remedy.id || index} style={styles.remedyCard}>
                                         <View style={styles.remedyHeader}>
                                            {/* Optionally show type as a pill */}
                                             <View style={[styles.typePill, styles[`typePill${type.charAt(0).toUpperCase() + type.slice(1)}`]]}>
                                                  <Text style={styles.typePillText}>{type}</Text>
                                             </View>
                                             {/* Or include type in title */}
                                             {/* <Text style={styles.remedyTitle}>{remedy.description.split('-')[0] || `${type} Remedy`}</Text> */}
                                         </View>
                                        <Text style={styles.remedyDescription}>{remedy.description}</Text>
                                         {remedy.application_instructions && (
                                            <>
                                                <Text style={styles.remedySubHeader}>Application</Text>
                                                <Text style={styles.remedyInstructions}>{remedy.application_instructions}</Text>
                                            </>
                                         )}
                                    </View>
                                ))}
                            </View>
                         ))
                     ) : (
                         <Text style={styles.noDataText}>No specific remedies recommended.</Text>
                     )}
                 </View>
            </ScrollView>
        );
    };


    return (
        <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
            {/* Header */}
             <View style={styles.customHeader}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconButton}>
                    <ArrowLeft size={24} color={COLORS.textDark} />
                </TouchableOpacity>
                <Text style={styles.headerTitle} numberOfLines={1}>Disease Result</Text>
                <View style={styles.headerRightIcons}>
                     {/* Placeholder for Language */}
                     <TouchableOpacity onPress={handleLanguage} style={[styles.iconButton, {marginLeft: 5}]}>
                         <Languages size={24} color={COLORS.textDark} />
                     </TouchableOpacity>
                </View>
            </View>

            {renderContent()}

        </SafeAreaView>
    );
};

// --- Styles ---
const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: COLORS.background },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
    errorText: { color: COLORS.error, textAlign: 'center', fontSize: 16 },
    loadingText: { marginTop: 10, fontSize: 16, color: COLORS.textMedium },
    noDiseaseText: { marginTop: 15, fontSize: 18, fontWeight: '500', color: COLORS.secondary },
     // Header (reuse style)
    customHeader: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 15, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: COLORS.border, backgroundColor: COLORS.white },
    headerTitle: { flex: 1, fontSize: 18, fontWeight: '600', color: COLORS.textDark, textAlign: 'center', marginHorizontal: 10 },
    headerRightIcons: { flexDirection: 'row' },
    iconButton: { padding: 5 },
     // Scroll Content
    scrollContent: { paddingBottom: 40 },
     imageContainer: {
        marginBottom: 20,
        position: 'relative', // For overlay positioning
    },
    resultImage: {
        width: '100%',
        height: 230,
        backgroundColor: COLORS.border,
        borderBottomLeftRadius: 15, // Rounded bottom corners for image
        borderBottomRightRadius: 15,
    },
     imageOverlay: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: 'rgba(0,0,0,0.5)',
        paddingVertical: 8,
        paddingHorizontal: 15,
        borderBottomLeftRadius: 15, // Match image corners
        borderBottomRightRadius: 15,
    },
    imageTextRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 4,
    },
    overlayIcon: {
        marginRight: 8,
    },
    imageOverlayText: {
        color: COLORS.white,
        fontSize: 13,
        flexShrink: 1, // Allow text to wrap/shrink
    },
    section: {
        paddingHorizontal: 20,
        marginBottom: 25,
    },
    diseaseTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: COLORS.textDark,
        marginBottom: 5,
    },
     confidencePill: {
        backgroundColor: COLORS.profileInitialBackground, // Light grey
        borderRadius: 15,
        paddingHorizontal: 12,
        paddingVertical: 5,
        alignSelf: 'flex-start', // Don't take full width
        marginBottom: 15,
    },
    confidenceText: {
        fontSize: 13,
        fontWeight: '600',
        color: COLORS.textMedium,
    },
    subHeader: {
        fontSize: 16,
        fontWeight: 'bold',
        color: COLORS.textDark,
        marginTop: 15,
        marginBottom: 8,
    },
    description: {
        fontSize: 15,
        color: COLORS.textMedium,
        lineHeight: 22,
    },
     symptomItem: {
        fontSize: 15,
        color: COLORS.textMedium,
        lineHeight: 22,
        marginBottom: 3,
        marginLeft: 5, // Indent bullet points
    },
     sectionTitle: { // For Recommended Remedies title
        fontSize: 18,
        fontWeight: 'bold',
        color: COLORS.textDark,
        marginBottom: 15,
    },
     remedyGroup: {
        marginBottom: 15, // Space between groups of different types
    },
     remedyCard: {
        backgroundColor: COLORS.primaryLight, // Light background for remedy card
        borderRadius: 12,
        padding: 15,
        marginBottom: 10, // Space between remedies of the same type
    },
    remedyHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
     typePill: {
        borderRadius: 10,
        paddingHorizontal: 10,
        paddingVertical: 3,
        marginRight: 10, // Space between pill and title if title used here
        backgroundColor: COLORS.secondaryLight, // Default background
    },
     // Specific pill styles by type (adjust colors as needed)
     typePillOrganic: { backgroundColor: COLORS.secondaryLight },
     typePillChemical: { backgroundColor: COLORS.errorLight },
     typePillCultural_practice: { backgroundColor: COLORS.profileInitialBackground },
     typePillText: {
        fontSize: 12,
        fontWeight: '600',
        color: COLORS.textMedium, // Default color
        textTransform: 'capitalize',
    },
    // Remedy text styles
     remedyDescription: {
        fontSize: 16,
        fontWeight: '600',
        color: COLORS.primaryDark, // Darker color for remedy name/description
        marginBottom: 8,
    },
    remedySubHeader: {
        fontSize: 14,
        fontWeight: 'bold',
        color: COLORS.textDark,
        marginTop: 5,
        marginBottom: 4,
    },
    remedyInstructions: {
        fontSize: 14,
        color: COLORS.textMedium,
        lineHeight: 20,
    },
    noDataText: { // For no remedies
        fontSize: 15,
        color: COLORS.textMedium,
        textAlign: 'center',
        fontStyle: 'italic',
        paddingVertical: 20,
    },
});

export default DiseaseResultScreen;