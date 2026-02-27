import React, { useState } from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  Image,
  FlatList,
  Alert,
  SafeAreaView,
  StatusBar,
  Modal,
  Dimensions,
} from 'react-native';
import { launchImageLibrary, launchCamera } from 'react-native-image-picker';
import ImageResizer from '@bam.tech/react-native-image-resizer';

const { width, height } = Dimensions.get('window');

const Screen = ({ navigation }) => {
  const [images, setImages]               = useState([]);
  const [selectedImage, setSelectedImage] = useState(null);
  const [viewerVisible, setViewerVisible] = useState(false);

  // ─── Compress helper ──────────────────────────────────────────────────────
  const compressAndAdd = async (assets) => {
    const processed = [];

    for (const asset of assets) {
      try {
        const originalSize = asset.fileSize
          ? (asset.fileSize / 1024).toFixed(2)
          : 'N/A';

        const compressed = await ImageResizer.createResizedImage(
          asset.uri,
          800,
          800,
          'JPEG',
          80,
          0
        );

        const compressedSize = compressed.size
          ? (compressed.size / 1024).toFixed(2)
          : 'N/A';

        processed.push({
          id: Date.now().toString() + Math.random(),
          uri: compressed.uri,
          originalSize,
          compressedSize,
          source: asset.source || 'gallery', // 'camera' or 'gallery'
        });
      } catch (error) {
        console.error('Compression error:', error);
        Alert.alert('Error', 'Failed to compress image');
      }
    }

    if (processed.length > 0) {
      setImages((prev) => [...prev, ...processed]);
    }
  };

  // ─── Pick from Gallery ────────────────────────────────────────────────────
  const pickFromGallery = async () => {
    try {
      const result = await launchImageLibrary({
        mediaType: 'photo',
        selectionLimit: 0,
        quality: 1,
      });

      if (result.didCancel) return;

      if (result.errorCode) {
        Alert.alert('Error', result.errorMessage || 'Failed to open gallery');
        return;
      }

      if (result.assets && result.assets.length > 0) {
        const assets = result.assets.map((a) => ({ ...a, source: 'gallery' }));
        await compressAndAdd(assets);
      }
    } catch (error) {
      Alert.alert('Error', error.message || 'Failed to open gallery');
    }
  };

  // ─── Capture from Camera ──────────────────────────────────────────────────
  const captureFromCamera = async () => {
    try {
      const result = await launchCamera({
        mediaType: 'photo',
        quality: 1,
        saveToPhotos: true, // saves to gallery after capture
      });

      if (result.didCancel) return;

      if (result.errorCode) {
        Alert.alert('Error', result.errorMessage || 'Failed to open camera');
        return;
      }

      if (result.assets && result.assets.length > 0) {
        const assets = result.assets.map((a) => ({ ...a, source: 'camera' }));
        await compressAndAdd(assets);
      }
    } catch (error) {
      Alert.alert('Error', error.message || 'Failed to open camera');
    }
  };

  // ─── Show action sheet (Camera / Gallery) ────────────────────────────────
  const showAddOptions = () => {
    Alert.alert(
      'Add Image',
      'Choose how to add an image',
      [
        {
          text: 'Take Photo',
          onPress: captureFromCamera,
        },
        {
          text: 'Choose from Gallery',
          onPress: pickFromGallery,
        },
        {
          text: 'Cancel',
          style: 'cancel',
        },
      ],
      { cancelable: true }
    );
  };

  // ─── Delete ───────────────────────────────────────────────────────────────
  const deleteImage = (id) => {
    Alert.alert('Delete Image', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => setImages((prev) => prev.filter((item) => item.id !== id)),
      },
    ]);
  };

  // ─── Viewer ───────────────────────────────────────────────────────────────
  const openImageViewer = (image) => {
    setSelectedImage(image);
    setViewerVisible(true);
  };

  const closeImageViewer = () => {
    setViewerVisible(false);
    setTimeout(() => setSelectedImage(null), 300);
  };

  const deleteFromViewer = () => {
    Alert.alert('Delete Image', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => {
          setImages((prev) =>
            prev.filter((item) => item.id !== selectedImage.id)
          );
          closeImageViewer();
        },
      },
    ]);
  };

  // ─── Render card ─────────────────────────────────────────────────────────
  const renderItem = ({ item }) => (
    <Pressable style={styles.card} onPress={() => openImageViewer(item)}>
      <Image source={{ uri: item.uri }} style={styles.image} />

      {/* Source badge */}
      <View style={[
        styles.sourceBadge,
        { backgroundColor: item.source === 'camera' ? '#131325' : '#0d1815' },
      ]}>
        <Text style={styles.sourceBadgeText}>
          {item.source === 'camera' ? 'Camera' : 'Gallery'}
        </Text>
      </View>

      <View style={styles.infoContainer}>
        <Text style={styles.sizeLabel}>Original:</Text>
        <Text style={styles.size}>{item.originalSize} KB</Text>
      </View>
      <View style={styles.infoContainer}>
        <Text style={styles.sizeLabel}>Compressed:</Text>
        <Text style={styles.size}>{item.compressedSize} KB</Text>
      </View>

      <Pressable
        style={styles.deleteBtn}
        onPress={(e) => { e.stopPropagation(); deleteImage(item.id); }}
      >
        <Text style={styles.deleteText}>Delete</Text>
      </Pressable>
    </Pressable>
  );

  // ─── UI ───────────────────────────────────────────────────────────────────
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0f172a" />

      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backBtnText}>← Back</Text>
        </Pressable>
        <Text style={styles.title}>Image Gallery</Text>
        <Text style={styles.count}>
          {images.length} image{images.length !== 1 ? 's' : ''}
        </Text>
      </View>

      {/* Empty State */}
      {images.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No images yet</Text>
          <Text style={styles.emptySubtext}>
            Take a photo or pick from your gallery
          </Text>
        </View>
      ) : (
        <FlatList
          data={images}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          numColumns={2}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      )}

      {/* Bottom Buttons - Camera + Gallery */}
      <View style={styles.bottomBar}>
        {/* Camera Button */}
        <Pressable style={styles.cameraBtn} onPress={captureFromCamera}>
          <Text style={styles.cameraBtnText}>Camera</Text>
        </Pressable>

        {/* Gallery Button */}
        <Pressable style={styles.galleryBtn} onPress={pickFromGallery}>
          <Text style={styles.galleryBtnText}>Gallery</Text>
        </Pressable>
      </View>

      {/* Image Viewer Modal */}
      <Modal
        visible={viewerVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={closeImageViewer}
      >
        <View style={styles.modalContainer}>
          <StatusBar barStyle="light-content" backgroundColor="#000" />

          <Pressable style={styles.closeButton} onPress={closeImageViewer}>
            <Text style={styles.closeButtonText}>✕</Text>
          </Pressable>

          {selectedImage && (
            <View style={styles.imageViewerContent}>
              <Image
                source={{ uri: selectedImage.uri }}
                style={styles.fullImage}
                resizeMode="contain"
              />

              <View style={styles.imageInfo}>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Source:</Text>
                  <Text style={styles.infoValue}>
                    {selectedImage.source === 'camera' ? 'Camera' : 'Gallery'}
                  </Text>
                </View>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Original Size:</Text>
                  <Text style={styles.infoValue}>{selectedImage.originalSize} KB</Text>
                </View>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Compressed:</Text>
                  <Text style={styles.infoValue}>{selectedImage.compressedSize} KB</Text>
                </View>
              </View>

              <Pressable style={styles.viewerDeleteBtn} onPress={deleteFromViewer}>
                <Text style={styles.viewerDeleteText}>Delete Image</Text>
              </Pressable>
            </View>
          )}
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default Screen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
  },

  // Header
  header: {
    padding: 20,
    paddingTop: 10,
  },
  backBtn: {
    marginBottom: 10,
  },
  backBtnText: {
    fontSize: 16,
    color: '#6366f1',
    fontWeight: '600',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  count: {
    fontSize: 14,
    color: '#94a3b8',
  },

  // Empty
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    paddingBottom: 100,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#94a3b8',
    textAlign: 'center',
    lineHeight: 22,
  },

  // Grid
  listContent: {
    padding: 12,
    paddingBottom: 110,
  },
  card: {
    flex: 1,
    backgroundColor: '#1e293b',
    borderRadius: 12,
    margin: 6,
    padding: 8,
    borderWidth: 1,
    borderColor: '#334155',
    maxWidth: '48%',
  },
  image: {
    width: '100%',
    height: 150,
    borderRadius: 8,
    backgroundColor: '#334155',
  },
  sourceBadge: {
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 3,
    alignSelf: 'flex-start',
    marginTop: 6,
  },
  sourceBadgeText: {
    fontSize: 10,
    color: '#fff',
    fontWeight: '700',
  },
  infoContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 6,
    paddingHorizontal: 2,
  },
  sizeLabel: {
    fontSize: 11,
    color: '#94a3b8',
  },
  size: {
    fontSize: 11,
    color: '#cbd5e1',
    fontWeight: '600',
  },
  deleteBtn: {
    backgroundColor: '#ef4444',
    paddingVertical: 8,
    borderRadius: 6,
    marginTop: 8,
    alignItems: 'center',
  },
  deleteText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },

  // Bottom Bar - two buttons side by side
  bottomBar: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    flexDirection: 'row',
    gap: 12,
  },
  cameraBtn: {
    flex: 1,
    backgroundColor: '#6366f1',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    shadowColor: '#6366f1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  cameraBtnIcon: {
    fontSize: 20,
  },
  cameraBtnText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: 'bold',
  },
  galleryBtn: {
    flex: 1,
    backgroundColor: '#1e293b',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: '#334155',
    elevation: 2,
  },
  galleryBtnIcon: {
    fontSize: 20,
  },
  galleryBtnText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: 'bold',
  },

  // Modal / Viewer
  modalContainer: {
    flex: 1,
    backgroundColor: '#000',
  },
  closeButton: {
    position: 'absolute',
    top: 50,
    right: 20,
    zIndex: 10,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 24,
    color: '#fff',
    fontWeight: '600',
  },
  imageViewerContent: {
    flex: 1,
    justifyContent: 'center',
  },
  fullImage: {
    width: width,
    height: height * 0.65,
  },
  imageInfo: {
    backgroundColor: 'rgba(0,0,0,0.7)',
    padding: 20,
    marginHorizontal: 20,
    borderRadius: 12,
    marginTop: 20,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  infoLabel: {
    fontSize: 14,
    color: '#94a3b8',
  },
  infoValue: {
    fontSize: 14,
    color: '#fff',
    fontWeight: '600',
  },
  viewerDeleteBtn: {
    backgroundColor: '#ef4444',
    marginHorizontal: 20,
    marginTop: 16,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  viewerDeleteText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});