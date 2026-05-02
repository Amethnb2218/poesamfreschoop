import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import { Palette, Radius } from '@/constants/theme';
import { useSession } from '@/context/SessionContext';

export function AppBoot({ children }: { children: React.ReactNode }) {
  const { loading } = useSession();

  if (loading) {
    return (
      <LinearGradient
        colors={[Palette.green950, Palette.green850, Palette.green700]}
        style={styles.root}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}>
        <View style={styles.logoMark}>
          <Ionicons name="leaf" size={48} color="#ffffff" />
        </View>
        <Text style={styles.title}>FresCoop</Text>
        <Text style={styles.tag}>POESAM 2026</Text>
        <ActivityIndicator color="#ffffff" style={{ marginTop: 28 }} />
      </LinearGradient>
    );
  }

  return <>{children}</>;
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoMark: {
    width: 96,
    height: 96,
    borderRadius: Radius.lg,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.25)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 18,
  },
  title: {
    color: '#ffffff',
    fontSize: 42,
    fontWeight: '900',
    letterSpacing: -0.5,
  },
  tag: {
    color: Palette.gold600,
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 3,
    marginTop: 4,
  },
});
