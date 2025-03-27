import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { Plus } from 'lucide-react-native';
import { COLORS } from '../../theme/colors';

// Source for the illustration - replace with your actual asset or a placeholder
const illustration = require('../../../assets/farmer-illustration.png'); // Adjust path if needed

const EmptyDashboard = ({ onAddFarmPress }) => {
    return (
        <View style={styles.container}>
            <Image source={illustration} style={styles.illustration} resizeMode="contain" />
            <Text style={styles.message}>
                Get started by adding your first farm.
            </Text>
            <TouchableOpacity style={styles.button} onPress={onAddFarmPress}>
                <Plus size={18} color={COLORS.white} style={styles.buttonIcon} />
                <Text style={styles.buttonText}>Add Farm</Text>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 30,
        paddingBottom: 100, // Add more padding at bottom
    },
    illustration: {
        width: 250,
        height: 200, // Adjust size as needed
        marginBottom: 30,
    },
    message: {
        fontSize: 18,
        color: COLORS.textMedium,
        textAlign: 'center',
        marginBottom: 40,
        fontWeight: '500',
    },
    button: {
        flexDirection: 'row',
        backgroundColor: COLORS.addFarmButtonBackground, // Dark button
        paddingVertical: 15,
        paddingHorizontal: 40,
        borderRadius: 12, // Rounded corners
        alignItems: 'center',
        justifyContent: 'center',
        // Shadow
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 4,
    },
    buttonIcon: {
        marginRight: 8,
    },
    buttonText: {
        color: COLORS.white,
        fontSize: 16,
        fontWeight: '600', // Semi-bold
    },
});

export default EmptyDashboard;