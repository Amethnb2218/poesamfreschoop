import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useEffect, useRef } from 'react';
import { Animated, Easing, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Palette, Radius } from '@/constants/theme';
import { useSession } from '@/context/SessionContext';

export default function PendingScreen() {
  const { user, store, logout, refresh } = useSession();
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.08, duration: 1200, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 1200, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
      ]),
    ).start();

    Animated.loop(
      Animated.timing(rotateAnim, { toValue: 1, duration: 3000, easing: Easing.linear, useNativeDriver: true }),
    ).start();
  }, [pulseAnim, rotateAnim]);

  // Poll and auto-redirect when approved
  useEffect(() => {
    const interval = setInterval(() => {
      refresh();
    }, 10_000);
    return () => clearInterval(interval);
  }, [refresh]);

  useEffect(() => {
    if (!user) return;
    const current = (store.users || []).find((u: any) => u.id === user.id);
    if (current) {
      const status = String(current.status || '').toLowerCase();
      if (status === 'actif') {
        router.replace('/(tabs)');
      }
    }
  }, [store.users, user]);

  const spin = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <Animated.View style={[styles.iconCircle, { transform: [{ scale: pulseAnim }] }]}>
          <Animated.View style={{ transform: [{ rotate: spin }] }}>
            <Ionicons name="hourglass-outline" size={48} color={Palette.green700} />
          </Animated.View>
        </Animated.View>

        <Text style={styles.title}>En attente de validation</Text>

        <Text style={styles.message}>
          Votre inscription est en attente de validation par un administrateur.
          Vous recevrez un accès dès que votre compte sera approuvé.
        </Text>

        <View style={styles.infoCard}>
          <View style={styles.infoRow}>
            <Ionicons name="person-outline" size={18} color={Palette.green700} />
            <Text style={styles.infoText}>{user?.name || 'Utilisateur'}</Text>
          </View>
          <View style={styles.infoRow}>
            <Ionicons name="mail-outline" size={18} color={Palette.green700} />
            <Text style={styles.infoText}>{user?.email || ''}</Text>
          </View>
          <View style={styles.infoRow}>
            <Ionicons name="leaf-outline" size={18} color={Palette.green700} />
            <Text style={styles.infoText}>Rôle : {user?.role || 'agriculteur'}</Text>
          </View>
        </View>

        <View style={styles.statusBadge}>
          <Ionicons name="time-outline" size={16} color={Palette.gold600} />
          <Text style={styles.statusText}>Vérification en cours…</Text>
        </View>

        <Pressable style={styles.logoutButton} onPress={logout}>
          <Ionicons name="log-out-outline" size={18} color={Palette.muted} />
          <Text style={styles.logoutText}>Se déconnecter</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Palette.paper },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    gap: 20,
  },
  iconCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: Palette.green100,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  title: {
    fontSize: 22,
    fontWeight: '900',
    color: Palette.ink,
    textAlign: 'center',
    letterSpacing: -0.3,
  },
  message: {
    fontSize: 15,
    color: Palette.muted,
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: 8,
  },
  infoCard: {
    backgroundColor: Palette.wash,
    borderRadius: Radius.lg,
    padding: 18,
    gap: 12,
    width: '100%',
    marginTop: 8,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  infoText: {
    fontSize: 14,
    color: Palette.ink,
    fontWeight: '600',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Palette.gold100,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: Radius.pill,
  },
  statusText: {
    color: Palette.gold600,
    fontWeight: '800',
    fontSize: 13,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 20,
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  logoutText: {
    color: Palette.muted,
    fontWeight: '700',
    fontSize: 14,
  },
});
