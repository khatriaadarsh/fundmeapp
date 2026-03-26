// src/screens/campaign/PhotosDocuments.jsx
// ─────────────────────────────────────────────────────────────
//  Photos & Documents — Step 3 of 4
//  FundMe App  ·  React Native CLI  ·  100% responsive
//
//  ✅ Real photo picker   → react-native-image-picker
//  ✅ Real document picker → react-native-document-picker
//
//  Install:
//    npm install react-native-image-picker
//    npm install react-native-document-picker
//    cd ios && pod install
//
//  Android — add to AndroidManifest.xml inside <manifest>:
//    <uses-permission android:name="android.permission.READ_MEDIA_IMAGES"/>
//    <uses-permission android:name="android.permission.READ_EXTERNAL_STORAGE"/>
//    <uses-permission android:name="android.permission.WRITE_EXTERNAL_STORAGE"/>
//
//  iOS — add to Info.plist:
//    NSPhotoLibraryUsageDescription → "FundMe needs access to your photos"
//    NSCameraUsageDescription       → "FundMe needs camera access"
// ─────────────────────────────────────────────────────────────

import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  StatusBar,
  Animated,
  Dimensions,
  Image,
  Alert,
  Platform,
  ActionSheetIOS,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { launchImageLibrary, launchCamera } from 'react-native-image-picker';
import DocumentPicker from 'react-native-document-picker';
import { C, StepHeader, BtnRow } from './Shared';

const { width } = Dimensions.get('window');
const THUMB_SIZE = Math.floor((width - 36 - 8 * 4) / 5);

// ── Image options config ───────────────────────────────────
const IMAGE_OPTIONS = {
  mediaType: 'photo',
  quality: 0.8,
  includeBase64: false,
  selectionLimit: 1,
};

// ── Uploaded image thumbnail ───────────────────────────────
const ImgThumb = ({ uri, onRemove }) => (
  <View style={{ position: 'relative', marginRight: 8 }}>
    <Image
      source={{ uri }}
      style={[it.box, { width: THUMB_SIZE, height: THUMB_SIZE }]}
      resizeMode="cover"
    />
    <TouchableOpacity
      style={it.badge}
      onPress={onRemove}
      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
    >
      <Icon name="close" size={9} color="#fff" />
    </TouchableOpacity>
  </View>
);

