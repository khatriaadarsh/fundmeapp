// src/screens/campaigns/CampaignDetail.jsx
import React, {
  useState,
  useRef,
  useCallback,
  useEffect,
  memo,
} from 'react';
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
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icons from 'react-native-vector-icons/Feather';

// ═══════════════════════════════════════════════════════════
// Scale
// ═══════════════════════════════════════════════════════════
const { width: SW, height: SH } = Dimensions.get('window');
const scale  = n => (SW / 375) * n;
const vscale = n => (SH / 812) * n;

const SB_H = Platform.OS === 'android' ? (StatusBar.currentHeight ?? 24) : 0;

// ═══════════════════════════════════════════════════════════
// Design Tokens
// ═══════════════════════════════════════════════════════════
const C = {
  white:      '#FFFFFF',
  bg:         '#F8FAFC',
  green:      '#059669',
  greenLight: '#10B981',
  greenBg:    '#ECFDF5',
  red:        '#EF4444',
  redDeep:    '#DC2626',
  indigo:     '#4F46E5',
  indigoBg:   '#EEF2FF',
  dark:       '#0F172A',
  mid:        '#334155',
  gray:       '#64748B',
  light:      '#94A3B8',
  border:     '#E2E8F0',
  cardBg:     '#F8FAFC',
};

// ✅ Hero tall enough to show URGENT + title + category
const HERO_H  = scale(340);
const SHEET_R = scale(24);

// ═══════════════════════════════════════════════════════════
// Mock Data
// ═══════════════════════════════════════════════════════════
const CAMPAIGN = {
  title:     'Rebuilding Homes, Restoring Lives After Floods',
  category:  'Emergency Relief',
  image:     'https://picsum.photos/800/600?random=77',
  raised:    75000,
  goal:      150000,
  donors:    123,
  hoursLeft: 19,
  creator: {
    name:     'Ali Hassan',
    location: 'Karachi, Pakistan',
    avatar:   'https://picsum.photos/100/100?random=20',
  },
  story: 'The devastating floods that struck our region left thousands of families without shelter, food, or clean water. Entire villages were submerged within hours.\n\nFamilies who had spent generations building their homes lost everything overnight. Children are sleeping in makeshift tents without adequate protection from the elements.\n\nYour donation will directly fund emergency shelter kits, clean water supplies, and food packages for the most vulnerable families.',
  media: [
    { id: '1', uri: 'https://picsum.photos/200/200?random=31', label: 'Relief efforts' },
    { id: '2', uri: 'https://picsum.photos/200/200?random=32', label: 'Distribution'  },
    { id: '3', uri: 'https://picsum.photos/200/200?random=33', label: 'Shelter'        },
    { id: '4', uri: 'https://picsum.photos/200/200?random=34', label: 'Supplies'       },
  ],
  donors_list: [
    { id: '1', name: 'Zara M.',   amount: 5000,  message: "Praying for everyone's safety!", time: '2h ago', avatar: 'https://picsum.photos/100/100?random=41' },
    { id: '2', name: 'Usman K.',  amount: 10000, message: '',                               time: '5h ago', avatar: 'https://picsum.photos/100/100?random=42' },
    { id: '3', name: 'Anonymous', amount: 2500,  message: 'May Allah ease your hardships.', time: '1d ago', avatar: 'https://picsum.photos/100/100?random=43' },
  ],
  update:    'Campaign update: First batch of relief funds has been distributed. 15 families received temporary tents today. Thank you 🙏',
  updateAge: 'Posted 2 days ago',
  documents: [{ id: '1', title: 'Damage_Assessment_Report.pdf' }],
};

const pct   = Math.round((CAMPAIGN.raised / CAMPAIGN.goal) * 100);
const fmtPK = n => `PKR ${n.toLocaleString('en-PK')}`;

