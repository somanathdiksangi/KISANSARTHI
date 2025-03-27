import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { MapPin, AlertTriangle } from 'lucide-react-native';
import { COLORS } from '../../theme/colors';

// Placeholder image function - replace with actual logic or props
const getDummyImageUrl = () => `https://dummyjson.com/image/400x300/nature?${Math.random()}`;

const FarmCard = ({ farm, onPress }) => {
    // Extract data, providing defaults
    const farmName = farm?.farm_name ?? 'Unknown Farm';
    const farmId = farm?.id ?? 'N/A';
    const landIdToNavigate = farm?.id;
    const locationHint = farm?.address ?? farm?.location_longitude ? 'Farm Location' : 'Location not set'; // Example logic
    const alertCount = farm?.alert_count ?? 0; // Assuming API provides this eventually
    const statusActive = true; // Placeholder for status

    return (
        <TouchableOpacity style={styles.card} onPress={() => onPress(landIdToNavigate)}>
            <Image source={{ uri: getDummyImageUrl() }} style={styles.image} />
            <View style={styles.content}>
                <View style={styles.header}>
                    <Text style={styles.farmName} numberOfLines={1}>{farmName}</Text>
                    {statusActive && <View style={styles.statusDot} />}
                </View>
                <Text style={styles.farmId}>Farm ID: {farmId}</Text>
                <View style={styles.detailRow}>
                    <MapPin size={14} color={COLORS.textLight} style={styles.icon} />
                    <Text style={styles.detailText} numberOfLines={1}>{locationHint}</Text>
                </View>
                {alertCount > 0 && (
                    <View style={[styles.detailRow, styles.alertRow]}>
                        <AlertTriangle size={14} color={COLORS.warning} style={styles.icon} />
                        <Text style={styles.alertText}>{alertCount} Alert{alertCount > 1 ? 's' : ''}</Text>
                    </View>
                )}
            </View>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    card: {
        flexDirection: 'row',
        backgroundColor: COLORS.surface,
        borderRadius: 12,
        marginBottom: 15,
        overflow: 'hidden', // Clip image corners
        // Subtle shadow
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 2,
    },
    image: {
        width: 100,
        height: '100%', // Take full height of card (adjust if needed)
        aspectRatio: 4 / 3.5, // Maintain aspect ratio
    },
    content: {
        flex: 1,
        paddingVertical: 10,
        paddingHorizontal: 12,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 4,
    },
    farmName: {
        fontSize: 16,
        fontWeight: 'bold',
        color: COLORS.textDark,
        flexShrink: 1, // Allow name to shrink if needed
        marginRight: 5,
    },
    statusDot: {
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: COLORS.secondary, // Green dot
    },
    farmId: {
        fontSize: 13,
        color: COLORS.textMedium,
        marginBottom: 8,
    },
    detailRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 4,
    },
    icon: {
        marginRight: 5,
    },
    detailText: {
        fontSize: 13,
        color: COLORS.textLight,
        flexShrink: 1, // Allow text to shrink
    },
    alertRow: {
        backgroundColor: COLORS.errorLight, // Light red background
        borderRadius: 4,
        paddingVertical: 3,
        paddingHorizontal: 6,
        alignSelf: 'flex-start', // Don't take full width
        marginTop: 4,
    },
    alertText: {
        fontSize: 12,
        color: COLORS.error, // Use error color for text
        fontWeight: '500',
    },
});

export default FarmCard;