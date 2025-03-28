import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { COLORS } from '../../theme/colors';
import StarRating from './StarRating'; // Import StarRating

const getDummyImageUrl = (seed) => `https://dummyjson.com/image/600x400/nature?${seed}`;
import farmImage_default from '../../../assets/farm_background.png'

const CropSuggestionCard = ({ suggestion, soilContext, onSelect, onViewDetails }) => {
    const crop = suggestion?.crop;
    const score = suggestion?.suitability_score ?? 0; // Score between 0 and 1
    const matchPercentage = Math.round(score * 100);
    const rating = score * 5; // Convert score to 0-5 rating for stars
    const imageUrl = crop?.image_url;
    // Example pH data - adjust based on actual API response
    const optimalPh = crop?.optimal_ph_min && crop?.optimal_ph_max
        ? `${crop.optimal_ph_min} - ${crop.optimal_ph_max}`
        : null;

    return (
        <View style={styles.card}>
            <Image source={farmImage_default} style={styles.image} />
            <View style={styles.content}>
                <View style={styles.headerRow}>
                    <Text style={styles.title}>{crop?.crop_name ?? 'Unknown Crop'}</Text>
                    <StarRating rating={rating} size={20} />
                </View>
                <Text style={styles.matchText}>{matchPercentage}% Match</Text>
                <Text style={styles.reasoningText}>{suggestion?.reasoning ?? 'No details provided.'}</Text>

                {optimalPh && (
                    <View style={styles.detailBox}>
                        <Text style={styles.detailText}>Optimal pH: {optimalPh}</Text>
                        {/* Placeholder for visual range indicator */}
                        {/* <View style={styles.rangeIndicatorPlaceholder} /> */}
                    </View>
                )}

                <View style={styles.buttonRow}>
                    {/* ++ Pass suggestion and soilContext to onViewDetails ++ */}
                    <TouchableOpacity style={[styles.button, styles.detailsButton]} onPress={() => onViewDetails(suggestion, soilContext)}>
                        <Text style={[styles.buttonText, styles.detailsButtonText]}>View Details</Text>
                    </TouchableOpacity>
                    {/* Pass only crop to onSelect */}
                    <TouchableOpacity style={[styles.button, styles.selectButton]} onPress={() => onSelect(crop)}>
                        <Text style={[styles.buttonText, styles.selectButtonText]}>Select for Planting</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    card: {
        backgroundColor: COLORS.surface,
        borderRadius: 16,
        marginBottom: 20,
        overflow: 'hidden', // Clip image corners
        // Shadow
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 5,
        elevation: 3,
    },
    image: {
        width: '100%',
        height: 200, // Adjust height as needed
        backgroundColor: COLORS.border, // Placeholder background
    },
    content: {
        padding: 15,
    },
    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 5,
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        color: COLORS.textDark,
        flexShrink: 1, // Allow text to shrink if needed
        marginRight: 10,
    },
    matchText: {
        fontSize: 14,
        fontWeight: '600',
        color: COLORS.secondary, // Use a success/match color
        marginBottom: 8,
    },
    reasoningText: {
        fontSize: 14,
        color: COLORS.textMedium,
        marginBottom: 12,
        lineHeight: 19,
    },
    detailBox: {
        backgroundColor: COLORS.background, // Light grey background
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 8,
        marginBottom: 15,
    },
    detailText: {
        fontSize: 13,
        color: COLORS.textMedium,
        fontWeight:'500',
    },
    rangeIndicatorPlaceholder: {
        height: 6,
        backgroundColor: COLORS.border,
        borderRadius: 3,
        marginTop: 5,
        // TODO: Add logic to show current/optimal range visually
    },
    buttonRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 10,
    },
    button: {
        flex: 1, // Make buttons share space
        paddingVertical: 12,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
        marginHorizontal: 5,
        borderWidth: 1,
    },
    detailsButton: {
        backgroundColor: COLORS.addFarmButtonBackground, // Dark button
        borderColor: COLORS.addFarmButtonBackground,
    },
    selectButton: {
        backgroundColor: COLORS.white,
        borderColor: COLORS.border,
    },
    buttonText: {
        fontSize: 15,
        fontWeight: '600',
    },
    detailsButtonText: {
        color: COLORS.white,
    },
    selectButtonText: {
        color: COLORS.textDark,
    },
});

export default CropSuggestionCard;