// ═══════════════════════════════════════════════════════════
// Pressable with scale feedback
// ═══════════════════════════════════════════════════════════
const Pressable = ({ onPress, style, children }) => {
  const anim = useRef(new Animated.Value(1)).current;
  const onIn  = () => Animated.spring(anim, { toValue: 0.94, useNativeDriver: true, tension: 300, friction: 10 }).start();
  const onOut = () => Animated.spring(anim, { toValue: 1,    useNativeDriver: true, tension: 300, friction: 10 }).start();
  return (
    <TouchableOpacity onPress={onPress} onPressIn={onIn} onPressOut={onOut} activeOpacity={1}>
      <Animated.View style={[style, { transform: [{ scale: anim }] }]}>
        {children}
      </Animated.View>
    </TouchableOpacity>
  );
};

// ═══════════════════════════════════════════════════════════
// ✅ HERO — matches screenshot exactly
// Layout (bottom of image):
//   [URGENT badge]
//   [Full title — bold white, wraps freely]
//   [Emergency Relief pill]
// ═══════════════════════════════════════════════════════════
const HeroImage = memo(({ onBack, onShare, saved, onSave }) => (
  <View style={h.wrap}>
    <Image source={{ uri: CAMPAIGN.image }} style={h.img} resizeMode="cover" />

    {/* Strong bottom gradient so text is always readable */}
    <LinearGradient
      colors={['transparent', 'rgba(0,0,0,0.30)', 'rgba(0,0,0,0.80)']}
      locations={[0, 0.45, 1]}
      style={h.fade}
    />

    {/* Top controls */}
    <View style={h.controls}>
      <Pressable onPress={onBack} style={h.glassBtn}>
        <Icons name="arrow-left" size={scale(18)} color={C.white} />
      </Pressable>
      <View style={h.rightBtns}>
        <Pressable onPress={onShare} style={h.glassBtn}>
          <Icons name="share-2" size={scale(17)} color={C.white} />
        </Pressable>
        <Pressable onPress={onSave} style={h.glassBtn}>
          <Icons name="heart" size={scale(17)} color={saved ? '#FF4F6A' : C.white} />
        </Pressable>
      </View>
    </View>

    {/* ✅ Bottom content: URGENT → Title → Category pill */}
    <View style={h.bottom}>
      {/* URGENT badge — red gradient pill */}
      <LinearGradient
        colors={[C.red, C.redDeep]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={h.urgentBadge}
      >
        <Text style={h.urgentTxt}>URGENT</Text>
      </LinearGradient>

      {/* Full title — wraps to as many lines as needed */}
      <Text style={h.title}>{CAMPAIGN.title}</Text>

      {/* Category pill — glass dark */}
      <View style={h.categoryPill}>
        <Text style={h.categoryTxt}>{CAMPAIGN.category}</Text>
      </View>
    </View>
  </View>
));

const h = StyleSheet.create({
  wrap: {
    width:    SW,
    height:   HERO_H,
    position: 'relative',
  },
  img: {
    position:   'absolute',
    top:        0,
    left:       0,
    width:      '100%',
    height:     '100%',
  },
  // Strong gradient covers bottom 70% so text is always readable
  fade: {
    position: 'absolute',
    bottom:   0,
    left:     0,
    right:    0,
    height:   HERO_H * 0.72,
  },
  controls: {
    position:       'absolute',
    top:            SB_H + scale(12),
    left:           scale(16),
    right:          scale(16),
    flexDirection:  'row',
    alignItems:     'center',
    justifyContent: 'space-between',
  },
  glassBtn: {
    width:           scale(38),
    height:          scale(38),
    borderRadius:    scale(19),
    backgroundColor: 'rgba(0,0,0,0.38)',
    alignItems:      'center',
    justifyContent:  'center',
    borderWidth:     StyleSheet.hairlineWidth,
    borderColor:     'rgba(255,255,255,0.22)',
  },
  rightBtns: {
    flexDirection: 'row',
    gap:           scale(10),
  },

  // ✅ Bottom section — pinned to bottom of hero
  bottom: {
    position:   'absolute',
    // bottom:     scale(22),
    bottom:     scale(44),
    left:       scale(16),
    right:      scale(16),
  },

  // URGENT badge
  urgentBadge: {
    alignSelf:         'flex-start',
    paddingHorizontal: scale(14),
    paddingVertical:   scale(6),
    borderRadius:      scale(20),
    marginBottom:      scale(10),
  },
  urgentTxt: {
    fontSize:           scale(11),
    fontWeight:         '800',
    color:              C.white,
    letterSpacing:      1,
    includeFontPadding: false,
  },

  // Full title — no line limit, wraps freely
  title: {
    fontSize:           scale(22),
    fontWeight:         '800',
    color:              C.white,
    lineHeight:         scale(30),
    letterSpacing:      -0.2,
    marginBottom:       scale(12),
    includeFontPadding: false,
  },

  // Category pill
  categoryPill: {
    alignSelf:         'flex-start',
    backgroundColor:   'rgba(0,0,0,0.52)',
    borderRadius:      scale(20),
    paddingHorizontal: scale(14),
    paddingVertical:   scale(7),
    borderWidth:       StyleSheet.hairlineWidth,
    borderColor:       'rgba(255,255,255,0.25)',
  },
  categoryTxt: {
    fontSize:           scale(13),
    fontWeight:         '600',
    color:              C.white,
    includeFontPadding: false,
  },
});

// ═══════════════════════════════════════════════════════════
// PROGRESS CARD
// ═══════════════════════════════════════════════════════════
const ProgressCard = memo(() => {
  const fillAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fillAnim, {
      toValue:         pct / 100,
      duration:        1100,
      useNativeDriver: false,
    }).start();
  }, [fillAnim]);

  const fillW = fillAnim.interpolate({
    inputRange:  [0, 1],
    outputRange: ['0%', `${pct}%`],
  });

  return (
    <View style={pg.card}>
      <View style={pg.amtRow}>
        <View>
          <View style={pg.raisedRow}>
            <Text style={pg.raisedNum}>{fmtPK(CAMPAIGN.raised)}</Text>
            <Text style={pg.raisedWord}> raised</Text>
          </View>
          <Text style={pg.goalTxt}>of {fmtPK(CAMPAIGN.goal)} goal</Text>
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
          { icon: 'users',   label: `${CAMPAIGN.donors} Donors`  },
          { icon: 'clock',   label: `${CAMPAIGN.hoursLeft}h left` },
          { icon: 'percent', label: `${pct}% funded`              },
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
    borderRadius:    scale(16),
    padding:         scale(18),
    marginBottom:    scale(16),
  },
  amtRow: {
    flexDirection:  'row',
    alignItems:     'flex-start',
    justifyContent: 'space-between',
    marginBottom:   scale(12),
  },
  raisedRow:   { flexDirection: 'row', alignItems: 'baseline' },
  raisedNum: {
    fontSize:           scale(26),
    fontWeight:         '800',
    color:              C.green,
    letterSpacing:      -0.5,
    includeFontPadding: false,
  },
  raisedWord: {
    fontSize:           scale(15),
    fontWeight:         '600',
    color:              C.green,
    includeFontPadding: false,
  },
  goalTxt: {
    fontSize:           scale(13),
    color:              C.gray,
    marginTop:          scale(3),
    includeFontPadding: false,
  },
  pct: {
    fontSize:           scale(22),
    fontWeight:         '800',
    color:              C.green,
    includeFontPadding: false,
  },
  track: {
    height:          scale(8),
    backgroundColor: C.border,
    borderRadius:    scale(4),
    overflow:        'hidden',
    marginBottom:    scale(14),
  },
  fillWrap: {
    height:       '100%',
    borderRadius: scale(4),
    overflow:     'hidden',
  },
  pillRow: {
    flexDirection: 'row',
    gap:           scale(8),
  },
  pill: {
    flexDirection:     'row',
    alignItems:        'center',
    gap:               scale(5),
    backgroundColor:   C.white,
    borderRadius:      scale(20),
    paddingHorizontal: scale(12),
    paddingVertical:   scale(7),
    borderWidth:       1,
    borderColor:       C.border,
  },
  pillTxt: {
    fontSize:           scale(12),
    fontWeight:         '600',
    color:              C.mid,
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
  wrap:     { marginBottom: scale(16) },
  btn:      { borderRadius: scale(14), overflow: 'hidden' },
  gradient: {
    height:         scale(56),
    flexDirection:  'row',
    alignItems:     'center',
    justifyContent: 'center',
    gap:            scale(10),
    elevation:      5,
    shadowColor:    C.green,
    shadowOffset:   { width: 0, height: 5 },
    shadowOpacity:  0.30,
    shadowRadius:   10,
  },
  txt:   { fontSize: scale(18), fontWeight: '800', color: C.white, includeFontPadding: false },
  emoji: { fontSize: scale(18) },
  micro: { fontSize: scale(12), color: C.gray, textAlign: 'center', marginTop: scale(10), includeFontPadding: false },
});

