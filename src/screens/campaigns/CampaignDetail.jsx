// src/screens/campaigns/CampaignDetail.jsx
import React, { useState, useRef, useCallback, useEffect, memo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Animated,
  Dimensions,
  Image,
  StatusBar,
  Platform,
  FlatList,
  Modal,
  Linking,
  Alert,
  ActivityIndicator,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icons from 'react-native-vector-icons/Feather';
import DonorInfoModal from './DonorInfoModal';

// ── API wiring ──────────────────────────────────────────────
import { useCampaignDetail } from '../../hooks/useCampaign';

// ═══════════════════════════════════════════════════════════
// Scale
// ═══════════════════════════════════════════════════════════
const { width: SW, height: SH } = Dimensions.get('window');
const scale = n => (SW / 375) * n;
const vscale = n => (SH / 812) * n;

const SB_H = Platform.OS === 'android' ? StatusBar.currentHeight ?? 24 : 0;

// ═══════════════════════════════════════════════════════════
// Design Tokens
// ═══════════════════════════════════════════════════════════
const C = {
  white: '#FFFFFF',
  bg: '#F8FAFC',
  green: '#059669',
  greenLight: '#10B981',
  greenBg: '#ECFDF5',
  red: '#EF4444',
  redDeep: '#DC2626',
  indigo: '#4F46E5',
  indigoBg: '#EEF2FF',
  dark: '#0F172A',
  mid: '#334155',
  gray: '#64748B',
  light: '#94A3B8',
  border: '#E2E8F0',
  cardBg: '#F8FAFC',
};

// ✅ Hero tall enough to show URGENT + title + category
const HERO_H = scale(340);
const SHEET_R = scale(24);

const fmtPK = n => `PKR ${Number(n || 0).toLocaleString('en-PK')}`;

// ═══════════════════════════════════════════════════════════
// ⚠️ DEMO / HARDCODED DATA — Recent Donors & Recent Updates are
// not covered by the campaign-detail API yet, per instructions.
// Swap this out for a real hook/endpoint once that's available.
// ═══════════════════════════════════════════════════════════
const DEMO = {
  donors: 123,
  hoursLeft: 19,
  donors_list: [
    {
      id: '1',
      name: 'Zara M.',
      amount: 5000,
      message: "Praying for everyone's safety!",
      time: '2h ago',
      avatar: 'https://picsum.photos/100/100?random=41',
      age: 28,
      gender: 'Female',
      occupation: 'Software Engineer',
      phone: '+92 300 1234567',
      totalDonated: 45000,
      location: 'Karachi, Pakistan',
      memberSince: 'Mar 2023',
      totalCampaigns: 8,
      paymentMethod: 'EasyPaisa',
      donationDate: 'Jan 15, 2025',
    },
    {
      id: '2',
      name: 'Usman K.',
      amount: 10000,
      message: '',
      time: '5h ago',
      avatar: 'https://picsum.photos/100/100?random=42',
      age: 35,
      gender: 'Male',
      occupation: 'Business Owner',
      phone: null,
      totalDonated: 120000,
      location: 'Lahore, Pakistan',
      memberSince: 'Jul 2024',
      totalCampaigns: 3,
      paymentMethod: 'JazzCash',
      donationDate: 'Jan 15, 2025',
    },
    {
      id: '3',
      name: 'Anonymous',
      amount: 2500,
      message: 'May Allah ease your hardships.',
      time: '1d ago',
      avatar: 'https://picsum.photos/100/100?random=43',
      age: null,
      gender: null,
      occupation: null,
      phone: null,
      totalDonated: null,
      location: null,
      memberSince: '',
      totalCampaigns: 0,
      paymentMethod: 'Visa ••42',
      donationDate: 'Jan 14, 2025',
    },
  ],
  update:
    'Campaign update: First batch of relief funds has been distributed. 15 families received temporary tents today. Thank you 🙏',
  updateAge: 'Posted 2 days ago',
};

// ═══════════════════════════════════════════════════════════
// Pressable with scale feedback
// ═══════════════════════════════════════════════════════════
const Pressable = ({ onPress, style, children }) => {
  const anim = useRef(new Animated.Value(1)).current;
  const onIn = () =>
    Animated.spring(anim, {
      toValue: 0.94,
      useNativeDriver: true,
      tension: 300,
      friction: 10,
    }).start();
  const onOut = () =>
    Animated.spring(anim, {
      toValue: 1,
      useNativeDriver: true,
      tension: 300,
      friction: 10,
    }).start();
  return (
    <TouchableOpacity
      onPress={onPress}
      onPressIn={onIn}
      onPressOut={onOut}
      activeOpacity={1}
    >
      <Animated.View style={[style, { transform: [{ scale: anim }] }]}>
        {children}
      </Animated.View>
    </TouchableOpacity>
  );
};

// ═══════════════════════════════════════════════════════════
// HERO — now driven by real campaign data
// ═══════════════════════════════════════════════════════════
const HeroImage = memo(({ image, title, category, urgent, onBack, onShare, saved, onSave }) => (
  <View style={h.wrap}>
    <Image source={{ uri: image }} style={h.img} resizeMode="contain" />

    <LinearGradient
      colors={['transparent', 'rgba(0,0,0,0.30)', 'rgba(0,0,0,0.80)']}
      locations={[0, 0.45, 1]}
      style={h.fade}
    />

    <View style={h.controls}>
      <Pressable onPress={onBack} style={h.glassBtn}>
        <Icons name="arrow-left" size={scale(18)} color={C.white} />
      </Pressable>
      <View style={h.rightBtns}>
        <Pressable onPress={onShare} style={h.glassBtn}>
          <Icons name="share-2" size={scale(17)} color={C.white} />
        </Pressable>
        <Pressable onPress={onSave} style={h.glassBtn}>
          <Icons
            name="heart"
            size={scale(17)}
            color={saved ? '#FF4F6A' : C.white}
          />
        </Pressable>
      </View>
    </View>

    <View style={h.bottom}>
      {urgent && (
        <LinearGradient
          colors={[C.red, C.redDeep]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={h.urgentBadge}
        >
          <Text style={h.urgentTxt}>URGENT</Text>
        </LinearGradient>
      )}

      <Text style={h.title}>{title}</Text>

      <View style={h.categoryPill}>
        <Text style={h.categoryTxt}>{category}</Text>
      </View>
    </View>
  </View>
));

const h = StyleSheet.create({
  wrap: {
    width: SW,
    height: HERO_H,
    position: 'relative',
  },
  img: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    backgroundColor: C.border,
    // backgroundColor: '#0F172A',
  },
  fade: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: HERO_H * 0.72,
  },
  controls: {
    position: 'absolute',
    top: SB_H + scale(12),
    left: scale(16),
    right: scale(16),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  glassBtn: {
    width: scale(38),
    height: scale(38),
    borderRadius: scale(19),
    backgroundColor: 'rgba(0,0,0,0.38)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255,255,255,0.22)',
  },
  rightBtns: {
    flexDirection: 'row',
    gap: scale(10),
  },
  bottom: {
    position: 'absolute',
    bottom: scale(44),
    left: scale(16),
    right: scale(16),
  },
  urgentBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: scale(14),
    paddingVertical: scale(6),
    borderRadius: scale(20),
    marginBottom: scale(10),
  },
  urgentTxt: {
    fontSize: scale(11),
    fontWeight: '800',
    color: C.white,
    letterSpacing: 1,
    includeFontPadding: false,
  },
  title: {
    fontSize: scale(22),
    fontWeight: '800',
    color: C.white,
    lineHeight: scale(30),
    letterSpacing: -0.2,
    marginBottom: scale(12),
    includeFontPadding: false,
  },
  categoryPill: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(0,0,0,0.52)',
    borderRadius: scale(20),
    paddingHorizontal: scale(14),
    paddingVertical: scale(7),
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255,255,255,0.25)',
  },
  categoryTxt: {
    fontSize: scale(13),
    fontWeight: '600',
    color: C.white,
    includeFontPadding: false,
  },
});

