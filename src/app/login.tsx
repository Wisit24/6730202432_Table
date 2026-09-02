import {
    ActivityIndicator,
    SafeAreaView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

interface LoginScreenProps {
  loginUsername: string;
  setLoginUsername: (val: string) => void;
  loginPassword: string;
  setLoginPassword: (val: string) => void;
  loginLoading: boolean;
  onLogin: () => void;
}

export default function LoginScreen({
  loginUsername,
  setLoginUsername,
  loginPassword,
  setLoginPassword,
  loginLoading,
  onLogin,
}: LoginScreenProps) {
  return (
    <SafeAreaView style={styles.loginContainer}>
      <View style={styles.loginBox}>
        <Text style={styles.loginTitle}>📦 ระบบจัดการคลังสินค้า</Text>
        <Text style={styles.loginSubtitle}>กรุณาเข้าสู่ระบบ</Text>

        <Text style={styles.label}>ชื่อผู้ใช้งาน</Text>
        <TextInput
          style={styles.input}
          value={loginUsername}
          onChangeText={setLoginUsername}
          placeholder="admin หรือ user"
          autoCapitalize="none"
        />

        <Text style={styles.label}>รหัสผ่าน</Text>
        <TextInput
          style={styles.input}
          value={loginPassword}
          onChangeText={setLoginPassword}
          secureTextEntry
          placeholder="1234"
        />

        <TouchableOpacity style={styles.loginBtn} onPress={onLogin} disabled={loginLoading}>
          {loginLoading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.loginBtnText}>เข้าสู่ระบบ</Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  loginContainer: {
    flex: 1,
    backgroundColor: '#1e3a8a',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loginBox: {
    backgroundColor: '#ffffff',
    width: '100%',
    maxWidth: 360,
    borderRadius: 12,
    padding: 24,
    elevation: 4,
  },
  loginTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1e3a8a',
    textAlign: 'center',
    marginBottom: 4,
  },
  loginSubtitle: {
    fontSize: 13,
    color: '#64748b',
    textAlign: 'center',
    marginBottom: 20,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    color: '#475569',
    marginBottom: 4,
  },
  input: {
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 6,
    padding: 8,
    marginBottom: 10,
  },
  loginBtn: {
    backgroundColor: '#2563eb',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 12,
  },
  loginBtnText: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});