// ═══════════════════════════════════════════════════════════
// CREATOR CARD
// ═══════════════════════════════════════════════════════════
const CreatorCard = memo(({ onViewProfile }) => (
  <View style={cr.card}>
    <Image source={{ uri: CAMPAIGN.creator.avatar }} style={cr.avatar} />
    <View style={cr.info}>
      <View style={cr.nameRow}>
        <Text style={cr.name}>{CAMPAIGN.creator.name}</Text>
        <View style={cr.badge}>
          <Icons name="check" size={scale(9)} color={C.white} />
        </View>
      </View>
      <View style={cr.locRow}>
        <Icons name="map-pin" size={scale(11)} color={C.light} />
        <Text style={cr.location}> {CAMPAIGN.creator.location}</Text>
      </View>
    </View>
    <TouchableOpacity onPress={onViewProfile} activeOpacity={0.7}>
      <Text style={cr.link}>View Profile →</Text>
    </TouchableOpacity>
  </View>
));

const cr = StyleSheet.create({
  card: {
    flexDirection:   'row',
    alignItems:      'center',
    backgroundColor: C.white,
    borderRadius:    scale(14),
    borderWidth:     1,
    borderColor:     C.border,
    padding:         scale(14),
    marginBottom:    scale(16),
  },
  avatar:  { width: scale(48), height: scale(48), borderRadius: scale(24), marginRight: scale(12) },
  info:    { flex: 1 },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: scale(6), marginBottom: scale(4) },
  name:    { fontSize: scale(15), fontWeight: '700', color: C.dark, includeFontPadding: false },
  badge: {
    width:           scale(17),
    height:          scale(17),
    borderRadius:    scale(8.5),
    backgroundColor: C.indigo,
    alignItems:      'center',
    justifyContent:  'center',
  },
  locRow:   { flexDirection: 'row', alignItems: 'center' },
  location: { fontSize: scale(12), color: C.gray, includeFontPadding: false },
  link:     { fontSize: scale(13), fontWeight: '700', color: C.indigo, includeFontPadding: false },
});

