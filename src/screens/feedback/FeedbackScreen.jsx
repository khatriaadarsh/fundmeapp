// src/screens/feedback/FeedbackScreen.jsx

import React, { useState, useRef, useCallback, useEffect, memo } from 'react';

import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  StatusBar,
  Animated,
  Dimensions,
  Platform,
  Keyboard,
} from 'react-native';

import { SafeAreaView } from 'react-native-safe-area-context';
import Icons from 'react-native-vector-icons/Feather';
import MCIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { C } from '../campaigncreation/Shared';

// ─────────────────────────────────────────────────────────────
// Responsive Helpers
// ─────────────────────────────────────────────────────────────
const { width: SW, height: SH } = Dimensions.get('window');

const scale = size => (SW / 375) * size;
const vscale = size => (SH / 812) * size;
const sp = size => scale(size);

// ─────────────────────────────────────────────────────────────
// Rating Labels
// ─────────────────────────────────────────────────────────────
const RATING_LABELS = ['Terrible', 'Bad', 'Okay', 'Good', 'Amazing'];

const TAGS = [
  { id: 'easy', label: 'Easy to Use' },
  { id: 'fast', label: 'Fast Donations' },
  { id: 'trusted', label: 'Trusted Platform' },
  { id: 'campaigns', label: 'Great Campaigns' },
  { id: 'secure', label: 'Secure Payments' },
];

const MAX_CHARS = 500;

// ─────────────────────────────────────────────────────────────
// Orb Illustration
// ─────────────────────────────────────────────────────────────
const OrbIllustration = memo(() => {
  const pulse = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 1.05,
          duration: 1600,
          useNativeDriver: true,
        }),
        Animated.timing(pulse, {
          toValue: 1,
          duration: 1600,
          useNativeDriver: true,
        }),
      ]),
    ).start();
  }, [pulse]);

  return (
    <Animated.View
      style={[
        orb.container,
        {
          transform: [{ scale: pulse }],
        },
      ]}
    >
      <View style={orb.innerCircle}>
        <MCIcons name="heart-outline" size={scale(34)} color={C.teal} />
      </View>
    </Animated.View>
  );
});

