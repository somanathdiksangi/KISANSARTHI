import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Star } from 'lucide-react-native';
import { COLORS } from '../../theme/colors';

const StarRating = ({ rating, size = 18, style }) => {
    const totalStars = 5;
    const filledStars = Math.round(rating); // Or use Math.floor / Math.ceil

    return (
        <View style={[styles.container, style]}>
            {[...Array(totalStars)].map((_, index) => (
                <Star
                    key={index}
                    size={size}
                    color={COLORS.warning} // Gold/Yellow for stars
                    fill={index < filledStars ? COLORS.warning : COLORS.surface} // Fill based on rating
                    strokeWidth={1.5} // Adjust stroke width if needed
                    style={styles.star}
                />
            ))}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
    },
    star: {
        marginRight: 2, // Small space between stars
    },
});

export default StarRating;