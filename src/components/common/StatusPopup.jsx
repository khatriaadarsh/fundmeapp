// src/components/common/StatusPopup.jsx
import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  Animated,
  Easing,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/Feather';

const { width: SW } = Dimensions.get('window');
const sp = (n) => Math.round((SW / 375) * n);

const VARIANTS = {
  warning: {
    gradient: ['#F59E0B', '#F97316'],
    iconBg:   '#FEF3C7',
    iconColor:'#F59E0B',
    icon:     'alert-triangle',
  },
  error: {
    gradient: ['#EF4444', '#DC2626'],
    iconBg:   '#FEE2E2',
    iconColor:'#EF4444',
    icon:     'x-circle',
  },
  success: {
    gradient: ['#10B981', '#059669'],
    iconBg:   '#D1FAE5',
    iconColor:'#10B981',
    icon:     'check-circle',
  },
  info: {
    gradient: ['#0A3D62', '#15AABF'],
    iconBg:   'rgba(21, 170, 191, 0.12)',
    iconColor:'#15AABF',
    icon:     'info',
  },
};

const StatusPopup = ({
  visible,
  onClose,
  title    = 'Notice',
  message  = '',
  code,
  variant  = 'info',         // 'success' | 'error' | 'warning' | 'info'
  buttonText = 'OK',
  onButtonPress,
}) => {
  const scaleAnim = useRef(new Animated.Value(0.7)).current;
  const fadeAnim  = useRef(new Animated.Value(0)).current;
  const iconAnim  = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 65,
          friction: 8,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 220,
          useNativeDriver: true,
        }),
        Animated.spring(iconAnim, {
          toValue: 1,
          tension: 50,
          friction: 6,
          delay: 100,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      scaleAnim.setValue(0.7);
      fadeAnim.setValue(0);
      iconAnim.setValue(0);
    }
  }, [visible, scaleAnim, fadeAnim, iconAnim]);

  const cfg = VARIANTS[variant] || VARIANTS.info;

  const handlePress = () => {
    if (onButtonPress) onButtonPress();
    else if (onClose) onClose();
  };

  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <Animated.View style={[s.backdrop, { opacity: fadeAnim }]}>
        <Animated.View
          style={[
            s.card,
            { transform: [{ scale: scaleAnim }] },
          ]}
        >
          {/* Top gradient strip */}
          <LinearGradient
            colors={cfg.gradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={s.topStrip}
          />

          {/* Icon */}
          <Animated.View
            style={[
              s.iconWrap,
              {
                backgroundColor: cfg.iconBg,
                transform: [
                  { scale: iconAnim },
                  {
                    rotate: iconAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: ['-30deg', '0deg'],
                    }),
                  },
                ],
              },
            ]}
          >
            <Icon name={cfg.icon} size={sp(36)} color={cfg.iconColor} />
          </Animated.View>

          <Text style={s.title}>{title}</Text>

          {!!message && <Text style={s.message}>{message}</Text>}

          {!!code && (
            <View style={s.codeWrap}>
              <Text style={s.codeLabel}>Code:</Text>
              <Text style={s.codeValue}>{code}</Text>
            </View>
          )}

          <TouchableOpacity
            activeOpacity={0.85}
            onPress={handlePress}
            style={s.btnWrap}
          >
            <LinearGradient
              colors={cfg.gradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={s.btn}
            >
              <Text style={s.btnText}>{buttonText}</Text>
            </LinearGradient>
          </TouchableOpacity>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
};

export default StatusPopup;

const s = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.55)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: sp(28),
  },
  card: {
    width: '100%',
    maxWidth: sp(360),
    backgroundColor: '#FFFFFF',
    borderRadius: sp(20),
    paddingTop: sp(28),
    paddingBottom: sp(22),
    paddingHorizontal: sp(22),
    alignItems: 'center',
    overflow: 'hidden',
    elevation: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.22,
    shadowRadius: 22,
  },
  topStrip: {
    position: 'absolute',
    top: 0, left: 0, right: 0,
    height: sp(6),
  },
  iconWrap: {
    width: sp(72),
    height: sp(72),
    borderRadius: sp(36),
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: sp(18),
    marginTop: sp(6),
  },
  title: {
    fontSize: sp(18),
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: sp(8),
    textAlign: 'center',
  },
  message: {
    fontSize: sp(14),
    color: '#475569',
    textAlign: 'center',
    lineHeight: sp(20),
    marginBottom: sp(14),
  },
  codeWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    paddingHorizontal: sp(12),
    paddingVertical: sp(6),
    borderRadius: sp(8),
    marginBottom: sp(18),
  },
  codeLabel: {
    fontSize: sp(11),
    color: '#64748B',
    fontWeight: '600',
    marginRight: sp(6),
  },
  codeValue: {
    fontSize: sp(12),
    color: '#0F172A',
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  btnWrap: { width: '100%', marginTop: sp(4) },
  btn: {
    width: '100%',
    paddingVertical: sp(14),
    borderRadius: sp(12),
    alignItems: 'center',
  },
  btnText: {
    color: '#FFFFFF',
    fontSize: sp(15),
    fontWeight: '800',
    letterSpacing: 0.3,
  },
});