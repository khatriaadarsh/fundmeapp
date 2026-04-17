import React, { memo, useCallback } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  Image, 
  StyleSheet,
  Alert,
} from 'react-native';
import { COLORS, SPACING, TYPOGRAPHY, scale } from '../../theme';
import { launchImageLibrary } from 'react-native-image-picker';

const PhotoPicker = memo(({ uri, onPick }) => {
  
  const handlePick = useCallback(() => {
    const options = {
      mediaType: 'photo',
      quality: 0.8,
      maxWidth: 800,
      maxHeight: 800,
      includeBase64: false,
      selectionLimit: 1,
    };

    launchImageLibrary(options, (response) => {
      console.log('Photo Picker Response:', response);

      if (response.didCancel) {
        console.log('User cancelled photo picker');
        return;
      }

      if (response.errorCode) {
        console.error('Photo Picker Error:', response.errorCode);
        Alert.alert('Error', response.errorMessage || 'Failed to pick photo');
        return;
      }

      if (response.assets && response.assets.length > 0) {
        const selectedPhoto = response.assets[0];
        console.log('Selected Photo URI:', selectedPhoto.uri);
        onPick(selectedPhoto.uri);
      }
    });
  }, [onPick]);

  return (
    <View style={styles.container}>
      <View style={styles.circleWrapper}>
        <TouchableOpacity
          style={styles.circle}
          onPress={handlePick}
          activeOpacity={0.8}
        >
          {uri ? (
            <Image source={{ uri }} style={styles.image} resizeMode="cover" />
          ) : (
            <View style={styles.cameraIcon}>
              <View style={styles.cameraBody}>
                <View style={styles.cameraLens} />
              </View>
            </View>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.badge}
          onPress={handlePick}
          activeOpacity={0.8}
        >
          <Text style={styles.badgeText}>+</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.label}>Add Photo</Text>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginBottom: SPACING.xxl,
  },
  circleWrapper: {
    width: scale(100),
    height: scale(100),
    position: 'relative',
  },
  circle: {
    width: scale(94),
    height: scale(94),
    borderRadius: scale(47),
    borderWidth: 2,
    borderColor: COLORS.primary,
    borderStyle: 'dashed',
    backgroundColor: COLORS.tealTint,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  cameraIcon: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  cameraBody: {
    width: scale(32),
    height: scale(26),
    borderRadius: scale(4),
    borderWidth: 2,
    borderColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cameraLens: {
    width: scale(14),
    height: scale(14),
    borderRadius: scale(7),
    borderWidth: 2,
    borderColor: COLORS.primary,
  },
  badge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: scale(28),
    height: scale(28),
    borderRadius: scale(14),
    backgroundColor: COLORS.primary,
    borderWidth: 2,
    borderColor: COLORS.background,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 5,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  badgeText: {
    color: COLORS.white,
    fontSize: TYPOGRAPHY.fontSize.md,
    fontFamily: TYPOGRAPHY.fontFamily.extraBold,
    lineHeight: TYPOGRAPHY.fontSize.md * 1.2,
  },
  label: {
    marginTop: SPACING.sm,
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontFamily: TYPOGRAPHY.fontFamily.semiBold,
    color: COLORS.primary,
  },
});

export default PhotoPicker;