// ═══════════════════════════════════════════════════════════
// STORY
// ═══════════════════════════════════════════════════════════
const StorySection = memo(() => {
  const [expanded, setExpanded] = useState(false);
  return (
    <View style={st.wrap}>
      <Text style={st.heading}>Story</Text>
      <Text style={st.body} numberOfLines={expanded ? undefined : 3}>
        {CAMPAIGN.story}
      </Text>
      <TouchableOpacity onPress={() => setExpanded(v => !v)} activeOpacity={0.7}>
        <Text style={st.toggle}>{expanded ? 'Read Less' : 'Read More'}</Text>
      </TouchableOpacity>
    </View>
  );
});

const st = StyleSheet.create({
  wrap:    { marginBottom: scale(16) },
  heading: { fontSize: scale(18), fontWeight: '800', color: C.dark, marginBottom: scale(10), includeFontPadding: false },
  body:    { fontSize: scale(14), color: C.mid, lineHeight: scale(24), includeFontPadding: false },
  toggle:  { fontSize: scale(13), fontWeight: '700', color: C.green, marginTop: scale(8), includeFontPadding: false },
});

// ═══════════════════════════════════════════════════════════
// MEDIA GALLERY
// ═══════════════════════════════════════════════════════════
const MediaGallery = memo(() => (
  <View style={mg.wrap}>
    <Text style={mg.heading}>Photos & Videos</Text>
    <FlatList
      data={CAMPAIGN.media}
      keyExtractor={item => item.id}
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={mg.row}
      renderItem={({ item }) => (
        <TouchableOpacity activeOpacity={0.85} style={mg.item}>
          <Image source={{ uri: item.uri }} style={mg.img} />
          <View style={mg.overlay}>
            <Text style={mg.label} numberOfLines={1}>{item.label}</Text>
          </View>
        </TouchableOpacity>
      )}
    />
  </View>
));

