// src/components/donations/SummaryBanner.jsx
import React, { memo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icons from 'react-native-vector-icons/Feather';
import { sp } from '../../theme/theme'; // Assuming we import sp from theme

const SummaryBanner = ({ totalAmount, totalCount }) => (
  <LinearGradient
    colors={['#0A3D62', '#15AABF']} // Original Colors Preserved
    start={{ x: 0, y: 0 }}
    end={{ x: 1, y: 0 }}
    style={styles.banner}
  >
    {/* Decorative Blobs */}
    <View style={styles.blob1} />
    <View style={styles.blob2} />

    <Text style={styles.label}>Total Donated</Text>
    <Text style={styles.amount}>PKR {totalAmount.toLocaleString('en-PK')}</Text>
    <View style={styles.row}>
      <Icons name="heart" size={sp(12)} color="rgba(255,255,255,0.75)" />
      <Text style={styles.sub}>{totalCount} donations</Text>
    </View>
  </LinearGradient>
);

const styles = StyleSheet.create({
  banner: {
    marginHorizontal: sp(16),
    marginTop: sp(14),
    marginBottom: sp(14),
    borderRadius: sp(14),
    paddingHorizontal: sp(20),
    paddingVertical: sp(20),
    overflow: 'hidden',
    elevation: 4,
    shadowColor: '#0A3D62',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 10,
  },
  blob1: {
    position: 'absolute',
    width: sp(120),
    height: sp(120),
    borderRadius: sp(60),
    backgroundColor: 'rgba(255,255,255,0.07)',
    top: -sp(30),
    right: -sp(10),
  },
  blob2: {
    position: 'absolute',
    width: sp(80),
    height: sp(80),
    borderRadius: sp(40),
    backgroundColor: 'rgba(255,255,255,0.06)',
    bottom: -sp(20),
    left: sp(10),
  },
  label: { fontSize: sp(12), fontWeight: '500', color: 'rgba(255,255,255,0.78)', marginBottom: sp(4) },
  amount: { fontSize: sp(30), fontWeight: '800', color: '#FFFFFF', letterSpacing: -0.5, marginBottom: sp(6), includeFontPadding: false },
  row: { flexDirection: 'row', alignItems: 'center' },
  sub: { fontSize: sp(12), fontWeight: '500', color: 'rgba(255,255,255,0.78)' },
});

export default SummaryBanner;