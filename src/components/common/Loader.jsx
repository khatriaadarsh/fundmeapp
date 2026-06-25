// src/components/common/Loader.jsx
import React, { useEffect, useRef } from 'react';
import { View, Animated, Easing, StyleSheet, Text, Modal } from 'react-native';

const TEAL = '#15AABF';

export const Loader = ({ size = 40, color = TEAL, thickness = 3 }) => {
  const spin = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const anim = Animated.loop(
      Animated.timing(spin, {
        toValue: 1,
        duration: 900,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
    );
    anim.start();
    return () => anim.stop();
  }, [spin]);

  const rotate = spin.interpolate({
    inputRange:  [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <Animated.View
      style={{
        width:  size,
        height: size,
        borderRadius:   size / 2,
        borderWidth:    thickness,
        borderColor:    'rgba(21, 170, 191, 0.2)',
        borderTopColor: color,
        transform: [{ rotate }],
      }}
    />
  );
};

export const FullScreenLoader = ({ visible, message = 'Please wait…' }) => (
  <Modal transparent visible={visible} animationType="fade" statusBarTranslucent>
    <View style={s.overlay}>
      <View style={s.card}>
        <Loader size={50} thickness={4} />
        {!!message && <Text style={s.msg}>{message}</Text>}
      </View>
    </View>
  </Modal>
);

const s = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(10, 61, 98, 0.45)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingVertical: 26,
    paddingHorizontal: 34,
    alignItems: 'center',
    minWidth: 160,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.18,
    shadowRadius: 14,
  },
  msg: {
    marginTop: 14,
    fontSize: 13,
    fontWeight: '600',
    color: '#0A3D62',
  },
});