const mg = StyleSheet.create({
  wrap:    { marginBottom: scale(16) },
  heading: { fontSize: scale(18), fontWeight: '800', color: C.dark, marginBottom: scale(10), includeFontPadding: false },
  row:     { gap: scale(10) },
  item:    { position: 'relative' },
  img: {
    width:           scale(110),
    height:          scale(100),
    borderRadius:    scale(12),
    backgroundColor: C.border,
  },
  overlay: {
    position:                'absolute',
    bottom:                  0,
    left:                    0,
    right:                   0,
    backgroundColor:         'rgba(0,0,0,0.40)',
    borderBottomLeftRadius:  scale(12),
    borderBottomRightRadius: scale(12),
    paddingHorizontal:       scale(6),
    paddingVertical:         scale(4),
  },
  label: { fontSize: scale(10), color: C.white, fontWeight: '600', includeFontPadding: false },
});

// ═══════════════════════════════════════════════════════════
// SOCIAL PROOF
// ═══════════════════════════════════════════════════════════
const SocialProof = memo(() => (
  <View style={soc.wrap}>
    <View style={soc.avatarRow}>
      {CAMPAIGN.donors_list.slice(0, 3).map((d, i) => (
        <Image key={d.id} source={{ uri: d.avatar }} style={[soc.avatar, i > 0 && soc.overlap]} />
      ))}
    </View>
    <Text style={soc.txt}>
      <Text style={soc.bold}>{CAMPAIGN.donors}+ people donated</Text>{'  ❤️'}
    </Text>
  </View>
));

const soc = StyleSheet.create({
  wrap:      { flexDirection: 'row', alignItems: 'center', gap: scale(10), marginBottom: scale(16) },
  avatarRow: { flexDirection: 'row' },
  avatar:    { width: scale(32), height: scale(32), borderRadius: scale(16), borderWidth: 2, borderColor: C.white },
  overlap:   { marginLeft: -scale(10) },
  txt:       { fontSize: scale(13), color: C.gray, includeFontPadding: false },
  bold:      { fontWeight: '700', color: C.dark },
});

// ═══════════════════════════════════════════════════════════
// UPDATE CARD
// ═══════════════════════════════════════════════════════════
const UpdateCard = memo(() => (
  <View style={uc.wrap}>
    <Text style={uc.heading}>Recent Updates</Text>
    <View style={uc.card}>
      <View style={uc.accent} />
      <View style={uc.content}>
        <Text style={uc.txt}>{CAMPAIGN.update}</Text>
        <Text style={uc.age}>{CAMPAIGN.updateAge}</Text>
      </View>
    </View>
  </View>
));

const uc = StyleSheet.create({
  wrap:    { marginBottom: scale(16) },
  heading: { fontSize: scale(18), fontWeight: '800', color: C.dark, marginBottom: scale(10), includeFontPadding: false },
  card:    { flexDirection: 'row', backgroundColor: C.indigoBg, borderRadius: scale(12), overflow: 'hidden' },
  accent:  { width: scale(4), backgroundColor: C.indigo },
  content: { flex: 1, padding: scale(14) },
  txt:     { fontSize: scale(13), color: C.mid, lineHeight: scale(20), marginBottom: scale(6), includeFontPadding: false },
  age:     { fontSize: scale(11), color: C.light, includeFontPadding: false },
});

