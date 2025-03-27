import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MapPin, Layers, CircleDot, BarChartHorizontal } from 'lucide-react-native'; // Example Icons
import { COLORS } from '../../theme/colors';

const LandPlotCard = ({ land, onPress }) => {
    // Extract data safely
    const name = land?.land_name ?? 'Unnamed Plot';
    const area = land?.area ?? '--';
    const unit = land?.area_unit ?? '';
    const crop = land?.current_planting?.crop_name ?? 'None'; // Access nested data safely
    const device = land?.assigned_device?.device_name ?? null; // Access nested data safely
    const latestMoisture = land?.latest_reading?.moisture_value; // Example key reading

    return (
        <TouchableOpacity style={styles.card} onPress={onPress}>
            <View style={styles.cardHeader}>
                <Text style={styles.landName} numberOfLines={1}>{name}</Text>
                {device && <CircleDot size={14} color={COLORS.secondary} /> /* Device indicator */}
            </View>
            <View style={styles.infoRow}>
                <Layers size={14} color={COLORS.textLight} style={styles.icon} />
                <Text style={styles.infoText}>{area} {unit}</Text>
            </View>
             <View style={styles.infoRow}>
                <MapPin size={14} color={COLORS.textLight} style={styles.icon} />
                 <Text style={styles.infoText}>Crop: {crop}</Text>
            </View>
            {/* Example reading display */}
            {latestMoisture !== undefined && latestMoisture !== null && (
                <View style={styles.infoRow}>
                    <BarChartHorizontal size={14} color={COLORS.textLight} style={styles.icon} />
                     <Text style={styles.infoText}>Moisture: {latestMoisture}%</Text>
                </View>
            )}
             {!device && (
                 <Text style={styles.noDeviceText}>No Device Linked</Text>
             )}
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    card: {
        backgroundColor: COLORS.surface,
        borderRadius: 12,
        padding: 15,
        marginHorizontal: 15, // Consistent with FarmDetail padding
        marginBottom: 15,
        // Shadow
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 2,
    },
     cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 10,
    },
    landName: {
        fontSize: 17,
        fontWeight: 'bold',
        color: COLORS.textDark,
        flexShrink: 1,
        marginRight: 8,
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 6,
    },
    icon: {
        marginRight: 6,
    },
    infoText: {
        fontSize: 14,
        color: COLORS.textMedium,
    },
     noDeviceText: {
        fontSize: 13,
        fontStyle: 'italic',
        color: COLORS.textLight,
        marginTop: 8,
    },
});

export default LandPlotCard;