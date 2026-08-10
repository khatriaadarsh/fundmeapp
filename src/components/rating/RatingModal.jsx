// src/components/rating/RatingModal.jsx
// PURE REACT NATIVE — no div / className / web tags.

import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableWithoutFeedback,
  StyleSheet,
  Platform,
  Keyboard,
  Animated,
  ScrollView,
  useWindowDimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { sp, COLORS } from './ratingTheme';
import {
  PROMPT_TITLE,
  RESULT_CONTENT,
  FEEDBACK_CONTENT,
  THANK_YOU_CONTENT,
  DEFAULT_STARS_BY_SENTIMENT,
} from './ratingContent';
import {
  PromptStep,
  ResultPanel,
  FeedbackForm,
  ThankYou,
} from './RatingModalComponents';

const RatingModal = ({
  visible,
  onClose,
  context = 'app',
  targetName = '',
  onRateNow,
  onSubmit,
}) => {
  const [step, setStep] = useState('prompt');
  const [sentiment, setSentiment] = useState(null); // dislike | like | love
  const [stars, setStars] = useState(0);
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // ── Keyboard-aware sheet positioning ─────────────────────────
  // Replaces KeyboardAvoidingView, which is unreliable inside a
  // React Native Modal (Android in particular: `behavior={undefined}`
  // there means no keyboard handling happens at all, since a Modal
  // renders in its own native window). Instead we track the real
  // keyboard height from the OS event and animate the sheet's
  // `bottom` offset to match it exactly, synced to the keyboard's own
  // animation duration.
  const kbOffset = useRef(new Animated.Value(0)).current;
  const [kbHeight, setKbHeight] = useState(0);
  const { height: screenH } = useWindowDimensions();
  const insets = useSafeAreaInsets();

  useEffect(() => {
    // `will` events fire pre-emptively on iOS for a smooth synced
    // animation; they don't reliably fire on Android, so `did` events
    // are used there instead.
    const showEvt =
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvt =
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';

    const onShow = e => {
      const height = e?.endCoordinates?.height ?? 0;
      const duration = e?.duration ?? 250;
      setKbHeight(height);
      Animated.timing(kbOffset, {
        toValue: height,
        duration,
        useNativeDriver: false, // animating `bottom`, not a transform
      }).start();
    };

    const onHide = e => {
      const duration = e?.duration ?? 200;
      setKbHeight(0);
      Animated.timing(kbOffset, {
        toValue: 0,
        duration,
        useNativeDriver: false,
      }).start();
    };

    const showSub = Keyboard.addListener(showEvt, onShow);
    const hideSub = Keyboard.addListener(hideEvt, onHide);

    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, [kbOffset]);

  useEffect(() => {
    if (visible) {
      setStep('prompt');
      setSentiment(null);
      setStars(0);
      setMessage('');
      setSubmitting(false);
      setKbHeight(0);
      kbOffset.setValue(0);
    }
  }, [visible, kbOffset]);

  const isPositive = sentiment === 'like' || sentiment === 'love';
  const sentimentKey = isPositive ? 'positive' : 'negative';

  // Prompt: just select/highlight — do NOT advance yet (SUBMIT advances)
  const handleSelectSentiment = useCallback(key => {
    setSentiment(key);
  }, []);

  // SUBMIT on the prompt screen advances to the correct next step.
  const handlePromptSubmit = useCallback(() => {
    if (!sentiment) return;
    setStars(DEFAULT_STARS_BY_SENTIMENT[sentiment]);
    setStep('result');
  }, [sentiment]);

  // Primary button on the result step
  // ALWAYS go to the star + comment feedback form so we collect a review
  // for every positive/negative case (app & creator). onRateNow is fired
  // as an optional side-effect for the app-positive store-review case, but
  // the flow still continues to the in-app review form.
  const handleResultPrimary = useCallback(() => {
    if (context === 'app' && isPositive) {
      onRateNow?.(); // optional: open store link if the app wants to
    }
    setStep('feedback');
  }, [context, isPositive, onRateNow]);

  const handleResultSecondary = useCallback(() => {
    if (context === 'app' && isPositive) onClose?.('remind_later');
    else if (context === 'creator' && isPositive) onClose?.('skipped');
    else onClose?.('cancelled');
  }, [context, isPositive, onClose]);

  const handleSubmit = useCallback(async () => {
    if (stars === 0 || submitting) return;
    setSubmitting(true);
    try {
      await onSubmit?.({
        context,
        targetName,
        sentiment,
        stars,
        message: message.trim(),
      });
      Keyboard.dismiss();
      setStep('thankyou');
      setTimeout(() => onClose?.('submitted'), 1400);
    } catch (e) {
      setSubmitting(false);
    }
  }, [
    stars,
    submitting,
    onSubmit,
    context,
    targetName,
    sentiment,
    message,
    onClose,
  ]);

  const resultConfig = RESULT_CONTENT[context]?.[sentimentKey];
  const feedbackConfig =
    context === 'app'
      ? FEEDBACK_CONTENT.app
      : FEEDBACK_CONTENT.creator[sentimentKey];
  const thankYouConfig = THANK_YOU_CONTENT[context];

  const isFeedback = step === 'feedback';

  // Sheet never exceeds 90% of the screen normally, and shrinks further
  // to stay above the keyboard when it's open — so on shorter devices
  // with a tall keyboard, the sheet's own ScrollView (feedback step)
  // takes over scrolling instead of content getting pushed off the top
  // of the screen or clipped behind the keyboard.
  const sheetMaxHeight = Math.min(
    screenH * 0.9,
    screenH - insets.top - sp(24) - kbHeight,
  );

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      statusBarTranslucent
      hardwareAccelerated
      presentationStyle="overFullScreen"
      onRequestClose={() => onClose?.('cancelled')}
    >
      <TouchableWithoutFeedback
        onPress={() => !isFeedback && onClose?.('cancelled')}
      >
        <View style={s.overlay} />
      </TouchableWithoutFeedback>

      <Animated.View
        style={[s.kavWrap, { bottom: kbOffset }]}
        pointerEvents="box-none"
      >
        <View style={[s.sheet, { maxHeight: sheetMaxHeight }]}>
          <View style={s.grabber} />

          {step === 'prompt' && (
            <PromptStep
              title={PROMPT_TITLE}
              selected={sentiment}
              onSelect={handleSelectSentiment}
              onSubmit={handlePromptSubmit}
            />
          )}

          {step === 'result' && resultConfig && (
            <ResultPanel
              icon={resultConfig.icon}
              title={resultConfig.title}
              subtitle={resultConfig.subtitle(targetName)}
              primaryLabel={resultConfig.primaryLabel}
              secondaryLabel={resultConfig.secondaryLabel}
              onPrimary={handleResultPrimary}
              onSecondary={handleResultSecondary}
            />
          )}

          {step === 'feedback' && feedbackConfig && (
            <ScrollView
              bounces={false}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ paddingBottom: sp(4) }}
            >
              <FeedbackForm
                title={feedbackConfig.title(targetName)}
                subtitle={feedbackConfig.subtitle(targetName)}
                placeholder={feedbackConfig.placeholder}
                stars={stars}
                onChangeStars={setStars}
                message={message}
                onChangeMessage={setMessage}
                onSubmit={handleSubmit}
                submitting={submitting}
              />
            </ScrollView>
          )}

          {step === 'thankyou' && thankYouConfig && (
            <ThankYou
              title={thankYouConfig.title}
              subtitle={thankYouConfig.subtitle(targetName)}
            />
          )}
        </View>
      </Animated.View>
    </Modal>
  );
};

export default RatingModal;

const s = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: COLORS.overlay,
  },
  kavWrap: {
    position: 'absolute',
    left: 0,
    right: 0,
    // `bottom` is animated inline to track the real keyboard height —
    // see kbOffset above.
  },
  sheet: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: sp(28),
    borderTopRightRadius: sp(28),
    paddingHorizontal: sp(24),
    paddingTop: sp(14),
    paddingBottom: Platform.OS === 'ios' ? sp(34) : sp(24),
  },
  grabber: {
    width: sp(40),
    height: sp(4),
    borderRadius: sp(2),
    backgroundColor: COLORS.border,
    alignSelf: 'center',
    marginBottom: sp(18),
  },
});