// ═══════════════════════════════════════════════════════════
// DONOR ROW
// ═══════════════════════════════════════════════════════════
const DonorRow = memo(({ item }) => (
  <View style={dr.row}>
    <Image source={{ uri: item.avatar }} style={dr.avatar} />
    <View style={dr.info}>
      <View style={dr.top}>
        <Text style={dr.name}>{item.name}</Text>
        <Text style={dr.amount}>{fmtPK(item.amount)}</Text>
      </View>
      {item.message ? <Text style={dr.msg} numberOfLines={1}>"{item.message}"</Text> : null}
      <Text style={dr.time}>{item.time}</Text>
    </View>
  </View>
));

const dr = StyleSheet.create({
  row:    { flexDirection: 'row', alignItems: 'flex-start', paddingVertical: scale(12), borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: C.border, gap: scale(12) },
  avatar: { width: scale(38), height: scale(38), borderRadius: scale(19) },
  info:   { flex: 1 },
  top:    { flexDirection: 'row', justifyContent: 'space-between', marginBottom: scale(3) },
  name:   { fontSize: scale(14), fontWeight: '600', color: C.dark,  includeFontPadding: false },
  amount: { fontSize: scale(14), fontWeight: '700', color: C.green, includeFontPadding: false },
  msg:    { fontSize: scale(12), color: C.gray, fontStyle: 'italic', marginBottom: scale(2), includeFontPadding: false },
  time:   { fontSize: scale(11), color: C.light, includeFontPadding: false },
});

// ═══════════════════════════════════════════════════════════
// DOCUMENTS
// ═══════════════════════════════════════════════════════════
const Documents = memo(() => (
  <View style={dc.wrap}>
    <Text style={dc.heading}>Documents</Text>
    {CAMPAIGN.documents.map(doc => (
      <TouchableOpacity key={doc.id} style={dc.row} activeOpacity={0.75}>
        <View style={dc.iconWrap}>
          <Icons name="file-text" size={scale(17)} color={C.indigo} />
        </View>
        <Text style={dc.title} numberOfLines={1}>{doc.title}</Text>
        <Icons name="download" size={scale(16)} color={C.gray} />
      </TouchableOpacity>
    ))}
  </View>
));

const dc = StyleSheet.create({
  wrap:    { marginBottom: scale(120) },
  heading: { fontSize: scale(18), fontWeight: '800', color: C.dark, marginBottom: scale(10), includeFontPadding: false },
  row: {
    flexDirection:   'row',
    alignItems:      'center',
    backgroundColor: C.white,
    borderRadius:    scale(12),
    borderWidth:     1,
    borderColor:     C.border,
    padding:         scale(14),
    marginBottom:    scale(8),
    gap:             scale(12),
  },
  iconWrap: {
    width:           scale(36),
    height:          scale(36),
    borderRadius:    scale(10),
    backgroundColor: C.indigoBg,
    alignItems:      'center',
    justifyContent:  'center',
  },
  title: { flex: 1, fontSize: scale(13), fontWeight: '600', color: C.dark, includeFontPadding: false },
});