const orb = StyleSheet.create({
  container: {
    width: scale(110),
    height: scale(110),
    borderRadius: scale(55),
    backgroundColor: C.tealLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: vscale(24),
  },

  innerCircle: {
    width: scale(72),
    height: scale(72),
    borderRadius: scale(36),
    backgroundColor: C.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

// ─────────────────────────────────────────────────────────────
// Star Component
// ─────────────────────────────────────────────────────────────
const Star = memo(({ filled, onPress, index }) => {
  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={() => onPress(index)}
      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
    >
      <MCIcons
        name={filled ? 'star' : 'star-outline'}
        size={scale(36)}
        color={filled ? '#FACC15' : C.border}
      />
    </TouchableOpacity>
  );
});

// ─────────────────────────────────────────────────────────────
// Tag Chip
// ─────────────────────────────────────────────────────────────
const TagChip = memo(({ label, active, onPress }) => (
  <TouchableOpacity
    style={[chip.wrap, active && chip.wrapActive]}
    onPress={onPress}
    activeOpacity={0.8}
  >
    <Text style={[chip.label, active && chip.labelActive]}>{label}</Text>
  </TouchableOpacity>
));

const chip = StyleSheet.create({
  wrap: {
    paddingHorizontal: scale(16),
    paddingVertical: vscale(10),
    borderRadius: scale(20),
    backgroundColor: C.white,
    borderWidth: 1,
    borderColor: C.border,
    margin: scale(4),
  },

  wrapActive: {
    backgroundColor: C.tealLight,
    borderColor: C.teal,
  },

  label: {
    fontSize: sp(13),
    color: C.textGray,
    fontWeight: '500',
  },

  labelActive: {
    color: C.teal,
    fontWeight: '700',
  },
});

// ─────────────────────────────────────────────────────────────
// Submit Button
// ─────────────────────────────────────────────────────────────
const SubmitButton = memo(({ onPress, disabled }) => {
  return (
    <TouchableOpacity
      style={[button.container, disabled && { opacity: 0.6 }]}
      activeOpacity={0.9}
      onPress={onPress}
      disabled={disabled}
    >
      <Text style={button.text}>Submit Feedback</Text>
    </TouchableOpacity>
  );
});

const button = StyleSheet.create({
  container: {
    width: '100%',
    height: vscale(56),
    backgroundColor: C.teal,
    borderRadius: scale(16),
    alignItems: 'center',
    justifyContent: 'center',

    shadowColor: C.teal,
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 5,
  },

  text: {
    fontSize: sp(16),
    fontWeight: '700',
    color: C.white,
  },
});

// ─────────────────────────────────────────────────────────────
// Main Screen
// ─────────────────────────────────────────────────────────────
const FeedbackScreen = ({ navigation }) => {
  const [rating, setRating] = useState(4);
  const [activeTags, setActiveTags] = useState([]);
  const [comment, setComment] = useState('');
  const [errors, setErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),

      Animated.spring(slideAnim, {
        toValue: 0,
        useNativeDriver: true,
      }),
    ]).start();
  }, [fadeAnim, slideAnim]);

  // ───────────────────────────────────────────────────────────
  // Handlers
  // ───────────────────────────────────────────────────────────
  const handleStarPress = useCallback(index => {
    setRating(index + 1);
  }, []);

  const toggleTag = useCallback(id => {
    setActiveTags(prev =>
      prev.includes(id) ? prev.filter(t => t !== id) : [...prev, id],
    );
  }, []);

  const handleCommentChange = text => {
    if (text.length <= MAX_CHARS) {
      setComment(text);
    }
  };

  // ───────────────────────────────────────────────────────────
  // Validation
  // ───────────────────────────────────────────────────────────
  const validate = useCallback(() => {
    const e = {};

    if (!rating) {
      e.rating = 'Please select a rating';
    }

    if (comment.trim().length > 0 && comment.trim().length < 10) {
      e.comment = 'Comment must be at least 10 characters';
    }

    setErrors(e);

    return Object.keys(e).length === 0;
  }, [rating, comment]);

  // ───────────────────────────────────────────────────────────
  // Submit
  // ───────────────────────────────────────────────────────────
  const handleSubmit = useCallback(() => {
    Keyboard.dismiss();

    if (!validate()) {
      return;
    }

    setSubmitted(true);

    setTimeout(() => {
      navigation.goBack();
    }, 1800);
  }, [navigation, validate]);

  // ───────────────────────────────────────────────────────────
  // Success State
  // ───────────────────────────────────────────────────────────
  if (submitted) {
    return (
      <SafeAreaView style={styles.safe}>
        <StatusBar backgroundColor={C.bg} barStyle="dark-content" />

        <View style={styles.successContainer}>
          <MCIcons name="check-circle" size={scale(72)} color={C.green} />

          <Text style={styles.successTitle}>Thank You!</Text>

          <Text style={styles.successSub}>
            Your feedback helps us improve the FundMe experience.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor={C.bg} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
        >
          <Icons name="arrow-left" size={scale(20)} color={C.dark} />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Animated.View
          style={{
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          }}
        >
          {/* Illustration */}
          <View style={styles.hero}>
            <OrbIllustration />

            <Text style={styles.heading}>Share Your Feedback</Text>

            <Text style={styles.subHeading}>
              Your experience matters to us. Help us improve FundMe.
            </Text>
          </View>

          {/* Rating */}
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Rate Your Experience</Text>

            <View style={styles.starsRow}>
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  index={i}
                  filled={i < rating}
                  onPress={handleStarPress}
                />
              ))}
            </View>

            <Text style={styles.ratingLabel}>{RATING_LABELS[rating - 1]}</Text>

            {!!errors.rating && (
              <Text style={styles.errorText}>{errors.rating}</Text>
            )}
          </View>

          {/* Tags */}
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>What did you like?</Text>

            <View style={styles.tagsWrap}>
              {TAGS.map(tag => (
                <TagChip
                  key={tag.id}
                  label={tag.label}
                  active={activeTags.includes(tag.id)}
                  onPress={() => toggleTag(tag.id)}
                />
              ))}
            </View>
          </View>

          {/* Comment */}
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Additional Feedback</Text>

            <View
              style={[
                styles.textAreaWrap,
                !!errors.comment && styles.textAreaError,
              ]}
            >
              <TextInput
                style={styles.textArea}
                value={comment}
                onChangeText={handleCommentChange}
                placeholder="Tell us about your experience..."
                placeholderTextColor={C.placeholderColor}
                multiline
                textAlignVertical="top"
              />

              <Text style={styles.charCounter}>
                {comment.length}/{MAX_CHARS}
              </Text>
            </View>

            {!!errors.comment && (
              <Text style={styles.errorText}>{errors.comment}</Text>
            )}
          </View>

          <View style={{ height: vscale(20) }} />
        </Animated.View>
      </ScrollView>

      {/* Footer */}
      <View style={styles.footer}>
        <SubmitButton onPress={handleSubmit} disabled={false} />

        <TouchableOpacity
          style={styles.laterBtn}
          activeOpacity={0.7}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.laterText}>Maybe Later</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default FeedbackScreen;

