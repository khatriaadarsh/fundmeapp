// src/components/rating/ratingContent.js
export const PROMPT_TITLE = 'How Was your Experience?';
export const RESULT_CONTENT = {
  app: {
    negative: {
      icon: 'frown',
      title: 'Sorry to hear that',
      subtitle: () => "Would you like to tell us what went wrong so we can make it better for you?",
      primaryLabel: 'SHARE FEEDBACK',
      secondaryLabel: 'CANCEL',
    },
    positive: {
      icon: 'smile',
      title: 'Glad you like it!',
      subtitle: () => 'Would you like to rate us on the Play Store?',
      primaryLabel: 'RATE NOW',
      secondaryLabel: 'REMIND LATER',
    },
  },
  creator: {
    negative: {
      icon: 'frown',
      title: 'Sorry to hear that',
      subtitle: (name) => `Would you like to tell us what went wrong with ${name}'s campaign?`,
      primaryLabel: 'SHARE FEEDBACK',
      secondaryLabel: 'CANCEL',
    },
    positive: {
      icon: 'smile',
      title: 'Glad you had a great experience',
      subtitle: (name) => `Would you like to rate ${name}?`,
      primaryLabel: 'RATE NOW',
      secondaryLabel: 'MAYBE LATER',
    },
  },
};
export const FEEDBACK_CONTENT = {
  app: {
    title: () => 'Share Feedback',
    subtitle: () => "Tell us what went wrong so we can make it better for you",
    placeholder: 'Tell us more about the issue…',
  },
  creator: {
    negative: {
      title: (name) => `Rate ${name}`,
      subtitle: (name) => `Tell us what went wrong with ${name}'s campaign`,
      placeholder: 'What could have gone better?',
    },
    positive: {
      title: (name) => `Rate ${name}`,
      subtitle: (name) => `Tell us what you loved about ${name}'s campaign`,
      placeholder: 'Share your experience…',
    },
  },
};
export const THANK_YOU_CONTENT = {
  app: {
    title: 'Thanks for your feedback!',
    subtitle: () => "We'll use this to keep improving.",
  },
  creator: {
    title: 'Thanks for rating!',
    subtitle: (name) => `Your feedback on ${name} has been submitted.`,
  },
};
export const DEFAULT_STARS_BY_SENTIMENT = {
  dislike: 2,
  like: 4,
  love: 5,
};