// ═══════════════════════════════════════════════════════════
// STICKY BOTTOM BAR
// ═══════════════════════════════════════════════════════════
const StickyBar = memo(({ onDonate }) => (
  <View style={sb.wrap}>
    <View>
      <Text style={sb.lbl}>Raised</Text>
      <Text style={sb.amt}>{fmtPK(CAMPAIGN.raised)}</Text>
      <Text style={sb.sub}>from {CAMPAIGN.donors} donors</Text>
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
    position:          'absolute',
    bottom:            0,
    left:              0,
    right:             0,
    flexDirection:     'row',
    alignItems:        'center',
    justifyContent:    'space-between',
    backgroundColor:   C.white,
    paddingHorizontal: scale(20),
    paddingTop:        scale(14),
    paddingBottom:     Platform.OS === 'ios' ? vscale(28) : scale(16),
    borderTopWidth:    StyleSheet.hairlineWidth,
    borderTopColor:    C.border,
    elevation:         16,
    shadowColor:       '#000',
    shadowOffset:      { width: 0, height: -3 },
    shadowOpacity:     0.08,
    shadowRadius:      10,
  },
  lbl: { fontSize: scale(11), color: C.gray,  fontWeight: '500', includeFontPadding: false },
  amt: { fontSize: scale(18), fontWeight: '800', color: C.green, includeFontPadding: false },
  sub: { fontSize: scale(11), color: C.light, includeFontPadding: false },
  btn: { borderRadius: scale(14), overflow: 'hidden' },
  gradient: {
    flexDirection:     'row',
    alignItems:        'center',
    gap:               scale(7),
    paddingHorizontal: scale(26),
    paddingVertical:   scale(14),
    elevation:         4,
    shadowColor:       C.green,
    shadowOffset:      { width: 0, height: 3 },
    shadowOpacity:     0.28,
    shadowRadius:      8,
  },
  btnTxt: { fontSize: scale(16), fontWeight: '800', color: C.white, includeFontPadding: false },
});

// ═══════════════════════════════════════════════════════════
// MAIN SCREEN
// ═══════════════════════════════════════════════════════════
const CampaignDetail = ({ navigation }) => {
  const [saved, setSaved] = useState(false);

  const handleBack    = useCallback(() => navigation?.goBack?.(), [navigation]);
  const handleShare   = useCallback(() => {}, []);
  const handleSave    = useCallback(() => setSaved(v => !v), []);
  const handleDonate  = useCallback(() => navigation?.navigate?.('Donate'), [navigation]);
  const handleProfile = useCallback(() => {}, []);

  return (
    <View style={s.root}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />

      <ScrollView
        showsVerticalScrollIndicator={false}
        bounces={false}
        overScrollMode="never"
      >
        {/* ✅ Hero: image + controls + URGENT + title + category */}
        <HeroImage
          onBack={handleBack}
          onShare={handleShare}
          saved={saved}
          onSave={handleSave}
        />

        {/* ✅ White sheet — only content, no title/urgent here */}
        <View style={s.sheet}>
          <View style={s.handle} />

          <ProgressCard />
          <DonateButton onPress={handleDonate} />
          <CreatorCard onViewProfile={handleProfile} />
          <StorySection />
          <MediaGallery />
          <SocialProof />
          <UpdateCard />

          <View style={s.section}>
            <Text style={s.sectionTitle}>Recent Donors</Text>
            {CAMPAIGN.donors_list.map(d => (
              <DonorRow key={d.id} item={d} />
            ))}
          </View>

          <Documents />
        </View>
      </ScrollView>

      <StickyBar onDonate={handleDonate} />
    </View>
  );
};

export default CampaignDetail;

// ═══════════════════════════════════════════════════════════
// SCREEN STYLES
// ═══════════════════════════════════════════════════════════
const s = StyleSheet.create({

  root: {
    flex:            1,
    backgroundColor: C.bg,
  },

  // ✅ Sheet overlaps hero by just the border radius amount
  sheet: {
    backgroundColor:      C.white,
    borderTopLeftRadius:  SHEET_R,
    borderTopRightRadius: SHEET_R,
    marginTop:            -SHEET_R,
    paddingHorizontal:    scale(18),
    paddingTop:           scale(16),
    paddingBottom:        scale(8),
    elevation:            6,
    shadowColor:          '#000',
    shadowOffset:         { width: 0, height: -2 },
    shadowOpacity:        0.06,
    shadowRadius:         10,
  },

  handle: {
    width:           scale(36),
    height:          scale(4),
    borderRadius:    scale(2),
    backgroundColor: C.border,
    alignSelf:       'center',
    marginBottom:    scale(16),
  },

  section:      { marginBottom: scale(16) },
  sectionTitle: {
    fontSize:           scale(18),
    fontWeight:         '800',
    color:              C.dark,
    marginBottom:       scale(10),
    includeFontPadding: false,
  },
});