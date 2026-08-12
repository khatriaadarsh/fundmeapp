// src/components/explore/CampaignCard.jsx
import React, { memo, useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import Icons from 'react-native-vector-icons/Feather';
import AntDesign from 'react-native-vector-icons/AntDesign';
import { P, sp } from '../../theme/theme';
import ProgressBar from '../shared/ProgressBar'; 
import ResponseModal from '../ResponseModal';
import { useAppContext } from '../../context/AppContext';
import {
  useSaveCampaign,
  useUnsaveCampaignByCampaignId,
} from '../../hooks/useSavedCampaigns';

const getProgressColor = (pct) => {
  const n = Number(pct); // guard against string values
  if (n >= 75) return '#22C55E'; // green  — nearly / fully funded
  if (n >= 40) return '#00B4CC'; // teal   — good progress
  return '#F59E0B';              // amber  — early / needs help
};

const CampaignCard = memo(({ item, onPress }) => {
  const { currentUser } = useAppContext();
  const userId = currentUser?.id;

  const [isSaved, setIsSaved] = useState(!!item.isSaved);

  // Sync isSaved if API refetches and gives new item
  useEffect(() => {
    setIsSaved(!!item.isSaved);
  }, [item.isSaved]);

  // ResponseModal state
  const [modal, setModal] = useState({
    visible: false,
    title: '',
    message: '',
  });

  const showModal = useCallback((title, message) => {
    setModal({ visible: true, title, message });
  }, []);

  const hideModal = useCallback(() => {
    setModal((prev) => ({ ...prev, visible: false }));
  }, []);

  const saveMutation = useSaveCampaign(userId);
  const unsaveMutation = useUnsaveCampaignByCampaignId(userId);

  const toggleSave = () => {
    const prevSaved = isSaved;
    const newSaved = !prevSaved;

    // 1. Instant UI Update
    setIsSaved(newSaved);

    // 2. Fire API Call
    if (newSaved) {
      saveMutation.mutate(
        { userId, campaignId: item.campaignId },
        {
          onError: (error) => {
            setIsSaved(prevSaved); // Revert on failure
            showModal(
              'Failed',
              error?.message || 'Could not save campaign. Please try again.'
            );
          },
        }
      );
    } else {
      unsaveMutation.mutate(
        { userId, campaignId: item.campaignId },
        {
          onError: (error) => {
            setIsSaved(prevSaved); // Revert on failure
            showModal(
              'Failed',
              error?.message || 'Could not unsave campaign. Please try again.'
            );
          },
        }
      );
    }
  };

  const progressColor = getProgressColor(item.pct);

  return (
    <>
      <TouchableOpacity
        style={styles.card}
        onPress={() => onPress?.(item)}
        activeOpacity={0.85}
      >
        <View style={styles.imgWrap}>
          <Image
            source={{ uri: item.image || item.coverImage }}
            style={styles.img}
            resizeMode="contain" // Changed to "contain" so the full image shows without cropping
          />
          {/* Save / Unsave Heart Button Overlay */}
          <TouchableOpacity
            style={styles.heartBtn}
            onPress={toggleSave}
            activeOpacity={0.8}
            hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
          >
            <AntDesign
              name={isSaved ? 'heart' : 'hearto'}
              size={sp(14)}
              color={isSaved ? P.red : P.white}
            />
          </TouchableOpacity>
        </View>
        
        <View style={styles.info}>
          <Text style={styles.title} numberOfLines={2}>
            {item.title}
          </Text>
          
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
    position: 'relative',
  },
  img: { 
    width: '100%', 
    height: '100%' 
  },
  heartBtn: {
    position: 'absolute',
    top: sp(6),
    right: sp(6),
    width: sp(24),
    height: sp(24),
    borderRadius: sp(12),
    backgroundColor: 'rgba(0,0,0,0.35)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  info: { 
    flex: 1, 
    justifyContent: 'space-between' 
  },
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