const it = StyleSheet.create({
  box: { borderRadius: 10 },
  badge: {
    position: 'absolute',
    top: -5,
    right: -5,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: C.red,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

// ── Add image button ───────────────────────────────────────
const AddBtn = ({ onPress }) => (
  <TouchableOpacity
    style={[ab.box, { width: THUMB_SIZE, height: THUMB_SIZE }]}
    onPress={onPress}
    activeOpacity={0.7}
  >
    <Icon name="plus" size={20} color={C.textLight} />
  </TouchableOpacity>
);
const ab = StyleSheet.create({
  box: {
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: C.border,
    borderStyle: 'dashed',
    backgroundColor: '#FAFAFA',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
});

// ── Uploaded document chip ─────────────────────────────────
const DocChip = ({ name, size, onRemove }) => (
  <View style={dc.wrap}>
    <Icon
      name="file-pdf-box"
      size={24}
      color="#DC2626"
      style={{ marginRight: 10 }}
    />
    <View style={dc.info}>
      <Text style={dc.name} numberOfLines={1}>
        {name}
      </Text>
      <Text style={dc.size}>{size}</Text>
    </View>
    <TouchableOpacity
      onPress={onRemove}
      style={dc.closeBtn}
      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
    >
      <Icon name="close" size={15} color={C.textLight} />
    </TouchableOpacity>
  </View>
);
const dc = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: C.white,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 10,
    padding: 12,
    marginTop: 10,
  },
  info: { flex: 1 },
  name: { fontSize: 13, fontWeight: '600', color: C.dark, marginBottom: 2 },
  size: { fontSize: 11, color: C.textLight },
  closeBtn: { paddingLeft: 8 },
});

// ── Helper: file size string ───────────────────────────────
const formatSize = bytes => {
  if (!bytes) return '· Uploaded';
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB · Uploaded`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB · Uploaded`;
};

// ── Main Screen ────────────────────────────────────────────
const PhotosDocuments = ({ navigation, route }) => {
  const params = route?.params || {};

  const [coverUri, setCoverUri] = useState(null); // string | null
  const [images, setImages] = useState([]); // [{id, uri}]
  const [docs, setDocs] = useState([]); // [{id, name, size}]

  const fadeAnim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [fadeAnim]);

  // ── Pick cover photo ─────────────────────────────────────
  const pickCoverPhoto = () => {
    if (Platform.OS === 'ios') {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options: ['Cancel', 'Take Photo', 'Choose from Library'],
          cancelButtonIndex: 0,
        },
        buttonIndex => {
          if (buttonIndex === 1) openCamera('cover');
          if (buttonIndex === 2) openLibrary('cover');
        },
      );
    } else {
      // Android — show Alert with two options
      Alert.alert('Cover Photo', 'Select source', [
        { text: 'Camera', onPress: () => openCamera('cover') },
        { text: 'Gallery', onPress: () => openLibrary('cover') },
        { text: 'Cancel', style: 'cancel' },
      ]);
    }
  };

  // ── Pick additional image ────────────────────────────────
  const pickAdditionalImage = () => {
    if (Platform.OS === 'ios') {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options: ['Cancel', 'Take Photo', 'Choose from Library'],
          cancelButtonIndex: 0,
        },
        buttonIndex => {
          if (buttonIndex === 1) openCamera('additional');
          if (buttonIndex === 2) openLibrary('additional');
        },
      );
    } else {
      Alert.alert('Add Image', 'Select source', [
        { text: 'Camera', onPress: () => openCamera('additional') },
        { text: 'Gallery', onPress: () => openLibrary('additional') },
        { text: 'Cancel', style: 'cancel' },
      ]);
    }
  };

  // ── Open camera ──────────────────────────────────────────
  const openCamera = async target => {
    try {
      const result = await launchCamera({
        ...IMAGE_OPTIONS,
        saveToPhotos: false,
      });
      if (result.didCancel || result.errorCode) return;
      const asset = result.assets?.[0];
      if (!asset?.uri) return;
      if (target === 'cover') {
        setCoverUri(asset.uri);
      } else {
        setImages(prev => [
          ...prev,
          { id: Date.now().toString(), uri: asset.uri },
        ]);
      }
    } catch (err) {
      Alert.alert(
        'Error',
        'Could not open camera. Please check camera permissions.',
      );
    }
  };

  // ── Open gallery ─────────────────────────────────────────
  const openLibrary = async target => {
    try {
      const result = await launchImageLibrary(IMAGE_OPTIONS);
      if (result.didCancel || result.errorCode) return;
      const asset = result.assets?.[0];
      if (!asset?.uri) return;
      if (target === 'cover') {
        setCoverUri(asset.uri);
      } else {
        setImages(prev => [
          ...prev,
          { id: Date.now().toString(), uri: asset.uri },
        ]);
      }
    } catch (err) {
      Alert.alert(
        'Error',
        'Could not open gallery. Please check photo permissions.',
      );
    }
  };

  // ── Remove image ─────────────────────────────────────────
  const removeImage = id => setImages(prev => prev.filter(i => i.id !== id));

  // ── Pick document (PDF / DOCX) ───────────────────────────
  const pickDocument = async () => {
    try {
      const results = await DocumentPicker.pick({
        type: [
          DocumentPicker.types.pdf,
          DocumentPicker.types.docx,
          DocumentPicker.types.doc,
        ],
        allowMultiSelection: false,
      });

      const file = results[0];
      if (!file) return;

      setDocs(prev => [
        ...prev,
        {
          id: Date.now().toString(),
          name: file.name || 'Document',
          size: formatSize(file.size),
          uri: file.uri,
          type: file.type,
        },
      ]);
    } catch (err) {
      if (DocumentPicker.isCancel(err)) {
        // user pressed back — do nothing
      } else {
        Alert.alert(
          'Error',
          'Could not open document picker. Please try again.',
        );
      }
    }
  };

  const removeDoc = id => setDocs(prev => prev.filter(d => d.id !== id));

  const handleNext = () =>
    navigation.navigate('ReviewSubmit', { ...params, images, docs, coverUri });

  return (
    <SafeAreaView style={s.safe}>
      <StatusBar barStyle="dark-content" backgroundColor={C.white} />

      <StepHeader
        step={3}
        total={4}
        title="Create Campaign"
        onLeft={() => navigation.goBack()}
      />

      <Animated.View style={[s.flex, { opacity: fadeAnim }]}>
        <ScrollView
          style={s.scroll}
          contentContainerStyle={s.content}
          showsVerticalScrollIndicator={false}
        >
          <Text style={s.pageTitle}>Photos & Documents</Text>

          {/* ── Cover Photo ── */}
          <Text style={s.label}>Cover Photo</Text>
          <TouchableOpacity
            style={[s.uploadArea, coverUri && s.uploadAreaDone]}
            onPress={pickCoverPhoto}
            activeOpacity={0.8}
          >
            {coverUri ? (
              // Show actual selected image as cover preview
              <>
                <Image
                  source={{ uri: coverUri }}
                  style={s.coverPreviewImg}
                  resizeMode="cover"
                />
                <View style={s.coverOverlay}>
                  <Icon name="camera-outline" size={22} color="#fff" />
                  <Text style={s.coverChangeTxt}>Tap to change</Text>
                </View>
              </>
            ) : (
              // Empty state
              <>
                <Icon
                  name="cloud-upload-outline"
                  size={36}
                  color={C.textLight}
                />
                <Text style={s.uploadMainTxt}>Upload Cover Photo</Text>
                <Text style={s.uploadSubTxt}>JPG, PNG up to 5MB</Text>
              </>
            )}
          </TouchableOpacity>

          {/* ── Additional Images ── */}
          <Text style={[s.label, { marginTop: 20 }]}>
            Additional Images (Optional)
          </Text>
          <View style={s.imagesRow}>
            {/* Real image thumbnails */}
            {images.map(img => (
              <ImgThumb
                key={img.id}
                uri={img.uri}
                onRemove={() => removeImage(img.id)}
              />
            ))}
            {/* Two add buttons — tapping opens picker */}
            <AddBtn onPress={pickAdditionalImage} />
            <AddBtn onPress={pickAdditionalImage} />
          </View>

          {/* ── Supporting Documents ── */}
          <Text style={[s.label, { marginTop: 20 }]}>Supporting Documents</Text>
          <TouchableOpacity
            style={s.uploadArea}
            onPress={pickDocument}
            activeOpacity={0.8}
          >
            <Icon name="file-upload-outline" size={32} color={C.textLight} />
            <Text style={s.uploadMainTxt}>Upload PDF or DOCX</Text>
          </TouchableOpacity>

          {/* Uploaded document chips */}
          {docs.map(doc => (
            <DocChip
              key={doc.id}
              name={doc.name}
              size={doc.size}
              onRemove={() => removeDoc(doc.id)}
            />
          ))}

          <View style={{ height: 16 }} />
        </ScrollView>

        <BtnRow onBack={() => navigation.goBack()} onNext={handleNext} />
      </Animated.View>
    </SafeAreaView>
  );
};

