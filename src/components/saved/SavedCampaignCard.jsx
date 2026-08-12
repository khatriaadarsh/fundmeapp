// src/components/saved/SavedCampaignCard.jsx
import React, { memo, useState, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import Feather   from 'react-native-vector-icons/Feather';
import AntDesign from 'react-native-vector-icons/AntDesign';
import { P, sp } from '../../theme/theme';
import ProgressBar   from '../shared/ProgressBar';
import CategoryBadge from '../shared/CategoryBadge';
import ResponseModal from '../ResponseModal';
import { useAppContext } from '../../context/AppContext';
import { useUnsaveCampaignByCampaignId } from '../../hooks/useSavedCampaigns';

const SavedCampaignCard = memo(({ item, onPress, onUnsave }) => {
  const { currentUser } = useAppContext();
  const userId = currentUser?.id ?? currentUser?.userId;

  const [hidden, setHidden] = useState(false);
  const [modal, setModal] = useState({
    visible: false,
    title: '',
    message: '',
  });

  const showModal = useCallback((title, message) => {
    setModal({ visible: true, title, message });
  }, []);

  const hideModal = useCallback(() => {
    setModal(prev => ({ ...prev, visible: false }));
  }, []);

  const unsaveMutation = useUnsaveCampaignByCampaignId(userId);

  const handleUnsave = useCallback(() => {
    const campaignId = item.campaignId;
    if (!userId || !campaignId) {
      showModal('Failed', 'Unable to unsave this campaign. Please try again.');
      return;
    }

    // Instant hide — list feels instant, no flicker
    setHidden(true);
    onUnsave?.(item.favouriteId);

    unsaveMutation.mutate(
      { userId, campaignId },
      {
        onError: (error) => {
          setHidden(false);
          showModal(
            'Failed',
            error?.message || 'Could not unsave campaign. Please try again.',
          );
        },
      },
    );
  }, [userId, item, onUnsave, unsaveMutation, showModal]);

  if (hidden) return null;

  return (
    <>
      <TouchableOpacity
        style={styles.card}
        onPress={() => onPress?.(item)}
        activeOpacity={0.88}
      >
        <View style={styles.imgWrap}>
          <Image
            source={{ uri: item.imageUri || item.coverImage || item.image }}
            style={styles.img}
            resizeMode="contain"
          />
          <TouchableOpacity
            style={styles.heartBtn}
            onPress={handleUnsave}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            activeOpacity={0.7}
          >
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
            <Text style={styles.raised}>PKR {item.raised}</Text>
            <Text style={styles.sep}> / </Text>
            <Text style={styles.goal}>{item.goal}</Text>
            <View style={styles.spacer} />
            <View style={styles.userRow}>
              <View style={styles.avatar}>
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

      <ResponseModal
        visible={modal.visible}
        variant="error"
        title={modal.title}
        message={modal.message}
        onClose={hideModal}
      />
    </>
  );
});

const styles = StyleSheet.create({
  card: {
    backgroundColor: P.white,
    borderRadius:    sp(14),
    marginHorizontal:sp(14),
    marginBottom:    sp(14),
    overflow:        'hidden',
    elevation:       2,
    shadowColor:     '#000',
    shadowOffset:    { width: 0, height: 2 },
    shadowOpacity:   0.07,
    shadowRadius:    6,
  },
  imgWrap: {
    width:           '100%',
    height:          sp(170),
    backgroundColor: P.border,
  },
  img: { width: '100%', height: '100%' },
  heartBtn: {
    position:        'absolute',
    top:             sp(10),
    right:           sp(10),
    width:           sp(34),
    height:          sp(34),
    borderRadius:    sp(17),
    backgroundColor: P.white,
    alignItems:      'center',
    justifyContent:  'center',
    elevation:       4,
    shadowColor:     '#000',
    shadowOffset:    { width: 0, height: 2 },
    shadowOpacity:   0.12,
    shadowRadius:    4,
  },
  body:    { padding: sp(14) },
  title: {
    fontSize:    sp(15),
    fontWeight:  '700',
    color:       P.dark,
    lineHeight:  sp(21),
    marginBottom:sp(10),
  },
  metaRow: {
    flexDirection: 'row',
    alignItems:    'center',
    marginTop:     sp(8),
  },
  raised:  { fontSize: sp(13), fontWeight: '700', color: P.green },
  sep:     { fontSize: sp(13), color: P.light },
  goal:    { fontSize: sp(13), color: P.light },
  spacer:  { flex: 1 },
  userRow: {
    flexDirection: 'row',
    alignItems:    'center',
    gap:           sp(4),
  },
  avatar: {
    width:           sp(18),
    height:          sp(18),
    borderRadius:    sp(9),
    backgroundColor: P.light,
    alignItems:      'center',
    justifyContent:  'center',
  },
  userName:    { fontSize: sp(11), color: P.gray, maxWidth: sp(80) },
  verifiedDot: {
    width:           sp(14),
    height:          sp(14),
    borderRadius:    sp(7),
    backgroundColor: P.green,
    alignItems:      'center',
    justifyContent:  'center',
  },
});

export default SavedCampaignCard;