// ═══════════════════════════════════════════════════════════
// PROGRESS CARD — now driven by real raised/goal/pct
// ═══════════════════════════════════════════════════════════
const ProgressCard = memo(({ raised, goal, pct, donorsCount, hoursLeft }) => {
  const fillAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fillAnim, {
      toValue: pct / 100,
      duration: 1100,
      useNativeDriver: false,
    }).start();
  }, [fillAnim, pct]);

  const fillW = fillAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', `${pct}%`],
  });

  return (
    <View style={pg.card}>
      <View style={pg.amtRow}>
        <View>
          <View style={pg.raisedRow}>
            <Text style={pg.raisedNum}>{fmtPK(raised)}</Text>
            <Text style={pg.raisedWord}> raised</Text>
          </View>
          <Text style={pg.goalTxt}>of {fmtPK(goal)} goal</Text>
        </View>
        <Text style={pg.pct}>{pct}%</Text>
      </View>

      <View style={pg.track}>
        <Animated.View style={[pg.fillWrap, { width: fillW }]}>
          <LinearGradient
            colors={[C.green, C.greenLight]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={StyleSheet.absoluteFill}
          />
        </Animated.View>
      </View>

      <View style={pg.pillRow}>
        {[
          { icon: 'users', label: `${donorsCount} Donors` },
          { icon: 'clock', label: `${hoursLeft}h left` },
          { icon: 'percent', label: `${pct}% funded` },
        ].map(p => (
          <View key={p.label} style={pg.pill}>
            <Icons name={p.icon} size={scale(12)} color={C.gray} />
            <Text style={pg.pillTxt}>{p.label}</Text>
          </View>
        ))}
      </View>
    </View>
  );
});

