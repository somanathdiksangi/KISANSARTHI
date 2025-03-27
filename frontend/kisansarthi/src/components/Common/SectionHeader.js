// src/components/Common/SectionHeader.js
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { COLORS } from '../../theme/colors';

const SectionHeader = ({ title, onViewAll }) => (
    <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>{title}</Text>
        {onViewAll && ( // Only render "View All" if the handler is provided
            <TouchableOpacity onPress={onViewAll}>
                <Text style={styles.viewAll}>View All</Text>
            </TouchableOpacity>
        )}
    </View>
);

const styles = StyleSheet.create({
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 20, // Consistent space above section title
        marginBottom: 12,
        paddingHorizontal: 5, // Slight inner padding for alignment if needed inside a container
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: COLORS.textDark,
    },
    viewAll: {
        fontSize: 14,
        color: COLORS.link,
        fontWeight: '500',
    },
});

export default SectionHeader;