// src/components/rating/RatingModal.jsx
// PURE REACT NATIVE — no div / className / web tags.

import React, { useState, useEffect, useCallback } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableWithoutFeedback,
  StyleSheet,
  Platform,
  Keyboard,
  KeyboardAvoidingView,
  ScrollView,
} from 'react-native';

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

  useEffect(() => {
    if (visible) {
      setStep('prompt');
      setSentiment(null);
      setStars(0);
      setMessage('');
      setSubmitting(false);
    }
  }, [visible]);

  const isPositive = sentiment === 'like' || sentiment === 'love';
  const sentimentKey = isPositive ? 'positive' : 'negative';

  // Prompt: just select/highlight — do NOT advance yet (SUBMIT advances)
  const handleSelectSentiment = useCallback((key) => {
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
  }, [stars, submitting, onSubmit, context, targetName, sentiment, message, onClose]);

  const resultConfig = RESULT_CONTENT[context]?.[sentimentKey];
  const feedbackConfig =
    context === 'app'
      ? FEEDBACK_CONTENT.app
      : FEEDBACK_CONTENT.creator[sentimentKey];
  const thankYouConfig = THANK_YOU_CONTENT[context];

  const isFeedback = step === 'feedback';

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

      <KeyboardAvoidingView
        style={s.kavWrap}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        pointerEvents="box-none"
      >
        <View style={s.sheet}>
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
      </KeyboardAvoidingView>
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
    bottom: 0,
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