const pg = StyleSheet.create({
  card: {
    backgroundColor: C.cardBg,
    borderRadius: scale(16),
    padding: scale(18),
    marginBottom: scale(16),
  },
  amtRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: scale(12),
  },
  raisedRow: { flexDirection: 'row', alignItems: 'baseline' },
  raisedNum: {
    fontSize: scale(26),
    fontWeight: '800',
    color: C.green,
    letterSpacing: -0.5,
    includeFontPadding: false,
  },
  raisedWord: {
    fontSize: scale(15),
    fontWeight: '600',
    color: C.green,
    includeFontPadding: false,
  },
  goalTxt: {
    fontSize: scale(13),
    color: C.gray,
    marginTop: scale(3),
    includeFontPadding: false,
  },
  pct: {
    fontSize: scale(22),
    fontWeight: '800',
    color: C.green,
    includeFontPadding: false,
  },
  track: {
    height: scale(8),
    backgroundColor: C.border,
    borderRadius: scale(4),
    overflow: 'hidden',
    marginBottom: scale(14),
  },
  fillWrap: {
    height: '100%',
    borderRadius: scale(4),
    overflow: 'hidden',
  },
  pillRow: {
    flexDirection: 'row',
    gap: scale(8),
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: scale(5),
    backgroundColor: C.white,
    borderRadius: scale(20),
    paddingHorizontal: scale(12),
    paddingVertical: scale(7),
    borderWidth: 1,
    borderColor: C.border,
  },
  pillTxt: {
    fontSize: scale(12),
    fontWeight: '600',
    color: C.mid,
    includeFontPadding: false,
  },
});

// ═══════════════════════════════════════════════════════════
// DONATE BUTTON
// ═══════════════════════════════════════════════════════════
const DonateButton = memo(({ onPress }) => (
  <View style={dn.wrap}>
    <Pressable onPress={onPress} style={dn.btn}>
      <LinearGradient
        colors={[C.green, C.greenLight]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={dn.gradient}
      >
        <Text style={dn.txt}>Donate Now</Text>
        <Text style={dn.emoji}>❤️</Text>
      </LinearGradient>
    </Pressable>
    <Text style={dn.micro}>100% goes directly to the campaign</Text>
  </View>
));

const dn = StyleSheet.create({
  wrap: { marginBottom: scale(16) },
  btn: { borderRadius: scale(14), overflow: 'hidden' },
  gradient: {
    height: scale(56),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: scale(10),
    elevation: 5,
    shadowColor: C.green,
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
  },
  txt: {
    fontSize: scale(18),
    fontWeight: '800',
    color: C.white,
    includeFontPadding: false,
  },
  emoji: { fontSize: scale(18) },
  micro: {
    fontSize: scale(12),
    color: C.gray,
    textAlign: 'center',
    marginTop: scale(10),
    includeFontPadding: false,
  },
});

// ═══════════════════════════════════════════════════════════
// CREATOR CARD — now driven by real creator data
// ═══════════════════════════════════════════════════════════
const CreatorCard = memo(({ creator, onViewProfile }) => (
  <View style={cr.card}>
    {creator.avatar ? (
      <Image source={{ uri: creator.avatar }} style={cr.avatar} resizeMode="contain" />
    ) : (
      <View style={[cr.avatar, cr.avatarFallback]}>
        <Text style={cr.avatarInitial}>
          {creator.name?.charAt(0)?.toUpperCase() || 'U'}
        </Text>
      </View>
    )}
    <View style={cr.info}>
      <View style={cr.nameRow}>
        <Text style={cr.name}>{creator.name}</Text>
        <View style={cr.badge}>
          <Icons name="check" size={scale(9)} color={C.white} />
        </View>
      </View>
      {!!creator.location && (
        <View style={cr.locRow}>
          <Icons name="map-pin" size={scale(11)} color={C.light} />
          <Text style={cr.location}> {creator.location}</Text>
        </View>
      )}
    </View>
    <TouchableOpacity onPress={onViewProfile} activeOpacity={0.7}>
      <Text style={cr.link}>View Profile →</Text>
    </TouchableOpacity>
  </View>
));

const cr = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: C.white,
    borderRadius: scale(14),
    borderWidth: 1,
    borderColor: C.border,
    padding: scale(14),
    marginBottom: scale(16),
  },
  avatar: {
    width: scale(48),
    height: scale(48),
    borderRadius: scale(24),
    marginRight: scale(12),
  },
  avatarFallback: {
    backgroundColor: C.indigoBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitial: {
    fontSize: scale(18),
    fontWeight: '800',
    color: C.indigo,
  },
  info: { flex: 1 },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: scale(6),
    marginBottom: scale(4),
  },
  name: {
    fontSize: scale(15),
    fontWeight: '700',
    color: C.dark,
    includeFontPadding: false,
  },
  badge: {
    width: scale(17),
    height: scale(17),
    borderRadius: scale(8.5),
    backgroundColor: C.indigo,
    alignItems: 'center',
    justifyContent: 'center',
  },
  locRow: { flexDirection: 'row', alignItems: 'center' },
  location: { fontSize: scale(12), color: C.gray, includeFontPadding: false },
  link: {
    fontSize: scale(13),
    fontWeight: '700',
    color: C.indigo,
    includeFontPadding: false,
  },
});

