// src/screens/campaign/PhotosDocuments.jsx

import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  StatusBar,
  Animated,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { launchImageLibrary } from 'react-native-image-picker';
import DocumentPicker from 'react-native-document-picker';
import { C, rs, vs, ms, NavHeader, FieldLabel, DualButtons } from './Shared';

// ── Image Thumbnail ────────────────────────────────────────
const ImgThumb = ({ uri, onRemove }) => (
  <View style={th.wrap}>
    <Image source={{ uri }} style={th.image} />
    <TouchableOpacity style={th.badge} onPress={onRemove}>
      <Icon name="close" size={ms(10)} color={C.white} />
    </TouchableOpacity>
  </View>
);

const th = StyleSheet.create({
  wrap: { position: 'relative', marginRight: rs(8), marginBottom: rs(8) },
  image: {
    width: rs(66),
    height: rs(66),
    borderRadius: rs(10),
  },
  badge: {
    position: 'absolute',
    top: -rs(4),
    right: -rs(4),
    width: rs(18),
    height: rs(18),
    borderRadius: rs(9),
    backgroundColor: C.red,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

// ── Add Image Button ───────────────────────────────────────
const AddImgBtn = ({ onPress }) => (
  <TouchableOpacity style={ab.btn} onPress={onPress}>
    <Icon name="plus" size={ms(20)} color={C.light} />
  </TouchableOpacity>
);

const ab = StyleSheet.create({
  btn: {
    width: rs(66),
    height: rs(66),
    borderRadius: rs(10),
    borderWidth: 1.5,
    borderColor: C.border,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: rs(8),
    marginBottom: rs(8),
  },
});

// ── Document Chip ──────────────────────────────────────────
const DocChip = ({ name, size, onRemove }) => (
  <View style={dc.wrap}>
    <Icon name="file-pdf-box" size={ms(22)} color={C.pdfRed} />
    <View style={dc.info}>
      <Text style={dc.name} numberOfLines={1}>
        {name}
      </Text>
      <Text style={dc.size}>{size}</Text>
    </View>
    <TouchableOpacity onPress={onRemove}>
      <Icon name="close" size={ms(16)} color={C.light} />
    </TouchableOpacity>
  </View>
);

const dc = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: rs(10),
    padding: rs(12),
    marginTop: vs(10),
  },
  info: { flex: 1, marginLeft: rs(10) },
  name: { fontSize: ms(13), fontWeight: '600', color: C.dark },
  size: { fontSize: ms(11), color: C.light },
});

// ── Upload Area ────────────────────────────────────────────
const UploadArea = ({ onPress, uploaded, text }) => (
  <TouchableOpacity
    style={[ua.wrap, uploaded && ua.uploaded]}
    onPress={onPress}
  >
    <Icon
      name={uploaded ? 'check-circle-outline' : 'cloud-upload-outline'}
      size={ms(32)}
      color={uploaded ? C.teal : C.light}
    />
    <Text style={[ua.text, uploaded && { color: C.teal }]}>{text}</Text>
  </TouchableOpacity>
);

const ua = StyleSheet.create({
  wrap: {
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: '#CBD5E1',
    borderRadius: rs(10),
    paddingVertical: vs(24),
    alignItems: 'center',
  },
  uploaded: {
    borderColor: C.teal,
    backgroundColor: 'rgba(0,180,204,0.05)',
  },
  text: { marginTop: vs(6), color: C.gray, fontWeight: '600' },
});

// ── Screen ─────────────────────────────────────────────────
const PhotosDocuments = ({ navigation, route }) => {
  const params = route?.params || {};

  const [coverPhoto, setCoverPhoto] = useState(null);
  const [imgs, setImgs] = useState([]);
  const [docs, setDocs] = useState([]);

  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [fadeAnim]);

  // ── Pick Cover Photo ─────────────────────────────────────
  const pickCoverPhoto = async () => {
    const res = await launchImageLibrary({ mediaType: 'photo' });
    if (!res.didCancel) setCoverPhoto(res.assets[0]);
  };

  // ── Pick Multiple Images ─────────────────────────────────
  const addImg = async () => {
    const res = await launchImageLibrary({
      mediaType: 'photo',
      selectionLimit: 0,
    });

    if (!res.didCancel) {
      const newImgs = res.assets.map(a => ({
        id: Date.now() + Math.random(),
        uri: a.uri,
      }));
      setImgs(prev => [...prev, ...newImgs]);
    }
  };

  // ── Pick Documents ───────────────────────────────────────
  const addDoc = async () => {
    try {
      const res = await DocumentPicker.pick({
        type: [DocumentPicker.types.pdf, DocumentPicker.types.docx],
      });

      const file = res[0];
      setDocs(prev => [
        ...prev,
        {
          id: file.name + Date.now(),
          name: file.name,
          size: (file.size / (1024 * 1024)).toFixed(1) + ' MB',
        },
      ]);
    } catch (err) {
      if (!DocumentPicker.isCancel(err)) console.log(err);
    }
  };

  const removeImg = id => setImgs(prev => prev.filter(i => i.id !== id));
  const removeDoc = id => setDocs(prev => prev.filter(d => d.id !== id));

  const handleNext = () =>
    navigation.navigate('ReviewSubmit', {
      ...params,
      coverPhoto,
      imgs,
      docs,
    });

  return (
    <SafeAreaView style={s.safe}>
      <StatusBar barStyle="dark-content" backgroundColor={C.white} />

      <NavHeader
        title="Create Campaign"
        step={3}
        total={4}
        onLeft={() => navigation.goBack()}
      />

      <Animated.View style={[s.flex, { opacity: fadeAnim }]}>
        <ScrollView contentContainerStyle={s.content}>
          <Text style={s.heading}>Photos & Documents</Text>

          {/* Cover */}
          <FieldLabel label="Cover Photo" />
          <UploadArea
            onPress={pickCoverPhoto}
            uploaded={!!coverPhoto}
            text={coverPhoto ? 'Cover Selected' : 'Upload Cover Photo'}
          />

          {/* Images */}
          <FieldLabel label="Additional Images" />
          <View style={s.row}>
            {imgs.map(i => (
              <ImgThumb
                key={i.id}
                uri={i.uri}
                onRemove={() => removeImg(i.id)}
              />
            ))}
            <AddImgBtn onPress={addImg} />
          </View>

          {/* Docs */}
          <FieldLabel label="Documents" />
          <UploadArea
            onPress={addDoc}
            uploaded={docs.length > 0}
            text="Upload PDF / DOCX"
          />
          {docs.map(d => (
            <DocChip
              key={d.id}
              name={d.name}
              size={d.size}
              onRemove={() => removeDoc(d.id)}
            />
          ))}
        </ScrollView>

        <DualButtons onBack={() => navigation.goBack()} onNext={handleNext} />
      </Animated.View>
    </SafeAreaView>
  );
};

export default PhotosDocuments;

// ── Styles ─────────────────────────────────────────────────
const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.screenBg },
  flex: { flex: 1 },
  content: {
    padding: rs(18),
  },
  heading: {
    fontSize: ms(20),
    fontWeight: '800',
    marginBottom: vs(20),
  },
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: vs(16),
  },
});
