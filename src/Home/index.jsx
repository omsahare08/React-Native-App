import React from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  ScrollView,
} from 'react-native';

const Home = ({ navigation, route }) => {
  const { user, email } = route.params || {};

  const handleLogout = () => {
    navigation.replace('Login');
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0f172a" />

      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Welcome Back,</Text>
          <Text style={styles.userName}>{user || 'User'}</Text>
          {email ? <Text style={styles.email}>{email}</Text> : null}
        </View>
        <Pressable style={styles.logoutBtn} onPress={handleLogout}>
          <Text style={styles.logoutText}>Logout</Text>
        </Pressable>
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>

        <Pressable style={styles.card} onPress={() => navigation.navigate('Screen')}>
          <View style={styles.cardText}>
            <Text style={styles.cardTitle}>Add Images</Text>
            <Text style={styles.cardDesc}>Take photos or pick from gallery</Text>
          </View>
          <Text style={styles.arrow}>›</Text>
        </Pressable>

        <Pressable style={styles.card} onPress={() => navigation.navigate('AddFiles')}>
          <View style={styles.cardText}>
            <Text style={styles.cardTitle}>Add Files</Text>
            <Text style={styles.cardDesc}>Photos and videos from your device</Text>
          </View>
          <Text style={styles.arrow}>›</Text>
        </Pressable>

        <Pressable style={styles.card} onPress={() => navigation.navigate('Chart')}>
          <View style={styles.cardText}>
            <Text style={styles.cardTitle}>Data Visualizer</Text>
            <Text style={styles.cardDesc}>Convert URLs to interactive charts</Text>
          </View>
          <Text style={styles.arrow}>›</Text>
        </Pressable>

        <Pressable style={styles.card} onPress={() => navigation.navigate('Qrcode')}>
          <View style={styles.cardText}>
            <Text style={styles.cardTitle}>Scan QR Code</Text>
            <Text style={styles.cardDesc}>Scan QR codes to open URLs</Text>
          </View>
          <Text style={styles.arrow}>›</Text>
        </Pressable>

        <Pressable style={styles.card} onPress={() => navigation.navigate('Barcode')}>
          <View style={styles.cardText}>
            <Text style={styles.cardTitle}>Scan Barcode</Text>
            <Text style={styles.cardDesc}>Scan product barcodes</Text>
          </View>
          <Text style={styles.arrow}>›</Text>
        </Pressable>

      </ScrollView>
    </SafeAreaView>
  );
};

export default Home;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f172a' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', paddingHorizontal: 20, paddingTop: 10, paddingBottom: 10 },
  greeting: { fontSize: 16, color: '#94a3b8' },
  userName: { fontSize: 24, fontWeight: 'bold', color: '#fff', marginTop: 4 },
  email: { fontSize: 14, color: '#64748b', marginTop: 2 },
  logoutBtn: { backgroundColor: '#1e293b', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 8, borderWidth: 1, borderColor: '#334155' },
  logoutText: { color: '#ef4444', fontSize: 14, fontWeight: '600' },
  scroll: { flex: 1 },
  content: { padding: 20, paddingBottom: 40 },
  card: { backgroundColor: '#1e293b', borderRadius: 16, padding: 18, borderWidth: 1, borderColor: '#334155', flexDirection: 'row', alignItems: 'center', marginBottom: 14 },
  cardText: { flex: 1 },
  cardTitle: { fontSize: 16, fontWeight: 'bold', color: '#fff', marginBottom: 4 },
  cardDesc: { fontSize: 13, color: '#94a3b8', lineHeight: 18 },
  arrow: { fontSize: 26, color: '#475569', marginLeft: 8 },
});