// ═══════════════════════════════════════════════════════════
// STORY — Read More only appears when the text genuinely
// overflows 3 lines. A hidden, full (non-truncated) copy of
// the text is measured off-screen via onTextLayout to get the
// real line count; the visible text stays truncated/expanded
// based on that measurement.
// ═══════════════════════════════════════════════════════════
const StorySection = memo(({ story }) => {
  const [expanded, setExpanded] = useState(false);
  const [showToggle, setShowToggle] = useState(false);

  const handleMeasureLayout = useCallback(e => {
    setShowToggle(e.nativeEvent.lines.length > 3);
  }, []);

  if (!story) return null;

  return (
    <View style={st.wrap}>
      <Text style={st.heading}>Story</Text>

      {/* Hidden measurer: renders the FULL text with no line limit,
          off-screen, purely to count how many lines it would take. */}
      <Text
        style={[st.body, st.hiddenMeasure]}
        onTextLayout={handleMeasureLayout}
        pointerEvents="none"
      >
        {story}
      </Text>

      {/* Visible text: truncated to 3 lines unless expanded */}
      <Text style={st.body} numberOfLines={expanded ? undefined : 3}>
        {story}
      </Text>

      {showToggle && (
        <TouchableOpacity
          onPress={() => setExpanded(v => !v)}
          activeOpacity={0.7}
        >
          <Text style={st.toggle}>{expanded ? 'Read Less' : 'Read More'}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
});

const st = StyleSheet.create({
  wrap: { marginBottom: scale(16) },
  heading: {
    fontSize: scale(18),
    fontWeight: '800',
    color: C.dark,
    marginBottom: scale(10),
    includeFontPadding: false,
  },
  body: {
    fontSize: scale(14),
    color: C.mid,
    lineHeight: scale(24),
    includeFontPadding: false,
  },
  hiddenMeasure: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    opacity: 0,
    zIndex: -1,
  },
  toggle: {
    fontSize: scale(13),
    fontWeight: '700',
    color: C.green,
    marginTop: scale(8),
    includeFontPadding: false,
  },
});

// ═══════════════════════════════════════════════════════════
// MEDIA GALLERY — now driven by real additionalImages,
// opens the full-screen swipeable viewer on tap
// ═══════════════════════════════════════════════════════════
const MediaGallery = memo(({ media, onItemPress }) => {
  if (!media || media.length === 0) return null;
  return (
    <View style={mg.wrap}>
      <Text style={mg.heading}>Photos & Videos</Text>
      <FlatList
        data={media}
        keyExtractor={item => item.id}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={mg.row}
        renderItem={({ item, index }) => (
          <TouchableOpacity
            activeOpacity={0.85}
            style={mg.item}
            onPress={() => onItemPress(index)}
          >
            <Image source={{ uri: item.uri }} style={mg.img} resizeMode="contain" />
          </TouchableOpacity>
        )}
      />
    </View>
  );
});

const mg = StyleSheet.create({
  wrap: { marginBottom: scale(16) },
  heading: {
    fontSize: scale(18),
    fontWeight: '800',
    color: C.dark,
    marginBottom: scale(10),
    includeFontPadding: false,
  },
  row: { gap: scale(10) },
  item: { position: 'relative' },
  img: {
    width: scale(110),
    height: scale(100),
    borderRadius: scale(12),
    backgroundColor: C.border,
  },
});

// ═══════════════════════════════════════════════════════════
// FULL-SCREEN IMAGE VIEWER — swipeable, with page indicator
// ═══════════════════════════════════════════════════════════
const ImageViewerModal = memo(({ visible, images, initialIndex = 0, onClose }) => {
  const [activeIndex, setActiveIndex] = useState(initialIndex);
  const listRef = useRef(null);

  useEffect(() => {
    if (visible) {
      setActiveIndex(initialIndex);
    }
  }, [visible, initialIndex]);

  const onMomentumScrollEnd = e => {
    const idx = Math.round(e.nativeEvent.contentOffset.x / SW);
    setActiveIndex(idx);
  };

  if (!visible || !images?.length) return null;

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={iv.overlay}>
        <TouchableOpacity
          style={iv.closeBtn}
          onPress={onClose}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
        >
          <Icons name="x" size={scale(22)} color={C.white} />
        </TouchableOpacity>

        <FlatList
          ref={listRef}
          data={images}
          keyExtractor={item => item.id}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          initialScrollIndex={initialIndex}
          getItemLayout={(_, index) => ({ length: SW, offset: SW * index, index })}
          onMomentumScrollEnd={onMomentumScrollEnd}
          renderItem={({ item }) => (
            <View style={iv.page}>
              <Image source={{ uri: item.uri }} style={iv.fullImg} resizeMode="contain" />
            </View>
          )}
        />

        {images.length > 1 && (
          <View style={iv.dotsRow}>
            {images.map((img, idx) => (
              <View
                key={img.id}
                style={[iv.dot, idx === activeIndex && iv.dotActive]}
              />
            ))}
          </View>
        )}

        <Text style={iv.counter}>
          {activeIndex + 1} / {images.length}
        </Text>
      </View>
    </Modal>
  );
});

const iv = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.95)', justifyContent: 'center' },
  closeBtn: {
    position: 'absolute',
    top: SB_H + scale(16),
    right: scale(16),
    zIndex: 10,
    width: scale(38),
    height: scale(38),
    borderRadius: scale(19),
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  page: { width: SW, alignItems: 'center', justifyContent: 'center' },
  fullImg: { width: SW, height: SH * 0.75 },
  dotsRow: {
    position: 'absolute',
    bottom: scale(60),
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: scale(6),
  },
  dot: {
    width: scale(6),
    height: scale(6),
    borderRadius: scale(3),
    backgroundColor: 'rgba(255,255,255,0.4)',
  },
  dotActive: { backgroundColor: C.white, width: scale(18) },
  counter: {
    position: 'absolute',
    bottom: scale(30),
    alignSelf: 'center',
    color: 'rgba(255,255,255,0.8)',
    fontSize: scale(12),
    fontWeight: '600',
  },
});

