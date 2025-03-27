import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { Bookmark, ExternalLink } from 'lucide-react-native'; // Or ChevronRight
import { COLORS } from '../../theme/colors';

const getDummyImageUrl = () => `https://dummyjson.com/image/200x150/abstract?${Math.random()}`;

const TipCard = ({ tip, onPress, onBookmarkPress }) => {
    const title = tip?.title ?? 'Tip Title';
    const snippet = tip?.details?.substring(0, 100) + (tip?.details?.length > 100 ? '...' : '') ?? 'Tip details...';

    return (
        <TouchableOpacity style={styles.card} onPress={() => onPress(tip)}>
            <Image source={{ uri: getDummyImageUrl() }} style={styles.image} />
            <View style={styles.content}>
                <Text style={styles.title} numberOfLines={2}>{title}</Text>
                <Text style={styles.snippet} numberOfLines={2}>{snippet}</Text>
                <TouchableOpacity onPress={() => onPress(tip)}>
                    <Text style={styles.readMore}>Read More</Text>
                </TouchableOpacity>
            </View>
            {/* Optional Bookmark */}
            {/* <TouchableOpacity onPress={() => onBookmarkPress(tip)} style={styles.bookmarkButton}>
                <Bookmark size={20} color={COLORS.textMedium} />
            </TouchableOpacity> */}
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    card: {
        flexDirection: 'row',
        backgroundColor: COLORS.surface,
        borderRadius: 12,
        marginBottom: 15,
        overflow: 'hidden',
        // Shadow
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 2,
    },
    image: {
        width: 80,
        height: '100%',
        aspectRatio: 1, // Make it square or adjust
    },
    content: {
        flex: 1,
        padding: 12,
        justifyContent: 'space-between', // Distribute content vertically
    },
    title: {
        fontSize: 15,
        fontWeight: 'bold',
        color: COLORS.textDark,
        marginBottom: 4,
    },
    snippet: {
        fontSize: 13,
        color: COLORS.textMedium,
        lineHeight: 18,
        marginBottom: 6,
    },
    readMore: {
        fontSize: 13,
        color: COLORS.link,
        fontWeight: '500',
    },
    bookmarkButton: {
         padding: 10,
         position: 'absolute',
         top: 5,
         right: 5,
    },
});

export default TipCard;