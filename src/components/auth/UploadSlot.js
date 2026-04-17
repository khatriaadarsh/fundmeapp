import React, { memo, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { COLORS, SPACING, TYPOGRAPHY, scale } from '../../theme';
import { launchImageLibrary } from 'react-native-image-picker';

const UploadSlot = memo(({ label, uri, onPick, loading = false, mandatory = true }) => {
  
  const handlePick = useCallback(() => {
    const options = {
      mediaType: 'photo',
      quality: 0.8,
      maxWidth: 1920,
      maxHeight: 1080,
      includeBase64: false,
      selectionLimit: 1,
      // presentationStyle: 'fullScreen', // iOS only
    };

    launchImageLibrary(options, (response) => {
      console.log('Image Picker Response:', response);

      if (response.didCancel) {
        console.log('User cancelled image picker');
        return;
      }

      if (response.errorCode) {
        console.error('ImagePicker Error:', response.errorCode);
        console.error('Error Message:', response.errorMessage);
        
        if (response.errorCode === 'permission') {
          Alert.alert(
            'Permission Required',
            'Please allow access to your photos in device settings',
            [
              { text: 'Cancel', style: 'cancel' },
              { 
                text: 'Open Settings', 
                onPress: () => {
                  // You can add Linking to open settings if needed
                  console.log('Open settings');
                }
              }
            ]
          );
        } else {
          Alert.alert('Error', response.errorMessage || 'Failed to pick image');
        }
        return;
      }

      if (response.assets && response.assets.length > 0) {
        const selectedImage = response.assets[0];
        console.log('✅ Selected Image URI:', selectedImage.uri);
        
        // Validate file size (optional)
        if (selectedImage.fileSize && selectedImage.fileSize > 5 * 1024 * 1024) {
          Alert.alert('File Too Large', 'Please select an image smaller than 5MB');
          return;
        }
        
        onPick(selectedImage.uri);
      } else {
        console.warn('No image selected');
      }
    });
  }, [onPick]);

  return (
    <View style={styles.container}>
      <View style={styles.labelRow}>
        <Text style={styles.label}>{label}</Text>
        {mandatory && <Text style={styles.mandatory}>*</Text>}
      </View>

      {!uri ? (
        <TouchableOpacity
          style={styles.uploadBox}
          onPress={handlePick}
          activeOpacity={0.75}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator size="large" color={COLORS.primary} />
          ) : (
            <>
              <Text style={styles.cloudIcon}>☁️</Text>
              <Text style={styles.uploadText}>Tap to Upload</Text>
              <Text style={styles.uploadHint}>JPG or PNG, max 5 MB</Text>
            </>
          )}
        </TouchableOpacity>
      ) : (
        <View style={styles.previewBox}>
          <Image 
            source={{ uri }} 
            style={styles.previewImage} 
            resizeMode="cover"
            onError={(error) => {
              console.error('Image load error:', error.nativeEvent.error);
            }}
          />

          {/* Success Badge */}
          <View style={styles.successBadge}>
            <Text style={styles.successIcon}>✓</Text>
          </View>

          {/* Change Button */}
          <TouchableOpacity
            style={styles.changeButton}
            onPress={handlePick}
            activeOpacity={0.75}
          >
            <Text style={styles.changeText}>Change Photo</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    marginBottom: SPACING.lg,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
    marginLeft: SPACING.xs,
  },
  label: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontFamily: TYPOGRAPHY.fontFamily.semiBold,
    color: COLORS.gray700,
  },
  mandatory: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontFamily: TYPOGRAPHY.fontFamily.bold,
    color: COLORS.error,
    marginLeft: SPACING.xs,
  },
  uploadBox: {
    height: scale(112),
    backgroundColor: '#E9EDEF',
    borderRadius: SPACING.borderRadius,
    borderWidth: SPACING.borderWidth,
    borderColor: COLORS.gray300,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cloudIcon: {
    fontSize: scale(28),
    marginBottom: SPACING.gapSm,
  },
  uploadText: {
    fontSize: TYPOGRAPHY.fontSize.base,
    fontFamily: TYPOGRAPHY.fontFamily.bold,
    color: COLORS.textSecondary,
  },
  uploadHint: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    fontFamily: TYPOGRAPHY.fontFamily.regular,
    color: COLORS.textTertiary,
    marginTop: SPACING.xs,
  },
  previewBox: {
    height: scale(140),
    borderRadius: SPACING.borderRadius,
    borderWidth: 2,
    borderColor: COLORS.success,
    backgroundColor: '#F0FDFF',
    overflow: 'hidden',
    position: 'relative',
  },
  previewImage: {
    width: '100%',
    height: '100%',
  },
  successBadge: {
    position: 'absolute',
    top: SPACING.sm,
    right: SPACING.sm,
    width: scale(26),
    height: scale(26),
    borderRadius: scale(13),
    backgroundColor: COLORS.success,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowColor: COLORS.success,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  successIcon: {
    color: COLORS.white,
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontFamily: TYPOGRAPHY.fontFamily.bold,
  },
  changeButton: {
    position: 'absolute',
    bottom: SPACING.sm,
    alignSelf: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.gapSm,
    borderRadius: SPACING.borderRadiusSm,
  },
  changeText: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    fontFamily: TYPOGRAPHY.fontFamily.semiBold,
    color: COLORS.white,
  },
});

export default UploadSlot;