// ═══════════════════════════════════════════════════════════
// SOCIAL PROOF (demo donor avatars)
// ═══════════════════════════════════════════════════════════
const SocialProof = memo(({ donorsList, donorsCount }) => (
  <View style={soc.wrap}>
    <View style={soc.avatarRow}>
      {donorsList.slice(0, 3).map((d, i) => (
        <Image
          key={d.id}
          source={{ uri: d.avatar }}
          style={[soc.avatar, i > 0 && soc.overlap]}
        />
      ))}
    </View>
    <Text style={soc.txt}>
      <Text style={soc.bold}>{donorsCount}+ people donated</Text>
      {'  ❤️'}
    </Text>
  </View>
));

const soc = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: scale(10),
    marginBottom: scale(16),
  },
  avatarRow: { flexDirection: 'row' },
  avatar: {
    width: scale(32),
    height: scale(32),
    borderRadius: scale(16),
    borderWidth: 2,
    borderColor: C.white,
  },
  overlap: { marginLeft: -scale(10) },
  txt: { fontSize: scale(13), color: C.gray, includeFontPadding: false },
  bold: { fontWeight: '700', color: C.dark },
});

// ═══════════════════════════════════════════════════════════
// UPDATE CARD (demo)
// ═══════════════════════════════════════════════════════════
const UpdateCard = memo(({ updateText, updateAge }) => (
  <View style={uc.wrap}>
    <Text style={uc.heading}>Recent Updates</Text>
    <View style={uc.card}>
      <View style={uc.accent} />
      <View style={uc.content}>
        <Text style={uc.txt}>{updateText}</Text>
        <Text style={uc.age}>{updateAge}</Text>
      </View>
    </View>
  </View>
));

