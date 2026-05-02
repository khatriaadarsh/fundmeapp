import React, { useState, useCallback, memo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  StatusBar,
  Image,
  Alert,
  Platform,
  ActionSheetIOS,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icons from 'react-native-vector-icons/Feather';
import MCIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { launchImageLibrary, launchCamera } from 'react-native-image-picker';

// ✅ @react-native-documents/picker — RN 0.73+ / 0.84 compatible
import {
  pick,
  types,
  isCancel,
  isErrorWithCode,
  errorCodes,
} from '@react-native-documents/picker';

// ── Shared Imports ──────────────────────────────────────────
import { StepHeader } from '../../components/shared/StepHeader';
import { P, sp, SW } from '../../theme/theme';

// ── Constants ───────────────────────────────────────────────
const THUMB_SIZE = Math.floor((SW - sp(18) * 2 - sp(8) * 3) / 4);
const MAX_IMAGES = 4;
const MAX_DOCS = 3;

const IMAGE_OPTIONS = {
  mediaType: 'photo',
  quality: 0.7,
  includeBase64: false,
};

// ── Helper: Format file size ────────────────────────────────
const formatSize = bytes => {
  if (!bytes) return 'Size unknown';
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

// ════════════════════════════════════════════════════════════
//  Sub-components
// ════════════════════════════════════════════════════════════

const FieldLabel = memo(({ text, optional = false }) => (
  <View style={s.labelRow}>
    <Text style={s.labelText}>{text}</Text>
    {!optional && <Text style={s.star}> *</Text>}
    {optional && <Text style={s.optionalText}> (Optional)</Text>}
  </View>
));

const ErrorMsg = memo(({ msg }) => {
  if (!msg) return null;
  return (
    <View style={s.errorRow}>
      <Icons
        name="alert-circle"
        size={sp(12)}
        color={P.red}
        style={{ marginRight: sp(4) }}
      />
      <Text style={s.errorText}>{msg}</Text>
    </View>
  );
});

const ProgressLine = memo(({ pct }) => (
  <View style={s.progressBg}>
    <View style={[s.progressFill, { width: `${pct}%` }]} />
  </View>
));

const ImgThumb = memo(({ uri, onRemove }) => (
  <View style={it.wrap}>
    <Image source={{ uri }} style={it.box} resizeMode="cover" />
    <TouchableOpacity
      style={it.badge}
      onPress={onRemove}
      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
    >
      <MCIcons name="close" size={sp(12)} color={P.white} />
    </TouchableOpacity>
  </View>
));

const it = StyleSheet.create({
  wrap: { position: 'relative', marginRight: sp(8) },
  box: { width: THUMB_SIZE, height: THUMB_SIZE, borderRadius: sp(10) },
  badge: {
    position: 'absolute',
    top: -sp(6),
    right: -sp(4),
    width: sp(20),
    height: sp(20),
    borderRadius: sp(10),
    backgroundColor: P.red,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: P.white,
  },
});

const AddBtn = memo(({ onPress, disabled }) => (
  <TouchableOpacity
    style={[ab.box, disabled && ab.disabled]}
    onPress={onPress}
    activeOpacity={0.7}
    disabled={disabled}
  >
    <Icons name="plus" size={sp(24)} color={P.light} />
  </TouchableOpacity>
));

const ab = StyleSheet.create({
  box: {
    width: THUMB_SIZE,
    height: THUMB_SIZE,
    borderRadius: sp(10),
    borderWidth: 1.5,
    borderColor: P.border,
    borderStyle: 'dashed',
    backgroundColor: P.bg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  disabled: { opacity: 0.5 },
});

const DocChip = memo(({ name, size, onRemove }) => {
  const ext = (name || '').split('.').pop().toLowerCase();
  const isPdf = ext === 'pdf';
  const isDocx = ext === 'doc' || ext === 'docx';
  const iconName = isPdf
    ? 'file-pdf-box'
    : isDocx
    ? 'file-word-box'
    : 'file-document-outline';
  const iconColor = isPdf ? P.red : isDocx ? '#2B579A' : P.gray;

  return (
    <View style={dc.wrap}>
      <MCIcons
        name={iconName}
        size={sp(28)}
        color={iconColor}
        style={{ marginRight: sp(10) }}
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
        <MCIcons name="close" size={sp(16)} color={P.light} />
      </TouchableOpacity>
    </View>
  );
});

const dc = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: P.white,
    borderWidth: 1,
    borderColor: P.border,
    borderRadius: sp(10),
    padding: sp(12),
    marginTop: sp(12),
  },
  info: { flex: 1, marginRight: sp(8) },
  name: {
    fontSize: sp(13),
    fontWeight: '600',
    color: P.dark,
    marginBottom: sp(2),
  },
  size: { fontSize: sp(11), color: P.gray },
  closeBtn: { padding: sp(4) },
});

