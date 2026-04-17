// src/components/explore/CampaignCard.jsx
import React, { memo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import Icons from 'react-native-vector-icons/Feather';
import { P, sp } from '../../theme/theme';
import ProgressBar from '../shared/ProgressBar'; 

const getProgressColor = (pct) => {
   const n = Number(pct);        // guard against string values
  if (n >= 75) return '#22C55E'; // green  — nearly / fully funded
  if (n >= 40) return '#00B4CC'; // teal   — good progress
  return '#F59E0B';              // amber  — early / needs help
};

const CampaignCard = memo(({ item, onPress }) => {
  const progressColor = getProgressColor(item.pct);

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={() => onPress?.(item)}
      activeOpacity={0.85}
    >
      <View style={styles.imgWrap}>
        <Image
          source={{ uri: item.imageUri }}
          style={styles.img}
          resizeMode="cover"
        />
      </View>
      <View style={styles.info}>
        <Text style={styles.title} numberOfLines={2}>
          {item.title}
        </Text>
        
        {/* ✅ Make sure color prop is being passed */}
        <ProgressBar pct={item.pct} color={progressColor} />
        
        <View style={styles.meta}>
          <Text style={styles.raised}>{item.raised}</Text>
          <Text style={styles.sep}> / </Text>
          <Text style={styles.goal}>{item.goal}</Text>
          <View style={styles.spacer} />
          <Text style={styles.user} numberOfLines={1}>
            {item.user}
          </Text>
          {item.verified && (
            <View style={styles.verifiedDot}>
              <Icons name="check" size={sp(7)} color={P.white} />
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
});

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    backgroundColor: P.white,
    borderRadius: sp(12),
    marginHorizontal: sp(14),
    marginBottom: sp(10),
    padding: sp(10),
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
  },
  imgWrap: {
    width: sp(80),
    height: sp(80),
    borderRadius: sp(10),
    overflow: 'hidden',
    backgroundColor: P.border,
    marginRight: sp(12),
  },
  img: { width: '100%', height: '100%' },
  info: { flex: 1, justifyContent: 'space-between' },
  title: {
    fontSize: sp(13),
    fontWeight: '700',
    color: P.dark,
    lineHeight: sp(18),
    marginBottom: sp(8),
  },
  meta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: sp(6),
  },
  raised: { fontSize: sp(12), fontWeight: '700', color: P.green },
  sep: { fontSize: sp(12), color: P.light },
  goal: { fontSize: sp(12), color: P.light },
  spacer: { flex: 1 },
  user: { fontSize: sp(11), color: P.gray, maxWidth: sp(70) },
  verifiedDot: {
    width: sp(14),
    height: sp(14),
    borderRadius: sp(7),
    backgroundColor: P.teal,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: sp(3),
  },
});

export default CampaignCard;