const uc = StyleSheet.create({
  wrap: { marginBottom: scale(16) },
  heading: {
    fontSize: scale(18),
    fontWeight: '800',
    color: C.dark,
    marginBottom: scale(10),
    includeFontPadding: false,
  },
  card: {
    flexDirection: 'row',
    backgroundColor: C.indigoBg,
    borderRadius: scale(12),
    overflow: 'hidden',
  },
  accent: { width: scale(4), backgroundColor: C.indigo },
  content: { flex: 1, padding: scale(14) },
  txt: {
    fontSize: scale(13),
    color: C.mid,
    lineHeight: scale(20),
    marginBottom: scale(6),
    includeFontPadding: false,
  },
  age: { fontSize: scale(11), color: C.light, includeFontPadding: false },
});

// ═══════════════════════════════════════════════════════════
// DONOR ROW (demo)
// ═══════════════════════════════════════════════════════════
const DonorRow = memo(({ item, onPress }) => (
  <TouchableOpacity
    style={dr.row}
    onPress={() => onPress?.(item)}
    activeOpacity={0.7}
  >
    <Image source={{ uri: item.avatar }} style={dr.avatar} />
    <View style={dr.info}>
      <View style={dr.top}>
        <Text style={dr.name}>{item.name}</Text>
        <Text style={dr.amount}>{fmtPK(item.amount)}</Text>
      </View>
      {item.message ? (
        <Text style={dr.msg} numberOfLines={1}>
          "{item.message}"
        </Text>
      ) : null}
      <Text style={dr.time}>{item.time}</Text>
    </View>
  </TouchableOpacity>
));

const dr = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: scale(12),
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: C.border,
    gap: scale(12),
  },
  avatar: { width: scale(38), height: scale(38), borderRadius: scale(19) },
  info: { flex: 1 },
  top: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: scale(3),
  },
  name: {
    fontSize: scale(14),
    fontWeight: '600',
    color: C.dark,
    includeFontPadding: false,
  },
  amount: {
    fontSize: scale(14),
    fontWeight: '700',
    color: C.green,
    includeFontPadding: false,
  },
  msg: {
    fontSize: scale(12),
    color: C.gray,
    fontStyle: 'italic',
    marginBottom: scale(2),
    includeFontPadding: false,
  },
  time: { fontSize: scale(11), color: C.light, includeFontPadding: false },
});

// ═══════════════════════════════════════════════════════════
// DOCUMENTS — now driven by real documents, opens via Linking
// (device browser/PDF app handles view-or-download)
// ═══════════════════════════════════════════════════════════
const Documents = memo(({ documents, onDocPress }) => {
  if (!documents || documents.length === 0) return null;
  return (
    <View style={dc.wrap}>
      <Text style={dc.heading}>Documents</Text>
      {documents.map(doc => (
        <TouchableOpacity
          key={doc.id}
          style={dc.row}
          activeOpacity={0.75}
          onPress={() => onDocPress(doc)}
        >
          <View style={dc.iconWrap}>
            <Icons name="file-text" size={scale(17)} color={C.indigo} />
          </View>
          <Text style={dc.title} numberOfLines={1}>
            {doc.title}
          </Text>
          <Icons name="download" size={scale(16)} color={C.gray} />
        </TouchableOpacity>
      ))}
    </View>
  );
});

const dc = StyleSheet.create({
  wrap: { marginBottom: scale(120) },
  heading: {
    fontSize: scale(18),
    fontWeight: '800',
    color: C.dark,
    marginBottom: scale(10),
    includeFontPadding: false,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: C.white,
    borderRadius: scale(12),
    borderWidth: 1,
    borderColor: C.border,
    padding: scale(14),
    marginBottom: scale(8),
    gap: scale(12),
  },
  iconWrap: {
    width: scale(36),
    height: scale(36),
    borderRadius: scale(10),
    backgroundColor: C.indigoBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    flex: 1,
    fontSize: scale(13),
    fontWeight: '600',
    color: C.dark,
    includeFontPadding: false,
  },
});