export default PhotosDocuments;

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.bg },
  flex: { flex: 1 },
  scroll: { flex: 1 },
  content: { paddingHorizontal: 18, paddingTop: 22, paddingBottom: 8 },
  pageTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: C.dark,
    marginBottom: 20,
  },
  label: { fontSize: 13, fontWeight: '600', color: C.dark, marginBottom: 8 },

  // Upload area — dashed border
  uploadArea: {
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
    borderStyle: 'dashed',
    borderRadius: 10,
    backgroundColor: '#F8FAFC',
    paddingVertical: 26,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    overflow: 'hidden',
  },
  uploadAreaDone: {
    borderColor: C.teal,
    backgroundColor: 'rgba(0,180,204,0.04)',
    paddingVertical: 0, // let image fill the area
    height: 160,
  },
  uploadMainTxt: { fontSize: 13, fontWeight: '600', color: C.textGray },
  uploadSubTxt: { fontSize: 12, color: C.textLight },

  // Cover photo preview
  coverPreviewImg: {
    width: '100%',
    height: '100%',
    borderRadius: 10,
  },
  coverOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.35)',
    paddingVertical: 8,
    alignItems: 'center',
    gap: 2,
  },
  coverChangeTxt: { fontSize: 11, color: '#fff', fontWeight: '600' },

  // Additional images row
  imagesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'nowrap',
  },
});
