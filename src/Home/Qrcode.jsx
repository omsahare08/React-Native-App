import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  Alert,
  Linking,
  Platform,
  SafeAreaView,
  StatusBar,
  ActivityIndicator,
} from 'react-native';
import {
  Camera,
  useCameraDevice,
  useCameraPermission,
  useCodeScanner,
} from 'react-native-vision-camera';

const Qrcode = ({ navigation }) => {
  const [isScanning, setIsScanning] = useState(true);
  const [scannedData, setScannedData] = useState(null);
  const device = useCameraDevice('back');
  const { hasPermission, requestPermission } = useCameraPermission();

  useEffect(() => {
    const checkPermission = async () => {
      if (!hasPermission) {
        await requestCameraPermission();
      }
    };
    checkPermission();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const requestCameraPermission = async () => {
    try {
      const permission = await requestPermission();
      if (!permission) {
        Alert.alert(
          'Camera Permission Required',
          'Please enable camera permission in your device settings.',
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Open Settings', onPress: () => Linking.openSettings() },
          ]
        );
      }
    } catch (error) {
      console.error('Permission error:', error);
    }
  };

  // Validate if string is a valid URL
  const isValidURL = (string) => {
    try {
      const urlPattern = /^(https?:\/\/)?([\w-]+(\.[\w-]+)+)([\w.,@?^=%&:/~+#-]*[\w@?^=%&/~+#-])?$/i;
      if (!urlPattern.test(string)) {
        return false;
      }
      new URL(string.startsWith('http') ? string : `https://${string}`);
      return true;
    } catch (error) {
      return false;
    }
  };

  // Always ensure URL has protocol
  const formatURL = (url) => {
    const trimmed = url.trim();
    if (trimmed.startsWith('https://') || trimmed.startsWith('http://')) {
      return trimmed;
    }
    return `https://${trimmed}`;
  };

  // Open URL directly without canOpenURL check
  const openURL = async (url) => {
    try {
      await Linking.openURL(url);
      // Go back after small delay
      setTimeout(() => {
        setIsScanning(true);
        setScannedData(null);
        navigation.goBack();
      }, 1000);
    } catch (error) {
      console.error('Error opening URL:', error);
      Alert.alert(
        'Error Opening Link',
        `Could not open: ${url}\n\nTry copying the link manually.`,
        [
          {
            text: 'OK',
            onPress: () => {
              setIsScanning(true);
              setScannedData(null);
            },
          },
        ]
      );
    }
  };

  // Handle QR code scan
  const handleCodeScanned = (codes) => {
    if (!isScanning || !codes || codes.length === 0) return;

    const code = codes[0];
    const scannedValue = code?.value || code?.displayValue;

    if (!scannedValue) return;

    setIsScanning(false);
    setScannedData(scannedValue);

    if (isValidURL(scannedValue)) {
      const formattedURL = formatURL(scannedValue);

      Alert.alert(
        'QR Code Scanned!',
        `URL Found:\n\n${formattedURL}\n\nOpen this link?`,
        [
          {
            text: 'Cancel',
            style: 'cancel',
            onPress: () => {
              setIsScanning(true);
              setScannedData(null);
            },
          },
          {
            text: 'Open Link',
            onPress: () => openURL(formattedURL),
          },
        ]
      );
    } else {
      // Not a URL
      Alert.alert(
        'Invalid QR Code',
        `This QR code does not contain a valid URL.\n\nScanned content:\n${scannedValue}`,
        [
          {
            text: 'Scan Again',
            onPress: () => {
              setIsScanning(true);
              setScannedData(null);
            },
          },
          {
            text: 'Go Back',
            style: 'cancel',
            onPress: () => navigation.goBack(),
          },
        ]
      );
    }
  };

  const codeScanner = useCodeScanner({
    codeTypes: ['qr', 'ean-13'],
    onCodeScanned: handleCodeScanned,
  });

  const handleBack = () => {
    navigation.goBack();
  };

  // No permission screen
  if (!hasPermission) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="#000" />
        <View style={styles.centeredContainer}>
          <Text style={styles.permissionIcon}></Text>
          <Text style={styles.permissionTitle}>Camera Access Needed</Text>
          <Text style={styles.permissionText}>
            Allow camera access to scan QR codes
          </Text>
          <Pressable style={styles.primaryBtn} onPress={requestCameraPermission}>
            <Text style={styles.primaryBtnText}>Grant Permission</Text>
          </Pressable>
          <Pressable style={styles.secondaryBtn} onPress={handleBack}>
            <Text style={styles.secondaryBtnText}>Go Back</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  // No camera screen
  if (!device) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="#000" />
        <View style={styles.centeredContainer}>
          <Text style={styles.permissionIcon}></Text>
          <Text style={styles.permissionTitle}>No Camera Found</Text>
          <Text style={styles.permissionText}>
            Unable to access camera device
          </Text>
          <Pressable style={styles.primaryBtn} onPress={handleBack}>
            <Text style={styles.primaryBtnText}>Go Back</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#000" />

      {/* Camera */}
      <Camera
        style={StyleSheet.absoluteFill}
        device={device}
        isActive={isScanning}
        codeScanner={codeScanner}
      />

      {/* Overlay */}
      <View style={styles.overlay}>

        {/* Top - Dark area with close button */}
        <View style={styles.topSection}>
          <Pressable style={styles.closeButton} onPress={handleBack}>
            <Text style={styles.closeButtonText}>✕</Text>
          </Pressable>
          <Text style={styles.headerTitle}>QR Code Scanner</Text>
        </View>

        {/* Middle - Clear scan area */}
        <View style={styles.middleSection}>
          {/* Left dark area */}
          <View style={styles.sideShade} />

          {/* Scanner Frame */}
          <View style={styles.scannerFrame}>
            <View style={[styles.corner, styles.topLeft]} />
            <View style={[styles.corner, styles.topRight]} />
            <View style={[styles.corner, styles.bottomLeft]} />
            <View style={[styles.corner, styles.bottomRight]} />
            {isScanning && <View style={styles.scanLine} />}
          </View>

          {/* Right dark area */}
          <View style={styles.sideShade} />
        </View>

        {/* Bottom - Dark area with info */}
        <View style={styles.bottomSection}>
          <Text style={styles.instructionText}>
            {isScanning
              ? 'Point camera at a QR code'
              : 'Processing...'}
          </Text>

          {scannedData && (
            <View style={styles.scannedBox}>
              <Text style={styles.scannedLabel}>Last scanned:</Text>
              <Text style={styles.scannedValue} numberOfLines={2}>
                {scannedData}
              </Text>
            </View>
          )}
        </View>
      </View>
    </View>
  );
};

export default Qrcode;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },

  // Centered screens (permission/no camera)
  centeredContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0f172a',
    padding: 30,
  },
  permissionIcon: {
    fontSize: 64,
    marginBottom: 20,
  },
  permissionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 12,
    textAlign: 'center',
  },
  permissionText: {
    fontSize: 15,
    color: '#94a3b8',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 30,
  },
  primaryBtn: {
    backgroundColor: '#6366f1',
    paddingHorizontal: 40,
    paddingVertical: 14,
    borderRadius: 12,
    width: '100%',
    alignItems: 'center',
    marginBottom: 12,
  },
  primaryBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  secondaryBtn: {
    backgroundColor: '#1e293b',
    paddingHorizontal: 40,
    paddingVertical: 14,
    borderRadius: 12,
    width: '100%',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#334155',
  },
  secondaryBtnText: {
    color: '#94a3b8',
    fontSize: 16,
    fontWeight: '600',
  },

  // Camera overlay
  overlay: {
    ...StyleSheet.absoluteFillObject,
  },

  // Top section
  topSection: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.65)',
    paddingTop: Platform.OS === 'ios' ? 55 : 25,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  closeButton: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 55 : 25,
    right: 20,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 20,
    color: '#fff',
    fontWeight: '700',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
    marginTop: 6,
  },

  // Middle scan section
  middleSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sideShade: {
    flex: 1,
    height: 260,
    backgroundColor: 'rgba(0,0,0,0.65)',
  },
  scannerFrame: {
    width: 260,
    height: 260,
    backgroundColor: 'transparent',
    position: 'relative',
  },
  corner: {
    position: 'absolute',
    width: 44,
    height: 44,
    borderColor: '#6366f1',
  },
  topLeft: {
    top: 0,
    left: 0,
    borderTopWidth: 4,
    borderLeftWidth: 4,
    borderTopLeftRadius: 10,
  },
  topRight: {
    top: 0,
    right: 0,
    borderTopWidth: 4,
    borderRightWidth: 4,
    borderTopRightRadius: 10,
  },
  bottomLeft: {
    bottom: 0,
    left: 0,
    borderBottomWidth: 4,
    borderLeftWidth: 4,
    borderBottomLeftRadius: 10,
  },
  bottomRight: {
    bottom: 0,
    right: 0,
    borderBottomWidth: 4,
    borderRightWidth: 4,
    borderBottomRightRadius: 10,
  },
  scanLine: {
    width: '90%',
    height: 2,
    backgroundColor: '#6366f1',
    position: 'absolute',
    top: '50%',
    alignSelf: 'center',
    left: '5%',
    opacity: 0.9,
    shadowColor: '#6366f1',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 6,
    elevation: 5,
  },

  // Bottom section
  bottomSection: {
    flex: 1.5,
    backgroundColor: 'rgba(0,0,0,0.65)',
    paddingHorizontal: 24,
    paddingTop: 24,
    alignItems: 'center',
  },
  instructionText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '600',
    marginBottom: 20,
    textAlign: 'center',
  },
  infoBox: {
    backgroundColor: 'rgba(99,102,241,0.15)',
    borderRadius: 14,
    padding: 18,
    width: '100%',
    borderWidth: 1,
    borderColor: 'rgba(99,102,241,0.3)',
  },
  infoTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 10,
  },
  infoText: {
    fontSize: 13,
    color: '#cbd5e1',
    lineHeight: 22,
  },
  scannedBox: {
    marginTop: 16,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 10,
    padding: 14,
    width: '100%',
  },
  scannedLabel: {
    fontSize: 11,
    color: '#94a3b8',
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  scannedValue: {
    fontSize: 13,
    color: '#e2e8f0',
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
});