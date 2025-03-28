import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Smartphone, Zap } from 'lucide-react-native'; // Example icons
import { COLORS } from '../../theme/colors';

const DeviceStatusCard = ({ device }) => {
    const deviceName = device?.device_name || 'Unnamed Device';
    const hardwareId = device?.hardware_unique_id || 'N/A';
    // Add other relevant details like model, battery level if available

    return (
        <View style={styles.card}>
            <View style={styles.row}>
                 <Smartphone size={18} color={COLORS.textMedium} style={styles.icon}/>
                 <View style={styles.textContainer}>
                     <Text style={styles.label}>Device</Text>
                     <Text style={styles.value} numberOfLines={1}>{deviceName}</Text>
                </View>
            </View>
             <View style={styles.separator} />
             <View style={styles.row}>
                 <Zap size={18} color={COLORS.textMedium} style={styles.icon}/>
                 <View style={styles.textContainer}>
                     <Text style={styles.label}>Hardware ID</Text>
                     <Text style={styles.value}>{hardwareId}</Text>
                </View>
             </View>
              {/* Add more rows for battery, model etc. if needed */}
        </View>
    );
};

const styles = StyleSheet.create({
    card: {
        backgroundColor: COLORS.surface,
        borderRadius: 12,
        paddingVertical: 5, // Less vertical padding inside card
        marginTop: 10,
        marginBottom: 20,
        // Shadow
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 2,
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        paddingHorizontal: 15,
    },
    icon: {
        marginRight: 15,
    },
    textContainer: {
        flex: 1,
    },
    label: {
        fontSize: 13,
        color: COLORS.textLight,
        marginBottom: 2,
    },
    value: {
        fontSize: 15,
        color: COLORS.textDark,
        fontWeight: '500',
    },
    separator: {
        height: 1,
        backgroundColor: COLORS.border,
        marginHorizontal: 15, // Indent separator
    },
});

export default DeviceStatusCard;