// ═══════════════════════════════════════════════════════════
// STICKY BOTTOM BAR
// ═══════════════════════════════════════════════════════════
const StickyBar = memo(({ raised, donorsCount, onDonate }) => (
  <View style={sb.wrap}>
    <View>
      <Text style={sb.lbl}>Raised</Text>
      <Text style={sb.amt}>{fmtPK(raised)}</Text>
      <Text style={sb.sub}>from {donorsCount} donors</Text>
    </View>
    <Pressable onPress={onDonate} style={sb.btn}>
      <LinearGradient
        colors={[C.green, C.greenLight]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={sb.gradient}
      >
        <Text style={sb.btnTxt}>Donate</Text>
        <Icons name="heart" size={scale(14)} color={C.white} />
      </LinearGradient>
    </Pressable>
  </View>
));

const sb = StyleSheet.create({
  wrap: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: C.white,
    paddingHorizontal: scale(20),
    paddingTop: scale(14),
    paddingBottom: Platform.OS === 'ios' ? vscale(28) : scale(16),
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: C.border,
    elevation: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
  },
  lbl: {
    fontSize: scale(11),
    color: C.gray,
    fontWeight: '500',
    includeFontPadding: false,
  },
  amt: {
    fontSize: scale(18),
    fontWeight: '800',
    color: C.green,
    includeFontPadding: false,
  },
  sub: { fontSize: scale(11), color: C.light, includeFontPadding: false },
  btn: { borderRadius: scale(14), overflow: 'hidden' },
  gradient: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: scale(7),
    paddingHorizontal: scale(26),
    paddingVertical: scale(14),
    elevation: 4,
    shadowColor: C.green,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.28,
    shadowRadius: 8,
  },
  btnTxt: {
    fontSize: scale(16),
    fontWeight: '800',
    color: C.white,
    includeFontPadding: false,
  },
});

// ═══════════════════════════════════════════════════════════
// LOADING / ERROR STATES
// ═══════════════════════════════════════════════════════════
const LoadingScreen = () => (
  <View style={ls.wrap}>
    <ActivityIndicator size="large" color={C.green} />
    <Text style={ls.txt}>Loading campaign...</Text>
  </View>
);

const ErrorScreen = ({ message, onRetry, onBack }) => (
  <View style={ls.wrap}>
    <Icons name="alert-triangle" size={scale(40)} color={C.red} />
    <Text style={ls.errorTitle}>Something went wrong</Text>
    <Text style={ls.txt}>{message || 'Could not load this campaign.'}</Text>
    <View style={ls.btnRow}>
      <TouchableOpacity style={ls.backBtn} onPress={onBack} activeOpacity={0.8}>
        <Text style={ls.backBtnTxt}>Go Back</Text>
      </TouchableOpacity>
      {!!onRetry && (
        <TouchableOpacity style={ls.retryBtn} onPress={onRetry} activeOpacity={0.8}>
          <Text style={ls.retryBtnTxt}>Retry</Text>
        </TouchableOpacity>
      )}
    </View>
  </View>
);

const ls = StyleSheet.create({
  wrap: {
    flex: 1,
    backgroundColor: C.bg,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: scale(32),
  },
  txt: {
    fontSize: scale(13),
    color: C.gray,
    textAlign: 'center',
    marginTop: scale(10),
  },
  errorTitle: {
    fontSize: scale(16),
    fontWeight: '700',
    color: C.dark,
    marginTop: scale(14),
  },
  btnRow: { flexDirection: 'row', gap: scale(10), marginTop: scale(18) },
  backBtn: {
    paddingHorizontal: scale(20),
    paddingVertical: scale(10),
    borderRadius: scale(50),
    borderWidth: 1.5,
    borderColor: C.border,
  },
  backBtnTxt: { fontSize: scale(13), fontWeight: '700', color: C.dark },
  retryBtn: {
    paddingHorizontal: scale(20),
    paddingVertical: scale(10),
    borderRadius: scale(50),
    backgroundColor: C.green,
  },
  retryBtnTxt: { fontSize: scale(13), fontWeight: '700', color: C.white },
});

