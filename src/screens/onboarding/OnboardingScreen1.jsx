import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

const OnboardingScreen1 = () => {
  return (
    <View style={styles.container}>
      <Text>Onboarding Screen 1</Text>
    </View>
  );
};

export default OnboardingScreen1;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
