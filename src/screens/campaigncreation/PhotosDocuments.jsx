import React, { useState, useCallback, useEffect, useMemo, memo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  StatusBar,
  Image,
  Platform,
  ActionSheetIOS,
  ActivityIndicator,
  Modal,
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
import ResponseModal from '../../components/ResponseModal';

// ── API wiring ──────────────────────────────────────────────
import {
  useCreateCampaignStep3,
  useResubmitCampaignStep3,
} from '../../hooks/useCreateCampaign';

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

/**
 * SourceSheet — replaces the Android Alert-based source chooser.
 *
 * Alert was the only remaining non-ResponseModal dialog on this screen,
 * and it isn't an error/response at all — it's a picker. A small sheet
 * keeps ResponseModal reserved for actual API/validation outcomes.
 */
const SourceSheet = memo(({ visible, onClose, onSelect }) => (
  <Modal
    visible={visible}
    transparent
    animationType="slide"
    onRequestClose={onClose}
  >
    <TouchableOpacity style={ss.overlay} activeOpacity={1} onPress={onClose} />
    <View style={ss.sheet}>
      <View style={ss.handle} />
      <Text style={ss.title}>Select Image</Text>

      <TouchableOpacity
        style={ss.row}
        onPress={() => onSelect('camera')}
        activeOpacity={0.7}
      >
        <MCIcons name="camera-outline" size={sp(20)} color={P.teal} />
        <Text style={ss.rowTxt}>Take Photo</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={ss.row}
        onPress={() => onSelect('library')}
        activeOpacity={0.7}
      >
        <MCIcons name="image-outline" size={sp(20)} color={P.teal} />
        <Text style={ss.rowTxt}>Choose from Gallery</Text>
      </TouchableOpacity>

      <TouchableOpacity style={ss.cancel} onPress={onClose} activeOpacity={0.7}>
        <Text style={ss.cancelTxt}>Cancel</Text>
      </TouchableOpacity>
    </View>
  </Modal>
));

const ss = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.45)',
  },
  sheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: P.white,
    borderTopLeftRadius: sp(20),
    borderTopRightRadius: sp(20),
    paddingBottom: Platform.OS === 'android' ? sp(20) : sp(34),
  },
  handle: {
    width: sp(36),
    height: sp(4),
    borderRadius: sp(2),
    backgroundColor: P.border,
    alignSelf: 'center',
    marginTop: sp(10),
    marginBottom: sp(4),
  },
  title: {
    fontSize: sp(15),
    fontWeight: '700',
    color: P.dark,
    textAlign: 'center',
    paddingVertical: sp(12),
    borderBottomWidth: 1,
    borderBottomColor: P.border,
    marginHorizontal: sp(20),
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: sp(12),
    paddingVertical: sp(15),
    paddingHorizontal: sp(22),
  },
  rowTxt: { fontSize: sp(15), color: P.dark },
  cancel: {
    marginTop: sp(4),
    paddingVertical: sp(14),
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: P.border,
  },
  cancelTxt: { fontSize: sp(15), fontWeight: '600', color: P.gray },
});

