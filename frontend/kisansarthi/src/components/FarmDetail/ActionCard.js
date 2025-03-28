import React from 'react';
import { View, Text, StyleSheet, ImageBackground, TouchableOpacity } from 'react-native';
import { COLORS } from '../../theme/colors';
import { LinearGradient } from 'expo-linear-gradient'; // For gradient overlay

const getDummyImageUrl = () => `https://dummyjson.com/image/300x200/nature?t=${Math.random()}`;

const ActionCard = ({ title, onPress, imageUrl }) => {
    const imageSource = imageUrl ? imageUrl : { uri: getDummyImageUrl() };

    return (
        <TouchableOpacity style={styles.card} onPress={onPress}>
            <ImageBackground source={imageSource} style={styles.imageBackground} imageStyle={styles.imageStyle}>
                {/* Gradient overlay for better text readability */}
                <LinearGradient
                    colors={['transparent', 'rgba(0,0,0,0.6)']}
                    style={styles.gradient}
                >
                    <Text style={styles.title}>{title}</Text>
                </LinearGradient>
            </ImageBackground>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    card: {
        flex: 1, // Make cards flexible within the row/grid
        margin: 6, // Add margin around cards
        aspectRatio: 1, // Make cards square-ish
        borderRadius: 12,
        overflow: 'hidden', // Clip image and gradient
        backgroundColor: COLORS.border, // Fallback background
         // Shadow
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 4,
        elevation: 3,
    },
    imageBackground: {
        flex: 1,
        justifyContent: 'flex-end', // Align gradient/text to bottom
    },
    imageStyle: {
        // borderRadius: 12, // Apply border radius to the image itself
    },
    gradient: {
        paddingHorizontal: 10,
        paddingBottom: 8,
        paddingTop: 20, // Ensure gradient covers bottom part
    },
    title: {
        fontSize: 15,
        fontWeight: 'bold',
        color: COLORS.white,
        textAlign: 'left', // Align text as per mockup
    },
});

export default ActionCard;