// ════════════════════════════════════════════════════════════
//  Main Screen
// ════════════════════════════════════════════════════════════
const PhotosDocuments = ({ navigation, route }) => {
  const params = route?.params || {};

  const [coverUri, setCoverUri] = useState(null);
  const [images, setImages] = useState([]);
  const [docs, setDocs] = useState([]);
  const [errors, setErrors] = useState({});

  // ── Image picker ────────────────────────────────────────
  const showImagePicker = onSelect => {
    if (Platform.OS === 'ios') {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options: ['Cancel', 'Take Photo', 'Choose from Library'],
          cancelButtonIndex: 0,
        },
        buttonIndex => {
          if (buttonIndex === 1) onSelect('camera');
          if (buttonIndex === 2) onSelect('library');
        },
      );
    } else {
      Alert.alert('Select Image', 'Choose a source for your image', [
        { text: 'Camera', onPress: () => onSelect('camera') },
        { text: 'Gallery', onPress: () => onSelect('library') },
        { text: 'Cancel', style: 'cancel' },
      ]);
    }
  };

  const handleImageSelection = async (source, target) => {
    const launch = source === 'camera' ? launchCamera : launchImageLibrary;
    try {
      const result = await launch(IMAGE_OPTIONS);
      if (result.didCancel || result.errorCode) return;
      const asset = result.assets?.[0];
      if (!asset?.uri) return;

      if (target === 'cover') {
        setCoverUri(asset.uri);
        setErrors(prev => ({ ...prev, coverUri: undefined }));
      } else if (images.length < MAX_IMAGES) {
        setImages(prev => [
          ...prev,
          { id: Date.now().toString(), uri: asset.uri },
        ]);
      }
    } catch (err) {
      Alert.alert(
        'Error',
        'Could not open image picker. Please check your permissions.',
      );
    }
  };

  // ── Document picker — @react-native-documents/picker ────
  const pickDocument = useCallback(async () => {
    if (docs.length >= MAX_DOCS) {
      Alert.alert(
        'Limit Reached',
        `You can upload a maximum of ${MAX_DOCS} documents.`,
      );
      return;
    }

    try {
      // pick() returns an array; allowMultiSelection:false ensures only 1 file
      const [file] = await pick({
        type: [types.pdf, types.doc, types.docx],
        allowMultiSelection: false,
        copyTo: 'cachesDirectory', // stable readable URI on Android
      });

      // file: { uri, name, size, type, fileCopyUri, copyError }
      const fileUri = file.fileCopyUri || file.uri;
      const fileName = file.name || 'Document';

      // Duplicate check
      if (docs.some(d => d.name === fileName)) {
        Alert.alert('Duplicate File', 'This document has already been added.');
        return;
      }

      setDocs(prev => [
        ...prev,
        {
          id: Date.now().toString(),
          name: fileName,
          size: formatSize(file.size),
          uri: fileUri,
          type: file.type || 'application/octet-stream',
        },
      ]);
      setErrors(prev => ({ ...prev, docs: undefined }));
    } catch (err) {
      if (isCancel(err)) return; // user dismissed picker — not an error

      if (isErrorWithCode(err, errorCodes.IN_PROGRESS)) {
        console.warn('Document picker already open.');
        return;
      }

      console.error('Document pick error:', err);
      Alert.alert('Error', 'Could not select document. Please try again.');
    }
  }, [docs]);

  // ── Remove handlers ─────────────────────────────────────
  const removeImage = id => setImages(prev => prev.filter(i => i.id !== id));
  const removeDoc = id => setDocs(prev => prev.filter(d => d.id !== id));

  // ── Validation ──────────────────────────────────────────
  const validate = useCallback(() => {
    const e = {};
    if (!coverUri) e.coverUri = 'A cover photo is required for your campaign.';
    if (docs.length === 0)
      e.docs = 'At least one supporting document is required.';
    setErrors(e);
    return Object.keys(e).length === 0;
  }, [coverUri, docs]);

  const handleNext = () => {
    if (!validate()) return;
    navigation.navigate('ReviewSubmit', { ...params, coverUri, images, docs });
  };

  // ── Render ───────────────────────────────────────────────
  return (
    <SafeAreaView style={s.safe} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor={P.white} />

      <StepHeader
        step={3}
        total={4}
        title="Create Campaign"
        onLeft={() => navigation.goBack()}
      />
      <ProgressLine pct={75} />

      <ScrollView
        style={s.scroll}
        contentContainerStyle={s.content}
        showsVerticalScrollIndicator={false}
      >
        <Text style={s.pageTitle}>Photos & Documents</Text>

        {/* ── Cover Photo ──────────────────────────────────── */}
        <FieldLabel text="Cover Photo" />
        <TouchableOpacity
          style={[
            s.uploadBox,
            coverUri && s.uploadBoxDone,
            errors.coverUri && s.uploadBoxError,
          ]}
          onPress={() =>
            showImagePicker(src => handleImageSelection(src, 'cover'))
          }
          activeOpacity={0.8}
        >
          {coverUri ? (
            <>
              <Image
                source={{ uri: coverUri }}
                style={s.coverImg}
                resizeMode="cover"
              />
              <View style={s.coverOverlay}>
                <MCIcons
                  name="camera-retake-outline"
                  size={sp(20)}
                  color={P.white}
                />
                <Text style={s.coverChangeText}>Change Photo</Text>
              </View>
            </>
          ) : (
            <>
              <MCIcons
                name="cloud-upload-outline"
                size={sp(36)}
                color={P.light}
              />
              <Text style={s.uploadMainText}>Upload Cover Photo</Text>
              <Text style={s.uploadSubText}>JPG or PNG, up to 5MB</Text>
            </>
          )}
        </TouchableOpacity>
        <ErrorMsg msg={errors.coverUri} />

        {/* ── Additional Images ────────────────────────────── */}
        <FieldLabel text="Additional Images" optional />
        <View style={s.thumbsRow}>
          {images.map(img => (
            <ImgThumb
              key={img.id}
              uri={img.uri}
              onRemove={() => removeImage(img.id)}
            />
          ))}
          {images.length < MAX_IMAGES && (
            <AddBtn
              onPress={() =>
                showImagePicker(src => handleImageSelection(src, 'additional'))
              }
            />
          )}
        </View>

        {/* ── Supporting Documents ─────────────────────────── */}
        <FieldLabel text="Supporting Documents" />
        <TouchableOpacity
          style={[
            s.uploadBox,
            { paddingVertical: sp(20) },
            errors.docs && s.uploadBoxError,
          ]}
          onPress={pickDocument}
          activeOpacity={docs.length >= MAX_DOCS ? 1 : 0.8}
          disabled={docs.length >= MAX_DOCS}
        >
          <MCIcons
            name="file-upload-outline"
            size={sp(32)}
            color={docs.length >= MAX_DOCS ? P.border : P.light}
          />
          <Text
            style={[
              s.uploadMainText,
              docs.length >= MAX_DOCS && { color: P.light },
            ]}
          >
            {docs.length >= MAX_DOCS
              ? 'Maximum files reached'
              : 'Upload PDF or DOCX'}
          </Text>
          <Text style={s.uploadSubText}>
            {docs.length >= MAX_DOCS
              ? ''
              : `${docs.length}/${MAX_DOCS} files added`}
          </Text>
        </TouchableOpacity>
        <ErrorMsg msg={errors.docs} />

        {docs.map(doc => (
          <DocChip
            key={doc.id}
            name={doc.name}
            size={doc.size}
            onRemove={() => removeDoc(doc.id)}
          />
        ))}

        <View style={{ height: sp(24) }} />
      </ScrollView>

      {/* ── Footer ─────────────────────────────────────────── */}
      <View style={s.footer}>
        <TouchableOpacity
          style={s.nextBtn}
          onPress={handleNext}
          activeOpacity={0.85}
        >
          <Text style={s.nextTxt}>Next</Text>
          <Icons name="arrow-right" size={sp(16)} color={P.white} />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default PhotosDocuments;

// ── Styles ───────────────────────────────────────────────────
const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: P.bg },
  scroll: { flex: 1 },
  content: {
    paddingHorizontal: sp(18),
    paddingTop: sp(20),
    paddingBottom: sp(8),
  },
  pageTitle: {
    fontSize: sp(20),
    fontWeight: '800',
    color: P.dark,
    marginBottom: sp(20),
  },

  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: sp(8),
    marginTop: sp(20),
  },
  labelText: { fontSize: sp(13), fontWeight: '600', color: P.dark },
  star: { color: P.red, fontWeight: '700' },
  optionalText: { fontSize: sp(12), color: P.gray, fontWeight: '500' },

  errorRow: { flexDirection: 'row', alignItems: 'center', marginTop: sp(6) },
  errorText: { fontSize: sp(11), color: P.red, flex: 1 },

  progressBg: { height: 3, backgroundColor: P.border },
  progressFill: { height: 3, backgroundColor: P.teal },

  uploadBox: {
    borderWidth: 1.5,
    borderColor: P.border,
    borderStyle: 'dashed',
    borderRadius: sp(10),
    backgroundColor: P.searchBg,
    paddingVertical: sp(26),
    alignItems: 'center',
    justifyContent: 'center',
    gap: sp(6),
    overflow: 'hidden',
  },
  uploadBoxDone: {
    borderColor: P.teal,
    backgroundColor: P.white,
    paddingVertical: 0,
    height: sp(160),
  },
  uploadBoxError: { borderColor: P.red },
  uploadMainText: { fontSize: sp(13), fontWeight: '600', color: P.gray },
  uploadSubText: { fontSize: sp(12), color: P.light },

  coverImg: { width: '100%', height: '100%' },
  coverOverlay: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.35)',
    alignItems: 'center',
    justifyContent: 'center',
    gap: sp(6),
  },
  coverChangeText: { fontSize: sp(13), color: P.white, fontWeight: '700' },

  thumbsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    marginTop: sp(4),
  },

  footer: {
    flexDirection: 'row',
    paddingHorizontal: sp(18),
    paddingTop: sp(15),
    paddingBottom: Platform.OS === 'android' ? sp(22) : sp(10),
    backgroundColor: P.white,
    borderTopWidth: 1,
    borderTopColor: P.border,
    gap: sp(12),
  },
  backBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: sp(50),
    borderRadius: sp(10),
    borderWidth: 1.5,
    borderColor: P.darkOcean,
    backgroundColor: P.white,
    gap: sp(6),
  },
  backTxt: { fontSize: sp(15), fontWeight: '700', color: P.darkOcean },
  nextBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: sp(50),
    borderRadius: sp(10),
    backgroundColor: P.darkOcean,
    gap: sp(6),
  },
  nextTxt: { fontSize: sp(15), fontWeight: '700', color: P.white },
});
