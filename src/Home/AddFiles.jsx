import React, { useState } from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  FlatList,
  Alert,
  SafeAreaView,
  StatusBar,
  Modal,
  Image,
  Dimensions,
} from 'react-native';
import {
  launchImageLibrary,
  launchCamera,
} from 'react-native-image-picker';

const { width } = Dimensions.get('window');

// ─── Helpers ──────────────────────────────────────────────────────────────────

const getFileInfo = (type = '', name = '') => {
  const mime = (type || '').toLowerCase();
  const ext  = (name || '').split('.').pop().toLowerCase();

  if (mime.includes('video') || ['mp4', 'mov', 'avi', 'mkv', '3gp'].includes(ext))
    return { color: '#0e0c0a', label: 'Video' };
  if (mime.includes('png') || ext === 'png')
    return { color: '##0e0c0a', label: 'PNG' };
  if (mime.includes('gif') || ext === 'gif')
    return { color: '#0e0c0a', label: 'GIF' };
  // default: photo/jpeg
  return { color: '#0e0c0a', label: 'Photo' };
};

const formatSize = (bytes) => {
  if (!bytes || bytes === 0) return 'N/A';
  if (bytes < 1024)         return `${bytes} B`;
  if (bytes < 1024 * 1024)  return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
};

const formatDate = (iso) => {
  if (!iso) return '';
  return new Date(iso).toLocaleDateString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric',
  });
};

// ─── Component ────────────────────────────────────────────────────────────────