// ════════════════════════════════════════════════════════════
//  Main Screen
//
//  Doubles as the fix-up screen for a CAMPAIGN_REJECTED notification
//  whose rejectedStep is 3. In that mode the CTA reads "Update" and
//  submits to /campaigns/resubmit/step-3.
//
//  No campaign-detail fetch happens here by design: the stored media
//  are remote URLs, which cannot be re-uploaded as multipart files, so
//  prefilling them would only create the illusion that the creator
//  doesn't need to re-pick. They re-select their files, exactly like
//  the CNIC re-upload flow.
// ════════════════════════════════════════════════════════════
const PhotosDocuments = ({ navigation, route }) => {
  const params = useMemo(() => route?.params || {}, [route?.params]);
  const campaignId = params.campaignId ? String(params.campaignId) : null;

  const isRejection = params.isRejection === true;
  const rejectionReason = params.rejectionReason || '';

  // ── State — PREFILLED from params so a remount (e.g. after
  //    editing an earlier step from Review and pressing Next again)
  //    doesn't wipe out previously picked photos/documents. ──────
  const [coverUri, setCoverUri] = useState(params.coverUri || null);
  const [coverFile, setCoverFile] = useState(
    params.coverFile ||
      (params.coverUri
        ? { uri: params.coverUri, name: 'cover.jpg', type: 'image/jpeg' }
        : null),
  );
  const [images, setImages] = useState(params.images || []);
  const [docs, setDocs] = useState(params.docs || []);
  const [errors, setErrors] = useState({});

  const [sourceSheet, setSourceSheet] = useState({
    visible: false,
    target: null,
  });

  const [responseModal, setResponseModal] = useState({
    visible: false,
    variant: 'error',
    title: '',
    message: '',
    code: '',
    closeAction: null,
  });

  const closeResponseModal = useCallback(() => {
    const action = responseModal.closeAction;
    setResponseModal(prev => ({ ...prev, visible: false, closeAction: null }));

    if (action === 'exit') {
      if (navigation.canGoBack()) navigation.goBack();
      else navigation.reset({ index: 0, routes: [{ name: 'MainTabs' }] });
    } else if (action === 'restart') {
      navigation.navigate('CreateCampaign');
    }
  }, [responseModal.closeAction, navigation]);

  const showResponse = useCallback(
    ({ variant = 'error', title, message, code = '', closeAction = null }) => {
      setResponseModal({
        visible: true,
        variant,
        title: title || (variant === 'success' ? 'Success' : 'Error'),
        message: message || 'Something went wrong. Please try again.',
        code: code ? String(code) : '',
        closeAction,
      });
    },
    [],
  );

  // campaignId is mandatory from Step 1 onward
  useEffect(() => {
    if (!campaignId) {
      showResponse({
        variant: 'error',
        title: 'Error',
        message: 'Missing campaign reference. Please start again from Step 1.',
        closeAction: 'restart',
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const submitStep3 = useCreateCampaignStep3();
  const resubmitStep3 = useResubmitCampaignStep3();
  const isSubmitting = submitStep3.isPending || resubmitStep3.isPending;

  // ── Image picker ────────────────────────────────────────
  const handleImageSelection = useCallback(async (source, target) => {
    const launch = source === 'camera' ? launchCamera : launchImageLibrary;
    try {
      const result = await launch(IMAGE_OPTIONS);
      if (result.didCancel || result.errorCode) return;
      const asset = result.assets?.[0];
      if (!asset?.uri) return;

      if (target === 'cover') {
        setCoverUri(asset.uri);
        setCoverFile({
          uri: asset.uri,
          name: asset.fileName || `cover_${Date.now()}.jpg`,
          type: asset.type || 'image/jpeg',
        });
        setErrors(prev => ({ ...prev, coverUri: undefined }));
      } else {
        setImages(prev =>
          prev.length < MAX_IMAGES
            ? [
                ...prev,
                {
                  id: Date.now().toString(),
                  uri: asset.uri,
                  name: asset.fileName || `image_${Date.now()}.jpg`,
                  type: asset.type || 'image/jpeg',
                },
              ]
            : prev,
        );
      }
    } catch (err) {
      showResponse({
        message: 'Could not open image picker. Please check your permissions.',
      });
    }
  }, [showResponse]);

  const openImagePicker = useCallback(
    target => {
      if (Platform.OS === 'ios') {
        ActionSheetIOS.showActionSheetWithOptions(
          {
            options: ['Cancel', 'Take Photo', 'Choose from Library'],
            cancelButtonIndex: 0,
          },
          buttonIndex => {
            if (buttonIndex === 1) handleImageSelection('camera', target);
            if (buttonIndex === 2) handleImageSelection('library', target);
          },
        );
      } else {
        setSourceSheet({ visible: true, target });
      }
    },
    [handleImageSelection],
  );

  const handleSourceSelect = useCallback(
    source => {
      const target = sourceSheet.target;
      setSourceSheet({ visible: false, target: null });
      // Let the sheet finish dismissing before the native picker opens,
      // otherwise Android can drop the picker intent entirely.
      setTimeout(() => handleImageSelection(source, target), 250);
    },
    [sourceSheet.target, handleImageSelection],
  );

  // ── Document picker — @react-native-documents/picker ────
  const pickDocument = useCallback(async () => {
    if (docs.length >= MAX_DOCS) {
      showResponse({
        title: 'Limit Reached',
        message: `You can upload a maximum of ${MAX_DOCS} documents.`,
      });
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
        showResponse({
          title: 'Duplicate File',
          message: 'This document has already been added.',
        });
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
      if (isErrorWithCode(err, errorCodes.IN_PROGRESS)) return;

      showResponse({
        message: 'Could not select document. Please try again.',
      });
    }
  }, [docs, showResponse]);

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

  const handleNext = useCallback(async () => {
    if (!validate()) return;
    if (isSubmitting) return;

    if (!campaignId) {
      showResponse({
        message: 'Missing campaign reference. Please start again from Step 1.',
        closeAction: 'restart',
      });
      return;
    }

    // ── Rejection fix-up: update this step only, then leave. ──
    // The other steps are already complete server-side, so continuing
    // into Review would just re-walk work the creator already did.
    if (isRejection) {
      try {
        const body = await resubmitStep3.mutateAsync({
          campaignId,
          coverPhoto: coverFile,
          additionalImages: images,
          campaignDocuments: docs,
        });

        if (body?.responseCode !== '000') {
          showResponse({
            title: 'Update Failed',
            message: body?.responseMessage || 'Could not update your campaign.',
            code: body?.responseCode || '',
          });
          return;
        }

        showResponse({
          variant: 'success',
          title: 'Campaign Updated',
          message:
            'Your campaign has been updated successfully and is now under review. You will be notified once it is approved.',
          closeAction: 'exit',
        });
      } catch (error) {
        const data = error?.response?.data;
        showResponse({
          title: 'Update Failed',
          message:
            data?.responseMessage ||
            error?.message ||
            'Could not update your campaign. Please try again.',
          code: data?.responseCode || '',
        });
      }
      return;
    }

    // ── Normal creation flow (unchanged) ──
    try {
      const response = await submitStep3.mutateAsync({
        campaignId,
        coverPhoto: coverFile,
        additionalImages: images,
        campaignDocuments: docs,
      });

      if (response?.responseCode && response.responseCode !== '000') {
        showResponse({
          message:
            response?.responseMessage ||
            'Could not upload files. Please try again.',
          code: response?.responseCode || '',
        });
        return;
      }

      navigation.navigate('ReviewSubmit', {
        ...params,
        campaignId,
        coverUri,
        // ✅ forwarded so a later edit round-trip back to this screen
        // can restore the actual re-uploadable file reference, not
        // just its display uri.
        coverFile,
        images,
        docs,
      });
    } catch (error) {
      const data = error?.response?.data;
      showResponse({
        message:
          data?.responseMessage ||
          'Could not upload your files. Please check your connection and try again.',
        code: data?.responseCode || '',
      });
    }
  }, [
    validate,
    isSubmitting,
    isRejection,
    campaignId,
    coverFile,
    coverUri,
    images,
    docs,
    navigation,
    params,
    submitStep3,
    resubmitStep3,
    showResponse,
  ]);

  // ── Render ───────────────────────────────────────────────
  return (
    <SafeAreaView style={s.safe} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor={P.white} />

      <StepHeader
        step={3}
        total={4}
        title={isRejection ? 'Update Campaign' : 'Create Campaign'}
        onLeft={() => navigation.goBack()}
      />
      <ProgressLine pct={75} />

      <ScrollView
        style={s.scroll}
        contentContainerStyle={s.content}
        showsVerticalScrollIndicator={false}
      >
        <Text style={s.pageTitle}>Photos & Documents</Text>

        {isRejection && !!rejectionReason && (
          <View style={s.rejectionBox}>
            <Text style={s.rejectionLabel}>REJECTION REASON</Text>
            <Text style={s.rejectionText}>{rejectionReason}</Text>
          </View>
        )}

        {isRejection && (
          <View style={s.noticeBox}>
            <MCIcons
              name="information-outline"
              size={sp(16)}
              color={P.teal}
              style={{ marginRight: sp(8), marginTop: sp(1) }}
            />
            <Text style={s.noticeTxt}>
              Please re-upload your cover photo and supporting documents to
              resubmit this campaign for review.
            </Text>
          </View>
        )}

        {/* ── Cover Photo ──────────────────────────────────── */}
        <FieldLabel text="Cover Photo" />
        <TouchableOpacity
          style={[
            s.uploadBox,
            coverUri && s.uploadBoxDone,
            errors.coverUri && s.uploadBoxError,
          ]}
          onPress={() => openImagePicker('cover')}
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
            <AddBtn onPress={() => openImagePicker('additional')} />
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
          style={[s.nextBtn, isSubmitting && s.nextBtnDisabled]}
          onPress={handleNext}
          activeOpacity={0.85}
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <ActivityIndicator size="small" color={P.white} />
          ) : (
            <>
              <Text style={s.nextTxt}>{isRejection ? 'Update' : 'Next'}</Text>
              <Icons
                name={isRejection ? 'check' : 'arrow-right'}
                size={sp(16)}
                color={P.white}
              />
            </>
          )}
        </TouchableOpacity>
      </View>

      <SourceSheet
        visible={sourceSheet.visible}
        onClose={() => setSourceSheet({ visible: false, target: null })}
        onSelect={handleSourceSelect}
      />

      <ResponseModal
        visible={responseModal.visible}
        variant={responseModal.variant}
        title={responseModal.title}
        message={responseModal.message}
        code={responseModal.code}
        onClose={closeResponseModal}
      />
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

  rejectionBox: {
    borderWidth: 1,
    borderColor: P.red,
    borderRadius: sp(10),
    backgroundColor: '#FEF2F2',
    padding: sp(12),
    marginBottom: sp(12),
  },
  rejectionLabel: {
    fontSize: sp(11),
    fontWeight: '700',
    color: P.red,
    marginBottom: sp(4),
  },
  rejectionText: { fontSize: sp(13), color: P.dark, lineHeight: sp(19) },

  noticeBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: P.tealLight,
    borderWidth: 1,
    borderColor: P.border,
    borderRadius: sp(10),
    padding: sp(12),
  },
  noticeTxt: { flex: 1, fontSize: sp(12.5), color: P.dark, lineHeight: sp(18) },

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
    backgroundColor: P.teal,
    gap: sp(6),
  },
  nextBtnDisabled: { opacity: 0.6 },
  nextTxt: { fontSize: sp(15), fontWeight: '700', color: P.white },
});