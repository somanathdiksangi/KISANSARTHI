import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Linking } from 'react-native';
import { FlaskConical, AlertTriangle, CheckCircle, Info } from 'lucide-react-native'; // Example icons
import { COLORS } from '../../theme/colors';

const FertilizerRecCard = ({ recommendation }) => {
    // Extract data safely from the modified API response structure
    const title = recommendation?.title ?? 'Fertilizer Recommendation';
    const productName = recommendation?.productName || title.replace('Apply ', ''); // Extract if title includes Apply
    const amount = recommendation?.amount ?? 'N/A';
    const details = recommendation?.details ?? 'No application details provided.'; // Description from API
    const reasoning = recommendation?.reasoning ?? 'Based on current soil analysis.'; // Explanation from API
    const price = recommendation?.price; // Optional
    const buyAtLink = recommendation?.buyat; // Optional
    const severity = recommendation?.severity?.toLowerCase() ?? 'info'; // Default to info

    let IconComponent = Info;
    let iconColor = COLORS.primary;
    let borderColor = COLORS.primaryLight;

    if (severity === 'high' || severity === 'urgent' || reasoning.toLowerCase().includes('critically low')) {
        IconComponent = AlertTriangle;
        iconColor = COLORS.error;
        borderColor = COLORS.error; // Use stronger border for high severity
    } else if (severity === 'medium' || severity === 'moderate' || reasoning.toLowerCase().includes('low') || reasoning.toLowerCase().includes('moderate')) {
        IconComponent = FlaskConical; // Use flask for moderate needs
        iconColor = COLORS.warning;
        borderColor = COLORS.warning; // Amber border
    } else { // low or info severity
        IconComponent = CheckCircle; // Use Check or Flask? Check suggests positive action
        iconColor = COLORS.secondary;
        borderColor = COLORS.secondary; // Green border
    }

    const handleBuyLink = async () => {
        if (buyAtLink) {
            const supported = await Linking.canOpenURL(buyAtLink);
            if (supported) {
                await Linking.openURL(buyAtLink);
            } else {
                Alert.alert(`Cannot Open URL`, `Don't know how to open this URL: ${buyAtLink}`);
            }
        }
    };

    return (
        <View style={[styles.card, { borderLeftColor: borderColor }]}>
             <View style={styles.header}>
                <IconComponent size={20} color={iconColor} style={styles.icon} />
                <Text style={styles.title}>{title}</Text>
            </View>
             {/* Optional: Show product name if different from title */}
            {/* <Text style={styles.productName}>{productName}</Text> */}

            <Text style={styles.detailText}><Text style={styles.detailLabel}>Amount:</Text> {amount}</Text>
            <Text style={styles.detailText}><Text style={styles.detailLabel}>Application:</Text> {details}</Text>
            <Text style={styles.reasoningText}><Text style={styles.detailLabel}>Reason:</Text> {reasoning}</Text>

            {price && <Text style={styles.detailText}><Text style={styles.detailLabel}>Est. Price:</Text> {price}</Text>}

            {buyAtLink && (
                <TouchableOpacity onPress={handleBuyLink}>
                     <Text style={styles.buyLink}>Buy at: {buyAtLink}</Text>
                 </TouchableOpacity>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    card: {
        backgroundColor: COLORS.surface,
        borderRadius: 10,
        padding: 15,
        marginBottom: 15,
        borderLeftWidth: 5, // Add colored border based on severity
        // Shadow
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.08,
        shadowRadius: 2,
        elevation: 1.5,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
    },
    icon: {
        marginRight: 10,
    },
    title: {
        fontSize: 17,
        fontWeight: 'bold',
        color: COLORS.textDark,
        flex: 1, // Allow title to wrap
    },
    productName: {
        fontSize: 15,
        fontWeight: '500',
        color: COLORS.textMedium,
        marginBottom: 8,
    },
    detailLabel: {
        fontWeight: '600',
        color: COLORS.textMedium,
    },
    detailText: {
        fontSize: 14,
        color: COLORS.textMedium,
        lineHeight: 20,
        marginBottom: 6,
    },
    reasoningText: {
        fontSize: 14,
        color: COLORS.textLight,
        lineHeight: 20,
        marginBottom: 6,
        fontStyle: 'italic',
    },
     buyLink: {
        fontSize: 14,
        color: COLORS.link,
        marginTop: 5,
        textDecorationLine: 'underline',
    },
});

export default FertilizerRecCard;