const AddFiles = ({ navigation }) => {
  const [files, setFiles]                 = useState([]);
  const [selectedFile, setSelectedFile]   = useState(null);
  const [detailVisible, setDetailVisible] = useState(false);

  // ── Process assets and add to list
  const processAssets = (assets, source) => {
    const newFiles = assets.map((asset) => ({
      id:     `${Date.now()}_${Math.random()}`,
      name:   asset.fileName || `file_${Date.now()}.jpg`,
      type:   asset.type     || 'image/jpeg',
      size:   asset.fileSize || 0,
      uri:    asset.uri,
      width:  asset.width,
      height: asset.height,
      date:   new Date().toISOString(),
      source,
    }));
    setFiles((prev) => [...prev, ...newFiles]);
  };

  // ── Pick from gallery (photos + videos)
  const pickFromGallery = async () => {
    try {
      const result = await launchImageLibrary({
        mediaType: 'mixed',
        selectionLimit: 0,
        quality: 1,
        includeExtra: true,
      });

      if (result.didCancel) return;
      if (result.errorCode) {
        Alert.alert('Error', result.errorMessage || 'Failed to open gallery');
        return;
      }
      if (result.assets?.length > 0) {
        processAssets(result.assets, 'gallery');
      }
    } catch (e) {
      Alert.alert('Error', e?.message || 'Failed to open gallery');
    }
  };

  // ── Capture from camera
  const captureFromCamera = async () => {
    try {
      const result = await launchCamera({
        mediaType: 'photo',
        quality: 1,
        saveToPhotos: true,
      });

      if (result.didCancel) return;
      if (result.errorCode) {
        Alert.alert('Error', result.errorMessage || 'Failed to open camera');
        return;
      }
      if (result.assets?.length > 0) {
        processAssets(result.assets, 'camera');
      }
    } catch (e) {
      Alert.alert('Error', e?.message || 'Failed to open camera');
    }
  };

  // ── Show add options sheet
  const showAddOptions = () => {
    Alert.alert(
      'Add File',
      'Choose source',
      [
        { text: 'Take Photo',            onPress: captureFromCamera },
        { text: 'Photo & Video Library', onPress: pickFromGallery  },
        { text: 'Cancel', style: 'cancel' },
      ],
      { cancelable: true }
    );
  };

  // ── Delete
  const deleteFile = (id) => {
    Alert.alert('Delete', 'Remove this file?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => {
          setFiles((prev) => prev.filter((f) => f.id !== id));
          if (detailVisible) closeDetail();
        },
      },
    ]);
  };

  // ── Detail modal
  const openDetail  = (file) => { setSelectedFile(file); setDetailVisible(true); };
  const closeDetail = () => {
    setDetailVisible(false);
    setTimeout(() => setSelectedFile(null), 300);
  };

  // ── Render card
  const renderItem = ({ item }) => {
    const { icon, color, label } = getFileInfo(item.type, item.name);
    const isImage = !item.type?.includes('video');

    return (
      <Pressable style={styles.fileCard} onPress={() => openDetail(item)}>

        {/* Thumbnail or icon */}
        {isImage ? (
          <Image source={{ uri: item.uri }} style={styles.thumbnail} />
        ) : (
          <View style={[styles.iconThumb, { backgroundColor: `${color}22` }]}>
            <Text style={styles.iconThumbText}>{icon}</Text>
          </View>
        )}

        {/* Info */}
        <View style={styles.fileInfo}>
          <Text style={styles.fileName} numberOfLines={2}>{item.name}</Text>
          <View style={styles.fileMeta}>
            <View style={[styles.badge, { backgroundColor: color }]}>
              <Text style={styles.badgeText}>{label}</Text>
            </View>
            <View style={[styles.badge, {
              backgroundColor: item.source === 'camera' ? '#0e0c0a' : '#0e0c0a',
            }]}>
              <Text style={styles.badgeText}>
                {item.source === 'camera' ? 'Camera' : 'Gallery'}
              </Text>
            </View>
          </View>
          <Text style={styles.metaText}>
            {formatSize(item.size)}
            {item.width ? `  •  ${item.width}×${item.height}` : ''}
          </Text>
          <Text style={styles.metaDate}>{formatDate(item.date)}</Text>
        </View>

        {/* Delete btn */}
        <Pressable
          style={styles.deleteIconBtn}
          onPress={(e) => { e.stopPropagation(); deleteFile(item.id); }}
        >
          <Text style={[styles.deleteIconText, { color: 'white'}]}>Delete</Text>
        </Pressable>
      </Pressable>
    );
  };

  // ─── Main UI
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0f172a" />

      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backBtnText}>← Back</Text>
        </Pressable>
        <Text style={styles.title}>Files</Text>
        <Text style={styles.count}>
          {files.length} file{files.length !== 1 ? 's' : ''}
        </Text>
      </View>

      {/* Empty / List */}
      {files.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyTitle}>No files yet</Text>
          <Text style={styles.emptySubtext}>
            Tap the button below to take a photo or{'\n'}pick files from your gallery
          </Text>
        </View>
      ) : (
        <FlatList
          data={files}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      )}

      {/* Add Files Button */}
      <View style={styles.bottomBar}>
        <Pressable style={styles.cameraBtn} onPress={captureFromCamera}>
          <Text style={styles.btnText}>Camera</Text>
        </Pressable>
        <Pressable style={styles.galleryBtn} onPress={pickFromGallery}>
          <Text style={styles.btnText}>Gallery</Text>
        </Pressable>
      </View>

      {/* ── Detail Bottom Sheet ──────────────────────────── */}
      <Modal
        visible={detailVisible}
        transparent
        animationType="slide"
        onRequestClose={closeDetail}
      >
        <Pressable style={styles.modalOverlay} onPress={closeDetail}>
          <Pressable style={styles.modalSheet} onPress={() => {}}>
            {selectedFile && (() => {
              const { icon, color, label } = getFileInfo(selectedFile.type, selectedFile.name);
              const isImg = !selectedFile.type?.includes('video');
              return (
                <>
                  <View style={styles.dragHandle} />

                  {/* Preview */}
                  {isImg ? (
                    <Image
                      source={{ uri: selectedFile.uri }}
                      style={styles.modalPreview}
                      resizeMode="cover"
                    />
                  ) : (
                    <View style={[styles.modalIconBox, { backgroundColor: `${color}22` }]}>
                      <Text style={styles.modalIconText}>{icon}</Text>
                    </View>
                  )}

                  <Text style={styles.modalFileName} numberOfLines={2}>
                    {selectedFile.name}
                  </Text>

                  {/* Details */}
                  <View style={styles.detailsBox}>
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Type</Text>
                      <View style={[styles.badge, { backgroundColor: color }]}>
                        <Text style={styles.badgeText}>{label}</Text>
                      </View>
                    </View>
                    <View style={styles.detailDivider} />
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Source</Text>
                      <Text style={styles.detailValue}>
                        {selectedFile.source === 'camera' ? 'Camera' : 'Gallery'}
                      </Text>
                    </View>
                    <View style={styles.detailDivider} />
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Size</Text>
                      <Text style={styles.detailValue}>{formatSize(selectedFile.size)}</Text>
                    </View>
                    {selectedFile.width ? (
                      <>
                        <View style={styles.detailDivider} />
                        <View style={styles.detailRow}>
                          <Text style={styles.detailLabel}>Resolution</Text>
                          <Text style={styles.detailValue}>
                            {selectedFile.width} × {selectedFile.height}
                          </Text>
                        </View>
                      </>
                    ) : null}
                    <View style={styles.detailDivider} />
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Added</Text>
                      <Text style={styles.detailValue}>{formatDate(selectedFile.date)}</Text>
                    </View>
                  </View>

                  {/* Delete */}
                  <Pressable
                    style={styles.deleteActionBtn}
                    onPress={() => deleteFile(selectedFile.id)}
                  >
                    <Text style={styles.deleteActionBtnText}>Delete File</Text>
                  </Pressable>

                  {/* Close */}
                  <Pressable style={styles.closeSheetBtn} onPress={closeDetail}>
                    <Text style={styles.closeSheetBtnText}>Close</Text>
                  </Pressable>
                </>
              );
            })()}
          </Pressable>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
};