// ═══════════════════════════════════════════════════════════
// MAIN SCREEN
// ═══════════════════════════════════════════════════════════
const CampaignDetail = ({ navigation, route }) => {
  const campaignId = route?.params?.campaignId
    ? String(route.params.campaignId)
    : null;

  const {
    data,
    isLoading,
    isError,
    error,
    refetch,
  } = useCampaignDetail(campaignId);

  const [saved, setSaved] = useState(false);
  const [selectedDonor, setSelectedDonor] = useState(null);
  const [donorModalOpen, setDonorModalOpen] = useState(false);
  const [viewerVisible, setViewerVisible] = useState(false);
  const [viewerIndex, setViewerIndex] = useState(0);

  const handleBack = useCallback(() => navigation?.goBack?.(), [navigation]);
  const handleShare = useCallback(() => {}, []);
  const handleSave = useCallback(() => setSaved(v => !v), []);

  const handleDonate = useCallback(
    () => navigation?.navigate?.('DonateScreen', { campaignId }),
    [navigation, campaignId],
  );

  const handleProfile = useCallback(() => {
    navigation?.navigate?.('CreatorProfileScreen', {
      userId: data?.creator?.userId,
    });
  }, [navigation, data]);

  const handleGalleryPress = useCallback(index => {
    setViewerIndex(index);
    setViewerVisible(true);
  }, []);

const handleOpenDocument = useCallback(async doc => {
  if (!doc?.url) return;
  try {
    await Linking.openURL(doc.url);
  } catch (err) {
    console.error('🔴 [CampaignDetail] Open document error:', err?.message);
    Alert.alert('Error', 'Could not open the document. Please try again.');
  }
}, []);
  
  const handleDonorPress = useCallback(donor => {
    setSelectedDonor({
      id: donor.id,
      name: donor.name,
      isAnonymous: donor.name === 'Anonymous',
      avatarUri: donor.avatar,
      location: donor.location ?? null,
      age: donor.age ?? null,
      gender: donor.gender ?? null,
      occupation: donor.occupation ?? null,
      phone: donor.phone ?? null,
      totalDonated: donor.totalDonated ?? null,
      amount: donor.amount,
      donationDate: donor.donationDate ?? '',
      donationTime: donor.time,
      paymentMethod: donor.paymentMethod ?? '',
      message: donor.message || null,
      timeAgo: donor.time,
      totalCampaigns: donor.totalCampaigns ?? 0,
      memberSince: donor.memberSince ?? '',
    });
    setDonorModalOpen(true);
  }, []);

  const handleDonorModalClose = useCallback(() => {
    setDonorModalOpen(false);
    setTimeout(() => setSelectedDonor(null), 300);
  }, []);

  if (!campaignId) {
    return (
      <ErrorScreen
        message="Missing campaign reference."
        onBack={handleBack}
      />
    );
  }

  if (isLoading) {
    return <LoadingScreen />;
  }

  if (isError || !data) {
    return (
      <ErrorScreen
        message={error?.message}
        onRetry={refetch}
        onBack={handleBack}
      />
    );
  }

  return (
    <View style={s.root}>
      <StatusBar
        barStyle="light-content"
        backgroundColor="transparent"
        translucent
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        bounces={false}
        overScrollMode="never"
      >
        <HeroImage
          image={data.image}
          title={data.title}
          category={data.category}
          urgent={data.urgent}
          onBack={handleBack}
          onShare={handleShare}
          saved={saved}
          onSave={handleSave}
        />

        <View style={s.sheet}>
          <View style={s.handle} />

          <ProgressCard
            raised={data.raised}
            goal={data.goal}
            pct={data.pct}
            donorsCount={DEMO.donors}
            hoursLeft={DEMO.hoursLeft}
          />
          <DonateButton onPress={handleDonate} />
          <CreatorCard creator={data.creator} onViewProfile={handleProfile} />
          <StorySection story={data.story} />
          <MediaGallery media={data.media} onItemPress={handleGalleryPress} />
          <SocialProof donorsList={DEMO.donors_list} donorsCount={DEMO.donors} />
          <UpdateCard updateText={DEMO.update} updateAge={DEMO.updateAge} />

          <View style={s.section}>
            <Text style={s.sectionTitle}>Recent Donors</Text>
            {DEMO.donors_list.map(d => (
              <DonorRow key={d.id} item={d} onPress={handleDonorPress} />
            ))}
          </View>

          <Documents documents={data.documents} onDocPress={handleOpenDocument} />
        </View>
      </ScrollView>

      <StickyBar
        raised={data.raised}
        donorsCount={DEMO.donors}
        onDonate={handleDonate}
      />

      <DonorInfoModal
        visible={donorModalOpen}
        donor={selectedDonor}
        onClose={handleDonorModalClose}
      />

      <ImageViewerModal
        visible={viewerVisible}
        images={data.media}
        initialIndex={viewerIndex}
        onClose={() => setViewerVisible(false)}
      />
    </View>
  );
};

export default CampaignDetail;

// ═══════════════════════════════════════════════════════════
// SCREEN STYLES
// ═══════════════════════════════════════════════════════════
const s = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: C.bg,
  },
  sheet: {
    backgroundColor: C.white,
    borderTopLeftRadius: SHEET_R,
    borderTopRightRadius: SHEET_R,
    marginTop: -SHEET_R,
    paddingHorizontal: scale(18),
    paddingTop: scale(16),
    paddingBottom: scale(8),
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
  },
  handle: {
    width: scale(36),
    height: scale(4),
    borderRadius: scale(2),
    backgroundColor: C.border,
    alignSelf: 'center',
    marginBottom: scale(16),
  },
  section: { marginBottom: scale(16) },
  sectionTitle: {
    fontSize: scale(18),
    fontWeight: '800',
    color: C.dark,
    marginBottom: scale(10),
    includeFontPadding: false,
  },
});