// src/components/saved/SavedCampaignCard.jsx
import React, { memo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
// ✅ CHANGE: Importing AntDesign alongside Feather for consistent icon styles
import Feather from 'react-native-vector-icons/Feather'; 
import AntDesign from 'react-native-vector-icons/AntDesign'; 
import { P, sp } from '../../theme/theme';
import ProgressBar from '../shared/ProgressBar';
import CategoryBadge from '../shared/CategoryBadge';

const SavedCampaignCard = memo(({ item, onPress, onUnsave }) => (
  <TouchableOpacity
    style={styles.card}
    onPress={() => onPress?.(item)}
    activeOpacity={0.88}
  >
    <View style={styles.imgWrap}>
      <Image
        source={{ uri: item.imageUri }}
        style={styles.img}
        resizeMode="cover"
      />
      <TouchableOpacity
        style={styles.heartBtn}
        // We pass the id up to the parent so it can handle un-saving logic
        onPress={() => onUnsave?.(item.id)}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        activeOpacity={0.7}
      >
        {/* ✅ CHANGE: Using AntDesign 'heart' which is filled by default */}
        {/* Color is Red (#EF4444) to signify it is SAVED */}
        <AntDesign name="heart" size={sp(18)} color={P.red} />
      </TouchableOpacity>
    </View>

    <View style={styles.body}>
      <CategoryBadge category={item.category} />
      <Text style={styles.title} numberOfLines={2}>
        {item.title}
      </Text>
      <ProgressBar pct={item.pct} />
      <View style={styles.metaRow}>
        <Text style={styles.raised}>PKR {item.raised.replace('PKR ', '')}</Text>
        <Text style={styles.sep}> / </Text>
        <Text style={styles.goal}>{item.goal}</Text>
        <View style={styles.spacer} />
        <View style={styles.userRow}>
          <View style={styles.avatar}>
            {/* Kept Feather here for the user icon since we didn't switch it */}
            <Feather name="user" size={sp(10)} color={P.white} />
          </View>
          <Text style={styles.userName} numberOfLines={1}>
            {item.user}
          </Text>
          {item.verified && (
            <View style={styles.verifiedDot}>
              <Feather name="check" size={sp(7)} color={P.white} />
            </View>
          )}
        </View>
      </View>
    </View>
  </TouchableOpacity>
));

const styles = StyleSheet.create({
  card: {
    backgroundColor: P.white,
    borderRadius: sp(14),
    marginHorizontal: sp(14),
    marginBottom: sp(14),
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 6,
  },
  imgWrap: {
    width: '100%',
    height: sp(170),
    backgroundColor: P.border,
  },
  img: { width: '100%', height: '100%' },
  heartBtn: {
    position: 'absolute',
    top: sp(10),
    right: sp(10),
    width: sp(34),
    height: sp(34),
    borderRadius: sp(17),
    backgroundColor: P.white,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 4,
  },
  body: { padding: sp(14) },
  title: {
    fontSize: sp(15),
    fontWeight: '700',
    color: P.dark,
    lineHeight: sp(21),
    marginBottom: sp(10),
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: sp(8),
  },
  raised: { fontSize: sp(13), fontWeight: '700', color: P.green },
  sep: { fontSize: sp(13), color: P.light },
  goal: { fontSize: sp(13), color: P.light },
  spacer: { flex: 1 },
  userRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: sp(4),
  },
  avatar: {
    width: sp(18),
    height: sp(18),
    borderRadius: sp(9),
    backgroundColor: P.light,
    alignItems: 'center',
    justifyContent: 'center',
  },
  userName: { fontSize: sp(11), color: P.gray, maxWidth: sp(80) },
  verifiedDot: {
    width: sp(14),
    height: sp(14),
    borderRadius: sp(7),
    backgroundColor: P.green,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default SavedCampaignCard;