export default AddFiles;

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f172a' },

  header: { padding: 20, paddingTop: 10 },
  backBtn: { marginBottom: 10 },
  backBtnText: { fontSize: 16, color: '#6366f1', fontWeight: '600' },
  title: { fontSize: 28, fontWeight: 'bold', color: '#fff', marginBottom: 4 },
  count: { fontSize: 14, color: '#94a3b8' },

  emptyContainer: {
    flex: 1, justifyContent: 'center', alignItems: 'center',
    paddingHorizontal: 40, paddingBottom: 80,
  },
  emptyIcon: { fontSize: 72, marginBottom: 20 },
  emptyTitle: { fontSize: 20, fontWeight: '700', color: '#fff', marginBottom: 10 },
  emptySubtext: {
    fontSize: 14, color: '#94a3b8', textAlign: 'center',
    lineHeight: 22, marginBottom: 30,
  },
  emptyActions: { flexDirection: 'row', gap: 14 },
  emptyActionBtn: {
    flex: 1, backgroundColor: '#6366f1', paddingVertical: 16,
    borderRadius: 14, alignItems: 'center', gap: 6,
  },
  emptyActionBtnAlt: { backgroundColor: '#1e293b', borderWidth: 1, borderColor: '#334155' },
  emptyActionIcon: { fontSize: 28 },
  emptyActionText: { color: '#fff', fontSize: 14, fontWeight: '700' },

  listContent: { paddingHorizontal: 16, paddingBottom: 110, paddingTop: 8 },

  fileCard: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#1e293b', borderRadius: 14,
    padding: 12, marginVertical: 5,
    borderWidth: 1, borderColor: '#334155',
  },
  thumbnail: {
    width: 58, height: 58, borderRadius: 10,
    backgroundColor: '#334155', marginRight: 14,
  },
  iconThumb: {
    width: 58, height: 58, borderRadius: 10,
    justifyContent: 'center', alignItems: 'center', marginRight: 14,
  },
  iconThumbText: { fontSize: 28 },
  fileInfo: { flex: 1 },
  fileName: { fontSize: 13, fontWeight: '600', color: '#fff', marginBottom: 5 },
  fileMeta: { flexDirection: 'row', flexWrap: 'wrap', gap: 5, marginBottom: 4 },
  badge: { paddingHorizontal: 7, paddingVertical: 2, borderRadius: 4 },
  badgeText: { fontSize: 10, color: '#fff', fontWeight: '700' },
  metaText: { fontSize: 11, color: '#64748b' },
  metaDate: { fontSize: 11, color: '#475569', marginTop: 2 },
  deleteIconBtn: { padding: 8, marginLeft: 4 },
  deleteIconText: { fontSize: 18 },

  // Bottom two-button bar
  bottomBar: {
    position: 'absolute', bottom: 20, left: 20, right: 20,
    flexDirection: 'row', gap: 12,
  },
  cameraBtn: {
    flex: 1, backgroundColor: '#6366f1', paddingVertical: 16,
    borderRadius: 14, alignItems: 'center',
    flexDirection: 'row', justifyContent: 'center', gap: 8,
    shadowColor: '#6366f1', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3, shadowRadius: 8, elevation: 5,
  },
  galleryBtn: {
    flex: 1, backgroundColor: '#1e293b', paddingVertical: 16,
    borderRadius: 14, alignItems: 'center',
    flexDirection: 'row', justifyContent: 'center', gap: 8,
    borderWidth: 1, borderColor: '#334155', elevation: 2,
  },
  btnIcon: { fontSize: 20 },
  btnText: { color: '#fff', fontSize: 15, fontWeight: 'bold' },

  // Modal
  modalOverlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.65)', justifyContent: 'flex-end',
  },
  modalSheet: {
    backgroundColor: '#1e293b', borderTopLeftRadius: 24, borderTopRightRadius: 24,
    padding: 24, paddingBottom: 40, alignItems: 'center',
    borderTopWidth: 1, borderColor: '#334155',
  },
  dragHandle: {
    width: 40, height: 4, backgroundColor: '#475569',
    borderRadius: 2, marginBottom: 20,
  },
  modalPreview: {
    width: width - 80, height: 200, borderRadius: 16,
    backgroundColor: '#0f172a', marginBottom: 16,
  },
  modalIconBox: {
    width: 80, height: 80, borderRadius: 20,
    justifyContent: 'center', alignItems: 'center', marginBottom: 16,
  },
  modalIconText: { fontSize: 42 },
  modalFileName: {
    fontSize: 15, fontWeight: '700', color: '#fff',
    textAlign: 'center', marginBottom: 20, paddingHorizontal: 10,
  },
  detailsBox: {
    width: '100%', backgroundColor: '#0f172a',
    borderRadius: 14, padding: 4, marginBottom: 20,
    borderWidth: 1, borderColor: '#334155',
  },
  detailRow: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12,
  },
  detailDivider: { height: 1, backgroundColor: '#1e293b', marginHorizontal: 16 },
  detailLabel: { fontSize: 14, color: '#64748b' },
  detailValue: {
    fontSize: 14, color: '#fff', fontWeight: '500',
    maxWidth: width * 0.5, textAlign: 'right',
  },
  deleteActionBtn: {
    width: '100%', paddingVertical: 14, borderRadius: 12,
    alignItems: 'center', backgroundColor: '#ef4444', marginBottom: 10,
  },
  deleteActionBtnText: { color: '#fff', fontSize: 15, fontWeight: '700' },
  closeSheetBtn: {
    width: '100%', paddingVertical: 14, borderRadius: 12,
    alignItems: 'center', backgroundColor: '#0f172a',
    borderWidth: 1, borderColor: '#334155',
  },
  closeSheetBtnText: { color: '#94a3b8', fontSize: 15, fontWeight: '600' },
});