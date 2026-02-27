import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
} from 'react-native';

const Signup = ({ navigation }) => {
  const [name, setName]             = useState('');
  const [email, setEmail]           = useState('');
  const [password, setPassword]     = useState('');
  const [confirm, setConfirm]       = useState('');
  const [loading, setLoading]       = useState(false);
  const [showPass, setShowPass]     = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const validate = () => {
    if (!name.trim()) {
      Alert.alert('Error', 'Please enter your name');
      return false;
    }
    if (name.trim().length < 2) {
      Alert.alert('Error', 'Name must be at least 2 characters');
      return false;
    }
    if (!email.trim()) {
      Alert.alert('Error', 'Please enter your email');
      return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      Alert.alert('Error', 'Please enter a valid email address');
      return false;
    }
    if (!password) {
      Alert.alert('Error', 'Please enter a password');
      return false;
    }
    if (password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters');
      return false;
    }
    if (password !== confirm) {
      Alert.alert('Error', 'Passwords do not match');
      return false;
    }
    return true;
  };

  const handleSignup = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      // Simulate API — replace with your real auth logic
      await new Promise((resolve) => setTimeout(resolve, 1000));
      Alert.alert(
        'Account Created!',
        `Welcome, ${name.trim()}! Your account has been created successfully.`,
        [
          {
            text: 'Sign In',
            onPress: () => navigation.replace('Login'),
          },
        ]
      );
    } catch (error) {
      Alert.alert('Signup Failed', error.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  // Password strength indicator
  const getPasswordStrength = () => {
    if (!password) return null;
    if (password.length < 6)  return { label: 'Weak',   color: '#ef4444', width: '25%' };
    if (password.length < 8)  return { label: 'Fair',   color: '#f59e0b', width: '50%' };
    if (password.length < 10) return { label: 'Good',   color: '#6366f1', width: '75%' };
    return                           { label: 'Strong', color: '#10b981', width: '100%' };
  };
  const strength = getPasswordStrength();

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0f172a" />
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={styles.headerSection}>
            <Text style={styles.appName}>Create Account</Text>
            <Text style={styles.tagline}>Sign up to continue</Text>
          </View>

          {/* Form */}
          <View style={styles.form}>

            {/* Full Name */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Full Name</Text>
              <View style={styles.inputWrapper}>
                <TextInput
                  style={styles.input}
                  placeholder="Enter Your Name"
                  placeholderTextColor="#475569"
                  value={name}
                  onChangeText={setName}
                  autoCapitalize="words"
                  editable={!loading}
                />
              </View>
            </View>

            {/* Email */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Email</Text>
              <View style={styles.inputWrapper}>
                <TextInput
                  style={styles.input}
                  placeholder="you@example.com"
                  placeholderTextColor="#475569"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  editable={!loading}
                />
              </View>
            </View>

            {/* Password */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Password</Text>
              <View style={styles.inputWrapper}>
                <TextInput
                  style={styles.input}
                  placeholder="Minimum 6 characters"
                  placeholderTextColor="#475569"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPass}
                  editable={!loading}
                />
              </View>
              {/* Password strength bar */}
              {strength && (
                <View style={styles.strengthContainer}>
                  <View style={styles.strengthBarBg}>
                    <View style={[styles.strengthBarFill, {
                      width: strength.width,
                      backgroundColor: strength.color,
                    }]} />
                  </View>
                  <Text style={[styles.strengthLabel, { color: strength.color }]}>
                    {strength.label}
                  </Text>
                </View>
              )}
            </View>

            {/* Confirm Password */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Confirm Password</Text>
              <View style={[
                styles.inputWrapper,
                confirm && password !== confirm && styles.inputError,
              ]}>
                <TextInput
                  style={styles.input}
                  placeholder="Re-enter password"
                  placeholderTextColor="#475569"
                  value={confirm}
                  onChangeText={setConfirm}
                  secureTextEntry={!showConfirm}
                  editable={!loading}
                />
              </View>
              {confirm.length > 0 && password !== confirm && (
                <Text style={styles.errorText}>Passwords do not match</Text>
              )}
              {confirm.length > 0 && password === confirm && (
                <Text style={styles.successText}>✓ Passwords match</Text>
              )}
            </View>

            {/* Signup Button */}
            <Pressable
              style={[styles.signupBtn, loading && { opacity: 0.7 }]}
              onPress={handleSignup}
              disabled={loading}
            >
              {loading
                ? <ActivityIndicator color="#fff" size="small" />
                : <Text style={styles.signupBtnText}>Create Account</Text>
              }
            </Pressable>

            {/* Divider */}
            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>or</Text>
              <View style={styles.dividerLine} />
            </View>

            {/* Go to Login */}
            <Pressable
              style={styles.loginLink}
              onPress={() => navigation.navigate('Login')}
            >
              <Text style={styles.loginLinkText}>
                Already have an account?{' '}
                <Text style={styles.highlight}>Sign In</Text>
              </Text>
            </Pressable>

          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default Signup;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f172a' },
  scrollContent: { flexGrow: 1, justifyContent: 'center', padding: 24, paddingBottom: 40 },

  headerSection: { alignItems: 'center', marginBottom: 36 },

  logoIcon: { fontSize: 36 },
  appName: { fontSize: 26, fontWeight: 'bold', color: '#fff', marginBottom: 6 },
  tagline: { fontSize: 15, color: '#94a3b8' },

  form: { gap: 14 },
  inputGroup: { gap: 6 },
  label: { fontSize: 14, fontWeight: '600', color: '#cbd5e1', marginLeft: 2 },
  inputWrapper: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#1e293b', borderRadius: 12,
    borderWidth: 1, borderColor: '#334155',
    paddingHorizontal: 14, height: 52,
  },
  inputError: { borderColor: '#ef4444' },
  inputIcon: { fontSize: 16, marginRight: 10 },
  input: { flex: 1, color: '#fff', fontSize: 15, paddingVertical: 0 },
  eyeBtn: { padding: 4 },
  eyeIcon: { fontSize: 16 },

  // Password strength
  strengthContainer: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 6 },
  strengthBarBg: { flex: 1, height: 4, backgroundColor: '#334155', borderRadius: 2, overflow: 'hidden' },
  strengthBarFill: { height: '100%', borderRadius: 2 },
  strengthLabel: { fontSize: 12, fontWeight: '600', width: 50 },

  errorText: { fontSize: 12, color: '#ef4444', marginLeft: 2 },
  successText: { fontSize: 12, color: '#10b981', marginLeft: 2 },

  signupBtn: {
    backgroundColor: '#6366f1', paddingVertical: 16,
    borderRadius: 12, alignItems: 'center', marginTop: 6,
    shadowColor: '#6366f1', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3, shadowRadius: 8, elevation: 4,
  },
  signupBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },

  divider: { flexDirection: 'row', alignItems: 'center', gap: 12, marginVertical: 4 },
  dividerLine: { flex: 1, height: 1, backgroundColor: '#334155' },
  dividerText: { color: '#475569', fontSize: 13 },

  loginLink: { alignItems: 'center', paddingVertical: 10 },
  loginLinkText: { fontSize: 14, color: '#94a3b8' },
  highlight: { color: '#6366f1', fontWeight: '700' },
});