// ─────────────────────────────────────────────────────────────
// Styles
// ─────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: C.bg,
  },

  header: {
    paddingHorizontal: scale(20),
    paddingTop: Platform.OS === 'ios' ? vscale(8) : vscale(12),
    paddingBottom: vscale(6),
  },

  backBtn: {
    width: scale(42),
    height: scale(42),
    borderRadius: scale(14),
    backgroundColor: C.white,
    alignItems: 'center',
    justifyContent: 'center',

    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },

  scroll: {
    flex: 1,
  },

  scrollContent: {
    paddingHorizontal: scale(22),
    paddingBottom: vscale(30),
  },

  hero: {
    alignItems: 'center',
    marginTop: vscale(10),
    marginBottom: vscale(24),
  },

  heading: {
    fontSize: sp(28),
    fontWeight: '800',
    color: C.dark,
    textAlign: 'center',
    marginBottom: vscale(8),
  },

  subHeading: {
    fontSize: sp(14),
    color: C.textGray,
    textAlign: 'center',
    lineHeight: sp(22),
    paddingHorizontal: scale(12),
  },

  card: {
    backgroundColor: C.white,
    borderRadius: scale(22),
    padding: scale(18),
    marginBottom: vscale(18),

    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },

  sectionTitle: {
    fontSize: sp(16),
    fontWeight: '700',
    color: C.dark,
    marginBottom: vscale(16),
  },

  starsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: scale(10),
    marginBottom: vscale(12),
  },

  ratingLabel: {
    textAlign: 'center',
    fontSize: sp(14),
    fontWeight: '700',
    color: C.teal,
  },

  tagsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },

  textAreaWrap: {
    backgroundColor: C.searchBg,
    borderRadius: scale(16),
    borderWidth: 1,
    borderColor: C.border,
    padding: scale(14),
    minHeight: vscale(150),
  },

  textAreaError: {
    borderColor: C.red,
  },

  textArea: {
    minHeight: vscale(100),
    fontSize: sp(14),
    color: C.dark,
    lineHeight: sp(22),
  },

  charCounter: {
    alignSelf: 'flex-end',
    marginTop: vscale(10),
    fontSize: sp(12),
    color: C.textLight,
  },

  errorText: {
    color: C.red,
    fontSize: sp(12),
    marginTop: vscale(6),
  },

  footer: {
    backgroundColor: C.bg,
    paddingHorizontal: scale(22),
    paddingTop: vscale(10),
    paddingBottom: Platform.OS === 'ios' ? vscale(24) : vscale(16),
  },

  laterBtn: {
    marginTop: vscale(10),
    alignItems: 'center',
  },

  laterText: {
    color: C.textGray,
    fontSize: sp(14),
    fontWeight: '500',
  },

  successContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: scale(30),
  },

  successTitle: {
    fontSize: sp(28),
    fontWeight: '800',
    color: C.dark,
    marginTop: vscale(20),
    marginBottom: vscale(10),
  },

  successSub: {
    fontSize: sp(15),
    color: C.textGray,
    textAlign: 'center',
    lineHeight: sp(24),
  },
});
